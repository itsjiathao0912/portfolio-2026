---
name: vc-qa-tracker
description: Maintain a living QA tracker (manual script + automated-test spec + progress log) while the user hand-tests a feature. Use when a manual test cycle starts, bugs arrive in chat, or before telling the user to retest.
argument-hint: "[feature slug or tracker path]"
trigger_keywords: qa tracker, retest, manual test, hand test, test tracker, retest now, bug list, device checklist, latest build
layer: contract
metadata:
  author: vibecode-pro-max-kit
  version: "1.0.0"
---

# QA Tracker

> **Output style:** Follow `process/development-protocols/communication-standards.md` — answer-first, plain language, no unexplained jargon, TL;DR on long responses.

Owns ONE living artifact per feature: `{slug}_QA_{dd-mm-yy}.md` in the feature's task folder
(`process/features/{feature}/active/{slug}_{date}/`). It does three jobs at once: the user's manual
test script, the spec the automated e2e agents build from, and the progress log fixers update.

It is **not** part of SPEC (SPEC freezes when planning starts; this file stays live) and **not** a
RIPER phase. It hooks into existing steps (see Hooks).

## When to use

- The user starts a multi-day manual test cycle on a feature.
- The user reports a bug in chat while lanes are still building.
- Anyone is about to tell the user "ready to retest".

Blank file shape: `references/tracker-template.md`.

## Hooks into existing steps

| Step | What this skill does there |
|---|---|
| SPEC | Each acceptance criterion seeds the first scenarios (the SPEC itself stays frozen). |
| VALIDATE | Every scenario is mapped to a named automated test (`Spec: path:line`) or marked MANUAL-ONLY with a reason (`vc-test-coverage-plan` owns the tiers). |
| EXECUTE / EVL | Test runs update the scenario's "Automated test" line with evidence (see Status rules). |
| Before any production deploy | Hand-test checkpoint: rewrite "Retest now", user confirms, only then deploy. |
| UPDATE PROCESS | Move user-confirmed items to Done; harvest durable lessons into `process/context/` docs. |

## The user's locked rules (do not paraphrase away)

1. Every new issue gets a home the SAME turn: an existing scenario (status changes), a new scenario or group, or one line under **Small issues & notes** tagged to the nearest scenario.
2. Every bug the user mentions goes in immediately — and you TELL the user which scenario it landed in (they were angry when a bug was filed but not reported back).
3. Group by feature, the focus group on top, related scenarios adjacent.
4. Status changes only on evidence: being built → on the link → ✅ only when the user confirms → Done.
5. Separate problems get separate scenarios.
6. Steps are one action + one expected result; history is folded.
7. "Don't test yet" items are clearly marked and are removed from the retest table when they break again.
8. One group at a time.
9. A planned "This morning" section: what was fixed / what to test, in order / what to skip.

Also: a closed scenario moves to Done; a separate bug found while testing becomes a NEW scenario (not a note inside the old one). A long pasted user note becomes "Your feedback — summary" (wording kept where it matters). A confirmed fix STRIKES older notes about the same thing — a stale note once caused real wasted work.

## Status vocabulary

🔧 fixing (don't retest) · 🔁 RETEST (fix is on the user's link) · ⬜ NEVER TESTED · ❓ NEEDS CHECKING (found by transcript audit, unknown state) · ❌ issue found · 🤖 automated passes · ✅ confirmed by the user.

- **Only the user's hand test moves a scenario to ✅ / Done.** Automated passes are recorded as 🤖, never promoted. Partial confirmation keeps the scenario open.
- **Never set 🔁 before ALL of:** the fix is merged to the user's link; the dev log shows a successful compile; a browser re-run on the merged build passed; the commit sha is named on the scenario. ("Ready" set before a merge + re-run left two scenarios "ready" while broken.)
- **"Automated test" line** = `Spec: path:line | lane | real-UI|unit-only`, the commit tested, `PASS` / `FAIL` / `NOT AUTOMATABLE`, and an evidence path. Write Playwright's own "N passed / 0 failed" — never "unit tests ✅" without file names. A `unit-only` scenario is a GAP, not coverage.
- **MANUAL-ONLY** needs a reason (real iOS keyboard, camera light, projector sound, real screen-capture picker, headless cannot block a permission).

