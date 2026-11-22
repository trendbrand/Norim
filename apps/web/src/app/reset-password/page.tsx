"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, Lock } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Alert, btnPrimary, inputCls, labelCls } from "@/components/ui";

function ResetInner() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Password reset failed");
      setSuccess(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-navy-950 py-16 px-4">
      <div className="mx-auto max-w-md rounded-3xl border border-navy-800 bg-white p-8 shadow-2xl">
        <BrandLogo variant="light" />
        <h1 className="mt-6 text-2xl font-extrabold text-navy-900">Choose a new password</h1>

        {!token ? (
          <div className="mt-5 space-y-4">
            <Alert kind="error">Missing password reset token. Please request a fresh reset link.</Alert>
            <Link href="/forgot-password" className={`${btnPrimary} w-full`}>
              Request New Reset Link
            </Link>
          </div>
        ) : success ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900">
              <p className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Password Updated
              </p>
              <p className="mt-1">{success}</p>
            </div>
            <Link href="/login" className={`${btnPrimary} w-full py-3 text-sm`}>
              Continue to Log in →
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className={labelCls}>
              New Password (min 8 chars, letters + numbers)
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
              />
            </label>
            <label className={labelCls}>
              Confirm New Password
              <input
                type="password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={inputCls}
              />
            </label>
            {error && <Alert kind="error">{error}</Alert>}
            <button type="submit" disabled={loading} className={`${btnPrimary} w-full py-3 text-sm`}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              Update Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-slate-500">Loading…</div>}>
      <ResetInner />
    </Suspense>
  );
}
