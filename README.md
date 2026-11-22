# NormInvoice — EU E-Invoice Bridge & Dual Validator

**EN 16931 · ZUGFeRD 2.3 · Factur-X 1.07 · XRechnung 3.0.2 (CII & UBL) · Peppol BIS 3.0 · PDF/A-3b · GoBD · DATEV EXTF · French FEC**

NormInvoice is a **single-node, multi-tenant** European B2B e-invoicing SaaS: a Next.js 15 app, an EN 16931 compliance core, an official TypeScript SDK, a WordPress/WooCommerce PHP plugin, and an optional sandboxed Python PDF/A-3b + KoSIT validation engine — deployed as a Docker stack on one Hetzner Germany VPS.

> **Architecture note (read before deploying):** The production data store is **embedded SQLite** (`node:sqlite`, `data/norminvoice.sqlite`), persisted to a Docker volume and backed up daily. This is a deliberate single-node MVP choice — simple, fast, and sufficient for hundreds of tenants on one box. It means the app runs as **one `web-api` instance** (no horizontal scaling yet). A PostgreSQL 16 + Row-Level-Security path exists in the codebase (`packages/db`, `apps/web/src/lib/db-repository.ts`) as a **future option** for multi-instance scale; it is **inert by default** and not the source of truth. See `docs/PRODUCTION_AUDIT.md` for the full rationale.

---

## Key Capabilities

- **Multi-Tenant Isolation & Auth:** Every workspace page redirects anonymous users to `/login?next=...` via Edge HMAC-SHA256 session verification. Every private `/api/v1/*` route enforces HTTP 401 without a valid `HttpOnly` session cookie or org-scoped Bearer API key (`ni_live_...`). Tenant scoping is enforced in the application layer: **every** SQLite query and mutation is filtered by `org_id`.
- **Persistent Storage (`node:sqlite`, WAL):** Persistent across restarts via a Docker volume, with AES-256-GCM encryption at rest for integration secrets, `scrypt` password hashing, and a tamper-evident GoBD SHA-256 audit hash-chain per organization.
- **Secret hardening:** In production the app **fails fast** if `AUTH_SECRET` or `APP_ENCRYPTION_KEY_HEX` is missing, too short, or still set to a default — it will not start with world-known keys. The demo workspace is **never** seeded in production.
- **SaaS Feature Suite:**
  - **3-Step Guided Onboarding** (`/onboarding`) with live EU VIES check and ISO 13616 MOD-97 IBAN validation
  - **Customers CRM** (`/customers`) with EU VIES verification, Leitweg-ID (`BT-10`), and default e-invoice formats
  - **Invoices Ledger, Builder & Detail** with Draft vs. Finalize, gapless sequential numbering, EPC SEPA GiroCode QR, inline compliance repair, Email Dispatch, 1-Click GoBD Credit Note (`381`), and GoBD immutability enforcement
  - **Accountant Export & Audit Center** (`/exports`): DATEV EXTF (`SKR03`/`SKR04`), French DGFiP FEC, PDF+XML+DATEV+FEC `.zip` archive, and GoBD *Verfahrensdokumentation*
  - **Enterprise Settings** (`/settings`): Company & Tax, Invoicing & Banking (MOD-97 IBAN), tenant-scoped Stripe/WooCommerce webhooks + delivery logs, Team & RBAC, scoped API keys, Billing & Quota (Paddle MoR), Security (password change, live GoBD hash-chain verifier, GDPR Art. 20 export & Art. 17 workspace erasure)
- **Public Zero-Retention Dual Validator (`/`):** Free in-RAM ZUGFeRD / Factur-X / XRechnung / Peppol inspection with XXE/DTD protection and EN/DE/FR error reference pages (`/errors/[ruleId]`).

---

## Monorepo Architecture

