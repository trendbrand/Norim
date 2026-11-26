/**
 * Next.js server boot hook. Runs once per server process on startup, so the
 * in-process automation (recurring-invoice scheduler, and later the billing
 * lifecycle checks) starts reliably after every deploy/restart — without waiting
 * for a user to first open the /recurring page.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    const { ensureRecurringSchedulerStarted } = await import("./lib/recurring-scheduler");
    ensureRecurringSchedulerStarted();
  } catch (err) {
    console.error("Failed to start recurring scheduler on boot:", err);
  }
}
