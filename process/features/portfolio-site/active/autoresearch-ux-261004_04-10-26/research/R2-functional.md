---
name: report:r2-functional
description: "Iteration 2, lane B (functional QA) of the ux autoresearch loop: repo gates plus independent real-user QA of home, /about, /work and all 9 case studies at 1440 and 390, with a re-check of iteration 1's gaps."
date: 04-10-26
metadata:
  node_type: memory
  type: report
  feature: portfolio-site
  phase: autoresearch-ux-iteration-2
---

# R2 functional QA (iteration 2, lane B)

**TL;DR:** Typecheck, lint, 219 unit tests and `build:cf` pass. `pnpm test:e2e:isolated` is **red: 116 pass / 10 fail**, every failure is a spec that still asserts home pieces the redesign removed. Real-user QA found **7 FAIL, 8 CONCERN, 8 OBSERVATION**. The worst: the nav pill has **no blur in Chromium** (page text prints through the nav labels on every page), the say-hello coin **does not register slow touch drags**, the career rail **mouse drag overshoots wildly**, long case-study TOC labels **run into the body text**, stat numbers **split mid-number** ("+30 / %"), and home has **2 canvases** (spec: at most 1). No horizontal scroll anywhere, no empty screens, no duplicate tab stops, no keyboard trap, no console errors in default mode.

**Tree tested:** HEAD 470bf4d plus the uncommitted working tree (28 modified files; untracked `src/components/story/`, `src/lib/use-reduced-motion.ts`, `tests/e2e/story.spec.ts`). Production build (isolated), private seeded DB, Chromium only. I started and stopped my own server; `tsconfig.json` restored (clean), build dirs removed.

## Totals

| Severity | Count |
|---|---|
| FAIL | 7 (F1 to F7) |
| CONCERN | 8 (F8 to F15) |
| OBSERVATION | 8 (F16 to F23) |

## Repo gates

| Gate | Result | Load 1 / 5 / 15 min at start |
|---|---|---|
| `pnpm typecheck` (app + tests) | PASS | 4.8 / 6.4 / 7.3 |
| `pnpm lint` | PASS, 0 problems (no root `fx2*.tmp.cjs` present any more) | 8.0 / 7.0 / 7.5 |
| `pnpm test` (bun unit) | PASS, 219 pass / 0 fail, 31 files | 9.9 / 7.5 / 7.7 |
| `pnpm test:e2e:isolated` | **FAIL, 116 pass / 10 fail**, 7.6 min | 4.8 / 6.4 / 7.3 (my own build then took it to 30) |
| `pnpm build:cf` | PASS (one wrangler compat-date WARN only) | 11.4 / 20.6 / 16.6 |

Load context: I was the only heavy lane. Two pre-existing `next-server` dev processes (`.next-dev`, not mine, ~115% CPU each) ran the whole time; machine was otherwise quiet (load 4 to 10 during QA waves, peaks 16 to 30 only during my own builds). Logs: `test-results/r2/repo-*.log`.

**E2E failures, each attributed to the real code path** (all five spec files are stale against home commit 077e356, which removed these pieces; none is a product defect):

| Spec | Asserts | Why it fails |
|---|---|---|
| `tests/e2e/gems.spec.ts:66` mascot peeks near the bottom | `mascot-sentinel` | `src/components/gems/mascot.tsx` is no longer mounted anywhere (90 s timeout) |
| `tests/e2e/site.spec.ts:233`, `mobile.spec.ts:47`, `reduced-motion.spec.ts:8` | `dot-grid` + `data-mode` | `src/components/site/dot-grid.tsx` no longer imported by `src/app/page.tsx` |
| `tests/e2e/story.spec.ts:41` (desktop and mobile), `:71`, `:104` | `chapter-arrival`, `story-chapters`, `chapter-settle-up` | `src/components/story/persona-chapters.tsx` no longer mounted on home |
| `tests/e2e/story.spec.ts:60` | `money-globe` | testid gone; home globe is now `globe-card` (3 min timeout) |
| `tests/e2e/story.spec.ts:85` | "Payment settled. Now pick a channel:" | old send-a-coin; replaced by `SayHello` (`hello-coin`) |

