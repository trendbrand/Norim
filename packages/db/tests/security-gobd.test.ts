import { describe, expect, it } from "vitest";
import { computeAuditEventHash, decryptSecret, encryptSecret, sha256Buffer } from "../src/index.js";

const TEST_KEY_HEX = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

describe("@norminvoice/db — Security Encryption & GoBD Hash-Chain Suite", () => {
  it("Encrypts and decrypts Stripe/WooCommerce credentials via AES-256-GCM with unique IVs", () => {
    const secret = "rk_live_51NormInvoiceSecretToken_9981";
    const c1 = encryptSecret(secret, TEST_KEY_HEX);
    const c2 = encryptSecret(secret, TEST_KEY_HEX);

    // Random 12-byte IV guarantees identical plaintexts produce distinct ciphertexts
    expect(c1.equals(c2)).toBe(false);
    expect(decryptSecret(c1, TEST_KEY_HEX)).toBe(secret);
    expect(decryptSecret(c2, TEST_KEY_HEX)).toBe(secret);
  });

  it("Rejects tampered AES-256-GCM ciphertext immediately (GCM auth-tag check)", () => {
    const cipher = encryptSecret("whsec_production_secret", TEST_KEY_HEX);
    const tampered = Buffer.from(cipher);
    tampered[tampered.length - 1] = (tampered[tampered.length - 1]! ^ 0xff) & 0xff;
    expect(() => decryptSecret(tampered, TEST_KEY_HEX)).toThrow();
  });

  it("Enforces strict 32-byte (64 hex char) encryption key length", () => {
    expect(() => encryptSecret("test", "short_key")).toThrow(/64-character hex/);
  });

  it("Produces deterministic tamper-evident GoBD SHA-256 audit hash chains", () => {
    const h1 = computeAuditEventHash({
      prevHash: "0".repeat(64),
      invoiceId: "inv_001",
      eventType: "VALIDATED_AND_ARCHIVED",
      payloadJson: { sha256Xml: sha256Buffer("<Invoice/>") },
      createdAtIso: "2026-11-20T05:00:00.000Z",
    });

    const h2 = computeAuditEventHash({
      prevHash: h1,
      invoiceId: "inv_001",
      eventType: "EMAILED_TO_BUYER",
      payloadJson: { recipient: "ap@alpenwerk.de" },
      createdAtIso: "2026-11-20T05:00:02.000Z",
    });

    const h2Tampered = computeAuditEventHash({
      prevHash: h1,
      invoiceId: "inv_001",
      eventType: "EMAILED_TO_BUYER",
      payloadJson: { recipient: "attacker@evil.example" },
      createdAtIso: "2026-11-20T05:00:02.000Z",
    });

    expect(h1).toHaveLength(64);
    expect(h2).toHaveLength(64);
    expect(h2).not.toBe(h2Tampered);
  });
});
