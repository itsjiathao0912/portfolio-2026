---
name: report:r6-functional
description: "Iteration 6, lane B (functional skeptic) of the ux autoresearch loop: all gates green at HEAD 16c1af5, R5 gap recheck, real-user QA of home, /about, /work and 9 cases at 1440 and 390 (picker, clay guide, stats, poll, morph, reading aids, footer), 0 FAIL."
date: 04-10-26
metadata:
  node_type: memory
  type: report
  feature: portfolio-site
  phase: autoresearch-ux-iteration-6
---

# R6 functional QA (iteration 6, lane B)

**TL;DR:** HEAD **16c1af5** is functionally clean. All five gates are green (typecheck, lint, 417 unit, **201/201 e2e**, build:cf). Across 12 pages x 2 viewports there are 0 console errors, 0 page errors, 0 failed requests, 0 third-party requests, no horizontal scroll, at most 1 canvas. The R5 fixes hold: card-to-case now takes 180 to 340 ms (was 4.1 s), legacy visitors can vote, ask-me follows a same-tab role, depth pill is 44 px, timeline stops are 44 px, GoCrypto steps are operable. What is left is small: sub-44 px targets on the new guide controls and glossary terms, one overlapping tile label on phones, a stale "visitors so far" number right after picking, and a test-process hazard (the isolated e2e runner builds the dirty working tree, not HEAD). **Totals: 0 FAIL, 4 CONCERN, 7 OBSERVATION.**

## Tree tested and conditions
- HEAD `16c1af5`. Gates and manual QA ran while the tree was clean (only `tsconfig.json` reformatted by `next build`, present before I started). My manual QA used my own `next build` of that clean tree (private dist `.next-qa6`, port 3366, private seeded DB, geo seam `VN|Hanoi`), so the fix lanes that started editing mid-run did not affect it. The server and dist are removed.
- Chromium via Playwright: 1440x900 and Pixel 7 390x844 (touch, DPR 2.6). Founder role seeded for page sweeps, fresh visitor for picker and poll flows.
- Load: gates ran at load 6 to 25. My first full e2e (default 5 workers) ran into load 40 to 57 from other lanes and was killed by my own shell timeout; I re-ran with `--workers=2` as asked. Results from that first run are not counted (see GAP-I6-F9).
- Harness: scratchpad `r6/*.mjs` (sweep, picker, stats, poll, guide, cases, extra, footer). Screenshots copied to `research/R6-functional-shots/`.

## Gates (HEAD 16c1af5)
| Gate | Result |
|---|---|
| `pnpm typecheck` (app + tests) | PASS |
| `pnpm lint` | PASS |
| `pnpm test` (bun unit) | PASS 417 / 0, 48 files |
| `pnpm test:e2e:isolated` full, `--workers=2` | **PASS 201 / 201**, 10.0 min, load 20 to 25 |
| `pnpm build:cf` | PASS, 49 s |

## Gap list
Format: GAP-I6-F{n} | severity | evidence | file | fix

### CONCERN

**GAP-I6-F1 | CONCERN | the new guide's touch controls are below 44 px, and hide is unreachable by touch | `src/components/site/visitor/guide/guide-controls.tsx` (`MINI` size-10, `GuideDot` size-7, `GuideClose` size-6)**
- Evidence at 390: `guide-dot` 28x28; touch pad buttons "Walk left", "Walk right", "Jump" 40x40 each; hide "x" 24x24 and only visible on hover or focus, so on a phone the guide can only be hidden through the chip then modal "Hide the guide". Tapping the character hops it, so the x never appears for a finger.
- Fix: dot and pad buttons to `size-11` (or a 44 px hit box with `::before` inset), keep the visible dot small. Show the x on touch after the two-tap pad opens, or add a "Hide" button to the pad.

**GAP-I6-F2 | CONCERN | carried tap-target debt: glossary terms and the ledgr checkbox | glossary term button, `src/components/case/ledgr/contract-check.tsx`**
- Evidence at 390: glossary term buttons are 19 to 32 px tall on 8 of 9 cases (reorc 28x19, cortex 73x22, guardline 84x26, lumicap 62x30, cosap 47x30, gocrypto 83x30, pac 116x32, ledgr 129x30). Ledgr checkbox 24x24. R5 F8's timeline and stacked-bar parts are fixed (all 44 px now).
- Fix: `::before` inset hit area on the term button (inline text), 44 px label wrapper on the checkbox.

**GAP-I6-F3 | CONCERN | phone picker: the two-line "Product designer" label overlaps the avatar's body | `src/components/site/visitor/role-tile.tsx` (`pt-[76px]`, `min-h-[150px]`)**
- Evidence: 390 and 360 px, fresh visitor, tile `tile-designer`: the first line "Product" sits over the bottom of the purple torso (`research/R6-functional-shots/tile-designer-390.png`, `picker-mobile-3-picked.png`). Every other label is one line. Desktop is fine.
- Fix: more top padding or a shorter label ("Designer" / "Product design") or let the tile grow with the label height. Note: `role-tile.tsx` is being edited by a fix lane right now, re-check after it lands.