`story.spec.ts` is untracked (left by the stopped integrator). The new home pieces have **zero** E2E or unit references: `hello-coin`, `proof-ticker`, `persona-control`, `card-stamp`, `globe-row`, `rail-card`, `toc-chips` (see F16).

Note: Playwright wipes `test-results/` at the start of the repo E2E; it deleted R1's `test-results/r1/` (63 MB of shots). I copied it first and put it back at `test-results/r2/r1-backup/`.

## Method

- Server: `test-results/r2/serve.mjs` (same recipe as the isolated runner; stayed up for all waves). Specs: `qa.spec.ts` (generic waves: scroll with detectors, interact, keys, reduced), `qa-comp.spec.ts` (every named component, 236 steps), plus 20 single-purpose `probe-*.mjs`. Raw data `test-results/r2/findings/` (140 files), settled keyboard run in `findings-keys500/` (550 ms per Tab), shots in `test-results/r2/shots/`.
- Viewports 1440x900 and 390x844 (Pixel 7 UA, touch, DPR 2); rail also at 768. Pages: `/`, `/about`, `/work`, 9 case studies.
- Waves: scroll (real wheel, per step: text overlap/occlusion/clip, broken images, overflow, canvases, visible characters, tap targets), interact (every control), keys (Tab walk plus Enter), reduced motion, hydration sweep (5 variants x 12 pages x 2 viewports: default, stored persona, LA and Ho Chi Minh time zone and locale, reduced motion), and a **dev-mode** hydration sweep on a private dev server (prod hides attribute mismatches).
- Harness corrections, so you can trust the rest (retracted, not gaps): case-TOC "obscured by header" (TOC hidden before the body), "no accessible name" on range inputs (wrapped in `<label>`), "Pending <> Settled" overlap (3D flip, back face), stamp text "occluded" (pointer-events none), nav-pill text overlaps counted separately as F1, six of my own component steps that were test mistakes (about-note off-screen hit test, ticker touch-tap always lands on an item, no item in view at sample time, TOC "Top" clicked while the TOC had hidden itself, LinkedIn "scrolls" at 1440 where all 3 posts simply fit, rail wheel measured after the page had scrolled away).

## Gap list

Format: GAP-I2-F{n} | SEVERITY | page/element | evidence | suspected file | fix

### FAIL

**GAP-I2-F1 | FAIL | every page, 1440 (also mobile menu button, LinkedIn arrows) | nav pill has no backdrop blur in Chromium, page text prints through the labels**
- Evidence: computed `backdrop-filter` is `none` on every `.glass` element (nav pill, mobile menu button; `probe-nav.mjs`). The compiled CSS (`.next-e2e-*/static/chunks/0ebgmo8oy5u-_.css`) contains `.glass{...-webkit-backdrop-filter:var(--glass-filter)...}` and **no unprefixed `backdrop-filter`**; Chromium does not read the `-webkit-` one. Screenshots: `shots/glass-as-built.png` ("Real-world compute" headline printing over "About / LinkedIn / Get in touch / IT'S 02:52 IN SAIGON"), `shots/glass-with-unprefixed-backdrop-filter.png` (same spot, blurred, after setting the property inline). Also `shots/home-d1440-s05.jpg`, `home-d1440-s14.jpg`, `work_lumicap-d1440-s03.jpg`. The overlap detector fires on almost every scrolled step of every page ("It's HH:MM in Saigon" and nav labels vs body text). This is the surviving half of R1 F3: the clock now sits inside the pill, but the pill is see-through.
- Suspected file: `src/app/globals.css:312-316` (`.glass` declares both properties; the production CSS pipeline drops the unprefixed one) and `src/components/glass/liquid-glass.tsx` (sets only the `--glass-filter` variable).
- Fix: set `backdropFilter` and `WebkitBackdropFilter` as inline style in `LiquidGlass` (from the same `filter` string), or move the unprefixed declaration where the minifier keeps it. Add a unit or E2E check that the computed `backdrop-filter` on `.glass` is not `none` in the production build.

