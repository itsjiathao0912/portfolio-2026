---
name: context:deployment-and-env
description: "Cloudflare token model, first-time setup, deploy:prod flow and guards, env files, and the operational scars list"
keywords: deploy, deployment, production, env, environment, secrets, token, cloudflare, wrangler, d1, r2, setup, rollback, smoke, local_db_path, scars
related: [context:all-platform, context:all-tests]
date: 03-10-26
---

# Deployment and environment

**Status (2026-10-03): nothing provisioned or deployed yet.** No Cloudflare token, no D1
database (`wrangler.jsonc` holds the placeholder id `TBD-created-by-setup-script`), no domain.

## Token model — one credential

- **One account-wide Cloudflare API token** lives in `.env.prod` (gitignored; template
  `.env.prod.example`) as `CLOUDFLARE_API_TOKEN`, with `CLOUDFLARE_ACCOUNT_ID` and `SITE_URL`.
- That one token does everything: `pnpm cf:setup` creates D1 + R2, `db:*:remote` migrate and
  seed, `secrets:push` sets Worker secrets, `deploy:prod` deploys. If a narrower token is ever
  wanted (CI, a teammate), create it **with** this one; nothing else needs a credential.
- Permissions: Workers Scripts:Edit, D1:Edit, Workers R2 Storage:Edit, Account Settings:Read
  (+ Zone/DNS edit once a custom domain is added).
- **R2 is accessed through the Worker binding `MEDIA`**, so there are **no R2 S3 access keys**.
  Do not add them unless something outside the Worker must upload directly.
- `.env.prod` is read only by `scripts/` (via `scripts/lib/prod-env.mjs`). Next never loads it,
  so nothing in it is baked into the bundle.
- CI (`.github/workflows/test.yml`) holds no Cloudflare credentials and never deploys.

## First-time setup (in order)

1. `cp .env.prod.example .env.prod` and fill in the three values.
2. `pnpm cf:setup --dry-run`, then `pnpm cf:setup`. Idempotent: reuses an existing
   `portfolio-db` / `portfolio-media`, and writes the real D1 id into `wrangler.jsonc`.
3. `pnpm db:migrate:remote` then `pnpm db:seed:remote`.
4. Commit `wrangler.jsonc` (the D1 id is not a secret) and push to `origin/main`.
5. `pnpm run deploy:prod`.

## Deploy flow (`scripts/deploy-prod.mjs`)

1. Loads `.env.prod`; refuses a placeholder D1 id.
2. `git fetch origin main`; refuses unless the tree is clean **and** `HEAD == origin/main`.
   Production only ever runs what is on `origin/main`.
3. Creates a **clean git worktree** at `../portfolio-2026-deploy`, pinned to that sha; copies
   `.env.prod` in; `pnpm install --frozen-lockfile`.
4. **Guard 1:** refuses if `LOCAL_DB_PATH` is set in the environment or any dotenv file Next
   loads (`.env.production.local`, `.env.local`, `.env.production`, `.env`).
5. `pnpm build:cf` in the worktree.
6. **Guard 2:** refuses if `.open-next/cloudflare/next-env.mjs` (OpenNext's baked env
   snapshot) contains a truthy `LOCAL_DB_PATH`.
7. Records the live version id, then `wrangler deploy`.
8. **Smoke the live URL:** `SITE_URL/` must render the home marker **and** `SITE_URL/api/health`
   must return `{ ok: true, projects: <number> }`. Retries 5 times (edge propagation).
9. On failure prints `npx wrangler rollback <prior-version-id>`. Always removes the worktree
   (`KEEP_DEPLOY_WORKTREE=1` keeps it for debugging).

Pure decision logic lives in `scripts/lib/deploy-guards.mjs` and is unit-tested in
`tests/unit/deploy-guards.test.ts`.

## Environment files

| File | Committed | Purpose |
|---|---|---|
| `.env.example` | yes | Local template; documents the two "never" rules |
| `.env.local` | no | Optional local defaults (`NEXT_TELEMETRY_DISABLED=1`) — `cp .env.example .env.local` |
| `.env.prod.example` | yes | Production template (names only) |
| `.env.prod` | **never** | Real credentials, read only by `scripts/` |

Test-only markers: `PORTFOLIO_E2E=1` and `LOCAL_DB_PATH` make `cf-guard` refuse real bindings.

## Scars list (each one cost real time in the project this setup came from)

1. **`public/_headers` immutable cache.** Workers Assets serves `/_next/static/*` before the
   Worker runs, so cache headers can only come from `public/_headers`. Without it, every visit
   re-downloads all JS (`max-age=0`). Keep the rule; never add `immutable` to non-hashed files.
2. **pnpm pins.** `packageManager: pnpm@10.34.5` plus BOTH `onlyBuiltDependencies` (pnpm 10)
   and `allowBuilds` (pnpm 11) in `pnpm-workspace.yaml`. pnpm 11 silently ignores the old key and
   hard-errors on undecided builds. In CI, do not also pass `version:` to `pnpm/action-setup`.
3. **`LOCAL_DB_PATH` baked into prod.** OpenNext snapshots dotenv values into the Worker. A
   baked `LOCAL_DB_PATH` makes production take the local-SQLite branch: every DB call 500s while
   pages still return 200. Never put it in a dotenv file; pass it on the command line. Both
   deploy guards exist for this.
4. **`getCloudflareContext()` throws outside a Worker** (it does not return undefined). Call it
   lazily, only on the production branch, and always after `assertCloudflareBindingsAllowed()`.
   Any page that reads the DB must be `force-dynamic`, or the build tries to prerender it.
5. **`readRuntimeEnv()`, not `process.env`,** for runtime config. On a Worker, secrets live in
   the binding env.
6. **Never two dev servers on one dist dir.** They corrupt each other's build output silently
   (stale or blank page, no error). `pnpm dev` uses `.next-dev`; the E2E lane uses a private
   `.next-e2e-*`; builds use `.next`.
7. **Un-gitignored `.db` / build dirs break Tailwind v4.** Tailwind scans every non-ignored file
   for class names; binary bytes become invalid CSS and the page renders blank. `.gitignore`
   covers `.next*` and `*.db*` generically — keep it generic.
8. **Bare `pnpm deploy` is intercepted** by pnpm's own `deploy` command. Always
   `pnpm run deploy:prod`. The `deploy` script exists only to print that reminder.
9. **Stale `.next/lock`.** A killed build leaves `.next/lock`; the next build fails with
   "Another build is currently running". Fix: confirm no `next build` is running
   (`pgrep -f "next build"`), then delete the lock.
10. **Verify on the live URL, not the deploy log.** "Deployed" in wrangler output proves an
    upload, not a working site. The smoke must hit the real URL and a D1-backed route.
11. **OpenNext bakes every value from `.env`, `.env.local`, `.env.production` into the Worker.**
    Never put secrets there; the deploy worktree has none of them, which is part of why it
    exists.
