/**
 * NormInvoice — Product of Trend&Brand
 * Canonical Website Content & Legal Policy Definitions (Pages 01–37)
 *
 * Truthfulness & Compliance Guardrails:
 * - Contracting entity: Trend&Brand LLC (Wyoming, USA — pending formal launch confirmation).
 * - Related group entity: TREND & BRAND (PRIVATE) LIMITED (Pakistan; Inc. 0330212; NTN I730873-1).
 * - Contact: official@trendandbrands.com · +92 325 5039135.
 * - Zero unverified certifications (ISO 27001, SOC 2), zero fabricated SLAs, zero fake testimonials.
 */

import type { AppLocale } from "./i18n";

export interface LegalSection {
  id: string;
  heading: string;
  paragraphs?: string[];
  bullets?: Array<{ label?: string; text: string }>;
}

export interface LegalDocument {
  slug: string;
  title: string;
  badge: string;
  subtitle: string;
  effectiveNote: string;
  reviewNotice?: string;
  sections: LegalSection[];
}

export const BRAND_CONTACT = {
  productName: "NormInvoice",
  attribution: "Product of Trend&Brand",
  email: "official@trendandbrands.com",
  phone: "+92 325 5039135",
  proposedContractingEntity: "Trend&Brand LLC (Wyoming, United States — pending formal launch confirmation)",
  relatedEntity: {
    name: "TREND & BRAND (PRIVATE) LIMITED",
    jurisdiction: "Pakistan (Private Limited Company)",
    incorporationNo: "0330212",
    ntn: "I730873-1",
    registrationDate: "13 March 2026",
    ceo: "Mohram Ali",
    address: "Village Ali Akbar Mahar, Post Office Dad Laghari, Sutyaro, Chak No. 1, Pakistan",
  },
} as const;

export const COUNTRY_SLUG_MAP: Record<
  string,
  {
    code: string;
    slug: string;
    name: string;
    headline: string;
    summary: string;
    workflow: string[];
    limitation: string;
  }
> = {
  germany: {
    code: "DE",
    slug: "germany",
    name: "Germany",
    headline: "E-invoicing workflows for Germany (XRechnung & ZUGFeRD)",
    summary:
      "NormInvoice supports structured EN 16931 invoicing workflows relevant to German B2B and B2G businesses, including XRechnung 3.0.2 (CII & UBL) and ZUGFeRD 2.3 hybrid PDF/A-3b generation, deterministic validation, and GoBD-aligned archive exports.",
    workflow: [
      "Configure your German company profile, VAT ID (USt-IdNr.) or Steuernummer, and § 19 UStG Kleinunternehmer status where applicable.",
      "Capture mandatory buyer references including Leitweg-ID (BT-10) for German public-sector B2G recipients.",
      "Run deterministic EN 16931 & BR-DE-* validation checks before delivery and review plain-language diagnostics.",
      "Generate hybrid ZUGFeRD 2.3 PDF/A-3b or XRechnung 3.0.2 XML, archive with SHA-256 hash-chaining, and export DATEV EXTF files.",
    ],
    limitation:
      "A passed technical validation does not constitute legal tax advice or guarantee acceptance by every individual recipient or public portal. Confirm your specific B2B/B2G obligations with a qualified Steuerberater.",
  },
  belgium: {
    code: "BE",
    slug: "belgium",
    name: "Belgium",
    headline: "Peppol-oriented B2B invoicing workflows for Belgium",
    summary:
      "For in-scope domestic Belgian B2B transactions, structured electronic invoicing via Peppol BIS Billing 3.0 (UBL 2.1) applies from January 2026. NormInvoice prepares validated Peppol BIS 3.0 UBL documents and connects to authorized Peppol Access Point partners where configured.",
    workflow: [
      "Configure Belgian enterprise identifiers (CBE / VAT / Peppol participant scheme) in your organization profile.",
      "Build or import invoices in Peppol BIS Billing 3.0 UBL 2.1 with automated EN 16931 structural checks.",
      "Transmit through an authorized, independent Peppol Access Point integration when enabled for your workspace.",
      "Track preparation, validation, and external partner acknowledgement statuses separately.",
    ],
    limitation:
      "Peppol Access Point transport, participant registration, and network duties are supplied by independent accredited Access Point providers. NormInvoice does not claim to be an accredited Access Point solely by providing software.",
  },
  france: {
    code: "FR",
    slug: "france",
    name: "France",
    headline: "France Factur-X, e-invoicing & e-reporting workflows",
    summary:
      "France's e-invoicing reform pairs structured Factur-X 1.07 (EN 16931) documents with approved-platform (PDP / Plateforme Agréée) routing and e-reporting obligations. NormInvoice generates validated Factur-X 1.07 PDF/A-3b files, supports SIREN/SIRET fields, and exports DGFiP FEC bookkeeping files.",
    workflow: [
      "Maintain seller and buyer SIREN/SIRET identifiers, French VAT IDs, and 10-year archival settings.",
      "Generate and validate Factur-X 1.07 (EN 16931) hybrid PDF/A-3b invoices with French BR-FR-* checks.",
      "Route through a configured approved French platform partner where enabled and record actual lifecycle responses.",
      "Export structured French FEC accounting ledgers for your Expert-comptable.",
    ],
    limitation:
      "NormInvoice is commercial software and does not claim to be a French government-approved platform (PDP / Plateforme Agréée) unless independently authorized and expressly verified. Partner-delivered transmission scopes are disclosed before activation.",
  },
  poland: {
    code: "PL",
    slug: "poland",
    name: "Poland",
    headline: "KSeF-aligned structured invoicing workflows for Poland",
    summary:
      "Poland's national KSeF (Krajowy System e-Faktur) clearance model requires FA(3) structured XML submission and official UPO government acknowledgements. NormInvoice maps canonical invoice data toward Polish KSeF workflows and partner-operated clearance adapters.",
    workflow: [
      "Maintain Polish NIP identifiers and structured line-item tax categories in your workspace.",
      "Prepare and validate invoice data against structured rule checks before routing.",
      "Submit via an authorized KSeF connectivity adapter where configured and track official KSeF IDs and UPO acknowledgements.",
      "Archive structured records and keep software 'sent' states distinct from official KSeF clearance acceptance.",
    ],
    limitation:
      "An internal 'sent' status in NormInvoice is not equivalent to official KSeF acceptance. Always rely on the official KSeF number and UPO acknowledgement returned by the connected gateway.",
  },
  italy: {
    code: "IT",
    slug: "italy",
    name: "Italy",
    headline: "Italy FatturaPA & SdI partner-connected workflows",
    summary:
      "Italy operates a mature domestic clearance mandate through Sistema di Interscambio (SdI) using FatturaPA XML. NormInvoice models Italian counterparty fields (Codice Destinatario / PEC) and supports partner-operated SdI clearance integration.",
    workflow: [
      "Capture Italian Partita IVA, Codice Fiscale, and recipient Codice Destinatario or PEC details.",
      "Prepare structured invoice records and validate core tax and math rules.",
      "Route FatturaPA payloads through an authorized SdI connectivity partner where enabled and track official SdI notifications.",
    ],
    limitation:
      "Direct SdI clearance and statutory conservazione sostitutiva require authorized partner connectivity and Italian statutory preservation arrangements.",
  },
  spain: {
    code: "ES",
    slug: "spain",
    name: "Spain",
    headline: "Spain B2B e-invoicing & payment-status preparation",
    summary:
      "Spain is rolling out phased B2B electronic invoicing and payment-status reporting obligations (2027–2028) alongside Veri*Factu and regional regimes. NormInvoice structures payment statuses and EN 16931 data to prepare for Spanish exchange modules.",
    workflow: [
      "Store Spanish NIF/CIF identifiers and invoice payment milestones cleanly.",
      "Validate core EN 16931 totals, VAT categories, and credit note references.",
      "Monitor phased 2027–2028 Spanish B2B exchange module releases as technical regulations finalize.",
    ],
    limitation:
      "Spanish B2B clearance and Veri*Factu modules are currently planned/phased; verify live workspace availability before relying on them for statutory reporting.",
  },
  romania: {
    code: "RO",
    slug: "romania",
    name: "Romania",
    headline: "Romania RO e-Factura (RO_CIUS) preparation",
    summary:
      "Romania mandates RO e-Factura submission through the national ANAF platform using UBL 2.1 RO_CIUS. NormInvoice supports UBL 2.1 generation and tracks RO_CIUS partner connectivity on its country roadmap.",
    workflow: [
      "Maintain Romanian CUI/CIF tax identifiers and structured UBL 2.1 invoice data.",
      "Validate EN 16931 syntax and tax totals prior to transmission.",
      "Connect through authorized RO e-Factura gateway adapters as enabled.",
    ],
    limitation:
      "ANAF RO e-Factura direct submission is partner-operated / phased; confirm live status in your workspace before statutory reliance.",
  },
  croatia: {
    code: "HR",
    slug: "croatia",
    name: "Croatia",
    headline: "Croatia B2G & B2B Fiscalization 2.0 readiness",
    summary:
      "Croatia combines EN 16931 UBL e-invoicing with Fiscalization 2.0 B2B digital reporting phases. NormInvoice models Croatian OIB identifiers and structured UBL 2.1 documents.",
    workflow: [
      "Maintain Croatian OIB business identifiers and EN 16931 UBL 2.1 document structure.",
      "Track national clearance and e-reporting connector availability in the Compliance Matrix.",
    ],
    limitation:
      "Croatian Fiscalization 2.0 clearance connectivity is planned/partner-operated and not yet live as a direct government gateway.",
  },
  greece: {
    code: "GR",
    slug: "greece",
    name: "Greece",
    headline: "Greece myDATA & Peppol B2G workflows",
    summary:
      "Greece pairs IAPR myDATA digital bookkeeping reporting with Peppol B2G e-invoicing. NormInvoice prepares EN 16931 UBL structures and tracks certified myDATA provider integrations.",
    workflow: [
      "Store Greek AFM tax numbers and EN 16931 invoice line classifications.",
      "Use validated UBL exports and evaluate authorized myDATA YPAHES partner adapters as enabled.",
    ],
    limitation:
      "Direct Greek myDATA transmission requires an authorized provider integration and is currently in planned/partner scope.",
  },
  netherlands: {
    code: "NL",
    slug: "netherlands",
    name: "Netherlands",
    headline: "Netherlands NLCIUS / SI-UBL 2.0 & Peppol workflows",
    summary:
      "Dutch public-sector and growing B2B exchange relies on Peppol BIS 3.0 / NLCIUS (SI-UBL 2.0) and KvK / OIN identifiers. NormInvoice generates validated Peppol BIS 3.0 UBL documents ready for authorized Peppol routing.",
    workflow: [
      "Configure Dutch BTW-nummer, KvK, or OIN endpoint identifiers for recipients.",
      "Generate and validate Peppol BIS Billing 3.0 UBL 2.1 documents.",
      "Route through an authorized Peppol Access Point integration where enabled.",
    ],
    limitation:
      "Peppol network delivery requires a configured, accredited Access Point partner.",
  },
  austria: {
    code: "AT",
    slug: "austria",
    name: "Austria",
    headline: "Austria ebInterface & Peppol B2G workflows",
    summary:
      "Austria mandates structured e-invoicing for federal B2G suppliers (e-Rechnung an den Bund via USP / Peppol) and supports EN 16931 UBL / ebInterface. NormInvoice produces EN 16931 UBL & ZUGFeRD invoices with Austrian UID validation.",
    workflow: [
      "Configure Austrian UID-Nummer (ATU...) and buyer reference codes for public entities.",
      "Generate validated EN 16931 UBL 2.1 / Peppol BIS 3.0 or hybrid PDF/A-3b invoices.",
      "Deliver through configured Peppol or email channels and archive with audit hash-chaining.",
    ],
    limitation:
      "Direct USP federal portal submission requires an authorized Peppol Access Point or USP registration.",
  },
  portugal: {
    code: "PT",
    slug: "portugal",
    name: "Portugal",
    headline: "Portugal CIUS-PT, ATCUD & QES preparation",
    summary:
      "Portugal requires CIUS-PT (EN 16931) for B2G and enforces certified billing rules (ATCUD, QR, SAF-T PT, qualified electronic signatures) for domestic issuance. NormInvoice tracks Portugal as a specialized localized roadmap module.",
    workflow: [
      "Review Portuguese NIF and CIUS-PT field requirements inside the 13-country Compliance Explorer.",
      "Confirm local Tax Authority (AT) software certification requirements before using any system for domestic Portuguese issuance.",
    ],
    limitation:
      "NormInvoice does not currently hold Portuguese Tax Authority (AT) certified invoicing software status. Do not rely on NormInvoice alone for statutory domestic Portuguese ATCUD/SAF-T issuance.",
  },
  "united-kingdom": {
    code: "GB",
    slug: "united-kingdom",
    name: "United Kingdom",
    headline: "United Kingdom Peppol & cross-border e-invoicing workflows",
    summary:
      "The UK supports voluntary Peppol BIS 3.0 B2B/NHS exchange and ongoing HMRC e-invoicing consultations, alongside cross-border EU trade documentation. NormInvoice supports GBP/EUR EN 16931 UBL 2.1 and hybrid PDF invoicing.",
    workflow: [
      "Issue structured EN 16931 UBL / Peppol BIS 3.0 or hybrid PDF invoices in GBP or EUR for UK and EU trading partners.",
      "Validate tax totals, export categories, and buyer details before sending.",
      "Track UK HMRC e-invoicing policy updates in the NormInvoice Compliance Explorer.",
    ],
    limitation:
      "UK Making Tax Digital (MTD) direct VAT filing is outside NormInvoice's current scope; export your records for your UK accounting software or accountant.",
  },
};