**GAP-I2-F2 | FAIL | home "Say hello" coin, touch (and slow mouse) | slow drags neither send nor snap back**
- Evidence: `probe-coin-slow.mjs`: phone, 80-step drag released on the wallet (2.5 px per pointer event) -> `data-stage` stays `idle`; the same drag with 12.6 px per event settles. Partial drag (40%, 5.7 px per event) leaves the coin stranded mid-track at x=137 (start 56) with state idle (`probe-coin-touch.mjs`; `comp-hello-m390` step "touch: partial drag snaps back"). Desktop mouse passes only because Playwright's steps were over 6 px. A real finger moves 2 to 5 px per event, so most human drags fail; tap and Enter still work.
- Suspected file: `src/components/site/home/say-hello.tsx:68` (`drag.current.moved = Math.max(moved, Math.abs(nx - x.get()))` stores the largest **per-event** step, not the distance from the start), used by the release test at `:75-76` and `onClick` at `:78`.
- Fix: track `moved` as total displacement from the press point (`Math.abs(nx)` or `max(moved, Math.abs(clientX - startX))`).

**GAP-I2-F3 | FAIL | /about career rail, mouse drag | a 40 px nudge flings the rail 530 px; any 230 px drag flies to the end**
- Evidence: `probe-rail-drag.mjs` with human timing (rail max scroll 1060, card pitch 300): 150 px over 1 s -> 530; 230 px over 400 ms -> 1060 (end, centre offset 70 px); 300 px flick -> 1060; 40 px nudge -> 530. Arrows, snap, Tab and native wheel scroll all work.
- Suspected file: `src/components/signature/ledger/career-rail.tsx:111` passes `d.v * 6` to `inertiaTarget` (`career-rail-logic.ts:30-31`), which multiplies by `coastMs = 220` again (about 1320 px per px/ms), and `:101` accumulates velocity (`+ d.v * 0.6`). The unit test covers the pure function, not the combination.
- Fix: pass `d.v` once, use a coast of 100 to 150 ms, clamp the coast to at most one card, then snap to the nearest card.

**GAP-I2-F4 | FAIL | 7 of 9 case studies at 1280, 1440, 1920 | case TOC labels longer than the 228 px box run past it into the body text**
- Evidence: `probe-toc-overflow.mjs` (label right edge minus TOC right edge): Lumicap +129, +132, +45, +33; Ledgr +134, +22; Guardline +44; Cortex +42; Zalo +30; COSAP +26, +43; GoCrypto +25. PAC and ReOrc fine. Visible overprint: `shots/work_lumicap-d1440-s03.jpg` ("Custody: no single person moves a fund" runs over "$635M", "Ledger: one history, two kinds of record" over "assets under management"), also Lumicap s08 and s10. `truncate` is applied but does nothing.
- Suspected file: `src/components/site/case-study/toc.tsx:180-190` (the `span.truncate` sits inside a `flex` wrapper span with no `min-w-0`, so the flex item will not shrink).
- Fix: `min-w-0` (and `flex-1`) on the wrapper and the label, or let labels wrap to two lines.

**GAP-I2-F5 | FAIL | Lumicap, Zalo (1440, 1280), Guardline (390) | stat values split mid-number**
- Evidence: `probe-stats.mjs`; screenshots `shots/stat-wrap-zalo-game-center-d1440.jpg` ("+30 / %", "+15 / %", "−40 / %"), `stat-wrap-guardline-m390.jpg` ("US$11.1 / B"), `stat-wrap-lumicap-d1440.jpg` ("$635 / M"). This is the side effect of the iteration-1 fix for the overprinting Guardline stat row: the overprint (R1 F1) is gone, replaced by a broken-number wrap.
- Suspected file: `src/components/site/case-study/blocks.tsx:118` (`font-display leading-none break-words` at 2.5rem to 3rem in a 4-column grid). The older `src/components/site/case-study-blocks.tsx` no longer carries this markup (it is still imported, for `MetaStrip` only).
- Fix: `whitespace-nowrap` with a fluid size (`clamp()` or a container query unit) so the longest value always fits its column; fewer columns when a value is long.

**GAP-I2-F6 | FAIL | home (2 canvases at the globe card); every page (1 footer canvas) | canvas count above the limit**
- Evidence: `probe-canvas.mjs`: home at 1440 and 390 has 2 canvases from about y=1260 to 3780 (globe `globe-stage` 420x420 plus footer `doodle` 320x140); every other page and the rest of home have 1 (the doodle pad, in the footer). Comp steps `globe-d1440/m390` "canvas count at card" and "canvas destroyed once scrolled away". Under reduced motion the globe canvas correctly disappears, the doodle remains. HANDBACK already asked for the footer doodle pad to be cut.
- Suspected file: `src/components/site/site-footer.tsx:6,70` (`<DoodlePad />`), `src/components/gems/doodle-pad.tsx`.
- Fix: remove the footer doodle pad (or lazy-mount it only on interaction and destroy it after), so the globe is the only canvas.

