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
