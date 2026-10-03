---
name: vc-worktree-session
description: "Create and drive ONE isolated git worktree for a single feature/session — own branch off origin/main, own port, own db, own build dir, env carried over. Use for a single lane of work; escalate to vc-worktree-program for 3+ independent lanes."
argument-hint: "[worktree name] [task description]"
trigger_keywords: worktree, isolated worktree, worktree session, sibling checkout, disposable branch, don't contaminate main
layer: contract
metadata:
  author: vibecode-pro-max-kit
  version: "1.0.0"
---

# vc-worktree-session

> **Output style:** Follow `process/development-protocols/communication-standards.md` — answer-first, plain language, no unexplained jargon, TL;DR on long responses.

One agent, one isolated git worktree, for a single feature or session. The worktree gets its own branch off `origin/main`, its own port, its own database, its own build dir, and its gitignored env files carried over — so it cannot collide with the user's main checkout or with any other agent's worktree. All git work for that session (rebase from remote main, commit, push, including `process/` doc edits) happens FROM that worktree, never from the main checkout.

The exact prompt this skill formalizes, and the clause-by-clause contract it implies, is documented in `references/canonical-session-prompt.md` — read it once; every rule below traces back to a clause there.

---

## When To Invoke

| Situation | Use |
|---|---|
| One feature, one agent, needs to build/test without touching the user's checkout | **this skill** |
| 3+ independent lanes that must run in parallel (own port/db/build dir each, capped by laptop memory) | `vc-worktree-program` (sibling skill — not documented here) |
| A trivial, read-only question with no build/test/commit involved | Neither — just answer it |

If a task starts as one lane and grows into several independent ones mid-session, stop and escalate to `vc-worktree-program` rather than hand-rolling a second worktree next to the first.

---

## Commands

All commands are repo-agnostic — every repo-specific value (ports, dist dir, db path, install/dev/gate commands, e2e wiring) comes from `worktree.config.json` at the repo root, never from the scripts. If a script ever needs an `if (repo === ...)` branch, the fix belongs in that config file, not in the script.

### 1. Setup

```bash
node .claude/skills/vc-worktree-session/scripts/worktree-setup.mjs <name>
```

