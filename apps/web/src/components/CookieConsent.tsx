"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, SlidersHorizontal, X } from "lucide-react";

const STORAGE_KEY = "norminvoice_cookie_consent_v1";

export interface CookiePreferences {
  necessary: true;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
}

export function openCookieSettings() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("norminvoice:open-cookie-settings"));
  }
}

export function CookieConsent() {
  const [bannerOpen, setBannerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>({
    necessary: true,
    preferences: false,
    analytics: false,
    marketing: false,
    updatedAt: "",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<CookiePreferences>;
        setPrefs({
          necessary: true,
          preferences: Boolean(parsed.preferences),
          analytics: Boolean(parsed.analytics),
          marketing: Boolean(parsed.marketing),
          updatedAt: parsed.updatedAt || "",
        });
      } else {
        setBannerOpen(true);
      }
    } catch {
      setBannerOpen(true);
    }

    const onOpen = () => {
      setBannerOpen(false);
      setModalOpen(true);
    };
    window.addEventListener("norminvoice:open-cookie-settings", onOpen);
    return () => window.removeEventListener("norminvoice:open-cookie-settings", onOpen);
  }, []);

  function saveChoice(next: Omit<CookiePreferences, "necessary" | "updatedAt">) {
    const record: CookiePreferences = {
      necessary: true,
      preferences: next.preferences,
      analytics: next.analytics,
      marketing: next.marketing,
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {
      // ignore storage errors in private mode
    }
    setPrefs(record);
    setBannerOpen(false);
    setModalOpen(false);
  }

  if (!bannerOpen && !modalOpen) return null;

  return (
    <>
      {bannerOpen && !modalOpen && (
        <div
          role="dialog"
          aria-label="Cookie preferences"
          className="animate-fade-in-up print:hidden fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-4xl rounded-2xl border border-navy-200/80 bg-white p-5 shadow-2xl"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-900">
                <Cookie className="h-5 w-5 text-accent-500" />
              </div>
              <div className="text-xs leading-relaxed text-slate-600">
                <p className="font-bold text-navy-900">Your privacy &amp; cookie choices</p>
                <p className="mt-1">
                  NormInvoice uses strictly necessary cookies for authentication, security, and consent storage.
                  Optional preferences, analytics, and marketing cookies remain disabled unless you choose to enable them.{" "}
                  <Link href="/cookies" className="font-semibold text-navy-900 underline hover:text-accent-600">
                    Read Cookie Policy
                  </Link>
                  .
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => saveChoice({ preferences: false, analytics: false, marketing: false })}
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-navy-900 hover:bg-slate-50"
              >
                Reject Non-Essential
              </button>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-navy-200 bg-navy-50 px-3.5 py-2 text-xs font-bold text-navy-900 hover:bg-navy-100"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" /> Customize
              </button>
              <button
                type="button"
                onClick={() => saveChoice({ preferences: true, analytics: true, marketing: true })}
                className="rounded-xl bg-accent-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-accent-600"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Manage Cookie Settings"
          className="print:hidden fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-sm"
        >
          <div className="animate-scale-in w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-accent-500" />
                <h2 className="text-base font-extrabold text-navy-900">Cookie Settings</h2>
              </div>
              <button
                type="button"
                aria-label="Close cookie settings"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-navy-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Choose which optional categories you want to allow. Strictly necessary cookies cannot be disabled as they
              keep your login session, CSRF protection, and consent record functioning securely.
            </p>

            <div className="mt-5 space-y-3">
              <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-canvas p-3.5">
                <div>
                  <p className="text-xs font-bold text-navy-900">Strictly Necessary</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Authentication session cookie, security headers, and consent preference storage.
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                  Always On
                </span>
              </div>

              {(
                [
                  {
                    key: "preferences",
                    title: "Preferences",
                    desc: "Remember selected interface language and layout convenience settings.",
                  },
                  {
                    key: "analytics",
                    title: "Analytics (Optional)",
                    desc: "Aggregated product measurement to improve performance and usability. Disabled by default.",
                  },
                  {
                    key: "marketing",
                    title: "Marketing (Optional)",
                    desc: "Optional campaign measurement if enabled. NormInvoice does not sell customer invoice data.",
                  },
                ] as const
              ).map((item) => (
                <label
                  key={item.key}
                  className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-slate-200 p-3.5 hover:border-navy-200"
                >
                  <div>
                    <p className="text-xs font-bold text-navy-900">{item.title}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs[item.key]}
                    onChange={(e) => setPrefs((p) => ({ ...p, [item.key]: e.target.checked }))}
                    className="mt-1 h-4 w-4 accent-accent-500"
                  />
                </label>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => saveChoice({ preferences: false, analytics: false, marketing: false })}
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-navy-900 hover:bg-slate-50"
              >
                Reject Non-Essential
              </button>
              <button
                type="button"
                onClick={() =>
                  saveChoice({
                    preferences: prefs.preferences,
                    analytics: prefs.analytics,
                    marketing: prefs.marketing,
                  })
                }
                className="rounded-xl bg-navy-900 px-4 py-2 text-xs font-bold text-white hover:bg-navy-800"
              >
                Save Preferences
              </button>
              <button
                type="button"
                onClick={() => saveChoice({ preferences: true, analytics: true, marketing: true })}
                className="rounded-xl bg-accent-500 px-4 py-2 text-xs font-bold text-white hover:bg-accent-600"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
