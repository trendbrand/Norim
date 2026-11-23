export type AppLocale = "en" | "de" | "fr";

export interface LocalizedPlan {
  tier: "free" | "solo" | "business" | "agency";
  name: string;
  price: string;
  period: string;
  badge?: string;
  desc: string;
  features: string[];
  cta: string;
  highlighted: boolean;
}

export interface UiStrings {
  badgeEu: string;
  navValidator: string;
  navCreate: string;
  navBatch: string;
  navDashboard: string;
  navSettings: string;
  navDocs: string;
  navErrors: string;
  navSignIn: string;
  heroTag: string;
  heroTitle: string;
  heroSubtitle: string;
  ctaCreate: string;
  ctaDashboard: string;
  ctaQuiz: string;
  dropzoneTitle: string;
  dropzoneHint: string;
  privacyNote: string;
  sampleLabel: string;
  validBanner: string;
  invalidBanner: string;
  scorePdfLabel: string;
  scoreXmlLabel: string;
  scoreRulesLabel: string;
  tabVisual: string;
  tabDiagnostics: string;
  tabXml: string;
  mandateHeading: string;
  mandates: Array<{ country: string; status: string; deadline: string; formats: string }>;
  featuresHeading: string;
  featuresSubtitle: string;
  features: Array<{ title: string; text: string }>;
  pricingHeading: string;
  pricingSubtitle: string;
  plans: LocalizedPlan[];
}

