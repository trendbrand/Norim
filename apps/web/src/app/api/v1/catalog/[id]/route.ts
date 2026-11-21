import { NextRequest, NextResponse } from "next/server";
import { deleteProductForOrg, updateProductForOrg } from "@/lib/db-store";
import { requireTenantAuth } from "@/lib/security";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireTenantAuth(req, { allowedRoles: ["owner", "admin", "member"] });
  if (!access.ok) return access.response;

  const { id } = await context.params;
  const body = await req.json();
  const updated = updateProductForOrg(access.ctx.orgId, id, body);
  if (!updated) {
    return NextResponse.json({ error: "Catalog item not found" }, { status: 404 });
  }
  return NextResponse.json({ product: updated });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireTenantAuth(req, { allowedRoles: ["owner", "admin"] });
  if (!access.ok) return access.response;

  const { id } = await context.params;
  const ok = deleteProductForOrg(access.ctx.orgId, id);
  if (!ok) {
    return NextResponse.json({ error: "Catalog item not found" }, { status: 404 });
  }
  return NextResponse.json({ deleted: true, id });
}
