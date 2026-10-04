---
name: report:r3-functional
description: "Iteration 3, lane B (functional QA) of the ux autoresearch loop: repo gates, independent real-user QA of home, /about, /work and 9 case studies at 1440 and 390, re-check of every R2 gap, repo hygiene."
date: 04-10-26
metadata:
  node_type: memory
  type: report
  feature: portfolio-site
  phase: autoresearch-ux-iteration-3
---

# R3 functional QA (iteration 3, lane B)

**TL;DR:** Most of iteration 2's functional defects are fixed and re-proven: coin touch drag, rail drag, TOC overflow, stat wrap, canvas count (max 1), hydration (0 mismatches in 120 prod loads, 60 per viewport, and 48 dev loads), mobile-menu focus leak, pill over footer, case-page runtime error. Gates: typecheck, lint, 221 unit and `build:cf` pass; **e2e is 135 pass / 2 fail** (both spec problems, not product bugs). New and open: **LinkedIn cards go blank when the embed is blocked** (real user impact), **the green state depends on 21 uncommitted modified files plus 1 untracked file** (HEAD still ships the raw motion hook on mounted components and public `/lab` pages), the say-hello dotted track still overruns its card, persona reorder still flies cards 6,000+ px, the nav pill still lets crisp text show at its rim. Totals: **4 FAIL, 11 CONCERN, 8 OBSERVATION**.

**Tree tested:** HEAD `5c1a6e6` plus the uncommitted working tree (21 modified files; untracked `src/components/story/`, `src/lib/lab-only.ts`). Production build (isolated), private seeded DB, Chromium only. My own server and dev server are stopped; build dirs removed; `tsconfig.json` restored to HEAD. `test-results/r2/` (92 MB, includes the r1 backup) untouched: I passed `--output=test-results/r3/e2e-out` so Playwright's start-of-run wipe could not reach it, and kept an outside copy as insurance.

## Totals

| Severity | Count |
|---|---|
| FAIL | 4 (F1 to F4) |
| CONCERN | 11 (F5 to F15) |
| OBSERVATION | 8 (F16 to F23) |

## Repo gates

| Gate | Result | Load 1 / 5 / 15 min at start |
|---|---|---|
| `pnpm typecheck` (app + tests) | PASS | 6.1 / 6.4 / 7.1 |
| `pnpm lint` | PASS, 0 problems | 7.4 / 6.7 / 7.2 |
| `pnpm test` (bun unit) | PASS, 221 pass / 0 fail, 31 files | 10.0 / 7.3 / 7.4 |
| `pnpm test:e2e:isolated` | **FAIL, 135 pass / 2 fail**, 5.5 min (137 tests, includes first runs of `home.spec.ts` and the case-studies guard) | 11.3 (my 5 workers then drove the box to 64) |
| `pnpm build:cf` | PASS (one wrangler compat-date WARN only), 32 s; `/lab/*` listed as dynamic | 3.8 / 16 / 14 (peak from my own build) |

Load context: I was the only lane I launched; other agents' `next dev` servers and a worktree run were already on the box (load 18 to 30 before my first heavy step). QA waves ran two Chromium streams at once at load 14 to 29; no result below is timing-flaky except as noted. Logs: `test-results/r3/logs/repo-*.log`, `test-results/r3/h/run-*.log`.

**E2E failures, each at its code path:**

| Spec | Why it fails | Verdict |
|---|---|---|
| `tests/e2e/gems.spec.ts:30-33` "doodle saves to localStorage only and clears" (90 s timeout on `getByTestId('doodle-pad')` at `/about`) | The footer `<DoodlePad />` was removed in 3ef5356 (`site-footer.tsx`); nothing mounts `src/components/gems/doodle-pad.tsx` any more | Stale spec (F1) |
| `tests/e2e/case-studies.spec.ts:131` ledgr only, "stat values stay on one line and TOC labels stay inside their box" (`data-shown` stays `false`) | Reproduced deterministically with the spec's own settle sequence (`h/probe-ledgr-toc2.mjs`): after `scrollTo(0,1600)` a full-width `dataviz` block sits at viewport top 604, inside the 70 % line, so `useWideInView` (`src/components/site/case-study/toc.tsx:82-97`) hides the TOC by design. The other 8 cases pass | Fragile spec offset (F2) |

