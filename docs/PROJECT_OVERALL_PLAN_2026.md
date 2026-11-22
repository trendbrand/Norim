# NormInvoice — Overall Project Plan, Analysis & Market Fit (2026)

> Prepared 22 Nov 2026. Combines a deep read of `NormInvoice_Complete_Software_Master_Plan_2026.docx`,
> an audit of the current codebase (`F:\Idea`), and fresh web market research.
> **Hosting decision captured:** target cloud is **AWS** (not Hetzner as the README currently states) — see §7.

---

## 0. One-paragraph summary (TL;DR)

NormInvoice is a **European B2B e-invoicing + compliance platform**. The master plan is an ambitious, legally-grounded 13-country blueprint; the **current code is a genuinely strong Germany-first MVP** (~49.5k LOC, 44 API routes, 33 pages, a real EN 16931 engine, DATEV/FEC export, GoBD audit chain, a free public validator, plus freshly-scaffolded accountant / payments / recurring / automations / copilot / Peppol modules). The market is real and time-boxed: **Germany's B2B issuance mandate hits >€800k firms on 1 Jan 2027 and *all SMEs on 1 Jan 2028*** — a forced-adoption wave. The EU e-invoicing market is ~**$2.6B in 2026 → ~$7B by 2034 (~14–15% CAGR)**, driven by ViDA + national mandates. The right wedge is **"the simple, explainable, DATEV-friendly e-invoice tool for German/EU SMEs"**, using the free validator as the acquisition funnel, then expanding country packs behind legal gates.

---

## 1. What the Master Plan proposes (the vision)

| Dimension | Plan |
|---|---|
| **Product** | European invoicing & compliance OS for SMEs, finance teams, accountants, enterprises |
| **Surfaces** | Customer Workspace · Accountant/Partner Workspace · **separate** Super-Admin · Developer Portal · Marketing/Help |
| **Countries** | DE, BE, FR, PL, IT, ES, RO, HR, GR, NL, AT, PT, UK (13) |
| **Launch order** | Germany (P0) → Belgium (P0/P1) → France + Poland (P2) → rest behind gates |
| **Core principle** | Country packs = independently versioned, auditable **compliance adapters**, not scattered `if/else`. Validation, tax reporting, network delivery, payment state and legal archiving are **separate auditable concerns**. |
| **Honesty rule** | Nothing shown as "compliant/LIVE" without end-to-end certified/partner acceptance. Multi-dimensional status (Document / Validation / Transmission / Authority / Recipient / Payment / Accounting) — never call an invoice "Paid" because it was "Delivered". |
| **Architecture** | Modular monolith first (ADR-007), canonical invoice model + country adapters (ADR-001), durable outbox/queue + idempotency (ADR-004), separate staff admin realm (ADR-002), AI is **not** a compliance authority (ADR-006). |
| **Timeline realism** | Plan explicitly says a verified 13-country GA is multi-year; 6 months is realistic only for Germany-first + a Belgian Peppol pilot. |

**Feature catalogue (F01–F14):** Identity/onboarding, Invoice Studio, Validator/Compliance Center, Network Delivery, Incoming Inbox (AP), Payments & Receivables, Accountant Workspace, Workflow Automation, Master Data, Reports/Audit/Archive, Developer Platform, AI Copilot, Team Collaboration, Operations/Integrations.

---

## 2. Current code reality — what is ACTUALLY built

Monorepo (`pnpm`): `apps/web` (Next.js 15), `packages/einvoice-core`, `packages/db`, `packages/sdk`, `plugins/woocommerce-norminvoice`, `services/{einvoice-engine,kosit-validator,worker}`.