export const LEGAL_DOCUMENTS: Record<string, LegalDocument> = {
  "legal-notice": {
    slug: "legal-notice",
    title: "Legal Notice / Impressum",
    badge: "Provider Identification & Corporate Structure",
    subtitle: "Company identity, proposed contracting structure, related group entity, and dispute contact for NormInvoice.",
    effectiveNote: "Draft Version 1.0 · Prepared 22 November 2026",
    reviewNotice:
      "Legal-review notice: Final registered service address, LLC authorized representative, and any required EU/UK representative details must be verified and confirmed before full commercial launch in Germany (DDG § 5) and the EU.",
    sections: [
      {
        id: "provider",
        heading: "1. Service Provider & Commercial Identity",
        bullets: [
          { label: "Product", text: "NormInvoice — subscription-based electronic invoicing and financial workflow software." },
          { label: "Brand Attribution", text: "NormInvoice — Product of Trend&Brand." },
          {
            label: "Proposed Contracting Entity",
            text: "Trend&Brand LLC, a limited liability company organized in Wyoming, United States (subject to final launch confirmation and executed order form).",
          },
          { label: "Wyoming LLC Business / Service Address", text: "Pending final pre-launch publication verification (available upon written contractual request via official@trendandbrands.com)." },
          { label: "Official Contact Email", text: "official@trendandbrands.com" },
          { label: "Business Phone", text: "+92 325 5039135" },
        ],
      },
      {
        id: "group-entity",
        heading: "2. Related Business Group Entity",
        paragraphs: [
          "NormInvoice operates as a product brand within the Trend&Brand business group. The following related entity is disclosed for corporate transparency and is not automatically the subscription merchant of record unless explicitly designated in an order form:",
        ],
        bullets: [
          { label: "Entity Name", text: "TREND & BRAND (PRIVATE) LIMITED (Pakistan Private Limited Company)" },
          { label: "Incorporation Reference", text: "0330212" },
          { label: "Registration / NTN Reference", text: "I730873-1" },
          { label: "Registration Date", text: "13 March 2026" },
          { label: "Chief Executive Officer", text: "Mohram Ali" },
          { label: "Registered Address", text: "Village Ali Akbar Mahar, Post Office Dad Laghari, Sutyaro, Chak No. 1, Pakistan" },
        ],
      },
      {
        id: "scope",
        heading: "3. Scope of Software Business",
        paragraphs: [
          "NormInvoice provides commercial software-as-a-service (SaaS) tools for creating, validating, managing, and exporting electronic invoices. NormInvoice does not act as a bank, payment institution, public tax authority, or government-accredited e-invoicing network operator unless a specific authorization is expressly verified and disclosed on the relevant service page.",
        ],
      },
      {
        id: "germany-ddg",
        heading: "4. Notice for Users in Germany (§ 5 DDG & § 36 VSBG)",
        paragraphs: [
          "This Legal Notice is structured for review against provider-identification requirements including Section 5 of the German Digitale-Dienste-Gesetz (DDG). NormInvoice is primarily designed for business users (§ 14 BGB). For service or billing concerns, contact official@trendandbrands.com. The European Commission's former ODR platform closed permanently on 20 July 2025.",
        ],
      },
    ],
  },

  terms: {
    slug: "terms",
    title: "Terms of Service",
    badge: "Customer Subscription Agreement",
    subtitle: "Governs access to and use of the NormInvoice software platform, validation engine, and workspace subscriptions.",
    effectiveNote: "Draft Version 1.0 · Prepared 22 November 2026",
    reviewNotice: "These Terms represent our current structured SaaS baseline and are subject to final jurisdictional counsel sign-off prior to general commercial rollout.",
    sections: [
      {
        id: "parties",
        heading: "1. Agreement and Parties",
        paragraphs: [
          "These Terms govern access to NormInvoice, a subscription-based electronic invoicing software service associated with Trend&Brand. 'Provider', 'we', and 'us' refer to the legal entity identified in your checkout summary, order form, and Legal Notice (proposed contracting entity: Trend&Brand LLC, Wyoming, USA, subject to formal launch confirmation). 'Customer' or 'you' refers to the individual or organization creating a workspace or purchasing a subscription.",
        ],
      },
      {
        id: "business-use",
        heading: "2. Business Use and Mandatory Rights",
        paragraphs: [
          "NormInvoice is primarily built for business and professional workflows (B2B). Where non-waivable statutory consumer rights apply under mandatory law in your jurisdiction, nothing in these Terms excludes or restricts those statutory rights.",
        ],
      },
      {
        id: "service-scope",
        heading: "3. Service Description & Feature Availability",
        paragraphs: [
          "NormInvoice provides only the modules, document formats, country profiles, storage quotas, and integrations explicitly enabled for your subscription tier and marked 'Available' in the live application. Features marked Beta, Partner-Operated, or Planned must not be relied upon as production-ready statutory clearance channels without explicit verification.",
        ],
      },
      {
        id: "account",
        heading: "4. Account & Workspace Responsibilities",
        paragraphs: [
          "You are responsible for maintaining accurate legal company data, VAT identifiers, and banking information, protecting login credentials and API keys, assigning appropriate workspace roles, and promptly notifying official@trendandbrands.com of any suspected unauthorized access.",
        ],
      },
      {
        id: "billing",
        heading: "5. Subscriptions, Free Plan, 15-Day Trial & Fees",
        paragraphs: [
          "NormInvoice offers an ongoing limited Free plan ($0), an optional 15-day Free Trial with no credit card required, and paid monthly subscriptions starting with the Solo plan ($39/month), alongside Business, Agency, and Enterprise tiers. Free trials do not silently convert into paid charges when no payment authorization is on file. Applicable taxes, billing cadence, quotas, and renewal terms are disclosed clearly prior to paid checkout.",
        ],
      },
      {
        id: "customer-data",
        heading: "6. Customer Data & No Tax/Legal Advice",
        paragraphs: [
          "You retain ownership of all invoice files, customer directories, and financial records you upload or generate. NormInvoice is technical software and does not provide tax, accounting, or legal advice. Validation checks evaluate supported rule sets (such as EN 16931 and BR-DE-*) and do not guarantee acceptance by a recipient, tax authority, or external government gateway.",
        ],
      },
      {
        id: "termination",
        heading: "7. Cancellation, Export & Contact",
        paragraphs: [
          "You may cancel renewal at any time from Workspace Settings > Billing or by contacting official@trendandbrands.com from the workspace owner email. Please export your XML, PDF/A-3, DATEV/FEC, and audit records before access terminates. For full details see our Cancellation & Refund Policy and Data Retention Policy.",
        ],
      },
    ],
  },

  "subscription-billing": {
    slug: "subscription-billing",
    title: "Subscription & Billing Policy",
    badge: "Transparent SaaS Pricing & Renewals",
    subtitle: "Clear rules on Free plan limits, 15-day Free Trials, $39/month Solo subscriptions, taxes, and renewals.",
    effectiveNote: "Draft Version 1.0 · Prepared 22 November 2026",
    sections: [
      {
        id: "plans",
        heading: "1. Plans, Quotas & Pricing Transparency",
        bullets: [
          { label: "Free Plan ($0/month)", text: "Ongoing free access including the zero-retention validator and up to 5 finalized e-invoices per month." },
          { label: "15-Day Free Trial ($0)", text: "Real time-bounded 15-day evaluation tracked in the database from signup, including up to 15 finalized e-invoices and core workflow access with no credit card required." },
          { label: "Solo Plan ($39/month)", text: "Designed for solo founders and small businesses: up to 150 finalized e-invoices/month, recurring schedules, automations, incoming inbox, reports, and exports." },
          { label: "Business ($49/month) & Agency ($129/month)", text: "Higher monthly quotas (500 / 2,500 invoices), Stripe & WooCommerce bridges, multi-member RBAC, and API keys." },
          { label: "Enterprise (Custom)", text: "Tailored volume, dedicated onboarding, and custom commercial schedules arranged via official@trendandbrands.com." },
        ],
      },
      {
        id: "trial",
        heading: "2. How the 15-Day Free Trial Works",
        paragraphs: [
          "Your 15-day trial start and expiration timestamps are stored securely on the server and displayed accurately in your workspace header and Billing settings. When a 15-day trial expires without an authorized paid plan upgrade, your workspace transitions gracefully to the Free plan rather than silently billing you.",
        ],
      },
      {
        id: "checkout-disclosures",
        heading: "3. Pre-Payment Disclosures & Taxes",
        paragraphs: [
          "Before any paid subscription charge is finalized, checkout clearly presents the contracting entity or authorized payment processor / Merchant of Record, billing currency, monthly or annual interval, included document quota, renewal terms, applicable VAT or reverse-charge treatment, and cancellation procedure. We never charge undisclosed overages.",
        ],
      },
      {
        id: "billing-help",
        heading: "4. Receipts & Billing Support",
        paragraphs: [
          "Billing receipts and subscription invoices are provided through the active payment provider and Billing settings. For billing inquiries or disputed charges, email official@trendandbrands.com with the account email, date, and amount — never send full card numbers by email.",
        ],
      },
    ],
  },

  "cancellation-refunds": {
    slug: "cancellation-refunds",
    title: "Cancellation & Refund Policy",
    badge: "Self-Service Cancellation & Fair Refunds",
    subtitle: "How to stop renewal at any time, what happens to your data, and how refund requests and statutory consumer rights are handled.",
    effectiveNote: "Draft Version 1.0 · Prepared 22 November 2026",
    sections: [
      {
        id: "how-to-cancel",
        heading: "1. How to Cancel Your Subscription",
        paragraphs: [
          "Workspace owners and admins can cancel subscription renewal directly inside the application at Settings > Billing & Quota > Cancel Renewal. If you cannot access your workspace, email official@trendandbrands.com from the registered owner email. Cancellation confirmation and the effective end date are recorded in your workspace audit trail.",
        ],
      },
      {
        id: "renewal-effect",
        heading: "2. Effect of Cancellation",
        paragraphs: [
          "Cancelling renewal prevents future recurring charges. Unless mandatory local law provides otherwise, your paid workspace features remain active through the end of the already paid billing period, after which your account transitions to the Free tier.",
        ],
      },
      {
        id: "refunds",
        heading: "3. Refund Requests & Statutory Rights",
        paragraphs: [
          "NormInvoice does not operate a blanket 'no refunds under any circumstances' rule. Refund requests are reviewed fairly in cases of duplicate billing, billing errors, unauthorized charges, or material service unavailability. Where mandatory statutory withdrawal or cooling-off rights apply (such as EU distance-contract rules for eligible consumers), those statutory rights apply in full.",
        ],
      },
      {
        id: "export",
        heading: "4. Exporting Data Before Access Changes",
        paragraphs: [
          "Always export your XML invoices, hybrid PDF/A-3 files, DATEV/FEC ledgers, GoBD audit dossiers, and GDPR JSON data packages before closing or deleting a workspace.",
        ],
      },
    ],
  },

  privacy: {
    slug: "privacy",
    title: "Privacy Policy",
    badge: "GDPR & International Data Protection",
    subtitle: "How NormInvoice collects, uses, protects, and retains personal data across our public website and SaaS workspaces.",
    effectiveNote: "Draft Version 1.0 · Prepared 22 November 2026",
    sections: [
      {
        id: "controller",
        heading: "1. Who We Are & Roles (Controller vs. Processor)",
        paragraphs: [
          "NormInvoice is a software product associated with Trend&Brand (proposed contracting entity: Trend&Brand LLC, Wyoming, USA; related group entity: TREND & BRAND (PRIVATE) LIMITED, Pakistan). For website inquiries, account administration, security logs, and subscription billing, we act as data controller. When a business customer uses NormInvoice to process invoices containing personal data on its behalf, that customer acts as controller and we act as processor governed by our Data Processing Addendum (DPA).",
        ],
      },
      {
        id: "categories",
        heading: "2. Categories of Personal Data",
        bullets: [
          { label: "Account & Identity", text: "Name, organization name, work email, role, country, and scrypt-hashed authentication credentials." },
          { label: "Billing & Subscriptions", text: "Plan tier, trial dates, billing email, transaction references, and tax identifiers. Full card numbers are handled by external payment processors." },
          { label: "Customer Invoice Records", text: "Seller/buyer contact details, addresses, VAT IDs, IBANs, and XML/PDF documents uploaded or created by your workspace." },
          { label: "Zero-Retention Public Validator", text: "Files submitted to the free public validator (/api/v1/public/inspect) are processed in volatile memory and discarded immediately after returning results." },
          { label: "Security & Contact Inquiries", text: "Rate-limit telemetry, login audit events, and inquiries submitted through our Contact form." },
        ],
      },
      {
        id: "legal-bases",
        heading: "3. Purposes & GDPR Legal Bases",
        paragraphs: [
          "Where the EU/UK GDPR applies, we process personal data based on contract performance and pre-contractual steps (Art. 6(1)(b)), legal obligations such as tax and accounting recordkeeping (Art. 6(1)(c)), legitimate interests in securing accounts and operating reliable infrastructure (Art. 6(1)(f)), and explicit opt-in consent where required for optional marketing or non-essential cookies (Art. 6(1)(a)).",
        ],
      },
      {
        id: "transfers",
        heading: "4. International Data Transfers",
        paragraphs: [
          "Because Trend&Brand operates across the United States (Trend&Brand LLC) and Pakistan (TREND & BRAND (PRIVATE) LIMITED) in addition to EU cloud infrastructure, any cross-border access or transfer of EEA/UK personal data is assessed under GDPR Chapter V and supported by appropriate safeguards such as Standard Contractual Clauses (SCCs) and supplementary technical measures.",
        ],
      },
      {
        id: "rights",
        heading: "5. Your Data Subject Rights",
        paragraphs: [
          "Depending on applicable law, you have the right to access, rectify, erase, restrict, object to processing, export your workspace data (Art. 20 GDPR JSON export available directly in Settings > Security & GDPR), withdraw consent, and lodge a complaint with a supervisory authority. Contact official@trendandbrands.com for any privacy request.",
        ],
      },
    ],
  },

  cookies: {
    slug: "cookies",
    title: "Cookie Policy",
    badge: "Consent Controls & Storage Inventory",
    subtitle: "Transparent overview of strictly necessary cookies, optional preference/analytics categories, and how to manage consent.",
    effectiveNote: "Draft Version 1.0 · Prepared 22 November 2026",
    sections: [
      {
        id: "overview",
        heading: "1. How NormInvoice Uses Cookies & Local Storage",
        paragraphs: [
          "NormInvoice minimizes browser storage and avoids intrusive third-party advertising trackers. Fonts (Inter and JetBrains Mono) are self-hosted with the application so zero requests are sent to external Google Fonts CDNs.",
        ],
      },
      {
        id: "inventory",
        heading: "2. Active First-Party Cookie & Storage Inventory",
        bullets: [
          { label: "norminvoice_session (Strictly Necessary — HttpOnly Cookie)", text: "HMAC-SHA256 signed authentication session token (7-day expiry, SameSite=Lax). Required for secure sign-in." },
          { label: "norminvoice_cookie_consent_v1 (Strictly Necessary — Local Storage)", text: "Stores your cookie consent choices so we honor your opt-in or opt-out preferences." },
          { label: "norminvoice_locale (Preferences — Local Storage)", text: "Remembers your chosen interface language (EN / DE / FR)." },
          { label: "Analytics & Marketing Cookies", text: "Disabled by default. No non-essential analytics or advertising scripts load without explicit consent." },
        ],
      },
      {
        id: "control",
        heading: "3. Managing Your Preferences",
        paragraphs: [
          "You can accept all, reject non-essential cookies, or customize individual categories at any time using the persistent 'Cookie Settings' link in the website footer. Contact official@trendandbrands.com with any questions.",
        ],
      },
    ],
  },

  dpa: {
    slug: "dpa",
    title: "Data Processing Addendum (DPA)",
    badge: "GDPR Article 28 Processor Terms — Draft",
    subtitle: "Standard data processing commitments, technical and organizational measures (Annex II), and subprocessor rules for business customers.",
    effectiveNote: "Draft Version 1.0 · Prepared 22 November 2026",
    reviewNotice: "Draft template prepared for counsel review and business customer incorporation/execution prior to enterprise rollout.",
    sections: [
      {
        id: "roles",
        heading: "1. Subject Matter, Duration & Roles",
        paragraphs: [
          "Where Provider processes personal data embedded in Customer invoice records and workspace data on Customer's behalf, Customer acts as Controller and Provider acts as Processor for the duration of the subscription plus agreed export/deletion windows.",
        ],
      },
      {
        id: "instructions",
        heading: "2. Documented Instructions & Confidentiality",
        paragraphs: [
          "Provider processes Customer Data solely on Customer's documented instructions (the subscription agreement, workspace configuration, and authorized user actions), ensures personnel with access are bound by confidentiality obligations, and notifies Customer where legally permitted if a statutory obligation requires otherwise.",
        ],
      },
      {
        id: "toms",
        heading: "3. Technical & Organizational Measures (Annex II — Currently Implemented)",
        bullets: [
          { label: "Tenant Isolation", text: "Strict organization-scoped database queries and PostgreSQL Row-Level Security (RLS) design." },
          { label: "Credential & Secret Protection", text: "Per-user random-salt scrypt password hashing, SHA-256 hashed Bearer API keys, and AES-256-GCM encryption at rest for webhook secrets." },
          { label: "XML / PDF Security", text: "XXE / DOCTYPE / ENTITY rejection before XML parsing, filename sanitization, and CSP/HSTS security headers." },
          { label: "Audit Integrity", text: "Append-only SHA-256 hash-chained audit logs per organization with live chain verification." },
        ],
      },
      {
        id: "breaches-subprocessors",
        heading: "4. Breach Notification, Subprocessors & International Transfers",
        paragraphs: [
          "Provider notifies Customer without undue delay upon becoming aware of a confirmed personal data breach affecting Customer Data. Subprocessors are documented in our Subprocessor Register. Where GDPR Chapter V international transfers apply, the parties execute appropriate Standard Contractual Clauses (SCCs) and transfer assessments.",
        ],
      },
    ],
  },

  subprocessors: {
    slug: "subprocessors",
    title: "Subprocessor Register",
    badge: "Third-Party Infrastructure Transparency",
    subtitle: "Disclosure of third-party infrastructure and service categories supporting NormInvoice operations.",
    effectiveNote: "Draft Version 1.0 · Last Verified 22 November 2026",
    reviewNotice:
      "Honesty commitment: We list only verified active services and clearly mark optional/configurable integrations. Planned partners are never misrepresented as active production subprocessors.",
    sections: [
      {
        id: "active-categories",
        heading: "1. Configurable Production Infrastructure & Service Providers",
        bullets: [
          { label: "Primary Application & Database Hosting", text: "Configured per deployment environment (designed for EU-Central / Germany cloud hosting such as Hetzner when deployed to production)." },
          { label: "Subscription Payment & Merchant of Record (Optional / When Configured)", text: "Paddle.com Market Ltd — active only when live Paddle checkout credentials are enabled in production." },
          { label: "Transactional Email Delivery (Optional / When Configured)", text: "Resend — active only when RESEND_API_KEY is configured for invoice delivery and auth emails." },
          { label: "Related Group Engineering & Support Operations", text: "TREND & BRAND (PRIVATE) LIMITED (Pakistan) — software development and support operations under intercompany data-protection and transfer safeguards." },
        ],
      },
      {
        id: "changes",
        heading: "2. Notice of Subprocessor Changes",
        paragraphs: [
          "Business customers covered by a DPA are notified prior to adding or replacing material subprocessors, with a documented procedure to raise reasonable data-protection objections by emailing official@trendandbrands.com.",
        ],
      },
    ],
  },

  "acceptable-use": {
    slug: "acceptable-use",
    title: "Acceptable Use Policy",
    badge: "Responsible Platform Use & Anti-Fraud",
    subtitle: "Permitted business uses, prohibited conduct, security testing rules, and proportionate enforcement.",
    effectiveNote: "Draft Version 1.0 · Prepared 22 November 2026",
    sections: [
      {
        id: "permitted",
        heading: "1. Permitted Use",
        paragraphs: [
          "You may use NormInvoice exclusively for lawful business invoicing, compliance validation, accounting exports, and authorized integrations within your workspace's permissions and subscription quota.",
        ],
      },
      {
        id: "prohibited",
        heading: "2. Prohibited Conduct",
        bullets: [
          { text: "Submitting fraudulent, fabricated, or deceptive invoices or misrepresenting tax or VAT registration identifiers." },
          { text: "Uploading malicious payloads, XML External Entity (XXE) exploits, or attempting to bypass authentication, rate limits, or tenant isolation." },
          { text: "Scraping, probing, or accessing another organization's workspace or performing unauthorized load or penetration testing against production systems." },
        ],
      },
      {
        id: "enforcement",
        heading: "3. Enforcement & Responsible Disclosure",
        paragraphs: [
          "We may proportionately restrict or suspend access to stop fraud, abuse, or active security threats, providing notice whenever lawful and practicable. Appeals and responsible vulnerability disclosures should be sent to official@trendandbrands.com.",
        ],
      },
    ],
  },

  "service-availability": {
    slug: "service-availability",
    title: "Service Availability & Support Policy",
    badge: "Truthful Support & Operations Scope",
    subtitle: "How support, maintenance, incident communication, and third-party network dependencies work — without fabricated uptime claims.",
    effectiveNote: "Draft Version 1.0 · Prepared 22 November 2026",
    sections: [
      {
        id: "availability",
        heading: "1. Service Availability & No Unverified SLA Claims",
        paragraphs: [
          "We engineer NormInvoice for dependable daily business operations, automated backups, and safe error handling. However, this general policy does not establish a numerical uptime percentage guarantee or SLA credit schedule unless separately agreed in an executed Enterprise agreement.",
        ],
      },
      {
        id: "support",
        heading: "2. Support Channels",
        paragraphs: [
          "Reach our support team at official@trendandbrands.com or via the Contact page. Include your organization name and invoice reference when reporting an issue — never share passwords, API keys, or full payment card numbers.",
        ],
      },
      {
        id: "external",
        heading: "3. External Networks & Government Gateways",
        paragraphs: [
          "EU VIES VAT services, Peppol Access Points, national tax gateways (KSeF, SdI, ANAF, PDP), payment providers, and email relays are operated by independent third parties. Temporary outages on external networks are surfaced transparently and may delay external acknowledgements even while NormInvoice remains operational.",
        ],
      },
    ],
  },

  "data-retention": {
    slug: "data-retention",
    title: "Data Retention & Deletion Policy",
    badge: "Archive Periods, Exports & Erasure",
    subtitle: "How long invoice archives, account records, audit chains, and security logs are retained and how deletion works.",
    effectiveNote: "Draft Version 1.0 · Prepared 22 November 2026",
    sections: [
      {
        id: "categories",
        heading: "1. Retention Schedule by Data Category",
        bullets: [
          { label: "Zero-Retention Public Validator", text: "0 seconds — uploaded files are processed strictly in RAM and discarded immediately." },
          { label: "Outgoing & Incoming Invoice Archives", text: "Configured by workspace retention settings (8 years aligned with German BEG IV / § 147 AO or 10 years aligned with French commercial code) while active." },
          { label: "Tamper-Evident Audit Hash-Chain", text: "Retained alongside workspace records to preserve cryptographic integrity for GoBD inspections." },
          { label: "Account & Contact Inquiry Records", text: "Retained while needed to operate your workspace, respond to inquiries, or satisfy statutory billing obligations." },
        ],
      },
      {
        id: "export-delete",
        heading: "2. Self-Service Export & Workspace Erasure",
        paragraphs: [
          "Workspace owners can download a complete GDPR Art. 20 JSON data export and ZIP invoice archive at any time from Settings > Security & GDPR, and can initiate permanent workspace erasure (Art. 17 GDPR) after confirming they have exported required statutory tax records.",
        ],
      },
    ],
  },

  "ai-transparency": {
    slug: "ai-transparency",
    title: "AI Feature Disclosure",
    badge: "Transparent Assistive Guidance",
    subtitle: "How assistive guidance tools (such as the Compliance Copilot) work, their deterministic boundaries, and required human oversight.",
    effectiveNote: "Draft Version 1.0 · Prepared 22 November 2026",
    sections: [
      {
        id: "scope",
        heading: "1. What Assistive Tools Do in NormInvoice",
        paragraphs: [
          "NormInvoice's Compliance Copilot uses deterministic EN 16931 rule dictionaries and structured country compliance metadata to help explain validation codes (such as BR-DE-15 or BR-CO-15) and guide users toward required fields.",
        ],
      },
      {
        id: "limits",
        heading: "2. No Legal Advice & Mandatory Human Review",
        paragraphs: [
          "Assistive explanations do not replace deterministic validation checks, official tax-authority responses, or professional guidance from a certified tax advisor or lawyer. Finalizing invoices, issuing credit notes, approving supplier bills, and transmitting documents always remain under explicit human and permissioned workflow control.",
        ],
      },
    ],
  },

  accessibility: {
    slug: "accessibility",
    title: "Accessibility Statement",
    badge: "Inclusive Interface Design",
    subtitle: "Our ongoing commitment to keyboard navigation, readable contrast, reduced motion, and accessible forms.",
    effectiveNote: "Draft Version 1.0 · Prepared 22 November 2026",
    sections: [
      {
        id: "priorities",
        heading: "1. Accessibility Priorities Implemented",
        bullets: [
          { text: "High-contrast Navy (#011D42), White (#FFFFFF), and accessible Orange/Semantic palette pairings." },
          { text: "Visible keyboard focus outlines, semantic landmarks, descriptive form labels, and ARIA roles for alerts and dialogs." },
          { text: "Full prefers-reduced-motion CSS support disabling non-essential transitions and animations automatically." },
        ],
      },
      {
        id: "status",
        heading: "2. Current Audit Status & Feedback",
        paragraphs: [
          "We continuously review accessibility across public pages and workspace workflows, and do not claim formal third-party WCAG 2.2 AA certification prior to an independent audit. If you encounter any accessibility barrier, please email official@trendandbrands.com with the page URL and issue description.",
        ],
      },
    ],
  },

  "third-party-services": {
    slug: "third-party-services",
    title: "Third-Party Services Disclaimer",
    badge: "Independent Networks & Connected Tools",
    subtitle: "Clear separation between NormInvoice software subscriptions and third-party e-invoicing networks, payment processors, and ERP tools.",
    effectiveNote: "Draft Version 1.0 · Prepared 22 November 2026",
    sections: [
      {
        id: "separation",
        heading: "1. Software vs. External Providers",
        paragraphs: [
          "Your NormInvoice subscription grants access to NormInvoice software features. External payment processors (such as Stripe or Paddle), e-commerce platforms (such as WooCommerce), Peppol Access Points, national clearance gateways, and accounting applications are independent services governed by their own terms and availability.",
        ],
      },
      {
        id: "acknowledgements",
        heading: "2. Distinct Transport & Authority Acknowledgements",
        paragraphs: [
          "Internal workflow states ('Draft', 'Validated', 'Sent') are strictly separated from external government or network acceptance confirmations. Any third-party transmission fees, where applicable, are disclosed before activation.",
        ],
      },
    ],
  },

  complaints: {
    slug: "complaints",
    title: "Complaints & Dispute Resolution",
    badge: "Customer Resolution Channel",
    subtitle: "How to raise billing, privacy, accessibility, or service concerns with the NormInvoice team.",
    effectiveNote: "Draft Version 1.0 · Prepared 22 November 2026",
    sections: [
      {
        id: "submit",
        heading: "1. Submitting a Complaint",
        paragraphs: [
          "For any billing, subscription, privacy, security, or product concern, email official@trendandbrands.com (or call +92 325 5039135) with your organization name, relevant invoice or account reference, and a clear description of the issue. We review every report thoroughly and respond through the appropriate support channel.",
        ],
      },
      {
        id: "rights",
        heading: "2. Statutory Rights & EU ODR Closure Notice",
        paragraphs: [
          "Nothing in this policy limits non-waivable statutory rights or your right to approach a competent data-protection authority or court. Please note that the European Commission's former Online Dispute Resolution (ODR) platform closed permanently on 20 July 2025 and is no longer an active complaint route.",
        ],
      },
    ],
  },

  "intellectual-property": {
    slug: "intellectual-property",
    title: "Intellectual Property & Brand Guidelines",
    badge: "Ownership & Brand Use",
    subtitle: "Rights in NormInvoice software, customer ownership of business data, and accurate brand usage rules.",
    effectiveNote: "Draft Version 1.0 · Prepared 22 November 2026",
    sections: [
      {
        id: "ownership",
        heading: "1. Software & Brand Ownership",
        paragraphs: [
          "The NormInvoice platform, source code, original interface designs, validation rule documentation, and brand assets belong to the Trend&Brand rights holders and licensors. NormInvoice and Trend&Brand names and logos must not be used in a way that implies endorsement or official affiliation without written consent. Trademark registration symbols are not used unless formal registration is confirmed.",
        ],
      },
      {
        id: "customer-ip",
        heading: "2. Customer Ownership of Business Records",
        paragraphs: [
          "Customers retain 100% ownership of their company logos, customer records, invoices, XML files, and accounting exports. Uploading materials grants NormInvoice only the limited operational rights needed to deliver the service.",
        ],
      },
      {
        id: "requests",
        heading: "3. Brand & Infringement Inquiries",
        paragraphs: [
          "For press, partnership brand usage, or intellectual property notices, contact official@trendandbrands.com.",
        ],
      },
    ],
  },
};