**GAP-I2-F7 | FAIL | repo gate | `pnpm test:e2e:isolated` red, 10 stale specs**
- Evidence: table above. Spec files: `tests/e2e/gems.spec.ts:66`, `site.spec.ts:233`, `mobile.spec.ts:47`, `reduced-motion.spec.ts:8`, `story.spec.ts` (untracked; lines 41 x2, 60, 71, 85, 104).
- Fix: delete or rewrite them against the new home (`persona-control`, `proof-ticker`, `card-stamp`, `globe-row`, `hello-coin`); remove the unmounted components (see F23).

### CONCERN

**GAP-I2-F8 | CONCERN | /work/cosap, /work/gocrypto, reduced motion, both viewports | hydration mismatch (the one FX-3 saw)**
- Evidence: production sweep (`comp-hydration-*.json`, 120 page loads each): only these two pages, only with `prefers-reduced-motion`, throw `Minified React error #418` (text mismatch; React regenerates the whole tree on the client). Also the `reduced-work_gocrypto-d1440-rm` and `-m390-rm` waves. Dev run (`hydration-dev.json`) names it: `Hydration failed because the server rendered text didn't match the client` on `/work/cosap`.
- Component found: `CompareSlider`. `const reduce = useReducedMotion()` is motion's own hook, true on the **first client render**, so `useState(reduce ? 1 : 0)` starts at 1 and shows the "after" values, while the server rendered the "before" values. File: `src/components/dataviz/compare-slider.tsx:28-31`.
- Second finding (dev only, silent in prod): on **all 9** case studies under reduced motion the dev console logs "tree hydrated but some attributes ... didn't match": the case hero words render `opacity 0.7 / translateY(18px)` on the server and `opacity 1 / none` on the client (`data-testid="project-badge"` word spans). Cause `src/components/site/case-study/case-hero.tsx:35,41` (same raw `useReducedMotion`). Nothing is visibly stuck in prod (`probe-hero-reduced.mjs`: 0 elements off rest).
- Fix: use the hydration-safe `@/lib/use-reduced-motion` in `compare-slider.tsx`, `case-hero.tsx` and the other 16 files that still import motion's hook (list: `grep -rn 'useReducedMotion.*motion/react' src`), or start state at 0 and set it in an effect.

**GAP-I2-F9 | CONCERN | home, say-hello coin, keyboard Enter | uncaught page error on every activation**
- Evidence: `probe-pointer.mjs`: pressing Enter on the focused coin throws `Failed to execute 'setPointerCapture' on 'Element': No active pointer with the given id is found` (stack: `onPointerDown`). Motion's `whileTap` synthesises a pointerdown for keyboard presses. It still sends (the click path runs) but it is an uncaught error each time; also logged in `keys-home-*` and `comp-hello-d1440`.
- Suspected file: `src/components/site/home/say-hello.tsx:62`.
- Fix: guard with try/catch or `if (e.pointerType)`, and call `setPointerCapture` on `e.currentTarget`.

**GAP-I2-F10 | CONCERN | every case study at 390, bottom of page | docked section-menu pill covers footer content**
- Evidence: `shots/work_gocrypto-m390-s24.jpg` (pill over "Thao Dao · Gia Thảo · Ho Chi Minh City, Vietnam"); interact wave: footer "About" link on GoCrypto is "obscured by button.pointer-events-auto.flex.h-11"; same detector on ReOrc s14. The pill deliberately returns at the end of the page.
- Suspected file: `src/components/site/case-study/toc.tsx:240-310` (`CaseSectionMenu`, `fixed inset-x-0 bottom-0`).
- Fix: hide the pill once the footer is in view, or add bottom padding equal to the pill height.

