import crypto from "node:crypto";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";

export * from "./schema.js";

export function createDbClient(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to initialize PostgreSQL client");
  }
  const pool = new pg.Pool({
    connectionString,
    max: 15,
    idleTimeoutMillis: 30_000,
  });
  return { pool, db: drizzle(pool, { schema }) };
}

/**
 * Envelope AES-256-GCM encryption for integration credentials (Stripe / WooCommerce / SMTP secrets).
 */
export function encryptSecret(plaintext: string, keyHex = process.env.APP_ENCRYPTION_KEY_HEX): Buffer {
  if (!keyHex || keyHex.length !== 64) {
    throw new Error("APP_ENCRYPTION_KEY_HEX must be a 64-character hex string (32 bytes).");
  }
  const key = Buffer.from(keyHex, "hex");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]);
}

export function decryptSecret(payload: Buffer, keyHex = process.env.APP_ENCRYPTION_KEY_HEX): string {
  if (!keyHex || keyHex.length !== 64) {
    throw new Error("APP_ENCRYPTION_KEY_HEX must be a 64-character hex string (32 bytes).");
  }
  const key = Buffer.from(keyHex, "hex");
  const iv = payload.subarray(0, 12);
  const authTag = payload.subarray(12, 28);
  const ciphertext = payload.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

/**
 * Computes tamper-evident GoBD SHA-256 hash-chain link for invoice_audit_events.
 */
export function computeAuditEventHash(params: {
  prevHash: string;
  invoiceId: string;
  eventType: string;
  payloadJson: unknown;
  createdAtIso: string;
}): string {
  const material = [
    params.prevHash,
    params.invoiceId,
    params.eventType,
    JSON.stringify(params.payloadJson),
    params.createdAtIso,
  ].join("|");
  return crypto.createHash("sha256").update(material, "utf8").digest("hex");
}

export function sha256Buffer(buf: Uint8Array | Buffer | string): string {
  return crypto.createHash("sha256").update(buf).digest("hex");
}
