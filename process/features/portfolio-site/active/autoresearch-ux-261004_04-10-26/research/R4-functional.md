---
name: report:r4-functional
description: "Iteration 4, lane B (functional QA) of the ux autoresearch loop: repo gates at HEAD c7bbea7 (clean export), independent real-user QA of home, /about, /work and 9 case studies at 1440 and 390, re-check of every R3 gap."
date: 04-10-26
metadata:
  node_type: memory
  type: report
  feature: portfolio-site
  phase: autoresearch-ux-iteration-4
---

# R4 functional QA (iteration 4, lane B)

**TL;DR:** The big R3 defects are fixed and re-proven: LinkedIn cards are now our own static cards (0 requests to linkedin.com, 0 iframes, nothing goes blank when linkedin is blocked), persona reorder no longer flings cards, ticker has a touch pause, say-hello track stays inside its card, /work has a visible h1 and a sliding filter thumb, career rail shows each role once, /lab/* is 404 in the production build. Gates at HEAD: typecheck, lint, 226 unit, build:cf pass; **e2e is 137 pass / 2 fail**: one is a stale spec (strict-mode `locator("header")` now matches the LinkedIn cards' `<header>`), one is a load-dependent flake (pac TOC label, passes 3/3 at low load). Still open: nav pill lets text ghost through its top edge at 1440, LinkedIn card images are cropped (post 2's headline is cut), 14 mobile tap targets under 44 px (timeline stops 16x16, stacked-bar segments 3 to 21 px wide, one checkbox), logo marquee focus lands off-screen, a few radius leaks. Totals: **1 FAIL, 4 CONCERN, 6 OBSERVATION**.

## Tree tested

- HEAD `c7bbea7`, exported with `git archive` into a clean copy (private `node_modules` clone) so the **7 uncommitted files in the working tree cannot influence any result**. They are: `signature/characters/{character,community-cursors,women-in-tech-wall}.tsx`, `signature/glass/story-chapter.tsx`, `signature/ledger/{approved-stamp,career-receipt,transaction-stream}.tsx` (hook swap to `@/lib/use-reduced-motion`; story-chapter `<header>` to `<div>` plus `ink-inherit`). All seven are mounted only by `/lab/*` demo pages, which 404 in production, so they are hygiene debt, not a ship risk. R3's `emitStamp` addition and `src/components/story/` are gone from HEAD and the tree.
- Production build (own server on a free port, private seeded DB, Chromium only). Server stopped, build dir removed. The repo working tree is unchanged by me (`git diff --stat` still the same 7 files, `tsconfig.json` clean). Artifacts: `test-results/r4/{logs,out,shots,harness,e2e-out,rerun-out}` (r1 to r3 untouched; e2e run used `--output=test-results/r4/e2e-out`).
- Load: `uptime` at start 12.3 / 11.1 / 9.7 (10 cores, other agents' `next dev` servers and a worktree run already on the box). My e2e (4 workers) drove it to 62; sweeps ran two Chromium streams at load 14 to 28. Gate timings below are inflated accordingly.

## Repo gates at HEAD

| Gate | Result | Load at start |
|---|---|---|
| `pnpm typecheck` (app + tests) | PASS, 25 s | 9.9 |
| `pnpm lint` | PASS, 0 problems, 21 s | 9.5 |
| `pnpm test` (bun unit) | PASS, **226 pass / 0 fail**, 31 files | 14.1 |
| `pnpm test:e2e:isolated` (`--workers=4`) | **FAIL, 137 pass / 2 fail**, 7.4 min | 14.1, peak 62 |
| `pnpm build:cf` | PASS, 54 s (one wrangler compat-date 2025-04-01 WARN only) | 33 |
| `/lab/*` in the prod build | PASS: `/lab`, `/lab/{characters,glass,globe,ledger,objects3d,participate}` and `/nope` all 404; `/api/health` 200 | n/a |

E2E failures, each at its code path:

1. `tests/e2e/motion-shell.spec.ts:22` "glass nav stays visible on scroll..." : `page.locator("header")` hit a strict-mode violation, 4 elements. The new `CardPost` in `linkedin-posts.tsx` renders `<header className="flex items-center gap-3">` per card (3 of them) beside the nav `<header>`. Deterministic (re-ran alone: fails again). Spec problem, introduced by c7bbea7. = GAP-I4-F1.
2. `tests/e2e/case-studies.spec.ts:150` pac "TOC labels past the TOC box" (`"What I owned"`). Re-ran the same spec 3 times at load 8: 3/3 pass. The spec parks a heading, waits a fixed 250 ms, then measures label right edges while the TOC items are still sliding in; under load 60 the slide had not finished. = GAP-I4-F2.

## Method

Own harness (copied to `test-results/r4/harness/`): per page x viewport x {scroll walk with detectors, real-Tab keyboard walk, interact every control, reduced-motion walk}, 12 pages x 2 viewports x 4 modes = 96 runs, 0 crashes. Plus probes: LinkedIn (incl. blocked-network variant), persona (per-frame sampler, both viewports, reduced), ticker (mouse, keyboard, touch), say-hello (tap, Enter, Space, slow and fast mouse and touch drags, vertical swipe starting on the coin), /work filter, career rail, shell (menu, skip link, radii, contact blocks). 1440x900 desktop; 390x844 Pixel 7 UA with touch, DPR 2. Pages: `/`, `/about`, `/work`, 9 case studies.

Harness caveats (not product gaps, not counted): the keyboard walk's "dup/trap" flags are wrap-arounds back to the header (and ledgr's five unlabelled inputs share one description); I verified ledgr with real Tab: select, number, select, 4 ranges, checkbox, Reset, then onward through the page and footer, no trap. "No reaction" interact entries for stacked-bar segments, zoom buttons and timeline stops are fingerprint limits (state lives outside the button's box). Interact timeouts on `/` are the moving ticker items.

## Gap list

Format: GAP-I4-F{n} | SEVERITY | page/element | evidence | file | fix

### FAIL

**GAP-I4-F1 | FAIL | repo gate, `motion-shell.spec.ts:11-22` | e2e is red because the spec's `locator("header")` is no longer unique**
- Evidence: `test-results/r4/logs/gate-e2e.log` (strict mode violation, 4 elements: the nav `<header data-compact>` plus 3 LinkedIn `CardPost` headers); reproduced alone against my server.
- File: `tests/e2e/motion-shell.spec.ts:22` (and any other bare `locator("header")`).
- Fix: scope to the nav, e.g. `page.locator("header[data-compact]")` or `page.getByRole("banner")` (the card headers sit inside `article`, so they are not banners).

### CONCERN

**GAP-I4-F2 | CONCERN | repo gate, `case-studies.spec.ts:129-150` | fixed 250 ms settle flakes under load**
- Evidence: pac failed once in the 4-worker run at load 60; 3/3 pass at load 8. Ledgr (R3's failing case) now passes.
- File: `tests/e2e/case-studies.spec.ts:129-150`.
- Fix: after `data-shown="true"`, `await expect.poll(...)` on the label right-edge check instead of one measurement after a fixed wait.

**GAP-I4-F3 | CONCERN | home "Notes on LinkedIn", 1440 and 390 | card images are cropped by `object-cover` into a fixed 4:3 box and lose content**
- Evidence: `shots/linkedin-d1440.jpg`, `shots/linkedin-m390.jpg`. Sources are 1000x1000 (vietnam-payments), 1000x562 (napas-simo), 1000x1334 (aabw): card 2's headline reads "SIDE VIETNAM'S / NK TRANSFER SYSTEM" (first and last letters cut), its NAPAS and SIMO labels are cut at the right edge ("Payment exe", "Shared risk inf"); card 1's diagram loses its top and bottom rows; card 3 is a 3:4 portrait cut to 4:3.
- File: `src/components/site/linkedin-posts.tsx` (`CardPost`, the `aspect-[4/3] ... object-cover` wrapper), assets in `public/linkedin/`.
- Fix: size the image box from each asset's own ratio (store `width/height` in `content/site.ts`) with `object-contain` on a tinted bg, or re-export the three assets at 4:3 with the title text inside the safe area.

**GAP-I4-F4 | CONCERN | nav pill, 1440 (R3 F5, still open) | text shows through the top of the pill**
- Evidence: `shots/guard-node-focus2.jpg` (Guardline at scrollY ~1800): "blocking anyone who shares a phone, hits families and renters and slows growth..." is readable behind "Thao Dao Highlights Work" at the top edge of the pill, a "near 1%, and a heavy hand is its own cost." line sits right at the lower rim. Computed: `.glass` bg `rgba(255,255,255,0.85)`, `backdrop-filter: url("#lg-Ridb") blur(24px) saturate(1.6)`. At 390 the pill uses plain `blur(24px) saturate(1.6)` (no url filter) and I saw no ghosting in the 390 scroll shots.
- File: `src/components/glass/liquid-glass.tsx` (refract path), `src/app/globals.css` (`.glass[data-tint=light]`).
- Fix: apply the displacement map only to a thin rim mask, or fall back to the frost variant for the main nav pill, or raise the fill to about 0.92.

**GAP-I4-F5 | CONCERN | tap targets under 44 px at 390 (R3 F11, partly fixed: 35 to 14 distinct) |**
- Evidence (`out/sweep-m390-*-scroll.json`, real controls only): Guardline timeline stops x6 and Lumicap x5 at 16x16; stacked-bar segments cortex "Block 7%" 14x56, gocrypto 21, 13 and 3 px wide x56 ("UAE: 4%" is 3 px); Ledgr checkbox 24x24. Fixed since R3: LinkedIn links, ticker items (44), about logo links, footer buttons, Start-with link, casual toggle, filter chips (44). Desktop-only items under 44 (ticker 33, persona 36, TOC rows 40) are fine for a mouse.
- File: `src/components/dataviz/scrub-timeline.tsx`, `src/components/dataviz/stacked-bar.tsx`, `src/components/case/ledgr/contract-check.tsx:76`.
- Fix: extend hit areas with a `::before` (inset -14px) on stops, give thin segments a 44 px min target via an overlay or make the legend toggles the primary control on touch; `size-6` to a 44 px label wrapper for the checkbox.

### OBSERVATION

- **GAP-I4-F6**: persona swap leaves 30 to 75 ms with no card in the viewport (3 frames at 1440, 5 to 6 at 390) between the old first card leaving and the new one starting at ~280 px below with opacity 0.55, then it glides in. Not the R3 6,000 px flight (that is fixed: `probe-persona2`, max visible glide 280 px, page scroll unchanged, order, TOC and reload persistence correct, reduced motion instant with no blank frame). Cross-fade the outgoing card instead of unmounting it first. File `src/components/site/project-stack.tsx`.
- **GAP-I4-F7**: ticker on touch: after the first tap pauses it, the "Paused, tap to resume" pill (190x44) covers the right half of the 390 strip, leaving one partly visible item (x -25 to 316, most of it under the pill). Works as designed (still while paused, resume restores it, a horizontal swipe does not pause) but a smaller pill or an icon-only 44 px button would hide less. Speed measured 29 px/s (spec 28). File `src/components/site/home/proof-ticker.tsx:100-112`.
- **GAP-I4-F8**: each LinkedIn card has two links to the same URL ("...more" and "View on LinkedIn"), so 6 tab stops for 3 posts. Keep one, or make "...more" the card's stretched link. File `linkedin-posts.tsx` (`CardPost`).
- **GAP-I4-F9**: at 1440 the home viewport right after the LinkedIn row is nearly empty (active content 0.029 at scroll step 20, `shots/home-d1440-s20-FLAG.jpg`) and the Say hello card carries ~110 px of empty space under the track. Visual lane to judge. Also "Notes on LinkedIn" row on desktop shows all 3 cards, so no arrows or scroll (fine).
- **GAP-I4-F10**: reduced motion: cosap `compare-row` badge "-83%" computes to opacity 0 at rest (the only hidden-text hit besides the mobile-only section menu button on desktop). Probably an interaction-reveal badge; not verified against the design. File `src/components/dataviz/compare-slider.tsx`.
- **GAP-I4-F11**: carried over, unchanged: logo marquee focus lands off-screen (`a:SkyLab Group` x=-190 on home 1440; R3 F17); Guardline svg nodes report `outline-style: none` while `:focus-visible` is true, the keys walk flagged 3 `g[explorable-svg-node]` as having no ring (R3 saw rings on every stop; ring may be drawn on a child, I could not confirm in a clean shot; R3 F19 hover feedback not re-tested); timeline stops still sit under the invisible full-width range input (`covered` in the interact walk for Guardline and Lumicap, 8 stops, and `input[timeline-range]` takes keyboard focus while invisible; R3 F21); nav "Work" is still `/#work` and is `aria-current` on `/work` (R3 F20); number-input oddities not re-tested (R3 F18); TOC icon pulse not re-tested (R3 F22).

## Re-check of R3 gaps (independent)

| R3 gap | Now | Evidence |
|---|---|---|
| F1 stale doodle spec keeps e2e red | **Fixed** | `gems.spec.ts` passes; doodle-pad, mascot, peel-sticker components no longer tracked |
| F2 ledgr TOC spec offset | **Fixed** (a different case now flakes under load, see F2 here) | ledgr passes in the 137; pac flake |
| F3 green depends on uncommitted files | **Fixed for what matters, hygiene debt remains** | gates run on a clean export of HEAD; lab guard and hook swap are in HEAD; only `case-study-media.tsx` still uses the raw hook among mounted files; 7 lab-only files still uncommitted |
| F4 blocked embeds leave blank cards | **Fixed** | no iframes; `probe-linkedin` blocked variant: 3 cards, 0 empty, 0 linkedin requests |
| F5 nav pill rim bleed | **Open** | F4 here |
| F6 say-hello track overruns card | **Fixed** | track 504 to 936 inside card 360 to 1080 (wallet 920 to 1016); e2e guard passes |
| F7 persona flings cards | **Fixed** (30 to 75 ms blank frames remain) | per-frame sampler; F6 here |
| F8 /work h1 and empty tint | **Fixed** | visible h1 "Selected work" 56 px, 62 px tall at top 155; cards 453x516 with media starting at 239 |
| F9 LinkedIn cookie wall, console error | **Fixed** | 0 embeds, 0 console errors, 0 page errors on every page both viewports |
| F10 two contact blocks | **Mitigated** | home still has headings "Say hello" and "Want to get in touch? Drop me a line." and 3 `mailto:` links, but Say hello now ends in "Where to reach me" to `#get-in-touch` (44 px) and is spec-tested; judge as design |
| F11 tap targets | **Partly fixed** | 35 to 14 distinct at 390, F5 here |
| F12 ticker touch pause | **Fixed** | tap pauses, resume visible and restores, still while paused; keyboard and hover pause pass |
| F13 off-scale radii | **Partly fixed** | home still shows 18 px x3, 20 px x2, 28.8 and 35.2 px once; case page 38.4 px x3 (scale 8/12/16/24); LinkedIn cards now 24 px |
| F14 /about career data 3x | **Fixed** | "Earlier experience" 0; MoMo 1, Creatio 1 (2 at 390: rail plus live region), Cho Tot 0 |
| F15 raw motion hook, four safe copies | **Open** | `case-study-media.tsx:4` raw; safe hook defined in `lib/use-reduced-motion.ts`, `signature/glass/use-reduced-motion.ts`, `objects3d/use-env.ts`, `participate/store.tsx`; 0 hydration or console messages across the 96 runs |
| F16 no guards for three R2 fixes | Not re-checked | home.spec covers the new home pieces and passes |
| F17 logo marquee focus off-screen | **Open** | F11 here |
| F18 number input oddities | Not re-tested | |
| F19 diagram node hover | Not re-tested (focus ring question in F11 here) | |
| F20 nav Work to `/#work` | **Open** | |
| F21 timeline stops under range input | **Open** | |
| F22 TOC pulse unproven | Not re-tested | |
| F23 linkedin.com the only third party | **Fixed** | `hosts` is only the origin on every page both viewports; 0 failed or 4xx/5xx requests |

## What passed (no gap)

- All 12 pages x 2 viewports: no horizontal scroll at any step (max overflow 0), no uncaught page error, no console error or warning, no 4xx/5xx, no failed request, one `h1` and one `main`, canvas count max 1 (home only; 0 elsewhere and 0 under reduced motion), no overlapping text boxes detected, one empty-ish step in 96 (F9).
- LinkedIn: 3 static cards, all links `target=_blank rel="noopener noreferrer"`, all 44 px tall, avatars and images load, radii 24 px; carousel at 1440 fits all 3 (no arrows needed), at 390 swipe scrolls it (336 px) and a vertical swipe over a card scrolls the page (225 px).
- Persona: all four options reorder cards and TOC, note text per persona, arrow keys move the radio, choice persists across reload without hydration warning, reduced motion reorders instantly.
- Ticker: runs, hover and keyboard focus pause (and stay put), click jumps to the project (5,847 px smooth scroll), reduced motion shows a scrollable static row.
- Say hello: tap, Enter, Space send; "Send another" resets (44 px); slow 2 px-step mouse drag and touch drag past 40% spring back, full drags send; drag off the track springs back to 0,0; vertical swipe on the coin scrolls the page and does not send; coin 56x56; no page errors; reduced motion passes every step.
- /work: 6 chips (44 px), counts 9/3/1/2/1/2, `aria-pressed` single, live region announces "Showing N projects", sliding thumb lands on the pressed chip each time (desktop and 390), keyboard Tab + Space filters, no empty state, no overflow.
- Career rail (1440): 6 cards, prev/next 44 px with correct disabled ends (0, 230, 530, 830, 1060), mouse drag 530 and releases without a click-through, wheel moves it 300; at 390 it is a vertical list with no horizontal scroll.
- Shell: skip link first Tab stop (visible at 12,12), mobile menu button 56x56, menu sets `main` inert, Tab cycles links then "Close menu", Escape closes and returns focus to "Open menu".
- Keyboard: no focus trap on any page, rings on every stop except the F11 note; mobile focus on stacked-bar segments is visible (outline 2 px).
- Hydration and runtime: 0 page errors and 0 console messages in all 96 runs, including reduced motion.

## Totals

| Severity | Count |
|---|---|
| FAIL | 1 (F1) |
| CONCERN | 4 (F2 to F5) |
| OBSERVATION | 6 (F6 to F11) |

R3 re-check: 23 gaps: 12 fixed, 3 mostly fixed / mitigated, 4 open, 4 not re-tested.

## Unresolved questions

- Is the Guardline svg-node focus ring actually drawn (child element) or missing? Needs a screenshot of a focused node; mine did not land on it.
- Should cosap's "-83%" badge be visible at rest in reduced motion?
- Was the `<header>` inside `CardPost` intended (an `article` header is valid HTML), i.e. is the right fix the spec rather than the markup? I assumed the spec.

**Status:** DONE_WITH_CONCERNS
**Summary:** Gates at HEAD c7bbea7 are typecheck/lint/226 unit/build:cf green and e2e 137/2 (one stale spec, one load flake); independent QA of 12 pages at 1440 and 390 found no page or console errors and no LinkedIn requests, confirms most R3 defects fixed, and files 1 FAIL, 4 CONCERN, 6 OBSERVATION.
**Concerns/Blockers:** e2e gate is red until `motion-shell.spec.ts` scopes its header locator; nav pill ghosting, cropped LinkedIn images and 14 sub-44 px mobile targets remain; 7 lab-only files are still uncommitted (not a ship risk).
