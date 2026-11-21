# NormInvoice — Deep Production Audit

**Date:** 2026-11-21
**Scope:** Full monorepo (`apps/web`, `packages/*`, `services/*`, `infra/`, `scripts/`, CI)
**Method:** Source read of every security-critical path + ran `pnpm test` (31/31 pass) + `pnpm build`.

---

## 1. Verdict

NormInvoice is a **genuinely substantial, mostly-functional MVP** — not vaporware. The core compliance engine (EN 16931 calculator, CII/UBL serializers, XXE-safe parser, DATEV/FEC exporters, IBAN MOD-97, VIES client) is real and unit-tested. Auth, multi-tenant SQLite scoping, CSRF/security headers, and the SaaS UI are implemented and build cleanly.

**But it is NOT production-ready as-is.** There are **publicly-exploitable security landmines** shipped by default, the README materially **overstates the architecture** (it is a single-node SQLite app, not a PostgreSQL-RLS cluster), and several advertised subsystems (async worker, S3 WORM, Postgres hash-chain) are **built but not wired into the live request path**. None of these are hard to fix; they are listed below in priority order.

**Bottom line:** ~1–2 focused days of hardening gets you to a safe single-tenant-node public launch. The "enterprise" claims (horizontal scale, Postgres RLS, official KoSIT conformance) need either real integration work or honest README edits.

---

## 2. What is real and verified ✅

| Area | Status | Evidence |
|------|--------|----------|
| EN 16931 core (calc, CII, UBL, parser) | Working, tested | `packages/einvoice-core`, 25 tests pass |
| GoBD hash-chain + AES-256-GCM (lib) | Working, tested | `packages/db` 4 tests pass |
| SDK | Working, tested | `packages/sdk` 2 tests pass |
| Auth: HMAC session, scrypt pw, timing-safe compare | Correct primitives | `lib/auth.ts`, `lib/db-store.ts` |
| Multi-tenant scoping (SQLite) | Enforced per-query with `org_id = ?` | `lib/db-store.ts` everywhere |
| CSRF same-origin guard + OWASP headers + CSP | Implemented | `middleware.ts` |
| Edge auth gate on protected pages | Implemented | `middleware.ts` |
| Build & typecheck | Pass | `pnpm build`, `pnpm typecheck` |
| Sandboxed Python engine (zero-egress, read-only, tmpfs) | Well-designed container | `docker-compose.prod.yml`, `services/einvoice-engine` |

---

## 3. P0 — Critical blockers (fix before ANY public deploy)

### P0-1. Known-password super-admin seeded into every production DB 🔴
`seedDemoWorkspaceIfEmpty()` in `lib/db-store.ts` **unconditionally** creates
`founder@nordcloud-gmbh.de` with the hardcoded password `DemoPass2026!` on first DB init.
That same email is the **default `SUPERADMIN_EMAILS`** in `lib/security.ts`.

`ENABLE_DEMO_LOGIN=false` (set in prod compose) only disables the `demo:true` shortcut in
`/api/auth/login` — it does **not** block normal email+password login. So anyone can POST
`{email:"founder@nordcloud-gmbh.de", password:"DemoPass2026!"}` to a fresh production server
and get a **platform super-admin session**.

**Fix:** do not seed the demo workspace in production; remove the hardcoded default super-admin email. *(Applied — see §8.)*

### P0-2. Silent dev-secret fallback in production 🔴
- `getAuthSecret()` falls back to `"norminvoice_dev_fallback_secret_change_in_prod_32chars"`.
- `middleware.ts` repeats the same literal fallback.
- `getEncKey()` falls back to `0123…def` (the example key).

If `AUTH_SECRET` / `APP_ENCRYPTION_KEY_HEX` are ever unset at runtime (missing env, mis-mounted
`.env`, running `next start` outside `deploy-hetzner.sh`), the app **silently** signs sessions and
encrypts secrets-at-rest with world-known keys → total auth bypass + decryptable webhook secrets.
The bash deploy script checks these, but the **application does not**.

**Fix:** fail-fast at startup in production if these are missing/weak/default. *(Applied — see §8.)*

### P0-3. README/architecture claim mismatch (data-loss risk) 🔴
README says "PostgreSQL 16 RLS write-through in Docker production." Reality:
- The **source of truth is SQLite** (`node:sqlite`, a single in-process global singleton).
- `pg-persistence.ts` is a **best-effort mirror**: every write is wrapped in try/catch and
  returns `persistedToPg:false` on any error, **swallowing it**. No read path uses Postgres.

