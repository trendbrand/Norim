export const metadata = {
  title: "GDPR Art. 28 Data Processing Agreement (AVV / DPA) — NormInvoice",
  description:
    "Standard EU GDPR Article 28 Data Processing Agreement (Auftragsverarbeitungsvertrag — AVV) and Technical & Organizational Measures (TOMs Art. 32 GDPR) for NormInvoice B2B customers.",
};

export default function DpaPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          Art. 28 &amp; Art. 32 GDPR (Auftragsverarbeitungsvertrag — AVV)
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
          Data Processing Agreement (AVV / DPA) &amp; TOMs
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          This Agreement forms part of our Terms of Service for all paid NormInvoice B2B workspaces processing European
          electronic invoices containing personal contact data (such as sole-proprietor names, billing emails, and IBANs).
        </p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-700">
          <section>
            <h2 className="text-base font-bold text-slate-900">1. Subject Matter, Duration &amp; Categories of Data</h2>
            <p className="mt-1.5">
              NormInvoice (Processor) processes electronic invoice metadata (buyer/seller names, postal addresses, tax
              numbers, VAT IDs, billing emails, IBANs, and line-item descriptions) strictly on documented instructions of
              the Customer (Controller) to generate, validate, transmit, and archive EN 16931 invoices.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">2. Technical &amp; Organizational Measures (TOMs — Art. 32 GDPR)</h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li><strong>Access &amp; Tenant Isolation:</strong> PostgreSQL 16 Row-Level Security (RLS) bound per transaction to organization UUID, scrypt password hashing, SHA-256 hashed Bearer API keys.</li>
              <li><strong>Encryption in Transit &amp; At Rest:</strong> TLS 1.3 (HSTS preload) on all endpoints; AES-256-GCM envelope encryption for stored Stripe and WooCommerce secrets.</li>
              <li><strong>Sandboxed Document Engine:</strong> Untrusted XML/PDF processing runs inside read-only, zero-internet-egress Docker containers with Ghostscript <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">-dSAFER</code> and XXE/DTD rejection.</li>
              <li><strong>Integrity &amp; Availability (GoBD):</strong> Immutable S3 Object Lock storage in Germany (Hetzner), append-only SHA-256 hash-chained audit logs, and encrypted daily off-host database backups.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">3. Data Breach Notification (Art. 33 GDPR)</h2>
            <p className="mt-1.5">
              In the event of a confirmed personal data breach affecting Customer data, NormInvoice notifies the Customer
              without undue delay and no later than <strong>48 hours</strong> after becoming aware, providing all
              details required for the Controller&apos;s 72-hour supervisory authority notification.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">4. Deletion &amp; Return of Data</h2>
            <p className="mt-1.5">
              Customers may export all XML, PDF/A-3b, DATEV EXTF, French FEC, and GoBD Verfahrensdokumentation files at
              any time. Upon contract termination and expiry of any customer-configured WORM retention lock, all
              remaining personal data is cryptographically erased.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
