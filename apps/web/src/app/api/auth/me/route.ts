import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { getOrgById, getSubscriptionForOrg } from "@/lib/db-store";
import { getOrgMonthlyQuotaStatus } from "@/lib/quota";
import { isSuperAdminEmail } from "@/lib/security";

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  const org = getOrgById(session.orgId);
  if (!org) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  const subscription = getSubscriptionForOrg(session.orgId);
  const quota = getOrgMonthlyQuotaStatus(session.orgId);

  return NextResponse.json({
    authenticated: true,
    onboardingCompleted: org.onboardingCompleted,
    isSuperAdmin: isSuperAdminEmail(session.email),
    user: {
      id: session.userId,
      orgId: session.orgId,
      email: session.email,
      fullName: session.fullName,
      orgName: org.name,
      role: session.role,
    },
    subscription,
    quota,
  });
}
