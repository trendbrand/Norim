"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Download, FileArchive, FileSpreadsheet, ShieldCheck, AlertTriangle } from "lucide-react";
import { Card, PageHeader, apiJson, btnPrimary, btnSecondary, inputCls, labelCls } from "@/components/ui";

interface AuditVerification {
  verified: boolean;
  totalEvents: number;
  brokenAtEventId: number | null;
}

export default function ExportsPage() {
  const year = new Date().getFullYear();
  const [fromDate, setFromDate] = useState(`${year}-01-01`);
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));
  const [skr, setSkr] = useState<"SKR03" | "SKR04">("SKR03");
  const [consultant, setConsultant] = useState("10001");
  const [client, setClient] = useState("20001");
  const [chain, setChain] = useState<AuditVerification | null>(null);

  useEffect(() => {
    void apiJson<{ verification: AuditVerification }>("/api/v1/audit/verify").then((d) => setChain(d.verification));
  }, []);

  const rangeQs = new URLSearchParams();
  if (fromDate) rangeQs.set("from", fromDate);
  if (toDate) rangeQs.set("to", toDate);

  const datevUrl = `/api/v1/exports/datev?skr=${skr}&consultant=${encodeURIComponent(consultant)}&client=${encodeURIComponent(client)}&${rangeQs.toString()}`;
  const fecUrl = `/api/v1/exports/fec?${rangeQs.toString()}`;
  const archiveUrl = `/api/v1/exports/archive-zip?skr=${skr}&${rangeQs.toString()}`;
  const gobdUrl = `/api/v1/exports/verfahrensdokumentation`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accountant Exports & GoBD Audit Center"
        subtitle="Generate tax-advisor-ready German DATEV EXTF, French DGFiP FEC, complete PDF+XML archive bundles, and GoBD procedural documentation."
      />

      {chain && (
        <div
          className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-xs font-semibold ${
            chain.verified
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          <span className="flex items-center gap-2">
            {chain.verified ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <AlertTriangle className="h-5 w-5 text-red-600" />}
            {chain.verified
              ? `GoBD SHA-256 Audit Hash-Chain VERIFIED (${chain.totalEvents} tamper-evident events in your organization)`
              : `Hash-chain mismatch detected at event #${chain.brokenAtEventId}`}
          </span>
          <a href={gobdUrl} className="underline">
            Download Verfahrensdokumentation
          </a>
        </div>
      )}

      <Card title="Export Period & Accounting Parameters" description="All exports below are strictly scoped to your organization and exclude DRAFT invoices.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <label className={labelCls}>
            From Date
            <input type="date" className={inputCls} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </label>
          <label className={labelCls}>
            To Date
            <input type="date" className={inputCls} value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </label>
          <label className={labelCls}>
            German Chart of Accounts
            <select className={inputCls} value={skr} onChange={(e) => setSkr(e.target.value as "SKR03" | "SKR04")}>
              <option value="SKR03">SKR03 (Standard)</option>
              <option value="SKR04">SKR04 (Abschlussgliederung)</option>
            </select>
          </label>
          <label className={labelCls}>
            DATEV Beraternummer
            <input className={`${inputCls} font-mono`} value={consultant} onChange={(e) => setConsultant(e.target.value)} />
          </label>
          <label className={labelCls}>
            DATEV Mandantennummer
            <input className={`${inputCls} font-mono`} value={client} onChange={(e) => setClient(e.target.value)} />
          </label>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card
          title="Complete Accountant Archive (.zip)"
          description="One-click bundle containing all validated Hybrid PDF/A-3 + XML files in the selected period, DATEV EXTF, French FEC, and a SHA-256 GoBD Integrity Manifest."
        >
          <a href={archiveUrl} className={btnPrimary}>
            <FileArchive className="h-4 w-4" /> Download Complete Archive ZIP
          </a>
        </Card>

        <Card
          title="German DATEV EXTF v700 (Buchungsstapel)"
          description="Formula-injection-hardened CSV formatted for direct import into DATEV Unternehmen Online & Kanzlei-Rechnungswesen."
        >
          <a href={datevUrl} className={btnSecondary}>
            <FileSpreadsheet className="h-4 w-4" /> Download DATEV EXTF ({skr})
          </a>
        </Card>

        <Card
          title="French DGFiP FEC (Art. L47 A-I LPF)"
          description="18-column tab-separated Fichier des Écritures Comptables compliant with French tax audit formatting."
        >
          <a href={fecUrl} className={btnSecondary}>
            <Download className="h-4 w-4" /> Download French FEC (.txt)
          </a>
        </Card>

        <Card
          title="GoBD Verfahrensdokumentation (BEG IV)"
          description="Auto-populated technical procedural documentation for German tax audits (§ 147 AO), stamped with your live SHA-256 audit chain head."
        >
          <a href={gobdUrl} className={btnSecondary}>
            <ShieldCheck className="h-4 w-4" /> Download GoBD Dossier (.md)
          </a>
        </Card>
      </div>
    </div>
  );
}
