/**
 * NormInvoice — Production Multi-Tenant E2E Launch Pre-Flight Suite
 * Exercises:
 *  1. Health, SEO (/sitemap.xml, /robots.txt), and all Public pages (200)
 *  2. STRICT Page Auth Gate: anonymous requests to all workspace routes -> 307 /login?next=...
 *  3. STRICT API Auth Gate: anonymous requests to all /api/v1/* private routes -> 401
 *  4. Public Zero-Retention Validator (valid, broken BR-DE-15, XXE block)
 *  5. Multi-Tenant Isolation Penetration Test (fresh User A vs User B -> 0 leakage, 404 cross-tenant)
 *  6. Full Enterprise SaaS Lifecycle: Onboarding -> Customers CRM -> Sequential Invoice & PDF/A-3
 *     Round-Trip -> 1-Click Credit Note (381) -> GoBD Immutability -> Settings + MOD-97 IBAN Check ->
 *     Team RBAC -> API Key Lifecycle -> Batch CSV ZIP -> DATEV / FEC / Archive ZIP / GoBD Dossier ->
 *     GoBD SHA-256 Hash-Chain Verify -> GDPR Art. 20 Export -> GDPR Art. 17 Erasure!
 *
 * Usage: node scripts/launch-preflight.mjs [http://localhost:3000]
 */

const BASE = (process.argv[2] || "http://localhost:3000").replace(/\/+$/, "");

let passed = 0;
let failed = 0;

