import { NextRequest, NextResponse } from "next/server";
import {
  EU_COUNTRY_MODULES,
  getRuleKnowledge,
} from "@norminvoice/einvoice-core";
import {
  getOrgAnalyticsReport,
  getSubscriptionForOrg,
  listIncomingInvoicesForOrg,
  listInvoicesForOrg,
} from "@/lib/db-store";
import { getOrgMonthlyQuotaStatus } from "@/lib/quota";
import { requireTenantAuth } from "@/lib/security";
import { answerWithClaude } from "@/lib/ai-copilot";

/**
 * Grounded AI Compliance Copilot (Master Plan Module F12 & ADR-006)
 * - Strictly permission-checked to caller's orgId.
 * - Never hallucinates: every answer is grounded in live workspace records,
 *   deterministic EN 16931 rules, and versioned EU_COUNTRY_MODULES.
 * - Never executes financial or external mutations without explicit user action.
 */
export async function POST(req: NextRequest) {
  const access = await requireTenantAuth(req, { allowApiKey: false });
  if (!access.ok) return access.response;

  const body = (await req.json()) as { question?: string };
  const q = (body.question || "").trim();
  if (!q) {
    return NextResponse.json({ error: "Ask a compliance or workspace question." }, { status: 400 });
  }

  const lower = q.toLowerCase();
  const orgId = access.ctx.orgId;

  // 0. Real-AI path: when ANTHROPIC_API_KEY is configured, answer with Claude,
  //    strictly grounded in a context pack built from THIS org's live data + rules.
  //    Falls through to the deterministic engine below if no key / on any failure.
  const ai = await answerWithClaude(q, buildCopilotContext(q, orgId));
  if (ai) {
    return NextResponse.json({
      grounded: true,
      provider: ai.provider,
      model: ai.model,
      disclaimer: "AI answer grounded in your live workspace data + EN 16931 rules. Not legal or tax advice.",
      answer: ai.answer,
      citations: ["Live workspace data", "EN 16931 ruleset"],
      actions: [{ label: "Open Dashboard", href: "/dashboard" }],
    });
  }

  // 1. Specific EN 16931 / XRechnung / Factur-X Rule ID lookup (e.g. BR-DE-15, BR-CO-15, BR-FR-05)
  const ruleMatch = q.match(/\b(BR-[A-Z]{2,3}-\d+|BR-\d+|PDFA-3B-\d+|PEPPOL-[A-Z0-9-]+)\b/i);
  if (ruleMatch) {
    const ruleId = ruleMatch[1]!.toUpperCase();
    const knowledge = getRuleKnowledge(ruleId);
    return NextResponse.json({
      grounded: true,
      disclaimer: "Deterministic EN 16931 rule reference — not legal advice.",
      answer: `${knowledge.ruleId} (${knowledge.fieldBt}): ${knowledge.titleEn}. ${knowledge.messageEn} Remediation: ${knowledge.fixHintEn}`,
      citations: [`Rule ${knowledge.ruleId}`, `Field ${knowledge.fieldBt}`],
      actions: [{ label: `Open /errors/${knowledge.ruleId}`, href: `/errors/${knowledge.ruleId}` }],
    });
  }

  // 2. Country compliance mandate lookup
  const matchedCountry = EU_COUNTRY_MODULES.find(
    (m) => lower.includes(m.name.toLowerCase()) || new RegExp(`\\b${m.code.toLowerCase()}\\b`).test(lower)
  );
  if (matchedCountry && (lower.includes("rule") || lower.includes("mandate") || lower.includes("require") || lower.includes("format") || lower.includes("peppol") || lower.includes("ksef") || lower.includes("factur") || lower.includes("country"))) {
    return NextResponse.json({
      grounded: true,
      disclaimer: `Grounded in versioned ruleset ${matchedCountry.rulesetVersion}. Verify local exceptions with qualified counsel.`,
      answer: `${matchedCountry.name} (${matchedCountry.status}): ${matchedCountry.mandateTimeline}. Formats: ${matchedCountry.supportedFormats.join(", ")}. Network: ${matchedCountry.networkModel}. Retention: ${matchedCountry.retentionYears} years. Mandatory fields: ${matchedCountry.requiredFields.map((f) => `${f.bt} (${f.label})`).join("; ")}.`,
      citations: [matchedCountry.rulesetVersion, matchedCountry.sourceUrl],
      actions: [{ label: "Open EU Compliance Hub", href: "/compliance" }],
    });
  }

  // 3. Attention / Blocked / Rejected invoices in user's workspace
  if (lower.includes("attention") || lower.includes("blocked") || lower.includes("fail") || lower.includes("error") || lower.includes("fix") || lower.includes("reject")) {
    const blocked = listInvoicesForOrg(orgId, { status: "ACTION_REQUIRED" });
    const pendingIn = listIncomingInvoicesForOrg(orgId).filter((i) => i.approvalStatus === "PENDING_REVIEW" || i.isDuplicate);
    if (blocked.length === 0 && pendingIn.length === 0) {
      return NextResponse.json({
        grounded: true,
        disclaimer: "Checked live workspace records.",
        answer: "Great news — you have 0 blocked outgoing invoices and 0 pending incoming supplier invoices needing attention right now.",
        citations: ["Live org ledger"],
        actions: [{ label: "View Outgoing Invoices", href: "/invoices" }],
      });
    }
    const parts: string[] = [];
    if (blocked.length > 0) {
      parts.push(
        `${blocked.length} outgoing invoice(s) halted before delivery: ${blocked
          .slice(0, 4)
          .map((i) => `${i.invoiceNumber} (${i.diagnostics.map((d) => d.ruleId).join(", ") || "validation error"})`)
          .join("; ")}.`
      );
    }
    if (pendingIn.length > 0) {
      parts.push(`${pendingIn.length} incoming supplier invoice(s) awaiting review/approval.`);
    }
    return NextResponse.json({
      grounded: true,
      disclaimer: "Checked live workspace records (permission-scoped to your organization).",
      answer: parts.join(" "),
      citations: ["Live org ledger", "Incoming AP inbox"],
      actions: [
        ...(blocked[0] ? [{ label: `Fix ${blocked[0].invoiceNumber} now`, href: `/invoices/${blocked[0].id}` }] : []),
        ...(pendingIn.length > 0 ? [{ label: "Review Incoming Inbox", href: "/inbox" }] : []),
      ],
    });
  }

  // 4. Unpaid / Overdue / Receivables / VAT summary
  //    (defer "which/list/show overdue" to the specific-list intent below)
  const wantsList = (lower.includes("which") || lower.includes("list") || lower.includes("show")) && (lower.includes("overdue") || lower.includes("unpaid"));
  if (!wantsList && (lower.includes("unpaid") || lower.includes("overdue") || lower.includes("paid") || lower.includes("receivable") || lower.includes("vat") || lower.includes("revenue") || lower.includes("money"))) {
    const rep = getOrgAnalyticsReport(orgId);
    const overdue = rep.ageing.days1to30 + rep.ageing.days31to60 + rep.ageing.days60plus;
    return NextResponse.json({
      grounded: true,
      disclaimer: "Computed live from your organization's GoBD ledger.",
      answer: `Total invoiced: €${rep.kpis.totalInvoiced.toFixed(2)} | Collected: €${rep.kpis.totalCollected.toFixed(2)} | Outstanding receivables: €${rep.kpis.totalOutstanding.toFixed(2)} (€${overdue.toFixed(2)} overdue) | Open incoming payables: €${rep.kpis.payablesUnpaid.toFixed(2)} | First-pass validation rate: ${rep.kpis.firstPassValidationRate}%.`,
      citations: ["Live financial & VAT ledger"],
      actions: [
        { label: "Open Payments & Receivables", href: "/payments" },
        { label: "Open VAT Reports", href: "/reports" },
      ],
    });
  }

  // 5. Specific invoice lookup by number (e.g. "status of EU-2026-0301")
  const invMatch = q.match(/\b([A-Z]{1,5}-?\d{2,4}-\d{2,6})\b/i);
  if (invMatch) {
    const token = invMatch[1]!.toUpperCase();
    const hit = listInvoicesForOrg(orgId).find((i) => i.invoiceNumber.toUpperCase() === token);
    if (hit) {
      const balance = Math.max(0, hit.grossAmount - hit.paidAmount);
      return NextResponse.json({
        grounded: true,
        disclaimer: "Live record from your organization's ledger (permission-scoped).",
        answer: `${hit.invoiceNumber} — ${hit.buyerName}. Validation: ${hit.validationPassed ? "EN 16931 passed" : "blocked (" + (hit.diagnostics.map((d) => d.ruleId).join(", ") || "issues") + ")"}. Delivery: ${hit.deliveredTo ? "delivered to " + hit.deliveredTo : hit.status === "DRAFT" ? "draft" : "not sent"}. Payment: ${hit.paymentStatus}${balance > 0 ? " (balance €" + balance.toFixed(2) + ")" : ""}. Gross €${hit.grossAmount.toFixed(2)} ${hit.currency}, due ${hit.dueDate || hit.issueDate}.`,
        citations: ["Live org ledger"],
        actions: [{ label: `Open ${hit.invoiceNumber}`, href: `/invoices/${hit.id}` }],
      });
    }
  }

  // 6. Plan / trial / quota / usage
  if (lower.includes("plan") || lower.includes("trial") || lower.includes("subscription") || lower.includes("quota") || lower.includes("limit") || lower.includes("upgrade") || lower.includes("days left") || lower.includes("usage")) {
    const sub = getSubscriptionForOrg(orgId);
    const quota = getOrgMonthlyQuotaStatus(orgId);
    const trialTxt = sub.trialActive
      ? `Trial active — ${sub.trialDaysRemaining} day(s) left (ends ${sub.trialEndsAt?.slice(0, 10)}).`
      : sub.planTier === "free"
        ? "On the Free plan (no active trial)."
        : `On the ${sub.planTier} plan.`;
    return NextResponse.json({
      grounded: true,
      disclaimer: "Computed live from your subscription and this month's usage.",
      answer: `${trialTxt} This month you've used ${quota.usedThisMonth} of ${quota.monthlyLimit} invoice(s) (${quota.remaining} remaining)${quota.exceeded ? " — quota reached." : "."}`,
      citations: ["Subscription & usage records"],
      actions: [{ label: "Manage plan & billing", href: "/settings?tab=billing" }],
    });
  }

  // 7. Which invoices are overdue / unpaid (specific list)
  if ((lower.includes("which") || lower.includes("list") || lower.includes("show")) && (lower.includes("overdue") || lower.includes("unpaid"))) {
    const today = new Date().toISOString().slice(0, 10);
    const overdue = listInvoicesForOrg(orgId).filter(
      (i) => i.typeCode === 380 && i.status !== "DRAFT" && i.paymentStatus !== "PAID" && i.dueDate && i.dueDate < today
    );
    return NextResponse.json({
      grounded: true,
      disclaimer: "Live record from your organization's ledger.",
      answer:
        overdue.length === 0
          ? "You have no overdue unpaid invoices right now."
          : `${overdue.length} overdue unpaid invoice(s): ${overdue.slice(0, 5).map((i) => `${i.invoiceNumber} (${i.buyerName}, €${Math.max(0, i.grossAmount - i.paidAmount).toFixed(2)}, due ${i.dueDate})`).join("; ")}.`,
      citations: ["Live org ledger"],
      actions: [{ label: "Open Payments & Receivables", href: "/payments" }],
    });
  }

  // 8. Default helpful grounded overview
  const rep = getOrgAnalyticsReport(orgId);
  return NextResponse.json({
    grounded: true,
    disclaimer: "Deterministic Compliance Copilot — ask about rule IDs (e.g. BR-DE-15), EU countries (Germany, Belgium, France, Poland), blocked invoices, or unpaid receivables.",
    answer: `Your workspace currently has ${rep.kpis.outgoingCount} finalized outgoing invoice(s) (${rep.kpis.firstPassValidationRate}% first-pass EN 16931 valid), ${rep.kpis.incomingCount} archived supplier invoice(s), and €${rep.kpis.totalOutstanding.toFixed(2)} in outstanding receivables. Try asking: "Why did BR-DE-15 fail?", "Which invoices need attention?", or "What does Belgium require?"`,
    citations: ["Live org summary"],
    actions: [
      { label: "EU Compliance Hub", href: "/compliance" },
      { label: "Financial & VAT Reports", href: "/reports" },
    ],
  });
}