**GAP-I6-F4 | CONCERN | the live total lags the visitor's own number for up to ~15 s | `src/components/site/visitor/stats/*` (`stats-strip.tsx`, `use-live-stats.ts`)**
- Evidence (desktop and mobile, right after the first pick): strip reads "4 visitors so far" next to "#5 your visitor number" and "3 founders like you" while the rank line says "#5". The count catches up on the next poll (~15 s). Seen in 2 separate runs (`out/stats.json`).
- Fix: show `max(total, ordinal)` and bump the role and country counts locally when the visit response arrives.

### OBSERVATION

- **GAP-I6-F5**: poll with no role chosen still calls `/api/poll` and gets a 403 (one console error "Failed to load resource 403") before the "Pick who you are first" note shows. 14 rapid taps send ~11 extra requests that return 429 (11 console errors). The UI is right (one option marked, "Easy there"); the client could skip the request when no role is confirmed and while cooling down. `stats/use-poll.ts`.
- **GAP-I6-F6** (R5 F9, still open): depth pill is `role=radiogroup`/`radio` but ArrowRight does not move focus or selection (focus stayed on Skim). Add roving arrow keys or use `role=group` with `aria-pressed`. `depth-pill.tsx`.
- **GAP-I6-F7**: Shift+ArrowLeft/Right walks the guide (Alt, Meta and Ctrl are correctly ignored). Shift+arrow is the text-selection key; ignore it too. `guide-logic.ts` `shouldHandleGuideKey`.
- **GAP-I6-F8**: guide overlaps are much better than R5 F6 (the big "Walk with me" and "Hide character" pills are gone; desktop had 0 overlaps over interactive elements at 28 scroll stops). Remaining on a phone: the guide dot covers 11 percent of a "Credential" link (1 hit point blocked), and after picking a role the character rests on the "Fellow PM" tile label (decorative, user can walk it away). The invisible guide wrapper rect overlaps `stack-cta` 33 percent, `disclosures-link` 31 percent and `tile-student` 20 percent but it is `pointer-events: none`, so taps pass through (verified with `elementFromPoint`).
- **GAP-I6-F9 (process)**: `scripts/run-isolated-e2e.mjs` builds the live working tree, not HEAD. At 09:25 with fix lanes editing, the run built their half-done files and failed card-transition and "touch: small character" (2 failed / 3 passed). Both pass against a clean HEAD export (card 2.1 s, guide touch 5.3 s). The earlier 5-worker run at load 40+ also failed 5 timing specs (card 1.5 s budget, about page, 3 guide physics) that all pass at 2 workers. Treat any e2e result taken during fix lanes or above load ~8 as provisional; run the EVL gate from `git archive HEAD` or a worktree.
- **GAP-I6-F10**: GoCrypto stacked "bar-row" items are `tabindex=0` but do nothing on Enter or tap (310x40 at 390). A focus stop that does nothing; either make them the toggles or drop the tabindex.
- **GAP-I6-F11**: the modal Tab cycle includes one empty stop on `<body>` each loop (guide toggle, body, Close, role radio). Focus never reaches the page behind it, Esc closes and focus returns to the chip. Standard native-dialog behavior, noted only.

## R5 recheck
| R5 gap | Now | Evidence |
|---|---|---|
| F1 card to case freezes 4 s | **Fixed** | work card, home stack and "Next project" card, 2 viewports, motion and reduced: case hero visible in 178 to 340 ms, scrollY 0 on arrival, 0 page errors |
| F2 e2e red from 2 stale specs | **Fixed** | 201 / 201 |
| F3 load flakes in case/site specs | **Not reproduced at low load** (still load-sensitive) | all pass at 2 workers; see F9 |
| F4 returning legacy visitor cannot vote | **Fixed** | seeded only `thao:participate:persona="founder"`: 1 `POST /api/visit` sent on load, vote marks "fraud-toolkit", no 403 |
| F5 ask-me chips ignore same-tab role | **Fixed** | pick Founder via tile: `data-role=founder`, founder chips; change to Engineer in the modal: engineer chips, no reload |
| F6 guide covers content at 390 | **Mostly fixed** | big pills gone; see I6-F1 and I6-F8 for what remains |
| F7 depth pill 36 px at 390 | **Fixed** | 114x44 x3 on all 9 cases at 390; 104/112/152 x 44 at 1440 |
| F8 timeline stops, stacked-bar segments | **Fixed** (glossary, checkbox open) | timeline stops 44x44 on lumicap and guardline, min gap 57 px at 390; segments not focusable (0 of 8 and 0 of 4), legend toggles 44 px; see I6-F2 |
| F9 depth radiogroup arrows | **Open** | I6-F6 |
| F10 GoCrypto desktop has no control | **Fixed** | 5 `walkthrough-step` buttons: click moves the step (scrollY 6920 to 8000 in 270 px steps), ArrowDown moves focus and `aria-current`; mobile dots 44x44 |
| F11 ticker item 7 px off edge | Not re-tested | not in first 25 Tab stops |
| F12, F13 | Unchanged | wording notes |