async function check(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  [PASS] ${name}`);
  } catch (err) {
    failed++;
    console.error(`  [FAIL] ${name} -> ${err instanceof Error ? err.message : String(err)}`);
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function registerUser(tag) {
  const email = `e2e_${tag}_${Date.now()}_${Math.floor(Math.random() * 9999)}@example-eu.de`;
  const password = "TestPassword2026!";
  const res = await fetch(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      fullName: `Founder ${tag}`,
      orgName: `${tag} GmbH`,
      countryCode: "DE",
    }),
  });
  assert(res.status === 200, `Register ${tag} HTTP ${res.status}`);
  const setCookie = res.headers.get("set-cookie") || "";
  assert(setCookie.includes("norminvoice_session="), `Missing session cookie for ${tag}`);
  const cookie = setCookie.split(";")[0];
  const data = await res.json();
  return { email, password, cookie, user: data.user };
}

async function run() {
  console.log(`\nNormInvoice Production Launch Pre-Flight E2E Suite -> ${BASE}\n`);

  // 1. Health & SEO Discovery
  await check("GET /api/health & SEO (/sitemap.xml, /robots.txt)", async () => {
    const res = await fetch(`${BASE}/api/health`);
    assert(res.status === 200, `health HTTP ${res.status}`);
    const j = await res.json();
    assert(j.status === "ok" && j.standards.includes("EN 16931"), "Invalid health payload");

    const sm = await fetch(`${BASE}/sitemap.xml`);
    assert(sm.status === 200 && (await sm.text()).includes("/errors/BR-DE-15"), "Invalid sitemap");
    const rb = await fetch(`${BASE}/robots.txt`);
    assert(rb.status === 200 && (await rb.text()).includes("Sitemap:"), "Invalid robots.txt");
  });

  // 2. Public Pages Return HTTP 200 (Complete 37-Page Website + 13 Country Pages + Preserved Legacy Routes)
  const publicRoutes = [
    "/",
    "/about",
    "/contact",
    "/features",
    "/pricing",
    "/integrations",
    "/integrations/stripe",
    "/integrations/woocommerce",
    "/countries",
    "/countries/germany",
    "/countries/belgium",
    "/countries/france",
    "/countries/poland",
    "/countries/italy",
    "/countries/spain",
    "/countries/romania",
    "/countries/croatia",
    "/countries/greece",
    "/countries/netherlands",
    "/countries/austria",
    "/countries/portugal",
    "/countries/united-kingdom",
    "/solutions/small-business",
    "/solutions/finance-teams",
    "/solutions/accountants",
    "/security",
    "/trust",
    "/help",
    "/faq",
    "/partners",
    "/docs",
    "/errors",
    "/errors/BR-DE-15",
    "/errors/BR-FR-05",
    "/tools/zugferd-vs-xrechnung",
    "/login",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/legal-notice",
    "/terms",
    "/subscription-billing",
    "/billing-policy",
    "/cancellation-refunds",
    "/refund-policy",
    "/privacy",
    "/cookies",
    "/dpa",
    "/subprocessors",
    "/acceptable-use",
    "/service-availability",
    "/data-retention",
    "/ai-transparency",
    "/ai-disclosure",
    "/accessibility",
    "/third-party-services",
    "/complaints",
    "/intellectual-property",
    "/legal/impressum",
    "/legal/privacy",
    "/legal/dpa",
    "/legal/terms",
  ];
  await check(`All ${publicRoutes.length} public, country & legal pages return HTTP 200 (zero 404s)`, async () => {
    for (const r of publicRoutes) {
      const res = await fetch(`${BASE}${r}`, { redirect: "manual" });
      assert(res.status === 200, `Public route ${r} returned HTTP ${res.status}`);
    }
  });

  // 3. STRICT Auth Page Gate (Anonymous -> 307 Redirect to /login?next=...)
  const protectedPages = [
    "/dashboard",
    "/invoices",
    "/invoices/new",
    "/inbox",
    "/compliance",
    "/payments",
    "/accountant",
    "/recurring",
    "/automations",
    "/reports",
    "/customers",
    "/catalog",
    "/batch",
    "/exports",
    "/settings",
    "/onboarding",
    "/create",
    "/admin",
  ];
  await check(`STRICT Page Gate: All ${protectedPages.length} workspace routes redirect anonymous users to /login?next=...`, async () => {
    for (const r of protectedPages) {
      const res = await fetch(`${BASE}${r}`, { redirect: "manual" });
      assert(res.status === 307 || res.status === 302, `${r} expected 307 redirect, got ${res.status}`);
      const loc = res.headers.get("location") || "";
      assert(loc.includes("/login") && loc.includes("next="), `${r} bad redirect location: ${loc}`);
    }
  });

  // 4. STRICT API Auth Gate (Anonymous -> HTTP 401 Unauthorized)
  const protectedApis = [
    ["GET", "/api/v1/invoices"],
    ["GET", "/api/v1/customers"],
    ["GET", "/api/v1/settings"],
    ["GET", "/api/v1/team"],
    ["GET", "/api/v1/integrations"],
    ["GET", "/api/v1/api-keys"],
    ["GET", "/api/v1/billing/checkout"],
    ["GET", "/api/v1/exports/datev"],
    ["GET", "/api/v1/exports/fec"],
    ["GET", "/api/v1/exports/archive-zip"],
    ["GET", "/api/v1/audit/verify"],
    ["GET", "/api/v1/inbox"],
    ["GET", "/api/v1/catalog"],
    ["GET", "/api/v1/recurring"],
    ["GET", "/api/v1/automations"],
    ["GET", "/api/v1/reports"],
    ["GET", "/api/v1/payments"],
    ["GET", "/api/v1/accountant/delegations"],
    ["GET", "/api/v1/search?q=test"],
    ["GET", "/api/v1/dashboard"],
    ["GET", "/api/v1/admin/overview"],
    ["POST", "/api/v1/validate"],
  ];
  await check(`STRICT API Gate: All ${protectedApis.length} private /api/v1/* endpoints return HTTP 401 when anonymous`, async () => {
    for (const [method, ep] of protectedApis) {
      const res = await fetch(`${BASE}${ep}`, {
        method,
        headers: method === "POST" ? { "Content-Type": "application/json" } : undefined,
        body: method === "POST" ? "{}" : undefined,
      });
      assert(res.status === 401, `${method} ${ep} expected 401, got ${res.status}`);
    }
  });

  // 5. Public Zero-Retention Validator (Valid, Broken BR-DE-15, XXE Block)
  await check("Public Validator: ZUGFeRD 2.3 DE valid + SEPA QR, BR-DE-15 detection, XXE HTTP 400", async () => {
    const okRes = await fetch(`${BASE}/api/v1/public/inspect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sampleFixtureId: "01-de-zugferd-standard-19" }),
    });
    const okJson = await okRes.json();
    assert(okRes.status === 200 && okJson.report.valid && okJson.sepaQrDataUrl?.startsWith("data:image/png;base64,"), "Valid fixture failed");

    const badRes = await fetch(`${BASE}/api/v1/public/inspect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sampleFixtureId: "10-broken-xrechnung-missing-leitweg" }),
    });
    const badJson = await badRes.json();
    assert(badJson.report.valid === false && badJson.report.diagnostics.some((d) => d.ruleId === "BR-DE-15"), "BR-DE-15 missing");

    const xxeRes = await fetch(`${BASE}/api/v1/public/inspect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawXml: `<?xml version="1.0"?><!DOCTYPE x [<!ENTITY a "b">]><Invoice>&a;</Invoice>` }),
    });
    assert(xxeRes.status === 400, `XXE expected 400, got ${xxeRes.status}`);
  });

  // 6. Multi-Tenant Isolation Penetration Test (Fresh User A vs Fresh User B)
  const userA = await registerUser("TenantA");
  const userB = await registerUser("TenantB");
  let invoiceAId = "";
  let customerAId = "";

  await check("Multi-Tenant Isolation: Fresh User A & B start 100% empty (zero Demo Org leakage)", async () => {
    for (const u of [userA, userB]) {
      const invRes = await fetch(`${BASE}/api/v1/invoices`, { headers: { Cookie: u.cookie } });
      const invJson = await invRes.json();
      assert(invRes.status === 200 && invJson.invoices.length === 0, `${u.email} leaked ${invJson.invoices.length} invoices!`);

      const custRes = await fetch(`${BASE}/api/v1/customers`, { headers: { Cookie: u.cookie } });
      const custJson = await custRes.json();
      assert(custRes.status === 200 && custJson.customers.length === 0, `${u.email} leaked ${custJson.customers.length} customers!`);
    }
  });

  await check("Onboarding + MOD-97 IBAN Guard + Customer CRM + Sequential Invoice + PDF/A-3 Round-Trip (Tenant A)", async () => {
    // Reject bad IBAN checksum
    const badIban = await fetch(`${BASE}/api/v1/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: userA.cookie },
      body: JSON.stringify({ iban: "DE00000000000000000000" }),
    });
    assert(badIban.status === 400, `Bad IBAN expected 400, got ${badIban.status}`);

    // Complete onboarding with valid IBAN
    const onb = await fetch(`${BASE}/api/v1/account/onboarding`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userA.cookie },
      body: JSON.stringify({
        legalName: "TenantA GmbH",
        countryCode: "DE",
        street: "Friedrichstraße 10",
        postalCode: "10117",
        city: "Berlin",
        vatId: "DE298765432",
        contactName: "Founder TenantA",
        contactPhone: "+49 30 901820",
        contactEmail: userA.email,
        iban: "DE89370400440532013000",
        bic: "COBADEFFXXX",
        invoicePrefix: "TA-2026-",
        creditNotePrefix: "GS-2026-",
        nextInvoiceSeq: 1,
        defaultFormat: "ZUGFERD_EN16931",
      }),
    });
    assert(onb.status === 200, `Onboarding HTTP ${onb.status}`);

    // Upgrade Tenant A to Business in sandbox so multi-step E2E stays within quota
    const upg = await fetch(`${BASE}/api/v1/billing/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userA.cookie },
      body: JSON.stringify({ planTier: "business" }),
    });
    assert(upg.status === 200, `Plan upgrade HTTP ${upg.status}`);

    // Create Customer A
    const cRes = await fetch(`${BASE}/api/v1/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userA.cookie },
      body: JSON.stringify({
        legalName: "Bayern Robotics GmbH",
        vatId: "DE198765431",
        electronicAddress: "rechnungen@bayern-robotics.de",
        street: "Leopoldstraße 20",
        postalCode: "80802",
        city: "München",
        countryCode: "DE",
      }),
    });
    assert(cRes.status === 201, `Create customer HTTP ${cRes.status}`);
    customerAId = (await cRes.json()).customer.id;

    // Issue sequential invoice (AUTO number -> TA-2026-0001)
    const genRes = await fetch(`${BASE}/api/v1/invoices`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userA.cookie },
      body: JSON.stringify({
        invoiceNumber: "AUTO",
        issueDate: "2026-11-20",
        typeCode: 380,
        currency: "EUR",
        locale: "de",
        profile: "ZUGFERD_EN16931",
        _customerId: customerAId,
        buyer: {
          name: "Bayern Robotics GmbH",
          vatId: "DE198765431",
          electronicAddress: "rechnungen@bayern-robotics.de",
          address: { street: "Leopoldstraße 20", postalCode: "80802", city: "München", countryCode: "DE" },
        },
        payment: { meansCode: "58", iban: "DE89370400440532013000", dueDate: "2026-12-04" },
        lines: [{ id: "1", name: "Cloud License", quantity: 2, unitCode: "MON", unitPrice: 149.5, vatCategory: "S", vatRate: 19 }],
      }),
    });
    assert(genRes.status === 200, `Generate invoice HTTP ${genRes.status}`);
    const genJson = await genRes.json();
    assert(genJson.invoice.invoiceNumber === "TA-2026-0001", `Expected TA-2026-0001, got ${genJson.invoice.invoiceNumber}`);
    assert(genJson.validation.valid && Boolean(genJson.artifacts.pdfBase64), "Invoice failed validation or missing PDF");
    invoiceAId = genJson.invoice.id;

    // Round-trip PDF/A-3b into public validator
    const pdfBuf = Buffer.from(genJson.artifacts.pdfBase64, "base64");
    const fd = new FormData();
    fd.append("file", new Blob([pdfBuf], { type: "application/pdf" }), "TA-2026-0001.pdf");
    const ins = await fetch(`${BASE}/api/v1/public/inspect`, { method: "POST", body: fd });
    const insJson = await ins.json();
    assert(ins.status === 200 && insJson.report.valid && insJson.report.checks.pdfa3b.passed, "PDF/A-3b round-trip failed");
  });

  await check("Cross-Tenant Penetration Test: User B gets 404 on User A's invoice, download, email & customer", async () => {
    const r1 = await fetch(`${BASE}/api/v1/invoices/${invoiceAId}`, { headers: { Cookie: userB.cookie } });
    assert(r1.status === 404, `Cross-tenant GET invoice expected 404, got ${r1.status}`);

    const r2 = await fetch(`${BASE}/api/v1/invoices/${invoiceAId}/download?artifact=xml`, { headers: { Cookie: userB.cookie } });
    assert(r2.status === 404, `Cross-tenant download expected 404, got ${r2.status}`);

    const r3 = await fetch(`${BASE}/api/v1/customers/${customerAId}`, { headers: { Cookie: userB.cookie } });
    assert(r3.status === 404, `Cross-tenant customer expected 404, got ${r3.status}`);
  });

  // 7. 1-Click Credit Note (381), GoBD Immutability Guard, Email Dispatch, Team RBAC, API Keys, Exports, GDPR
  await check("GoBD Immutability (409 on finalized delete) + 1-Click Credit Note (381) + Email Dispatch", async () => {
    const delFinal = await fetch(`${BASE}/api/v1/invoices/${invoiceAId}`, {
      method: "DELETE",
      headers: { Cookie: userA.cookie },
    });
    assert(delFinal.status === 409, `Expected 409 GoBD block on finalized delete, got ${delFinal.status}`);

    const cnRes = await fetch(`${BASE}/api/v1/invoices/${invoiceAId}/credit-note`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userA.cookie },
      body: JSON.stringify({ reason: "Test Storno" }),
    });
    assert(cnRes.status === 201, `Credit note HTTP ${cnRes.status}`);
    const cn = (await cnRes.json()).creditNote;
    assert(cn.typeCode === 381 && cn.precedingInvoiceNumber === "TA-2026-0001", "Invalid credit note link");

    const sendRes = await fetch(`${BASE}/api/v1/invoices/${invoiceAId}/send`, {
      method: "POST",
      headers: { Cookie: userA.cookie },
    });
    assert(sendRes.status === 200 && (await sendRes.json()).delivered === true, "Email send failed");

    const paidRes = await fetch(`${BASE}/api/v1/invoices/${invoiceAId}/paid`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userA.cookie },
      body: JSON.stringify({ paymentStatus: "PAID" }),
    });
    const paidJson = await paidRes.json();
    assert(paidRes.status === 200 && paidJson.invoice.paymentStatus === "PAID", "Mark paid failed");
  });

  await check("Phase 6: Super-Admin RBAC (403 normal tenant, 200 superadmin), Products Catalog & Incoming E-Invoice Inbox", async () => {
    // Normal tenant MUST be forbidden (403) from /api/v1/admin/overview
    const forb = await fetch(`${BASE}/api/v1/admin/overview`, { headers: { Cookie: userA.cookie } });
    assert(forb.status === 403, `Normal tenant expected 403 on admin overview, got ${forb.status}`);

    // Super-admin (founder@nordcloud-gmbh.de) gets 200 with KPIs
    const saLogin = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ demo: true }),
    });
    const saCookie = (saLogin.headers.get("set-cookie") || "").split(";")[0];
    const saOverview = await fetch(`${BASE}/api/v1/admin/overview`, { headers: { Cookie: saCookie } });
    const saJson = await saOverview.json();
    assert(saOverview.status === 200 && saJson.kpis.totalOrganizations >= 3, "Super-Admin overview failed");

    // Products Catalog CRUD for Tenant A (invisible to Tenant B)
    const prodRes = await fetch(`${BASE}/api/v1/catalog`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userA.cookie },
      body: JSON.stringify({ sku: "DEV-HR", name: "Senior Dev Hour", unitCode: "HUR", unitPrice: 135, vatCategory: "S", vatRate: 19 }),
    });
    assert(prodRes.status === 201, `Catalog POST HTTP ${prodRes.status}`);
    const bCat = await (await fetch(`${BASE}/api/v1/catalog`, { headers: { Cookie: userB.cookie } })).json();
    assert(bCat.products.length === 0, "Catalog leaked across tenants!");

    // Incoming E-Invoice Inbox: download XML of Invoice A and upload into Tenant B's Incoming Inbox!
    const xmlText = await (await fetch(`${BASE}/api/v1/invoices/${invoiceAId}/download?artifact=xml`, { headers: { Cookie: userA.cookie } })).text();
    const inboxRes = await fetch(`${BASE}/api/v1/inbox`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userB.cookie },
      body: JSON.stringify({ rawXml: xmlText, filename: "TA-2026-0001.xml" }),
    });
    assert(inboxRes.status === 201, `Inbox POST HTTP ${inboxRes.status}`);
    const inboxJson = await inboxRes.json();
    assert(inboxJson.incoming.validationPassed === true && inboxJson.incoming.invoiceNumber === "TA-2026-0001", "Incoming archive mismatch");

    const markInPaid = await fetch(`${BASE}/api/v1/inbox/${inboxJson.incoming.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: userB.cookie },
      body: JSON.stringify({ paymentStatus: "PAID", approvalStatus: "APPROVED" }),
    });
    const inPaidJson = await markInPaid.json();
    assert(markInPaid.status === 200 && inPaidJson.incoming.paymentStatus === "PAID" && inPaidJson.incoming.approvalStatus === "APPROVED", "Incoming approve/pay failed");

    // Duplicate detection test: upload same XML a second time -> isDuplicate === true
    const dupRes = await fetch(`${BASE}/api/v1/inbox`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userB.cookie },
      body: JSON.stringify({ rawXml: xmlText, filename: "TA-2026-0001-dup.xml" }),
    });
    const dupJson = await dupRes.json();
    assert(dupRes.status === 201 && dupJson.incoming.isDuplicate === true, "Duplicate incoming detection failed!");
  });

  await check("Phase 7: Recurring Billing (Run Now), Automations Toggle, Live Financial/VAT Reports & Universal Search", async () => {
    const recRes = await fetch(`${BASE}/api/v1/recurring`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userA.cookie },
      body: JSON.stringify({
        title: "Monthly Cloud Retainer",
        customerId: customerAId,
        frequency: "MONTHLY",
        nextRunDate: "2026-12-01",
        lineName: "Managed E-Invoicing Retainer",
        quantity: 1,
        unitCode: "MON",
        unitPrice: 199,
        vatCategory: "S",
        vatRate: 19,
      }),
    });
    assert(recRes.status === 201, `Recurring POST HTTP ${recRes.status}`);
    const { schedule } = await recRes.json();

    const runRes = await fetch(`${BASE}/api/v1/recurring/${schedule.id}`, {
      method: "POST",
      headers: { Cookie: userA.cookie },
    });
    const runJson = await runRes.json();
    assert(runRes.status === 201 && runJson.invoice.invoiceNumber.startsWith("TA-2026-"), "Recurring run-now failed");

    const autoList = await (await fetch(`${BASE}/api/v1/automations`, { headers: { Cookie: userA.cookie } })).json();
    assert(autoList.rules.length >= 4, "Default automations missing");
    const tog = await fetch(`${BASE}/api/v1/automations`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: userA.cookie },
      body: JSON.stringify({ id: autoList.rules[0].id, enabled: false }),
    });
    assert(tog.status === 200 && (await tog.json()).rule.enabled === false, "Automation toggle failed");

    const rep = await (await fetch(`${BASE}/api/v1/reports`, { headers: { Cookie: userA.cookie } })).json();
    assert(rep.kpis.outgoingCount >= 3 && rep.vatSummary.length >= 1, "Reports analytics incomplete");

    const srch = await (await fetch(`${BASE}/api/v1/search?q=TA-2026`, { headers: { Cookie: userA.cookie } })).json();
    assert(srch.invoices.length >= 1, "Universal search did not return Tenant A invoice");
  });

  await check("Phase 8: Partial Payments, Team Comments, Outgoing Approval, Accountant Delegation & Grounded Copilot", async () => {
    // Record partial payment on recurring invoice (runJson isn't in scope here; query Tenant A invoices)
    const invList = await (await fetch(`${BASE}/api/v1/invoices`, { headers: { Cookie: userA.cookie } })).json();
    const targetInv = invList.invoices.find((i) => i.typeCode === 380 && i.paymentStatus !== "PAID") || invList.invoices[0];
    const payRes = await fetch(`${BASE}/api/v1/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userA.cookie },
      body: JSON.stringify({ invoiceId: targetInv.id, amount: 50, method: "SEPA_TRANSFER", reference: "SEPA-PARTIAL-1" }),
    });
    assert(payRes.status === 201, `Partial payment HTTP ${payRes.status}`);

    // Outgoing approval + team comment
    const appRes = await fetch(`${BASE}/api/v1/invoices/${targetInv.id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userA.cookie },
      body: JSON.stringify({ approvalStatus: "APPROVED" }),
    });
    assert(appRes.status === 200 && (await appRes.json()).invoice.approvalStatus === "APPROVED", "Outgoing approval failed");

    const cmtRes = await fetch(`${BASE}/api/v1/invoices/${targetInv.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userA.cookie },
      body: JSON.stringify({ body: "Reviewed VAT rate and approved for DATEV." }),
    });
    assert(cmtRes.status === 201, `Comment POST HTTP ${cmtRes.status}`);

    // Accountant delegation: Tenant A delegates to Tenant B's email -> Tenant B sees Tenant A in delegatedToMe -> revoke!
    const delGrant = await fetch(`${BASE}/api/v1/accountant/delegations`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userA.cookie },
      body: JSON.stringify({ accountantEmail: userB.email, accountantName: "Kanzlei B", scope: "READ_EXPORT", expiresDays: 30 }),
    });
    assert(delGrant.status === 201, `Delegation grant HTTP ${delGrant.status}`);
    const { delegation } = await delGrant.json();

    const bView = await (await fetch(`${BASE}/api/v1/accountant/delegations`, { headers: { Cookie: userB.cookie } })).json();
    assert(bView.delegatedToMe.some((c) => c.orgName === "TenantA GmbH"), "Delegated client missing from accountant view");

    const delRev = await fetch(`${BASE}/api/v1/accountant/delegations?id=${encodeURIComponent(delegation.id)}`, {
      method: "DELETE",
      headers: { Cookie: userA.cookie },
    });
    assert(delRev.status === 200, "Delegation revoke failed");

    // Grounded Compliance Copilot
    const cop = await fetch(`${BASE}/api/v1/copilot`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userA.cookie },
      body: JSON.stringify({ question: "Why did BR-DE-15 fail?" }),
    });
    const copJson = await cop.json();
    assert(cop.status === 200 && copJson.grounded === true && copJson.answer.includes("BR-DE-15"), "Copilot BR-DE-15 check failed");
  });

  await check("Phase 9: Real 15-Day DB Trial + $39 Solo + Cancel Renewal + Dashboard Analytics + Contact Form + Password Reset", async () => {
    // 1. Fresh userB started automatically on real DB 15-day Free Trial
    const meB = await (await fetch(`${BASE}/api/auth/me`, { headers: { Cookie: userB.cookie } })).json();
    assert(
      meB.subscription.planTier === "trial" &&
        meB.subscription.trialActive === true &&
        meB.subscription.trialDaysRemaining >= 14 &&
        meB.subscription.trialDaysRemaining <= 15 &&
        Boolean(meB.subscription.trialEndsAt),
      `Expected active 15-day DB trial for User B, got ${JSON.stringify(meB.subscription)}`
    );

    // 2. Upgrade User B to $39 Solo plan and cancel renewal (audited)
    const soloRes = await fetch(`${BASE}/api/v1/billing/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userB.cookie },
      body: JSON.stringify({ planTier: "solo" }),
    });
    const soloJson = await soloRes.json();
    assert(soloRes.status === 200 && soloJson.activePlan.planTier === "solo" && soloJson.activePlan.monthlyQuota === 150, "Solo $39 upgrade failed");

    const cancelRes = await fetch(`${BASE}/api/v1/billing/checkout`, {
      method: "DELETE",
      headers: { Cookie: userB.cookie },
    });
    const cancelJson = await cancelRes.json();
    assert(cancelRes.status === 200 && cancelJson.activePlan.cancelAtPeriodEnd === true, "Cancel renewal failed");

    // 3. Real Dashboard Analytics snapshot for Tenant A (trendSeries + statusBreakdown + getStarted + notifications)
    const dash = await (await fetch(`${BASE}/api/v1/dashboard?days=30`, { headers: { Cookie: userA.cookie } })).json();
    assert(
      dash.kpis.totalInvoices >= 3 &&
        Array.isArray(dash.trendSeries) &&
        dash.trendSeries.length === 8 &&
        dash.statusBreakdown.total === dash.kpis.totalInvoices &&
        Array.isArray(dash.getStarted) &&
        dash.getStarted.length === 4,
      "Dashboard snapshot analytics invalid"
    );

    // 4. Real Contact Form persistence + anti-spam honeypot rejection
    const spamRes = await fetch(`${BASE}/api/v1/public/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Spam Bot",
        email: "bot@spam.example",
        message: "This should be blocked by the honeypot field.",
        website: "https://spam.example",
      }),
    });
    assert(spamRes.status === 400, `Honeypot expected 400, got ${spamRes.status}`);

    const contactRes = await fetch(`${BASE}/api/v1/public/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Elena Bauer",
        email: "elena.bauer@example-eu.de",
        company: "Bauer Logistics GmbH",
        country: "Germany",
        topic: "sales",
        message: "Evaluating NormInvoice Solo and Business plans for our German and Belgian B2B billing.",
      }),
    });
    const contactJson = await contactRes.json();
    assert(contactRes.status === 201 && contactJson.submitted === true && contactJson.inquiryId?.startsWith("inq_"), "Contact form persistence failed");

    // 5. Forgot Password returns non-enumerating 200 for unknown email
    const fpRes = await fetch(`${BASE}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "nobody-here-999@example-eu.de" }),
    });
    assert(fpRes.status === 200 && (await fpRes.json()).accepted === true, "Forgot password failed");
  });

  await check("API Key Lifecycle (Create -> Bearer Validate 200 -> Revoke -> 401) & Team RBAC Invite", async () => {
    const kRes = await fetch(`${BASE}/api/v1/api-keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userA.cookie },
      body: JSON.stringify({ name: "TenantA CI Key" }),
    });
    const { key, plaintextKey } = await kRes.json();
    assert(plaintextKey.startsWith("ni_live_"), "Invalid key prefix");

    const vRes = await fetch(`${BASE}/api/v1/validate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${plaintextKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        invoiceNumber: "API-1",
        issueDate: "2026-11-20",
        seller: { name: "A", vatId: "DE298765432", address: { street: "S", postalCode: "10117", city: "Berlin", countryCode: "DE" } },
        buyer: { name: "B", address: { street: "S", postalCode: "10117", city: "Berlin", countryCode: "DE" } },
        payment: { meansCode: "58", iban: "DE89370400440532013000" },
        lines: [{ id: "1", name: "Item", quantity: 1, unitPrice: 100, vatRate: 19 }],
      }),
    });
    assert(vRes.status === 200, `Bearer validate HTTP ${vRes.status}`);

    await fetch(`${BASE}/api/v1/api-keys?id=${encodeURIComponent(key.id)}`, { method: "DELETE", headers: { Cookie: userA.cookie } });
    const revRes = await fetch(`${BASE}/api/v1/validate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${plaintextKey}`, "Content-Type": "application/json" },
      body: "{}",
    });
    assert(revRes.status === 401, `Revoked key expected 401, got ${revRes.status}`);

    const teamRes = await fetch(`${BASE}/api/v1/team`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userA.cookie },
      body: JSON.stringify({ email: `berater_${Date.now()}@kanzlei.de`, fullName: "Dr. Meier", role: "accountant" }),
    });
    assert(teamRes.status === 201, `Team invite HTTP ${teamRes.status}`);
  });

  await check("Batch CSV ZIP + DATEV + FEC + Archive ZIP + GoBD Hash-Chain Verify + GDPR Art. 20 & Art. 17 Cleanup", async () => {
    const sampleJson = await (await fetch(`${BASE}/api/v1/batch`, { headers: { Cookie: userA.cookie } })).json();
    const zipRes = await fetch(`${BASE}/api/v1/batch?mode=zip`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userA.cookie },
      body: JSON.stringify({ csvText: sampleJson.sampleCsv }),
    });
    const zipBytes = new Uint8Array(await zipRes.arrayBuffer());
    assert(zipRes.status === 200 && zipBytes[0] === 0x50 && zipBytes[1] === 0x4b, "Invalid Batch ZIP");

    const datev = await fetch(`${BASE}/api/v1/exports/datev?skr=SKR03`, { headers: { Cookie: userA.cookie } });
    assert(datev.status === 200 && (await datev.text()).includes('"EXTF";700'), "Invalid DATEV");

    const fec = await fetch(`${BASE}/api/v1/exports/fec`, { headers: { Cookie: userA.cookie } });
    assert(fec.status === 200 && (await fec.text()).includes("JournalCode\tJournalLib"), "Invalid FEC");

    const arch = await fetch(`${BASE}/api/v1/exports/archive-zip`, { headers: { Cookie: userA.cookie } });
    const archBytes = new Uint8Array(await arch.arrayBuffer());
    assert(arch.status === 200 && archBytes[0] === 0x50 && archBytes[1] === 0x4b, "Invalid Archive ZIP");

    const aud = await (await fetch(`${BASE}/api/v1/audit/verify`, { headers: { Cookie: userA.cookie } })).json();
    assert(aud.verification.verified === true && aud.verification.totalEvents > 0, "GoBD hash-chain verification failed!");

    const gdpr = await fetch(`${BASE}/api/v1/account/gdpr-export`, { headers: { Cookie: userA.cookie } });
    const gdprJson = await gdpr.json();
    assert(gdpr.status === 200 && gdprJson.invoices.length >= 2, "GDPR Art. 20 export invalid");

    // Clean up both test tenants using GDPR Art. 17 permanent erasure!
    for (const u of [userA, userB]) {
      const del = await fetch(`${BASE}/api/v1/account/delete?confirm=DELETE_MY_WORKSPACE`, {
        method: "DELETE",
        headers: { Cookie: u.cookie },
      });
      assert(del.status === 200, `GDPR Art. 17 cleanup failed for ${u.email}`);
    }
  });

  console.log(`\n================================================`);
  console.log(`Launch Pre-Flight Complete: ${passed} PASSED, ${failed} FAILED`);
  console.log(`================================================\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
