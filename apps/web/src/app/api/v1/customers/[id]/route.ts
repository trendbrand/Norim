import { NextRequest, NextResponse } from "next/server";
import { requireTenantAuth } from "@/lib/security";
import {
  deleteCustomerForOrg,
  getCustomerForOrg,
  updateCustomerForOrg,
} from "@/lib/db-store";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireTenantAuth(req);
  if (!access.ok) return access.response;

  const { id } = await context.params;
  const customer = getCustomerForOrg(access.ctx.orgId, id);
  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }
  return NextResponse.json({ customer });
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireTenantAuth(req, { allowedRoles: ["owner", "admin", "member", "api_key"] });
  if (!access.ok) return access.response;

  const { id } = await context.params;
  try {
    const body = await req.json();
    const updated = updateCustomerForOrg(access.ctx.orgId, id, body);
    if (!updated) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    return NextResponse.json({ customer: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update customer" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireTenantAuth(req, { allowedRoles: ["owner", "admin"] });
  if (!access.ok) return access.response;

  const { id } = await context.params;
  const deleted = deleteCustomerForOrg(access.ctx.orgId, id);
  if (!deleted) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }
  return NextResponse.json({ deleted: true, id });
}