### ✅ Built and solid (P0-grade)
- **EN 16931 compliance core** — deterministic validator (`validator.ts`), decimal calculator, CII & UBL serializers, XXE-safe parser, hybrid **PDF/A-3b**, rules dictionary with EN/DE/FR error reference pages (`/errors/[ruleId]`).
- **Germany**: XRechnung 3.0.2 (CII & UBL), ZUGFeRD 2.3, BR-DE-* rules, Leitweg-ID, §19 UStG, **GoBD SHA-256 hash-chain audit**, **DATEV EXTF (SKR03/04)** + French **FEC** export, Verfahrensdokumentation.
- **Multi-tenant SaaS**: Edge HMAC session auth, org-scoped API keys (`ni_live_…`), per-`org_id` query scoping, AES-256-GCM at rest, scrypt passwords, fail-fast secret hardening.
- **Public free validator** (`/`) — zero-retention dual validator (ZUGFeRD / Factur-X / XRechnung / Peppol). *This is the growth wedge — already real.*
- **Customer app**: onboarding (live VIES + MOD-97 IBAN), customers CRM, invoice ledger/builder/detail (draft→finalize, gapless numbering, SEPA GiroCode QR, credit notes, email dispatch), exports/audit center, enterprise settings (RBAC, API keys, billing/quota via Paddle, GDPR Art.20 export + Art.17 erasure).
- **13 country modules declared** in `country-modules.ts` with honest statuses: **4 LIVE_CORE, 3 PARTNER_ADAPTER, 6 PLANNED** — matches the plan's "no false LIVE" principle.

### 🟡 Scaffolded / partial (freshly added, not production-complete)
- `accountant/` (delegations), `payments/`, `recurring/`, `automations/`, `reports/`, `compliance/` pages + API routes.
- **AI Copilot** (`/api/v1/copilot`) — **grounded, rules-based** (not an LLM): looks up BR-* rules + country modules from real workspace data. Safe-by-design (ADR-006), but today it's deterministic lookups, not conversational AI.
- **Peppol lookup** (`/api/v1/peppol/lookup`) — hits the **real OpenPeppol Directory** API. Good. But **actual Peppol *sending* (an accredited Access Point) is not built** — needs a partner.
- **Command palette** + Copilot panel UI components.

### 🔴 Gaps vs the plan (not yet real)
- **No certified Peppol Access Point / no live network transmission** for any country (biggest compliance gap for BE/NL/AT and DE B2B exchange).
- **No France approved-platform (PDP) partner**, **no Poland KSeF**, **no Italy SdI**, **no Romania ANAF**, etc. — those 6 countries are correctly PLANNED.
- **Worker/queue (`services/worker`) is a scaffold** — invoices are generated synchronously; the durable outbox/idempotent-submission pattern (ADR-004) is not wired into the live path.
- **Storage is single-node SQLite** (`node:sqlite`), one `web-api` instance, no horizontal scale. Postgres+RLS path exists but is inert.
- **Separate super-admin realm (ADR-002)** — the plan's crown jewel for trust — exists only as an `/admin` overview page inside the main app, not a separate auth realm/service.
- Incoming AP inbox, automations engine (dry-run simulation), full accountant multi-client workspace, developer portal/sandbox, webhooks replay — early.

**Verdict:** The code is **ahead of a typical pre-seed MVP** and faithfully follows the plan's safety principles. It is a credible **Germany-first product**, not yet a multi-country network.

---

## 3. Market research findings (fresh, Nov 2026)

### Market size & growth
- **Europe e-invoicing market:** ~**$2.2B (2025) → $2.6B (2026) → ~$7B by 2034**; CAGRs cited **~14–16%** (IMARC, Meticulous, Market Data Forecast).
- **Global:** ~**$18.5B (2026) → ~$70B by 2034**; Billentis 2026 estimates **~600 billion invoices/year** globally, roughly half B2B/B2G.
- Europe holds a **dominant ~34% share** of the global market, propelled by ViDA.

### Demand drivers (why now)
- **ViDA** (VAT in the Digital Age) — EU-wide digital reporting direction.
- **National B2B mandates stacking 2025–2030**: Belgium (live Jan 2026), Poland KSeF (Feb/Apr 2026), Greece (2026), Croatia (2026/27), France (receiving Sep 2026, SMEs Sep 2027), Spain (phased 2027/28), **Germany** (receiving since 2025; **issuance >€800k on 1 Jan 2027; ALL SMEs 1 Jan 2028**), Netherlands B2B (2030), UK (announced Apr 2029).
- **The Germany 2028 SME cliff is the single biggest tailwind** for this exact product: hundreds of thousands of German SMEs *must* issue structured e-invoices and most still can't.

