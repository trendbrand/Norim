import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/components/LocaleProvider";
import { SiteChrome } from "@/components/SiteChrome";
import { PublicFooter } from "@/components/PublicFooter";
import { CookieConsent } from "@/components/CookieConsent";

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
  title: "NormInvoice — Product of Trend&Brand | European E-Invoicing Software",
  description:
    "Create, validate, send, receive, and manage European electronic invoices (EN 16931, ZUGFeRD 2.3, Factur-X 1.07, XRechnung 3.0.2 & Peppol BIS 3.0) in one secure workspace.",
  openGraph: {
    type: "website",
    siteName: "NormInvoice — Product of Trend&Brand",
    title: "NormInvoice — European E-Invoicing & Financial Automation Platform",
    description:
      "Free zero-retention ZUGFeRD, Factur-X & XRechnung dual validator plus complete EU e-invoicing workspace with 15-day free trial.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NormInvoice — Product of Trend&Brand",
    description:
      "Create, validate, send, and manage compliant European e-invoices with a free plan and 15-day free trial.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen flex flex-col font-sans bg-canvas text-navy-900 antialiased">
        <LocaleProvider>
          <SiteChrome footer={<PublicFooter />}>{children}</SiteChrome>
          <CookieConsent />
        </LocaleProvider>
      </body>
    </html>
  );
}
