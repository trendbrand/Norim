/**
 * Durable transmission outbox drainer (Master Plan F04 / ADR-004).
 *
 * The send path writes an idempotent job to the `transmission_jobs` table and
 * this module drains it: each job is claimed atomically (so the external send
 * runs at most once per attempt), dispatched, and on a verified result the
 * invoice is marked delivered and a GoBD audit event is appended. Transient
 * failures are retried with exponential backoff; permanent failures and
 * exhausted retries are dead-lettered. Injected retry faults can never produce
 * a duplicate legal submission because a job is only ever claimed from
 * QUEUED/FAILED -> SENDING, and a SENT job is terminal.
 *
 * This runs in-process (no Redis) which is correct for the single-node SQLite
 * deployment. On AWS this maps 1:1 onto SQS + a worker draining the same outbox.
 */

import {
  generateHybridEInvoicePdf,
  serializeToCiiXml,
  serializeToUblXml,
} from "@norminvoice/einvoice-core";
import { dispatchEInvoiceEmail } from "./email-dispatcher";
import { peppolSenderId, resolvePeppolAccessPoint } from "./peppol-adapter";
import {
  claimTransmissionJob,
  getInvoiceForOrg,
  getSellerSettings,
  getTransmissionJob,
  listDueTransmissionJobIds,
  markInvoiceDelivered,
  markTransmissionFailed,
  markTransmissionSent,
} from "./db-store";

export type ProcessOutcome =
  | { status: "SENT"; providerRef: string; auditHash: string | null }
  | { status: "SKIPPED"; reason: string }
  | { status: "RETRY"; error: string; nextAttemptAt: string }
  | { status: "DEAD"; error: string };

const BACKOFF_BASE_MS = 30_000; // 30s
const BACKOFF_CAP_MS = 60 * 60_000; // 1h
const DRAIN_INTERVAL_MS = 15_000;
const DRAIN_BATCH = 25;

/** HTTP statuses from the email provider that are not worth retrying. */
const PERMANENT_HTTP = new Set([400, 401, 403, 404, 409, 410, 422]);

function isPermanentError(message: string): boolean {
  const m = message.match(/\((\d{3})\)/);
  if (!m) return false; // network / unknown -> transient
  return PERMANENT_HTTP.has(Number(m[1]));
}

function backoffIso(attempts: number): string {
  const delay = Math.min(BACKOFF_CAP_MS, BACKOFF_BASE_MS * 2 ** Math.max(0, attempts - 1));
  return new Date(Date.now() + delay).toISOString();
}

/**
 * Process one transmission job exactly once (if it is due and unclaimed).
 * Safe to call from the request path (for immediate feedback) and from the
 * background drainer concurrently — only one caller wins the atomic claim.
 */
