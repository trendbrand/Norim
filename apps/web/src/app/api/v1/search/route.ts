import { NextRequest, NextResponse } from "next/server";
import { searchOrgWorkspace } from "@/lib/db-store";
import { requireTenantAuth } from "@/lib/security";

export async function GET(req: NextRequest) {
  const access = await requireTenantAuth(req);
  if (!access.ok) return access.response;

  const q = req.nextUrl.searchParams.get("q") || "";
  return NextResponse.json(searchOrgWorkspace(access.ctx.orgId, q));
}
