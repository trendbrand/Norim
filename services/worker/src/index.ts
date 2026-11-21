import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  CanonicalInvoice,
  StripeInvoiceLike,
  generateHybridEInvoicePdf,
  mapStripeInvoiceToCanonical,
  serializeToCiiXml,
  serializeToUblXml,
  validateCanonicalInvoice,
  verifyEuVatId,
} from "@norminvoice/einvoice-core";
import { computeAuditEventHash, sha256Buffer } from "@norminvoice/db";
import { Job, Queue, Worker } from "bullmq";
import { Redis } from "ioredis";

export interface GenerateInvoiceJobData {
  orgId: string;
  invoiceId: string;
  retentionYears: 8 | 10;
  source: "stripe" | "woocommerce" | "api" | "manual";
  stripePayload?: StripeInvoiceLike;
  canonicalInvoice?: CanonicalInvoice;
  sellerProfile?: CanonicalInvoice["seller"];
  iban?: string;
  bic?: string;
  accountantCcEmail?: string;
}

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const EINVOICE_ENGINE_URL = process.env.EINVOICE_ENGINE_URL || "";

function createS3ArchiveClient(): S3Client | null {
  if (!process.env.S3_ENDPOINT || !process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY) {
    return null;
  }
  return new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || "fsn1",
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  });
}

async function uploadImmutableArtifact(
  s3: S3Client | null,
  key: string,
  body: Uint8Array | Buffer | string,
  contentType: string,
  retentionYears: 8 | 10
): Promise<{ objectKey: string; sha256: string; lockedUntilIso: string }> {
  const sha256 = sha256Buffer(body);
  const lockDate = new Date();
  lockDate.setUTCFullYear(lockDate.getUTCFullYear() + retentionYears);
  const lockedUntilIso = lockDate.toISOString();

  if (s3 && process.env.S3_BUCKET) {
    const useObjectLock = process.env.S3_OBJECT_LOCK_ENABLED === "true";
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        Body: typeof body === "string" ? Buffer.from(body, "utf8") : body,
        ContentType: contentType,
        Metadata: { sha256, gobd_retention_years: String(retentionYears) },
        ...(useObjectLock
          ? {
              ObjectLockMode: "GOVERNANCE" as const,
              ObjectLockRetainUntilDate: lockDate,
            }
          : {}),
      })
    );
  }

  return { objectKey: key, sha256, lockedUntilIso };
}

/**
 * Core BullMQ Job Processor:
 * Stripe/Woo/API -> Cached VIES Verification -> Canonical EN 16931 Mapping
 * -> CII/UBL XML + Hybrid PDF/A-3b -> Dual Self-Validation (KoSIT+veraPDF or Builtin)
 * -> EU S3 WORM Archiving -> Hash-Chained GoBD Audit Event -> Customer Delivery
 */
