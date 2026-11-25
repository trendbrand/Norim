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
import { useLocale } from "@/components/LocaleProvider";
import { SETTINGS_STRINGS } from "@/lib/i18n";
import { validateIbanClient } from "@/lib/iban";

type TabId = "company" | "invoicing" | "integrations" | "team" | "api-keys" | "billing" | "security";

const TAB_META: Array<{ id: TabId; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "company", icon: Building2 },
  { id: "invoicing", icon: Landmark },
  { id: "integrations", icon: Webhook },
  { id: "team", icon: Users },
  { id: "api-keys", icon: KeyRound },
  { id: "billing", icon: CreditCard },
  { id: "security", icon: ShieldCheck },
];

function SettingsInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { reload } = useAppSession();
  const { locale } = useLocale();
  const t = SETTINGS_STRINGS[locale];
  const TAB_LABELS: Record<TabId, string> = {
    company: t.tabCompany,
    invoicing: t.tabInvoicing,
    integrations: t.tabIntegrations,
    team: t.tabTeam,
    "api-keys": t.tabApiKeys,
    billing: t.tabBilling,
    security: t.tabSecurity,
  };
  const initialTab = (params.get("tab") as TabId) || "company";
  const [tab, setTab] = useState<TabId>(TAB_META.some((m) => m.id === initialTab) ? initialTab : "company");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  // Settings (Company + Invoicing + Banking + Accountant CC)
  const [s, setS] = useState<Record<string, any> | null>(null);
  const [viesNote, setViesNote] = useState<string | null>(null);
  const [viesLoading, setViesLoading] = useState(false);

  // Integrations
  const [webhookUrls, setWebhookUrls] = useState<{ stripe: string; woocommerce: string; shopify: string }>({ stripe: "", woocommerce: "", shopify: "" });
  const [integrations, setIntegrations] = useState<Array<any>>([]);
  const [webhookLogs, setWebhookLogs] = useState<Array<any>>([]);
  const [stripeSecretInput, setStripeSecretInput] = useState("");
  const [wooSecretInput, setWooSecretInput] = useState("");
  const [shopifySecretInput, setShopifySecretInput] = useState("");
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

  // Two-factor authentication (2FA / TOTP)
  const [twoFa, setTwoFa] = useState<{ enabled: boolean; backupCount: number }>({ enabled: false, backupCount: 0 });
  const [twoFaSetup, setTwoFaSetup] = useState<{ qrDataUrl: string; secret: string } | null>(null);
  const [twoFaCode, setTwoFaCode] = useState("");
  const [twoFaBackup, setTwoFaBackup] = useState<string[] | null>(null);
  const [twoFaPassword, setTwoFaPassword] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [st, integ, tm, keys, bill, aud, tfa] = await Promise.all([
        apiJson<any>("/api/v1/settings"),
        apiJson<any>("/api/v1/integrations"),
        apiJson<any>("/api/v1/team"),
        apiJson<any>("/api/v1/api-keys"),
        apiJson<any>("/api/v1/billing/checkout"),
        apiJson<any>("/api/v1/audit/verify"),
        apiJson<any>("/api/v1/auth/2fa").catch(() => ({ enabled: false, backupCount: 0 })),
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
      setTwoFa(tfa);
    } catch (e) {
      setToast({ kind: "error", text: e instanceof Error ? e.message : t.tLoadFailed });
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

  async function reload2fa() {
    try {
      setTwoFa(await apiJson<{ enabled: boolean; backupCount: number }>("/api/v1/auth/2fa"));
    } catch {
      /* ignore */
    }
  }
  async function start2faSetup() {
    setSaving(true);
    try {
      const r = await apiJson<{ qrDataUrl: string; secret: string }>("/api/v1/auth/2fa", {
        method: "POST",
        body: JSON.stringify({ action: "setup" }),
      });
      setTwoFaSetup({ qrDataUrl: r.qrDataUrl, secret: r.secret });
      setTwoFaBackup(null);
      setTwoFaCode("");
    } catch (e) {
      setToast({ kind: "error", text: e instanceof Error ? e.message : "Setup failed" });
    } finally {
      setSaving(false);
    }
  }
  async function confirm2fa() {
    setSaving(true);
    try {
      const r = await apiJson<{ backupCodes: string[] }>("/api/v1/auth/2fa", {
        method: "POST",
        body: JSON.stringify({ action: "enable", code: twoFaCode.trim() }),
      });
      setTwoFaBackup(r.backupCodes);
      setTwoFaSetup(null);
      setTwoFaCode("");
      await reload2fa();
      setToast({ kind: "success", text: "Two-factor authentication enabled." });
    } catch (e) {
      setToast({ kind: "error", text: e instanceof Error ? e.message : "Invalid code — try again." });
    } finally {
      setSaving(false);
    }
  }
  async function disable2fa() {
    if (!twoFaPassword) {
      setToast({ kind: "error", text: "Enter your account password to disable 2FA." });
      return;
    }
    setSaving(true);
    try {
      await apiJson("/api/v1/auth/2fa", {
        method: "POST",
        body: JSON.stringify({ action: "disable", password: twoFaPassword }),
      });
      setTwoFaPassword("");
      setTwoFaBackup(null);
      await reload2fa();
      setToast({ kind: "success", text: "Two-factor authentication disabled." });
    } catch (e) {
      setToast({ kind: "error", text: e instanceof Error ? e.message : "Could not disable 2FA." });
    } finally {
      setSaving(false);
    }
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
      setToast({ kind: "success", text: t.tSaved });
    } catch (e) {
      setToast({ kind: "error", text: e instanceof Error ? e.message : t.tSaveFailed });
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
      setViesNote(e instanceof Error ? e.message : t.tViesFailed);
    } finally {
      setViesLoading(false);
    }
  }

  function handleLogoUpload(file: File) {
    if (file.size > 180_000) {
      setToast({ kind: "error", text: t.tLogoTooBig });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setS((p) => (p ? { ...p, logoDataUrl: String(reader.result || "") } : p));
    };
    reader.readAsDataURL(file);
  }

  async function updateIntegration(provider: "stripe" | "woocommerce" | "shopify", payload: { enabled?: boolean; newSecret?: string; rotateSecret?: boolean }) {
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
      setToast({ kind: "success", text: t.tIntegrationUpdated(provider.toUpperCase()) });
      await loadAll();
    } catch (e) {
      setToast({ kind: "error", text: e instanceof Error ? e.message : t.tIntegrationFailed });
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
      setToast({ kind: "success", text: t.tMemberInvited });
    } catch (err) {
      setToast({ kind: "error", text: err instanceof Error ? err.message : t.tInviteFailed });
    } finally {
      setSaving(false);
    }
  }

  async function removeMember(userId: string) {
    if (!confirm(t.removeMemberConfirm)) return;
    try {
      const r = await apiJson<{ members: Array<any> }>(`/api/v1/team?userId=${encodeURIComponent(userId)}`, {
        method: "DELETE",
      });
      setMembers(r.members);
      setToast({ kind: "success", text: t.tMemberRemoved });
    } catch (err) {
      setToast({ kind: "error", text: err instanceof Error ? err.message : t.tRemoveFailed });
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
      setToast({ kind: "error", text: err instanceof Error ? err.message : t.tKeyCreationFailed });
    } finally {
      setSaving(false);
    }
  }

  async function revokeKey(id: string) {
    if (!confirm(t.revokeConfirm)) return;
    try {
      await apiJson(`/api/v1/api-keys?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      setToast({ kind: "success", text: t.tKeyRevoked });
      await loadAll();
    } catch (err) {
      setToast({ kind: "error", text: err instanceof Error ? err.message : t.tRevokeFailed });
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
      setToast({ kind: "success", text: r.message || t.tPlanSwitched(planTier.toUpperCase()) });
      await Promise.all([loadAll(), reload()]);
    } catch (err) {
      setToast({ kind: "error", text: err instanceof Error ? err.message : t.tPlanFailed });
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
      setToast({ kind: "success", text: t.tPwUpdated });
    } catch (err) {
      setToast({ kind: "error", text: err instanceof Error ? err.message : t.tPwFailed });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteWorkspace() {
    if (deleteConfirm !== "DELETE_MY_WORKSPACE") {
      setToast({ kind: "error", text: t.tDeleteTypeError });
      return;
    }
    try {
      await apiJson("/api/v1/account/delete?confirm=DELETE_MY_WORKSPACE", { method: "DELETE" });
      router.replace("/login");
    } catch (err) {
      setToast({ kind: "error", text: err instanceof Error ? err.message : t.tDeletionFailed });
    }
  }

  function copy(text: string) {
    void navigator.clipboard.writeText(text);
    setToast({ kind: "success", text: t.tCopied });
  }

  if (loading || !s) {
    return (
      <div className="flex items-center gap-2 py-20 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" /> {t.loading}
      </div>
    );
  }

  const stripeInteg = integrations.find((i) => i.provider === "stripe");
  const wooInteg = integrations.find((i) => i.provider === "woocommerce");
  const shopifyInteg = integrations.find((i) => i.provider === "shopify");

  return (
    <div className="space-y-6">
      <PageHeader title={t.pageTitle} subtitle={t.pageSubtitle} />

      {/* Horizontal 7-Tab Bar */}
      <div className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
        {TAB_META.map((m) => {
          const Icon = m.icon;
          const active = tab === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => switchTab(m.id)}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
                active ? "bg-brand-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {TAB_LABELS[m.id]}
            </button>
          );
        })}
      </div>

      {toast && <Alert kind={toast.kind}>{toast.text}</Alert>}

      {/* TAB 1: Company & Legal Tax (BG-4) */}
      {tab === "company" && (
        <Card
          title={t.companyTitle}
          description={t.companyDesc}
          actions={
            <button type="button" disabled={saving} onClick={() => void saveSettings()} className={btnPrimary}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {t.saveChanges}
            </button>
          }
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className={labelCls}>
              {t.fLegalName}
              <input className={inputCls} value={s.legalName} onChange={(e) => setS({ ...s, legalName: e.target.value })} />
            </label>
            <label className={labelCls}>
              {t.fTradingName}
              <input className={inputCls} value={s.tradingName} onChange={(e) => setS({ ...s, tradingName: e.target.value })} />
            </label>
            <label className={labelCls}>
              {t.fManagingDirector}
              <input className={inputCls} value={s.managingDirector} onChange={(e) => setS({ ...s, managingDirector: e.target.value })} />
            </label>
            <label className={labelCls}>
              {t.fRegistrationId}
              <input className={inputCls} value={s.registrationId} onChange={(e) => setS({ ...s, registrationId: e.target.value })} />
            </label>
            <label className={`${labelCls} sm:col-span-2`}>
              {t.fStreet}
              <input className={inputCls} value={s.street} onChange={(e) => setS({ ...s, street: e.target.value })} />
            </label>
            <div className="grid grid-cols-3 gap-2 sm:col-span-2">
              <label className={labelCls}>{t.fPostalCode}<input className={inputCls} value={s.postalCode} onChange={(e) => setS({ ...s, postalCode: e.target.value })} /></label>
              <label className={labelCls}>{t.fCity}<input className={inputCls} value={s.city} onChange={(e) => setS({ ...s, city: e.target.value })} /></label>
              <label className={labelCls}>{t.fCountry}<input maxLength={2} className={`${inputCls} font-mono uppercase`} value={s.countryCode} onChange={(e) => setS({ ...s, countryCode: e.target.value.toUpperCase() })} /></label>
            </div>
            <label className={labelCls}>
              {t.fVatId}
              <div className="flex gap-2">
                <input className={`${inputCls} font-mono uppercase`} value={s.vatId} onChange={(e) => setS({ ...s, vatId: e.target.value })} placeholder="DE298765432" />
                <button type="button" disabled={viesLoading} onClick={() => void verifySelfVat()} className="mt-1 whitespace-nowrap rounded-lg border border-slate-300 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50">
                  {viesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.checkVies}
                </button>
              </div>
              {viesNote && <span className="mt-1 block text-[11px] font-semibold text-emerald-700">{viesNote}</span>}
            </label>
            <label className={labelCls}>
              {t.fTaxNumber}
              <input className={`${inputCls} font-mono`} value={s.taxNumber} onChange={(e) => setS({ ...s, taxNumber: e.target.value })} />
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 sm:col-span-2">
              <input type="checkbox" checked={s.isKleinunternehmer} onChange={(e) => setS({ ...s, isKleinunternehmer: e.target.checked })} />
              {t.fKleinunternehmer}
            </label>
            <label className={labelCls}>
              {t.fElectronicAddress}
              <input className={inputCls} value={s.electronicAddress} onChange={(e) => setS({ ...s, electronicAddress: e.target.value })} />
            </label>
            <label className={labelCls}>
              {t.fContactName}
              <input className={inputCls} value={s.contactName} onChange={(e) => setS({ ...s, contactName: e.target.value })} />
            </label>
            <label className={labelCls}>
              {t.fContactPhone}
              <input className={inputCls} value={s.contactPhone} onChange={(e) => setS({ ...s, contactPhone: e.target.value })} />
            </label>
            <label className={labelCls}>
              {t.fContactEmail}
              <input type="email" className={inputCls} value={s.contactEmail} onChange={(e) => setS({ ...s, contactEmail: e.target.value })} />
            </label>
            <div className="sm:col-span-2">
              <span className={labelCls}>{t.fLogo}</span>
              <div className="mt-2 flex items-center gap-4">
                {s.logoDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.logoDataUrl} alt="Company Logo" className="h-12 max-w-[160px] rounded border border-slate-200 object-contain p-1" />
                ) : (
                  <div className="flex h-12 w-24 items-center justify-center rounded border border-dashed border-slate-300 text-[11px] text-slate-400">{t.noLogo}</div>
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
                    {t.removeLogo}
                  </button>
                )}
              </div>
            </div>

            {/* Invoice design / PDF branding */}
            <div className="sm:col-span-2 mt-2 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <p className="text-xs font-bold text-navy-900">{t.designHeading}</p>
              <p className="mt-0.5 text-[11px] text-slate-500">{t.designHint}</p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className={labelCls}>
                  {t.fAccentColor}
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="color"
                      aria-label={t.fAccentColor}
                      value={/^#[0-9a-fA-F]{6}$/.test(s.brandAccentColor || "") ? s.brandAccentColor : "#011D42"}
                      onChange={(e) => setS({ ...s, brandAccentColor: e.target.value })}
                      className="h-9 w-12 shrink-0 rounded border border-slate-300 bg-white p-0.5"
                    />
                    <input
                      className={`${inputCls} mt-0 font-mono uppercase`}
                      value={s.brandAccentColor || ""}
                      onChange={(e) => setS({ ...s, brandAccentColor: e.target.value })}
                      placeholder="#011D42"
                    />
                  </div>
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 sm:mt-7">
                  <input
                    type="checkbox"
                    checked={Boolean(s.invoiceAccentBand)}
                    onChange={(e) => setS({ ...s, invoiceAccentBand: e.target.checked })}
                  />
                  {t.fAccentBand}
                </label>
                <label className={`${labelCls} sm:col-span-2`}>
                  {t.fFooterText}
                  <input
                    className={inputCls}
                    value={s.invoiceFooterText || ""}
                    onChange={(e) => setS({ ...s, invoiceFooterText: e.target.value })}
                    placeholder="EN 16931 Electronic Invoice — structured XML embedded."
                  />
                </label>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 2: Invoicing, Numbering & Banking (BG-16) */}
      {tab === "invoicing" && (
        <Card
          title={t.invoicingTitle}
          description={t.invoicingDesc}
          actions={
            <button type="button" disabled={saving} onClick={() => void saveSettings()} className={btnPrimary}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {t.saveChanges}
            </button>
          }
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className={`${labelCls} sm:col-span-2`}>
              {t.fIban}
              <input className={`${inputCls} font-mono uppercase`} value={s.iban} onChange={(e) => setS({ ...s, iban: e.target.value })} placeholder="DE89370400440532013000" />
              {s.iban && (
                <span className={`mt-1 block text-[11px] font-semibold ${validateIbanClient(s.iban) ? "text-emerald-700" : "text-red-700"}`}>
                  {validateIbanClient(s.iban) ? t.ibanValid : t.ibanInvalid}
                </span>
              )}
            </label>
            <label className={labelCls}>
              {t.fBic}
              <input className={`${inputCls} font-mono uppercase`} value={s.bic} onChange={(e) => setS({ ...s, bic: e.target.value })} />
            </label>
            <label className={labelCls}>
              {t.fAccountHolder}
              <input className={inputCls} value={s.accountHolder} onChange={(e) => setS({ ...s, accountHolder: e.target.value })} />
            </label>
            <label className={labelCls}>
              {t.fInvoicePrefix}
              <input className={`${inputCls} font-mono`} value={s.invoicePrefix} onChange={(e) => setS({ ...s, invoicePrefix: e.target.value })} />
            </label>
            <label className={labelCls}>
              {t.fCreditPrefix}
              <input className={`${inputCls} font-mono`} value={s.creditNotePrefix} onChange={(e) => setS({ ...s, creditNotePrefix: e.target.value })} />
            </label>
            <label className={labelCls}>
              {t.fNextSeq}
              <input type="number" min={1} className={`${inputCls} font-mono`} value={s.nextInvoiceSeq} onChange={(e) => setS({ ...s, nextInvoiceSeq: Math.max(1, Number(e.target.value) || 1) })} />
              <span className="mt-1 block text-[11px] text-slate-500">
                {t.nextInvoice} <span className="font-mono font-bold">{s.invoicePrefix}{String(s.nextInvoiceSeq).padStart(4, "0")}</span>
              </span>
            </label>
            <label className={labelCls}>
              {t.fDefaultFormat}
              <select className={inputCls} value={s.defaultFormat} onChange={(e) => setS({ ...s, defaultFormat: e.target.value })}>
                <option value="ZUGFERD_EN16931">ZUGFeRD 2.3 (PDF + XML)</option>
                <option value="FACTURX_EN16931">Factur-X 1.07 (PDF + XML)</option>
                <option value="XRECHNUNG_CII">XRechnung 3.0.2 CII</option>
                <option value="XRECHNUNG_UBL">XRechnung 3.0.2 UBL</option>
                <option value="PEPPOL_BIS_3">Peppol BIS 3.0</option>
              </select>
            </label>
            <label className={labelCls}>
              {t.fDocLanguage}
              <select className={inputCls} value={s.defaultLocale} onChange={(e) => setS({ ...s, defaultLocale: e.target.value })}>
                <option value="de">Deutsch (DE)</option>
                <option value="fr">Français (FR)</option>
                <option value="en">English (EN)</option>
              </select>
            </label>
            <label className={labelCls}>
              {t.fDueDays}
              <input type="number" min={0} className={inputCls} value={s.defaultDueDays} onChange={(e) => setS({ ...s, defaultDueDays: Number(e.target.value) || 0 })} />
            </label>
            <label className={labelCls}>
              {t.fRetention}
              <select className={inputCls} value={s.retentionYears} onChange={(e) => setS({ ...s, retentionYears: Number(e.target.value) === 10 ? 10 : 8 })}>
                <option value={8}>{t.retention8}</option>
                <option value={10}>{t.retention10}</option>
              </select>
            </label>
            <label className={labelCls}>
              {t.fPaymentTerms}
              <input className={inputCls} value={s.defaultPaymentTerms} onChange={(e) => setS({ ...s, defaultPaymentTerms: e.target.value })} />
            </label>
            <label className={`${labelCls} sm:col-span-2`}>
              {t.fFooterNotes}
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
              {t.rotatedSecret(rotatedSecret.provider.toUpperCase())}{" "}
              <code className="rounded bg-white px-2 py-0.5 font-mono text-xs">{rotatedSecret.secret}</code>{" "}
              <button type="button" onClick={() => copy(rotatedSecret.secret)} className="ml-2 underline">{t.copy}</button>
            </Alert>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card title={t.stripeTitle} description={t.stripeDesc}>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-700">{t.stripeUrlLabel}</span>
                  <div className="mt-1 flex gap-2">
                    <input readOnly value={webhookUrls.stripe} className={`${inputCls} mt-0 bg-slate-50 font-mono text-[11px]`} />
                    <button type="button" onClick={() => copy(webhookUrls.stripe)} className={btnSecondary}><Copy className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <p className="text-slate-500">
                  {t.storedSecret} <code className="font-mono font-semibold text-slate-800">{stripeInteg?.hasSecret ? stripeInteg.secretMasked : t.notSet}</code>
                </p>
                <div className="flex gap-2">
                  <input
                    value={stripeSecretInput}
                    onChange={(e) => setStripeSecretInput(e.target.value)}
                    placeholder={t.stripePlaceholder}
                    className={`${inputCls} mt-0 font-mono text-xs`}
                  />
                  <button type="button" disabled={!stripeSecretInput.trim() || saving} onClick={() => void updateIntegration("stripe", { enabled: true, newSecret: stripeSecretInput })} className={btnPrimary}>
                    {t.save}
                  </button>
                </div>
                <button type="button" disabled={saving} onClick={() => void updateIntegration("stripe", { enabled: true, rotateSecret: true })} className={btnSecondary}>
                  <RefreshCw className="h-3.5 w-3.5" /> {t.rotateSecret}
                </button>
              </div>
            </Card>

            <Card title={t.wooTitle} description={t.wooDesc}>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-700">{t.wooUrlLabel}</span>
                  <div className="mt-1 flex gap-2">
                    <input readOnly value={webhookUrls.woocommerce} className={`${inputCls} mt-0 bg-slate-50 font-mono text-[11px]`} />
                    <button type="button" onClick={() => copy(webhookUrls.woocommerce)} className={btnSecondary}><Copy className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <p className="text-slate-500">
                  {t.storedSecret} <code className="font-mono font-semibold text-slate-800">{wooInteg?.hasSecret ? wooInteg.secretMasked : t.notSet}</code>
                </p>
                <div className="flex gap-2">
                  <input
                    value={wooSecretInput}
                    onChange={(e) => setWooSecretInput(e.target.value)}
                    placeholder={t.wooPlaceholder}
                    className={`${inputCls} mt-0 font-mono text-xs`}
                  />
                  <button type="button" disabled={!wooSecretInput.trim() || saving} onClick={() => void updateIntegration("woocommerce", { enabled: true, newSecret: wooSecretInput })} className={btnPrimary}>
                    {t.save}
                  </button>
                </div>
                <button type="button" disabled={saving} onClick={() => void updateIntegration("woocommerce", { enabled: true, rotateSecret: true })} className={btnSecondary}>
                  <RefreshCw className="h-3.5 w-3.5" /> {t.rotateSecret}
                </button>
              </div>
            </Card>

            <Card title={t.shopifyTitle} description={t.shopifyDesc}>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-700">{t.shopifyUrlLabel}</span>
                  <div className="mt-1 flex gap-2">
                    <input readOnly value={webhookUrls.shopify} className={`${inputCls} mt-0 bg-slate-50 font-mono text-[11px]`} />
                    <button type="button" onClick={() => copy(webhookUrls.shopify)} className={btnSecondary}><Copy className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <p className="text-slate-500">
                  {t.storedSecret} <code className="font-mono font-semibold text-slate-800">{shopifyInteg?.hasSecret ? shopifyInteg.secretMasked : t.notSet}</code>
                </p>
                <div className="flex gap-2">
                  <input
                    value={shopifySecretInput}
                    onChange={(e) => setShopifySecretInput(e.target.value)}
                    placeholder={t.shopifyPlaceholder}
                    className={`${inputCls} mt-0 font-mono text-xs`}
                  />
                  <button type="button" disabled={!shopifySecretInput.trim() || saving} onClick={() => void updateIntegration("shopify", { enabled: true, newSecret: shopifySecretInput })} className={btnPrimary}>
                    {t.save}
                  </button>
                </div>
                <button type="button" disabled={saving} onClick={() => void updateIntegration("shopify", { enabled: true, rotateSecret: true })} className={btnSecondary}>
                  <RefreshCw className="h-3.5 w-3.5" /> {t.rotateSecret}
                </button>
              </div>
            </Card>
          </div>

          <Card
            title={t.accountantTitle}
            description={t.accountantDesc}
            actions={
              <button type="button" disabled={saving} onClick={() => void saveSettings({ accountantCcEmail: s.accountantCcEmail })} className={btnPrimary}>
                <Save className="h-4 w-4" /> {t.saveCc}
              </button>
            }
          >
            <label className={`${labelCls} max-w-md`}>
              {t.fAccountantCc}
              <input type="email" className={inputCls} value={s.accountantCcEmail} onChange={(e) => setS({ ...s, accountantCcEmail: e.target.value })} placeholder="steuerberater@kanzlei.de" />
            </label>
          </Card>

          <Card title={t.logsTitle}>
            {webhookLogs.length === 0 ? (
              <p className="text-xs text-slate-500">{t.logsEmpty}</p>
            ) : (
              <div className="-mx-6 -my-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50 uppercase text-slate-500">
                    <tr>
                      <th className="px-6 py-2.5 text-left font-semibold">{t.thTime}</th>
                      <th className="px-6 py-2.5 text-left font-semibold">{t.thProvider}</th>
                      <th className="px-6 py-2.5 text-left font-semibold">{t.thEvent}</th>
                      <th className="px-6 py-2.5 text-left font-semibold">{t.thHttp}</th>
                      <th className="px-6 py-2.5 text-left font-semibold">{t.thSummary}</th>
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
          <Card title={t.inviteTitle} description={t.inviteDesc}>
            <form onSubmit={inviteMember} className="grid grid-cols-1 gap-3 sm:grid-cols-4 sm:items-end">
              <label className={labelCls}>
                {t.fEmail}
                <input type="email" required className={inputCls} value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="berater@kanzlei.de" />
              </label>
              <label className={labelCls}>
                {t.fFullName}
                <input className={inputCls} value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="Dr. Clara Meier" />
              </label>
              <label className={labelCls}>
                {t.fRole}
                <select className={inputCls} value={inviteRole} onChange={(e) => setInviteRole(e.target.value as any)}>
                  <option value="accountant">{t.roleAccountant}</option>
                  <option value="member">{t.roleMember}</option>
                  <option value="admin">{t.roleAdmin}</option>
                  <option value="owner">{t.roleOwner}</option>
                </select>
              </label>
              <button type="submit" disabled={saving} className={btnPrimary}>
                <UserPlus className="h-4 w-4" /> {t.invite}
              </button>
            </form>
          </Card>

          <Card title={t.membersTitle(members.length)}>
            <div className="-mx-6 -my-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-2.5 text-left font-semibold">{t.thMember}</th>
                    <th className="px-6 py-2.5 text-left font-semibold">{t.thRole}</th>
                    <th className="px-6 py-2.5 text-left font-semibold">{t.thJoined}</th>
                    <th className="px-6 py-2.5 text-right font-semibold">{t.thAction}</th>
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
                          {t.remove}
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
              {t.keyCreatedAlert}{" "}
              <code className="rounded bg-white px-2 py-0.5 font-mono text-xs">{createdKeyPlaintext}</code>{" "}
              <button type="button" onClick={() => copy(createdKeyPlaintext)} className="ml-2 underline">{t.copy}</button>
            </Alert>
          )}

          <Card title={t.generateKeyTitle} description={t.generateKeyDesc}>
            <form onSubmit={createApiKey} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
                <label className={`${labelCls} sm:col-span-2`}>
                  {t.fKeyLabel}
                  <input className={inputCls} value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="ERP Production Sync" />
                </label>
                <button type="submit" disabled={saving} className={btnPrimary}>
                  <KeyRound className="h-4 w-4" /> {t.createKey}
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

          <Card title={t.issuedKeys(apiKeys.length)}>
            {apiKeys.length === 0 ? (
              <p className="text-xs text-slate-500">{t.keysEmpty}</p>
            ) : (
              <div className="-mx-6 -my-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50 uppercase text-slate-500">
                    <tr>
                      <th className="px-6 py-2.5 text-left font-semibold">{t.thName}</th>
                      <th className="px-6 py-2.5 text-left font-semibold">{t.thPrefix}</th>
                      <th className="px-6 py-2.5 text-left font-semibold">{t.thScopes}</th>
                      <th className="px-6 py-2.5 text-left font-semibold">{t.thStatus}</th>
                      <th className="px-6 py-2.5 text-right font-semibold">{t.thAction}</th>
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
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">{t.statusRevoked}</span>
                          ) : (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">{t.statusActive}</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-right">
                          {!k.revokedAt && (
                            <button type="button" onClick={() => void revokeKey(k.id)} className="text-xs font-bold text-red-600 hover:underline">
                              {t.revoke}
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
            title={t.subTitle}
            actions={
              billing.activePlan.tier !== "free" && !billing.activePlan.cancelAtPeriodEnd ? (
                <button
                  type="button"
                  disabled={saving}
                  onClick={async () => {
                    if (!confirm(t.cancelRenewalConfirm)) return;
                    setSaving(true);
                    try {
                      const r = await apiJson<{ message: string }>("/api/v1/billing/checkout", { method: "DELETE" });
                      setToast({ kind: "success", text: r.message });
                      await Promise.all([loadAll(), reload()]);
                    } catch (err) {
                      setToast({ kind: "error", text: err instanceof Error ? err.message : t.tCancellationFailed });
                    } finally {
                      setSaving(false);
                    }
                  }}
                  className={btnDanger}
                >
                  {t.cancelRenewal}
                </button>
              ) : null
            }
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">{t.activePlan}</p>
                <p className="mt-1 text-2xl font-extrabold uppercase text-navy-900">
                  {billing.activePlan.trialActive ? t.trial15 : billing.activePlan.tier}
                </p>
                {billing.activePlan.trialActive && (
                  <p className="mt-1 text-xs font-bold text-accent-700">
                    {t.trialDaysLeft(billing.activePlan.trialDaysRemaining)}
                  </p>
                )}
                {billing.activePlan.cancelAtPeriodEnd && (
                  <p className="mt-1 text-xs font-bold text-amber-700">
                    {t.renewalCancelled}
                  </p>
                )}
              </div>
              <div className="w-full max-w-sm">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{t.finalizedThisMonth}</span>
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {[
              { id: "free", name: "Free", price: "€0", quota: t.quotaInvoices("5"), desc: t.planFreeDesc },
              { id: "starter", name: "Starter", price: "€12", quota: t.quotaInvoices("40"), desc: t.planStarterDesc },
              { id: "solo", name: "Solo", price: "€29", quota: t.quotaInvoices("150"), desc: t.planSoloDesc, featured: true },
              { id: "business", name: "Business", price: "€49", quota: t.quotaInvoices("500"), desc: t.planBusinessDesc },
              { id: "agency", name: "Agency", price: "€129", quota: t.quotaInvoices("2,500"), desc: t.planAgencyDesc },
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
                          {t.recommended}
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
                    {current ? t.currentPlan : t.switchTo(p.name)}
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
          <Card title="Two-Factor Authentication (2FA)" description="Add an authenticator-app code to your login for strong account protection.">
            {twoFaBackup ? (
              <div className="space-y-3">
                <p className="text-xs font-bold text-emerald-700">
                  2FA is now enabled. Save these one-time backup codes somewhere safe — each works once if you lose your device.
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {twoFaBackup.map((c) => (
                    <span key={c} className="rounded-lg bg-slate-100 px-2 py-1.5 text-center font-mono text-xs text-navy-900">{c}</span>
                  ))}
                </div>
                <button type="button" onClick={() => setTwoFaBackup(null)} className={btnSecondary}>
                  I&apos;ve saved my backup codes
                </button>
              </div>
            ) : twoFaSetup ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  1. Scan this QR in your authenticator app (Google Authenticator, Authy, 1Password…), or enter the key manually.
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={twoFaSetup.qrDataUrl} alt="2FA QR code" width={176} height={176} className="rounded-lg border border-slate-200" />
                <p className="text-[11px] text-slate-500">
                  Manual key: <code className="font-mono font-semibold text-slate-800">{twoFaSetup.secret}</code>
                </p>
                <label className={labelCls}>
                  2. Enter the 6-digit code to confirm
                  <input value={twoFaCode} onChange={(e) => setTwoFaCode(e.target.value)} inputMode="numeric" placeholder="123456" className={`${inputCls} font-mono`} />
                </label>
                <div className="flex gap-2">
                  <button type="button" disabled={saving || twoFaCode.trim().length < 6} onClick={() => void confirm2fa()} className={btnPrimary}>
                    <Lock className="h-4 w-4" /> Verify &amp; enable
                  </button>
                  <button type="button" onClick={() => { setTwoFaSetup(null); setTwoFaCode(""); }} className={btnSecondary}>Cancel</button>
                </div>
              </div>
            ) : twoFa.enabled ? (
              <div className="space-y-3">
                <p className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  ✓ 2FA is ON · {twoFa.backupCount} backup codes left
                </p>
                <label className={labelCls}>
                  Enter your account password to turn 2FA off
                  <input type="password" value={twoFaPassword} onChange={(e) => setTwoFaPassword(e.target.value)} className={inputCls} />
                </label>
                <button type="button" disabled={saving} onClick={() => void disable2fa()} className={btnDanger}>Disable 2FA</button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  2FA is currently <strong className="text-navy-900">off</strong>. When enabled, signing in also requires a one-time code from your phone.
                </p>
                <button type="button" disabled={saving} onClick={() => void start2faSetup()} className={btnPrimary}>
                  <Lock className="h-4 w-4" /> Enable 2FA
                </button>
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card title={t.changePwTitle} description={t.changePwDesc}>
              <form onSubmit={handleChangePassword} className="space-y-3">
                <label className={labelCls}>
                  {t.fCurrentPw}
                  <input type="password" required className={inputCls} value={currPw} onChange={(e) => setCurrPw(e.target.value)} />
                </label>
                <label className={labelCls}>
                  {t.fNewPw}
                  <input type="password" required minLength={8} className={inputCls} value={newPw} onChange={(e) => setNewPw(e.target.value)} />
                </label>
                <button type="submit" disabled={saving} className={btnPrimary}>
                  <Lock className="h-4 w-4" /> {t.updatePw}
                </button>
              </form>
            </Card>

            <Card title={t.gdprTitle} description={t.gdprDesc}>
              <div className="space-y-4">
                <div>
                  <a href="/api/v1/account/gdpr-export" className={btnSecondary}>
                    <Download className="h-4 w-4" /> {t.gdprExport}
                  </a>
                </div>
                <div className="rounded-xl border border-red-200 bg-red-50/60 p-4">
                  <p className="text-xs font-bold text-red-800">{t.dangerZone}</p>
                  <p className="mt-1 text-[11px] text-red-700">
                    {t.dangerText}
                  </p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder={t.deletePlaceholder}
                      className={`${inputCls} mt-0 font-mono text-xs`}
                    />
                    <button type="button" onClick={() => void handleDeleteWorkspace()} className={btnDanger}>
                      <Trash2 className="h-4 w-4" /> {t.deleteBtn}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Card
            title={t.chainTitle}
            description={
              chainCheck?.verified
                ? t.chainVerified(chainCheck.totalEvents)
                : t.chainPending
            }
            actions={
              <button type="button" onClick={() => void loadAll()} className={btnSecondary}>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {t.reverify}
              </button>
            }
          >
            <div className="-mx-6 -my-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-2.5 text-left font-semibold">{t.thTime}</th>
                    <th className="px-6 py-2.5 text-left font-semibold">{t.thEvent}</th>
                    <th className="px-6 py-2.5 text-left font-semibold">{t.thRef}</th>
                    <th className="px-6 py-2.5 text-left font-semibold">{t.thActor}</th>
                    <th className="px-6 py-2.5 text-left font-semibold">{t.thHash}</th>
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