export async function processTransmissionJobOnce(jobId: string): Promise<ProcessOutcome> {
  const existing = getTransmissionJob(jobId);
  if (!existing) return { status: "SKIPPED", reason: "NOT_FOUND" };
  if (existing.status === "SENT") {
    return { status: "SENT", providerRef: existing.providerRef ?? "", auditHash: null };
  }

  // Atomic claim: QUEUED/FAILED -> SENDING. Loser skips (prevents double send).
  if (!claimTransmissionJob(jobId)) {
    return { status: "SKIPPED", reason: "NOT_DUE_OR_ALREADY_CLAIMED" };
  }

  try {
    const record = getInvoiceForOrg(existing.orgId, existing.invoiceId);
    if (!record) {
      markTransmissionFailed(jobId, "Invoice no longer exists", { permanent: true });
      return { status: "DEAD", error: "Invoice no longer exists" };
    }
    if (!record.validationPassed) {
      markTransmissionFailed(jobId, "Invoice failed EN 16931 validation — cannot transmit", {
        permanent: true,
      });
      return { status: "DEAD", error: "Invoice failed EN 16931 validation" };
    }

    // ── Peppol channel: deliver via a certified Access Point (partner). ──
    if (existing.channel === "peppol") {
      const ublXml = serializeToUblXml(record.canonical);
      const ap = resolvePeppolAccessPoint();
      const result = await ap.transmit({
        invoice: record.canonical,
        ublXml,
        senderParticipantId: peppolSenderId(record.canonical),
        recipientParticipantId: existing.recipient,
      });
      if (result.ok) {
        markTransmissionSent(jobId, result.provider, result.providerRef);
        const audit = markInvoiceDelivered(
          existing.orgId,
          existing.invoiceId,
          existing.recipient,
          existing.actorEmail
        );
        return { status: "SENT", providerRef: result.providerRef, auditHash: audit?.eventHash ?? null };
      }
      const claimed = getTransmissionJob(jobId);
      const nextAttemptAt = backoffIso(claimed?.attempts ?? 1);
      const updated = markTransmissionFailed(jobId, result.error, {
        permanent: result.permanent,
        nextAttemptAt: result.permanent ? null : nextAttemptAt,
      });
      if (updated?.status === "DEAD") return { status: "DEAD", error: result.error };
      return { status: "RETRY", error: result.error, nextAttemptAt: updated?.nextAttemptAt ?? nextAttemptAt };
    }

    // ── Email channel (default). ──
    const settings = getSellerSettings(existing.orgId);
    const isUbl =
      record.canonical.profile === "XRECHNUNG_UBL" || record.canonical.profile === "PEPPOL_BIS_3";
    const xml = isUbl ? serializeToUblXml(record.canonical) : serializeToCiiXml(record.canonical);

    let pdfAttachment: { filename: string; contentBase64: string } | undefined;
    if (!isUbl) {
      const { pdfBytes } = await generateHybridEInvoicePdf(record.canonical, xml);
      pdfAttachment = {
        filename: `${record.invoiceNumber}_ZUGFeRD.pdf`,
        contentBase64: Buffer.from(pdfBytes).toString("base64"),
      };
    }

    const emailRes = await dispatchEInvoiceEmail({
      to: existing.recipient,
      cc: existing.cc || settings?.accountantCcEmail || undefined,
      invoiceNumber: record.invoiceNumber,
      sellerName: record.canonical.seller.name,
      grossFormatted: `${record.grossAmount.toFixed(2)} ${record.currency}`,
      locale: record.canonical.locale,
      pdfAttachment,
      xmlAttachment: {
        filename: `${record.invoiceNumber}.xml`,
        contentBase64: Buffer.from(xml, "utf8").toString("base64"),
      },
    });

    // Only a verified provider result moves the job and invoice forward.
    markTransmissionSent(jobId, emailRes.provider, emailRes.messageId);
    const audit = markInvoiceDelivered(
      existing.orgId,
      existing.invoiceId,
      existing.recipient,
      existing.actorEmail
    );

    return { status: "SENT", providerRef: emailRes.messageId, auditHash: audit?.eventHash ?? null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transmission failed";
    const claimed = getTransmissionJob(jobId); // attempts already incremented by the claim
    const permanent = isPermanentError(message);
    const nextAttemptAt = backoffIso(claimed?.attempts ?? 1);
    const updated = markTransmissionFailed(jobId, message, {
      permanent,
      nextAttemptAt: permanent ? null : nextAttemptAt,
    });
    if (updated?.status === "DEAD") return { status: "DEAD", error: message };
    return { status: "RETRY", error: message, nextAttemptAt: updated?.nextAttemptAt ?? nextAttemptAt };
  }
}

async function drainOnce(): Promise<void> {
  const ids = listDueTransmissionJobIds(DRAIN_BATCH);
  for (const id of ids) {
    try {
      await processTransmissionJobOnce(id);
    } catch (err) {
      console.error(
        JSON.stringify({
          level: "error",
          msg: "transmission_drain_error",
          jobId: id,
          error: err instanceof Error ? err.message : String(err),
        })
      );
    }
  }
}

interface DrainerGlobal {
  __niOutboxTimer?: NodeJS.Timeout;
  __niOutboxDraining?: boolean;
}

/**
 * Start the background drainer once per process. Idempotent and safe under
 * Next.js hot-reload. The timer is unref'd so it never keeps the process alive.
 */
export function ensureOutboxDrainerStarted(): void {
  const g = globalThis as unknown as DrainerGlobal;
  if (g.__niOutboxTimer) return;
  g.__niOutboxTimer = setInterval(() => {
    if (g.__niOutboxDraining) return; // no overlapping drains
    g.__niOutboxDraining = true;
    void drainOnce().finally(() => {
      g.__niOutboxDraining = false;
    });
  }, DRAIN_INTERVAL_MS);
  if (typeof g.__niOutboxTimer.unref === "function") g.__niOutboxTimer.unref();
}