### Competitive landscape
| Tier | Players | Position |
|---|---|---|
| **Enterprise compliance** | Sovos, Pagero (Thomson Reuters), Basware, Comarch, Avalara, Vertex, EY GTES, RTC | Global multi-country, expensive, sold to large tax/AP teams. Not SME-friendly. |
| **API / network (Peppol)** | **Storecove**, Billit, Qvalia, Tradeshift | Developer-first API to Peppol across 30+ countries. Strong for ERP/platform integration. |
| **SME / simple** | Billit, Invoicier, Zoho Invoice, Tipalti (AP, from €99/mo) | Simple invoicing; compliance depth varies. |

**White space NormInvoice can own:** a **DE/EU SME-native, explainable-compliance** product — "see exactly which field fails and how to fix it," DATEV-native, free validator as top-of-funnel, accountant collaboration built in. Enterprise tools are too heavy/costly; pure API players (Storecove) aren't an end-user app. **Differentiators already in the code:** free real-backend validator, explainable BR-* errors, GoBD/DATEV depth, honest multi-dimensional status.

---

## 4. Recommended product strategy

**Positioning:** *"The honest, explainable e-invoicing tool built for German & EU SMEs and their accountants — compliant by 2027/2028, not just a PDF generator."*

**Wedge → expansion:**
1. **Wedge (now–Q2 2027):** Free German validator → paid Germany invoicing + inbox + DATEV + accountant handoff. Ride the 2027/2028 mandate.
2. **Network (2027):** Add a **certified Peppol Access Point via partner** → unlock Belgium + Netherlands + Austria B2G/B2B "for free" (same Peppol rails).
3. **Clearance countries (2027–2028):** France PDP partner, Poland KSeF — the two biggest additional mandated markets.
4. **Long tail (2028+):** IT/ES/RO/HR/GR/PT/UK behind per-country legal gates.

**Moats to deepen:** DATEV/accountant ecosystem, explainability (error wiki + grounded copilot), trust posture (separate admin realm, audit chain, EU data residency), WooCommerce/Stripe/ERP plugins.

---

## 5. Feature plan — priority matrix

| Priority | Feature | State | Action |
|---|---|---|---|
| **P0 — finish for mandate** | German invoice issue + validate + PDF/A-3b | ✅ built | Harden, get official validator/fixtures signed off |
| P0 | Incoming AP inbox (receiving = already mandatory in DE) | 🟡 partial | Complete safe-parse, dedup, readable-vs-parsed, approve/export |
| P0 | DATEV export + accountant handoff | ✅/🟡 | Finish accountant multi-client workspace + consent/expiry |
| P0 | Durable outbox + idempotent submission | 🔴 scaffold | **Wire the worker** before any live network send |
| **P1 — network** | Certified Peppol Access Point (partner) | 🔴 | Sign partner → unlock BE/NL/AT |
| P1 | Payments & receivables (separate ledger) | 🟡 | Finish ageing, reminders, bank CSV match |
| P1 | Automations (trigger/condition/action + dry-run) | 🟡 | Build simulation + approval gates |
| P1 | Developer portal (sandbox, webhooks, signed replay) | 🟡 | SDK exists; add sandbox + webhook signing |
| **P1 — trust** | Separate super-admin realm (ADR-002) | 🔴 | Split auth/service for staff; reason codes, 4-eyes |
| P2 | France PDP, Poland KSeF connectors | 🔴 (PLANNED) | Contracts + sandbox certification |
| P2 | AI Copilot (conversational, still grounded) | 🟡 rules-based | Optionally layer an LLM *over* the deterministic engine — never as authority |
| P2 | IT/ES/RO/HR/GR/PT/UK packs | 🔴 (PLANNED) | Per-country legal gate checklist |

---

## 6. Roadmap (phased, mandate-aligned)

