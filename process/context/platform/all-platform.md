---
name: context:all-platform
description: "Platform group entrypoint — Cloudflare Worker runtime, D1/R2 bindings, environment, deployment"
keywords: platform, cloudflare, worker, opennext, wrangler, d1, r2, deploy, env, runtime, bindings
related: [context:deployment-and-env, context:all-tests]
date: 03-10-26
metadata:
  read_when: "deploying, changing env vars or bindings, touching getDb/runtime-env, or debugging local-vs-production differences"
---

# all-platform.md

Entrypoint for the **platform** group: how the site runs on Cloudflare and how it gets there.

## Read when

- You are deploying, provisioning Cloudflare resources, or pushing secrets.
- You are changing `wrangler.jsonc`, `open-next.config.ts`, `next.config.ts`, or env files.
- You are touching `src/lib/db.ts`, `local-db.ts`, `cf-guard.ts`, or `runtime-env.ts`.
- Something works locally and fails on the Worker (or the reverse).

## Contents

| File | Covers |
|---|---|
| `deployment-and-env.md` | Token model, first-time setup, deploy flow and its guards, env files, the scars list |

## Runtime summary

- Production: Next.js compiled by OpenNext into a Cloudflare Worker named `portfolio-2026`
  (`main: .open-next/worker.js`, `nodejs_compat`). Static assets served by Workers Assets.
- Bindings: `DB` (D1 `portfolio-db`), `MEDIA` (R2 `portfolio-media`), `ASSETS`.
  Typed in `src/env.d.ts`.
- Local: `pnpm dev` → `next dev` with `NEXT_DIST_DIR=.next-dev`; DB is `./local.db`
  (better-sqlite3) with `schema/migration.sql` applied on open.
- No domain yet; the Worker is reachable on `*.workers.dev` once deployed.
