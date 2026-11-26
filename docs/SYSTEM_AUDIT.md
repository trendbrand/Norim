# NormInvoice — Full System Audit (pre-launch)

_Live system on finsightai.online. Legend: ✅ working · ⚠️ works with a gap · ❌ missing/misleading · 🔧 fixed this pass_

## 1. AI — is it real or hardcoded?
- ❌ **The "AI Compliance Copilot" is NOT a real AI/LLM.** It's a **deterministic rules engine**: regex/keyword intent-matching that returns answers grounded in your live data + the EN 16931 rulebook + country modules. The code is explicit: *"Deterministic Compliance Copilot · Never hallucinates."* There is **no LLM anywhere** in the codebase (no Anthropic/OpenAI/etc.).
- The footer **"AI Disclosure"** link + "AI Copilot" naming therefore oversell it.
- **To make it real AI:** wire the copilot to **Claude (Anthropic API)** — send your workspace data + rules as grounding context, let the model generate the answer (RAG style). Needs an **`ANTHROPIC_API_KEY`**. The deterministic path stays as a no-key fallback.
- _Note: invoice validation, PDF/A-3, XML — these are deterministic **by design** and should NOT be AI. "Real AI" only applies to the copilot._

## 2. Automation
- ⚠️→🔧 **Recurring-invoice scheduler** exists (60s in-process loop) + an outbox retry drainer — but they only **started on the first `/recurring` (or `/send`) request**, so after a restart automation could silently not run. **Fixed this pass**: added a boot hook (`instrumentation.ts`) so the scheduler starts on every server boot.
- ✅ Manual "Run now" recurring, quota-respecting auto-run, append-only audit.

## 3. Auth — login / signup / 2FA
- ✅ Signup → scrypt auth → session (verified live)
- ✅ Login (verified live)
- ✅ **2FA**: enroll (QR) → TOTP login → backup-code login → disable — all verified end-to-end
- ✅ Admin realm (`/admin/login`) separate + isolated from customer sessions (verified)
- ✅ Multi-tenant isolation airtight (cross-org reads → 404)

## 4. Stripe
- ✅ Connector verified: simulator → validated e-invoice; signed webhook → 200; unsigned → 400
- ✅ Webhook URL now correct (`finsightai.online`, shared `publicOrigin` helper)
- **Nothing missing in code.** To go live, in Settings → Integrations → Stripe: copy the webhook URL, add it in your Stripe dashboard with a signing secret, paste the secret back.

## 5. Email
- 🔧 **Hostinger SMTP** support added (nodemailer); you're configuring the mailbox now.
- Wired to send: verification, password reset, invoice delivery. **To add:** welcome (signup), sign-in alert, 2FA-changed notification.

## 6. Billing lifecycle (your spec) — ❌ not built yet
Needs building: subscription states (trialing → active → past_due → suspended); a **daily check** (via the now-reliable scheduler) that:
- Day 13 → "trial ends in 2 days" **reminder email**
- Day 15 → trial ends; **lock the account** if no paid plan
- Paid renewal due + unpaid → **5-day grace**, then **suspend**
- **Suspended = data kept safe**; login + billing + export still allowed, app gated until payment
Plus the lifecycle emails. I'll build this next.

## 7. Domain change — will it break anything?
**Low risk, and planned for.** The app reads the public host at runtime (`publicOrigin` = forwarded host → `APP_DOMAIN`), so webhook URLs, payment links, and email links auto-adapt. To switch domains you'd:
1. Point the new domain's DNS → the Elastic IP (or new IP)
2. Update `APP_DOMAIN` (Caddy auto-issues a fresh HTTPS cert)
3. Update `NEXT_PUBLIC_APP_URL` + rebuild (SEO/meta tags — build-time)
4. If the **email** domain changes: update `EMAIL_FROM` / `SMTP_USER` and re-verify the sender
No database or deep code coupling to the domain. A domain swap is ~15 min of env changes + one rebuild.

## 8. SEO — current state
- ✅ Per-page `<title>`/description, `sitemap.ts`, correct `robots.txt` (public allowed, app disallowed)
- ❌ Several `<title>`/meta still say **`$39`** and **`norminvoice.eu`** (stale) — should be `€` + `finsightai.online`
- ❌ No **JSON-LD structured data** (Organization / SoftwareApplication / FAQ) — big for rich results
- ❌ No **hreflang** for the DE/FR versions
- ❌ Keyword-targeted titles/H1s not researched
- **Plan:** fix stale metadata, add JSON-LD + hreflang, and do keyword research (needs web search) for the core terms (e-invoicing, ZUGFeRD, XRechnung, Factur-X, EN 16931, per-country).

## Build queue (my recommendation, in order)
1. **Billing lifecycle** (your spec) — biggest, well-defined
2. **Notification emails** (welcome / sign-in / 2FA) — small, after SMTP confirmed
3. **SEO pass** — stale meta + JSON-LD + hreflang + keyword titles
4. **Real AI copilot** (Claude) — needs your `ANTHROPIC_API_KEY`