export const UI_STRINGS: Record<AppLocale, UiStrings> = {
  en: {
    badgeEu: "Hosted 100% in Germany (EU-Central) · Zero-Retention Public Validator",
    navValidator: "Validator",
    navCreate: "Create",
    navBatch: "Batch CSV",
    navDashboard: "Dashboard",
    navSettings: "Settings",
    navDocs: "API Docs",
    navErrors: "Error Guide",
    navSignIn: "Sign In",
    heroTag: "Germany Jan 2027 · France Sept 2026/2027 · Belgium Peppol Live",
    heroTitle: "EU E-Invoicing Made Effortless for Stripe, WooCommerce & Finance Teams",
    heroSubtitle:
      "Validate and inspect ZUGFeRD 2.3, Factur-X 1.07, and XRechnung 3.0.2 invoices instantly — with zero file storage. Or automate compliant PDF/A-3 + XML billing, VIES VAT checks, GoBD archiving, and DATEV/FEC exports.",
    ctaCreate: "Create an E-Invoice Free",
    ctaDashboard: "Explore Stripe & Woo Bridge",
    ctaQuiz: "Which Format Do I Need?",
    dropzoneTitle: "Drop a ZUGFeRD / Factur-X PDF or XRechnung XML to validate",
    dropzoneHint: "Up to 10 MB · Supports CII, UBL 2.1, and PDF/A-3b · Processed strictly in memory",
    privacyNote: "GDPR Zero-Retention Pledge: Uploaded invoices are wiped from memory immediately after inspection.",
    sampleLabel: "Try an instant compliance test:",
    validBanner: "Compliant EN 16931 E-Invoice",
    invalidBanner: "Compliance Issues Found",
    scorePdfLabel: "PDF/A-3b Archive Layer",
    scoreXmlLabel: "XML Syntax & Security",
    scoreRulesLabel: "EN 16931 & National Rules",
    tabVisual: "Readable Invoice",
    tabDiagnostics: "Compliance Checks",
    tabXml: "Structured XML",
    mandateHeading: "Active European B2B E-Invoicing Mandates",
    mandates: [
      { country: "Germany", status: "Issuing Jan 2027", deadline: "Receiving live since Jan 2025 · B2B issuing starts Jan 2027", formats: "ZUGFeRD 2.3 & XRechnung 3.0.2" },
      { country: "France", status: "Receiving Live", deadline: "Receiving mandatory Sept 2026 · SME issuing Sept 2027", formats: "Factur-X 1.07 (EN 16931)" },
      { country: "Belgium", status: "Mandatory Now", deadline: "Full B2B Peppol mandate live since Jan 1, 2026", formats: "Peppol BIS Billing 3.0 (UBL)" },
      { country: "Cross-Border EU", status: "EN 16931 Standard", deadline: "Unified VAT Reverse Charge & ViDA readiness", formats: "VIES Verified AE / Exempt § 19" },
    ],
    featuresHeading: "Engineered for Real European Tax Audits — Not Fragile PDF Hacks",
    featuresSubtitle:
      "Default Stripe and WooCommerce PDFs lack structured EN 16931 XML and fail 2026–2027 B2B mandates. NormInvoice turns your existing checkout into an audit-proof compliance pipeline.",
    features: [
      {
        title: "Automatic Stripe & WooCommerce Bridge",
        text: "Captures finalized invoices, credit notes, and completed B2B orders automatically — reconciling cent-level Stripe rounding via BT-114 so validators never reject a document.",
      },
      {
        title: "Self-Validated Before Reaching Customers",
        text: "Every outgoing invoice is verified against EN 16931 math, XRechnung rules, and PDF/A-3b structure first. If a buyer forgot their Leitweg-ID, delivery pauses safely for 1-click repair.",
      },
      {
        title: "Resilient EU VIES VAT Verification",
        text: "Checks cross-border EU VAT numbers with 7-day audit caching and per-country circuit breakers so government VIES downtime never blocks your billing.",
      },
      {
        title: "GoBD (8-Yr) & French (10-Yr) Immutable Archive",
        text: "Hosted exclusively in Germany with S3 Object Lock and SHA-256 hash-chained audit logs, plus an auto-generated GoBD Verfahrensdokumentation for tax inspectors.",
      },
      {
        title: "1-Click DATEV (DE) & FEC (FR) Bookkeeping Exports",
        text: "Hand your accountant clean DATEV EXTF v700 files (SKR03/SKR04) or French DGFiP FEC ledgers — or batch-convert monthly CSV exports into a ready-to-file ZIP.",
      },
      {
        title: "One Canonical Model, Every EU Standard",
        text: "Output ZUGFeRD 2.3, Factur-X 1.07, XRechnung 3.0.2 (CII & UBL), and Peppol BIS 3.0 from a single clean schema, REST API, or zero-dependency TypeScript SDK.",
      },
    ],
    pricingHeading: "Simple, Predictable Pricing for European Teams",
    pricingSubtitle: "No per-invoice surprises. Global EU VAT and invoices handled cleanly via Paddle.",
    plans: [
      {
        tier: "free",
        name: "Free Validator",
        price: "€0",
        period: "/ forever",
        desc: "Ideal for checking incoming supplier e-invoices and occasional manual exports.",
        features: [
          "Unlimited zero-retention dual validator & viewer",
          "3 manual ZUGFeRD / Factur-X / XRechnung files per month",
          "Plain-language EN, DE & FR error explanations",
          "Instant EPC SEPA GiroCode QR preview",
        ],
        cta: "Start Creating Free",
        highlighted: false,
      },
      {
        tier: "solo",
        name: "Solo Bridge",
        price: "€19",
        period: "/ month",
        desc: "Built for German & French freelancers, consultants, and solo SaaS founders.",
        features: [
          "100 automated e-invoices per month",
          "Stripe auto-bridge (invoices + credit notes)",
          "Bulk CSV converter -> PDF/A-3 + XML ZIP",
          "Cached VIES VAT checks & Kleinunternehmer § 19",
          "1-click DATEV (DE) & FEC (FR) exports",
        ],
        cta: "Start Solo (€19/mo)",
        highlighted: false,
      },
      {
        tier: "business",
        name: "Business GoBD",
        price: "€49",
        period: "/ month",
        badge: "Most Popular",
        desc: "Complete Stripe & WooCommerce automation with immutable EU archival.",
        features: [
          "500 automated e-invoices per month",
          "Stripe + WordPress/WooCommerce plugin + API",
          "Action-Required queue with 1-click Leitweg-ID fix",
          "8-yr (BEG IV) / 10-yr (FR) immutable EU archive",
          "Auto GoBD audit dossier + accountant auto-CC",
        ],
        cta: "Launch Business (€49/mo)",
        highlighted: true,
      },
      {
        tier: "agency",
        name: "Agency & API",
        price: "€129",
        period: "/ month",
        desc: "Designed for multi-client agencies, tax advisors, ERPs, and SaaS platforms.",
        features: [
          "2,500 automated e-invoices per month",
          "Multiple seller entities & official TypeScript SDK",
          "High-throughput REST validation API (300 req/min)",
          "Archived KoSIT & veraPDF compliance reports",
          "Priority EU compliance support + GDPR DPA",
        ],
        cta: "Launch Agency (€129/mo)",
        highlighted: false,
      },
    ],
  },
  de: {
    badgeEu: "100 % Hosting in Deutschland (EU-Central) · Zero-Retention-Prüfer",
    navValidator: "Prüfer",
    navCreate: "Erstellen",
    navBatch: "CSV-Stapel",
    navDashboard: "Dashboard",
    navSettings: "Einstellungen",
    navDocs: "API-Doku",
    navErrors: "Fehler-Hilfe",
    navSignIn: "Anmelden",
    heroTag: "E-Rechnungspflicht DE 2025–2027 · Frankreich Factur-X · Belgien Peppol",
    heroTitle: "EU-E-Rechnungen ohne Aufwand — für Stripe, WooCommerce & Buchhaltung",
    heroSubtitle:
      "Prüfen und lesen Sie ZUGFeRD-2.3-, Factur-X-1.07- und XRechnung-3.0.2-Dateien sofort ohne Datenspeicherung. Oder automatisieren Sie GoBD-konforme PDF/A-3- + XML-Rechnungen, VIES-USt-Prüfungen und DATEV-Exporte.",
    ctaCreate: "Kostenlos E-Rechnung erstellen",
    ctaDashboard: "Stripe- & Woo-Bridge testen",
    ctaQuiz: "Welches Format brauche ich?",
    dropzoneTitle: "ZUGFeRD-/Factur-X-PDF oder XRechnung-XML zum Prüfen hier ablegen",
    dropzoneHint: "Bis 10 MB · Unterstützt CII, UBL 2.1 und PDF/A-3b · Verarbeitung ausschließlich im RAM",
    privacyNote: "DSGVO-Zero-Retention-Garantie: Hochgeladene Belege werden nach der Prüfung sofort verworfen.",
    sampleLabel: "Sofort mit einer Musterrechnung testen:",
    validBanner: "Konforme EN-16931-E-Rechnung",
    invalidBanner: "Konformitätsfehler gefunden",
    scorePdfLabel: "PDF/A-3b-Archivcontainer",
    scoreXmlLabel: "XML-Struktur & Sicherheit",
    scoreRulesLabel: "EN 16931 & XRechnung-Regeln",
    tabVisual: "Lesbare Rechnung",
    tabDiagnostics: "Prüfprotokoll",
    tabXml: "XML-Strukturdaten",
    mandateHeading: "Aktuelle europäische B2B-E-Rechnungspflichten",
    mandates: [
      { country: "Deutschland", status: "Versand ab Jan. 2027", deadline: "Empfang seit Jan. 2025 Pflicht · Versand startet Jan. 2027", formats: "ZUGFeRD 2.3 & XRechnung 3.0.2" },
      { country: "Frankreich", status: "Empfang aktiv", deadline: "Empfang ab Sept. 2026 Pflicht · KMU-Versand Sept. 2027", formats: "Factur-X 1.07 (EN 16931)" },
      { country: "Belgien", status: "Jetzt Pflicht", deadline: "Vollständige Peppol-B2B-Pflicht seit 1. Jan. 2026", formats: "Peppol BIS Billing 3.0 (UBL)" },
      { country: "EU-Grenzüberschreitend", status: "EN-16931-Standard", deadline: "Reverse Charge (AE) & ViDA-vorbereitet", formats: "VIES-geprüft · § 19 UStG" },
    ],
    featuresHeading: "Entwickelt für echte Betriebsprüfungen — statt fehleranfälliger PDF-Hacks",
    featuresSubtitle:
      "Standard-PDFs aus Stripe oder WooCommerce enthalten keine strukturierte EN-16931-XML und erfüllen die E-Rechnungspflicht nicht. NormInvoice macht Ihren Checkout automatisch prüfungssicher.",
    features: [
      {
        title: "Automatische Stripe- & WooCommerce-Bridge",
        text: "Verarbeitet abgeschlossene Rechnungen, Gutschriften (Typ 381) und B2B-Bestellungen automatisch — inklusive Cent-genauer BT-114-Rundungskorrektur.",
      },
      {
        title: "Selbstprüfung vor dem Versand an Kunden",
        text: "Jede Rechnung durchläuft vor dem Versand EN-16931-, XRechnung- und PDF/A-3b-Prüfungen. Fehlt z. B. eine Leitweg-ID (BT-10), stoppt der Versand sicher zur 1-Klick-Korrektur.",
      },
      {
        title: "Ausfallsichere EU-VIES-USt-IdNr.-Prüfung",
        text: "Prüft europäische USt-IdNr. mit 7-Tage-Cache, Nachweis-ID und Länder-Circuit-Breaker, damit VIES-Ausfälle Ihre Rechnungsstellung nie blockieren.",
      },
      {
        title: "Revisionssicheres GoBD-Archiv (8 / 10 Jahre)",
        text: "Hosting ausschließlich in Deutschland mit S3 Object Lock, SHA-256-Hash-Kette und automatisch generierter GoBD-Verfahrensdokumentation.",
      },
      {
        title: "1-Klick DATEV-EXTF- & Frankreich-FEC-Export",
        text: "Exportieren Sie fertige DATEV-Buchungsstapel (SKR03/SKR04) für Ihren Steuerberater — oder wandeln Sie monatliche CSV-Listen als ZIP-Paket um.",
      },
      {
        title: "Ein Datenmodell für alle EU-Standards",
        text: "Erzeugen Sie ZUGFeRD 2.3, Factur-X 1.07, XRechnung 3.0.2 (CII & UBL) und Peppol BIS 3.0 über UI, REST-API oder offizielles TypeScript-SDK.",
      },
    ],
    pricingHeading: "Transparente Preise — ohne versteckte Beleggebühren",
    pricingSubtitle: "Abrechnung & weltweite Umsatzsteuer rechtssicher über unseren Merchant of Record Paddle.",
    plans: [
      {
        tier: "free",
        name: "Kostenloser Prüfer",
        price: "0 €",
        period: "/ dauerhaft",
        desc: "Ideal zum Prüfen eingehender E-Rechnungen und für gelegentliche Einzelbelege.",
        features: [
          "Unbegrenzter Zero-Retention-Prüfer & Viewer",
          "3 manuelle ZUGFeRD- / XRechnung-Exporte pro Monat",
          "Verständliche DE-, EN- & FR-Fehlererklärungen",
          "Direkte EPC-SEPA-GiroCode-QR-Vorschau",
        ],
        cta: "Kostenlos starten",
        highlighted: false,
      },
      {
        tier: "solo",
        name: "Solo Bridge",
        price: "19 €",
        period: "/ Monat",
        desc: "Für Selbstständige, Freelancer und Solo-SaaS-Gründer im DACH- & EU-Raum.",
        features: [
          "100 automatische E-Rechnungen / Monat",
          "Stripe-Auto-Bridge (Rechnungen & Stornos)",
          "CSV-Stapelkonverter -> PDF/A-3 + XML ZIP",
          "VIES-USt-Prüfung & Kleinunternehmer § 19 UStG",
          "1-Klick DATEV-EXTF- & FEC-Export",
        ],
        cta: "Solo starten (19 €/Mon.)",
        highlighted: false,
      },
      {
        tier: "business",
        name: "Business GoBD",
        price: "49 €",
        period: "/ Monat",
        badge: "Beliebteste Wahl",
        desc: "Vollautomatische Stripe- & WooCommerce-Anbindung mit GoBD-Archiv.",
        features: [
          "500 automatische E-Rechnungen / Monat",
          "Stripe + WooCommerce-Plugin + REST-API",
          "Reparatur-Warteschlange mit 1-Klick Leitweg-ID-Fix",
          "8 Jahre (BEG IV) / 10 Jahre unveränderbares EU-Archiv",
          "Auto-GoBD-Verfahrensdokumentation + Steuerberater-CC",
        ],
        cta: "Business starten (49 €/Mon.)",
        highlighted: true,
      },
      {
        tier: "agency",
        name: "Agentur & API",
        price: "129 €",
        period: "/ Monat",
        desc: "Für Agenturen, Kanzleien, ERP-Integratoren und wachsende SaaS-Teams.",
        features: [
          "2.500 automatische E-Rechnungen / Monat",
          "Mehrere Firmenprofile & offizielles TypeScript-SDK",
          "High-Throughput-Prüf-API (300 Anfragen/Min.)",
          "Archivierte KoSIT- & veraPDF-Prüfberichte",
          "Priorisierter EU-Compliance-Support + AVV",
        ],
        cta: "Agentur starten (129 €/Mon.)",
        highlighted: false,
      },
    ],
  },
  fr: {
    badgeEu: "Hébergé 100 % en Allemagne (UE) · Validateur public sans conservation",
    navValidator: "Validateur",
    navCreate: "Créer",
    navBatch: "Lot CSV",
    navDashboard: "Tableau de bord",
    navSettings: "Paramètres",
    navDocs: "Docs API",
    navErrors: "Guide Erreurs",
    navSignIn: "Connexion",
    heroTag: "France Réception Sept. 2026 / Émission 2027 · Allemagne ZUGFeRD · Belgique Peppol",
    heroTitle: "La facturation électronique UE simplifiée pour Stripe, WooCommerce et vos équipes",
    heroSubtitle:
      "Validez et visualisez vos factures Factur-X 1.07, ZUGFeRD 2.3 et XRechnung 3.0.2 instantanément sans aucun stockage. Ou automatisez vos PDF/A-3 + XML, contrôles TVA VIES, archivage légal et exports FEC/DATEV.",
    ctaCreate: "Créer une Factur-X gratuite",
    ctaDashboard: "Tester Stripe & Woo Bridge",
    ctaQuiz: "Quel format choisir ?",
    dropzoneTitle: "Déposez un PDF Factur-X / ZUGFeRD ou un XML XRechnung à contrôler",
    dropzoneHint: "Max 10 Mo · CII, UBL 2.1 et PDF/A-3b · Traitement exclusivement en mémoire vive",
    privacyNote: "Engagement RGPD Zéro-Rétention : vos factures sont effacées immédiatement après analyse.",
    sampleLabel: "Tester instantanément avec une facture modèle :",
    validBanner: "Facture électronique EN 16931 conforme",
    invalidBanner: "Anomalies de conformité détectées",
    scorePdfLabel: "Conteneur PDF/A-3b",
    scoreXmlLabel: "Syntaxe XML & Sécurité",
    scoreRulesLabel: "Règles EN 16931 & Nationales",
    tabVisual: "Facture lisible",
    tabDiagnostics: "Rapport de conformité",
    tabXml: "XML structuré",
    mandateHeading: "Calendrier des obligations B2B européennes",
    mandates: [
      { country: "France", status: "Réception active", deadline: "Réception obligatoire sept. 2026 · Émission PME sept. 2027", formats: "Factur-X 1.07 (EN 16931)" },
      { country: "Allemagne", status: "Émission janv. 2027", deadline: "Réception active janv. 2025 · Émission B2B janv. 2027", formats: "ZUGFeRD 2.3 & XRechnung 3.0.2" },
      { country: "Belgique", status: "Obligatoire", deadline: "Mandat Peppol B2B en vigueur depuis le 1er janv. 2026", formats: "Peppol BIS Billing 3.0 (UBL)" },
      { country: "Intra-UE", status: "Norme EN 16931", deadline: "Autoliquidation TVA (AE) & préparation ViDA", formats: "VIES vérifié · SIREN BT-30" },
    ],
    featuresHeading: "Conçu pour les vrais contrôles fiscaux européens — pas de simples PDF",
    featuresSubtitle:
      "Les PDF natifs de Stripe et WooCommerce ne contiennent pas de XML EN 16931 structuré. NormInvoice transforme votre facturation en un flux auditable et conforme.",
    features: [
      {
        title: "Passerelle automatique Stripe & WooCommerce",
        text: "Convertit chaque facture finalisée, avoir (code 381) et commande B2B en Factur-X / ZUGFeRD avec réconciliation automatique des arrondis au centime (BT-114).",
      },
      {
        title: "Double auto-validation avant envoi client",
        text: "Chaque facture est contrôlée selon EN 16931, XRechnung et PDF/A-3b avant l'envoi. Toute donnée manquante met le document en attente pour correction en 1 clic.",
      },
      {
        title: "Contrôle TVA VIES résilient",
        text: "Vérifie les numéros de TVA intracommunautaires avec cache 7 jours et coupe-circuit par pays pour ne jamais bloquer vos encaissements.",
      },
      {
        title: "Archivage immuable 10 ans (FR) / 8 ans (DE)",
        text: "Hébergement exclusif en Allemagne avec verrouillage S3 WORM, journal d'audit chaîné SHA-256 et piste d'audit documentée.",
      },
      {
        title: "Exports comptables FEC (FR) & DATEV (DE) en 1 clic",
        text: "Téléchargez un fichier FEC conforme DGFiP (PCG 411/706/44571) ou un lot DATEV EXTF — et convertissez vos CSV mensuels en archive ZIP.",
      },
      {
        title: "Un modèle canonique, tous les formats UE",
        text: "Générez Factur-X 1.07, ZUGFeRD 2.3, XRechnung 3.0.2 et Peppol BIS 3.0 depuis une seule interface, API REST ou SDK TypeScript.",
      },
    ],
    pricingHeading: "Tarifs clairs, sans frais cachés par facture",
    pricingSubtitle: "TVA européenne et facturation gérées automatiquement par notre partenaire Paddle.",
    plans: [
      {
        tier: "free",
        name: "Validateur Gratuit",
        price: "0 €",
        period: "/ à vie",
        desc: "Pour contrôler vos factures fournisseurs et créer vos premières Factur-X.",
        features: [
          "Validateur & lecteur zéro-rétention illimité",
          "3 factures Factur-X / ZUGFeRD / XRechnung par mois",
          "Explications d'erreurs claires en FR, DE et EN",
          "Aperçu QR SEPA EPC instantané",
        ],
        cta: "Créer gratuitement",
        highlighted: false,
      },
      {
        tier: "solo",
        name: "Solo Bridge",
        price: "19 €",
        period: "/ mois",
        desc: "Idéal pour freelances, consultants et fondateurs SaaS indépendants.",
        features: [
          "100 factures électroniques automatisées / mois",
          "Passerelle Stripe (factures + avoirs 381)",
          "Convertisseur CSV en lot -> ZIP PDF/A-3 + XML",
          "Contrôle TVA VIES & autoliquidation (AE)",
          "Exports FEC (FR) & DATEV (DE) en 1 clic",
        ],
        cta: "Choisir Solo (19 €/mois)",
        highlighted: false,
      },
      {
        tier: "business",
        name: "Business Archive",
        price: "49 €",
        period: "/ mois",
        badge: "Le plus populaire",
        desc: "Automatisation complète Stripe + WooCommerce avec archivage légal UE.",
        features: [
          "500 factures électroniques automatisées / mois",
          "Stripe + Plugin WooCommerce + API REST",
          "File de correction 1-clic avant envoi client",
          "Archivage immuable 10 ans (FR) / 8 ans (DE)",
          "Copie automatique expert-comptable + dossier audit",
        ],
        cta: "Lancer Business (49 €/mois)",
        highlighted: true,
      },
      {
        tier: "agency",
        name: "Agence & API",
        price: "129 €",
        period: "/ mois",
        desc: "Pour cabinets comptables, agences multi-clients, ERP et éditeurs SaaS.",
        features: [
          "2 500 factures électroniques automatisées / mois",
          "Profils vendeurs multiples & SDK TypeScript officiel",
          "API de validation haut débit (300 req/min)",
          "Archivage des rapports KoSIT & veraPDF",
          "Support conformité prioritaire + DPA RGPD",
        ],
        cta: "Lancer Agence (129 €/mois)",
        highlighted: false,
      },
    ],
  },
};