## Method

- Server: `test-results/r3/h/serve.mjs` (same recipe as `scripts/run-isolated-e2e.mjs`, stays up). Harness copied from R2 and re-run unchanged: `qa.spec.ts` (scroll with detectors, interact, keys, reduced), `qa-comp.spec.ts` (236 component steps), 25 `probe-*.mjs`. New probes this round: `probe-menu2`, `probe-ticker-key`, `probe-ledgr-toc{,2}`, `probe-glass2`, `probe-linkedin-real`, `probe-linkedin-blocked`, `probe-design-recheck`. Raw data `test-results/r3/h/findings/` (137 files) and `findings-keys500/` (settled keyboard run, 550 ms per Tab), shots in `h/shots/`.
- Viewports 1440x900 and 390x844 (Pixel 7 UA, touch, DPR 2). Pages: `/`, `/about`, `/work`, 9 case studies. 12 pages x 2 viewports x {scroll, interact, keys, reduced} plus component waves plus a hydration sweep (5 variants: default, stored persona, LA and Ho Chi Minh locale and time zone, reduced motion) on the prod build, and a **dev-mode** hydration sweep on a private dev server (48 loads, 4 variants).
- Harness steps that are stale against the redesign (not product gaps, not counted): stack-card "mouse hover lifts" asserts a translate of at least 6 px, but the lift is now size-compensated (top edge moves 11 to 12 px, translate 5.3); ticker "touch pauses" and "click item" and "keyboard" on 390 (a tap always lands on an item and navigates; the harness uses `.focus()` after a touch so `:focus-visible` is false; verified with real Tab in `probe-ticker-key.mjs`); about-note step at 390 (off-screen hit test); "OBSCURED by fixed inset-0" in 390 interact runs (the walk had opened the mobile menu); "obscured by header" on case-TOC links (TOC hidden before the body); 'Pending <> Settled' (back face of the 3D flip).

## Gap list

Format: GAP-I3-F{n} | SEVERITY | page/element | evidence | suspected file | fix

### FAIL

**GAP-I3-F1 | FAIL | repo gate, `gems.spec.ts:30` | stale doodle-pad spec keeps the e2e red**
- Evidence: log `r3/logs/repo-e2e.log` (timeout 90 s at `gems.spec.ts:33`). `tests/unit/gems.test.ts:50` still lists `doodle-pad.tsx`, `mascot.tsx`, `peel-sticker.tsx` as files that must exist, which keeps the dead components alive.
- Suspected file: `tests/e2e/gems.spec.ts:30-43`, `tests/unit/gems.test.ts:50`.
- Fix: delete the doodle test (and the three unmounted components, see hygiene list) or re-mount a pad deliberately. Remove the names from `gems.test.ts`.

**GAP-I3-F2 | FAIL | repo gate, `case-studies.spec.ts:129-131` (ledgr) | spec scrolls to a fixed 1600 px that lands under a wide block**
- Evidence: see table above; probe output `ledgr {"shown":"false","wide":[{"id":"dataviz","top":604,"bottom":954}],"scrollY":1600}`; the other 8 slugs show the TOC at 1600.
- Suspected file: `tests/e2e/case-studies.spec.ts:129`.
- Fix: scroll to the body start element plus a margin (for example the first section id) and wait for `data-shown=true`; or assert `data-shown` only when no `[data-wide]` block is in the 70 % band.

**GAP-I3-F3 | FAIL | whole site, ship state | QA-green depends on uncommitted files; HEAD still has the raw motion hook on mounted components and public /lab pages**
- Evidence: `git status`: 21 modified files + untracked `src/lib/lab-only.ts`, `src/components/story/`. At HEAD (`git show HEAD:...`) these **mounted** files still `import { useReducedMotion } from "motion/react"`: `site/hero-intro.tsx` (home hero), `site/reveal.tsx`, `gems/scroll-words.tsx` (home statement), `gems/secret-word.tsx` (root layout), `gems/lost-note-game.tsx` (not-found page), plus signature components. All my 0-mismatch hydration results (F8 recheck) are for the working tree. The six `/lab/*` pages are committed without the `labOnly()` guard (guard lives in the untracked `lab-only.ts` and the modified page files), so a deploy of HEAD serves them (they are `noindex`, but public). The working tree also carries the new `emitStamp` passport hook wired into `secret-word`, `lost-note-game`, `peel-sticker`, `doodle-pad` and `participate/store.tsx` (an unreviewed feature riding along).
- Suspected file: the 21 files above (`git diff --stat`).
- Fix: commit the migration atomically (hook swap + `lab-only.ts` + 6 lab pages) and either commit or revert the `emitStamp` addition; re-run the prod hydration sweep on the committed tree before calling hydration closed.