## What passed (no gap)
- 12 pages x 2 viewports: 1 h1 and 1 main, no console or page error, no 4xx or 5xx, no failed or third-party request, no horizontal scroll at 6 to 29 scroll steps each, canvas at most 1 (home).
- Picker (both viewports): "Hey Hanoi" greeting, 12 tiles (min 106 px), privacy line, pick grows into the big "That's you" slot, cards reorder per role (Founder: Ledgr first; Engineer: ReOrc first), chip "You: Engineer - change", modal opens, Tab stays inside, Esc closes and focus returns to the chip, role and order persist after reload with no panel, switch sends a second visit. Live tile counts stay hidden below 3 and show at 3; flags in the top-countries strip.
- Stats: polls every 14 to 16 s only while the strip is on screen (0 requests in 20 s scrolled away), a visitor added elsewhere appears within one poll, rank line "You're visitor #N, the first Founder, the first from Vietnam".
- Poll: 6 options at 44 px, vote marks one, change moves the mark, persists across reload, rapid spam leaves exactly one checked with "Easy there".
- Guide: arrows walk, ArrowUp jumps, falls and lands, keys ignored in textarea, select, contenteditable and on a focused radio (arrows move focus, guide stays put), Alt/Meta/Ctrl combos ignored, key held then window blur stops within 13 px of coast, resize 1440 to 390 keeps it in the viewport with no horizontal scroll, hidden behind the modal, hide x (24 px, appears on hover) hides and persists across reload, modal "Show the guide" brings it back, reduced motion steps between spots with 0 physics frames, mobile tap hops, dot opens the line, two taps open the pad, a swipe that starts on the character scrolls the page (297 px), `touch-action` stays auto.
- Robustness: corrupt `thao:visitor:v1` (garbage, bad role, 5 KB id, array, bad legacy persona) never crashes, picker renders; `localStorage` throwing still lets a pick work; back and forward restore scroll exactly on `/work` and `/` in motion and reduced motion.
- API: missing or foreign Origin 403, bad role 400, short id 400, bad JSON 400, 2 KB body 413, text/plain 400, GET /api/visit 405, bad stats role 400, poll without a visit 403, bad option 400.
- Footer and chrome: copy-email says "Copied", clipboard holds the address, reverts after 3 s; three ask-me chips are 44 px mailto links; disclosures sheet fits, Esc closes, focus returns to the link; Saigon desk popover opens from the nav.
- Reading aids on 9 cases x 2 viewports: depth Skim/Read/Deep changes page height (e.g. lumicap 5177, 12476 and 11652 px), persists after reload, desktop margin TOC depth control (3 x 64x44) stays in sync with the pill, mobile section menu button 44 px.

## Totals
| Severity | Count |
|---|---|
| FAIL | 0 |
| CONCERN | 4 (I6-F1 to F4) |
| OBSERVATION | 7 (I6-F5 to F11) |

R5 recheck: 13 gaps: 8 fixed, 1 mostly fixed, 1 open (F9), 1 not re-tested, 1 load-flake not reproduced, 1 unchanged wording.

## What breaks in the first 5 minutes
Nothing breaks. In order of what a visitor notices:
1. On a phone, the "Product designer" tile label sits on the avatar's body in the first screen of the picker (F3).
2. Pick a role: "4 visitors so far" next to "#5 your visitor number" for up to 15 s (F4).
3. On a phone, the guide's dot and pad are small to hit and the character cannot be hidden by tapping (F1).
4. On a phone, glossary terms in the case studies are 19 to 32 px tall to tap (F2).
5. Tap a poll option before choosing a role: works politely, but the console logs a 403 (F5).

## Unresolved questions
- Should the fix lanes' edits (role tile, guide, poll, stats, nav, lift-card, project stack) be re-verified at their commit? F1, F3, F4, F5, F7 and F8 sit in files that are modified in the working tree right now, so they may already be moot.
- Real-device check still missing: headed Chrome and iOS Safari (view transitions, `touch-action` on the guide, clipboard).
- Nav pill ghosting (R4 F4) needs a visual lane, not covered here.

**Status:** DONE_WITH_CONCERNS
**Summary:** At HEAD 16c1af5 all gates are green (typecheck, lint, 417 unit, 201/201 e2e at 2 workers, build:cf) and the manual 1440 and 390 QA of every page, the picker, guide, stats, poll, morph and reading aids found 0 FAIL, 4 CONCERN and 7 OBSERVATION. R5's freeze, legacy-vote, ask-me, depth pill, timeline and GoCrypto gaps are fixed.
**Concerns/Blockers:** Sub-44 px guide controls and glossary terms, a phone tile label overlap, a stale visitor total after picking, and the isolated e2e runner building the dirty working tree instead of HEAD (results during fix lanes are not HEAD). The fix lanes are editing the guide, picker, poll and stats files now, so I6-F1, F3, F4, F5, F7 and F8 may need a re-check on their commits.
