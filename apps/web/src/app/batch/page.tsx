"use client";

import React, { useState } from "react";
import { CheckCircle2, Download, FileSpreadsheet, PackageCheck, UploadCloud, XCircle } from "lucide-react";

interface PreviewRow {
  rowNumber: number;
  invoiceNumber: string;
  buyerName: string;
  buyerCountry: string;
  profile: string;
  grossAmount: number;
  currency: string;
  valid: boolean;
  errors: string[];
}

export default function BatchConverterPage() {
  const [csvText, setCsvText] = useState("");
  const [preview, setPreview] = useState<{
    totalRows: number;
    validCount: number;
    invalidCount: number;
    rows: PreviewRow[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadSampleCsv() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/batch");
      const data = await res.json();
      setCsvText(data.sampleCsv);
      await runPreview(data.sampleCsv);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sample");
    } finally {
      setLoading(false);
    }
  }

  async function runPreview(text: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/batch?mode=preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "CSV parse error");
      setPreview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Preview failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(file: File) {
    const text = await file.text();
    setCsvText(text);
    await runPreview(text);
  }

  async function downloadZipBundle() {
    if (!csvText.trim()) return;
    setExporting(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/batch?mode=zip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "ZIP generation failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `NormInvoice_EU_Batch_${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ZIP export error");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            <FileSpreadsheet className="h-3.5 w-3.5" /> Bulk E-Invoicing Engine
          </span>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            CSV Batch E-Invoice Converter & DATEV ZIP Bundler
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Upload your monthly Excel or CSV export (comma or European semicolon format with decimal commas) → validate
            every row against EN 16931 → download all ZUGFeRD PDF/A-3 + XRechnung XML files + DATEV EXTF CSV in one ZIP.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void loadSampleCsv()}
            className="rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-700"
          >
            Load 4-Row EU Sample CSV
          </button>
          <a
            href="/api/v1/batch?sample=true"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50"
          >
            <Download className="h-4 w-4" /> Download Template CSV
          </a>
        </div>
      </div>

      {/* Upload / Paste Area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 text-center hover:border-brand-400">
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFileUpload(f);
            }}
          />
          <UploadCloud className="h-8 w-8 text-brand-600" />
          <p className="mt-3 text-sm font-bold text-slate-900">Upload .CSV File</p>
          <p className="mt-1 text-xs text-slate-500">
            Supports semicolon (<code className="font-mono">;</code>) or comma (<code className="font-mono">,</code>)
            delimiters &amp; European decimal commas (<code className="font-mono">149,50</code>)
          </p>
        </label>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">Raw CSV Input</span>
            <button
              type="button"
              disabled={!csvText.trim() || loading}
              onClick={() => void runPreview(csvText)}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? "Validating..." : "Validate Rows"}
            </button>
          </div>
          <textarea
            rows={6}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="Paste European CSV rows here or click 'Load 4-Row EU Sample CSV' above..."
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-800"
          />
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {/* Validation Preview Table & 1-Click ZIP Export */}
      {preview && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="font-bold text-slate-900">Batch Validation Preview ({preview.totalRows} rows)</span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                {preview.validCount} Valid
              </span>
              {preview.invalidCount > 0 && (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                  {preview.invalidCount} Halted (Skipped in ZIP, sent to Repair Queue)
                </span>
              )}
            </div>

            <button
              type="button"
              disabled={exporting || preview.validCount === 0}
              onClick={() => void downloadZipBundle()}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
            >
              <PackageCheck className="h-4 w-4" />
              {exporting
                ? "Building PDF/A-3 + XML + DATEV ZIP..."
                : `Download ${preview.validCount} E-Invoices + DATEV (.zip)`}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Row</th>
                  <th className="px-4 py-3 text-left font-semibold">Invoice</th>
                  <th className="px-4 py-3 text-left font-semibold">Buyer</th>
                  <th className="px-4 py-3 text-left font-semibold">Profile</th>
                  <th className="px-4 py-3 text-right font-semibold">Gross</th>
                  <th className="px-4 py-3 text-left font-semibold">EN 16931 Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {preview.rows.map((r) => (
                  <tr key={r.rowNumber}>
                    <td className="px-4 py-3 font-mono text-slate-500">#{r.rowNumber}</td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{r.invoiceNumber}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {r.buyerName} ({r.buyerCountry})
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">{r.profile}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                      {r.grossAmount.toFixed(2)} {r.currency}
                    </td>
                    <td className="px-4 py-3">
                      {r.valid ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 font-bold text-emerald-800">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Ready for ZIP
                        </span>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 font-bold text-red-800">
                            <XCircle className="h-3.5 w-3.5" /> Failed
                          </span>
                          <p className="text-[11px] text-red-700">{r.errors.join(" · ")}</p>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
