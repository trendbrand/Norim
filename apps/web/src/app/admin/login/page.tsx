"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";

/**
 * Platform staff sign-in — a SEPARATE realm from the customer login (/login).
 * Authenticating here sets the staff-only session cookie; it has no effect on,
 * and is not satisfied by, any customer session.
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Staff sign-in failed.");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Staff sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-900 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-navy-700 bg-navy-800/60 p-7 shadow-2xl">
        <div className="flex items-center gap-2 text-accent-400">
          <ShieldAlert className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-wide">Platform Control Plane</span>
        </div>
        <h1 className="mt-3 text-xl font-extrabold text-white">Staff sign-in</h1>
        <p className="mt-1 text-xs leading-relaxed text-navy-100">
          This is a restricted operations realm, separate from customer accounts. Customer credentials do not grant
          access here.
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="mt-5 space-y-3">
          <label className="block text-xs font-bold text-navy-100">
            Staff email
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-navy-600 bg-navy-900 px-3 py-2.5 text-sm text-white placeholder-navy-300 outline-none focus:border-accent-500"
              placeholder="operator@norminvoice.eu"
            />
          </label>
          <label className="block text-xs font-bold text-navy-100">
            Staff password
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-navy-600 bg-navy-900 px-3 py-2.5 text-sm text-white placeholder-navy-300 outline-none focus:border-accent-500"
              placeholder="••••••••"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-accent-600 disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />} Sign in to admin
          </button>
        </form>
        <p className="mt-4 text-[11px] text-navy-300">
          Privileged actions are logged. Unauthorized access attempts are recorded.
        </p>
      </div>
    </div>
  );
}
