"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Globe2, Inbox, Package, Repeat, Search, Users, X, Zap } from "lucide-react";
import { apiJson } from "./ui";

interface SearchHit {
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

const QUICK_COMMANDS = [
  { label: "New E-Invoice", href: "/invoices/new", icon: FileText },
  { label: "EU Compliance & Peppol Lookup", href: "/compliance", icon: Globe2 },
  { label: "Incoming Supplier Inbox", href: "/inbox", icon: Inbox },
  { label: "Recurring Schedules", href: "/recurring", icon: Repeat },
  { label: "Workflow Automations", href: "/automations", icon: Zap },
  { label: "Financial & VAT Reports", href: "/reports", icon: FileText },
];

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<{
    invoices: SearchHit[];
    incoming: SearchHit[];
    customers: SearchHit[];
    products: SearchHit[];
  }>({ invoices: [], incoming: [], customers: [], products: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setQ("");
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !q.trim()) {
      setHits({ invoices: [], incoming: [], customers: [], products: [] });
      return;
    }
    const t = setTimeout(() => {
      setLoading(true);
      void apiJson<typeof hits>(`/api/v1/search?q=${encodeURIComponent(q.trim())}`)
        .then(setHits)
        .finally(() => setLoading(false));
    }, 180);
    return () => clearTimeout(t);
  }, [open, q]);

  if (!open) return null;

  function go(href: string) {
    onClose();
    router.push(href);
  }

  const hasResults =
    hits.invoices.length + hits.incoming.length + hits.customers.length + hits.products.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/50 px-4 pt-20 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search invoice #, customer, VAT ID, supplier, or command…"
            className="flex-1 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-3 text-xs">
          {!q.trim() && (
            <div>
              <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">Quick Commands</p>
              <div className="mt-1 space-y-0.5">
                {QUICK_COMMANDS.map((c) => {
                  const Icon = c.icon;
                  return (
                    <button
                      key={c.href}
                      type="button"
                      onClick={() => go(c.href)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700"
                    >
                      <Icon className="h-4 w-4 text-brand-600" /> {c.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {q.trim() && loading && <p className="py-6 text-center text-slate-400">Searching workspace…</p>}

          {q.trim() && !loading && !hasResults && (
            <p className="py-6 text-center text-slate-500">No matching invoices, customers, or products found.</p>
          )}

          {[
            { label: "Outgoing Invoices", items: hits.invoices, icon: FileText },
            { label: "Incoming Supplier Inbox", items: hits.incoming, icon: Inbox },
            { label: "Customers", items: hits.customers, icon: Users },
            { label: "Products & Rates", items: hits.products, icon: Package },
          ].map(
            (group) =>
              group.items.length > 0 && (
                <div key={group.label} className="mb-3">
                  <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">{group.label}</p>
                  {group.items.map((item) => {
                    const Icon = group.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => go(item.href)}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left hover:bg-slate-50"
                      >
                        <Icon className="h-4 w-4 text-slate-400" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-bold text-slate-900">{item.title}</p>
                          <p className="truncate text-[11px] text-slate-500">{item.subtitle}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )
          )}
        </div>
      </div>
    </div>
  );
}
