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
    trust: ["Free plan available (€0/mo)", "15-day trial · No credit card required", "Starter plan €12/month"],
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
    trust: ["Kostenloser Tarif (0 €/Mon.)", "15-Tage-Test · Keine Kreditkarte nötig", "Starter-Tarif 12 €/Monat"],
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
    trust: ["Offre gratuite disponible (0 €/mois)", "Essai de 15 jours · Sans carte bancaire", "Offre Starter 12 €/mois"],
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

// ── Authenticated app shell (sidebar + topbar) translations ──
export interface AppStrings {
  search: string;
  copilot: string;
  navDashboard: string;
  navInvoices: string;
  navAllInvoices: string;
  navCreateInvoice: string;
  navRecurring: string;
  navInbox: string;
  navBatch: string;
  navCustomers: string;
  navProducts: string;
  navPayments: string;
  navReports: string;
  navAnalytics: string;
  navExports: string;
  navCompliance: string;
  navAutomations: string;
  navAccountant: string;
  navSettings: string;
  navSuperAdmin: string;
  upgradeTo: string;
  upgradeBullets: string[];
  upgradeNow: string;
  planSuffix: string;
  finalizedThisMonth: string;
  hashChained: string;
  loadingWorkspace: string;
  signOut: string;
  welcomeBack: (name: string) => string;
  orgSubtitle: string;
  freeTrialActive: string;
  daysLeftShort: (n: number) => string;
  upgradeToSolo: string;
  workspaceActivity: string;
  itemsCount: (n: number) => string;
  allClear: string;
  helpCenter: string;
  menuWorkspaceSettings: string;
  menuPlanBilling: string;
  menuSuperAdmin: string;
  planName: (tier: string) => string;
}

export const APP_STRINGS: Record<AppLocale, AppStrings> = {
  en: {
    search: "Search…",
    copilot: "Compliance Copilot",
    navDashboard: "Dashboard",
    navInvoices: "Invoices",
    navAllInvoices: "All Invoices",
    navCreateInvoice: "Create Invoice",
    navRecurring: "Recurring Invoices",
    navInbox: "Incoming Inbox",
    navBatch: "Batch CSV",
    navCustomers: "Customers",
    navProducts: "Products & Services",
    navPayments: "Payments",
    navReports: "Reports",
    navAnalytics: "Analytics & VAT",
    navExports: "Exports & GoBD Audit",
    navCompliance: "Compliance (13 EU)",
    navAutomations: "Automations",
    navAccountant: "Accountant Portal",
    navSettings: "Settings",
    navSuperAdmin: "Super Admin",
    upgradeTo: "Upgrade to",
    upgradeBullets: ["150 e-invoices / month", "Recurring & DATEV / FEC", "€29/month · Cancel anytime"],
    upgradeNow: "Upgrade Now",
    planSuffix: "plan",
    finalizedThisMonth: "Finalized e-invoices this month",
    hashChained: "GoBD SHA-256 hash-chained",
    loadingWorkspace: "Loading secure workspace…",
    signOut: "Sign out",
    welcomeBack: (name) => `Welcome back, ${name}`,
    orgSubtitle: "Here's what's happening with your business today.",
    freeTrialActive: "Free Trial Active",
    daysLeftShort: (n) => `${n} day${n === 1 ? "" : "s"} left`,
    upgradeToSolo: "Upgrade to Solo",
    workspaceActivity: "Workspace Activity",
    itemsCount: (n) => `${n} items`,
    allClear: "All clear — no pending alerts.",
    helpCenter: "Help Center",
    menuWorkspaceSettings: "Workspace Settings",
    menuPlanBilling: "Plan & Billing",
    menuSuperAdmin: "Super Admin Panel",
    planName: (tier) => (tier === "free" ? "Free" : tier.charAt(0).toUpperCase() + tier.slice(1)),
  },
  de: {
    search: "Suchen…",
    copilot: "Compliance-Copilot",
    navDashboard: "Dashboard",
    navInvoices: "Rechnungen",
    navAllInvoices: "Alle Rechnungen",
    navCreateInvoice: "Rechnung erstellen",
    navRecurring: "Wiederkehrende Rechnungen",
    navInbox: "Eingangspostfach",
    navBatch: "CSV-Stapel",
    navCustomers: "Kunden",
    navProducts: "Produkte & Leistungen",
    navPayments: "Zahlungen",
    navReports: "Berichte",
    navAnalytics: "Analysen & USt.",
    navExports: "Exporte & GoBD-Audit",
    navCompliance: "Compliance (13 EU)",
    navAutomations: "Automatisierungen",
    navAccountant: "Steuerberater-Portal",
    navSettings: "Einstellungen",
    navSuperAdmin: "Super-Admin",
    upgradeTo: "Upgrade auf",
    upgradeBullets: ["150 E-Rechnungen / Monat", "Wiederkehrend & DATEV / FEC", "39 $/Monat · jederzeit kündbar"],
    upgradeNow: "Jetzt upgraden",
    planSuffix: "Tarif",
    finalizedThisMonth: "Finalisierte E-Rechnungen diesen Monat",
    hashChained: "GoBD SHA-256-hashverkettet",
    loadingWorkspace: "Sicherer Workspace wird geladen…",
    signOut: "Abmelden",
    welcomeBack: (name) => `Willkommen zurück, ${name}`,
    orgSubtitle: "Das passiert heute in Ihrem Unternehmen.",
    freeTrialActive: "Testphase aktiv",
    daysLeftShort: (n) => `noch ${n} Tag${n === 1 ? "" : "e"}`,
    upgradeToSolo: "Upgrade auf Solo",
    workspaceActivity: "Workspace-Aktivität",
    itemsCount: (n) => `${n} Einträge`,
    allClear: "Alles erledigt — keine offenen Hinweise.",
    helpCenter: "Hilfecenter",
    menuWorkspaceSettings: "Workspace-Einstellungen",
    menuPlanBilling: "Tarif & Abrechnung",
    menuSuperAdmin: "Super-Admin-Panel",
    planName: (tier) => (tier === "free" ? "Free" : tier.charAt(0).toUpperCase() + tier.slice(1)),
  },
  fr: {
    search: "Rechercher…",
    copilot: "Copilote conformité",
    navDashboard: "Tableau de bord",
    navInvoices: "Factures",
    navAllInvoices: "Toutes les factures",
    navCreateInvoice: "Créer une facture",
    navRecurring: "Factures récurrentes",
    navInbox: "Boîte de réception",
    navBatch: "Lot CSV",
    navCustomers: "Clients",
    navProducts: "Produits & services",
    navPayments: "Paiements",
    navReports: "Rapports",
    navAnalytics: "Analyses & TVA",
    navExports: "Exports & audit GoBD",
    navCompliance: "Conformité (13 UE)",
    navAutomations: "Automatisations",
    navAccountant: "Portail comptable",
    navSettings: "Paramètres",
    navSuperAdmin: "Super Admin",
    upgradeTo: "Passer à",
    upgradeBullets: ["150 factures / mois", "Récurrent & DATEV / FEC", "39 $/mois · annulable à tout moment"],
    upgradeNow: "Mettre à niveau",
    planSuffix: "offre",
    finalizedThisMonth: "Factures finalisées ce mois-ci",
    hashChained: "GoBD chaîné SHA-256",
    loadingWorkspace: "Chargement de l'espace sécurisé…",
    signOut: "Déconnexion",
    welcomeBack: (name) => `Bon retour, ${name}`,
    orgSubtitle: "Voici ce qui se passe dans votre entreprise aujourd'hui.",
    freeTrialActive: "Essai gratuit actif",
    daysLeftShort: (n) => `${n} jour${n === 1 ? "" : "s"} restant${n === 1 ? "" : "s"}`,
    upgradeToSolo: "Passer à Solo",
    workspaceActivity: "Activité de l'espace",
    itemsCount: (n) => `${n} éléments`,
    allClear: "Tout est en ordre — aucune alerte en attente.",
    helpCenter: "Centre d'aide",
    menuWorkspaceSettings: "Paramètres de l'espace",
    menuPlanBilling: "Offre & facturation",
    menuSuperAdmin: "Panneau Super Admin",
    planName: (tier) => (tier === "free" ? "Free" : tier.charAt(0).toUpperCase() + tier.slice(1)),
  },
};

// ── Dashboard page translations ──
export interface DashboardStrings {
  kpiTotal: string;
  kpiSent: string;
  kpiPaid: string;
  kpiOverdue: string;
  kpiTotalHint: (money: string) => string;
  kpiSentHint: (drafts: number, customers: number) => string;
  kpiPaidHint: string;
  kpiOverdueDue: string;
  kpiOverdueClear: string;
  attentionTitle: (n: number) => string;
  attentionDesc: string;
  fixNow: string;
  trendTitle: string;
  trendDesc: string;
  tfLast: (days: number) => string;
  legendCreated: string;
  legendSent: string;
  legendPaid: string;
  statusTitle: string;
  statusDesc: string;
  statusPaid: string;
  statusSent: string;
  statusDraft: string;
  statusOverdue: string;
  invoicesWord: string;
  yourPlan: string;
  freeTrial: string;
  planWord: string;
  daysRemaining: (n: number) => string;
  invoicesUsed: (used: number, limit: number) => string;
  upToInvoices: (limit: number) => string;
  enGoBD: string;
  activeSub: string;
  noCard: string;
  manageSub: string;
  upgradeSoloPrice: string;
  recentTitle: string;
  recentDesc: string;
  viewAll: string;
  thInvoiceNo: string;
  thCustomer: string;
  thDate: string;
  thAmount: string;
  thStatus: string;
  thView: string;
  emptyTitle: string;
  emptyText: string;
  createFirst: string;
  quickActions: string;
  qaCreate: string;
  qaInbox: string;
  qaCustomer: string;
  qaProduct: string;
  getStarted: (done: number, total: number) => string;
  testIntegrations: string;
  testIntegrationsDesc: string;
  testStripe: string;
  testWoo: string;
  testShopify: string;
  toastOk: (provider: string, num: string, status: string) => string;
  toastFail: string;
  promoTitle: string;
  promoText: string;
  promoBullets: string[];
  promoCta: string;
}

export const DASHBOARD_STRINGS: Record<AppLocale, DashboardStrings> = {
  en: {
    kpiTotal: "Total Invoices",
    kpiSent: "Sent",
    kpiPaid: "Paid",
    kpiOverdue: "Overdue",
    kpiTotalHint: (money) => `${money} invoiced this mo.`,
    kpiSentHint: (drafts, customers) => `${drafts} draft · ${customers} customers`,
    kpiPaidHint: "Settled & recorded",
    kpiOverdueDue: "Past due date (BT-9)",
    kpiOverdueClear: "All receivables current",
    attentionTitle: (n) => `Invoices That Need Attention (${n})`,
    attentionDesc: "Halted before delivery due to missing mandatory EN 16931 / XRechnung fields. Open to fix in 1 click.",
    fixNow: "Fix now",
    trendTitle: "Invoice Trend",
    trendDesc: "Invoices created, sent, and paid over time.",
    tfLast: (days) => `Last ${days} Days`,
    legendCreated: "Created",
    legendSent: "Sent",
    legendPaid: "Paid",
    statusTitle: "Invoice Status",
    statusDesc: "Current live breakdown across your workspace.",
    statusPaid: "Paid",
    statusSent: "Sent",
    statusDraft: "Draft / Review",
    statusOverdue: "Overdue",
    invoicesWord: "Invoices",
    yourPlan: "Your Plan",
    freeTrial: "Free Trial",
    planWord: "Plan",
    daysRemaining: (n) => `${n} day${n === 1 ? "" : "s"} remaining`,
    invoicesUsed: (used, limit) => `${used} / ${limit} invoices used this mo.`,
    upToInvoices: (limit) => `Up to ${limit} invoices / month`,
    enGoBD: "EN 16931 & GoBD audit chain",
    activeSub: "Active subscription",
    noCard: "No credit card required",
    manageSub: "Manage Subscription",
    upgradeSoloPrice: "Upgrade to Solo — €29/month",
    recentTitle: "Recent Invoices",
    recentDesc: "Your latest outgoing e-invoices at a glance.",
    viewAll: "View All Invoices →",
    thInvoiceNo: "Invoice No.",
    thCustomer: "Customer",
    thDate: "Date",
    thAmount: "Amount",
    thStatus: "Status",
    thView: "View",
    emptyTitle: "No invoices yet",
    emptyText: "Create your first compliant ZUGFeRD, Factur-X, or XRechnung e-invoice in under a minute.",
    createFirst: "Create First Invoice",
    quickActions: "Quick Actions",
    qaCreate: "Create Invoice",
    qaInbox: "Incoming Inbox",
    qaCustomer: "Add Customer",
    qaProduct: "Add Product",
    getStarted: (done, total) => `Get Started (${done}/${total})`,
    testIntegrations: "Test Your Integrations",
    testIntegrationsDesc: "Sends a realistic event into your workspace only.",
    testStripe: "Test Stripe Invoice Event",
    testWoo: "Test WooCommerce Order",
    testShopify: "Test Shopify Order",
    toastOk: (provider, num, status) => `Test ${provider} event processed → ${num} (${status}).`,
    toastFail: "Simulation failed",
    promoTitle: "Need more power for your business?",
    promoText: "Upgrade to Solo (€29/month) and unlock 150 monthly invoices, recurring automation, incoming approvals, and accountant DATEV/FEC exports.",
    promoBullets: ["150 invoices / month", "Advanced VAT & AR reports", "Cancel renewal anytime"],
    promoCta: "Upgrade to Solo — €29/month",
  },
  de: {
    kpiTotal: "Rechnungen gesamt",
    kpiSent: "Versendet",
    kpiPaid: "Bezahlt",
    kpiOverdue: "Überfällig",
    kpiTotalHint: (money) => `${money} diesen Monat fakturiert`,
    kpiSentHint: (drafts, customers) => `${drafts} Entwurf · ${customers} Kunden`,
    kpiPaidHint: "Beglichen & erfasst",
    kpiOverdueDue: "Über Fälligkeitsdatum (BT-9)",
    kpiOverdueClear: "Alle Forderungen aktuell",
    attentionTitle: (n) => `Rechnungen, die Aufmerksamkeit brauchen (${n})`,
    attentionDesc: "Vor dem Versand gestoppt wegen fehlender Pflichtfelder (EN 16931 / XRechnung). Zum 1-Klick-Beheben öffnen.",
    fixNow: "Jetzt beheben",
    trendTitle: "Rechnungsverlauf",
    trendDesc: "Erstellte, versendete und bezahlte Rechnungen im Zeitverlauf.",
    tfLast: (days) => `Letzte ${days} Tage`,
    legendCreated: "Erstellt",
    legendSent: "Versendet",
    legendPaid: "Bezahlt",
    statusTitle: "Rechnungsstatus",
    statusDesc: "Aktuelle Live-Aufteilung in Ihrem Workspace.",
    statusPaid: "Bezahlt",
    statusSent: "Versendet",
    statusDraft: "Entwurf / Prüfung",
    statusOverdue: "Überfällig",
    invoicesWord: "Rechnungen",
    yourPlan: "Ihr Tarif",
    freeTrial: "Kostenlose Testphase",
    planWord: "Tarif",
    daysRemaining: (n) => `noch ${n} Tag${n === 1 ? "" : "e"}`,
    invoicesUsed: (used, limit) => `${used} / ${limit} Rechnungen diesen Monat genutzt`,
    upToInvoices: (limit) => `Bis zu ${limit} Rechnungen / Monat`,
    enGoBD: "EN 16931 & GoBD-Audit-Kette",
    activeSub: "Aktives Abonnement",
    noCard: "Keine Kreditkarte erforderlich",
    manageSub: "Abonnement verwalten",
    upgradeSoloPrice: "Upgrade auf Solo — 39 $/Monat",
    recentTitle: "Letzte Rechnungen",
    recentDesc: "Ihre neuesten ausgehenden E-Rechnungen auf einen Blick.",
    viewAll: "Alle Rechnungen ansehen →",
    thInvoiceNo: "Rechnungsnr.",
    thCustomer: "Kunde",
    thDate: "Datum",
    thAmount: "Betrag",
    thStatus: "Status",
    thView: "Ansehen",
    emptyTitle: "Noch keine Rechnungen",
    emptyText: "Erstellen Sie Ihre erste konforme ZUGFeRD-, Factur-X- oder XRechnung-E-Rechnung in unter einer Minute.",
    createFirst: "Erste Rechnung erstellen",
    quickActions: "Schnellaktionen",
    qaCreate: "Rechnung erstellen",
    qaInbox: "Eingangspostfach",
    qaCustomer: "Kunde hinzufügen",
    qaProduct: "Produkt hinzufügen",
    getStarted: (done, total) => `Erste Schritte (${done}/${total})`,
    testIntegrations: "Integrationen testen",
    testIntegrationsDesc: "Sendet ein realistisches Ereignis ausschließlich in Ihren Workspace.",
    testStripe: "Stripe-Rechnungsereignis testen",
    testWoo: "WooCommerce-Bestellung testen",
    testShopify: "Shopify-Bestellung testen",
    toastOk: (provider, num, status) => `Test-${provider}-Ereignis verarbeitet → ${num} (${status}).`,
    toastFail: "Simulation fehlgeschlagen",
    promoTitle: "Mehr Leistung für Ihr Unternehmen?",
    promoText: "Wechseln Sie zu Solo (39 $/Monat) und schalten Sie 150 Rechnungen/Monat, wiederkehrende Automatisierung, Eingangsfreigaben und DATEV/FEC-Exporte frei.",
    promoBullets: ["150 Rechnungen / Monat", "Erweiterte USt- & Forderungsberichte", "Verlängerung jederzeit kündbar"],
    promoCta: "Upgrade auf Solo — 39 $/Monat",
  },
  fr: {
    kpiTotal: "Factures totales",
    kpiSent: "Envoyées",
    kpiPaid: "Payées",
    kpiOverdue: "En retard",
    kpiTotalHint: (money) => `${money} facturé ce mois-ci`,
    kpiSentHint: (drafts, customers) => `${drafts} brouillon · ${customers} clients`,
    kpiPaidHint: "Réglées & enregistrées",
    kpiOverdueDue: "Date d'échéance dépassée (BT-9)",
    kpiOverdueClear: "Toutes les créances à jour",
    attentionTitle: (n) => `Factures nécessitant une action (${n})`,
    attentionDesc: "Bloquées avant l'envoi en raison de champs EN 16931 / XRechnung obligatoires manquants. Ouvrez pour corriger en 1 clic.",
    fixNow: "Corriger",
    trendTitle: "Tendance des factures",
    trendDesc: "Factures créées, envoyées et payées au fil du temps.",
    tfLast: (days) => `${days} derniers jours`,
    legendCreated: "Créées",
    legendSent: "Envoyées",
    legendPaid: "Payées",
    statusTitle: "Statut des factures",
    statusDesc: "Répartition en direct dans votre espace.",
    statusPaid: "Payées",
    statusSent: "Envoyées",
    statusDraft: "Brouillon / revue",
    statusOverdue: "En retard",
    invoicesWord: "Factures",
    yourPlan: "Votre offre",
    freeTrial: "Essai gratuit",
    planWord: "Offre",
    daysRemaining: (n) => `${n} jour${n === 1 ? "" : "s"} restant${n === 1 ? "" : "s"}`,
    invoicesUsed: (used, limit) => `${used} / ${limit} factures utilisées ce mois-ci`,
    upToInvoices: (limit) => `Jusqu'à ${limit} factures / mois`,
    enGoBD: "Chaîne d'audit EN 16931 & GoBD",
    activeSub: "Abonnement actif",
    noCard: "Sans carte bancaire",
    manageSub: "Gérer l'abonnement",
    upgradeSoloPrice: "Passer à Solo — 39 $/mois",
    recentTitle: "Factures récentes",
    recentDesc: "Vos dernières factures émises en un coup d'œil.",
    viewAll: "Voir toutes les factures →",
    thInvoiceNo: "N° de facture",
    thCustomer: "Client",
    thDate: "Date",
    thAmount: "Montant",
    thStatus: "Statut",
    thView: "Voir",
    emptyTitle: "Aucune facture pour l'instant",
    emptyText: "Créez votre première facture conforme ZUGFeRD, Factur-X ou XRechnung en moins d'une minute.",
    createFirst: "Créer la première facture",
    quickActions: "Actions rapides",
    qaCreate: "Créer une facture",
    qaInbox: "Boîte de réception",
    qaCustomer: "Ajouter un client",
    qaProduct: "Ajouter un produit",
    getStarted: (done, total) => `Pour commencer (${done}/${total})`,
    testIntegrations: "Tester vos intégrations",
    testIntegrationsDesc: "Envoie un événement réaliste uniquement dans votre espace.",
    testStripe: "Tester un événement de facture Stripe",
    testWoo: "Tester une commande WooCommerce",
    testShopify: "Tester une commande Shopify",
    toastOk: (provider, num, status) => `Événement test ${provider} traité → ${num} (${status}).`,
    toastFail: "Échec de la simulation",
    promoTitle: "Besoin de plus de puissance pour votre activité ?",
    promoText: "Passez à Solo (39 $/mois) et débloquez 150 factures mensuelles, l'automatisation récurrente, les approbations entrantes et les exports comptables DATEV/FEC.",
    promoBullets: ["150 factures / mois", "Rapports TVA & créances avancés", "Renouvellement annulable à tout moment"],
    promoCta: "Passer à Solo — 39 $/mois",
  },
};

// ── Shared invoice status badge labels (used across dashboard, invoices, etc.) ──
export const STATUS_LABELS: Record<AppLocale, Record<string, string>> = {
  en: {
    DRAFT: "Draft",
    VALIDATED: "Validated",
    DELIVERED: "Sent",
    SENT: "Sent",
    PAID: "Paid",
    OVERDUE: "Overdue",
    ACTION_REQUIRED: "Action required",
  },
  de: {
    DRAFT: "Entwurf",
    VALIDATED: "Validiert",
    DELIVERED: "Versendet",
    SENT: "Versendet",
    PAID: "Bezahlt",
    OVERDUE: "Überfällig",
    ACTION_REQUIRED: "Aktion erforderlich",
  },
  fr: {
    DRAFT: "Brouillon",
    VALIDATED: "Validée",
    DELIVERED: "Envoyée",
    SENT: "Envoyée",
    PAID: "Payée",
    OVERDUE: "En retard",
    ACTION_REQUIRED: "Action requise",
  },
};

