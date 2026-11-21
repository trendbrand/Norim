import Link from "next/link";
import { BookOpen, Code2, Plug, ShieldCheck, Terminal, Webhook } from "lucide-react";

export const metadata = {
  title: "Developer API & Integration Documentation — NormInvoice",
  description:
    "REST API reference, Stripe Webhook Bridge setup, WooCommerce PHP Plugin installation, and EN 16931 dual validation integration guide.",
};

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          <BookOpen className="h-3.5 w-3.5" /> API v1 &amp; Integration Docs
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
          NormInvoice Developer Documentation
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Integrate EN 16931 / ZUGFeRD 2.3 / Factur-X 1.07 / XRechnung 3.0.2 generation &amp; dual validation into any SaaS, Stripe workflow, WooCommerce store, or ERP in under 5 minutes.
        </p>
      </div>

      {/* Endpoint Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h2 className="inline-flex items-center gap-2 text-base font-bold text-slate-900">
            <Terminal className="h-4 w-4 text-brand-600" /> REST API v1 Endpoints
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Method &amp; Endpoint</th>
                <th className="px-5 py-3 text-left font-semibold">Auth</th>
                <th className="px-5 py-3 text-left font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                ["POST /api/v1/validate", "Bearer ni_live_...", "Programmatic Dual Validation (PDF/A-3, XML, or Canonical JSON) returning EN 16931 & BR-DE diagnostics"],
                ["POST /api/v1/invoices", "Bearer / Session", "Generate & archive ZUGFeRD PDF/A-3b, Factur-X, XRechnung CII/UBL, or Peppol BIS 3.0"],
                ["GET /api/v1/invoices/:id/download", "Session / Key", "Stream exact artifact (?artifact=pdf | xml | json) with X-GoBD-SHA256 header"],
                ["POST /api/v1/batch?mode=zip", "Session / Key", "Convert bulk European CSV into a ZIP containing all PDFs, XMLs & DATEV EXTF CSV"],
                ["POST /api/v1/vat/verify", "Session / Key", "Cached EU VIES VAT ID lookup with per-country circuit breaker & PROVISIONAL fallback"],
                ["GET /api/v1/exports/datev?skr=SKR03", "Session / Key", "Download Steuerberater-ready DATEV EXTF v700 Buchungsstapel CSV (SKR03 / SKR04)"],
                ["POST /api/webhooks/stripe", "Stripe-Signature", "Auto-converts invoice.finalized & credit_note.created into self-validated e-invoices"],
                ["POST /api/webhooks/woocommerce", "X-WC-Webhook-Signature", "Receives completed WooCommerce B2B orders via our WordPress PHP Bridge Plugin"],
              ].map(([ep, auth, desc]) => (
                <tr key={ep}>
                  <td className="px-5 py-3 font-mono font-bold text-slate-900">{ep}</td>
                  <td className="px-5 py-3 font-mono text-brand-700">{auth}</td>
                  <td className="px-5 py-3 text-slate-600">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* cURL + TypeScript Examples */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="inline-flex items-center gap-2 text-base font-bold text-slate-900">
            <Code2 className="h-4 w-4 text-brand-600" /> Validate Any ZUGFeRD PDF or XRechnung XML
          </h2>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-900 p-4 font-mono text-xs text-emerald-300">
{`curl -X POST https://norminvoice.eu/api/v1/validate \\
  -H "Authorization: Bearer ni_live_your_api_key" \\
  -F "file=@RE-2026-0101_ZUGFeRD.pdf"`}
          </pre>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="inline-flex items-center gap-2 text-base font-bold text-slate-900">
            <Webhook className="h-4 w-4 text-brand-600" /> Stripe Webhook Setup (2 Minutes)
          </h2>
          <ol className="mt-3 list-decimal space-y-1.5 pl-4 text-xs text-slate-700">
            <li>Open Stripe Dashboard → Developers → Webhooks → Add Endpoint.</li>
            <li>
              URL: <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">https://norminvoice.eu/api/webhooks/stripe</code>
            </li>
            <li>
              Subscribe to <code className="font-mono">invoice.finalized</code> and <code className="font-mono">credit_note.created</code>.
            </li>
            <li>
              Copy the signing secret (<code className="rounded bg-slate-100 px-1 py-0.5 font-mono">whsec_...</code>) into your{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 font-mono">.env</code> or Workspace Settings.
            </li>
          </ol>
        </div>
      </div>

      {/* WooCommerce Plugin Guide */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="inline-flex items-center gap-2 text-base font-bold text-slate-900">
          <Plug className="h-4 w-4 text-brand-600" /> Official WooCommerce PHP Plugin Installation
        </h2>
        <p className="mt-1.5 text-xs text-slate-600">
          Included in this repository at <code className="font-mono">plugins/woocommerce-norminvoice/</code>:
        </p>
        <ol className="mt-3 list-decimal space-y-1.5 pl-4 text-xs text-slate-700">
          <li>Zip the folder <code className="font-mono">plugins/woocommerce-norminvoice/</code> and upload it in WordPress Admin → Plugins → Add New.</li>
          <li>The plugin automatically adds <strong>EU VAT ID (BT-48)</strong> and <strong>Leitweg-ID (BT-10)</strong> fields to WooCommerce Checkout.</li>
          <li>Paste your Webhook URL &amp; Signing Secret from <Link href="/settings" className="font-bold text-brand-600 underline">Settings</Link> into WooCommerce → NormInvoice E-Invoice.</li>
        </ol>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-emerald-700" />
          <div>
            <p className="text-sm font-bold text-emerald-950">Need an API Key right now?</p>
            <p className="text-xs text-emerald-800">Generate a SHA-256 hashed Bearer key in Settings in 1 click.</p>
          </div>
        </div>
        <Link href="/settings" className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800">
          Manage API Keys →
        </Link>
      </div>
    </div>
  );
}
