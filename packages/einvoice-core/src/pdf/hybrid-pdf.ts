import {
  AFRelationship,
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFHexString,
  PDFName,
  PDFRawStream,
  PDFStream,
  PDFString,
  StandardFonts,
  decodePDFRawStream,
  rgb,
} from "pdf-lib";
import { computeCanonicalTotals, formatDecimal2 } from "../calculator.js";
import { serializeToCiiXml } from "../serializers/cii.js";
import { CanonicalInvoice } from "../types.js";

const KNOWN_XML_FILENAMES = [
  "factur-x.xml",
  "zugferd-invoice.xml",
  "xrechnung.xml",
  "order-x.xml",
  "invoice.xml",
];

function formatPdfMoney(amount: number, locale: "de" | "fr" | "en", currency: string): string {
  const fixed = formatDecimal2(amount);
  const [intPart, decPart] = fixed.split(".");
  const grouped =
    locale === "en"
      ? (intPart ?? "0").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      : (intPart ?? "0").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const formatted = locale === "en" ? `${grouped}.${decPart}` : `${grouped},${decPart}`;
  return `${formatted} ${currency}`;
}

function sanitizeWinAnsi(input: string): string {
  // pdf-lib StandardFonts (Helvetica) use WinAnsi encoding; replace unsupported chars cleanly
  return input
    .replace(/€|EUR/g, "EUR")
    .replace(/[–—]/g, "-")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, " ");
}

