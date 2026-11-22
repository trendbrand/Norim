import Link from "next/link";
import { ArrowRight, Code2, FileSpreadsheet, Globe2, ShoppingCart, Webhook } from "lucide-react";

export const metadata = {
  title: "Integrations | NormInvoice — Stripe, WooCommerce, DATEV, FEC & API",
  description:
    "Connect NormInvoice to Stripe, WooCommerce, DATEV EXTF, French FEC, REST APIs, and configured European e-invoicing exchange networks.",
};

const INTEGRATIONS = [
  {
    name: "Stripe E-Invoice Bridge",
    category: "Payments & Billing",
    status: "Available",
    auth: "Tenant-scoped HMAC-SHA256 webhook + 5-min replay protection",
    desc: "Convert finalized Stripe invoices and credit notes into validated ZUGFeRD / Factur-X / XRechnung files with BT-114 rounding reconciliation.",
    href: "/integrations/stripe",
    icon: Webhook,
  },
  {
    name: "WooCommerce WordPress Plugin (v1.1.0)",
    category: "E-Commerce",
    status: "Available",
    auth: "HMAC-SHA256 signed webhook, HPOS-compatible, TLS verified",
    desc: "Automatically issue EN 16931 B2B e-invoices from completed WooCommerce orders with idempotency protection.",
    href: "/integrations/woocommerce",
    icon: ShoppingCart,
  },
  {
    name: "DATEV EXTF v700 & French DGFiP FEC",
    category: "Accounting Exports",
    status: "Available",
    auth: "Workspace RBAC / Delegated Accountant Portal",
    desc: "Export SKR03/SKR04 DATEV booking batches, French FEC ledgers, ZIP archives, and GoBD procedural dossiers.",
    href: "/features",
    icon: FileSpreadsheet,
  },
  {
    name: "REST API & @norminvoice/sdk",
    category: "Developers & ERP",
    status: "Available",
    auth: "SHA-256 hashed Bearer API keys with granular scopes",
    desc: "Validate XML/PDF, generate EN 16931 invoices, manage customers, and download exports programmatically.",
    href: "/docs",
    icon: Code2,
  },
  {
    name: "Peppol Access Points & National Gateways",
    category: "Delivery Networks",
    status: "Partner-Operated / Phased",
    auth: "External authorized provider credentials per tenant",
    desc: "Connect Belgian/Nordic Peppol BIS 3.0, French approved platforms (PDP), Polish KSeF, and Italian SdI through independent authorized providers.",
    href: "/countries",
    icon: Globe2,
  },
];

export default function IntegrationsPage() {
  return (
    <div className="bg-canvas py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
        <section className="rounded-2xl bg-navy-900 p-8 text-white sm:p-12">
          <span className="rounded-full bg-navy-800 px-3 py-1 text-xs font-bold text-accent-400">
            Connector Directory
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Connect Invoicing to the Tools You Already Use
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-navy-100">
            Every integration displays its real operational status, authentication mechanism, and scope — with zero
            silent financial actions.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {INTEGRATIONS.map((item) => {
            const Icon = item.icon;
            const live = item.status === "Available";
            return (
              <div key={item.name} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-accent-500">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-bold ${
                        live ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-accent-600">{item.category}</p>
                  <h2 className="mt-1 text-lg font-extrabold text-navy-900">{item.name}</h2>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{item.desc}</p>
                  <p className="mt-3 rounded-lg bg-canvas px-3 py-2 text-[11px] text-slate-600">
                    <strong className="text-navy-900">Auth &amp; Security:</strong> {item.auth}
                  </p>
                </div>
                <Link
                  href={item.href}
                  className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-accent-700 hover:underline"
                >
                  Inspect Integration Details <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-extrabold text-navy-900">Need an ERP or country-gateway connector?</h2>
            <p className="mt-1 text-xs text-slate-600">
              Tell us which ERP, accounting system, or Peppol provider your business relies on.
            </p>
          </div>
          <Link
            href="/contact?topic=partners"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-accent-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-accent-600"
          >
            Request an Integration <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