// ── Per-area UI translations (scalable: one map per surface, wired in its component). ──
export interface NavItemT {
  label: string;
  desc: string;
}
export interface NavStrings {
  product: string;
  solutions: string;
  countries: string;
  integrations: string;
  pricing: string;
  about: string;
  contact: string;
  login: string;
  signupFree: string;
  openDashboard: string;
  signOut: string;
  trust: string;
  productItems: NavItemT[];
  solutionItems: NavItemT[];
  countryItems: NavItemT[];
}

export const NAV_STRINGS: Record<AppLocale, NavStrings> = {
  en: {
    product: "Product",
    solutions: "Solutions",
    countries: "Countries",
    integrations: "Integrations",
    pricing: "Pricing",
    about: "About",
    contact: "Contact",
    login: "Log in",
    signupFree: "Sign Up Free",
    openDashboard: "Open Dashboard",
    signOut: "Sign out",
    trust: "Free plan available · 15-day free trial · Zero-retention public validator",
    productItems: [
      { label: "Features Overview", desc: "End-to-end e-invoicing workspace" },
      { label: "Free Dual Validator", desc: "Zero-retention ZUGFeRD, Factur-X & XRechnung check" },
      { label: "Format Finder", desc: "Find the right EU format for any customer" },
      { label: "Security & Trust", desc: "Encryption, audit chain & privacy controls" },
      { label: "API Documentation", desc: "REST API, webhooks & TypeScript SDK" },
      { label: "EN 16931 Error Reference", desc: "45+ plain-language validation rule guides" },
    ],
    solutionItems: [
      { label: "Small Businesses", desc: "Simple daily invoicing & EU readiness" },
      { label: "Finance Teams", desc: "Approvals, AR/AP, and audit visibility" },
      { label: "Accountants & Advisors", desc: "Clean DATEV/FEC handoffs & delegated access" },
      { label: "Partners & Developers", desc: "ERP, Peppol & compliance connectivity" },
    ],
    countryItems: [
      { label: "Germany", desc: "XRechnung 3.0.2 & ZUGFeRD 2.3" },
      { label: "Belgium", desc: "Peppol BIS Billing 3.0 (B2B Live)" },
      { label: "France", desc: "Factur-X 1.07 & Approved Platforms" },
      { label: "Poland", desc: "KSeF FA(3) & UPO Tracking" },
      { label: "All 13 European Markets →", desc: "Full compliance scope & status matrix" },
    ],
  },
  de: {
    product: "Produkt",
    solutions: "Lösungen",
    countries: "Länder",
    integrations: "Integrationen",
    pricing: "Preise",
    about: "Über uns",
    contact: "Kontakt",
    login: "Anmelden",
    signupFree: "Kostenlos starten",
    openDashboard: "Dashboard öffnen",
    signOut: "Abmelden",
    trust: "Kostenloser Tarif verfügbar · 15 Tage kostenlos testen · Validator ohne Datenspeicherung",
    productItems: [
      { label: "Funktionsübersicht", desc: "Durchgängiger E-Rechnungs-Workspace" },
      { label: "Kostenloser Dual-Validator", desc: "ZUGFeRD, Factur-X & XRechnung ohne Speicherung prüfen" },
      { label: "Format-Finder", desc: "Das richtige EU-Format für jeden Kunden" },
      { label: "Sicherheit & Vertrauen", desc: "Verschlüsselung, Audit-Kette & Datenschutz" },
      { label: "API-Dokumentation", desc: "REST-API, Webhooks & TypeScript-SDK" },
      { label: "EN-16931-Fehlerreferenz", desc: "45+ verständliche Validierungsregeln" },
    ],
    solutionItems: [
      { label: "Kleinunternehmen", desc: "Einfache tägliche Rechnungsstellung & EU-Bereitschaft" },
      { label: "Finanzteams", desc: "Freigaben, Debitoren/Kreditoren & Audit-Transparenz" },
      { label: "Steuerberater & Berater", desc: "Saubere DATEV/FEC-Übergaben & delegierter Zugriff" },
      { label: "Partner & Entwickler", desc: "ERP-, Peppol- & Compliance-Anbindung" },
    ],
    countryItems: [
      { label: "Deutschland", desc: "XRechnung 3.0.2 & ZUGFeRD 2.3" },
      { label: "Belgien", desc: "Peppol BIS Billing 3.0 (B2B live)" },
      { label: "Frankreich", desc: "Factur-X 1.07 & zugelassene Plattformen" },
      { label: "Polen", desc: "KSeF FA(3) & UPO-Verfolgung" },
      { label: "Alle 13 europäischen Märkte →", desc: "Vollständiger Compliance-Umfang & Statusmatrix" },
    ],
  },
  fr: {
    product: "Produit",
    solutions: "Solutions",
    countries: "Pays",
    integrations: "Intégrations",
    pricing: "Tarifs",
    about: "À propos",
    contact: "Contact",
    login: "Connexion",
    signupFree: "Inscription gratuite",
    openDashboard: "Ouvrir le tableau de bord",
    signOut: "Déconnexion",
    trust: "Offre gratuite disponible · Essai gratuit de 15 jours · Validateur public sans conservation",
    productItems: [
      { label: "Aperçu des fonctionnalités", desc: "Espace de facturation électronique de bout en bout" },
      { label: "Validateur double gratuit", desc: "Vérifiez ZUGFeRD, Factur-X & XRechnung sans conservation" },
      { label: "Recherche de format", desc: "Trouvez le bon format UE pour chaque client" },
      { label: "Sécurité & confiance", desc: "Chiffrement, chaîne d'audit & confidentialité" },
      { label: "Documentation API", desc: "API REST, webhooks & SDK TypeScript" },
      { label: "Référence des erreurs EN 16931", desc: "45+ guides de règles de validation clairs" },
    ],
    solutionItems: [
      { label: "Petites entreprises", desc: "Facturation quotidienne simple & conformité UE" },
      { label: "Équipes financières", desc: "Approbations, clients/fournisseurs & visibilité d'audit" },
      { label: "Comptables & conseillers", desc: "Transferts DATEV/FEC propres & accès délégué" },
      { label: "Partenaires & développeurs", desc: "Connectivité ERP, Peppol & conformité" },
    ],
    countryItems: [
      { label: "Allemagne", desc: "XRechnung 3.0.2 & ZUGFeRD 2.3" },
      { label: "Belgique", desc: "Peppol BIS Billing 3.0 (B2B en direct)" },
      { label: "France", desc: "Factur-X 1.07 & plateformes agréées" },
      { label: "Pologne", desc: "KSeF FA(3) & suivi UPO" },
      { label: "Les 13 marchés européens →", desc: "Périmètre de conformité complet & matrice de statut" },
    ],
  },
};