- **Phase A — Harden Germany (now → Q1 2027):** official XRechnung/KoSIT fixtures signed off, complete AP inbox, wire the durable worker/outbox, finish accountant workspace, SOC-readiness hygiene. *Exit: a German SME can issue + receive + hand to accountant, end-to-end, verifiably.*
- **Phase B — Peppol network (Q1–Q2 2027):** integrate a certified Access Point partner → Belgium live, Netherlands/Austria B2G. Separate super-admin realm.
- **Phase C — France + Poland (Q2–Q4 2027):** PDP partner + KSeF 2.0 API, localized UX, certification.
- **Phase D — Scale + long tail (2028+):** migrate to Postgres+RLS for multi-instance on AWS, add remaining country packs behind legal gates, enterprise SSO/SLA.

---

## 7. Infrastructure — **AWS** (per your decision)

The README/infra currently assume a **single Hetzner VPS + SQLite**. For **AWS**, the recommended EU-sovereign target:

| Concern | AWS choice |
|---|---|
| Region | **eu-central-1 (Frankfurt)** for German/EU data residency (eu-west-1 Ireland as DR) |
| Compute | ECS Fargate or App Runner for `web-api`; start 1–2 tasks |
| Data | **RDS PostgreSQL 16 + RLS** (activate the existing `packages/db` path) — replaces SQLite for multi-instance scale |
| Queue | **SQS + a worker service** to finally wire the durable outbox (ADR-004) |
| Documents | **S3** (versioning + Object Lock/WORM for GoBD 8/10-yr retention) + **KMS** envelope encryption |
| Secrets | **AWS Secrets Manager / KMS** (replace env-file secrets) |
| Edge/CDN | CloudFront + WAF; ACM TLS |
| Observability | CloudWatch + OpenTelemetry; PII redaction |
| IaC | Terraform/OpenTofu; separate dev/sandbox/staging/prod + isolated admin plane |

**Migration note:** moving off SQLite to RDS Postgres is the key pre-scale task; the code already contains the Postgres+RLS schema, so this is activation + data migration, not a rewrite. Keep SQLite only for local dev.

---

## 8. Pricing & go-to-market (hypotheses to validate)

| Plan | Price (hyp.) | Pack |
|---|---|---|
| Free/Viewer | €0 | Validator/viewer, size limits, no compliance promise |
| Starter | €9–19/mo | Simple German invoicing |
| Business | €29–49/mo | Inbox, recurring, reminders, accountant access, basic integrations |
| Professional | €79–149/mo | Multi-entity, approvals, automations, API, Peppol bundles |
| Enterprise | Contract | Country connectors, SSO, SLA, private partner routes |

**Acquisition:** free real-backend German validator (SEO on BR-* error codes already built via `/errors/[ruleId]`), tax-advisor/DATEV co-marketing, Peppol connectivity diagnostics, WooCommerce/Stripe plugins. Metered add-ons: network sends, OCR, archive bytes, email.

---

## 9. Top decisions & risks to settle now

**Decisions (from plan §19.3, still open):**
1. Exact P0 scope — German **domestic B2B only** first? (Recommended: yes.)
2. **Peppol Access Point partner** + France PDP partner — contracts/costs/coverage. *(Blocks network launch.)*
3. EU legal entity for contracting + GDPR controller/processor roles.
4. AWS region/tenancy policy + retention strategy (✅ AWS chosen; confirm Frankfurt + WORM).
5. Beta vs production labeling per capability; pricing/SLA.
6. First integration priority: **DATEV** (recommended for DE moat) vs WooCommerce vs Stripe.

**Risks:** wrong law interpretation (→ local counsel + release gates), gateway partner unavailability (→ outbox + fallback), duplicate legal submission (→ idempotency — **must wire the worker first**), tenant data leakage (→ RLS + pentest), over-expansion before Germany is proven.

---

## 10. Bottom line

- **Plan:** excellent, honest, legally grounded — arguably the strongest asset.
- **Code:** a real, safety-correct **Germany-first MVP**, ahead of most seed-stage builds; the free validator + EN 16931 engine + DATEV/GoBD depth are genuine differentiators.
- **Market:** large, growing ~14–15%/yr, and **forced by mandates** — the German 2027/2028 B2B issuance cliff is a now-or-never adoption window.
- **Do next (in order):** (1) wire the durable worker/outbox, (2) finish AP inbox + accountant workspace, (3) sign a Peppol Access Point partner, (4) move to AWS RDS Postgres for scale, (5) keep country expansion strictly behind legal gates.
