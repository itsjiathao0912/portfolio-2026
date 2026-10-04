---
name: report:r7-functional
description: "Iteration 7 functional skeptic: clean HEAD a586de3 export, all gates, carried items, visitor API probes. 1 FAIL (fx6-feedback spec), 4 CONCERN, 4 OBSERVATION."
date: 04-10-26
metadata:
  node_type: memory
  type: report
  feature: portfolio-site
  phase: autoresearch-ux-iteration-7
---

# R7 functional QA (iteration 7)

**TL;DR:** At clean HEAD `a586de3` typecheck (app and tests), lint, 425 unit and build:cf are green. Full e2e is 205 pass / 1 fail: the new `fx6-feedback` card-to-case spec fails (3 of 3 reruns). The visitor API is correct and stores no IP. The carried typecheck:tests error is gone.

Tree: `git worktree add /tmp/pf-r7 HEAD` (clean, lockfile install), removed after. Manual QA on its own `next start` (port 3377, private DB, geo seam). Other lanes held load 10 to 24; heavy commands used the `/tmp/pf-heavy.lock`.

## Gates
| Command | Result (from log body) |
|---|---|
| `pnpm typecheck:app` | PASS, tsc printed nothing, exit 0 |
| `pnpm typecheck:tests` | PASS, exit 0. visitor-modal.tsx(73) and visitor-store.test.ts(12) errors NOT reproduced at HEAD |
| `pnpm lint` | PASS, eslint nothing, exit 0 |
| `pnpm test` (bun) | PASS "425 pass, 0 fail", 48 files |
| `test:e2e:isolated --workers=2` (full) | **FAIL: "1 failed, 205 passed (10.3m)"**, load 15 to 24. Failed: `fx6-feedback.spec.ts:8` project card feedback |
| e2e rerun, workers=1, repeat-each=3, fx6 + card-transition | card-transition 6/6 pass (1.3 to 1.9 s). fx6 **0/3**: 778 ms and 619 ms (budget 600), one TimeoutError (see F1). load about 10 |
| `pnpm build:cf` | PASS, "OpenNext build complete", exit 0 (only the workerd compatibility_date WARN) |

## Findings

