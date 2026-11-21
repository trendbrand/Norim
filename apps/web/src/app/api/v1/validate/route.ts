import { NextRequest, NextResponse } from "next/server";
import {
  CanonicalInvoiceSchema,
  extractXmlFromHybridPdf,
  getRuleKnowledge,
  parseEInvoiceXml,
  validateCanonicalInvoice,
} from "@norminvoice/einvoice-core";
import { checkRateLimit } from "@/lib/auth";
import { requireTenantAuth } from "@/lib/security";

const MAX_BYTES = 10 * 1024 * 1024;

/**
 * STRICT Authenticated Programmatic Dual Validation Endpoint (REST API v1).
 * Requires Authorization: Bearer ni_live_... OR valid interactive session cookie.
 * Unauthenticated callers receive HTTP 401 (use /api/v1/public/inspect for the public free lead-magnet validator).
 */
export async function POST(req: NextRequest) {
  const access = await requireTenantAuth(req);
  if (!access.ok) return access.response;

  const rlKey = `api_validate:${access.ctx.orgId}:${access.ctx.apiKeyPrefix || access.ctx.userId}`;
  const rl = checkRateLimit(rlKey, 300, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        type: "https://norminvoice.eu/problems/rate-limited",
        title: "Rate Limit Exceeded",
        status: 429,
      },
      { status: 429 }
    );
  }

  const authLabel = access.ctx.via === "api_key" ? `api_key:${access.ctx.apiKeyPrefix}` : `session:${access.ctx.actorEmail}`;

  try {
    const ct = req.headers.get("content-type") || "";

    if (ct.includes("application/json")) {
      const json = await req.json();
      const parsed = CanonicalInvoiceSchema.safeParse(json);
      if (!parsed.success) {
        return NextResponse.json(
          {
            type: "https://norminvoice.eu/problems/invalid-schema",
            title: "Canonical EN 16931 Schema Error",
            status: 400,
            issues: parsed.error.issues,
          },
          { status: 400 }
        );
      }
      const report = validateCanonicalInvoice(parsed.data);
      return NextResponse.json({
        authenticatedVia: authLabel,
        orgId: access.ctx.orgId,
        report,
      });
    }

    if (ct.includes("xml")) {
      const xml = await req.text();
      if (xml.length > MAX_BYTES) {
        return NextResponse.json({ error: "XML exceeds 10 MB limit" }, { status: 413 });
      }
      const parsed = parseEInvoiceXml(xml);
      const report = validateCanonicalInvoice(parsed.invoice, { container: "XML", syntax: parsed.syntax });
      return NextResponse.json({
        authenticatedVia: authLabel,
        orgId: access.ctx.orgId,
        report,
      });
    }

    if (ct.includes("multipart/form-data")) {
      const fd = await req.formData();
      const file = fd.get("file");
      if (!file || !(file instanceof File)) {
        return NextResponse.json({ error: "Missing multipart file field" }, { status: 400 });
      }
      if (file.size > MAX_BYTES) {
        return NextResponse.json({ error: "File exceeds 10 MB limit" }, { status: 413 });
      }
      const bytes = new Uint8Array(await file.arrayBuffer());
      const isPdf = bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;

      if (isPdf) {
        const extracted = await extractXmlFromHybridPdf(bytes);
        if (!extracted.hasEmbeddedXml || !extracted.xmlContent) {
          const rule = getRuleKnowledge("PDFA-3B-01");
          return NextResponse.json({
            authenticatedVia: authLabel,
            orgId: access.ctx.orgId,
            report: {
              valid: false,
              diagnostics: [{ ...rule, docsUrl: `/errors/${rule.ruleId}` }],
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
        return NextResponse.json({
          authenticatedVia: authLabel,
          orgId: access.ctx.orgId,
          report,
        });
      }

      const xmlText = new TextDecoder("utf-8").decode(bytes);
      const parsed = parseEInvoiceXml(xmlText);
      const report = validateCanonicalInvoice(parsed.invoice, { container: "XML", syntax: parsed.syntax });
      return NextResponse.json({
        authenticatedVia: authLabel,
        orgId: access.ctx.orgId,
        report,
      });
    }

    return NextResponse.json(
      { error: "Unsupported Content-Type. Use application/json, application/xml, or multipart/form-data." },
      { status: 415 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Validation failed" },
      { status: 422 }
    );
  }
}
