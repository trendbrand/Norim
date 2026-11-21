import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <span className="rounded-full bg-brand-50 px-3 py-1 font-mono text-xs font-bold text-brand-700">404</span>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">Page Not Found</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        The e-invoicing tool or error rule you requested could not be located. Return to our free Zero-Retention
        ZUGFeRD / Factur-X / XRechnung Validator or browse the EN 16931 Error Guide.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700">
          Open Validator
        </Link>
        <Link
          href="/errors"
          className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50"
        >
          EN 16931 Error Guide
        </Link>
      </div>
    </div>
  );
}
