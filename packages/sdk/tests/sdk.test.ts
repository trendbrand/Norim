import { describe, expect, it } from "vitest";
import { NormInvoiceClient } from "../src/index.js";

describe("@norminvoice/sdk — Client SDK Suite", () => {
  it("Rejects empty API key at construction time", () => {
    expect(() => new NormInvoiceClient({ apiKey: "" })).toThrow(/requires a non-empty apiKey/);
  });

  it("Sends Bearer token, Idempotency-Key, and parses validation & VAT responses cleanly", async () => {
    const calls: Array<{ url: string; headers: Record<string, string>; method: string }> = [];
    const mockFetch: typeof fetch = async (input, init) => {
      const url = String(input);
      calls.push({
        url,
        method: init?.method ?? "GET",
        headers: (init?.headers ?? {}) as Record<string, string>,
      });
      if (url.endsWith("/api/v1/validate")) {
        return new Response(JSON.stringify({ authenticatedVia: "api_key:ni_live_test", report: { valid: true, diagnostics: [] } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (url.endsWith("/api/v1/vat/verify")) {
        return new Response(
          JSON.stringify({ normalizedVatId: "DE298765432", status: "VERIFIED", syntaxValid: true, checkedAt: "2026-11-20T00:00:00Z" }),
          { status: 200 }
        );
      }
      return new Response(JSON.stringify({ invoice: { id: "inv_1" } }), { status: 200 });
    };

    const client = new NormInvoiceClient({
      apiKey: "ni_live_test_123456",
      baseUrl: "https://norminvoice.eu/",
      fetchImpl: mockFetch,
    });

    const valRes = await client.validateXml("<Invoice />");
    expect(valRes.report.valid).toBe(true);
    expect(calls[0]!.headers.Authorization).toBe("Bearer ni_live_test_123456");

    const vatRes = await client.verifyVat("DE298765432");
    expect(vatRes.status).toBe("VERIFIED");

    await client.createInvoice({ invoiceNumber: "RE-1" }, "idem_key_01");
    expect(calls[2]!.headers["Idempotency-Key"]).toBe("idem_key_01");
  });
});
