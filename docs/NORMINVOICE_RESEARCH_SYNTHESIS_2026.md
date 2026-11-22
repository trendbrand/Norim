# NormInvoice — Research Synthesis & Build Blueprint (Lean, Evidence-Based)

> Version 1.0 · Compiled 22 Nov 2026. This is the disciplined, evidence-first synthesis that drives the
> build. It extends `PROJECT_OVERALL_PLAN_2026.md` with market, competitor, compliance and backlog detail.
> **Epistemic hygiene:** every claim is tagged — [VERIFIED] (official/primary or corroborated), [CLAIM]
> (vendor marketing), [ESTIMATE] (analyst/market research), [INFERENCE] (our analysis). Dates are the
> research date or the source's date. This is **not legal advice**; country go-live still needs counsel.

---

## 0. Research methodology & evidence register

**Approach:** official EU/national tax-authority sources first; analyst market reports for sizing (treated as estimates, not fact); vendor sites/review aggregators for competitor features (marketing separated from verified); AP-benchmark research for problem sizing. Web research performed 22 Nov 2026 via browser.

**Key sources consulted (abbreviated):**
- EU VAT in the Digital Age (ViDA) — Taxation & Customs Union (ec.europa.eu) [VERIFIED]
- EU eInvoicing Country Sheets 2026 (ec.europa.eu/digital-building-blocks) [VERIFIED, mixed verification flags]
- National authorities: BMF (DE), einvoice.belgium.be, impots.gouv.fr, ksef.podatki.gov.pl, AgID (IT), BOE (ES), ANAF (RO), porezna.gov.hr (HR), AADE (GR), HMRC roadmap (UK) [VERIFIED]
- Market sizing: IMARC, Meticulous Research, Market Data Forecast, Billentis 2026 (via Qvalia) [ESTIMATE]
- Competitors: Qvalia Peppol comparison, FAUN.dev tool comparisons, invoicier.com, goodvat.com PA/PDP guide, e-invoice.app vendor directory, procurement/review sites [CLAIM/VERIFIED mix]
- AP benchmarks: Ardent Partners (via Docsumo/autopayables), Hypatos, Cedalio, MAVI, Ainformat, Aequo AP [ESTIMATE]

**Limitations:** market-size figures vary 2–3× across analysts (methodology differences); EC country sheets for RO/NL/AT/PT carry "no verification" flags; competitor feature depth is partly from marketing. Nothing here substitutes for local legal review before a country goes LIVE.

---

## 1. Report 1 — Market intelligence

**Sizing [ESTIMATE]:**
- Europe e-invoicing: ~**$2.2B (2025) → $2.6B (2026) → ~$6.8–7.1B by 2034**; CAGR cited **~14–16%** (IMARC; Market Data Forecast; Meticulous).
- Global: ~**$18.5B (2026) → ~$70B by 2034**; Billentis 2026 estimates **~600B invoices/year** globally (≈half B2B/B2G). Europe ≈ **34%** of the global market.

**Demand drivers [VERIFIED]:**
- **ViDA** adopted 11 Mar 2025, in force 14 Apr 2025. Lets member states set their own national B2B timelines; **intra-EU B2B Digital Reporting Requirements (DRR) mandatory from 1 Jul 2030**; by **1 Jan 2035** domestic real-time-reporting regimes must align to the EU standard. (ec.europa.eu)
- **National mandate wave** (the real near-term forcing function) — see §4.
- **The single biggest near-term tailwind:** Germany B2B **issuance** mandate — **1 Jan 2027 (>€800k 2026 turnover)** and **1 Jan 2028 (all remaining businesses / SMEs)**; receiving already mandatory since 1 Jan 2025.

**Segment demand [INFERENCE from drivers + AP data]:** mandates convert "nice-to-have" into "must-buy" per deadline. Highest urgency now: German SMEs + their *Steuerberater* (tax advisers), Belgian B2B (live since Jan 2026), Polish taxpayers (KSeF live Feb 2026), French businesses (receiving live Sept 2026). Enterprises are largely covered by incumbents; **SME + accountant channel is the underserved, time-boxed opportunity.**

