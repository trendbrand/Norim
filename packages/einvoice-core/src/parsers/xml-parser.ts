import { XMLParser } from "fast-xml-parser";
import type {
  CanonicalInvoice,
  DocumentTotals,
  FormatProfile,
  InvoiceLine,
  PaymentMeansCode,
  VatBreakdown,
  VatCategoryCode,
} from "../types.js";

export interface ParsedXmlResult {
  syntax: "CII" | "UBL";
  profileDetected: FormatProfile;
  guidelineId: string;
  invoice: CanonicalInvoice;
}

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  removeNSPrefix: true,
  parseTagValue: false,
  trimValues: true,
  processEntities: false, // Security: strictly disable XXE & Billion Laughs entity expansion
});

function asArray<T>(val: T | T[] | undefined | null): T[] {
  if (val === undefined || val === null) return [];
  return Array.isArray(val) ? val : [val];
}

function textOf(node: unknown): string {
  if (node === null || node === undefined) return "";
  if (typeof node === "string" || typeof node === "number") return String(node).trim();
  if (typeof node === "object" && "#text" in (node as Record<string, unknown>)) {
    return String((node as Record<string, unknown>)["#text"] ?? "").trim();
  }
  return "";
}

function numOf(node: unknown, fallback = 0): number {
  const raw = textOf(node).replace(",", ".");
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseCiiDate(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  }
  return raw;
}

function detectProfileFromUrn(urn: string, syntax: "CII" | "UBL"): FormatProfile {
  const lower = urn.toLowerCase();
  if (lower.includes("xrechnung")) {
    return syntax === "UBL" ? "XRECHNUNG_UBL" : "XRECHNUNG_CII";
  }
  if (lower.includes("peppol")) {
    return "PEPPOL_BIS_3";
  }
  if (lower.includes("factur-x")) {
    return "FACTURX_EN16931";
  }
  return syntax === "UBL" ? "XRECHNUNG_UBL" : "ZUGFERD_EN16931";
}

function coerceVatCategory(code: string): VatCategoryCode {
  const valid: VatCategoryCode[] = ["S", "AE", "E", "Z", "G", "K", "O"];
  const upper = code.toUpperCase() as VatCategoryCode;
  return valid.includes(upper) ? upper : "S";
}

function coercePaymentMeans(code: string): PaymentMeansCode {
  const valid: PaymentMeansCode[] = ["30", "48", "58", "59", "97"];
  return valid.includes(code as PaymentMeansCode) ? (code as PaymentMeansCode) : "58";
}

/**
 * Safely parses CII (ZUGFeRD / Factur-X / XRechnung CII) or UBL 2.1 (XRechnung UBL / Peppol BIS 3.0) XML
 * into our syntax-neutral Canonical EN 16931 Invoice model.
 */
const MAX_XML_BYTES = 5 * 1024 * 1024; // 5 MB XML DoS guard

export function parseEInvoiceXml(xmlString: string): ParsedXmlResult {
  if (Buffer.byteLength(xmlString, "utf8") > MAX_XML_BYTES) {
    throw new Error("SECURITY_BLOCKED_SIZE: XML payload exceeds 5 MB security cap.");
  }
  const trimmed = xmlString.trim();
  // Hard security guard against DTD / XXE / Billion Laughs payloads
  if (/<!DOCTYPE/i.test(trimmed) || /<!ENTITY/i.test(trimmed)) {
    throw new Error("SECURITY_BLOCKED_DTD: XML contains forbidden DOCTYPE or ENTITY declarations.");
  }

  const parsed = xmlParser.parse(trimmed) as Record<string, any>;

  if (parsed.CrossIndustryInvoice) {
    return parseCiiRoot(parsed.CrossIndustryInvoice);
  }
  if (parsed.Invoice || parsed.CreditNote) {
    const isCreditNote = Boolean(parsed.CreditNote);
    return parseUblRoot(parsed.CreditNote ?? parsed.Invoice, isCreditNote);
  }

  throw new Error("UNSUPPORTED_XML_ROOT: Expected CrossIndustryInvoice (CII) or Invoice/CreditNote (UBL 2.1).");
}

