"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ShieldCheck, Sparkles } from "lucide-react";

function safeNext(next: string | null): string | null {
  if (!next) return null;
  // Prevent open redirects: only allow same-site relative paths
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  return next;
}

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const nextPath = safeNext(params.get("next"));
  const [mode, setMode] = useState<"login" | "register">(params.get("mode") === "register" ? "register" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [countryCode, setCountryCode] = useState("DE");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function redirectAfterAuth(onboardingCompleted: boolean) {
    const target = !onboardingCompleted ? "/onboarding" : nextPath || "/dashboard";
    router.replace(target);
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "register" && !acceptTerms) {
      setError("Please accept the Terms of Service and Privacy Policy to continue.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        mode === "login" ? { email, password } : { email, password, fullName, orgName, countryCode };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
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

  const input = "mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-700">
          <ShieldCheck className="h-4 w-4" />
          Secure EU workspace
        </div>
        <h1 className="mt-2 text-2xl font-extrabold text-slate-900">
          {mode === "login" ? "Sign in to NormInvoice" : "Create your company workspace"}
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          {nextPath
            ? "Please sign in to continue to the requested page."
            : mode === "login"
              ? "Access your invoices, customers, exports and settings."
              : "Your workspace is private and isolated — no other company can see your data."}
        </p>

        <div className="mt-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-xs font-bold">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              className={`rounded-lg py-2 ${mode === m ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
            >
              {m === "login" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {mode === "register" && (
            <>
              <label className="block text-xs font-semibold text-slate-700">
                Full name
                <input required autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Anna Schmidt" className={input} />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Company name
                <input required autoComplete="organization" value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Schmidt Consulting GmbH" className={input} />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Country of establishment
                <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className={input}>
                  <option value="DE">Germany (ZUGFeRD / XRechnung)</option>
                  <option value="AT">Austria</option>
                  <option value="FR">France (Factur-X)</option>
                  <option value="BE">Belgium (Peppol)</option>
                  <option value="NL">Netherlands</option>
                  <option value="LU">Luxembourg</option>
                </select>
              </label>
            </>
          )}

          <label className="block text-xs font-semibold text-slate-700">
            Work email
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="billing@company.de" className={input} />
          </label>

          <label className="block text-xs font-semibold text-slate-700">
            Password
            <input
              type="password"
              required
              minLength={8}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "register" ? "Min. 8 characters, letters + numbers" : "Your password"}
              className={input}
            />
          </label>

          {mode === "register" && (
            <label className="flex items-start gap-2 text-xs text-slate-600">
              <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="mt-0.5" />
              <span>
                I accept the{" "}
                <Link href="/legal/terms" className="font-semibold text-brand-700 underline">Terms</Link>, the{" "}
                <Link href="/legal/privacy" className="font-semibold text-brand-700 underline">Privacy Policy</Link> and the{" "}
                <Link href="/legal/dpa" className="font-semibold text-brand-700 underline">DPA (Art. 28 GDPR)</Link>.
              </span>
            </label>
          )}

          {error && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            <Lock className="h-4 w-4" />
            {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create workspace"}
          </button>
        </form>

        <div className="mt-5 border-t border-slate-200 pt-5">
          <button
            type="button"
            disabled={loading}
            onClick={() => void loginDemo()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-100"
          >
            <Sparkles className="h-4 w-4 text-brand-600" />
            Explore the demo workspace (sample data)
          </button>
          <p className="mt-2 text-center text-[11px] text-slate-400">
            The demo is a separate sample company. Your own account is always private.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-slate-500">Loading…</div>}>
      <LoginInner />
    </Suspense>
  );
}