```text
norminvoice/
├── apps/web/                         # Next.js 15 App Router UI (DE/FR/EN) + authenticated APIs + SEO error wiki
├── packages/einvoice-core/           # EN 16931 domain, CII & UBL serializers, XXE-safe parser, hybrid PDF/A-3b,
│                                     #   Stripe/Woo/CSV mappers, DATEV EXTF + French FEC exporters, VIES client, golden fixtures
├── packages/db/                      # PostgreSQL 16 Drizzle schema + RLS (OPTIONAL future scale path) + GoBD hash-chain utils
├── packages/sdk/                     # Official zero-dependency TypeScript client SDK (@norminvoice/sdk)
├── plugins/woocommerce-norminvoice/  # WordPress/WooCommerce PHP bridge plugin (HPOS + HMAC-SHA256)
├── services/einvoice-engine/         # OPTIONAL sandboxed Python 3.12 FastAPI engine (WeasyPrint + Ghostscript + factur-x + veraPDF)
├── services/kosit-validator/         # OPTIONAL pinned KoSIT Validator + XRechnung Schematron container
├── services/worker/                  # BullMQ async scaffold (see note below — not yet wired into the live path)
├── infra/                            # Hetzner prod/dev Docker Compose, Caddyfile, deploy-hetzner.sh, backup-sqlite.sh
├── scripts/                          # launch-preflight.mjs + security-audit.mjs
└── docs/                             # PRODUCTION_AUDIT.md, GO_TO_MARKET_LAUNCH_KIT.md, FIRST_LAUNCH_CHECKLIST.md
```

> **Durable transmission outbox (ADR-004):** invoice **delivery** runs through a persistent `transmission_jobs` outbox in SQLite drained by an **in-process, idempotent worker** (`apps/web/src/lib/transmission-outbox.ts`). The send endpoint enqueues an idempotent job (`UNIQUE(org_id, idempotency_key)` on invoice+channel+recipient), attempts it inline for instant feedback, and — if the provider is down — leaves it durably queued for automatic retry with exponential backoff and dead-lettering. A job is only ever claimed `QUEUED/FAILED → SENDING` atomically and `SENT` is terminal, so **double-clicks, retries and crashes never produce a duplicate legal submission**. No Redis required on the single node; on AWS this maps 1:1 onto SQS + a worker draining the same outbox.
>
> **`services/worker` status:** the BullMQ worker remains the **multi-instance scale-out path** (requires Redis + a separate process). Its job processor builds XML/PDF, archives to WORM S3 and computes an audit hash. The optional `einvoice-engine` + `kosit-validator` containers, when enabled, provide official PDF/A-3b + KoSIT validation; without them the app uses the built-in deterministic EN 16931 validator.

---

## Quick Start (Local Development)

```bash
pnpm install
pnpm test                 # 31 unit tests (core compliance + GoBD/crypto security + SDK)
pnpm typecheck && pnpm build
pnpm --filter @norminvoice/web dev    # http://localhost:3000
```

A demo workspace is auto-seeded in development only (`founder@nordcloud-gmbh.de` / `DemoPass2026!`). It is **never** seeded when `NODE_ENV=production` or `ENABLE_DEMO_LOGIN=false`.

## Production Deployment (Hetzner Germany — EU Sovereign)

```bash
pnpm env:init             # generates .env with strong random AUTH_SECRET + APP_ENCRYPTION_KEY_HEX
# Fill real secrets: S3_*, RESEND_API_KEY, PADDLE_*, STRIPE_WEBHOOK_SECRET; set APP_DOMAIN
chmod +x infra/deploy-hetzner.sh infra/backup-sqlite.sh
./infra/deploy-hetzner.sh
```

Add a daily SQLite backup cron: `0 2 * * * /opt/norminvoice/infra/backup-sqlite.sh >> /var/log/norminvoice-backup.log 2>&1`.
Finalized invoice artifacts are additionally archived to EU S3 object storage (WORM, 8/10-yr GoBD retention) when `S3_*` is configured.