**GAP-I2-F11 | CONCERN | tap targets under 44 px at 390 (24 px on desktop) | 50 distinct small targets in the scroll waves**
- Evidence (`scroll-*-m390.json` `tapSmall`): footer name button `sketch-hint` 64x20 on all 12 pages (the `min-h-11` wrapper is not the button, so the 44 px claim in HANDBACK holds only for the wrapper, the hit area is 64x20); "Clear my doodle" 151x37 (12 pages); LinkedIn "Follow on LinkedIn" 153x26 and "View on LinkedIn" 133x25 (home); `psst — the casual version` toggle 216x21; about note "Start with Cortex Sentinel" 200x23; logo links on /about 80 to 211 x 32 and "Google Data Analytics" 187x28; ticker items 341x33; timeline dots 16x16 (Guardline, Lumicap); GoCrypto and Cortex stacked-bar segments 5 to 24 x 56; compare range input 310x8; Lumicap/COSAP/Ledgr case buttons and selects 36 to 42 high ("Ask them to approve" 38, "Approve deploy" 40, "Pause everything" 40, ladder rules 40, select 37); "Visit lumicap.io" 28, "Back to all work" 40. Persona control (44), chips (44), globe rows (48), coin (56), hello links (44), rail arrows (44), nav toggle (56) pass.
- Fix: pad to 44 px or extend the hit area; for the sketch-hint make the button itself `min-h-11 px-2`.

**GAP-I2-F12 | CONCERN | home proof ticker, keyboard and touch | auto-moving content has no pause for keyboard focus**
- Evidence: `comp-ticker-m390` "keyboard": the focused item drifts off screen (left edge -182 -> -308 in 3 s) while the animation stays `running`; pause exists only for mouse hover (verified on desktop) and touch, and any touch lands on an item (the strip is 46 px tall and fully covered by item buttons, hit-tested), so it jumps to a project instead of pausing. At 1440 the keyboard step looked fine only because my parked mouse was hovering the strip.
- Suspected file: `src/components/site/home/proof-ticker.tsx:60-90` (`onPointerEnter/Leave/Down` only).
- Fix: also pause on `focusin`/`focusout` and on `:focus-within`; offer a visible pause control or stop the loop after one pass (WCAG 2.2.2).

**GAP-I2-F13 | CONCERN | all 9 case studies | case-TOC active-row icon pulse never plays; throws a page error in dev**
- Evidence: dev server logs an uncaught page error on every case page: "Only two keyframes currently supported with spring and inertia animations. Trying to animate 1,1.18,1." In prod the icon scale stays 1.0 (158 samples, `probe-toc-pulse.mjs`).
- Suspected file: `src/components/site/case-study/toc.tsx:185` (`scale: [1, 1.18, 1]` with the spring `SITE_SPRING.ui`).
- Fix: give the keyframe animation a tween (`{ duration: 0.32, ease: "easeOut" }`) as `project-stack.tsx` already does.

**GAP-I2-F14 | CONCERN | mobile menu, keyboard | Tab leaves the open dialog for one hidden control**
- Evidence: `probe-menu.mjs` (and `comp-chrome-m390` `trapped:false`): dialog links Home, Highlights, Work, About, LinkedIn, Get in touch, then Tab 6 lands on the footer `button "Thao Dao"` behind the sheet (`inDialog=false`), then back to Home. Escape returns focus to the toggle correctly; `aria-modal` is true.
- Suspected file: `src/components/site/site-nav.tsx:241-290` (mobile sheet, `role="dialog"` at `:241`); the footer `SketchHint` button is the next tabbable after the dialog.
- Fix: make the page `inert` while the sheet is open, or wrap focus at the sentinel elements.

**GAP-I2-F15 | CONCERN (low) | home ticker, side TOC, chip rail | project jumps land with a 120 px dead gap**
- Evidence: every jump (ticker click, `home-toc`, `toc-chips`) leaves the card top at **208 px** (`comp-sidenav-*`, 3 of 3 jumps at both widths), versus 88 (nav bottom) or 136 (chip rail bottom). Clear of the nav and chips, but wasteful. The Highlights and Work nav anchors land at 96 as intended.
- Suspected file: `src/app/globals.css:158` (`html { scroll-padding-top: 6rem }`) plus `src/components/site/stack-card.tsx:52` (`scroll-mt-28`): both apply (96 + 112).
- Fix: drop `scroll-mt-28` or zero the html padding for this target.

### OBSERVATION

