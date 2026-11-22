"use client";

import React from "react";

interface BrandLogoProps {
  variant?: "light" | "dark";
  showAttribution?: boolean;
  compact?: boolean;
  subtitle?: string;
}

/**
 * Official NormInvoice — Product of Trend&Brand Logo
 * Uses approved Primary Navy (#011D42) and Accent Orange (#FD7C05) without
 * unconfirmed trademark registration symbols.
 */
export function BrandLogo({
  variant = "light",
  showAttribution = true,
  compact = false,
  subtitle,
}: BrandLogoProps) {
  const isDark = variant === "dark";

  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      {/* Crisp geometric swoosh / invoice mark inspired by approved brand design */}
      <svg
        width={compact ? 32 : 36}
        height={compact ? 32 : 36}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect
          width="40"
          height="40"
          rx="10"
          fill={isDark ? "#0A2B57" : "#011D42"}
        />
        <path
          d="M8 27.5C13.5 23.2 21.8 18.4 31.5 13.8L31.5 23.6C24.2 23.8 16.5 25.5 8 27.5Z"
          fill="#FD7C05"
        />
        <path
          d="M8.5 28.4C15.8 25.8 23.8 24.4 31.5 24.6L31.5 28.2C23.5 28 16.2 28.6 8.5 28.4Z"
          fill="#FFFFFF"
          fillOpacity="0.92"
        />
        <path
          d="M11 13.5H22.5M11 17.8H18.5"
          stroke="#FFFFFF"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeOpacity="0.88"
        />
      </svg>

      <span className="flex flex-col leading-tight">
        <span
          className={`font-extrabold tracking-tight ${compact ? "text-sm" : "text-base"} ${
            isDark ? "text-white" : "text-navy-900"
          }`}
        >
          Norm<span className="text-accent-500">Invoice</span>
        </span>
        {subtitle ? (
          <span
            className={`max-w-[165px] truncate text-[11px] font-medium ${
              isDark ? "text-navy-200" : "text-slate-500"
            }`}
          >
            {subtitle}
          </span>
        ) : showAttribution ? (
          <span
            className={`text-[10.5px] font-semibold tracking-wide ${
              isDark ? "text-navy-200" : "text-slate-500"
            }`}
          >
            Product of <span className={isDark ? "text-white" : "text-navy-800"}>Trend</span>
            <span className="text-accent-500">&amp;</span>
            <span className={isDark ? "text-white" : "text-navy-800"}>Brand</span>
          </span>
        ) : null}
      </span>
    </span>
  );
}
