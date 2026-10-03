---
name: context:all-context
description: "Root context router for portfolio-2026 — project overview, stack, conventions, and routing to the platform/tests/uxui/content groups"
keywords: overview, stack, router, conventions, portfolio, nextjs, cloudflare, architecture
related: [context:all-platform, context:all-tests, context:all-uxui, context:all-content]
date: 03-10-26
---

# all-context.md

> **Source of truth for project-specific knowledge.** Read this first, then route to the
> group entrypoint that matches the task. `all-*.md` files are routers — follow their links to
> the deeper doc before proposing operational steps.

**Last updated: 2026-10-03** — foundation scaffold. Verify current state with
`git log --oneline -5` rather than trusting this date.

## 1. Project overview

A **personal portfolio** site (light theme, case studies) for the owner of
`github.com/itsjiathao0912/portfolio-2026`. Deliberately small: **no auth, no email, no crons,
no containers, no third-party APIs.** It is built on the same Cloudflare + Next.js patterns as
the "Duma" project it was modelled on, simplified to what a content site needs.

Current state: **foundation only.** A placeholder home page proves the stack end to end. The
real site design, pages, and animations come later (see `process/features/portfolio-site/`).
Nothing is deployed yet: no Cloudflare token, D1 database, or domain exists as of this date.

## 2. Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.2.4 | App Router (Turbopack) |
| React | 19.2.4 | UI |
| TypeScript | ^5, strict | Language |
| Tailwind CSS | ^4 | Styling (`@theme inline` tokens in `src/app/globals.css`) |
| shadcn/ui | new-york, zinc base | UI primitives in `src/components/ui/` (button, card, badge so far) |
| motion | ^13 | Animation (`motion/react`) |
| @fontsource | ibm-plex-sans, ibm-plex-mono | Self-hosted fonts (never Google Fonts at runtime) |
| zod | ^3 | Content schema validation |
| @opennextjs/cloudflare | ^1.19 | Next.js → Cloudflare Worker adapter |
| wrangler | ^4.84 | Cloudflare CLI |
| Cloudflare D1 | — | Database (binding `DB`), raw SQL, no ORM |
| Cloudflare R2 | — | Media (binding `MEDIA`), binding access only |
| better-sqlite3 | ^12 | Local D1 emulation (Node only) |
| Bun | 1.3.11 | Unit test runner (`bun:sqlite` in tests) |
| Playwright | ^1.60 | E2E (isolated lane only) |
| pnpm | 10.34.5 (pinned) | Package manager |
| Node | 22 | Runtime for scripts (native TS type stripping is used by `scripts/seed.mjs`) |

## 3. Architecture in one screen

```
content/projects/*.ts  --(pnpm db:seed:local|remote, validated by content/schema.ts)-->  Project table
                                                                                          |
src/app/page.tsx  --getDb()--> local SQLite (dev / LOCAL_DB_PATH)  or  D1 binding DB (Worker)
```

- **Content source of truth = typed files in `content/`.** The database is a synced copy: the
  seed upserts every entry and deletes rows no longer in `content/`.
- **Schema source of truth = `schema/migration.sql`** (idempotent, `CREATE ... IF NOT EXISTS`).
- **`getDb()`** (`src/lib/db.ts`) is the only way to get a database. Local branch when
  `NODE_ENV=development` or `LOCAL_DB_PATH` is set; otherwise the D1 binding, guarded by
  `assertCloudflareBindingsAllowed()` (`src/lib/cf-guard.ts`).
- **Runtime config** is read with `readRuntimeEnv()` (`src/lib/runtime-env.ts`), never
  `process.env.X` directly.
- Pages that read the DB are `export const dynamic = "force-dynamic"` — there is no Cloudflare
  context at build time.
- `/api/health` is the D1-backed route the deploy smoke checks.

## 4. Repository layout