**GAP-I3-F4 | FAIL | home "Notes on LinkedIn", 390 (and 1440) | when the embed is blocked the cards go blank: about two empty screens**
- Evidence: `probe-linkedin-blocked.mjs`: with `linkedin.com` aborted (ad blocker or tracking protection) or served with `X-Frame-Options: DENY`, all three cards reach `data-state="loaded"`, `linkedin-preview` is removed, card text is empty. Browsers fire `load` for the iframe's error page, so the skeleton (date, title, excerpt) that was designed as the fallback is hidden. Scroll wave: `EMPTY active=0.021` at home 390 steps 21 and 22 (y=14175), and `sparse` at 1440 steps 19 to 21 (`h/shots/home-m390-s21.jpg`, `linkedin-abort.jpg`).
- Suspected file: `src/components/site/linkedin-posts.tsx:50-59,67-70` (`onLoad={() => setLoaded(true)}`; skeleton shown only while `!loaded`).
- Fix: keep the excerpt block as the always-visible card face (SPEC 5.9 static cards) and treat the iframe as an optional enhancement overlay, or time-box the load and verify with a visible-content check before hiding the skeleton.

### CONCERN

**GAP-I3-F5 | CONCERN | nav pill, 1440 (and the 56 px mobile button) | text under the pill is still crisp at its rim and next to the clock**
- Evidence: `h/shots/glass-cosap-zoom.png` (COSAP at scrollY 6480, DPR 2): "Purchase-o... per" prints at 100 % sharpness inside the left edge of the pill, directly touching "Thao Dao", and a "0.1" ghost sits next to "IT'S 04:24 IN SAIGON". The blue bar behind "Work" is blurred, so the blur works; the refraction map (`url(#lg-...)`, `data-glass="refract"`) re-sharpens the rim. Computed `backdrop-filter` is now `url("#lg-Ridb") blur(24px) saturate(1.6)`, bg `rgba(255,255,255,0.72)`. The overlap detector still fires on most scrolled steps (`It's HH:MM in Saigon` vs body text).
- Suspected file: `src/components/glass/liquid-glass.tsx:95-107` (refract path), `src/app/globals.css:322-326`.
- Fix: apply the displacement map only to a thin rim mask, or raise the interior tint to about 0.88, or use the frost variant for the main nav pill.

**GAP-I3-F6 | CONCERN | home "Say hello", 1440 | dotted track overruns the card and the wallet (R2 D12, still open)**
- Evidence: `probe-design-recheck.mjs`: card right edge 1080, `svg` right edge 1144, wallet right 1016 (the dash runs 64 px past the card, 128 px past the wallet).
- Suspected file: `src/components/site/home/say-hello.tsx:~51` (`<svg width="100%" ... className="absolute inset-x-[104px]">`).
- Fix: drop the `width="100%"` attribute and size with `right-[104px] left-[104px] w-auto` or `w-[calc(100%-208px)]`.

**GAP-I3-F7 | CONCERN | home persona control (R2 D8, still open) | picking a persona flings cards 6,000+ px in about half a second**
- Evidence: Founder click while at the project stack: Ledgr top goes 6378, 3167, 1358, 679, 422, 339, 313, 302 px (60 ms samples) with scrollY fixed. Order and TOC end correct. Reduced motion reorders instantly (passes).
- Suspected file: `src/components/site/project-stack.tsx` (ordered `motion.div layout="position"` with `SPRING.sheet`).
- Fix: `layout={false}` on the wrapper and cross-fade the list (opacity 0 to 1, y 12, 0.3 s), or scroll the stack top into view first.

