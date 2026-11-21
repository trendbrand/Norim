import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  CanonicalInvoice,
  GOLDEN_FIXTURES,
  ValidationDiagnostic,
  computeCanonicalTotals,
  serializeToCiiXml,
  serializeToUblXml,
  validateCanonicalInvoice,
} from "@norminvoice/einvoice-core";

/**
 * Production Persistent Multi-Tenant SQLite Store (built-in Node.js node:sqlite)
 * - 100% persistent across server restarts (data/norminvoice.sqlite)
 * - Strict org_id multi-tenant scoping on EVERY query & mutation
 * - AES-256-GCM encryption at rest for Stripe/WooCommerce/SMTP secrets
 * - Tamper-evident GoBD SHA-256 hash chain per organization
 */

export interface OrgRecord {
  id: string;
  name: string;
  slug: string;
  onboardingCompleted: boolean;
  defaultLocale: "de" | "fr" | "en";
  retentionYears: 8 | 10;
  createdAt: string;
}

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  createdAt: string;
}

export interface MembershipRecord {
  orgId: string;
  userId: string;
  email: string;
  fullName: string;
  role: "owner" | "admin" | "accountant" | "member";
  createdAt: string;
}

export interface SellerSettingsRecord {
  orgId: string;
  legalName: string;
  tradingName: string;
  managingDirector: string;
  registrationId: string;
  countryCode: string;
  street: string;
  postalCode: string;
  city: string;
  vatId: string;
  vatVerifiedAt: string | null;
  taxNumber: string;
  isKleinunternehmer: boolean;
  electronicAddress: string;
  electronicSchemeId: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  logoDataUrl: string;
  invoicePrefix: string;
  creditNotePrefix: string;
  nextInvoiceSeq: number;
  defaultFormat: CanonicalInvoice["profile"];
  defaultLocale: "de" | "fr" | "en";
  defaultDueDays: number;
  defaultPaymentTerms: string;
  defaultNotes: string;
  iban: string;
  bic: string;
  accountHolder: string;
  accountantCcEmail: string;
  retentionYears: 8 | 10;
  updatedAt: string;
}