- **GAP-I2-F16**: No automated guard exists for the new home pieces (`hello-coin`, `proof-ticker`, `persona-control`, `card-stamp`, `globe-row`, `rail-card`, `toc-chips`: 0 E2E and 0 unit references). Every defect above (F1, F2, F3, F5, F8, F9) would be caught by a short spec; the CSS regression F1 by a computed-style assertion.
- **GAP-I2-F17**: Logo marquee (`a.flex.h-14`, 5 logos): Tab focuses logos that are off screen at that moment (`keys-home-d1440` tab7 at x=-397, tab8 at -151; `keys-home-m390` tab3 at -179). `src/components/site/logo-strip.tsx`.
- **GAP-I2-F18**: Number inputs accept "e": COSAP "Annual leave (days)" -> `8e123`; Ledgr "Monthly wage" -> `0123` (carry-over of R1 F14). `src/components/case/cosap/leave-guard.tsx`.
- **GAP-I2-F19**: Guardline diagram nodes (10 `g[role=button]`) give no hover feedback (carry-over of R1 F15).
- **GAP-I2-F20**: Nav "Work" still goes to `/#work` (home Products section), not `/work`, and is highlighted on `/work` and every case study (carry-over of R1 F11). `src/components/site/site-nav.tsx:15-28`.
- **GAP-I2-F21**: LinkedIn embeds were stubbed, so card content is not judged. The carousel itself passed: 3 posts fit at 1440 (no arrows, no mask, correct); at 390 swipe moves 336 px and snaps with a 24 px offset, vertical swipe still scrolls the page, `rel` has `noopener`. The `requestStorageAccess` console errors from the real embeds were not reproducible here.
- **GAP-I2-F22**: Timeline dots (16x16) on Guardline/Lumicap sit under an invisible full-width range input; mouse clicks scrub rather than hit a dot. By design, but the dots are not independent targets.
- **GAP-I2-F23**: Unmounted components still in the tree, imported by nothing: `src/components/site/dot-grid.tsx`, `src/components/gems/mascot.tsx`, `src/components/story/persona-chapters.tsx` and `home-lazy.tsx`, `src/components/site/case-study-hero.tsx`. They keep the stale specs alive (F7). (`case-study-blocks.tsx`, `case-study-toc.tsx`, `case-study-media.tsx` are still imported, so they are not dead.)

## Re-check of iteration 1 (independent)

| R1 gap | Now |
|---|---|
| F1 Guardline stat row overprint | Overprint fixed at 1440, but replaced by mid-number wraps (new F5) |
| F2 pinned chapter heading under nav | Not applicable, chapters removed from home (spec stale, F7) |
| F3 clock overprints page text | Clock now inside the pill, but the pill is see-through (F1) |
| F4 near-empty chapter screens | Home redesigned; minimum visible text 33 to 67 characters, sparse only on the Say-hello/LinkedIn screens (activity 0.02 to 0.04), acceptable |
| F5 touch targets | Partly fixed (persona, chips, rows, coin, hello links, footer links 44+); remainder in F11 |
| F6 duplicate tab stops | **Fixed**: 0 duplicate stops on all 10 settled keyboard runs (home 61 stops, /about 19 and 24, /work 29 and 24) |
| F7 reduced-motion infinite animations | **Fixed**: 0 on home, /about, /work and 3 case studies at 1440 (mobile reduced run: 0) |
| F8 WebGL GPU-stall warning | Not reproduced (no console warnings of ours on any page) |
| F9 ledger strip overlap | Now a 3D flip chip, back face hidden; detector noise |
| F10 Mentee cursor label | Component removed |
| F11 nav Work link | Unchanged (F20) |
| F12 casual toggle has no way back | **Fixed**: toggle becomes "ok, back to the serious version" (`probe-casual.mjs`) |
| F13 persona has no selected state | **Fixed**: radiogroup, `aria-checked`, roving tabindex, arrows wrap, persists across reload |
| F14 number input "e" | Unchanged (F18) |
| F15 diagram nodes no hover | Unchanged (F19) |
| F16 View Transition abort | Not reproduced (no uncaught page error in any run) |

