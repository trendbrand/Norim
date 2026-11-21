import { NextRequest, NextResponse } from "next/server";
import { createProductForOrg, listProductsForOrg } from "@/lib/db-store";
import { requireTenantAuth } from "@/lib/security";

export async function GET(req: NextRequest) {
  const access = await requireTenantAuth(req);
  if (!access.ok) return access.response;

  return NextResponse.json({ products: listProductsForOrg(access.ctx.orgId) });
}

export async function POST(req: NextRequest) {
  const access = await requireTenantAuth(req, { allowedRoles: ["owner", "admin", "member", "api_key"] });
  if (!access.ok) return access.response;

  try {
    const body = await req.json();
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Product or service name is required." }, { status: 400 });
    }
    const product = createProductForOrg(access.ctx.orgId, {
      sku: body.sku || "",
      name: body.name,
      description: body.description || "",
      unitCode: body.unitCode || "HUR",
      unitPrice: Number(body.unitPrice) || 0,
      vatCategory: body.vatCategory || "S",
      vatRate: Number(body.vatRate ?? 19),
    });
    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create catalog item" },
      { status: 400 }
    );
  }
}
