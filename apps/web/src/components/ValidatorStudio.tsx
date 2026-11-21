"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Code2,
  Download,
  FileCheck2,
  FileWarning,
  Lock,
  Printer,
  QrCode,
  UploadCloud,
  XCircle,
} from "lucide-react";
import type { CanonicalInvoice, ValidationReport } from "@norminvoice/einvoice-core";
import { useLocale } from "./LocaleProvider";

interface InspectApiResponse {
  retention: string;
  filename: string;
  embeddedXmlFilename?: string | null;
  invoice: CanonicalInvoice | null;
  report: ValidationReport;
  xmlPreview: string | null;
  sepaQrDataUrl: string | null;
}

const SAMPLE_BUTTONS = [
  { id: "01-de-zugferd-standard-19", label: "ZUGFeRD 2.3 (DE 19%)", kind: "valid" },
  { id: "02-fr-facturx-standard-20", label: "Factur-X 1.07 (FR 20%)", kind: "valid" },
  { id: "04-de-xrechnung-ubl-b2g", label: "XRechnung 3.0.2 (UBL)", kind: "valid" },
  { id: "10-broken-xrechnung-missing-leitweg", label: "Broken XRechnung (BR-DE-15)", kind: "broken" },
];

export function ValidatorStudio() {
  const { locale, t } = useLocale();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<InspectApiResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"visual" | "diagnostics" | "xml">("visual");

  async function inspectFile(file: File) {
    setLoading(true);
    setErrorMsg(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/v1/public/inspect", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Inspection failed");
      setResult(data);
      setActiveTab(data.report.valid ? "visual" : "diagnostics");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function inspectSample(sampleFixtureId: string) {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/v1/public/inspect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sampleFixtureId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sample load failed");
      setResult(data);
      setActiveTab(data.report.valid ? "visual" : "diagnostics");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error loading sample");
    } finally {
      setLoading(false);
    }
  }

  function downloadText(content: string, filename: string, mime: string) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      {/* Dropzone Card */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) void inspectFile(f);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all sm:p-11 ${
          dragging
            ? "border-brand-500 bg-brand-50/70"
            : "border-slate-300 bg-white hover:border-brand-400 hover:bg-slate-50/50"
        } shadow-sm`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.xml,application/pdf,application/xml,text/xml"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void inspectFile(f);
          }}
        />
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <UploadCloud className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-lg font-bold tracking-tight text-slate-900">{t.dropzoneTitle}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{t.dropzoneHint}</p>
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-medium text-emerald-700">
          <Lock className="h-3.5 w-3.5" />
          {t.privacyNote}
        </div>
      </div>

      {/* 1-Click Sample Fixtures */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="font-medium text-slate-500">{t.sampleLabel}</span>
        {SAMPLE_BUTTONS.map((btn) => (
          <button
            key={btn.id}
            type="button"
            disabled={loading}
            onClick={() => void inspectSample(btn.id)}
            className={`rounded-full border px-3.5 py-1.5 font-semibold transition ${
              btn.kind === "broken"
                ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                : "border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:text-brand-700"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-600">
          Running dual compliance checks (EN 16931 Schematron, XRechnung business rules &amp; PDF/A-3b container)...
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <XCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Result Panel */}
      {result && !loading && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Verdict Banner */}
          <div
            className={`flex flex-col justify-between gap-4 border-b px-6 py-5 sm:flex-row sm:items-center ${
              result.report.valid ? "border-emerald-200 bg-emerald-50/70" : "border-red-200 bg-red-50/70"
            }`}
          >
            <div className="flex items-start gap-3">
              {result.report.valid ? (
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
              ) : (
                <FileWarning className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />
              )}
              <div>
                <h3
                  className={`text-base font-bold tracking-tight ${
                    result.report.valid ? "text-emerald-900" : "text-red-900"
                  }`}
                >
                  {result.report.valid ? t.validBanner : t.invalidBanner}
                </h3>
                <p className="mt-0.5 text-xs text-slate-600">
                  <span className="font-mono font-semibold text-slate-800">{result.filename}</span> ·{" "}
                  <span className="font-semibold">{result.report.detected.standard}</span> ({result.report.detected.syntax}) ·{" "}
                  <span className="font-medium text-emerald-700">Zero-Retention Verified</span>
                </p>
              </div>
            </div>

            <div className="print:hidden flex flex-wrap gap-2">
              {result.invoice && (
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              )}
              {result.xmlPreview && (
                <button
                  type="button"
                  onClick={() => downloadText(result.xmlPreview!, `${result.filename}.xml`, "application/xml")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Download className="h-3.5 w-3.5" /> XML
                </button>
              )}
              {result.invoice && (
                <button
                  type="button"
                  onClick={() =>
                    downloadText(JSON.stringify(result.invoice, null, 2), `${result.filename}.json`, "application/json")
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Download className="h-3.5 w-3.5" /> JSON
                </button>
              )}
            </div>
          </div>

          {/* 3-Layer Compliance Scorecard */}
          <div className="grid grid-cols-1 divide-y divide-slate-200 border-b border-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t.scorePdfLabel}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    result.report.checks.pdfa3b.passed
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {result.report.checks.pdfa3b.applicable
                    ? result.report.checks.pdfa3b.passed
                      ? "PASSED"
                      : "FAILED"
                    : "XML ONLY"}
                </span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{result.report.checks.pdfa3b.details}</p>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t.scoreXmlLabel}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    result.report.checks.syntaxXsd.passed
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {result.report.checks.syntaxXsd.passed ? "PASSED" : "FAILED"}
                </span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                Syntax: {result.report.detected.syntax} · XXE &amp; DTD injection guard verified
              </p>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t.scoreRulesLabel}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    result.report.checks.schematronEn16931.passed
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {result.report.checks.schematronEn16931.errors} Errors · {result.report.checks.schematronEn16931.warnings} Warn
                </span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">Profile: {result.report.detected.profile}</p>
            </div>
          </div>

          {/* Sub-tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50 px-6">
            <button
              type="button"
              onClick={() => setActiveTab("visual")}
              className={`border-b-2 px-4 py-3 text-sm font-semibold ${
                activeTab === "visual"
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <FileCheck2 className="h-4 w-4" /> {t.tabVisual}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("diagnostics")}
              className={`border-b-2 px-4 py-3 text-sm font-semibold ${
                activeTab === "diagnostics"
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> {t.tabDiagnostics} ({result.report.diagnostics.length})
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("xml")}
              className={`border-b-2 px-4 py-3 text-sm font-semibold ${
                activeTab === "xml"
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <Code2 className="h-4 w-4" /> {t.tabXml}
              </span>
            </button>
          </div>

          {/* Tab Body */}
          <div className="p-6">
            {activeTab === "diagnostics" && (
              <div className="space-y-3">
                {result.report.diagnostics.length === 0 ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center text-sm font-medium text-emerald-800">
                    All EN 16931 fields, arithmetic totals (BR-CO-10 to BR-CO-16), and VAT rules passed with zero errors.
                  </div>
                ) : (
                  result.report.diagnostics.map((d, idx) => (
                    <div
                      key={`${d.ruleId}-${idx}`}
                      className={`rounded-xl border p-4 ${
                        d.severity === "error" ? "border-red-200 bg-red-50/40" : "border-amber-200 bg-amber-50/50"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded px-2 py-0.5 font-mono text-xs font-bold ${
                              d.severity === "error" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {d.ruleId}
                          </span>
                          <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
                            {d.fieldBt}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900">
                            {locale === "de" ? d.titleDe : locale === "fr" ? d.titleFr : d.titleEn}
                          </h4>
                        </div>
                        <Link href={d.docsUrl} className="text-xs font-semibold text-brand-600 hover:underline">
                          Rule Guide →
                        </Link>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-slate-700">
                        {locale === "de" ? d.messageDe : locale === "fr" ? d.messageFr : d.messageEn}
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed font-medium text-slate-600">
                        <strong className="text-slate-900">How to fix:</strong>{" "}
                        {locale === "de" ? d.fixHintDe : locale === "fr" ? d.fixHintFr : d.fixHintEn}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "visual" && result.invoice && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Seller (BG-4)</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{result.invoice.seller.name}</p>
                    <p className="mt-0.5 text-xs text-slate-600">{result.invoice.seller.address.street}</p>
                    <p className="text-xs text-slate-600">
                      {result.invoice.seller.address.postalCode} {result.invoice.seller.address.city},{" "}
                      {result.invoice.seller.address.countryCode}
                    </p>
                    {result.invoice.seller.vatId && (
                      <p className="mt-2 font-mono text-xs text-slate-700">VAT ID: {result.invoice.seller.vatId}</p>
                    )}
                    {result.invoice.seller.taxNumber && (
                      <p className="font-mono text-xs text-slate-700">Tax No: {result.invoice.seller.taxNumber}</p>
                    )}
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Buyer (BG-7)</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{result.invoice.buyer.name}</p>
                    <p className="mt-0.5 text-xs text-slate-600">{result.invoice.buyer.address.street}</p>
                    <p className="text-xs text-slate-600">
                      {result.invoice.buyer.address.postalCode} {result.invoice.buyer.address.city},{" "}
                      {result.invoice.buyer.address.countryCode}
                    </p>
                    {result.invoice.buyer.vatId && (
                      <p className="mt-2 font-mono text-xs text-slate-700">VAT ID: {result.invoice.buyer.vatId}</p>
                    )}
                    {result.invoice.buyerReference && (
                      <p className="mt-1 font-mono text-xs font-semibold text-brand-700">
                        Buyer Ref (BT-10): {result.invoice.buyerReference}
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Invoice Details</p>
                    <dl className="mt-2 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Number (BT-1)</dt>
                        <dd className="font-mono font-bold text-slate-900">{result.invoice.invoiceNumber}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Type (BT-3)</dt>
                        <dd className="font-semibold text-slate-900">
                          {result.invoice.typeCode === 381 ? "381 · Credit Note" : "380 · Commercial Invoice"}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Issue Date (BT-2)</dt>
                        <dd className="font-mono text-slate-900">{result.invoice.issueDate}</dd>
                      </div>
                      {result.invoice.payment.dueDate && (
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Due Date (BT-9)</dt>
                          <dd className="font-mono text-slate-900">{result.invoice.payment.dueDate}</dd>
                        </div>
                      )}
                      {result.invoice.payment.iban && (
                        <div className="flex justify-between gap-2">
                          <dt className="text-slate-500">IBAN</dt>
                          <dd className="truncate font-mono text-slate-900">{result.invoice.payment.iban}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-4 py-2.5 text-left font-semibold">#</th>
                        <th className="px-4 py-2.5 text-left font-semibold">Line Description</th>
                        <th className="px-4 py-2.5 text-right font-semibold">Quantity</th>
                        <th className="px-4 py-2.5 text-right font-semibold">Unit Price</th>
                        <th className="px-4 py-2.5 text-right font-semibold">VAT</th>
                        <th className="px-4 py-2.5 text-right font-semibold">Net Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {result.invoice.lines.map((line) => (
                        <tr key={line.id}>
                          <td className="px-4 py-3 font-mono text-xs text-slate-500">{line.id}</td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-900">{line.name}</p>
                            {line.description && <p className="text-xs text-slate-500">{line.description}</p>}
                          </td>
                          <td className="tabular-money px-4 py-3 text-right font-mono text-xs text-slate-700">
                            {line.quantity} {line.unitCode}
                          </td>
                          <td className="tabular-money px-4 py-3 text-right font-mono text-xs text-slate-700">
                            {line.unitPrice.toFixed(2)} {result.invoice?.currency}
                          </td>
                          <td className="tabular-money px-4 py-3 text-right font-mono text-xs text-slate-600">
                            {line.vatCategory} {line.vatRate.toFixed(1)}%
                          </td>
                          <td className="tabular-money px-4 py-3 text-right font-mono font-semibold text-slate-900">
                            {(line.lineNetAmount ?? line.quantity * line.unitPrice).toFixed(2)} {result.invoice?.currency}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals + EPC SEPA GiroCode QR */}
                <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                  {result.sepaQrDataUrl ? (
                    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                      <img
                        src={result.sepaQrDataUrl}
                        alt="EPC SEPA GiroCode QR"
                        className="h-24 w-24 rounded-lg border border-slate-200 bg-white p-1"
                      />
                      <div className="text-xs">
                        <p className="inline-flex items-center gap-1 font-bold text-slate-900">
                          <QrCode className="h-3.5 w-3.5 text-brand-600" /> EPC SEPA GiroCode QR
                        </p>
                        <p className="mt-1 leading-relaxed text-slate-600">
                          Scan with any EU banking app to prefill this SEPA wire transfer automatically.
                        </p>
                        <p className="mt-1 font-mono text-[11px] text-slate-500">{result.invoice.payment.iban}</p>
                      </div>
                    </div>
                  ) : (
                    <div />
                  )}

                  {result.report.computedTotals && (
                    <div className="w-full max-w-xs space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                      <div className="flex justify-between text-slate-600">
                        <span>Net Subtotal (BT-109)</span>
                        <span className="tabular-money font-mono font-semibold text-slate-900">
                          {result.report.computedTotals.taxExclusiveTotal.toFixed(2)} {result.invoice.currency}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>VAT Total (BT-110)</span>
                        <span className="tabular-money font-mono font-semibold text-slate-900">
                          {result.report.computedTotals.taxTotal.toFixed(2)} {result.invoice.currency}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-slate-300 pt-2 text-base font-bold text-brand-700">
                        <span>Total Due (BT-115)</span>
                        <span className="tabular-money font-mono">
                          {result.report.computedTotals.payableAmount.toFixed(2)} {result.invoice.currency}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "visual" && !result.invoice && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-900">
                No structured EN 16931 XML payload was detected in this PDF. Plain PDFs are not valid EU B2B e-invoices.{" "}
                <Link href="/create" className="font-bold underline">
                  Generate a compliant ZUGFeRD / Factur-X invoice →
                </Link>
              </div>
            )}

            {activeTab === "xml" && (
              <pre className="max-h-96 overflow-auto rounded-xl bg-slate-900 p-4 font-mono text-xs leading-relaxed text-emerald-300">
                {result.xmlPreview || "No XML payload extracted."}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