```
content/            typed content (schema.ts, index.ts registry, projects/*.ts)
schema/             migration.sql (DB schema source of truth)
src/app/            App Router pages, globals.css (tokens), api/health
src/components/     fade-in.tsx (motion), ui/ (shadcn)
src/lib/            db, local-db, cf-guard, runtime-env, apply-sql, project-rows, projects, utils
scripts/            cf-setup, db-migrate, seed, push-prod-secrets, deploy-prod, run-isolated-e2e
scripts/lib/        deploy-guards.mjs (pure, unit-tested), prod-env.mjs
tests/unit/         bun tests       tests/e2e/   Playwright specs      tests/helpers/
.githooks/pre-push  runs pnpm typecheck
.github/workflows/  test.yml (never deploys)
```

## 5. Coding preferences (project-wide)

- Don't annotate function return types; let TypeScript infer them. Use `as const` on returned
  result objects.
- In `src/lib/` helpers, **return error objects** (`{ ok: true, ... } | { ok: false, error }`)
  instead of throwing; callers decide how to surface errors.
- Raw SQL only, through `queryAll` / `queryFirst` / `execute` in `src/lib/db.ts`. Quote
  identifiers (`"Project"`).
- Files shared with plain Node (`content/**`, `src/lib/project-rows.ts`) use **relative imports
  with an explicit `.ts` extension** and erasable-only TypeScript (no enums, namespaces, or
  parameter properties) — Node strips types, it does not compile.
- Never write a raw colour in a component; use the token utilities (`text-ink`, `bg-paper`, ...).
- Commit directly on `main` (see CLAUDE.md commit branch policy).

## 6. Context routing

<!-- GENERATED:routing -->
| File | Read when |
|---|---|
| `process/context/all-context.md` | any substantial planning, research, review, or implementation task |
| `process/context/content/all-content.md` | adding or editing case studies, changing the content schema, or seeding the database |
| `process/context/planning/all-planning.md` | writing a new plan or spec and needing the expected structure |
| `process/context/platform/all-platform.md` | deploying, changing env vars or bindings, touching getDb/runtime-env, or debugging local-vs-production differences |
| `process/context/tests/all-tests.md` | running, adding, or debugging any test, typecheck, lint, or CI step |
| `process/context/uxui/all-uxui.md` | styling, adding components, choosing colours/fonts, or adding animation |

## Current Context Groups

| Group | Entry point | Scope |
|---|---|---|
| `content/` | `process/context/content/all-content.md` | Content group entrypoint — the Project/case-study schema, content blocks, authoring in content/, and seeding into D1 |
| `planning/` | `process/context/planning/all-planning.md` | Planning group entrypoint — where plan-format references live and how to pick a SIMPLE vs COMPLEX plan |
| `platform/` | `process/context/platform/all-platform.md` | Platform group entrypoint — Cloudflare Worker runtime, D1/R2 bindings, environment, deployment |
| `tests/` | `process/context/tests/all-tests.md` | Test lanes and commands — typecheck, lint, bun unit tests, isolated Playwright E2E, and the CI workflow |
| `uxui/` | `process/context/uxui/all-uxui.md` | UX/UI group entrypoint — light-theme design tokens, fonts, shadcn components, and motion conventions |
<!-- /GENERATED:routing -->

## Task Routing Table

| Task | Read |
|---|---|
| Deploy, env vars, Cloudflare setup, secrets, anything "production" | `platform/deployment-and-env.md` |
| Run / add / debug tests | `tests/all-tests.md` |
| Design tokens, fonts, components, motion | `uxui/all-uxui.md` |
| Add or edit case studies, content schema, seeding | `content/all-content.md` |

## Context Group Lifecycle

Create or promote a group when a topic has 3+ durable docs or a single doc passes ~800 lines
with separable subtopics. Keep `all-{group}.md` entrypoints, regenerate the routing block with
`node .claude/skills/vc-context-discovery/scripts/discover-context.mjs --emit-routing`, and run
`vc-audit-context` after any reorganization.

## Open questions

- Final domain (wrangler.jsonc has a commented `routes` placeholder).
- `--navy` (#0b1f4d) is a proposed token, not confirmed.
- No `worktree.config.json` yet — the `vc-worktree-*` skills need one before first use.
- The harness validator registry (CLAUDE.md mentions one "added by vc-setup") does not exist in
  this repo yet.
