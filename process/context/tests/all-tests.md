---
name: context:all-tests
description: "Test lanes and commands — typecheck, lint, bun unit tests, isolated Playwright E2E, and the CI workflow"
keywords: test, tests, testing, bun, playwright, e2e, typecheck, lint, ci, isolated, sqlite, unit
related: [context:all-platform, context:deployment-and-env]
date: 03-10-26
metadata:
  read_when: "running, adding, or debugging any test, typecheck, lint, or CI step"
---

# all-tests.md

## Lanes

| Lane | Command | What it proves | Runs in CI |
|---|---|---|---|
| Typecheck | `pnpm typecheck` | App (`tsconfig.json`) **and** tests (`tsconfig.test.json`). `tsconfig.json` excludes `tests/`, so the second half is the only type check for test files. | yes |
| Lint | `pnpm lint` | ESLint (next core-web-vitals + typescript) | yes |
| Unit | `pnpm test` (`bun test ./tests/unit`) | Content schema, row mapping, seed sync, DB read path, deploy guards | yes |
| Worker build | `pnpm build:cf` | OpenNext produces a deployable Worker | yes |
| E2E | `pnpm test:e2e:isolated` | Real `next build` + `next start` on a private build dir, private seeded DB, free port; Playwright (Chromium) | no (local) |

Pre-push hook (`.githooks/pre-push`, installed by `pnpm install` via `prepare`) runs
`pnpm typecheck`.

## Unit tests (Bun)

- `tests/helpers/test-db.ts` → `createTestDb()`: in-memory `bun:sqlite` wrapped by the **real**
  `createLocalD1()` from `src/lib/local-db.ts`. Bun cannot load `better-sqlite3`, so only the
  driver differs; tests exercise the production wrapper, not a copy.
- Pure script logic lives in `scripts/lib/deploy-guards.mjs` so it can be tested without running
  a deploy.
- Mutation-check new tests: break the code under test once and confirm the test goes red.

## E2E (Playwright)

- Always through `pnpm test:e2e:isolated` (`scripts/run-isolated-e2e.mjs`). Forward args after
  `--`, e.g. `pnpm test:e2e:isolated -- --grep "health"`.
- The runner: seeds `playwright/.tmp/e2e-<id>.db` from `content/`, builds into
  `.next-e2e-<id>`, starts on a free port, waits for `/api/health`, runs Playwright with
  `E2E_BASE_URL`, then cleans up build dir, DB, and the `tsconfig.json` include entries
  `next build` adds. Cleanup also runs on Ctrl-C/SIGTERM.
- `playwright.config.ts` has **no `webServer`** and throws without `E2E_BASE_URL`, so the app is
  never built or started by Playwright itself.
- Browsers run with `colorScheme: "dark"` on purpose: the site is light-only, and the smoke
  asserts it stays light for dark-mode visitors.
- First run on a machine: `pnpm test:e2e:install` (Chromium).
- One heavy command at a time on a busy machine (`uptime` first); builds are CPU-heavy.

## CI

`.github/workflows/test.yml`: install (frozen lockfile) → typecheck → lint → unit → `build:cf`.
No credentials, never deploys.
