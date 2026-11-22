import type { FormatProfile } from "./types.js";

/**
 * Versioned 13-Market European Country Compliance Modules (Master Plan v1.0 Section 06 & 07)
 * Architecture: One shared EN 16931 engine + independent, versioned country rulesets.
 * Delivery principle: Unsupported countries are NEVER labeled LIVE or send-ready.
 */

export type CountryComplianceStatus = "LIVE_CORE" | "PARTNER_ADAPTER" | "PLANNED";
export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW_MEDIUM";

export interface CountryComplianceModule {
  code: string;
  name: string;
  regionLabel: string;
  rulesetVersion: string;
  priorityScore: number;
  status: CountryComplianceStatus;
  confidence: ConfidenceLevel;
  effectiveDate: string;
  sourceUrl: string;
  defaultProfile: FormatProfile;
  supportedFormats: string[];
  networkModel: string;
  retentionYears: number;
  mandateTimeline: string;
  requiredFields: Array<{
    bt: string;
    label: string;
    when: string;
  }>;
  accountantExports: string[];
  notes: string;
}

export const EU_COUNTRY_MODULES: CountryComplianceModule[] = [
  {
    code: "DE",
    name: "Germany",
    regionLabel: "DACH · Primary Launch Market (P0)",
    rulesetVersion: "DE-EN16931-2026.1 (XRechnung 3.0.2 / ZUGFeRD 2.3)",
    priorityScore: 94,
    status: "LIVE_CORE",
    confidence: "HIGH",
    effectiveDate: "2025-01-01",
    sourceUrl: "https://www.bundesfinanzministerium.de/Content/DE/FAQ/e-rechnung.html",
    defaultProfile: "ZUGFERD_EN16931",
    supportedFormats: ["ZUGFeRD 2.3 (PDF/A-3b + CII)", "XRechnung 3.0.2 (CII & UBL)", "Peppol BIS 3.0"],
    networkModel: "Email / Peppol / OZG-RE (B2G)",
    retentionYears: 8,
    mandateTimeline: "B2B receiving mandatory since 1 Jan 2025; issuance phases 2027 (>€800k) & 2028 (all B2B)",
    requiredFields: [
      { bt: "BT-31 / BT-32", label: "USt-IdNr. or Steuernummer", when: "Always required for German sellers" },
      { bt: "BT-10", label: "Buyer Reference / Leitweg-ID", when: "Mandatory for XRechnung & German B2G (BR-DE-15)" },
      { bt: "BG-6", label: "Seller Contact (Name, Phone, Email)", when: "Mandatory for XRechnung (BR-DE-2)" },
      { bt: "BT-22", label: "§ 19 UStG Notice", when: "Required when Kleinunternehmer exemption applies" },
    ],
    accountantExports: ["DATEV EXTF v700 (SKR03 / SKR04)", "GoBD Verfahrensdokumentation (BEG IV)"],
    notes: "Full deterministic EN 16931 + BR-DE-* validation, Hybrid PDF/A-3b, GoBD SHA-256 hash chain, and DATEV EXTF.",
  },
  {
    code: "BE",
    name: "Belgium",
    regionLabel: "Benelux · Peppol-First (P0/P1)",
    rulesetVersion: "BE-PEPPOL-BIS3-2026.1",
    priorityScore: 89,
    status: "LIVE_CORE",
    confidence: "HIGH",
    effectiveDate: "2026-01-01",
    sourceUrl: "https://einvoice.belgium.be/en/article/structured-electronic-invoices-between-companies-are-compulsory-2026",
    defaultProfile: "PEPPOL_BIS_3",
    supportedFormats: ["Peppol BIS Billing 3.0 (UBL 2.1)", "EN 16931 UBL"],
    networkModel: "OpenPeppol Four-Corner Network (EAS 0208 / 9925)",
    retentionYears: 7,
    mandateTimeline: "Mandatory structured domestic B2B e-invoicing via Peppol since 1 January 2026",
    requiredFields: [
      { bt: "BT-34 / BT-49", label: "Peppol Electronic Address (0208 Enterprise No. / 9925 VAT)", when: "Required for Peppol routing" },
      { bt: "BT-31", label: "Belgian VAT ID (BE0...)", when: "Required for domestic B2B" },
      { bt: "BT-84", label: "SEPA IBAN", when: "Required for credit transfer (Code 58)" },
    ],
    accountantExports: ["UBL 2.1 Archive ZIP", "Structured Peppol Receipt Manifest"],
    notes: "Built-in Peppol BIS 3.0 UBL serializer + live OpenPeppol Directory participant lookup.",
  },
  {
    code: "FR",
    name: "France",
    regionLabel: "Western EU · Factur-X & Approved Platform (P2)",
    rulesetVersion: "FR-FACTURX-1.07-2026.2",
    priorityScore: 84,
    status: "PARTNER_ADAPTER",
    confidence: "HIGH",
    effectiveDate: "2026-09-01",
    sourceUrl: "https://www.impots.gouv.fr/facturation-electronique-et-plateformes-agreees",
    defaultProfile: "FACTURX_EN16931",
    supportedFormats: ["Factur-X 1.07 (EN 16931 / Extended)", "UBL 2.1", "CII D16B"],
    networkModel: "Plateforme Agréée (Approved Platform Partner) + PPF Directory",
    retentionYears: 10,
    mandateTimeline: "Receiving & Large/Mid issuance since 1 Sep 2026; SME issuance 1 Sep 2027",
    requiredFields: [
      { bt: "BT-30 / BT-47", label: "SIREN / SIRET Identifier", when: "Required for French domestic B2B routing" },
      { bt: "BT-22", label: "French Mandatory Legal Mentions (BR-FR-05)", when: "Late payment penalty & €40 recovery fee notice" },
      { bt: "BT-31", label: "French TVA Intracommunautaire (FR...)", when: "Required for VAT-registered businesses" },
    ],
    accountantExports: ["DGFiP FEC (Art. L47 A-I LPF)", "10-Year Archive ZIP"],
    notes: "Factur-X 1.07 PDF/A-3b + BR-FR-05 validation + DGFiP FEC built in; statutory transmission requires Approved Platform partner.",
  },
  {
    code: "PL",
    name: "Poland",
    regionLabel: "Central EU · National Clearance KSeF 2.0 (P2)",
    rulesetVersion: "PL-KSEF-FA3-2026.1",
    priorityScore: 78,
    status: "PARTNER_ADAPTER",
    confidence: "HIGH",
    effectiveDate: "2026-02-01",
    sourceUrl: "https://ksef.podatki.gov.pl/ksef-news/zasady-obowiazywania-ksef-i-przepisy-prawne/",
    defaultProfile: "PEPPOL_BIS_3",
    supportedFormats: ["KSeF FA(3) XML (Clearance Adapter)", "EN 16931 UBL"],
    networkModel: "Centralized Government Clearance (KSeF 2.0 API + UPO)",
    retentionYears: 10,
    mandateTimeline: "KSeF phased Feb/Apr 2026; smallest threshold businesses Jan 2027",
    requiredFields: [
      { bt: "BT-31", label: "Polish NIP (PL + 10 digits)", when: "Mandatory for KSeF taxpayer identification" },
      { bt: "KSeF-ID", label: "Government Clearance Number (Numer KSeF / UPO)", when: "Assigned upon KSeF acceptance" },
    ],
    accountantExports: ["JPK_VAT / FA(3) Archive Pack"],
    notes: "KSeF 2.0 FA(3) mapping and offline-mode sync queued via certified clearance partner adapter.",
  },
  {
    code: "NL",
    name: "Netherlands",
    regionLabel: "Benelux · Peppol & NLCIUS",
    rulesetVersion: "NL-NLCIUS-2026.1",
    priorityScore: 73,
    status: "LIVE_CORE",
    confidence: "MEDIUM",
    effectiveDate: "2019-04-18",
    sourceUrl: "https://ec.europa.eu/digital-building-blocks/sites/spaces/einvoicingCFS/pages/956171309/2026%2BThe%2BNetherlands%2B2026%2BeInvoicing%2BCountry%2BSheet",
    defaultProfile: "PEPPOL_BIS_3",
    supportedFormats: ["Peppol BIS Billing 3.0", "NLCIUS / SI-UBL 2.0"],
    networkModel: "OpenPeppol / Digipoort (B2G)",
    retentionYears: 7,
    mandateTimeline: "B2G mandatory via Peppol/Digipoort; domestic B2B planned 1 Jul 2030 (ViDA)",
    requiredFields: [
      { bt: "BT-34", label: "KvK (0106) or OIN (0190) Peppol ID", when: "Required for Dutch B2G/Peppol routing" },
      { bt: "BT-31", label: "Dutch BTW-ID (NL...B01)", when: "Required for VAT-registered suppliers" },
    ],
    accountantExports: ["UBL 2.1 Archive ZIP"],
    notes: "Supports Peppol BIS 3.0 & OpenPeppol participant lookup for Dutch KvK/OIN endpoints.",
  },
  {
    code: "ES",
    name: "Spain",
    regionLabel: "Southern EU · B2B Exchange & VERI*FACTU",
    rulesetVersion: "ES-HAC1028-2026.1",
    priorityScore: 72,
    status: "PLANNED",
    confidence: "HIGH",
    effectiveDate: "2027-10-06",
    sourceUrl: "https://www.boe.es/eli/es/o/2026/10/02/hac1028/con",
    defaultProfile: "PEPPOL_BIS_3",
    supportedFormats: ["UBL EN 16931 / Facturae", "VERI*FACTU SIF (separate track)"],
    networkModel: "Spanish Public/Private B2B Exchange + AEAT Payment Status",
    retentionYears: 6,
    mandateTimeline: "Order HAC/1028/2026: 6 Oct 2027 large businesses; 6 Oct 2028 other issuers",
    requiredFields: [
      { bt: "BT-31", label: "Spanish NIF / CIF (ES...)", when: "Mandatory tax identifier" },
      { bt: "PAYMENT", label: "Invoice Payment-Status Reporting", when: "Required under Crea y Crece" },
    ],
    accountantExports: ["Structured Archive ZIP + Payment Status Ledger"],
    notes: "Separate payment-status ledger already built in NormInvoice; Spanish B2B connector gated on 2027 specs.",
  },
  {
    code: "IT",
    name: "Italy",
    regionLabel: "Southern EU · Mature Clearance (SdI)",
    rulesetVersion: "IT-FATTURAPA-1.2.2",
    priorityScore: 69,
    status: "PARTNER_ADAPTER",
    confidence: "HIGH",
    effectiveDate: "2019-01-01",
    sourceUrl: "https://www.agid.gov.it/it/piattaforme/fatturazione-elettronica",
    defaultProfile: "PEPPOL_BIS_3",
    supportedFormats: ["FatturaPA XML (SdI)", "Peppol BIS 3.0 (B2G/NSO)"],
    networkModel: "Sistema di Interscambio (SdI) via Authorized Intermediary",
    retentionYears: 10,
    mandateTimeline: "Domestic B2B, B2C & B2G clearance via SdI already mandatory",
    requiredFields: [
      { bt: "BT-49", label: "Codice Destinatario (7-char) or PEC", when: "Required for SdI routing" },
      { bt: "BT-31", label: "Partita IVA (IT + 11 digits)", when: "Mandatory Italian VAT ID" },
    ],
    accountantExports: ["Conservazione Sostitutiva Archive ZIP"],
    notes: "Requires certified SdI intermediary partner before LIVE badge is enabled.",
  },
  {
    code: "AT",
    name: "Austria",
    regionLabel: "DACH · Federal B2G & Peppol",
    rulesetVersion: "AT-PEPPOL-EBINTERFACE-2026.1",
    priorityScore: 68,
    status: "LIVE_CORE",
    confidence: "MEDIUM",
    effectiveDate: "2014-01-01",
    sourceUrl: "https://ec.europa.eu/digital-building-blocks/sites/spaces/einvoicingCFS/pages/956171272/2026%2BAustria%2B2026%2BeInvoicing%2BCountry%2BSheet",
    defaultProfile: "PEPPOL_BIS_3",
    supportedFormats: ["Peppol BIS 3.0 (UBL 2.1)", "ZUGFeRD 2.3 (B2B)", "ebInterface 6.1"],
    networkModel: "OpenPeppol / e-Rechnung.gv.at (USP)",
    retentionYears: 7,
    mandateTimeline: "Federal B2G mandatory via e-Rechnung.gv.at / Peppol; voluntary domestic B2B",
    requiredFields: [
      { bt: "BT-10", label: "Auftragsreferenz / Einkäufergruppe", when: "Mandatory for Austrian Federal B2G" },
      { bt: "BT-31", label: "UID-Nummer (ATU...)", when: "Required for VAT-registered suppliers" },
    ],
    accountantExports: ["DATEV / BMD CSV + UBL Archive ZIP"],
    notes: "Compatible with Austrian Peppol BIS 3.0 & DACH ZUGFeRD workflows.",
  },
  {
    code: "RO",
    name: "Romania",
    regionLabel: "Eastern EU · ANAF RO e-Factura",
    rulesetVersion: "RO-CIUS-ANAF-2026.1",
    priorityScore: 67,
    status: "PLANNED",
    confidence: "MEDIUM",
    effectiveDate: "2024-01-01",
    sourceUrl: "https://ec.europa.eu/digital-building-blocks/sites/spaces/einvoicingCFS/pages/956171302/2026%2BRomania%2B2026%2BeInvoicing%2BCountry%2BSheet",
    defaultProfile: "PEPPOL_BIS_3",
    supportedFormats: ["UBL 2.1 / RO_CIUS"],
    networkModel: "ANAF RO e-Factura National Platform (OAuth2 + Seal)",
    retentionYears: 10,
    mandateTimeline: "Mandatory domestic B2B and B2C reporting via ANAF RO e-Factura",
    requiredFields: [
      { bt: "BT-31", label: "Romanian CIF / CUI (RO...)", when: "Mandatory for ANAF submission" },
      { bt: "ANAF-ID", label: "ANAF Index & Electronic Seal", when: "Returned upon ANAF validation" },
    ],
    accountantExports: ["RO_CIUS UBL Archive ZIP"],
    notes: "Planned: requires ANAF OAuth2 connector & Romanian counsel signoff before LIVE.",
  },
  {
    code: "HR",
    name: "Croatia",
    regionLabel: "Adriatic EU · Fiskalizacija 2.0",
    rulesetVersion: "HR-FISKALIZACIJA-2.0-2026.1",
    priorityScore: 65,
    status: "PLANNED",
    confidence: "HIGH",
    effectiveDate: "2026-01-01",
    sourceUrl: "https://porezna.gov.hr/fiskalizacija/bezgotovinski-racuni/eracun",
    defaultProfile: "PEPPOL_BIS_3",
    supportedFormats: ["EN 16931 eRačun + Croatian Extensions"],
    networkModel: "Tax-Authorized Access Points + eReporting / Fiskalizacija 2.0",
    retentionYears: 11,
    mandateTimeline: "Fiskalizacija 2.0 B2B receiving/issuing 2026; broader non-VAT issuance 1 Jan 2027",
    requiredFields: [
      { bt: "BT-31", label: "Croatian OIB (HR + 11 digits)", when: "Mandatory taxpayer identifier" },
      { bt: "KPD-2025", label: "KPD 2025 Product Classification Code", when: "Required per Croatian line item rules" },
    ],
    accountantExports: ["eRačun XML + Fiscalization Evidence ZIP"],
    notes: "Planned: exchange receipt and fiscalization tracked as separate events.",
  },
  {
    code: "GR",
    name: "Greece",
    regionLabel: "Southern EU · AADE myDATA",
    rulesetVersion: "GR-AADE-MYDATA-2026.1",
    priorityScore: 64,
    status: "PLANNED",
    confidence: "HIGH",
    effectiveDate: "2026-03-02",
    sourceUrl: "https://www.aade.gr/en/mandatory-electronic-invoicing-digital-goods-movement-documents-frequently-asked-questions-answers",
    defaultProfile: "PEPPOL_BIS_3",
    supportedFormats: ["AADE myDATA XML / Licensed Provider"],
    networkModel: "Licensed E-Invoicing Provider (YPAES) or AADE timologio",
    retentionYears: 5,
    mandateTimeline: "Decision A.1128/2025: >€1m from 2 Mar 2026; remainder 2 Nov 2026 (transition to 31 Jan 2027)",
    requiredFields: [
      { bt: "BT-31", label: "Greek AFM (EL + 9 digits)", when: "Mandatory tax ID" },
      { bt: "MARK", label: "myDATA MARK Identifier", when: "Issued upon AADE acceptance" },
    ],
    accountantExports: ["myDATA Reconciliation Pack"],
    notes: "Planned: requires licensed Greek YPAES partner integration.",
  },
  {
    code: "PT",
    name: "Portugal",
    regionLabel: "Iberia · B2G CIUS-PT & SAF-T(PT)",
    rulesetVersion: "PT-CIUS-PT-2026.1",
    priorityScore: 61,
    status: "PLANNED",
    confidence: "LOW_MEDIUM",
    effectiveDate: "2023-01-01",
    sourceUrl: "https://ec.europa.eu/digital-building-blocks/sites/spaces/einvoicingCFS/pages/956171301/2026%2BPortugal%2B2026%2BeInvoicing%2BCountry%2BSheet",
    defaultProfile: "PEPPOL_BIS_3",
    supportedFormats: ["CIUS-PT (UBL/CII)", "SAF-T(PT) + ATCUD / QR"],
    networkModel: "Public Administration B2G Routes + AT Series Reporting",
    retentionYears: 10,
    mandateTimeline: "B2G structured e-invoicing active; AT series/ATCUD/QR rules require local confirmation",
    requiredFields: [
      { bt: "BT-31", label: "Portuguese NIF (PT + 9 digits)", when: "Mandatory tax identifier" },
      { bt: "ATCUD", label: "AT Series Validation Code & QR", when: "Required for Portuguese fiscal documents" },
    ],
    accountantExports: ["SAF-T(PT) Export (Planned)"],
    notes: "Planned: Portuguese tax certification & qualified e-signature policy require local counsel signoff.",
  },
  {
    code: "GB",
    name: "United Kingdom",
    regionLabel: "UK · HMRC 2029 Readiness Watch",
    rulesetVersion: "UK-HMRC-ROADMAP-2029",
    priorityScore: 60,
    status: "PLANNED",
    confidence: "HIGH",
    effectiveDate: "2029-04-01",
    sourceUrl: "https://www.gov.uk/government/publications/e-invoicing-implementation-roadmap/roadmap-for-e-invoicing-implementation",
    defaultProfile: "PEPPOL_BIS_3",
    supportedFormats: ["Peppol BIS 3.0 (NHS / B2G)", "Future UK VAT Standard (2029)"],
    networkModel: "Voluntary B2B / Peppol B2G; Planned UK Peppol Framework (Apr 2029)",
    retentionYears: 6,
    mandateTimeline: "HMRC VAT e-invoicing mandate planned from 1 April 2029; secondary regulations forthcoming",
    requiredFields: [
      { bt: "BT-31", label: "UK VAT Registration Number (GB...)", when: "Required for VAT-registered suppliers" },
    ],
    accountantExports: ["MTD-Compatible CSV & UBL Archive"],
    notes: "Readiness mode only — no mandatory-ready badge shown before HMRC final specifications.",
  },
];

