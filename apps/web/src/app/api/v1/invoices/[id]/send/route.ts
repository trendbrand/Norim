import { NextRequest, NextResponse } from "next/server";
import {
  generateHybridEInvoicePdf,
  serializeToCiiXml,
  serializeToUblXml,
} from "@norminvoice/einvoice-core";
import { dispatchEInvoiceEmail } from "@/lib/email-dispatcher";
import { getInvoiceForOrg, getSellerSettings, markInvoiceDelivered } from "@/lib/db-store";
import { requireTenantAuth } from "@/lib/security";

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
      to: recipient,
      cc: settings?.accountantCcEmail || undefined,
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

    const auditEntry = markInvoiceDelivered(access.ctx.orgId, record.id, recipient, access.ctx.actorEmail);

    return NextResponse.json({
      delivered: true,
      to: recipient,
      cc: settings?.accountantCcEmail || null,
      emailResult: emailRes,
      auditHash: auditEntry?.eventHash ?? null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Email dispatch failed" },
      { status: 500 }
    );
  }
}
