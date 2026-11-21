import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import {
  buildDatevExtfCsv,
  buildFrenchFecTsv,
  generateHybridEInvoicePdf,
  serializeToCiiXml,
  serializeToUblXml,
} from "@norminvoice/einvoice-core";
import {
  appendOrgAuditEvent,
  listInvoicesForOrg,
  verifyOrgAuditHashChain,
} from "@/lib/db-store";
import { requireTenantAuth, sanitizeSafeFilename } from "@/lib/security";

/**
 * Accountant Monthly/Quarterly Complete Archive Bundle (.zip):
 * Includes all validated PDF/A-3b + XML e-invoices in date range, DATEV EXTF CSV, French FEC TSV, and GoBD Integrity Manifest.
 */
export async function GET(req: NextRequest) {
  const access = await requireTenantAuth(req);
  if (!access.ok) return access.response;

  const fromDate = req.nextUrl.searchParams.get("from") || undefined;
  const toDate = req.nextUrl.searchParams.get("to") || undefined;
  const skr = req.nextUrl.searchParams.get("skr") === "SKR04" ? "SKR04" : "SKR03";

  const records = listInvoicesForOrg(access.ctx.orgId, { fromDate, toDate }).filter(
    (r) => r.validationPassed && r.status !== "DRAFT"
  );

  const zip = new JSZip();
  for (const r of records) {
    const safeBase = sanitizeSafeFilename(r.invoiceNumber, r.id);
    const isUbl = r.canonical.profile === "XRECHNUNG_UBL" || r.canonical.profile === "PEPPOL_BIS_3";
    const xml = isUbl ? serializeToUblXml(r.canonical) : serializeToCiiXml(r.canonical);
    zip.file(`xml/${safeBase}.xml`, xml);
    if (!isUbl) {
      const { pdfBytes } = await generateHybridEInvoicePdf(r.canonical, xml);
      zip.file(`pdf/${safeBase}_ZUGFeRD.pdf`, pdfBytes);
    }
  }

  const canonicals = records.map((r) => r.canonical);
  zip.file(`accounting/DATEV_EXTF_${skr}.csv`, buildDatevExtfCsv(canonicals, { chartOfAccounts: skr }));
  zip.file("accounting/DGFiP_FEC.txt", buildFrenchFecTsv(canonicals));
  zip.file(
    "gobd-integrity-manifest.json",
    JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        orgId: access.ctx.orgId,
        dateRange: { from: fromDate ?? "ALL", to: toDate ?? "ALL" },
        invoiceCount: records.length,
        hashChainVerification: verifyOrgAuditHashChain(access.ctx.orgId),
        documents: records.map((r) => ({
          invoiceNumber: r.invoiceNumber,
          typeCode: r.typeCode,
          issueDate: r.issueDate,
          grossAmount: r.grossAmount,
          currency: r.currency,
          sha256Xml: r.sha256Xml,
          archiveLockedUntil: r.archiveLockedUntil,
        })),
      },
      null,
      2
    )
  );

  appendOrgAuditEvent(access.ctx.orgId, null, "ARCHIVE-ZIP", "EXPORT_ARCHIVE_ZIP_DOWNLOADED", access.ctx.actorEmail, {
    count: records.length,
    fromDate: fromDate ?? null,
    toDate: toDate ?? null,
  });

  const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="NormInvoice_Accountant_Archive_${stamp}.zip"`,
      "Cache-Control": "no-store",
    },
  });
}
