import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { requireTenantAuth } from "@/lib/security";
import {
  appendOrgAuditEvent,
  disableUserTotp,
  enableUserTotp,
  findUserByEmailDb,
  getUserTotp,
  setUserTotpPendingSecret,
  verifyPasswordScrypt,
} from "@/lib/db-store";
import { generateBackupCodes, generateTotpSecret, hashBackupCode, otpauthUrl, verifyTotp } from "@/lib/totp";

/** Current 2FA status for the signed-in user. */
export async function GET(req: NextRequest) {
  const access = await requireTenantAuth(req, { allowApiKey: false });
  if (!access.ok) return access.response;
  if (!access.ctx.userId) return NextResponse.json({ error: "No user session." }, { status: 401 });
  const t = getUserTotp(access.ctx.userId);
  return NextResponse.json({ enabled: t.enabled, backupCount: t.backupCount });
}

/**
 * action=setup  -> generate a pending secret + QR for enrollment
 * action=enable -> verify a code against the pending secret, enable, return backup codes
 * action=disable-> re-auth with account password, then turn 2FA off
 */
export async function POST(req: NextRequest) {
  const access = await requireTenantAuth(req, { allowApiKey: false });
  if (!access.ok) return access.response;
  const userId = access.ctx.userId;
  if (!userId) return NextResponse.json({ error: "No user session." }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { action?: string; code?: string; password?: string };

  if (body.action === "setup") {
    if (getUserTotp(userId).enabled) {
      return NextResponse.json({ error: "2FA is already enabled. Disable it first to re-enroll." }, { status: 400 });
    }
    const secret = generateTotpSecret();
    setUserTotpPendingSecret(userId, secret);
    const url = otpauthUrl(access.ctx.actorEmail || "user", secret);
    const qrDataUrl = await QRCode.toDataURL(url, { margin: 1, width: 220 });
    return NextResponse.json({ secret, otpauthUrl: url, qrDataUrl });
  }

  if (body.action === "enable") {
    const t = getUserTotp(userId);
    if (t.enabled) return NextResponse.json({ error: "2FA is already enabled." }, { status: 400 });
    if (!t.secret) return NextResponse.json({ error: "Start the setup step first." }, { status: 400 });
    if (!verifyTotp(t.secret, (body.code || "").trim())) {
      return NextResponse.json({ error: "That code is incorrect. Check your authenticator app and try again." }, { status: 400 });
    }
    const backupCodes = generateBackupCodes(10);
    enableUserTotp(userId, backupCodes.map(hashBackupCode));
    appendOrgAuditEvent(access.ctx.orgId, null, "SECURITY", "2FA_ENABLED", access.ctx.actorEmail, { userId });
    return NextResponse.json({ enabled: true, backupCodes });
  }

  if (body.action === "disable") {
    const user = access.ctx.actorEmail ? findUserByEmailDb(access.ctx.actorEmail) : null;
    if (!user || !body.password || !verifyPasswordScrypt(body.password, user.passwordHash)) {
      return NextResponse.json({ error: "Enter your current account password to disable 2FA." }, { status: 401 });
    }
    disableUserTotp(userId);
    appendOrgAuditEvent(access.ctx.orgId, null, "SECURITY", "2FA_DISABLED", access.ctx.actorEmail, { userId });
    return NextResponse.json({ enabled: false });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