function parseCiiRoot(root: Record<string, any>): ParsedXmlResult {
  const guidelineId = textOf(
    root?.ExchangedDocumentContext?.GuidelineSpecifiedDocumentContextParameter?.ID
  );
  const profileDetected = detectProfileFromUrn(guidelineId, "CII");

  const doc = root.ExchangedDocument ?? {};
  const tx = root.SupplyChainTradeTransaction ?? {};
  const agr = tx.ApplicableHeaderTradeAgreement ?? {};
  const stl = tx.ApplicableHeaderTradeSettlement ?? {};

  const sellerNode = agr.SellerTradeParty ?? {};
  const buyerNode = agr.BuyerTradeParty ?? {};
  const sellerRegs = asArray(sellerNode.SpecifiedTaxRegistration);
  const sellerVat = sellerRegs.find((r) => r?.ID?.["@_schemeID"] === "VA");
  const sellerTaxNo = sellerRegs.find((r) => r?.ID?.["@_schemeID"] === "FC");

  const buyerRegs = asArray(buyerNode.SpecifiedTaxRegistration);
  const buyerVat = buyerRegs.find((r) => r?.ID?.["@_schemeID"] === "VA") ?? buyerRegs[0];

  const paymentMeans = asArray(stl.SpecifiedTradeSettlementPaymentMeans)[0] ?? {};
  const paymentTerms = asArray(stl.SpecifiedTradePaymentTerms)[0] ?? {};
  const monetary = stl.SpecifiedTradeSettlementHeaderMonetarySummation ?? {};

  const rawLines = asArray(tx.IncludedSupplyChainTradeLineItem);
  const lines: InvoiceLine[] = rawLines.map((item, idx) => {
    const prod = item.SpecifiedTradeProduct ?? {};
    const lineAgr = item.SpecifiedLineTradeAgreement ?? {};
    const lineDel = item.SpecifiedLineTradeDelivery ?? {};
    const lineStl = item.SpecifiedLineTradeSettlement ?? {};
    const lineTax = asArray(lineStl.ApplicableTradeTax)[0] ?? {};
    const qtyNode = lineDel.BilledQuantity;

    const allowancesCharges = asArray(lineStl.SpecifiedTradeAllowanceCharge);
    let lineAllowance = 0;
    let lineCharge = 0;
    for (const ac of allowancesCharges) {
      const isCharge = textOf(ac?.ChargeIndicator?.Indicator).toLowerCase() === "true";
      const amt = numOf(ac?.ActualAmount, 0);
      if (isCharge) lineCharge += amt;
      else lineAllowance += amt;
    }

    return {
      id: textOf(item?.AssociatedDocumentLineDocument?.LineID) || String(idx + 1),
      name: textOf(prod.Name) || `Item ${idx + 1}`,
      description: textOf(prod.Description) || undefined,
      quantity: numOf(qtyNode, 1),
      unitCode: (qtyNode && typeof qtyNode === "object" ? qtyNode["@_unitCode"] : undefined) || "H87",
      unitPrice: numOf(lineAgr?.NetPriceProductTradePrice?.ChargeAmount, 0),
      lineAllowance,
      lineCharge,
      lineNetAmount: numOf(lineStl?.SpecifiedTradeSettlementLineMonetarySummation?.LineTotalAmount, 0),
      vatCategory: coerceVatCategory(textOf(lineTax.CategoryCode) || "S"),
      vatRate: numOf(lineTax.RateApplicablePercent, 0),
    };
  });

  const vatBreakdown: VatBreakdown[] = asArray(stl.ApplicableTradeTax).map((t) => ({
    categoryCode: coerceVatCategory(textOf(t.CategoryCode) || "S"),
    rate: numOf(t.RateApplicablePercent, 0),
    taxableAmount: numOf(t.BasisAmount, 0),
    taxAmount: numOf(t.CalculatedAmount, 0),
    exemptionReason: textOf(t.ExemptionReason) || undefined,
    exemptionReasonCode: textOf(t.ExemptionReasonCode) || undefined,
  }));

  const totals: DocumentTotals = {
    lineNetTotal: numOf(monetary.LineTotalAmount, 0),
    allowancesTotal: numOf(monetary.AllowanceTotalAmount, 0),
    chargesTotal: numOf(monetary.ChargeTotalAmount, 0),
    taxExclusiveTotal: numOf(monetary.TaxBasisTotalAmount, 0),
    taxTotal: numOf(monetary.TaxTotalAmount, 0),
    taxInclusiveTotal: numOf(monetary.GrandTotalAmount, 0),
    prepaidAmount: numOf(monetary.TotalPrepaidAmount, 0),
    roundingAmount: numOf(monetary.RoundingAmount, 0),
    payableAmount: numOf(monetary.DuePayableAmount, 0),
  };

  const contactNode = asArray(sellerNode.DefinedTradeContact)[0];
  const sellerUri = sellerNode?.URIUniversalCommunication?.URIID;
  const buyerUri = buyerNode?.URIUniversalCommunication?.URIID;
  const typeNum = Number(textOf(doc.TypeCode)) === 381 ? 381 : 380;

  const invoice: CanonicalInvoice = {
    invoiceNumber: textOf(doc.ID),
    issueDate: parseCiiDate(textOf(doc?.IssueDateTime?.DateTimeString)),
    typeCode: typeNum,
    currency: (textOf(stl.InvoiceCurrencyCode) || "EUR").toUpperCase(),
    buyerReference: textOf(agr.BuyerReference) || undefined,
    purchaseOrderReference: textOf(agr?.BuyerOrderReferencedDocument?.IssuerAssignedID) || undefined,
    precedingInvoiceReference: textOf(asArray(stl.InvoiceReferencedDocument)[0]?.IssuerAssignedID) || undefined,
    notes: asArray(doc.IncludedNote).map((n) => textOf(n.Content)).filter(Boolean),
    locale: textOf(sellerNode?.PostalTradeAddress?.CountryID) === "FR" ? "fr" : "de",
    profile: profileDetected,
    seller: {
      name: textOf(sellerNode.Name),
      vatId: textOf(sellerVat?.ID) || undefined,
      taxNumber: textOf(sellerTaxNo?.ID) || undefined,
      registrationId: textOf(sellerNode?.SpecifiedLegalOrganization?.ID) || undefined,
      electronicAddress: textOf(sellerUri) || undefined,
      electronicAddressScheme: (sellerUri && typeof sellerUri === "object" ? sellerUri["@_schemeID"] : undefined) || "EM",
      isKleinunternehmer: vatBreakdown.some(
        (v) => v.categoryCode === "E" && (v.exemptionReason?.includes("19 UStG") ?? false)
      ),
      address: {
        street: textOf(sellerNode?.PostalTradeAddress?.LineOne),
        additionalLine: textOf(sellerNode?.PostalTradeAddress?.LineTwo) || undefined,
        postalCode: textOf(sellerNode?.PostalTradeAddress?.PostcodeCode),
        city: textOf(sellerNode?.PostalTradeAddress?.CityName),
        countryCode: (textOf(sellerNode?.PostalTradeAddress?.CountryID) || "DE").toUpperCase(),
      },
      contact: contactNode
        ? {
            name: textOf(contactNode.PersonName),
            phone: textOf(contactNode?.TelephoneUniversalCommunication?.CompleteNumber),
            email: textOf(contactNode?.EmailURIUniversalCommunication?.URIID),
          }
        : undefined,
    },
    buyer: {
      name: textOf(buyerNode.Name),
      vatId: textOf(buyerVat?.ID) || undefined,
      registrationId: textOf(buyerNode?.SpecifiedLegalOrganization?.ID) || undefined,
      electronicAddress: textOf(buyerUri) || undefined,
      electronicAddressScheme: (buyerUri && typeof buyerUri === "object" ? buyerUri["@_schemeID"] : undefined) || "EM",
      address: {
        street: textOf(buyerNode?.PostalTradeAddress?.LineOne),
        additionalLine: textOf(buyerNode?.PostalTradeAddress?.LineTwo) || undefined,
        postalCode: textOf(buyerNode?.PostalTradeAddress?.PostcodeCode),
        city: textOf(buyerNode?.PostalTradeAddress?.CityName),
        countryCode: (textOf(buyerNode?.PostalTradeAddress?.CountryID) || "DE").toUpperCase(),
      },
    },
    payment: {
      meansCode: coercePaymentMeans(textOf(paymentMeans.TypeCode) || "58"),
      iban: textOf(paymentMeans?.PayeePartyCreditorFinancialAccount?.IBANID) || undefined,
      accountName: textOf(paymentMeans?.PayeePartyCreditorFinancialAccount?.AccountName) || undefined,
      bic: textOf(paymentMeans?.PayeeSpecifiedCreditorFinancialInstitution?.BICID) || undefined,
      remittanceReference: textOf(stl.PaymentReference) || undefined,
      paymentTerms: textOf(paymentTerms.Description) || undefined,
      dueDate: textOf(paymentTerms?.DueDateDateTime?.DateTimeString)
        ? parseCiiDate(textOf(paymentTerms?.DueDateDateTime?.DateTimeString))
        : undefined,
    },
    lines,
    allowancesTotal: totals.allowancesTotal,
    chargesTotal: totals.chargesTotal,
    prepaidAmount: totals.prepaidAmount,
    roundingAmount: totals.roundingAmount,
    vatBreakdown,
    totals,
  };

  return {
    syntax: "CII",
    profileDetected,
    guidelineId,
    invoice,
  };
}

