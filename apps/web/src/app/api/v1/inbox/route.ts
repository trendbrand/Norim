import { NextRequest, NextResponse } from "next/server";
import {
  extractXmlFromHybridPdf,
  parseEInvoiceXml,
  validateCanonicalInvoice,
} from "@norminvoice/einvoice-core";
import {
  listIncomingInvoicesForOrg,
  saveIncomingInvoiceForOrg,
} from "@/lib/db-store";
import { requireTenantAuth } from "@/lib/security";

const MAX_BYTES = 10 * 1024 * 1024;

export async function GET(req: NextRequest) {
  const access = await requireTenantAuth(req);
  if (!access.ok) return access.response;

  return NextResponse.json({
    incoming: listIncomingInvoicesForOrg(access.ctx.orgId),
  });
}

/**
 * Upload a supplier's ZUGFeRD / Factur-X Hybrid PDF or XRechnung / Peppol XML.
 * Automatically extracts structured EN 16931 XML, validates compliance, and archives it GoBD-immutably.
 */
export async function POST(req: NextRequest) {
  const access = await requireTenantAuth(req, { allowedRoles: ["owner", "admin", "member", "api_key"] });
  if (!access.ok) return access.response;

  try {
    const ct = req.headers.get("content-type") || "";
    let filename = "supplier-invoice.xml";
    let xmlText = "";
    let containerLabel: "XML" | "PDF/A-3b" | "PDF (Non-PDF/A-3)" = "XML";

    if (ct.includes("multipart/form-data")) {
      const fd = await req.formData();
      const file = fd.get("file");
      if (!file || !(file instanceof File)) {
        return NextResponse.json({ error: "Missing uploaded PDF or XML file." }, { status: 400 });
      }
      if (file.size > MAX_BYTES) {
        return NextResponse.json({ error: "File exceeds 10 MB limit." }, { status: 413 });
      }
      filename = file.name || filename;
      const bytes = new Uint8Array(await file.arrayBuffer());
      const isPdf = bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;

      if (isPdf) {
        const extracted = await extractXmlFromHybridPdf(bytes);
        if (!extracted.hasEmbeddedXml || !extracted.xmlContent) {
          return NextResponse.json(
            { error: "This PDF does not contain an embedded ZUGFeRD / Factur-X EN 16931 XML attachment." },
            { status: 422 }
          );
        }
        xmlText = extracted.xmlContent;
        containerLabel = extracted.hasPdfA3Xmp ? "PDF/A-3b" : "PDF (Non-PDF/A-3)";
      } else {
        xmlText = new TextDecoder("utf-8").decode(bytes);
      }
    } else {
      const body = (await req.json()) as { rawXml?: string; filename?: string };
      if (!body.rawXml?.trim()) {
        return NextResponse.json({ error: "Provide rawXml or multipart file upload." }, { status: 400 });
      }
      xmlText = body.rawXml;
      if (body.filename) filename = body.filename;
    }

    const parsed = parseEInvoiceXml(xmlText);
    const report = validateCanonicalInvoice(parsed.invoice, { container: containerLabel, syntax: parsed.syntax });
    const record = saveIncomingInvoiceForOrg(access.ctx.orgId, parsed.invoice, {
      filename,
      detectedStandard: report.detected.standard,
      actorEmail: access.ctx.actorEmail,
    });

    return NextResponse.json({ incoming: record, report }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to parse incoming e-invoice" },
      { status: 422 }
    );
  }
}
