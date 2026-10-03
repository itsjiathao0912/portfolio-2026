---
name: protocol:multi-lane-operations
description: "Operational layer of the Parallel Subagent Watcher for many concurrent lanes: message discipline, report hygiene, commit/merge hygiene, worktree-per-lane integrator pattern, locks, merge policy, resume checklist, briefs, audit lanes, git topology recipes."
date: 02-10-26
metadata:
  node_type: memory
  type: protocol
  read_order: 10
  required: false
  read_when: "running 3+ concurrent agent lanes or worktrees, integrating lane branches, committing on a shared tree, resuming after a restart, or writing lane briefs"
---

# Multi-Lane Operations

Scope: the operational layer under `orchestration.md` §Parallel Subagent Watcher. It records what worked, and what failed, when one orchestrator ran many parallel lanes (build, test, audit, merge) against one product with a user testing live on their own devices. It extends §3, §3b, §5, §6, §6b, §7, §8, §9 and §10 there and does not restate them. Bracketed ids are evidence references to the 2026-09/10 Stage QA session findings.

## S1. Message discipline (extends §10)

- Messages queue and drain at the receiver's next tool round. A scope change, cancel or hold can land after the agent already acted (seen 3 times).
- End every hold message with "re-read my LATEST messages before ANY run or merge". Without that, holds were violated at least 8 times. The orchestrator also checks `ps` and kills runs itself rather than trusting the agent to stop. [P11-33]
- Agents report the sha they OBSERVED, say "this predates my last message" when true, read the inbox before reporting, and keep reports idempotent. [P03-45, P10-40, P07-41]
- Cancel recipe that worked: name the files to delete, say what stays parked, ask the agent for `git status --short`, and never delete the finished branch. [P12-37]
- A "go" was ignored 3 times by one lane (about 20 minutes). After one unacknowledged go: check `git log`, re-send once, then use a FRESH agent for the merge. A separate merger landed the fix in about 90 seconds while the owner sat in a long test run. [P10-41, P11-51]
- Before reassigning a "stalled" lane, check `git log` / `git branch --contains` (one lane's work was already committed). [P08-P3]
- Silent lane: demand "reply NOW with a partial table". [P08-T4]
- Agents idle between rounds: tell them "check `ps` for your own PID and start the next step". [P06-45]

## S2. Report hygiene

- ONE report per lane. An idle notice is a one-line pointer to that report.
- The orchestrator must not answer duplicate idle notifications. "Nothing new: this repeats..." appeared at least 25 times, against the user's own "report only on a change or decision" rule, and was about half of the orchestrator's turns once. [P08-P1, P12-38, P11-48, P04-55, P05-50]
- Lead user-facing reports with the known-bug count and what to test (max 3), then a Work / Status / When table. Agents send progress about every 10 minutes.
- Keep a per-agent task checklist and tick it per report. Agents skipped queued items and the orchestrator re-sent them 4 times. [P04-56]
- Keep ONE pending-decisions list and ask each item once, with a recommendation. The same two decisions were re-listed about 8 times, and a blocked-approval question was re-asked about 8 times. [P04-59, P05-52, P05-63]

## S3. Commit and merge hygiene on a shared worktree

- Committing BY PATH commits whatever the live file holds at that moment (`9fbeef6a` carried one lane's reset, not the intended fix). After every commit run `git show HEAD:<file>` and compare against the verified copy.
- Never stage or commit while a lane is mid-cycle. `git add -A` swept a mid-mutation broken file (`bad316dc`); `71fd5829` swept mid-task work; `55251e89` committed a failing test. Wait for an explicit "stopped editing, clean at <sha>" handshake, all agents idle, and build and typecheck clean.
- Stage your own hunks with `git apply --cached`, check `git diff --cached --stat`, then commit by path.
- Verify the changed line IS in the commit before writing the message (`f0ffce21` had a message describing a fix that was not in the diff).
- `git checkout <sha> -- src/` destroyed a lane's uncommitted work.
- Do not land 4 fixes at once. `85744a4a` made things worse, and its revert reverted the tests but not the source and broke typecheck. Land ONE fix per hardware check, commit between, and revert tests and source consistently. [P08-T2, P02-37, P02-38, P02-41, P04-54, P05-53, P03-18, P03-49]
- Commit closure: before pushing or deploying, typecheck a clean worktree at the candidate commit. Commit-by-path left six `scripts/override-debug-*.ts` files behind after `publishId` became required. [P03-18]
- After a clean merge: grep the dev log for `ReferenceError` and typecheck a clean temp worktree of the merged tip. `a749a8ab` used removed variables, and because dev compiles lazily the crash appeared only at runtime. [P08-14, P08-E3]

## S4. Worktree-per-lane and the integrator pattern

(`phase-programs.md` points here for the "integration lane" pattern.)

- Each lane gets `git worktree add -b <branch> <sha>`, with the whatsapp-sync `node_modules` symlink left untracked. Nobody edits the served worktree directly.
- The integrator merges `--no-ff`, runs `git status` right before each merge, records conflict resolutions (a merge-notes file saved the exact ones), gates one file per process, and runs a scoped check (tsc plus the touched tests) after each merge. It never uses `add -A`, `stash` or `push`; the tracker and `tsconfig.json` are never staged.
- Result: about 15 merges with zero conflicts. The one conflict was a `playwright.config.ts` `testMatch` union.
- When a prop exists on one branch only, the integrator adds the wiring line at merge time instead of asking a lane to break its own typecheck.
- A lane approved to touch a "read-only" file messaged first, kept to additive hunks, and told the sibling lane where the hunks were. [P06-28, P12-45, P07-42, P08-E3]
- Same-file parallel edits (`stage-view.tsx`) worked with: small exact Edits, re-read on conflict, never rewrite or format, SendMessage before touching a shared file, and DECLARE touched regions in the report. Several red-typecheck windows still occurred. [P04-58]
- One named owner per shared file region ("one of you owns it, not both"). [P12-41]
- Hand-back means wait for an explicit yes: an agent asked 3 times to extend its allow-list then edited the file itself. [P03-49]
- Wide shared-component changes (every Drawer or Dialog) need an explicit go. Scope-change messages restate "do not merge" (`37dec564` and others merged without a go). [P11-50, P09-47]
- A fixer that reverses a deliberate test or rule must flag it. Recover with `git revert -m 1`, verify, and ask for an explicit merge-sha confirmation plus a status ping. [P09-10, P09-47]

## S5. Locks and load

- Lock tooling: see `process/context/tests/shared-machine-run-locks.md` (keep tooling out of `/tmp`).
- Sequence a verifier AFTER the build freeze. A skeptic reported an already-fixed leak and blamed the wrong lane while builders were still writing. Freeze build lanes ("stand down, confirm stopped") before a multi-file commit. [P01-39, P01-41]
- Under a running e2e, send a one-line heads-up when starting a product fix, and never edit `src/` under it. [P07-44]
- Each agent gets its own scratchpad subfolder. [P05-23]
- A mid-run `git stash` or `git checkout` by another agent during a mutation check destroyed uncommitted edits twice. Commit first. [P12-19, P11-25]

## S6. Merge policy for the user's live link (decided)

- Fixes go onto the user's link as soon as they pass ("Shouldn't you put everything on my link"), with a one-line "reload".
- Product `src/` merges reload the user's page (see `process/context/platform/mobile-dev-tunnel.md`). Ask or announce before merging while the user is mid-test, batch merges ("go batch"), and treat test-only merges as free. [P10-29, P11-34, P07-26]

## S7. Resume checklist

- A Claude Code update or restart kills all background agents, locks and the watcher cron. A usage-limit pause stalled all lanes while the watcher kept ticking. A laptop restart wiped `/tmp` and the scratchpad (the scenario list was lost: keep a committed backup).
- Recovery that worked: respawn agents fresh, clear stale locks, kill the duplicate cron, and send each lane a RESUME naming its last task, tip sha and lock state.
- Do not re-announce idle every tick. Repoint the watcher at phase boundaries (it polled three finished lanes for hours). `Monitor` events expire after 30 minutes and must be re-armed. Retarget the tick command when the active lane changes.
- A network drop (`ENOTFOUND`) stopped 3 agents with idleReason "failed": send each one "resume where you left off". [P10-27, P10-28, P09-34, P09-52, P06-44, P05-34, P12-42]

## S8. Privacy gate

- The orchestrator's refusals to relay env or secret requests were CORRECT: never copy, symlink or print env files, and never export the speech API key. Use the app's mint-key path or run from the lane that owns env.
- An agent correctly refused a RELAYED "approved" as user consent. Even checking a file's existence can trip the hook.
- Fixers without env route to the lane that owns env (no permission laundering). [P10-39, P09-54, P07-45, P12-25]

## S9. Briefs

- A brief that says "message main" needs SendMessage in the agent's tool grant (an e2e agent had none). [P05-56]
- Test-hygiene brief that worked: harness-level fix only, never weaken an assertion, and a real bug is reported before fixing. [P09-49]
- "Root cause first, report, then fix", plus replay tests built from the user's exact rows. [P08-P10]
- Every lane report carries a "Needs a real iPhone check" block. [P05-60]
- Spawn prompts say `pwd` first and write reports to the WORKTREE's `reports/` (agents twice wrote into main's `reports/`). Copy or commit untracked task folders before spawning, because untracked files are not shared across worktrees. [P01-26, P01-27]

## S10. Audit lanes

- After a cluster of same-shape bugs, spawn an independent read-only audit lane that NAMES the shape. One audit found 8 issues the build lanes missed; a roughly 4-minute audit found host controls unreachable. The orchestrator verifies findings before relaying. [P02-42, P03-48]
- Reward lanes that stop and hand back rather than work around. [P02-44]
- A generated coverage-matrix lane (steps to specs) found two scenarios with green suites that still failed real retests. [P09-51]

## S11. Git topology recipes

- Safe worktree move to a new main: `git checkout -B wt/panel <sha>`, only if `git status --porcelain` shows nothing but the untracked `.fs-os.mjs`. `reset --hard` and `stash` are banned. [P05-29]
- Local `main` with unpushed commits made deploy agents commit deploy records on `origin/main`, and the panel branch could not fast-forward after cherry-picks under new ids. Rebase instead (git drops already-applied commits). [P05-17]
- A rebase of 83 commits conflicted at commit 2-3. Fix: squash the earlier-merge part, cherry-pick the 29 later commits, verify the result is byte-identical via `git merge-tree`, and tag the old branch `wt-panel-pre-rebase`. For a deploy: merge `origin/main`, do NOT rebase 517 `--no-ff` commits. [P05-54, P12-27]
- Long-lived worktree: rebase periodically to stop re-introduced noise (a redundant `require("node:fs")` re-added 3 times pushed lint to 40). [P05-18]