function parseUblRoot(root: Record<string, any>, isCreditNote: boolean): ParsedXmlResult {
  const guidelineId = textOf(root.CustomizationID);
  const profileDetected = detectProfileFromUrn(guidelineId, "UBL");

  const supplierParty = root?.AccountingSupplierParty?.Party ?? {};
  const customerParty = root?.AccountingCustomerParty?.Party ?? {};

  const supplierTaxSchemes = asArray(supplierParty.PartyTaxScheme);
  const supplierVat = supplierTaxSchemes.find((s) => textOf(s?.TaxScheme?.ID) === "VAT");
  const supplierFc = supplierTaxSchemes.find((s) => textOf(s?.TaxScheme?.ID) === "FC");

  const customerTaxSchemes = asArray(customerParty.PartyTaxScheme);
  const customerVat = customerTaxSchemes.find((s) => textOf(s?.TaxScheme?.ID) === "VAT") ?? customerTaxSchemes[0];

  const paymentMeans = asArray(root.PaymentMeans)[0] ?? {};
  const paymentTerms = asArray(root.PaymentTerms)[0] ?? {};
  const taxTotalNode = asArray(root.TaxTotal)[0] ?? {};
  const monetary = root.LegalMonetaryTotal ?? {};

  const rawLines = asArray(isCreditNote ? root.CreditNoteLine : root.InvoiceLine);
  const lines: InvoiceLine[] = rawLines.map((line, idx) => {
    const qtyNode = isCreditNote ? line.CreditedQuantity : line.InvoicedQuantity;
    const taxCat = asArray(line?.Item?.ClassifiedTaxCategory)[0] ?? {};
    return {
      id: textOf(line.ID) || String(idx + 1),
      name: textOf(line?.Item?.Name) || `Item ${idx + 1}`,
      description: textOf(line?.Item?.Description) || undefined,
      quantity: numOf(qtyNode, 1),
      unitCode: (qtyNode && typeof qtyNode === "object" ? qtyNode["@_unitCode"] : undefined) || "H87",
      unitPrice: numOf(line?.Price?.PriceAmount, 0),
      lineAllowance: 0,
      lineCharge: 0,
      lineNetAmount: numOf(line.LineExtensionAmount, 0),
      vatCategory: coerceVatCategory(textOf(taxCat.ID) || "S"),
      vatRate: numOf(taxCat.Percent, 0),
    };
  });

  const vatBreakdown: VatBreakdown[] = asArray(taxTotalNode.TaxSubtotal).map((sub) => {
    const tc = sub.TaxCategory ?? {};
    return {
      categoryCode: coerceVatCategory(textOf(tc.ID) || "S"),
      rate: numOf(tc.Percent, 0),
      taxableAmount: numOf(sub.TaxableAmount, 0),
      taxAmount: numOf(sub.TaxAmount, 0),
      exemptionReason: textOf(tc.TaxExemptionReason) || undefined,
      exemptionReasonCode: textOf(tc.TaxExemptionReasonCode) || undefined,
    };
  });

  const totals: DocumentTotals = {
    lineNetTotal: numOf(monetary.LineExtensionAmount, 0),
    allowancesTotal: numOf(monetary.AllowanceTotalAmount, 0),
    chargesTotal: numOf(monetary.ChargeTotalAmount, 0),
    taxExclusiveTotal: numOf(monetary.TaxExclusiveAmount, 0),
    taxTotal: numOf(taxTotalNode.TaxAmount, 0),
    taxInclusiveTotal: numOf(monetary.TaxInclusiveAmount, 0),
    prepaidAmount: numOf(monetary.PrepaidAmount, 0),
    roundingAmount: numOf(monetary.PayableRoundingAmount, 0),
    payableAmount: numOf(monetary.PayableAmount, 0),
  };

  const supplierEp = supplierParty.EndpointID;
  const customerEp = customerParty.EndpointID;
  const billingRef = asArray(root.BillingReference)[0]?.InvoiceDocumentReference?.ID;
  const contactNode = supplierParty.Contact;

  const invoice: CanonicalInvoice = {
    invoiceNumber: textOf(root.ID),
    issueDate: textOf(root.IssueDate),
    typeCode: isCreditNote ? 381 : Number(textOf(root.InvoiceTypeCode)) === 381 ? 381 : 380,
    currency: (textOf(root.DocumentCurrencyCode) || "EUR").toUpperCase(),
    buyerReference: textOf(root.BuyerReference) || undefined,
    purchaseOrderReference: textOf(root?.OrderReference?.ID) || undefined,
    precedingInvoiceReference: textOf(billingRef) || undefined,
    notes: asArray(root.Note).map((n) => textOf(n)).filter(Boolean),
    locale: textOf(supplierParty?.PostalAddress?.Country?.IdentificationCode) === "FR" ? "fr" : "de",
    profile: profileDetected,
    seller: {
      name: textOf(supplierParty?.PartyLegalEntity?.RegistrationName) || textOf(supplierParty?.PartyName?.Name),
      vatId: textOf(supplierVat?.CompanyID) || undefined,
      taxNumber: textOf(supplierFc?.CompanyID) || undefined,
      registrationId: textOf(supplierParty?.PartyLegalEntity?.CompanyID) || undefined,
      electronicAddress: textOf(supplierEp) || undefined,
      electronicAddressScheme: (supplierEp && typeof supplierEp === "object" ? supplierEp["@_schemeID"] : undefined) || "EM",
      isKleinunternehmer: vatBreakdown.some(
        (v) => v.categoryCode === "E" && (v.exemptionReason?.includes("19 UStG") ?? false)
      ),
      address: {
        street: textOf(supplierParty?.PostalAddress?.StreetName),
        city: textOf(supplierParty?.PostalAddress?.CityName),
        postalCode: textOf(supplierParty?.PostalAddress?.PostalZone),
        countryCode: (textOf(supplierParty?.PostalAddress?.Country?.IdentificationCode) || "DE").toUpperCase(),
      },
      contact: contactNode
        ? {
            name: textOf(contactNode.Name),
            phone: textOf(contactNode.Telephone),
            email: textOf(contactNode.ElectronicMail),
          }
        : undefined,
    },
    buyer: {
      name: textOf(customerParty?.PartyLegalEntity?.RegistrationName) || textOf(customerParty?.PartyName?.Name),
      vatId: textOf(customerVat?.CompanyID) || undefined,
      electronicAddress: textOf(customerEp) || undefined,
      electronicAddressScheme: (customerEp && typeof customerEp === "object" ? customerEp["@_schemeID"] : undefined) || "EM",
      address: {
        street: textOf(customerParty?.PostalAddress?.StreetName),
        city: textOf(customerParty?.PostalAddress?.CityName),
        postalCode: textOf(customerParty?.PostalAddress?.PostalZone),
        countryCode: (textOf(customerParty?.PostalAddress?.Country?.IdentificationCode) || "DE").toUpperCase(),
      },
    },
    payment: {
      meansCode: coercePaymentMeans(textOf(paymentMeans.PaymentMeansCode) || "58"),
      iban: textOf(paymentMeans?.PayeeFinancialAccount?.ID) || undefined,
      accountName: textOf(paymentMeans?.PayeeFinancialAccount?.Name) || undefined,
      bic: textOf(paymentMeans?.PayeeFinancialAccount?.FinancialInstitutionBranch?.ID) || undefined,
      remittanceReference: textOf(paymentMeans.PaymentID) || undefined,
      paymentTerms: textOf(paymentTerms.Note) || undefined,
      dueDate: textOf(root.DueDate) || undefined,
    },
    lines,
    allowancesTotal: totals.allowancesTotal,
    chargesTotal: totals.chargesTotal,
    prepaidAmount: totals.prepaidAmount,
    roundingAmount: totals.roundingAmount,
    vatBreakdown,
    totals,
  };

  return {
    syntax: "UBL",
    profileDetected,
    guidelineId,
    invoice,
  };
}
