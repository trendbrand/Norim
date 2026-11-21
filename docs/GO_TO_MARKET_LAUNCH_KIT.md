# NormInvoice — Go-To-Market Launch Kit (€0 → €1,000+ MRR Playbook)

## 1. Pre-Launch Production Checklist (Day 1–3)
1. **Domain & EU Server (~€30/mo):**
   - Register domain (e.g., `norminvoice.eu` or `fakturabridge.de`).
   - Provision **Hetzner Cloud `CPX41` (Falkenstein / Nuremberg, Germany)** + **Hetzner Object Storage** bucket with Object Lock enabled.
   - Sign Hetzner GDPR Art. 28 AVV (DPA) in Hetzner Cloud Console (1 click).
   - Run `./infra/deploy-hetzner.sh` and schedule `./infra/backup-postgres.sh` in root crontab (`0 2 * * *`).
2. **Paddle Merchant of Record Setup (Pakistan & Global Founder Friendly):**
   - Apply at `paddle.com` using your live deployed site with `/legal/impressum`, `/legal/privacy`, `/legal/terms`, and transparent €19 / €49 / €129 pricing live (Paddle requires live Terms, Privacy & Pricing pages for approval!).
   - Create 3 recurring EUR products (`Solo €19/mo`, `Business €49/mo`, `Agency €129/mo`) and point Paddle webhook to `https://yourdomain.eu/api/webhooks/paddle`.
   - Connect your local bank wire / Payoneer payout details.
3. **Google Search Console (SEO Engine Day 1):**
   - Submit `https://yourdomain.eu/sitemap.xml` so all 45+ EN 16931 / `BR-DE-*` / `BR-FR-*` Error Wiki pages + Free Validator start ranking immediately.

---

## 2. High-Intent Acquisition Channels (Zero Paid Ads Needed)

### Channel A: Free SEO Tools & Error Code Pages (Compounding Organic Traffic)
High-intent European keywords already baked into your routes:
- **DE:** `"ZUGFeRD Viewer kostenlos online"`, `"XRechnung prüfen online kostenlos"`, `"BR-DE-15 Fehler lösen"`, `"Stripe ZUGFeRD automatisch"`, `"WooCommerce ZUGFeRD Plugin"`
- **FR:** `"Validateur Factur-X gratuit en ligne"`, `"Stripe Factur-X automatique"`, `"SIREN Factur-X BT-30"`
- **EN:** `"Stripe EU e-invoice ZUGFeRD Factur-X"`, `"free XRechnung validator zero retention"`

### Channel B: Community Launches (First 5–15 Paying Users in Weeks 1–4)
- **Reddit:** `r/germany`, `r/Finanzen`, `r/selbststaendig`, `r/stripe`, `r/woocommerce`, `r/SaaS`, `r/indiehackers`
  - *Pain-First Post Angle (Never spammy!):*
    > *"Germany's B2B e-invoice issuing mandate starts Jan 2027 and Stripe/WooCommerce still send plain PDFs. I built a 100% EU-hosted, zero-retention ZUGFeRD / Factur-X / XRechnung viewer & validator (and an auto-bridge for Stripe + WooCommerce + DATEV export). You can drop any invoice to check it for free — would love feedback from German/French founders!"*
- **WordPress.org Directory:** Submit `plugins/woocommerce-norminvoice/` to the official free WordPress.org Plugin Directory — drives free organic WooCommerce store installs every single week!
- **Direct Outreach to German *Steuerberater* & Boutique Web Agencies (Fastest €49–€129/mo deals):**
  - Offer agencies the **€129/mo Agency plan** or affiliate rev-share so they connect all their German/French Stripe & WooCommerce clients.

---

## 3. Revenue Math to Hit \$1,000+ MRR
- **Month 1–2 (Milestone 1 — €100+/mo):** 3 Solo (€19) + 2 Business (€49) = **€155 MRR (~\$168/mo)** — already profitable after €50/mo infra!
- **Month 3–6 (Milestone 2 — €1,000+/mo):** 10 Solo (€190) + 14 Business (€686) + 2 Agency (€258) = **€1,134 MRR (~\$1,230/mo)** — **~89% net profit margin**!
