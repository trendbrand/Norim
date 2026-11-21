import { NextResponse } from "next/server";
import { countMonthlyInvoicesForOrg, getSubscriptionForOrg } from "./db-store";

export interface QuotaStatus {
  tier: string;
  monthlyLimit: number;
  usedThisMonth: number;
  remaining: number;
  exceeded: boolean;
}

export function getOrgMonthlyQuotaStatus(orgId: string): QuotaStatus {
  const sub = getSubscriptionForOrg(orgId);
  const usedThisMonth = countMonthlyInvoicesForOrg(orgId);
  const remaining = Math.max(0, sub.monthlyQuota - usedThisMonth);
  return {
    tier: sub.planTier,
    monthlyLimit: sub.monthlyQuota,
    usedThisMonth,
    remaining,
    exceeded: usedThisMonth >= sub.monthlyQuota,
  };
}

export function enforceOrgMonthlyQuota(
  orgId: string,
  additionalCount = 1
): { allowed: true; status: QuotaStatus } | { allowed: false; response: NextResponse } {
  const status = getOrgMonthlyQuotaStatus(orgId);
  if (status.usedThisMonth + additionalCount > status.monthlyLimit) {
    return {
      allowed: false,
      response: NextResponse.json(
        {
          type: "https://norminvoice.eu/problems/quota-exceeded",
          title: "Monthly E-Invoice Quota Reached",
          status: 402,
          detail: `Your ${status.tier.toUpperCase()} plan allows ${status.monthlyLimit} finalized e-invoices per month (${status.usedThisMonth} used). Upgrade your plan in Settings -> Billing to issue more.`,
          upgradeUrl: "/settings?tab=billing",
          quota: status,
        },
        { status: 402 }
      ),
    };
  }
  return { allowed: true, status };
}
