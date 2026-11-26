/**
 * Daily billing lifecycle (runs in-process via the server boot hook):
 *   - Day 13 (trial ends in <=2 days) -> reminder email
 *   - Day 15 (trial ended, no paid plan) -> SUSPEND (locked, data safe) + email
 *   - Paid renewal failed -> 5-day grace (set by the Paddle webhook); when grace
 *     expires -> SUSPEND + email
 * Suspension never deletes data; the customer restores access by choosing/paying
 * a plan (see reactivateOrgSubscription + the suspended gate in security.ts).
 */

import { dispatchTransactionalEmail } from "./email-dispatcher";
import {
  listSubscriptionsForLifecycle,
  markTrialReminderSent,
  suspendOrgSubscription,
} from "./db-store";

const DAY_MS = 86_400_000;

function daysUntil(iso: string | null): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return Number.POSITIVE_INFINITY;
  return Math.ceil((ms - Date.now()) / DAY_MS);
}

function appUrl(path: string): string {
  const d = process.env.APP_DOMAIN?.trim();
  const base = d ? `https://${d.replace(/^https?:\/\//, "").replace(/\/$/, "")}` : process.env.NEXT_PUBLIC_APP_URL || "https://norminvoice.eu";
  return `${base}${path}`;
}

async function email(to: string, subject: string, html: string): Promise<void> {
  if (!to) return;
  try {
    await dispatchTransactionalEmail({ to, subject, html });
  } catch {
    /* best-effort; a failed notification never blocks a lifecycle transition */
  }
}

export async function runBillingLifecycle(): Promise<{ reminders: number; suspended: number }> {
  let reminders = 0;
  let suspended = 0;
  const today = new Date().toISOString().slice(0, 10);
  const billingLink = appUrl("/settings?tab=billing");

  for (const s of listSubscriptionsForLifecycle()) {
    try {
      // 1. Trialing subscription
      if (s.planTier === "trial" && s.status === "trialing" && s.trialEndsAt) {
        const d = daysUntil(s.trialEndsAt);
        if (d <= 0) {
          suspendOrgSubscription(s.orgId);
          suspended++;
          await email(
            s.ownerEmail,
            "Your NormInvoice trial has ended — choose a plan",
            `<p>Hello,</p><p>Your 15-day NormInvoice trial for <strong>${s.orgName}</strong> has ended, so the workspace is now paused. <strong>Your data is safe.</strong></p><p>Choose a plan to restore full access:</p><p><a href="${billingLink}">Choose your plan</a></p>`
          );
        } else if (d <= 2 && s.lastReminderAt !== today) {
          markTrialReminderSent(s.orgId);
          reminders++;
          await email(
            s.ownerEmail,
            `Your NormInvoice trial ends in ${d} day${d === 1 ? "" : "s"}`,
            `<p>Hello,</p><p>Your NormInvoice trial for <strong>${s.orgName}</strong> ends in <strong>${d} day${d === 1 ? "" : "s"}</strong>. To keep access after it ends, pick a plan now:</p><p><a href="${billingLink}">Choose your plan</a></p><p style="font-size:12px;color:#64748b;">If you do nothing, the workspace pauses when the trial ends — your data stays safe and you can reactivate anytime.</p>`
          );
        }
      }

      // 2. Paid renewal that failed: grace window expired -> suspend
      if (s.status === "past_due" && s.graceUntil && daysUntil(s.graceUntil) <= 0) {
        suspendOrgSubscription(s.orgId);
        suspended++;
        await email(
          s.ownerEmail,
          "Your NormInvoice account is now paused",
          `<p>Hello,</p><p>Payment for <strong>${s.orgName}</strong> wasn't completed within the 5-day grace period, so the workspace is now paused. <strong>Your data is safe.</strong></p><p>Update your payment to restore access:</p><p><a href="${billingLink}">Restore access</a></p>`
        );
      }
    } catch {
      /* continue with the next subscription */
    }
  }
  return { reminders, suspended };
}

interface BillingGlobal {
  __niBillingTimer?: NodeJS.Timeout;
  __niBillingRunning?: boolean;
}

/** Start the hourly lifecycle check (idempotent; emails are deduped per day). */
export function ensureBillingSchedulerStarted(): void {
  if (process.env.BILLING_LIFECYCLE === "false") return;
  const g = globalThis as unknown as BillingGlobal;
  if (g.__niBillingTimer) return;
  const run = () => {
    if (g.__niBillingRunning) return;
    g.__niBillingRunning = true;
    void runBillingLifecycle().finally(() => {
      g.__niBillingRunning = false;
    });
  };
  setTimeout(run, 30_000); // shortly after boot
  g.__niBillingTimer = setInterval(run, 60 * 60 * 1000); // hourly
  if (typeof g.__niBillingTimer.unref === "function") g.__niBillingTimer.unref();
}
