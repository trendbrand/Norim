import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { serializeToCiiXml, serializeToUblXml } from "@norminvoice/einvoice-core";
import {
  deleteDraftInvoiceForOrg,
  getInvoiceForOrg,
  listOrgAuditEvents,
} from "@/lib/db-store";
import { requireTenantAuth } from "@/lib/security";

function buildEpcSepaPayload(inv: ReturnType<typeof getInvoiceForOrg>): string | null {
  if (!inv) return null;
  const iban = inv.canonical.payment.iban?.replace(/\s+/g, "").toUpperCase();
  if (!iban || inv.currency !== "EUR" || inv.grossAmount <= 0) return null;
  const bic = (inv.canonical.payment.bic || "").replace(/\s+/g, "").toUpperCase();
  const beneficiary = inv.canonical.seller.name.slice(0, 70);
  return [
    "BCD",
    "002",
    "1",
    "SCT",
    bic,
    beneficiary,
    iban,
    `EUR${inv.grossAmount.toFixed(2)}`,
    "",
    "",
    inv.invoiceNumber.slice(0, 140),
  ].join("\n");
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireTenantAuth(req);
  if (!access.ok) return access.response;

  const { id } = await context.params;
  const invoice = getInvoiceForOrg(access.ctx.orgId, id);
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const isUbl =
    invoice.canonical.profile === "XRECHNUNG_UBL" || invoice.canonical.profile === "PEPPOL_BIS_3";
  const xmlPreview = isUbl
    ? serializeToUblXml(invoice.canonical)
    : serializeToCiiXml(invoice.canonical);

  const auditEvents = listOrgAuditEvents(access.ctx.orgId, invoice.id);
  const epcPayload = buildEpcSepaPayload(invoice);
  let epcQrDataUrl: string | null = null;
  if (epcPayload) {
    try {
      epcQrDataUrl = await QRCode.toDataURL(epcPayload, { width: 180, margin: 1 });
    } catch {
      epcQrDataUrl = null;
    }
  }

  return NextResponse.json({
    invoice,
    auditEvents,
    epcPayload,
    epcQrDataUrl,
    xmlPreview,
  });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireTenantAuth(req, { allowedRoles: ["owner", "admin", "member"] });
  if (!access.ok) return access.response;

  const { id } = await context.params;
  const res = deleteDraftInvoiceForOrg(access.ctx.orgId, id, access.ctx.actorEmail);
  if (!res.deleted) {
    return NextResponse.json(
      { error: res.reason || "Cannot delete invoice" },
      { status: res.reason === "NOT_FOUND" ? 404 : 409 }
    );
  }
  return NextResponse.json({ deleted: true, id });
}
