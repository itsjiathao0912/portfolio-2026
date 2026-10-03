# Repo-specific notes (portfolio-2026)

This file holds the REASONING behind any repo-specific worktree behaviour; the
machine-readable half would live in `worktree.config.json` under `repoNotes`.

**State today: no `worktree.config.json` exists in this repo yet.** The shared
scripts in `../scripts/` will stop with "worktree.config.json not found" until
one is written. Write it the first time parallel worktrees are actually needed,
using the Config Contract section of `../SKILL.md`. Values this repo would need:

- dev command: `pnpm dev` (already uses a private `NEXT_DIST_DIR=.next-dev`)
- per-lane isolation: `NEXT_DIST_DIR=.next-<lane>` and `LOCAL_DB_PATH=<lane>.wt.db`
  passed on the COMMAND LINE, never in a dotenv file (OpenNext bakes dotenv values
  into the production Worker — see `process/context/platform/deployment-and-env.md`)
- seed command: `pnpm db:seed:local`
- gates: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:e2e:isolated`

Both `.next*` and `*.db*` are already gitignored, which the setup script's
"build dir must be gitignored" check requires (Tailwind v4 scans every
non-ignored file and un-ignored binaries break CSS generation).

No public-URL/tunnel, bundler, or deploy-from-worktree addenda exist yet. Add
them here in the same shape if they are ever needed.
