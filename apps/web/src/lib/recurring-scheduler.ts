/**
 * Automatic recurring-invoice scheduler (Master Plan F02 / F08).
 *
 * The manual "Run now" already issues a real sequential invoice and advances the
 * schedule. This drains schedules that have become DUE (active + next_run_date <=
 * today) so recurring billing actually recurs without a human clicking — issuing
 * one invoice per due schedule and advancing the next run date (no backfill of
 * missed periods). Quota is respected: an org at its monthly limit is skipped,
 * not failed. Runs in-process (single-node), like the transmission outbox; on
 * AWS this moves to a scheduled worker draining the same query.
 *
 * Opt out with RECURRING_AUTORUN=false (manual-only).
 */

import { getOrgMonthlyQuotaStatus } from "./quota";
import { listDueRecurringSchedules, runRecurringScheduleNow } from "./db-store";

const INTERVAL_MS = Math.max(1000, Number(process.env.RECURRING_INTERVAL_MS) || 60_000); // default: every minute

export function runDueRecurringSchedules(): { ran: number; skippedQuota: number; errors: number } {
  let ran = 0;
  let skippedQuota = 0;
  let errors = 0;
  for (const { id, orgId } of listDueRecurringSchedules()) {
    try {
      if (getOrgMonthlyQuotaStatus(orgId).remaining <= 0) {
        skippedQuota++;
        continue;
      }
      const res = runRecurringScheduleNow(orgId, id, "system@recurring-scheduler");
      if (res) ran++;
    } catch (err) {
      errors++;
      console.error(
        JSON.stringify({
          level: "error",
          msg: "recurring_run_error",
          scheduleId: id,
          error: err instanceof Error ? err.message : String(err),
        })
      );
    }
  }
  return { ran, skippedQuota, errors };
}

interface SchedGlobal {
  __niRecurringTimer?: NodeJS.Timeout;
  __niRecurringRunning?: boolean;
}

/** Start the background scheduler once per process (idempotent, unref'd). */
export function ensureRecurringSchedulerStarted(): void {
  if (process.env.RECURRING_AUTORUN === "false") return;
  const g = globalThis as unknown as SchedGlobal;
  if (g.__niRecurringTimer) return;
  g.__niRecurringTimer = setInterval(() => {
    if (g.__niRecurringRunning) return;
    g.__niRecurringRunning = true;
    try {
      runDueRecurringSchedules();
    } finally {
      g.__niRecurringRunning = false;
    }
  }, INTERVAL_MS);
  if (typeof g.__niRecurringTimer.unref === "function") g.__niRecurringTimer.unref();
}