// ── Invoices list page translations ──
export interface InvoicesStrings {
  title: string;
  subtitle: string;
  newInvoice: string;
  tabAll: string;
  tabDrafts: string;
  tabValidated: string;
  tabDelivered: string;
  tabActionRequired: string;
  searchPlaceholder: string;
  fromDate: string;
  toDate: string;
  docsCount: (n: number) => string;
  totalInvoiced: (money: string) => string;
  loading: string;
  emptyTitle: string;
  emptyText: string;
  createInvoice: string;
  thNumber: string;
  thCustomer: string;
  thFormat: string;
  thSource: string;
  thAmount: string;
  thStatus: string;
  thFiles: string;
  creditBadge: string;
  due: (date: string) => string;
}

export const INVOICES_STRINGS: Record<AppLocale, InvoicesStrings> = {
  en: {
    title: "Invoices",
    subtitle: "Every invoice and credit note in your workspace. Finalized documents are immutable and archived (GoBD).",
    newInvoice: "New invoice",
    tabAll: "All",
    tabDrafts: "Drafts",
    tabValidated: "Validated",
    tabDelivered: "Delivered",
    tabActionRequired: "Action required",
    searchPlaceholder: "Search number, customer or VAT ID…",
    fromDate: "From date",
    toDate: "To date",
    docsCount: (n) => `${n} document(s)`,
    totalInvoiced: (money) => `Total invoiced (net of credit notes): ${money}`,
    loading: "Loading…",
    emptyTitle: "No invoices match",
    emptyText: "Adjust your filters or create a new invoice.",
    createInvoice: "Create invoice",
    thNumber: "Number",
    thCustomer: "Customer",
    thFormat: "Format",
    thSource: "Source",
    thAmount: "Amount",
    thStatus: "Status",
    thFiles: "Files",
    creditBadge: "CREDIT",
    due: (date) => ` · due ${date}`,
  },
  de: {
    title: "Rechnungen",
    subtitle: "Jede Rechnung und Gutschrift in Ihrem Workspace. Finalisierte Dokumente sind unveränderbar und archiviert (GoBD).",
    newInvoice: "Neue Rechnung",
    tabAll: "Alle",
    tabDrafts: "Entwürfe",
    tabValidated: "Validiert",
    tabDelivered: "Versendet",
    tabActionRequired: "Aktion erforderlich",
    searchPlaceholder: "Nummer, Kunde oder USt-IdNr. suchen…",
    fromDate: "Von Datum",
    toDate: "Bis Datum",
    docsCount: (n) => `${n} Dokument(e)`,
    totalInvoiced: (money) => `Gesamt fakturiert (abzüglich Gutschriften): ${money}`,
    loading: "Wird geladen…",
    emptyTitle: "Keine passenden Rechnungen",
    emptyText: "Passen Sie Ihre Filter an oder erstellen Sie eine neue Rechnung.",
    createInvoice: "Rechnung erstellen",
    thNumber: "Nummer",
    thCustomer: "Kunde",
    thFormat: "Format",
    thSource: "Quelle",
    thAmount: "Betrag",
    thStatus: "Status",
    thFiles: "Dateien",
    creditBadge: "GUTSCHRIFT",
    due: (date) => ` · fällig ${date}`,
  },
  fr: {
    title: "Factures",
    subtitle: "Chaque facture et avoir de votre espace. Les documents finalisés sont immuables et archivés (GoBD).",
    newInvoice: "Nouvelle facture",
    tabAll: "Toutes",
    tabDrafts: "Brouillons",
    tabValidated: "Validées",
    tabDelivered: "Envoyées",
    tabActionRequired: "Action requise",
    searchPlaceholder: "Rechercher par n°, client ou n° de TVA…",
    fromDate: "Date de début",
    toDate: "Date de fin",
    docsCount: (n) => `${n} document(s)`,
    totalInvoiced: (money) => `Total facturé (net des avoirs) : ${money}`,
    loading: "Chargement…",
    emptyTitle: "Aucune facture correspondante",
    emptyText: "Ajustez vos filtres ou créez une nouvelle facture.",
    createInvoice: "Créer une facture",
    thNumber: "Numéro",
    thCustomer: "Client",
    thFormat: "Format",
    thSource: "Source",
    thAmount: "Montant",
    thStatus: "Statut",
    thFiles: "Fichiers",
    creditBadge: "AVOIR",
    due: (date) => ` · échéance ${date}`,
  },
};

// ── Incoming supplier inbox translations ──
export interface InboxStrings {
  title: string;
  subtitle: string;
  statArchived: string;
  statPending: string;
  statPayables: string;
  statDuplicates: string;
  dropIdle: string;
  dropUploading: string;
  dropHint: string;
  queueTitle: string;
  loading: string;
  emptyTitle: string;
  emptyText: string;
  thInvoicePo: string;
  thSupplier: string;
  thCompliance: string;
  thGross: string;
  thActions: string;
  duplicate: string;
  poPrefix: string;
  valid: string;
  issues: string;
  approvalPending: string;
  approvalApproved: string;
  approvalRejected: string;
  payPaid: string;
  payUnpaid: string;
  preview: string;
  downloadOrigXml: string;
  approve: string;
  reject: string;
  markPaid: string;
  markUnpaid: string;
  modalTitle: (num: string) => string;
  gobdLocked: (date: string) => string;
  viewXml: string;
  hideXml: string;
  downloadXml: string;
  downloadJson: string;
  origBytes: string;
  reSerialized: string;
  origReceivedXml: string;
  parsedLines: string;
  thLineItem: string;
  thQty: string;
  thUnitPrice: string;
  thVat: string;
  sha256: string;
  grossPayable: string;
  toastArchived: (num: string, seller: string, dup: boolean) => string;
  toastUploadFailed: string;
  toastXmlFailed: string;
  toastUpdateFailed: string;
  toastArchiveFailed: string;
}

export const INBOX_STRINGS: Record<AppLocale, InboxStrings> = {
  en: {
    title: "Intelligent Incoming Supplier Inbox (Eingangsrechnungen)",
    subtitle: "Receive, validate, detect duplicates, match PO numbers, approve, and GoBD-archive ZUGFeRD, Factur-X, and XRechnung supplier invoices.",
    statArchived: "Archived Docs",
    statPending: "Pending Approval",
    statPayables: "Open Payables",
    statDuplicates: "Duplicates Flagged",
    dropIdle: "Drop or Upload Supplier E-Invoice (.pdf or .xml)",
    dropUploading: "Extracting XML, checking duplicates & GoBD-archiving…",
    dropHint: "Automatic duplicate detection, EN 16931 validation, PO extraction (BT-13), and 8–10 year GoBD SHA-256 lock.",
    queueTitle: "Supplier Invoice Queue",
    loading: "Loading inbox…",
    emptyTitle: "Your incoming inbox is empty",
    emptyText: "Upload any supplier's ZUGFeRD PDF or XRechnung XML above.",
    thInvoicePo: "Invoice / PO",
    thSupplier: "Supplier",
    thCompliance: "Compliance & Approval",
    thGross: "Gross",
    thActions: "Actions",
    duplicate: "DUPLICATE",
    poPrefix: "PO:",
    valid: "EN 16931 Valid",
    issues: "Issues Found",
    approvalPending: "Pending review",
    approvalApproved: "Approved",
    approvalRejected: "Rejected",
    payPaid: "Paid",
    payUnpaid: "Unpaid",
    preview: "Preview",
    downloadOrigXml: "Download original XML",
    approve: "Approve",
    reject: "Reject",
    markPaid: "Mark Paid",
    markUnpaid: "Unpaid",
    modalTitle: (num) => `Supplier Invoice ${num}`,
    gobdLocked: (date) => `GoBD Locked until ${date}`,
    viewXml: "View original XML",
    hideXml: "Hide original XML",
    downloadXml: "Download XML",
    downloadJson: "Download JSON",
    origBytes: "Original supplier bytes preserved",
    reSerialized: "Re-serialized view",
    origReceivedXml: "Original received XML (as sent by supplier)",
    parsedLines: "Parsed line items (EN 16931)",
    thLineItem: "Line Item",
    thQty: "Qty",
    thUnitPrice: "Unit Price",
    thVat: "VAT",
    sha256: "SHA-256 Digest",
    grossPayable: "Gross Payable",
    toastArchived: (num, seller, dup) => `Archived ${num} from ${seller}${dup ? " (⚠ Duplicate detected!)" : ""}.`,
    toastUploadFailed: "Upload failed",
    toastXmlFailed: "Could not load original XML",
    toastUpdateFailed: "Update failed",
    toastArchiveFailed: "Failed to archive supplier invoice",
  },
  de: {
    title: "Intelligenter Eingangsrechnungs-Posteingang",
    subtitle: "Empfangen, validieren, Dubletten erkennen, Bestellnummern abgleichen, freigeben und ZUGFeRD-, Factur-X- & XRechnung-Lieferantenrechnungen GoBD-archivieren.",
    statArchived: "Archivierte Belege",
    statPending: "Freigabe ausstehend",
    statPayables: "Offene Verbindlichkeiten",
    statDuplicates: "Markierte Dubletten",
    dropIdle: "Lieferanten-E-Rechnung ablegen oder hochladen (.pdf oder .xml)",
    dropUploading: "XML wird extrahiert, Dubletten geprüft & GoBD-archiviert…",
    dropHint: "Automatische Dublettenerkennung, EN-16931-Validierung, Bestellnummer-Extraktion (BT-13) und 8–10 Jahre GoBD-SHA-256-Sperre.",
    queueTitle: "Lieferantenrechnungs-Warteschlange",
    loading: "Posteingang wird geladen…",
    emptyTitle: "Ihr Eingangspostfach ist leer",
    emptyText: "Laden Sie oben eine beliebige ZUGFeRD-PDF oder XRechnung-XML eines Lieferanten hoch.",
    thInvoicePo: "Rechnung / Bestellung",
    thSupplier: "Lieferant",
    thCompliance: "Compliance & Freigabe",
    thGross: "Brutto",
    thActions: "Aktionen",
    duplicate: "DUBLETTE",
    poPrefix: "Best.:",
    valid: "EN 16931 gültig",
    issues: "Fehler gefunden",
    approvalPending: "Prüfung ausstehend",
    approvalApproved: "Freigegeben",
    approvalRejected: "Abgelehnt",
    payPaid: "Bezahlt",
    payUnpaid: "Offen",
    preview: "Vorschau",
    downloadOrigXml: "Original-XML herunterladen",
    approve: "Freigeben",
    reject: "Ablehnen",
    markPaid: "Als bezahlt markieren",
    markUnpaid: "Als offen",
    modalTitle: (num) => `Lieferantenrechnung ${num}`,
    gobdLocked: (date) => `GoBD-gesperrt bis ${date}`,
    viewXml: "Original-XML anzeigen",
    hideXml: "Original-XML ausblenden",
    downloadXml: "XML herunterladen",
    downloadJson: "JSON herunterladen",
    origBytes: "Original-Lieferantenbytes erhalten",
    reSerialized: "Neu serialisierte Ansicht",
    origReceivedXml: "Original empfangenes XML (wie vom Lieferanten gesendet)",
    parsedLines: "Erkannte Positionen (EN 16931)",
    thLineItem: "Position",
    thQty: "Menge",
    thUnitPrice: "Einzelpreis",
    thVat: "USt.",
    sha256: "SHA-256-Prüfsumme",
    grossPayable: "Zu zahlender Bruttobetrag",
    toastArchived: (num, seller, dup) => `${num} von ${seller} archiviert${dup ? " (⚠ Dublette erkannt!)" : ""}.`,
    toastUploadFailed: "Upload fehlgeschlagen",
    toastXmlFailed: "Original-XML konnte nicht geladen werden",
    toastUpdateFailed: "Aktualisierung fehlgeschlagen",
    toastArchiveFailed: "Lieferantenrechnung konnte nicht archiviert werden",
  },
  fr: {
    title: "Boîte de réception intelligente des factures fournisseurs",
    subtitle: "Recevez, validez, détectez les doublons, rapprochez les n° de commande, approuvez et archivez (GoBD) les factures fournisseurs ZUGFeRD, Factur-X et XRechnung.",
    statArchived: "Documents archivés",
    statPending: "En attente d'approbation",
    statPayables: "Dettes ouvertes",
    statDuplicates: "Doublons signalés",
    dropIdle: "Déposez ou importez une facture fournisseur (.pdf ou .xml)",
    dropUploading: "Extraction du XML, contrôle des doublons & archivage GoBD…",
    dropHint: "Détection automatique des doublons, validation EN 16931, extraction du n° de commande (BT-13) et verrou GoBD SHA-256 de 8 à 10 ans.",
    queueTitle: "File des factures fournisseurs",
    loading: "Chargement de la boîte de réception…",
    emptyTitle: "Votre boîte de réception est vide",
    emptyText: "Importez ci-dessus le PDF ZUGFeRD ou le XML XRechnung de n'importe quel fournisseur.",
    thInvoicePo: "Facture / commande",
    thSupplier: "Fournisseur",
    thCompliance: "Conformité & approbation",
    thGross: "Brut",
    thActions: "Actions",
    duplicate: "DOUBLON",
    poPrefix: "Cmd :",
    valid: "EN 16931 conforme",
    issues: "Anomalies détectées",
    approvalPending: "En attente de revue",
    approvalApproved: "Approuvée",
    approvalRejected: "Rejetée",
    payPaid: "Payée",
    payUnpaid: "Impayée",
    preview: "Aperçu",
    downloadOrigXml: "Télécharger le XML original",
    approve: "Approuver",
    reject: "Rejeter",
    markPaid: "Marquer payée",
    markUnpaid: "Marquer impayée",
    modalTitle: (num) => `Facture fournisseur ${num}`,
    gobdLocked: (date) => `Verrouillé GoBD jusqu'au ${date}`,
    viewXml: "Voir le XML original",
    hideXml: "Masquer le XML original",
    downloadXml: "Télécharger le XML",
    downloadJson: "Télécharger le JSON",
    origBytes: "Octets fournisseur originaux préservés",
    reSerialized: "Vue re-sérialisée",
    origReceivedXml: "XML original reçu (tel qu'envoyé par le fournisseur)",
    parsedLines: "Lignes analysées (EN 16931)",
    thLineItem: "Ligne",
    thQty: "Qté",
    thUnitPrice: "Prix unitaire",
    thVat: "TVA",
    sha256: "Empreinte SHA-256",
    grossPayable: "Montant brut à payer",
    toastArchived: (num, seller, dup) => `${num} de ${seller} archivée${dup ? " (⚠ Doublon détecté !)" : ""}.`,
    toastUploadFailed: "Échec de l'import",
    toastXmlFailed: "Impossible de charger le XML original",
    toastUpdateFailed: "Échec de la mise à jour",
    toastArchiveFailed: "Impossible d'archiver la facture fournisseur",
  },
};

// ── Invoice detail page translations ──
export interface InvoiceDetailStrings {
  loading: string;
  notFound: string;
  notFoundAlert: string;
  backToInvoices: string;
  crumbInvoices: string;
  titleInvoice: string;
  titleCreditNote: string;
  issued: (date: string) => string;
  references: (num: string) => string;
  editDraft: string;
  finalizeArchive: string;
  deleteDraft: string;
  downloadPdf: string;
  downloadXml: string;
  jsonLabel: string;
  paidUndo: string;
  markPaid: string;
  issueCreditNote: string;
  // status strip
  stripValidation: string;
  stripApproval: string;
  stripDelivery: string;
  stripPayment: string;
  stripAccounting: string;
  en16931Passed: string;
  blockedIssues: string;
  approve: string;
  delivered: string;
  notSent: string;
  ready: string;
  approvalLabel: (v: string) => string;
  paymentLabel: (v: string) => string;
  accountingLabel: (v: string) => string;
  // credit note box
  cnTitle: string;
  cnDesc: (num: string) => string;
  cnReasonLabel: string;
  cnReasonPlaceholder: string;
  cnConfirm: string;
  // repair card
  repairTitle: string;
  repairDesc: string;
  repairBuyerRef: string;
  repairBuyerVat: string;
  repairSellerName: string;
  repairSellerPhone: string;
  repairSellerEmail: string;
  repairSubmit: string;
  // document summary
  docSummary: string;
  sellerBg4: string;
  buyerBg7: string;
  vatPrefix: string;
  thItem: string;
  thQty: string;
  thUnitPrice: string;
  thVat: string;
  thNetTotal: string;
  netTotal: string;
  vatTotal: string;
  grossPayable: string;
  // xml card
  xmlTitle: string;
  hideXml: string;
  inspectXml: string;
  gobdLockUntil: string;
  // email card
  emailTitle: string;
  emailDesc: string;
  recipientLabel: string;
  sendEInvoice: string;
  lastSentTo: (to: string, date: string) => string;
  // peppol
  peppolTitle: string;
  peppolDesc: string;
  peppolRecipient: string;
  sendViaPeppol: string;
  peppolNote: string;
  // transmissions
  txTitle: string;
  txDesc: string;
  txAttempt: (a: number, max: number) => string;
  txNextRetry: (date: string) => string;
  txRef: (ref: string) => string;
  // epc
  epcTitle: string;
  epcDesc: string;
  // comments
  teamTitle: string;
  teamDesc: string;
  noComments: string;
  commentPlaceholder: string;
  post: string;
  payLinkTitle: string;
  payLinkDesc: string;
  payLinkCreate: string;
  payLinkCopy: string;
  payLinkOpen: string;
  toastLinkCopied: string;
  // audit
  auditTitle: string;
  auditDesc: string;
  noAudit: string;
  // toasts
  toastPatched: string;
  toastPatchFailed: string;
  toastFinalized: string;
  toastFinalizeFailed: string;
  deletePrompt: (num: string) => string;
  toastDeleteFailed: string;
  toastAlreadyDelivered: (to: string) => string;
  toastDelivered: (to: string, cc: string | null) => string;
  toastQueued: (status: string, next?: string) => string;
  toastEmailFailed: string;
  toastPeppolSent: (to: string) => string;
  toastPeppolQueued: (status: string) => string;
  toastPeppolFailed: string;
  toastMarkedPayment: (status: string) => string;
  toastPaymentFailed: string;
  toastMarkedApproval: (status: string) => string;
  toastApprovalFailed: string;
  toastCnFailed: string;
}

const ENUM_EN: Record<string, string> = { NONE: "None", APPROVED: "Approved", REJECTED: "Rejected", UNPAID: "Unpaid", PARTIAL: "Partial", PAID: "Paid", UNPOSTED: "Unposted", EXPORTED: "Exported" };
const ENUM_DE: Record<string, string> = { NONE: "Keine", APPROVED: "Freigegeben", REJECTED: "Abgelehnt", UNPAID: "Offen", PARTIAL: "Teilweise", PAID: "Bezahlt", UNPOSTED: "Nicht gebucht", EXPORTED: "Exportiert" };
const ENUM_FR: Record<string, string> = { NONE: "Aucune", APPROVED: "Approuvée", REJECTED: "Rejetée", UNPAID: "Impayée", PARTIAL: "Partielle", PAID: "Payée", UNPOSTED: "Non comptabilisée", EXPORTED: "Exportée" };