---

## 2. Report 2 — Competitive landscape

### Tiers
| Tier | Players | Model | Pricing signal |
|---|---|---|---|
| **Enterprise compliance/CTC** | Sovos, Pagero (Thomson Reuters ONESOURCE), Basware, Comarch, EDICOM, OpenText, SAP, Avalara, Vertex/ecosio, Tungsten, Coupa | Global multi-country tax/AP suites, sales-led | Quote-only; high ACV [CLAIM] |
| **API / Peppol infra** | **Storecove**, **B2Brouter**, Invopop, Unifiedpost, Qvalia | Developer-first API + certified Access Point | B2Brouter transparent per-doc; Storecove API per-volume [VERIFIED via comparisons] |
| **SME / accounting suites** | Billit, Banqup, Lexware Office, sevdesk, Pennylane, Odoo, Exact Online, Holded, TeamSystem, Fatture in Cloud, Zoho, Xero, QuickBooks | Full bookkeeping/invoicing for SMEs | Billit per-month by document volume **from ~€6.90** [VERIFIED via FAUN.dev]; Tipalti AP from ~€99/mo [CLAIM] |

### Notable specifics [VERIFIED/CLAIM]
- **Storecove** — Dutch, API-first, **certified Peppol Access Point**, 30+ countries, covers French e-reporting; strong for ERP/platform embedding; not an end-user app.
- **B2Brouter** — network across **~30 countries, ~12 ERP integrations**, strong **pricing transparency**; SME + public-sector friendly.
- **Billit** — Belgian, strong Peppol SME play, per-document volume pricing; well-rated.
- **Enterprise (Sovos/Pagero/Basware/Comarch)** — deepest country coverage + CTC, but heavy, expensive, slow onboarding; aimed at large tax/AP teams.

### Gaps & opportunities (Top opportunities for NormInvoice) [INFERENCE]
1. **SME + accountant-native UX** with *explainable* compliance (show the exact failing BT field + fix) — incumbents surface raw schema errors.
2. **German depth** (XRechnung/ZUGFeRD + GoBD audit chain + DATEV EXTF export) as a wedge the API players don't own end-to-end.
3. **Free real-backend validator** as SEO/acquisition (you already have it) — most rivals gate everything behind sales.
4. **Honest multi-dimensional status** (document/validation/transmission/authority/payment) vs. conflated "sent = paid".
5. **Transparent, self-serve pricing** (enterprise tier is quote-only everywhere → friction for SMEs).
6. **Accountant multi-client workspace** with consent/expiry — fragmented in SME suites.

### Risks / threats [INFERENCE]
- Incumbents moving down-market; accounting suites (DATEV, Lexware, sevdesk) bundling e-invoicing for free; Peppol commoditizing transport; mandate-date slippage; **certified Access Point / PDP dependency** (you must partner, not self-certify quickly); legal-misinterpretation liability.

---

## 3. Report 3 — Customer problems & unmet demand (ranked)

**AP/finance pain is large and quantified [ESTIMATE]:**
- Manual invoice processing ≈ **$9.84/invoice** avg (Ardent Partners); manual range **$8–$20+**; automated **$1.50–$2.65**.
- Avg processing **8.2 days**; manual 8–15+ days; best-in-class 2.9 days. Exception rate **18.4%**; manual error rate up to **39%**.
- **77–82%** still manually key invoices; only **32.6%** processed without human intervention; **7%** fully automated.
- Duplicate payments **0.1–1%** of volume (top performers ~0.8% of disbursements, bottom ~2%). **76%** of organizations reported attempted/actual payments fraud in 2025.
- Top AP bottlenecks: resolving errors (39%), chasing approvals (32%), PO mismatch (29%); AP staff spend **21.9%** of time on supplier inquiries.