Consequences: (a) Postgres can silently diverge from SQLite and nobody notices; (b) the entire
Postgres + RLS "tenant isolation" story is decorative — real isolation is app-layer SQLite
scoping; (c) `web-api` and `worker-orchestrator` containers **share one SQLite file over a Docker
volume** — concurrent writers to a shared-mount SQLite is fragile.

**Decision required (see §7):** either (A) accept single-node SQLite as the MVP store and **correct
the README + delete the Postgres theater**, or (B) commit to Postgres as the real store. Do not ship
the current "silently mirrors and hopes" setup.

### P0-4. Not under version control 🔴
`F:\Idea` is **not a git repository**. No history, no rollback, no PR review, and the CI workflow
(`on: push/pull_request to main`) can never run. This is a baseline production requirement.
**Fix:** `git init` + initial commit. *(Applied — see §8.)*

---

## 4. P1 — High priority (fix before scaling / onboarding real customers)

### P1-1. Async worker is unwired and its hash-chain is fake
`services/worker` `processGenerateInvoiceJob` **returns** a result object but **persists nothing**
and uses `prevHash: "0".repeat(64)` hardcoded → every "chain link" is genesis, i.e. not chained.
Nothing in `apps/web` enqueues to the `einvoice-generation` queue; the live invoice path is the
synchronous `saveInvoiceForOrg` in `db-store`. So BullMQ/Redis/S3-WORM in the worker are dead code
in practice. Either wire it (enqueue from webhooks, write results back, chain real prev hashes) or
remove it and move S3 archiving into the synchronous path.

### P1-2. Rate limiting is in-process only
`checkRateLimit` uses an in-memory `Map`. It does not survive restarts and is **per-container** —
with `worker` + `web` (or any future second instance) the limits don't hold globally. README claims
"Redis rate limits." Move to Redis (already in the stack) or document the single-instance constraint.

### P1-3. Session tokens cannot be revoked
7-day stateless HMAC tokens with no server-side session store / jti deny-list. Password change does
not invalidate existing sessions; a stolen cookie is valid for 7 days. Add a token version/`jti`
checked against the DB, bumped on password change and logout-all.

### P1-4. Session payload carries PII in a decodable cookie
`email`, `fullName`, `orgName` are base64url (not encrypted) in the cookie. It's signed (not
forgeable) but readable by anyone with the cookie. Consider minimizing to `userId`/`orgId` and
loading the rest server-side.

### P1-5. Shared SQLite volume across two containers
`web_data` is mounted into both `web-api` and `worker-orchestrator`. If the worker is kept, give it
its own DB access pattern (or make Postgres the real store). Two WAL writers on one volume mount is
a corruption risk under load.

---

## 5. P2 — Medium / correctness & ops

- **GDPR vs GoBD conflict:** `deleteOrganizationAndData` hard-deletes via CASCADE, but GoBD requires
  8/10-yr retention of finalized invoices. Art. 17 "erasure" of a workspace that contains finalized
  tax documents is legally nuanced — needs a documented policy (anonymize vs retain) not a blind DELETE.
- **CSP** includes `'unsafe-inline'` and `'unsafe-eval'` in `script-src` (needed by Next, but weakens
  XSS defense). Consider nonces.
- **`services/kosit-validator`** is referenced but only a Dockerfile exists — verify it actually pins
  and serves the official KoSIT validator before claiming "official KoSIT" conformance.
- **No automated E2E in CI against real auth** beyond `launch-preflight.mjs` / `security-audit.mjs`
  (home-grown). No Playwright, no dependency/secret scanning (CodeQL/`pnpm audit`/gitleaks).
- **Observability:** `lib/logger.ts` only; no error tracking (Sentry), no uptime/healthcheck alerting,
  no structured request logging at the edge.
- **Backups:** `backup-postgres.sh` backs up Postgres — but the **source of truth is SQLite**, which
  has no backup script. Back up `web_data`/`norminvoice.sqlite` (and the S3 archive) instead/too.
- **Node version drift:** engines `>=20`, CI uses 22, local is 26. Pin one in `.nvmrc` + `engines`.

---

## 6. Compliance & legal reality check

