import {
  bigint,
  bigserial,
  boolean,
  char,
  customType,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
});

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  defaultLocale: text("default_locale").notNull().default("de"),
  retentionYears: smallint("retention_years").notNull().default(8),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  fullName: text("full_name"),
  emailVerified: boolean("email_verified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const memberships = pgTable(
  "memberships",
  {
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("owner"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.orgId, t.userId] })]
);

export const sellerProfiles = pgTable("seller_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  legalName: text("legal_name").notNull(),
  tradingName: text("trading_name"),
  countryCode: char("country_code", { length: 2 }).notNull().default("DE"),
  street: text("street").notNull(),
  postalCode: text("postal_code").notNull(),
  city: text("city").notNull(),
  vatId: text("vat_id"),
  taxNumber: text("tax_number"),
  sirenNumber: text("siren_number"),
  isKleinunternehmer: boolean("is_kleinunternehmer").notNull().default(false),
  electronicAddress: text("electronic_address").notNull(),
  electronicSchemeId: text("electronic_scheme_id").notNull().default("EM"),
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone").notNull(),
  iban: text("iban"),
  bic: text("bic"),
  defaultFormat: text("default_format").notNull().default("ZUGFERD_EN16931"),
  accountantCcEmail: text("accountant_cc_email"),
  isDefault: boolean("is_default").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const integrations = pgTable(
  "integrations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(), // stripe | woocommerce | custom_smtp
    status: text("status").notNull().default("active"),
    externalAccountId: text("external_account_id"),
    encryptedCredentials: bytea("encrypted_credentials").notNull(),
    kmsKeyVersion: smallint("kms_key_version").notNull().default(1),
    webhookSecretEnc: bytea("webhook_secret_enc"),
    configJson: jsonb("config_json").notNull().default({}),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("uq_integrations_org_provider_acct").on(t.orgId, t.provider, t.externalAccountId)]
);

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    sellerProfileId: uuid("seller_profile_id")
      .notNull()
      .references(() => sellerProfiles.id),
    idempotencyKey: text("idempotency_key").notNull(),
    source: text("source").notNull(), // stripe | woocommerce | api | manual | csv
    sourceRef: text("source_ref"),
    invoiceNumber: text("invoice_number").notNull(),
    typeCode: smallint("type_code").notNull().default(380),
    issueDate: date("issue_date").notNull(),
    currency: char("currency", { length: 3 }).notNull().default("EUR"),
    netAmountCents: bigint("net_amount_cents", { mode: "number" }).notNull(),
    taxAmountCents: bigint("tax_amount_cents", { mode: "number" }).notNull(),
    grossAmountCents: bigint("gross_amount_cents", { mode: "number" }).notNull(),
    buyerName: text("buyer_name").notNull(),
    buyerCountry: char("buyer_country", { length: 2 }).notNull(),
    buyerVatId: text("buyer_vat_id"),
    buyerVatStatus: text("buyer_vat_status"),
    targetFormat: text("target_format").notNull(),
    status: text("status").notNull().default("QUEUED"),
    canonicalPayload: jsonb("canonical_payload").notNull(),
    validationPassed: boolean("validation_passed").notNull().default(false),
    validationErrors: jsonb("validation_errors").notNull().default([]),
    verapdfPassed: boolean("verapdf_passed"),
    pdfObjectKey: text("pdf_object_key"),
    xmlObjectKey: text("xml_object_key"),
    kositReportKey: text("kosit_report_key"),
    sha256Pdf: char("sha256_pdf", { length: 64 }),
    sha256Xml: char("sha256_xml", { length: 64 }),
    deliveredToEmail: text("delivered_to_email"),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    archiveLockedUntil: date("archive_locked_until"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("uq_invoices_org_idempotency").on(t.orgId, t.idempotencyKey),
    index("idx_invoices_org_status").on(t.orgId, t.status, t.createdAt),
  ]
);

export const invoiceAuditEvents = pgTable("invoice_audit_events", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  orgId: uuid("org_id")
    .notNull()
    .references(() => organizations.id),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoices.id),
  eventType: text("event_type").notNull(),
  actorType: text("actor_type").notNull(),
  actorId: text("actor_id"),
  payloadJson: jsonb("payload_json").notNull().default({}),
  prevHash: char("prev_hash", { length: 64 }).notNull(),
  eventHash: char("event_hash", { length: 64 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const viesCache = pgTable(
  "vies_cache",
  {
    countryCode: char("country_code", { length: 2 }).notNull(),
    vatNumber: text("vat_number").notNull(),
    status: text("status").notNull(),
    traderName: text("trader_name"),
    traderAddress: text("trader_address"),
    viesRequestId: text("vies_request_id"),
    checkedAt: timestamp("checked_at", { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.countryCode, t.vatNumber] })]
);

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  keyPrefix: text("key_prefix").notNull(),
  keyHash: char("key_hash", { length: 64 }).notNull().unique(),
  scopes: text("scopes").array().notNull(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  orgId: uuid("org_id")
    .primaryKey()
    .references(() => organizations.id, { onDelete: "cascade" }),
  paddleCustomerId: text("paddle_customer_id").unique(),
  paddleSubscriptionId: text("paddle_subscription_id").unique(),
  planTier: text("plan_tier").notNull().default("free"),
  status: text("status").notNull().default("active"),
  monthlyInvoiceQuota: integer("monthly_invoice_quota").notNull().default(3),
  currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
