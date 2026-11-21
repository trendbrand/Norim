import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth";
import { requireTenantAuth } from "@/lib/security";
import { deleteOrganizationAndData } from "@/lib/db-store";

export async function DELETE(req: NextRequest) {
  const access = await requireTenantAuth(req, { allowApiKey: false, allowedRoles: ["owner"] });
  if (!access.ok) return access.response;

  const confirm = req.nextUrl.searchParams.get("confirm");
  if (confirm !== "DELETE_MY_WORKSPACE") {
    return NextResponse.json(
      { error: "Pass ?confirm=DELETE_MY_WORKSPACE to confirm permanent GDPR Art. 17 erasure." },
      { status: 400 }
    );
  }

  deleteOrganizationAndData(access.ctx.orgId);

  const res = NextResponse.json({
    deleted: true,
    gdprArticle: "Art. 17 GDPR — Right to Erasure",
  });

  res.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return res;
}
