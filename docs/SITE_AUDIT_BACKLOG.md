# Site Audit Backlog (from external Gemini review + verification)

_Triaged against the live site. Status: ✅ real/actionable · ⬜ real, deferred · ❎ false positive / already OK_

## P0 — "Technical blocker" (DEBUNKED)
- ❎ **"All subpages return PERMISSION_DENIED."** False positive from the reviewer's sandboxed crawler. Verified live: `robots.txt` = 200 (Allows public pages, Disallows app routes), and `/pricing`, `/legal/impressum`, `/security` return **200** to Googlebot. No WAF/Cloudflare (bare EC2 + Caddy). **No action needed.**

## P0 — Legal / GDPR (real)
- ✅ **VAT disclosure missing on pricing** (German PAngV). Add "All prices excl. VAT (zzgl. MwSt. / HT) · B2B only (§14 BGB)" to pricing header + cards.
- ✅ **DPA appears gated to Agency plan.** The Art. 28 DPA is already public at `/dpa` (all plans), but the Agency card lists it as a feature → misleading. Reword Agency bullet to "Custom DPA redlining"; add a line that the standard DPA is included on every plan.
- ✅ **"Proposed contracting entity" wording** in footer reads as not-yet-existing. Finalize entity name or change wording to the operating entity.
- ✅ **Hosting-claim inconsistency.** Trust/security copy says "Hetzner Germany (Falkenstein/Nürnberg)", but we now run on **AWS Frankfurt (eu-central-1)** — still EU/Germany, but the copy is inaccurate. Update to the real provider/region (or keep generic "EU data centre in Germany"). _Resolves the reviewer's "non-EU RAM" concern — we ARE in Frankfurt._
- ⬜ **AI Disclosure link vs "deterministic engine".** Footer links `/ai-transparency` while the product claims no AI. Clarify ("no invoice data trains AI; validation is deterministic") or remove the link.
- ⬜ **Country status accuracy** (Belgium "Available" vs needing a Peppol Access Point; France PDP partner/fees). Review `/countries` copy; state clearly whether Peppol transmission is built-in or partner-operated.

## P1 — Copy / accuracy (real, quick)
- ✅ **FAQ "$0/month" currency typo** → €0 (part of the $→€ sweep).
- ✅ **Remaining `$39` copy** in FAQ/help/contact/solutions + SEO `<title>` tags → €.
- ⬜ **Brand vs email mismatch**: "Trend&Brand" vs `official@trendandbrands.com`. Pick one; align.
- ⬜ **Hero vs table price framing**: hero "€12/month" vs table defaulting to Annual (€120/yr ≈ €10/mo). Make hero say "from €12/mo" or default table to Monthly.

## P1 — Conversion (real, design)
- ⬜ **Business/Agency missing 15-day trial** button/bullet — offer trial on all self-serve tiers.
- ⬜ **Seat / client limits + overage policy** not stated (what happens at invoice 41 on Starter? how many seats on Business/Agency?). Add to cards/FAQ.
- ⬜ **3 competing hero CTAs** → reduce to 1 primary + 1 secondary (validator anchor).

## P2 — Trust / UX / A11y (real, polish)
- ⬜ **Language switcher "endefr"** renders with no spacing/aria — add `aria-label` + spacing.
- ⬜ **Logo text "NormInvoiceProduct of Trend&Brand"** merged — add separator/spacing.
- ⬜ **Security section**: replace defensive "no fake badges" copy with positive proof; mention **MFA/2FA** (if implemented — else add to roadmap), daily encrypted backups, EU region, support SLA.
- ⬜ **Add product screenshots** (dashboard, ZUGFeRD invoice) — currently zero visuals.
- ⬜ **Peppol BIS 3.0 sample** missing from the public validator's sample buttons.
- ⬜ **Footer 18 legal links** → consolidate to ~6 core + move rest under `/trust`.
- ⬜ **Founder identity** (name, LinkedIn, address) absent — add to `/about` for trust.

## Notes on effort
- The translation work (DE/FR for marketing pages) is tracked separately (Phase A/B/C).
- MFA, product screenshots, and founder bio are larger product/content tasks, not one-line fixes.
