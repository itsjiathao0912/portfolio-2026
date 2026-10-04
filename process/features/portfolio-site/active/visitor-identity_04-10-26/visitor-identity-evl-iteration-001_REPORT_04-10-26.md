---
name: report:visitor-identity-evl-iteration-001
description: "EVL confirmation run for visitor-identity: validate-contract gates re-run independently at clean HEAD b126819. Verdict DONE_WITH_CONCERNS: all visitor-specific gates green; full e2e red from 2 stale specs plus 3 load flakes, none in visitor code."
date: 04-10-26
metadata:
  node_type: memory
  type: report
  feature: portfolio-site
  phase: visitor-identity-evl-1
---

# visitor-identity EVL iteration 001

**TL;DR:** Every visitor-identity gate is green at clean HEAD `b126819`: typecheck, lint, 437 unit tests, 37 of 37 visitor e2e tests, `git diff --check`, and the privacy, originality and dicebear greps all print nothing. The full isolated e2e gate is **red (189 pass, 5 fail)**. At low load on a clean export, 3 of the 5 pass and 2 fail deterministically. Both are stale specs from the case-study commits (`9fb9e26`, `b700bcd`), not visitor code. Verdict: `DONE_WITH_CONCERNS`.

## Tree and conditions

- HEAD `b126819`. At the start, `git status --short` showed only untracked `process/**` files, so the tracked tree was clean. Gates 1 to 5 ran in the working tree at that moment.
- **During the run another lane began editing visitor UI** (uncommitted changes to `guide*.tsx`, `role-tile.tsx`, `stats/*`, `src/app/page.tsx`, and three new files). Anything run after that point used a clean `git archive HEAD` export (with a copy-on-write `node_modules` clone) instead: the re-run in section "Attribution", `build:cf`, and the QA server.
- Load (10 cores, other agents active): typecheck 5.7, visitor e2e 8.5 rising to 39, full e2e 35 at start (peaks above 60 from other agents), build:cf 39, re-run 6.7.
- Heavy commands ran under `/tmp/pf-heavy.lock`.
- **Evidence loss (conflict to surface):** another lane's Playwright run wiped `test-results/` (default `outputDir`), which deleted `test-results/r5/**` including my gate logs and screenshots. Results below are from the original console output. A summary and the harness were re-created at `test-results/r5/`. Anyone running Playwright in this tree should pass `--output=` outside `test-results/`.

## Gate table (validate-contract commands, exact)

| # | Command | Result | Evidence |
|---|---|---|---|
| 1 | `pnpm typecheck` | PASS | app + tests clean, 26.6 s |
| 2 | `pnpm lint` | PASS | 0 problems, 27.6 s |
| 3 | `pnpm test` | PASS | 437 pass, 0 fail, 6279 expects, 47 files |
| 4 | `pnpm test:e2e:isolated -- visitor-picker visitor-api visitor-stats visitor-guide` | PASS | 37 passed (1.9 min) |
| 5 | `pnpm test:e2e:isolated` (full) | **FAIL** | 189 passed, 5 failed (9.8 min), see below |
| 6 | `git diff --check` | PASS | exit 0 |
| 7 | `grep -rniE "dicebear\|notionists" src tests package.json` | PASS | prints nothing |
| 8 | privacy grep over `geo, visits, poll, visitor-hash, api-guard, visitor-handlers` and the 4 api routes | PASS | prints nothing (all files exist) |
| 9 | `grep -rniE "flowser\|mascot-walkable\|interactive-mascot" src tests` | PASS | prints nothing |
| extra | `pnpm build:cf` (clean export of HEAD) | PASS | 57 s, one wrangler compatibility-date warning only |

Not run (not in the automated gate list): the manual-run mutation checks, and the Agent-Probe contact sheet and guide scroll frames (a contact sheet from an earlier pass exists in the task folder). They remain open.

## Gate 5 failures and attribution

Full run failures, then a re-run of the same specs on a clean export of `b126819` at load 6.7 (18 pass, 2 fail):

