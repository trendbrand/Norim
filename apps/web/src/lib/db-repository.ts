import { Pool } from "pg";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";

/**
 * Production PostgreSQL 16 Multi-Tenant RLS Repository Helper.
 *
 * When DATABASE_URL is configured, wraps tenant queries in a transaction with:
 *   SET LOCAL app.current_org_id = '<uuid>';
 * enforcing PostgreSQL Row-Level Security isolation across seller_profiles,
 * integrations, invoices, invoice_audit_events, api_keys, and subscriptions.
 *
 * When DATABASE_URL is absent (local zero-Docker mode), isPostgresConfigured() returns false
 * and routes gracefully fall back to the deterministic workspace store.
 */

const globalPg = globalThis as unknown as {
  __normInvoicePool?: Pool;
};

export function isPostgresConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  return Boolean(url && !url.includes("change_me_strong_password"));
}

export function getPgPool(): Pool | null {
  if (!isPostgresConfigured()) return null;
  if (!globalPg.__normInvoicePool) {
    globalPg.__normInvoicePool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 15,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
  }
  return globalPg.__normInvoicePool;
}

export async function withTenantRlsTransaction<T>(
  orgId: string,
  fn: (tx: NodePgDatabase) => Promise<T>
): Promise<T | null> {
  const pool = getPgPool();
  if (!pool) return null;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Enforce PostgreSQL RLS policy scoping strictly to this transaction
    await client.query("SELECT set_config('app.current_org_id', $1, true)", [orgId]);
    const db = drizzle(client);
    const result = await fn(db);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function pingPostgresHealth(): Promise<{ connected: boolean; latencyMs?: number; mode: "postgres-rls" | "memory-sandbox" }> {
  const pool = getPgPool();
  if (!pool) {
    return { connected: false, mode: "memory-sandbox" };
  }
  const start = Date.now();
  try {
    const db = drizzle(pool);
    await db.execute(sql`SELECT 1`);
    return { connected: true, latencyMs: Date.now() - start, mode: "postgres-rls" };
  } catch {
    return { connected: false, mode: "memory-sandbox" };
  }
}
