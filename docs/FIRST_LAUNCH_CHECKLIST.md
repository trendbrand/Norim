# NormInvoice — First Launch Day Runbook (Zero to First Paying EU Customer)

## 1. 15-Minute Production Go-Live (Hetzner Germany)

1. **Generate Production Secrets Locally:**
   ```bash
   pnpm env:init
   ```
   Open the generated `.env` and fill:
   - `APP_DOMAIN=norminvoice.eu` (your purchased domain)
   - `S3_*` (Hetzner Object Storage Falkenstein/Nuremberg bucket with Object Lock enabled)
   - `RESEND_API_KEY` (verified EU sending domain)
   - `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`, `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`, `NEXT_PUBLIC_PADDLE_ENV=production`
   - `STRIPE_WEBHOOK_SECRET`
2. **Update Legal Impressum:**
   - Replace the placeholder company name & street address in `apps/web/src/app/legal/impressum/page.tsx`.
3. **Provision Hetzner Cloud `CPX41` (Germany — ~€27/mo):**
   - Point DNS `A` record for `norminvoice.eu` (and `www`) to the Hetzner IPv4.
   - SSH in, install Docker Engine + Compose plugin, clone repo, copy `.env`, and run:
     ```bash
     chmod +x infra/deploy-hetzner.sh infra/backup-postgres.sh
     ./infra/deploy-hetzner.sh
     ```
   - Add daily backup cron (`crontab -e`): `0 2 * * * /opt/norminvoice/infra/backup-postgres.sh >> /var/log/norminvoice-backup.log 2>&1`
4. **Run Live E2E Pre-Flight Verification Against Production:**
   ```bash
   node scripts/launch-preflight.mjs https://norminvoice.eu
   ```
   All 10 end-to-end checks must report `[PASS]`.

---

## 2. Paddle Merchant of Record Approval (Pakistan & Worldwide Founders)
1. Sign up at `paddle.com` → add your live domain `https://norminvoice.eu`.
2. Paddle checks:
   - Live Pricing page (`/#pricing`) ✅
   - Live Terms of Service (`/legal/terms`) ✅
   - Live Privacy Policy (`/legal/privacy`) ✅
   - Live Impressum / Contact (`/legal/impressum`) ✅
3. Create 3 recurring EUR Prices (`€19`, `€49`, `€129`) and add their IDs to `.env`:
   - `PADDLE_PRICE_SOLO=pri_...`
   - `PADDLE_PRICE_BUSINESS=pri_...`
   - `PADDLE_PRICE_AGENCY=pri_...`
4. Register Paddle Webhook URL: `https://norminvoice.eu/api/webhooks/paddle` (events: `subscription.activated`, `subscription.updated`, `subscription.canceled`).

---

## 3. Ready-to-Publish Day-1 Launch Posts (Copy & Paste)

### Post A — Product Hunt / Hacker News (Show HN)
- **Title:** `NormInvoice – Zero-retention ZUGFeRD / Factur-X / XRechnung validator & Stripe EU e-invoice bridge`
- **Tagline:** `Free EU e-invoice dual validator + automatic Stripe & WooCommerce EN 16931 bridge`
- **First Comment:**
  > Hey everyone! Germany's mandatory B2B e-invoice issuing starts Jan 2027, France's receiving mandate went live Sept 2026, and Belgium's Peppol mandate is already live — yet Stripe and WooCommerce still emit plain PDFs.
  >
  > I built **NormInvoice** (100% EU-hosted in Germany):
  > 1. **Free Zero-Retention Dual Validator & Viewer:** Drop any ZUGFeRD 2.3, Factur-X 1.07, or XRechnung 3.0.2 PDF/XML. Checked in RAM (never stored) with plain-language DE/FR/EN error guides and an EPC SEPA GiroCode QR.
  > 2. **Stripe & WooCommerce Auto-Bridge:** Converts finalized invoices + credit notes (TypeCode 381), verifies EU VAT via cached VIES (with circuit breakers), reconciles €0.01 Stripe rounding via `BT-114`, and pauses incomplete invoices in a 1-click Repair Queue so you never send a broken invoice.
  > 3. **Accountant Exports:** 1-click German DATEV EXTF v700, French DGFiP FEC, CSV Batch -> ZIP converter, and auto-generated GoBD Verfahrensdokumentation.
  >
  > Try dropping a sample invoice at `https://norminvoice.eu` — zero signup needed! Would love feedback from EU founders and accountants.

### Post B — German Communities (`r/selbststaendig`, `r/Finanzen`, `r/germany`)
- **Titel:** `Kostenloser ZUGFeRD / XRechnung Prüfer & Viewer (DSGVO Zero-Retention, 100 % Hosting in DE) + Stripe/WooCommerce Bridge`
- **Text:**
  > Hallo zusammen, da ab Januar 2027 die B2B-Versandpflicht für E-Rechnungen in Deutschland startet und Stripe/WooCommerce standardmäßig nur normale PDFs verschicken, habe ich **NormInvoice** gebaut:
  > - **Kostenloser Online-Prüfer & Viewer:** ZUGFeRD 2.3, Factur-X & XRechnung 3.0.2 einfach reinziehen, lesbar anzeigen (inkl. SEPA-GiroCode-QR) und EN-16931- / BR-DE-Fehler auf Deutsch verstehen — ohne Anmeldung, ohne Speicherung (Zero-Retention im RAM).
  > - **Automatisierung für Freelancer & SaaS:** Stripe-Webhook, leichtes WooCommerce-Plugin, CSV-Stapelkonverter, Kleinunternehmer § 19 UStG, VIES-USt-Prüfung, GoBD-Verfahrensdokumentation und 1-Klick-DATEV-EXTF-Export.
  >
  > Feedback aus der Praxis (besonders zu DATEV SKR03/SKR04 & Leitweg-ID-Fällen) ist extrem willkommen!

### Post C — WordPress.org Plugin Directory Submission
- Download your packaged zip from `/api/v1/plugins/woocommerce/download` (source in `plugins/woocommerce-norminvoice/`) and submit to `https://wordpress.org/plugins/developers/add/` for free compounding WooCommerce organic installs.
