/**
 * Peppol Access Point transport adapter (Master Plan F04 / ADR-003: partner-led
 * gateways). NormInvoice is NOT itself an accredited Access Point — live Peppol
 * delivery requires a certified provider. This module abstracts that provider
 * behind a small interface and, crucially, defaults to an HONEST "not configured"
 * state that never reports a fake success. When a real provider's credentials are
 * supplied via PEPPOL_AP_* env, a generic HTTP adapter is used; provider-specific
 * adapters can be added without touching the outbox.
 */

import type { CanonicalInvoice } from "@norminvoice/einvoice-core";

export interface PeppolTransmitParams {
  invoice: CanonicalInvoice;
  ublXml: string;
  senderParticipantId: string | null;
  recipientParticipantId: string; // "<scheme>::<value>", e.g. "0208::0123456789"
}

export type PeppolTransmitResult =
  | { ok: true; provider: string; providerRef: string }
  | { ok: false; permanent: boolean; error: string };

export interface PeppolAccessPoint {
  readonly name: string;
  readonly configured: boolean;
  transmit(params: PeppolTransmitParams): Promise<PeppolTransmitResult>;
}

/** Peppol participant id from a party's EAS scheme + electronic address, or null
 *  when the party only has an email address (scheme "EM") — not Peppol-routable. */
function participantId(scheme: string | undefined, value: string | undefined): string | null {
  const s = (scheme || "").trim();
  const v = (value || "").trim();
  if (!v || !s || s.toUpperCase() === "EM") return null;
  return `${s}::${v}`;
}

export function peppolRecipientId(invoice: CanonicalInvoice): string | null {
  return participantId(invoice.buyer.electronicAddressScheme, invoice.buyer.electronicAddress);
}

export function peppolSenderId(invoice: CanonicalInvoice): string | null {
  return participantId(invoice.seller.electronicAddressScheme, invoice.seller.electronicAddress);
}

export const PEPPOL_NOT_CONFIGURED_MESSAGE =
  "No certified Peppol Access Point is configured. Connect an accredited provider (set PEPPOL_AP_PROVIDER / PEPPOL_AP_BASE_URL / PEPPOL_AP_API_KEY) to enable live Peppol delivery.";

class UnconfiguredAccessPoint implements PeppolAccessPoint {
  readonly name = "none";
  readonly configured = false;
  async transmit(): Promise<PeppolTransmitResult> {
    // Honest, permanent failure — never a fabricated acknowledgement.
    return { ok: false, permanent: true, error: PEPPOL_NOT_CONFIGURED_MESSAGE };
  }
}

/** Generic HTTP Access Point: POSTs the UBL document to a provider's REST
 *  endpoint. Shape is intentionally generic; a provider-specific adapter can
 *  replace this when the partner contract is signed. */
class HttpAccessPoint implements PeppolAccessPoint {
  readonly configured = true;
  readonly name: string;
  private readonly baseUrl: string;
  private readonly apiKey: string;
  constructor(name: string, baseUrl: string, apiKey: string) {
    this.name = name;
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async transmit(params: PeppolTransmitParams): Promise<PeppolTransmitResult> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(`${this.baseUrl}/documents`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/xml",
          Authorization: `Bearer ${this.apiKey}`,
          "X-Peppol-Recipient": params.recipientParticipantId,
          ...(params.senderParticipantId ? { "X-Peppol-Sender": params.senderParticipantId } : {}),
        },
        body: params.ublXml,
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        const permanent = res.status >= 400 && res.status < 500 && res.status !== 408 && res.status !== 429;
        return {
          ok: false,
          permanent,
          error: `Peppol AP ${this.name} returned HTTP ${res.status}: ${txt.slice(0, 200)}`,
        };
      }
      const data = (await res.json().catch(() => ({}))) as { transmissionId?: string; id?: string };
      return { ok: true, provider: this.name, providerRef: data.transmissionId || data.id || `peppol_${Date.now()}` };
    } catch (err) {
      return { ok: false, permanent: false, error: err instanceof Error ? err.message : "Peppol transmission failed" };
    } finally {
      clearTimeout(timer);
    }
  }
}

export function resolvePeppolAccessPoint(): PeppolAccessPoint {
  const provider = process.env.PEPPOL_AP_PROVIDER;
  const baseUrl = process.env.PEPPOL_AP_BASE_URL;
  const apiKey = process.env.PEPPOL_AP_API_KEY;
  if (provider && baseUrl && apiKey) {
    return new HttpAccessPoint(provider, baseUrl.replace(/\/+$/, ""), apiKey);
  }
  return new UnconfiguredAccessPoint();
}

export function isPeppolConfigured(): boolean {
  return resolvePeppolAccessPoint().configured;
}
