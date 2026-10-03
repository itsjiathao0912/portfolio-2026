# Repo-specific notes (portfolio-2026)

Template for repo-specific additions to the worktree-program skill. None exist
yet for this repo, and `worktree.config.json` has not been written (see
`.claude/skills/vc-worktree-session/references/repo-notes.md`).

When a repo-specific concern appears, add a section here in this shape:

- **Concern:** what goes wrong when several lanes run at once (e.g. a shared
  daemon, a shared mutable build artifact, a test lane that must be wired by name).
- **This repo's analogue:** where it lives here, or "none today".
- **Guard:** the config key, script, or check that prevents it.

Known starting facts for this repo:

- Heavy jobs (`next build`, `pnpm build:cf`, the isolated E2E lane) should run
  one at a time on a single machine — serialize them across lanes.
- There is no shared build artifact between lanes: every build uses its own
  `NEXT_DIST_DIR`, and `pnpm test:e2e:isolated` already isolates build dir, DB,
  and port per run.
