"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Crown,
  Eye,
  EyeOff,
  FileText,
  Gift,
  Layers,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

function safeNext(next: string | null): string | null {
  if (!next) return null;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  return next;
}

const VALUE_PILLARS = [
  { icon: FileText, title: "Create & Send Electronic Invoices", sub: "EN 16931, ZUGFeRD 2.3, Factur-X & XRechnung" },
  { icon: Layers, title: "Manage Invoices & Payments", sub: "Outgoing billing, supplier inbox & AR tracking" },
  { icon: ShieldCheck, title: "Stay Compliant with EU Requirements", sub: "Pre-send validation & GoBD SHA-256 audit logs" },
  { icon: BarChart3, title: "Track Reports & Business Insights", sub: "Real-time trends, VAT breakdowns & DATEV/FEC" },
];

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const nextPath = safeNext(params.get("next"));
  const initialMode = params.get("mode") === "register" ? "register" : "login";
  const initialPlan = params.get("plan") === "free" ? "free" : "trial";

  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [countryCode, setCountryCode] = useState("DE");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [twoFactor, setTwoFactor] = useState(false);
  const [totpCode, setTotpCode] = useState("");

  function redirectAfterAuth(onboardingCompleted: boolean) {
    const target = !onboardingCompleted ? "/onboarding" : nextPath || "/dashboard";
    router.replace(target);
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "register" && !acceptTerms) {
      setError("Please accept the Terms of Service and acknowledge the Privacy Policy to continue.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const code = totpCode.trim();
      const secondFactor = code ? (code.includes("-") ? { backupCode: code } : { totpCode: code }) : {};
      const payload =
        mode === "login"
          ? { email, password, rememberMe, ...secondFactor }
          : { email, password, fullName, orgName, countryCode, marketingOptIn, startPlan: initialPlan };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.twoFactorRequired) {
        // Prompt for the 2FA code (first pass), or show an error for a wrong code.
        setTwoFactor(true);
        setError(data.error || null);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Authentication failed");
      redirectAfterAuth(Boolean(data.onboardingCompleted));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication error");
    } finally {
      setLoading(false);
    }
  }

  async function loginDemo() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demo: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Demo login failed");
      redirectAfterAuth(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo login failed");
    } finally {
      setLoading(false);
    }
  }

  const input =
    "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-slate-400 transition focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-100";

  return (
    <div className="relative overflow-hidden bg-navy-950 py-10 sm:py-16 px-4 sm:px-6">
      {/* Subtle brand orange curves */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-accent-500/15 blur-3xl"
      />

      <div className="animate-fade-in-up relative mx-auto grid max-w-5xl grid-cols-1 overflow-hidden rounded-3xl border border-navy-800 bg-navy-900 shadow-2xl lg:grid-cols-12">
        {/* Left Navy Branded Column (Matches Approved Design) */}
        <div className="relative flex flex-col justify-between p-8 text-white sm:p-10 lg:col-span-6">
          <div>
            <BrandLogo variant="dark" />
            <h1 className="mt-7 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Welcome to NormInvoice
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-navy-200">
              Create, send, receive, and manage electronic invoices with a simple, compliant, and modern European
              platform.
            </p>

            <ul className="mt-8 space-y-4">
              {VALUE_PILLARS.map((p) => {
                const Icon = p.icon;
                return (
                  <li key={p.title} className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent-500/40 bg-navy-800 text-accent-500">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{p.title}</p>
                      <p className="text-xs text-navy-200">{p.sub}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-navy-800">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent-500/60 bg-navy-800/80 px-4 py-2 text-xs font-bold text-white">
              <Gift className="h-4 w-4 text-accent-500" />
              <span>Free plan available</span>
              <span className="text-accent-400">·</span>
              <span className="text-accent-400">15-day free trial</span>
            </div>
            <p className="mt-3 text-[11px] text-navy-300">
              Every organization workspace is strictly isolated. No credit card is required to start your 15-day trial.
            </p>
          </div>
        </div>

        {/* Right Clean White Form Column */}
        <div className="bg-white p-7 sm:p-10 lg:col-span-6">
          {/* Orange / Neutral Segmented Toggle */}
          <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-xs font-extrabold">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={`rounded-lg py-2.5 transition-all ${
                  mode === m ? "bg-accent-500 text-white shadow-sm" : "text-navy-800 hover:text-navy-950"
                }`}
              >
                {m === "login" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>

          <div className="mt-6 text-center">
            <h2 className="text-2xl font-extrabold tracking-tight text-navy-900">
              {mode === "login" ? "Log in to NormInvoice" : "Create your workspace"}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {nextPath
                ? "Please sign in to continue to your requested workspace page."
                : mode === "login"
                  ? "Access your invoices, compliance reports, and business workspace."
                  : "Starts immediately with a real 15-day free trial — no credit card needed."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "register" && (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="block text-xs font-bold text-navy-800">
                    Full name
                    <input
                      required
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Anna Schmidt"
                      className={input}
                    />
                  </label>
                  <label className="block text-xs font-bold text-navy-800">
                    Company name
                    <input
                      required
                      autoComplete="organization"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="Schmidt GmbH"
                      className={input}
                    />
                  </label>
                </div>
                <label className="block text-xs font-bold text-navy-800">
                  Primary country
                  <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className={input}>
                    <option value="DE">Germany (ZUGFeRD / XRechnung)</option>
                    <option value="BE">Belgium (Peppol BIS 3.0)</option>
                    <option value="FR">France (Factur-X 1.07)</option>
                    <option value="PL">Poland (KSeF)</option>
                    <option value="IT">Italy (FatturaPA)</option>
                    <option value="ES">Spain</option>
                    <option value="NL">Netherlands</option>
                    <option value="AT">Austria</option>
                    <option value="GB">United Kingdom</option>
                  </select>
                </label>
              </>
            )}

            <label className="block text-xs font-bold text-navy-800">
              Email address
              <div className="relative mt-1">
                <Mail className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your work email"
                  className={`${input} mt-0 pl-10`}
                />
              </div>
            </label>

            <label className="block text-xs font-bold text-navy-800">
              Password
              <div className="relative mt-1">
                <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type={showPw ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "register" ? "Min. 8 chars (letters + numbers)" : "Enter your password"}
                  className={`${input} mt-0 pl-10 pr-10`}
                />
                <button
                  type="button"
                  aria-label={showPw ? "Hide password" : "Show password"}
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-2.5 rounded-lg p-1 text-slate-400 hover:text-navy-900"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            {mode === "login" ? (
              <div className="flex items-center justify-between text-xs">
                <label className="inline-flex items-center gap-2 font-medium text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-3.5 w-3.5 accent-accent-500"
                  />
                  Remember me
                </label>
                <Link href="/forgot-password" className="font-bold text-accent-600 hover:text-accent-700 hover:underline">
                  Forgot password?
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5 text-xs text-slate-600">
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 accent-accent-500"
                  />
                  <span>
                    I agree to the{" "}
                    <Link href="/terms" className="font-bold text-navy-900 underline">Terms of Service</Link>, acknowledge the{" "}
                    <Link href="/privacy" className="font-bold text-navy-900 underline">Privacy Policy</Link>, and accept the{" "}
                    <Link href="/dpa" className="font-bold text-navy-900 underline">DPA</Link>.
                  </span>
                </label>
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={marketingOptIn}
                    onChange={(e) => setMarketingOptIn(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 accent-accent-500"
                  />
                  <span>Optional: Send me product updates and European e-invoicing compliance news.</span>
                </label>
              </div>
            )}

            {mode === "login" && twoFactor && (
              <label className="block text-xs font-bold text-navy-800">
                Two-factor code
                <div className="relative mt-1">
                  <ShieldCheck className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    autoFocus
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    placeholder="6-digit code or backup code"
                    className={`${input} mt-0 pl-10`}
                  />
                </div>
                <p className="mt-1 font-medium text-slate-500">
                  Enter the code from your authenticator app, or a one-time backup code.
                </p>
              </label>
            )}

            {error && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-accent-600 active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? "Please wait…" : mode === "login" ? (twoFactor ? "Verify & log in" : "Log in") : "Create Account"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          {/* Trial / Free Plan Pill */}
          <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-accent-50 px-4 py-2.5 text-xs font-bold text-navy-900">
            <Crown className="h-4 w-4 text-accent-500" />
            <span>Free plan available · 15-day free trial</span>
          </div>

          <p className="mt-4 text-center text-xs text-slate-600">
            {mode === "login" ? (
              <>
                New to NormInvoice?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError(null);
                  }}
                  className="font-extrabold text-accent-600 underline hover:text-accent-700"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
                  className="font-extrabold text-accent-600 underline hover:text-accent-700"
                >
                  Log in
                </button>
              </>
            )}
          </p>

          {/* Preserved Demo Sandbox Workspace Access */}
          <div className="mt-5 border-t border-slate-200 pt-5">
            <button
              type="button"
              disabled={loading}
              onClick={() => void loginDemo()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-navy-200 bg-canvas px-4 py-2.5 text-xs font-bold text-navy-900 transition hover:bg-navy-50"
            >
              <Sparkles className="h-4 w-4 text-accent-500" />
              Explore Demo Workspace (Sample Data)
            </button>
            <p className="mt-1.5 text-center text-[11px] text-slate-400">
              Separate sample organization. Your registered company workspace is always 100% private.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-slate-500">Loading authentication…</div>}>
      <LoginInner />
    </Suspense>
  );
}