export const INVOICE_DETAIL_STRINGS: Record<AppLocale, InvoiceDetailStrings> = {
  en: {
    loading: "Loading invoice…",
    notFound: "Invoice not found",
    notFoundAlert: "Invoice not found in your organization.",
    backToInvoices: "Back to invoices",
    crumbInvoices: "Invoices",
    titleInvoice: "Invoice",
    titleCreditNote: "Credit Note",
    issued: (date) => `Issued ${date}`,
    references: (num) => ` · References ${num}`,
    editDraft: "Edit draft",
    finalizeArchive: "Finalize & archive",
    deleteDraft: "Delete draft",
    downloadPdf: "Download PDF/A-3",
    downloadXml: "Download XML",
    jsonLabel: "JSON",
    paidUndo: "Paid ✓ (Undo)",
    markPaid: "Mark as Paid",
    issueCreditNote: "Issue Credit Note (381)",
    stripValidation: "Validation",
    stripApproval: "Approval",
    stripDelivery: "Delivery",
    stripPayment: "Payment (Separate)",
    stripAccounting: "Accounting",
    en16931Passed: "EN 16931 Passed",
    blockedIssues: "Blocked / Issues",
    approve: "Approve",
    delivered: "Delivered",
    notSent: "Not sent",
    ready: "Ready",
    approvalLabel: (v) => ENUM_EN[v] ?? v,
    paymentLabel: (v) => ENUM_EN[v] ?? v,
    accountingLabel: (v) => ENUM_EN[v] ?? v,
    cnTitle: "Issue GoBD Credit Note (TypeCode 381)",
    cnDesc: (num) => `Creates a linked Stornorechnung referencing BT-25 = ${num} using your credit note sequence.`,
    cnReasonLabel: "Reason (optional, included in BT-22 notes)",
    cnReasonPlaceholder: "e.g. Duplicate billing or customer refund",
    cnConfirm: "Confirm & issue credit note",
    repairTitle: "Compliance Repair Required (Blocked before sending)",
    repairDesc: "Fix the missing EN 16931 / XRechnung fields below and re-validate immediately.",
    repairBuyerRef: "Buyer Reference / Leitweg-ID (BT-10)",
    repairBuyerVat: "Buyer EU VAT ID (BT-48)",
    repairSellerName: "Seller Contact Name (BT-41)",
    repairSellerPhone: "Seller Contact Phone (BT-42)",
    repairSellerEmail: "Seller Contact Email (BT-43)",
    repairSubmit: "Patch & Re-Validate",
    docSummary: "Document Summary",
    sellerBg4: "Seller (BG-4)",
    buyerBg7: "Buyer (BG-7)",
    vatPrefix: "VAT:",
    thItem: "Item",
    thQty: "Qty",
    thUnitPrice: "Unit price",
    thVat: "VAT",
    thNetTotal: "Net total",
    netTotal: "Net total (BT-109)",
    vatTotal: "VAT total (BT-110)",
    grossPayable: "Gross payable (BT-115)",
    xmlTitle: "Structured EN 16931 XML",
    hideXml: "Hide XML",
    inspectXml: "Inspect XML",
    gobdLockUntil: "GoBD WORM lock until:",
    emailTitle: "Send E-Invoice by Email",
    emailDesc: "Attaches compliant PDF/A-3 + XML and CCs your accountant if configured.",
    recipientLabel: "Recipient Email (BT-49)",
    sendEInvoice: "Send E-Invoice",
    lastSentTo: (to, date) => `Last sent to ${to} (${date})`,
    peppolTitle: "Peppol Network Delivery",
    peppolDesc: "Send over the OpenPeppol four-corner network via a certified Access Point.",
    peppolRecipient: "Recipient participant:",
    sendViaPeppol: "Send via Peppol",
    peppolNote: "Requires a connected certified Access Point. Delivery status appears in the Transmission Outbox below.",
    txTitle: "Transmission Outbox",
    txDesc: "Durable, idempotent delivery jobs (ADR-004) — retried automatically, never double-sent.",
    txAttempt: (a, max) => `Attempt ${a}/${max}`,
    txNextRetry: (date) => ` · next retry ${date} UTC`,
    txRef: (ref) => ` · ref ${ref}`,
    epcTitle: "EPC SEPA GiroCode QR",
    epcDesc: "Scannable by EU banking apps (SCT).",
    teamTitle: "Team Collaboration & Notes",
    teamDesc: "Immutable internal review thread (Master Plan F13).",
    noComments: "No internal comments yet.",
    commentPlaceholder: "Add review note or @mention…",
    post: "Post",
    payLinkTitle: "Payment link",
    payLinkDesc: "Share a secure pay page (scan-to-pay SEPA) with your customer.",
    payLinkCreate: "Create payment link",
    payLinkCopy: "Copy link",
    payLinkOpen: "Open",
    toastLinkCopied: "Payment link copied to clipboard.",
    auditTitle: "GoBD Audit Trail",
    auditDesc: "Append-only SHA-256 hash-chained events for this document.",
    noAudit: "No audit events recorded yet.",
    toastPatched: "Compliance fields patched and invoice re-validated.",
    toastPatchFailed: "Patch failed",
    toastFinalized: "Draft finalized, assigned sequential number, and GoBD-archived.",
    toastFinalizeFailed: "Finalize failed",
    deletePrompt: (num) => `Permanently delete draft ${num}?`,
    toastDeleteFailed: "Delete failed",
    toastAlreadyDelivered: (to) => `Already delivered to ${to} — no duplicate sent (idempotent).`,
    toastDelivered: (to, cc) => `E-invoice delivered to ${to}${cc ? ` (CC: ${cc})` : ""} and logged in GoBD audit chain.`,
    toastQueued: (status, next) => `Delivery safely queued (${status}) — it will be retried automatically${next ? ` (next ~${next} UTC)` : ""}.`,
    toastEmailFailed: "Email dispatch failed",
    toastPeppolSent: (to) => `Transmitted via Peppol to ${to}.`,
    toastPeppolQueued: (status) => `Queued for Peppol delivery (${status}).`,
    toastPeppolFailed: "Peppol delivery failed",
    toastMarkedPayment: (status) => `Invoice marked as ${status} and logged in GoBD audit trail.`,
    toastPaymentFailed: "Payment status update failed",
    toastMarkedApproval: (status) => `Invoice marked ${status}.`,
    toastApprovalFailed: "Approval failed",
    toastCnFailed: "Credit note creation failed",
  },
  de: {
    loading: "Rechnung wird geladen…",
    notFound: "Rechnung nicht gefunden",
    notFoundAlert: "Rechnung in Ihrer Organisation nicht gefunden.",
    backToInvoices: "Zurück zu den Rechnungen",
    crumbInvoices: "Rechnungen",
    titleInvoice: "Rechnung",
    titleCreditNote: "Gutschrift",
    issued: (date) => `Ausgestellt ${date}`,
    references: (num) => ` · Referenz ${num}`,
    editDraft: "Entwurf bearbeiten",
    finalizeArchive: "Finalisieren & archivieren",
    deleteDraft: "Entwurf löschen",
    downloadPdf: "PDF/A-3 herunterladen",
    downloadXml: "XML herunterladen",
    jsonLabel: "JSON",
    paidUndo: "Bezahlt ✓ (rückgängig)",
    markPaid: "Als bezahlt markieren",
    issueCreditNote: "Gutschrift erstellen (381)",
    stripValidation: "Validierung",
    stripApproval: "Freigabe",
    stripDelivery: "Zustellung",
    stripPayment: "Zahlung (separat)",
    stripAccounting: "Buchhaltung",
    en16931Passed: "EN 16931 bestanden",
    blockedIssues: "Blockiert / Fehler",
    approve: "Freigeben",
    delivered: "Zugestellt",
    notSent: "Nicht gesendet",
    ready: "Bereit",
    approvalLabel: (v) => ENUM_DE[v] ?? v,
    paymentLabel: (v) => ENUM_DE[v] ?? v,
    accountingLabel: (v) => ENUM_DE[v] ?? v,
    cnTitle: "GoBD-Gutschrift erstellen (TypeCode 381)",
    cnDesc: (num) => `Erstellt eine verknüpfte Stornorechnung mit Bezug BT-25 = ${num} über Ihre Gutschrifts-Nummernfolge.`,
    cnReasonLabel: "Grund (optional, in BT-22-Notizen enthalten)",
    cnReasonPlaceholder: "z. B. Doppelte Abrechnung oder Kundenerstattung",
    cnConfirm: "Bestätigen & Gutschrift erstellen",
    repairTitle: "Compliance-Reparatur erforderlich (vor Versand blockiert)",
    repairDesc: "Beheben Sie die fehlenden EN-16931- / XRechnung-Felder unten und validieren Sie sofort neu.",
    repairBuyerRef: "Käuferreferenz / Leitweg-ID (BT-10)",
    repairBuyerVat: "USt-IdNr. des Käufers (BT-48)",
    repairSellerName: "Kontaktname Verkäufer (BT-41)",
    repairSellerPhone: "Kontakttelefon Verkäufer (BT-42)",
    repairSellerEmail: "Kontakt-E-Mail Verkäufer (BT-43)",
    repairSubmit: "Korrigieren & neu validieren",
    docSummary: "Dokumentübersicht",
    sellerBg4: "Verkäufer (BG-4)",
    buyerBg7: "Käufer (BG-7)",
    vatPrefix: "USt:",
    thItem: "Position",
    thQty: "Menge",
    thUnitPrice: "Einzelpreis",
    thVat: "USt.",
    thNetTotal: "Nettobetrag",
    netTotal: "Nettobetrag (BT-109)",
    vatTotal: "USt-Betrag (BT-110)",
    grossPayable: "Bruttobetrag (BT-115)",
    xmlTitle: "Strukturiertes EN-16931-XML",
    hideXml: "XML ausblenden",
    inspectXml: "XML prüfen",
    gobdLockUntil: "GoBD-WORM-Sperre bis:",
    emailTitle: "E-Rechnung per E-Mail senden",
    emailDesc: "Hängt konforme PDF/A-3 + XML an und setzt Ihren Steuerberater auf CC, falls konfiguriert.",
    recipientLabel: "Empfänger-E-Mail (BT-49)",
    sendEInvoice: "E-Rechnung senden",
    lastSentTo: (to, date) => `Zuletzt gesendet an ${to} (${date})`,
    peppolTitle: "Peppol-Netzwerkzustellung",
    peppolDesc: "Versand über das OpenPeppol-Vier-Ecken-Netzwerk via zertifizierten Access Point.",
    peppolRecipient: "Empfänger-Teilnehmer:",
    sendViaPeppol: "Via Peppol senden",
    peppolNote: "Erfordert einen verbundenen zertifizierten Access Point. Der Zustellstatus erscheint unten im Übertragungs-Postausgang.",
    txTitle: "Übertragungs-Postausgang",
    txDesc: "Dauerhafte, idempotente Zustelljobs (ADR-004) — automatisch wiederholt, nie doppelt gesendet.",
    txAttempt: (a, max) => `Versuch ${a}/${max}`,
    txNextRetry: (date) => ` · nächster Versuch ${date} UTC`,
    txRef: (ref) => ` · Ref. ${ref}`,
    epcTitle: "EPC-SEPA-GiroCode-QR",
    epcDesc: "Scanbar mit EU-Banking-Apps (SCT).",
    teamTitle: "Team-Zusammenarbeit & Notizen",
    teamDesc: "Unveränderbarer interner Prüf-Thread (Masterplan F13).",
    noComments: "Noch keine internen Kommentare.",
    commentPlaceholder: "Prüfnotiz oder @Erwähnung hinzufügen…",
    post: "Senden",
    payLinkTitle: "Zahlungslink",
    payLinkDesc: "Teilen Sie eine sichere Zahlungsseite (Scan-to-Pay SEPA) mit Ihrem Kunden.",
    payLinkCreate: "Zahlungslink erstellen",
    payLinkCopy: "Link kopieren",
    payLinkOpen: "Öffnen",
    toastLinkCopied: "Zahlungslink in die Zwischenablage kopiert.",
    auditTitle: "GoBD-Audit-Trail",
    auditDesc: "Nur anfügbare SHA-256-hashverkettete Ereignisse für dieses Dokument.",
    noAudit: "Noch keine Audit-Ereignisse erfasst.",
    toastPatched: "Compliance-Felder korrigiert und Rechnung neu validiert.",
    toastPatchFailed: "Korrektur fehlgeschlagen",
    toastFinalized: "Entwurf finalisiert, fortlaufende Nummer vergeben und GoBD-archiviert.",
    toastFinalizeFailed: "Finalisierung fehlgeschlagen",
    deletePrompt: (num) => `Entwurf ${num} endgültig löschen?`,
    toastDeleteFailed: "Löschen fehlgeschlagen",
    toastAlreadyDelivered: (to) => `Bereits an ${to} zugestellt — kein Duplikat gesendet (idempotent).`,
    toastDelivered: (to, cc) => `E-Rechnung an ${to} zugestellt${cc ? ` (CC: ${cc})` : ""} und in der GoBD-Audit-Kette protokolliert.`,
    toastQueued: (status, next) => `Zustellung sicher eingereiht (${status}) — wird automatisch wiederholt${next ? ` (nächster ~${next} UTC)` : ""}.`,
    toastEmailFailed: "E-Mail-Versand fehlgeschlagen",
    toastPeppolSent: (to) => `Via Peppol an ${to} übertragen.`,
    toastPeppolQueued: (status) => `Für Peppol-Zustellung eingereiht (${status}).`,
    toastPeppolFailed: "Peppol-Zustellung fehlgeschlagen",
    toastMarkedPayment: (status) => `Rechnung als ${status} markiert und im GoBD-Audit-Trail protokolliert.`,
    toastPaymentFailed: "Aktualisierung des Zahlungsstatus fehlgeschlagen",
    toastMarkedApproval: (status) => `Rechnung als ${status} markiert.`,
    toastApprovalFailed: "Freigabe fehlgeschlagen",
    toastCnFailed: "Erstellung der Gutschrift fehlgeschlagen",
  },
  fr: {
    loading: "Chargement de la facture…",
    notFound: "Facture introuvable",
    notFoundAlert: "Facture introuvable dans votre organisation.",
    backToInvoices: "Retour aux factures",
    crumbInvoices: "Factures",
    titleInvoice: "Facture",
    titleCreditNote: "Avoir",
    issued: (date) => `Émise le ${date}`,
    references: (num) => ` · Référence ${num}`,
    editDraft: "Modifier le brouillon",
    finalizeArchive: "Finaliser & archiver",
    deleteDraft: "Supprimer le brouillon",
    downloadPdf: "Télécharger le PDF/A-3",
    downloadXml: "Télécharger le XML",
    jsonLabel: "JSON",
    paidUndo: "Payée ✓ (annuler)",
    markPaid: "Marquer payée",
    issueCreditNote: "Émettre un avoir (381)",
    stripValidation: "Validation",
    stripApproval: "Approbation",
    stripDelivery: "Livraison",
    stripPayment: "Paiement (séparé)",
    stripAccounting: "Comptabilité",
    en16931Passed: "EN 16931 conforme",
    blockedIssues: "Bloquée / anomalies",
    approve: "Approuver",
    delivered: "Livrée",
    notSent: "Non envoyée",
    ready: "Prête",
    approvalLabel: (v) => ENUM_FR[v] ?? v,
    paymentLabel: (v) => ENUM_FR[v] ?? v,
    accountingLabel: (v) => ENUM_FR[v] ?? v,
    cnTitle: "Émettre un avoir GoBD (TypeCode 381)",
    cnDesc: (num) => `Crée un avoir lié référençant BT-25 = ${num} via votre séquence d'avoirs.`,
    cnReasonLabel: "Motif (facultatif, inclus dans les notes BT-22)",
    cnReasonPlaceholder: "ex. double facturation ou remboursement client",
    cnConfirm: "Confirmer & émettre l'avoir",
    repairTitle: "Correction de conformité requise (bloquée avant l'envoi)",
    repairDesc: "Corrigez les champs EN 16931 / XRechnung manquants ci-dessous et revalidez immédiatement.",
    repairBuyerRef: "Référence acheteur / Leitweg-ID (BT-10)",
    repairBuyerVat: "N° de TVA UE de l'acheteur (BT-48)",
    repairSellerName: "Nom du contact vendeur (BT-41)",
    repairSellerPhone: "Téléphone du contact vendeur (BT-42)",
    repairSellerEmail: "E-mail du contact vendeur (BT-43)",
    repairSubmit: "Corriger & revalider",
    docSummary: "Résumé du document",
    sellerBg4: "Vendeur (BG-4)",
    buyerBg7: "Acheteur (BG-7)",
    vatPrefix: "TVA :",
    thItem: "Article",
    thQty: "Qté",
    thUnitPrice: "Prix unitaire",
    thVat: "TVA",
    thNetTotal: "Total net",
    netTotal: "Total net (BT-109)",
    vatTotal: "Total TVA (BT-110)",
    grossPayable: "Montant brut à payer (BT-115)",
    xmlTitle: "XML structuré EN 16931",
    hideXml: "Masquer le XML",
    inspectXml: "Inspecter le XML",
    gobdLockUntil: "Verrou GoBD WORM jusqu'au :",
    emailTitle: "Envoyer la facture par e-mail",
    emailDesc: "Joint un PDF/A-3 + XML conforme et met votre comptable en copie si configuré.",
    recipientLabel: "E-mail du destinataire (BT-49)",
    sendEInvoice: "Envoyer la facture",
    lastSentTo: (to, date) => `Dernier envoi à ${to} (${date})`,
    peppolTitle: "Livraison réseau Peppol",
    peppolDesc: "Envoi sur le réseau OpenPeppol à quatre coins via un point d'accès certifié.",
    peppolRecipient: "Participant destinataire :",
    sendViaPeppol: "Envoyer via Peppol",
    peppolNote: "Nécessite un point d'accès certifié connecté. Le statut de livraison apparaît dans la file d'envoi ci-dessous.",
    txTitle: "File d'envoi",
    txDesc: "Travaux de livraison durables et idempotents (ADR-004) — réessayés automatiquement, jamais envoyés en double.",
    txAttempt: (a, max) => `Tentative ${a}/${max}`,
    txNextRetry: (date) => ` · prochaine tentative ${date} UTC`,
    txRef: (ref) => ` · réf. ${ref}`,
    epcTitle: "QR EPC SEPA GiroCode",
    epcDesc: "Scannable par les applis bancaires de l'UE (SCT).",
    teamTitle: "Collaboration d'équipe & notes",
    teamDesc: "Fil de revue interne immuable (Plan directeur F13).",
    noComments: "Aucun commentaire interne pour l'instant.",
    commentPlaceholder: "Ajouter une note de revue ou une @mention…",
    post: "Publier",
    payLinkTitle: "Lien de paiement",
    payLinkDesc: "Partagez une page de paiement sécurisée (payer en scannant, SEPA) avec votre client.",
    payLinkCreate: "Créer un lien de paiement",
    payLinkCopy: "Copier le lien",
    payLinkOpen: "Ouvrir",
    toastLinkCopied: "Lien de paiement copié dans le presse-papiers.",
    auditTitle: "Piste d'audit GoBD",
    auditDesc: "Événements chaînés SHA-256 en ajout seul pour ce document.",
    noAudit: "Aucun événement d'audit enregistré pour l'instant.",
    toastPatched: "Champs de conformité corrigés et facture revalidée.",
    toastPatchFailed: "Échec de la correction",
    toastFinalized: "Brouillon finalisé, numéro séquentiel attribué et archivé GoBD.",
    toastFinalizeFailed: "Échec de la finalisation",
    deletePrompt: (num) => `Supprimer définitivement le brouillon ${num} ?`,
    toastDeleteFailed: "Échec de la suppression",
    toastAlreadyDelivered: (to) => `Déjà livrée à ${to} — aucun doublon envoyé (idempotent).`,
    toastDelivered: (to, cc) => `Facture livrée à ${to}${cc ? ` (copie : ${cc})` : ""} et consignée dans la chaîne d'audit GoBD.`,
    toastQueued: (status, next) => `Livraison mise en file en toute sécurité (${status}) — elle sera réessayée automatiquement${next ? ` (prochaine ~${next} UTC)` : ""}.`,
    toastEmailFailed: "Échec de l'envoi de l'e-mail",
    toastPeppolSent: (to) => `Transmise via Peppol à ${to}.`,
    toastPeppolQueued: (status) => `Mise en file pour livraison Peppol (${status}).`,
    toastPeppolFailed: "Échec de la livraison Peppol",
    toastMarkedPayment: (status) => `Facture marquée ${status} et consignée dans la piste d'audit GoBD.`,
    toastPaymentFailed: "Échec de la mise à jour du statut de paiement",
    toastMarkedApproval: (status) => `Facture marquée ${status}.`,
    toastApprovalFailed: "Échec de l'approbation",
    toastCnFailed: "Échec de la création de l'avoir",
  },
};

// ── Invoice create/edit form translations ──
export interface InvoiceFormStrings {
  loadingBuilder: string;
  loading: string;
  titleEditDraft: string;
  titleNewCreditNote: string;
  titleNewInvoice: string;
  subtitle: string;
  cancel: string;
  warnSellerIncomplete: string;
  completeSettings: string;
  // validation errors
  errAddress: string;
  errLineDesc: string;
  errCreditRef: string;
  errLoad: string;
  errSave: string;
  // document card
  docCard: string;
  fFormat: string;
  fType: string;
  fNumber: string;
  numberOnFinalize: (num: string) => string;
  typeInvoice: string;
  typeCreditNote: string;
  fIssueDate: string;
  fDueDate: string;
  fCurrency: string;
  fBuyerRef: string;
  buyerRefRequired: string;
  buyerRefOptional: string;
  fPoNumber: string;
  fOrigInvoice: string;
  // customer card
  custCard: string;
  selectSaved: string;
  noSaved: string;
  fCompanyName: string;
  fVatId: string;
  fInvoiceEmail: string;
  fStreet: string;
  fPostalCode: string;
  fCity: string;
  fCountry: string;
  saveCustomer: string;
  // line items
  lineCard: string;
  insertCatalog: string;
  addLine: string;
  fDescription: string;
  fQty: string;
  fUnit: string;
  fUnitPrice: string;
  fVat: string;
  removeLine: string;
  units: Record<string, string>;
  fPaymentTerms: string;
  fNotes: string;
  // summary
  summary: string;
  sNet: string;
  sVat: string;
  sTotal: string;
  validateFinalize: string;
  saveDraft: string;
  finalizeHint: (num: string) => string;
  fromCompany: string;
  edit: string;
  streetMissing: string;
  taxIdMissing: string;
  noIban: string;
}