The code targets the right standards, but "production-ready for a *regulated e-invoicing* product"
means more than green unit tests:
- **KoSIT/veraPDF conformance** must be proven against official test corpora, not just 12 golden
  fixtures. The built-in deterministic validator is a reasonable fallback but is **not** a substitute
  for the official Schematron when you advertise XRechnung 3.0.2 compliance.
- **Impressum/DPA/Terms/Privacy** are placeholders — must be filled with a real legal entity before
  Paddle MoR approval (checklist already notes this).
- **Peppol BIS 3.0** "delivery" is claimed; confirm whether you actually transmit via an Access Point
  or only *produce* the format (very different promises to a buyer).

---

## 7. The one architecture decision — ✅ DECIDED: Option A (SQLite MVP)

**Decision (2026-11-21): single-node SQLite is the committed production store.** Applied: Postgres
container, migration step, and `DATABASE_URL` removed from the prod runtime; the PG write-through is
now permanently inert (guarded by `isPostgresConfigured()`); README corrected to reflect reality;
`backup-sqlite.sh` added (replaces `backup-postgres.sh`); health endpoint reports `mode: "sqlite"`.
The Postgres/RLS code (`packages/db`, `db-repository.ts`, `pg-persistence.ts`) is retained, dormant,
as the future Option B scale path. The options below are kept for the record.

**Was: is the production store SQLite (single node) or PostgreSQL (clustered)?**

- **Option A — SQLite single-node MVP (recommended to launch fastest):** Keep SQLite as truth. Delete
  the Postgres write-through + container, drop RLS claims, back up the sqlite file + S3. Honest,
  simple, fine for hundreds of tenants on one Hetzner box. Fix README to match.
- **Option B — PostgreSQL as truth (needed for HA/scale):** Make all reads/writes go through
  `packages/db` + RLS, delete `db-store.ts` SQLite path, and make write failures hard errors. This is
  real work (porting ~2000 lines of `db-store`) but unlocks multi-instance and the isolation story the
  README sells.

Shipping the current hybrid (SQLite truth + silent PG mirror) is the worst of both.

---

## 8. Fixes applied in this pass

The following P0 code fixes were made directly (safe, non-behavioral in dev):
1. **`lib/db-store.ts`** — demo workspace is no longer seeded when `NODE_ENV=production` (or when
   `ENABLE_DEMO_LOGIN=false`), killing the known-password super-admin in prod.
2. **`lib/security.ts`** — removed the hardcoded default super-admin email; no super-admin unless
   `SUPERADMIN_EMAILS` is explicitly set.
3. **`lib/auth.ts` + `middleware.ts` + `lib/db-store.ts`** — production fail-fast: the app refuses to
   start/serve if `AUTH_SECRET` or `APP_ENCRYPTION_KEY_HEX` is missing, too short, or equals the known
   default, instead of silently using dev keys.
4. **`git init`** + `.gitignore` already excludes `.env`, `data/`, `*.sqlite` — initial commit created.
5. **Committed to SQLite (§7, Option A):** removed Postgres from the prod stack (compose/deploy/env),
   added `infra/backup-sqlite.sh`, rewrote `README.md` to the single-node reality, and relabelled the
   health store mode. The dormant Postgres code is kept as the future Option B.

See §9 for everything still outstanding.

---

## 9. Prioritized remediation roadmap (remaining)

**Before public launch (P0/P1):**
- [ ] Decide §7 architecture; align README to reality.
- [ ] Wire or remove the async worker (P1-1).
- [ ] Redis-backed rate limiting (P1-2).
- [ ] Session revocation on password change/logout-all (P1-3).
- [ ] Fill real legal entity in Impressum/DPA/Terms/Privacy.
- [ ] Add `pnpm audit` + gitleaks/CodeQL to CI; pin Node version.

**Before onboarding paying customers:**
- [ ] Prove KoSIT/veraPDF conformance on official corpora.
- [ ] Error tracking (Sentry) + uptime alerting + SQLite/S3 backup automation.
- [ ] Documented GDPR-vs-GoBD retention policy (P2).
- [ ] Playwright E2E covering auth, cross-tenant isolation, invoice finalize/credit-note.
- [ ] Load test the single SQLite writer; confirm the worker/web volume-sharing decision.

**Nice-to-have:**
- [ ] CSP nonces; minimize session cookie PII; HSTS preload submission.