export interface CustomerRecord {
  id: string;
  orgId: string;
  legalName: string;
  vatId: string;
  vatStatus: "VERIFIED" | "PROVISIONAL" | "INVALID" | "UNCHECKED";
  vatCheckedAt: string | null;
  leitwegId: string;
  electronicAddress: string;
  street: string;
  postalCode: string;
  city: string;
  countryCode: string;
  defaultFormat: CanonicalInvoice["profile"];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceRecord {
  id: string;
  orgId: string;
  customerId: string | null;
  source: "stripe" | "woocommerce" | "api" | "manual" | "csv";
  sourceRef: string;
  invoiceNumber: string;
  typeCode: 380 | 381;
  precedingInvoiceNumber: string | null;
  issueDate: string;
  dueDate: string | null;
  currency: string;
  netAmount: number;
  taxAmount: number;
  grossAmount: number;
  buyerName: string;
  buyerCountry: string;
  buyerVatId: string | null;
  targetFormat: CanonicalInvoice["profile"];
  status: "DRAFT" | "VALIDATED" | "DELIVERED" | "ACTION_REQUIRED";
  validationPassed: boolean;
  diagnostics: ValidationDiagnostic[];
  sha256Xml: string;
  archiveLockedUntil: string;
  deliveredTo: string | null;
  deliveredAt: string | null;
  paymentStatus: "UNPAID" | "PAID";
  paidAt: string | null;
  canonical: CanonicalInvoice;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRecord {
  id: string;
  orgId: string;
  sku: string;
  name: string;
  description: string;
  unitCode: string;
  unitPrice: number;
  vatCategory: "S" | "AE" | "E" | "Z" | "G" | "K" | "O";
  vatRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface IncomingInvoiceRecord {
  id: string;
  orgId: string;
  filename: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string | null;
  sellerName: string;
  sellerVatId: string | null;
  sellerCountry: string;
  currency: string;
  netAmount: number;
  taxAmount: number;
  grossAmount: number;
  detectedStandard: string;
  validationPassed: boolean;
  diagnostics: ValidationDiagnostic[];
  paymentStatus: "UNPAID" | "PAID";
  paidAt: string | null;
  sha256Xml: string;
  archiveLockedUntil: string;
  canonical: CanonicalInvoice;
  createdAt: string;
}

export interface IntegrationConfigRecord {
  provider: "stripe" | "woocommerce" | "smtp" | "outbound_webhook";
  enabled: boolean;
  secretMasked: string;
  hasSecret: boolean;
  config: Record<string, unknown>;
  lastEventAt: string | null;
  updatedAt: string;
}

export interface WebhookLogRecord {
  id: number;
  orgId: string;
  provider: string;
  eventType: string;
  statusCode: number;
  summary: string;
  createdAt: string;
}

export interface ApiKeyPublicRecord {
  id: string;
  orgId: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

export interface SubscriptionRecord {
  orgId: string;
  planTier: "free" | "solo" | "business" | "agency";
  status: string;
  monthlyQuota: number;
  billingEmail: string;
  updatedAt: string;
}

export interface AuditEventRecord {
  id: number;
  orgId: string;
  invoiceId: string | null;
  invoiceNumber: string;
  eventType: string;
  actorEmail: string;
  payloadJson: string;
  prevHash: string;
  eventHash: string;
  createdAt: string;
}

const DEV_ENC_KEY_FALLBACK =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

function getEncKey(): Buffer {
  const hex = process.env.APP_ENCRYPTION_KEY_HEX;
  if (hex && /^[0-9a-fA-F]{64}$/.test(hex) && hex !== DEV_ENC_KEY_FALLBACK) {
    return Buffer.from(hex, "hex");
  }
  // Fail-fast in production: never encrypt tenant secrets-at-rest with a world-known key.
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "FATAL: APP_ENCRYPTION_KEY_HEX must be a fresh 64-char hex key (openssl rand -hex 32) in production."
    );
  }
  return Buffer.from(DEV_ENC_KEY_FALLBACK, "hex");
}

export function encryptField(plain: string): string {
  if (!plain) return "";
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decryptField(b64: string | null | undefined): string {
  if (!b64) return "";
  try {
    const buf = Buffer.from(b64, "base64");
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const enc = buf.subarray(28);
    const decipher = crypto.createDecipheriv("aes-256-gcm", getEncKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
  } catch {
    return "";
  }
}

export function hashPasswordScrypt(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPasswordScrypt(password: string, storedHash: string): boolean {
  const [salt, keyHex] = storedHash.split(":");
  if (!salt || !keyHex) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(keyHex, "hex");
  if (derived.length !== keyBuf.length) return false;
  return crypto.timingSafeEqual(derived, keyBuf);
}

/**
 * Real ISO 13616 MOD-97 IBAN checksum validator!
 */
export function validateIbanMod97(rawIban: string): boolean {
  const cleaned = rawIban.replace(/\s+/g, "").toUpperCase();
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/.test(cleaned)) return false;
  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);
  let numeric = "";
  for (const ch of rearranged) {
    const code = ch.charCodeAt(0);
    numeric += code >= 65 && code <= 90 ? String(code - 55) : ch;
  }
  let remainder = 0;
  for (let i = 0; i < numeric.length; i += 7) {
    const chunk = String(remainder) + numeric.slice(i, i + 7);
    remainder = Number(chunk) % 97;
  }
  return remainder === 1;
}

function sha256(str: string): string {
  return crypto.createHash("sha256").update(str, "utf8").digest("hex");
}

function maskVal(val: string): string {
  if (!val) return "";
  if (val.length <= 10) return "••••••••";
  return `${val.slice(0, 8)}••••••••${val.slice(-4)}`;
}

function lockDateFromYears(years: number): string {
  const d = new Date();
  d.setUTCFullYear(d.getUTCFullYear() + years);
  return d.toISOString().slice(0, 10);
}

const globalSqlite = globalThis as unknown as {
  __normInvoiceSqlite?: DatabaseSync;
};

function getDb(): DatabaseSync {
  if (globalSqlite.__normInvoiceSqlite) return globalSqlite.__normInvoiceSqlite;

  const dataDir = process.env.SQLITE_DATA_DIR || path.resolve(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });
  const dbPath = path.join(dataDir, "norminvoice.sqlite");

  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");

  db.exec(`
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      onboarding_completed INTEGER NOT NULL DEFAULT 0,
      default_locale TEXT NOT NULL DEFAULT 'de',
      retention_years INTEGER NOT NULL DEFAULT 8,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      session_version INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS memberships (
      org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL DEFAULT 'owner',
      created_at TEXT NOT NULL,
      PRIMARY KEY (org_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS seller_profiles (
      org_id TEXT PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
      legal_name TEXT NOT NULL,
      trading_name TEXT NOT NULL DEFAULT '',
      managing_director TEXT NOT NULL DEFAULT '',
      registration_id TEXT NOT NULL DEFAULT '',
      country_code TEXT NOT NULL DEFAULT 'DE',
      street TEXT NOT NULL DEFAULT '',
      postal_code TEXT NOT NULL DEFAULT '',
      city TEXT NOT NULL DEFAULT '',
      vat_id TEXT NOT NULL DEFAULT '',
      vat_verified_at TEXT,
      tax_number TEXT NOT NULL DEFAULT '',
      is_kleinunternehmer INTEGER NOT NULL DEFAULT 0,
      electronic_address TEXT NOT NULL DEFAULT '',
      electronic_scheme_id TEXT NOT NULL DEFAULT 'EM',
      contact_name TEXT NOT NULL DEFAULT '',
      contact_phone TEXT NOT NULL DEFAULT '',
      contact_email TEXT NOT NULL DEFAULT '',
      logo_data_url TEXT NOT NULL DEFAULT '',
      invoice_prefix TEXT NOT NULL DEFAULT 'RE-2026-',
      credit_note_prefix TEXT NOT NULL DEFAULT 'GS-2026-',
      next_invoice_seq INTEGER NOT NULL DEFAULT 1,
      default_format TEXT NOT NULL DEFAULT 'ZUGFERD_EN16931',
      default_locale TEXT NOT NULL DEFAULT 'de',
      default_due_days INTEGER NOT NULL DEFAULT 14,
      default_payment_terms TEXT NOT NULL DEFAULT 'Zahlbar innerhalb von 14 Tagen ohne Abzug.',
      default_notes TEXT NOT NULL DEFAULT '',
      iban TEXT NOT NULL DEFAULT '',
      bic TEXT NOT NULL DEFAULT '',
      account_holder TEXT NOT NULL DEFAULT '',
      accountant_cc_email TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      legal_name TEXT NOT NULL,
      vat_id TEXT NOT NULL DEFAULT '',
      vat_status TEXT NOT NULL DEFAULT 'UNCHECKED',
      vat_checked_at TEXT,
      leitweg_id TEXT NOT NULL DEFAULT '',
      electronic_address TEXT NOT NULL DEFAULT '',
      street TEXT NOT NULL DEFAULT '',
      postal_code TEXT NOT NULL DEFAULT '',
      city TEXT NOT NULL DEFAULT '',
      country_code TEXT NOT NULL DEFAULT 'DE',
      default_format TEXT NOT NULL DEFAULT 'ZUGFERD_EN16931',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_customers_org ON customers(org_id);

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      customer_id TEXT,
      source TEXT NOT NULL,
      source_ref TEXT NOT NULL,
      invoice_number TEXT NOT NULL,
      type_code INTEGER NOT NULL DEFAULT 380,
      preceding_invoice_number TEXT,
      issue_date TEXT NOT NULL,
      due_date TEXT,
      currency TEXT NOT NULL DEFAULT 'EUR',
      net_amount REAL NOT NULL,
      tax_amount REAL NOT NULL,
      gross_amount REAL NOT NULL,
      buyer_name TEXT NOT NULL,
      buyer_country TEXT NOT NULL,
      buyer_vat_id TEXT,
      target_format TEXT NOT NULL,
      status TEXT NOT NULL,
      validation_passed INTEGER NOT NULL DEFAULT 0,
      diagnostics_json TEXT NOT NULL DEFAULT '[]',
      sha256_xml TEXT NOT NULL,
      archive_locked_until TEXT NOT NULL,
      delivered_to TEXT,
      delivered_at TEXT,
      canonical_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_invoices_org ON invoices(org_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS integrations (
      org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      provider TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 0,
      secret_enc TEXT NOT NULL DEFAULT '',
      config_json TEXT NOT NULL DEFAULT '{}',
      last_event_at TEXT,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (org_id, provider)
    );

    CREATE TABLE IF NOT EXISTS webhook_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      provider TEXT NOT NULL,
      event_type TEXT NOT NULL,
      status_code INTEGER NOT NULL,
      summary TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_wlogs_org ON webhook_logs(org_id, id DESC);

    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      key_prefix TEXT NOT NULL,
      key_hash TEXT UNIQUE NOT NULL,
      scopes_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      last_used_at TEXT,
      revoked_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_apikeys_org ON api_keys(org_id);

    CREATE TABLE IF NOT EXISTS subscriptions (
      org_id TEXT PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
      plan_tier TEXT NOT NULL DEFAULT 'free',
      status TEXT NOT NULL DEFAULT 'active',
      monthly_quota INTEGER NOT NULL DEFAULT 3,
      billing_email TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      invoice_id TEXT,
      invoice_number TEXT NOT NULL,
      event_type TEXT NOT NULL,
      actor_email TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      prev_hash TEXT NOT NULL,
      event_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_audit_org ON audit_events(org_id, id DESC);

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      sku TEXT NOT NULL DEFAULT '',
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      unit_code TEXT NOT NULL DEFAULT 'HUR',
      unit_price REAL NOT NULL DEFAULT 0,
      vat_category TEXT NOT NULL DEFAULT 'S',
      vat_rate REAL NOT NULL DEFAULT 19,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_products_org ON products(org_id);

    CREATE TABLE IF NOT EXISTS incoming_invoices (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      invoice_number TEXT NOT NULL,
      issue_date TEXT NOT NULL,
      due_date TEXT,
      seller_name TEXT NOT NULL,
      seller_vat_id TEXT,
      seller_country TEXT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'EUR',
      net_amount REAL NOT NULL,
      tax_amount REAL NOT NULL,
      gross_amount REAL NOT NULL,
      detected_standard TEXT NOT NULL,
      validation_passed INTEGER NOT NULL DEFAULT 0,
      diagnostics_json TEXT NOT NULL DEFAULT '[]',
      payment_status TEXT NOT NULL DEFAULT 'UNPAID',
      paid_at TEXT,
      sha256_xml TEXT NOT NULL,
      archive_locked_until TEXT NOT NULL,
      canonical_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_incoming_org ON incoming_invoices(org_id, created_at DESC);
  `);

  // Safe idempotent column migrations for existing SQLite databases
  const invCols = db.prepare("PRAGMA table_info(invoices)").all() as Array<{ name: string }>;
  if (!invCols.some((c) => c.name === "payment_status")) {
    db.exec("ALTER TABLE invoices ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'UNPAID';");
  }
  if (!invCols.some((c) => c.name === "paid_at")) {
    db.exec("ALTER TABLE invoices ADD COLUMN paid_at TEXT;");
  }
  const userCols = db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>;
  if (!userCols.some((c) => c.name === "session_version")) {
    db.exec("ALTER TABLE users ADD COLUMN session_version INTEGER NOT NULL DEFAULT 0;");
  }

  globalSqlite.__normInvoiceSqlite = db;
  // SECURITY: never seed the known-password demo/super-admin workspace into a production
  // database. The demo account (founder@nordcloud-gmbh.de / DemoPass2026!) is public and is
  // also the default super-admin — seeding it in prod is a credential backdoor.
  const demoSeedAllowed =
    process.env.NODE_ENV !== "production" && process.env.ENABLE_DEMO_LOGIN !== "false";
  if (demoSeedAllowed) {
    seedDemoWorkspaceIfEmpty(db);
    ensureDemoCatalogAndInbox(db);
  }
  return db;
}

function seedDemoWorkspaceIfEmpty(db: DatabaseSync) {
  const existing = db.prepare("SELECT COUNT(*) as c FROM users").get() as { c: number };
  if (existing.c > 0) return;

  const now = new Date().toISOString();
  const demoOrgId = "org_demo_nordcloud_01";
  const demoUserId = "usr_demo_founder_01";

  db.prepare(
    `INSERT INTO organizations (id, name, slug, onboarding_completed, default_locale, retention_years, created_at)
     VALUES (?, ?, ?, 1, 'de', 8, ?)`
  ).run(demoOrgId, "NordCloud Software GmbH", "nordcloud-gmbh", now);

  db.prepare(
    `INSERT INTO users (id, email, password_hash, full_name, created_at) VALUES (?, ?, ?, ?, ?)`
  ).run(demoUserId, "founder@nordcloud-gmbh.de", hashPasswordScrypt("DemoPass2026!"), "Lukas Weber", now);

  db.prepare(
    `INSERT INTO memberships (org_id, user_id, role, created_at) VALUES (?, ?, 'owner', ?)`
  ).run(demoOrgId, demoUserId, now);

  const s = GOLDEN_FIXTURES[0]!.invoice.seller;
  db.prepare(
    `INSERT INTO seller_profiles (
       org_id, legal_name, trading_name, managing_director, registration_id,
       country_code, street, postal_code, city, vat_id, tax_number,
       is_kleinunternehmer, electronic_address, electronic_scheme_id,
       contact_name, contact_phone, contact_email,
       invoice_prefix, credit_note_prefix, next_invoice_seq,
       default_format, default_locale, default_due_days, default_payment_terms,
       iban, bic, account_holder, accountant_cc_email, updated_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 'EM', ?, ?, ?, 'RE-2026-', 'GS-2026-', 105, 'ZUGFERD_EN16931', 'de', 14, 'Zahlbar innerhalb von 14 Tagen ohne Abzug.', 'DE89370400440532013000', 'COBADEFFXXX', ?, 'steuerberater@kanzlei-berlin.de', ?)`
  ).run(
    demoOrgId,
    s.name,
    "NordCloud",
    "Lukas Weber",
    s.registrationId || "HRB 214908 B",
    s.address.countryCode,
    s.address.street,
    s.address.postalCode,
    s.address.city,
    s.vatId || "DE298765432",
    s.taxNumber || "143/123/45678",
    s.electronicAddress || "billing@nordcloud-gmbh.de",
    s.contact?.name || "Lukas Weber",
    s.contact?.phone || "+49 30 901820",
    s.contact?.email || "billing@nordcloud-gmbh.de",
    s.name,
    now
  );

  db.prepare(
    `INSERT INTO subscriptions (org_id, plan_tier, status, monthly_quota, billing_email, updated_at)
     VALUES (?, 'business', 'active', 500, 'founder@nordcloud-gmbh.de', ?)`
  ).run(demoOrgId, now);

  // Seed default integrations for Demo Org
  db.prepare(
    `INSERT INTO integrations (org_id, provider, enabled, secret_enc, config_json, updated_at) VALUES (?, 'stripe', 1, ?, ?, ?)`
  ).run(demoOrgId, encryptField("whsec_demo_stripe_nordcloud_991"), JSON.stringify({ autoEmail: true, autoCreditNotes: true }), now);

  db.prepare(
    `INSERT INTO integrations (org_id, provider, enabled, secret_enc, config_json, updated_at) VALUES (?, 'woocommerce', 1, ?, ?, ?)`
  ).run(demoOrgId, encryptField("whsec_woo_demo_94f1a2c8e7b0"), JSON.stringify({ autoEmail: true }), now);

  db.prepare(
    `INSERT INTO integrations (org_id, provider, enabled, secret_enc, config_json, updated_at) VALUES (?, 'smtp', 1, '', ?, ?)`
  ).run(demoOrgId, JSON.stringify({ senderName: "NordCloud Billing", replyTo: "billing@nordcloud-gmbh.de" }), now);

  // Seed 3 B2B Customers for Demo Org
  const seedCustomers = [
    {
      id: "cust_demo_01",
      legalName: "AlpenWerk Maschinenbau GmbH",
      vatId: "DE198765431",
      vatStatus: "VERIFIED",
      leitwegId: "",
      email: "rechnungen@alpenwerk.de",
      street: "Maximilianstraße 45",
      zip: "80539",
      city: "München",
      country: "DE",
      format: "ZUGFERD_EN16931",
    },
    {
      id: "cust_demo_02",
      legalName: "HexaLogistique SARL",
      vatId: "FR82451234567",
      vatStatus: "VERIFIED",
      leitwegId: "",
      email: "compta@hexalogistique.fr",
      street: "12 Cours Lafayette",
      zip: "69003",
      city: "Lyon",
      country: "FR",
      format: "FACTURX_EN16931",
    },
    {
      id: "cust_demo_03",
      legalName: "Bundesamt für Digitale Infrastruktur",
      vatId: "",
      vatStatus: "UNCHECKED",
      leitwegId: "04011000-1234512345-06",
      email: "e-rechnung@bund-digital.de",
      street: "Willy-Brandt-Straße 1",
      zip: "10557",
      city: "Berlin",
      country: "DE",
      format: "XRECHNUNG_UBL",
    },
  ];
  const custStmt = db.prepare(
    `INSERT INTO customers (id, org_id, legal_name, vat_id, vat_status, vat_checked_at, leitweg_id, electronic_address, street, postal_code, city, country_code, default_format, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const c of seedCustomers) {
    custStmt.run(
      c.id, demoOrgId, c.legalName, c.vatId, c.vatStatus, c.vatStatus === "VERIFIED" ? now : null,
      c.leitwegId, c.email, c.street, c.zip, c.city, c.country, c.format, now, now
    );
  }

  // Seed 4 Demo Invoices (including 1 ACTION_REQUIRED XRechnung for live repair testing)
  const seedInvPicks: Array<{ idx: number; source: InvoiceRecord["source"]; sourceRef: string; delivered: boolean }> = [
    { idx: 0, source: "stripe", sourceRef: "in_1Qx882DE01", delivered: true },
    { idx: 1, source: "stripe", sourceRef: "in_1Qx889FR02", delivered: true },
    { idx: 9, source: "stripe", sourceRef: "in_1Qx894B2G3", delivered: false },
    { idx: 4, source: "woocommerce", sourceRef: "WC-Order-4410", delivered: true },
  ];
  for (const p of seedInvPicks) {
    saveInvoiceForOrg(demoOrgId, structuredClone(GOLDEN_FIXTURES[p.idx]!.invoice), {
      source: p.source,
      sourceRef: p.sourceRef,
      actorEmail: "system@norminvoice.eu",
      markDelivered: p.delivered,
    });
  }
}

// ============================================================================
// Organization, User & Team Operations
// ============================================================================

export function findUserByEmailDb(email: string): (UserRecord & { orgId: string; orgName: string; role: MembershipRecord["role"]; onboardingCompleted: boolean; sessionVersion: number }) | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT u.id, u.email, u.password_hash, u.full_name, u.created_at, u.session_version,
              m.org_id, m.role, o.name as org_name, o.onboarding_completed
       FROM users u
       JOIN memberships m ON m.user_id = u.id
       JOIN organizations o ON o.id = m.org_id
       WHERE lower(u.email) = lower(?)
       LIMIT 1`
    )
    .get(email.trim()) as Record<string, any> | undefined;

  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    fullName: row.full_name,
    createdAt: row.created_at,
    orgId: row.org_id,
    orgName: row.org_name,
    role: row.role,
    onboardingCompleted: Boolean(row.onboarding_completed),
    sessionVersion: Number(row.session_version) || 0,
  };
}

/** Current session version for a user; mismatched tokens are treated as revoked. */
export function getUserSessionVersion(userId: string): number {
  const db = getDb();
  const row = db.prepare("SELECT session_version FROM users WHERE id = ?").get(userId) as
    | { session_version: number }
    | undefined;
  return row ? Number(row.session_version) || 0 : -1;
}

export function createNewAccountWithOrg(params: {
  email: string;
  password: string;
  fullName: string;
  orgName: string;
  countryCode?: string;
}) {
  const db = getDb();
  const normEmail = params.email.trim().toLowerCase();
  if (findUserByEmailDb(normEmail)) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const now = new Date().toISOString();
  const userId = `usr_${crypto.randomBytes(6).toString("hex")}`;
  const orgId = `org_${crypto.randomBytes(6).toString("hex")}`;
  const slug = `${params.orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 28)}-${crypto.randomBytes(3).toString("hex")}`;
  const country = (params.countryCode || "DE").toUpperCase();
  const locale = country === "FR" ? "fr" : country === "DE" || country === "AT" ? "de" : "en";
  const defaultFormat = country === "FR" ? "FACTURX_EN16931" : country === "BE" ? "PEPPOL_BIS_3" : "ZUGFERD_EN16931";
  const retentionYears = country === "FR" ? 10 : 8;

  db.prepare(
    `INSERT INTO organizations (id, name, slug, onboarding_completed, default_locale, retention_years, created_at)
     VALUES (?, ?, ?, 0, ?, ?, ?)`
  ).run(orgId, params.orgName.trim(), slug, locale, retentionYears, now);

  db.prepare(
    `INSERT INTO users (id, email, password_hash, full_name, created_at) VALUES (?, ?, ?, ?, ?)`
  ).run(userId, normEmail, hashPasswordScrypt(params.password), params.fullName.trim(), now);

  db.prepare(
    `INSERT INTO memberships (org_id, user_id, role, created_at) VALUES (?, ?, 'owner', ?)`
  ).run(orgId, userId, now);

  db.prepare(
    `INSERT INTO seller_profiles (
       org_id, legal_name, country_code, electronic_address, contact_name, contact_email,
       default_format, default_locale, account_holder, updated_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    orgId,
    params.orgName.trim(),
    country,
    normEmail,
    params.fullName.trim(),
    normEmail,
    defaultFormat,
    locale,
    params.orgName.trim(),
    now
  );

  db.prepare(
    `INSERT INTO subscriptions (org_id, plan_tier, status, monthly_quota, billing_email, updated_at)
     VALUES (?, 'free', 'active', 3, ?, ?)`
  ).run(orgId, normEmail, now);

  // Create fresh isolated integration secrets for this new tenant
  const freshWooSecret = `whsec_woo_${crypto.randomBytes(16).toString("hex")}`;
  db.prepare(
    `INSERT INTO integrations (org_id, provider, enabled, secret_enc, config_json, updated_at) VALUES (?, 'woocommerce', 0, ?, ?, ?)`
  ).run(orgId, encryptField(freshWooSecret), JSON.stringify({ autoEmail: true }), now);

  db.prepare(
    `INSERT INTO integrations (org_id, provider, enabled, secret_enc, config_json, updated_at) VALUES (?, 'stripe', 0, '', ?, ?)`
  ).run(orgId, JSON.stringify({ autoEmail: true, autoCreditNotes: true }), now);

  return {
    id: userId,
    orgId,
    orgName: params.orgName.trim(),
    email: normEmail,
    fullName: params.fullName.trim(),
    role: "owner" as const,
    onboardingCompleted: false,
  };
}

export function getOrgById(orgId: string): OrgRecord | null {
  const db = getDb();
  const r = db.prepare("SELECT * FROM organizations WHERE id = ?").get(orgId) as Record<string, any> | undefined;
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    onboardingCompleted: Boolean(r.onboarding_completed),
    defaultLocale: r.default_locale,
    retentionYears: r.retention_years === 10 ? 10 : 8,
    createdAt: r.created_at,
  };
}

export function markOnboardingCompleted(orgId: string): void {
  const db = getDb();
  db.prepare("UPDATE organizations SET onboarding_completed = 1 WHERE id = ?").run(orgId);
}

export function changeUserPassword(userId: string, currentPassword: string, newPassword: string): { ok: boolean; error?: string } {
  const db = getDb();
  const row = db.prepare("SELECT password_hash FROM users WHERE id = ?").get(userId) as { password_hash: string } | undefined;
  if (!row) return { ok: false, error: "User not found" };
  if (!verifyPasswordScrypt(currentPassword, row.password_hash)) {
    return { ok: false, error: "Current password is incorrect." };
  }
  if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    return { ok: false, error: "New password must be at least 8 characters and include letters and numbers." };
  }
  // Bump session_version so every existing session for this user is immediately invalidated.
  db.prepare("UPDATE users SET password_hash = ?, session_version = session_version + 1 WHERE id = ?").run(
    hashPasswordScrypt(newPassword),
    userId
  );
  return { ok: true };
}

export function deleteOrganizationAndData(orgId: string): void {
  const db = getDb();
  db.prepare("DELETE FROM organizations WHERE id = ?").run(orgId);
}

// ============================================================================
// Team & RBAC
// ============================================================================

export function listTeamMembers(orgId: string): MembershipRecord[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT m.org_id, m.user_id, m.role, m.created_at, u.email, u.full_name
       FROM memberships m JOIN users u ON u.id = m.user_id
       WHERE m.org_id = ? ORDER BY m.created_at ASC`
    )
    .all(orgId) as Array<Record<string, any>>;

  return rows.map((r) => ({
    orgId: r.org_id,
    userId: r.user_id,
    email: r.email,
    fullName: r.full_name,
    role: r.role,
    createdAt: r.created_at,
  }));
}

export function inviteTeamMember(orgId: string, email: string, fullName: string, role: MembershipRecord["role"]) {
  const db = getDb();
  const norm = email.trim().toLowerCase();
  const now = new Date().toISOString();
  let user = db.prepare("SELECT id FROM users WHERE lower(email) = lower(?)").get(norm) as { id: string } | undefined;
  if (!user) {
    const newId = `usr_${crypto.randomBytes(6).toString("hex")}`;
    const tempPass = crypto.randomBytes(12).toString("base64url");
    db.prepare("INSERT INTO users (id, email, password_hash, full_name, created_at) VALUES (?, ?, ?, ?, ?)").run(
      newId,
      norm,
      hashPasswordScrypt(tempPass),
      fullName.trim() || norm.split("@")[0],
      now
    );
    user = { id: newId };
  }
  db.prepare(
    `INSERT INTO memberships (org_id, user_id, role, created_at) VALUES (?, ?, ?, ?)
     ON CONFLICT (org_id, user_id) DO UPDATE SET role = excluded.role`
  ).run(orgId, user.id, role, now);
  return listTeamMembers(orgId);
}

export function removeTeamMember(orgId: string, userId: string): boolean {
  const db = getDb();
  const owners = db
    .prepare("SELECT COUNT(*) as c FROM memberships WHERE org_id = ? AND role = 'owner' AND user_id != ?")
    .get(orgId, userId) as { c: number };
  const target = db
    .prepare("SELECT role FROM memberships WHERE org_id = ? AND user_id = ?")
    .get(orgId, userId) as { role: string } | undefined;
  if (!target) return false;
  if (target.role === "owner" && owners.c === 0) {
    throw new Error("CANNOT_REMOVE_LAST_OWNER");
  }
  db.prepare("DELETE FROM memberships WHERE org_id = ? AND user_id = ?").run(orgId, userId);
  return true;
}

// ============================================================================
// Seller Settings (BG-4 + BG-16 + Numbering)
// ============================================================================

export function getSellerSettings(orgId: string): SellerSettingsRecord | null {
  const db = getDb();
  const r = db
    .prepare(
      `SELECT sp.*, o.retention_years
       FROM seller_profiles sp JOIN organizations o ON o.id = sp.org_id
       WHERE sp.org_id = ?`
    )
    .get(orgId) as Record<string, any> | undefined;
  if (!r) return null;
  return {
    orgId: r.org_id,
    legalName: r.legal_name,
    tradingName: r.trading_name,
    managingDirector: r.managing_director,
    registrationId: r.registration_id,
    countryCode: r.country_code,
    street: r.street,
    postalCode: r.postal_code,
    city: r.city,
    vatId: r.vat_id,
    vatVerifiedAt: r.vat_verified_at,
    taxNumber: r.tax_number,
    isKleinunternehmer: Boolean(r.is_kleinunternehmer),
    electronicAddress: r.electronic_address,
    electronicSchemeId: r.electronic_scheme_id,
    contactName: r.contact_name,
    contactPhone: r.contact_phone,
    contactEmail: r.contact_email,
    logoDataUrl: r.logo_data_url,
    invoicePrefix: r.invoice_prefix,
    creditNotePrefix: r.credit_note_prefix,
    nextInvoiceSeq: Number(r.next_invoice_seq),
    defaultFormat: r.default_format,
    defaultLocale: r.default_locale,
    defaultDueDays: Number(r.default_due_days),
    defaultPaymentTerms: r.default_payment_terms,
    defaultNotes: r.default_notes,
    iban: r.iban,
    bic: r.bic,
    accountHolder: r.account_holder,
    accountantCcEmail: r.accountant_cc_email,
    retentionYears: r.retention_years === 10 ? 10 : 8,
    updatedAt: r.updated_at,
  };
}

export function updateSellerSettings(orgId: string, patch: Partial<SellerSettingsRecord>): SellerSettingsRecord {
  const db = getDb();
  const curr = getSellerSettings(orgId);
  if (!curr) throw new Error("Organization settings not found");

  const definedPatch = Object.fromEntries(
    Object.entries(patch).filter(([, v]) => v !== undefined)
  ) as Partial<SellerSettingsRecord>;

  const next = { ...curr, ...definedPatch, updatedAt: new Date().toISOString() };
  if (next.iban && !validateIbanMod97(next.iban)) {
    throw new Error("INVALID_IBAN_CHECKSUM: Provided IBAN fails ISO 13616 MOD-97 checksum validation.");
  }

  db.prepare(
    `UPDATE seller_profiles SET
       legal_name = ?, trading_name = ?, managing_director = ?, registration_id = ?,
       country_code = ?, street = ?, postal_code = ?, city = ?,
       vat_id = ?, vat_verified_at = ?, tax_number = ?, is_kleinunternehmer = ?,
       electronic_address = ?, electronic_scheme_id = ?,
       contact_name = ?, contact_phone = ?, contact_email = ?, logo_data_url = ?,
       invoice_prefix = ?, credit_note_prefix = ?, next_invoice_seq = ?,
       default_format = ?, default_locale = ?, default_due_days = ?,
       default_payment_terms = ?, default_notes = ?,
       iban = ?, bic = ?, account_holder = ?, accountant_cc_email = ?, updated_at = ?
     WHERE org_id = ?`
  ).run(
    next.legalName,
    next.tradingName,
    next.managingDirector,
    next.registrationId,
    next.countryCode.toUpperCase().slice(0, 2),
    next.street,
    next.postalCode,
    next.city,
    next.vatId.replace(/\s+/g, "").toUpperCase(),
    next.vatVerifiedAt,
    next.taxNumber,
    next.isKleinunternehmer ? 1 : 0,
    next.electronicAddress,
    next.electronicSchemeId || "EM",
    next.contactName,
    next.contactPhone,
    next.contactEmail,
    next.logoDataUrl.slice(0, 250_000),
    next.invoicePrefix,
    next.creditNotePrefix,
    Math.max(1, Number(next.nextInvoiceSeq) || 1),
    next.defaultFormat,
    next.defaultLocale,
    Math.max(0, Number(next.defaultDueDays) || 14),
    next.defaultPaymentTerms,
    next.defaultNotes,
    next.iban.replace(/\s+/g, "").toUpperCase(),
    next.bic.replace(/\s+/g, "").toUpperCase(),
    next.accountHolder,
    next.accountantCcEmail,
    next.updatedAt,
    orgId
  );

  if (patch.retentionYears === 8 || patch.retentionYears === 10) {
    db.prepare("UPDATE organizations SET retention_years = ?, name = ? WHERE id = ?").run(
      patch.retentionYears,
      next.legalName,
      orgId
    );
  }

  return getSellerSettings(orgId)!;
}

export function sellerSettingsToCanonicalParty(s: SellerSettingsRecord): CanonicalInvoice["seller"] {
  return {
    name: s.legalName,
    tradingName: s.tradingName || undefined,
    vatId: s.vatId || undefined,
    taxNumber: s.taxNumber || undefined,
    registrationId: s.registrationId || undefined,
    electronicAddress: s.electronicAddress || undefined,
    electronicAddressScheme: s.electronicSchemeId || "EM",
    isKleinunternehmer: s.isKleinunternehmer,
    address: {
      street: s.street,
      postalCode: s.postalCode,
      city: s.city,
      countryCode: s.countryCode || "DE",
    },
    contact:
      s.contactName && s.contactPhone && s.contactEmail
        ? { name: s.contactName, phone: s.contactPhone, email: s.contactEmail }
        : undefined,
  };
}

export function consumeNextInvoiceNumber(orgId: string, typeCode: 380 | 381 = 380): string {
  const db = getDb();
  const s = getSellerSettings(orgId);
  if (!s) return `INV-${Date.now()}`;
  const prefix = typeCode === 381 ? s.creditNotePrefix : s.invoicePrefix;
  const num = `${prefix}${String(s.nextInvoiceSeq).padStart(4, "0")}`;
  db.prepare("UPDATE seller_profiles SET next_invoice_seq = next_invoice_seq + 1 WHERE org_id = ?").run(orgId);
  return num;
}

// ============================================================================
// Customers CRM (BG-7) — Strictly Tenant-Scoped
// ============================================================================

export function listCustomersForOrg(orgId: string, search?: string): CustomerRecord[] {
  const db = getDb();
  const rows = search?.trim()
    ? (db
        .prepare(
          `SELECT * FROM customers WHERE org_id = ?
           AND (lower(legal_name) LIKE lower(?) OR lower(vat_id) LIKE lower(?) OR lower(city) LIKE lower(?))
           ORDER BY updated_at DESC`
        )
        .all(orgId, `%${search.trim()}%`, `%${search.trim()}%`, `%${search.trim()}%`) as Array<Record<string, any>>)
    : (db.prepare("SELECT * FROM customers WHERE org_id = ? ORDER BY updated_at DESC").all(orgId) as Array<Record<string, any>>);

  return rows.map(mapCustomerRow);
}

function mapCustomerRow(r: Record<string, any>): CustomerRecord {
  return {
    id: r.id,
    orgId: r.org_id,
    legalName: r.legal_name,
    vatId: r.vat_id,
    vatStatus: r.vat_status,
    vatCheckedAt: r.vat_checked_at,
    leitwegId: r.leitweg_id,
    electronicAddress: r.electronic_address,
    street: r.street,
    postalCode: r.postal_code,
    city: r.city,
    countryCode: r.country_code,
    defaultFormat: r.default_format,
    notes: r.notes,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function createCustomerForOrg(orgId: string, input: Omit<CustomerRecord, "id" | "orgId" | "createdAt" | "updatedAt">): CustomerRecord {
  const db = getDb();
  const id = `cust_${crypto.randomBytes(6).toString("hex")}`;
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO customers (id, org_id, legal_name, vat_id, vat_status, vat_checked_at, leitweg_id, electronic_address, street, postal_code, city, country_code, default_format, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    orgId,
    input.legalName.trim(),
    (input.vatId || "").replace(/\s+/g, "").toUpperCase(),
    input.vatStatus || "UNCHECKED",
    input.vatCheckedAt || null,
    input.leitwegId || "",
    input.electronicAddress || "",
    input.street || "",
    input.postalCode || "",
    input.city || "",
    (input.countryCode || "DE").toUpperCase().slice(0, 2),
    input.defaultFormat || "ZUGFERD_EN16931",
    input.notes || "",
    now,
    now
  );
  return mapCustomerRow(db.prepare("SELECT * FROM customers WHERE id = ? AND org_id = ?").get(id, orgId) as Record<string, any>);
}

export function updateCustomerForOrg(orgId: string, id: string, patch: Partial<CustomerRecord>): CustomerRecord | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM customers WHERE id = ? AND org_id = ?").get(id, orgId) as Record<string, any> | undefined;
  if (!row) return null;
  const curr = mapCustomerRow(row);
  const definedPatch = Object.fromEntries(
    Object.entries(patch).filter(([, v]) => v !== undefined)
  ) as Partial<CustomerRecord>;
  const next = { ...curr, ...definedPatch, updatedAt: new Date().toISOString() };
  db.prepare(
    `UPDATE customers SET legal_name=?, vat_id=?, vat_status=?, vat_checked_at=?, leitweg_id=?, electronic_address=?, street=?, postal_code=?, city=?, country_code=?, default_format=?, notes=?, updated_at=?
     WHERE id=? AND org_id=?`
  ).run(
    next.legalName,
    next.vatId.replace(/\s+/g, "").toUpperCase(),
    next.vatStatus,
    next.vatCheckedAt,
    next.leitwegId,
    next.electronicAddress,
    next.street,
    next.postalCode,
    next.city,
    next.countryCode.toUpperCase().slice(0, 2),
    next.defaultFormat,
    next.notes,
    next.updatedAt,
    id,
    orgId
  );
  return next;
}

export function deleteCustomerForOrg(orgId: string, id: string): boolean {
  const db = getDb();
  const res = db.prepare("DELETE FROM customers WHERE id = ? AND org_id = ?").run(id, orgId);
  return Number(res.changes) > 0;
}

export function getCustomerForOrg(orgId: string, id: string): CustomerRecord | null {
  const db = getDb();
  const r = db.prepare("SELECT * FROM customers WHERE id = ? AND org_id = ?").get(id, orgId) as Record<string, any> | undefined;
  return r ? mapCustomerRow(r) : null;
}

// ============================================================================
// Invoices Ledger, Credit Notes & GoBD Hash Chain — Strictly Tenant-Scoped
// ============================================================================

function mapInvoiceRow(r: Record<string, any>): InvoiceRecord {
  return {
    id: r.id,
    orgId: r.org_id,
    customerId: r.customer_id,
    source: r.source,
    sourceRef: r.source_ref,
    invoiceNumber: r.invoice_number,
    typeCode: r.type_code === 381 ? 381 : 380,
    precedingInvoiceNumber: r.preceding_invoice_number,
    issueDate: r.issue_date,
    dueDate: r.due_date,
    currency: r.currency,
    netAmount: Number(r.net_amount),
    taxAmount: Number(r.tax_amount),
    grossAmount: Number(r.gross_amount),
    buyerName: r.buyer_name,
    buyerCountry: r.buyer_country,
    buyerVatId: r.buyer_vat_id,
    targetFormat: r.target_format,
    status: r.status,
    validationPassed: Boolean(r.validation_passed),
    diagnostics: JSON.parse(r.diagnostics_json || "[]"),
    sha256Xml: r.sha256_xml,
    archiveLockedUntil: r.archive_locked_until,
    deliveredTo: r.delivered_to,
    deliveredAt: r.delivered_at,
    paymentStatus: r.payment_status === "PAID" ? "PAID" : "UNPAID",
    paidAt: r.paid_at ?? null,
    canonical: JSON.parse(r.canonical_json),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function listInvoicesForOrg(
  orgId: string,
  filters?: { status?: string; search?: string; fromDate?: string; toDate?: string }
): InvoiceRecord[] {
  const db = getDb();
  let sql = "SELECT * FROM invoices WHERE org_id = ?";
  const params: Array<string> = [orgId];

  if (filters?.status && filters.status !== "ALL") {
    sql += " AND status = ?";
    params.push(filters.status);
  }
  if (filters?.search?.trim()) {
    sql += " AND (lower(invoice_number) LIKE lower(?) OR lower(buyer_name) LIKE lower(?) OR lower(coalesce(buyer_vat_id,'')) LIKE lower(?))";
    const q = `%${filters.search.trim()}%`;
    params.push(q, q, q);
  }
  if (filters?.fromDate) {
    sql += " AND issue_date >= ?";
    params.push(filters.fromDate);
  }
  if (filters?.toDate) {
    sql += " AND issue_date <= ?";
    params.push(filters.toDate);
  }

  sql += " ORDER BY created_at DESC";
  const rows = db.prepare(sql).all(...params) as Array<Record<string, any>>;
  return rows.map(mapInvoiceRow);
}

export function getInvoiceForOrg(orgId: string, invoiceId: string): InvoiceRecord | null {
  const db = getDb();
  const r = db.prepare("SELECT * FROM invoices WHERE id = ? AND org_id = ?").get(invoiceId, orgId) as Record<string, any> | undefined;
  return r ? mapInvoiceRow(r) : null;
}

export function appendOrgAuditEvent(
  orgId: string,
  invoiceId: string | null,
  invoiceNumber: string,
  eventType: string,
  actorEmail: string,
  payload: Record<string, unknown>
): AuditEventRecord {
  const db = getDb();
  const last = db
    .prepare("SELECT event_hash FROM audit_events WHERE org_id = ? ORDER BY id DESC LIMIT 1")
    .get(orgId) as { event_hash: string } | undefined;

  const prevHash = last?.event_hash || "0".repeat(64);
  const createdAt = new Date().toISOString();
  const payloadJson = JSON.stringify(payload);
  const eventHash = sha256(`${prevHash}|${orgId}|${invoiceId || ""}|${eventType}|${payloadJson}|${createdAt}`);

  const info = db
    .prepare(
      `INSERT INTO audit_events (org_id, invoice_id, invoice_number, event_type, actor_email, payload_json, prev_hash, event_hash, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(orgId, invoiceId, invoiceNumber, eventType, actorEmail, payloadJson, prevHash, eventHash, createdAt);

  return {
    id: Number(info.lastInsertRowid),
    orgId,
    invoiceId,
    invoiceNumber,
    eventType,
    actorEmail,
    payloadJson,
    prevHash,
    eventHash,
    createdAt,
  };
}

export function listOrgAuditEvents(orgId: string, invoiceId?: string): AuditEventRecord[] {
  const db = getDb();
  const rows = invoiceId
    ? (db.prepare("SELECT * FROM audit_events WHERE org_id = ? AND invoice_id = ? ORDER BY id DESC LIMIT 50").all(orgId, invoiceId) as Array<Record<string, any>>)
    : (db.prepare("SELECT * FROM audit_events WHERE org_id = ? ORDER BY id DESC LIMIT 50").all(orgId) as Array<Record<string, any>>);
  return rows.map((r) => ({
    id: Number(r.id),
    orgId: r.org_id,
    invoiceId: r.invoice_id,
    invoiceNumber: r.invoice_number,
    eventType: r.event_type,
    actorEmail: r.actor_email,
    payloadJson: r.payload_json,
    prevHash: r.prev_hash,
    eventHash: r.event_hash,
    createdAt: r.created_at,
  }));
}

/**
 * Cryptographically verifies EVERY link in an organization's GoBD SHA-256 Audit Hash Chain!
 */
export function verifyOrgAuditHashChain(orgId: string): {
  verified: boolean;
  totalEvents: number;
  brokenAtEventId: number | null;
} {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM audit_events WHERE org_id = ? ORDER BY id ASC")
    .all(orgId) as Array<Record<string, any>>;

  let expectedPrev = "0".repeat(64);
  for (const r of rows) {
    if (r.prev_hash !== expectedPrev) {
      return { verified: false, totalEvents: rows.length, brokenAtEventId: Number(r.id) };
    }
    const recomputed = sha256(
      `${r.prev_hash}|${r.org_id}|${r.invoice_id || ""}|${r.event_type}|${r.payload_json}|${r.created_at}`
    );
    if (recomputed !== r.event_hash) {
      return { verified: false, totalEvents: rows.length, brokenAtEventId: Number(r.id) };
    }
    expectedPrev = r.event_hash;
  }
  return { verified: true, totalEvents: rows.length, brokenAtEventId: null };
}

export function saveInvoiceForOrg(
  orgId: string,
  canonicalInput: CanonicalInvoice,
  meta: {
    id?: string;
    customerId?: string | null;
    source: InvoiceRecord["source"];
    sourceRef: string;
    actorEmail: string;
    saveAsDraft?: boolean;
    markDelivered?: boolean;
  }
): InvoiceRecord {
  const db = getDb();
  const { normalized, totals } = computeCanonicalTotals(canonicalInput);
  const report = validateCanonicalInvoice(normalized);
  const isUbl = normalized.profile === "XRECHNUNG_UBL" || normalized.profile === "PEPPOL_BIS_3";
  const xml = isUbl ? serializeToUblXml(normalized) : serializeToCiiXml(normalized);
  const xmlHash = sha256(xml);
  const org = getOrgById(orgId);
  const lockDate = lockDateFromYears(org?.retentionYears ?? 8);
  const now = new Date().toISOString();
  const id = meta.id ?? `inv_${crypto.randomBytes(6).toString("hex")}`;

  const status: InvoiceRecord["status"] = meta.saveAsDraft
    ? "DRAFT"
    : !report.valid
      ? "ACTION_REQUIRED"
      : meta.markDelivered
        ? "DELIVERED"
        : "VALIDATED";

  const exists = db.prepare("SELECT id FROM invoices WHERE id = ? AND org_id = ?").get(id, orgId);
  if (exists) {
    db.prepare(
      `UPDATE invoices SET
         invoice_number=?, type_code=?, preceding_invoice_number=?, issue_date=?, due_date=?, currency=?,
         net_amount=?, tax_amount=?, gross_amount=?, buyer_name=?, buyer_country=?, buyer_vat_id=?,
         target_format=?, status=?, validation_passed=?, diagnostics_json=?, sha256_xml=?,
         canonical_json=?, updated_at=?
       WHERE id=? AND org_id=?`
    ).run(
      normalized.invoiceNumber,
      normalized.typeCode,
      normalized.precedingInvoiceReference ?? null,
      normalized.issueDate,
      normalized.payment.dueDate ?? null,
      normalized.currency,
      totals.taxExclusiveTotal,
      totals.taxTotal,
      totals.taxInclusiveTotal,
      normalized.buyer.name,
      normalized.buyer.address.countryCode,
      normalized.buyer.vatId ?? null,
      normalized.profile,
      status,
      report.valid ? 1 : 0,
      JSON.stringify(report.diagnostics),
      xmlHash,
      JSON.stringify(normalized),
      now,
      id,
      orgId
    );
  } else {
    db.prepare(
      `INSERT INTO invoices (
         id, org_id, customer_id, source, source_ref, invoice_number, type_code, preceding_invoice_number,
         issue_date, due_date, currency, net_amount, tax_amount, gross_amount,
         buyer_name, buyer_country, buyer_vat_id, target_format, status,
         validation_passed, diagnostics_json, sha256_xml, archive_locked_until,
         delivered_to, delivered_at, canonical_json, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      orgId,
      meta.customerId ?? null,
      meta.source,
      meta.sourceRef,
      normalized.invoiceNumber,
      normalized.typeCode,
      normalized.precedingInvoiceReference ?? null,
      normalized.issueDate,
      normalized.payment.dueDate ?? null,
      normalized.currency,
      totals.taxExclusiveTotal,
      totals.taxTotal,
      totals.taxInclusiveTotal,
      normalized.buyer.name,
      normalized.buyer.address.countryCode,
      normalized.buyer.vatId ?? null,
      normalized.profile,
      status,
      report.valid ? 1 : 0,
      JSON.stringify(report.diagnostics),
      xmlHash,
      lockDate,
      meta.markDelivered ? normalized.buyer.electronicAddress ?? null : null,
      meta.markDelivered ? now : null,
      JSON.stringify(normalized),
      now,
      now
    );
  }

  appendOrgAuditEvent(
    orgId,
    id,
    normalized.invoiceNumber,
    meta.saveAsDraft ? "DRAFT_SAVED" : report.valid ? "VALIDATED_AND_ARCHIVED" : "HALTED_ACTION_REQUIRED",
    meta.actorEmail,
    { sha256Xml: xmlHash, status, format: normalized.profile }
  );

  return getInvoiceForOrg(orgId, id)!;
}

export function markInvoiceDelivered(orgId: string, invoiceId: string, recipient: string, actorEmail: string): AuditEventRecord | null {
  const db = getDb();
  const inv = getInvoiceForOrg(orgId, invoiceId);
  if (!inv) return null;
  const now = new Date().toISOString();
  db.prepare("UPDATE invoices SET status = 'DELIVERED', delivered_to = ?, delivered_at = ?, updated_at = ? WHERE id = ? AND org_id = ?").run(
    recipient,
    now,
    now,
    invoiceId,
    orgId
  );
  return appendOrgAuditEvent(orgId, invoiceId, inv.invoiceNumber, "EMAILED_TO_BUYER_AND_CC", actorEmail, {
    deliveredTo: recipient,
  });
}

export function deleteDraftInvoiceForOrg(
  orgId: string,
  invoiceId: string,
  actorEmail: string
): { deleted: boolean; reason?: string } {
  const db = getDb();
  const inv = getInvoiceForOrg(orgId, invoiceId);
  if (!inv) return { deleted: false, reason: "NOT_FOUND" };
  if (inv.status !== "DRAFT") {
    return {
      deleted: false,
      reason: "GOBD_IMMUTABLE: Finalized invoices cannot be deleted under GoBD / § 147 AO. Issue a Credit Note (TypeCode 381) instead.",
    };
  }
  db.prepare("DELETE FROM invoices WHERE id = ? AND org_id = ? AND status = 'DRAFT'").run(invoiceId, orgId);
  appendOrgAuditEvent(orgId, null, inv.invoiceNumber, "DRAFT_DELETED", actorEmail, { invoiceId });
  return { deleted: true };
}

export function patchInvoiceForOrg(
  orgId: string,
  invoiceId: string,
  patch: {
    buyerReference?: string;
    buyerVatId?: string;
    sellerContactName?: string;
    sellerContactPhone?: string;
    sellerContactEmail?: string;
  },
  actorEmail: string
): InvoiceRecord | null {
  const existing = getInvoiceForOrg(orgId, invoiceId);
  if (!existing) return null;

  const updatedCanonical: CanonicalInvoice = structuredClone(existing.canonical);
  if (patch.buyerReference !== undefined) {
    updatedCanonical.buyerReference = patch.buyerReference.trim();
  }
  if (patch.buyerVatId !== undefined) {
    updatedCanonical.buyer.vatId = patch.buyerVatId.trim().replace(/\s+/g, "").toUpperCase();
  }
  if (patch.sellerContactName || patch.sellerContactPhone || patch.sellerContactEmail) {
    updatedCanonical.seller.contact = {
      name: patch.sellerContactName?.trim() || updatedCanonical.seller.contact?.name || "Accounting",
      phone: patch.sellerContactPhone?.trim() || updatedCanonical.seller.contact?.phone || "+49 30 000000",
      email: patch.sellerContactEmail?.trim() || updatedCanonical.seller.contact?.email || updatedCanonical.seller.electronicAddress || "billing@example.eu",
    };
  }

  return saveInvoiceForOrg(orgId, updatedCanonical, {
    id: existing.id,
    customerId: existing.customerId,
    source: existing.source,
    sourceRef: existing.sourceRef,
    actorEmail,
    saveAsDraft: false,
  });
}

export function issueCreditNoteForInvoice(
  orgId: string,
  originalInvoiceId: string,
  actorEmail: string,
  reason?: string
): InvoiceRecord | null {
  const original = getInvoiceForOrg(orgId, originalInvoiceId);
  if (!original) return null;

  const cnNumber = consumeNextInvoiceNumber(orgId, 381);
  const today = new Date().toISOString().slice(0, 10);
  const creditCanonical: CanonicalInvoice = structuredClone(original.canonical);
  creditCanonical.invoiceNumber = cnNumber;
  creditCanonical.typeCode = 381;
  creditCanonical.issueDate = today;
  creditCanonical.precedingInvoiceReference = original.invoiceNumber;
  creditCanonical.notes = [
    ...(creditCanonical.notes ?? []),
    `Storno / Credit Note referencing ${original.invoiceNumber}${reason ? `: ${reason}` : ""}`,
  ];

  const created = saveInvoiceForOrg(orgId, creditCanonical, {
    customerId: original.customerId,
    source: original.source,
    sourceRef: `CN_OF_${original.invoiceNumber}`,
    actorEmail,
  });

  appendOrgAuditEvent(orgId, original.id, original.invoiceNumber, "CREDIT_NOTE_ISSUED", actorEmail, {
    creditNoteId: created.id,
    creditNoteNumber: created.invoiceNumber,
  });

  return created;
}

// ============================================================================
// Integrations, Webhook Logs, API Keys & Subscriptions — Tenant-Scoped
// ============================================================================

export function listIntegrationsForOrg(orgId: string): IntegrationConfigRecord[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM integrations WHERE org_id = ?").all(orgId) as Array<Record<string, any>>;
  const byProvider = new Map(rows.map((r) => [r.provider, r]));

  return (["stripe", "woocommerce", "smtp", "outbound_webhook"] as const).map((provider) => {
    const r = byProvider.get(provider);
    const plain = decryptField(r?.secret_enc);
    return {
      provider,
      enabled: Boolean(r?.enabled),
      hasSecret: Boolean(plain),
      secretMasked: maskVal(plain),
      config: r ? JSON.parse(r.config_json || "{}") : {},
      lastEventAt: r?.last_event_at ?? null,
      updatedAt: r?.updated_at ?? new Date().toISOString(),
    };
  });
}

export function getIntegrationSecretDecrypted(orgId: string, provider: string): string {
  const db = getDb();
  const r = db
    .prepare("SELECT secret_enc FROM integrations WHERE org_id = ? AND provider = ?")
    .get(orgId, provider) as { secret_enc: string } | undefined;
  return decryptField(r?.secret_enc);
}

export function upsertIntegrationForOrg(
  orgId: string,
  provider: "stripe" | "woocommerce" | "smtp" | "outbound_webhook",
  input: { enabled?: boolean; newSecret?: string; rotateSecret?: boolean; config?: Record<string, unknown> }
): { record: IntegrationConfigRecord; rotatedPlaintext?: string } {
  const db = getDb();
  const existing = db
    .prepare("SELECT * FROM integrations WHERE org_id = ? AND provider = ?")
    .get(orgId, provider) as Record<string, any> | undefined;

  let secretEnc = existing?.secret_enc || "";
  let rotatedPlaintext: string | undefined;

  if (input.rotateSecret) {
    rotatedPlaintext = `whsec_${provider}_${crypto.randomBytes(16).toString("hex")}`;
    secretEnc = encryptField(rotatedPlaintext);
  } else if (input.newSecret && !input.newSecret.includes("••••")) {
    secretEnc = encryptField(input.newSecret.trim());
  }

  const enabled = input.enabled !== undefined ? (input.enabled ? 1 : 0) : existing?.enabled ?? 1;
  const configJson = JSON.stringify({
    ...(existing ? JSON.parse(existing.config_json || "{}") : {}),
    ...(input.config || {}),
  });
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO integrations (org_id, provider, enabled, secret_enc, config_json, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT (org_id, provider) DO UPDATE SET
       enabled = excluded.enabled,
       secret_enc = excluded.secret_enc,
       config_json = excluded.config_json,
       updated_at = excluded.updated_at`
  ).run(orgId, provider, enabled, secretEnc, configJson, now);

  const rec = listIntegrationsForOrg(orgId).find((i) => i.provider === provider)!;
  return { record: rec, rotatedPlaintext };
}

export function recordWebhookDeliveryLog(
  orgId: string,
  provider: string,
  eventType: string,
  statusCode: number,
  summary: string
): void {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO webhook_logs (org_id, provider, event_type, status_code, summary, created_at) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(orgId, provider, eventType, statusCode, summary.slice(0, 240), now);
  db.prepare("UPDATE integrations SET last_event_at = ? WHERE org_id = ? AND provider = ?").run(now, orgId, provider);
}

export function listWebhookLogsForOrg(orgId: string): WebhookLogRecord[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM webhook_logs WHERE org_id = ? ORDER BY id DESC LIMIT 30")
    .all(orgId) as Array<Record<string, any>>;
  return rows.map((r) => ({
    id: Number(r.id),
    orgId: r.org_id,
    provider: r.provider,
    eventType: r.event_type,
    statusCode: Number(r.status_code),
    summary: r.summary,
    createdAt: r.created_at,
  }));
}

export function listApiKeysForOrg(orgId: string): ApiKeyPublicRecord[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM api_keys WHERE org_id = ? ORDER BY created_at DESC")
    .all(orgId) as Array<Record<string, any>>;
  return rows.map((r) => ({
    id: r.id,
    orgId: r.org_id,
    name: r.name,
    keyPrefix: r.key_prefix,
    scopes: JSON.parse(r.scopes_json || "[]"),
    createdAt: r.created_at,
    lastUsedAt: r.last_used_at,
    revokedAt: r.revoked_at,
  }));
}

export function createApiKeyForOrg(orgId: string, name: string, scopes: string[]) {
  const db = getDb();
  const id = `key_${crypto.randomBytes(6).toString("hex")}`;
  const plaintextKey = `ni_live_${crypto.randomBytes(24).toString("hex")}`;
  const keyPrefix = plaintextKey.slice(0, 14);
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO api_keys (id, org_id, name, key_prefix, key_hash, scopes_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(id, orgId, name.trim() || "API Key", keyPrefix, sha256(plaintextKey), JSON.stringify(scopes), now);

  return {
    record: listApiKeysForOrg(orgId).find((k) => k.id === id)!,
    plaintextKey,
  };
}

export function revokeApiKeyForOrg(orgId: string, keyId: string): boolean {
  const db = getDb();
  const res = db
    .prepare("UPDATE api_keys SET revoked_at = ? WHERE id = ? AND org_id = ? AND revoked_at IS NULL")
    .run(new Date().toISOString(), keyId, orgId);
  return Number(res.changes) > 0;
}

export function authenticateBearerApiKeyDb(authHeader: string | null): {
  id: string;
  orgId: string;
  keyPrefix: string;
  scopes: string[];
} | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const raw = authHeader.slice(7).trim();
  if (!raw.startsWith("ni_live_")) return null;

  const db = getDb();
  const row = db
    .prepare("SELECT id, org_id, key_prefix, scopes_json FROM api_keys WHERE key_hash = ? AND revoked_at IS NULL")
    .get(sha256(raw)) as Record<string, any> | undefined;
  if (!row) return null;

  db.prepare("UPDATE api_keys SET last_used_at = ? WHERE id = ?").run(new Date().toISOString(), row.id);
  return {
    id: row.id,
    orgId: row.org_id,
    keyPrefix: row.key_prefix,
    scopes: JSON.parse(row.scopes_json || "[]"),
  };
}

export function getSubscriptionForOrg(orgId: string): SubscriptionRecord {
  const db = getDb();
  const r = db.prepare("SELECT * FROM subscriptions WHERE org_id = ?").get(orgId) as Record<string, any> | undefined;
  if (!r) {
    return {
      orgId,
      planTier: "free",
      status: "active",
      monthlyQuota: 3,
      billingEmail: "",
      updatedAt: new Date().toISOString(),
    };
  }
  return {
    orgId: r.org_id,
    planTier: r.plan_tier,
    status: r.status,
    monthlyQuota: Number(r.monthly_quota),
    billingEmail: r.billing_email,
    updatedAt: r.updated_at,
  };
}

export function updateSubscriptionForOrg(orgId: string, tier: SubscriptionRecord["planTier"], quota: number) {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO subscriptions (org_id, plan_tier, status, monthly_quota, updated_at) VALUES (?, ?, 'active', ?, ?)
     ON CONFLICT (org_id) DO UPDATE SET plan_tier = excluded.plan_tier, status = 'active', monthly_quota = excluded.monthly_quota, updated_at = excluded.updated_at`
  ).run(orgId, tier, quota, now);
  return getSubscriptionForOrg(orgId);
}

export function countMonthlyInvoicesForOrg(orgId: string): number {
  const db = getDb();
  const ym = new Date().toISOString().slice(0, 7);
  const r = db
    .prepare("SELECT COUNT(*) as c FROM invoices WHERE org_id = ? AND status != 'DRAFT' AND created_at LIKE ?")
    .get(orgId, `${ym}%`) as { c: number };
  return Number(r.c);
}

export function exportAllOrgDataGdpr(orgId: string) {
  return {
    exportedAt: new Date().toISOString(),
    gdprArticle: "Art. 20 GDPR — Right to Data Portability",
    organization: getOrgById(orgId),
    sellerProfile: getSellerSettings(orgId),
    subscription: getSubscriptionForOrg(orgId),
    team: listTeamMembers(orgId),
    customers: listCustomersForOrg(orgId),
    products: listProductsForOrg(orgId),
    invoices: listInvoicesForOrg(orgId),
    incomingInvoices: listIncomingInvoicesForOrg(orgId),
    integrations: listIntegrationsForOrg(orgId),
    apiKeys: listApiKeysForOrg(orgId),
    auditEvents: listOrgAuditEvents(orgId),
  };
}

// ============================================================================
// Payment Status Tracking, Products Catalog, Incoming Inbox & Super-Admin
// ============================================================================

function ensureDemoCatalogAndInbox(db: DatabaseSync) {
  const demoOrgId = "org_demo_nordcloud_01";
  const orgExists = db.prepare("SELECT id FROM organizations WHERE id = ?").get(demoOrgId);
  if (!orgExists) return;

  const prodCount = db.prepare("SELECT COUNT(*) as c FROM products WHERE org_id = ?").get(demoOrgId) as { c: number };
  if (Number(prodCount.c) === 0) {
    const now = new Date().toISOString();
    const items = [
      { id: "prod_demo_01", sku: "SAAS-BIZ", name: "NormInvoice Business Plan (Monthly)", desc: "Automated ZUGFeRD & XRechnung bridge up to 500 docs/mo", unit: "MON", price: 49, vatCat: "S", vatRate: 19 },
      { id: "prod_demo_02", sku: "CONS-ARCH", name: "EN 16931 ERP Integration Consulting", desc: "Senior systems integration & DATEV mapping", unit: "HUR", price: 145, vatCat: "S", vatRate: 19 },
      { id: "prod_demo_03", sku: "SUP-SLA", name: "Enterprise GoBD Compliance Support", desc: "Dedicated EU compliance SLA & audit support", unit: "MON", price: 290, vatCat: "S", vatRate: 19 },
    ];
    const stmt = db.prepare(
      `INSERT INTO products (id, org_id, sku, name, description, unit_code, unit_price, vat_category, vat_rate, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const p of items) {
      stmt.run(p.id, demoOrgId, p.sku, p.name, p.desc, p.unit, p.price, p.vatCat, p.vatRate, now, now);
    }
  }

  const inCount = db.prepare("SELECT COUNT(*) as c FROM incoming_invoices WHERE org_id = ?").get(demoOrgId) as { c: number };
  if (Number(inCount.c) === 0) {
    const sample = structuredClone(GOLDEN_FIXTURES[0]!.invoice);
    sample.invoiceNumber = "SUP-2026-8812";
    sample.seller.name = "Hetzner Cloud Infrastructure GmbH";
    sample.seller.vatId = "DE812871812";
    sample.buyer.name = "NordCloud Software GmbH";
    saveIncomingInvoiceForOrg(demoOrgId, sample, {
      filename: "Hetzner_SUP-2026-8812_ZUGFeRD.pdf",
      detectedStandard: "ZUGFeRD 2.3 (EN 16931)",
      actorEmail: "system@norminvoice.eu",
    });
  }
}

export function setInvoicePaymentStatus(
  orgId: string,
  invoiceId: string,
  status: "PAID" | "UNPAID",
  actorEmail: string
): InvoiceRecord | null {
  const db = getDb();
  const inv = getInvoiceForOrg(orgId, invoiceId);
  if (!inv) return null;
  const now = new Date().toISOString();
  const paidAt = status === "PAID" ? now : null;
  db.prepare("UPDATE invoices SET payment_status = ?, paid_at = ?, updated_at = ? WHERE id = ? AND org_id = ?").run(
    status,
    paidAt,
    now,
    invoiceId,
    orgId
  );
  appendOrgAuditEvent(orgId, invoiceId, inv.invoiceNumber, status === "PAID" ? "MARKED_PAID" : "MARKED_UNPAID", actorEmail, {
    paymentStatus: status,
  });
  return getInvoiceForOrg(orgId, invoiceId);
}

function mapProductRow(r: Record<string, any>): ProductRecord {
  return {
    id: r.id,
    orgId: r.org_id,
    sku: r.sku,
    name: r.name,
    description: r.description,
    unitCode: r.unit_code,
    unitPrice: Number(r.unit_price),
    vatCategory: r.vat_category,
    vatRate: Number(r.vat_rate),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function listProductsForOrg(orgId: string): ProductRecord[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM products WHERE org_id = ? ORDER BY updated_at DESC").all(orgId) as Array<Record<string, any>>;
  return rows.map(mapProductRow);
}

export function createProductForOrg(
  orgId: string,
  input: Omit<ProductRecord, "id" | "orgId" | "createdAt" | "updatedAt">
): ProductRecord {
  const db = getDb();
  const id = `prod_${crypto.randomBytes(6).toString("hex")}`;
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO products (id, org_id, sku, name, description, unit_code, unit_price, vat_category, vat_rate, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    orgId,
    (input.sku || "").trim().toUpperCase(),
    input.name.trim(),
    input.description || "",
    input.unitCode || "HUR",
    Number(input.unitPrice) || 0,
    input.vatCategory || "S",
    Number(input.vatRate) || 0,
    now,
    now
  );
  return mapProductRow(db.prepare("SELECT * FROM products WHERE id = ? AND org_id = ?").get(id, orgId) as Record<string, any>);
}

export function updateProductForOrg(orgId: string, id: string, patch: Partial<ProductRecord>): ProductRecord | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM products WHERE id = ? AND org_id = ?").get(id, orgId) as Record<string, any> | undefined;
  if (!row) return null;
  const curr = mapProductRow(row);
  const defined = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)) as Partial<ProductRecord>;
  const next = { ...curr, ...defined, updatedAt: new Date().toISOString() };
  db.prepare(
    `UPDATE products SET sku=?, name=?, description=?, unit_code=?, unit_price=?, vat_category=?, vat_rate=?, updated_at=?
     WHERE id=? AND org_id=?`
  ).run(next.sku, next.name, next.description, next.unitCode, Number(next.unitPrice) || 0, next.vatCategory, Number(next.vatRate) || 0, next.updatedAt, id, orgId);
  return next;
}

export function deleteProductForOrg(orgId: string, id: string): boolean {
  const db = getDb();
  const res = db.prepare("DELETE FROM products WHERE id = ? AND org_id = ?").run(id, orgId);
  return Number(res.changes) > 0;
}

function mapIncomingRow(r: Record<string, any>): IncomingInvoiceRecord {
  return {
    id: r.id,
    orgId: r.org_id,
    filename: r.filename,
    invoiceNumber: r.invoice_number,
    issueDate: r.issue_date,
    dueDate: r.due_date,
    sellerName: r.seller_name,
    sellerVatId: r.seller_vat_id,
    sellerCountry: r.seller_country,
    currency: r.currency,
    netAmount: Number(r.net_amount),
    taxAmount: Number(r.tax_amount),
    grossAmount: Number(r.gross_amount),
    detectedStandard: r.detected_standard,
    validationPassed: Boolean(r.validation_passed),
    diagnostics: JSON.parse(r.diagnostics_json || "[]"),
    paymentStatus: r.payment_status === "PAID" ? "PAID" : "UNPAID",
    paidAt: r.paid_at ?? null,
    sha256Xml: r.sha256_xml,
    archiveLockedUntil: r.archive_locked_until,
    canonical: JSON.parse(r.canonical_json),
    createdAt: r.created_at,
  };
}

export function listIncomingInvoicesForOrg(orgId: string): IncomingInvoiceRecord[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM incoming_invoices WHERE org_id = ? ORDER BY created_at DESC")
    .all(orgId) as Array<Record<string, any>>;
  return rows.map(mapIncomingRow);
}

export function saveIncomingInvoiceForOrg(
  orgId: string,
  canonicalInput: CanonicalInvoice,
  meta: { filename: string; detectedStandard: string; actorEmail: string }
): IncomingInvoiceRecord {
  const db = getDb();
  const { normalized, totals } = computeCanonicalTotals(canonicalInput);
  const report = validateCanonicalInvoice(normalized);
  const isUbl = normalized.profile === "XRECHNUNG_UBL" || normalized.profile === "PEPPOL_BIS_3";
  const xml = isUbl ? serializeToUblXml(normalized) : serializeToCiiXml(normalized);
  const xmlHash = sha256(xml);
  const org = getOrgById(orgId);
  const lockDate = lockDateFromYears(org?.retentionYears ?? 8);
  const id = `in_${crypto.randomBytes(6).toString("hex")}`;
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO incoming_invoices (
       id, org_id, filename, invoice_number, issue_date, due_date, seller_name, seller_vat_id, seller_country,
       currency, net_amount, tax_amount, gross_amount, detected_standard, validation_passed, diagnostics_json,
       payment_status, paid_at, sha256_xml, archive_locked_until, canonical_json, created_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'UNPAID', NULL, ?, ?, ?, ?)`
  ).run(
    id,
    orgId,
    meta.filename,
    normalized.invoiceNumber,
    normalized.issueDate,
    normalized.payment.dueDate ?? null,
    normalized.seller.name,
    normalized.seller.vatId ?? null,
    normalized.seller.address.countryCode,
    normalized.currency,
    totals.taxExclusiveTotal,
    totals.taxTotal,
    totals.taxInclusiveTotal,
    meta.detectedStandard,
    report.valid ? 1 : 0,
    JSON.stringify(report.diagnostics),
    xmlHash,
    lockDate,
    JSON.stringify(normalized),
    now
  );

  appendOrgAuditEvent(orgId, id, normalized.invoiceNumber, "INCOMING_INVOICE_ARCHIVED", meta.actorEmail, {
    filename: meta.filename,
    sellerName: normalized.seller.name,
    sha256Xml: xmlHash,
    valid: report.valid,
  });

  return mapIncomingRow(db.prepare("SELECT * FROM incoming_invoices WHERE id = ? AND org_id = ?").get(id, orgId) as Record<string, any>);
}

export function setIncomingInvoicePaymentStatus(
  orgId: string,
  id: string,
  status: "PAID" | "UNPAID",
  actorEmail: string
): IncomingInvoiceRecord | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM incoming_invoices WHERE id = ? AND org_id = ?").get(id, orgId) as Record<string, any> | undefined;
  if (!row) return null;
  const paidAt = status === "PAID" ? new Date().toISOString() : null;
  db.prepare("UPDATE incoming_invoices SET payment_status = ?, paid_at = ? WHERE id = ? AND org_id = ?").run(
    status,
    paidAt,
    id,
    orgId
  );
  appendOrgAuditEvent(orgId, id, row.invoice_number, status === "PAID" ? "INCOMING_MARKED_PAID" : "INCOMING_MARKED_UNPAID", actorEmail, {
    paymentStatus: status,
  });
  return mapIncomingRow(db.prepare("SELECT * FROM incoming_invoices WHERE id = ? AND org_id = ?").get(id, orgId) as Record<string, any>);
}

const TIER_PRICE_EUR: Record<string, number> = { free: 0, solo: 19, business: 49, agency: 129 };

export function getPlatformAdminOverview() {
  const db = getDb();
  const orgs = db
    .prepare(
      `SELECT o.id, o.name, o.slug, o.onboarding_completed, o.retention_years, o.created_at,
              s.plan_tier, s.monthly_quota, s.status as sub_status,
              (SELECT u.email FROM memberships m JOIN users u ON u.id = m.user_id WHERE m.org_id = o.id AND m.role = 'owner' LIMIT 1) as owner_email,
              (SELECT COUNT(*) FROM invoices i WHERE i.org_id = o.id) as invoice_count,
              (SELECT COUNT(*) FROM incoming_invoices ii WHERE ii.org_id = o.id) as incoming_count,
              (SELECT COUNT(*) FROM customers c WHERE c.org_id = o.id) as customer_count,
              (SELECT COUNT(*) FROM memberships m WHERE m.org_id = o.id) as member_count
       FROM organizations o
       LEFT JOIN subscriptions s ON s.org_id = o.id
       ORDER BY o.created_at DESC`
    )
    .all() as Array<Record<string, any>>;

  const totalUsers = Number((db.prepare("SELECT COUNT(*) as c FROM users").get() as { c: number }).c);
  const totalInvoices = Number((db.prepare("SELECT COUNT(*) as c FROM invoices").get() as { c: number }).c);
  const totalIncoming = Number((db.prepare("SELECT COUNT(*) as c FROM incoming_invoices").get() as { c: number }).c);
  const recentWebhooks = db
    .prepare("SELECT * FROM webhook_logs ORDER BY id DESC LIMIT 25")
    .all() as Array<Record<string, any>>;

  const estimatedMrrEur = orgs.reduce((sum, o) => sum + (TIER_PRICE_EUR[o.plan_tier || "free"] ?? 0), 0);

  return {
    kpis: {
      totalOrganizations: orgs.length,
      totalUsers,
      totalOutgoingInvoices: totalInvoices,
      totalIncomingInvoices: totalIncoming,
      estimatedMrrEur,
    },
    organizations: orgs.map((o) => ({
      id: o.id,
      name: o.name,
      slug: o.slug,
      ownerEmail: o.owner_email || "—",
      onboardingCompleted: Boolean(o.onboarding_completed),
      planTier: o.plan_tier || "free",
      monthlyQuota: Number(o.monthly_quota ?? 3),
      monthlyUsed: countMonthlyInvoicesForOrg(o.id),
      invoiceCount: Number(o.invoice_count),
      incomingCount: Number(o.incoming_count),
      customerCount: Number(o.customer_count),
      memberCount: Number(o.member_count),
      gobdChainVerified: verifyOrgAuditHashChain(o.id).verified,
      createdAt: o.created_at,
    })),
    recentWebhooks: recentWebhooks.map((w) => ({
      id: Number(w.id),
      orgId: w.org_id,
      provider: w.provider,
      eventType: w.event_type,
      statusCode: Number(w.status_code),
      summary: w.summary,
      createdAt: w.created_at,
    })),
  };
}