export const INVOICE_FORM_STRINGS: Record<AppLocale, InvoiceFormStrings> = {
  en: {
    loadingBuilder: "Loading invoice builder…",
    loading: "Loading…",
    titleEditDraft: "Edit draft",
    titleNewCreditNote: "New credit note",
    titleNewInvoice: "New invoice",
    subtitle: "Your company details and bank account are filled in automatically from Settings. The invoice number is assigned when you finalize.",
    cancel: "Cancel",
    warnSellerIncomplete: "Your company address or tax ID is incomplete — invoices will fail validation.",
    completeSettings: "Complete settings →",
    errAddress: "Customer name and full address are required.",
    errLineDesc: "Every line item needs a description.",
    errCreditRef: "Credit notes must reference the original invoice number (BT-25).",
    errLoad: "Failed to load",
    errSave: "Save failed",
    docCard: "Document",
    fFormat: "Format",
    fType: "Type",
    fNumber: "Number",
    numberOnFinalize: (num) => `${num} (on finalize)`,
    typeInvoice: "Invoice (380)",
    typeCreditNote: "Credit note (381)",
    fIssueDate: "Issue date",
    fDueDate: "Due date",
    fCurrency: "Currency",
    fBuyerRef: "Buyer reference / Leitweg-ID (BT-10)",
    buyerRefRequired: "Required for XRechnung",
    buyerRefOptional: "Optional",
    fPoNumber: "PO number (BT-13)",
    fOrigInvoice: "Original invoice no. (BT-25) *",
    custCard: "Customer",
    selectSaved: "Select saved customer…",
    noSaved: "No saved customers",
    fCompanyName: "Company name *",
    fVatId: "VAT ID (BT-48)",
    fInvoiceEmail: "Invoice email (BT-49)",
    fStreet: "Street *",
    fPostalCode: "Postal code *",
    fCity: "City *",
    fCountry: "Country *",
    saveCustomer: "Save this customer for future invoices",
    lineCard: "Line items",
    insertCatalog: "+ Insert from catalog…",
    addLine: "Add line",
    fDescription: "Description *",
    fQty: "Qty",
    fUnit: "Unit",
    fUnitPrice: "Unit price (net)",
    fVat: "VAT",
    removeLine: "Remove line",
    units: { H87: "Piece", HUR: "Hour", DAY: "Day", MON: "Month", C62: "Unit", KGM: "kg" },
    fPaymentTerms: "Payment terms (BT-20)",
    fNotes: "Notes (BT-22, one per line)",
    summary: "Summary",
    sNet: "Net",
    sVat: "VAT",
    sTotal: "Total",
    validateFinalize: "Validate & finalize",
    saveDraft: "Save as draft",
    finalizeHint: (num) => `Finalizing assigns ${num}, runs the EN 16931 validator and locks the document for GoBD archiving. Drafts don't use a number or quota.`,
    fromCompany: "From (your company)",
    edit: "Edit",
    streetMissing: "Street missing",
    taxIdMissing: "Tax ID missing",
    noIban: "No IBAN",
  },
  de: {
    loadingBuilder: "Rechnungseditor wird geladen…",
    loading: "Wird geladen…",
    titleEditDraft: "Entwurf bearbeiten",
    titleNewCreditNote: "Neue Gutschrift",
    titleNewInvoice: "Neue Rechnung",
    subtitle: "Ihre Firmendaten und Ihr Bankkonto werden automatisch aus den Einstellungen übernommen. Die Rechnungsnummer wird beim Finalisieren vergeben.",
    cancel: "Abbrechen",
    warnSellerIncomplete: "Ihre Firmenadresse oder Steuernummer ist unvollständig — Rechnungen schlagen bei der Validierung fehl.",
    completeSettings: "Einstellungen vervollständigen →",
    errAddress: "Kundenname und vollständige Adresse sind erforderlich.",
    errLineDesc: "Jede Position benötigt eine Beschreibung.",
    errCreditRef: "Gutschriften müssen die ursprüngliche Rechnungsnummer referenzieren (BT-25).",
    errLoad: "Laden fehlgeschlagen",
    errSave: "Speichern fehlgeschlagen",
    docCard: "Dokument",
    fFormat: "Format",
    fType: "Typ",
    fNumber: "Nummer",
    numberOnFinalize: (num) => `${num} (beim Finalisieren)`,
    typeInvoice: "Rechnung (380)",
    typeCreditNote: "Gutschrift (381)",
    fIssueDate: "Ausstellungsdatum",
    fDueDate: "Fälligkeitsdatum",
    fCurrency: "Währung",
    fBuyerRef: "Käuferreferenz / Leitweg-ID (BT-10)",
    buyerRefRequired: "Für XRechnung erforderlich",
    buyerRefOptional: "Optional",
    fPoNumber: "Bestellnummer (BT-13)",
    fOrigInvoice: "Ursprüngliche Rechnungsnr. (BT-25) *",
    custCard: "Kunde",
    selectSaved: "Gespeicherten Kunden wählen…",
    noSaved: "Keine gespeicherten Kunden",
    fCompanyName: "Firmenname *",
    fVatId: "USt-IdNr. (BT-48)",
    fInvoiceEmail: "Rechnungs-E-Mail (BT-49)",
    fStreet: "Straße *",
    fPostalCode: "PLZ *",
    fCity: "Stadt *",
    fCountry: "Land *",
    saveCustomer: "Diesen Kunden für künftige Rechnungen speichern",
    lineCard: "Positionen",
    insertCatalog: "+ Aus Katalog einfügen…",
    addLine: "Position hinzufügen",
    fDescription: "Beschreibung *",
    fQty: "Menge",
    fUnit: "Einheit",
    fUnitPrice: "Einzelpreis (netto)",
    fVat: "USt.",
    removeLine: "Position entfernen",
    units: { H87: "Stück", HUR: "Stunde", DAY: "Tag", MON: "Monat", C62: "Einheit", KGM: "kg" },
    fPaymentTerms: "Zahlungsbedingungen (BT-20)",
    fNotes: "Notizen (BT-22, eine pro Zeile)",
    summary: "Zusammenfassung",
    sNet: "Netto",
    sVat: "USt.",
    sTotal: "Gesamt",
    validateFinalize: "Validieren & finalisieren",
    saveDraft: "Als Entwurf speichern",
    finalizeHint: (num) => `Beim Finalisieren wird ${num} vergeben, der EN-16931-Validator ausgeführt und das Dokument für die GoBD-Archivierung gesperrt. Entwürfe verbrauchen keine Nummer und kein Kontingent.`,
    fromCompany: "Von (Ihre Firma)",
    edit: "Bearbeiten",
    streetMissing: "Straße fehlt",
    taxIdMissing: "Steuernummer fehlt",
    noIban: "Keine IBAN",
  },
  fr: {
    loadingBuilder: "Chargement de l'éditeur de facture…",
    loading: "Chargement…",
    titleEditDraft: "Modifier le brouillon",
    titleNewCreditNote: "Nouvel avoir",
    titleNewInvoice: "Nouvelle facture",
    subtitle: "Les coordonnées de votre entreprise et votre compte bancaire sont renseignés automatiquement depuis les Paramètres. Le numéro de facture est attribué à la finalisation.",
    cancel: "Annuler",
    warnSellerIncomplete: "L'adresse ou le numéro fiscal de votre entreprise est incomplet — les factures échoueront à la validation.",
    completeSettings: "Compléter les paramètres →",
    errAddress: "Le nom du client et l'adresse complète sont requis.",
    errLineDesc: "Chaque ligne doit avoir une description.",
    errCreditRef: "Les avoirs doivent référencer le numéro de la facture d'origine (BT-25).",
    errLoad: "Échec du chargement",
    errSave: "Échec de l'enregistrement",
    docCard: "Document",
    fFormat: "Format",
    fType: "Type",
    fNumber: "Numéro",
    numberOnFinalize: (num) => `${num} (à la finalisation)`,
    typeInvoice: "Facture (380)",
    typeCreditNote: "Avoir (381)",
    fIssueDate: "Date d'émission",
    fDueDate: "Date d'échéance",
    fCurrency: "Devise",
    fBuyerRef: "Référence acheteur / Leitweg-ID (BT-10)",
    buyerRefRequired: "Requis pour XRechnung",
    buyerRefOptional: "Facultatif",
    fPoNumber: "N° de commande (BT-13)",
    fOrigInvoice: "N° de facture d'origine (BT-25) *",
    custCard: "Client",
    selectSaved: "Sélectionner un client enregistré…",
    noSaved: "Aucun client enregistré",
    fCompanyName: "Nom de l'entreprise *",
    fVatId: "N° de TVA (BT-48)",
    fInvoiceEmail: "E-mail de facturation (BT-49)",
    fStreet: "Rue *",
    fPostalCode: "Code postal *",
    fCity: "Ville *",
    fCountry: "Pays *",
    saveCustomer: "Enregistrer ce client pour les prochaines factures",
    lineCard: "Lignes",
    insertCatalog: "+ Insérer depuis le catalogue…",
    addLine: "Ajouter une ligne",
    fDescription: "Description *",
    fQty: "Qté",
    fUnit: "Unité",
    fUnitPrice: "Prix unitaire (net)",
    fVat: "TVA",
    removeLine: "Supprimer la ligne",
    units: { H87: "Pièce", HUR: "Heure", DAY: "Jour", MON: "Mois", C62: "Unité", KGM: "kg" },
    fPaymentTerms: "Conditions de paiement (BT-20)",
    fNotes: "Notes (BT-22, une par ligne)",
    summary: "Résumé",
    sNet: "Net",
    sVat: "TVA",
    sTotal: "Total",
    validateFinalize: "Valider & finaliser",
    saveDraft: "Enregistrer comme brouillon",
    finalizeHint: (num) => `La finalisation attribue ${num}, exécute le validateur EN 16931 et verrouille le document pour l'archivage GoBD. Les brouillons n'utilisent ni numéro ni quota.`,
    fromCompany: "De (votre entreprise)",
    edit: "Modifier",
    streetMissing: "Rue manquante",
    taxIdMissing: "N° fiscal manquant",
    noIban: "Pas d'IBAN",
  },
};

// ── Payments & receivables translations ──
export interface PaymentsStrings {
  title: string;
  subtitle: string;
  statCollected: string;
  statOpen: string;
  statSettlements: string;
  ageingTitle: string;
  ageingDesc: string;
  ageCurrent: string;
  age30: string;
  age60: string;
  age90: string;
  age90plus: string;
  recordTitle: string;
  recordDesc: string;
  fOpenInvoice: string;
  optDue: (money: string) => string;
  fAmount: string;
  fMethod: string;
  mSepaTransfer: string;
  mSepaDebit: string;
  mStripe: string;
  mOther: string;
  recordPayment: string;
  fRemittance: string;
  fValueDate: string;
  reconTitle: string;
  reconDesc: string;
  previewMatches: string;
  recordMatched: (n: number) => string;
  parsedSummary: (parsed: number, matched: number, unmatched: number) => string;
  referenceMatch: string;
  amountMatch: string;
  unmatched: string;
  noReference: string;
  ledgerTitle: string;
  loading: string;
  emptyTitle: string;
  emptyText: string;
  thInvoice: string;
  thCustomer: string;
  thGross: string;
  thPaid: string;
  thBalance: string;
  thPayState: string;
  dueLabel: string;
  payStatus: (v: string) => string;
  toastRecorded: (count: number, skipped: number) => string;
  toastReconFailed: string;
  toastCsvFailed: string;
  toastPaymentRecorded: string;
  toastPaymentFailed: string;
}

const PAY_EN: Record<string, string> = { UNPAID: "Unpaid", PARTIAL: "Partial", PAID: "Paid" };
const PAY_DE: Record<string, string> = { UNPAID: "Offen", PARTIAL: "Teilweise", PAID: "Bezahlt" };
const PAY_FR: Record<string, string> = { UNPAID: "Impayée", PARTIAL: "Partielle", PAID: "Payée" };

export const PAYMENTS_STRINGS: Record<AppLocale, PaymentsStrings> = {
  en: {
    title: "Payments & Receivables Reconciliation",
    subtitle: "Payment state is tracked independently from e-invoice delivery. Record full or partial SEPA transfers and monitor open balances.",
    statCollected: "Total Collected",
    statOpen: "Open Balance Due",
    statSettlements: "Recorded Settlements",
    ageingTitle: "Receivables Ageing",
    ageingDesc: "Open balance by days overdue (relative to each invoice's due date).",
    ageCurrent: "Current / not due",
    age30: "1–30 days",
    age60: "31–60 days",
    age90: "61–90 days",
    age90plus: "90+ days",
    recordTitle: "Record Full or Partial Payment",
    recordDesc: "Automatically updates invoice payment status (UNPAID -> PARTIAL -> PAID).",
    fOpenInvoice: "Open Invoice",
    optDue: (money) => `Due: ${money}`,
    fAmount: "Amount (€)",
    fMethod: "Method",
    mSepaTransfer: "SEPA Bank Transfer",
    mSepaDebit: "SEPA Direct Debit",
    mStripe: "Stripe / Card",
    mOther: "Other",
    recordPayment: "Record Payment",
    fRemittance: "Bank Remittance Reference (optional)",
    fValueDate: "Value Date",
    reconTitle: "Bank Statement Reconciliation",
    reconDesc: "Paste bank CSV (date, amount, reference). Matches credits to open invoices by remittance reference or unique amount — preview before recording.",
    previewMatches: "Preview matches",
    recordMatched: (n) => `Record ${n} matched payment${n === 1 ? "" : "s"}`,
    parsedSummary: (parsed, matched, unmatched) => `Parsed ${parsed} transaction(s) · ${matched} matched · ${unmatched} unmatched`,
    referenceMatch: "reference match",
    amountMatch: "amount match",
    unmatched: "Unmatched",
    noReference: "(no reference)",
    ledgerTitle: "Receivables Ledger",
    loading: "Loading receivables…",
    emptyTitle: "No finalized invoices yet",
    emptyText: "Finalized invoices will appear here for payment reconciliation.",
    thInvoice: "Invoice",
    thCustomer: "Customer",
    thGross: "Gross",
    thPaid: "Paid",
    thBalance: "Balance Due",
    thPayState: "Payment State",
    dueLabel: "Due:",
    payStatus: (v) => PAY_EN[v] ?? v,
    toastRecorded: (count, skipped) => `Recorded ${count} matched payment(s)${skipped ? `, skipped ${skipped} already-reconciled` : ""}.`,
    toastReconFailed: "Reconciliation failed",
    toastCsvFailed: "Could not parse CSV",
    toastPaymentRecorded: "Payment recorded and reconciled against invoice balance (GoBD logged).",
    toastPaymentFailed: "Payment failed",
  },
  de: {
    title: "Zahlungen & Forderungsabgleich",
    subtitle: "Der Zahlungsstatus wird unabhängig von der E-Rechnungszustellung geführt. Erfassen Sie vollständige oder Teilzahlungen (SEPA) und überwachen Sie offene Salden.",
    statCollected: "Gesamt eingenommen",
    statOpen: "Offener Saldo",
    statSettlements: "Erfasste Zahlungen",
    ageingTitle: "Forderungsalterung",
    ageingDesc: "Offener Saldo nach überfälligen Tagen (relativ zum Fälligkeitsdatum jeder Rechnung).",
    ageCurrent: "Aktuell / nicht fällig",
    age30: "1–30 Tage",
    age60: "31–60 Tage",
    age90: "61–90 Tage",
    age90plus: "90+ Tage",
    recordTitle: "Voll- oder Teilzahlung erfassen",
    recordDesc: "Aktualisiert automatisch den Zahlungsstatus der Rechnung (OFFEN -> TEILWEISE -> BEZAHLT).",
    fOpenInvoice: "Offene Rechnung",
    optDue: (money) => `Fällig: ${money}`,
    fAmount: "Betrag (€)",
    fMethod: "Methode",
    mSepaTransfer: "SEPA-Überweisung",
    mSepaDebit: "SEPA-Lastschrift",
    mStripe: "Stripe / Karte",
    mOther: "Sonstige",
    recordPayment: "Zahlung erfassen",
    fRemittance: "Bank-Verwendungszweck (optional)",
    fValueDate: "Wertstellungsdatum",
    reconTitle: "Kontoauszugsabgleich",
    reconDesc: "Bank-CSV einfügen (Datum, Betrag, Verwendungszweck). Ordnet Gutschriften offenen Rechnungen über Verwendungszweck oder eindeutigen Betrag zu — vor der Erfassung in der Vorschau.",
    previewMatches: "Treffer-Vorschau",
    recordMatched: (n) => `${n} zugeordnete Zahlung${n === 1 ? "" : "en"} erfassen`,
    parsedSummary: (parsed, matched, unmatched) => `${parsed} Transaktion(en) erkannt · ${matched} zugeordnet · ${unmatched} nicht zugeordnet`,
    referenceMatch: "Referenz-Treffer",
    amountMatch: "Betrags-Treffer",
    unmatched: "Nicht zugeordnet",
    noReference: "(kein Verwendungszweck)",
    ledgerTitle: "Forderungsbuch",
    loading: "Forderungen werden geladen…",
    emptyTitle: "Noch keine finalisierten Rechnungen",
    emptyText: "Finalisierte Rechnungen erscheinen hier zum Zahlungsabgleich.",
    thInvoice: "Rechnung",
    thCustomer: "Kunde",
    thGross: "Brutto",
    thPaid: "Bezahlt",
    thBalance: "Offener Betrag",
    thPayState: "Zahlungsstatus",
    dueLabel: "Fällig:",
    payStatus: (v) => PAY_DE[v] ?? v,
    toastRecorded: (count, skipped) => `${count} zugeordnete Zahlung(en) erfasst${skipped ? `, ${skipped} bereits abgeglichen übersprungen` : ""}.`,
    toastReconFailed: "Abgleich fehlgeschlagen",
    toastCsvFailed: "CSV konnte nicht gelesen werden",
    toastPaymentRecorded: "Zahlung erfasst und mit dem Rechnungssaldo abgeglichen (GoBD protokolliert).",
    toastPaymentFailed: "Zahlung fehlgeschlagen",
  },
  fr: {
    title: "Paiements & rapprochement des créances",
    subtitle: "Le statut de paiement est suivi indépendamment de la livraison de la facture. Enregistrez des virements SEPA complets ou partiels et surveillez les soldes ouverts.",
    statCollected: "Total encaissé",
    statOpen: "Solde ouvert dû",
    statSettlements: "Règlements enregistrés",
    ageingTitle: "Ancienneté des créances",
    ageingDesc: "Solde ouvert par jours de retard (par rapport à la date d'échéance de chaque facture).",
    ageCurrent: "À jour / non échu",
    age30: "1–30 jours",
    age60: "31–60 jours",
    age90: "61–90 jours",
    age90plus: "90+ jours",
    recordTitle: "Enregistrer un paiement total ou partiel",
    recordDesc: "Met à jour automatiquement le statut de paiement de la facture (IMPAYÉE -> PARTIELLE -> PAYÉE).",
    fOpenInvoice: "Facture ouverte",
    optDue: (money) => `Dû : ${money}`,
    fAmount: "Montant (€)",
    fMethod: "Méthode",
    mSepaTransfer: "Virement SEPA",
    mSepaDebit: "Prélèvement SEPA",
    mStripe: "Stripe / carte",
    mOther: "Autre",
    recordPayment: "Enregistrer le paiement",
    fRemittance: "Référence de remise bancaire (facultatif)",
    fValueDate: "Date de valeur",
    reconTitle: "Rapprochement du relevé bancaire",
    reconDesc: "Collez le CSV bancaire (date, montant, référence). Rapproche les crédits des factures ouvertes par référence de remise ou montant unique — aperçu avant enregistrement.",
    previewMatches: "Aperçu des correspondances",
    recordMatched: (n) => `Enregistrer ${n} paiement${n === 1 ? "" : "s"} rapproché${n === 1 ? "" : "s"}`,
    parsedSummary: (parsed, matched, unmatched) => `${parsed} transaction(s) analysée(s) · ${matched} rapprochée(s) · ${unmatched} non rapprochée(s)`,
    referenceMatch: "correspondance par référence",
    amountMatch: "correspondance par montant",
    unmatched: "Non rapprochée",
    noReference: "(aucune référence)",
    ledgerTitle: "Grand livre des créances",
    loading: "Chargement des créances…",
    emptyTitle: "Aucune facture finalisée pour l'instant",
    emptyText: "Les factures finalisées apparaîtront ici pour le rapprochement des paiements.",
    thInvoice: "Facture",
    thCustomer: "Client",
    thGross: "Brut",
    thPaid: "Payé",
    thBalance: "Solde dû",
    thPayState: "Statut de paiement",
    dueLabel: "Dû :",
    payStatus: (v) => PAY_FR[v] ?? v,
    toastRecorded: (count, skipped) => `${count} paiement(s) rapproché(s) enregistré(s)${skipped ? `, ${skipped} déjà rapproché(s) ignoré(s)` : ""}.`,
    toastReconFailed: "Échec du rapprochement",
    toastCsvFailed: "Impossible d'analyser le CSV",
    toastPaymentRecorded: "Paiement enregistré et rapproché du solde de la facture (consigné GoBD).",
    toastPaymentFailed: "Échec du paiement",
  },
};

// ── Customers translations ──
export interface CustomersStrings {
  title: string;
  subtitle: string;
  addCustomer: string;
  formEdit: string;
  formNew: string;
  fLegalName: string;
  fVatId: string;
  verifyVies: string;
  viesFailed: string;
  fLeitweg: string;
  fInvoiceEmail: string;
  fDefaultFormat: string;
  fStreet: string;
  fPostalCode: string;
  fCity: string;
  fCountry: string;
  cancel: string;
  updateCustomer: string;
  saveCustomer: string;
  searchPlaceholder: string;
  loading: string;
  emptyTitle: string;
  emptyText: string;
  addFirst: string;
  thCompany: string;
  thVat: string;
  thRouting: string;
  thActions: string;
  invoiceBtn: string;
  editTitle: string;
  deleteTitle: string;
  vatStatus: (v: string) => string;
  toastUpdated: (name: string) => string;
  toastAdded: (name: string) => string;
  toastSaveFailed: string;
  deletePrompt: (name: string) => string;
  toastRemoved: (name: string) => string;
  toastDeleteFailed: string;
}

const VAT_EN: Record<string, string> = { VERIFIED: "Verified", PROVISIONAL: "Provisional", INVALID: "Invalid", UNCHECKED: "Unchecked" };
const VAT_DE: Record<string, string> = { VERIFIED: "Verifiziert", PROVISIONAL: "Vorläufig", INVALID: "Ungültig", UNCHECKED: "Ungeprüft" };
const VAT_FR: Record<string, string> = { VERIFIED: "Vérifié", PROVISIONAL: "Provisoire", INVALID: "Invalide", UNCHECKED: "Non vérifié" };

