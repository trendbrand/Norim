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

function formatCiiDate102(isoDate: string): string {
  return isoDate.replace(/-/g, "");
}

/**
 * Serializes a Canonical EN 16931 Invoice into UN/CEFACT Cross Industry Invoice (CII D16B) XML.
 * Compliant with ZUGFeRD 2.3 (EN 16931), Factur-X 1.07 (EN 16931), and XRechnung 3.0.2 (CII).
 */
export function serializeToCiiXml(invoice: CanonicalInvoice): string {
  const { normalized, vatBreakdown, totals } = computeCanonicalTotals(invoice);
  const spec = FORMAT_GUIDELINE_URNS[normalized.profile];
  const linesXml = normalized.lines
    .map((line) => {
      const rate = line.vatCategory === "S" ? line.vatRate : 0;
      const allowanceXml =
        line.lineAllowance && line.lineAllowance > 0
          ? `
        <ram:SpecifiedTradeAllowanceCharge>
          <ram:ChargeIndicator><udt:Indicator>false</udt:Indicator></ram:ChargeIndicator>
          <ram:ActualAmount>${formatDecimal2(line.lineAllowance)}</ram:ActualAmount>
          <ram:Reason>Line discount</ram:Reason>
        </ram:SpecifiedTradeAllowanceCharge>`
          : "";

      const chargeXml =
        line.lineCharge && line.lineCharge > 0
          ? `
        <ram:SpecifiedTradeAllowanceCharge>
          <ram:ChargeIndicator><udt:Indicator>true</udt:Indicator></ram:ChargeIndicator>
          <ram:ActualAmount>${formatDecimal2(line.lineCharge)}</ram:ActualAmount>
          <ram:Reason>Line surcharge</ram:Reason>
        </ram:SpecifiedTradeAllowanceCharge>`
          : "";

      return `    <ram:IncludedSupplyChainTradeLineItem>
      <ram:AssociatedDocumentLineDocument>
        <ram:LineID>${escXml(line.id)}</ram:LineID>
      </ram:AssociatedDocumentLineDocument>
      <ram:SpecifiedTradeProduct>
        <ram:Name>${escXml(line.name)}</ram:Name>${
          line.description ? `\n        <ram:Description>${escXml(line.description)}</ram:Description>` : ""
        }
      </ram:SpecifiedTradeProduct>
      <ram:SpecifiedLineTradeAgreement>
        <ram:NetPriceProductTradePrice>
          <ram:ChargeAmount>${formatDecimal2(line.unitPrice)}</ram:ChargeAmount>
        </ram:NetPriceProductTradePrice>
      </ram:SpecifiedLineTradeAgreement>
      <ram:SpecifiedLineTradeDelivery>
        <ram:BilledQuantity unitCode="${escXml(line.unitCode)}">${formatQuantity(line.quantity)}</ram:BilledQuantity>
      </ram:SpecifiedLineTradeDelivery>
      <ram:SpecifiedLineTradeSettlement>
        <ram:ApplicableTradeTax>
          <ram:TypeCode>VAT</ram:TypeCode>
          <ram:CategoryCode>${escXml(line.vatCategory)}</ram:CategoryCode>
          <ram:RateApplicablePercent>${formatDecimal2(rate)}</ram:RateApplicablePercent>
        </ram:ApplicableTradeTax>${allowanceXml}${chargeXml}
        <ram:SpecifiedTradeSettlementLineMonetarySummation>
          <ram:LineTotalAmount>${formatDecimal2(line.lineNetAmount ?? 0)}</ram:LineTotalAmount>
        </ram:SpecifiedTradeSettlementLineMonetarySummation>
      </ram:SpecifiedLineTradeSettlement>
    </ram:IncludedSupplyChainTradeLineItem>`;
    })
    .join("\n");

  const vatXml = vatBreakdown
    .map(
      (b) => `      <ram:ApplicableTradeTax>
        <ram:CalculatedAmount>${formatDecimal2(b.taxAmount)}</ram:CalculatedAmount>
        <ram:TypeCode>VAT</ram:TypeCode>${
          b.exemptionReason ? `\n        <ram:ExemptionReason>${escXml(b.exemptionReason)}</ram:ExemptionReason>` : ""
        }
        <ram:BasisAmount>${formatDecimal2(b.taxableAmount)}</ram:BasisAmount>
        <ram:CategoryCode>${escXml(b.categoryCode)}</ram:CategoryCode>${
          b.exemptionReasonCode
            ? `\n        <ram:ExemptionReasonCode>${escXml(b.exemptionReasonCode)}</ram:ExemptionReasonCode>`
            : ""
        }
        <ram:RateApplicablePercent>${formatDecimal2(b.rate)}</ram:RateApplicablePercent>
      </ram:ApplicableTradeTax>`
    )
    .join("\n");

  const notesXml = normalized.notes
    .map(
      (n) => `    <ram:IncludedNote>
      <ram:Content>${escXml(n)}</ram:Content>
    </ram:IncludedNote>`
    )
    .join("\n");

  const sellerTaxRegs: string[] = [];
  if (normalized.seller.taxNumber) {
    sellerTaxRegs.push(`        <ram:SpecifiedTaxRegistration>
          <ram:ID schemeID="FC">${escXml(normalized.seller.taxNumber)}</ram:ID>
        </ram:SpecifiedTaxRegistration>`);
  }
  if (normalized.seller.vatId) {
    sellerTaxRegs.push(`        <ram:SpecifiedTaxRegistration>
          <ram:ID schemeID="VA">${escXml(normalized.seller.vatId.replace(/\s+/g, "").toUpperCase())}</ram:ID>
        </ram:SpecifiedTaxRegistration>`);
  }

  const sellerContactXml = normalized.seller.contact
    ? `\n        <ram:DefinedTradeContact>
          <ram:PersonName>${escXml(normalized.seller.contact.name)}</ram:PersonName>
          <ram:TelephoneUniversalCommunication>
            <ram:CompleteNumber>${escXml(normalized.seller.contact.phone)}</ram:CompleteNumber>
          </ram:TelephoneUniversalCommunication>
          <ram:EmailURIUniversalCommunication>
            <ram:URIID>${escXml(normalized.seller.contact.email)}</ram:URIID>
          </ram:EmailURIUniversalCommunication>
        </ram:DefinedTradeContact>`
    : "";

  const sellerElectronicXml = normalized.seller.electronicAddress
    ? `\n        <ram:URIUniversalCommunication>
          <ram:URIID schemeID="${escXml(normalized.seller.electronicAddressScheme || "EM")}">${escXml(
            normalized.seller.electronicAddress
          )}</ram:URIID>
        </ram:URIUniversalCommunication>`
    : "";

  const buyerElectronicXml = normalized.buyer.electronicAddress
    ? `\n        <ram:URIUniversalCommunication>
          <ram:URIID schemeID="${escXml(normalized.buyer.electronicAddressScheme || "EM")}">${escXml(
            normalized.buyer.electronicAddress
          )}</ram:URIID>
        </ram:URIUniversalCommunication>`
    : "";

  const buyerTaxXml = normalized.buyer.vatId
    ? `\n        <ram:SpecifiedTaxRegistration>
          <ram:ID schemeID="VA">${escXml(normalized.buyer.vatId.replace(/\s+/g, "").toUpperCase())}</ram:ID>
        </ram:SpecifiedTaxRegistration>`
    : "";

  const ibanCleaned = normalized.payment.iban?.replace(/\s+/g, "").toUpperCase();
  const bicCleaned = normalized.payment.bic?.replace(/\s+/g, "").toUpperCase();

  const paymentAccountXml = ibanCleaned
    ? `\n        <ram:PayeePartyCreditorFinancialAccount>
          <ram:IBANID>${escXml(ibanCleaned)}</ram:IBANID>${
            normalized.payment.accountName
              ? `\n          <ram:AccountName>${escXml(normalized.payment.accountName)}</ram:AccountName>`
              : ""
          }
        </ram:PayeePartyCreditorFinancialAccount>${
          bicCleaned
            ? `\n        <ram:PayeeSpecifiedCreditorFinancialInstitution>
          <ram:BICID>${escXml(bicCleaned)}</ram:BICID>
        </ram:PayeeSpecifiedCreditorFinancialInstitution>`
            : ""
        }`
    : "";

  const paymentTermsXml =
    normalized.payment.paymentTerms || normalized.payment.dueDate
      ? `\n      <ram:SpecifiedTradePaymentTerms>${
          normalized.payment.paymentTerms
            ? `\n        <ram:Description>${escXml(normalized.payment.paymentTerms)}</ram:Description>`
            : ""
        }${
          normalized.payment.dueDate
            ? `\n        <ram:DueDateDateTime>
          <udt:DateTimeString format="102">${formatCiiDate102(normalized.payment.dueDate)}</udt:DateTimeString>
        </ram:DueDateDateTime>`
            : ""
        }
      </ram:SpecifiedTradePaymentTerms>`
      : "";

  const precedingRefXml = normalized.precedingInvoiceReference
    ? `\n      <ram:InvoiceReferencedDocument>
        <ram:IssuerAssignedID>${escXml(normalized.precedingInvoiceReference)}</ram:IssuerAssignedID>
      </ram:InvoiceReferencedDocument>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100"
  xmlns:qdt="urn:un:unece:uncefact:data:standard:QualifiedDataType:100"
  xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100">
  <rsm:ExchangedDocumentContext>
    <ram:BusinessProcessSpecifiedDocumentContextParameter>
      <ram:ID>${escXml(spec.ublProfileId)}</ram:ID>
    </ram:BusinessProcessSpecifiedDocumentContextParameter>
    <ram:GuidelineSpecifiedDocumentContextParameter>
      <ram:ID>${escXml(spec.ciiUrn)}</ram:ID>
    </ram:GuidelineSpecifiedDocumentContextParameter>
  </rsm:ExchangedDocumentContext>
  <rsm:ExchangedDocument>
    <ram:ID>${escXml(normalized.invoiceNumber)}</ram:ID>
    <ram:TypeCode>${normalized.typeCode}</ram:TypeCode>
    <ram:IssueDateTime>
      <udt:DateTimeString format="102">${formatCiiDate102(normalized.issueDate)}</udt:DateTimeString>
    </ram:IssueDateTime>${notesXml ? `\n${notesXml}` : ""}
  </rsm:ExchangedDocument>
  <rsm:SupplyChainTradeTransaction>
${linesXml}
    <ram:ApplicableHeaderTradeAgreement>${
      normalized.buyerReference ? `\n      <ram:BuyerReference>${escXml(normalized.buyerReference)}</ram:BuyerReference>` : ""
    }
      <ram:SellerTradeParty>
        <ram:Name>${escXml(normalized.seller.name)}</ram:Name>${
          normalized.seller.registrationId
            ? `\n        <ram:SpecifiedLegalOrganization>
          <ram:ID>${escXml(normalized.seller.registrationId)}</ram:ID>
        </ram:SpecifiedLegalOrganization>`
            : ""
        }${sellerContactXml}
        <ram:PostalTradeAddress>
          <ram:PostcodeCode>${escXml(normalized.seller.address.postalCode)}</ram:PostcodeCode>
          <ram:LineOne>${escXml(normalized.seller.address.street)}</ram:LineOne>${
            normalized.seller.address.additionalLine
              ? `\n          <ram:LineTwo>${escXml(normalized.seller.address.additionalLine)}</ram:LineTwo>`
              : ""
          }
          <ram:CityName>${escXml(normalized.seller.address.city)}</ram:CityName>
          <ram:CountryID>${escXml(normalized.seller.address.countryCode)}</ram:CountryID>
        </ram:PostalTradeAddress>${sellerElectronicXml}${sellerTaxRegs.length ? `\n${sellerTaxRegs.join("\n")}` : ""}
      </ram:SellerTradeParty>
      <ram:BuyerTradeParty>
        <ram:Name>${escXml(normalized.buyer.name)}</ram:Name>${
          normalized.buyer.registrationId
            ? `\n        <ram:SpecifiedLegalOrganization>
          <ram:ID>${escXml(normalized.buyer.registrationId)}</ram:ID>
        </ram:SpecifiedLegalOrganization>`
            : ""
        }
        <ram:PostalTradeAddress>
          <ram:PostcodeCode>${escXml(normalized.buyer.address.postalCode)}</ram:PostcodeCode>
          <ram:LineOne>${escXml(normalized.buyer.address.street)}</ram:LineOne>${
            normalized.buyer.address.additionalLine
              ? `\n          <ram:LineTwo>${escXml(normalized.buyer.address.additionalLine)}</ram:LineTwo>`
              : ""
          }
          <ram:CityName>${escXml(normalized.buyer.address.city)}</ram:CityName>
          <ram:CountryID>${escXml(normalized.buyer.address.countryCode)}</ram:CountryID>
        </ram:PostalTradeAddress>${buyerElectronicXml}${buyerTaxXml}
      </ram:BuyerTradeParty>${
        normalized.purchaseOrderReference
          ? `\n      <ram:BuyerOrderReferencedDocument>
        <ram:IssuerAssignedID>${escXml(normalized.purchaseOrderReference)}</ram:IssuerAssignedID>
      </ram:BuyerOrderReferencedDocument>`
          : ""
      }
    </ram:ApplicableHeaderTradeAgreement>
    <ram:ApplicableHeaderTradeDelivery />
    <ram:ApplicableHeaderTradeSettlement>${
      normalized.payment.remittanceReference
        ? `\n      <ram:PaymentReference>${escXml(normalized.payment.remittanceReference)}</ram:PaymentReference>`
        : ""
    }
      <ram:InvoiceCurrencyCode>${escXml(normalized.currency)}</ram:InvoiceCurrencyCode>
      <ram:SpecifiedTradeSettlementPaymentMeans>
        <ram:TypeCode>${escXml(normalized.payment.meansCode)}</ram:TypeCode>${paymentAccountXml}
      </ram:SpecifiedTradeSettlementPaymentMeans>
${vatXml}${paymentTermsXml}${precedingRefXml}
      <ram:SpecifiedTradeSettlementHeaderMonetarySummation>
        <ram:LineTotalAmount>${formatDecimal2(totals.lineNetTotal)}</ram:LineTotalAmount>${
          totals.chargesTotal > 0
            ? `\n        <ram:ChargeTotalAmount>${formatDecimal2(totals.chargesTotal)}</ram:ChargeTotalAmount>`
            : ""
        }${
          totals.allowancesTotal > 0
            ? `\n        <ram:AllowanceTotalAmount>${formatDecimal2(totals.allowancesTotal)}</ram:AllowanceTotalAmount>`
            : ""
        }
        <ram:TaxBasisTotalAmount>${formatDecimal2(totals.taxExclusiveTotal)}</ram:TaxBasisTotalAmount>
        <ram:TaxTotalAmount currencyID="${escXml(normalized.currency)}">${formatDecimal2(totals.taxTotal)}</ram:TaxTotalAmount>
        <ram:GrandTotalAmount>${formatDecimal2(totals.taxInclusiveTotal)}</ram:GrandTotalAmount>${
          totals.prepaidAmount > 0
            ? `\n        <ram:TotalPrepaidAmount>${formatDecimal2(totals.prepaidAmount)}</ram:TotalPrepaidAmount>`
            : ""
        }${
          totals.roundingAmount !== 0
            ? `\n        <ram:RoundingAmount>${formatDecimal2(totals.roundingAmount)}</ram:RoundingAmount>`
            : ""
        }
        <ram:DuePayableAmount>${formatDecimal2(totals.payableAmount)}</ram:DuePayableAmount>
      </ram:SpecifiedTradeSettlementHeaderMonetarySummation>
    </ram:ApplicableHeaderTradeSettlement>
  </rsm:SupplyChainTradeTransaction>
</rsm:CrossIndustryInvoice>
`;
}