**GAP-I3-F8 | CONCERN | /work, 1440 (R2 D11, partly fixed) | no visible heading and about 330 px of empty tint above each device**
- Evidence: black slabs are gone (0 dark cards). The `h1` "All projects" is still 1 px tall (`sr-only`, top 154). First viewport (`h/shots/work-d1440-top.jpg`) is chips plus three cards whose upper half is empty pastel.
- Suspected file: `src/app/work/page.tsx` (h1), `src/components/site/work-card.tsx:39` (`xl:min-h-[742px]`).
- Fix: visible `h1` above the chips; lower `min-h` or pull the device up.

**GAP-I3-F9 | CONCERN | home LinkedIn cards, 1440 and 390 (R2 D5, still open) | real embeds show LinkedIn's cookie wall inside the card and log a console error**
- Evidence: `probe-linkedin-real.mjs`: states `loaded` x3; console `requestStorageAccess: Permission denied.` (all runs), 390 also logs a report-only CSP `frame-ancestors` message from `google.com`; screenshot `h/shots/linkedin-real-m390.jpg` shows "LinkedIn respects your privacy / Accept / Reject" over a quarter of the card. With the stub the console is clean, so the default QA sweeps do not see this. Card radius still `rounded-[20px]`.
- Suspected file: `src/components/site/linkedin-posts.tsx:59`.
- Fix: same as F4 (static cards, link out).

**GAP-I3-F10 | CONCERN | home footer, every page (R2 D13, half fixed) | two contact blocks in a row**
- Evidence: doodle pad is gone. Headings "Say hello" and "Want to get in touch? Drop me a line." both present on home, 3 `mailto:` links.
- Suspected file: `src/components/site/site-footer.tsx`, `src/app/page.tsx` (`SayHello`).
- Fix: hide the footer contact heading and pill on home, or fold Say hello into it.

**GAP-I3-F11 | CONCERN | tap targets under 44 px at 390 (R2 F11, partly fixed: 50 to 35 distinct) |**
- Evidence (`scroll-*-m390.json` `tapSmall`, real controls only): casual toggle 216x21; ticker items 341x33 and 257x33; "Follow on LinkedIn" 153x26, "View on LinkedIn" 133x25; "Credential" 133x25; /about logo links 80 to 211 x 32 and "Google Data Analytics" 187x28; "Start with Cortex Sentinel" 200x23; Ledgr select 268x37; a 43x44 "B" button; Guardline and Lumicap timeline stops 16x16; GoCrypto and Cortex stacked-bar segments 5 to 24 x 56. Fixed since R2: footer name button, case links, case buttons, hello links. Listed twelve times and ignored: the sr-only "Skip to content".
- Suspected file: `src/components/gems/cursor-reveal.tsx`, `site/linkedin-posts.tsx`, `site/logo-strip.tsx`, `app/about/page.tsx`.
- Fix: `min-h-11` with padding on text links; for segments and timeline stops extend the hit area with a pseudo-element.

**GAP-I3-F12 | CONCERN | home proof ticker (R2 F12, half fixed) | keyboard pause works; touch cannot pause; speed 42 px/s, smallest text 11 px**
- Evidence: real Tab onto an item pauses it and keeps it put for 3 s (`probe-ticker-key.mjs`, both viewports), pause ends on Tab away. On touch every tap lands on an item and jumps to its project (`probe-ticker-touch.mjs`: hit-test shows item buttons across the 46 px strip), so there is no touch pause. Speed measured 42.1 px/s (R2 D17: spec 28).
- Suspected file: `src/components/site/home/proof-ticker.tsx:60-90`.
- Fix: stop the loop after one pass on touch devices, or add a visible pause control.

**GAP-I3-F13 | CONCERN | home radius scale (R2 D14, still open) | off-scale radii**
- Evidence: computed `border-radius` on home: 20 px x12, 18 px x3, 6 px x3, plus 28, 29, 32, 35 once each; token scale is 8/12/16/24.
- Suspected file: `site/photo-moments.tsx`, `site/linkedin-posts.tsx:59`, `site/device-mockup.tsx`, `case-study-media.tsx`.
- Fix: map 20 and 18 to `rounded-2xl` or `rounded-lg`; 6 to `rounded-sm`.

