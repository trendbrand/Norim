"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Send, ShieldCheck, Sparkles, X } from "lucide-react";
import { apiJson } from "./ui";

interface CopilotReply {
  question: string;
  answer: string;
  disclaimer: string;
  citations: string[];
  actions: Array<{ label: string; href: string }>;
}

const SUGGESTIONS = [
  "Which invoices need my attention?",
  "Why did BR-DE-15 fail?",
  "Show unpaid or overdue receivables",
  "What does Belgium require for Peppol?",
  "What are France Factur-X rules?",
];

export function CopilotPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<CopilotReply[]>([]);

  async function ask(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    setLoading(true);
    setInput("");
    try {
      const r = await apiJson<Omit<CopilotReply, "question">>("/api/v1/copilot", {
        method: "POST",
        body: JSON.stringify({ question: trimmed }),
      });
      setHistory((prev) => [...prev, { question: trimmed, ...r }]);
    } catch (e) {
      setHistory((prev) => [
        ...prev,
        {
          question: trimmed,
          answer: e instanceof Error ? e.message : "Failed to query compliance assistant.",
          disclaimer: "Error",
          citations: [],
          actions: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Compliance Copilot</h2>
              <p className="text-[11px] text-slate-500">Grounded in live records & EN 16931 rules</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5 text-xs">
          {history.length === 0 && (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-slate-600">
                <p className="flex items-center gap-1.5 font-bold text-slate-900">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> Deterministic & Read-Only (ADR-006)
                </p>
                <p className="mt-1 leading-relaxed">
                  I query your permission-checked workspace records, EN 16931 rule definitions, and versioned 13-country compliance packs. I never auto-submit or modify financial records without your action.
                </p>
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Try asking</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void ask(s)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-left font-semibold text-slate-700 hover:border-brand-300 hover:bg-brand-50/40"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {history.map((item, idx) => (
            <div key={idx} className="space-y-2">
              <div className="ml-8 rounded-xl bg-brand-600 px-3.5 py-2.5 font-semibold text-white">
                {item.question}
              </div>
              <div className="mr-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-slate-800">
                <p className="leading-relaxed">{item.answer}</p>
                {item.actions.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {item.actions.map((a) => (
                      <Link
                        key={a.href}
                        href={a.href}
                        onClick={onClose}
                        className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-brand-700"
                      >
                        {a.label} <ArrowRight className="h-3 w-3" />
                      </Link>
                    ))}
                  </div>
                )}
                <p className="mt-2 border-t border-slate-200 pt-1.5 text-[10px] text-slate-400">
                  {item.disclaimer}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Checking deterministic rules & live ledger…
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void ask(input);
          }}
          className="flex gap-2 border-t border-slate-200 p-4"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about BR-DE-15, Belgium, unpaid invoices…"
            className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:border-brand-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-3.5 py-2 text-white hover:bg-brand-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
