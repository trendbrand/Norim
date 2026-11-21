import { NextRequest, NextResponse } from "next/server";
import {
  generateHybridEInvoicePdf,
  serializeToCiiXml,
  serializeToUblXml,
} from "@norminvoice/einvoice-core";
import { getInvoiceForOrg } from "@/lib/db-store";
import { requireTenantAuth, sanitizeSafeFilename } from "@/lib/security";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireTenantAuth(req);
  if (!access.ok) return access.response;

  const { id } = await context.params;
  const artifact = req.nextUrl.searchParams.get("artifact") || "pdf";

  const record = getInvoiceForOrg(access.ctx.orgId, id);
  if (!record) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const safeBase = sanitizeSafeFilename(record.invoiceNumber, "invoice");
  const isUbl =
    record.canonical.profile === "XRECHNUNG_UBL" || record.canonical.profile === "PEPPOL_BIS_3";
  const xml = isUbl ? serializeToUblXml(record.canonical) : serializeToCiiXml(record.canonical);

  if (artifact === "json") {
    return new NextResponse(JSON.stringify(record.canonical, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${safeBase}.json"`,
        "Cache-Control": "no-store",
      },
    });
  }

  if (artifact === "xml" || isUbl) {
    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="${safeBase}.xml"`,
        "X-GoBD-SHA256": record.sha256Xml,
        "Cache-Control": "no-store",
      },
    });
  }

  const { pdfBytes } = await generateHybridEInvoicePdf(record.canonical, xml);
  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeBase}_ZUGFeRD.pdf"`,
      "X-GoBD-SHA256-XML": record.sha256Xml,
      "Cache-Control": "no-store",
    },
  });
}
