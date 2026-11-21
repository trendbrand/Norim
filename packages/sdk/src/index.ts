export interface NormInvoiceClientOptions {
  apiKey: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

export interface ValidateResponse {
  authenticatedVia: string;
  report: {
    valid: boolean;
    diagnostics: Array<{
      ruleId: string;
      severity: string;
      fieldBt: string;
      messageEn: string;
    }>;
  };
}

export interface VatVerifyResponse {
  normalizedVatId: string;
  status: "VERIFIED" | "INVALID" | "PROVISIONAL";
  syntaxValid: boolean;
  traderName?: string;
  requestIdentifier?: string;
  checkedAt: string;
}

/**
 * Official Zero-Dependency TypeScript / Node.js Client SDK for NormInvoice REST API v1.
 */
export class NormInvoiceClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetchFn: typeof fetch;

  constructor(options: NormInvoiceClientOptions) {
    if (!options.apiKey?.trim()) {
      throw new Error("NormInvoiceClient requires a non-empty apiKey (ni_live_...).");
    }
    this.apiKey = options.apiKey.trim();
    this.baseUrl = (options.baseUrl ?? "https://norminvoice.eu").replace(/\/+$/, "");
    this.fetchFn = options.fetchImpl ?? fetch;
  }

  private authHeaders(extra?: Record<string, string>): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      ...extra,
    };
  }

  async validateXml(xmlContent: string): Promise<ValidateResponse> {
    const res = await this.fetchFn(`${this.baseUrl}/api/v1/validate`, {
      method: "POST",
      headers: this.authHeaders({ "Content-Type": "application/xml" }),
      body: xmlContent,
    });
    if (!res.ok) {
      throw new Error(`NormInvoice validateXml failed (HTTP ${res.status}): ${await res.text()}`);
    }
    return (await res.json()) as ValidateResponse;
  }

  async validateInvoiceJson(canonicalInvoice: Record<string, unknown>): Promise<ValidateResponse> {
    const res = await this.fetchFn(`${this.baseUrl}/api/v1/validate`, {
      method: "POST",
      headers: this.authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(canonicalInvoice),
    });
    if (!res.ok) {
      throw new Error(`NormInvoice validateInvoiceJson failed (HTTP ${res.status}): ${await res.text()}`);
    }
    return (await res.json()) as ValidateResponse;
  }

  async createInvoice(
    canonicalInvoice: Record<string, unknown>,
    idempotencyKey?: string
  ): Promise<Record<string, unknown>> {
    const res = await this.fetchFn(`${this.baseUrl}/api/v1/invoices`, {
      method: "POST",
      headers: this.authHeaders({
        "Content-Type": "application/json",
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      }),
      body: JSON.stringify({ ...canonicalInvoice, _source: "api" }),
    });
    if (!res.ok) {
      throw new Error(`NormInvoice createInvoice failed (HTTP ${res.status}): ${await res.text()}`);
    }
    return (await res.json()) as Record<string, unknown>;
  }

  async verifyVat(vatId: string): Promise<VatVerifyResponse> {
    const res = await this.fetchFn(`${this.baseUrl}/api/v1/vat/verify`, {
      method: "POST",
      headers: this.authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ vatId }),
    });
    if (!res.ok) {
      throw new Error(`NormInvoice verifyVat failed (HTTP ${res.status}): ${await res.text()}`);
    }
    return (await res.json()) as VatVerifyResponse;
  }

  async downloadDatevCsv(chartOfAccounts: "SKR03" | "SKR04" = "SKR03"): Promise<string> {
    const res = await this.fetchFn(`${this.baseUrl}/api/v1/exports/datev?skr=${chartOfAccounts}`, {
      method: "GET",
      headers: this.authHeaders(),
    });
    if (!res.ok) {
      throw new Error(`NormInvoice downloadDatevCsv failed (HTTP ${res.status})`);
    }
    return res.text();
  }

  async downloadFrenchFecTsv(): Promise<string> {
    const res = await this.fetchFn(`${this.baseUrl}/api/v1/exports/fec`, {
      method: "GET",
      headers: this.authHeaders(),
    });
    if (!res.ok) {
      throw new Error(`NormInvoice downloadFrenchFecTsv failed (HTTP ${res.status})`);
    }
    return res.text();
  }
}
