import { NextRequest, NextResponse } from "next/server";
import { requireTenantAuth } from "@/lib/security";

/**
 * Live OpenPeppol Directory Participant Lookup (for Belgium, Germany, Netherlands, Austria, etc.).
 * Queries the official public OpenPeppol Directory API with strict 5s timeout & graceful fallback.
 */
export async function POST(req: NextRequest) {
  const access = await requireTenantAuth(req);
  if (!access.ok) return access.response;

  try {
    const body = (await req.json()) as { query?: string; countryCode?: string };
    const q = (body.query || "").trim();
    if (q.length < 2) {
      return NextResponse.json({ error: "Enter a company name, VAT ID, or Peppol ID (min 2 chars)." }, { status: 400 });
    }

    const url = new URL("https://directory.peppol.eu/search/1.0/json");
    url.searchParams.set("q", q);
    if (body.countryCode && /^[A-Z]{2}$/i.test(body.countryCode.trim())) {
      url.searchParams.set("country", body.countryCode.trim().toUpperCase());
    }
    url.searchParams.set("beautify", "false");

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(url.toString(), {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        return NextResponse.json({
          source: "peppol-directory-unavailable",
          matches: [],
          note: `OpenPeppol Directory returned HTTP ${res.status}. You can still issue Peppol BIS 3.0 UBL invoices using buyer EAS ID.`,
        });
      }
      const data = (await res.json()) as {
        matches?: Array<{
          participantID?: { scheme?: string; value?: string };
          entities?: Array<{
            name?: Array<{ name?: string }>;
            countryCode?: string;
            identifiers?: Array<{ scheme?: string; value?: string }>;
          }>;
          docTypes?: Array<{ value?: string }>;
        }>;
      };

      const matches = (data.matches || []).slice(0, 8).map((m) => {
        const ent = m.entities?.[0];
        return {
          participantId: m.participantID?.value || "",
          scheme: m.participantID?.scheme || "",
          name: ent?.name?.[0]?.name || "Registered Peppol Participant",
          countryCode: ent?.countryCode || "",
          supportsBis3Invoice: (m.docTypes || []).some((d) =>
            (d.value || "").includes("urn:oasis:names:specification:ubl:schema:xsd:Invoice-2")
          ),
        };
      });

      return NextResponse.json({
        source: "directory.peppol.eu",
        totalFound: matches.length,
        matches,
      });
    } finally {
      clearTimeout(timer);
    }
  } catch {
    return NextResponse.json({
      source: "offline-fallback",
      matches: [],
      note: "OpenPeppol Directory did not respond within 5 seconds. Offline mode active.",
    });
  }
}