### Ranked opportunity scoring (Impact × Urgency × Feasibility, 1–5) [INFERENCE]
| # | Problem | Segment | NormInvoice solution | Score | Priority |
|---|---|---|---|---|---|
| 1 | "I must issue compliant e-invoices by my mandate date and can't" | DE/BE/PL/FR SMEs | Guided compliant issuing + validator + formats | 5·5·5 | **P0** |
| 2 | Cryptic rejections / missing mandatory fields | all | Explainable BR-* diagnostics + fix + re-run | 5·5·5 | **P0** |
| 3 | Receiving/AP: manual keying, duplicates, slow approvals | SME + enterprise | Structured inbox, dedup, PO-match, approvals | 5·4·4 | **P0/P1** |
| 4 | Accountant handoff / multi-client chaos | accountants | Delegated workspace + DATEV/FEC export | 4·5·4 | **P1** |
| 5 | Delivery uncertainty (did it arrive/clear?) | all | Durable outbox + verified status/receipts | 5·4·4 | **P0/P1** (outbox ✅ done) |
| 6 | Payment reconciliation vs. delivery confusion | SME | Separate payment ledger + bank match | 4·4·3 | **P1** |
| 7 | Duplicate payments / invoice fraud | mid+ | Duplicate detection + anomaly flags (human-approved) | 4·3·3 | **P2** |
| 8 | Regulatory change tracking | compliance | Versioned rule bundles + watchlist | 4·3·3 | **P2** |

(Full 50–100 pain-point catalogue is a Phase-0 expansion if needed; the above are the validated, build-driving ones.)

---

## 4. Report 4 — International compliance matrix (concise, dated)

Reference date 22 Nov 2026. Status = our product posture, not certification. [VERIFIED unless flagged]

| Country | Legal anchor / timing | Format | Network/route | Status flags |
|---|---|---|---|---|
| **Germany** | §14 UStG / Growth Opp. Act. Receiving since 1 Jan 2025; issuing **>€800k 1 Jan 2027, all 1 Jan 2028** | EN 16931, XRechnung 3.0.2, ZUGFeRD 2.3 (CII/UBL) | Email/Peppol/OZG-RE (B2G) | **P0 LIVE_CORE** |
| **Belgium** | VAT Code amend. 6 Feb 2024; **domestic B2B mandatory since 1 Jan 2026** | EN 16931 / Peppol BIS 3.0 | **Certified Peppol AP (partner)** | **P0/P1** (needs AP) |
| **France** | Reform; **receiving 1 Sep 2026**; issuance large/medium then, **SMEs 1 Sep 2027** | Factur-X / UBL / CII | **Plateforme Agréée (PA/PDP) partner** | **P2** (needs PDP) |
| **Poland** | KSeF 2.0; **large 1 Feb 2026, others 1 Apr 2026**, smallest Jan 2027 | FA(3) / KSeF XML | KSeF 2.0 API | **P2** (needs KSeF) |
| **Italy** | SdI clearance (long-standing) | FatturaPA XML | SdI via provider | PLANNED |
| **Spain** | Ley 18/2022; RD 238/2026; Order HAC/1028/2026 (eff. 6 Oct 2026); phased 2027/28. VERI*FACTU distinct | UBL/EN 16931 | Public solution + private platforms | PLANNED |
| **Romania** | OG 120/2021, L 296/2023; RO e-Factura | UBL 2.1 / RO_CIUS | ANAF platform | PLANNED (EC sheet unverified) |
| **Croatia** | Fiscalization Act NN 89/2025; broader issuing 1 Jan 2027 | EN 16931 eRačun | Authorized AP + fiscalization | PLANNED |
| **Greece** | AADE A.1128/2025; >€1m 2 Mar 2026, rest 2 Nov 2026 | myDATA-compatible | Licensed provider / timologio | PLANNED |
| **Netherlands** | B2G now; **domestic B2B planned 2030** | Peppol BIS / NLCIUS | Peppol / Digipoort | PLANNED (B2G via Peppol) |
| **Austria** | Federal B2G (ICT Act / BVergG) | ebInterface 4.3/5/6, UBL/CII | e-Rechnung.gv.at / USP / Peppol | PLANNED (B2G via Peppol) |
| **Portugal** | B2G; AT/SAF-T(PT)/ATCUD separate | CIUS-PT, UBL/CII | Public admin routes | PLANNED (EC sheet unverified) |
| **UK** | HMRC roadmap; **VAT e-invoicing announced ~Apr 2029** | Future (Peppol direction) | Planned UK Peppol | PLANNED (law-watch) |

