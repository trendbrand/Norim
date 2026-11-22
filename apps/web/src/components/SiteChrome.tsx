"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { AppShell } from "./AppShell";

export const APP_ROUTE_PREFIXES = [
  "/dashboard",
  "/invoices",
  "/inbox",
  "/compliance",
  "/payments",
  "/accountant",
  "/recurring",
  "/automations",
  "/reports",
  "/customers",
  "/catalog",
  "/batch",
  "/exports",
  "/settings",
  "/onboarding",
  "/create",
  "/admin",
];

export function isAppRoute(pathname: string): boolean {
  return APP_ROUTE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Chooses between the public marketing chrome (Navbar + footer) and the
 * authenticated SaaS AppShell (sidebar), so there is never a double header.
 */
export function SiteChrome({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) {
  const pathname = usePathname() || "/";
  if (isAppRoute(pathname)) {
    return <AppShell>{children}</AppShell>;
  }
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      {footer}
    </>
  );
}
