"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <span className="rounded-full bg-red-50 px-3 py-1 font-mono text-xs font-bold text-red-700">
        Application Error
      </span>
      <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Something went wrong</h1>
      <p className="mt-2 text-sm text-slate-600">
        {error.message || "An unexpected error occurred while processing your request."}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
      >
        Try Again
      </button>
    </div>
  );
}