**Design consequence [INFERENCE]:** compliance must be **configurable, versioned country packs + a certified-partner transport layer** — never hardcoded. Belgium/NL/AT unlock together via one **Peppol Access Point partner**; France and Poland each need a dedicated partner/API.

---

## 5. Report 5+6 — Feature ecosystem & backlog (P0–P3)

Legend: ✅ built · 🟡 partial/scaffold · 🔴 not built. (State from codebase audit.)

### P0 — required for a reliable commercial launch (Germany)
- **Invoice Studio** ✅ (draft→finalize, gapless numbering, credit notes, multi-currency fixed, SEPA QR)
- **Validator / Compliance Center** ✅ (EN 16931 + BR-DE-*, explainable errors, evidence report)
- **Document generation** ✅ (CII/UBL, hybrid PDF/A-3b)
- **Durable delivery (outbox)** ✅ **just shipped** (idempotent, retry, dead-letter, no duplicate submission)
- **Incoming AP inbox** 🟡 → complete: safe XML parse, dedup, readable-vs-parsed, approve/reject/export
- **Master data** (customers/suppliers/products, VIES, Leitweg-ID) ✅
- **Accountant export** (DATEV EXTF SKR03/04, FEC, GoBD Verfahrensdokumentation) ✅
- **Reports/Audit/Archive** 🟡 (GoBD hash-chain ✅; S3 WORM when configured)
- **Auth/tenancy/RBAC/API keys/GDPR export+erasure** ✅
- **Outbox status visibility** 🔴 → **next increment** (API `listTransmissionJobsForOrg` exists; needs route + UI)

### P1 — high-value next release
- **Peppol delivery via certified AP partner** 🔴 (unlocks BE/NL/AT) — `peppol/lookup` ✅ already live
- **Accountant multi-client workspace** 🟡 (delegations scaffolded) → consent/scope/expiry, review queue
- **Payments & receivables** 🟡 → ageing, reminders, bank CSV match, separate ledger
- **Automation studio** 🟡 → trigger/condition/action + dry-run + approval gates
- **Developer platform** 🟡 (SDK ✅) → sandbox, signed webhooks + replay, event logs
- **Team collaboration** 🟡 (comments/approve scaffolded) → separation-of-duties
- **Separate super-admin realm (ADR-002)** 🔴 → distinct auth/service, reason codes, four-eyes

### P2 — strategic expansion
- **France PDP** + **Poland KSeF** connectors 🔴
- **AI Copilot (conversational, grounded)** 🟡 (rules-based today) — layer LLM *over* deterministic engine, never as authority
- **Duplicate/fraud detection**, **regulatory change intelligence**, **integration marketplace** (Woo ✅ plugin, Stripe ✅)

### P3 — future / experimental
- IT/ES/RO/HR/GR/PT/UK packs behind legal gates · enterprise SSO/SCIM · advanced analytics/forecasting · white-label/reseller · MCP connector for external AI assistants.

---

## 6. Report 7/9 — Architecture & security direction (for AWS)

- **Modular monolith first** (ADR-007); canonical invoice model + versioned country adapters (ADR-001); durable **outbox + idempotency** (ADR-004, ✅ realized in-process now); **separate staff admin realm** (ADR-002); AI never a compliance authority (ADR-006).
- **AWS eu-central-1 (Frankfurt)**: ECS Fargate web; **migrate SQLite → RDS PostgreSQL 16 + RLS** for multi-instance; **SQS + worker** draining the same outbox (the in-process drainer maps 1:1); **S3 + Object Lock (WORM)** + KMS for GoBD retention; Secrets Manager; CloudFront+WAF; Terraform; separate dev/sandbox/staging/prod + admin plane.
- **Security non-negotiables:** no hardcoded compliance/financial data, deterministic decimal money, idempotent + safe retries, auditable state transitions, versioned rules, strong tenant isolation (RLS defense-in-depth), XXE-safe XML, signed webhooks, SSRF allowlist, append-only tamper-evident audit, GDPR + EU residency, OWASP ASVS baseline.