**GAP-I3-F14 | CONCERN | /about (R2 D15, still open) | career data shown three times**
- Evidence: "Cho Tot" x2, "MoMo" x3, "Creatio" x2 in the page text; "Earlier experience" block present.
- Suspected file: `src/app/about/page.tsx`.
- Fix: keep the rail and Experience list, delete "Earlier experience".

**GAP-I3-F15 | CONCERN | hydration-safety debt | one mounted component still uses motion's raw hook; four copies of the safe hook**
- Evidence: `src/components/site/case-study-media.tsx:4,30` (mounted via `case-study/blocks.tsx`) and unmounted `case-study-hero.tsx`. Safe hook defined four times: `lib/use-reduced-motion.ts` (canonical), `signature/participate/store.tsx:97`, `signature/glass/use-reduced-motion.ts:11`, `signature/objects3d/use-env.ts:14`. `gems/scroll-words.tsx` imports it from the participate store. Prod sweep shows no mismatch today (reduced motion included); this is the class that caused R2 F8.
- Fix: one hook in `@/lib/use-reduced-motion`; re-export or delete the others; swap `case-study-media.tsx`; add a hydration check (see F16).

### OBSERVATION

- **GAP-I3-F16**: No guard for three R2 fixes. No spec asserts computed `backdrop-filter` is not `none` on `.glass`, none drives the `/about` career-rail mouse drag (only the pure function has a unit test), none checks hydration. The new home pieces are now covered by `home.spec.ts` (coin, ticker, persona, stamps, globe, chip rail), which closes R2 F16.
- **GAP-I3-F17**: Logo marquee still takes focus on logos that are off screen (`keys-home-d1440` tab7 x=-405, tab8 x=-159; `keys-home-m390` tab3 x=-183). Carry-over of R2 F17. `src/components/site/logo-strip.tsx`.
- **GAP-I3-F18**: Number inputs still take odd input (Ledgr "Monthly wage" shows `0123`, COSAP leave days accepts "e"). Carry-over of R2 F18.
- **GAP-I3-F19**: Guardline diagram nodes (10 `g[role=button]`) still give no hover feedback. Carry-over of R2 F19.
- **GAP-I3-F20**: Nav "Work" still goes to `/#work` and is highlighted on `/work` and case studies. Carry-over of R2 F20, `site-nav.tsx:14-28`.
- **GAP-I3-F21**: Timeline stops (16x16) on Guardline and Lumicap sit under an invisible full-width range input; keyboard focus lands on the invisible input (`INVISIBLE, NO-NAME` in the keys run). Carry-over of R2 F22.
- **GAP-I3-F22**: Case TOC icon pulse (R2 F13): the dev page error is gone (0 page errors in 48 dev loads), but my pulse probe only saw one active row, so whether the 1.18 pulse actually plays in prod is not proven. Also: the margin TOC hides whenever a wide block is in the 70 % band (design choice that surprised the Ledgr spec, F2).
- **GAP-I3-F23**: The mounted LinkedIn embeds from `linkedin.com` are the only third party on every page (`external hosts: linkedin.com` in all 12 home and case sweeps); no other host, no 4xx or 5xx, no failed request except aborted `_rsc` prefetches.

## Re-check of R2 functional gaps (independent)

