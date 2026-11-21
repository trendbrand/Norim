import { describe, expect, it } from "vitest";
import {
  GOLDEN_FIXTURES,
  buildDatevExtfCsv,
  buildFrenchFecTsv,
  buildSepaQrPayload,
  computeCanonicalTotals,
  extractXmlFromHybridPdf,
  generateHybridEInvoicePdf,
  mapStripeInvoiceToCanonical,
  mapWooOrderToCanonical,
  parseBatchInvoicesCsv,
  parseEInvoiceXml,
  parseEuVatId,
  SAMPLE_EU_BATCH_CSV,
  serializeToCiiXml,
  serializeToUblXml,
  validateCanonicalInvoice,
  verifyEuVatId,
} from "../src/index.js";

describe("NormInvoice — 12-Fixture EN 16931 / ZUGFeRD / Factur-X / XRechnung Golden Compliance Suite", () => {
  for (const fixture of GOLDEN_FIXTURES) {
    it(`Fixture [${fixture.id}]: ${fixture.title}`, () => {
      const report = validateCanonicalInvoice(fixture.invoice);
      expect(report.valid).toBe(fixture.expectedValid);

      for (const expectedErr of fixture.expectedRuleErrors) {
        expect(report.diagnostics.map((d) => d.ruleId)).toContain(expectedErr);
      }
    });
  }

  it("Round-trips CII XML serialization -> XXE-safe parsing -> re-validation with 100% fidelity", () => {
    const deFixture = GOLDEN_FIXTURES[0]!;
    const xml = serializeToCiiXml(deFixture.invoice);
    expect(xml).toContain("rsm:CrossIndustryInvoice");
    expect(xml).toContain("urn:cen.eu:en16931:2017");

    const parsed = parseEInvoiceXml(xml);
    expect(parsed.syntax).toBe("CII");
    expect(parsed.invoice.invoiceNumber).toBe("RE-2026-0101");
    expect(parsed.invoice.lines).toHaveLength(2);
    expect(parsed.invoice.totals?.taxInclusiveTotal).toBe(1273.3);

    const recheck = validateCanonicalInvoice(parsed.invoice);
    expect(recheck.valid).toBe(true);
  });

  it("Round-trips UBL 2.1 XRechnung 3.0.2 & Peppol BIS 3.0 serialization -> parsing -> re-validation", () => {
    const ublFixture = GOLDEN_FIXTURES[3]!;
    const xml = serializeToUblXml(ublFixture.invoice);
    expect(xml).toContain("urn:xeinkauf.de:kosit:xrechnung_3.0");
    expect(xml).toContain("<cbc:BuyerReference>991-01234-56</cbc:BuyerReference>");

    const parsed = parseEInvoiceXml(xml);
    expect(parsed.syntax).toBe("UBL");
    expect(parsed.profileDetected).toBe("XRECHNUNG_UBL");
    expect(parsed.invoice.buyerReference).toBe("991-01234-56");

    const recheck = validateCanonicalInvoice(parsed.invoice);
    expect(recheck.valid).toBe(true);
  });

  it("Embeds factur-x.xml + PDF/A-3b XMP metadata into hybrid PDF and extracts it back cleanly", async () => {
    const frFixture = GOLDEN_FIXTURES[1]!;
    const { pdfBytes, xml, xmlFilename } = await generateHybridEInvoicePdf(frFixture.invoice);
    expect(xmlFilename).toBe("factur-x.xml");
    expect(pdfBytes.length).toBeGreaterThan(2000);

    const extracted = await extractXmlFromHybridPdf(pdfBytes);
    expect(extracted.hasEmbeddedXml).toBe(true);
    expect(extracted.hasPdfA3Xmp).toBe(true);
    expect(extracted.xmlFilename).toBe("factur-x.xml");
    expect(extracted.xmlContent).toBe(xml);

    const parsed = parseEInvoiceXml(extracted.xmlContent!);
    expect(parsed.invoice.invoiceNumber).toBe("FA-2026-0412");
    expect(validateCanonicalInvoice(parsed.invoice).valid).toBe(true);
  });

  it("Blocks XXE / DOCTYPE XML injection payloads immediately", () => {
    const malicious = `<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><Invoice>&xxe;</Invoice>`;
    expect(() => parseEInvoiceXml(malicious)).toThrow(/SECURITY_BLOCKED_DTD/);
  });

  it("Computes exact Multi-VAT buckets (19% + 7%) and EPC SEPA QR payload without float drift", () => {
    const multiVat = GOLDEN_FIXTURES[7]!;
    const { vatBreakdown, totals } = computeCanonicalTotals(multiVat.invoice);
    expect(vatBreakdown).toHaveLength(2);
    // 5 * 39 = 195 @ 7% = 13.65; 2 * 120 = 240 @ 19% = 45.60; Net = 435, Tax = 59.25, Gross = 494.25
    expect(totals.taxExclusiveTotal).toBe(435);
    expect(totals.taxTotal).toBe(59.25);
    expect(totals.taxInclusiveTotal).toBe(494.25);

    const qr = buildSepaQrPayload(multiVat.invoice, totals);
    expect(qr).toContain("BCD\n002\n1\nSCT");
    expect(qr).toContain("EUR494.25");
  });

  it("Maps Stripe Invoice webhooks accurately, detects Reverse Charge, and reconciles €0.01 rounding", () => {
    const seller = GOLDEN_FIXTURES[0]!.invoice.seller;
    const mapped = mapStripeInvoiceToCanonical(
      {
        id: "in_1Qx999Demo",
        number: "STR-2026-8841",
        created: 1795140000,
        currency: "eur",
        customer_name: "HexaLogistique SARL",
        customer_email: "compta@hexalogistique.fr",
        customer_address: {
          line1: "12 Cours Lafayette",
          postal_code: "69003",
          city: "Lyon",
          country: "FR",
        },
        customer_tax_ids: [{ type: "eu_vat", value: "FR82451234567" }],
        total: 4900,
        amount_paid: 4900,
        lines: {
          data: [
            {
              id: "il_1",
              description: "NormInvoice Business Plan",
              quantity: 1,
              amount: 4900,
            },
          ],
        },
      },
      seller,
      { iban: "DE89370400440532013000", buyerVatVerified: true }
    );

    expect(mapped.actionRequired).toBe(false);
    expect(mapped.invoice.profile).toBe("FACTURX_EN16931");
    expect(mapped.invoice.vatBreakdown?.[0]?.categoryCode).toBe("AE");
    expect(mapped.invoice.totals?.taxInclusiveTotal).toBe(49);
  });

  it("Exports valid German DATEV EXTF v700 Buchungsstapel CSV", () => {
    const csv = buildDatevExtfCsv([GOLDEN_FIXTURES[0]!.invoice, GOLDEN_FIXTURES[4]!.invoice], {
      chartOfAccounts: "SKR03",
    });
    expect(csv.startsWith("\uFEFF\"EXTF\";700;21;\"Buchungsstapel\"")).toBe(true);
    expect(csv).toContain("1273,30");
    expect(csv).toContain(";8400;\"3\";");
    expect(csv).toContain(";8336;\"40\";"); // Reverse charge SKR03 account
  });

  it("Validates EU VAT syntax across member states and handles offline provisional fallback", async () => {
    expect(parseEuVatId("DE298765432").syntaxValid).toBe(true);
    expect(parseEuVatId("FR40303265045").syntaxValid).toBe(true);
    expect(parseEuVatId("DE12345").syntaxValid).toBe(false);

    const res = await verifyEuVatId("DE298765432", { liveLookup: false });
    expect(res.status).toBe("PROVISIONAL");
    expect(res.syntaxValid).toBe(true);
  });

  it("Maps WooCommerce B2B orders into Factur-X / ZUGFeRD / Peppol with EU Reverse Charge", () => {
    const seller = GOLDEN_FIXTURES[0]!.invoice.seller;
    const mapped = mapWooOrderToCanonical(
      {
        id: 8821,
        number: "8821",
        date_created: "2026-11-20T10:00:00",
        currency: "EUR",
        total: "299.00",
        total_tax: "0.00",
        payment_method: "stripe",
        billing: {
          first_name: "Camille",
          last_name: "Laurent",
          company: "Atelier Lumière SAS",
          address_1: "24 Rue de Rivoli",
          city: "Paris",
          postcode: "75004",
          country: "FR",
          email: "compta@atelier-lumiere.fr",
        },
        meta_data: [{ key: "_billing_eu_vat_id", value: "FR40303265045" }],
        line_items: [
          {
            id: 1,
            name: "Pro Hardware Kit",
            quantity: 1,
            subtotal: "299.00",
            total: "299.00",
            total_tax: "0.00",
          },
        ],
      },
      seller,
      { iban: "DE89370400440532013000", buyerVatVerified: true }
    );

    expect(mapped.actionRequired).toBe(false);
    expect(mapped.invoice.profile).toBe("FACTURX_EN16931");
    expect(mapped.invoice.vatBreakdown?.[0]?.categoryCode).toBe("AE");
    expect(mapped.invoice.invoiceNumber).toBe("WC-8821");
  });

  it("Parses European semicolon CSV with German decimal commas and isolates invalid rows cleanly", () => {
    const seller = GOLDEN_FIXTURES[0]!.invoice.seller;
    const rows = parseBatchInvoicesCsv(SAMPLE_EU_BATCH_CSV, seller, {
      iban: "DE89370400440532013000",
      bic: "COBADEFFXXX",
    });

    expect(rows).toHaveLength(4);
    expect(rows[0]!.valid).toBe(true);
    expect(rows[0]!.grossAmount).toBe(889.53); // 5 * 149.50 = 747.50 + 19% (142.03) = 889.53
    expect(rows[1]!.valid).toBe(true);
    expect(rows[1]!.profile).toBe("FACTURX_EN16931");
    expect(rows[2]!.valid).toBe(true);
    expect(rows[2]!.profile).toBe("XRECHNUNG_UBL");
    expect(rows[3]!.valid).toBe(false);
    expect(rows[3]!.errors.some((e) => e.includes("BR-DE-15"))).toBe(true);
  });

  it("Exports official French DGFiP FEC accounting TSV (PCG 411000 / 706000 / 445710)", () => {
    const tsv = buildFrenchFecTsv([GOLDEN_FIXTURES[1]!.invoice]);
    expect(tsv.startsWith("\uFEFFJournalCode\tJournalLib\tEcritureNum")).toBe(true);
    expect(tsv).toContain("\t411000\tClients\t");
    expect(tsv).toContain("\t706000\tPrestations de services\t");
    expect(tsv).toContain("\t445710\tTVA collectée\t");
    expect(tsv).toContain("3060,00"); // 3 * 850 = 2550 + 20% = 3060,00
  });

  it("Neutralizes Excel/CSV Formula Injection (=CMD, +SUM, @HYPERLINK) in DATEV & French FEC exports", () => {
    const malicious = structuredClone(GOLDEN_FIXTURES[0]!.invoice);
    malicious.buyer.name = "=CMD|' /C calc'!A0";

    const datev = buildDatevExtfCsv([malicious]);
    expect(datev).not.toContain('"=CMD');
    expect(datev).toContain("\"'=CMD");

    const fec = buildFrenchFecTsv([malicious]);
    expect(fec).not.toContain("\t=CMD");
    expect(fec).toContain("\t'=CMD");
  });

  it("Flags missing French SIREN (BR-FR-05 warning) when Seller is in France without registrationId", () => {
    const frMissingSiren = structuredClone(GOLDEN_FIXTURES[1]!.invoice);
    frMissingSiren.seller.registrationId = undefined;
    const report = validateCanonicalInvoice(frMissingSiren);
    expect(report.valid).toBe(true); // warning, not blocking EN 16931 error
    expect(report.diagnostics.some((d) => d.ruleId === "BR-FR-05")).toBe(true);
  });
});
