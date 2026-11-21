-- ============================================================================
-- NormInvoice PostgreSQL 16 Migration 0001: Multi-Tenant RLS + GoBD Audit Trail
-- EU Data Residency (Germany) | BEG IV 8-Year / France 10-Year Archiving
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS organizations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    slug            TEXT UNIQUE NOT NULL,
    default_locale  TEXT NOT NULL DEFAULT 'de' CHECK (default_locale IN ('de', 'fr', 'en')),
    retention_years SMALLINT NOT NULL DEFAULT 8 CHECK (retention_years IN (8, 10)),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT UNIQUE NOT NULL,
    password_hash   TEXT,
    full_name       TEXT,
    email_verified  BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS memberships (
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role            TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'accountant', 'member')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (org_id, user_id)
);

CREATE TABLE IF NOT EXISTS seller_profiles (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id                  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    legal_name              TEXT NOT NULL,
    trading_name            TEXT,
    country_code            CHAR(2) NOT NULL DEFAULT 'DE',
    street                  TEXT NOT NULL,
    postal_code             TEXT NOT NULL,
    city                    TEXT NOT NULL,
    vat_id                  TEXT,
    tax_number              TEXT,
    siren_number            TEXT,
    is_kleinunternehmer     BOOLEAN NOT NULL DEFAULT false,
    electronic_address      TEXT NOT NULL,
    electronic_scheme_id    TEXT NOT NULL DEFAULT 'EM',
    contact_name            TEXT NOT NULL,
    contact_email           TEXT NOT NULL,
    contact_phone           TEXT NOT NULL,
    iban                    TEXT,
    bic                     TEXT,
    default_format          TEXT NOT NULL DEFAULT 'ZUGFERD_EN16931',
    accountant_cc_email     TEXT,
    is_default              BOOLEAN NOT NULL DEFAULT true,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS integrations (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id                  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    provider                TEXT NOT NULL CHECK (provider IN ('stripe', 'woocommerce', 'custom_smtp')),
    status                  TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
    external_account_id     TEXT,
    encrypted_credentials   BYTEA NOT NULL,
    kms_key_version         SMALLINT NOT NULL DEFAULT 1,
    webhook_secret_enc      BYTEA,
    config_json             JSONB NOT NULL DEFAULT '{}'::jsonb,
    last_synced_at          TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (org_id, provider, external_account_id)
);

CREATE TABLE IF NOT EXISTS invoices (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id                  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    seller_profile_id       UUID NOT NULL REFERENCES seller_profiles(id),
    idempotency_key         TEXT NOT NULL,
    source                  TEXT NOT NULL CHECK (source IN ('stripe', 'woocommerce', 'api', 'manual', 'csv')),
    source_ref              TEXT,
    invoice_number          TEXT NOT NULL,
    type_code               SMALLINT NOT NULL DEFAULT 380 CHECK (type_code IN (380, 381)),
    issue_date              DATE NOT NULL,
    currency                CHAR(3) NOT NULL DEFAULT 'EUR',
    net_amount_cents        BIGINT NOT NULL,
    tax_amount_cents        BIGINT NOT NULL,
    gross_amount_cents      BIGINT NOT NULL,
    buyer_name              TEXT NOT NULL,
    buyer_country           CHAR(2) NOT NULL,
    buyer_vat_id            TEXT,
    buyer_vat_status        TEXT CHECK (buyer_vat_status IN ('VERIFIED', 'PROVISIONAL', 'INVALID', 'NOT_APPLICABLE')),
    target_format           TEXT NOT NULL,
    status                  TEXT NOT NULL DEFAULT 'QUEUED',
    canonical_payload       JSONB NOT NULL,
    validation_passed       BOOLEAN NOT NULL DEFAULT false,
    validation_errors       JSONB NOT NULL DEFAULT '[]'::jsonb,
    verapdf_passed          BOOLEAN,
    pdf_object_key          TEXT,
    xml_object_key          TEXT,
    kosit_report_key        TEXT,
    sha256_pdf              CHAR(64),
    sha256_xml              CHAR(64),
    delivered_to_email      TEXT,
    delivered_at            TIMESTAMPTZ,
    archive_locked_until    DATE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (org_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_invoices_org_status ON invoices(org_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_org_date   ON invoices(org_id, issue_date DESC);

CREATE TABLE IF NOT EXISTS invoice_audit_events (
    id              BIGSERIAL PRIMARY KEY,
    org_id          UUID NOT NULL REFERENCES organizations(id),
    invoice_id      UUID NOT NULL REFERENCES invoices(id),
    event_type      TEXT NOT NULL,
    actor_type      TEXT NOT NULL CHECK (actor_type IN ('system', 'user', 'webhook', 'api_key')),
    actor_id        TEXT,
    payload_json    JSONB NOT NULL DEFAULT '{}'::jsonb,
    prev_hash       CHAR(64) NOT NULL,
    event_hash      CHAR(64) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- GoBD Immutability Enforcement Trigger (blocks UPDATE and DELETE)
CREATE OR REPLACE FUNCTION prevent_gobd_audit_mutation() RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'GoBD Compliance Violation: invoice_audit_events is strictly append-only.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_no_update_delete ON invoice_audit_events;
CREATE TRIGGER trg_audit_no_update_delete
BEFORE UPDATE OR DELETE ON invoice_audit_events
FOR EACH ROW EXECUTE FUNCTION prevent_gobd_audit_mutation();

CREATE TABLE IF NOT EXISTS vies_cache (
    country_code        CHAR(2) NOT NULL,
    vat_number          TEXT NOT NULL,
    status              TEXT NOT NULL CHECK (status IN ('VERIFIED', 'INVALID', 'PROVISIONAL')),
    trader_name         TEXT,
    trader_address      TEXT,
    vies_request_id     TEXT,
    checked_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at          TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (country_code, vat_number)
);

CREATE TABLE IF NOT EXISTS api_keys (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    key_prefix      TEXT NOT NULL,
    key_hash        CHAR(64) UNIQUE NOT NULL,
    scopes          TEXT[] NOT NULL DEFAULT ARRAY['invoices:write', 'invoices:read', 'validate:run'],
    last_used_at    TIMESTAMPTZ,
    revoked_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscriptions (
    org_id                  UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
    paddle_customer_id      TEXT UNIQUE,
    paddle_subscription_id  TEXT UNIQUE,
    plan_tier               TEXT NOT NULL DEFAULT 'free' CHECK (plan_tier IN ('free', 'solo', 'business', 'agency')),
    status                  TEXT NOT NULL DEFAULT 'active',
    monthly_invoice_quota   INTEGER NOT NULL DEFAULT 3,
    current_period_start    TIMESTAMPTZ,
    current_period_end      TIMESTAMPTZ,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- Multi-Tenant Row-Level Security (RLS) Policies
-- Application sets: SET LOCAL app.current_org_id = '<uuid>';
-- ============================================================================
ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_seller_profiles ON seller_profiles
    USING (org_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);

CREATE POLICY tenant_isolation_integrations ON integrations
    USING (org_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);

CREATE POLICY tenant_isolation_invoices ON invoices
    USING (org_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);

CREATE POLICY tenant_isolation_audit_events ON invoice_audit_events
    USING (org_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);

CREATE POLICY tenant_isolation_api_keys ON api_keys
    USING (org_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);

CREATE POLICY tenant_isolation_subscriptions ON subscriptions
    USING (org_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
