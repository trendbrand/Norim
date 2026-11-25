import crypto from "node:crypto";

/**
 * RFC 6238 TOTP (authenticator-app 2FA) — SHA-1, 6 digits, 30s period — plus
 * Base32 helpers and backup-code generation. No external dependencies.
 */

const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}

function base32Decode(s: string): Buffer {
  const clean = (s || "").toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = B32.indexOf(ch);
    if (idx < 0) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

/** Cryptographically-random Base32 TOTP secret (default 20 bytes / 160 bits). */
export function generateTotpSecret(bytes = 20): string {
  return base32Encode(crypto.randomBytes(bytes));
}

function hotp(secret: Buffer, counter: number): string {
  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(Math.floor(counter / 0x1_0000_0000), 0);
  buf.writeUInt32BE(counter >>> 0, 4);
  const hmac = crypto.createHmac("sha1", secret).update(buf).digest();
  const offset = hmac[hmac.length - 1]! & 0xf;
  const code =
    ((hmac[offset]! & 0x7f) << 24) |
    ((hmac[offset + 1]! & 0xff) << 16) |
    ((hmac[offset + 2]! & 0xff) << 8) |
    (hmac[offset + 3]! & 0xff);
  return (code % 1_000_000).toString().padStart(6, "0");
}

/** Verify a 6-digit TOTP token, tolerating ±`window` 30s steps (clock drift). */
export function verifyTotp(secretB32: string, token: string, window = 1): boolean {
  if (!/^\d{6}$/.test(token || "")) return false;
  const secret = base32Decode(secretB32);
  if (secret.length === 0) return false;
  const counter = Math.floor(Date.now() / 1000 / 30);
  const tokenBuf = Buffer.from(token);
  for (let i = -window; i <= window; i++) {
    const candidate = hotp(secret, counter + i);
    const candBuf = Buffer.from(candidate);
    if (candBuf.length === tokenBuf.length && crypto.timingSafeEqual(candBuf, tokenBuf)) return true;
  }
  return false;
}

/** otpauth:// URI an authenticator app encodes into a QR for enrollment. */
export function otpauthUrl(email: string, secretB32: string, issuer = "NormInvoice"): string {
  const label = encodeURIComponent(`${issuer}:${email}`);
  const params = new URLSearchParams({
    secret: secretB32,
    issuer,
    algorithm: "SHA1",
    digits: "6",
    period: "30",
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

/** Human-friendly one-time backup codes (e.g. "a1b2c-3d4e5"). */
export function generateBackupCodes(count = 10): string[] {
  return Array.from({ length: count }, () => {
    const raw = crypto.randomBytes(5).toString("hex");
    return `${raw.slice(0, 5)}-${raw.slice(5)}`;
  });
}

/** scrypt hash for storing a backup code at rest (salt:hash, hex). */
export function hashBackupCode(code: string): string {
  const salt = crypto.randomBytes(12);
  const derived = crypto.scryptSync(code.trim().toLowerCase(), salt, 32);
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

export function verifyBackupCode(code: string, stored: string): boolean {
  const [saltHex, hashHex] = (stored || "").split(":");
  if (!saltHex || !hashHex) return false;
  try {
    const derived = crypto.scryptSync(code.trim().toLowerCase(), Buffer.from(saltHex, "hex"), 32);
    const a = Buffer.from(derived.toString("hex"));
    const b = Buffer.from(hashHex);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
