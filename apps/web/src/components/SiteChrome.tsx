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
];

export function isAppRoute(pathname: string): boolean {
  return APP_ROUTE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Chooses the chrome for a route. The platform control plane (/admin) is a
 * SEPARATE realm: it never uses the customer AppShell (which depends on a
 * customer session) nor the public marketing nav — so a customer session can
 * neither render nor be required by the admin surface.
 */
export function SiteChrome({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) {
  const pathname = usePathname() || "/";

  // Staff sign-in: full-screen, standalone.
  if (pathname === "/admin/login") {
    return <main className="flex-1">{children}</main>;
  }
  // Staff control plane: standalone shell, padded container, no customer AppShell.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return (
      <div className="min-h-screen bg-canvas">
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    );
  }

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
