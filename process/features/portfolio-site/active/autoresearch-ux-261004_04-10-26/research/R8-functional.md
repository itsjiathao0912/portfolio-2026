---
name: report:r8-functional
description: "Iteration 8 functional skeptic: clean export of bf552ba, all gates, first-load JS vs a586de3, self-hosting, PII, reduced motion. 0 FAIL, 3 CONCERN, 4 OBSERVATION."
date: 04-10-26
metadata:
  node_type: memory
  type: report
  feature: portfolio-site
  phase: autoresearch-ux-iteration-8
---

# R8 functional QA (iteration 8)

**TL;DR:** At clean `bf552ba` typecheck (app and tests), lint, 432 unit and build:cf are green. Full e2e is 211 pass / 2 fail under load 23 to 38; on rerun card-transition passes 3 of 3 and the guide edge-drop spec passes 2 of 3 (flaky). First-load JS for `/` grew only 5.6 KB raw (1.8 KB gzip) vs a586de3. No animated emoji assets exist at this sha, so there is nothing to self-host or license.

Sha tested: `bf552ba791e629bf33f25b3c2de6aac01dce334a` (HEAD when I started; lanes have since added `6bbe1de` and later, not covered).
Tree: `git worktree add /tmp/pf-r8 bf552ba`, `pnpm install --frozen-lockfile`. Baseline for JS size: second worktree at `a586de3` (R7 sha), own install and `next build`. Both removed. Every heavy command ran under `/tmp/pf-heavy.lock`, detached and polled.

## Gates
| Command | Result (from log body) |
|---|---|
| `pnpm typecheck:app` | PASS, tsc silent, EXIT=0 |
| `pnpm typecheck:tests` | PASS, tsc silent, EXIT=0 |
| `pnpm lint` | PASS, eslint silent, EXIT=0 |
| `pnpm test` (bun) | PASS "432 pass, 0 fail", 49 files (R7: 425) |
| `pnpm build:cf` | PASS, "OpenNext build complete", EXIT=0 |
| `test:e2e:isolated --workers=2` (full) | **"2 failed, 211 passed (11.1m)"**, load 23 to 38. Failed: `card-transition.spec.ts:9` (1866 ms vs < 1500) and `visitor-guide.spec.ts:276` (surface key is "floor") |
| rerun, workers=1, repeat-each=3, those two | card-transition **3/3 pass** (1.7 to 3.7 s test time). guide edge-drop **2/3 pass**, 1 fail (same "floor" assertion) |

fx6-feedback (R7 FAIL) now passes in the full run: closed.

## First-load JS (from `.next/diagnostics/route-bundle-stats.json`, uncompressed)
| Route | a586de3 (R7) | bf552ba | Delta |
|---|---|---|---|
| `/` | 1,024,569 | 1,030,147 | +5,578 (+0.5%) |
| `/about` | 886,845 | 891,055 | +4,210 |
| `/work` | 868,453 | 872,663 | +4,210 |
| `/work/[slug]` | 1,022,077 | 1,026,732 | +4,655 |
| `/` gzip (sum of first-load chunks) | 322,855 | 324,675 | +1,820 |

Growth is far under the 30 KB flag. `git diff a586de3 HEAD --numstat -- public` is empty: no new static assets. The clay avatar code (`src/components/clay/*`, 38 KB of source) is inlined JS and is what the delta reflects. `/` is still 1.03 MB raw, the heaviest route (three.js and globe stay in the shared set; not new).

## Findings

### CONCERN
**R8-F1 | CONCERN | guide edge-drop spec is flaky, and it points at a real state: the guide can rest on the floor after a big scroll jump | `tests/e2e/visitor-guide.spec.ts:276-284`, `guide/guide.tsx`**
- Repro: `pnpm test:e2e:isolated -- --workers=1 --repeat-each=3 tests/e2e/visitor-guide.spec.ts -g "walking off the edge"`. Fails 1 in 3 (and 1 of 1 in the full run): after `scrollTo(0, 2400)` and `landed()`, `data-guide-surface-key` is `"floor"`, not a card line.
- `landed()` only waits for mode "ground" held 700 ms, which is also true on the floor. So either the guide re-seeks a surface too slowly after a large programmatic scroll, or the spec asserts too early. Under load the guide stayed on the floor with a block in view. Worth deciding which; for a visitor the effect is the character sitting at the bottom of the viewport while content is in view.
- Fix options: wait for `data-guide-surface-key !== "floor"` in the spec (poll), and check in `guide.tsx` that a scroll jump of more than a viewport re-evaluates the surface.

