import { NextRequest, NextResponse } from "next/server";
import { enqueueTransmissionJob, getInvoiceForOrg, getSellerSettings } from "@/lib/db-store";
import {
  ensureOutboxDrainerStarted,
  processTransmissionJobOnce,
} from "@/lib/transmission-outbox";
import { requireTenantAuth } from "@/lib/security";

/**
 * Dispatch an e-invoice through the durable transmission outbox (ADR-004).
 * The request enqueues an idempotent job and attempts it inline for immediate
 * feedback; if the external provider is temporarily unavailable the job stays
 * durably queued and the background drainer retries it with backoff. A repeated
 * request for the same invoice + recipient reuses the same job, so no duplicate
 * legal submission can occur.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireTenantAuth(req, { allowedRoles: ["owner", "admin", "member", "api_key"] });
  if (!access.ok) return access.response;

  try {
    const { id } = await context.params;
    const record = getInvoiceForOrg(access.ctx.orgId, id);
    if (!record) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    if (!record.validationPassed) {
      return NextResponse.json(
        { error: "Cannot email an invalid e-invoice. Fix compliance errors first." },
        { status: 409 }
      );
    }

    let customRecipient = "";
    try {
      const body = (await req.json()) as { recipientEmail?: string };
      customRecipient = body.recipientEmail?.trim() || "";
    } catch {
      // optional body
    }

    const recipient = customRecipient || record.canonical.buyer.electronicAddress;
    if (!recipient || !recipient.includes("@")) {
      return NextResponse.json(
        { error: "Buyer electronic email address (BT-49) is missing or not an email." },
        { status: 422 }
      );
    }

    const settings = getSellerSettings(access.ctx.orgId);

    // 1. Durably enqueue (idempotent on invoice + channel + recipient).
    const { job, created } = enqueueTransmissionJob({
      orgId: access.ctx.orgId,
      invoiceId: record.id,
      invoiceNumber: record.invoiceNumber,
      channel: "email",
      recipient,
      cc: settings?.accountantCcEmail || null,
      actorEmail: access.ctx.actorEmail,
    });

    // Already delivered earlier → return idempotently without re-sending.
    if (!created && job.status === "SENT") {
      return NextResponse.json({
        delivered: true,
        alreadySent: true,
        to: recipient,
        cc: settings?.accountantCcEmail || null,
        jobId: job.id,
        status: "SENT",
        providerRef: job.providerRef,
      });
    }

    // 2. Ensure the background retry drainer is running, then attempt inline.
    ensureOutboxDrainerStarted();
    const outcome = await processTransmissionJobOnce(job.id);

    if (outcome.status === "SENT") {
      return NextResponse.json({
        delivered: true,
        to: recipient,
        cc: settings?.accountantCcEmail || null,
        jobId: job.id,
        status: "SENT",
        providerRef: outcome.providerRef,
        auditHash: outcome.auditHash,
      });
    }

    if (outcome.status === "RETRY") {
      return NextResponse.json(
        {
          delivered: false,
          queued: true,
          jobId: job.id,
          status: "QUEUED",
          nextAttemptAt: outcome.nextAttemptAt,
          note: "Delivery provider temporarily unavailable — the invoice is safely queued and will be retried automatically.",
          error: outcome.error,
        },
        { status: 202 }
      );
    }

    if (outcome.status === "DEAD") {
      return NextResponse.json(
        {
          delivered: false,
          jobId: job.id,
          status: "DEAD",
          error: outcome.error,
        },
        { status: 502 }
      );
    }

    // SKIPPED: another worker is already handling this job.
    return NextResponse.json(
      {
        delivered: false,
        queued: true,
        jobId: job.id,
        status: "SENDING",
        note: "Delivery already in progress.",
      },
      { status: 202 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Email dispatch failed" },
      { status: 500 }
    );
  }
}