function buildFacturXXmpMetadata(invoice: CanonicalInvoice, xmlFilename: string): string {
  const conformance = invoice.profile === "XRECHNUNG_CII" ? "XRECHNUNG" : "EN 16931";
  const nowIso = new Date().toISOString();
  return `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about="" xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/">
      <pdfaid:part>3</pdfaid:part>
      <pdfaid:conformance>B</pdfaid:conformance>
    </rdf:Description>
    <rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/">
      <dc:title><rdf:Alt><rdf:li xml:lang="x-default">Invoice ${invoice.invoiceNumber}</rdf:li></rdf:Alt></dc:title>
      <dc:creator><rdf:Seq><rdf:li>${invoice.seller.name}</rdf:li></rdf:Seq></dc:creator>
    </rdf:Description>
    <rdf:Description rdf:about="" xmlns:xmp="http://ns.adobe.com/xap/1.0/">
      <xmp:CreatorTool>NormInvoice EN 16931 Engine</xmp:CreatorTool>
      <xmp:CreateDate>${nowIso}</xmp:CreateDate>
      <xmp:ModifyDate>${nowIso}</xmp:ModifyDate>
    </rdf:Description>
    <rdf:Description rdf:about="" xmlns:fx="urn:factur-x:pdfa:CrossIndustryDocument:invoice:1p0#">
      <fx:DocumentType>INVOICE</fx:DocumentType>
      <fx:DocumentFileName>${xmlFilename}</fx:DocumentFileName>
      <fx:Version>1.0</fx:Version>
      <fx:ConformanceLevel>${conformance}</fx:ConformanceLevel>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;
}

const LABELS = {
  de: {
    invoice: "RECHNUNG",
    creditNote: "GUTSCHRIFT / STORNORECHNUNG",
    invoiceNo: "Rechnungsnr.",
    date: "Rechnungsdatum",
    dueDate: "Fälligkeitsdatum",
    buyerRef: "Käuferreferenz / Leitweg-ID",
    billTo: "Rechnungsempfänger",
    item: "Position / Beschreibung",
    qty: "Menge",
    unitPrice: "Einzelpreis",
    vat: "USt %",
    netTotal: "Netto",
    subtotal: "Zwischensumme (Netto)",
    tax: "Umsatzsteuer",
    grandTotal: "Gesamtbetrag (Brutto)",
    payable: "Zahlbetrag",
    paymentInfo: "Zahlungsinformationen",
    footer: "Elektronische Rechnung nach EN 16931 (ZUGFeRD 2.3 / Factur-X 1.07) — strukturierte XML-Daten eingebettet.",
  },
  fr: {
    invoice: "FACTURE",
    creditNote: "AVOIR",
    invoiceNo: "N° Facture",
    date: "Date d'émission",
    dueDate: "Date d'échéance",
    buyerRef: "Référence acheteur",
    billTo: "Facturé à",
    item: "Désignation",
    qty: "Qté",
    unitPrice: "Prix unit. HT",
    vat: "TVA %",
    netTotal: "Total HT",
    subtotal: "Total HT",
    tax: "Total TVA",
    grandTotal: "Total TTC",
    payable: "Net à payer",
    paymentInfo: "Modalités de règlement",
    footer: "Facture électronique conforme EN 16931 (Factur-X 1.07 / ZUGFeRD 2.3) — données XML structurées intégrées.",
  },
  en: {
    invoice: "INVOICE",
    creditNote: "CREDIT NOTE",
    invoiceNo: "Invoice No.",
    date: "Issue Date",
    dueDate: "Due Date",
    buyerRef: "Buyer Reference",
    billTo: "Bill To",
    item: "Description",
    qty: "Qty",
    unitPrice: "Unit Price",
    vat: "VAT %",
    netTotal: "Line Net",
    subtotal: "Net Subtotal",
    tax: "VAT Total",
    grandTotal: "Gross Total",
    payable: "Amount Due",
    paymentInfo: "Payment Instructions",
    footer: "EN 16931 Electronic Invoice (ZUGFeRD 2.3 / Factur-X 1.07) — structured CII XML embedded.",
  },
};

/**
 * Generates a hybrid ZUGFeRD 2.3 / Factur-X 1.07 PDF with embedded factur-x.xml,
 * /AFRelationship /Alternative, and PDF/A-3b + Factur-X XMP metadata.
 * (In Docker production mode, einvoice-engine pipes this through Ghostscript + veraPDF for strict ISO 19005-3 ICC locking.)
 */
export async function generateHybridEInvoicePdf(
  invoice: CanonicalInvoice,
  providedXml?: string
): Promise<{ pdfBytes: Uint8Array; xml: string; xmlFilename: string }> {
  const { normalized, vatBreakdown, totals } = computeCanonicalTotals(invoice);
  const xml = providedXml ?? serializeToCiiXml(normalized);
  const xmlFilename = "factur-x.xml";
  const t = LABELS[normalized.locale] ?? LABELS.en;

  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(`Invoice ${normalized.invoiceNumber}`);
  pdfDoc.setAuthor(normalized.seller.name);
  pdfDoc.setSubject("EN 16931 ZUGFeRD / Factur-X Electronic Invoice");
  pdfDoc.setCreator("NormInvoice EN 16931 Engine");
  pdfDoc.setProducer("NormInvoice PDF/A-3b Pipeline");

  const page = pdfDoc.addPage([595.28, 841.89]); // A4 portrait
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const slate900 = rgb(0.06, 0.09, 0.16);
  const slate600 = rgb(0.35, 0.4, 0.48);
  const slate200 = rgb(0.88, 0.9, 0.94);
  const brandBlue = rgb(0.08, 0.32, 0.65);

  // Header bar
  page.drawRectangle({ x: 0, y: 785, width: 595.28, height: 56.89, color: rgb(0.96, 0.97, 0.99) });
  page.drawText(sanitizeWinAnsi(normalized.seller.name), {
    x: 44,
    y: 812,
    size: 15,
    font: fontBold,
    color: slate900,
  });
  page.drawText(
    sanitizeWinAnsi(
      `${normalized.seller.address.street}, ${normalized.seller.address.postalCode} ${normalized.seller.address.city} (${normalized.seller.address.countryCode})`
    ),
    { x: 44, y: 796, size: 8.5, font: fontRegular, color: slate600 }
  );

  const docTitle = normalized.typeCode === 381 ? t.creditNote : t.invoice;
  page.drawText(sanitizeWinAnsi(docTitle), {
    x: 375,
    y: 810,
    size: 16,
    font: fontBold,
    color: brandBlue,
  });
  page.drawText("EN 16931 · ZUGFeRD 2.3 / Factur-X", {
    x: 375,
    y: 795,
    size: 7.5,
    font: fontRegular,
    color: slate600,
  });

  // Buyer + Metadata block
  let y = 750;
  page.drawText(sanitizeWinAnsi(t.billTo.toUpperCase()), { x: 44, y, size: 8, font: fontBold, color: slate600 });
  page.drawText(sanitizeWinAnsi(normalized.buyer.name), { x: 44, y: y - 16, size: 11, font: fontBold, color: slate900 });
  page.drawText(sanitizeWinAnsi(normalized.buyer.address.street), { x: 44, y: y - 31, size: 9.5, font: fontRegular, color: slate900 });
  page.drawText(
    sanitizeWinAnsi(
      `${normalized.buyer.address.postalCode} ${normalized.buyer.address.city}, ${normalized.buyer.address.countryCode}`
    ),
    { x: 44, y: y - 45, size: 9.5, font: fontRegular, color: slate900 }
  );
  if (normalized.buyer.vatId) {
    page.drawText(sanitizeWinAnsi(`VAT ID: ${normalized.buyer.vatId}`), {
      x: 44,
      y: y - 60,
      size: 8.5,
      font: fontRegular,
      color: slate600,
    });
  }

  // Right metadata box
  const metaRows: Array<[string, string]> = [
    [t.invoiceNo, normalized.invoiceNumber],
    [t.date, normalized.issueDate],
    ...(normalized.payment.dueDate ? [[t.dueDate, normalized.payment.dueDate] as [string, string]] : []),
    ...(normalized.buyerReference ? [[t.buyerRef, normalized.buyerReference] as [string, string]] : []),
    ...(normalized.seller.vatId ? [["Seller VAT", normalized.seller.vatId] as [string, string]] : []),
    ...(normalized.seller.taxNumber ? [["Tax No.", normalized.seller.taxNumber] as [string, string]] : []),
  ];

  let metaY = y;
  for (const [label, val] of metaRows) {
    page.drawText(sanitizeWinAnsi(label), { x: 340, y: metaY, size: 8.5, font: fontRegular, color: slate600 });
    page.drawText(sanitizeWinAnsi(val), { x: 455, y: metaY, size: 8.5, font: fontBold, color: slate900 });
    metaY -= 14;
  }

  // Line items table
  y = 635;
  page.drawRectangle({ x: 44, y: y - 6, width: 507, height: 22, color: rgb(0.95, 0.96, 0.98) });
  page.drawText(sanitizeWinAnsi(t.item), { x: 52, y: y + 1, size: 8.5, font: fontBold, color: slate900 });
  page.drawText(sanitizeWinAnsi(t.qty), { x: 315, y: y + 1, size: 8.5, font: fontBold, color: slate900 });
  page.drawText(sanitizeWinAnsi(t.unitPrice), { x: 365, y: y + 1, size: 8.5, font: fontBold, color: slate900 });
  page.drawText(sanitizeWinAnsi(t.vat), { x: 438, y: y + 1, size: 8.5, font: fontBold, color: slate900 });
  page.drawText(sanitizeWinAnsi(t.netTotal), { x: 486, y: y + 1, size: 8.5, font: fontBold, color: slate900 });

  y -= 24;
  for (const line of normalized.lines.slice(0, 14)) {
    const lineName = line.name.length > 44 ? `${line.name.slice(0, 41)}...` : line.name;
    page.drawText(sanitizeWinAnsi(lineName), { x: 52, y, size: 9, font: fontBold, color: slate900 });
    page.drawText(sanitizeWinAnsi(`${line.quantity} ${line.unitCode}`), { x: 315, y, size: 8.5, font: fontRegular, color: slate900 });
    page.drawText(sanitizeWinAnsi(formatPdfMoney(line.unitPrice, normalized.locale, normalized.currency)), {
      x: 356,
      y,
      size: 8.5,
      font: fontRegular,
      color: slate900,
    });
    page.drawText(sanitizeWinAnsi(`${line.vatCategory} ${formatDecimal2(line.vatCategory === "S" ? line.vatRate : 0)}%`), {
      x: 432,
      y,
      size: 8.5,
      font: fontRegular,
      color: slate600,
    });
    page.drawText(sanitizeWinAnsi(formatPdfMoney(line.lineNetAmount ?? 0, normalized.locale, normalized.currency)), {
      x: 478,
      y,
      size: 8.5,
      font: fontBold,
      color: slate900,
    });
    if (line.description) {
      y -= 12;
      const desc = line.description.length > 56 ? `${line.description.slice(0, 53)}...` : line.description;
      page.drawText(sanitizeWinAnsi(desc), { x: 52, y, size: 7.5, font: fontRegular, color: slate600 });
    }
    y -= 10;
    page.drawLine({ start: { x: 44, y: y + 4 }, end: { x: 551, y: y + 4 }, thickness: 0.5, color: slate200 });
    y -= 12;
  }

  // Totals block
  y = Math.max(y - 8, 220);
  page.drawText(sanitizeWinAnsi(t.subtotal), { x: 340, y, size: 9, font: fontRegular, color: slate600 });
  page.drawText(sanitizeWinAnsi(formatPdfMoney(totals.taxExclusiveTotal, normalized.locale, normalized.currency)), {
    x: 468,
    y,
    size: 9,
    font: fontBold,
    color: slate900,
  });

  y -= 16;
  for (const b of vatBreakdown) {
    page.drawText(sanitizeWinAnsi(`${t.tax} (${b.categoryCode} ${formatDecimal2(b.rate)}%)`), {
      x: 340,
      y,
      size: 8.5,
      font: fontRegular,
      color: slate600,
    });
    page.drawText(sanitizeWinAnsi(formatPdfMoney(b.taxAmount, normalized.locale, normalized.currency)), {
      x: 468,
      y,
      size: 8.5,
      font: fontRegular,
      color: slate900,
    });
    y -= 14;
    if (b.exemptionReason) {
      page.drawText(sanitizeWinAnsi(b.exemptionReason.slice(0, 88)), {
        x: 44,
        y: y + 14,
        size: 7.5,
        font: fontRegular,
        color: slate600,
      });
    }
  }

  page.drawRectangle({ x: 332, y: y - 10, width: 219, height: 24, color: rgb(0.93, 0.96, 1) });
  page.drawText(sanitizeWinAnsi(t.payable), { x: 340, y: y - 2, size: 10, font: fontBold, color: brandBlue });
  page.drawText(sanitizeWinAnsi(formatPdfMoney(totals.payableAmount, normalized.locale, normalized.currency)), {
    x: 460,
    y: y - 2,
    size: 10.5,
    font: fontBold,
    color: brandBlue,
  });

  // Payment Instructions Footer Box
  const payY = 128;
  page.drawLine({ start: { x: 44, y: payY + 18 }, end: { x: 551, y: payY + 18 }, thickness: 0.8, color: slate200 });
  page.drawText(sanitizeWinAnsi(t.paymentInfo), { x: 44, y: payY + 4, size: 9, font: fontBold, color: slate900 });
  const payLine1 = [
    normalized.payment.iban ? `IBAN: ${normalized.payment.iban}` : null,
    normalized.payment.bic ? `BIC: ${normalized.payment.bic}` : null,
    normalized.payment.remittanceReference ? `Ref: ${normalized.payment.remittanceReference}` : null,
  ]
    .filter(Boolean)
    .join("   |   ");
  if (payLine1) {
    page.drawText(sanitizeWinAnsi(payLine1), { x: 44, y: payY - 12, size: 8.5, font: fontRegular, color: slate900 });
  }
  if (normalized.payment.paymentTerms) {
    page.drawText(sanitizeWinAnsi(normalized.payment.paymentTerms), {
      x: 44,
      y: payY - 26,
      size: 8,
      font: fontRegular,
      color: slate600,
    });
  }

  const legalFoot = [
    normalized.seller.name,
    normalized.seller.registrationId ? `Reg: ${normalized.seller.registrationId}` : null,
    normalized.seller.vatId ? `VAT: ${normalized.seller.vatId}` : null,
    normalized.seller.taxNumber ? `Tax No: ${normalized.seller.taxNumber}` : null,
  ]
    .filter(Boolean)
    .join("  |  ");
  page.drawText(sanitizeWinAnsi(legalFoot), { x: 44, y: 54, size: 7.5, font: fontBold, color: slate600 });
  page.drawText(sanitizeWinAnsi(t.footer), { x: 44, y: 40, size: 7.5, font: fontRegular, color: slate600 });

  // Attach factur-x.xml with /AFRelationship /Alternative per ZUGFeRD / Factur-X spec
  const xmlBytes = new TextEncoder().encode(xml);
  await pdfDoc.attach(xmlBytes, xmlFilename, {
    mimeType: "text/xml",
    description: "EN 16931 ZUGFeRD / Factur-X Electronic Invoice XML",
    creationDate: new Date(),
    modificationDate: new Date(),
    afRelationship: AFRelationship.Alternative,
  });

  // Inject PDF/A-3b + Factur-X XMP metadata stream into Catalog
  const xmpBytes = new TextEncoder().encode(buildFacturXXmpMetadata(normalized, xmlFilename));
  const xmpStream = pdfDoc.context.stream(xmpBytes, {
    Type: "Metadata",
    Subtype: "XML",
  });
  const xmpRef = pdfDoc.context.register(xmpStream);
  pdfDoc.catalog.set(PDFName.of("Metadata"), xmpRef);

  const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
  return { pdfBytes, xml, xmlFilename };
}

export interface ExtractedPdfResult {
  hasEmbeddedXml: boolean;
  xmlFilename: string | null;
  xmlContent: string | null;
  hasPdfA3Xmp: boolean;
  xmpSummary: string;
}

/**
 * Extracts embedded factur-x.xml / zugferd-invoice.xml / xrechnung.xml from any uploaded PDF
 * and inspects ISO 19005-3 (PDF/A-3b) XMP conformance markers.
 */
export async function extractXmlFromHybridPdf(pdfBytes: Uint8Array): Promise<ExtractedPdfResult> {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

  // Inspect XMP Metadata stream for pdfaid:part = 3
  let hasPdfA3Xmp = false;
  let xmpSummary = "No PDF/A-3 XMP metadata stream found.";
  const metaObj = pdfDoc.catalog.lookup(PDFName.of("Metadata"));
  if (metaObj instanceof PDFRawStream || metaObj instanceof PDFStream) {
    try {
      const rawBytes = metaObj instanceof PDFRawStream ? decodePDFRawStream(metaObj).decode() : metaObj.getContents();
      const xmpText = new TextDecoder("utf-8").decode(rawBytes);
      const hasPart3 = /<pdfaid:part>\s*3\s*<\/pdfaid:part>/i.test(xmpText) || /pdfaid:part="3"/i.test(xmpText);
      const hasFx = /factur-x|zugferd/i.test(xmpText);
      hasPdfA3Xmp = hasPart3;
      xmpSummary = hasPart3
        ? hasFx
          ? "PDF/A-3 XMP + Factur-X/ZUGFeRD extension schema detected."
          : "PDF/A-3 XMP detected (missing Factur-X fx: schema metadata)."
        : "XMP metadata present but missing pdfaid:part=3 (PDF/A-3 conformance).";
    } catch {
      xmpSummary = "Metadata stream unreadable.";
    }
  }

  // Locate embedded files via Catalog -> Names -> EmbeddedFiles -> Names array OR Catalog -> AF
  const candidates: Array<{ name: string; bytes: Uint8Array }> = [];

  const extractFromFileSpec = (fileSpec: PDFDict) => {
    const ufObj = fileSpec.lookup(PDFName.of("UF")) ?? fileSpec.lookup(PDFName.of("F"));
    let filename = "";
    if (ufObj instanceof PDFString || ufObj instanceof PDFHexString) {
      filename = ufObj.decodeText();
    }
    const efDict = fileSpec.lookup(PDFName.of("EF"));
    if (efDict instanceof PDFDict) {
      const streamObj = efDict.lookup(PDFName.of("UF")) ?? efDict.lookup(PDFName.of("F"));
      if (streamObj instanceof PDFRawStream) {
        const decoded = decodePDFRawStream(streamObj).decode();
        candidates.push({ name: filename || "embedded.xml", bytes: decoded });
      } else if (streamObj instanceof PDFStream) {
        candidates.push({ name: filename || "embedded.xml", bytes: streamObj.getContents() });
      }
    }
  };

  // Path 1: /Names /EmbeddedFiles
  const namesDict = pdfDoc.catalog.lookup(PDFName.of("Names"));
  if (namesDict instanceof PDFDict) {
    const embeddedFiles = namesDict.lookup(PDFName.of("EmbeddedFiles"));
    if (embeddedFiles instanceof PDFDict) {
      const collectNameTree = (node: PDFDict) => {
        const namesArr = node.lookup(PDFName.of("Names"));
        if (namesArr instanceof PDFArray) {
          for (let i = 0; i + 1 < namesArr.size(); i += 2) {
            const specObj = pdfDoc.context.lookup(namesArr.get(i + 1));
            if (specObj instanceof PDFDict) extractFromFileSpec(specObj);
          }
        }
        const kidsArr = node.lookup(PDFName.of("Kids"));
        if (kidsArr instanceof PDFArray) {
          for (let i = 0; i < kidsArr.size(); i++) {
            const kidObj = pdfDoc.context.lookup(kidsArr.get(i));
            if (kidObj instanceof PDFDict) collectNameTree(kidObj);
          }
        }
      };
      collectNameTree(embeddedFiles);
    }
  }

  // Path 2: /AF (Associated Files array per PDF/A-3)
  const afArr = pdfDoc.catalog.lookup(PDFName.of("AF"));
  if (afArr instanceof PDFArray) {
    for (let i = 0; i < afArr.size(); i++) {
      const specObj = pdfDoc.context.lookup(afArr.get(i));
      if (specObj instanceof PDFDict) extractFromFileSpec(specObj);
    }
  }

  const chosen =
    candidates.find((c) => KNOWN_XML_FILENAMES.includes(c.name.toLowerCase())) ??
    candidates.find((c) => c.name.toLowerCase().endsWith(".xml"));

  if (!chosen) {
    return {
      hasEmbeddedXml: false,
      xmlFilename: null,
      xmlContent: null,
      hasPdfA3Xmp,
      xmpSummary,
    };
  }

  const xmlContent = new TextDecoder("utf-8").decode(chosen.bytes);
  return {
    hasEmbeddedXml: true,
    xmlFilename: chosen.name,
    xmlContent,
    hasPdfA3Xmp,
    xmpSummary,
  };
}