// ── Legal-page localization (Phase 1 infra) ──
// English is the canonical, binding fallback. Translated locales are added
// per-slug under de/fr; any missing slug falls back to the English document,
// so a half-finished language never renders a blank page.
const LEGAL_DRAFT_DE =
  "Maschineller Übersetzungsentwurf, noch nicht juristisch geprüft. Im Zweifel gilt die englische Fassung.";
const LEGAL_DRAFT_FR =
  "Brouillon de traduction automatique, pas encore validé juridiquement. En cas de doute, la version anglaise fait foi.";

const LEGAL_DE: Record<string, LegalDocument> = {
  cookies: {
    slug: "cookies",
    title: "Cookie-Richtlinie",
    badge: "Einwilligungskontrollen & Speicherübersicht",
    subtitle: "Transparente Übersicht über unbedingt erforderliche Cookies, optionale Präferenz-/Analysekategorien und die Verwaltung Ihrer Einwilligung.",
    effectiveNote: "Entwurf Version 1.0 · Erstellt am 22. November 2026",
    reviewNotice: LEGAL_DRAFT_DE,
    sections: [
      {
        id: "overview",
        heading: "1. Wie NormInvoice Cookies & lokalen Speicher nutzt",
        paragraphs: [
          "NormInvoice minimiert den Browserspeicher und verzichtet auf aufdringliche Werbe-Tracker von Drittanbietern. Schriftarten (Inter und JetBrains Mono) werden mit der Anwendung selbst gehostet, sodass keine Anfragen an externe Google-Fonts-CDNs gesendet werden.",
        ],
      },
      {
        id: "inventory",
        heading: "2. Aktive Erstanbieter-Cookies & Speicherübersicht",
        bullets: [
          { label: "norminvoice_session (unbedingt erforderlich — HttpOnly-Cookie)", text: "HMAC-SHA256-signiertes Authentifizierungs-Sitzungstoken (7 Tage Gültigkeit, SameSite=Lax). Für die sichere Anmeldung erforderlich." },
          { label: "norminvoice_cookie_consent_v1 (unbedingt erforderlich — Local Storage)", text: "Speichert Ihre Cookie-Einwilligung, damit wir Ihre Opt-in- oder Opt-out-Präferenzen berücksichtigen." },
          { label: "norminvoice_locale (Präferenzen — Local Storage)", text: "Merkt sich Ihre gewählte Oberflächensprache (EN / DE / FR)." },
          { label: "Analyse- & Marketing-Cookies", text: "Standardmäßig deaktiviert. Ohne ausdrückliche Einwilligung werden keine nicht erforderlichen Analyse- oder Werbeskripte geladen." },
        ],
      },
      {
        id: "control",
        heading: "3. Verwaltung Ihrer Präferenzen",
        paragraphs: [
          "Sie können jederzeit alle Cookies akzeptieren, nicht erforderliche ablehnen oder einzelne Kategorien anpassen — über den dauerhaften Link »Cookie-Einstellungen« in der Website-Fußzeile. Bei Fragen wenden Sie sich an official@trendandbrands.com.",
        ],
      },
    ],
  },
  subprocessors: {
    slug: "subprocessors",
    title: "Unterauftragsverarbeiter-Register",
    badge: "Transparenz der Drittanbieter-Infrastruktur",
    subtitle: "Offenlegung der Drittanbieter-Infrastruktur und Dienstkategorien, die den Betrieb von NormInvoice unterstützen.",
    effectiveNote: "Entwurf Version 1.0 · Zuletzt geprüft am 22. November 2026",
    reviewNotice:
      LEGAL_DRAFT_DE +
      " Ehrlichkeitsverpflichtung: Wir listen nur verifizierte aktive Dienste auf und kennzeichnen optionale/konfigurierbare Integrationen klar. Geplante Partner werden nie als aktive produktive Unterauftragsverarbeiter dargestellt.",
    sections: [
      {
        id: "active-categories",
        heading: "1. Konfigurierbare Produktionsinfrastruktur & Dienstleister",
        bullets: [
          { label: "Primäres Anwendungs- & Datenbank-Hosting", text: "Pro Bereitstellungsumgebung konfiguriert (ausgelegt für EU-Central-/Deutschland-Cloud-Hosting wie Hetzner im Produktivbetrieb)." },
          { label: "Abonnementzahlung & Merchant of Record (optional / falls konfiguriert)", text: "Paddle.com Market Ltd — nur aktiv, wenn produktive Paddle-Checkout-Zugangsdaten aktiviert sind." },
          { label: "Transaktions-E-Mail-Versand (optional / falls konfiguriert)", text: "Resend — nur aktiv, wenn RESEND_API_KEY für Rechnungsversand und Authentifizierungs-E-Mails konfiguriert ist." },
          { label: "Technik- & Support-Betrieb des verbundenen Konzerns", text: "TREND & BRAND (PRIVATE) LIMITED (Pakistan) — Softwareentwicklung und Support unter konzerninternen Datenschutz- und Übermittlungsgarantien." },
        ],
      },
      {
        id: "changes",
        heading: "2. Mitteilung über Änderungen bei Unterauftragsverarbeitern",
        paragraphs: [
          "Geschäftskunden mit AVV werden vor dem Hinzufügen oder Ersetzen wesentlicher Unterauftragsverarbeiter informiert; über official@trendandbrands.com besteht ein dokumentiertes Verfahren, um begründete datenschutzrechtliche Einwände zu erheben.",
        ],
      },
    ],
  },
  "service-availability": {
    slug: "service-availability",
    title: "Richtlinie zu Serviceverfügbarkeit & Support",
    badge: "Wahrheitsgemäßer Support- & Betriebsumfang",
    subtitle: "Wie Support, Wartung, Incident-Kommunikation und Drittanbieter-Netzwerkabhängigkeiten funktionieren — ohne erfundene Verfügbarkeitsversprechen.",
    effectiveNote: "Entwurf Version 1.0 · Erstellt am 22. November 2026",
    reviewNotice: LEGAL_DRAFT_DE,
    sections: [
      {
        id: "availability",
        heading: "1. Serviceverfügbarkeit & keine unbelegten SLA-Zusagen",
        paragraphs: [
          "Wir entwickeln NormInvoice für zuverlässigen täglichen Geschäftsbetrieb, automatische Backups und sichere Fehlerbehandlung. Diese allgemeine Richtlinie begründet jedoch keine numerische Verfügbarkeitsgarantie oder SLA-Gutschriftenregelung, sofern nicht in einem abgeschlossenen Enterprise-Vertrag gesondert vereinbart.",
        ],
      },
      {
        id: "support",
        heading: "2. Support-Kanäle",
        paragraphs: [
          "Erreichen Sie unser Support-Team unter official@trendandbrands.com oder über die Kontaktseite. Geben Sie bei einer Meldung Ihren Organisationsnamen und die Rechnungsreferenz an — teilen Sie niemals Passwörter, API-Schlüssel oder vollständige Zahlungskartennummern.",
        ],
      },
      {
        id: "external",
        heading: "3. Externe Netzwerke & behördliche Gateways",
        paragraphs: [
          "EU-VIES-USt-Dienste, Peppol-Access-Points, nationale Steuer-Gateways (KSeF, SdI, ANAF, PDP), Zahlungsanbieter und E-Mail-Relays werden von unabhängigen Dritten betrieben. Vorübergehende Ausfälle externer Netzwerke werden transparent dargestellt und können externe Bestätigungen verzögern, auch wenn NormInvoice weiterhin betriebsbereit ist.",
        ],
      },
    ],
  },
  "data-retention": {
    slug: "data-retention",
    title: "Richtlinie zu Datenaufbewahrung & Löschung",
    badge: "Archivfristen, Exporte & Löschung",
    subtitle: "Wie lange Rechnungsarchive, Kontodaten, Audit-Ketten und Sicherheitsprotokolle aufbewahrt werden und wie die Löschung funktioniert.",
    effectiveNote: "Entwurf Version 1.0 · Erstellt am 22. November 2026",
    reviewNotice: LEGAL_DRAFT_DE,
    sections: [
      {
        id: "categories",
        heading: "1. Aufbewahrungsplan nach Datenkategorie",
        bullets: [
          { label: "Zero-Retention-Validator (öffentlich)", text: "0 Sekunden — hochgeladene Dateien werden ausschließlich im RAM verarbeitet und sofort verworfen." },
          { label: "Archive ausgehender & eingehender Rechnungen", text: "Durch die Workspace-Aufbewahrungseinstellungen konfiguriert (8 Jahre gemäß deutschem BEG IV / § 147 AO oder 10 Jahre gemäß französischem Handelsgesetzbuch), solange aktiv." },
          { label: "Manipulationssichere Audit-Hash-Kette", text: "Zusammen mit den Workspace-Daten aufbewahrt, um die kryptografische Integrität für GoBD-Prüfungen zu wahren." },
          { label: "Konto- & Kontaktanfrage-Daten", text: "Aufbewahrt, solange dies für den Betrieb Ihres Workspace, die Beantwortung von Anfragen oder gesetzliche Abrechnungspflichten erforderlich ist." },
        ],
      },
      {
        id: "export-delete",
        heading: "2. Self-Service-Export & Workspace-Löschung",
        paragraphs: [
          "Workspace-Inhaber können jederzeit unter Einstellungen > Sicherheit & DSGVO einen vollständigen DSGVO-Art.-20-JSON-Datenexport und ein ZIP-Rechnungsarchiv herunterladen und die dauerhafte Workspace-Löschung (Art. 17 DSGVO) einleiten, nachdem sie bestätigt haben, dass sie die erforderlichen gesetzlichen Steuerunterlagen exportiert haben.",
        ],
      },
    ],
  },
  "ai-transparency": {
    slug: "ai-transparency",
    title: "Offenlegung von KI-Funktionen",
    badge: "Transparente assistive Hilfestellung",
    subtitle: "Wie assistive Hilfswerkzeuge (wie der Compliance-Copilot) funktionieren, ihre deterministischen Grenzen und die erforderliche menschliche Aufsicht.",
    effectiveNote: "Entwurf Version 1.0 · Erstellt am 22. November 2026",
    reviewNotice: LEGAL_DRAFT_DE,
    sections: [
      {
        id: "scope",
        heading: "1. Was assistive Werkzeuge in NormInvoice tun",
        paragraphs: [
          "Der Compliance-Copilot von NormInvoice verwendet deterministische EN-16931-Regelwörterbücher und strukturierte Länder-Compliance-Metadaten, um Validierungscodes (wie BR-DE-15 oder BR-CO-15) zu erklären und Nutzer zu erforderlichen Feldern zu führen.",
        ],
      },
      {
        id: "limits",
        heading: "2. Keine Rechtsberatung & verpflichtende menschliche Prüfung",
        paragraphs: [
          "Assistive Erläuterungen ersetzen weder deterministische Validierungsprüfungen noch offizielle Antworten der Steuerbehörden oder die fachliche Beratung durch einen zertifizierten Steuerberater oder Rechtsanwalt. Das Finalisieren von Rechnungen, das Ausstellen von Gutschriften, das Freigeben von Lieferantenrechnungen und das Übermitteln von Dokumenten bleiben stets unter ausdrücklicher menschlicher und berechtigungsgesteuerter Workflow-Kontrolle.",
        ],
      },
    ],
  },
  accessibility: {
    slug: "accessibility",
    title: "Erklärung zur Barrierefreiheit",
    badge: "Inklusives Oberflächendesign",
    subtitle: "Unser fortlaufendes Engagement für Tastaturnavigation, lesbaren Kontrast, reduzierte Bewegung und barrierefreie Formulare.",
    effectiveNote: "Entwurf Version 1.0 · Erstellt am 22. November 2026",
    reviewNotice: LEGAL_DRAFT_DE,
    sections: [
      {
        id: "priorities",
        heading: "1. Umgesetzte Prioritäten der Barrierefreiheit",
        bullets: [
          { text: "Kontrastreiche Paarungen aus Navy (#011D42), Weiß (#FFFFFF) und einer barrierefreien Orange-/Semantik-Palette." },
          { text: "Sichtbare Tastatur-Fokusrahmen, semantische Landmarks, beschreibende Formularbeschriftungen sowie ARIA-Rollen für Hinweise und Dialoge." },
          { text: "Vollständige Unterstützung von prefers-reduced-motion, die nicht erforderliche Übergänge und Animationen automatisch deaktiviert." },
        ],
      },
      {
        id: "status",
        heading: "2. Aktueller Prüfstatus & Feedback",
        paragraphs: [
          "Wir überprüfen die Barrierefreiheit über öffentliche Seiten und Workspace-Abläufe hinweg kontinuierlich und beanspruchen vor einem unabhängigen Audit keine formelle Drittzertifizierung nach WCAG 2.2 AA. Sollten Sie auf eine Barriere stoßen, senden Sie bitte eine E-Mail an official@trendandbrands.com mit der Seiten-URL und einer Beschreibung des Problems.",
        ],
      },
    ],
  },
  "third-party-services": {
    slug: "third-party-services",
    title: "Haftungsausschluss für Drittanbieterdienste",
    badge: "Unabhängige Netzwerke & verbundene Tools",
    subtitle: "Klare Trennung zwischen NormInvoice-Software-Abonnements und Drittanbieter-E-Rechnungsnetzwerken, Zahlungsdienstleistern und ERP-Tools.",
    effectiveNote: "Entwurf Version 1.0 · Erstellt am 22. November 2026",
    reviewNotice: LEGAL_DRAFT_DE,
    sections: [
      {
        id: "separation",
        heading: "1. Software vs. externe Anbieter",
        paragraphs: [
          "Ihr NormInvoice-Abonnement gewährt Zugang zu den Softwarefunktionen von NormInvoice. Externe Zahlungsdienstleister (wie Stripe oder Paddle), E-Commerce-Plattformen (wie WooCommerce), Peppol-Access-Points, nationale Clearing-Gateways und Buchhaltungsanwendungen sind unabhängige Dienste, die eigenen Bedingungen und einer eigenen Verfügbarkeit unterliegen.",
        ],
      },
      {
        id: "acknowledgements",
        heading: "2. Getrennte Übertragungs- & Behördenbestätigungen",
        paragraphs: [
          "Interne Workflow-Status (»Entwurf«, »Validiert«, »Versendet«) sind strikt von externen behördlichen oder netzwerkseitigen Annahmebestätigungen getrennt. Etwaige Übertragungsgebühren Dritter werden, sofern zutreffend, vor der Aktivierung offengelegt.",
        ],
      },
    ],
  },
  complaints: {
    slug: "complaints",
    title: "Beschwerden & Streitbeilegung",
    badge: "Kanal zur Kundenlösung",
    subtitle: "So melden Sie dem NormInvoice-Team Anliegen zu Abrechnung, Datenschutz, Barrierefreiheit oder Service.",
    effectiveNote: "Entwurf Version 1.0 · Erstellt am 22. November 2026",
    reviewNotice: LEGAL_DRAFT_DE,
    sections: [
      {
        id: "submit",
        heading: "1. Eine Beschwerde einreichen",
        paragraphs: [
          "Bei Anliegen zu Abrechnung, Abonnement, Datenschutz, Sicherheit oder Produkt senden Sie eine E-Mail an official@trendandbrands.com (oder rufen Sie +92 325 5039135 an) mit Ihrem Organisationsnamen, der relevanten Rechnungs- oder Kontoreferenz und einer klaren Beschreibung des Problems. Wir prüfen jede Meldung gründlich und antworten über den passenden Support-Kanal.",
        ],
      },
      {
        id: "rights",
        heading: "2. Gesetzliche Rechte & Hinweis zur Schließung der EU-ODR",
        paragraphs: [
          "Nichts in dieser Richtlinie schränkt unabdingbare gesetzliche Rechte oder Ihr Recht ein, sich an eine zuständige Datenschutzbehörde oder ein Gericht zu wenden. Bitte beachten Sie, dass die frühere Online-Streitbeilegungsplattform (ODR) der Europäischen Kommission am 20. Juli 2025 dauerhaft geschlossen wurde und kein aktiver Beschwerdeweg mehr ist.",
        ],
      },
    ],
  },
  "intellectual-property": {
    slug: "intellectual-property",
    title: "Geistiges Eigentum & Markenrichtlinien",
    badge: "Eigentum & Markennutzung",
    subtitle: "Rechte an der NormInvoice-Software, Kundeneigentum an Geschäftsdaten und Regeln zur korrekten Markennutzung.",
    effectiveNote: "Entwurf Version 1.0 · Erstellt am 22. November 2026",
    reviewNotice: LEGAL_DRAFT_DE,
    sections: [
      {
        id: "ownership",
        heading: "1. Software- & Markeneigentum",
        paragraphs: [
          "Die NormInvoice-Plattform, der Quellcode, die ursprünglichen Oberflächendesigns, die Dokumentation der Validierungsregeln und die Markenassets gehören den Rechteinhabern und Lizenzgebern von Trend&Brand. Die Namen und Logos von NormInvoice und Trend&Brand dürfen ohne schriftliche Zustimmung nicht so verwendet werden, dass eine Billigung oder offizielle Zugehörigkeit suggeriert wird. Markenregistrierungssymbole werden nur verwendet, wenn eine formelle Registrierung bestätigt ist.",
        ],
      },
      {
        id: "customer-ip",
        heading: "2. Kundeneigentum an Geschäftsunterlagen",
        paragraphs: [
          "Kunden behalten 100 % Eigentum an ihren Firmenlogos, Kundendaten, Rechnungen, XML-Dateien und Buchhaltungsexporten. Das Hochladen von Materialien gewährt NormInvoice nur die begrenzten betrieblichen Rechte, die zur Erbringung des Dienstes erforderlich sind.",
        ],
      },
      {
        id: "requests",
        heading: "3. Marken- & Verletzungsanfragen",
        paragraphs: [
          "Für Presse, Markennutzung in Partnerschaften oder Hinweise zum geistigen Eigentum wenden Sie sich an official@trendandbrands.com.",
        ],
      },
    ],
  },
};

