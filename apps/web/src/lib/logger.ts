/**
 * GDPR-Safe Structured JSON Logger.
 * Automatically redacts PII & secret fields (iban, vatId, email, password, authorization, secret, xml)
 * before emitting structured JSON lines to stdout/stderr for Loki / Grafana / BetterStack ingestion.
 */

const REDACTED_KEYS = new Set([
  "password",
  "passwordhash",
  "authorization",
  "cookie",
  "secret",
  "token",
  "apikey",
  "plaintextkey",
  "iban",
  "bic",
  "vatid",
  "buyervatid",
  "email",
  "buyeremail",
  "xml",
  "xmlcontent",
  "pdfbase64",
]);

function redactObject(value: unknown, depth = 0): unknown {
  if (depth > 4 || value === null || value === undefined) return value;
  if (typeof value !== "object") return value;
  if (Array.isArray(value)) return value.slice(0, 20).map((item) => redactObject(item, depth + 1));

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    const lower = k.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (REDACTED_KEYS.has(lower) || lower.includes("secret") || lower.includes("password") || lower.includes("token")) {
      out[k] = "[REDACTED_GDPR]";
    } else {
      out[k] = redactObject(v, depth + 1);
    }
  }
  return out;
}

export function logEvent(
  level: "info" | "warn" | "error",
  event: string,
  meta?: Record<string, unknown>
): void {
  const entry = {
    ts: new Date().toISOString(),
    level,
    service: "norminvoice-web",
    event,
    ...(meta ? (redactObject(meta) as Record<string, unknown>) : {}),
  };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}
