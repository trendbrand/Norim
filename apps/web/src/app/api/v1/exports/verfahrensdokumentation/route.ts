import { NextRequest, NextResponse } from "next/server";
import {
  getSellerSettings,
  listInvoicesForOrg,
  listOrgAuditEvents,
  verifyOrgAuditHashChain,
} from "@/lib/db-store";
import { requireTenantAuth } from "@/lib/security";

export async function GET(req: NextRequest) {
  const access = await requireTenantAuth(req);
  if (!access.ok) return access.response;

  const settings = getSellerSettings(access.ctx.orgId);
  if (!settings) {
    return NextResponse.json({ error: "Seller settings not configured" }, { status: 400 });
  }
  const invoices = listInvoicesForOrg(access.ctx.orgId);
  const auditEvents = listOrgAuditEvents(access.ctx.orgId);
  const chain = verifyOrgAuditHashChain(access.ctx.orgId);
  const today = new Date().toISOString().slice(0, 10);

  const doc = `# GoBD Verfahrensdokumentation — Elektronischer Rechnungsversand & Archivierung

**Erstellt am:** ${today}  
**Mandant / Unternehmen:** ${settings.legalName}  
**USt-IdNr. (BT-31):** ${settings.vatId || "Nicht angegeben (Kleinunternehmer / Steuernummer)"}  
**Steuernummer (BT-32):** ${settings.taxNumber || "—"}  
**Handelsregister / Sitz:** ${settings.registrationId || "—"} · ${settings.street}, ${settings.postalCode} ${settings.city} (${settings.countryCode})  
**Steuerberater-CC:** ${settings.accountantCcEmail || "Nicht konfiguriert"}  

---

## 1. Allgemeine Beschreibung des Verfahrens
Das Unternehmen nutzt **NormInvoice** (EU-gehostete SaaS-Plattform in Deutschland) zur automatisierten Erstellung, Prüfung, Übermittlung und revisionssicheren Archivierung elektronischer Rechnungen gemäß **EN 16931** (ZUGFeRD 2.3, Factur-X 1.07, XRechnung 3.0.2, Peppol BIS 3.0).

## 2. System- & Sicherheitsarchitektur (TOMs gem. Art. 32 DSGVO)
- **Datenresidenz:** 100 % Europäische Union (Deutschland), AVV gemäß Art. 28 DSGVO abgeschlossen.
- **Mandantentrennung:** Strenge org_id-Isolation und PostgreSQL 16 Row-Level Security (RLS) mit transaktionaler Mandantenbindung.
- **Verschlüsselung:** TLS 1.3 (Transport), AES-256-GCM (Integrations-Geheimnisse), scrypt-Passwort-Hashing.
- **Zero-Egress-Prüf-Sandbox:** XML- und PDF/A-3b-Verarbeitung läuft isoliert gegen XXE/DTD-Angriffe und ohne Fremdzugriff.

## 3. Belegentstehung & Doppelte Konformitätsprüfung
1. Eingehende Rechnungsdaten (Stripe Webhooks, WooCommerce Bridge, CSV-Batch, REST-API oder manuelle Erstellung) werden in ein kanonisches EN-16931-Modell überführt.
2. Bei innergemeinschaftlichen B2B-Leistungen (Reverse Charge, Kategorie AE) erfolgt eine Prüfung der Käufer-USt-IdNr. über die EU-VIES-Schnittstelle.
3. Jede Ausgangsrechnung wird **vor dem Versand** automatisch gegen EN-16931-Rechenregeln (BR-CO-10 bis BR-CO-17), XRechnung-Geschäftsregeln (BR-DE-*) sowie PDF/A-3b-Konformität geprüft.
4. Fehlerhafte Belege werden **niemals versendet**, sondern im Status ACTION_REQUIRED angehalten. Finalisierte Belege sind unveränderbar; Korrekturen erfolgen ausschließlich per Stornorechnung / Gutschrift (TypeCode 381 mit BT-25 Referenz).

## 4. Unveränderbarkeit & Aufbewahrungsfristen (GoBD / BEG IV)
- **Aufbewahrungsfrist:** **${settings.retentionYears} Jahre** (gemäß § 147 AO / BEG IV 2025: 8 Jahre für Buchungsbelege & Rechnungen; 10 Jahre für Frankreich / Handelsrecht).
- **Kryptografische Audit-Kette:** Jedes Lebenszyklus-Ereignis wird mittels SHA-256 verkettet (prev_hash -> event_hash).

## 5. Aktueller Protokoll- & Integritäts-Status (Snapshot ${today})
- **Archivierte E-Rechnungen im Mandanten-Workspace:** ${invoices.filter((i) => i.validationPassed && i.status !== "DRAFT").length} validiert / ${invoices.length} gesamt
- **Protokollierte Audit-Ketten-Einträge:** ${chain.totalEvents}
- **SHA-256 Hash-Chain Integritätsprüfung:** ${chain.verified ? "VERIFIED (100 % unverändert)" : `BROKEN AT #${chain.brokenAtEventId}`}
- **Letzter Audit-Chain SHA-256 Hash:** \`${auditEvents[0]?.eventHash || "GENESIS"}\`
- **Buchhaltungsexport:** DATEV EXTF v700 (SKR03/SKR04) sowie französischer FEC-Export (Art. L47 A-I LPF) jederzeit reproduzierbar.

---
*Hinweis: Diese automatisch generierte Verfahrensdokumentation dient als technische Grundlage und sollte gemeinsam mit Ihrem Steuerberater final freigegeben werden.*
`;

  return new NextResponse(doc, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="GoBD_Verfahrensdokumentation_${today}.md"`,
      "Cache-Control": "no-store",
    },
  });
}