const LEGAL_FR: Record<string, LegalDocument> = {
  cookies: {
    slug: "cookies",
    title: "Politique relative aux cookies",
    badge: "Contrôles de consentement & inventaire du stockage",
    subtitle: "Aperçu transparent des cookies strictement nécessaires, des catégories optionnelles de préférences/analyse et de la gestion de votre consentement.",
    effectiveNote: "Brouillon version 1.0 · Préparé le 22 novembre 2026",
    reviewNotice: LEGAL_DRAFT_FR,
    sections: [
      {
        id: "overview",
        heading: "1. Comment NormInvoice utilise les cookies & le stockage local",
        paragraphs: [
          "NormInvoice minimise le stockage du navigateur et évite les traceurs publicitaires tiers intrusifs. Les polices (Inter et JetBrains Mono) sont auto-hébergées avec l'application, de sorte qu'aucune requête n'est envoyée aux CDN Google Fonts externes.",
        ],
      },
      {
        id: "inventory",
        heading: "2. Inventaire des cookies & du stockage propriétaires actifs",
        bullets: [
          { label: "norminvoice_session (strictement nécessaire — cookie HttpOnly)", text: "Jeton de session d'authentification signé HMAC-SHA256 (expiration de 7 jours, SameSite=Lax). Requis pour une connexion sécurisée." },
          { label: "norminvoice_cookie_consent_v1 (strictement nécessaire — stockage local)", text: "Conserve vos choix de consentement aux cookies afin de respecter vos préférences d'acceptation ou de refus." },
          { label: "norminvoice_locale (préférences — stockage local)", text: "Mémorise la langue d'interface choisie (EN / DE / FR)." },
          { label: "Cookies d'analyse & de marketing", text: "Désactivés par défaut. Aucun script d'analyse ou de publicité non essentiel ne se charge sans consentement explicite." },
        ],
      },
      {
        id: "control",
        heading: "3. Gestion de vos préférences",
        paragraphs: [
          "Vous pouvez à tout moment tout accepter, refuser les cookies non essentiels ou personnaliser chaque catégorie via le lien permanent « Paramètres des cookies » dans le pied de page du site. Pour toute question, contactez official@trendandbrands.com.",
        ],
      },
    ],
  },
  subprocessors: {
    slug: "subprocessors",
    title: "Registre des sous-traitants",
    badge: "Transparence de l'infrastructure tierce",
    subtitle: "Divulgation de l'infrastructure tierce et des catégories de services soutenant l'exploitation de NormInvoice.",
    effectiveNote: "Brouillon version 1.0 · Dernière vérification le 22 novembre 2026",
    reviewNotice:
      LEGAL_DRAFT_FR +
      " Engagement d'honnêteté : nous ne listons que des services actifs vérifiés et indiquons clairement les intégrations optionnelles/configurables. Les partenaires prévus ne sont jamais présentés comme des sous-traitants actifs en production.",
    sections: [
      {
        id: "active-categories",
        heading: "1. Infrastructure de production configurable & prestataires",
        bullets: [
          { label: "Hébergement principal de l'application & de la base de données", text: "Configuré par environnement de déploiement (conçu pour un hébergement cloud UE-Central / Allemagne tel que Hetzner en production)." },
          { label: "Paiement d'abonnement & Merchant of Record (optionnel / si configuré)", text: "Paddle.com Market Ltd — actif uniquement lorsque des identifiants de paiement Paddle en production sont activés." },
          { label: "Envoi d'e-mails transactionnels (optionnel / si configuré)", text: "Resend — actif uniquement lorsque RESEND_API_KEY est configuré pour la livraison des factures et les e-mails d'authentification." },
          { label: "Opérations d'ingénierie & de support du groupe lié", text: "TREND & BRAND (PRIVATE) LIMITED (Pakistan) — développement logiciel et support sous garanties intragroupe de protection et de transfert des données." },
        ],
      },
      {
        id: "changes",
        heading: "2. Notification des changements de sous-traitants",
        paragraphs: [
          "Les clients professionnels couverts par un DPA sont informés avant l'ajout ou le remplacement de sous-traitants importants, avec une procédure documentée pour soulever des objections raisonnables en matière de protection des données en écrivant à official@trendandbrands.com.",
        ],
      },
    ],
  },
  "service-availability": {
    slug: "service-availability",
    title: "Politique de disponibilité du service & de support",
    badge: "Périmètre honnête de support & d'exploitation",
    subtitle: "Comment fonctionnent le support, la maintenance, la communication d'incidents et les dépendances aux réseaux tiers — sans promesses de disponibilité fabriquées.",
    effectiveNote: "Brouillon version 1.0 · Préparé le 22 novembre 2026",
    reviewNotice: LEGAL_DRAFT_FR,
    sections: [
      {
        id: "availability",
        heading: "1. Disponibilité du service & absence de SLA non vérifié",
        paragraphs: [
          "Nous concevons NormInvoice pour des opérations quotidiennes fiables, des sauvegardes automatiques et une gestion sûre des erreurs. Toutefois, cette politique générale n'établit aucune garantie chiffrée de disponibilité ni barème de crédits SLA, sauf accord distinct dans un contrat Enterprise signé.",
        ],
      },
      {
        id: "support",
        heading: "2. Canaux de support",
        paragraphs: [
          "Contactez notre équipe de support à official@trendandbrands.com ou via la page Contact. Indiquez le nom de votre organisation et la référence de facture lors d'un signalement — ne partagez jamais de mots de passe, de clés API ou de numéros complets de carte de paiement.",
        ],
      },
      {
        id: "external",
        heading: "3. Réseaux externes & passerelles gouvernementales",
        paragraphs: [
          "Les services TVA VIES de l'UE, les points d'accès Peppol, les passerelles fiscales nationales (KSeF, SdI, ANAF, PDP), les prestataires de paiement et les relais de messagerie sont exploités par des tiers indépendants. Les pannes temporaires des réseaux externes sont signalées de manière transparente et peuvent retarder les accusés de réception externes, même si NormInvoice reste opérationnel.",
        ],
      },
    ],
  },
  "data-retention": {
    slug: "data-retention",
    title: "Politique de conservation & de suppression des données",
    badge: "Durées d'archivage, exports & effacement",
    subtitle: "Combien de temps les archives de factures, les dossiers de compte, les chaînes d'audit et les journaux de sécurité sont conservés et comment fonctionne la suppression.",
    effectiveNote: "Brouillon version 1.0 · Préparé le 22 novembre 2026",
    reviewNotice: LEGAL_DRAFT_FR,
    sections: [
      {
        id: "categories",
        heading: "1. Calendrier de conservation par catégorie de données",
        bullets: [
          { label: "Validateur public sans conservation", text: "0 seconde — les fichiers importés sont traités strictement en mémoire vive et supprimés immédiatement." },
          { label: "Archives des factures émises & reçues", text: "Configurées par les paramètres de conservation de l'espace (8 ans conformément au BEG IV allemand / § 147 AO, ou 10 ans conformément au code de commerce français) tant qu'elles sont actives." },
          { label: "Chaîne de hachage d'audit infalsifiable", text: "Conservée avec les données de l'espace afin de préserver l'intégrité cryptographique pour les contrôles GoBD." },
          { label: "Données de compte & de demandes de contact", text: "Conservées tant que nécessaire pour exploiter votre espace, répondre aux demandes ou satisfaire aux obligations légales de facturation." },
        ],
      },
      {
        id: "export-delete",
        heading: "2. Export en libre-service & effacement de l'espace",
        paragraphs: [
          "Les propriétaires d'espace peuvent à tout moment télécharger un export de données JSON RGPD art. 20 complet et une archive ZIP des factures depuis Paramètres > Sécurité & RGPD, et lancer l'effacement permanent de l'espace (art. 17 RGPD) après avoir confirmé l'export des documents fiscaux légalement requis.",
        ],
      },
    ],
  },
  "ai-transparency": {
    slug: "ai-transparency",
    title: "Divulgation des fonctionnalités d'IA",
    badge: "Assistance transparente",
    subtitle: "Comment les outils d'assistance (comme le Copilote conformité) fonctionnent, leurs limites déterministes et la supervision humaine requise.",
    effectiveNote: "Brouillon version 1.0 · Préparé le 22 novembre 2026",
    reviewNotice: LEGAL_DRAFT_FR,
    sections: [
      {
        id: "scope",
        heading: "1. Ce que font les outils d'assistance dans NormInvoice",
        paragraphs: [
          "Le Copilote conformité de NormInvoice utilise des dictionnaires de règles EN 16931 déterministes et des métadonnées structurées de conformité par pays pour expliquer les codes de validation (tels que BR-DE-15 ou BR-CO-15) et orienter les utilisateurs vers les champs requis.",
        ],
      },
      {
        id: "limits",
        heading: "2. Aucun conseil juridique & revue humaine obligatoire",
        paragraphs: [
          "Les explications d'assistance ne remplacent pas les contrôles de validation déterministes, les réponses officielles des autorités fiscales ni les conseils professionnels d'un expert-comptable ou d'un avocat agréé. La finalisation des factures, l'émission d'avoirs, l'approbation des factures fournisseurs et la transmission des documents restent toujours sous contrôle humain explicite et sous un flux de travail soumis à autorisation.",
        ],
      },
    ],
  },
  accessibility: {
    slug: "accessibility",
    title: "Déclaration d'accessibilité",
    badge: "Conception d'interface inclusive",
    subtitle: "Notre engagement continu en faveur de la navigation au clavier, d'un contraste lisible, d'un mouvement réduit et de formulaires accessibles.",
    effectiveNote: "Brouillon version 1.0 · Préparé le 22 novembre 2026",
    reviewNotice: LEGAL_DRAFT_FR,
    sections: [
      {
        id: "priorities",
        heading: "1. Priorités d'accessibilité mises en œuvre",
        bullets: [
          { text: "Associations de couleurs à contraste élevé : Navy (#011D42), Blanc (#FFFFFF) et une palette Orange/sémantique accessible." },
          { text: "Contours de focus clavier visibles, repères sémantiques, libellés de formulaire descriptifs et rôles ARIA pour les alertes et les dialogues." },
          { text: "Prise en charge complète de prefers-reduced-motion, désactivant automatiquement les transitions et animations non essentielles." },
        ],
      },
      {
        id: "status",
        heading: "2. Statut d'audit actuel & retours",
        paragraphs: [
          "Nous examinons en continu l'accessibilité des pages publiques et des flux de l'espace, et ne revendiquons aucune certification tierce formelle WCAG 2.2 AA avant un audit indépendant. Si vous rencontrez un obstacle d'accessibilité, envoyez un e-mail à official@trendandbrands.com avec l'URL de la page et une description du problème.",
        ],
      },
    ],
  },
  "third-party-services": {
    slug: "third-party-services",
    title: "Clause de non-responsabilité relative aux services tiers",
    badge: "Réseaux indépendants & outils connectés",
    subtitle: "Séparation claire entre les abonnements au logiciel NormInvoice et les réseaux de facturation électronique tiers, les processeurs de paiement et les outils ERP.",
    effectiveNote: "Brouillon version 1.0 · Préparé le 22 novembre 2026",
    reviewNotice: LEGAL_DRAFT_FR,
    sections: [
      {
        id: "separation",
        heading: "1. Logiciel vs. prestataires externes",
        paragraphs: [
          "Votre abonnement NormInvoice donne accès aux fonctionnalités du logiciel NormInvoice. Les processeurs de paiement externes (tels que Stripe ou Paddle), les plateformes e-commerce (telles que WooCommerce), les points d'accès Peppol, les passerelles de clearance nationales et les applications comptables sont des services indépendants régis par leurs propres conditions et disponibilité.",
        ],
      },
      {
        id: "acknowledgements",
        heading: "2. Accusés de transport & d'autorité distincts",
        paragraphs: [
          "Les statuts internes du flux de travail (« Brouillon », « Validée », « Envoyée ») sont strictement séparés des confirmations d'acceptation externes, gouvernementales ou réseau. Les éventuels frais de transmission de tiers sont, le cas échéant, divulgués avant l'activation.",
        ],
      },
    ],
  },
  complaints: {
    slug: "complaints",
    title: "Réclamations & résolution des litiges",
    badge: "Canal de résolution client",
    subtitle: "Comment soumettre à l'équipe NormInvoice des préoccupations liées à la facturation, à la confidentialité, à l'accessibilité ou au service.",
    effectiveNote: "Brouillon version 1.0 · Préparé le 22 novembre 2026",
    reviewNotice: LEGAL_DRAFT_FR,
    sections: [
      {
        id: "submit",
        heading: "1. Soumettre une réclamation",
        paragraphs: [
          "Pour toute préoccupation de facturation, d'abonnement, de confidentialité, de sécurité ou de produit, envoyez un e-mail à official@trendandbrands.com (ou appelez le +92 325 5039135) avec le nom de votre organisation, la référence de facture ou de compte concernée et une description claire du problème. Nous examinons chaque signalement avec soin et répondons via le canal de support approprié.",
        ],
      },
      {
        id: "rights",
        heading: "2. Droits légaux & avis de fermeture de l'ODR de l'UE",
        paragraphs: [
          "Rien dans cette politique ne limite les droits légaux auxquels il ne peut être renoncé ni votre droit de saisir une autorité de protection des données compétente ou un tribunal. Veuillez noter que l'ancienne plateforme de règlement en ligne des litiges (RLL/ODR) de la Commission européenne a définitivement fermé le 20 juillet 2025 et n'est plus une voie de réclamation active.",
        ],
      },
    ],
  },
  "intellectual-property": {
    slug: "intellectual-property",
    title: "Propriété intellectuelle & règles d'utilisation de la marque",
    badge: "Propriété & usage de la marque",
    subtitle: "Droits sur le logiciel NormInvoice, propriété des données d'entreprise par le client et règles d'utilisation correcte de la marque.",
    effectiveNote: "Brouillon version 1.0 · Préparé le 22 novembre 2026",
    reviewNotice: LEGAL_DRAFT_FR,
    sections: [
      {
        id: "ownership",
        heading: "1. Propriété du logiciel & de la marque",
        paragraphs: [
          "La plateforme NormInvoice, le code source, les conceptions d'interface originales, la documentation des règles de validation et les éléments de marque appartiennent aux titulaires de droits et concédants de Trend&Brand. Les noms et logos NormInvoice et Trend&Brand ne doivent pas être utilisés d'une manière suggérant une approbation ou une affiliation officielle sans consentement écrit. Les symboles d'enregistrement de marque ne sont utilisés que si un enregistrement formel est confirmé.",
        ],
      },
      {
        id: "customer-ip",
        heading: "2. Propriété des dossiers d'entreprise par le client",
        paragraphs: [
          "Les clients conservent 100 % de la propriété de leurs logos d'entreprise, dossiers clients, factures, fichiers XML et exports comptables. L'import de contenus n'accorde à NormInvoice que les droits opérationnels limités nécessaires à la fourniture du service.",
        ],
      },
      {
        id: "requests",
        heading: "3. Demandes relatives à la marque & à la contrefaçon",
        paragraphs: [
          "Pour la presse, l'usage de la marque en partenariat ou les notifications de propriété intellectuelle, contactez official@trendandbrands.com.",
        ],
      },
    ],
  },
};

