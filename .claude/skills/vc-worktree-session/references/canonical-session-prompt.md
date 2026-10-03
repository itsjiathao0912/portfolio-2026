---
name: reference:canonical-session-prompt
description: The prompt a human pastes to start an isolated worktree session, and the clause-by-clause contract it implies.
---

# Canonical worktree-session prompt

This is the prompt the user has been pasting by hand to start worktree sessions.
The skill exists to make every clause automatic. Treat each row as a REQUIREMENT,
not a suggestion — each one is here because its absence caused a real incident.

> worktree — create a copy from remote main as a worktree to do it so as not to
> contaminate with the main local, and test everything there (make sure they have
> same env files setup so that ports don't conflict, their own seed db, everything
> separated so as not to conflict with main).
>
> Everything must be done from the worktree — pull from main remote to rebase,
> commit and push from the worktree, so as not to conflict with things in main
> remote. Including update-process stuff.
>
> e2e disposable test: read the context docs carefully regarding test infra,
> isolated e2e disposable lane, container-true infra and similar existing test
> patterns, to see what is needed to test all scenarios for the new feature — to
> make sure things work 100% as expected if deployed to production. Write new
> tests / new infra / wire new things in; ask for extra credentials if necessary.
> All important scenarios, real user interface, full QA flow, Playwright, real
> clicking and typing against real features in the disposable lane. Screenshot
> verify. If things are separable, set up separate disposable lanes to test in
> parallel for speed — but be careful not to exhaust laptop memory.

## Clause → obligation

| Clause | What the skill must guarantee |
|---|---|
| "copy from remote main" | Branch from `origin/main` after an explicit fetch. Never local `main`, never local `HEAD`. |
| "not contaminate the main local" | Worktree lives OUTSIDE the repo, in a sibling parent dir. Setup refuses to run against the main checkout. |
| "same env files setup" | `.worktreeinclude` copies gitignored env files into every new worktree. |
| "ports don't conflict" | A free port is allocated, written into the worktree env, and recorded in a registry. |
| "own seed db" | Own DB path/name, seeded fresh, and **gitignored**. |
| "everything from the worktree" | Preflight asserts cwd is the worktree before any git write. |
| "pull from main remote to rebase" | `git fetch origin && git rebase origin/main`, run inside the worktree. |
| "including update-process stuff" | `process/` doc edits are committed from the worktree on the same branch. |
| "read the context docs" | Required reading list is declared in SKILL.md, not left to the agent to guess. |
| "wire new stuff in" | New spec files must be wired into a Playwright project's `testMatch` AND verified picked up. |
| "real clicking/typing/screenshot" | Disposable-lane project driving real UI, screenshots retained on failure. |
| "parallel lanes, don't exhaust memory" | Each lane gets unique dist dir + port + DB; a concurrency cap is enforced. |
| "be thorough, don't make me find it manually" | A scenario checklist must be filled, AND each claim proven by reversal. |

## Why "tests pass" is not the bar

A previous session reported a green suite while real bugs remained, and the user
found them by hand. A passing test proves the test ran, not that it would have
caught the bug. Before claiming a scenario is covered, break the behaviour
deliberately and confirm the test goes RED, then restore. Restore by hash or by
re-editing in place — never `git stash`, which is repository-global and will
collide with other worktrees.