| Test | Full run | Clean, low load | Real code path |
|---|---|---|---|
| `case-studies.spec.ts:116` cosap and reorc "TOC labels stay inside their box" | fail | pass (a different case, lumicap, failed once in a dirty-tree re-run) | Spec measures label edges after a fixed settle while TOC items are still sliding in. Load-dependent flake, already known as R4 GAP-I4-F2 and still open. Not visitor code. |
| `site.spec.ts:224` "liquid fill follows hover and keyboard focus" | fail | pass | Load flake (hover state changes after a fixed wait). Not visitor code. |
| `case-studies.spec.ts:57` gocrypto "interactive pieces respond" | fail | **fail** | Deterministic stale spec. Block 3 (`PhoneWalkthrough`, `src/components/case/gocrypto/phone-walkthrough.tsx`, commit `9fb9e26`) has controls only in the `md:hidden` carousel. At desktop the spec finds buttons but none are visible, so nothing responds. The pinned desktop scene is scroll-driven. |
| `site.spec.ts:176` "case-study hero is centred" | fail (120 s timeout) | **fail** | Deterministic stale spec. `/work/cosap` bento images belong to the Deep depth (`b700bcd`). At the default Read depth the section is collapsed behind "2 more sections in Deep dive": the run has `data-visible=false`, `inert`, `aria-hidden`, height 0. Playwright cannot click it. Verified: 0 focus stops land inside hidden depth runs, so there is no accessibility fault. |

Conclusion: no failing test touches `src/components/site/visitor/**`, `src/lib/{geo,visits,poll,visitor-*}.ts`, the visitor routes or the clay avatars. The two deterministic failures predate visitor-identity and belong to case-study work.

## Real-user findings that the gates did NOT catch (visitor-identity code, see R5-functional.md)

- **GAP-I5-F4 CONCERN:** a returning visitor whose role was migrated from the legacy `thao:participate:persona` key (or whose first `POST /api/visit` failed) never gets counted. The store sets `lastSent = role` at hydrate, so no POST is sent. Their poll vote then gets 403 "visit first" and the UI says "Pick who you are at the top of the page first, then vote" even though a role is chosen. Reproduced: 0 POSTs, vote not marked, one console 403.
- **GAP-I5-F5 CONCERN:** footer ask-me chips ignore a role picked in the same tab (`data-role` stays `none` until reload) because the component listens to the `storage` event, which does not fire in the tab that wrote it.
- **GAP-I5-F6 CONCERN:** guide chrome covers page content at 390 px.

AC mapping: AC1, AC3, AC5 (server), AC6, AC7, AC8, AC9, AC10 have passing automated proof. AC5 and AC6 have the F4 gap in the legacy-visitor path. AC11 (no regressions) is red only because of the two stale specs above.

## Known gaps unchanged

KG1 real `request.cf.city` and D1 limits, KG7 rate-limit rule, KG8 `Intl.DisplayNames` on workerd: not testable here, as recorded in the contract.

## Unresolved questions

- Should the EVL gate list exclude or fix the gocrypto and cosap specs? They block the contract's full-suite gate for reasons unrelated to this feature.
- The other lane's uncommitted guide, stats and role-tile edits will need their own EVL run. Results above apply to `b126819` only.

```yaml
EVL HANDOFF SUMMARY:
gates_green: [typecheck, lint, bun unit 437/0, visitor e2e 37/37, git diff --check, privacy grep, originality grep, dicebear grep, build:cf]
known_gaps: [full isolated e2e red (2 stale specs gocrypto PhoneWalkthrough and cosap bento depth, plus 3 load flakes), mutation checks not run, contact-sheet probe not re-run, KG1, KG7, KG8]
follow_up_stubs: [fix case-studies.spec.ts:57 and site.spec.ts:176 for walkthrough and depth, harden TOC-label and liquid-fill waits, legacy-visitor visit POST (GAP-I5-F4), ask-me same-tab role (GAP-I5-F5)]
context_partial: []
preliminary_packet_path: none
closeout_classification: WITH_GAPS
```

**Status:** DONE_WITH_CONCERNS
**Summary:** All visitor-specific gates pass at clean HEAD b126819; the full e2e gate is red from 2 deterministic stale case-study specs and 3 load flakes, none in visitor code.
**Concerns/Blockers:** Gate 5 red; 3 real-user visitor gaps found outside the automated gates; logs were wiped by another lane's Playwright run.
