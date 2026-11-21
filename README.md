# NormInvoice — Production EU E-Invoice Bridge & Dual Validator

**EN 16931 · ZUGFeRD 2.3 · Factur-X 1.07 · XRechnung 3.0.2 (CII & UBL) · Peppol BIS 3.0 · PDF/A-3b · GoBD BEG IV · DATEV EXTF · French FEC**

NormInvoice is a production, multi-tenant European B2B e-invoicing SaaS spanning **6 workspace packages, 102 Next.js routes, 35+ strictly authenticated REST API & tenant-scoped webhook endpoints, a WordPress/WooCommerce PHP plugin, an official TypeScript SDK, and Hetzner Germany EU-sovereign Docker deployment**.

---

## Key Production Capabilities

- **Strict Multi-Tenant Isolation & Auth Gates:** Every workspace page (`/dashboard`, `/invoices/*`, `/customers`, `/batch`, `/exports`, `/settings`, `/onboarding`) redirects anonymous users to `/login?next=...` via Edge HMAC-SHA256 verification. Every private `/api/v1/*` route enforces HTTP 401 without a valid `HttpOnly` session cookie or org-scoped Bearer API key (`ni_live_...`).
- **Persistent Storage (`node:sqlite` + PostgreSQL 16 RLS):** Zero-loss local SQLite persistence (`data/norminvoice.sqlite`) with AES-256-GCM encryption at rest for webhook secrets, `scrypt` password hashing, and PostgreSQL 16 Row-Level Security write-through in Docker production.
- **Complete SaaS Feature Suite:**
  - **3-Step Guided Onboarding** (`/onboarding`) with live EU VIES check and ISO 13616 MOD-97 IBAN validation
  - **Customers CRM** (`/customers`) with EU VIES verification, Leitweg-ID (`BT-10`), and default e-invoice formats
  - **Invoices Ledger, Builder & Detail** (`/invoices`, `/invoices/new`, `/invoices/[id]`) with Draft vs. Finalize, gapless sequential numbering, EPC SEPA GiroCode QR, inline compliance repair, Email Dispatch, **1-Click GoBD Credit Note (`381`)**, and GoBD immutability enforcement
  - **Accountant Export & Audit Center** (`/exports`) with date-range DATEV EXTF (`SKR03`/`SKR04`), French DGFiP FEC, complete PDF+XML+DATEV+FEC Archive `.zip`, and GoBD *Verfahrensdokumentation*
  - **7-Tab Enterprise Settings Center** (`/settings`): Company & Tax (`BG-4` + Logo), Invoicing & Banking (`BG-16` + MOD-97 IBAN), Tenant-Scoped Stripe/WooCommerce Webhooks + Delivery Logs, Team & RBAC, Scoped API Keys, Billing & Quota (Paddle MoR), and Security (Password Change, Live GoBD SHA-256 Hash-Chain Verifier, GDPR Art. 20 Export & Art. 17 Workspace Erasure)
- **Public Zero-Retention Dual Validator (`/`):** Free instant ZUGFeRD / Factur-X / XRechnung / Peppol inspection in RAM with XXE/DTD protection and 45+ EN/DE/FR error reference pages (`/errors/[ruleId]`).

---

## Monorepo Architecture

```text
norminvoice/
├── apps/web/                         # Next.js 15 App Router UI (DE/FR/EN) + Strictly Authenticated APIs + 45+ SEO Error Wiki Pages
├── packages/einvoice-core/           # EN 16931 Domain, CII & UBL Serializers, XXE-Safe Parser, Hybrid PDF/A-3b, Stripe/Woo/CSV Mappers, DATEV EXTF + French FEC Exporters, EU VIES Circuit Breaker, 12 Golden Fixtures
├── packages/db/                      # PostgreSQL 16 Drizzle ORM + RLS Policies + GoBD Append-Only Trigger + AES-256-GCM Encryption + SHA-256 Hash Chain
├── packages/sdk/                     # Official Zero-Dependency TypeScript / Node.js Client SDK (@norminvoice/sdk)
├── plugins/woocommerce-norminvoice/  # Installable WordPress/WooCommerce PHP Bridge Plugin v1.1.0 (HPOS + HMAC-SHA256)
├── services/einvoice-engine/         # Sandboxed Python 3.12 FastAPI Engine (WeasyPrint + Ghostscript PDF/A-3b + factur-x + veraPDF CLI)
├── services/kosit-validator/         # Pinned Official German KoSIT Validator + XRechnung 3.0.2 Schematron Container
├── services/worker/                  # BullMQ Async Orchestrator (Stripe/Woo Jobs, EU S3 WORM Archiving, GoBD Hash Chaining)
├── infra/                            # Hetzner Germany Production & Dev Docker Compose, Caddyfile, deploy-hetzner.sh, backup-postgres.sh
├── scripts/                          # launch-preflight.mjs (Multi-Tenant E2E + Cross-Tenant Pen-Test) & security-audit.mjs (OWASP + EU GDPR)
└── docs/                             # GO_TO_MARKET_LAUNCH_KIT.md & FIRST_LAUNCH_CHECKLIST.md
```

---

## Quick Start (Local Development)

```bash
# 1. Install all workspace dependencies
pnpm install

# 2. Run all 31 automated unit tests (EN 16931 Compliance + AES-256-GCM/GoBD Security + SDK)
pnpm test

# 3. Full 5-workspace typecheck & production build
pnpm typecheck && pnpm build

# 4. Run locally on http://localhost:3000
pnpm --filter @norminvoice/web start

# 5. Run live Multi-Tenant E2E Preflight & OWASP/EU-GDPR Security Audit
node scripts/launch-preflight.mjs http://localhost:3000
node scripts/security-audit.mjs http://localhost:3000
```

## Production Deployment (Hetzner Germany — EU Sovereign)

```bash
cp .env.example .env
# Populate real secrets (POSTGRES_PASSWORD, APP_ENCRYPTION_KEY_HEX, AUTH_SECRET, S3, Resend, Paddle)
chmod +x infra/deploy-hetzner.sh infra/backup-postgres.sh
./infra/deploy-hetzner.sh
```