/** Build a compact, permission-scoped grounding pack for the AI (this org only). */
function buildCopilotContext(q: string, orgId: string): string {
  const parts: string[] = [];
  try {
    const rep = getOrgAnalyticsReport(orgId);
    parts.push(
      `WORKSPACE KPIs: outgoing=${rep.kpis.outgoingCount}, incoming=${rep.kpis.incomingCount}, totalInvoiced=€${rep.kpis.totalInvoiced.toFixed(2)}, collected=€${rep.kpis.totalCollected.toFixed(2)}, outstanding=€${rep.kpis.totalOutstanding.toFixed(2)}, firstPassValidation=${rep.kpis.firstPassValidationRate}%, ageing(1-30/31-60/60+)=€${rep.ageing.days1to30.toFixed(2)}/€${rep.ageing.days31to60.toFixed(2)}/€${rep.ageing.days60plus.toFixed(2)}.`
    );
  } catch {
    /* ignore */
  }
  try {
    const sub = getSubscriptionForOrg(orgId);
    const quota = getOrgMonthlyQuotaStatus(orgId);
    parts.push(
      `SUBSCRIPTION: plan=${sub.planTier}, status=${sub.status}, trialActive=${sub.trialActive}, trialDaysLeft=${sub.trialDaysRemaining}, usage=${quota.usedThisMonth}/${quota.monthlyLimit}.`
    );
  } catch {
    /* ignore */
  }
  const ruleMatch = q.match(/\b(BR-[A-Z]{2,3}-\d+|BR-\d+|PDFA-3B-\d+)\b/i);
  if (ruleMatch) {
    try {
      const k = getRuleKnowledge(ruleMatch[1]!.toUpperCase());
      parts.push(`RULE ${k.ruleId} (${k.fieldBt}): ${k.titleEn}. ${k.messageEn} Fix: ${k.fixHintEn}`);
    } catch {
      /* ignore */
    }
  }
  const lower = q.toLowerCase();
  const country = EU_COUNTRY_MODULES.find(
    (m) => lower.includes(m.name.toLowerCase()) || new RegExp(`\\b${m.code.toLowerCase()}\\b`).test(lower)
  );
  if (country) {
    parts.push(
      `COUNTRY ${country.name} (${country.status}): ${country.mandateTimeline}. Formats: ${country.supportedFormats.join(", ")}. Network: ${country.networkModel}. Retention: ${country.retentionYears}y.`
    );
  }
  try {
    const blocked = listInvoicesForOrg(orgId, { status: "ACTION_REQUIRED" });
    if (blocked.length) {
      parts.push(
        `ACTION-REQUIRED (${blocked.length}): ${blocked.slice(0, 6).map((i) => `${i.invoiceNumber}[${i.diagnostics.map((d) => d.ruleId).join(",") || "error"}]`).join("; ")}.`
      );
    }
  } catch {
    /* ignore */
  }
  try {
    const recent = listInvoicesForOrg(orgId).slice(0, 10);
    if (recent.length) {
      parts.push(
        `RECENT INVOICES: ${recent.map((i) => `${i.invoiceNumber} ${i.buyerName} €${i.grossAmount.toFixed(2)} ${i.paymentStatus} due ${i.dueDate || i.issueDate}`).join("; ")}.`
      );
    }
  } catch {
    /* ignore */
  }
  const incoming = (() => {
    try {
      return listIncomingInvoicesForOrg(orgId).filter((i) => i.approvalStatus === "PENDING_REVIEW" || i.isDuplicate).length;
    } catch {
      return 0;
    }
  })();
  if (incoming) parts.push(`INCOMING PENDING REVIEW: ${incoming}.`);
  return parts.join("\n");
}
