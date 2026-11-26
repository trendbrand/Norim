/**
 * Transactional email dispatcher. Chooses a provider at runtime:
 *   1. SMTP (e.g. Hostinger) when SMTP_HOST is set — nodemailer over TLS.
 *   2. Resend HTTP API when RESEND_API_KEY is set.
 *   3. Sandbox no-op (returns a synthetic id) when neither is configured.
 * Handles EN 16931 invoice delivery (PDF/A-3 + XML attachments) and all
 * auth/notification emails (verification, reset, welcome, sign-in, 2FA, billing).
 */

import nodemailer from "nodemailer";
import { escapeHtml } from "./security";

export interface EInvoiceEmailParams {
  to: string;
  cc?: string;
  invoiceNumber: string;
  sellerName: string;
  grossFormatted: string;
  locale: "de" | "fr" | "en";
  pdfAttachment?: { filename: string; contentBase64: string };
  xmlAttachment: { filename: string; contentBase64: string };
}

export interface EmailDispatchResult {
  dispatched: boolean;
  provider: "smtp" | "resend" | "sandbox-log";
  messageId: string;
}

interface Attachment {
  filename: string;
  /** base64-encoded content */
  content: string;
}

/** Low-level provider-agnostic sender. */
async function sendMail(opts: {
  from?: string;
  to: string;
  cc?: string;
  subject: string;
  html: string;
  attachments?: Attachment[];
}): Promise<EmailDispatchResult> {
  const from = opts.from || process.env.EMAIL_FROM || "NormInvoice <noreply@norminvoice.eu>";

  // ── Provider 1: SMTP (Hostinger / any mailbox) ──
  const smtpHost = process.env.SMTP_HOST;
  if (smtpHost) {
    const port = Number(process.env.SMTP_PORT || 465);
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port,
      secure: port === 465, // implicit TLS on 465; STARTTLS is negotiated on 587
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
    });
    const info = await transporter.sendMail({
      from,
      to: opts.to,
      cc: opts.cc,
      subject: opts.subject,
      html: opts.html,
      attachments: opts.attachments?.map((a) => ({
        filename: a.filename,
        content: Buffer.from(a.content, "base64"),
      })),
    });
    return { dispatched: true, provider: "smtp", messageId: info.messageId || `smtp_${Date.now()}` };
  }

  // ── Provider 2: Resend HTTP API ──
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [opts.to],
        ...(opts.cc ? { cc: [opts.cc] } : {}),
        subject: opts.subject,
        html: opts.html,
        ...(opts.attachments ? { attachments: opts.attachments } : {}),
      }),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Resend API error (${res.status}): ${txt.slice(0, 200)}`);
    }
    const data = (await res.json()) as { id?: string };
    return { dispatched: true, provider: "resend", messageId: data.id || `resend_${Date.now()}` };
  }

  // ── Provider 3: Sandbox (never leaks PII in logs) ──
  return { dispatched: true, provider: "sandbox-log", messageId: `sandbox_${Date.now()}` };
}

function buildLocalizedBody(p: EInvoiceEmailParams): { subject: string; html: string } {
  const safeNum = escapeHtml(p.invoiceNumber);
  const safeSeller = escapeHtml(p.sellerName);
  const safeGross = escapeHtml(p.grossFormatted);

  if (p.locale === "de") {
    return {
      subject: `E-Rechnung ${p.invoiceNumber} — ${p.sellerName} (${p.grossFormatted})`,
      html: `<p>Sehr geehrte Damen und Herren,</p>
<p>anbei erhalten Sie Ihre EN-16931-konforme elektronische Rechnung <strong>${safeNum}</strong> über <strong>${safeGross}</strong> von ${safeSeller}.</p>
<p>Die angehängte Datei enthält strukturierte XML-Daten (ZUGFeRD 2.3 / XRechnung) für die direkte digitale Verarbeitung in Ihrer Buchhaltung.</p>
<p style="font-size:12px;color:#64748b;">Versendet über NormInvoice · 100 % EU-Hosting (Deutschland) · GoBD-archiviert.</p>`,
    };
  }
  if (p.locale === "fr") {
    return {
      subject: `Facture électronique ${p.invoiceNumber} — ${p.sellerName} (${p.grossFormatted})`,
      html: `<p>Bonjour,</p>
<p>Veuillez trouver ci-joint votre facture électronique conforme EN 16931 (Factur-X 1.07) n° <strong>${safeNum}</strong> d'un montant de <strong>${safeGross}</strong> émise par ${safeSeller}.</p>
<p style="font-size:12px;color:#64748b;">Envoyé via NormInvoice · Hébergement 100 % UE (Allemagne).</p>`,
    };
  }
  return {
    subject: `EU E-Invoice ${p.invoiceNumber} — ${p.sellerName} (${p.grossFormatted})`,
    html: `<p>Hello,</p>
<p>Please find attached your EN 16931 compliant electronic invoice <strong>${safeNum}</strong> totaling <strong>${safeGross}</strong> from ${safeSeller}.</p>
<p style="font-size:12px;color:#64748b;">Dispatched via NormInvoice · 100% EU Sovereign Infrastructure.</p>`,
  };
}

export async function dispatchEInvoiceEmail(params: EInvoiceEmailParams): Promise<EmailDispatchResult> {
  const { subject, html } = buildLocalizedBody(params);
  const attachments: Attachment[] = [
    { filename: params.xmlAttachment.filename, content: params.xmlAttachment.contentBase64 },
  ];
  if (params.pdfAttachment) {
    attachments.unshift({ filename: params.pdfAttachment.filename, content: params.pdfAttachment.contentBase64 });
  }
  return sendMail({
    from: process.env.EMAIL_FROM || "NormInvoice E-Invoicing <invoices@norminvoice.eu>",
    to: params.to,
    cc: params.cc,
    subject,
    html,
    attachments,
  });
}

export async function dispatchTransactionalEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<EmailDispatchResult> {
  return sendMail({ to: params.to, subject: params.subject, html: params.html });
}
