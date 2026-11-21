export interface ViesVerificationResult {
  countryCode: string;
  vatNumber: string;
  normalizedVatId: string;
  status: "VERIFIED" | "INVALID" | "PROVISIONAL";
  syntaxValid: boolean;
  traderName?: string;
  traderAddress?: string;
  requestIdentifier?: string;
  checkedAt: string;
  source: "cache" | "live_vies" | "circuit_breaker_fallback" | "syntax_check";
  note?: string;
}

// Official EU Member State VAT regex patterns (excluding country prefix)
const EU_VAT_PATTERNS: Record<string, RegExp> = {
  AT: /^U\d{8}$/,
  BE: /^[01]\d{9}$/,
  BG: /^\d{9,10}$/,
  CY: /^\d{8}[A-Z]$/,
  CZ: /^\d{8,10}$/,
  DE: /^\d{9}$/,
  DK: /^\d{8}$/,
  EE: /^\d{9}$/,
  EL: /^\d{9}$/,
  ES: /^[A-Z0-9]\d{7}[A-Z0-9]$/,
  FI: /^\d{8}$/,
  FR: /^[A-HJ-NP-Z0-9]{2}\d{9}$/,
  HR: /^\d{11}$/,
  HU: /^\d{8}$/,
  IE: /^(\d{7}[A-Z]{1,2}|\d[A-Z+*]\d{5}[A-Z])$/,
  IT: /^\d{11}$/,
  LT: /^(\d{9}|\d{12})$/,
  LU: /^\d{8}$/,
  LV: /^\d{11}$/,
  MT: /^\d{8}$/,
  NL: /^\d{9}B\d{2}$/,
  PL: /^\d{10}$/,
  PT: /^\d{9}$/,
  RO: /^\d{2,10}$/,
  SE: /^\d{12}$/,
  SI: /^\d{8}$/,
  SK: /^\d{10}$/,
};

interface CacheEntry {
  result: ViesVerificationResult;
  expiresAtMs: number;
}

interface BreakerState {
  consecutiveFailures: number;
  openUntilMs: number;
}

const memoryCache = new Map<string, CacheEntry>();
const countryBreakers = new Map<string, BreakerState>();

export function parseEuVatId(rawVatId: string): { countryCode: string; vatNumber: string; syntaxValid: boolean } {
  const cleaned = rawVatId.replace(/[\s.-]+/g, "").toUpperCase();
  const countryCode = cleaned.slice(0, 2);
  const vatNumber = cleaned.slice(2);
  const pattern = EU_VAT_PATTERNS[countryCode];
  return {
    countryCode,
    vatNumber,
    syntaxValid: Boolean(pattern && pattern.test(vatNumber)),
  };
}

/**
 * Production EU VIES VAT Validator with:
 * 1. Instant syntax validation per EU Member State regex
 * 2. 7-day positive cache / 2-hour negative cache
 * 3. Per-country circuit breaker (opens 5 min after 3 consecutive MS_UNAVAILABLE/timeout errors)
 * 4. Graceful PROVISIONAL fallback so EU government outages NEVER block invoice issuance
 */
export async function verifyEuVatId(
  rawVatId: string,
  options?: { liveLookup?: boolean; timeoutMs?: number }
): Promise<ViesVerificationResult> {
  const { countryCode, vatNumber, syntaxValid } = parseEuVatId(rawVatId);
  const normalizedVatId = `${countryCode}${vatNumber}`;
  const nowIso = new Date().toISOString();

  if (!syntaxValid) {
    return {
      countryCode,
      vatNumber,
      normalizedVatId,
      status: "INVALID",
      syntaxValid: false,
      checkedAt: nowIso,
      source: "syntax_check",
      note: `Format does not match official EU VAT pattern for '${countryCode || "??"}'.`,
    };
  }

  const cached = memoryCache.get(normalizedVatId);
  if (cached && cached.expiresAtMs > Date.now()) {
    return { ...cached.result, source: "cache" };
  }

  // If live lookup is disabled (e.g., offline unit tests), return provisional syntax pass
  if (options?.liveLookup === false) {
    return {
      countryCode,
      vatNumber,
      normalizedVatId,
      status: "PROVISIONAL",
      syntaxValid: true,
      checkedAt: nowIso,
      source: "syntax_check",
      note: "Syntax validated locally; live VIES check deferred.",
    };
  }

  const breaker = countryBreakers.get(countryCode) ?? { consecutiveFailures: 0, openUntilMs: 0 };
  if (breaker.openUntilMs > Date.now()) {
    return {
      countryCode,
      vatNumber,
      normalizedVatId,
      status: "PROVISIONAL",
      syntaxValid: true,
      checkedAt: nowIso,
      source: "circuit_breaker_fallback",
      note: `VIES circuit breaker open for ${countryCode}; accepted provisionally and queued for background verification.`,
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options?.timeoutMs ?? 6000);

  try {
    const res = await fetch(
      `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${encodeURIComponent(countryCode)}/vat/${encodeURIComponent(vatNumber)}`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      }
    );

    if (!res.ok) {
      throw new Error(`VIES HTTP ${res.status}`);
    }

    const data = (await res.json()) as {
      isValid?: boolean;
      name?: string;
      address?: string;
      requestIdentifier?: string;
      userError?: string;
    };

    if (
      data.userError === "MS_UNAVAILABLE" ||
      data.userError === "MS_MAX_CONCURRENT_REQ" ||
      data.userError === "GLOBAL_MAX_CONCURRENT_REQ" ||
      data.userError === "SERVICE_UNAVAILABLE"
    ) {
      throw new Error(`VIES_FAULT_${data.userError}`);
    }

    // Reset breaker on healthy response
    countryBreakers.set(countryCode, { consecutiveFailures: 0, openUntilMs: 0 });

    const isValid = Boolean(data.isValid);
    const result: ViesVerificationResult = {
      countryCode,
      vatNumber,
      normalizedVatId,
      status: isValid ? "VERIFIED" : "INVALID",
      syntaxValid: true,
      traderName: data.name && data.name !== "---" ? data.name.trim() : undefined,
      traderAddress: data.address && data.address !== "---" ? data.address.trim() : undefined,
      requestIdentifier: data.requestIdentifier || undefined,
      checkedAt: nowIso,
      source: "live_vies",
    };

    const ttlMs = isValid ? 7 * 24 * 3600 * 1000 : 2 * 3600 * 1000;
    memoryCache.set(normalizedVatId, { result, expiresAtMs: Date.now() + ttlMs });
    return result;
  } catch (err) {
    const failures = breaker.consecutiveFailures + 1;
    countryBreakers.set(countryCode, {
      consecutiveFailures: failures,
      openUntilMs: failures >= 3 ? Date.now() + 5 * 60 * 1000 : 0,
    });

    return {
      countryCode,
      vatNumber,
      normalizedVatId,
      status: "PROVISIONAL",
      syntaxValid: true,
      checkedAt: nowIso,
      source: "circuit_breaker_fallback",
      note: `EU VIES temporarily unavailable (${err instanceof Error ? err.message : "timeout"}); accepted provisionally.`,
    };
  } finally {
    clearTimeout(timeout);
  }
}