---

## 7. Report 10/11 — Build roadmap & commercial (condensed)

**Build sequence (verified increments, this is what we execute):**
1. **Outbox status surface** — GET route + invoice-detail UI (queued/retrying/sent/dead). *(next)*
2. **Complete AP inbox** — parse/dedup/preview/approve/export.
3. **Accountant workspace** — consent/scope/expiry + review queue.
4. **Payments** — ageing/reminders/bank-match, separate ledger.
5. **Peppol AP partner** — live BE/NL/AT delivery.
6. **Automation studio** + **developer sandbox/webhooks**.
7. **Separate super-admin realm**.
8. **AWS migration** (RDS Postgres + SQS worker + S3 WORM).
9. **France PDP / Poland KSeF**; then long-tail packs.

**Pricing (hypothesis, competitor-anchored) [INFERENCE/ESTIMATE]:** Free validator/viewer · Starter €9–19 · Business €29–49 · Professional €79–149 · Enterprise contract. Metered: network sends, OCR, archive bytes, email. (Billit-from-€6.90 and B2Brouter per-doc transparency set the SME anchor; enterprise stays quote.)
**GTM:** free German validator (SEO on BR-* error pages ✅) → DATEV/tax-adviser co-marketing → Peppol diagnostics → Woo/Stripe plugins.

---

## 8. Report 17 — Final strategic answers (condensed) [INFERENCE unless noted]

1. **Another platform justified?** Yes — SME/accountant segment is underserved and mandate-forced; incumbents are enterprise-heavy.
2. **Largest unmet needs:** compliant issuing before deadlines; explainable errors; low-friction AP receiving; transparent self-serve pricing.
3. **Best entry country:** **Germany** [VERIFIED mandate + DATEV ecosystem + existing code depth].
4. **First segment:** German SMEs + their *Steuerberater* (accountant-led distribution).
5. **Strongest differentiation:** explainable compliance + German depth (GoBD/DATEV) + free real validator + honest status.
6. **Match:** Peppol transport, core EN 16931, accounting exports.
7. **Improve significantly:** error explainability, onboarding time-to-first-invoice, accountant collaboration, delivery transparency.
8. **Innovative but unproven:** grounded AI copilot, anomaly/fraud flags — build after deterministic core.
9. **Highest complexity:** certified transport (Peppol/PDP/KSeF), multi-country legal, enterprise scale.
10. **Need certified partners:** Belgium/NL/AT (Peppol AP), France (PDP), Poland (KSeF), Italy (SdI).
11. **Build in-house:** canonical model, validator, country packs, outbox, UX, accountant workspace.
12. **Buy/partner:** Peppol AP, PDP, email/OCR/payment rails, KMS/infra.
13. **Why switch from Billit/B2Brouter/Lexware:** explainability + accountant workflow + honest status + German depth at transparent price.
14. **Enterprise trust:** separate admin realm, audit integrity, EU residency, SLAs, pentest/SOC-readiness.
15. **Before charging:** reliable German issue+receive+validate+deliver (durable) + accountant export — most ✅ today.
16. **Don't build first:** full ERP GL, payroll, bank custody, all-country packs, binding AI tax decisions.
17. **Long-term architecture risks:** single-node SQLite ceiling (→ RDS), partner dependency, rule-staleness.
18. **First 6 months:** harden Germany end-to-end + AP inbox + accountant workspace + Peppol partner + AWS migration.
19. **After 2 years:** multi-country (DE/BE/NL/AT/FR/PL live), accountant channel, enterprise tier, grounded AI — a credible SME-first European e-invoicing OS.
20. **How to win:** own the German SME+accountant wedge with explainable compliance, expand on Peppol rails, keep compliance honest and configurable.

---

### Immediate next build increment
**Outbox status surface** — a tenant-scoped `GET /api/v1/invoices/[id]/transmissions` (backed by the existing `listTransmissionJobsForOrg`) + a small status panel on the invoice detail page showing queued / retrying (with next attempt) / sent / dead-lettered. Low risk, completes the delivery feature's observability, and directly serves pain #5.
