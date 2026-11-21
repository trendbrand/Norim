import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/components/LocaleProvider";
import { SiteChrome } from "@/components/SiteChrome";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://norminvoice.eu"),
  title: "NormInvoice — EU E-Invoice Bridge & Dual Validator (ZUGFeRD, Factur-X & XRechnung)",
  description:
    "Validate and view ZUGFeRD 2.3, Factur-X 1.07 & XRechnung 3.0.2 invoices instantly with zero file retention — or automate Stripe & WooCommerce EU e-invoicing with GoBD archiving and DATEV/FEC export.",
  openGraph: {
    type: "website",
    siteName: "NormInvoice",
    title: "NormInvoice — EU E-Invoice Bridge & Dual Validator",
    description:
      "Free zero-retention ZUGFeRD 2.3, Factur-X 1.07 & XRechnung 3.0.2 dual validator + automated Stripe & WooCommerce EU e-invoicing bridge.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NormInvoice — EU E-Invoice Bridge & Dual Validator",
    description:
      "Validate ZUGFeRD, Factur-X & XRechnung free in RAM, or automate Stripe & WooCommerce EU e-invoicing.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900 antialiased">
        <LocaleProvider>
          <SiteChrome
            footer={
          <footer className="border-t border-slate-200 bg-white py-12 text-sm text-slate-500">
            <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 sm:flex-row sm:items-start sm:px-6 lg:px-8">
              <div className="max-w-lg">
                <p className="text-sm font-semibold tracking-tight text-slate-900">
                  NormInvoice — European E-Invoicing Compliance Infrastructure
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                  Hosted exclusively in Germany (EU-Central). Built for EN 16931, ZUGFeRD 2.3, Factur-X 1.07,
                  XRechnung 3.0.2, Peppol BIS 3.0, and GoBD (BEG IV) archival standards.
                </p>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                  NormInvoice automates technical e-invoice formatting and validation checks and does not replace
                  advice from a certified tax advisor (Steuerberater / Expert-comptable).
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-600">
                <a href="/tools/zugferd-vs-xrechnung" className="hover:text-brand-600">Format Finder</a>
                <a href="/integrations/stripe" className="hover:text-brand-600">Stripe Bridge</a>
                <a href="/integrations/woocommerce" className="hover:text-brand-600">WooCommerce Plugin</a>
                <a href="/docs" className="hover:text-brand-600">API Docs</a>
                <a href="/errors" className="hover:text-brand-600">Error Reference</a>
                <a href="/trust" className="hover:text-brand-600">Trust Center</a>
                <a href="/legal/impressum" className="hover:text-brand-600">Impressum</a>
                <a href="/legal/privacy" className="hover:text-brand-600">Privacy (GDPR)</a>
                <a href="/legal/dpa" className="hover:text-brand-600">DPA / AVV</a>
                <a href="/legal/terms" className="hover:text-brand-600">Terms</a>
              </div>
            </div>
          </footer>
            }
          >
            {children}
          </SiteChrome>
        </LocaleProvider>
      </body>
    </html>
  );
}