export const LEGAL_DOCUMENTS_I18N: Record<AppLocale, Record<string, LegalDocument>> = {
  en: LEGAL_DOCUMENTS,
  de: LEGAL_DE,
  fr: LEGAL_FR,
};

export function resolveLocale(raw: string | undefined | null): AppLocale {
  return raw === "de" || raw === "fr" ? raw : "en";
}

export function resolveLegalDoc(slug: string, locale: AppLocale): LegalDocument {
  return LEGAL_DOCUMENTS_I18N[locale]?.[slug] ?? LEGAL_DOCUMENTS[slug]!;
}

// UI chrome around every legal document (safe to translate now — not legal text).
export interface LegalChrome {
  back: string;
  onThisPage: string;
  contactForm: string;
  proposedEntity: string;
  relatedEntity: string;
}

export const LEGAL_CHROME: Record<AppLocale, LegalChrome> = {
  en: {
    back: "Back to NormInvoice",
    onThisPage: "On this page",
    contactForm: "Contact Form →",
    proposedEntity: "Proposed contracting entity:",
    relatedEntity: "Related group entity:",
  },
  de: {
    back: "Zurück zu NormInvoice",
    onThisPage: "Auf dieser Seite",
    contactForm: "Kontaktformular →",
    proposedEntity: "Vorgesehene Vertragspartei:",
    relatedEntity: "Verbundenes Konzernunternehmen:",
  },
  fr: {
    back: "Retour à NormInvoice",
    onThisPage: "Sur cette page",
    contactForm: "Formulaire de contact →",
    proposedEntity: "Entité contractante proposée :",
    relatedEntity: "Entité de groupe liée :",
  },
};
