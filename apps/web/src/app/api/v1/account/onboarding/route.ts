import { NextRequest, NextResponse } from "next/server";
import { requireTenantAuth } from "@/lib/security";
import {
  appendOrgAuditEvent,
  getSellerSettings,
  markOnboardingCompleted,
  updateSellerSettings,
} from "@/lib/db-store";
import { persistSellerProfileToPostgres } from "@/lib/pg-persistence";

export async function POST(req: NextRequest) {
  const access = await requireTenantAuth(req, { allowApiKey: false, allowedRoles: ["owner", "admin"] });
  if (!access.ok) return access.response;

  try {
    const body = await req.json();
    const updated = updateSellerSettings(access.ctx.orgId, {
      legalName: body.legalName,
      tradingName: body.tradingName,
      managingDirector: body.managingDirector,
      registrationId: body.registrationId,
      countryCode: body.countryCode,
      street: body.street,
      postalCode: body.postalCode,
      city: body.city,
      vatId: body.vatId,
      taxNumber: body.taxNumber,
      isKleinunternehmer: Boolean(body.isKleinunternehmer),
      electronicAddress: body.electronicAddress,
      contactName: body.contactName,
      contactPhone: body.contactPhone,
      contactEmail: body.contactEmail,
      iban: body.iban,
      bic: body.bic,
      accountHolder: body.accountHolder || body.legalName,
      invoicePrefix: body.invoicePrefix,
      creditNotePrefix: body.creditNotePrefix,
      nextInvoiceSeq: body.nextInvoiceSeq,
      defaultFormat: body.defaultFormat,
      defaultLocale: body.defaultLocale,
      defaultDueDays: body.defaultDueDays,
      retentionYears: body.retentionYears === 10 ? 10 : 8,
    });

    markOnboardingCompleted(access.ctx.orgId);
    appendOrgAuditEvent(access.ctx.orgId, null, "ONBOARDING", "WORKSPACE_ONBOARDING_COMPLETED", access.ctx.actorEmail, {
      legalName: updated.legalName,
      countryCode: updated.countryCode,
      defaultFormat: updated.defaultFormat,
    });

    await persistSellerProfileToPostgres(access.ctx.orgId, updated);

    return NextResponse.json({
      completed: true,
      settings: getSellerSettings(access.ctx.orgId),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Onboarding save failed" },
      { status: 400 }
    );
  }
}