HANDBACK claims checked: LiftCard hover lift **-12 px, scale 1.025** on highlight tiles, stack cards and people cards (-2 px on globe rows), returns to 0, no clipping; tap on touch leaves no stuck lift (12 of 12 cards at 390); reduced motion has no movement. All true. "Footer SketchHint wrapped for 44 px": wrapper yes, hit area no (F11). "Global reduced-motion rule stops `.animate-pulse`": consistent with 0 infinite animations. "Canvas count <= 1": not met (F6).

## What passed (no gap)

- No horizontal scroll on any of the 12 pages at either width in any scroll step (max overflow 0), no broken images, no HTTP 4xx/5xx, no uncaught page error in default mode other than F9, one `h1`/`main`, no empty screens.
- **Persona control**: sizes 44 (36 on desktop), reorders cards and TOC to the documented order for all 3 personas and back, note text, persists across reload, arrow keys wrap, one Tab stop, reduced motion reorders without animations.
- **Stamps**: 9 of 9 land once per card on scroll, none overlaps card text or leaves the viewport, rest from first paint under reduced motion.
- **Globe rows**: hover and keyboard focus both move the globe, links resolve (200), mouse drag rotates, wheel and vertical touch swipe scroll the page, canvas destroyed when far away, static fallback under reduced motion.
- **Side nav / chips**: 9 entries, active follows scrolling, jumps land clear of nav and chips (gap in F15), keyboard Enter works.
- **Ticker**: moves in view, pauses out of view and on hover, resumes on leave, items jump to the right card, chips flip to Settled, static scrollable list under reduced motion.
- **Say-hello coin**: tap, Enter, Space, fast mouse drag, drag leaving the track, overshoot clamp, "Send another" reset, reduced motion instant, live region and name present, links 44 px (F2 and F9 aside).
- **LinkedIn carousel** (F21), **career rail** arrows (prev/next disable at ends, marker moves, end cap visible), Tab through cards scrolls them into view with a ring, native wheel and the phone vertical list work (F3 aside).
- **Case TOC**: hidden before the body and shown inside it, no overlap of the TOC box with body text, rows jump clear of the nav, active row follows, mobile section menu hides on scroll down and returns on scroll up, opens, picks a section, Escape closes. (F4, F10, F13 aside.)
- Nav: links land clear of the nav, mobile menu opens and Escape restores focus to the toggle, clock reads "It's HH:MM in Saigon" after hydration and sits inside the pill at 1440.
- Case interactives at both widths: no dead buttons (only already-selected chips), no obscured controls, links return 200.

## Limits

- LinkedIn embeds stubbed (as in the repo specs). Chromium only; real Safari/Firefox untested (F1 would not show in Safari, which reads `-webkit-backdrop-filter`).
- Dev-mode hydration sweep ran at 1440 and 390 for default and reduced motion; the stored-persona, time-zone and locale variants were production-only (no mismatch).
- Keyboard focus-ring visibility for third-party iframes (LinkedIn) is none, as before.
- The interact pass covered the first 90 controls on home at 1440 (93 total) and 60 to 90 elsewhere.
- Number of detector hits is high because of F1; real-pixel judgement was applied to the screenshots cited.

## Unresolved questions

- Should the nav pill be a frosted-opaque surface in every browser (simplest), or keep the refracting "liquid" look and only fix the property drop?
- Should the footer doodle pad go entirely (SPEC cut) or become a lazy opt-in tool that unmounts its canvas?
- Delete the five unmounted components in F23 together with their stale specs, or keep them for the `/lab` pages? (Nothing in `src/` imports them.)
- Ticker: pause control or one-pass animation for keyboard users (F12)?

**Status:** DONE_WITH_CONCERNS
**Summary:** Gates: typecheck, lint, 219 unit, build:cf pass; E2E is red (116/10, all stale specs). Real-user QA at 1440 and 390 found 7 FAIL, 8 CONCERN, 8 OBSERVATION, led by the blur-less nav pill, the broken touch coin drag, the career-rail drag overshoot, TOC labels overflowing into body text, mid-number stat wraps and the 2-canvas home. The hydration mismatch is `CompareSlider` (prod) plus the case hero (dev), both from motion's raw `useReducedMotion`.
**Concerns/Blockers:** None blocking. LinkedIn embeds are stubbed; all measurements are Chromium. I was the only heavy lane; load stayed 4 to 10 during QA, 16 to 30 only during my own builds.
