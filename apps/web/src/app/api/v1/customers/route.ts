import { NextRequest, NextResponse } from "next/server";
import { requireTenantAuth } from "@/lib/security";
import {
  appendOrgAuditEvent,
  createCustomerForOrg,
  listCustomersForOrg,
} from "@/lib/db-store";

export async function GET(req: NextRequest) {
  const access = await requireTenantAuth(req);
  if (!access.ok) return access.response;

  const search = req.nextUrl.searchParams.get("search") || undefined;
  return NextResponse.json({
    customers: listCustomersForOrg(access.ctx.orgId, search),
  });
}

export async function POST(req: NextRequest) {
  const access = await requireTenantAuth(req, { allowedRoles: ["owner", "admin", "member", "api_key"] });
  if (!access.ok) return access.response;

  try {
    const body = await req.json();
    if (!body.legalName?.trim()) {
      return NextResponse.json({ error: "Customer legalName is required." }, { status: 400 });
    }

    const customer = createCustomerForOrg(access.ctx.orgId, {
      legalName: body.legalName,
      vatId: body.vatId || "",
      vatStatus: body.vatStatus || "UNCHECKED",
      vatCheckedAt: body.vatCheckedAt || null,
      leitwegId: body.leitwegId || "",
      electronicAddress: body.electronicAddress || "",
      street: body.street || "",
      postalCode: body.postalCode || "",
      city: body.city || "",
      countryCode: body.countryCode || "DE",
      defaultFormat: body.defaultFormat || "ZUGFERD_EN16931",
      notes: body.notes || "",
    });

    appendOrgAuditEvent(access.ctx.orgId, null, customer.id, "CUSTOMER_CREATED", access.ctx.actorEmail, {
      legalName: customer.legalName,
      countryCode: customer.countryCode,
    });

    return NextResponse.json({ customer }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create customer" },
      { status: 400 }
    );
  }
}