export const CUSTOMERS_STRINGS: Record<AppLocale, CustomersStrings> = {
  en: {
    title: "Customers (BG-7)",
    subtitle: "Manage your B2B & B2G buyers with live EU VIES VAT verification, Leitweg-ID routing, and default e-invoice formats.",
    addCustomer: "Add customer",
    formEdit: "Edit customer",
    formNew: "New customer",
    fLegalName: "Legal Name (BT-44) *",
    fVatId: "EU VAT ID (BT-48)",
    verifyVies: "Verify VIES",
    viesFailed: "VIES lookup failed",
    fLeitweg: "Leitweg-ID / Buyer Ref (BT-10)",
    fInvoiceEmail: "Invoice Email (BT-49)",
    fDefaultFormat: "Default E-Invoice Format",
    fStreet: "Street & Number (BT-50)",
    fPostalCode: "Postal code",
    fCity: "City",
    fCountry: "Country",
    cancel: "Cancel",
    updateCustomer: "Update customer",
    saveCustomer: "Save customer",
    searchPlaceholder: "Search customer name, VAT ID, or city…",
    loading: "Loading customers…",
    emptyTitle: "No customers yet",
    emptyText: "Save your B2B/B2G buyers once to auto-fill invoices, VAT Reverse Charge rules, and Leitweg-IDs.",
    addFirst: "Add your first customer",
    thCompany: "Company",
    thVat: "EU VAT / VIES",
    thRouting: "Routing & Format",
    thActions: "Actions",
    invoiceBtn: "Invoice",
    editTitle: "Edit",
    deleteTitle: "Delete",
    vatStatus: (v) => VAT_EN[v] ?? v,
    toastUpdated: (name) => `Updated customer "${name}".`,
    toastAdded: (name) => `Added customer "${name}".`,
    toastSaveFailed: "Save failed",
    deletePrompt: (name) => `Delete customer "${name}"? Existing invoices are unaffected.`,
    toastRemoved: (name) => `Removed "${name}".`,
    toastDeleteFailed: "Delete failed",
  },
  de: {
    title: "Kunden (BG-7)",
    subtitle: "Verwalten Sie Ihre B2B- & B2G-Käufer mit Live-EU-VIES-USt-Prüfung, Leitweg-ID-Routing und Standard-E-Rechnungsformaten.",
    addCustomer: "Kunde hinzufügen",
    formEdit: "Kunde bearbeiten",
    formNew: "Neuer Kunde",
    fLegalName: "Firmenname (BT-44) *",
    fVatId: "EU-USt-IdNr. (BT-48)",
    verifyVies: "VIES prüfen",
    viesFailed: "VIES-Abfrage fehlgeschlagen",
    fLeitweg: "Leitweg-ID / Käuferref. (BT-10)",
    fInvoiceEmail: "Rechnungs-E-Mail (BT-49)",
    fDefaultFormat: "Standard-E-Rechnungsformat",
    fStreet: "Straße & Hausnummer (BT-50)",
    fPostalCode: "PLZ",
    fCity: "Stadt",
    fCountry: "Land",
    cancel: "Abbrechen",
    updateCustomer: "Kunde aktualisieren",
    saveCustomer: "Kunde speichern",
    searchPlaceholder: "Kundenname, USt-IdNr. oder Stadt suchen…",
    loading: "Kunden werden geladen…",
    emptyTitle: "Noch keine Kunden",
    emptyText: "Speichern Sie Ihre B2B-/B2G-Käufer einmalig, um Rechnungen, Reverse-Charge-Regeln und Leitweg-IDs automatisch auszufüllen.",
    addFirst: "Ersten Kunden hinzufügen",
    thCompany: "Firma",
    thVat: "EU-USt / VIES",
    thRouting: "Routing & Format",
    thActions: "Aktionen",
    invoiceBtn: "Rechnung",
    editTitle: "Bearbeiten",
    deleteTitle: "Löschen",
    vatStatus: (v) => VAT_DE[v] ?? v,
    toastUpdated: (name) => `Kunde „${name}“ aktualisiert.`,
    toastAdded: (name) => `Kunde „${name}“ hinzugefügt.`,
    toastSaveFailed: "Speichern fehlgeschlagen",
    deletePrompt: (name) => `Kunde „${name}“ löschen? Bestehende Rechnungen bleiben unberührt.`,
    toastRemoved: (name) => `„${name}“ entfernt.`,
    toastDeleteFailed: "Löschen fehlgeschlagen",
  },
  fr: {
    title: "Clients (BG-7)",
    subtitle: "Gérez vos acheteurs B2B & B2G avec vérification TVA VIES UE en direct, routage Leitweg-ID et formats de facture par défaut.",
    addCustomer: "Ajouter un client",
    formEdit: "Modifier le client",
    formNew: "Nouveau client",
    fLegalName: "Raison sociale (BT-44) *",
    fVatId: "N° de TVA UE (BT-48)",
    verifyVies: "Vérifier VIES",
    viesFailed: "Échec de la recherche VIES",
    fLeitweg: "Leitweg-ID / réf. acheteur (BT-10)",
    fInvoiceEmail: "E-mail de facturation (BT-49)",
    fDefaultFormat: "Format de facture par défaut",
    fStreet: "Rue & numéro (BT-50)",
    fPostalCode: "Code postal",
    fCity: "Ville",
    fCountry: "Pays",
    cancel: "Annuler",
    updateCustomer: "Mettre à jour le client",
    saveCustomer: "Enregistrer le client",
    searchPlaceholder: "Rechercher nom de client, n° de TVA ou ville…",
    loading: "Chargement des clients…",
    emptyTitle: "Aucun client pour l'instant",
    emptyText: "Enregistrez vos acheteurs B2B/B2G une fois pour pré-remplir les factures, les règles d'autoliquidation et les Leitweg-ID.",
    addFirst: "Ajouter votre premier client",
    thCompany: "Entreprise",
    thVat: "TVA UE / VIES",
    thRouting: "Routage & format",
    thActions: "Actions",
    invoiceBtn: "Facturer",
    editTitle: "Modifier",
    deleteTitle: "Supprimer",
    vatStatus: (v) => VAT_FR[v] ?? v,
    toastUpdated: (name) => `Client « ${name} » mis à jour.`,
    toastAdded: (name) => `Client « ${name} » ajouté.`,
    toastSaveFailed: "Échec de l'enregistrement",
    deletePrompt: (name) => `Supprimer le client « ${name} » ? Les factures existantes ne sont pas affectées.`,
    toastRemoved: (name) => `« ${name} » supprimé.`,
    toastDeleteFailed: "Échec de la suppression",
  },
};

// ── Products & services catalog translations ──
export interface CatalogStrings {
  title: string;
  subtitle: string;
  addItem: string;
  formEdit: string;
  formNew: string;
  fName: string;
  fSku: string;
  fDescription: string;
  fUnit: string;
  unitHour: string;
  unitDay: string;
  unitMonth: string;
  unitPiece: string;
  unitUnit: string;
  fNetPrice: string;
  fDefaultVat: string;
  cancel: string;
  saveItem: string;
  savedItems: (n: number) => string;
  loading: string;
  emptyTitle: string;
  emptyText: string;
  addFirst: string;
  thSkuItem: string;
  thUnit: string;
  thNetPrice: string;
  thVat: string;
  thActions: string;
  toastUpdated: (name: string) => string;
  toastAdded: (name: string) => string;
  toastSaveFailed: string;
  deletePrompt: (name: string) => string;
  toastRemoved: (name: string) => string;
}

export const CATALOG_STRINGS: Record<AppLocale, CatalogStrings> = {
  en: {
    title: "Products & Service Rates Catalog",
    subtitle: "Save reusable services, hourly rates, and SaaS SKUs to insert them into invoices with one click.",
    addItem: "Add item",
    formEdit: "Edit catalog item",
    formNew: "New catalog item",
    fName: "Item / Service Name *",
    fSku: "SKU / Code",
    fDescription: "Description",
    fUnit: "Unit (UN/ECE)",
    unitHour: "Hour (HUR)",
    unitDay: "Day (DAY)",
    unitMonth: "Month (MON)",
    unitPiece: "Piece (H87)",
    unitUnit: "Unit (C62)",
    fNetPrice: "Net Unit Price (€)",
    fDefaultVat: "Default VAT",
    cancel: "Cancel",
    saveItem: "Save item",
    savedItems: (n) => `Saved Items (${n})`,
    loading: "Loading catalog…",
    emptyTitle: "No products or rates saved yet",
    emptyText: "Add your recurring services, hourly rates, or SKUs to speed up invoicing.",
    addFirst: "Add first item",
    thSkuItem: "SKU / Item",
    thUnit: "Unit",
    thNetPrice: "Net Price",
    thVat: "VAT",
    thActions: "Actions",
    toastUpdated: (name) => `Updated "${name}".`,
    toastAdded: (name) => `Added "${name}" to your catalog.`,
    toastSaveFailed: "Save failed",
    deletePrompt: (name) => `Delete "${name}" from catalog?`,
    toastRemoved: (name) => `Removed "${name}".`,
  },
  de: {
    title: "Produkt- & Leistungskatalog",
    subtitle: "Speichern Sie wiederverwendbare Leistungen, Stundensätze und SaaS-Artikel, um sie mit einem Klick in Rechnungen einzufügen.",
    addItem: "Artikel hinzufügen",
    formEdit: "Katalogartikel bearbeiten",
    formNew: "Neuer Katalogartikel",
    fName: "Artikel- / Leistungsname *",
    fSku: "Artikelnr. / Code",
    fDescription: "Beschreibung",
    fUnit: "Einheit (UN/ECE)",
    unitHour: "Stunde (HUR)",
    unitDay: "Tag (DAY)",
    unitMonth: "Monat (MON)",
    unitPiece: "Stück (H87)",
    unitUnit: "Einheit (C62)",
    fNetPrice: "Netto-Einzelpreis (€)",
    fDefaultVat: "Standard-USt.",
    cancel: "Abbrechen",
    saveItem: "Artikel speichern",
    savedItems: (n) => `Gespeicherte Artikel (${n})`,
    loading: "Katalog wird geladen…",
    emptyTitle: "Noch keine Produkte oder Sätze gespeichert",
    emptyText: "Fügen Sie Ihre wiederkehrenden Leistungen, Stundensätze oder Artikel hinzu, um die Rechnungsstellung zu beschleunigen.",
    addFirst: "Ersten Artikel hinzufügen",
    thSkuItem: "Artikelnr. / Artikel",
    thUnit: "Einheit",
    thNetPrice: "Nettopreis",
    thVat: "USt.",
    thActions: "Aktionen",
    toastUpdated: (name) => `„${name}“ aktualisiert.`,
    toastAdded: (name) => `„${name}“ zu Ihrem Katalog hinzugefügt.`,
    toastSaveFailed: "Speichern fehlgeschlagen",
    deletePrompt: (name) => `„${name}“ aus dem Katalog löschen?`,
    toastRemoved: (name) => `„${name}“ entfernt.`,
  },
  fr: {
    title: "Catalogue de produits & tarifs de services",
    subtitle: "Enregistrez des services réutilisables, des tarifs horaires et des références SaaS pour les insérer dans les factures en un clic.",
    addItem: "Ajouter un article",
    formEdit: "Modifier l'article du catalogue",
    formNew: "Nouvel article du catalogue",
    fName: "Nom de l'article / du service *",
    fSku: "Référence / code",
    fDescription: "Description",
    fUnit: "Unité (UN/ECE)",
    unitHour: "Heure (HUR)",
    unitDay: "Jour (DAY)",
    unitMonth: "Mois (MON)",
    unitPiece: "Pièce (H87)",
    unitUnit: "Unité (C62)",
    fNetPrice: "Prix unitaire net (€)",
    fDefaultVat: "TVA par défaut",
    cancel: "Annuler",
    saveItem: "Enregistrer l'article",
    savedItems: (n) => `Articles enregistrés (${n})`,
    loading: "Chargement du catalogue…",
    emptyTitle: "Aucun produit ou tarif enregistré pour l'instant",
    emptyText: "Ajoutez vos services récurrents, tarifs horaires ou références pour accélérer la facturation.",
    addFirst: "Ajouter le premier article",
    thSkuItem: "Référence / article",
    thUnit: "Unité",
    thNetPrice: "Prix net",
    thVat: "TVA",
    thActions: "Actions",
    toastUpdated: (name) => `« ${name} » mis à jour.`,
    toastAdded: (name) => `« ${name} » ajouté à votre catalogue.`,
    toastSaveFailed: "Échec de l'enregistrement",
    deletePrompt: (name) => `Supprimer « ${name} » du catalogue ?`,
    toastRemoved: (name) => `« ${name} » supprimé.`,
  },
};

// ── Workspace settings translations ──
export interface SettingsStrings {
  pageTitle: string;
  pageSubtitle: string;
  saveChanges: string;
  loading: string;
  tabCompany: string;
  tabInvoicing: string;
  tabIntegrations: string;
  tabTeam: string;
  tabApiKeys: string;
  tabBilling: string;
  tabSecurity: string;
  // company tab
  companyTitle: string;
  companyDesc: string;
  fLegalName: string;
  fTradingName: string;
  fManagingDirector: string;
  fRegistrationId: string;
  fStreet: string;
  fPostalCode: string;
  fCity: string;
  fCountry: string;
  fVatId: string;
  checkVies: string;
  fTaxNumber: string;
  fKleinunternehmer: string;
  fElectronicAddress: string;
  fContactName: string;
  fContactPhone: string;
  fContactEmail: string;
  fLogo: string;
  noLogo: string;
  removeLogo: string;
  designHeading: string;
  fAccentColor: string;
  fAccentBand: string;
  fFooterText: string;
  designHint: string;
  // invoicing tab
  invoicingTitle: string;
  invoicingDesc: string;
  fIban: string;
  ibanValid: string;
  ibanInvalid: string;
  fBic: string;
  fAccountHolder: string;
  fInvoicePrefix: string;
  fCreditPrefix: string;
  fNextSeq: string;
  nextInvoice: string;
  fDefaultFormat: string;
  fDocLanguage: string;
  fDueDays: string;
  fRetention: string;
  retention8: string;
  retention10: string;
  fPaymentTerms: string;
  fFooterNotes: string;
  // integrations tab
  rotatedSecret: (provider: string) => string;
  copy: string;
  stripeTitle: string;
  stripeDesc: string;
  wooTitle: string;
  wooDesc: string;
  shopifyTitle: string;
  shopifyDesc: string;
  shopifyUrlLabel: string;
  shopifyPlaceholder: string;
  stripeUrlLabel: string;
  wooUrlLabel: string;
  storedSecret: string;
  notSet: string;
  save: string;
  rotateSecret: string;
  stripePlaceholder: string;
  wooPlaceholder: string;
  accountantTitle: string;
  accountantDesc: string;
  saveCc: string;
  fAccountantCc: string;
  logsTitle: string;
  logsEmpty: string;
  thTime: string;
  thProvider: string;
  thEvent: string;
  thHttp: string;
  thSummary: string;
  // team tab
  inviteTitle: string;
  inviteDesc: string;
  fEmail: string;
  fFullName: string;
  fRole: string;
  roleAccountant: string;
  roleMember: string;
  roleAdmin: string;
  roleOwner: string;
  invite: string;
  membersTitle: (n: number) => string;
  thMember: string;
  thRole: string;
  thJoined: string;
  thAction: string;
  remove: string;
  removeMemberConfirm: string;
  // api keys tab
  keyCreatedAlert: string;
  generateKeyTitle: string;
  generateKeyDesc: string;
  fKeyLabel: string;
  createKey: string;
  issuedKeys: (n: number) => string;
  keysEmpty: string;
  thName: string;
  thPrefix: string;
  thScopes: string;
  thStatus: string;
  statusRevoked: string;
  statusActive: string;
  revoke: string;
  revokeConfirm: string;
  // billing tab
  subTitle: string;
  cancelRenewal: string;
  cancelRenewalConfirm: string;
  activePlan: string;
  trial15: string;
  trialDaysLeft: (n: number) => string;
  renewalCancelled: string;
  finalizedThisMonth: string;
  recommended: string;
  currentPlan: string;
  switchTo: (name: string) => string;
  planFreeDesc: string;
  planStarterDesc: string;
  planSoloDesc: string;
  planBusinessDesc: string;
  planAgencyDesc: string;
  quotaInvoices: (n: string) => string;
  // security tab
  changePwTitle: string;
  changePwDesc: string;
  fCurrentPw: string;
  fNewPw: string;
  updatePw: string;
  gdprTitle: string;
  gdprDesc: string;
  gdprExport: string;
  dangerZone: string;
  dangerText: string;
  deletePlaceholder: string;
  deleteBtn: string;
  chainTitle: string;
  chainVerified: (n: number) => string;
  chainPending: string;
  reverify: string;
  thRef: string;
  thActor: string;
  thHash: string;
  // toasts
  tSaved: string;
  tSaveFailed: string;
  tLoadFailed: string;
  tViesFailed: string;
  tLogoTooBig: string;
  tIntegrationUpdated: (provider: string) => string;
  tIntegrationFailed: string;
  tMemberInvited: string;
  tInviteFailed: string;
  tMemberRemoved: string;
  tRemoveFailed: string;
  tKeyCreationFailed: string;
  tKeyRevoked: string;
  tRevokeFailed: string;
  tPlanSwitched: (tier: string) => string;
  tPlanFailed: string;
  tPwUpdated: string;
  tPwFailed: string;
  tDeleteTypeError: string;
  tDeletionFailed: string;
  tCopied: string;
  tCancellationFailed: string;
}

