import { NextRequest, NextResponse } from "next/server";
import { serializeToCiiXml, serializeToUblXml } from "@norminvoice/einvoice-core";
import {
  getIncomingInvoiceForOrg,
  getIncomingInvoiceOriginalXml,
} from "@/lib/db-store";
import { requireTenantAuth } from "@/lib/security";

function sanitize(name: string): string {
  return name.replace(/[^A-Za-z0-9._-]+/g, "_").slice(0, 80) || "incoming-invoice";
}

/**
 * Export / download a received supplier invoice:
 *  - artifact=xml  → the supplier's ORIGINAL uploaded XML (true original, not re-rendered)
 *  - artifact=json → the parsed canonical EN 16931 representation
 * Tenant-scoped to the caller's org.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireTenantAuth(req);
  if (!access.ok) return access.response;

  const { id } = await context.params;
  const record = getIncomingInvoiceForOrg(access.ctx.orgId, id);
  if (!record) {
    return NextResponse.json({ error: "Incoming invoice not found" }, { status: 404 });
  }

  const artifact = new URL(req.url).searchParams.get("artifact") || "xml";
  const base = sanitize(record.invoiceNumber);

  if (artifact === "json") {
    return new NextResponse(JSON.stringify(record.canonical, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${base}.json"`,
      },
    });
  }

  // XML: prefer the preserved original bytes; fall back to a re-serialized view.
  const original = getIncomingInvoiceOriginalXml(access.ctx.orgId, id);
  const isUbl =
    record.canonical.profile === "XRECHNUNG_UBL" || record.canonical.profile === "PEPPOL_BIS_3";
  const xml = original?.xml ?? (isUbl ? serializeToUblXml(record.canonical) : serializeToCiiXml(record.canonical));

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="${base}.xml"`,
    },
  });
}