### FAIL
**R7-F1 | FAIL | the new fx6-feedback spec is red at HEAD, in the full gate and on reruns | `tests/e2e/fx6-feedback.spec.ts:8-30`**
- Repro: `pnpm test:e2e:isolated -- --workers=1 --repeat-each=3 tests/e2e/fx6-feedback.spec.ts`. Two outcomes: (a) timing, "card to case took 778 ms" and "619 ms" vs `< 600`; (b) `page.waitForResponse ... Timeout 20000ms` at line 20.
- (b) is a test race: the card is in view so Next prefetches its `_rsc` as soon as the page loads, usually before the listener on line 20 is registered. Hover then triggers nothing. Fix: register the waiter before `goto`, or accept an already-seen prefetch.
- (a) is load-sensitive (load 10), the prior 444 ms was a quieter run. Either raise the budget to about 1000 ms or measure at the click-to-pending state (the spec's own point) instead of full arrival.
- Note: iteration 6 reported 201/201. The count is now 206, so this spec was added with a586de3 and was never green in a full run.

### CONCERN
**R7-F2 | CONCERN | carried: glossary term still under 44 px | `src/components/site/case-study/reading/glossary-term.tsx:110`**
- /work/ledgr at 412 wide: term button 129x30. Class has `p-0`, no inset hit area. Ledgr checkbox: its label is `min-h-11` (44), the bare input is 24 but the label is the target, so treat the checkbox as closed.

**R7-F3 | CONCERN | carried: depth radiogroup has no arrow keys | `src/components/site/case-study/reading/depth-pill.tsx`**
- Focus Read, press ArrowRight: focus and `aria-checked` unchanged. Tab then moves Read, Deep, glossary: every radio is a tab stop. Fix: roving tabindex plus Arrow/Home/End, or `role=group` with `aria-pressed`.

**R7-F4 | CONCERN | carried: burger button sits over page content on scroll-up on phones | `menu-toggle` (nav)**
- 412x915 Pixel 7, scroll to the end then up in 450 px steps: toggle visible and its box overlaps a heading box at 3 of 37 stops on `/` (y=300, 1200, 4800), 2 on ledgr, 3 on gocrypto, 1 on /work. 0 hits on /about. These are box overlaps, and a glass button over body text is inherent (screenshot: it covers "payroll" in a paragraph). Whether it hides heading text was not isolated. Heading text overlap is rarer than the box count suggests.
- Also seen: the bottom "The problem" section pill covers a line of text.

**R7-F5 | CONCERN | process: isolated runner builds whatever tree it runs in, no dirty-tree guard | `scripts/run-isolated-e2e.mjs`**
- It uses `process.cwd()`; no `git status` check. In the main tree `tsconfig.json` is modified right now (stale `.next-e2e-1791076890619-84151` includes). Running from a worktree of HEAD (as here) gives HEAD results. Suggest: print `git rev-parse --short HEAD` plus "DIRTY" to the log head, or fail with `--require-clean`.

### OBSERVATION
- **R7-O1 (visitor API, all as designed):** no Origin 403, foreign Origin 403, bad role/short id/extra key 400, 600 B body 413, GET /api/visit 405, stats bad role 400, poll for an unseen visitor 403 "visit first", bad option 400. Second change inside 2 s gives 429 with `retry-after: 2` and `cache-control: no-store`. A repeat after 2.2 s is 200. 12 alternating role flips at 2.05 s all 200 (the 30-change cap is only covered by unit tests, not live). `/api/geo`: plain request `{country:null,city:null}`; the seam only works with PORTFOLIO_E2E and a local DB; `ZZ` is denied, city "x" passes through.
- **R7-O2 (no stored IP, confirmed):** DB dump after the run holds `VisitorSeen(hash HMAC, role, country, changeCount, days, lastWriteAt)`, `PollVote(hash, option, day)`, `VisitTally`. No IP or user agent column. `visitor-handlers.ts` never reads them and the server log has only the startup banner. Limit is per visitor hash only, so fresh ids mint unlimited visitors (5 fresh ids in a row all 200). That inflates the public total and is the cost of keeping no IP. Say so in disclosures.
- **R7-O3:** 7 prefetch `_rsc` requests per page show as `net::ERR_ABORTED` while idle on desktop (`/about`, `/work`; all also returned 200). No console error. Cosmetic noise from Next aborting streamed prefetches.
- **R7-O4 (sweep):** `/`, `/about`, `/work`, `/work/ledgr`, `/work/gocrypto` at 1440 and 412: 0 console errors, 0 page errors, 0 third-party requests, no sideways scroll, one h1. Home height now 15,945 px desktop (was 16,131, under the 16,000 target); phone 17,245.

## Carried items status
| Item | Status |
|---|---|
| typecheck:tests visitor-modal(73), visitor-store.test(12) | **Closed**, passes at HEAD |
| card-transition cold click 1.55 s vs 1.5 s | **Not reproduced** (6/6 at 1.0 to 1.9 s total incl. setup; spec green in full run). Superseded by R7-F1 for the new spec |
| burger over headings on scroll-up | Open, R7-F4 |
| F2 tap targets | Glossary open (R7-F2), checkbox effectively closed |
| F9 runner builds dirty tree | Open, R7-F5 |
| R5-F9 radiogroup arrows | Open, R7-F3 |
| Visitor API, rate limit, no IP | Verified, R7-O1 and O2 |
| R6 F4 stale total after pick | Source shows `Math.max(data.total, ordinal)`, fixed (not browser-run) |
| R6 F5 poll 403 with no role, F7 Shift+arrow walks guide | Still open by source (`use-poll.ts` always fetches; `guide-logic.ts` has no shiftKey check) |
| R6 F3 phone tile label overlap | Tile CSS changed (`justify-end`, `pt-[76px]`); not re-measured in a browser this round |

## Not covered
Picker phone layout, guide tap sizes and stats lag were not driven in a browser this round (time and load). Real-device Safari still untested.

**Status:** DONE_WITH_CONCERNS
**Summary:** Clean HEAD a586de3 passes typecheck, lint, 425 unit and build:cf; e2e is 205/206 with the new fx6-feedback spec failing 3 of 3 (a prefetch race plus a 600 ms budget that fails at 619 to 778 ms); the visitor API behaves and stores no IP.
