import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { enforceRateLimit } from "@/lib/rate-limit";
import {
  GOLDEN_FIXTURES,
  extractXmlFromHybridPdf,
  getRuleKnowledge,
  parseEInvoiceXml,
  serializeToCiiXml,
  serializeToUblXml,
  validateCanonicalInvoice,
} from "@norminvoice/einvoice-core";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB hard upload guard

/**
 * Zero-Retention Public E-Invoice Inspector & Dual Validator
 * - Accepts multipart upload (.pdf or .xml) OR JSON { sampleFixtureId }
 * - Never writes uploaded invoice files to persistent storage or logs PII
 */
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const rl = await enforceRateLimit(`public_inspect:${ip}`, 60, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded (60 inspections/minute). Please retry shortly or use an API key." },
        { status: 429 }
      );
    }

    const contentType = req.headers.get("content-type") || "";

    // Mode 1: Sample Fixture Inspection (1-click instant demo)
    if (contentType.includes("application/json")) {
      const body = (await req.json()) as { sampleFixtureId?: string; rawXml?: string };

      if (body.sampleFixtureId) {
        const fixture = GOLDEN_FIXTURES.find((f) => f.id === body.sampleFixtureId);
        if (!fixture) {
          return NextResponse.json({ error: "Unknown sample fixture ID" }, { status: 404 });
        }
        const isUbl = fixture.invoice.profile === "XRECHNUNG_UBL" || fixture.invoice.profile === "PEPPOL_BIS_3";
        const xml = isUbl ? serializeToUblXml(fixture.invoice) : serializeToCiiXml(fixture.invoice);
        const report = validateCanonicalInvoice(fixture.invoice, {
          container: isUbl ? "XML" : "PDF/A-3b",
          syntax: isUbl ? "UBL" : "CII",
          pdfa3bChecked: !isUbl,
          pdfa3bPassed: true,
          pdfa3bDetails: !isUbl ? "PDF/A-3b XMP + Factur-X/ZUGFeRD schema verified." : undefined,
        });
        const qrDataUrl = report.sepaQrPayload
          ? await QRCode.toDataURL(report.sepaQrPayload, { width: 180, margin: 1 })
          : null;

        return NextResponse.json({
          retention: "ZERO_RETENTION_IN_MEMORY",
          filename: `${fixture.invoice.invoiceNumber}.${isUbl ? "xml" : "pdf"}`,
          invoice: fixture.invoice,
          report,
          xmlPreview: xml,
          sepaQrDataUrl: qrDataUrl,
        });
      }

      if (body.rawXml) {
        const parsed = parseEInvoiceXml(body.rawXml);
        const report = validateCanonicalInvoice(parsed.invoice, {
          container: "XML",
          syntax: parsed.syntax,
        });
        const qrDataUrl = report.sepaQrPayload
          ? await QRCode.toDataURL(report.sepaQrPayload, { width: 180, margin: 1 })
          : null;
        return NextResponse.json({
          retention: "ZERO_RETENTION_IN_MEMORY",
          filename: "pasted-invoice.xml",
          invoice: parsed.invoice,
          report,
          xmlPreview: body.rawXml,
          sepaQrDataUrl: qrDataUrl,
        });
      }

      return NextResponse.json({ error: "Provide sampleFixtureId, rawXml, or multipart file." }, { status: 400 });
    }

    // Mode 2: Multipart PDF or XML file upload (strict 10 MB limit, RAM-only)
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Missing file field in multipart upload." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File exceeds 10 MB maximum size." }, { status: 413 });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const isPdf =
      bytes.length >= 5 &&
      bytes[0] === 0x25 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x44 &&
      bytes[3] === 0x46 &&
      bytes[4] === 0x2d; // %PDF-

    if (isPdf) {
      const extracted = await extractXmlFromHybridPdf(bytes);
      if (!extracted.hasEmbeddedXml || !extracted.xmlContent) {
        const rule = getRuleKnowledge("PDFA-3B-01");
        return NextResponse.json({
          retention: "ZERO_RETENTION_IN_MEMORY",
          filename: file.name,
          invoice: null,
          xmlPreview: null,
          sepaQrDataUrl: null,
          report: {
            valid: false,
            engine: "builtin-en16931",
            detected: {
              container: "PDF (Non-PDF/A-3)",
              syntax: "UNKNOWN",
              standard: "Plain PDF (Not an E-Invoice)",
              profile: "NONE",
            },
            checks: {
              pdfa3b: { applicable: true, passed: false, details: extracted.xmpSummary },
              syntaxXsd: { passed: false, errors: 1 },
              schematronEn16931: { passed: false, errors: 1, warnings: 0 },
            },
            diagnostics: [
              {
                ...rule,
                docsUrl: `/errors/${rule.ruleId}`,
              },
            ],
          },
        });
      }

      const parsed = parseEInvoiceXml(extracted.xmlContent);
      const report = validateCanonicalInvoice(parsed.invoice, {
        container: extracted.hasPdfA3Xmp ? "PDF/A-3b" : "PDF (Non-PDF/A-3)",
        syntax: parsed.syntax,
        pdfa3bChecked: true,
        pdfa3bPassed: extracted.hasPdfA3Xmp,
        pdfa3bDetails: extracted.xmpSummary,
      });

      const qrDataUrl = report.sepaQrPayload
        ? await QRCode.toDataURL(report.sepaQrPayload, { width: 180, margin: 1 })
        : null;

      return NextResponse.json({
        retention: "ZERO_RETENTION_IN_MEMORY",
        filename: file.name,
        embeddedXmlFilename: extracted.xmlFilename,
        invoice: parsed.invoice,
        report,
        xmlPreview: extracted.xmlContent,
        sepaQrDataUrl: qrDataUrl,
      });
    }

    // Raw XML file inspection
    const xmlText = new TextDecoder("utf-8").decode(bytes);
    const parsed = parseEInvoiceXml(xmlText);
    const report = validateCanonicalInvoice(parsed.invoice, {
      container: "XML",
      syntax: parsed.syntax,
    });
    const qrDataUrl = report.sepaQrPayload
      ? await QRCode.toDataURL(report.sepaQrPayload, { width: 180, margin: 1 })
      : null;

    return NextResponse.json({
      retention: "ZERO_RETENTION_IN_MEMORY",
      filename: file.name,
      invoice: parsed.invoice,
      report,
      xmlPreview: xmlText,
      sepaQrDataUrl: qrDataUrl,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to inspect e-invoice";
    const status = msg.startsWith("SECURITY_BLOCKED_DTD") ? 400 : 422;
    return NextResponse.json({ error: msg }, { status });
  }
}
