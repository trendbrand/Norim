# NormInvoice — Live Testing Checklist (finsightai.online)

_Real-time verification on the live AWS deployment. Legend: ✅ pass · ⚠️ works with caveat · ❌ fail · ⬜ not yet tested_

## 1. Infrastructure & Deploy
- ✅ HTTPS with valid Let's Encrypt cert (Caddy auto-TLS)
- ✅ All containers healthy: caddy, web-api, redis
- ⚠️ einvoice-engine runs but reports **unhealthy** — non-blocking (app falls back to built-in engine); fix pending
- ✅ Secrets loaded from AWS Secrets Manager (never in repo/logs)
- ✅ SQLite data persists across container restarts

## 2. Auth & Onboarding
- ✅ Sign up (custom scrypt auth) → session established
- ✅ Onboarding wizard (company/tax/banking) saves + persists
- ✅ Logout clears session (`authenticated:false`, APIs return 401)
- ✅ GoBD audit trail records onboarding
- ✅ Demo login works (`ENABLE_DEMO_LOGIN=true`) → isolated sample tenant
- ✅ Demo account is **NOT** super-admin (`isSuperAdmin:false`) — hardened

## 3. Invoicing Core
- ✅ Create invoice (builder, live totals: Net €200 / VAT €38 / Total €238)
- ✅ Finalize → number assigned (RE-2026-0001), locked for GoBD
- ✅ Invoice list + persistence (status chips, totals)
- ✅ Dashboard KPIs + Action-Required queue (demo: ERR-2026-0001)
- ✅ Incoming supplier inbox (demo: Hetzner SUP-2026-8812, dedupe/approval)

## 4. Compliance Engine
- ✅ **EN 16931 validation → PASSED**
- ✅ PDF/A-3 generation (`%PDF-1.7`, application/pdf)
- ✅ CII XML generation (`<rsm:CrossIndustryInvoice>`)
- ✅ ZUGFeRD 2.3 default format

## 5. Payments
- ✅ Payment link minting
- ✅ **Public pay page** (amount, IBAN, SEPA GiroCode QR) — no login needed
- ✅ Payment-link URL now correct: `https://finsightai.online/pay/...` (was `0.0.0.0:3000`)

## 6. Connectors / Webhooks
- ✅ Stripe webhook rejects unsigned payload (400)
- ✅ WooCommerce webhook rejects unsigned payload (400)
- ✅ Shopify connector (verified prior: signed→200, forged→401)

## 7. Multi-Tenant Security (data-leak check)
- ✅ Cross-tenant invoice read → 404
- ✅ Cross-tenant PDF/XML download → 404
- ✅ Cross-tenant payment-link mint → 404
- ✅ Customers list does not leak other org's data
- ✅ Admin endpoint returns 404 to customer session (admin realm isolated)

## 8. Billing & Plans
- ✅ Plan backend: upgrade / downgrade / cancel (keeps access to period end)
- ✅ Settings → Billing UI: active-plan card, usage bar, Cancel button, one-click Switch-to grid
- ✅ New pricing live: **Free €0 · Starter €12 · Solo €29 · Business €49 · Agency €129**
- ✅ Monthly/Annual toggle (annual = 2 months free)
- ✅ Trial logic (15-day active)

## 9. App Pages (all return 200, no errors)
- ✅ /dashboard /invoices /customers /catalog /inbox /reports /recurring /settings
- ✅ Data APIs respond: customers, catalog, inbox, recurring

## 10. Translation (DE/FR)
- ✅ Homepage, footer, dashboard/app, all legal pages, trust center → translated
- ❌ **Marketing pages English-only**: /pricing, /features, /about, /faq, /help, /contact, /integrations, /solutions/*, /security
- ⚠️ Pricing cards component (PaddlePricingSection) hardcoded English
- ⚠️ A few `$39` copy mentions remain (SEO titles, FAQ, help) — cosmetic

## Known follow-ups
1. **Translate marketing pages** to DE/FR (phased, like legal pages) — biggest item
2. Fix einvoice-engine health (likely leftover KoSIT reference)
3. Sweep remaining `$39→€29` copy + SEO `<title>` tags
4. (Deferred) Postgres refactor for horizontal scaling
