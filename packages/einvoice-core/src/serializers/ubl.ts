import { computeCanonicalTotals, formatDecimal2, formatQuantity } from "../calculator.js";
import { CanonicalInvoice, FORMAT_GUIDELINE_URNS } from "../types.js";

function escXml(value: string | undefined | null): string {
  if (!value) return "";
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Serializes a Canonical EN 16931 Invoice or Credit Note into OASIS UBL 2.1 XML.
 * Compliant with XRechnung 3.0.2 (UBL) and Peppol BIS Billing 3.0.
 */
export function serializeToUblXml(invoice: CanonicalInvoice): string {
  const { normalized, vatBreakdown, totals } = computeCanonicalTotals(invoice);
  const spec = FORMAT_GUIDELINE_URNS[normalized.profile];
  const isCreditNote = normalized.typeCode === 381;
  const rootTag = isCreditNote ? "CreditNote" : "Invoice";
  const rootNs = isCreditNote
    ? "urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2"
    : "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2";
  const typeTag = isCreditNote ? "cbc:CreditNoteTypeCode" : "cbc:InvoiceTypeCode";
  const lineTag = isCreditNote ? "cac:CreditNoteLine" : "cac:InvoiceLine";
  const qtyTag = isCreditNote ? "cbc:CreditedQuantity" : "cbc:InvoicedQuantity";

  const cur = escXml(normalized.currency);
  const sellerVat = normalized.seller.vatId?.replace(/\s+/g, "").toUpperCase();
  const buyerVat = normalized.buyer.vatId?.replace(/\s+/g, "").toUpperCase();
  const ibanCleaned = normalized.payment.iban?.replace(/\s+/g, "").toUpperCase();
  const bicCleaned = normalized.payment.bic?.replace(/\s+/g, "").toUpperCase();

  const taxSubtotalsXml = vatBreakdown
    .map(
      (b) => `    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${cur}">${formatDecimal2(b.taxableAmount)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${cur}">${formatDecimal2(b.taxAmount)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>${escXml(b.categoryCode)}</cbc:ID>
        <cbc:Percent>${formatDecimal2(b.rate)}</cbc:Percent>${
          b.exemptionReasonCode
            ? `\n        <cbc:TaxExemptionReasonCode>${escXml(b.exemptionReasonCode)}</cbc:TaxExemptionReasonCode>`
            : ""
        }${
          b.exemptionReason
            ? `\n        <cbc:TaxExemptionReason>${escXml(b.exemptionReason)}</cbc:TaxExemptionReason>`
            : ""
        }
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>`
    )
    .join("\n");

  const linesXml = normalized.lines
    .map((line) => {
      const rate = line.vatCategory === "S" ? line.vatRate : 0;
      return `  <${lineTag}>
    <cbc:ID>${escXml(line.id)}</cbc:ID>
    <${qtyTag} unitCode="${escXml(line.unitCode)}">${formatQuantity(line.quantity)}</${qtyTag}>
    <cbc:LineExtensionAmount currencyID="${cur}">${formatDecimal2(line.lineNetAmount ?? 0)}</cbc:LineExtensionAmount>
    <cac:Item>${
      line.description ? `\n      <cbc:Description>${escXml(line.description)}</cbc:Description>` : ""
    }
      <cbc:Name>${escXml(line.name)}</cbc:Name>
      <cac:ClassifiedTaxCategory>
        <cbc:ID>${escXml(line.vatCategory)}</cbc:ID>
        <cbc:Percent>${formatDecimal2(rate)}</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:ClassifiedTaxCategory>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="${cur}">${formatDecimal2(line.unitPrice)}</cbc:PriceAmount>
    </cac:Price>
  </${lineTag}>`;
    })
    .join("\n");

  const notesXml = normalized.notes.map((n) => `  <cbc:Note>${escXml(n)}</cbc:Note>`).join("\n");

  const billingRefXml = normalized.precedingInvoiceReference
    ? `\n  <cac:BillingReference>
    <cac:InvoiceDocumentReference>
      <cbc:ID>${escXml(normalized.precedingInvoiceReference)}</cbc:ID>
    </cac:InvoiceDocumentReference>
  </cac:BillingReference>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<${rootTag} xmlns="${rootNs}"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:CustomizationID>${escXml(spec.ublCustomizationId)}</cbc:CustomizationID>
  <cbc:ProfileID>${escXml(spec.ublProfileId)}</cbc:ProfileID>
  <cbc:ID>${escXml(normalized.invoiceNumber)}</cbc:ID>
  <cbc:IssueDate>${escXml(normalized.issueDate)}</cbc:IssueDate>${
    !isCreditNote && normalized.payment.dueDate
      ? `\n  <cbc:DueDate>${escXml(normalized.payment.dueDate)}</cbc:DueDate>`
      : ""
  }
  <${typeTag}>${normalized.typeCode}</${typeTag}>${notesXml ? `\n${notesXml}` : ""}
  <cbc:DocumentCurrencyCode>${cur}</cbc:DocumentCurrencyCode>${
    normalized.buyerReference ? `\n  <cbc:BuyerReference>${escXml(normalized.buyerReference)}</cbc:BuyerReference>` : ""
  }${
    normalized.purchaseOrderReference
      ? `\n  <cac:OrderReference>
    <cbc:ID>${escXml(normalized.purchaseOrderReference)}</cbc:ID>
  </cac:OrderReference>`
      : ""
  }${billingRefXml}
  <cac:AccountingSupplierParty>
    <cac:Party>${
      normalized.seller.electronicAddress
        ? `\n      <cbc:EndpointID schemeID="${escXml(normalized.seller.electronicAddressScheme || "EM")}">${escXml(
            normalized.seller.electronicAddress
          )}</cbc:EndpointID>`
        : ""
    }
      <cac:PostalAddress>
        <cbc:StreetName>${escXml(normalized.seller.address.street)}</cbc:StreetName>
        <cbc:CityName>${escXml(normalized.seller.address.city)}</cbc:CityName>
        <cbc:PostalZone>${escXml(normalized.seller.address.postalCode)}</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>${escXml(normalized.seller.address.countryCode)}</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>${
        sellerVat
          ? `\n      <cac:PartyTaxScheme>
        <cbc:CompanyID>${escXml(sellerVat)}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>`
          : ""
      }${
        normalized.seller.taxNumber
          ? `\n      <cac:PartyTaxScheme>
        <cbc:CompanyID>${escXml(normalized.seller.taxNumber)}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>FC</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>`
          : ""
      }
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${escXml(normalized.seller.name)}</cbc:RegistrationName>${
          normalized.seller.registrationId
            ? `\n        <cbc:CompanyID>${escXml(normalized.seller.registrationId)}</cbc:CompanyID>`
            : ""
        }
      </cac:PartyLegalEntity>${
        normalized.seller.contact
          ? `\n      <cac:Contact>
        <cbc:Name>${escXml(normalized.seller.contact.name)}</cbc:Name>
        <cbc:Telephone>${escXml(normalized.seller.contact.phone)}</cbc:Telephone>
        <cbc:ElectronicMail>${escXml(normalized.seller.contact.email)}</cbc:ElectronicMail>
      </cac:Contact>`
          : ""
      }
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>${
      normalized.buyer.electronicAddress
        ? `\n      <cbc:EndpointID schemeID="${escXml(normalized.buyer.electronicAddressScheme || "EM")}">${escXml(
            normalized.buyer.electronicAddress
          )}</cbc:EndpointID>`
        : ""
    }
      <cac:PostalAddress>
        <cbc:StreetName>${escXml(normalized.buyer.address.street)}</cbc:StreetName>
        <cbc:CityName>${escXml(normalized.buyer.address.city)}</cbc:CityName>
        <cbc:PostalZone>${escXml(normalized.buyer.address.postalCode)}</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>${escXml(normalized.buyer.address.countryCode)}</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>${
        buyerVat
          ? `\n      <cac:PartyTaxScheme>
        <cbc:CompanyID>${escXml(buyerVat)}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>`
          : ""
      }
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${escXml(normalized.buyer.name)}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:PaymentMeans>
    <cbc:PaymentMeansCode>${escXml(normalized.payment.meansCode)}</cbc:PaymentMeansCode>${
      normalized.payment.remittanceReference
        ? `\n    <cbc:PaymentID>${escXml(normalized.payment.remittanceReference)}</cbc:PaymentID>`
        : ""
    }${
      ibanCleaned
        ? `\n    <cac:PayeeFinancialAccount>
      <cbc:ID>${escXml(ibanCleaned)}</cbc:ID>${
        normalized.payment.accountName ? `\n      <cbc:Name>${escXml(normalized.payment.accountName)}</cbc:Name>` : ""
      }${
        bicCleaned
          ? `\n      <cac:FinancialInstitutionBranch>
        <cbc:ID>${escXml(bicCleaned)}</cbc:ID>
      </cac:FinancialInstitutionBranch>`
          : ""
      }
    </cac:PayeeFinancialAccount>`
        : ""
    }
  </cac:PaymentMeans>${
    normalized.payment.paymentTerms
      ? `\n  <cac:PaymentTerms>
    <cbc:Note>${escXml(normalized.payment.paymentTerms)}</cbc:Note>
  </cac:PaymentTerms>`
      : ""
  }
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${cur}">${formatDecimal2(totals.taxTotal)}</cbc:TaxAmount>
${taxSubtotalsXml}
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${cur}">${formatDecimal2(totals.lineNetTotal)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${cur}">${formatDecimal2(totals.taxExclusiveTotal)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${cur}">${formatDecimal2(totals.taxInclusiveTotal)}</cbc:TaxInclusiveAmount>${
      totals.allowancesTotal > 0
        ? `\n    <cbc:AllowanceTotalAmount currencyID="${cur}">${formatDecimal2(totals.allowancesTotal)}</cbc:AllowanceTotalAmount>`
        : ""
    }${
      totals.chargesTotal > 0
        ? `\n    <cbc:ChargeTotalAmount currencyID="${cur}">${formatDecimal2(totals.chargesTotal)}</cbc:ChargeTotalAmount>`
        : ""
    }${
      totals.prepaidAmount > 0
        ? `\n    <cbc:PrepaidAmount currencyID="${cur}">${formatDecimal2(totals.prepaidAmount)}</cbc:PrepaidAmount>`
        : ""
    }${
      totals.roundingAmount !== 0
        ? `\n    <cbc:PayableRoundingAmount currencyID="${cur}">${formatDecimal2(totals.roundingAmount)}</cbc:PayableRoundingAmount>`
        : ""
    }
    <cbc:PayableAmount currencyID="${cur}">${formatDecimal2(totals.payableAmount)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
${linesXml}
</${rootTag}>
`;
}
