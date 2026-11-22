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
  paymentStatus: "UNPAID" | "PARTIAL" | "PAID";
  paidAmount: number;
  paidAt: string | null;
  approvalStatus: "NONE" | "APPROVED" | "REJECTED";
  accountingStatus: "UNPOSTED" | "EXPORTED";
  canonical: CanonicalInvoice;
  createdAt: string;
  updatedAt: string;
}

export interface InvoicePaymentRecord {
  id: string;
  orgId: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  method: string;
  reference: string;
  valueDate: string;
  recordedBy: string;
  createdAt: string;
}

export interface InvoiceCommentRecord {
  id: string;
  orgId: string;
  invoiceId: string;
  authorEmail: string;
  body: string;
  createdAt: string;
}

export interface AccountantDelegationRecord {
  id: string;
  orgId: string;
  orgName?: string;
  accountantEmail: string;
  accountantName: string;
  scope: "READ_EXPORT" | "FULL_BOOKKEEPING";
  expiresAt: string;
  revokedAt: string | null;
  grantedBy: string;
  createdAt: string;
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
  approvalStatus: "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  approvedBy: string | null;
  approvedAt: string | null;
  poReference: string | null;
  isDuplicate: boolean;
  hasOriginalXml: boolean;
  sha256Xml: string;
  archiveLockedUntil: string;
  canonical: CanonicalInvoice;
  createdAt: string;
}

export interface RecurringScheduleRecord {
  id: string;
  orgId: string;
  title: string;
  customerId: string;
  customerName: string;
  frequency: "MONTHLY" | "QUARTERLY" | "YEARLY";
  nextRunDate: string;
  lastRunAt: string | null;
  active: boolean;
  profile: CanonicalInvoice["profile"];
  currency: string;
  lineName: string;
  quantity: number;
  unitCode: string;
  unitPrice: number;
  vatCategory: "S" | "AE" | "E" | "Z" | "G" | "K" | "O";
  vatRate: number;
  autoEmail: boolean;
  runsCount: number;
  createdAt: string;
}

export interface AutomationRuleRecord {
  id: string;
  orgId: string;
  ruleKey: string;
  name: string;
  triggerEvent: string;
  actionSummary: string;
  enabled: boolean;
  executionsCount: number;
  lastRunAt: string | null;
  updatedAt: string;
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
  planTier: "free" | "trial" | "solo" | "business" | "agency";
  status: string;
  monthlyQuota: number;
  billingEmail: string;
  currency: string;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  trialActive: boolean;
  trialDaysRemaining: number;
  cancelAtPeriodEnd: boolean;
  updatedAt: string;
}

export interface ContactInquiryRecord {
  id: string;
  name: string;
  email: string;
  company: string;
  country: string;
  topic: string;
  message: string;
  marketingOptIn: boolean;
  status: "OPEN" | "IN_REVIEW" | "RESOLVED";
  createdAt: string;
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