**R8-F2 | CONCERN | card-transition timing budget is load-sensitive | `tests/e2e/card-transition.spec.ts:29`**
- Full run at load 23 to 38: 1866 ms vs 1500. Isolated at load about 35: 3/3 pass. R7 carried this as "not reproduced". It is the same budget-vs-load shape as fx6 was. Suggest `retries: 1` for this spec or a 2.5 s budget; the spec's real point (no aborted transition after 4 s) is checked separately.

**R8-F3 | CONCERN | glossary hit height not re-measured | `src/components/site/case-study/reading/glossary-term.tsx:110`**
- Commit 3d20d58 claims a 44 px hit. Source now has `-my-2 py-2` (8 px each side), which gives about line height + 16, probably under 44 on a 14 to 16 px line. R7 measured 30 px at 412 wide. Not measured in a browser this round (time and load). Treat as open until a 412 px measure.

### OBSERVATION
- **R8-O1 (emoji assets, licence):** there are no animated emoji assets at `bf552ba`. `EmojiBurst` (`src/components/motion/emoji-burst.tsx`) sprays Unicode glyphs rendered by the system font. `public/` holds only `linkedin logos photos portrait projects work _headers`, unchanged since a586de3. No third-party request is possible from it, and no licence file is needed. If an animated emoji set (Noto, Fluent) is planned for a later iteration, self-host it and add a `LICENSES` note then. Clay avatars are inline SVG in code, also no requests (`grep https?://` in `src/components/clay` and `src/components/motion` is empty).
- **R8-O2 (no PII, by source and spec):** `git diff a586de3 HEAD -- src/app/api src/lib/visitor-handlers.ts src/lib/visitor-hash.ts src/lib/poll.ts src/lib/visits.ts` is empty, so R7's live DB dump finding (hash HMAC, role, country, counters; no IP, no user agent) still holds. `grep` for `x-forwarded-for|cf-connecting-ip|x-real-ip|user-agent|request.ip` in `src` is empty. Poll returns `{counts, total, mine}`; stats returns `{total, byRole, topCountries, countryTotals}`; visit returns `{ordinal, counted}`. All aggregates. `visitor-api.spec.ts` passed in the full run.
- **R8-O3 (reduced motion):** `useReducedMotion` guards are present in guide (no physics and no rAF; fade-teleport between blocks, `guide.tsx:17,375,405`), role tile (blink, wave, springs), picker modal, rolling number (jumps, no tween), stats strip, poll (`visitor-poll.tsx:40,42,71`) and `EmojiBurst` (returns early, "nothing"). Browser-driven under `reducedMotion: "reduce"`: guide (`visitor-guide.spec.ts:362`) and picker (`visitor-picker.spec.ts:274`) are covered and passed. **Poll and emoji burst under reduce are verified by source only**, no spec drives them. One small leak: the poll chip uses `transition-colors duration-[120ms]` with no `motion-reduce:` variant (colour only, harmless).
- **R8-O4 (carried items):** poll with no role: closed (`use-poll.ts:35,93` never sends a vote without a role; the e2e "no role yet" spec passes). Shift+arrow walking the guide: closed (`shouldHandleGuideKey` returns false on shiftKey, `guide-logic.ts:233`). Depth-pill arrow keys: an `onKeyDown` handler now exists (`depth-pill.tsx:44`), not driven in a browser this round. fx6 spec: closed. Runner dirty-tree guard: present (script prints a warning for a dirty tree and supports `--from-head`).

## Not covered
Browser measures of the glossary hit, burger-over-heading, picker phone layout, and real-device Safari were not run this round. Manual QA on a live `next start` was skipped; the isolated e2e lane (213 specs) was the only browser evidence.

**Status:** DONE_WITH_CONCERNS
**Summary:** `bf552ba` is green on typecheck, lint, 432 unit and build:cf; e2e is 211/213 with one load-sensitive timing spec and one flaky guide spec (guide can rest on the floor after a large scroll jump); JS growth is +5.6 KB on `/`, no new assets, no PII.