export function getCountryComplianceModule(countryCode: string): CountryComplianceModule {
  const upper = (countryCode || "DE").trim().toUpperCase();
  return EU_COUNTRY_MODULES.find((m) => m.code === upper) ?? EU_COUNTRY_MODULES[0]!;
}

/**
 * Transaction-Aware Compliance Route Resolver (Master Plan Section 5.3 & 7.1)
 * Resolves exact profile, status, and explanation from Seller Country, Buyer Country, and Scenario.
 */
export function resolveComplianceRoute(params: {
  sellerCountry: string;
  buyerCountry: string;
  scenario: "B2B" | "B2G" | "B2C";
}): {
  countryModule: CountryComplianceModule;
  recommendedProfile: FormatProfile;
  isCrossBorder: boolean;
  sendReady: boolean;
  explanation: string;
} {
  const sCode = (params.sellerCountry || "DE").toUpperCase();
  const bCode = (params.buyerCountry || sCode).toUpperCase();
  const isCrossBorder = sCode !== bCode;
  const mod = getCountryComplianceModule(isCrossBorder ? bCode : sCode);

  if (params.scenario === "B2G" && bCode === "DE") {
    return {
      countryModule: getCountryComplianceModule("DE"),
      recommendedProfile: "XRECHNUNG_UBL",
      isCrossBorder,
      sendReady: true,
      explanation: "German B2G public-sector invoices require XRechnung 3.0.2 with mandatory BT-10 Leitweg-ID and BG-6 Seller Contact.",
    };
  }

  if (bCode === "BE" || (isCrossBorder && params.scenario === "B2B" && ["BE", "NL", "AT"].includes(bCode))) {
    return {
      countryModule: mod,
      recommendedProfile: "PEPPOL_BIS_3",
      isCrossBorder,
      sendReady: true,
      explanation: `${mod.name} ${params.scenario} transactions use Peppol BIS Billing 3.0 (UBL 2.1). Verify buyer Peppol ID before sending.`,
    };
  }

  if (bCode === "FR" && sCode === "FR") {
    return {
      countryModule: getCountryComplianceModule("FR"),
      recommendedProfile: "FACTURX_EN16931",
      isCrossBorder: false,
      sendReady: false,
      explanation: "French domestic B2B uses Factur-X 1.07 (generation & DGFiP FEC live); statutory transmission requires an Approved Platform (PDP) partner.",
    };
  }

  if (mod.status === "LIVE_CORE") {
    return {
      countryModule: mod,
      recommendedProfile: mod.defaultProfile,
      isCrossBorder,
      sendReady: true,
      explanation: `${mod.name} (${mod.rulesetVersion}) is LIVE in NormInvoice core with deterministic EN 16931 validation and GoBD archiving.`,
    };
  }

  return {
    countryModule: mod,
    recommendedProfile: mod.defaultProfile,
    isCrossBorder,
    sendReady: false,
    explanation: `${mod.name} (${mod.status}) is not yet enabled for live statutory gateway transmission. You can generate & validate EN 16931 drafts, but external authority clearance requires partner activation.`,
  };
}
