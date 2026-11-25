import type { NextRequest } from "next/server";

/**
 * Public origin for customer-facing links and webhook URLs.
 *
 * Behind a reverse proxy (Caddy), req.nextUrl.origin reflects the internal bind
 * address (e.g. http://0.0.0.0:3000), which is useless to external callers. We
 * prefer the proxy's X-Forwarded-Host/Proto, then an explicit APP_DOMAIN (a
 * runtime env var, unlike build-inlined NEXT_PUBLIC_*), then the raw origin.
 */
export function publicOrigin(req: NextRequest): string {
  const fwHost = req.headers.get("x-forwarded-host");
  if (fwHost) {
    const host = fwHost.split(",")[0].trim();
    const proto = (req.headers.get("x-forwarded-proto") || "https").split(",")[0].trim();
    if (host) return `${proto}://${host}`;
  }
  const domain = process.env.APP_DOMAIN?.trim();
  if (domain) return `https://${domain.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  return req.nextUrl.origin;
}