| R2 gap | Now | Evidence |
|---|---|---|
| F1 nav pill no blur | **Fixed (property), residual rim bleed** | computed `backdrop-filter` now set inline (`liquid-glass.tsx:104`), tint 0.72; rim still crisp, see F5 |
| F2 coin slow touch drag | **Fixed** | `probe-coin-slow`: 2.5 px/event touch drag settles; `probe-coin-touch`: 40 % drag snaps back to x=56 incl. 25 px vertical drift; comp steps "touch: partial snaps back / full settles / vertical swipe scrolls" ok |
| F3 rail drag overshoot | **Fixed** | `probe-rail-drag`: 150 px to 230, 230 to 230, 300 flick to 530, 600 to 830, 40 to 0; centre offset 0 each; drag release does not click through |
| F4 TOC label overflow | **Fixed** | `probe-toc-overflow`: no overflowing label at 1280, 1440, 1920 for all 9 cases |
| F5 stat mid-number wrap | **Fixed** | `probe-stats` ok 27 of 27 (9 cases x 1440, 1280, 390); e2e guard passes (8 of 9 reach the TOC half) |
| F6 2 canvases | **Fixed** | `probe-canvas`: max 1 on home at both widths (globe only, destroyed once scrolled away); 0 on every other page and under reduced motion; no `canvasTotal > 1` step in any scroll wave |
| F7 e2e red, 10 stale specs | **Mostly fixed** | 116/10 to 135/2; remaining 2 are F1 and F2 |
| F8 hydration mismatch | **Fixed on working tree** | comp-hydration: 0 messages in 60 prod loads per viewport x 5 variants x 2 viewports; dev sweep: 0 mismatches in 48 loads (only dev notices: motion's "Reduced Motion enabled", Next LCP image hint on /about). Depends on uncommitted files, F3 |
| F9 Enter on coin throws | **Fixed** | no page error on Enter and Space (comp-hello steps ok; `probe-pointer` silent; `home.spec` asserts none) |
| F10 section-menu pill covers footer | **Fixed** | no occluded or obscured hit by the pill in any 390 scroll or interact step (`useFooterInView`, `toc.tsx:127-138`) |
| F11 tap targets | **Partly fixed** | 50 to 35 distinct, see F11 |
| F12 ticker keyboard pause | **Fixed for keyboard, open for touch** | see F12 |
| F13 TOC pulse page error | **Error fixed** | 0 page errors in dev; pulse itself unproven (F22) |
| F14 mobile menu Tab leak | **Fixed** | `probe-menu2`: `#main` and footer `inert`, Tab cycles dialog links then the "Close menu" toggle (which is in the sheet's control set, not a hidden control), Escape restores focus and clears `inert` |
| F15 project jump 120 px gap | **Fixed** | 1440: card top 128 under nav 88; 390: 164 under chip rail 136 |
| F16 no guard for new home pieces | **Fixed** | `home.spec.ts` covers them |
| F17 logo marquee focus | Open (F17) | |
| F18 number input "e" | Open (F18) | |
| F19 diagram node hover | Open (F19) | |
| F20 nav Work link | Open (F20) | |
| F21 LinkedIn carousel | Passes (stubbed), real embeds see F4, F9 | |
| F22 timeline dots under input | Open (F21) | |
| F23 unmounted components | Open, see hygiene | |

R2 design items that are checkable in code or by probe (the design lane judges visuals): D1 case runtime error **fixed**; D2 lift top edge **fixed** (11 to 12 px on tiles, stack and people cards; globe rows 2 px by design); D4 mobile chip rail **fixed** (e2e plus comp-sidenav); D6 empty ReOrc module map **fixed** (min opacity 1 after scroll-in); D7 Ledgr card now white, stamp readable (blend normal); D10 ad hoc lift in work card **fixed** (classes removed); D3, D5, D8, D11, D12, D13, D14, D15, D17 **still open** (F5, F9, F7, F8, F6, F10, F13, F14, F12).

## What passed (no gap)

- No horizontal scroll on any of the 12 pages at either width at any scroll step (max overflow 0), no broken or pending images beyond lazy logos, no HTTP 4xx or 5xx, no uncaught page error and no console error on any page in any default or reduced run (only aborted `_rsc` prefetches), one `h1` and one `main` everywhere.
- Persona control, stamps (9 of 9 land once, rest from first paint under reduced motion), globe rows (hover, focus, drag, wheel, touch scroll, canvas destroyed away, static under reduced motion), side nav and chips (9 entries, active follows, keyboard Enter), LiftCard (hover and focus lift, tap leaves no stuck lift on 12 of 12 cards at 390, reduced motion no movement), ticker (moves, pauses hidden and on hover, chips flip), say-hello coin (tap, Enter, Space, fast and slow mouse and touch drags, drag off the track, overshoot clamp, reset, reduced motion instant, live region), career rail (arrows, snap, Tab, wheel, touch list), mobile menu, case TOC and section menu, all 9 cases' interactive pieces keyboard-reachable, reduced motion 0 infinite animations.
- Keyboard (settled, 550 ms per Tab): 0 duplicate tab stops and no trap on all 24 runs; focus rings present on every stop except the three LinkedIn iframes (third party).
- `/lab/*` returns 404 in the production build (working tree); `/nope` 404.

## Repo hygiene (uncommitted and untracked)

| Item | Status | Anything mounted importing it? |
|---|---|---|
| 21 modified files (6 `app/lab/*/page.tsx`, 5 `gems/*`, 3 `signature/characters/*`, 3 `signature/ledger/*`, `glass/story-chapter.tsx`, `participate/store.tsx`, `site/hero-intro.tsx`, `site/reveal.tsx`) | Uncommitted (hook swap + `emitStamp` + lab guard). See F3 | **Yes**: hero-intro, reveal, scroll-words (home), secret-word (layout), lost-note-game (not-found), participate/store (layout provider) |
| `src/lib/lab-only.ts` | Untracked | Yes, by the 6 modified lab pages |
| `src/components/story/persona-chapters.tsx`, `home-lazy.tsx` | Untracked, dead | No importer anywhere in `src` or `tests` (old home chapters) |
| `src/components/gems/doodle-pad.tsx` | Tracked, dead (modified: emitStamp) | No (only `gems.test.ts:50` and the stale e2e) |
| `src/components/gems/mascot.tsx` | Tracked, dead | No (only `gems.test.ts:50`) |
| `src/components/gems/peel-sticker.tsx` | Tracked, dead (modified) | No (`gems/logic.ts:8` names it in a table) |
| `src/components/site/case-study-hero.tsx` | Tracked, dead, still raw motion hook | No |
| `src/components/site/dot-grid.tsx` | Deleted in 71d0b1f | `src/lib/dot-grid-math.ts` header comment still names it |
| Root `*.tmp.cjs` gem scratch files | **None present** | n/a |
| Root `globe-1440.png`, `globe-390.png`, `scratch-strip.png` | Untracked scratch screenshots | No |
| `test-results-integ/` (1.5 MB), `test-results/` (182 MB, ignored) | Scratch; ignored dir is large | No |
| `.next-dev/` and two other `next dev` processes (pids 13188, 18551, 37171) | Not mine; running during my runs | n/a |
| `process/features/portfolio-site/active/autoresearch-ux-261004_04-10-26/{fx1-shots,research,...}` and `foundation-research_03-10-26/*` | Untracked reports and shots | n/a |
| `tsconfig.json` | Dirty after `build:cf` and my QA server (reformatted lists, extra includes); I restored it to HEAD | n/a |

## Limits

- Chromium only; real Safari and Firefox untested (the `-webkit-backdrop-filter`-only failure class of R2 F1 would not show there anyway). LinkedIn embeds stubbed in the bulk waves; real embeds and blocked embeds probed separately at 1440 and 390.
- The interact pass covered the first 90 controls on home and 60 to 90 elsewhere. Hydration under the stored-persona and locale variants was prod-only.
- HEAD itself was not built and swept: F3 is shown from `git show HEAD:` source, not from a HEAD runtime failure.
- Two QA streams ran at once at load 14 to 29; the settled keyboard run used 550 ms per Tab.

## Unresolved questions

- Commit the hook migration, `lab-only.ts` and the `emitStamp` passport hook now, or revert `emitStamp` (not part of this loop's spec)?
- LinkedIn: go fully static cards (SPEC 5.9) or keep embeds with a text-first fallback?
- Delete the dead gems (`doodle-pad`, `mascot`, `peel-sticker`), `case-study-hero.tsx` and `src/components/story/*` together with their stale specs and the `gems.test.ts` file list?
- Ticker: one-pass loop on touch, or a visible pause control?

**Status:** DONE_WITH_CONCERNS
**Summary:** typecheck, lint, 221 unit and build:cf pass; e2e is 135/2 (two spec problems). Real-user QA found 4 FAIL, 11 CONCERN, 8 OBSERVATION; 13 of the 23 R2 functional gaps are fixed and re-proven (3 more half-fixed), the rest carried over.
**Concerns/Blockers:** None blocking. The headline risks are the blank LinkedIn cards when an embed is blocked and that the QA-green state exists only in the uncommitted working tree. All measurements are Chromium; other agents' dev servers were already loading the machine.