export const SETTINGS_STRINGS: Record<AppLocale, SettingsStrings> = {
  en: {
    pageTitle: "Workspace Settings",
    pageSubtitle: "Configure your EN 16931 legal profile, SEPA banking, sequential numbering, tenant webhooks, team RBAC, API keys, billing, and GDPR controls.",
    saveChanges: "Save changes",
    loading: "Loading workspace settings…",
    tabCompany: "Company & Tax",
    tabInvoicing: "Invoicing & Banking",
    tabIntegrations: "Integrations",
    tabTeam: "Team & RBAC",
    tabApiKeys: "API Keys",
    tabBilling: "Billing & Quota",
    tabSecurity: "Security & GDPR",
    companyTitle: "Company Legal & Tax Profile (EN 16931 BG-4)",
    companyDesc: "Embedded automatically into every ZUGFeRD, Factur-X, XRechnung & Peppol document you issue.",
    fLegalName: "Legal Company Name (BT-27) *",
    fTradingName: "Trading Name (BT-28)",
    fManagingDirector: "Managing Director (§ 35a GmbHG)",
    fRegistrationId: "Commercial Register / HRB / SIREN (BT-30)",
    fStreet: "Street & House Number (BT-35)",
    fPostalCode: "Postal Code",
    fCity: "City",
    fCountry: "Country",
    fVatId: "EU VAT ID (BT-31)",
    checkVies: "Check VIES",
    fTaxNumber: "National Tax Number / Steuernummer (BT-32)",
    fKleinunternehmer: "Kleinunternehmer (§ 19 UStG) — VAT-exempt small business",
    fElectronicAddress: "Electronic Address / Endpoint (BT-34)",
    fContactName: "Billing Contact Name (BG-6 / BT-41)",
    fContactPhone: "Contact Phone (BT-42)",
    fContactEmail: "Contact Email (BT-43)",
    fLogo: "Company Logo (for PDF/A-3 header, max 180 KB)",
    noLogo: "No logo",
    removeLogo: "Remove",
    designHeading: "Invoice Design (PDF branding)",
    fAccentColor: "Accent color",
    fAccentBand: "Show an accent band under the header",
    fFooterText: "Custom invoice footer line",
    designHint: "Branding applies to the human-readable PDF only — the embedded EN 16931 XML is never changed.",
    invoicingTitle: "Invoicing Defaults, Sequential Numbering & SEPA Banking (BG-16)",
    invoicingDesc: "IBAN is validated using ISO 13616 MOD-97 on both client and server.",
    fIban: "IBAN (BT-84)",
    ibanValid: "✓ Valid ISO 13616 MOD-97 IBAN checksum",
    ibanInvalid: "✗ Invalid IBAN checksum — server will reject invalid IBANs",
    fBic: "BIC (BT-86)",
    fAccountHolder: "Account Holder (BT-85)",
    fInvoicePrefix: "Invoice Prefix",
    fCreditPrefix: "Credit Note Prefix (TypeCode 381)",
    fNextSeq: "Next Sequence Number",
    nextInvoice: "Next invoice:",
    fDefaultFormat: "Default Format",
    fDocLanguage: "Default Document Language",
    fDueDays: "Default Payment Due Days",
    fRetention: "GoBD Archive Retention Period",
    retention8: "8 Years (Germany BEG IV / § 147 AO)",
    retention10: "10 Years (France / Commercial Code)",
    fPaymentTerms: "Default Payment Terms (BT-20)",
    fFooterNotes: "Default Invoice Footer Notes (BT-22)",
    rotatedSecret: (provider) => `New ${provider} signing secret (copy now — shown once):`,
    copy: "Copy",
    stripeTitle: "Stripe E-Invoice Bridge",
    stripeDesc: "Tenant-scoped endpoint. Every request is verified with HMAC-SHA256 + 5-min replay protection.",
    wooTitle: "WooCommerce Plugin Bridge",
    wooDesc: "Paste this URL & signing secret into WooCommerce → NormInvoice EU E-Invoice.",
    shopifyTitle: "Shopify Order Bridge",
    shopifyDesc: "Add this URL as an orders/paid webhook in Shopify; verified with the app's HMAC-SHA256 signing secret.",
    shopifyUrlLabel: "Your Shopify Webhook URL",
    shopifyPlaceholder: "Paste Shopify webhook secret…",
    stripeUrlLabel: "Your Stripe Webhook URL",
    wooUrlLabel: "Your WooCommerce Webhook URL",
    storedSecret: "Stored secret:",
    notSet: "Not set",
    save: "Save",
    rotateSecret: "Generate / Rotate Secret",
    stripePlaceholder: "Paste Stripe whsec_...",
    wooPlaceholder: "Custom signing secret...",
    accountantTitle: "Accountant Auto-CC Email",
    accountantDesc: "Automatically CC your German Steuerberater or French Expert-comptable whenever an e-invoice is emailed.",
    saveCc: "Save CC",
    fAccountantCc: "Accountant CC Email",
    logsTitle: "Recent Webhook Delivery Logs",
    logsEmpty: "No webhook deliveries logged for your workspace yet.",
    thTime: "Time",
    thProvider: "Provider",
    thEvent: "Event",
    thHttp: "HTTP",
    thSummary: "Summary",
    inviteTitle: "Invite Team Member or Tax Advisor",
    inviteDesc: "Assign least-privilege RBAC roles (Owner, Admin, Accountant read/export, Member).",
    fEmail: "Email *",
    fFullName: "Full Name",
    fRole: "Role",
    roleAccountant: "Accountant (Read & Export)",
    roleMember: "Member (Create Invoices)",
    roleAdmin: "Admin (Manage Settings)",
    roleOwner: "Owner (Full Access)",
    invite: "Invite",
    membersTitle: (n) => `Workspace Members (${n})`,
    thMember: "Member",
    thRole: "Role",
    thJoined: "Joined",
    thAction: "Action",
    remove: "Remove",
    removeMemberConfirm: "Remove this team member from your workspace?",
    keyCreatedAlert: "Copy your new API key now — it is hashed with SHA-256 and will never be shown again:",
    generateKeyTitle: "Generate Tenant-Scoped API Key",
    generateKeyDesc: "Use as Authorization: Bearer ni_live_... against /api/v1/validate, /api/v1/invoices, and /api/v1/exports/*.",
    fKeyLabel: "Key Label",
    createKey: "Create API Key",
    issuedKeys: (n) => `Issued Keys (${n})`,
    keysEmpty: "No API keys created yet.",
    thName: "Name",
    thPrefix: "Prefix",
    thScopes: "Scopes",
    thStatus: "Status",
    statusRevoked: "Revoked",
    statusActive: "Active",
    revoke: "Revoke",
    revokeConfirm: "Revoke this API key immediately? Any clients using it will receive HTTP 401.",
    subTitle: "Current Subscription & Monthly Usage",
    cancelRenewal: "Cancel Renewal",
    cancelRenewalConfirm: "Cancel upcoming subscription renewal? Your current access remains active through the end of the period.",
    activePlan: "Active Plan",
    trial15: "15-Day Free Trial",
    trialDaysLeft: (n) => `${n} day${n === 1 ? "" : "s"} left · No credit card required`,
    renewalCancelled: "Renewal cancelled — access continues until end of current billing cycle.",
    finalizedThisMonth: "Finalized E-Invoices This Month",
    recommended: "Recommended",
    currentPlan: "Current Plan",
    switchTo: (name) => `Switch to ${name}`,
    planFreeDesc: "Ongoing free validation & occasional invoices",
    planStarterDesc: "Freelancers & Kleinunternehmer: inbox & SEPA pay links",
    planSoloDesc: "Main plan: recurring, inbox, automations & DATEV/FEC",
    planBusinessDesc: "Stripe, WooCommerce, multi-user RBAC & GoBD",
    planAgencyDesc: "High-volume, multi-client & REST API teams",
    quotaInvoices: (n) => `${n} invoices / mo`,
    changePwTitle: "Change Account Password",
    changePwDesc: "Hashed with scrypt (per-user random salt).",
    fCurrentPw: "Current Password",
    fNewPw: "New Password (min 8 chars, letters + numbers)",
    updatePw: "Update Password",
    gdprTitle: "GDPR Data Portability (Art. 20) & Erasure (Art. 17)",
    gdprDesc: "Full sovereignty over your company data hosted in the EU.",
    gdprExport: "Download Full GDPR Art. 20 JSON Export",
    dangerZone: "Danger Zone — Permanent Workspace Erasure (Art. 17 GDPR)",
    dangerText: "Permanently deletes your organization, customers, invoices, API keys, and audit logs. Export your GoBD archive first!",
    deletePlaceholder: "Type DELETE_MY_WORKSPACE",
    deleteBtn: "Delete",
    chainTitle: "Live GoBD SHA-256 Audit Hash-Chain Integrity",
    chainVerified: (n) => `VERIFIED — All ${n} append-only events cryptographically linked with zero tampering.`,
    chainPending: "Verification pending",
    reverify: "Re-verify Chain",
    thRef: "Ref",
    thActor: "Actor",
    thHash: "SHA-256 Event Hash",
    tSaved: "Settings saved and logged in GoBD audit trail.",
    tSaveFailed: "Save failed",
    tLoadFailed: "Failed to load settings",
    tViesFailed: "VIES failed",
    tLogoTooBig: "Logo must be smaller than 180 KB (PNG/JPG/SVG).",
    tIntegrationUpdated: (provider) => `${provider} integration updated (AES-256-GCM encrypted at rest).`,
    tIntegrationFailed: "Integration update failed",
    tMemberInvited: "Team member invited.",
    tInviteFailed: "Invite failed",
    tMemberRemoved: "Member removed.",
    tRemoveFailed: "Remove failed",
    tKeyCreationFailed: "Key creation failed",
    tKeyRevoked: "API key revoked.",
    tRevokeFailed: "Revoke failed",
    tPlanSwitched: (tier) => `Switched to ${tier}.`,
    tPlanFailed: "Plan update failed",
    tPwUpdated: "Password updated securely with scrypt.",
    tPwFailed: "Password change failed",
    tDeleteTypeError: 'Type "DELETE_MY_WORKSPACE" exactly to confirm.',
    tDeletionFailed: "Deletion failed",
    tCopied: "Copied to clipboard.",
    tCancellationFailed: "Cancellation failed",
  },
  de: {
    pageTitle: "Workspace-Einstellungen",
    pageSubtitle: "Konfigurieren Sie Ihr EN-16931-Rechtsprofil, SEPA-Bankdaten, fortlaufende Nummerierung, Mandanten-Webhooks, Team-RBAC, API-Schlüssel, Abrechnung und DSGVO-Kontrollen.",
    saveChanges: "Änderungen speichern",
    loading: "Workspace-Einstellungen werden geladen…",
    tabCompany: "Firma & Steuer",
    tabInvoicing: "Rechnung & Bank",
    tabIntegrations: "Integrationen",
    tabTeam: "Team & RBAC",
    tabApiKeys: "API-Schlüssel",
    tabBilling: "Abrechnung & Kontingent",
    tabSecurity: "Sicherheit & DSGVO",
    companyTitle: "Rechtliches & steuerliches Firmenprofil (EN 16931 BG-4)",
    companyDesc: "Wird automatisch in jedes ausgestellte ZUGFeRD-, Factur-X-, XRechnung- & Peppol-Dokument eingebettet.",
    fLegalName: "Rechtlicher Firmenname (BT-27) *",
    fTradingName: "Handelsname (BT-28)",
    fManagingDirector: "Geschäftsführer (§ 35a GmbHG)",
    fRegistrationId: "Handelsregister / HRB / SIREN (BT-30)",
    fStreet: "Straße & Hausnummer (BT-35)",
    fPostalCode: "PLZ",
    fCity: "Stadt",
    fCountry: "Land",
    fVatId: "EU-USt-IdNr. (BT-31)",
    checkVies: "VIES prüfen",
    fTaxNumber: "Nationale Steuernummer (BT-32)",
    fKleinunternehmer: "Kleinunternehmer (§ 19 UStG) — umsatzsteuerbefreit",
    fElectronicAddress: "Elektronische Adresse / Endpunkt (BT-34)",
    fContactName: "Name Rechnungskontakt (BG-6 / BT-41)",
    fContactPhone: "Kontakttelefon (BT-42)",
    fContactEmail: "Kontakt-E-Mail (BT-43)",
    fLogo: "Firmenlogo (für PDF/A-3-Kopf, max. 180 KB)",
    noLogo: "Kein Logo",
    removeLogo: "Entfernen",
    designHeading: "Rechnungsdesign (PDF-Branding)",
    fAccentColor: "Akzentfarbe",
    fAccentBand: "Akzentleiste unter der Kopfzeile anzeigen",
    fFooterText: "Eigene Fußzeile der Rechnung",
    designHint: "Das Branding gilt nur für das lesbare PDF — die eingebettete EN-16931-XML wird nie verändert.",
    invoicingTitle: "Rechnungsvorgaben, fortlaufende Nummerierung & SEPA-Bankdaten (BG-16)",
    invoicingDesc: "Die IBAN wird per ISO 13616 MOD-97 auf Client und Server geprüft.",
    fIban: "IBAN (BT-84)",
    ibanValid: "✓ Gültige ISO-13616-MOD-97-IBAN-Prüfsumme",
    ibanInvalid: "✗ Ungültige IBAN-Prüfsumme — der Server weist ungültige IBANs ab",
    fBic: "BIC (BT-86)",
    fAccountHolder: "Kontoinhaber (BT-85)",
    fInvoicePrefix: "Rechnungspräfix",
    fCreditPrefix: "Gutschriftspräfix (TypeCode 381)",
    fNextSeq: "Nächste laufende Nummer",
    nextInvoice: "Nächste Rechnung:",
    fDefaultFormat: "Standardformat",
    fDocLanguage: "Standard-Dokumentsprache",
    fDueDays: "Standard-Zahlungsziel (Tage)",
    fRetention: "GoBD-Archiv-Aufbewahrungsfrist",
    retention8: "8 Jahre (Deutschland BEG IV / § 147 AO)",
    retention10: "10 Jahre (Frankreich / Handelsgesetzbuch)",
    fPaymentTerms: "Standard-Zahlungsbedingungen (BT-20)",
    fFooterNotes: "Standard-Rechnungsfußnoten (BT-22)",
    rotatedSecret: (provider) => `Neues ${provider}-Signaturgeheimnis (jetzt kopieren — nur einmal sichtbar):`,
    copy: "Kopieren",
    stripeTitle: "Stripe-E-Rechnungs-Bridge",
    stripeDesc: "Mandantenbezogener Endpunkt. Jede Anfrage wird mit HMAC-SHA256 + 5-Min-Replay-Schutz geprüft.",
    wooTitle: "WooCommerce-Plugin-Bridge",
    wooDesc: "Fügen Sie diese URL & das Signaturgeheimnis in WooCommerce → NormInvoice EU E-Invoice ein.",
    shopifyTitle: "Shopify-Bestell-Bridge",
    shopifyDesc: "Fügen Sie diese URL als orders/paid-Webhook in Shopify hinzu; verifiziert mit dem HMAC-SHA256-Signaturgeheimnis der App.",
    shopifyUrlLabel: "Ihre Shopify-Webhook-URL",
    shopifyPlaceholder: "Shopify-Webhook-Geheimnis einfügen…",
    stripeUrlLabel: "Ihre Stripe-Webhook-URL",
    wooUrlLabel: "Ihre WooCommerce-Webhook-URL",
    storedSecret: "Gespeichertes Geheimnis:",
    notSet: "Nicht gesetzt",
    save: "Speichern",
    rotateSecret: "Geheimnis erzeugen / erneuern",
    stripePlaceholder: "Stripe whsec_... einfügen",
    wooPlaceholder: "Eigenes Signaturgeheimnis...",
    accountantTitle: "Automatische Steuerberater-CC-E-Mail",
    accountantDesc: "Setzt Ihren Steuerberater automatisch auf CC, sobald eine E-Rechnung per E-Mail versendet wird.",
    saveCc: "CC speichern",
    fAccountantCc: "Steuerberater-CC-E-Mail",
    logsTitle: "Letzte Webhook-Zustellprotokolle",
    logsEmpty: "Noch keine Webhook-Zustellungen für Ihren Workspace protokolliert.",
    thTime: "Zeit",
    thProvider: "Anbieter",
    thEvent: "Ereignis",
    thHttp: "HTTP",
    thSummary: "Zusammenfassung",
    inviteTitle: "Teammitglied oder Steuerberater einladen",
    inviteDesc: "Weisen Sie restriktive RBAC-Rollen zu (Inhaber, Admin, Steuerberater Lesen/Export, Mitglied).",
    fEmail: "E-Mail *",
    fFullName: "Vollständiger Name",
    fRole: "Rolle",
    roleAccountant: "Steuerberater (Lesen & Export)",
    roleMember: "Mitglied (Rechnungen erstellen)",
    roleAdmin: "Admin (Einstellungen verwalten)",
    roleOwner: "Inhaber (Vollzugriff)",
    invite: "Einladen",
    membersTitle: (n) => `Workspace-Mitglieder (${n})`,
    thMember: "Mitglied",
    thRole: "Rolle",
    thJoined: "Beigetreten",
    thAction: "Aktion",
    remove: "Entfernen",
    removeMemberConfirm: "Dieses Teammitglied aus Ihrem Workspace entfernen?",
    keyCreatedAlert: "Kopieren Sie Ihren neuen API-Schlüssel jetzt — er wird mit SHA-256 gehasht und nie wieder angezeigt:",
    generateKeyTitle: "Mandantenbezogenen API-Schlüssel erzeugen",
    generateKeyDesc: "Als Authorization: Bearer ni_live_... für /api/v1/validate, /api/v1/invoices und /api/v1/exports/* verwenden.",
    fKeyLabel: "Schlüsselbezeichnung",
    createKey: "API-Schlüssel erstellen",
    issuedKeys: (n) => `Ausgestellte Schlüssel (${n})`,
    keysEmpty: "Noch keine API-Schlüssel erstellt.",
    thName: "Name",
    thPrefix: "Präfix",
    thScopes: "Berechtigungen",
    thStatus: "Status",
    statusRevoked: "Widerrufen",
    statusActive: "Aktiv",
    revoke: "Widerrufen",
    revokeConfirm: "Diesen API-Schlüssel sofort widerrufen? Clients, die ihn verwenden, erhalten HTTP 401.",
    subTitle: "Aktuelles Abonnement & monatliche Nutzung",
    cancelRenewal: "Verlängerung kündigen",
    cancelRenewalConfirm: "Bevorstehende Abo-Verlängerung kündigen? Ihr aktueller Zugang bleibt bis zum Ende des Zeitraums aktiv.",
    activePlan: "Aktiver Tarif",
    trial15: "15-tägige Testphase",
    trialDaysLeft: (n) => `noch ${n} Tag${n === 1 ? "" : "e"} · keine Kreditkarte erforderlich`,
    renewalCancelled: "Verlängerung gekündigt — Zugang bis zum Ende des aktuellen Abrechnungszeitraums.",
    finalizedThisMonth: "Finalisierte E-Rechnungen diesen Monat",
    recommended: "Empfohlen",
    currentPlan: "Aktueller Tarif",
    switchTo: (name) => `Zu ${name} wechseln`,
    planFreeDesc: "Dauerhaft kostenlose Prüfung & gelegentliche Rechnungen",
    planStarterDesc: "Freiberufler & Kleinunternehmer: Posteingang & SEPA-Zahllinks",
    planSoloDesc: "Haupttarif: wiederkehrend, Posteingang, Automatisierung & DATEV/FEC",
    planBusinessDesc: "Stripe, WooCommerce, Mehrbenutzer-RBAC & GoBD",
    planAgencyDesc: "Hohes Volumen, Mehrmandanten & REST-API-Teams",
    quotaInvoices: (n) => `${n} Rechnungen / Mon.`,
    changePwTitle: "Konto-Passwort ändern",
    changePwDesc: "Gehasht mit scrypt (zufälliger Salt pro Nutzer).",
    fCurrentPw: "Aktuelles Passwort",
    fNewPw: "Neues Passwort (mind. 8 Zeichen, Buchstaben + Zahlen)",
    updatePw: "Passwort aktualisieren",
    gdprTitle: "DSGVO-Datenportabilität (Art. 20) & Löschung (Art. 17)",
    gdprDesc: "Volle Hoheit über Ihre in der EU gehosteten Firmendaten.",
    gdprExport: "Vollständigen DSGVO-Art.-20-JSON-Export herunterladen",
    dangerZone: "Gefahrenzone — Dauerhafte Workspace-Löschung (Art. 17 DSGVO)",
    dangerText: "Löscht dauerhaft Ihre Organisation, Kunden, Rechnungen, API-Schlüssel und Audit-Logs. Exportieren Sie zuerst Ihr GoBD-Archiv!",
    deletePlaceholder: "DELETE_MY_WORKSPACE eingeben",
    deleteBtn: "Löschen",
    chainTitle: "Live-GoBD-SHA-256-Audit-Hash-Ketten-Integrität",
    chainVerified: (n) => `VERIFIZIERT — Alle ${n} anfüg-nur-Ereignisse kryptografisch verkettet, keine Manipulation.`,
    chainPending: "Verifizierung ausstehend",
    reverify: "Kette erneut prüfen",
    thRef: "Ref.",
    thActor: "Akteur",
    thHash: "SHA-256-Ereignis-Hash",
    tSaved: "Einstellungen gespeichert und im GoBD-Audit-Trail protokolliert.",
    tSaveFailed: "Speichern fehlgeschlagen",
    tLoadFailed: "Einstellungen konnten nicht geladen werden",
    tViesFailed: "VIES fehlgeschlagen",
    tLogoTooBig: "Das Logo muss kleiner als 180 KB sein (PNG/JPG/SVG).",
    tIntegrationUpdated: (provider) => `${provider}-Integration aktualisiert (AES-256-GCM verschlüsselt gespeichert).`,
    tIntegrationFailed: "Integrationsaktualisierung fehlgeschlagen",
    tMemberInvited: "Teammitglied eingeladen.",
    tInviteFailed: "Einladung fehlgeschlagen",
    tMemberRemoved: "Mitglied entfernt.",
    tRemoveFailed: "Entfernen fehlgeschlagen",
    tKeyCreationFailed: "Schlüsselerstellung fehlgeschlagen",
    tKeyRevoked: "API-Schlüssel widerrufen.",
    tRevokeFailed: "Widerruf fehlgeschlagen",
    tPlanSwitched: (tier) => `Zu ${tier} gewechselt.`,
    tPlanFailed: "Tarifänderung fehlgeschlagen",
    tPwUpdated: "Passwort sicher mit scrypt aktualisiert.",
    tPwFailed: "Passwortänderung fehlgeschlagen",
    tDeleteTypeError: 'Geben Sie exakt „DELETE_MY_WORKSPACE" zur Bestätigung ein.',
    tDeletionFailed: "Löschung fehlgeschlagen",
    tCopied: "In die Zwischenablage kopiert.",
    tCancellationFailed: "Kündigung fehlgeschlagen",
  },
  fr: {
    pageTitle: "Paramètres de l'espace",
    pageSubtitle: "Configurez votre profil légal EN 16931, vos coordonnées bancaires SEPA, la numérotation séquentielle, les webhooks, le RBAC d'équipe, les clés API, la facturation et les contrôles RGPD.",
    saveChanges: "Enregistrer les modifications",
    loading: "Chargement des paramètres de l'espace…",
    tabCompany: "Entreprise & fiscalité",
    tabInvoicing: "Facturation & banque",
    tabIntegrations: "Intégrations",
    tabTeam: "Équipe & RBAC",
    tabApiKeys: "Clés API",
    tabBilling: "Facturation & quota",
    tabSecurity: "Sécurité & RGPD",
    companyTitle: "Profil légal & fiscal de l'entreprise (EN 16931 BG-4)",
    companyDesc: "Intégré automatiquement à chaque document ZUGFeRD, Factur-X, XRechnung & Peppol que vous émettez.",
    fLegalName: "Raison sociale (BT-27) *",
    fTradingName: "Nom commercial (BT-28)",
    fManagingDirector: "Gérant (§ 35a GmbHG)",
    fRegistrationId: "Registre du commerce / HRB / SIREN (BT-30)",
    fStreet: "Rue & numéro (BT-35)",
    fPostalCode: "Code postal",
    fCity: "Ville",
    fCountry: "Pays",
    fVatId: "N° de TVA UE (BT-31)",
    checkVies: "Vérifier VIES",
    fTaxNumber: "Numéro fiscal national (BT-32)",
    fKleinunternehmer: "Franchise en base (§ 19 UStG) — petite entreprise exonérée de TVA",
    fElectronicAddress: "Adresse électronique / point de terminaison (BT-34)",
    fContactName: "Nom du contact de facturation (BG-6 / BT-41)",
    fContactPhone: "Téléphone du contact (BT-42)",
    fContactEmail: "E-mail du contact (BT-43)",
    fLogo: "Logo de l'entreprise (en-tête PDF/A-3, max 180 Ko)",
    noLogo: "Aucun logo",
    removeLogo: "Supprimer",
    designHeading: "Design de facture (branding PDF)",
    fAccentColor: "Couleur d'accent",
    fAccentBand: "Afficher une bande d'accent sous l'en-tête",
    fFooterText: "Ligne de pied de page personnalisée",
    designHint: "Le branding s'applique uniquement au PDF lisible — le XML EN 16931 intégré n'est jamais modifié.",
    invoicingTitle: "Valeurs par défaut de facturation, numérotation séquentielle & banque SEPA (BG-16)",
    invoicingDesc: "L'IBAN est validé via ISO 13616 MOD-97 côté client et serveur.",
    fIban: "IBAN (BT-84)",
    ibanValid: "✓ Somme de contrôle IBAN ISO 13616 MOD-97 valide",
    ibanInvalid: "✗ Somme de contrôle IBAN invalide — le serveur rejettera les IBAN invalides",
    fBic: "BIC (BT-86)",
    fAccountHolder: "Titulaire du compte (BT-85)",
    fInvoicePrefix: "Préfixe de facture",
    fCreditPrefix: "Préfixe d'avoir (TypeCode 381)",
    fNextSeq: "Prochain numéro de séquence",
    nextInvoice: "Prochaine facture :",
    fDefaultFormat: "Format par défaut",
    fDocLanguage: "Langue de document par défaut",
    fDueDays: "Délai de paiement par défaut (jours)",
    fRetention: "Durée de conservation de l'archive GoBD",
    retention8: "8 ans (Allemagne BEG IV / § 147 AO)",
    retention10: "10 ans (France / Code de commerce)",
    fPaymentTerms: "Conditions de paiement par défaut (BT-20)",
    fFooterNotes: "Notes de bas de facture par défaut (BT-22)",
    rotatedSecret: (provider) => `Nouveau secret de signature ${provider} (copiez maintenant — affiché une seule fois) :`,
    copy: "Copier",
    stripeTitle: "Passerelle e-facture Stripe",
    stripeDesc: "Point de terminaison par locataire. Chaque requête est vérifiée avec HMAC-SHA256 + protection anti-rejeu de 5 min.",
    wooTitle: "Passerelle plugin WooCommerce",
    wooDesc: "Collez cette URL & ce secret de signature dans WooCommerce → NormInvoice EU E-Invoice.",
    shopifyTitle: "Passerelle de commandes Shopify",
    shopifyDesc: "Ajoutez cette URL comme webhook orders/paid dans Shopify ; vérifiée avec le secret de signature HMAC-SHA256 de l'app.",
    shopifyUrlLabel: "Votre URL de webhook Shopify",
    shopifyPlaceholder: "Coller le secret du webhook Shopify…",
    stripeUrlLabel: "Votre URL de webhook Stripe",
    wooUrlLabel: "Votre URL de webhook WooCommerce",
    storedSecret: "Secret stocké :",
    notSet: "Non défini",
    save: "Enregistrer",
    rotateSecret: "Générer / renouveler le secret",
    stripePlaceholder: "Coller Stripe whsec_...",
    wooPlaceholder: "Secret de signature personnalisé...",
    accountantTitle: "E-mail de copie automatique au comptable",
    accountantDesc: "Met automatiquement votre expert-comptable en copie dès qu'une e-facture est envoyée par e-mail.",
    saveCc: "Enregistrer la copie",
    fAccountantCc: "E-mail de copie comptable",
    logsTitle: "Journaux de livraison de webhooks récents",
    logsEmpty: "Aucune livraison de webhook enregistrée pour votre espace pour l'instant.",
    thTime: "Heure",
    thProvider: "Fournisseur",
    thEvent: "Événement",
    thHttp: "HTTP",
    thSummary: "Résumé",
    inviteTitle: "Inviter un membre d'équipe ou un conseiller fiscal",
    inviteDesc: "Attribuez des rôles RBAC à moindre privilège (Propriétaire, Admin, Comptable lecture/export, Membre).",
    fEmail: "E-mail *",
    fFullName: "Nom complet",
    fRole: "Rôle",
    roleAccountant: "Comptable (lecture & export)",
    roleMember: "Membre (créer des factures)",
    roleAdmin: "Admin (gérer les paramètres)",
    roleOwner: "Propriétaire (accès complet)",
    invite: "Inviter",
    membersTitle: (n) => `Membres de l'espace (${n})`,
    thMember: "Membre",
    thRole: "Rôle",
    thJoined: "Rejoint le",
    thAction: "Action",
    remove: "Supprimer",
    removeMemberConfirm: "Retirer ce membre de votre espace ?",
    keyCreatedAlert: "Copiez votre nouvelle clé API maintenant — elle est hachée en SHA-256 et ne sera plus jamais affichée :",
    generateKeyTitle: "Générer une clé API par locataire",
    generateKeyDesc: "À utiliser comme Authorization: Bearer ni_live_... sur /api/v1/validate, /api/v1/invoices et /api/v1/exports/*.",
    fKeyLabel: "Libellé de la clé",
    createKey: "Créer une clé API",
    issuedKeys: (n) => `Clés émises (${n})`,
    keysEmpty: "Aucune clé API créée pour l'instant.",
    thName: "Nom",
    thPrefix: "Préfixe",
    thScopes: "Portées",
    thStatus: "Statut",
    statusRevoked: "Révoquée",
    statusActive: "Active",
    revoke: "Révoquer",
    revokeConfirm: "Révoquer cette clé API immédiatement ? Tout client l'utilisant recevra HTTP 401.",
    subTitle: "Abonnement actuel & utilisation mensuelle",
    cancelRenewal: "Annuler le renouvellement",
    cancelRenewalConfirm: "Annuler le prochain renouvellement d'abonnement ? Votre accès actuel reste actif jusqu'à la fin de la période.",
    activePlan: "Offre active",
    trial15: "Essai gratuit de 15 jours",
    trialDaysLeft: (n) => `${n} jour${n === 1 ? "" : "s"} restant${n === 1 ? "" : "s"} · sans carte bancaire`,
    renewalCancelled: "Renouvellement annulé — l'accès continue jusqu'à la fin du cycle de facturation actuel.",
    finalizedThisMonth: "E-factures finalisées ce mois-ci",
    recommended: "Recommandé",
    currentPlan: "Offre actuelle",
    switchTo: (name) => `Passer à ${name}`,
    planFreeDesc: "Validation gratuite permanente & factures occasionnelles",
    planStarterDesc: "Indépendants & micro-entreprises : boîte de réception & liens SEPA",
    planSoloDesc: "Offre principale : récurrent, boîte de réception, automatisations & DATEV/FEC",
    planBusinessDesc: "Stripe, WooCommerce, RBAC multi-utilisateurs & GoBD",
    planAgencyDesc: "Gros volume, multi-clients & équipes API REST",
    quotaInvoices: (n) => `${n} factures / mois`,
    changePwTitle: "Changer le mot de passe du compte",
    changePwDesc: "Haché avec scrypt (sel aléatoire par utilisateur).",
    fCurrentPw: "Mot de passe actuel",
    fNewPw: "Nouveau mot de passe (min. 8 caractères, lettres + chiffres)",
    updatePw: "Mettre à jour le mot de passe",
    gdprTitle: "Portabilité des données RGPD (art. 20) & effacement (art. 17)",
    gdprDesc: "Pleine souveraineté sur vos données d'entreprise hébergées dans l'UE.",
    gdprExport: "Télécharger l'export JSON RGPD art. 20 complet",
    dangerZone: "Zone de danger — effacement permanent de l'espace (art. 17 RGPD)",
    dangerText: "Supprime définitivement votre organisation, clients, factures, clés API et journaux d'audit. Exportez d'abord votre archive GoBD !",
    deletePlaceholder: "Saisir DELETE_MY_WORKSPACE",
    deleteBtn: "Supprimer",
    chainTitle: "Intégrité de la chaîne de hachage d'audit GoBD SHA-256 en direct",
    chainVerified: (n) => `VÉRIFIÉ — Les ${n} événements en ajout seul sont liés cryptographiquement, sans altération.`,
    chainPending: "Vérification en attente",
    reverify: "Revérifier la chaîne",
    thRef: "Réf.",
    thActor: "Acteur",
    thHash: "Hachage d'événement SHA-256",
    tSaved: "Paramètres enregistrés et consignés dans la piste d'audit GoBD.",
    tSaveFailed: "Échec de l'enregistrement",
    tLoadFailed: "Échec du chargement des paramètres",
    tViesFailed: "Échec VIES",
    tLogoTooBig: "Le logo doit faire moins de 180 Ko (PNG/JPG/SVG).",
    tIntegrationUpdated: (provider) => `Intégration ${provider} mise à jour (chiffrée AES-256-GCM au repos).`,
    tIntegrationFailed: "Échec de la mise à jour de l'intégration",
    tMemberInvited: "Membre d'équipe invité.",
    tInviteFailed: "Échec de l'invitation",
    tMemberRemoved: "Membre supprimé.",
    tRemoveFailed: "Échec de la suppression",
    tKeyCreationFailed: "Échec de la création de la clé",
    tKeyRevoked: "Clé API révoquée.",
    tRevokeFailed: "Échec de la révocation",
    tPlanSwitched: (tier) => `Basculé vers ${tier}.`,
    tPlanFailed: "Échec de la mise à jour de l'offre",
    tPwUpdated: "Mot de passe mis à jour en toute sécurité avec scrypt.",
    tPwFailed: "Échec du changement de mot de passe",
    tDeleteTypeError: 'Saisissez exactement « DELETE_MY_WORKSPACE » pour confirmer.',
    tDeletionFailed: "Échec de la suppression",
    tCopied: "Copié dans le presse-papiers.",
    tCancellationFailed: "Échec de l'annulation",
  },
};

