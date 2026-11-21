import Link from "next/link";
import { CheckCircle2, Download, Plug, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "WooCommerce ZUGFeRD, Factur-X & XRechnung Plugin — NormInvoice",
  description:
    "Download the official NormInvoice WordPress/WooCommerce plugin to add EU VAT ID & Leitweg-ID checkout fields and generate compliant EN 16931 e-invoices automatically.",
};

export default function WooCommerceIntegrationPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          <Plug className="h-3.5 w-3.5" /> Official WordPress / WooCommerce Plugin v1.0
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          WooCommerce EU E-Invoicing Bridge for ZUGFeRD 2.3, Factur-X &amp; XRechnung
        </h1>
        <p className="mt-3 max-w-2xl text-base text-slate-600">
          Stop fighting slow, bloated WordPress PDF plugins that fail KoSIT and veraPDF checks. Our lightweight PHP bridge adds EU VAT ID &amp; Leitweg-ID fields to checkout and offloads EN 16931 PDF/A-3b generation + GoBD archiving to NormInvoice.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/api/v1/plugins/woocommerce/download"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-brand-700"
          >
            <Download className="h-4 w-4" /> Download WordPress Plugin (.zip)
          </a>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50"
          >
            Test WooCommerce Simulator in Dashboard
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="inline-flex items-center gap-2 text-base font-bold text-slate-900">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" /> What the Plugin Adds to Your Store
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-slate-600">
            <li>
              • Checkout field for <strong>EU VAT ID (USt-IdNr. / N° TVA)</strong> saved to order meta (
              <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">_billing_eu_vat_id</code>).
            </li>
            <li>
              • Optional checkout field for <strong>German B2G Leitweg-ID</strong> (
              <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">_billing_leitweg_id</code>).
            </li>
            <li>
              • HMAC-SHA256 signed webhook dispatched automatically on{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">woocommerce_order_status_completed</code>.
            </li>
            <li>• Zero PHP PDF or Ghostscript overhead on your WordPress server — storefront speed stays untouched.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="inline-flex items-center gap-2 text-base font-bold text-slate-900">
            <ShieldCheck className="h-5 w-5 text-brand-600" /> 3-Step Setup
          </h2>
          <ol className="mt-4 list-decimal space-y-2.5 pl-4 text-sm leading-relaxed text-slate-600">
            <li>
              Download <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">woocommerce-norminvoice-v1.0.0.zip</code> using the button above.
            </li>
            <li>Upload via WordPress Admin → Plugins → Add New → Upload Plugin and activate.</li>
            <li>
              Copy your Webhook Signing Secret from <Link href="/settings" className="font-bold text-brand-600 underline">NormInvoice Settings</Link> into WooCommerce → NormInvoice E-Invoice.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
