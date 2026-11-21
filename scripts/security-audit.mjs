/**
 * NormInvoice — Automated Security, EU GDPR Law & WordPress Plugin Verification Suite
 * Actively tests OWASP Top 10 protections, strict auth gates, webhook replay/HMAC guards,
 * CSRF blocking, header hardening, filename sanitization, EU GDPR legal completeness,
 * and WordPress/WooCommerce PHP plugin security invariants!
 *
 * Usage: node scripts/security-audit.mjs [http://localhost:3000]
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const BASE = (process.argv[2] || "http://localhost:3000").replace(/\/+$/, "");
let passed = 0;
let failed = 0;

async function check(label, fn) {
  try {
    await fn();
    passed++;
    console.log(`  [PASS] ${label}`);
  } catch (err) {
    failed++;
    console.error(`  [FAIL] ${label} -> ${err instanceof Error ? err.message : String(err)}`);
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function main() {
  console.log(`\nNormInvoice Security, EU GDPR & Plugin Audit -> ${BASE}\n`);

  // 1. OWASP HTTP Security Headers + Zero X-Powered-By Fingerprinting
  await check("OWASP Headers: CSP, X-Frame-Options=DENY, nosniff, Permissions-Policy, no X-Powered-By", async () => {
    const res = await fetch(`${BASE}/`);
    assert(res.headers.get("x-frame-options") === "DENY", "Missing X-Frame-Options: DENY");
    assert(res.headers.get("x-content-type-options") === "nosniff", "Missing nosniff");
    assert(Boolean(res.headers.get("content-security-policy")), "Missing Content-Security-Policy");
    assert(!res.headers.get("x-powered-by"), "X-Powered-By header should be stripped");
    assert(Boolean(res.headers.get("permissions-policy")), "Missing Permissions-Policy");
  });

  // 2. CSRF Cross-Origin Mutation Blocking
  await check("CSRF Guard: Cross-origin PUT to /api/v1/settings is blocked with HTTP 403", async () => {
    const res = await fetch(`${BASE}/api/v1/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://evil-attacker.example",
      },
      body: JSON.stringify({ retentionYears: 8 }),
    });
    assert(res.status === 403, `Expected 403 CSRF block, got ${res.status}`);
  });

  // 3. XXE & Billion Laughs XML Injection Protection
  await check("XXE Guard: DOCTYPE / ENTITY XML upload rejected with HTTP 400", async () => {
    const xml = `<?xml version="1.0"?><!DOCTYPE lolz [<!ENTITY lol "lol">]><Invoice>&lol;</Invoice>`;
    const res = await fetch(`${BASE}/api/v1/public/inspect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawXml: xml }),
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  // 4. Malformed / Disguised Binary Upload Gracefully Handled (No 500 Crash)
  await check("Untrusted Binary Upload: Garbage bytes disguised as .pdf return HTTP 422 (no 500 crash)", async () => {
    const form = new FormData();
    const fakeBytes = new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0xff, 0xfe]);
    form.append("file", new Blob([fakeBytes], { type: "application/pdf" }), "malicious.pdf");
    const res = await fetch(`${BASE}/api/v1/public/inspect`, { method: "POST", body: form });
    assert(res.status === 422 || res.status === 400, `Expected 422/400, got ${res.status}`);
  });

  // 5. Stripe Webhook Forged HMAC + Expired Replay Attack Blocked (Tenant-Scoped URL)
  await check("Stripe Webhook: Forged signature & expired replay (>5m old) rejected with HTTP 401", async () => {
    const body = JSON.stringify({ type: "invoice.finalized", data: { object: { id: "in_fake" } } });
    const url = `${BASE}/api/webhooks/stripe/org_demo_nordcloud_01`;

    const forged = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "stripe-signature": `t=${Math.floor(Date.now() / 1000)},v1=deadbeef` },
      body,
    });
    assert(forged.status === 401, `Forged Stripe expected 401, got ${forged.status}`);

    const staleTs = Math.floor(Date.now() / 1000) - 3600;
    const staleSig = crypto
      .createHmac("sha256", "whsec_demo_stripe_nordcloud_991")
      .update(`${staleTs}.${body}`)
      .digest("hex");
    const replay = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "stripe-signature": `t=${staleTs},v1=${staleSig}` },
      body,
    });
    assert(replay.status === 401, `Replay Stripe expected 401, got ${replay.status}`);
  });

  // 6. WooCommerce & Paddle Webhook Forged Signatures Blocked
  await check("WooCommerce & Paddle Webhooks: Forged / non-hex signatures rejected cleanly with HTTP 401", async () => {
    const woo = await fetch(`${BASE}/api/webhooks/woocommerce/org_demo_nordcloud_01`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-wc-webhook-signature": "forged_base64==" },
      body: JSON.stringify({ id: 1 }),
    });
    assert(woo.status === 401, `WooCommerce forged expected 401, got ${woo.status}`);

    const paddle = await fetch(`${BASE}/api/webhooks/paddle`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "paddle-signature": `ts=${Math.floor(Date.now() / 1000)};h1=not_even_hex!!!` },
      body: JSON.stringify({ event_type: "subscription.activated" }),
    });
    assert(paddle.status === 401, `Paddle malformed expected 401, got ${paddle.status}`);
  });

  // 7. Strict Unauthenticated & Forged Bearer API Key Rejection
  await check("AuthZ Guard: Anonymous & Forged Bearer rejected with HTTP 401 on /settings, /api-keys, /validate", async () => {
    for (const ep of ["/api/v1/settings", "/api/v1/api-keys"]) {
      const anon = await fetch(`${BASE}${ep}`);
      assert(anon.status === 401, `${ep} anonymous expected 401, got ${anon.status}`);

      const forged = await fetch(`${BASE}${ep}`, { headers: { Authorization: "Bearer ni_live_forged_key" } });
      assert(forged.status === 401, `${ep} forged Bearer expected 401, got ${forged.status}`);
    }
    const v = await fetch(`${BASE}/api/v1/validate`, {
      method: "POST",
      headers: { Authorization: "Bearer ni_live_forged_key", "Content-Type": "application/json" },
      body: "{}",
    });
    assert(v.status === 401, `/api/v1/validate forged Bearer expected 401, got ${v.status}`);
  });

  // 8. Authenticated Secret Masking & Content-Disposition Header Injection Sanitization
  await check("Filename Header Injection Guard: Special chars/quotes stripped in Content-Disposition (authenticated)", async () => {
    const loginRes = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ demo: true }),
    });
    const cookie = (loginRes.headers.get("set-cookie") || "").split(";")[0];

    const integ = await (await fetch(`${BASE}/api/v1/integrations`, { headers: { Cookie: cookie } })).json();
    const woo = integ.integrations.find((i) => i.provider === "woocommerce");
    assert(woo && woo.secretMasked.includes("••••"), "WooCommerce secret was not masked in /api/v1/integrations!");

    const gen = await fetch(`${BASE}/api/v1/invoices`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        invoiceNumber: '../../INV";filename="evil.exe',
        issueDate: "2026-11-20",
        _draft: true,
        buyer: { name: "Buyer GmbH", address: { street: "Str 2", postalCode: "10117", city: "Berlin", countryCode: "DE" } },
        payment: { meansCode: "58", iban: "DE89370400440532013000" },
        lines: [{ id: "1", name: "Service", quantity: 1, unitPrice: 100, vatRate: 19 }],
      }),
    });
    const { invoice } = await gen.json();
    const dl = await fetch(`${BASE}/api/v1/invoices/${invoice.id}/download?artifact=xml`, { headers: { Cookie: cookie } });
    const cd = dl.headers.get("content-disposition") || "";
    assert(!cd.includes("..") && !cd.includes("evil.exe"), `Unsafe Content-Disposition: ${cd}`);

    // Clean up test draft
    await fetch(`${BASE}/api/v1/invoices/${invoice.id}`, { method: "DELETE", headers: { Cookie: cookie } });
  });

  // 9. EU Law Legal Pages Verification (GDPR Art. 13/14, TDDDG § 25, Art. 28 AVV/DPA, § 5 DDG Impressum, Self-Hosted Fonts)
  await check("EU Law Compliance: Privacy (GDPR+TDDDG+Art.77), Art.28 DPA/AVV, §5 DDG Impressum & Zero Google Font CDN leaks", async () => {
    const priv = await (await fetch(`${BASE}/legal/privacy`)).text();
    assert(priv.includes("Art. 13") && priv.includes("TDDDG") && priv.includes("Art. 77") && priv.includes("Hetzner"), "Privacy missing mandatory GDPR/TDDDG clauses");

    const dpa = await fetch(`${BASE}/legal/dpa`);
    assert(dpa.status === 200, `DPA page HTTP ${dpa.status}`);
    const dpaText = await dpa.text();
    assert(dpaText.includes("Art. 28") && dpaText.includes("Art. 32"), "DPA missing Art. 28/32 GDPR clauses");

    const imp = await (await fetch(`${BASE}/legal/impressum`)).text();
    assert(imp.includes("§ 5 DDG") && imp.includes("VSBG"), "Impressum missing § 5 DDG / VSBG clauses");

    const homeHtml = await (await fetch(`${BASE}/`)).text();
    assert(!homeHtml.includes("fonts.googleapis.com") && !homeHtml.includes("fonts.gstatic.com"), "External Google Fonts CDN link detected (GDPR risk)!");
  });

  // 10. WordPress / WooCommerce PHP Plugin Security & HPOS Compatibility Audit
  await check("WooCommerce PHP Plugin v1.1.0: ABSPATH guard, HPOS, HTTPS enforcement, HMAC-SHA256, idempotency flag", async () => {
    const phpPath = path.resolve(process.cwd(), "plugins/woocommerce-norminvoice/norminvoice-eu-einvoicing.php");
    const php = fs.readFileSync(phpPath, "utf8");
    assert(php.includes("if (!defined('ABSPATH'))"), "Missing ABSPATH direct-access guard");
    assert(php.includes("declare_compatibility('custom_order_tables'"), "Missing WooCommerce HPOS compatibility");
    assert(php.includes("current_user_can('manage_woocommerce')"), "Missing capability check in admin page");
    assert(php.includes("strpos($clean, 'https://') !== 0"), "Missing HTTPS webhook enforcement");
    assert(php.includes("hash_hmac('sha256'"), "Missing HMAC-SHA256 webhook signing");
    assert(php.includes("META_SENT_FLAG"), "Missing idempotency duplicate-dispatch guard");
    assert(php.includes("'sslverify' => true"), "Missing TLS sslverify enforcement");
  });

  // 11. WooCommerce Real Webhook Ping + EU Trust Center Availability
  await check("WooCommerce Ping Handshake & EU Trust Center (/trust) return HTTP 200", async () => {
    const ping = await fetch(`${BASE}/api/webhooks/woocommerce`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "x-wc-webhook-topic": "ping" },
      body: "webhook_id=42",
    });
    assert(ping.status === 200, `Woo ping expected 200, got ${ping.status}`);
    const pj = await ping.json();
    assert(pj.pong === true, "Woo ping missing pong=true");

    const trust = await fetch(`${BASE}/trust`);
    assert(trust.status === 200, `/trust HTTP ${trust.status}`);
  });

  console.log(`\n=======================================================`);
  console.log(`Security, EU Law & Plugin Audit: ${passed} PASSED, ${failed} FAILED`);
  console.log(`=======================================================\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