// ── Public footer translations ──
export interface FooterStrings {
  tagline: string;
  disclaimer: string;
  productHeading: string;
  productLinks: string[];
  solutionsHeading: string;
  solutionsLinks: string[];
  legalHeading: string;
  legalLinks: string[];
  cookieSettings: string;
  copyright: string; // %YEAR% is replaced at render time
  relatedEntity: string;
}

export const FOOTER_STRINGS: Record<AppLocale, FooterStrings> = {
  en: {
    tagline:
      "Subscription-based European e-invoicing and financial workflow software. Built for EN 16931, ZUGFeRD 2.3, Factur-X 1.07, XRechnung 3.0.2, Peppol BIS 3.0, and structured audit archiving.",
    disclaimer:
      "NormInvoice is commercial software and does not replace advice from a qualified tax advisor or lawyer.",
    productHeading: "Product",
    productLinks: [
      "Features Overview",
      "Countries & Standards",
      "Integrations",
      "Pricing",
      "Security & Trust",
      "Format Finder",
      "API Docs",
      "EN 16931 Error Guide",
    ],
    solutionsHeading: "Solutions & Company",
    solutionsLinks: [
      "For Small Businesses",
      "For Finance Teams",
      "For Accountants",
      "About NormInvoice",
      "Partners & Developers",
      "Help Center",
      "FAQ",
      "Contact Us",
    ],
    legalHeading: "Legal & Policies",
    legalLinks: [
      "Legal Notice",
      "Impressum (DE)",
      "Terms of Service",
      "Billing Policy",
      "Refund Policy",
      "Privacy Policy",
      "Cookie Policy",
      "DPA (GDPR)",
      "Subprocessors",
      "Acceptable Use",
      "Availability",
      "Data Retention",
      "AI Disclosure",
      "Accessibility",
      "Third-Party Terms",
      "Complaints",
      "IP & Brand",
      "Trust Center",
    ],
    cookieSettings: "Cookie Settings",
    copyright:
      "© %YEAR% NormInvoice — Product of Trend&Brand. All rights reserved. Proposed contracting entity: Trend&Brand LLC (Wyoming, USA).",
    relatedEntity: "Related group entity: TREND & BRAND (PRIVATE) LIMITED (Pakistan).",
  },
  de: {
    tagline:
      "Abonnementbasierte europäische E-Rechnungs- und Finanzworkflow-Software. Entwickelt für EN 16931, ZUGFeRD 2.3, Factur-X 1.07, XRechnung 3.0.2, Peppol BIS 3.0 und revisionssichere Archivierung.",
    disclaimer:
      "NormInvoice ist kommerzielle Software und ersetzt keine Beratung durch einen qualifizierten Steuerberater oder Rechtsanwalt.",
    productHeading: "Produkt",
    productLinks: [
      "Funktionsübersicht",
      "Länder & Standards",
      "Integrationen",
      "Preise",
      "Sicherheit & Vertrauen",
      "Format-Finder",
      "API-Doku",
      "EN-16931-Fehlerhilfe",
    ],
    solutionsHeading: "Lösungen & Unternehmen",
    solutionsLinks: [
      "Für Kleinunternehmen",
      "Für Finanzteams",
      "Für Steuerberater",
      "Über NormInvoice",
      "Partner & Entwickler",
      "Hilfecenter",
      "FAQ",
      "Kontakt",
    ],
    legalHeading: "Rechtliches & Richtlinien",
    legalLinks: [
      "Rechtliche Hinweise",
      "Impressum (DE)",
      "AGB",
      "Abrechnungsrichtlinie",
      "Widerruf & Erstattung",
      "Datenschutz",
      "Cookie-Richtlinie",
      "AVV (DSGVO)",
      "Unterauftragsverarbeiter",
      "Nutzungsbedingungen",
      "Verfügbarkeit",
      "Datenaufbewahrung",
      "KI-Transparenz",
      "Barrierefreiheit",
      "Drittanbieter-Bedingungen",
      "Beschwerden",
      "Geistiges Eigentum & Marke",
      "Trust-Center",
    ],
    cookieSettings: "Cookie-Einstellungen",
    copyright:
      "© %YEAR% NormInvoice — ein Produkt von Trend&Brand. Alle Rechte vorbehalten. Vorgesehene Vertragspartei: Trend&Brand LLC (Wyoming, USA).",
    relatedEntity: "Verbundenes Konzernunternehmen: TREND & BRAND (PRIVATE) LIMITED (Pakistan).",
  },
  fr: {
    tagline:
      "Logiciel européen de facturation électronique et de flux financiers par abonnement. Conçu pour EN 16931, ZUGFeRD 2.3, Factur-X 1.07, XRechnung 3.0.2, Peppol BIS 3.0 et l'archivage à valeur probante.",
    disclaimer:
      "NormInvoice est un logiciel commercial et ne remplace pas les conseils d'un expert-comptable ou d'un avocat qualifié.",
    productHeading: "Produit",
    productLinks: [
      "Aperçu des fonctionnalités",
      "Pays & normes",
      "Intégrations",
      "Tarifs",
      "Sécurité & confiance",
      "Recherche de format",
      "Docs API",
      "Guide des erreurs EN 16931",
    ],
    solutionsHeading: "Solutions & entreprise",
    solutionsLinks: [
      "Pour les petites entreprises",
      "Pour les équipes financières",
      "Pour les experts-comptables",
      "À propos de NormInvoice",
      "Partenaires & développeurs",
      "Centre d'aide",
      "FAQ",
      "Nous contacter",
    ],
    legalHeading: "Mentions légales & politiques",
    legalLinks: [
      "Mentions légales",
      "Impressum (DE)",
      "Conditions d'utilisation",
      "Politique de facturation",
      "Annulation & remboursement",
      "Politique de confidentialité",
      "Politique relative aux cookies",
      "DPA (RGPD)",
      "Sous-traitants",
      "Utilisation acceptable",
      "Disponibilité",
      "Conservation des données",
      "Transparence IA",
      "Accessibilité",
      "Conditions des tiers",
      "Réclamations",
      "PI & marque",
      "Centre de confiance",
    ],
    cookieSettings: "Paramètres des cookies",
    copyright:
      "© %YEAR% NormInvoice — un produit de Trend&Brand. Tous droits réservés. Entité contractante proposée : Trend&Brand LLC (Wyoming, USA).",
    relatedEntity: "Entité de groupe liée : TREND & BRAND (PRIVATE) LIMITED (Pakistan).",
  },
};