    CREATE TABLE IF NOT EXISTS transmission_jobs (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      invoice_id TEXT NOT NULL,
      invoice_number TEXT NOT NULL,
      channel TEXT NOT NULL DEFAULT 'email',
      idempotency_key TEXT NOT NULL,
      recipient TEXT NOT NULL,
      cc TEXT,
      status TEXT NOT NULL DEFAULT 'QUEUED',
      attempts INTEGER NOT NULL DEFAULT 0,
      max_attempts INTEGER NOT NULL DEFAULT 6,
      next_attempt_at TEXT,
      provider TEXT,
      provider_ref TEXT,
      last_error TEXT,
      actor_email TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_txjobs_idem ON transmission_jobs(org_id, idempotency_key);
    CREATE INDEX IF NOT EXISTS idx_txjobs_due ON transmission_jobs(status, next_attempt_at);
    CREATE INDEX IF NOT EXISTS idx_txjobs_inv ON transmission_jobs(org_id, invoice_id, created_at DESC);

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

    CREATE TABLE IF NOT EXISTS recurring_schedules (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      frequency TEXT NOT NULL DEFAULT 'MONTHLY',
      next_run_date TEXT NOT NULL,
      last_run_at TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      profile TEXT NOT NULL DEFAULT 'ZUGFERD_EN16931',
      currency TEXT NOT NULL DEFAULT 'EUR',
      line_name TEXT NOT NULL,
      quantity REAL NOT NULL DEFAULT 1,
      unit_code TEXT NOT NULL DEFAULT 'MON',
      unit_price REAL NOT NULL DEFAULT 0,
      vat_category TEXT NOT NULL DEFAULT 'S',
      vat_rate REAL NOT NULL DEFAULT 19,
      auto_email INTEGER NOT NULL DEFAULT 0,
      runs_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_recurring_org ON recurring_schedules(org_id);

    CREATE TABLE IF NOT EXISTS automation_rules (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      rule_key TEXT NOT NULL,
      name TEXT NOT NULL,
      trigger_event TEXT NOT NULL,
      action_summary TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      executions_count INTEGER NOT NULL DEFAULT 0,
      last_run_at TEXT,
      updated_at TEXT NOT NULL,
      UNIQUE (org_id, rule_key)
    );
    CREATE INDEX IF NOT EXISTS idx_auto_org ON automation_rules(org_id);

    CREATE TABLE IF NOT EXISTS automation_runs (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      rule_id TEXT NOT NULL,
      rule_key TEXT NOT NULL,
      trigger_event TEXT NOT NULL,
      outcome TEXT NOT NULL,
      matched_count INTEGER NOT NULL DEFAULT 0,
      detail TEXT NOT NULL DEFAULT '',
      dry_run INTEGER NOT NULL DEFAULT 0,
      actor_email TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_autoruns_org ON automation_runs(org_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS invoice_payments (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
      invoice_number TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'EUR',
      method TEXT NOT NULL DEFAULT 'SEPA_TRANSFER',
      reference TEXT NOT NULL DEFAULT '',
      value_date TEXT NOT NULL,
      recorded_by TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_pay_org ON invoice_payments(org_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS invoice_comments (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
      author_email TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_comm_inv ON invoice_comments(org_id, invoice_id, created_at ASC);

    CREATE TABLE IF NOT EXISTS accountant_delegations (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      accountant_email TEXT NOT NULL,
      accountant_name TEXT NOT NULL DEFAULT '',
      scope TEXT NOT NULL DEFAULT 'READ_EXPORT',
      expires_at TEXT NOT NULL,
      revoked_at TEXT,
      granted_by TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_deleg_email ON accountant_delegations(lower(accountant_email));

    CREATE TABLE IF NOT EXISTS platform_admin_audit (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor_email TEXT NOT NULL,
      action TEXT NOT NULL,
      target_org_id TEXT,
      reason TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS auth_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      purpose TEXT NOT NULL,
      token_hash TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_authtok_hash ON auth_tokens(token_hash);

    CREATE TABLE IF NOT EXISTS contact_inquiries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT NOT NULL DEFAULT '',
      country TEXT NOT NULL DEFAULT '',
      topic TEXT NOT NULL DEFAULT 'general',
      message TEXT NOT NULL,
      marketing_opt_in INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'OPEN',
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_inquiries(created_at DESC);
  `);

  // Safe idempotent column migrations for existing SQLite databases
  const orgCols = db.prepare("PRAGMA table_info(organizations)").all() as Array<{ name: string }>;
  if (!orgCols.some((c) => c.name === "org_status")) {
    db.exec("ALTER TABLE organizations ADD COLUMN org_status TEXT NOT NULL DEFAULT 'ACTIVE';");
  }
  const invCols = db.prepare("PRAGMA table_info(invoices)").all() as Array<{ name: string }>;
  if (!invCols.some((c) => c.name === "payment_status")) {
    db.exec("ALTER TABLE invoices ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'UNPAID';");
  }
  if (!invCols.some((c) => c.name === "paid_at")) {
    db.exec("ALTER TABLE invoices ADD COLUMN paid_at TEXT;");
  }
  if (!invCols.some((c) => c.name === "paid_amount")) {
    db.exec("ALTER TABLE invoices ADD COLUMN paid_amount REAL NOT NULL DEFAULT 0;");
  }
  if (!invCols.some((c) => c.name === "approval_status")) {
    db.exec("ALTER TABLE invoices ADD COLUMN approval_status TEXT NOT NULL DEFAULT 'NONE';");
  }
  if (!invCols.some((c) => c.name === "accounting_status")) {
    db.exec("ALTER TABLE invoices ADD COLUMN accounting_status TEXT NOT NULL DEFAULT 'UNPOSTED';");
  }
  const inCols = db.prepare("PRAGMA table_info(incoming_invoices)").all() as Array<{ name: string }>;
  if (!inCols.some((c) => c.name === "approval_status")) {
    db.exec("ALTER TABLE incoming_invoices ADD COLUMN approval_status TEXT NOT NULL DEFAULT 'PENDING_REVIEW';");
  }
  if (!inCols.some((c) => c.name === "approved_by")) {
    db.exec("ALTER TABLE incoming_invoices ADD COLUMN approved_by TEXT;");
  }
  if (!inCols.some((c) => c.name === "approved_at")) {
    db.exec("ALTER TABLE incoming_invoices ADD COLUMN approved_at TEXT;");
  }
  if (!inCols.some((c) => c.name === "po_reference")) {
    db.exec("ALTER TABLE incoming_invoices ADD COLUMN po_reference TEXT;");
  }
  if (!inCols.some((c) => c.name === "is_duplicate")) {
    db.exec("ALTER TABLE incoming_invoices ADD COLUMN is_duplicate INTEGER NOT NULL DEFAULT 0;");
  }
  if (!inCols.some((c) => c.name === "original_xml")) {
    db.exec("ALTER TABLE incoming_invoices ADD COLUMN original_xml TEXT;");
  }
  const userCols = db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>;
  if (!userCols.some((c) => c.name === "session_version")) {
    db.exec("ALTER TABLE users ADD COLUMN session_version INTEGER NOT NULL DEFAULT 0;");
  }
  if (!userCols.some((c) => c.name === "email_verified")) {
    db.exec("ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0;");
  }
  if (!userCols.some((c) => c.name === "marketing_opt_in")) {
    db.exec("ALTER TABLE users ADD COLUMN marketing_opt_in INTEGER NOT NULL DEFAULT 0;");
  }
  const subCols = db.prepare("PRAGMA table_info(subscriptions)").all() as Array<{ name: string }>;
  if (!subCols.some((c) => c.name === "trial_started_at")) {
    db.exec("ALTER TABLE subscriptions ADD COLUMN trial_started_at TEXT;");
  }
  if (!subCols.some((c) => c.name === "trial_ends_at")) {
    db.exec("ALTER TABLE subscriptions ADD COLUMN trial_ends_at TEXT;");
  }
  if (!subCols.some((c) => c.name === "cancel_at_period_end")) {
    db.exec("ALTER TABLE subscriptions ADD COLUMN cancel_at_period_end INTEGER NOT NULL DEFAULT 0;");
  }
  if (!subCols.some((c) => c.name === "currency")) {
    db.exec("ALTER TABLE subscriptions ADD COLUMN currency TEXT NOT NULL DEFAULT 'USD';");
  }

  globalSqlite.__normInvoiceSqlite = db;
  // SECURITY: never seed the known-password demo/super-admin workspace into a production
  // database. The demo account (founder@nordcloud-gmbh.de / DemoPass2026!) is public and is
  // also the default super-admin — seeding it in prod is a credential backdoor.
  const demoSeedAllowed =
    process.env.ENABLE_DEMO_LOGIN === "true" ||
    (process.env.NODE_ENV !== "production" && process.env.ENABLE_DEMO_LOGIN !== "false");
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

export function findUserByEmailDb(email: string): (UserRecord & { orgId: string; orgName: string; role: MembershipRecord["role"]; onboardingCompleted: boolean; sessionVersion: number; emailVerified: boolean }) | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT u.id, u.email, u.password_hash, u.full_name, u.created_at, u.session_version, u.email_verified,
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
    emailVerified: Boolean(row.email_verified),
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
  marketingOptIn?: boolean;
  startPlan?: "trial" | "free";
}) {
  const db = getDb();
  const normEmail = params.email.trim().toLowerCase();
  if (findUserByEmailDb(normEmail)) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const nowDate = new Date();
  const now = nowDate.toISOString();
  const trialEndsAt = new Date(nowDate.getTime() + 15 * 86_400_000).toISOString();
  const isTrial = params.startPlan !== "free";
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
    `INSERT INTO users (id, email, password_hash, full_name, email_verified, marketing_opt_in, created_at)
     VALUES (?, ?, ?, ?, 0, ?, ?)`
  ).run(userId, normEmail, hashPasswordScrypt(params.password), params.fullName.trim(), params.marketingOptIn ? 1 : 0, now);

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
    `INSERT INTO subscriptions (
       org_id, plan_tier, status, monthly_quota, billing_email, currency,
       trial_started_at, trial_ends_at, cancel_at_period_end, updated_at
     ) VALUES (?, ?, ?, ?, ?, 'USD', ?, ?, 0, ?)`
  ).run(
    orgId,
    isTrial ? "trial" : "free",
    isTrial ? "trialing" : "active",
    isTrial ? 15 : 5,
    normEmail,
    isTrial ? now : null,
    isTrial ? trialEndsAt : null,
    now
  );

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
    paymentStatus: r.payment_status === "PAID" ? "PAID" : r.payment_status === "PARTIAL" ? "PARTIAL" : "UNPAID",
    paidAmount: Number(r.paid_amount ?? 0),
    paidAt: r.paid_at ?? null,
    approvalStatus: r.approval_status === "APPROVED" ? "APPROVED" : r.approval_status === "REJECTED" ? "REJECTED" : "NONE",
    accountingStatus: r.accounting_status === "EXPORTED" ? "EXPORTED" : "UNPOSTED",
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

// ─────────────────────────────────────────────────────────────────────────────
// Durable transmission outbox (ADR-004): at-least-once delivery with idempotency.
// Jobs are written in the same DB as the invoice (outbox pattern) and drained by
// an idempotent worker/drainer. A UNIQUE (org_id, idempotency_key) guarantees no
// duplicate legal submission even under double-click or retry.
// ─────────────────────────────────────────────────────────────────────────────

export type TransmissionStatus = "QUEUED" | "SENDING" | "SENT" | "FAILED" | "DEAD";

export interface TransmissionJobRecord {
  id: string;
  orgId: string;
  invoiceId: string;
  invoiceNumber: string;
  channel: string;
  idempotencyKey: string;
  recipient: string;
  cc: string | null;
  status: TransmissionStatus;
  attempts: number;
  maxAttempts: number;
  nextAttemptAt: string | null;
  provider: string | null;
  providerRef: string | null;
  lastError: string | null;
  actorEmail: string;
  createdAt: string;
  updatedAt: string;
}

function mapTransmissionRow(r: Record<string, any>): TransmissionJobRecord {
  return {
    id: r.id,
    orgId: r.org_id,
    invoiceId: r.invoice_id,
    invoiceNumber: r.invoice_number,
    channel: r.channel,
    idempotencyKey: r.idempotency_key,
    recipient: r.recipient,
    cc: r.cc ?? null,
    status: r.status as TransmissionStatus,
    attempts: Number(r.attempts),
    maxAttempts: Number(r.max_attempts),
    nextAttemptAt: r.next_attempt_at ?? null,
    provider: r.provider ?? null,
    providerRef: r.provider_ref ?? null,
    lastError: r.last_error ?? null,
    actorEmail: r.actor_email,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

/**
 * Idempotently enqueue a transmission job. The idempotency key binds
 * invoice + channel + recipient (the "submission intent"), so repeat calls
 * return the existing job instead of creating a duplicate. `created` is false
 * when an identical job already existed.
 */
export function enqueueTransmissionJob(params: {
  orgId: string;
  invoiceId: string;
  invoiceNumber: string;
  channel?: string;
  recipient: string;
  cc?: string | null;
  actorEmail: string;
  maxAttempts?: number;
}): { job: TransmissionJobRecord; created: boolean } {
  const db = getDb();
  const channel = (params.channel || "email").toLowerCase();
  const idempotencyKey = `${params.invoiceId}:${channel}:${params.recipient.trim().toLowerCase()}`;
  const now = new Date().toISOString();
  const id = `tx_${crypto.randomBytes(6).toString("hex")}`;

  const info = db
    .prepare(
      `INSERT OR IGNORE INTO transmission_jobs
        (id, org_id, invoice_id, invoice_number, channel, idempotency_key, recipient, cc,
         status, attempts, max_attempts, next_attempt_at, actor_email, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'QUEUED', 0, ?, NULL, ?, ?, ?)`
    )
    .run(
      id,
      params.orgId,
      params.invoiceId,
      params.invoiceNumber,
      channel,
      idempotencyKey,
      params.recipient.trim(),
      params.cc?.trim() || null,
      params.maxAttempts ?? 6,
      params.actorEmail,
      now,
      now
    );

  const row = db
    .prepare("SELECT * FROM transmission_jobs WHERE org_id = ? AND idempotency_key = ?")
    .get(params.orgId, idempotencyKey) as Record<string, any>;

  return { job: mapTransmissionRow(row), created: Number(info.changes) === 1 };
}

export function getTransmissionJob(jobId: string): TransmissionJobRecord | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM transmission_jobs WHERE id = ?").get(jobId) as
    | Record<string, any>
    | undefined;
  return row ? mapTransmissionRow(row) : null;
}

/**
 * Atomically claim a job for processing (QUEUED/FAILED -> SENDING) if it is due.
 * Returns true only for the single caller that won the claim, so the external
 * send runs at most once per attempt (no duplicate submission).
 */
export function claimTransmissionJob(jobId: string): boolean {
  const db = getDb();
  const now = new Date().toISOString();
  const info = db
    .prepare(
      `UPDATE transmission_jobs
         SET status = 'SENDING', attempts = attempts + 1, updated_at = ?
       WHERE id = ?
         AND status IN ('QUEUED', 'FAILED')
         AND attempts < max_attempts
         AND (next_attempt_at IS NULL OR next_attempt_at <= ?)`
    )
    .run(now, jobId, now);
  return Number(info.changes) === 1;
}

export function markTransmissionSent(
  jobId: string,
  provider: string,
  providerRef: string
): void {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(
    `UPDATE transmission_jobs
       SET status = 'SENT', provider = ?, provider_ref = ?, last_error = NULL,
           next_attempt_at = NULL, updated_at = ?
     WHERE id = ?`
  ).run(provider, providerRef, now, jobId);
}

/**
 * Record a failed attempt. Transient failures are re-queued with a future
 * next_attempt_at (exponential backoff); when attempts reach max_attempts, or
 * the failure is permanent, the job is dead-lettered (DEAD).
 */
export function markTransmissionFailed(
  jobId: string,
  errorMessage: string,
  opts: { permanent?: boolean; nextAttemptAt?: string | null } = {}
): TransmissionJobRecord | null {
  const db = getDb();
  const now = new Date().toISOString();
  const job = getTransmissionJob(jobId);
  if (!job) return null;
  const exhausted = job.attempts >= job.maxAttempts;
  const dead = opts.permanent || exhausted || !opts.nextAttemptAt;
  db.prepare(
    `UPDATE transmission_jobs
       SET status = ?, last_error = ?, next_attempt_at = ?, updated_at = ?
     WHERE id = ?`
  ).run(
    dead ? "DEAD" : "FAILED",
    errorMessage.slice(0, 500),
    dead ? null : opts.nextAttemptAt ?? null,
    now,
    jobId
  );
  return getTransmissionJob(jobId);
}

/** List ids of jobs that are due for a (re)attempt, oldest first. */
export function listDueTransmissionJobIds(limit = 25): string[] {
  const db = getDb();
  const now = new Date().toISOString();
  const rows = db
    .prepare(
      `SELECT id FROM transmission_jobs
        WHERE status IN ('QUEUED', 'FAILED')
          AND attempts < max_attempts
          AND (next_attempt_at IS NULL OR next_attempt_at <= ?)
        ORDER BY created_at ASC
        LIMIT ?`
    )
    .all(now, limit) as Array<{ id: string }>;
  return rows.map((r) => r.id);
}

export function listTransmissionJobsForOrg(
  orgId: string,
  invoiceId?: string
): TransmissionJobRecord[] {
  const db = getDb();
  const rows = invoiceId
    ? (db
        .prepare(
          "SELECT * FROM transmission_jobs WHERE org_id = ? AND invoice_id = ? ORDER BY created_at DESC LIMIT 100"
        )
        .all(orgId, invoiceId) as Array<Record<string, any>>)
    : (db
        .prepare(
          "SELECT * FROM transmission_jobs WHERE org_id = ? ORDER BY created_at DESC LIMIT 100"
        )
        .all(orgId) as Array<Record<string, any>>);
  return rows.map(mapTransmissionRow);
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
      monthlyQuota: 5,
      billingEmail: "",
      currency: "USD",
      trialStartedAt: null,
      trialEndsAt: null,
      trialActive: false,
      trialDaysRemaining: 0,
      cancelAtPeriodEnd: false,
      updatedAt: new Date().toISOString(),
    };
  }

  let planTier = (r.plan_tier || "free") as SubscriptionRecord["planTier"];
  let status = String(r.status || "active");
  let monthlyQuota = Number(r.monthly_quota ?? 5);
  const trialStartedAt: string | null = r.trial_started_at ?? null;
  const trialEndsAt: string | null = r.trial_ends_at ?? null;
  const nowMs = Date.now();
  const endsMs = trialEndsAt ? Date.parse(trialEndsAt) : 0;

  let trialActive = false;
  let trialDaysRemaining = 0;

  if (planTier === "trial" && trialEndsAt && Number.isFinite(endsMs)) {
    const remainingMs = endsMs - nowMs;
    if (remainingMs > 0) {
      trialActive = true;
      trialDaysRemaining = Math.max(1, Math.ceil(remainingMs / 86_400_000));
    } else {
      // Trial expired without card on file -> downgrade cleanly to Free (never silently bill)
      planTier = "free";
      status = "active";
      monthlyQuota = 5;
      db.prepare(
        `UPDATE subscriptions SET plan_tier = 'free', status = 'active', monthly_quota = 5, updated_at = ? WHERE org_id = ?`
      ).run(new Date().toISOString(), orgId);
    }
  }

  return {
    orgId: r.org_id,
    planTier,
    status,
    monthlyQuota,
    billingEmail: r.billing_email || "",
    currency: r.currency || "USD",
    trialStartedAt,
    trialEndsAt,
    trialActive,
    trialDaysRemaining,
    cancelAtPeriodEnd: Boolean(r.cancel_at_period_end),
    updatedAt: r.updated_at,
  };
}

export function updateSubscriptionForOrg(orgId: string, tier: SubscriptionRecord["planTier"], quota: number) {
  const db = getDb();
  const nowDate = new Date();
  const now = nowDate.toISOString();
  const existing = db.prepare("SELECT trial_started_at, trial_ends_at FROM subscriptions WHERE org_id = ?").get(orgId) as
    | { trial_started_at: string | null; trial_ends_at: string | null }
    | undefined;

  const isTrial = tier === "trial";
  const trialStart = isTrial ? existing?.trial_started_at || now : existing?.trial_started_at || null;
  const trialEnd = isTrial
    ? existing?.trial_ends_at || new Date(nowDate.getTime() + 15 * 86_400_000).toISOString()
    : existing?.trial_ends_at || null;
  const status = isTrial ? "trialing" : "active";

  db.prepare(
    `INSERT INTO subscriptions (
       org_id, plan_tier, status, monthly_quota, currency, trial_started_at, trial_ends_at, cancel_at_period_end, updated_at
     ) VALUES (?, ?, ?, ?, 'USD', ?, ?, 0, ?)
     ON CONFLICT (org_id) DO UPDATE SET
       plan_tier = excluded.plan_tier,
       status = excluded.status,
       monthly_quota = excluded.monthly_quota,
       trial_started_at = excluded.trial_started_at,
       trial_ends_at = excluded.trial_ends_at,
       cancel_at_period_end = 0,
       updated_at = excluded.updated_at`
  ).run(orgId, tier, status, quota, trialStart, trialEnd, now);
  return getSubscriptionForOrg(orgId);
}

export function cancelSubscriptionRenewalForOrg(orgId: string, actorEmail: string): SubscriptionRecord {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare("UPDATE subscriptions SET cancel_at_period_end = 1, updated_at = ? WHERE org_id = ?").run(now, orgId);
  appendOrgAuditEvent(orgId, null, "BILLING", "SUBSCRIPTION_RENEWAL_CANCELLED", actorEmail, {
    cancelAtPeriodEnd: true,
  });
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
    approvalStatus: r.approval_status === "APPROVED" ? "APPROVED" : r.approval_status === "REJECTED" ? "REJECTED" : "PENDING_REVIEW",
    approvedBy: r.approved_by ?? null,
    approvedAt: r.approved_at ?? null,
    poReference: r.po_reference ?? null,
    isDuplicate: Boolean(r.is_duplicate),
    hasOriginalXml: Boolean(r.original_xml),
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

export function getIncomingInvoiceForOrg(orgId: string, id: string): IncomingInvoiceRecord | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM incoming_invoices WHERE id = ? AND org_id = ?")
    .get(id, orgId) as Record<string, any> | undefined;
  return row ? mapIncomingRow(row) : null;
}

/** Original uploaded XML bytes for export / true original-vs-parsed view. */
export function getIncomingInvoiceOriginalXml(
  orgId: string,
  id: string
): { xml: string; filename: string; invoiceNumber: string } | null {
  const db = getDb();
  const row = db
    .prepare("SELECT original_xml, filename, invoice_number FROM incoming_invoices WHERE id = ? AND org_id = ?")
    .get(id, orgId) as { original_xml: string | null; filename: string; invoice_number: string } | undefined;
  if (!row || !row.original_xml) return null;
  return { xml: row.original_xml, filename: row.filename, invoiceNumber: row.invoice_number };
}

export function saveIncomingInvoiceForOrg(
  orgId: string,
  canonicalInput: CanonicalInvoice,
  meta: { filename: string; detectedStandard: string; actorEmail: string; originalXml?: string }
): IncomingInvoiceRecord {
  const db = getDb();
  const { normalized, totals } = computeCanonicalTotals(canonicalInput);
  const report = validateCanonicalInvoice(normalized);
  const isUbl = normalized.profile === "XRECHNUNG_UBL" || normalized.profile === "PEPPOL_BIS_3";
  const xml = isUbl ? serializeToUblXml(normalized) : serializeToCiiXml(normalized);
  // Preserve the supplier's ORIGINAL uploaded bytes for a true original-vs-parsed
  // view and export. Fall back to the re-serialized XML for non-upload sources.
  const originalXml = meta.originalXml?.trim() || xml;
  const xmlHash = sha256(xml);
  const org = getOrgById(orgId);
  const lockDate = lockDateFromYears(org?.retentionYears ?? 8);
  const id = `in_${crypto.randomBytes(6).toString("hex")}`;
  const now = new Date().toISOString();

  // Automatic Duplicate Detection (same supplier + invoice number in org's incoming inbox)
  const dup = db
    .prepare("SELECT id FROM incoming_invoices WHERE org_id = ? AND lower(seller_name) = lower(?) AND lower(invoice_number) = lower(?) LIMIT 1")
    .get(orgId, normalized.seller.name, normalized.invoiceNumber);
  const isDuplicate = Boolean(dup);

  db.prepare(
    `INSERT INTO incoming_invoices (
       id, org_id, filename, invoice_number, issue_date, due_date, seller_name, seller_vat_id, seller_country,
       currency, net_amount, tax_amount, gross_amount, detected_standard, validation_passed, diagnostics_json,
       payment_status, paid_at, approval_status, po_reference, is_duplicate, original_xml, sha256_xml, archive_locked_until, canonical_json, created_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'UNPAID', NULL, 'PENDING_REVIEW', ?, ?, ?, ?, ?, ?, ?)`
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
    normalized.purchaseOrderReference ?? null,
    isDuplicate ? 1 : 0,
    originalXml,
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

const TIER_PRICE_EUR: Record<string, number> = { free: 0, trial: 0, solo: 39, business: 49, agency: 129 };

export function getPlatformAdminOverview() {
  const db = getDb();
  const orgs = db
    .prepare(
      `SELECT o.id, o.name, o.slug, o.org_status, o.onboarding_completed, o.retention_years, o.created_at,
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
  const adminAudit = db
    .prepare("SELECT * FROM platform_admin_audit ORDER BY id DESC LIMIT 30")
    .all() as Array<Record<string, any>>;
  const contactInquiries = listContactInquiries();

  const estimatedMrrEur = orgs.reduce((sum, o) => sum + (TIER_PRICE_EUR[o.plan_tier || "free"] ?? 0), 0);

  return {
    kpis: {
      totalOrganizations: orgs.length,
      totalUsers,
      totalOutgoingInvoices: totalInvoices,
      totalIncomingInvoices: totalIncoming,
      estimatedMrrEur,
      openInquiries: contactInquiries.filter((i) => i.status === "OPEN").length,
    },
    organizations: orgs.map((o) => ({
      id: o.id,
      name: o.name,
      slug: o.slug,
      orgStatus: o.org_status === "SUSPENDED" ? "SUSPENDED" : "ACTIVE",
      ownerEmail: o.owner_email || "—",
      onboardingCompleted: Boolean(o.onboarding_completed),
      planTier: o.plan_tier || "free",
      monthlyQuota: Number(o.monthly_quota ?? 5),
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
    adminAudit: adminAudit.map((a) => ({
      id: Number(a.id),
      actorEmail: a.actor_email,
      action: a.action,
      targetOrgId: a.target_org_id,
      reason: a.reason,
      createdAt: a.created_at,
    })),
    contactInquiries,
  };
}

export function adminSetOrgStatus(
  orgId: string,
  status: "ACTIVE" | "SUSPENDED",
  reason: string,
  actorEmail: string
): boolean {
  const db = getDb();
  const res = db.prepare("UPDATE organizations SET org_status = ? WHERE id = ?").run(status, orgId);
  if (Number(res.changes) === 0) return false;
  const now = new Date().toISOString();
  db.prepare(
    "INSERT INTO platform_admin_audit (actor_email, action, target_org_id, reason, created_at) VALUES (?, ?, ?, ?, ?)"
  ).run(actorEmail, status === "SUSPENDED" ? "TENANT_SUSPENDED" : "TENANT_REACTIVATED", orgId, reason.trim() || "Operator action", now);
  return true;
}

export function recordPlatformAdminAudit(actorEmail: string, action: string, targetOrgId: string | null, reason: string) {
  const db = getDb();
  db.prepare(
    "INSERT INTO platform_admin_audit (actor_email, action, target_org_id, reason, created_at) VALUES (?, ?, ?, ?, ?)"
  ).run(actorEmail, action, targetOrgId, reason.trim() || "Operator action", new Date().toISOString());
}

// ============================================================================
// Phase 7: Incoming Approvals, Recurring Billing, Automations, Reports & Search
// ============================================================================

export function setIncomingInvoiceApproval(
  orgId: string,
  id: string,
  approvalStatus: "APPROVED" | "REJECTED" | "PENDING_REVIEW",
  actorEmail: string,
  poReference?: string
): IncomingInvoiceRecord | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM incoming_invoices WHERE id = ? AND org_id = ?").get(id, orgId) as Record<string, any> | undefined;
  if (!row) return null;
  const now = new Date().toISOString();
  db.prepare(
    `UPDATE incoming_invoices SET approval_status = ?, approved_by = ?, approved_at = ?, po_reference = COALESCE(?, po_reference)
     WHERE id = ? AND org_id = ?`
  ).run(approvalStatus, actorEmail, now, poReference ?? null, id, orgId);

  appendOrgAuditEvent(orgId, id, row.invoice_number, `INCOMING_${approvalStatus}`, actorEmail, {
    approvalStatus,
    poReference: poReference ?? row.po_reference ?? null,
  });

  return mapIncomingRow(db.prepare("SELECT * FROM incoming_invoices WHERE id = ? AND org_id = ?").get(id, orgId) as Record<string, any>);
}

function mapRecurringRow(r: Record<string, any>): RecurringScheduleRecord {
  return {
    id: r.id,
    orgId: r.org_id,
    title: r.title,
    customerId: r.customer_id,
    customerName: r.customer_name,
    frequency: r.frequency,
    nextRunDate: r.next_run_date,
    lastRunAt: r.last_run_at ?? null,
    active: Boolean(r.active),
    profile: r.profile,
    currency: r.currency,
    lineName: r.line_name,
    quantity: Number(r.quantity),
    unitCode: r.unit_code,
    unitPrice: Number(r.unit_price),
    vatCategory: r.vat_category,
    vatRate: Number(r.vat_rate),
    autoEmail: Boolean(r.auto_email),
    runsCount: Number(r.runs_count),
    createdAt: r.created_at,
  };
}

export function listRecurringSchedulesForOrg(orgId: string): RecurringScheduleRecord[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM recurring_schedules WHERE org_id = ? ORDER BY created_at DESC")
    .all(orgId) as Array<Record<string, any>>;
  return rows.map(mapRecurringRow);
}

export function createRecurringScheduleForOrg(
  orgId: string,
  input: {
    title: string;
    customerId: string;
    frequency: "MONTHLY" | "QUARTERLY" | "YEARLY";
    nextRunDate: string;
    profile?: CanonicalInvoice["profile"];
    currency?: string;
    lineName: string;
    quantity?: number;
    unitCode?: string;
    unitPrice: number;
    vatCategory?: RecurringScheduleRecord["vatCategory"];
    vatRate?: number;
    autoEmail?: boolean;
  }
): RecurringScheduleRecord {
  const db = getDb();
  const customer = getCustomerForOrg(orgId, input.customerId);
  if (!customer) throw new Error("Selected customer not found in your organization.");
  const id = `rec_${crypto.randomBytes(6).toString("hex")}`;
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO recurring_schedules (
       id, org_id, title, customer_id, customer_name, frequency, next_run_date, active,
       profile, currency, line_name, quantity, unit_code, unit_price, vat_category, vat_rate, auto_email, runs_count, created_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`
  ).run(
    id,
    orgId,
    input.title.trim(),
    customer.id,
    customer.legalName,
    input.frequency,
    input.nextRunDate,
    input.profile || customer.defaultFormat || "ZUGFERD_EN16931",
    (input.currency || "EUR").toUpperCase(),
    input.lineName.trim(),
    Number(input.quantity) || 1,
    input.unitCode || "MON",
    Number(input.unitPrice) || 0,
    input.vatCategory || "S",
    Number(input.vatRate ?? 19),
    input.autoEmail ? 1 : 0,
    now
  );

  return mapRecurringRow(db.prepare("SELECT * FROM recurring_schedules WHERE id = ? AND org_id = ?").get(id, orgId) as Record<string, any>);
}

export function toggleRecurringScheduleForOrg(orgId: string, id: string, active: boolean): RecurringScheduleRecord | null {
  const db = getDb();
  const res = db.prepare("UPDATE recurring_schedules SET active = ? WHERE id = ? AND org_id = ?").run(active ? 1 : 0, id, orgId);
  if (Number(res.changes) === 0) return null;
  return mapRecurringRow(db.prepare("SELECT * FROM recurring_schedules WHERE id = ? AND org_id = ?").get(id, orgId) as Record<string, any>);
}

export function deleteRecurringScheduleForOrg(orgId: string, id: string): boolean {
  const db = getDb();
  const res = db.prepare("DELETE FROM recurring_schedules WHERE id = ? AND org_id = ?").run(id, orgId);
  return Number(res.changes) > 0;
}

function advanceDateByFrequency(isoDate: string, freq: "MONTHLY" | "QUARTERLY" | "YEARLY"): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  if (freq === "YEARLY") d.setUTCFullYear(d.getUTCFullYear() + 1);
  else if (freq === "QUARTERLY") d.setUTCMonth(d.getUTCMonth() + 3);
  else d.setUTCMonth(d.getUTCMonth() + 1);
  return d.toISOString().slice(0, 10);
}

export function runRecurringScheduleNow(orgId: string, id: string, actorEmail: string): { invoice: InvoiceRecord; schedule: RecurringScheduleRecord } | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM recurring_schedules WHERE id = ? AND org_id = ?").get(id, orgId) as Record<string, any> | undefined;
  if (!row) return null;
  const sched = mapRecurringRow(row);
  const seller = getSellerSettings(orgId);
  const customer = getCustomerForOrg(orgId, sched.customerId);
  if (!seller || !customer) throw new Error("Seller settings or customer missing.");

  const today = new Date().toISOString().slice(0, 10);
  const due = new Date(`${today}T00:00:00Z`);
  due.setUTCDate(due.getUTCDate() + (seller.defaultDueDays || 14));
  const invNum = consumeNextInvoiceNumber(orgId, 380);

  const canonical: CanonicalInvoice = {
    invoiceNumber: invNum,
    issueDate: today,
    typeCode: 380,
    currency: sched.currency,
    buyerReference: customer.leitwegId || undefined,
    notes: [`Recurring schedule: ${sched.title}`],
    locale: seller.defaultLocale,
    profile: sched.profile,
    seller: sellerSettingsToCanonicalParty(seller),
    buyer: {
      name: customer.legalName,
      vatId: customer.vatId || undefined,
      electronicAddress: customer.electronicAddress || undefined,
      electronicAddressScheme: "EM",
      address: {
        street: customer.street || "Business Street 1",
        postalCode: customer.postalCode || "10115",
        city: customer.city || "Berlin",
        countryCode: customer.countryCode || "DE",
      },
    },
    payment: {
      meansCode: "58",
      paymentTerms: seller.defaultPaymentTerms || undefined,
      dueDate: due.toISOString().slice(0, 10),
      iban: seller.iban || undefined,
      bic: seller.bic || undefined,
      accountName: seller.accountHolder || seller.legalName,
    },
    lines: [
      {
        id: "1",
        name: sched.lineName,
        quantity: sched.quantity,
        unitCode: sched.unitCode,
        unitPrice: sched.unitPrice,
        lineAllowance: 0,
        lineCharge: 0,
        vatCategory: sched.vatCategory,
        vatRate: sched.vatRate,
      },
    ],
    allowancesTotal: 0,
    chargesTotal: 0,
    prepaidAmount: 0,
    roundingAmount: 0,
  };

  const invoice = saveInvoiceForOrg(orgId, canonical, {
    customerId: customer.id,
    source: "manual",
    sourceRef: `RECURRING_${sched.id}`,
    actorEmail,
  });

  const nextDate = advanceDateByFrequency(sched.nextRunDate >= today ? sched.nextRunDate : today, sched.frequency);
  db.prepare("UPDATE recurring_schedules SET next_run_date = ?, last_run_at = ?, runs_count = runs_count + 1 WHERE id = ? AND org_id = ?").run(
    nextDate,
    new Date().toISOString(),
    sched.id,
    orgId
  );

  const updatedSched = mapRecurringRow(db.prepare("SELECT * FROM recurring_schedules WHERE id = ? AND org_id = ?").get(id, orgId) as Record<string, any>);
  return { invoice, schedule: updatedSched };
}

/** Active schedules whose next run date has arrived (for the automatic scheduler). */
export function listDueRecurringSchedules(): Array<{ id: string; orgId: string }> {
  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);
  const rows = db
    .prepare(
      "SELECT id, org_id FROM recurring_schedules WHERE active = 1 AND next_run_date <= ? ORDER BY next_run_date ASC LIMIT 100"
    )
    .all(today) as Array<{ id: string; org_id: string }>;
  return rows.map((r) => ({ id: r.id, orgId: r.org_id }));
}

const DEFAULT_AUTOMATIONS = [
  {
    ruleKey: "auto_validate_halt",
    name: "Pre-Send EN 16931 Compliance Gate",
    triggerEvent: "On Invoice Created / Webhook Received",
    actionSummary: "Run deterministic EN 16931 & BR-DE-* checks; halt invalid invoices in Action-Required queue before delivery.",
    enabled: 1,
  },
  {
    ruleKey: "auto_email_validated",
    name: "Auto-Dispatch Validated Invoices + Accountant CC",
    triggerEvent: "On Invoice Validated",
    actionSummary: "Email Hybrid PDF/A-3 + XML to buyer BT-49 and CC your configured Steuerberater / Expert-comptable.",
    enabled: 1,
  },
  {
    ruleKey: "incoming_approval_gate",
    name: "Incoming Supplier Invoice Approval Gate",
    triggerEvent: "On Incoming E-Invoice Received",
    actionSummary: "Run duplicate detection, verify EN 16931 math, and hold in Pending Review until approved by Owner/Admin.",
    enabled: 1,
  },
  {
    ruleKey: "overdue_payment_reminder",
    name: "Overdue Receivable Reminder Queue",
    triggerEvent: "On Invoice Past Due Date (BT-9)",
    actionSummary: "Flag unpaid invoices in Receivables Ageing report and prepare reminder notice for owner approval.",
    enabled: 0,
  },
];

export function listAutomationRulesForOrg(orgId: string): AutomationRuleRecord[] {
  const db = getDb();
  const count = Number((db.prepare("SELECT COUNT(*) as c FROM automation_rules WHERE org_id = ?").get(orgId) as { c: number }).c);
  if (count === 0) {
    const now = new Date().toISOString();
    const stmt = db.prepare(
      `INSERT OR IGNORE INTO automation_rules (id, org_id, rule_key, name, trigger_event, action_summary, enabled, executions_count, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`
    );
    for (const d of DEFAULT_AUTOMATIONS) {
      stmt.run(`auto_${crypto.randomBytes(5).toString("hex")}`, orgId, d.ruleKey, d.name, d.triggerEvent, d.actionSummary, d.enabled, now);
    }
  }
  const rows = db.prepare("SELECT * FROM automation_rules WHERE org_id = ? ORDER BY rowid ASC").all(orgId) as Array<Record<string, any>>;
  return rows.map((r) => ({
    id: r.id,
    orgId: r.org_id,
    ruleKey: r.rule_key,
    name: r.name,
    triggerEvent: r.trigger_event,
    actionSummary: r.action_summary,
    enabled: Boolean(r.enabled),
    executionsCount: Number(r.executions_count),
    lastRunAt: r.last_run_at ?? null,
    updatedAt: r.updated_at,
  }));
}

export function toggleAutomationRuleForOrg(orgId: string, id: string, enabled: boolean, actorEmail: string): AutomationRuleRecord | null {
  const db = getDb();
  const now = new Date().toISOString();
  const res = db.prepare("UPDATE automation_rules SET enabled = ?, updated_at = ? WHERE id = ? AND org_id = ?").run(enabled ? 1 : 0, now, id, orgId);
  if (Number(res.changes) === 0) return null;
  appendOrgAuditEvent(orgId, null, id, "AUTOMATION_RULE_TOGGLED", actorEmail, { enabled });
  return listAutomationRulesForOrg(orgId).find((r) => r.id === id) ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Automation engine: dry-run (simulate), run (execute + log), and run history.
// Actions are internal and non-destructive; outbound comms are never auto-sent
// (the overdue rule prepares a reminder for owner approval, it does not email).
// ─────────────────────────────────────────────────────────────────────────────

export interface AutomationRunRecord {
  id: string;
  orgId: string;
  ruleId: string;
  ruleKey: string;
  triggerEvent: string;
  outcome: string;
  matchedCount: number;
  detail: string;
  dryRun: boolean;
  actorEmail: string;
  createdAt: string;
}

export interface AutomationMatch {
  invoiceId: string;
  invoiceNumber: string;
  counterparty: string;
  grossAmount: number;
  currency: string;
  dueDate: string | null;
  daysOverdue: number;
}

export interface AutomationPlan {
  ruleId: string;
  ruleKey: string;
  ruleName: string;
  triggerEvent: string;
  scheduled: boolean; // true = can be run/simulated on demand; false = event-driven
  willDo: string;
  matches: AutomationMatch[];
}

export function getAutomationRuleForOrg(orgId: string, id: string): AutomationRuleRecord | null {
  return listAutomationRulesForOrg(orgId).find((r) => r.id === id) ?? null;
}

/** Overdue, finalized, unpaid outgoing invoices (the overdue-reminder rule's subject set). */
export function evaluateOverdueReminders(orgId: string): AutomationMatch[] {
  const today = new Date().toISOString().slice(0, 10);
  const out: AutomationMatch[] = [];
  for (const inv of listInvoicesForOrg(orgId)) {
    if (inv.typeCode !== 380 || inv.status === "DRAFT" || inv.paymentStatus === "PAID") continue;
    const due = inv.dueDate;
    if (!due || due >= today) continue;
    const days = Math.floor((Date.parse(today) - Date.parse(due)) / 86400000);
    out.push({
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      counterparty: inv.buyerName,
      grossAmount: inv.grossAmount,
      currency: inv.currency,
      dueDate: due,
      daysOverdue: days,
    });
  }
  return out;
}

export function recordAutomationRun(
  orgId: string,
  input: { ruleId: string; ruleKey: string; triggerEvent: string; outcome: string; matchedCount: number; detail: string; dryRun: boolean; actorEmail: string }
): AutomationRunRecord {
  const db = getDb();
  const id = `arun_${crypto.randomBytes(6).toString("hex")}`;
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO automation_runs (id, org_id, rule_id, rule_key, trigger_event, outcome, matched_count, detail, dry_run, actor_email, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, orgId, input.ruleId, input.ruleKey, input.triggerEvent, input.outcome, input.matchedCount, input.detail, input.dryRun ? 1 : 0, input.actorEmail, now);
  return { id, orgId, ...input, createdAt: now };
}

export function listAutomationRunsForOrg(orgId: string, limit = 50): AutomationRunRecord[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM automation_runs WHERE org_id = ? ORDER BY created_at DESC LIMIT ?")
    .all(orgId, limit) as Array<Record<string, any>>;
  return rows.map((r) => ({
    id: r.id,
    orgId: r.org_id,
    ruleId: r.rule_id,
    ruleKey: r.rule_key,
    triggerEvent: r.trigger_event,
    outcome: r.outcome,
    matchedCount: Number(r.matched_count),
    detail: r.detail,
    dryRun: Boolean(r.dry_run),
    actorEmail: r.actor_email,
    createdAt: r.created_at,
  }));
}

/** Build the plan for a rule (what it would do + matched subjects). */
export function planAutomationRule(orgId: string, rule: AutomationRuleRecord): AutomationPlan {
  if (rule.ruleKey === "overdue_payment_reminder") {
    const matches = evaluateOverdueReminders(orgId);
    return {
      ruleId: rule.id,
      ruleKey: rule.ruleKey,
      ruleName: rule.name,
      triggerEvent: rule.triggerEvent,
      scheduled: true,
      willDo:
        matches.length === 0
          ? "No overdue unpaid invoices — nothing to flag."
          : `Flag ${matches.length} overdue unpaid invoice(s) in the ageing report and prepare a reminder notice for owner approval (no email is auto-sent).`,
      matches,
    };
  }
  // Event-driven rules run automatically when their trigger fires elsewhere.
  return {
    ruleId: rule.id,
    ruleKey: rule.ruleKey,
    ruleName: rule.name,
    triggerEvent: rule.triggerEvent,
    scheduled: false,
    willDo: `Runs automatically on "${rule.triggerEvent}". ${rule.actionSummary}`,
    matches: [],
  };
}

/** Simulate (dryRun=true) or execute (dryRun=false) a rule; both are logged to history. */
export function runAutomationRule(
  orgId: string,
  ruleId: string,
  dryRun: boolean,
  actorEmail: string
): { plan: AutomationPlan; run: AutomationRunRecord } | null {
  const rule = getAutomationRuleForOrg(orgId, ruleId);
  if (!rule) return null;
  const plan = planAutomationRule(orgId, rule);

  let outcome: string;
  let detail: string;
  if (dryRun) {
    outcome = "SIMULATED";
    detail = plan.willDo;
  } else if (!plan.scheduled) {
    outcome = "NOT_APPLICABLE";
    detail = `Event-driven rule — fires on "${rule.triggerEvent}", not on demand.`;
  } else if (!rule.enabled) {
    outcome = "SKIPPED_DISABLED";
    detail = "Rule is disabled; enable it to execute.";
  } else {
    outcome = "EXECUTED";
    detail = plan.willDo;
    const db = getDb();
    db.prepare("UPDATE automation_rules SET executions_count = executions_count + 1, last_run_at = ? WHERE id = ? AND org_id = ?").run(
      new Date().toISOString(),
      rule.id,
      orgId
    );
    appendOrgAuditEvent(orgId, null, rule.id, "AUTOMATION_RULE_EXECUTED", actorEmail, {
      ruleKey: rule.ruleKey,
      matched: plan.matches.length,
    });
  }

  const run = recordAutomationRun(orgId, {
    ruleId: rule.id,
    ruleKey: rule.ruleKey,
    triggerEvent: rule.triggerEvent,
    outcome,
    matchedCount: plan.matches.length,
    detail,
    dryRun,
    actorEmail,
  });
  return { plan, run };
}

export function getOrgAnalyticsReport(orgId: string) {
  const invoices = listInvoicesForOrg(orgId);
  const incoming = listIncomingInvoicesForOrg(orgId);
  const today = new Date().toISOString().slice(0, 10);

  const finalized = invoices.filter((i) => i.status !== "DRAFT");
  const validFinalized = finalized.filter((i) => i.validationPassed);
  const delivered = finalized.filter((i) => i.status === "DELIVERED");
  const firstPassRate = finalized.length > 0 ? Math.round((validFinalized.length / finalized.length) * 100) : 100;

  let totalInvoiced = 0;
  let totalCollected = 0;
  let totalOutstanding = 0;
  const ageing = { current: 0, days1to30: 0, days31to60: 0, days60plus: 0 };
  const vatMap = new Map<string, { category: string; rate: number; netTotal: number; taxTotal: number }>();
  const countryMap = new Map<string, { country: string; count: number; grossTotal: number }>();

  for (const inv of validFinalized) {
    const sign = inv.typeCode === 381 ? -1 : 1;
    const gross = sign * Math.abs(inv.grossAmount);
    totalInvoiced += gross;

    if (inv.paymentStatus === "PAID") {
      totalCollected += gross;
    } else if (inv.typeCode === 380) {
      totalOutstanding += inv.grossAmount;
      const due = inv.dueDate || inv.issueDate;
      const diffDays = Math.floor((new Date(`${today}T00:00:00Z`).getTime() - new Date(`${due}T00:00:00Z`).getTime()) / 86400000);
      if (diffDays <= 0) ageing.current += inv.grossAmount;
      else if (diffDays <= 30) ageing.days1to30 += inv.grossAmount;
      else if (diffDays <= 60) ageing.days31to60 += inv.grossAmount;
      else ageing.days60plus += inv.grossAmount;
    }

    const cKey = inv.buyerCountry || "DE";
    const cEntry = countryMap.get(cKey) ?? { country: cKey, count: 0, grossTotal: 0 };
    cEntry.count += 1;
    cEntry.grossTotal += gross;
    countryMap.set(cKey, cEntry);

    for (const line of inv.canonical.lines) {
      const key = `${line.vatCategory}:${line.vatRate}`;
      const lineNet = sign * Math.abs(line.lineNetAmount ?? line.quantity * line.unitPrice);
      const lineTax = Number(((lineNet * line.vatRate) / 100).toFixed(2));
      const vEntry = vatMap.get(key) ?? { category: line.vatCategory, rate: line.vatRate, netTotal: 0, taxTotal: 0 };
      vEntry.netTotal += lineNet;
      vEntry.taxTotal += lineTax;
      vatMap.set(key, vEntry);
    }
  }

  const payablesUnpaid = incoming.filter((i) => i.paymentStatus === "UNPAID").reduce((s, i) => s + i.grossAmount, 0);
  const payablesPendingApproval = incoming.filter((i) => i.approvalStatus === "PENDING_REVIEW").length;

  return {
    generatedAt: new Date().toISOString(),
    kpis: {
      totalInvoiced: Number(totalInvoiced.toFixed(2)),
      totalCollected: Number(totalCollected.toFixed(2)),
      totalOutstanding: Number(totalOutstanding.toFixed(2)),
      firstPassValidationRate: firstPassRate,
      deliveryRate: finalized.length > 0 ? Math.round((delivered.length / finalized.length) * 100) : 0,
      outgoingCount: finalized.length,
      incomingCount: incoming.length,
      payablesUnpaid: Number(payablesUnpaid.toFixed(2)),
      payablesPendingApproval,
    },
    ageing: {
      current: Number(ageing.current.toFixed(2)),
      days1to30: Number(ageing.days1to30.toFixed(2)),
      days31to60: Number(ageing.days31to60.toFixed(2)),
      days60plus: Number(ageing.days60plus.toFixed(2)),
    },
    vatSummary: Array.from(vatMap.values()).map((v) => ({
      ...v,
      netTotal: Number(v.netTotal.toFixed(2)),
      taxTotal: Number(v.taxTotal.toFixed(2)),
    })),
    byCountry: Array.from(countryMap.values()).map((c) => ({
      ...c,
      grossTotal: Number(c.grossTotal.toFixed(2)),
    })),
  };
}

export function searchOrgWorkspace(orgId: string, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return { invoices: [], incoming: [], customers: [], products: [] };

  const invoices = listInvoicesForOrg(orgId, { search: q }).slice(0, 6).map((i) => ({
    id: i.id,
    title: i.invoiceNumber,
    subtitle: `${i.buyerName} · ${i.status} · ${i.grossAmount.toFixed(2)} ${i.currency}`,
    href: `/invoices/${i.id}`,
  }));

  const incoming = listIncomingInvoicesForOrg(orgId)
    .filter((i) => i.invoiceNumber.toLowerCase().includes(q) || i.sellerName.toLowerCase().includes(q))
    .slice(0, 5)
    .map((i) => ({
      id: i.id,
      title: i.invoiceNumber,
      subtitle: `Supplier: ${i.sellerName} · ${i.approvalStatus}`,
      href: `/inbox`,
    }));

  const customers = listCustomersForOrg(orgId, q).slice(0, 5).map((c) => ({
    id: c.id,
    title: c.legalName,
    subtitle: `${c.countryCode}${c.vatId ? ` · ${c.vatId}` : ""} · ${c.city}`,
    href: `/customers`,
  }));

  const products = listProductsForOrg(orgId)
    .filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      title: p.sku ? `[${p.sku}] ${p.name}` : p.name,
      subtitle: `${p.unitPrice.toFixed(2)} EUR / ${p.unitCode}`,
      href: `/catalog`,
    }));

  return { invoices, incoming, customers, products };
}

// ============================================================================
// Phase 8: Partial Payments, Team Comments, Outgoing Approvals & Accountant Delegations
// ============================================================================

export function recordInvoicePayment(
  orgId: string,
  invoiceId: string,
  input: { amount: number; method?: string; reference?: string; valueDate?: string },
  actorEmail: string
): { payment: InvoicePaymentRecord; invoice: InvoiceRecord } | null {
  const db = getDb();
  const inv = getInvoiceForOrg(orgId, invoiceId);
  if (!inv) return null;
  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Payment amount must be greater than zero.");

  const id = `pay_${crypto.randomBytes(6).toString("hex")}`;
  const now = new Date().toISOString();
  const valueDate = input.valueDate || now.slice(0, 10);
  const method = input.method || "SEPA_TRANSFER";
  const reference = input.reference || inv.invoiceNumber;

  db.prepare(
    `INSERT INTO invoice_payments (id, org_id, invoice_id, invoice_number, amount, currency, method, reference, value_date, recorded_by, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, orgId, inv.id, inv.invoiceNumber, amount, inv.currency, method, reference, valueDate, actorEmail, now);

  const sumRow = db
    .prepare("SELECT COALESCE(SUM(amount), 0) as total FROM invoice_payments WHERE org_id = ? AND invoice_id = ?")
    .get(orgId, inv.id) as { total: number };
  const totalPaid = Number(Number(sumRow.total).toFixed(2));
  const nextStatus: "UNPAID" | "PARTIAL" | "PAID" =
    totalPaid >= inv.grossAmount - 0.005 ? "PAID" : totalPaid > 0 ? "PARTIAL" : "UNPAID";

  db.prepare("UPDATE invoices SET paid_amount = ?, payment_status = ?, paid_at = ?, updated_at = ? WHERE id = ? AND org_id = ?").run(
    totalPaid,
    nextStatus,
    nextStatus === "PAID" ? now : inv.paidAt,
    now,
    inv.id,
    orgId
  );

  appendOrgAuditEvent(orgId, inv.id, inv.invoiceNumber, "PAYMENT_RECORDED", actorEmail, {
    amount,
    totalPaid,
    paymentStatus: nextStatus,
    method,
    reference,
  });

  const payment: InvoicePaymentRecord = {
    id,
    orgId,
    invoiceId: inv.id,
    invoiceNumber: inv.invoiceNumber,
    amount,
    currency: inv.currency,
    method,
    reference,
    valueDate,
    recordedBy: actorEmail,
    createdAt: now,
  };
  return { payment, invoice: getInvoiceForOrg(orgId, inv.id)! };
}

export function listInvoicePaymentsForOrg(orgId: string): InvoicePaymentRecord[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM invoice_payments WHERE org_id = ? ORDER BY created_at DESC LIMIT 100")
    .all(orgId) as Array<Record<string, any>>;
  return rows.map((r) => ({
    id: r.id,
    orgId: r.org_id,
    invoiceId: r.invoice_id,
    invoiceNumber: r.invoice_number,
    amount: Number(r.amount),
    currency: r.currency,
    method: r.method,
    reference: r.reference,
    valueDate: r.value_date,
    recordedBy: r.recorded_by,
    createdAt: r.created_at,
  }));
}

export function listInvoiceComments(orgId: string, invoiceId: string): InvoiceCommentRecord[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM invoice_comments WHERE org_id = ? AND invoice_id = ? ORDER BY created_at ASC")
    .all(orgId, invoiceId) as Array<Record<string, any>>;
  return rows.map((r) => ({
    id: r.id,
    orgId: r.org_id,
    invoiceId: r.invoice_id,
    authorEmail: r.author_email,
    body: r.body,
    createdAt: r.created_at,
  }));
}

export function addInvoiceComment(orgId: string, invoiceId: string, authorEmail: string, body: string): InvoiceCommentRecord | null {
  const db = getDb();
  const inv = getInvoiceForOrg(orgId, invoiceId);
  if (!inv) return null;
  const id = `cmt_${crypto.randomBytes(6).toString("hex")}`;
  const now = new Date().toISOString();
  db.prepare("INSERT INTO invoice_comments (id, org_id, invoice_id, author_email, body, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(
    id,
    orgId,
    invoiceId,
    authorEmail,
    body.trim().slice(0, 1000),
    now
  );
  appendOrgAuditEvent(orgId, invoiceId, inv.invoiceNumber, "COMMENT_ADDED", authorEmail, { preview: body.trim().slice(0, 80) });
  return { id, orgId, invoiceId, authorEmail, body: body.trim().slice(0, 1000), createdAt: now };
}

export function setOutgoingInvoiceApproval(
  orgId: string,
  invoiceId: string,
  approvalStatus: "APPROVED" | "REJECTED",
  actorEmail: string
): InvoiceRecord | null {
  const db = getDb();
  const inv = getInvoiceForOrg(orgId, invoiceId);
  if (!inv) return null;
  const now = new Date().toISOString();
  db.prepare("UPDATE invoices SET approval_status = ?, updated_at = ? WHERE id = ? AND org_id = ?").run(
    approvalStatus,
    now,
    invoiceId,
    orgId
  );
  appendOrgAuditEvent(orgId, invoiceId, inv.invoiceNumber, `OUTGOING_${approvalStatus}`, actorEmail, { approvalStatus });
  return getInvoiceForOrg(orgId, invoiceId);
}

export function listOrgDelegations(orgId: string): AccountantDelegationRecord[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM accountant_delegations WHERE org_id = ? ORDER BY created_at DESC")
    .all(orgId) as Array<Record<string, any>>;
  return rows.map((r) => ({
    id: r.id,
    orgId: r.org_id,
    accountantEmail: r.accountant_email,
    accountantName: r.accountant_name,
    scope: r.scope === "FULL_BOOKKEEPING" ? "FULL_BOOKKEEPING" : "READ_EXPORT",
    expiresAt: r.expires_at,
    revokedAt: r.revoked_at ?? null,
    grantedBy: r.granted_by,
    createdAt: r.created_at,
  }));
}

export function createAccountantDelegation(
  orgId: string,
  input: { accountantEmail: string; accountantName?: string; scope?: "READ_EXPORT" | "FULL_BOOKKEEPING"; expiresDays?: number },
  grantedBy: string
): AccountantDelegationRecord {
  const db = getDb();
  const id = `del_${crypto.randomBytes(6).toString("hex")}`;
  const now = new Date();
  const exp = new Date(now.getTime() + (Math.max(1, Number(input.expiresDays) || 365) * 86400000));
  const scope = input.scope === "FULL_BOOKKEEPING" ? "FULL_BOOKKEEPING" : "READ_EXPORT";
  db.prepare(
    `INSERT INTO accountant_delegations (id, org_id, accountant_email, accountant_name, scope, expires_at, granted_by, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    orgId,
    input.accountantEmail.trim().toLowerCase(),
    (input.accountantName || "").trim(),
    scope,
    exp.toISOString().slice(0, 10),
    grantedBy,
    now.toISOString()
  );
  appendOrgAuditEvent(orgId, null, "ACCOUNTANT", "ACCOUNTANT_DELEGATION_GRANTED", grantedBy, {
    accountantEmail: input.accountantEmail.trim().toLowerCase(),
    scope,
    expiresAt: exp.toISOString().slice(0, 10),
  });
  return listOrgDelegations(orgId).find((d) => d.id === id)!;
}

export function revokeAccountantDelegation(orgId: string, id: string, actorEmail: string): boolean {
  const db = getDb();
  const res = db
    .prepare("UPDATE accountant_delegations SET revoked_at = ? WHERE id = ? AND org_id = ? AND revoked_at IS NULL")
    .run(new Date().toISOString(), id, orgId);
  if (Number(res.changes) > 0) {
    appendOrgAuditEvent(orgId, null, "ACCOUNTANT", "ACCOUNTANT_DELEGATION_REVOKED", actorEmail, { delegationId: id });
    return true;
  }
  return false;
}

export function listDelegatedClientsForAccountant(accountantEmail: string) {
  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);
  const rows = db
    .prepare(
      `SELECT d.*, o.name as org_name, sp.country_code, sp.vat_id
       FROM accountant_delegations d
       JOIN organizations o ON o.id = d.org_id
       LEFT JOIN seller_profiles sp ON sp.org_id = d.org_id
       WHERE lower(d.accountant_email) = lower(?) AND d.revoked_at IS NULL AND d.expires_at >= ?
       ORDER BY d.created_at DESC`
    )
    .all(accountantEmail.trim(), today) as Array<Record<string, any>>;

  return rows.map((r) => {
    const analytics = getOrgAnalyticsReport(r.org_id);
    const chain = verifyOrgAuditHashChain(r.org_id);
    return {
      delegationId: r.id,
      orgId: r.org_id,
      orgName: r.org_name,
      countryCode: r.country_code || "DE",
      vatId: r.vat_id || "",
      scope: r.scope,
      expiresAt: r.expires_at,
      outgoingCount: analytics.kpis.outgoingCount,
      incomingCount: analytics.kpis.incomingCount,
      totalInvoiced: analytics.kpis.totalInvoiced,
      totalOutstanding: analytics.kpis.totalOutstanding,
      firstPassRate: analytics.kpis.firstPassValidationRate,
      gobdVerified: chain.verified,
    };
  });
}

/**
 * Consent guard: return the active (non-revoked, non-expired) delegation that
 * authorizes `accountantEmail` to access `clientOrgId`, or null. This is the
 * ONLY path by which an accountant may read another tenant's data.
 */
export function getActiveDelegationForAccountant(
  accountantEmail: string,
  clientOrgId: string
): AccountantDelegationRecord | null {
  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);
  const row = db
    .prepare(
      `SELECT * FROM accountant_delegations
         WHERE lower(accountant_email) = lower(?) AND org_id = ?
           AND revoked_at IS NULL AND expires_at >= ?
         ORDER BY created_at DESC LIMIT 1`
    )
    .get(accountantEmail.trim(), clientOrgId, today) as Record<string, any> | undefined;
  if (!row) return null;
  return {
    id: row.id,
    orgId: row.org_id,
    accountantEmail: row.accountant_email,
    accountantName: row.accountant_name,
    scope: row.scope,
    expiresAt: row.expires_at,
    revokedAt: row.revoked_at ?? null,
    grantedBy: row.granted_by,
    createdAt: row.created_at,
  };
}

export interface ClientReviewItem {
  id: string;
  invoiceNumber: string;
  counterparty: string;
  grossAmount: number;
  currency: string;
  date: string;
  reasons: string[];
}

export interface DelegatedClientReview {
  orgId: string;
  orgName: string;
  scope: "READ_EXPORT" | "FULL_BOOKKEEPING";
  expiresAt: string;
  gobdVerified: boolean;
  outgoing: ClientReviewItem[];
  incoming: ClientReviewItem[];
}

/**
 * Consent-checked review queue for one delegated client: outgoing and incoming
 * documents that need accountant attention. Returns null if no active consent.
 * Records a tamper-evident access event in the CLIENT org's audit chain so the
 * delegated access is documented (access attestation).
 */
export function getDelegatedClientReview(
  accountantEmail: string,
  clientOrgId: string
): DelegatedClientReview | null {
  const delegation = getActiveDelegationForAccountant(accountantEmail, clientOrgId);
  if (!delegation) return null;

  const org = getOrgById(clientOrgId);
  if (!org) return null;
  const today = new Date().toISOString().slice(0, 10);

  const outgoing: ClientReviewItem[] = [];
  for (const inv of listInvoicesForOrg(clientOrgId)) {
    const reasons: string[] = [];
    if (!inv.validationPassed || inv.status === "ACTION_REQUIRED") reasons.push("EN 16931 validation blocked");
    if (inv.status !== "DRAFT" && inv.paymentStatus !== "PAID" && inv.dueDate && inv.dueDate < today) {
      reasons.push("Payment overdue");
    }
    if (inv.status !== "DRAFT" && inv.approvalStatus === "REJECTED") reasons.push("Approval rejected");
    if (reasons.length > 0) {
      outgoing.push({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        counterparty: inv.buyerName,
        grossAmount: inv.grossAmount,
        currency: inv.currency,
        date: inv.dueDate || inv.issueDate,
        reasons,
      });
    }
  }

  const incoming: ClientReviewItem[] = [];
  for (const inc of listIncomingInvoicesForOrg(clientOrgId)) {
    const reasons: string[] = [];
    if (inc.approvalStatus === "PENDING_REVIEW") reasons.push("Awaiting approval");
    if (!inc.validationPassed) reasons.push("Validation issues");
    if (inc.isDuplicate) reasons.push("Possible duplicate");
    if (reasons.length > 0) {
      incoming.push({
        id: inc.id,
        invoiceNumber: inc.invoiceNumber,
        counterparty: inc.sellerName,
        grossAmount: inc.grossAmount,
        currency: inc.currency,
        date: inc.dueDate || inc.issueDate,
        reasons,
      });
    }
  }

  // Document the delegated access in the client's tamper-evident audit chain.
  appendOrgAuditEvent(clientOrgId, null, "ACCOUNTANT", "ACCOUNTANT_REVIEW_ACCESS", accountantEmail, {
    delegationId: delegation.id,
    scope: delegation.scope,
    outgoingFlagged: outgoing.length,
    incomingFlagged: incoming.length,
  });

  return {
    orgId: clientOrgId,
    orgName: org.name,
    scope: delegation.scope,
    expiresAt: delegation.expiresAt,
    gobdVerified: verifyOrgAuditHashChain(clientOrgId).verified,
    outgoing,
    incoming,
  };
}

// ============================================================================
// Phase 9: Password Reset / Email Verification Tokens, Contact Inquiries & Dashboard Snapshot
// ============================================================================

export function createAuthTokenForEmail(
  email: string,
  purpose: "RESET_PASSWORD" | "VERIFY_EMAIL"
): { token: string; userId: string; email: string; fullName: string; expiresAt: string } | null {
  const db = getDb();
  const user = db
    .prepare("SELECT id, email, full_name FROM users WHERE lower(email) = lower(?) LIMIT 1")
    .get(email.trim()) as { id: string; email: string; full_name: string } | undefined;
  if (!user) return null;

  const token = crypto.randomBytes(24).toString("hex");
  const tokenHash = sha256(token);
  const id = `atok_${crypto.randomBytes(6).toString("hex")}`;
  const now = new Date();
  const ttlMs = purpose === "RESET_PASSWORD" ? 60 * 60_000 : 24 * 60 * 60_000;
  const expiresAt = new Date(now.getTime() + ttlMs).toISOString();

  // Invalidate older unused tokens of the same purpose for this user
  db.prepare("UPDATE auth_tokens SET used_at = ? WHERE user_id = ? AND purpose = ? AND used_at IS NULL").run(
    now.toISOString(),
    user.id,
    purpose
  );

  db.prepare(
    `INSERT INTO auth_tokens (id, user_id, purpose, token_hash, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, user.id, purpose, tokenHash, expiresAt, now.toISOString());

  return { token, userId: user.id, email: user.email, fullName: user.full_name, expiresAt };
}

export function consumePasswordResetToken(
  token: string,
  newPassword: string
): { ok: boolean; error?: string; email?: string } {
  const db = getDb();
  if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    return { ok: false, error: "New password must be at least 8 characters and include letters and numbers." };
  }

  const row = db
    .prepare(
      `SELECT t.id, t.user_id, t.expires_at, t.used_at, u.email
       FROM auth_tokens t
       JOIN users u ON u.id = t.user_id
       WHERE t.token_hash = ? AND t.purpose = 'RESET_PASSWORD'
       LIMIT 1`
    )
    .get(sha256(token)) as Record<string, any> | undefined;

  if (!row || row.used_at || Date.parse(row.expires_at) <= Date.now()) {
    return { ok: false, error: "This password reset link is invalid or has expired." };
  }

  const now = new Date().toISOString();
  db.prepare("UPDATE auth_tokens SET used_at = ? WHERE id = ?").run(now, row.id);
  db.prepare("UPDATE users SET password_hash = ?, session_version = session_version + 1 WHERE id = ?").run(
    hashPasswordScrypt(newPassword),
    row.user_id
  );

  return { ok: true, email: row.email };
}

export function consumeEmailVerificationToken(token: string): { ok: boolean; error?: string; email?: string } {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT t.id, t.user_id, t.expires_at, t.used_at, u.email
       FROM auth_tokens t
       JOIN users u ON u.id = t.user_id
       WHERE t.token_hash = ? AND t.purpose = 'VERIFY_EMAIL'
       LIMIT 1`
    )
    .get(sha256(token)) as Record<string, any> | undefined;

  if (!row || row.used_at || Date.parse(row.expires_at) <= Date.now()) {
    return { ok: false, error: "This email verification link is invalid or has expired." };
  }

  const now = new Date().toISOString();
  db.prepare("UPDATE auth_tokens SET used_at = ? WHERE id = ?").run(now, row.id);
  db.prepare("UPDATE users SET email_verified = 1 WHERE id = ?").run(row.user_id);

  return { ok: true, email: row.email };
}

export function createContactInquiry(input: {
  name: string;
  email: string;
  company?: string;
  country?: string;
  topic?: string;
  message: string;
  marketingOptIn?: boolean;
}): ContactInquiryRecord {
  const db = getDb();
  const id = `inq_${crypto.randomBytes(6).toString("hex")}`;
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO contact_inquiries (id, name, email, company, country, topic, message, marketing_opt_in, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', ?)`
  ).run(
    id,
    input.name.trim(),
    input.email.trim().toLowerCase(),
    (input.company || "").trim(),
    (input.country || "").trim(),
    (input.topic || "general").trim().toLowerCase(),
    input.message.trim(),
    input.marketingOptIn ? 1 : 0,
    now
  );

  return {
    id,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    company: (input.company || "").trim(),
    country: (input.country || "").trim(),
    topic: (input.topic || "general").trim().toLowerCase(),
    message: input.message.trim(),
    marketingOptIn: Boolean(input.marketingOptIn),
    status: "OPEN",
    createdAt: now,
  };
}

export function listContactInquiries(): ContactInquiryRecord[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM contact_inquiries ORDER BY created_at DESC LIMIT 100")
    .all() as Array<Record<string, any>>;
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    company: r.company || "",
    country: r.country || "",
    topic: r.topic || "general",
    message: r.message,
    marketingOptIn: Boolean(r.marketing_opt_in),
    status: r.status === "RESOLVED" ? "RESOLVED" : r.status === "IN_REVIEW" ? "IN_REVIEW" : "OPEN",
    createdAt: r.created_at,
  }));
}

export function updateContactInquiryStatus(
  id: string,
  status: "OPEN" | "IN_REVIEW" | "RESOLVED",
  actorEmail: string
): boolean {
  const db = getDb();
  const res = db.prepare("UPDATE contact_inquiries SET status = ? WHERE id = ?").run(status, id);
  if (Number(res.changes) > 0) {
    recordPlatformAdminAudit(actorEmail, `INQUIRY_${status}`, null, `Inquiry ${id} marked ${status}`);
    return true;
  }
  return false;
}

export function getOrgDashboardSnapshot(orgId: string, days = 30) {
  const invoices = listInvoicesForOrg(orgId);
  const incoming = listIncomingInvoicesForOrg(orgId);
  const customers = listCustomersForOrg(orgId);
  const products = listProductsForOrg(orgId);
  const seller = getSellerSettings(orgId);
  const subscription = getSubscriptionForOrg(orgId);
  const recentAudit = listOrgAuditEvents(orgId).slice(0, 8);

  const today = new Date().toISOString().slice(0, 10);
  const ym = today.slice(0, 7);

  let sentCount = 0;
  let paidCount = 0;
  let overdueCount = 0;
  let draftCount = 0;
  let actionRequiredCount = 0;
  let invoicedThisMonth = 0;

  const classified = invoices.map((inv) => {
    const isOverdue =
      inv.status !== "DRAFT" &&
      inv.typeCode === 380 &&
      inv.paymentStatus !== "PAID" &&
      Boolean(inv.dueDate && inv.dueDate < today);

    let displayStatus: "PAID" | "OVERDUE" | "SENT" | "DRAFT" | "ACTION_REQUIRED" | "VALIDATED" = "VALIDATED";
    if (inv.status === "DRAFT") {
      draftCount++;
      displayStatus = "DRAFT";
    } else if (inv.status === "ACTION_REQUIRED") {
      actionRequiredCount++;
      displayStatus = "ACTION_REQUIRED";
    } else if (inv.paymentStatus === "PAID") {
      paidCount++;
      sentCount++;
      displayStatus = "PAID";
    } else if (isOverdue) {
      overdueCount++;
      sentCount++;
      displayStatus = "OVERDUE";
    } else if (inv.status === "DELIVERED" || inv.status === "VALIDATED") {
      sentCount++;
      displayStatus = inv.status === "DELIVERED" ? "SENT" : "VALIDATED";
    }

    if (inv.status !== "DRAFT" && inv.status !== "ACTION_REQUIRED" && inv.issueDate.startsWith(ym)) {
      invoicedThisMonth += inv.typeCode === 381 ? -Math.abs(inv.grossAmount) : inv.grossAmount;
    }

    return {
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      typeCode: inv.typeCode,
      issueDate: inv.issueDate,
      dueDate: inv.dueDate,
      buyerName: inv.buyerName,
      buyerCountry: inv.buyerCountry,
      grossAmount: inv.grossAmount,
      currency: inv.currency,
      targetFormat: inv.targetFormat,
      status: inv.status,
      paymentStatus: inv.paymentStatus,
      displayStatus,
      diagnostics: inv.diagnostics,
      createdAt: inv.createdAt,
    };
  });

  // Build real time-bucketed cumulative trend over the selected window (8 evenly spaced checkpoints)
  const buckets = 8;
  const nowMs = Date.now();
  const windowMs = days * 86_400_000;
  const startMs = nowMs - windowMs;
  const stepMs = windowMs / (buckets - 1);

  const trendSeries = Array.from({ length: buckets }, (_, idx) => {
    const pointDate = new Date(startMs + idx * stepMs);
    const iso = pointDate.toISOString().slice(0, 10);
    const label = pointDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    let created = 0;
    let sent = 0;
    let paid = 0;
    for (const inv of invoices) {
      const invDay = (inv.createdAt || inv.issueDate).slice(0, 10);
      if (invDay <= iso) {
        created++;
        if (inv.status === "DELIVERED" || inv.status === "VALIDATED") sent++;
        if (inv.paymentStatus === "PAID") paid++;
      }
    }
    return { date: iso, label, created, sent, paid };
  });

  const total = invoices.length;
  const sentOnlyCount = Math.max(0, sentCount - paidCount - overdueCount);
  const statusBreakdown = {
    total,
    paid: paidCount,
    sent: sentOnlyCount,
    draft: draftCount + actionRequiredCount,
    overdue: overdueCount,
  };

  const getStarted = [
    { id: "account", label: "Create your account", done: true, href: "/settings" },
    {
      id: "business",
      label: "Add your business details",
      done: Boolean(seller && (seller.vatId || seller.iban || seller.street)),
      href: "/settings?tab=company",
    },
    {
      id: "first_invoice",
      label: "Create your first invoice",
      done: invoices.length > 0,
      href: "/invoices/new",
    },
    {
      id: "upgrade",
      label: "Upgrade to Solo (Optional)",
      done: ["solo", "business", "agency"].includes(subscription.planTier),
      href: "/settings?tab=billing",
    },
  ];

  // Real actionable notifications
  const notifications: Array<{ id: string; kind: "warning" | "info" | "success"; title: string; detail: string; href: string; createdAt: string }> = [];
  if (subscription.trialActive) {
    notifications.push({
      id: "notif_trial",
      kind: subscription.trialDaysRemaining <= 3 ? "warning" : "info",
      title: `Free Trial Active — ${subscription.trialDaysRemaining} day${subscription.trialDaysRemaining === 1 ? "" : "s"} left`,
      detail: "Upgrade to Solo ($39/month) anytime or continue on the Free plan when trial ends.",
      href: "/settings?tab=billing",
      createdAt: subscription.updatedAt,
    });
  }
  if (actionRequiredCount > 0) {
    notifications.push({
      id: "notif_action_req",
      kind: "warning",
      title: `${actionRequiredCount} invoice${actionRequiredCount === 1 ? "" : "s"} need EN 16931 repair`,
      detail: "Mandatory fields (such as Leitweg-ID) must be completed before delivery.",
      href: "/invoices",
      createdAt: new Date().toISOString(),
    });
  }
  if (overdueCount > 0) {
    notifications.push({
      id: "notif_overdue",
      kind: "warning",
      title: `${overdueCount} overdue receivable${overdueCount === 1 ? "" : "s"}`,
      detail: "Review unpaid past-due invoices in Payments & AR.",
      href: "/payments",
      createdAt: new Date().toISOString(),
    });
  }
  const pendingAp = incoming.filter((i) => i.approvalStatus === "PENDING_REVIEW").length;
  if (pendingAp > 0) {
    notifications.push({
      id: "notif_ap",
      kind: "info",
      title: `${pendingAp} incoming supplier bill${pendingAp === 1 ? "" : "s"} awaiting review`,
      detail: "Inspect and approve supplier invoices in your Incoming Inbox.",
      href: "/inbox",
      createdAt: new Date().toISOString(),
    });
  }
  for (const ev of recentAudit.slice(0, 4)) {
    notifications.push({
      id: `audit_${ev.id}`,
      kind: "success",
      title: ev.eventType.replace(/_/g, " "),
      detail: `${ev.invoiceNumber} · by ${ev.actorEmail}`,
      href: ev.invoiceId ? `/invoices/${ev.invoiceId}` : "/settings?tab=security",
      createdAt: ev.createdAt,
    });
  }

  return {
    days,
    kpis: {
      totalInvoices: total,
      sentCount,
      paidCount,
      overdueCount,
      draftCount,
      actionRequiredCount,
      totalCustomers: customers.length,
      totalProducts: products.length,
      invoicedThisMonth: Number(invoicedThisMonth.toFixed(2)),
    },
    trendSeries,
    statusBreakdown,
    recentInvoices: classified.slice(0, 8),
    actionRequired: classified.filter((i) => i.status === "ACTION_REQUIRED").slice(0, 6),
    getStarted,
    notifications: notifications.slice(0, 8),
  };
}
