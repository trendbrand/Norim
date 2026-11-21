import { NextRequest, NextResponse } from "next/server";
import {
  CanonicalInvoiceSchema,
  computeCanonicalTotals,
  generateHybridEInvoicePdf,
  serializeToCiiXml,
  serializeToUblXml,
  validateCanonicalInvoice,
} from "@norminvoice/einvoice-core";
import {
  consumeNextInvoiceNumber,
  getInvoiceForOrg,
  getOrgById,
  getSellerSettings,
  getSubscriptionForOrg,
  listInvoicesForOrg,
  patchInvoiceForOrg,
  saveInvoiceForOrg,
  sellerSettingsToCanonicalParty,
} from "@/lib/db-store";
import { persistInvoiceToPostgresIfEnabled } from "@/lib/pg-persistence";
import { enforceOrgMonthlyQuota, getOrgMonthlyQuotaStatus } from "@/lib/quota";
import { requireTenantAuth } from "@/lib/security";

export async function GET(req: NextRequest) {
  const access = await requireTenantAuth(req);
  if (!access.ok) return access.response;

  const status = req.nextUrl.searchParams.get("status") || undefined;
  const search = req.nextUrl.searchParams.get("search") || undefined;
  const fromDate = req.nextUrl.searchParams.get("from") || undefined;
  const toDate = req.nextUrl.searchParams.get("to") || undefined;

  const invoices = listInvoicesForOrg(access.ctx.orgId, { status, search, fromDate, toDate });
  const settings = getSellerSettings(access.ctx.orgId);
  const org = getOrgById(access.ctx.orgId);
  const subscription = getSubscriptionForOrg(access.ctx.orgId);
  const quota = getOrgMonthlyQuotaStatus(access.ctx.orgId);

  return NextResponse.json({
    invoices,
    sellerProfile: settings ? sellerSettingsToCanonicalParty(settings) : null,
    sellerSettings: settings,
    onboardingCompleted: org?.onboardingCompleted ?? false,
    plan: {
      tier: subscription.planTier,
      monthlyQuota: subscription.monthlyQuota,
      usedThisMonth: quota.usedThisMonth,
      remaining: quota.remaining,
    },
  });
}

export async function POST(req: NextRequest) {
  const access = await requireTenantAuth(req, { allowedRoles: ["owner", "admin", "member", "api_key"] });
  if (!access.ok) return access.response;

  try {
    const body = await req.json();
    const saveAsDraft = Boolean(body._draft);
    const customerId = typeof body._customerId === "string" ? body._customerId : null;
    const source = body._source === "api" || access.ctx.via === "api_key" ? "api" : "manual";

    if (!saveAsDraft) {
      const quota = enforceOrgMonthlyQuota(access.ctx.orgId, 1);
      if (!quota.allowed) return quota.response;
    }

    const sellerSettings = getSellerSettings(access.ctx.orgId);
    const editDraftId = typeof body._id === "string" ? body._id : null;
    if (editDraftId) {
      const existing = getInvoiceForOrg(access.ctx.orgId, editDraftId);
      if (!existing) return NextResponse.json({ error: "Draft not found" }, { status: 404 });
      if (existing.status !== "DRAFT") {
        return NextResponse.json(
          { error: "GOBD_IMMUTABLE: Only drafts can be edited. Issue a credit note to correct a finalized invoice." },
          { status: 409 }
        );
      }
    }

    // Auto-fill seller from org settings if omitted, and consume next sequential invoice number if omitted/AUTO
    const payloadToValidate = { ...body };
    delete payloadToValidate._draft;
    delete payloadToValidate._customerId;
    delete payloadToValidate._source;
    delete payloadToValidate._id;

    const wantsAuto = !payloadToValidate.invoiceNumber || payloadToValidate.invoiceNumber === "AUTO";
    if (wantsAuto && saveAsDraft) {
      // Drafts never consume the gapless sequence (GoBD) — they get a temporary reference.
      payloadToValidate.invoiceNumber = `ENTWURF-${Date.now().toString(36).toUpperCase()}`;
    } else if (wantsAuto && sellerSettings) {
      payloadToValidate.invoiceNumber = consumeNextInvoiceNumber(
        access.ctx.orgId,
        payloadToValidate.typeCode === 381 ? 381 : 380
      );
    }
    if (!payloadToValidate.seller && sellerSettings) {
      payloadToValidate.seller = sellerSettingsToCanonicalParty(sellerSettings);
    }

    const parsed = CanonicalInvoiceSchema.safeParse(payloadToValidate);
    if (!parsed.success) {
      return NextResponse.json(
        {
          type: "https://norminvoice.eu/problems/validation-error",
          title: "Invalid Canonical EN 16931 Payload",
          status: 400,
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const { normalized } = computeCanonicalTotals(parsed.data);
    const report = validateCanonicalInvoice(normalized);
    const isUbl = normalized.profile === "XRECHNUNG_UBL" || normalized.profile === "PEPPOL_BIS_3";
    const xml = isUbl ? serializeToUblXml(normalized) : serializeToCiiXml(normalized);

    let pdfBase64: string | null = null;
    if (!isUbl) {
      const hybrid = await generateHybridEInvoicePdf(normalized, xml);
      pdfBase64 = Buffer.from(hybrid.pdfBytes).toString("base64");
    }

    const stored = saveInvoiceForOrg(access.ctx.orgId, normalized, {
      id: editDraftId ?? undefined,
      customerId,
      source,
      sourceRef: `${source}_${normalized.invoiceNumber}`,
      actorEmail: access.ctx.actorEmail,
      saveAsDraft,
    });

    await persistInvoiceToPostgresIfEnabled(access.ctx.orgId, access.ctx.orgId, stored);

    return NextResponse.json({
      invoice: stored,
      validation: report,
      artifacts: {
        xmlFilename: `${normalized.invoiceNumber}.xml`,
        xmlUtf8: xml,
        pdfFilename: pdfBase64 ? `${normalized.invoiceNumber}_ZUGFeRD.pdf` : null,
        pdfBase64,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate e-invoice" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const access = await requireTenantAuth(req, { allowedRoles: ["owner", "admin", "member", "api_key"] });
  if (!access.ok) return access.response;

  try {
    const body = (await req.json()) as {
      id: string;
      buyerReference?: string;
      buyerVatId?: string;
      sellerContactName?: string;
      sellerContactPhone?: string;
      sellerContactEmail?: string;
    };
    if (!body.id) {
      return NextResponse.json({ error: "Missing invoice id" }, { status: 400 });
    }
    const updated = patchInvoiceForOrg(access.ctx.orgId, body.id, body, access.ctx.actorEmail);
    if (!updated) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    return NextResponse.json({ invoice: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Patch failed" },
      { status: 500 }
    );
  }
}
