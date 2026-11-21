import { z } from "zod";

export const FormatProfileSchema = z.enum([
  "ZUGFERD_EN16931",
  "FACTURX_EN16931",
  "XRECHNUNG_CII",
  "XRECHNUNG_UBL",
  "PEPPOL_BIS_3",
]);
export type FormatProfile = z.infer<typeof FormatProfileSchema>;

export const VatCategoryCodeSchema = z.enum([
  "S", // Standard rate (e.g., DE 19% / 7%, FR 20% / 10%)
  "AE", // VAT Reverse Charge (Intra-EU B2B)
  "E", // Exempt from tax (e.g., Kleinunternehmer § 19 UStG)
  "Z", // Zero rated goods
  "G", // Free export item, tax not charged (Non-EU)
  "K", // VAT exempt for EEA intra-community supply of goods
  "O", // Services outside scope of tax
]);
export type VatCategoryCode = z.infer<typeof VatCategoryCodeSchema>;

export const PaymentMeansCodeSchema = z.enum([
  "30", // Credit transfer
  "48", // Bank card
  "58", // SEPA credit transfer
  "59", // SEPA direct debit
  "97", // Clearing between partners
]);
export type PaymentMeansCode = z.infer<typeof PaymentMeansCodeSchema>;

export const PostalAddressSchema = z.object({
  street: z.string().min(1), // BT-35 / BT-50
  additionalLine: z.string().optional(), // BT-36 / BT-51
  city: z.string().min(1), // BT-37 / BT-52
  postalCode: z.string().min(1), // BT-38 / BT-53
  countryCode: z.string().length(2).toUpperCase(), // BT-40 / BT-55 (ISO 3166-1 alpha-2)
});
export type PostalAddress = z.infer<typeof PostalAddressSchema>;

export const SellerContactSchema = z.object({
  name: z.string().min(1), // BT-41
  phone: z.string().min(1), // BT-42
  email: z.string().email(), // BT-43
});
export type SellerContact = z.infer<typeof SellerContactSchema>;

export const SellerPartySchema = z.object({
  name: z.string().min(1), // BT-27
  tradingName: z.string().optional(), // BT-28
  vatId: z.string().optional(), // BT-31
  taxNumber: z.string().optional(), // BT-32 (German Steuernummer)
  registrationId: z.string().optional(), // BT-30 (HRB / SIREN)
  electronicAddress: z.string().optional(), // BT-34
  electronicAddressScheme: z.string().default("EM"), // EAS code (EM=email, 0204=Leitweg-ID, 0002=SIREN)
  address: PostalAddressSchema, // BG-5
  contact: SellerContactSchema.optional(), // BG-6 (mandatory for XRechnung BR-DE-2)
  isKleinunternehmer: z.boolean().default(false),
});
export type SellerParty = z.infer<typeof SellerPartySchema>;

export const BuyerPartySchema = z.object({
  name: z.string().min(1), // BT-44
  vatId: z.string().optional(), // BT-48
  registrationId: z.string().optional(), // BT-47 (SIREN/SIRET)
  electronicAddress: z.string().optional(), // BT-49
  electronicAddressScheme: z.string().default("EM"),
  address: PostalAddressSchema, // BG-8
});
export type BuyerParty = z.infer<typeof BuyerPartySchema>;

export const PaymentInstructionsSchema = z.object({
  meansCode: PaymentMeansCodeSchema.default("58"), // BT-81
  paymentTerms: z.string().optional(), // BT-20
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), // BT-9
  iban: z.string().optional(), // BT-84
  bic: z.string().optional(), // BT-86
  accountName: z.string().optional(), // BT-85
  remittanceReference: z.string().optional(), // BT-83
});
export type PaymentInstructions = z.infer<typeof PaymentInstructionsSchema>;

export const InvoiceLineSchema = z.object({
  id: z.string().min(1), // BT-126
  name: z.string().min(1), // BT-153
  description: z.string().optional(), // BT-154
  quantity: z.number().finite(), // BT-129
  unitCode: z.string().min(2).default("H87"), // BT-130 (UN/ECE Rec 20: H87=piece, HUR=hour, MON=month, C62=unit)
  unitPrice: z.number().finite(), // BT-146 (net price per unit)
  lineAllowance: z.number().min(0).default(0), // BG-27
  lineCharge: z.number().min(0).default(0), // BG-28
  lineNetAmount: z.number().finite().optional(), // BT-131 (computed if omitted)
  vatCategory: VatCategoryCodeSchema.default("S"), // BT-151
  vatRate: z.number().min(0).max(100), // BT-152
});
export type InvoiceLine = z.infer<typeof InvoiceLineSchema>;

export const VatBreakdownSchema = z.object({
  categoryCode: VatCategoryCodeSchema, // BT-118
  rate: z.number().min(0).max(100), // BT-119
  taxableAmount: z.number().finite(), // BT-116
  taxAmount: z.number().finite(), // BT-117
  exemptionReason: z.string().optional(), // BT-120
  exemptionReasonCode: z.string().optional(), // BT-121
});
export type VatBreakdown = z.infer<typeof VatBreakdownSchema>;