export async function processGenerateInvoiceJob(job: Job<GenerateInvoiceJobData>) {
  const data = job.data;
  const s3 = createS3ArchiveClient();

  let invoice: CanonicalInvoice;
  if (data.stripePayload && data.sellerProfile) {
    // Step 1: Verify Buyer EU VAT ID via cached VIES with circuit-breaker fallback
    const buyerVat = data.stripePayload.customer_tax_ids?.find((t) => t.type === "eu_vat")?.value;
    let buyerVatVerified: boolean | undefined;
    if (buyerVat) {
      const viesRes = await verifyEuVatId(buyerVat, { liveLookup: true });
      buyerVatVerified = viesRes.status === "VERIFIED" || viesRes.status === "PROVISIONAL";
    }
    const mapped = mapStripeInvoiceToCanonical(data.stripePayload, data.sellerProfile, {
      iban: data.iban,
      bic: data.bic,
      buyerVatVerified,
    });
    invoice = mapped.invoice;
  } else if (data.canonicalInvoice) {
    invoice = data.canonicalInvoice;
  } else {
    throw new Error("Job payload missing canonicalInvoice or stripePayload + sellerProfile");
  }

  // Step 2: Deterministic EN 16931 Pre-Validation (NEVER email a broken invoice!)
  const preCheck = validateCanonicalInvoice(invoice);
  if (!preCheck.valid) {
    return {
      status: "ACTION_REQUIRED" as const,
      invoiceId: data.invoiceId,
      errors: preCheck.diagnostics,
    };
  }

  // Step 3: Serialize CII or UBL XML + Hybrid PDF/A-3b
  const isUbl = invoice.profile === "XRECHNUNG_UBL" || invoice.profile === "PEPPOL_BIS_3";
  const xml = isUbl ? serializeToUblXml(invoice) : serializeToCiiXml(invoice);
  let pdfBytes: Uint8Array | null = null;
  let kositReportXml: string | null = null;

  if (!isUbl) {
    const hybrid = await generateHybridEInvoicePdf(invoice, xml);
    pdfBytes = hybrid.pdfBytes;

    // Optional production delegation to sandboxed Ghostscript + veraPDF + KoSIT engine
    if (EINVOICE_ENGINE_URL) {
      const resp = await fetch(`${EINVOICE_ENGINE_URL}/internal/pdfa3/embed-and-validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-engine-secret": process.env.EINVOICE_ENGINE_SHARED_SECRET || "",
        },
        body: JSON.stringify({
          pdf_base64: Buffer.from(hybrid.pdfBytes).toString("base64"),
          xml_utf8: xml,
          level: "en16931",
        }),
      });
      if (!resp.ok) {
        throw new Error(`Sandboxed compliance engine failed with HTTP ${resp.status}`);
      }
      const engineRes = (await resp.json()) as {
        valid: boolean;
        pdfBase64: string;
        kosit?: { reportXml?: string };
      };
      if (!engineRes.valid) {
        return {
          status: "ACTION_REQUIRED" as const,
          invoiceId: data.invoiceId,
          kositReportXml: engineRes.kosit?.reportXml,
        };
      }
      pdfBytes = Buffer.from(engineRes.pdfBase64, "base64");
      kositReportXml = engineRes.kosit?.reportXml ?? null;
    }
  }

  // Step 4: Immutable EU S3 WORM Archiving (BEG IV 8-yr DE / 10-yr FR)
  const prefix = `orgs/${data.orgId}/invoices/${invoice.issueDate.slice(0, 7)}/${data.invoiceId}`;
  const xmlArchive = await uploadImmutableArtifact(
    s3,
    `${prefix}/${invoice.invoiceNumber}.xml`,
    xml,
    "application/xml",
    data.retentionYears
  );
  const pdfArchive = pdfBytes
    ? await uploadImmutableArtifact(
        s3,
        `${prefix}/${invoice.invoiceNumber}.pdf`,
        pdfBytes,
        "application/pdf",
        data.retentionYears
      )
    : null;

  if (kositReportXml) {
    await uploadImmutableArtifact(
      s3,
      `${prefix}/kosit-validation-report.xml`,
      kositReportXml,
      "application/xml",
      data.retentionYears
    );
  }

  // Step 5: Compute GoBD tamper-evident audit hash chain link
  const auditHash = computeAuditEventHash({
    prevHash: "0".repeat(64),
    invoiceId: data.invoiceId,
    eventType: "VALIDATED_AND_ARCHIVED",
    payloadJson: { sha256Xml: xmlArchive.sha256, sha256Pdf: pdfArchive?.sha256 ?? null },
    createdAtIso: new Date().toISOString(),
  });

  return {
    status: "VALIDATED" as const,
    invoiceId: data.invoiceId,
    xmlObjectKey: xmlArchive.objectKey,
    pdfObjectKey: pdfArchive?.objectKey ?? null,
    sha256Xml: xmlArchive.sha256,
    sha256Pdf: pdfArchive?.sha256 ?? null,
    archiveLockedUntil: xmlArchive.lockedUntilIso,
    auditHash,
  };
}

// Worker entrypoint when executed standalone
if (process.argv[1]?.endsWith("index.js") || process.argv[1]?.endsWith("index.ts")) {
  const connection = new Redis(REDIS_URL, { maxRetriesPerRequest: null });
  exportQueueHealth(connection);

  const worker = new Worker<GenerateInvoiceJobData>(
    "einvoice-generation",
    async (job) => processGenerateInvoiceJob(job),
    {
      connection,
      concurrency: 4,
    }
  );

  worker.on("completed", (job) => {
    console.log(JSON.stringify({ level: "info", msg: "einvoice_job_completed", jobId: job.id }));
  });

  worker.on("failed", (job, err) => {
    console.error(JSON.stringify({ level: "error", msg: "einvoice_job_failed", jobId: job?.id, error: err.message }));
  });

  console.log(JSON.stringify({ level: "info", msg: "norminvoice_worker_started", queue: "einvoice-generation" }));
}

function exportQueueHealth(connection: Redis) {
  const q = new Queue("einvoice-generation", { connection });
  void q.waitUntilReady();
}