Fetches `origin/<defaultBranch>`, creates a sibling worktree on branch `<branchPrefix><name>`, carries over gitignored env files (via `.worktreeinclude` or `envFiles`), allocates a free port per `ports` entry, creates a per-worktree build dir and db file, **verifies both are gitignored** (refuses to continue otherwise), installs dependencies, runs the **dev-server preflight** (refuses if something already holds this lane's build dir or dev port), and records everything in `<worktreesDir>/registry.json`.

Flags:
- `--dry-run` — print every step without creating anything (no fetch side effects beyond the read, no worktree, no install).
- `--no-install` — skip the dependency install step (useful when chaining setup calls or when deps are already primed).

### 2. Develop

```bash
cd <worktreesDir>/<name>
# Run the command setup PRINTED, env and all — not a bare `pnpm dev`:
NEXT_DIST_DIR=.next-<name> LOCAL_DB_PATH=<abs>/<name>.wt.db PORT=<lane port> pnpm dev
```

The env prefix is load-bearing, not decoration. A dev server reads its port and build dir
from the PROCESS environment at startup; the .env file setup appends is loaded later, for
application code. A bare `pnpm dev` therefore starts on the DEFAULT port with the DEFAULT
build dir — two lanes then share one build dir and silently corrupt it, the exact failure the
dev-server preflight refuses. Setup prints the correct command with the lane's real values
(from `distDirEnv` / `dbPathEnv` / `portEnv`); copy that line rather than retyping it.

Run the config's `gates` commands (typecheck, typecheckTests, unit, e2e) from inside the worktree before calling anything done. For this repo those are `pnpm typecheck`, `pnpm typecheck:tests`, `pnpm test`, `pnpm test:e2e:isolated` — see `worktree.config.json` `gates`.
`pnpm typecheck` now covers src/ AND tests/ (it used to check src/ only, so a lane could report
"typecheck clean" truthfully and still have its push rejected by the pre-push hook for a type error
in a test file); `typecheck:tests` remains as the faster half while iterating on a test.

### 3. Rebase, commit, push — ALWAYS from the worktree

```bash
git fetch origin && git rebase origin/main
git add <files>          # including any process/ doc / update-process edits
git commit -m "..."
git push -u origin <branchPrefix><name>
```

Never run these from the main checkout on the worktree's behalf. "Everything must be done from the worktree" includes update-process artifacts, not just source code.

### 4. Teardown

```bash
node .claude/skills/vc-worktree-session/scripts/worktree-teardown.mjs <name>
```

Fails closed by default: refuses to remove a worktree that has uncommitted/untracked files or commits not yet pushed to `origin/<defaultBranch>`. Kills any process still holding an open file handle under the worktree directory, removes the git worktree, deletes the branch, and drops the registry entry.

Flags:
- `--force` — discard uncommitted work / unpushed commits and remove anyway. Only after confirming with the user that the work is disposable.
- `--keep-branch` — remove the worktree but leave the local branch in place (e.g. it's already merged upstream and you want to diff against it later, or a PR is still open against it).
- `--dry-run` — show what would be killed/removed without doing it.

---

## The Config Contract (`worktree.config.json`)

| Key | Meaning |
|---|---|
| `remote`, `defaultBranch`, `branchPrefix` | Where to fetch from and how the new branch is named (`<branchPrefix><name>`). |
| `worktreesDir` | Sibling directory (relative to repo root) all worktrees live under. Never inside the repo. |
| `distDirPrefix`, `distDirEnv` | Per-worktree build output dir name and the env var that points the dev/build command at it. |
| `dbPathTemplate`, `dbPathEnv` | Per-worktree database file name and the env var that points the app at it. |
| `ports`, `portEnv` | Named ports to allocate (e.g. `dev`) and the env var each is written under. |
| `envTargetFile`, `envFiles` | Which file gets the per-worktree overrides appended, and which gitignored files get carried over from the main checkout (overridable per-worktree via `.worktreeinclude`). |
| `installCommand`, `depsProbePackage` | How to install deps, and which package's `package.json` proves the install actually resolved locally. |
| `devCommand`, `seedCommand` | How to start the app and (if any) seed its database. |
| `gates` | The commands a lane must run green before its work counts as done. |
| `e2e` | Which Playwright lane/project to target, where specs live, how to verify a spec is wired in (`listCommand`), how to run it, and required env vars. |
| `hazards` | `serializeHeavyJobs` / `maxConcurrentLanes` — caps for running more than one lane's heavy commands at once. |

**Scripts are shared verbatim across repos.** Every repo-specific fact — a different port range, a different test runner, a different db engine — is a new key or value in this file, copied into the new repo's own `worktree.config.json`. The scripts (`worktree-lib.mjs`, `worktree-setup.mjs`, `worktree-teardown.mjs`) never grow a repo name check.

---

## Hard Rules

Each of these traces to a real incident. Skipping the rule reintroduces the incident, not just the risk.

| Rule | Why |
|---|---|
| Branch from `origin/<defaultBranch>` after an explicit `git fetch` — never local `main`, never local `HEAD`. | A stale local `HEAD` caused an agent to overwrite a different, concurrent session's uncommitted work — permanently, with no dangling-object recovery possible. |
| The worktree lives in a **sibling** directory, never inside the repo (not under `process/`, not `.claude/worktrees`). Setup refuses to create one that resolves inside the repo. | A checkout nested in the repo gets scanned by Tailwind and by every build glob — the exact failure class the next rule describes, just triggered by placement instead of `.gitignore`. |
| The build dir **and** the db file MUST be gitignored, and setup verifies this and refuses to continue otherwise. | Tailwind v4 discovers source files by scanning everything git does not ignore. It reads an un-ignored binary as source, extracts raw bytes as class candidates, and emits invalid UTF-8 into the generated CSS — 500ing the dev server on every edit. Measured: 5/5 edits broken un-ignored, 0/5 ignored, same worktree, same bundler. |
| Teardown kills by **open file handle** on the worktree, and MUST ignore handles under `node_modules`. | Killing by port misses the PostCSS/worker child (it holds no socket); `pkill -f` misses a process whose path is only its cwd, not in its argv. Either mistake leaves an orphan that rewrites the NEXT run's build dir and makes `rm -rf` fail with "Directory not empty". |
| Setup **refuses** to advise a dev server when one already holds this lane's build dir or dev port — it names the PIDs and kills nothing. | Two servers sharing one build dir corrupt it silently: the loser keeps writing into a directory the winner replaced. The rule already existed in prose and was broken repeatedly anyway, costing hours — so it is now something that refuses. It does not auto-kill because that other server may be a colleague's live session, and this repo has a real incident of one lane destroying another's work. |
| Port probing binds the **wildcard** address, never `127.0.0.1`. | A dev server listens on `*:PORT` (IPv6). On macOS a `127.0.0.1` bind SUCCEEDS against that, so the probe called an occupied port free and every lane was handed the same base port. Measured: `127.0.0.1:2000` bound fine while wildcard `:2000` returned `EADDRINUSE`, with a live `next-server` holding `*:2000`. Ports are also seeded from `registry.json`, so a lane whose server is merely stopped still owns its port. |
| Dependencies must **resolve**, not merely exist — check via the real install path, not `existsSync` alone. | Some repos symlink `node_modules`, so an existence check follows the link back to the main checkout and falsely passes, even though the worktree never actually installed anything of its own. |
| **Never `git stash`** during multi-worktree work. To prove a test goes red, neutralise the change in place and restore by hash. | The stash is repository-GLOBAL, not per-worktree — one worktree's `git stash pop` can grab a completely different lane's stashed entry, and recovering from that has required a hard reset before. |
| All git writes — rebase, commit, push, and `process/` documentation edits (including update-process) — happen FROM the worktree. | The main checkout must stay clean and uncontaminated by any one session's in-progress work; this is the entire point of using a worktree instead of a branch switch. |

---

## Verify Before You Claim Done

A passing test proves the test ran, not that it would catch the bug. Before reporting any scenario as covered:

1. Deliberately break the behavior the test is supposed to guard.
2. Confirm the test goes **RED**.
3. Restore the behavior (by hash, or by re-editing in place — never `git stash`, see the rule above).
4. Confirm the test goes **GREEN** again.

Practice: commit first; run the mutation in your OWN worktree, never the one a dev server serves (it reloads the user); restore by `cp` from a private copy, not `git checkout <file>`.

This exists because a previous session reported a fully green suite while real bugs remained in the code, and the user found them by hand afterward. "Green" without a deliberate red/green cycle is not evidence — it is the same shape of false confidence.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Dev server 500s with `Unexpected token Ident("<0xEF><0xBF><0xBD>")` (or similar) in `globals.css` | An un-ignored binary (build dir or db file) inside the worktree is being scanned as CSS source | Add a GENERIC pattern to the repo's tracked `.gitignore` (e.g. `.next-*/` and `*.wt.db`) so every future worktree is covered — not a one-off ignore for this worktree only |
| `rm -rf` (or `git worktree remove`) says "Directory not empty" | An orphaned process is still holding open file handles inside the worktree | Use `worktree-teardown.mjs`, which kills by open file handle (`lsof`) before removing — don't hand-run `rm -rf` |
| A new spec/test file "seems to not run" — no failures, no output | It was created but never wired into a Playwright project's `testMatch` alternation | Add the spec's basename stem to `testMatchFile`'s alternation, then confirm with the config's `e2e.listCommand` before trusting it runs |
| Setup dies with "a dev server is already running for this lane" | Something holds this lane's build dir open, or is listening on its dev port | Inspect with the two `lsof` commands the message prints. Stop that server deliberately, or use a different lane — do not kill blind, it may be someone's live session |
| Setup dies with "these are NOT gitignored" | The build dir or db path pattern isn't covered by any `.gitignore` rule yet | Same fix as the CSS-500 row above — add a generic pattern, don't special-case this one path |
| Teardown killed ANOTHER lane's dev server | `lsof +D` matches on device+inode, and deps are installed with `--config.package-import-method=hardlink` — so a shared dependency file is the SAME INODE across every worktree, and any lane's server holding it looks like a holder of yours | Already fixed: `pidsHoldingDir` now reads paths (`-Fpn`) and keeps a pid only when it holds a file OUTSIDE `node_modules`. If you re-hand-roll this check, keep that filter |
| Every lane got the same port | The free-port probe bound `127.0.0.1` while dev servers listen on the wildcard | Already fixed — probe binds the wildcard and seeds taken ports from the registry |
| Teardown refuses to remove, listing uncommitted files or unpushed commits | Fail-closed default — the worktree still holds real work | Push the branch, or re-run with `--force` only after confirming the work is disposable |
| `pnpm run deploy:prod` from a worktree fails (dotenv `LOCAL_DB_PATH` guard, or an opaque OpenNext `middleware-manifest.json` ENOENT) | The lane's own isolation env vars (`LOCAL_DB_PATH`, `NEXT_DIST_DIR`) are still set — OpenNext ignores `NEXT_DIST_DIR` and always reads `.next/`, so the ENOENT gives no hint why | Comment out both vars in the lane's env file, `rm -rf .next`, deploy, then restore the env file. Full writeup: `process/context/platform/deployment-and-env.md` §Worktree-deploy rule |
| `build:cf` breaks, or a build without the override pollutes the dev folder | A worktree env file that sets `NEXT_DIST_DIR` leaks into builds that must use the default `.next/` | Keep `NEXT_DIST_DIR` out of the env file used for builds; pass it only on the dev-server command (`process/context/platform/deployment-and-env.md` #52) |
| "Publishable key not valid" with a key that looks right | A duplicate `NEXT_PUBLIC_*` key in the worktree env file: the later line wins and can be a different service's key (one repo had a Stripe `pk_test_...` under its auth provider's name) | Base64-decode the key to see which instance it belongs to; rename or remove the stray line |
| Fresh worktree fails to start a sub-service | Untracked per-service `node_modules` are not shared across worktrees | Symlink the service's `node_modules` (do not commit it); a symlink pointing outside the worktree root is rejected by Turbopack, so link inside it; a stale build dir also inflates eslint |
| Task folder or tracker is missing in the worktree | Untracked files are not shared across worktrees | Copy the task folder in or commit it before spawning agents; freeze build lanes before a multi-file commit |
| Agents need the worktree env file | Per-worktree env files are privacy-gated | The user approves once; the orchestrator links it; agents never read it |

## Repo-specific extras (not in the shared scripts)

A worktree gives you isolation. Anything beyond that — a public URL, which
bundler runs, how the database is seeded — is a property of the REPO, not of
worktrees, so it lives in that repo's `worktree.config.json` under `repoNotes`
and in its context docs. The shared scripts stay byte-identical across repos;
put a repo concern in them and that stops being true.

Read `repoNotes` in the config for this repo's actual paths. This repo has no
`worktree.config.json` yet — see `references/repo-notes.md` for the values it
would need. Typical rows, once configured:

| Need | Where it lives |
|---|---|
| Phone-testable public URL | `repoNotes.publicUrl` (none configured in this repo) |
| Which bundler / why it works here | `repoNotes.bundler` -> `process/context/tests/all-tests.md` |
| Seed data | `seedCommand` in the config (`pnpm db:seed:local` here). Setup RUNS it against the worktree's own database. |

Two things worth knowing rather than rediscovering:

- **Turbopack works in a worktree only because the gitignore check passed.**
  Tailwind v4 discovers source files by scanning everything git does not ignore,
  so an un-ignored build dir is read as source and its raw bytes reach the
  generated CSS as invalid UTF-8 — 500ing the dev server on every edit, with an
  error naming `globals.css` and looking nothing like the cause. Turbopack was
  blamed for a full day; it was never the bundler. Setup refusing to continue on
  an un-ignored build dir is what prevents this.
  (One later worktree's reversal test — removing the ignore line — did not
  reproduce the CSS failure, so treat the mechanism as contributory rather than
  proven sufficient on its own. What IS proven is that orphaned writers are
  real, and that killing them by open file handle stopped the corruption for 14
  consecutive edits.)

- **A second dev server on one worktree is refused, not just discouraged.** The
  sibling guard to the gitignore check above: same shape of failure, same
  history. "Never run two dev servers against one worktree — they share one
  build dir and silently corrupt it" was already written down, and was still
  broken repeatedly in a single session at a cost of hours. Prose did not hold,
  so setup now checks it. It looks for a process holding the lane's build dir
  open **and** a process listening on its dev port, because either check alone
  has a measured blind spot: a PostCSS/worker child holds no socket, and a
  server whose worktree path is only its cwd is invisible to `pgrep -f <path>`
  (PID 94810 survived exactly that kill and kept serving a deleted build dir).
  It names the PIDs and stops. It never kills — that server may be someone's
  live session. Without `lsof` it warns instead of failing: a preflight that
  crashes is worse than the bug.

- **Seeding is not done until you walk the first-use path AS THE REAL SIGNED-IN USER.** A seed with schema and rows still failed once: the seed session had no owner and no posts, so the host got no controls and the picker was empty. Make the owner the account the user signs in with, then sign out/in and walk it before handing over a URL.
- **Phone tests: put an on-screen copyable debug log and a build stamp (commit sha + time) in the page header**, so the user and the agent both know which build is running (the `vc-qa-tracker` skill, its latest-build checklist).
- **Seeding is part of isolation, not a nicety.** A worktree with schema but no
  rows opens on an empty app, which is indistinguishable from something being
  broken — and the agent then debugs the wrong thing.

## Main worktree vs sub-worktrees

Git does not label worktrees, so the branch-name prefix is the contract.

```
origin/main
   ^  push + deploy
wt/<feature>      <- main worktree  (<repo>-worktrees/<feature>)  = user's test link
   ^  git merge --no-ff (orchestrator only)
   |-- fix/<a>    <- sub-worktree   (<repo>-worktrees/<a>)
   |-- feat/<b>   <- sub-worktree   (<repo>-worktrees/<b>)
   '-- int/<c>     <- temp branch merging several subs
```

**Main feature worktree** — one per feature, branch `wt/<feature>` in `<repo>-worktrees/<feature>`.
- It is the integration point. The dev server and tunnel serve it (the user's test link).
- The feature's QA tracker (`vc-qa-tracker`) and its process docs live and are committed there.
- Agents never edit it directly. Only the orchestrator merges into it.

**Sub-worktrees** — one per fix or sub-feature.
- Branch `feat/…`, `fix/…`, `test/…` or `hotfix/…`, created FROM `wt/<feature>`:
  `git worktree add ../<name> -b <prefix>/<name> wt/<feature>`
- Each is a SIBLING folder in `<repo>-worktrees/`, never nested.
- Merged back with `git merge --no-ff` from the main worktree; the user's link then hot-reloads.
- `int/…` = a temporary integration branch for merging several sub-branches together.

**Telling them apart**
- `git worktree list` — every folder and its branch.
- `git branch --merged wt/<feature>` — finished subs.
- `git log --oneline origin/main..wt/<feature>` — what is not in production yet.

**Lifecycle and cleanup (mandatory).** Once a sub-branch is merged into `wt/<feature>`, remove its worktree and branch:
- `git worktree remove <path>`, then `git branch -d <branch>`. `-d` refuses unmerged work; that is the safety.
- Never `-D` or `--force` without the user's yes.
- Keep unmerged/parked branches, and any worktree another live session or agent is using.
- Evidence: by 2026-10-02 about 125 worktree folders had piled up, almost all already merged.

**Flow to production.** `wt/<feature>` -> push to `origin/main` -> deploy. The user's original checkout (local `main`) does NOT follow automatically; it needs `git pull` / a merge of `origin/main` afterwards, keeping any local-only commits. A worktree checks out one branch at a time, and a branch can be checked out in only one worktree.

## Closing a session (do this by default)

A session ENDS with one command. It lands the work, then removes everything the
lane created:

```bash
node .claude/skills/vc-worktree-session/scripts/worktree-teardown.mjs <name> --land
```

In order, and the order is the point:

| Step | Why |
|---|---|
| refuse if uncommitted changes exist | landing is not a commit step; a rebase would fail or strand them |
| `git fetch` + `git rebase <remote>/<default>` | land on top of what everyone else has |
| `git push HEAD:<default>` | the work reaches the shared branch, not just a private one |
| public URL torn down (if the repo opens one) | a tunnel holds account-wide DNS and Worker routes; orphans are how an account fills with entries nobody can identify |
| dev server / any process killed by OPEN FILE HANDLE | killing by port misses the worker child; `pkill -f` misses a process whose path is only its cwd |
| worktree folder removed (its database goes with it) | |
| branch deleted, registry entry removed | |

**Rebase and push happen BEFORE anything is destroyed.** Tearing down first and
pushing after leaves a window where a failed push has already deleted the only
copy of the work. Every failure above stops the run with nothing deleted.

Without `--land` it only removes — correct when the work is being abandoned.
Use `--force` to discard uncommitted work deliberately, `--keep-branch` to keep
the branch.