## Retest-now block (top of the file)

Rewrite it every time something lands. It must be self-contained — the user should never have to ask "what do I do now?".

- Test link with exact URLs (correct `&` between two flags, e.g. `?a&b`), device, account, build label.
- "Before you start" steps: which tab/device to reload, permission resets.
- New-on-the-link items IN ORDER, each with "what to expect on step N" and the one result that matters.
- "Don't test yet" list; "waiting on you" list.
- Say plainly what was built vs what was seen working ("nothing touched a real device").
- Before ANY retest message run `references/latest-build-checklist.md`.

**Message wording:** plain words; no internal item numbers (use the scenario id + a plain label); name the tab and device to reload; list what is NOT yet on the link.

## Failure-report template (give it to the user)

`QA S<n> failed at <HH:MM> on <device>. Expected: <…>. Saw: <…>. Console: <paste or none>. Read the dev log around that time and investigate — don't change code yet, tell me the cause first.` The timestamp lets server logs be matched.

## Bug routing (evidence first)

Dev log → DB rows → a Playwright repro → fix → a regression test that FAILED before the fix. Investigate the user's ACTUAL attempt (their rows, their log lines) before theorising. Label guesses "probable, not proven". Each UI item goes to the lane that owns its files (shared-file items serial, disjoint ones parallel), its own commit, and an explicit "who does this affect" answer.

## Lane protocol

- Tell each lane the tip sha every time; require merge/rebase before each run; reports MUST name the commit tested (lanes that tested an old base reported already-fixed bugs).
- After a merge: set the scenario to 🔁 only per the evidence rule, and request an e2e rerun.
- E2E lane recipe: `references/e2e-lane-recipe.md`.
- Merging into a served worktree reloads the user's page mid-test: batch merges, say "no reload needed" for test-only merges (see `process/context/platform/all-platform.md`).

## Transcript audit (run when the user says things got lost)

Pull bug reports out of the user's HUMAN messages only (skip tool results and watcher ticks) across the relevant transcripts. Dedupe against the tracker. Add what is missing as ❓ NEEDS CHECKING scenarios, one-line small issues, and decisions. Method: back up the file, re-read right before writing, write once. Report counts (found / already tracked / added).

## File-edit safety

The user may be editing the same file (VS Code reformat, folder moves).

1. Back up first. 2. Re-read immediately before writing; if it changed, abort and redo. 3. Write once. 4. Verify heading count and `[x]` count match before/after. 5. Never reformat the whole file; never bury long prose in History. 6. Commit the tracker deliberately in the feature folder (it is a single fragile copy otherwise). Never stage it by accident in an unrelated commit.

## Decisions ledger

Keep a "Decisions (don't re-propose)" section. Agents MUST read it before proposing or building. A newer decision strikes the older line. Durable decisions also go to the feature's context docs.

## Done section

Newest first, short. Each entry: "Confirmed <date> (build <sha>)". Physically re-order when asked.

## Closeout

Every lane report ends with a numbered device checklist AND a SEPARATE "not verified on a real device" list. The orchestrator merges open device checks into ONE list. Keep a "Not yet in production" list. At UPDATE PROCESS, move confirmed items to Done and put durable lessons into `process/context/`.

## Ship-criterion block

Write it BEFORE the final run: which rounds must be fully green, at what machine load, how many repeats, and the fallback ("ship X alone if only the newest features fail"). Per-round table: round, sha, start/end load, pass/fail by spec, each failure classified product / test / env with `file:line`.
