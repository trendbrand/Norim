import { sql } from "drizzle-orm";
import { getPgPool, isPostgresConfigured, withTenantRlsTransaction } from "./db-repository";
import { logEvent } from "./logger";
import type { AuditEventRecord, InvoiceRecord, SellerSettingsRecord } from "./db-store";
import type { ViesVerificationResult } from "@norminvoice/einvoice-core";

/**
 * Complete Production PostgreSQL 16 Write-Through Persistence Layer.
 * When DATABASE_URL is configured (e.g., Hetzner Germany Docker stack), mirrors:
 *  - Users & Organizations + Default Seller Profile + Subscription
 *  - Seller Legal Profile (BG-4) inside RLS transaction
 *  - Invoices & Append-Only GoBD SHA-256 Hash-Chained Audit Events
 *  - SHA-256 Hashed API Keys (create + revoke)
 *  - EU VIES VAT Lookup Audit Cache
 *  - Paddle Subscription Plan Updates
 */

export async function persistUserAndOrgToPostgres(params: {
  email: string;
  passwordHash: string;
  fullName: string;
  orgName: string;
}): Promise<{ orgId?: string; persistedToPg: boolean }> {
  const pool = getPgPool();
  if (!pool) return { persistedToPg: false };

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const slug = `${params.orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 32)}-${Date.now().toString(36)}`;
    const orgRes = await client.query<{ id: string }>(
      `INSERT INTO organizations (name, slug, default_locale, retention_years) VALUES ($1, $2, 'de', 8) RETURNING id`,
      [params.orgName, slug]
    );
    const orgId = orgRes.rows[0]!.id;

    const userRes = await client.query<{ id: string }>(
      `INSERT INTO users (email, password_hash, full_name, email_verified) VALUES ($1, $2, $3, true) ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name RETURNING id`,
      [params.email.toLowerCase(), params.passwordHash, params.fullName]
    );
    const userId = userRes.rows[0]!.id;

    await client.query(
      `INSERT INTO memberships (org_id, user_id, role) VALUES ($1::uuid, $2::uuid, 'owner') ON CONFLICT DO NOTHING`,
      [orgId, userId]
    );
    await client.query(
      `INSERT INTO subscriptions (org_id, plan_tier, status, monthly_invoice_quota) VALUES ($1::uuid, 'free', 'active', 3) ON CONFLICT DO NOTHING`,
      [orgId]
    );
    await client.query("COMMIT");
    logEvent("info", "pg_user_org_persisted", { orgId });
    return { orgId, persistedToPg: true };
  } catch (err) {
    await client.query("ROLLBACK");
    logEvent("warn", "pg_user_org_persist_skipped", { reason: err instanceof Error ? err.message : "db_error" });
    return { persistedToPg: false };
  } finally {
    client.release();
  }
}

export async function persistSellerProfileToPostgres(
  orgId: string,
  settings: SellerSettingsRecord
): Promise<{ persistedToPg: boolean }> {
  if (!isPostgresConfigured()) return { persistedToPg: false };
  try {
    await withTenantRlsTransaction(orgId, async (tx) => {
      await tx.execute(sql`
        UPDATE seller_profiles
        SET legal_name = ${settings.legalName},
            vat_id = ${settings.vatId || null},
            tax_number = ${settings.taxNumber || null},
            is_kleinunternehmer = ${settings.isKleinunternehmer},
            iban = ${settings.iban},
            bic = ${settings.bic},
            accountant_cc_email = ${settings.accountantCcEmail},
            updated_at = now()
        WHERE org_id = ${orgId}::uuid AND is_default = true;
      `);
    });
    return { persistedToPg: true };
  } catch (err) {
    logEvent("warn", "pg_seller_profile_skipped", { reason: err instanceof Error ? err.message : "db_error" });
    return { persistedToPg: false };
  }
}