// ── Trust / Security center translations (bespoke page) ──
export interface TrustStrings {
  badge: string;
  title: string;
  intro: string;
  btnDpa: string;
  btnPrivacy: string;
  btnVerfahren: string;
  cards: Array<{ title: string; bullets: string[] }>;
}

export const TRUST_STRINGS: Record<AppLocale, TrustStrings> = {
  en: {
    badge: "EU Sovereign Infrastructure · Zero Tracking",
    title: "NormInvoice Trust, Security & EU Compliance Center",
    intro:
      "Electronic invoices contain sensitive financial and tax records. NormInvoice is engineered from the ground up for German GoBD, French Factur-X, and EU GDPR audits — with transparent cryptography, zero third-party tracking, and 100% hosting inside Germany.",
    btnDpa: "Read Art. 28 GDPR DPA (AVV)",
    btnPrivacy: "GDPR & TDDDG Privacy Policy",
    btnVerfahren: "Download GoBD Verfahrensdokumentation",
    cards: [
      {
        title: "100% Germany EU Data Residency",
        bullets: [
          "Compute, PostgreSQL 16 DB, and S3 WORM storage hosted exclusively in Falkenstein & Nuremberg, Germany (Hetzner Online GmbH).",
          "Zero cross-border invoice transfers outside the EEA and zero exposure to foreign extra-territorial data laws.",
          "100% locally self-hosted fonts (Inter & JetBrains Mono) — zero browser requests to Google Fonts CDN.",
        ],
      },
      {
        title: "Application & Cryptographic Security",
        bullets: [
          "Strict Content-Security-Policy (CSP), HSTS Preload, X-Frame-Options: DENY, and Same-Origin CSRF protection.",
          "AES-256-GCM authenticated encryption for stored integration credentials; scrypt password hashing; SHA-256 hashed Bearer API keys.",
          "5-minute replay-attack window + constant-time HMAC verification on Stripe, WooCommerce, and Paddle webhooks.",
        ],
      },
      {
        title: "GoBD & French Tax Audit Immutability",
        bullets: [
          "PostgreSQL 16 Row-Level Security (RLS) isolates every tenant transactionally via app.current_org_id.",
          "Append-only audit table protected by database-level BEFORE UPDATE OR DELETE triggers with SHA-256 hash chaining.",
          "Configurable 8-year (Germany BEG IV) or 10-year (France) S3 Object Lock WORM archive retention.",
        ],
      },
      {
        title: "Sandboxed Zero-Retention Validation",
        bullets: [
          "Public validator runs strictly in volatile RAM (tmpfs) inside zero-internet-egress containers — files are wiped immediately.",
          "Strict XXE / DTD rejection, 10 MB upload cap, Ghostscript -dSAFER sandboxing, and Excel CSV formula-injection neutralization.",
          "Official EN 16931 / KoSIT XRechnung 3.0.2 & veraPDF ISO 19005-3 PDF/A-3b validation pipeline.",
        ],
      },
    ],
  },
  de: {
    badge: "EU-souveräne Infrastruktur · Kein Tracking",
    title: "NormInvoice Trust-, Sicherheits- & EU-Compliance-Center",
    intro:
      "Elektronische Rechnungen enthalten sensible Finanz- und Steuerdaten. NormInvoice ist von Grund auf für deutsche GoBD-, französische Factur-X- und EU-DSGVO-Prüfungen ausgelegt — mit transparenter Kryptografie, ohne Drittanbieter-Tracking und mit 100 % Hosting in Deutschland.",
    btnDpa: "Art.-28-DSGVO-AVV lesen",
    btnPrivacy: "DSGVO- & TDDDG-Datenschutzerklärung",
    btnVerfahren: "GoBD-Verfahrensdokumentation herunterladen",
    cards: [
      {
        title: "100 % Datenhaltung in Deutschland (EU)",
        bullets: [
          "Rechenleistung, PostgreSQL-16-Datenbank und S3-WORM-Speicher ausschließlich in Falkenstein & Nürnberg, Deutschland (Hetzner Online GmbH) gehostet.",
          "Keine grenzüberschreitenden Rechnungsübermittlungen außerhalb des EWR und keine Exposition gegenüber ausländischen extraterritorialen Datengesetzen.",
          "100 % lokal selbstgehostete Schriftarten (Inter & JetBrains Mono) — keine Browser-Anfragen an das Google-Fonts-CDN.",
        ],
      },
      {
        title: "Anwendungs- & kryptografische Sicherheit",
        bullets: [
          "Strikte Content-Security-Policy (CSP), HSTS-Preload, X-Frame-Options: DENY und Same-Origin-CSRF-Schutz.",
          "AES-256-GCM-authentifizierte Verschlüsselung gespeicherter Integrations-Zugangsdaten; scrypt-Passwort-Hashing; SHA-256-gehashte Bearer-API-Schlüssel.",
          "5-Minuten-Replay-Schutzfenster + konstantzeitige HMAC-Verifizierung bei Stripe-, WooCommerce- und Paddle-Webhooks.",
        ],
      },
      {
        title: "GoBD- & französische Betriebsprüfungs-Unveränderbarkeit",
        bullets: [
          "PostgreSQL-16-Row-Level-Security (RLS) isoliert jeden Mandanten transaktional über app.current_org_id.",
          "Nur anfügbare Audit-Tabelle, geschützt durch Datenbank-Trigger BEFORE UPDATE OR DELETE mit SHA-256-Hash-Verkettung.",
          "Konfigurierbare Aufbewahrung im S3-Object-Lock-WORM-Archiv über 8 Jahre (Deutschland BEG IV) oder 10 Jahre (Frankreich).",
        ],
      },
      {
        title: "Sandbox-Validierung ohne Datenspeicherung",
        bullets: [
          "Der öffentliche Validator läuft ausschließlich im flüchtigen RAM (tmpfs) in Containern ohne Internet-Ausgang — Dateien werden sofort gelöscht.",
          "Strikte XXE-/DTD-Abweisung, 10-MB-Upload-Limit, Ghostscript-dSAFER-Sandboxing und Neutralisierung von Excel-CSV-Formel-Injektionen.",
          "Offizielle EN-16931- / KoSIT-XRechnung-3.0.2- & veraPDF-ISO-19005-3-PDF/A-3b-Validierungspipeline.",
        ],
      },
    ],
  },
  fr: {
    badge: "Infrastructure souveraine UE · Aucun tracking",
    title: "Centre de confiance, sécurité & conformité UE de NormInvoice",
    intro:
      "Les factures électroniques contiennent des données financières et fiscales sensibles. NormInvoice est conçu dès l'origine pour les contrôles GoBD allemands, Factur-X français et RGPD de l'UE — avec une cryptographie transparente, aucun tracking tiers et un hébergement 100 % en Allemagne.",
    btnDpa: "Lire le DPA (AVV) art. 28 RGPD",
    btnPrivacy: "Politique de confidentialité RGPD & TDDDG",
    btnVerfahren: "Télécharger la Verfahrensdokumentation GoBD",
    cards: [
      {
        title: "Résidence des données 100 % en Allemagne (UE)",
        bullets: [
          "Calcul, base de données PostgreSQL 16 et stockage S3 WORM hébergés exclusivement à Falkenstein & Nuremberg, Allemagne (Hetzner Online GmbH).",
          "Aucun transfert transfrontalier de factures hors de l'EEE et aucune exposition aux lois extraterritoriales étrangères sur les données.",
          "Polices auto-hébergées localement à 100 % (Inter & JetBrains Mono) — aucune requête du navigateur vers le CDN Google Fonts.",
        ],
      },
      {
        title: "Sécurité applicative & cryptographique",
        bullets: [
          "Content-Security-Policy (CSP) stricte, HSTS Preload, X-Frame-Options: DENY et protection CSRF Same-Origin.",
          "Chiffrement authentifié AES-256-GCM des identifiants d'intégration stockés ; hachage de mot de passe scrypt ; clés API Bearer hachées en SHA-256.",
          "Fenêtre anti-rejeu de 5 minutes + vérification HMAC à temps constant sur les webhooks Stripe, WooCommerce et Paddle.",
        ],
      },
      {
        title: "Immuabilité pour les contrôles fiscaux GoBD & français",
        bullets: [
          "La sécurité au niveau des lignes (RLS) de PostgreSQL 16 isole chaque locataire de façon transactionnelle via app.current_org_id.",
          "Table d'audit en ajout seul, protégée par des déclencheurs BEFORE UPDATE OR DELETE au niveau de la base avec chaînage de hachage SHA-256.",
          "Conservation configurable en archive S3 Object Lock WORM sur 8 ans (Allemagne BEG IV) ou 10 ans (France).",
        ],
      },
      {
        title: "Validation en bac à sable sans conservation",
        bullets: [
          "Le validateur public s'exécute strictement en mémoire vive volatile (tmpfs) dans des conteneurs sans sortie Internet — les fichiers sont effacés immédiatement.",
          "Rejet strict XXE / DTD, limite d'import de 10 Mo, bac à sable Ghostscript -dSAFER et neutralisation des injections de formules CSV Excel.",
          "Pipeline de validation officiel EN 16931 / KoSIT XRechnung 3.0.2 & veraPDF ISO 19005-3 PDF/A-3b.",
        ],
      },
    ],
  },
};

// ── Pricing page wrapper (hero + pre-checkout transparency) ──
export interface PricingPageStrings {
  badge: string;
  title: string;
  desc: string;
  checkoutTitle: string;
  checkoutIntroPre: string;
  billingPolicyLabel: string;
  checkoutIntroPost: string;
  items: string[];
}

export const PRICING_PAGE_STRINGS: Record<AppLocale, PricingPageStrings> = {
  en: {
    badge: "Simple, Predictable Subscriptions",
    title: "Plans for Every Stage of Your E-Invoicing Journey",
    desc: "Start with our ongoing Free plan or test full workspace workflows with a 15-day free trial. No credit card is required to begin, and renewals can be cancelled anytime in Settings.",
    checkoutTitle: "What Checkout Shows Before You Pay",
    checkoutIntroPre: "In line with our ",
    billingPolicyLabel: "Subscription & Billing Policy",
    checkoutIntroPost: ", every paid upgrade transparently displays:",
    items: [
      "Contracting entity / Merchant of Record",
      "Exact currency & billing interval",
      "Applicable VAT or reverse-charge treatment",
      "Included monthly document quota",
      "Trial expiry & non-silent-billing behavior",
      "Online cancellation & refund policy links",
    ],
  },
  de: {
    badge: "Einfache, planbare Abonnements",
    title: "Tarife für jede Phase Ihrer E-Rechnungs-Reise",
    desc: "Starten Sie mit unserem dauerhaft kostenlosen Tarif oder testen Sie die vollständigen Workspace-Abläufe mit einem 15-Tage-Test. Keine Kreditkarte zum Start erforderlich, und Verlängerungen können jederzeit in den Einstellungen gekündigt werden.",
    checkoutTitle: "Was der Checkout vor der Zahlung anzeigt",
    checkoutIntroPre: "Gemäß unserer ",
    billingPolicyLabel: "Abonnement- & Abrechnungsrichtlinie",
    checkoutIntroPost: " zeigt jedes kostenpflichtige Upgrade transparent an:",
    items: [
      "Vertragspartner / Merchant of Record",
      "Genaue Währung & Abrechnungsintervall",
      "Anwendbare MwSt. oder Reverse-Charge-Behandlung",
      "Enthaltenes monatliches Belegkontingent",
      "Testablauf & kein stilles Abbuchen",
      "Links zur Online-Kündigung & Erstattungsrichtlinie",
    ],
  },
  fr: {
    badge: "Des abonnements simples et prévisibles",
    title: "Des offres pour chaque étape de votre parcours de facturation électronique",
    desc: "Commencez avec notre offre gratuite permanente ou testez les flux complets de l'espace de travail avec un essai de 15 jours. Aucune carte bancaire n'est requise pour commencer, et les renouvellements peuvent être annulés à tout moment dans les Paramètres.",
    checkoutTitle: "Ce que le paiement affiche avant de payer",
    checkoutIntroPre: "Conformément à notre ",
    billingPolicyLabel: "Politique d'abonnement & de facturation",
    checkoutIntroPost: ", chaque mise à niveau payante affiche de façon transparente :",
    items: [
      "Entité contractante / Merchant of Record",
      "Devise exacte & intervalle de facturation",
      "TVA applicable ou traitement en autoliquidation",
      "Quota mensuel de documents inclus",
      "Expiration de l'essai & absence de facturation silencieuse",
      "Liens vers l'annulation en ligne & la politique de remboursement",
    ],
  },
};

// ── Features page (hero + capability modules + availability notice) ──
export interface FeatureModule { title: string; text: string; phased?: boolean; }
export interface FeaturesStrings {
  badge: string;
  title: string;
  desc: string;
  ctaPrimary: string;
  ctaSecondary: string;
  statusAvailable: string;
  statusPhased: string;
  noticeLabel: string;
  noticeText: string;
  modules: FeatureModule[];
}

