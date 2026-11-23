import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import {
  SAMPLE_EU_BATCH_CSV,
  buildDatevExtfCsv,
  generateHybridEInvoicePdf,
  parseBatchInvoicesCsv,
  serializeToCiiXml,
  serializeToUblXml,
} from "@norminvoice/einvoice-core";
import {
  getSellerSettings,
  getInvoiceDesignForOrg,
  saveInvoiceForOrg,
  sellerSettingsToCanonicalParty,
} from "@/lib/db-store";
import { enforceOrgMonthlyQuota } from "@/lib/quota";
import { requireTenantAuth, sanitizeSafeFilename } from "@/lib/security";

export async function GET(req: NextRequest) {
  const access = await requireTenantAuth(req);
  if (!access.ok) return access.response;

  if (req.nextUrl.searchParams.get("sample") === "true") {
    return new NextResponse("\uFEFF" + SAMPLE_EU_BATCH_CSV, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="NormInvoice_Sample_EU_Batch.csv"',
        "Cache-Control": "no-store",
      },
    });
  }
  return NextResponse.json({ sampleCsv: SAMPLE_EU_BATCH_CSV });
}

export async function POST(req: NextRequest) {
  const access = await requireTenantAuth(req, { allowedRoles: ["owner", "admin", "member", "api_key"] });
  if (!access.ok) return access.response;

  try {
    const mode = req.nextUrl.searchParams.get("mode") || "preview";
    const ct = req.headers.get("content-type") || "";
    let csvText = "";

    if (ct.includes("multipart/form-data")) {
      const fd = await req.formData();
      const file = fd.get("file");
      if (!file || !(file instanceof File)) {
        return NextResponse.json({ error: "Missing CSV file" }, { status: 400 });
      }
      csvText = await file.text();
    } else {
      const body = (await req.json()) as { csvText?: string };
      csvText = body.csvText || "";
    }

    if (!csvText.trim()) {
      return NextResponse.json({ error: "CSV payload is empty" }, { status: 400 });
    }

    const settings = getSellerSettings(access.ctx.orgId);
    const design = getInvoiceDesignForOrg(access.ctx.orgId);
    if (!settings) {
      return NextResponse.json({ error: "Complete your Seller Settings before running Batch CSV." }, { status: 400 });
    }

    const rows = parseBatchInvoicesCsv(csvText, sellerSettingsToCanonicalParty(settings), {
      iban: settings.iban,
      bic: settings.bic,
    });

    if (rows.length === 0) {
      return NextResponse.json({ error: "No invoice data rows found in CSV" }, { status: 400 });
    }
    if (rows.length > 200) {
      return NextResponse.json({ error: "Batch limit is 200 invoices per upload" }, { status: 413 });
    }

    if (mode === "preview") {
      return NextResponse.json({
        totalRows: rows.length,
        validCount: rows.filter((r) => r.valid).length,
        invalidCount: rows.filter((r) => !r.valid).length,
        rows: rows.map((r) => ({
          rowNumber: r.rowNumber,
          invoiceNumber: r.invoiceNumber,
          buyerName: r.buyerName,
          buyerCountry: r.buyerCountry,
          profile: r.profile,
          grossAmount: r.grossAmount,
          currency: r.currency,
          valid: r.valid,
          errors: r.errors,
        })),
      });
    }

    const quota = enforceOrgMonthlyQuota(access.ctx.orgId, rows.length);
    if (!quota.allowed) return quota.response;

    const zip = new JSZip();
    const validInvoices = [];

    for (const r of rows) {
      saveInvoiceForOrg(access.ctx.orgId, r.invoice, {
        source: "csv",
        sourceRef: `CSV-ROW-${r.rowNumber}`,
        actorEmail: access.ctx.actorEmail,
      });

      if (!r.valid) continue;
      validInvoices.push(r.invoice);

      const safeBase = sanitizeSafeFilename(r.invoiceNumber, `row_${r.rowNumber}`);
      const isUbl = r.profile === "XRECHNUNG_UBL" || r.profile === "PEPPOL_BIS_3";
      const xml = isUbl ? serializeToUblXml(r.invoice) : serializeToCiiXml(r.invoice);
      zip.file(`xml/${safeBase}.xml`, xml);

      if (!isUbl) {
        const { pdfBytes } = await generateHybridEInvoicePdf(r.invoice, xml, design);
        zip.file(`pdf/${safeBase}_ZUGFeRD.pdf`, pdfBytes);
      }
    }

    if (validInvoices.length > 0) {
      const datevCsv = buildDatevExtfCsv(validInvoices, { chartOfAccounts: "SKR03" });
      zip.file("DATEV_EXTF_Buchungsstapel_SKR03.csv", datevCsv);
    }

    zip.file(
      "compliance-summary.json",
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          orgId: access.ctx.orgId,
          totalRows: rows.length,
          exportedValidCount: validInvoices.length,
          skippedInvalidRows: rows
            .filter((r) => !r.valid)
            .map((r) => ({ rowNumber: r.rowNumber, invoiceNumber: r.invoiceNumber, errors: r.errors })),
        },
        null,
        2
      )
    );

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
    const filename = `NormInvoice_EU_Batch_${new Date().toISOString().slice(0, 10)}.zip`;

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Batch processing failed" },
      { status: 500 }
    );
  }
}