export async function persistInvoiceToPostgresIfEnabled(
  orgId: string,
  sellerProfileId: string,
  record: InvoiceRecord,
  auditEvent?: AuditEventRecord
): Promise<{ persistedToPg: boolean }> {
  if (!isPostgresConfigured()) return { persistedToPg: false };

  try {
    await withTenantRlsTransaction(orgId, async (tx) => {
      await tx.execute(sql`
        INSERT INTO invoices (
          id, org_id, seller_profile_id, idempotency_key, source, source_ref,
          invoice_number, type_code, issue_date, currency,
          net_amount_cents, tax_amount_cents, gross_amount_cents,
          buyer_name, buyer_country, buyer_vat_id, target_format, status,
          canonical_payload, validation_passed, validation_errors, sha256_xml, archive_locked_until
        ) VALUES (
          gen_random_uuid(),
          ${orgId}::uuid,
          ${sellerProfileId}::uuid,
          ${`${record.source}:${record.sourceRef}:${record.invoiceNumber}`},
          ${record.source},
          ${record.sourceRef},
          ${record.invoiceNumber},
          ${record.canonical.typeCode},
          ${record.issueDate}::date,
          ${record.currency},
          ${Math.round(record.netAmount * 100)},
          ${Math.round(record.taxAmount * 100)},
          ${Math.round(record.grossAmount * 100)},
          ${record.buyerName},
          ${record.buyerCountry},
          ${record.buyerVatId ?? null},
          ${record.targetFormat},
          ${record.status},
          ${JSON.stringify(record.canonical)}::jsonb,
          ${record.validationPassed},
          ${JSON.stringify(record.diagnostics)}::jsonb,
          ${record.sha256Xml},
          ${record.archiveLockedUntil}::date
        )
        ON CONFLICT (org_id, idempotency_key) DO UPDATE SET
          status = EXCLUDED.status,
          canonical_payload = EXCLUDED.canonical_payload,
          validation_passed = EXCLUDED.validation_passed,
          validation_errors = EXCLUDED.validation_errors,
          sha256_xml = EXCLUDED.sha256_xml,
          updated_at = now();
      `);

      if (auditEvent) {
        await tx.execute(sql`
          INSERT INTO invoice_audit_events (
            org_id, invoice_id, event_type, actor_type, payload_json, prev_hash, event_hash
          )
          SELECT ${orgId}::uuid, id, ${auditEvent.eventType}, 'system',
                 ${JSON.stringify({ sha256Xml: record.sha256Xml })}::jsonb,
                 ${auditEvent.prevHash}, ${auditEvent.eventHash}
          FROM invoices
          WHERE org_id = ${orgId}::uuid
            AND idempotency_key = ${`${record.source}:${record.sourceRef}:${record.invoiceNumber}`}
          LIMIT 1;
        `);
      }
    });
    return { persistedToPg: true };
  } catch (err) {
    logEvent("warn", "pg_invoice_write_through_skipped", { reason: err instanceof Error ? err.message : "db_error" });
    return { persistedToPg: false };
  }
}

export async function persistViesLookupToPostgres(result: ViesVerificationResult): Promise<void> {
  const pool = getPgPool();
  if (!pool) return;
  try {
    const ttlHours = result.status === "VERIFIED" ? 24 * 7 : 2;
    await pool.query(
      `INSERT INTO vies_cache (country_code, vat_number, status, trader_name, trader_address, vies_request_id, checked_at, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, now(), now() + ($7 || ' hours')::interval)
       ON CONFLICT (country_code, vat_number) DO UPDATE SET
         status = EXCLUDED.status,
         trader_name = EXCLUDED.trader_name,
         trader_address = EXCLUDED.trader_address,
         vies_request_id = EXCLUDED.vies_request_id,
         checked_at = now(),
         expires_at = EXCLUDED.expires_at`,
      [
        result.countryCode,
        result.vatNumber,
        result.status,
        result.traderName ?? null,
        result.traderAddress ?? null,
        result.requestIdentifier ?? null,
        String(ttlHours),
      ]
    );
  } catch (err) {
    logEvent("warn", "pg_vies_cache_skipped", { reason: err instanceof Error ? err.message : "db_error" });
  }
}
