"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Alert, btnPrimary, inputCls, labelCls } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ message: string; devResetPath?: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setDone({ message: data.message, devResetPath: data.devResetPath });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset link");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-navy-950 py-16 px-4">
      <div className="mx-auto max-w-md rounded-3xl border border-navy-800 bg-white p-8 shadow-2xl">
        <BrandLogo variant="light" />
        <h1 className="mt-6 text-2xl font-extrabold text-navy-900">Reset your password</h1>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
          Enter your account email and we will generate a single-use password reset link valid for 60 minutes.
        </p>

        {done ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900">
              <p className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Reset Request Processed
              </p>
              <p className="mt-1">{done.message}</p>
              {done.devResetPath && (
                <p className="mt-3">
                  Local dev link:{" "}
                  <Link href={done.devResetPath} className="font-bold text-accent-700 underline">
                    Open Reset Form →
                  </Link>
                </p>
              )}
            </div>
            <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-900 hover:text-accent-600">
              <ArrowLeft className="h-3.5 w-3.5" /> Return to Log in
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className={labelCls}>
              Work Email Address
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.eu"
                className={inputCls}
              />
            </label>
            {error && <Alert kind="error">{error}</Alert>}
            <button type="submit" disabled={loading} className={`${btnPrimary} w-full py-3 text-sm`}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              {loading ? "Sending…" : "Send Reset Link"}
            </button>
            <div className="pt-2 text-center">
              <Link href="/login" className="text-xs font-bold text-navy-800 hover:text-accent-600">
                ← Back to Log in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
