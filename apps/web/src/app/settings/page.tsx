"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  Copy,
  CreditCard,
  Download,
  KeyRound,
  Landmark,
  Loader2,
  Lock,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  Webhook,
} from "lucide-react";
import {
  Alert,
  Card,
  PageHeader,
  apiJson,
  btnDanger,
  btnPrimary,
  btnSecondary,
  inputCls,
  labelCls,
} from "@/components/ui";
import { useAppSession } from "@/components/AppShell";
import { validateIbanClient } from "@/lib/iban";

type TabId = "company" | "invoicing" | "integrations" | "team" | "api-keys" | "billing" | "security";

const TABS: Array<{ id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "company", label: "Company & Tax", icon: Building2 },
  { id: "invoicing", label: "Invoicing & Banking", icon: Landmark },
  { id: "integrations", label: "Integrations", icon: Webhook },
  { id: "team", label: "Team & RBAC", icon: Users },
  { id: "api-keys", label: "API Keys", icon: KeyRound },
  { id: "billing", label: "Billing & Quota", icon: CreditCard },
  { id: "security", label: "Security & GDPR", icon: ShieldCheck },
];

function SettingsInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { reload } = useAppSession();
  const initialTab = (params.get("tab") as TabId) || "company";
  const [tab, setTab] = useState<TabId>(TABS.some((t) => t.id === initialTab) ? initialTab : "company");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  // Settings (Company + Invoicing + Banking + Accountant CC)
  const [s, setS] = useState<Record<string, any> | null>(null);
  const [viesNote, setViesNote] = useState<string | null>(null);
  const [viesLoading, setViesLoading] = useState(false);

  // Integrations
  const [webhookUrls, setWebhookUrls] = useState<{ stripe: string; woocommerce: string }>({ stripe: "", woocommerce: "" });
  const [integrations, setIntegrations] = useState<Array<any>>([]);
  const [webhookLogs, setWebhookLogs] = useState<Array<any>>([]);
  const [stripeSecretInput, setStripeSecretInput] = useState("");
  const [wooSecretInput, setWooSecretInput] = useState("");
  const [rotatedSecret, setRotatedSecret] = useState<{ provider: string; secret: string } | null>(null);

  // Team
  const [members, setMembers] = useState<Array<any>>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<"owner" | "admin" | "accountant" | "member">("accountant");

  // API Keys
  const [apiKeys, setApiKeys] = useState<Array<any>>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>(["validate", "generate", "exports:read"]);
  const [createdKeyPlaintext, setCreatedKeyPlaintext] = useState<string | null>(null);

  // Billing
  const [billing, setBilling] = useState<any>(null);

  // Security & Audit
  const [auditEvents, setAuditEvents] = useState<Array<any>>([]);
  const [chainCheck, setChainCheck] = useState<{ verified: boolean; totalEvents: number; brokenAtEventId: number | null } | null>(null);
  const [currPw, setCurrPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [st, integ, tm, keys, bill, aud] = await Promise.all([
        apiJson<any>("/api/v1/settings"),
        apiJson<any>("/api/v1/integrations"),
        apiJson<any>("/api/v1/team"),
        apiJson<any>("/api/v1/api-keys"),
        apiJson<any>("/api/v1/billing/checkout"),
        apiJson<any>("/api/v1/audit/verify"),
      ]);
      setS(st.settings);
      setWebhookUrls(integ.webhookUrls);
      setIntegrations(integ.integrations);
      setWebhookLogs(integ.webhookLogs);
      setMembers(tm.members);
      setApiKeys(keys.keys);
      setBilling(bill);
      setAuditEvents(aud.events);
      setChainCheck(aud.verification);
    } catch (e) {
      setToast({ kind: "error", text: e instanceof Error ? e.message : "Failed to load settings" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  function switchTab(next: TabId) {
    setTab(next);
    setToast(null);
    router.replace(`/settings?tab=${next}`, { scroll: false });
  }

  async function saveSettings(patch?: Record<string, unknown>) {
    if (!s) return;
    setSaving(true);
    setToast(null);
    try {
      const res = await apiJson<{ settings: Record<string, any> }>("/api/v1/settings", {
        method: "PUT",
        body: JSON.stringify(patch ?? s),
      });
      setS(res.settings);
      await reload();
      setToast({ kind: "success", text: "Settings saved and logged in GoBD audit trail." });
    } catch (e) {
      setToast({ kind: "error", text: e instanceof Error ? e.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  }

  async function verifySelfVat() {
    if (!s?.vatId?.trim()) return;
    setViesLoading(true);
    setViesNote(null);
    try {
      const r = await apiJson<{ status: string; traderName?: string }>("/api/v1/vat/verify", {
        method: "POST",
        body: JSON.stringify({ vatId: s.vatId, liveLookup: true }),
      });
      setViesNote(`${r.status}${r.traderName ? ` · ${r.traderName}` : ""}`);
      if (r.status === "VERIFIED") {
        setS((p) => (p ? { ...p, vatVerifiedAt: new Date().toISOString() } : p));
      }
    } catch (e) {
      setViesNote(e instanceof Error ? e.message : "VIES failed");
    } finally {
      setViesLoading(false);
    }
  }

  function handleLogoUpload(file: File) {
    if (file.size > 180_000) {
      setToast({ kind: "error", text: "Logo must be smaller than 180 KB (PNG/JPG/SVG)." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setS((p) => (p ? { ...p, logoDataUrl: String(reader.result || "") } : p));
    };
    reader.readAsDataURL(file);
  }

  async function updateIntegration(provider: "stripe" | "woocommerce", payload: { enabled?: boolean; newSecret?: string; rotateSecret?: boolean }) {
    setSaving(true);
    setToast(null);
    setRotatedSecret(null);
    try {
      const r = await apiJson<{ rotatedPlaintext: string | null }>("/api/v1/integrations", {
        method: "PUT",
        body: JSON.stringify({ provider, ...payload }),
      });
      if (r.rotatedPlaintext) {
        setRotatedSecret({ provider, secret: r.rotatedPlaintext });
      }
      setStripeSecretInput("");
      setWooSecretInput("");
      setToast({ kind: "success", text: `${provider.toUpperCase()} integration updated (AES-256-GCM encrypted at rest).` });
      await loadAll();
    } catch (e) {
      setToast({ kind: "error", text: e instanceof Error ? e.message : "Integration update failed" });
    } finally {
      setSaving(false);
    }
  }

  async function inviteMember(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setToast(null);
    try {
      const r = await apiJson<{ members: Array<any> }>("/api/v1/team", {
        method: "POST",
        body: JSON.stringify({ email: inviteEmail, fullName: inviteName, role: inviteRole }),
      });
      setMembers(r.members);
      setInviteEmail("");
      setInviteName("");
      setToast({ kind: "success", text: "Team member invited." });
    } catch (err) {
      setToast({ kind: "error", text: err instanceof Error ? err.message : "Invite failed" });
    } finally {
      setSaving(false);
    }
  }

  async function removeMember(userId: string) {
    if (!confirm("Remove this team member from your workspace?")) return;
    try {
      const r = await apiJson<{ members: Array<any> }>(`/api/v1/team?userId=${encodeURIComponent(userId)}`, {
        method: "DELETE",
      });
      setMembers(r.members);
      setToast({ kind: "success", text: "Member removed." });
    } catch (err) {
      setToast({ kind: "error", text: err instanceof Error ? err.message : "Remove failed" });
    }
  }

  async function createApiKey(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setToast(null);
    setCreatedKeyPlaintext(null);
    try {
      const r = await apiJson<{ plaintextKey: string }>("/api/v1/api-keys", {
        method: "POST",
        body: JSON.stringify({ name: newKeyName || "Production Key", scopes: newKeyScopes }),
      });
      setCreatedKeyPlaintext(r.plaintextKey);
      setNewKeyName("");
      await loadAll();
    } catch (err) {
      setToast({ kind: "error", text: err instanceof Error ? err.message : "Key creation failed" });
    } finally {
      setSaving(false);
    }
  }

  async function revokeKey(id: string) {
    if (!confirm("Revoke this API key immediately? Any clients using it will receive HTTP 401.")) return;
    try {
      await apiJson(`/api/v1/api-keys?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      setToast({ kind: "success", text: "API key revoked." });
      await loadAll();
    } catch (err) {
      setToast({ kind: "error", text: err instanceof Error ? err.message : "Revoke failed" });
    }
  }

  async function selectPlan(planTier: string) {
    setSaving(true);
    setToast(null);
    try {
      const r = await apiJson<{ message?: string }>("/api/v1/billing/checkout", {
        method: "POST",
        body: JSON.stringify({ planTier }),
      });
      setToast({ kind: "success", text: r.message || `Switched to ${planTier.toUpperCase()}.` });
      await Promise.all([loadAll(), reload()]);
    } catch (err) {
      setToast({ kind: "error", text: err instanceof Error ? err.message : "Plan update failed" });
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setToast(null);
    try {
      await apiJson("/api/v1/account/password", {
        method: "POST",
        body: JSON.stringify({ currentPassword: currPw, newPassword: newPw }),
      });
      setCurrPw("");
      setNewPw("");
      setToast({ kind: "success", text: "Password updated securely with scrypt." });
    } catch (err) {
      setToast({ kind: "error", text: err instanceof Error ? err.message : "Password change failed" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteWorkspace() {
    if (deleteConfirm !== "DELETE_MY_WORKSPACE") {
      setToast({ kind: "error", text: 'Type "DELETE_MY_WORKSPACE" exactly to confirm.' });
      return;
    }
    try {
      await apiJson("/api/v1/account/delete?confirm=DELETE_MY_WORKSPACE", { method: "DELETE" });
      router.replace("/login");
    } catch (err) {
      setToast({ kind: "error", text: err instanceof Error ? err.message : "Deletion failed" });
    }
  }

  function copy(text: string) {
    void navigator.clipboard.writeText(text);
    setToast({ kind: "success", text: "Copied to clipboard." });
  }

  if (loading || !s) {
    return (
      <div className="flex items-center gap-2 py-20 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading workspace settings…
      </div>
    );
  }

  const stripeInteg = integrations.find((i) => i.provider === "stripe");
  const wooInteg = integrations.find((i) => i.provider === "woocommerce");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workspace Settings"
        subtitle="Configure your EN 16931 legal profile, SEPA banking, sequential numbering, tenant webhooks, team RBAC, API keys, billing, and GDPR controls."
      />

      {/* Horizontal 7-Tab Bar */}
      <div className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => switchTab(t.id)}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
                active ? "bg-brand-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {toast && <Alert kind={toast.kind}>{toast.text}</Alert>}

      {/* TAB 1: Company & Legal Tax (BG-4) */}
      {tab === "company" && (
        <Card
          title="Company Legal & Tax Profile (EN 16931 BG-4)"
          description="Embedded automatically into every ZUGFeRD, Factur-X, XRechnung & Peppol document you issue."
          actions={
            <button type="button" disabled={saving} onClick={() => void saveSettings()} className={btnPrimary}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes
            </button>
          }
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className={labelCls}>
              Legal Company Name (BT-27) *
              <input className={inputCls} value={s.legalName} onChange={(e) => setS({ ...s, legalName: e.target.value })} />
            </label>
            <label className={labelCls}>
              Trading Name (BT-28)
              <input className={inputCls} value={s.tradingName} onChange={(e) => setS({ ...s, tradingName: e.target.value })} />
            </label>
            <label className={labelCls}>
              Managing Director (§ 35a GmbHG)
              <input className={inputCls} value={s.managingDirector} onChange={(e) => setS({ ...s, managingDirector: e.target.value })} />
            </label>
            <label className={labelCls}>
              Commercial Register / HRB / SIREN (BT-30)
              <input className={inputCls} value={s.registrationId} onChange={(e) => setS({ ...s, registrationId: e.target.value })} />
            </label>
            <label className={`${labelCls} sm:col-span-2`}>
              Street & House Number (BT-35)
              <input className={inputCls} value={s.street} onChange={(e) => setS({ ...s, street: e.target.value })} />
            </label>
            <div className="grid grid-cols-3 gap-2 sm:col-span-2">
              <label className={labelCls}>Postal Code<input className={inputCls} value={s.postalCode} onChange={(e) => setS({ ...s, postalCode: e.target.value })} /></label>
              <label className={labelCls}>City<input className={inputCls} value={s.city} onChange={(e) => setS({ ...s, city: e.target.value })} /></label>
              <label className={labelCls}>Country<input maxLength={2} className={`${inputCls} font-mono uppercase`} value={s.countryCode} onChange={(e) => setS({ ...s, countryCode: e.target.value.toUpperCase() })} /></label>
            </div>
            <label className={labelCls}>
              EU VAT ID (BT-31)
              <div className="flex gap-2">
                <input className={`${inputCls} font-mono uppercase`} value={s.vatId} onChange={(e) => setS({ ...s, vatId: e.target.value })} placeholder="DE298765432" />
                <button type="button" disabled={viesLoading} onClick={() => void verifySelfVat()} className="mt-1 whitespace-nowrap rounded-lg border border-slate-300 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50">
                  {viesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check VIES"}
                </button>
              </div>
              {viesNote && <span className="mt-1 block text-[11px] font-semibold text-emerald-700">{viesNote}</span>}
            </label>
            <label className={labelCls}>
              National Tax Number / Steuernummer (BT-32)
              <input className={`${inputCls} font-mono`} value={s.taxNumber} onChange={(e) => setS({ ...s, taxNumber: e.target.value })} />
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 sm:col-span-2">
              <input type="checkbox" checked={s.isKleinunternehmer} onChange={(e) => setS({ ...s, isKleinunternehmer: e.target.checked })} />
              Kleinunternehmer (§ 19 UStG) — VAT-exempt small business
            </label>
            <label className={labelCls}>
              Electronic Address / Endpoint (BT-34)
              <input className={inputCls} value={s.electronicAddress} onChange={(e) => setS({ ...s, electronicAddress: e.target.value })} />
            </label>
            <label className={labelCls}>
              Billing Contact Name (BG-6 / BT-41)
              <input className={inputCls} value={s.contactName} onChange={(e) => setS({ ...s, contactName: e.target.value })} />
            </label>
            <label className={labelCls}>
              Contact Phone (BT-42)
              <input className={inputCls} value={s.contactPhone} onChange={(e) => setS({ ...s, contactPhone: e.target.value })} />
            </label>
            <label className={labelCls}>
              Contact Email (BT-43)
              <input type="email" className={inputCls} value={s.contactEmail} onChange={(e) => setS({ ...s, contactEmail: e.target.value })} />
            </label>
            <div className="sm:col-span-2">
              <span className={labelCls}>Company Logo (for PDF/A-3 header, max 180 KB)</span>
              <div className="mt-2 flex items-center gap-4">
                {s.logoDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.logoDataUrl} alt="Company Logo" className="h-12 max-w-[160px] rounded border border-slate-200 object-contain p-1" />
                ) : (
                  <div className="flex h-12 w-24 items-center justify-center rounded border border-dashed border-slate-300 text-[11px] text-slate-400">No logo</div>
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleLogoUpload(f);
                  }}
                  className="text-xs text-slate-600"
                />
                {s.logoDataUrl && (
                  <button type="button" onClick={() => setS({ ...s, logoDataUrl: "" })} className="text-xs font-semibold text-red-600 hover:underline">
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 2: Invoicing, Numbering & Banking (BG-16) */}
      {tab === "invoicing" && (
        <Card
          title="Invoicing Defaults, Sequential Numbering & SEPA Banking (BG-16)"
          description="IBAN is validated using ISO 13616 MOD-97 on both client and server."
          actions={
            <button type="button" disabled={saving} onClick={() => void saveSettings()} className={btnPrimary}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes
            </button>
          }
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className={`${labelCls} sm:col-span-2`}>
              IBAN (BT-84)
              <input className={`${inputCls} font-mono uppercase`} value={s.iban} onChange={(e) => setS({ ...s, iban: e.target.value })} placeholder="DE89370400440532013000" />
              {s.iban && (
                <span className={`mt-1 block text-[11px] font-semibold ${validateIbanClient(s.iban) ? "text-emerald-700" : "text-red-700"}`}>
                  {validateIbanClient(s.iban) ? "✓ Valid ISO 13616 MOD-97 IBAN checksum" : "✗ Invalid IBAN checksum — server will reject invalid IBANs"}
                </span>
              )}
            </label>
            <label className={labelCls}>
              BIC (BT-86)
              <input className={`${inputCls} font-mono uppercase`} value={s.bic} onChange={(e) => setS({ ...s, bic: e.target.value })} />
            </label>
            <label className={labelCls}>
              Account Holder (BT-85)
              <input className={inputCls} value={s.accountHolder} onChange={(e) => setS({ ...s, accountHolder: e.target.value })} />
            </label>
            <label className={labelCls}>
              Invoice Prefix
              <input className={`${inputCls} font-mono`} value={s.invoicePrefix} onChange={(e) => setS({ ...s, invoicePrefix: e.target.value })} />
            </label>
            <label className={labelCls}>
              Credit Note Prefix (TypeCode 381)
              <input className={`${inputCls} font-mono`} value={s.creditNotePrefix} onChange={(e) => setS({ ...s, creditNotePrefix: e.target.value })} />
            </label>
            <label className={labelCls}>
              Next Sequence Number
              <input type="number" min={1} className={`${inputCls} font-mono`} value={s.nextInvoiceSeq} onChange={(e) => setS({ ...s, nextInvoiceSeq: Math.max(1, Number(e.target.value) || 1) })} />
              <span className="mt-1 block text-[11px] text-slate-500">
                Next invoice: <span className="font-mono font-bold">{s.invoicePrefix}{String(s.nextInvoiceSeq).padStart(4, "0")}</span>
              </span>
            </label>
            <label className={labelCls}>
              Default Format
              <select className={inputCls} value={s.defaultFormat} onChange={(e) => setS({ ...s, defaultFormat: e.target.value })}>
                <option value="ZUGFERD_EN16931">ZUGFeRD 2.3 (PDF + XML)</option>
                <option value="FACTURX_EN16931">Factur-X 1.07 (PDF + XML)</option>
                <option value="XRECHNUNG_CII">XRechnung 3.0.2 CII</option>
                <option value="XRECHNUNG_UBL">XRechnung 3.0.2 UBL</option>
                <option value="PEPPOL_BIS_3">Peppol BIS 3.0</option>
              </select>
            </label>
            <label className={labelCls}>
              Default Document Language
              <select className={inputCls} value={s.defaultLocale} onChange={(e) => setS({ ...s, defaultLocale: e.target.value })}>
                <option value="de">Deutsch (DE)</option>
                <option value="fr">Français (FR)</option>
                <option value="en">English (EN)</option>
              </select>
            </label>
            <label className={labelCls}>
              Default Payment Due Days
              <input type="number" min={0} className={inputCls} value={s.defaultDueDays} onChange={(e) => setS({ ...s, defaultDueDays: Number(e.target.value) || 0 })} />
            </label>
            <label className={labelCls}>
              GoBD Archive Retention Period
              <select className={inputCls} value={s.retentionYears} onChange={(e) => setS({ ...s, retentionYears: Number(e.target.value) === 10 ? 10 : 8 })}>
                <option value={8}>8 Years (Germany BEG IV / § 147 AO)</option>
                <option value={10}>10 Years (France / Commercial Code)</option>
              </select>
            </label>
            <label className={labelCls}>
              Default Payment Terms (BT-20)
              <input className={inputCls} value={s.defaultPaymentTerms} onChange={(e) => setS({ ...s, defaultPaymentTerms: e.target.value })} />
            </label>
            <label className={`${labelCls} sm:col-span-2`}>
              Default Invoice Footer Notes (BT-22)
              <textarea rows={2} className={inputCls} value={s.defaultNotes} onChange={(e) => setS({ ...s, defaultNotes: e.target.value })} />
            </label>
          </div>
        </Card>
      )}

      {/* TAB 3: Integrations & Webhooks */}
      {tab === "integrations" && (
        <div className="space-y-6">
          {rotatedSecret && (
            <Alert kind="warning">
              New {rotatedSecret.provider.toUpperCase()} signing secret (copy now — shown once):{" "}
              <code className="rounded bg-white px-2 py-0.5 font-mono text-xs">{rotatedSecret.secret}</code>{" "}
              <button type="button" onClick={() => copy(rotatedSecret.secret)} className="ml-2 underline">Copy</button>
            </Alert>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card title="Stripe E-Invoice Bridge" description="Tenant-scoped endpoint. Every request is verified with HMAC-SHA256 + 5-min replay protection.">
              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-700">Your Stripe Webhook URL</span>
                  <div className="mt-1 flex gap-2">
                    <input readOnly value={webhookUrls.stripe} className={`${inputCls} mt-0 bg-slate-50 font-mono text-[11px]`} />
                    <button type="button" onClick={() => copy(webhookUrls.stripe)} className={btnSecondary}><Copy className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <p className="text-slate-500">
                  Stored secret: <code className="font-mono font-semibold text-slate-800">{stripeInteg?.hasSecret ? stripeInteg.secretMasked : "Not set"}</code>
                </p>
                <div className="flex gap-2">
                  <input
                    value={stripeSecretInput}
                    onChange={(e) => setStripeSecretInput(e.target.value)}
                    placeholder="Paste Stripe whsec_..."
                    className={`${inputCls} mt-0 font-mono text-xs`}
                  />
                  <button type="button" disabled={!stripeSecretInput.trim() || saving} onClick={() => void updateIntegration("stripe", { enabled: true, newSecret: stripeSecretInput })} className={btnPrimary}>
                    Save
                  </button>
                </div>
                <button type="button" disabled={saving} onClick={() => void updateIntegration("stripe", { enabled: true, rotateSecret: true })} className={btnSecondary}>
                  <RefreshCw className="h-3.5 w-3.5" /> Generate / Rotate Secret
                </button>
              </div>
            </Card>

            <Card title="WooCommerce Plugin Bridge" description="Paste this URL & signing secret into WooCommerce → NormInvoice EU E-Invoice.">
              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-700">Your WooCommerce Webhook URL</span>
                  <div className="mt-1 flex gap-2">
                    <input readOnly value={webhookUrls.woocommerce} className={`${inputCls} mt-0 bg-slate-50 font-mono text-[11px]`} />
                    <button type="button" onClick={() => copy(webhookUrls.woocommerce)} className={btnSecondary}><Copy className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <p className="text-slate-500">
                  Stored secret: <code className="font-mono font-semibold text-slate-800">{wooInteg?.hasSecret ? wooInteg.secretMasked : "Not set"}</code>
                </p>
                <div className="flex gap-2">
                  <input
                    value={wooSecretInput}
                    onChange={(e) => setWooSecretInput(e.target.value)}
                    placeholder="Custom signing secret..."
                    className={`${inputCls} mt-0 font-mono text-xs`}
                  />
                  <button type="button" disabled={!wooSecretInput.trim() || saving} onClick={() => void updateIntegration("woocommerce", { enabled: true, newSecret: wooSecretInput })} className={btnPrimary}>
                    Save
                  </button>
                </div>
                <button type="button" disabled={saving} onClick={() => void updateIntegration("woocommerce", { enabled: true, rotateSecret: true })} className={btnSecondary}>
                  <RefreshCw className="h-3.5 w-3.5" /> Generate / Rotate Secret
                </button>
              </div>
            </Card>
          </div>

          <Card
            title="Accountant Auto-CC Email"
            description="Automatically CC your German Steuerberater or French Expert-comptable whenever an e-invoice is emailed."
            actions={
              <button type="button" disabled={saving} onClick={() => void saveSettings({ accountantCcEmail: s.accountantCcEmail })} className={btnPrimary}>
                <Save className="h-4 w-4" /> Save CC
              </button>
            }
          >
            <label className={`${labelCls} max-w-md`}>
              Accountant CC Email
              <input type="email" className={inputCls} value={s.accountantCcEmail} onChange={(e) => setS({ ...s, accountantCcEmail: e.target.value })} placeholder="steuerberater@kanzlei.de" />
            </label>
          </Card>

          <Card title="Recent Webhook Delivery Logs">
            {webhookLogs.length === 0 ? (
              <p className="text-xs text-slate-500">No webhook deliveries logged for your workspace yet.</p>
            ) : (
              <div className="-mx-6 -my-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50 uppercase text-slate-500">
                    <tr>
                      <th className="px-6 py-2.5 text-left font-semibold">Time</th>
                      <th className="px-6 py-2.5 text-left font-semibold">Provider</th>
                      <th className="px-6 py-2.5 text-left font-semibold">Event</th>
                      <th className="px-6 py-2.5 text-left font-semibold">HTTP</th>
                      <th className="px-6 py-2.5 text-left font-semibold">Summary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {webhookLogs.map((l) => (
                      <tr key={l.id}>
                        <td className="px-6 py-2.5 font-mono text-[11px] text-slate-500">{l.createdAt.slice(0, 19).replace("T", " ")}</td>
                        <td className="px-6 py-2.5 font-bold uppercase text-slate-800">{l.provider}</td>
                        <td className="px-6 py-2.5 font-mono">{l.eventType}</td>
                        <td className="px-6 py-2.5">
                          <span className={`rounded px-1.5 py-0.5 font-mono font-bold ${l.statusCode < 300 ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-700"}`}>
                            {l.statusCode}
                          </span>
                        </td>
                        <td className="px-6 py-2.5 text-slate-600">{l.summary}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 4: Team & RBAC */}
      {tab === "team" && (
        <div className="space-y-6">
          <Card title="Invite Team Member or Tax Advisor" description="Assign least-privilege RBAC roles (Owner, Admin, Accountant read/export, Member).">
            <form onSubmit={inviteMember} className="grid grid-cols-1 gap-3 sm:grid-cols-4 sm:items-end">
              <label className={labelCls}>
                Email *
                <input type="email" required className={inputCls} value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="berater@kanzlei.de" />
              </label>
              <label className={labelCls}>
                Full Name
                <input className={inputCls} value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="Dr. Clara Meier" />
              </label>
              <label className={labelCls}>
                Role
                <select className={inputCls} value={inviteRole} onChange={(e) => setInviteRole(e.target.value as any)}>
                  <option value="accountant">Accountant (Read & Export)</option>
                  <option value="member">Member (Create Invoices)</option>
                  <option value="admin">Admin (Manage Settings)</option>
                  <option value="owner">Owner (Full Access)</option>
                </select>
              </label>
              <button type="submit" disabled={saving} className={btnPrimary}>
                <UserPlus className="h-4 w-4" /> Invite
              </button>
            </form>
          </Card>

          <Card title={`Workspace Members (${members.length})`}>
            <div className="-mx-6 -my-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-2.5 text-left font-semibold">Member</th>
                    <th className="px-6 py-2.5 text-left font-semibold">Role</th>
                    <th className="px-6 py-2.5 text-left font-semibold">Joined</th>
                    <th className="px-6 py-2.5 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.map((m) => (
                    <tr key={m.userId}>
                      <td className="px-6 py-3">
                        <p className="font-bold text-slate-900">{m.fullName}</p>
                        <p className="text-slate-500">{m.email}</p>
                      </td>
                      <td className="px-6 py-3">
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase text-slate-700">
                          {m.role}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-mono text-slate-500">{m.createdAt.slice(0, 10)}</td>
                      <td className="px-6 py-3 text-right">
                        <button type="button" onClick={() => void removeMember(m.userId)} className="text-xs font-bold text-red-600 hover:underline">
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: API Keys */}
      {tab === "api-keys" && (
        <div className="space-y-6">
          {createdKeyPlaintext && (
            <Alert kind="warning">
              Copy your new API key now — it is hashed with SHA-256 and will never be shown again:{" "}
              <code className="rounded bg-white px-2 py-0.5 font-mono text-xs">{createdKeyPlaintext}</code>{" "}
              <button type="button" onClick={() => copy(createdKeyPlaintext)} className="ml-2 underline">Copy</button>
            </Alert>
          )}

          <Card title="Generate Tenant-Scoped API Key" description="Use as Authorization: Bearer ni_live_... against /api/v1/validate, /api/v1/invoices, and /api/v1/exports/*.">
            <form onSubmit={createApiKey} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
                <label className={`${labelCls} sm:col-span-2`}>
                  Key Label
                  <input className={inputCls} value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="ERP Production Sync" />
                </label>
                <button type="submit" disabled={saving} className={btnPrimary}>
                  <KeyRound className="h-4 w-4" /> Create API Key
                </button>
              </div>
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
                {["validate", "generate", "exports:read", "customers:write"].map((sc) => (
                  <label key={sc} className="inline-flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={newKeyScopes.includes(sc)}
                      onChange={(e) =>
                        setNewKeyScopes((prev) =>
                          e.target.checked ? [...prev, sc] : prev.filter((x) => x !== sc)
                        )
                      }
                    />
                    <code className="font-mono">{sc}</code>
                  </label>
                ))}
              </div>
            </form>
          </Card>

          <Card title={`Issued Keys (${apiKeys.length})`}>
            {apiKeys.length === 0 ? (
              <p className="text-xs text-slate-500">No API keys created yet.</p>
            ) : (
              <div className="-mx-6 -my-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50 uppercase text-slate-500">
                    <tr>
                      <th className="px-6 py-2.5 text-left font-semibold">Name</th>
                      <th className="px-6 py-2.5 text-left font-semibold">Prefix</th>
                      <th className="px-6 py-2.5 text-left font-semibold">Scopes</th>
                      <th className="px-6 py-2.5 text-left font-semibold">Status</th>
                      <th className="px-6 py-2.5 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {apiKeys.map((k) => (
                      <tr key={k.id}>
                        <td className="px-6 py-3 font-bold text-slate-900">{k.name}</td>
                        <td className="px-6 py-3 font-mono">{k.keyPrefix}…</td>
                        <td className="px-6 py-3 font-mono text-[11px] text-slate-600">{k.scopes.join(", ")}</td>
                        <td className="px-6 py-3">
                          {k.revokedAt ? (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">Revoked</span>
                          ) : (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">Active</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-right">
                          {!k.revokedAt && (
                            <button type="button" onClick={() => void revokeKey(k.id)} className="text-xs font-bold text-red-600 hover:underline">
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 6: Billing & Quota */}
      {tab === "billing" && billing && (
        <div className="space-y-6">
          <Card
            title="Current Subscription & Monthly Usage"
            actions={
              billing.activePlan.tier !== "free" && !billing.activePlan.cancelAtPeriodEnd ? (
                <button
                  type="button"
                  disabled={saving}
                  onClick={async () => {
                    if (!confirm("Cancel upcoming subscription renewal? Your current access remains active through the end of the period.")) return;
                    setSaving(true);
                    try {
                      const r = await apiJson<{ message: string }>("/api/v1/billing/checkout", { method: "DELETE" });
                      setToast({ kind: "success", text: r.message });
                      await Promise.all([loadAll(), reload()]);
                    } catch (err) {
                      setToast({ kind: "error", text: err instanceof Error ? err.message : "Cancellation failed" });
                    } finally {
                      setSaving(false);
                    }
                  }}
                  className={btnDanger}
                >
                  Cancel Renewal
                </button>
              ) : null
            }
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Active Plan</p>
                <p className="mt-1 text-2xl font-extrabold uppercase text-navy-900">
                  {billing.activePlan.trialActive ? "15-Day Free Trial" : billing.activePlan.tier}
                </p>
                {billing.activePlan.trialActive && (
                  <p className="mt-1 text-xs font-bold text-accent-700">
                    {billing.activePlan.trialDaysRemaining} day{billing.activePlan.trialDaysRemaining === 1 ? "" : "s"} left · No credit card required
                  </p>
                )}
                {billing.activePlan.cancelAtPeriodEnd && (
                  <p className="mt-1 text-xs font-bold text-amber-700">
                    Renewal cancelled — access continues until end of current billing cycle.
                  </p>
                )}
              </div>
              <div className="w-full max-w-sm">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Finalized E-Invoices This Month</span>
                  <span className="font-mono">{billing.activePlan.usedThisMonth} / {billing.activePlan.monthlyQuota}</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-accent-500"
                    style={{
                      width: `${Math.min(100, Math.round((billing.activePlan.usedThisMonth / Math.max(1, billing.activePlan.monthlyQuota)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { id: "free", name: "Free", price: "$0", quota: "5 invoices / mo", desc: "Ongoing free validation & occasional invoices" },
              { id: "solo", name: "Solo", price: "$39", quota: "150 invoices / mo", desc: "Main plan: recurring, inbox, automations & DATEV/FEC", featured: true },
              { id: "business", name: "Business", price: "$49", quota: "500 invoices / mo", desc: "Stripe, WooCommerce, multi-user RBAC & GoBD" },
              { id: "agency", name: "Agency", price: "$129", quota: "2,500 invoices / mo", desc: "High-volume, multi-client & REST API teams" },
            ].map((p) => {
              const current = billing.activePlan.tier === p.id;
              return (
                <div
                  key={p.id}
                  className={`flex flex-col justify-between rounded-2xl border p-5 shadow-card ${
                    current
                      ? "border-accent-500 bg-accent-50/40"
                      : p.featured
                        ? "border-navy-300 bg-white ring-1 ring-accent-500/20"
                        : "border-slate-200 bg-white"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-extrabold uppercase text-navy-800">{p.name}</p>
                      {p.featured && (
                        <span className="rounded-full bg-accent-500 px-2 py-0.5 text-[10px] font-bold text-white">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-2xl font-extrabold text-navy-900">
                      {p.price}<span className="text-xs font-medium text-slate-500">/mo</span>
                    </p>
                    <p className="mt-1 font-mono text-xs font-bold text-accent-700">{p.quota}</p>
                    <p className="mt-2 text-xs text-slate-600">{p.desc}</p>
                  </div>
                  <button
                    type="button"
                    disabled={current || saving}
                    onClick={() => void selectPlan(p.id)}
                    className={`mt-5 w-full ${current ? btnSecondary : btnPrimary}`}
                  >
                    {current ? "Current Plan" : `Switch to ${p.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 7: Security, GoBD Hash-Chain & GDPR */}
      {tab === "security" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card title="Change Account Password" description="Hashed with scrypt (per-user random salt).">
              <form onSubmit={handleChangePassword} className="space-y-3">
                <label className={labelCls}>
                  Current Password
                  <input type="password" required className={inputCls} value={currPw} onChange={(e) => setCurrPw(e.target.value)} />
                </label>
                <label className={labelCls}>
                  New Password (min 8 chars, letters + numbers)
                  <input type="password" required minLength={8} className={inputCls} value={newPw} onChange={(e) => setNewPw(e.target.value)} />
                </label>
                <button type="submit" disabled={saving} className={btnPrimary}>
                  <Lock className="h-4 w-4" /> Update Password
                </button>
              </form>
            </Card>

            <Card title="GDPR Data Portability (Art. 20) & Erasure (Art. 17)" description="Full sovereignty over your company data hosted in the EU.">
              <div className="space-y-4">
                <div>
                  <a href="/api/v1/account/gdpr-export" className={btnSecondary}>
                    <Download className="h-4 w-4" /> Download Full GDPR Art. 20 JSON Export
                  </a>
                </div>
                <div className="rounded-xl border border-red-200 bg-red-50/60 p-4">
                  <p className="text-xs font-bold text-red-800">Danger Zone — Permanent Workspace Erasure (Art. 17 GDPR)</p>
                  <p className="mt-1 text-[11px] text-red-700">
                    Permanently deletes your organization, customers, invoices, API keys, and audit logs. Export your GoBD archive first!
                  </p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder="Type DELETE_MY_WORKSPACE"
                      className={`${inputCls} mt-0 font-mono text-xs`}
                    />
                    <button type="button" onClick={() => void handleDeleteWorkspace()} className={btnDanger}>
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Card
            title="Live GoBD SHA-256 Audit Hash-Chain Integrity"
            description={
              chainCheck?.verified
                ? `VERIFIED — All ${chainCheck.totalEvents} append-only events cryptographically linked with zero tampering.`
                : "Verification pending"
            }
            actions={
              <button type="button" onClick={() => void loadAll()} className={btnSecondary}>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Re-verify Chain
              </button>
            }
          >
            <div className="-mx-6 -my-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-2.5 text-left font-semibold">Time</th>
                    <th className="px-6 py-2.5 text-left font-semibold">Event</th>
                    <th className="px-6 py-2.5 text-left font-semibold">Ref</th>
                    <th className="px-6 py-2.5 text-left font-semibold">Actor</th>
                    <th className="px-6 py-2.5 text-left font-semibold">SHA-256 Event Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditEvents.slice(0, 20).map((ev) => (
                    <tr key={ev.id}>
                      <td className="px-6 py-2.5 font-mono text-[11px] text-slate-500">{ev.createdAt.slice(0, 19).replace("T", " ")}</td>
                      <td className="px-6 py-2.5 font-mono font-bold text-slate-900">{ev.eventType}</td>
                      <td className="px-6 py-2.5 font-mono text-slate-700">{ev.invoiceNumber}</td>
                      <td className="px-6 py-2.5 text-slate-600">{ev.actorEmail}</td>
                      <td className="px-6 py-2.5 font-mono text-[11px] text-emerald-700">{ev.eventHash.slice(0, 24)}…</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-sm text-slate-500">Loading settings…</div>}>
      <SettingsInner />
    </Suspense>
  );
}
