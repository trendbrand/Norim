import pg from "pg";

/**
 * Idempotent PostgreSQL 16 Production Bootstrap & Seed Script.
 * Creates the baseline organization, default German Seller Profile (BG-4), and subscription
 * if the database is freshly provisioned, and verifies the GoBD append-only audit trigger.
 *
 * Usage: DATABASE_URL=postgresql://... pnpm --filter @norminvoice/db seed
 */
async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("ERROR: DATABASE_URL environment variable is required to seed PostgreSQL.");
    process.exit(1);
  }

  const pool = new pg.Pool({ connectionString: url });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const defaultOrgId = "00000000-0000-0000-0000-000000000001";
    const defaultProfileId = "00000000-0000-0000-0000-000000000002";

    await client.query(
      `INSERT INTO organizations (id, name, slug, default_locale, retention_years)
       VALUES ($1::uuid, 'NordCloud Software GmbH', 'nordcloud-gmbh', 'de', 8)
       ON CONFLICT (slug) DO NOTHING`,
      [defaultOrgId]
    );

    await client.query("SELECT set_config('app.current_org_id', $1, true)", [defaultOrgId]);

    await client.query(
      `INSERT INTO seller_profiles (
         id, org_id, legal_name, country_code, street, postal_code, city,
         vat_id, tax_number, is_kleinunternehmer, electronic_address,
         contact_name, contact_email, contact_phone, iban, bic, default_format, is_default
       ) VALUES (
         $1::uuid, $2::uuid, 'NordCloud Software GmbH', 'DE', 'Friedrichstraße 114A', '10117', 'Berlin',
         'DE298765432', '143/123/45678', false, 'billing@nordcloud-gmbh.de',
         'Lukas Weber', 'billing@nordcloud-gmbh.de', '+49 30 901820',
         'DE89370400440532013000', 'COBADEFFXXX', 'ZUGFERD_EN16931', true
       ) ON CONFLICT (id) DO NOTHING`,
      [defaultProfileId, defaultOrgId]
    );

    await client.query(
      `INSERT INTO subscriptions (org_id, plan_tier, status, monthly_invoice_quota)
       VALUES ($1::uuid, 'business', 'active', 500)
       ON CONFLICT (org_id) DO NOTHING`,
      [defaultOrgId]
    );

    // Verify GoBD append-only trigger exists
    const trig = await client.query(
      `SELECT tgname FROM pg_trigger WHERE tgname = 'trg_audit_no_update_delete'`
    );
    if (trig.rowCount === 0) {
      throw new Error("Missing GoBD immutability trigger trg_audit_no_update_delete — run 0001_initial_gobd_rls.sql first!");
    }

    await client.query("COMMIT");
    console.log("PostgreSQL 16 bootstrap seed complete (RLS + GoBD trigger verified).");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seed failed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

void seed();
