/**
 * Production EU Transactional Email Dispatcher (Resend EU / Postmark / Sandbox Log).
 * Delivers self-validated ZUGFeRD/Factur-X PDF/A-3 + XML attachments to buyers,
 * optional Steuerberater Accountant CC, and Action-Required alerts to merchants.
 */

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
  provider: "resend" | "sandbox-log";
  messageId: string;
}

import { escapeHtml } from "./security";

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
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "NormInvoice E-Invoicing <invoices@norminvoice.eu>";

  const attachments: Array<{ filename: string; content: string }> = [
    { filename: params.xmlAttachment.filename, content: params.xmlAttachment.contentBase64 },
  ];
  if (params.pdfAttachment) {
    attachments.unshift({
      filename: params.pdfAttachment.filename,
      content: params.pdfAttachment.contentBase64,
    });
  }

  if (resendKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [params.to],
        ...(params.cc ? { cc: [params.cc] } : {}),
        subject,
        html,
        attachments,
      }),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Resend API error (${res.status}): ${txt.slice(0, 200)}`);
    }
    const data = (await res.json()) as { id?: string };
    return {
      dispatched: true,
      provider: "resend",
      messageId: data.id || `resend_${Date.now()}`,
    };
  }

  // Sandbox mode: never leak invoice PII in logs, return synthetic message ID
  return {
    dispatched: true,
    provider: "sandbox-log",
    messageId: `sandbox_mail_${Date.now()}`,
  };
}

export async function dispatchTransactionalEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<EmailDispatchResult> {
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "NormInvoice <official@trendandbrands.com>";

  if (resendKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [params.to],
        subject: params.subject,
        html: params.html,
      }),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Resend API error (${res.status}): ${txt.slice(0, 200)}`);
    }
    const data = (await res.json()) as { id?: string };
    return {
      dispatched: true,
      provider: "resend",
      messageId: data.id || `resend_${Date.now()}`,
    };
  }

  return {
    dispatched: true,
    provider: "sandbox-log",
    messageId: `sandbox_auth_${Date.now()}`,
  };
}
