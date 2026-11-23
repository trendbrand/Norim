import { NextRequest, NextResponse } from "next/server";
import { getOrgAnalyticsReport } from "@/lib/db-store";
import { requireTenantAuth } from "@/lib/security";

function csvCell(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function row(cells: Array<string | number>): string {
  return cells.map(csvCell).join(",");
}

/**
 * Download the live analytics report as CSV (multi-section, spreadsheet-ready
 * for a Steuerberater) or JSON. Tenant-scoped to the caller's org.
 */
export async function GET(req: NextRequest) {
  const access = await requireTenantAuth(req);
  if (!access.ok) return access.response;

  const report = getOrgAnalyticsReport(access.ctx.orgId);
  const format = new URL(req.url).searchParams.get("format") || "csv";
  const date = report.generatedAt.slice(0, 10);

  if (format === "json") {
    return new NextResponse(JSON.stringify(report, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="norminvoice-report-${date}.json"`,
      },
    });
  }

  const k = report.kpis;
  const lines: string[] = [];
  lines.push(row(["NormInvoice Analytics Report", report.generatedAt]));
  lines.push("");
  lines.push("KPIs");
  lines.push(row(["Metric", "Value"]));
  lines.push(row(["Total invoiced (valid)", k.totalInvoiced]));
  lines.push(row(["Collected (paid)", k.totalCollected]));
  lines.push(row(["Outstanding receivables", k.totalOutstanding]));
  lines.push(row(["First-pass validation rate %", k.firstPassValidationRate]));
  lines.push(row(["Delivery rate %", k.deliveryRate]));
  lines.push(row(["Finalized outgoing count", k.outgoingCount]));
  lines.push(row(["Incoming archived count", k.incomingCount]));
  lines.push(row(["Payables unpaid", k.payablesUnpaid]));
  lines.push(row(["Payables pending approval", k.payablesPendingApproval]));
  lines.push("");
  lines.push("Receivables ageing");
  lines.push(row(["Bucket", "Amount"]));
  lines.push(row(["Current / not due", report.ageing.current]));
  lines.push(row(["1-30 days overdue", report.ageing.days1to30]));
  lines.push(row(["31-60 days overdue", report.ageing.days31to60]));
  lines.push(row(["60+ days overdue", report.ageing.days60plus]));
  lines.push("");
  lines.push("VAT summary (UStVA / accountant overview)");
  lines.push(row(["EN 16931 category", "Rate %", "Net base (BT-116)", "VAT amount (BT-117)"]));
  for (const v of report.vatSummary) {
    lines.push(row([v.category, v.rate, v.netTotal, v.taxTotal]));
  }
  lines.push("");
  lines.push("Revenue by buyer country");
  lines.push(row(["Country", "Invoices", "Gross total"]));
  for (const c of report.byCountry) {
    lines.push(row([c.country, c.count, c.grossTotal]));
  }

  return new NextResponse(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="norminvoice-report-${date}.csv"`,
    },
  });
}
