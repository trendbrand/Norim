"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { btnPrimary } from "@/components/ui";

function VerifyInner() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [state, setState] = useState<"loading" | "ok" | "err">(token ? "loading" : "err");
  const [msg, setMsg] = useState(token ? "Verifying your email address…" : "Missing verification token.");

  useEffect(() => {
    if (!token) return;
    void fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || "Verification failed");
        setState("ok");
        setMsg(d.message || "Email verified.");
      })
      .catch((err) => {
        setState("err");
        setMsg(err instanceof Error ? err.message : "Invalid or expired verification link.");
      });
  }, [token]);

  return (
    <div className="bg-navy-950 py-16 px-4">
      <div className="mx-auto max-w-md rounded-3xl border border-navy-800 bg-white p-8 text-center shadow-2xl">
        <div className="flex justify-center">
          <BrandLogo variant="light" />
        </div>
        <div className="mt-6 flex justify-center">
          {state === "loading" ? (
            <Loader2 className="h-10 w-10 animate-spin text-accent-500" />
          ) : state === "ok" ? (
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          ) : (
            <XCircle className="h-10 w-10 text-red-600" />
          )}
        </div>
        <h1 className="mt-4 text-xl font-extrabold text-navy-900">
          {state === "ok" ? "Email Verified" : state === "loading" ? "Verifying…" : "Verification Failed"}
        </h1>
        <p className="mt-2 text-xs text-slate-600">{msg}</p>
        <div className="mt-6">
          <Link href="/dashboard" className={`${btnPrimary} w-full py-3 text-sm`}>
            Continue to Workspace →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-slate-500">Verifying…</div>}>
      <VerifyInner />
    </Suspense>
  );
}