// ── Homepage body translations ──
export interface HomeStrings {
  heroBadge: string;
  heroTitleA: string;
  heroTitleB: string;
  heroSubtitle: string;
  ctaSignup: string;
  ctaTrial: string;
  ctaExplore: string;
  trust: string[];
  valEyebrow: string;
  valTitle: string;
  valSubtitle: string;
  valFormatLink: string;
  lifeEyebrow: string;
  lifeTitle: string;
  lifeSubtitle: string;
  lifeSteps: Array<{ title: string; text: string }>;
  cEyebrow: string;
  cTitle: string;
  cSubtitle: string;
  cViewAll: string;
  badgeAvailable: string;
  badgePartner: string;
  badgePlanned: string;
  solEyebrow: string;
  solTitle: string;
  solCards: Array<{ title: string; text: string }>;
  secBadge: string;
  secTitle: string;
  secSubtitle: string;
  secBullets: string[];
  secBtnSecurity: string;
  secBtnIntegrations: string;
  secBtnDocs: string;
  faqTitle: string;
  faqSubtitle: string;
  faqReadAll: string;
  faqs: Array<{ q: string; a: string }>;
}

export const HOME_STRINGS: Record<AppLocale, HomeStrings> = {
  en: {
    heroBadge: "NormInvoice — Product of Trend&Brand · Free plan + 15-day free trial",
    heroTitleA: "Stay Compliant Across Europe.",
    heroTitleB: "Automate Your E-Invoicing.",
    heroSubtitle:
      "Create, validate, send, receive, and archive EN 16931 electronic invoices (ZUGFeRD 2.3, Factur-X 1.07, XRechnung 3.0.2 & Peppol BIS 3.0) in one clear, multi-tenant SaaS workspace.",
    ctaSignup: "Sign Up Free",
    ctaTrial: "Start 15-Day Free Trial",
    ctaExplore: "Explore the Platform",
    trust: ["Free plan available ($0/mo)", "15-day trial · No credit card required", "Solo plan $39/month"],
    valEyebrow: "Try Immediately · No Account Required",
    valTitle: "Zero-Retention Dual E-Invoice Validator & Viewer",
    valSubtitle:
      "Drop any ZUGFeRD 2.3, Factur-X 1.07, or XRechnung 3.0.2 XML/PDF — inspected strictly in memory and wiped immediately after returning your report.",
    valFormatLink: "Need help choosing a format? Format Finder →",
    lifeEyebrow: "One Workspace, Complete Lifecycle",
    lifeTitle: "E-Invoicing Without the Operational Complexity",
    lifeSubtitle:
      "Built around one shared canonical EN 16931 engine with country-aware rules — so outgoing invoices, incoming supplier bills, payments, and audit logs stay cleanly synchronized.",
    lifeSteps: [
      { title: "Create", text: "Build structured invoices with saved customers, product rates, tax rules, credit notes, and recurring schedules." },
      { title: "Validate", text: "Run deterministic EN 16931, ZUGFeRD 2.3, Factur-X 1.07 & XRechnung checks with plain-language diagnostics before sending." },
      { title: "Exchange", text: "Deliver hybrid PDF/A-3b + XML documents through email, webhook bridges, or configured network partners." },
      { title: "Track & Archive", text: "Keep validation, delivery, payment, and GoBD SHA-256 hash-chained archival statuses strictly distinct and auditable." },
      { title: "Collaborate", text: "Review incoming supplier bills, approve exceptions, and export clean DATEV EXTF or French FEC ledgers for your accountant." },
    ],
    cEyebrow: "13 European Markets · Honest Status Labels",
    cTitle: "Country-Aware Rules, Never Overpromised",
    cSubtitle:
      "Every market clearly distinguishes what is live today in the core workspace versus partner-operated gateways or planned roadmap modules.",
    cViewAll: "View All 13 Countries",
    badgeAvailable: "Available",
    badgePartner: "Partner-Operated",
    badgePlanned: "Planned",
    solEyebrow: "Built for Every Finance Role",
    solTitle: "Tailored Workflows for Growing Teams",
    solCards: [
      { title: "Small Businesses & Solo Founders", text: "Create EN 16931 invoices in minutes, manage customers & products, and keep track of paid vs. overdue bills." },
      { title: "Finance & Operations Teams", text: "Combine outgoing billing, incoming supplier approvals, duplicate checks, partial payments, and automation rules." },
      { title: "Accountants & Tax Advisors", text: "Consent-gated multi-client portal with 1-click DATEV EXTF, French FEC, GoBD audit dossiers, and hash-chain proofs." },
      { title: "Developers & Integration Partners", text: "Signed Stripe & WooCommerce webhooks, Bearer API keys, REST validation API, and zero-dependency TypeScript SDK." },
    ],
    secBadge: "Security, Privacy & Honest Architecture",
    secTitle: "Engineered for Real Audits — Not Marketing Buzzwords",
    secSubtitle:
      "We publish only security and compliance controls actually implemented in code — never fabricated ISO badges, fake customer logos, or unverified uptime promises.",
    secBullets: [
      "Strict multi-tenant organization isolation on every database query and API endpoint.",
      "Per-user random-salt scrypt password hashing, HMAC-SHA256 sessions & AES-256-GCM webhook secret encryption.",
      "Tamper-evident SHA-256 hash-chained GoBD audit log with one-click chain verification.",
      "Self-hosted web fonts, XXE/DTD XML attack rejection, CSRF origin blocking & OWASP CSP headers.",
      "Signed Stripe & WooCommerce bridges plus WordPress HPOS-compatible WooCommerce plugin.",
    ],
    secBtnSecurity: "Security & Trust Details",
    secBtnIntegrations: "Explore Integrations",
    secBtnDocs: "API Docs",
    faqTitle: "Frequently Asked Questions",
    faqSubtitle: "Straight answers on plans, country support, and compliance boundaries.",
    faqReadAll: "Read all FAQs →",
    faqs: [
      { q: "Is NormInvoice free to try?", a: "Yes. You can use our zero-retention public validator without an account, sign up on the ongoing Free plan ($0/month), or evaluate the full platform with a real 15-day free trial — no credit card required." },
      { q: "Does a passed validation guarantee tax-authority acceptance?", a: "No. Validation checks evaluate your invoice against supported technical standards (EN 16931, BR-DE-*, BR-FR-*). Legal tax treatment and external gateway acceptance depend on your transaction and recipient." },
      { q: "Which European countries are currently supported?", a: "Core EN 16931 workflows (Germany ZUGFeRD/XRechnung, France Factur-X, Belgium/Netherlands/Austria Peppol BIS 3.0) are live in the workspace, while national clearance gateways (KSeF, SdI, PDP, RO e-Factura) are transparently labeled as Partner-Operated or Planned." },
      { q: "Can I cancel my paid subscription online?", a: "Yes. Workspace owners can switch plans or cancel upcoming renewal directly in Settings > Billing at any time, with zero hidden fees." },
    ],
  },
  de: {
    heroBadge: "NormInvoice — ein Produkt von Trend&Brand · Kostenloser Tarif + 15 Tage gratis testen",
    heroTitleA: "Europaweit rechtskonform bleiben.",
    heroTitleB: "E-Rechnungen automatisieren.",
    heroSubtitle:
      "Erstellen, prüfen, senden, empfangen und archivieren Sie EN-16931-E-Rechnungen (ZUGFeRD 2.3, Factur-X 1.07, XRechnung 3.0.2 & Peppol BIS 3.0) in einem übersichtlichen, mandantenfähigen SaaS-Workspace.",
    ctaSignup: "Kostenlos starten",
    ctaTrial: "15 Tage gratis testen",
    ctaExplore: "Plattform entdecken",
    trust: ["Kostenloser Tarif (0 €/Mon.)", "15-Tage-Test · Keine Kreditkarte nötig", "Solo-Tarif 39 $/Monat"],
    valEyebrow: "Sofort testen · Kein Konto erforderlich",
    valTitle: "Dual-Validator & Viewer ohne Datenspeicherung",
    valSubtitle:
      "Legen Sie eine beliebige ZUGFeRD-2.3-, Factur-X-1.07- oder XRechnung-3.0.2-Datei (XML/PDF) ab — die Prüfung erfolgt ausschließlich im Arbeitsspeicher und wird sofort nach dem Bericht verworfen.",
    valFormatLink: "Unsicher beim Format? Zum Format-Finder →",
    lifeEyebrow: "Ein Workspace, der komplette Lebenszyklus",
    lifeTitle: "E-Rechnung ohne operativen Mehraufwand",
    lifeSubtitle:
      "Aufgebaut auf einer gemeinsamen kanonischen EN-16931-Engine mit länderspezifischen Regeln — so bleiben ausgehende Rechnungen, eingehende Lieferantenbelege, Zahlungen und Audit-Logs sauber synchronisiert.",
    lifeSteps: [
      { title: "Erstellen", text: "Strukturierte Rechnungen mit gespeicherten Kunden, Produktpreisen, Steuerregeln, Gutschriften und wiederkehrenden Zeitplänen anlegen." },
      { title: "Prüfen", text: "Deterministische EN-16931-, ZUGFeRD-2.3-, Factur-X-1.07- & XRechnung-Prüfungen mit verständlichen Diagnosen vor dem Versand." },
      { title: "Austauschen", text: "Hybride PDF/A-3b- + XML-Dokumente per E-Mail, Webhook-Bridges oder konfigurierten Netzwerkpartnern zustellen." },
      { title: "Verfolgen & Archivieren", text: "Prüf-, Zustell-, Zahlungs- und GoBD-SHA-256-hashverkettete Archivstatus strikt getrennt und revisionssicher halten." },
      { title: "Zusammenarbeiten", text: "Eingehende Lieferantenrechnungen prüfen, Ausnahmen freigeben und saubere DATEV-EXTF- oder FEC-Dateien für Ihren Steuerberater exportieren." },
    ],
    cEyebrow: "13 europäische Märkte · Ehrliche Statuskennzeichnung",
    cTitle: "Länderspezifische Regeln, nie zu viel versprochen",
    cSubtitle:
      "Jeder Markt unterscheidet klar, was im Kern-Workspace heute live ist, von partnerbetriebenen Gateways oder geplanten Roadmap-Modulen.",
    cViewAll: "Alle 13 Länder ansehen",
    badgeAvailable: "Verfügbar",
    badgePartner: "Partnerbetrieben",
    badgePlanned: "Geplant",
    solEyebrow: "Für jede Finanzrolle gebaut",
    solTitle: "Maßgeschneiderte Workflows für wachsende Teams",
    solCards: [
      { title: "Kleinunternehmen & Solo-Gründer", text: "EN-16931-Rechnungen in Minuten erstellen, Kunden & Produkte verwalten und bezahlte vs. überfällige Belege im Blick behalten." },
      { title: "Finanz- & Operations-Teams", text: "Ausgehende Abrechnung, eingehende Lieferantenfreigaben, Dublettenprüfung, Teilzahlungen und Automatisierungsregeln kombinieren." },
      { title: "Steuerberater & Berater", text: "Einwilligungsgesteuertes Mehrmandanten-Portal mit 1-Klick-DATEV-EXTF, FEC, GoBD-Audit-Dossiers und Hash-Ketten-Nachweisen." },
      { title: "Entwickler & Integrationspartner", text: "Signierte Stripe- & WooCommerce-Webhooks, Bearer-API-Keys, REST-Prüf-API und abhängigkeitsfreies TypeScript-SDK." },
    ],
    secBadge: "Sicherheit, Datenschutz & ehrliche Architektur",
    secTitle: "Für echte Betriebsprüfungen gebaut — keine Marketing-Floskeln",
    secSubtitle:
      "Wir veröffentlichen nur Sicherheits- und Compliance-Kontrollen, die tatsächlich im Code umgesetzt sind — keine erfundenen ISO-Siegel, Fake-Kundenlogos oder unbelegten Verfügbarkeitsversprechen.",
    secBullets: [
      "Strikte mandantengetrennte Isolierung bei jeder Datenbankabfrage und jedem API-Endpunkt.",
      "Scrypt-Passwort-Hashing mit zufälligem Salt pro Nutzer, HMAC-SHA256-Sessions & AES-256-GCM-Verschlüsselung der Webhook-Secrets.",
      "Manipulationssicheres SHA-256-hashverkettetes GoBD-Audit-Log mit 1-Klick-Kettenprüfung.",
      "Selbstgehostete Web-Fonts, Abwehr von XXE-/DTD-XML-Angriffen, CSRF-Origin-Blockierung & OWASP-CSP-Header.",
      "Signierte Stripe- & WooCommerce-Bridges plus WordPress-HPOS-kompatibles WooCommerce-Plugin.",
    ],
    secBtnSecurity: "Sicherheit & Vertrauen im Detail",
    secBtnIntegrations: "Integrationen entdecken",
    secBtnDocs: "API-Doku",
    faqTitle: "Häufig gestellte Fragen",
    faqSubtitle: "Klare Antworten zu Tarifen, Länderunterstützung und Compliance-Grenzen.",
    faqReadAll: "Alle FAQs lesen →",
    faqs: [
      { q: "Kann ich NormInvoice kostenlos testen?", a: "Ja. Nutzen Sie den öffentlichen Validator ohne Datenspeicherung und ohne Konto, registrieren Sie sich im dauerhaften Free-Tarif (0 $/Monat) oder testen Sie die komplette Plattform mit einem echten 15-tägigen Gratis-Test — ohne Kreditkarte." },
      { q: "Garantiert eine bestandene Prüfung die Anerkennung durch die Finanzbehörde?", a: "Nein. Die Prüfungen bewerten Ihre Rechnung anhand unterstützter technischer Standards (EN 16931, BR-DE-*, BR-FR-*). Die steuerliche Behandlung und die Annahme durch externe Gateways hängen von Ihrer Transaktion und dem Empfänger ab." },
      { q: "Welche europäischen Länder werden derzeit unterstützt?", a: "Kern-EN-16931-Workflows (Deutschland ZUGFeRD/XRechnung, Frankreich Factur-X, Belgien/Niederlande/Österreich Peppol BIS 3.0) sind im Workspace live, während nationale Clearing-Gateways (KSeF, SdI, PDP, RO e-Factura) transparent als partnerbetrieben oder geplant gekennzeichnet sind." },
      { q: "Kann ich mein kostenpflichtiges Abo online kündigen?", a: "Ja. Workspace-Inhaber können Tarife jederzeit direkt unter Einstellungen > Abrechnung wechseln oder die nächste Verlängerung kündigen — ohne versteckte Gebühren." },
    ],
  },
  fr: {
    heroBadge: "NormInvoice — un produit de Trend&Brand · Offre gratuite + essai gratuit de 15 jours",
    heroTitleA: "Restez conforme dans toute l'Europe.",
    heroTitleB: "Automatisez votre facturation électronique.",
    heroSubtitle:
      "Créez, validez, envoyez, recevez et archivez vos factures électroniques EN 16931 (ZUGFeRD 2.3, Factur-X 1.07, XRechnung 3.0.2 & Peppol BIS 3.0) dans un espace SaaS clair et multi-locataire.",
    ctaSignup: "Inscription gratuite",
    ctaTrial: "Démarrer l'essai de 15 jours",
    ctaExplore: "Découvrir la plateforme",
    trust: ["Offre gratuite disponible (0 $/mois)", "Essai de 15 jours · Sans carte bancaire", "Offre Solo 39 $/mois"],
    valEyebrow: "Essai immédiat · Sans compte requis",
    valTitle: "Validateur et visionneuse double sans conservation",
    valSubtitle:
      "Déposez n'importe quel fichier ZUGFeRD 2.3, Factur-X 1.07 ou XRechnung 3.0.2 (XML/PDF) — analysé strictement en mémoire et effacé immédiatement après le rapport.",
    valFormatLink: "Besoin d'aide pour choisir un format ? Recherche de format →",
    lifeEyebrow: "Un espace, un cycle de vie complet",
    lifeTitle: "La facturation électronique sans la complexité opérationnelle",
    lifeSubtitle:
      "Construit autour d'un moteur canonique EN 16931 partagé avec des règles par pays — vos factures émises, factures fournisseurs reçues, paiements et journaux d'audit restent parfaitement synchronisés.",
    lifeSteps: [
      { title: "Créer", text: "Composez des factures structurées avec clients enregistrés, tarifs produits, règles de TVA, avoirs et échéanciers récurrents." },
      { title: "Valider", text: "Lancez des contrôles déterministes EN 16931, ZUGFeRD 2.3, Factur-X 1.07 & XRechnung avec des diagnostics clairs avant l'envoi." },
      { title: "Échanger", text: "Transmettez des documents hybrides PDF/A-3b + XML par e-mail, passerelles webhook ou partenaires réseau configurés." },
      { title: "Suivre & archiver", text: "Gardez les statuts de validation, livraison, paiement et archivage GoBD chaîné SHA-256 strictement distincts et auditables." },
      { title: "Collaborer", text: "Examinez les factures fournisseurs, approuvez les exceptions et exportez des fichiers FEC (FR) ou DATEV propres pour votre comptable." },
    ],
    cEyebrow: "13 marchés européens · Statuts honnêtes",
    cTitle: "Des règles par pays, sans surpromesse",
    cSubtitle:
      "Chaque marché distingue clairement ce qui est actif aujourd'hui dans l'espace principal des passerelles opérées par des partenaires ou des modules prévus.",
    cViewAll: "Voir les 13 pays",
    badgeAvailable: "Disponible",
    badgePartner: "Opéré par un partenaire",
    badgePlanned: "Prévu",
    solEyebrow: "Conçu pour chaque rôle financier",
    solTitle: "Des flux sur mesure pour les équipes en croissance",
    solCards: [
      { title: "Petites entreprises & fondateurs solo", text: "Créez des factures EN 16931 en quelques minutes, gérez clients & produits et suivez les factures payées ou en retard." },
      { title: "Équipes finance & opérations", text: "Combinez facturation émise, approbations fournisseurs, détection de doublons, paiements partiels et règles d'automatisation." },
      { title: "Experts-comptables & conseillers", text: "Portail multi-clients avec consentement, export DATEV EXTF, FEC, dossiers d'audit GoBD et preuves de chaîne de hachage en 1 clic." },
      { title: "Développeurs & partenaires d'intégration", text: "Webhooks Stripe & WooCommerce signés, clés API Bearer, API de validation REST et SDK TypeScript sans dépendance." },
    ],
    secBadge: "Sécurité, confidentialité & architecture honnête",
    secTitle: "Conçu pour de vrais audits — pas pour des slogans marketing",
    secSubtitle:
      "Nous publions uniquement les contrôles de sécurité et de conformité réellement implémentés dans le code — jamais de faux badges ISO, de faux logos clients ni de promesses de disponibilité non vérifiées.",
    secBullets: [
      "Isolation multi-locataire stricte sur chaque requête base de données et chaque endpoint API.",
      "Hachage de mot de passe scrypt avec sel aléatoire par utilisateur, sessions HMAC-SHA256 & chiffrement AES-256-GCM des secrets webhook.",
      "Journal d'audit GoBD chaîné SHA-256 infalsifiable avec vérification de chaîne en un clic.",
      "Polices web auto-hébergées, rejet des attaques XML XXE/DTD, blocage d'origine CSRF & en-têtes CSP OWASP.",
      "Passerelles Stripe & WooCommerce signées plus plugin WooCommerce compatible WordPress HPOS.",
    ],
    secBtnSecurity: "Détails sécurité & confiance",
    secBtnIntegrations: "Découvrir les intégrations",
    secBtnDocs: "Docs API",
    faqTitle: "Questions fréquentes",
    faqSubtitle: "Des réponses claires sur les offres, les pays pris en charge et les limites de conformité.",
    faqReadAll: "Lire toutes les FAQ →",
    faqs: [
      { q: "Puis-je essayer NormInvoice gratuitement ?", a: "Oui. Utilisez notre validateur public sans conservation ni compte, inscrivez-vous à l'offre Free permanente (0 $/mois) ou évaluez la plateforme complète avec un véritable essai gratuit de 15 jours — sans carte bancaire." },
      { q: "Une validation réussie garantit-elle l'acceptation par l'administration fiscale ?", a: "Non. Les contrôles évaluent votre facture au regard des normes techniques prises en charge (EN 16931, BR-DE-*, BR-FR-*). Le traitement fiscal légal et l'acceptation par les passerelles externes dépendent de votre transaction et du destinataire." },
      { q: "Quels pays européens sont actuellement pris en charge ?", a: "Les flux EN 16931 de base (Allemagne ZUGFeRD/XRechnung, France Factur-X, Belgique/Pays-Bas/Autriche Peppol BIS 3.0) sont actifs dans l'espace, tandis que les passerelles de clearance nationales (KSeF, SdI, PDP, RO e-Factura) sont clairement étiquetées comme opérées par un partenaire ou prévues." },
      { q: "Puis-je annuler mon abonnement payant en ligne ?", a: "Oui. Les propriétaires d'espace peuvent changer d'offre ou annuler le renouvellement à venir directement dans Paramètres > Facturation à tout moment, sans frais cachés." },
    ],
  },
};