export const FEATURES_STRINGS: Record<AppLocale, FeaturesStrings> = {
  en: {
    badge: "Platform Capabilities",
    title: "Everything Your E-Invoice Workflow Needs, Connected",
    desc: "From zero-retention validation to outgoing automation, incoming supplier approvals, and GoBD-aligned accountant exports — every feature below reflects real implemented product behavior.",
    ctaPrimary: "Start Free or 15-Day Trial",
    ctaSecondary: "See Supported Countries",
    statusAvailable: "Available",
    statusPhased: "Phased (13 Markets)",
    noticeLabel: "Transparent Availability Notice:",
    noticeText: " Features, integrations, and country modules are labeled Available, Partner-Operated, or Planned. Only features marked Available for your workspace should be treated as production-ready. Validation does not replace independent tax or legal advice.",
    modules: [
      { title: "Structured Invoice Creation & Credit Notes", text: "Issue sequential EN 16931 invoices and TypeCode 381 credit notes in ZUGFeRD 2.3, Factur-X 1.07, XRechnung 3.0.2 (CII & UBL), and Peppol BIS 3.0." },
      { title: "Deterministic Pre-Send Validation & Repair", text: "Catch missing Leitweg-IDs (BR-DE-15), VAT breakdown mismatches (BR-CO-15), and malformed IBANs before delivery, with plain-language EN/DE/FR guidance." },
      { title: "Incoming Supplier E-Invoice Inbox (AP)", text: "Upload, parse, validate, detect duplicates, approve supplier bills, and preserve original supplier XML alongside parsed views." },
      { title: "Recurring Billing & Batch CSV Converter", text: "Automate monthly, quarterly, or annual invoice schedules and batch-convert CSV exports into validated PDF/A-3 + XML ZIP bundles." },
      { title: "Payments, Partial Settlements & AR Ageing", text: "Record SEPA transfers and partial payments, track paid vs. overdue invoices, and monitor receivables ageing buckets." },
      { title: "Workflow Automation Rules", text: "Configure organization-scoped automation triggers for pre-send validation gates, automatic accountant CC, and incoming approval holds." },
      { title: "GoBD Audit Hash-Chain & DATEV / FEC Exports", text: "Every workspace mutation is cryptographically linked in an append-only SHA-256 chain. Export DATEV EXTF v700, French FEC, and GoBD dossiers." },
      { title: "Delegated Accountant Portal & Team RBAC", text: "Grant time-bounded, revocable read/export access to external Steuerberater or finance reviewers with full access attestation." },
      { title: "Stripe, WooCommerce, REST API & TypeScript SDK", text: "HMAC-SHA256 verified Stripe & WooCommerce webhooks (with HPOS WordPress plugin), Bearer API keys, and official SDK." },
      { title: "Real-Time Analytics & VAT Reporting", text: "Track invoice trends, status distributions, VAT rate summaries, and country breakdowns directly from live workspace records." },
      { title: "Country Compliance Modules & Network Routing", text: "Core EU formats are live; national clearance networks (Peppol Access Points, French PDP, Polish KSeF, Italian SdI) are transparently labeled Partner-Operated or Planned.", phased: true },
      { title: "Multi-Tenant Security & GDPR Sovereignty", text: "Strict org-level isolation, AES-256-GCM secret encryption, scrypt auth, XXE XML defense, and self-service GDPR Art. 20 export & Art. 17 erasure." },
    ],
  },
  de: {
    badge: "Plattform-Funktionen",
    title: "Alles, was Ihr E-Rechnungs-Workflow braucht — vernetzt",
    desc: "Von der Prüfung ohne Datenspeicherung über ausgehende Automatisierung und eingehende Lieferantenfreigaben bis zu GoBD-konformen Steuerberater-Exporten — jede Funktion unten entspricht tatsächlich implementiertem Produktverhalten.",
    ctaPrimary: "Kostenlos oder 15 Tage testen",
    ctaSecondary: "Unterstützte Länder ansehen",
    statusAvailable: "Verfügbar",
    statusPhased: "Schrittweise (13 Märkte)",
    noticeLabel: "Transparenzhinweis zur Verfügbarkeit:",
    noticeText: " Funktionen, Integrationen und Ländermodule sind als Verfügbar, Partner-betrieben oder Geplant gekennzeichnet. Nur als Verfügbar markierte Funktionen sollten für Ihren Workspace als produktionsreif gelten. Die Validierung ersetzt keine unabhängige Steuer- oder Rechtsberatung.",
    modules: [
      { title: "Strukturierte Rechnungserstellung & Gutschriften", text: "Erstellen Sie fortlaufende EN-16931-Rechnungen und Gutschriften (TypeCode 381) in ZUGFeRD 2.3, Factur-X 1.07, XRechnung 3.0.2 (CII & UBL) und Peppol BIS 3.0." },
      { title: "Deterministische Prüfung & Reparatur vor dem Versand", text: "Erkennen Sie fehlende Leitweg-IDs (BR-DE-15), USt-Aufschlüsselungsfehler (BR-CO-15) und fehlerhafte IBANs vor dem Versand — mit verständlicher Anleitung auf EN/DE/FR." },
      { title: "Eingangsrechnungs-Posteingang für Lieferanten (AP)", text: "Hochladen, parsen, validieren, Dubletten erkennen, Lieferantenrechnungen freigeben und das originale Lieferanten-XML neben der geparsten Ansicht aufbewahren." },
      { title: "Wiederkehrende Abrechnung & Batch-CSV-Konverter", text: "Automatisieren Sie monatliche, vierteljährliche oder jährliche Rechnungszeitpläne und konvertieren Sie CSV-Exporte stapelweise in validierte PDF/A-3- + XML-ZIP-Bündel." },
      { title: "Zahlungen, Teilzahlungen & Forderungsalterung", text: "Erfassen Sie SEPA-Überweisungen und Teilzahlungen, verfolgen Sie bezahlte vs. überfällige Rechnungen und überwachen Sie die Alterung offener Forderungen." },
      { title: "Workflow-Automatisierungsregeln", text: "Konfigurieren Sie organisationsbezogene Auslöser für Prüf-Gates vor dem Versand, automatisches Steuerberater-CC und Freigabe-Halts bei Eingangsrechnungen." },
      { title: "GoBD-Audit-Hash-Kette & DATEV-/FEC-Exporte", text: "Jede Workspace-Änderung ist kryptografisch in einer nur anfügbaren SHA-256-Kette verknüpft. Exportieren Sie DATEV EXTF v700, französisches FEC und GoBD-Dossiers." },
      { title: "Delegiertes Steuerberater-Portal & Team-RBAC", text: "Gewähren Sie externen Steuerberatern oder Finanzprüfern zeitlich begrenzten, widerrufbaren Lese-/Export-Zugriff mit vollständigem Zugriffsnachweis." },
      { title: "Stripe, WooCommerce, REST-API & TypeScript-SDK", text: "HMAC-SHA256-verifizierte Stripe- & WooCommerce-Webhooks (mit HPOS-WordPress-Plugin), Bearer-API-Schlüssel und offizielles SDK." },
      { title: "Echtzeit-Analysen & USt-Berichte", text: "Verfolgen Sie Rechnungstrends, Statusverteilungen, USt-Satz-Zusammenfassungen und Länderaufschlüsselungen direkt aus den Live-Workspace-Daten." },
      { title: "Länder-Compliance-Module & Netzwerk-Routing", text: "Kern-EU-Formate sind live; nationale Clearing-Netze (Peppol Access Points, französisches PDP, polnisches KSeF, italienisches SdI) sind transparent als Partner-betrieben oder Geplant gekennzeichnet.", phased: true },
      { title: "Mandantensicherheit & DSGVO-Souveränität", text: "Strikte Isolation auf Organisationsebene, AES-256-GCM-Verschlüsselung, scrypt-Auth, XXE-XML-Abwehr sowie Self-Service-DSGVO-Art.-20-Export & Art.-17-Löschung." },
    ],
  },
  fr: {
    badge: "Capacités de la plateforme",
    title: "Tout ce dont votre flux de facturation électronique a besoin, connecté",
    desc: "De la validation sans conservation à l'automatisation sortante, aux approbations fournisseurs entrantes et aux exports comptables conformes GoBD — chaque fonctionnalité ci-dessous reflète un comportement produit réellement implémenté.",
    ctaPrimary: "Commencer gratuitement ou essai 15 jours",
    ctaSecondary: "Voir les pays pris en charge",
    statusAvailable: "Disponible",
    statusPhased: "Progressif (13 marchés)",
    noticeLabel: "Avis de disponibilité transparent :",
    noticeText: " Les fonctionnalités, intégrations et modules pays sont étiquetés Disponible, Opéré par un partenaire ou Planifié. Seules les fonctionnalités marquées Disponible pour votre espace de travail doivent être considérées comme prêtes pour la production. La validation ne remplace pas un conseil fiscal ou juridique indépendant.",
    modules: [
      { title: "Création structurée de factures & avoirs", text: "Émettez des factures EN 16931 séquentielles et des avoirs (TypeCode 381) en ZUGFeRD 2.3, Factur-X 1.07, XRechnung 3.0.2 (CII & UBL) et Peppol BIS 3.0." },
      { title: "Validation & réparation déterministes avant envoi", text: "Détectez les Leitweg-ID manquants (BR-DE-15), les écarts de ventilation de TVA (BR-CO-15) et les IBAN mal formés avant l'envoi, avec des explications claires en EN/DE/FR." },
      { title: "Boîte de réception des factures fournisseurs (AP)", text: "Importez, analysez, validez, détectez les doublons, approuvez les factures fournisseurs et conservez le XML fournisseur d'origine aux côtés des vues analysées." },
      { title: "Facturation récurrente & convertisseur CSV par lots", text: "Automatisez les échéanciers de factures mensuels, trimestriels ou annuels et convertissez par lots les exports CSV en bundles PDF/A-3 + ZIP XML validés." },
      { title: "Paiements, règlements partiels & vieillissement des créances", text: "Enregistrez les virements SEPA et paiements partiels, suivez les factures payées vs en retard et surveillez les tranches de vieillissement des créances." },
      { title: "Règles d'automatisation des flux", text: "Configurez des déclencheurs d'automatisation par organisation : contrôles de validation avant envoi, CC comptable automatique et mises en attente d'approbation entrante." },
      { title: "Chaîne d'audit GoBD & exports DATEV / FEC", text: "Chaque modification de l'espace de travail est liée cryptographiquement dans une chaîne SHA-256 en ajout seul. Exportez DATEV EXTF v700, le FEC français et les dossiers GoBD." },
      { title: "Portail comptable délégué & RBAC d'équipe", text: "Accordez à des Steuerberater externes ou à des réviseurs financiers un accès lecture/export limité dans le temps et révocable, avec attestation d'accès complète." },
      { title: "Stripe, WooCommerce, API REST & SDK TypeScript", text: "Webhooks Stripe & WooCommerce vérifiés HMAC-SHA256 (avec plugin WordPress HPOS), clés API Bearer et SDK officiel." },
      { title: "Analyses en temps réel & rapports de TVA", text: "Suivez les tendances des factures, les répartitions de statuts, les synthèses de taux de TVA et les ventilations par pays directement depuis les données en direct." },
      { title: "Modules de conformité pays & routage réseau", text: "Les formats UE de base sont actifs ; les réseaux de clearance nationaux (Peppol Access Points, PDP français, KSeF polonais, SdI italien) sont étiquetés de façon transparente Opéré par un partenaire ou Planifié.", phased: true },
      { title: "Sécurité multi-locataires & souveraineté RGPD", text: "Isolation stricte au niveau de l'organisation, chiffrement AES-256-GCM, auth scrypt, défense XXE XML et export RGPD Art. 20 & effacement Art. 17 en libre-service." },
    ],
  },
};

// ── About page ──
export interface AboutStrings {
  heroTitle: string; heroDesc: string;
  missionTitle: string; missionDesc: string; missionItems: string[];
  boundariesTag: string; boundariesTitle: string; boundariesDesc: string;
  groupTag: string; groupTitle: string;
  contractingLabel: string; contractingNote: string; relatedLabel: string;
  incorporationLabel: string; ntnLabel: string; ceoLabel: string; getInTouch: string;
}

export const ABOUT_STRINGS: Record<AppLocale, AboutStrings> = {
  en: {
    heroTitle: "Making European E-Invoicing Clear, Structured, and Manageable",
    heroDesc: "European markets are transitioning toward structured electronic invoicing — yet every country applies different technical formats, tax fields, validation rules, and transmission networks. NormInvoice brings these workflows together in one coherent, multi-tenant software platform.",
    missionTitle: "Our Mission & Product Focus",
    missionDesc: "Make digital invoicing accessible, transparent, and audit-ready for growing businesses, finance teams, and accountants — without forcing teams to stitch together fragile PDF hacks and spreadsheets.",
    missionItems: [
      "Deterministic EN 16931, ZUGFeRD 2.3, Factur-X 1.07 & XRechnung 3.0.2 engine",
      "Outgoing billing, incoming supplier inbox, recurring schedules & approvals",
      "Tamper-evident GoBD SHA-256 hash-chained audit trail & DATEV/FEC exports",
      "Transparent country status labels (Available, Partner-Operated, Planned)",
    ],
    boundariesTag: "Honest Software Boundaries",
    boundariesTitle: "A Software Company, Not a Tax Authority",
    boundariesDesc: "NormInvoice is a subscription-based software service. We are not a bank, payment institution, public tax authority, or government certification body. Where regulated network exchange (such as Peppol Access Points or national clearance platforms) is required, NormInvoice integrates with independent authorized providers rather than claiming unverified accreditation.",
    groupTag: "Corporate Group Structure",
    groupTitle: "The Trend&Brand Business Group",
    contractingLabel: "Contracting Entity",
    contractingNote: "The final merchant/contracting entity is confirmed in your order form, checkout summary, and Legal Notice.",
    relatedLabel: "Related Group Entity",
    incorporationLabel: "Incorporation", ntnLabel: "NTN", ceoLabel: "CEO", getInTouch: "Get in Touch",
  },
  de: {
    heroTitle: "Europäische E-Rechnung klar, strukturiert und beherrschbar machen",
    heroDesc: "Die europäischen Märkte stellen auf strukturierte elektronische Rechnungen um — doch jedes Land verwendet andere technische Formate, Steuerfelder, Prüfregeln und Übertragungsnetze. NormInvoice führt diese Abläufe in einer kohärenten, mandantenfähigen Software-Plattform zusammen.",
    missionTitle: "Unsere Mission & Produktfokus",
    missionDesc: "Digitale Rechnungsstellung für wachsende Unternehmen, Finanzteams und Steuerberater zugänglich, transparent und prüfungssicher machen — ohne dass Teams fragile PDF-Hacks und Tabellen zusammenflicken müssen.",
    missionItems: [
      "Deterministische Engine für EN 16931, ZUGFeRD 2.3, Factur-X 1.07 & XRechnung 3.0.2",
      "Ausgehende Abrechnung, Lieferanten-Posteingang, wiederkehrende Zeitpläne & Freigaben",
      "Manipulationssichere GoBD-SHA-256-Hash-Kette & DATEV-/FEC-Exporte",
      "Transparente Länder-Statuslabels (Verfügbar, Partner-betrieben, Geplant)",
    ],
    boundariesTag: "Ehrliche Software-Grenzen",
    boundariesTitle: "Ein Softwareunternehmen, keine Steuerbehörde",
    boundariesDesc: "NormInvoice ist ein abonnementbasierter Software-Dienst. Wir sind keine Bank, kein Zahlungsinstitut, keine öffentliche Steuerbehörde und keine staatliche Zertifizierungsstelle. Wo regulierter Netzwerk-Austausch (etwa Peppol Access Points oder nationale Clearing-Plattformen) erforderlich ist, integriert NormInvoice unabhängige autorisierte Anbieter, anstatt eine ungeprüfte Akkreditierung zu behaupten.",
    groupTag: "Konzernstruktur",
    groupTitle: "Die Trend&Brand-Unternehmensgruppe",
    contractingLabel: "Vertragspartner",
    contractingNote: "Der endgültige Händler/Vertragspartner wird in Ihrem Bestellformular, der Checkout-Zusammenfassung und im Impressum bestätigt.",
    relatedLabel: "Verbundenes Konzernunternehmen",
    incorporationLabel: "Registrierung", ntnLabel: "NTN", ceoLabel: "Geschäftsführer", getInTouch: "Kontakt aufnehmen",
  },
  fr: {
    heroTitle: "Rendre la facturation électronique européenne claire, structurée et gérable",
    heroDesc: "Les marchés européens passent à la facturation électronique structurée — mais chaque pays applique des formats techniques, champs fiscaux, règles de validation et réseaux de transmission différents. NormInvoice réunit ces flux dans une plateforme logicielle cohérente et multi-locataires.",
    missionTitle: "Notre mission & axe produit",
    missionDesc: "Rendre la facturation numérique accessible, transparente et prête pour l'audit pour les entreprises en croissance, les équipes financières et les comptables — sans forcer les équipes à bricoler des PDF fragiles et des tableurs.",
    missionItems: [
      "Moteur déterministe EN 16931, ZUGFeRD 2.3, Factur-X 1.07 & XRechnung 3.0.2",
      "Facturation sortante, boîte de réception fournisseurs, échéanciers récurrents & approbations",
      "Piste d'audit GoBD SHA-256 inviolable & exports DATEV/FEC",
      "Étiquettes de statut pays transparentes (Disponible, Opéré par un partenaire, Planifié)",
    ],
    boundariesTag: "Limites logicielles honnêtes",
    boundariesTitle: "Une société de logiciels, pas une administration fiscale",
    boundariesDesc: "NormInvoice est un service logiciel par abonnement. Nous ne sommes ni une banque, ni un établissement de paiement, ni une administration fiscale publique, ni un organisme de certification gouvernemental. Lorsqu'un échange réseau réglementé (comme les Peppol Access Points ou les plateformes de clearance nationales) est requis, NormInvoice s'intègre à des prestataires indépendants autorisés plutôt que de revendiquer une accréditation non vérifiée.",
    groupTag: "Structure du groupe",
    groupTitle: "Le groupe d'entreprises Trend&Brand",
    contractingLabel: "Entité contractante",
    contractingNote: "L'entité marchande/contractante finale est confirmée dans votre bon de commande, le récapitulatif de paiement et les mentions légales.",
    relatedLabel: "Entité liée du groupe",
    incorporationLabel: "Immatriculation", ntnLabel: "NTN", ceoLabel: "Dirigeant", getInTouch: "Nous contacter",
  },
};

// ── Contact page (form) ──
export interface ContactStrings {
  heroTitle: string; heroDesc: string;
  topicHelpTitle: string; topicHelp: { label: string; text: string }[];
  securityWarn: string;
  formTitle: string; formDesc: string; inquiryReceived: string;
  labelName: string; labelEmail: string; labelCompany: string; labelCountry: string; labelTopic: string; labelMessage: string;
  phName: string; phEmail: string; phCompany: string; phCountry: string; phMessage: string;
  optSales: string; optSupport: string; optBilling: string; optPrivacy: string; optPartners: string; optGeneral: string;
  marketingOptIn: string; privacyPre: string; privacyLink: string; privacyPost: string;
  send: string; sending: string; loading: string; couldNotSubmit: string; submissionFailed: string;
}

export const CONTACT_STRINGS: Record<AppLocale, ContactStrings> = {
  en: {
    heroTitle: "Contact Our Team",
    heroDesc: "Questions about subscription plans, European country support, integrations, billing, or privacy? Send us a message and we will review it directly.",
    topicHelpTitle: "Choose the Right Topic",
    topicHelp: [
      { label: "Sales & Plans:", text: "Plans (Starter, Solo, Business), pricing & country readiness." },
      { label: "Technical Support:", text: "Validation codes, imports, webhooks, and workspace setup." },
      { label: "Billing:", text: "Subscription invoices, plan changes, renewals, and refunds." },
      { label: "Privacy & Security:", text: "GDPR data requests, DPA execution, and security reports." },
      { label: "Partners:", text: "Accountants, ERPs, Peppol Access Points & developers." },
    ],
    securityWarn: "Never send passwords, API keys, or complete payment card numbers in this form.",
    formTitle: "Send a Message",
    formDesc: "Submissions are stored securely in our inquiry queue with a real tracking reference ID.",
    inquiryReceived: "Inquiry Received",
    labelName: "Full Name *", labelEmail: "Work Email *", labelCompany: "Company / Firm", labelCountry: "Country", labelTopic: "Topic *", labelMessage: "Message *",
    phName: "Anna Schmidt", phEmail: "finance@company.eu", phCompany: "Schmidt GmbH", phCountry: "Germany", phMessage: "Describe your invoicing workflow, target EU countries, or question...",
    optSales: "Sales & Plans", optSupport: "Technical Support", optBilling: "Billing & Subscriptions", optPrivacy: "Privacy & Security", optPartners: "Partners & Developers", optGeneral: "General Inquiry",
    marketingOptIn: "Optional: I would also like to receive occasional product updates and European compliance release notes by email.",
    privacyPre: "We use the details you submit to respond to your inquiry in line with our ", privacyLink: "Privacy Policy", privacyPost: ".",
    send: "Send Message", sending: "Sending Inquiry…", loading: "Loading contact form…", couldNotSubmit: "Could not submit your inquiry.", submissionFailed: "Submission failed.",
  },
  de: {
    heroTitle: "Kontaktieren Sie unser Team",
    heroDesc: "Fragen zu Abo-Tarifen, Länderunterstützung in Europa, Integrationen, Abrechnung oder Datenschutz? Senden Sie uns eine Nachricht und wir prüfen sie direkt.",
    topicHelpTitle: "Wählen Sie das richtige Thema",
    topicHelp: [
      { label: "Vertrieb & Tarife:", text: "Tarife (Starter, Solo, Business), Preise & Länderbereitschaft." },
      { label: "Technischer Support:", text: "Prüfcodes, Importe, Webhooks und Workspace-Einrichtung." },
      { label: "Abrechnung:", text: "Abo-Rechnungen, Tarifwechsel, Verlängerungen und Erstattungen." },
      { label: "Datenschutz & Sicherheit:", text: "DSGVO-Datenanfragen, AV-Vertragsabschluss und Sicherheitsmeldungen." },
      { label: "Partner:", text: "Steuerberater, ERPs, Peppol Access Points & Entwickler." },
    ],
    securityWarn: "Senden Sie in diesem Formular niemals Passwörter, API-Schlüssel oder vollständige Zahlungskartennummern.",
    formTitle: "Nachricht senden",
    formDesc: "Einsendungen werden sicher in unserer Anfrage-Warteschlange mit einer echten Tracking-Referenz-ID gespeichert.",
    inquiryReceived: "Anfrage erhalten",
    labelName: "Vollständiger Name *", labelEmail: "Geschäftliche E-Mail *", labelCompany: "Firma", labelCountry: "Land", labelTopic: "Thema *", labelMessage: "Nachricht *",
    phName: "Anna Schmidt", phEmail: "finanzen@firma.eu", phCompany: "Schmidt GmbH", phCountry: "Deutschland", phMessage: "Beschreiben Sie Ihren Rechnungs-Workflow, Ziel-EU-Länder oder Ihre Frage...",
    optSales: "Vertrieb & Tarife", optSupport: "Technischer Support", optBilling: "Abrechnung & Abos", optPrivacy: "Datenschutz & Sicherheit", optPartners: "Partner & Entwickler", optGeneral: "Allgemeine Anfrage",
    marketingOptIn: "Optional: Ich möchte zudem gelegentlich Produkt-Updates und europäische Compliance-Release-Notes per E-Mail erhalten.",
    privacyPre: "Wir verwenden die von Ihnen übermittelten Angaben, um Ihre Anfrage gemäß unserer ", privacyLink: "Datenschutzerklärung", privacyPost: " zu beantworten.",
    send: "Nachricht senden", sending: "Anfrage wird gesendet…", loading: "Kontaktformular wird geladen…", couldNotSubmit: "Ihre Anfrage konnte nicht übermittelt werden.", submissionFailed: "Übermittlung fehlgeschlagen.",
  },
  fr: {
    heroTitle: "Contactez notre équipe",
    heroDesc: "Des questions sur les offres d'abonnement, la prise en charge des pays européens, les intégrations, la facturation ou la confidentialité ? Envoyez-nous un message et nous l'examinerons directement.",
    topicHelpTitle: "Choisissez le bon sujet",
    topicHelp: [
      { label: "Ventes & offres :", text: "Offres (Starter, Solo, Business), tarifs & disponibilité par pays." },
      { label: "Support technique :", text: "Codes de validation, imports, webhooks et configuration de l'espace de travail." },
      { label: "Facturation :", text: "Factures d'abonnement, changements d'offre, renouvellements et remboursements." },
      { label: "Confidentialité & sécurité :", text: "Demandes RGPD, signature du DPA et rapports de sécurité." },
      { label: "Partenaires :", text: "Comptables, ERP, Peppol Access Points & développeurs." },
    ],
    securityWarn: "N'envoyez jamais de mots de passe, de clés API ou de numéros de carte de paiement complets dans ce formulaire.",
    formTitle: "Envoyer un message",
    formDesc: "Les soumissions sont stockées en toute sécurité dans notre file de demandes avec un véritable identifiant de suivi.",
    inquiryReceived: "Demande reçue",
    labelName: "Nom complet *", labelEmail: "E-mail professionnel *", labelCompany: "Société", labelCountry: "Pays", labelTopic: "Sujet *", labelMessage: "Message *",
    phName: "Anna Schmidt", phEmail: "finance@societe.eu", phCompany: "Schmidt GmbH", phCountry: "France", phMessage: "Décrivez votre flux de facturation, les pays de l'UE visés ou votre question...",
    optSales: "Ventes & offres", optSupport: "Support technique", optBilling: "Facturation & abonnements", optPrivacy: "Confidentialité & sécurité", optPartners: "Partenaires & développeurs", optGeneral: "Demande générale",
    marketingOptIn: "Facultatif : je souhaite aussi recevoir occasionnellement des mises à jour produit et des notes de version sur la conformité européenne par e-mail.",
    privacyPre: "Nous utilisons les informations que vous soumettez pour répondre à votre demande conformément à notre ", privacyLink: "Politique de confidentialité", privacyPost: ".",
    send: "Envoyer le message", sending: "Envoi de la demande…", loading: "Chargement du formulaire de contact…", couldNotSubmit: "Impossible de soumettre votre demande.", submissionFailed: "Échec de la soumission.",
  },
};
