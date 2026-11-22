import { NextRequest, NextResponse } from "next/server";
import {
  listInvoicePaymentsForOrg,
  listInvoicesForOrg,
  recordInvoicePayment,
} from "@/lib/db-store";
import { requireTenantAuth } from "@/lib/security";

export async function GET(req: NextRequest) {
  const access = await requireTenantAuth(req);
  if (!access.ok) return access.response;

  const invoices = listInvoicesForOrg(access.ctx.orgId)
    .filter((i) => i.status !== "DRAFT" && i.typeCode === 380)
    .map((i) => ({
      id: i.id,
      invoiceNumber: i.invoiceNumber,
      buyerName: i.buyerName,
      issueDate: i.issueDate,
      dueDate: i.dueDate,
      currency: i.currency,
      grossAmount: i.grossAmount,
      paidAmount: i.paidAmount,
      balanceDue: Number(Math.max(0, i.grossAmount - i.paidAmount).toFixed(2)),
      paymentStatus: i.paymentStatus,
      deliveryStatus: i.status,
    }));

  const payments = listInvoicePaymentsForOrg(access.ctx.orgId);

  return NextResponse.json({ invoices, payments });
}

export async function POST(req: NextRequest) {
  const access = await requireTenantAuth(req, { allowedRoles: ["owner", "admin", "member"] });
  if (!access.ok) return access.response;

  try {
    const body = (await req.json()) as {
      invoiceId?: string;
      amount?: number;
      method?: string;
      reference?: string;
      valueDate?: string;
    };
    if (!body.invoiceId || !body.amount) {
      return NextResponse.json({ error: "invoiceId and positive amount are required." }, { status: 400 });
    }
    const res = recordInvoicePayment(
      access.ctx.orgId,
      body.invoiceId,
      {
        amount: Number(body.amount),
        method: body.method,
        reference: body.reference,
        valueDate: body.valueDate,
      },
      access.ctx.actorEmail
    );
    if (!res) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    return NextResponse.json(res, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to record payment" },
      { status: 400 }
    );
  }
}