export const DocumentTotalsSchema = z.object({
  lineNetTotal: z.number().finite(), // BT-106
  allowancesTotal: z.number().min(0).default(0), // BT-107
  chargesTotal: z.number().min(0).default(0), // BT-108
  taxExclusiveTotal: z.number().finite(), // BT-109
  taxTotal: z.number().finite(), // BT-110
  taxInclusiveTotal: z.number().finite(), // BT-112
  prepaidAmount: z.number().min(0).default(0), // BT-113
  roundingAmount: z.number().default(0), // BT-114
  payableAmount: z.number().finite(), // BT-115
});
export type DocumentTotals = z.infer<typeof DocumentTotalsSchema>;

export const CanonicalInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1), // BT-1
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // BT-2
  typeCode: z.union([z.literal(380), z.literal(381)]).default(380), // BT-3 (380=Invoice, 381=Credit Note)
  currency: z.string().length(3).toUpperCase().default("EUR"), // BT-5
  buyerReference: z.string().optional(), // BT-10 (Leitweg-ID for German XRechnung)
  purchaseOrderReference: z.string().optional(), // BT-13
  precedingInvoiceReference: z.string().optional(), // BT-25 (required for Credit Note 381)
  notes: z.array(z.string()).default([]), // BT-22
  locale: z.enum(["de", "fr", "en"]).default("de"),
  profile: FormatProfileSchema.default("ZUGFERD_EN16931"),
  seller: SellerPartySchema,
  buyer: BuyerPartySchema,
  payment: PaymentInstructionsSchema,
  lines: z.array(InvoiceLineSchema).min(1),
  allowancesTotal: z.number().min(0).default(0),
  chargesTotal: z.number().min(0).default(0),
  prepaidAmount: z.number().min(0).default(0),
  roundingAmount: z.number().default(0),
  vatBreakdown: z.array(VatBreakdownSchema).optional(),
  totals: DocumentTotalsSchema.optional(),
});
export type CanonicalInvoice = z.infer<typeof CanonicalInvoiceSchema>;

export interface ValidationDiagnostic {
  ruleId: string;
  severity: "error" | "warning" | "info";
  fieldBt: string;
  xpath?: string;
  titleEn: string;
  titleDe: string;
  titleFr: string;
  messageEn: string;
  messageDe: string;
  messageFr: string;
  fixHintEn: string;
  fixHintDe: string;
  fixHintFr: string;
  docsUrl: string;
}

export interface ValidationReport {
  valid: boolean;
  engine: "builtin-en16931" | "kosit+verapdf";
  detected: {
    container: "PDF/A-3b" | "PDF (Non-PDF/A-3)" | "XML";
    syntax: "CII" | "UBL" | "UNKNOWN";
    standard: string;
    profile: string;
  };
  checks: {
    pdfa3b: { applicable: boolean; passed: boolean; details: string };
    syntaxXsd: { passed: boolean; errors: number };
    schematronEn16931: { passed: boolean; errors: number; warnings: number };
  };
  diagnostics: ValidationDiagnostic[];
  computedTotals?: DocumentTotals;
  sepaQrPayload?: string | null;
}

export const FORMAT_GUIDELINE_URNS: Record<FormatProfile, { ciiUrn: string; ublCustomizationId: string; ublProfileId: string; label: string }> = {
  ZUGFERD_EN16931: {
    ciiUrn: "urn:cen.eu:en16931:2017",
    ublCustomizationId: "urn:cen.eu:en16931:2017",
    ublProfileId: "urn:fdc:peppol.eu:2017:poacc:billing:01:1.0",
    label: "ZUGFeRD 2.3 (EN 16931)",
  },
  FACTURX_EN16931: {
    ciiUrn: "urn:cen.eu:en16931:2017",
    ublCustomizationId: "urn:cen.eu:en16931:2017",
    ublProfileId: "urn:fdc:peppol.eu:2017:poacc:billing:01:1.0",
    label: "Factur-X 1.07 (EN 16931)",
  },
  XRECHNUNG_CII: {
    ciiUrn: "urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0",
    ublCustomizationId: "urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0",
    ublProfileId: "urn:fdc:peppol.eu:2017:poacc:billing:01:1.0",
    label: "XRechnung 3.0.2 (CII)",
  },
  XRECHNUNG_UBL: {
    ciiUrn: "urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0",
    ublCustomizationId: "urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0",
    ublProfileId: "urn:fdc:peppol.eu:2017:poacc:billing:01:1.0",
    label: "XRechnung 3.0.2 (UBL 2.1)",
  },
  PEPPOL_BIS_3: {
    ciiUrn: "urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0",
    ublCustomizationId: "urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0",
    ublProfileId: "urn:fdc:peppol.eu:2017:poacc:billing:01:1.0",
    label: "Peppol BIS Billing 3.0 (UBL 2.1)",
  },
};
