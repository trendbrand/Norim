# Legal Pages — DE + FR Translation Plan

_Prepared 2026-11-23 · scope: the 18 public legal/policy pages, the last untranslated surface after the full app was localized._

## 1. Why this is a separate pass

Every other surface (public site, dashboard, invoices, inbox, payments, customers, catalog, settings) is now DE/FR via per-surface string maps in `apps/web/src/lib/i18n.ts`. The legal pages were deliberately left out because **they are legal documents, not UI copy** — a mistranslated clause in an Impressum (§ 5 DDG), Terms, Privacy/GDPR notice or DPA/AVV can change legal meaning and liability. The content itself already carries `reviewNotice` fields stating that final legal-counsel sign-off is pending before commercial launch. So this plan treats translation as **draft content that must be reviewable and clearly marked as unreviewed**, not as a drop-in.

## 2. What exists (inventory)

**18 pages, two shapes:**

- **16 data-driven pages** render from one map: `LEGAL_DOCUMENTS` in [`apps/web/src/lib/website-content.ts`](apps/web/src/lib/website-content.ts) (lines ~256–826), through [`LegalPageLayout.tsx`](apps/web/src/components/LegalPageLayout.tsx). Each `LegalDocument` = `{ title, badge, subtitle, effectiveNote, reviewNotice?, sections[] }`; each section = `{ heading, paragraphs[], bullets[] }`. Slugs: legal-notice, terms, subscription-billing, cancellation-refunds, privacy, cookies, dpa, subprocessors, acceptable-use, service-availability, data-retention, ai-transparency, accessibility, third-party-services, complaints, intellectual-property. (`trust` and `impressum` are **not** in this map.)
- **2 bespoke pages**, hardcoded JSX:
  - `legal/impressum` (~64 lines) — statutory German provider ID, already partly German, uses `BRAND_CONTACT`.
  - `trust` (~107 lines) — security/GDPR marketing page with icons.

**Volume:** ~171 translatable strings in the `LEGAL_DOCUMENTS` block (headings, paragraphs, bullet text, subtitles) × 2 languages, plus ~6 UI-chrome strings in `LegalPageLayout` ("Back to NormInvoice", "On this page", "Contact Form →", the brand footer block), plus the two bespoke pages' prose. This is roughly as much text as all previous slices **combined**.

## 3. The architectural blocker (must solve first)

The legal pages are **server components** (`export const metadata = …`, no `"use client"`). The locale switcher stores the choice **client-side** (`localStorage` + a `ni_locale` cookie, set in [`LocaleProvider.tsx`](apps/web/src/components/LocaleProvider.tsx)). A server component cannot read `localStorage`. Two options:

| Option | How | Trade-off |
| --- | --- | --- |
| **A — read the cookie server-side (recommended)** | `LegalPageLayout` + the 2 bespoke pages read `cookies().get("ni_locale")` from `next/headers`; pick the localized document. | Keeps pages as server components (good for SEO/metadata); legal text can be localized in `generateMetadata` too. One small refactor of the cookie read. |
| **B — make `LegalPageLayout` a client component** | Add `"use client"`, read `useLocale()`. | Consistent with the rest of the app, but loses server metadata localization and makes legal pages client-rendered. The 2 bespoke pages still need their own handling. |

**Recommendation: Option A.** It fits legal pages (crawlable, per-locale `<title>`/description) and reuses the cookie the switcher already sets. Deciding this is the real first task — everything else is mechanical.

## 4. Content model for translations

Mirror the proven per-surface pattern, but keyed by slug:

```ts
// website-content.ts
export const LEGAL_DOCUMENTS_I18N: Record<AppLocale, Record<string, LegalDocument>> = {
  en: LEGAL_DOCUMENTS,          // existing English stays the canonical fallback
  de: { /* translated docs, same slugs/section ids */ },
  fr: { /* … */ },
};
```

Keep **section `id`s identical across locales** (they are anchor targets and the "On this page" nav). If a locale is missing a doc, fall back to `en` — so a half-finished language still renders, never a blank page.

## 5. Legal-risk handling (non-negotiable)

- **Keep English as the canonical fallback.** Never delete it.
- **Mark machine-drafted locales as unreviewed**: prepend each translated doc's `reviewNotice` (DE/FR) with a line like _"Diese Übersetzung ist ein maschineller Entwurf und noch nicht juristisch geprüft; im Zweifel gilt die englische Fassung."_ / _"Cette traduction est un brouillon automatique non encore validé juridiquement ; en cas de doute, la version anglaise fait foi."_ The amber `reviewNotice` banner already exists in the layout, so this surfaces automatically.
- **Impressum stays conservative**: the German statutory block (§ 5 DDG / § 18 MStV) should be reviewed by someone who knows the statute, not just translated. Treat it as the highest-risk item.
- **Recommend professional/legal review before launch** — consistent with the app's own "not a substitute for a tax advisor or lawyer" disclaimer.

## 6. Phasing (each phase = one verifiable, committed slice)

1. **Infra (small):** Option A cookie read in `LegalPageLayout` + the 2 bespoke pages; add `LEGAL_DOCUMENTS_I18N` scaffold with `en` only + fallback logic; translate the ~6 layout chrome strings. Verify a page still renders in all 3 locales (falling back to EN). _This unblocks everything and is safe to ship alone._
2. **Low-risk policy pages:** cookies, accessibility, ai-transparency, service-availability, data-retention, subprocessors, third-party-services, complaints, intellectual-property. Shorter, less statutory.
3. **Commercial pages:** terms, subscription-billing, cancellation-refunds, acceptable-use.
4. **High-risk / data-protection:** privacy, dpa, legal-notice, and the bespoke **impressum** — each flagged draft, each ideally reviewed.
5. **trust** (marketing, lower legal risk but long).

Each phase: translate → `tsc --noEmit` → load the page in DE + FR on the dev server → commit. Same loop used for every prior slice.

## 7. Honest recommendation

- **Do Phase 1 now** regardless — the cookie/fallback refactor is pure infrastructure, carries no legal risk, and makes the legal pages locale-aware (today they'd stay English even after translation because of the server-component blocker).
- **Phases 2–5**: I can machine-draft them in the same disciplined, verified way, but they must ship **marked as unreviewed drafts with English as the binding fallback**, and get a human/legal review before you go live in the new year. Given your "launch new year after SEO" timeline, that review window exists.
- If you'd rather not hold machine-drafted legal text on the site at all, an alternative is: Phase 1 only (infra + chrome), and leave legal **bodies** in English with a one-line localized note ("An official German/French version is being prepared") until a reviewer is available.

**Decision needed from you:** (a) Phase 1 infra now, then machine-draft Phases 2–5 as reviewable drafts? or (b) Phase 1 only + "official translation pending" note, bodies stay English until legal review?
