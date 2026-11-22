"use client";

import React, { useState } from "react";
import { CheckCircle2, Globe2, Loader2, Network, Search, ShieldCheck } from "lucide-react";
import { EU_COUNTRY_MODULES, resolveComplianceRoute, type CountryComplianceModule } from "@norminvoice/einvoice-core";
import { Alert, Card, PageHeader, apiJson, btnPrimary, inputCls, labelCls } from "@/components/ui";

interface PeppolMatch {
  participantId: string;
  scheme: string;
  name: string;
  countryCode: string;
  supportsBis3Invoice: boolean;
}

export default function ComplianceHubPage() {
  const [selected, setSelected] = useState<CountryComplianceModule>(EU_COUNTRY_MODULES[0]!);
  const [routeSeller, setRouteSeller] = useState("DE");
  const [routeBuyer, setRouteBuyer] = useState("DE");
  const [routeScenario, setRouteScenario] = useState<"B2B" | "B2G" | "B2C">("B2B");
  const resolvedRoute = resolveComplianceRoute({
    sellerCountry: routeSeller,
    buyerCountry: routeBuyer,
    scenario: routeScenario,
  });
  const [peppolQuery, setPeppolQuery] = useState("");
  const [peppolCountry, setPeppolCountry] = useState("BE");
  const [searching, setSearching] = useState(false);
  const [peppolRes, setPeppolRes] = useState<{
    source: string;
    matches: PeppolMatch[];
    note?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function lookupPeppol(e: React.FormEvent) {
    e.preventDefault();
    if (!peppolQuery.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const r = await apiJson<typeof peppolRes>("/api/v1/peppol/lookup", {
        method: "POST",
        body: JSON.stringify({ query: peppolQuery, countryCode: peppolCountry }),
      });
      setPeppolRes(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Peppol lookup failed");
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="13-Market European Compliance Hub & Peppol Network"
        subtitle="One shared EN 16931 engine backed by versioned 13-country rulesets. Unsupported countries are never falsely marked send-ready."
      />

      {/* Transaction-Aware Route Resolver (Master Plan Section 5.3) */}
      <Card
        title="Transaction-Aware Compliance Route Resolver"
        description="Resolves required format, ruleset version, and send-readiness from Seller Country, Buyer Country, and Scenario."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <label className={labelCls}>
            Issuer Country
            <select className={inputCls} value={routeSeller} onChange={(e) => setRouteSeller(e.target.value)}>
              {EU_COUNTRY_MODULES.map((m) => <option key={m.code} value={m.code}>{m.code} — {m.name}</option>)}
            </select>
          </label>
          <label className={labelCls}>
            Buyer Country
            <select className={inputCls} value={routeBuyer} onChange={(e) => setRouteBuyer(e.target.value)}>
              {EU_COUNTRY_MODULES.map((m) => <option key={m.code} value={m.code}>{m.code} — {m.name}</option>)}
            </select>
          </label>
          <label className={labelCls}>
            Transaction Scenario
            <select className={inputCls} value={routeScenario} onChange={(e) => setRouteScenario(e.target.value as any)}>
              <option value="B2B">B2B (Business-to-Business)</option>
              <option value="B2G">B2G (Public Sector / Gov)</option>
              <option value="B2C">B2C (Consumer)</option>
            </select>
          </label>
          <div className="flex flex-col justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs">
            <span className="font-mono font-bold text-brand-700">{resolvedRoute.recommendedProfile}</span>
            <span className={`mt-0.5 text-[11px] font-bold ${resolvedRoute.sendReady ? "text-emerald-700" : "text-amber-700"}`}>
              {resolvedRoute.sendReady ? "✓ Send-Ready (LIVE)" : "⚠ Partner / Roadmap Gate"}
            </span>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-600">{resolvedRoute.explanation}</p>
      </Card>

      {/* Country Selector Pills */}
      <div className="flex flex-wrap gap-2">
        {EU_COUNTRY_MODULES.map((m) => {
          const active = m.code === selected.code;
          return (
            <button
              key={m.code}
              type="button"
              onClick={() => setSelected(m)}
              className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition-colors ${
                active
                  ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-brand-300"
              }`}
            >
              <span className="font-mono">{m.code}</span> {m.name}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  active
                    ? "bg-white/20 text-white"
                    : m.status === "LIVE_CORE"
                      ? "bg-emerald-100 text-emerald-800"
                      : m.status === "PARTNER_ADAPTER"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-600"
                }`}
              >
                {m.status === "LIVE_CORE" ? "Live" : m.status === "PARTNER_ADAPTER" ? "Partner" : "Roadmap"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Country Module Detail */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card
          className="lg:col-span-2"
          title={
            <span className="flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-brand-600" /> {selected.name} ({selected.code}) — {selected.regionLabel}
            </span>
          }
          description={`Active Ruleset: ${selected.rulesetVersion} · Statutory Retention: ${selected.retentionYears} years`}
        >
          <div className="space-y-4 text-xs">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-bold text-slate-900">Regulatory Mandate Timeline</p>
              <p className="mt-1 text-slate-600">{selected.mandateTimeline}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="font-bold uppercase tracking-wide text-slate-500">Supported Formats</p>
                <ul className="mt-2 space-y-1">
                  {selected.supportedFormats.map((f) => (
                    <li key={f} className="flex items-center gap-1.5 text-slate-800">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-bold uppercase tracking-wide text-slate-500">Delivery Network & Exports</p>
                <p className="mt-2 font-semibold text-slate-800">{selected.networkModel}</p>
                <ul className="mt-1.5 space-y-1 text-slate-600">
                  {selected.accountantExports.map((ex) => (
                    <li key={ex}>• {ex}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <p className="font-bold uppercase tracking-wide text-slate-500">Mandatory Country Fields & Business Terms</p>
              <div className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-200">
                {selected.requiredFields.map((rf) => (
                  <div key={rf.bt} className="flex flex-col justify-between gap-1 px-4 py-2.5 sm:flex-row sm:items-center">
                    <div>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-bold text-slate-800">
                        {rf.bt}
                      </span>{" "}
                      <span className="font-semibold text-slate-900">{rf.label}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">{rf.when}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> {selected.notes}
            </p>
          </div>
        </Card>

        {/* Live OpenPeppol Participant Directory Lookup */}
        <Card
          title={
            <span className="flex items-center gap-2">
              <Network className="h-4 w-4 text-brand-600" /> OpenPeppol Participant Lookup
            </span>
          }
          description="Verify if a Belgian, German, Dutch, or EU buyer is registered on the live OpenPeppol four-corner network."
        >
          <form onSubmit={lookupPeppol} className="space-y-3">
            <label className={labelCls}>
              Country Filter
              <select className={inputCls} value={peppolCountry} onChange={(e) => setPeppolCountry(e.target.value)}>
                <option value="BE">Belgium (BE)</option>
                <option value="DE">Germany (DE)</option>
                <option value="NL">Netherlands (NL)</option>
                <option value="FR">France (FR)</option>
                <option value="AT">Austria (AT)</option>
                <option value="">All Peppol Countries</option>
              </select>
            </label>
            <label className={labelCls}>
              Company Name, VAT, or Enterprise ID
              <input
                className={inputCls}
                value={peppolQuery}
                onChange={(e) => setPeppolQuery(e.target.value)}
                placeholder="e.g. BE0202239951 or Siemens"
              />
            </label>
            <button type="submit" disabled={searching} className={`${btnPrimary} w-full`}>
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Search OpenPeppol Directory
            </button>
          </form>

          {error && <div className="mt-3"><Alert kind="error">{error}</Alert></div>}

          {peppolRes && (
            <div className="mt-4 space-y-2 text-xs">
              <p className="font-mono text-[11px] text-slate-500">
                Source: {peppolRes.source} · {peppolRes.matches.length} result(s)
              </p>
              {peppolRes.note && <Alert kind="info">{peppolRes.note}</Alert>}
              {peppolRes.matches.map((m, i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="font-bold text-slate-900">{m.name}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-brand-700">{m.participantId}</p>
                  <p className="mt-1 text-[11px] text-slate-600">
                    {m.countryCode} · {m.supportsBis3Invoice ? "✓ Accepts Peppol BIS 3.0 Invoice" : "Registered"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
