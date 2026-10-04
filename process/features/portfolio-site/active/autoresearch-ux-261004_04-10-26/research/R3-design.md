---
name: report:autoresearch-ux-r3-design
description: "Iteration 3, lane A (design skeptic): independent screenshot and motion audit of home, /about, /work and 9 case studies at 1440 and 390 against the round-6 design SPEC (M1-M4), with R2 gap status and new gaps."
date: 04-10-26
metadata:
  node_type: memory
  type: report
  feature: portfolio-site
  phase: autoresearch-ux
---

# R3 design audit (iteration 3, lane A)

Read-only on source. HEAD `5c1a6e6`, dev server `localhost:3003`, one headless Chromium, run in sequence. Everything below was measured or photographed in this run, not taken from the fixers' reports. Machine load average was 20 to 60 during the shots (another lane runs tests), so timings are indicative; frame counts during the lift runs were still 55 to 61 fps. Screenshot root: `research/R3-shots/` (`R3-shots/` below). Repro scripts: `R3-shots/scripts/`.

## Totals

- **Site average 7.7 / 10** (R2: 6.9). Group view: home 7.7 (R2 7.3), /about 7.5 (6.8), /work 6.5 (6.3), case studies 7.8 (7.0).
- **R2 gaps (21): 9 fixed, 5 partial, 7 open.** Still FAIL: LinkedIn cookie walls (R2-D5), /work empty tint and hidden h1 (R2-D11, partial).
- **New gaps: 10 (0 FAIL, 4 CONCERN, 6 OBSERVATION).**
- **Must-haves: M1 PASS. M2 PASS (desktop and mobile). M3 PASS on the number, weak on feel. M4 NOT YET** (two carry-over FAILs plus radius and contact-block leaks).
- Zero page errors on all 12 pages at both sizes. Only console noise: 3x `requestStorageAccess` per home load (LinkedIn iframes). Home height 15,726 px at 1440 (limit 16,000), 16,027 at 390. Dark full-width sections: 0 everywhere. Horizontal scroll: none. Canvas count: 1 at the globe, 0 when away (2D canvas, no WebGL).

## Per-page scores (1 to 10)

| Page | Layout | Type | Colour | Motion | Cohesion | Delight | Avg |
|---|---|---|---|---|---|---|---|
| Home (1440 + 390) | 8 | 8 | 8 | 7 | 7 | 8 | **7.7** |
| /about | 7 | 8 | 8 | 8 | 7 | 7 | **7.5** |
| /work | 5 | 7 | 8 | 6 | 7 | 6 | **6.5** |
| /work/lumicap | 8 | 8 | 8 | 7 | 8 | 7 | **7.7** |
| /work/cosap | 8 | 8 | 8 | 8 | 8 | 7 | **7.8** |
| /work/gocrypto | 8 | 8 | 8 | 9 | 8 | 9 | **8.3** |
| /work/pac | 8 | 8 | 8 | 7 | 8 | 6 | **7.5** |
| /work/zalo-game-center | 8 | 8 | 8 | 8 | 8 | 7 | **7.8** |
| /work/reorc-data-platform | 8 | 8 | 8 | 8 | 8 | 7 | **7.8** |
| /work/cortex-sentinel | 8 | 8 | 8 | 8 | 8 | 8 | **8.0** |
| /work/guardline | 8 | 8 | 8 | 8 | 8 | 7 | **7.8** |
| /work/ledgr | 8 | 8 | 8 | 7 | 8 | 7 | **7.7** |
| **Mean** | 7.7 | 7.9 | 8.0 | 7.6 | 7.8 | 7.2 | **7.7** |

Why the lows: /work layout 5 = every card is 40 to 50 % blank pastel and the page has no visible heading. /work motion 6 = filter swaps instantly, no sliding thumb. Home motion 7 = persona reorder blanks the stack and slides a card in from 730 px away, hero reveal is not eased. Delight 6 on PAC = text-only case with one interactive. Case studies are the strongest surface: tinted hero, sticky TOC with sliding pill, restrained blocks, zero errors.

## Must-haves

| # | Verdict | Evidence |
|---|---|---|
| M1 stamp per card top edge | **PASS** | 9 of 9 stack cards have exactly one `[data-testid=card-stamp]`, centre +8 px below the card top (box top -28 desktop, -20 mobile), right gap 20 px mobile. Words true per project: SHIPPED x5, STRATEGY (GoCrypto), 2ND PLACE (Cortex), HACKATHON (Guardline), LIVE DEMO (Ledgr). Landing timeline (`motion/home.json` `stampTimeline`): scale 1.39 to 0.94 undershoot to 1.0, rotate -13.8 to -8, settle 292 ms (spec ~260), halo blooms, never replays after scrolling back. Reduced motion: all `landed=true`, no transform animation. Ledgr is now a light card and its stamp is readable (`R3-shots/home-d-13.jpg`). Missing: the 2 px card nudge on contact (card top constant after landing). |
| M2 seamless side nav | **PASS** | `motion/seam.png`: one canvas `#F7F7F7` from the globe card down through the heading, persona control and TOC, no band edge. Emoji on all 9 items. Active pill is one shared element sliding through 9 distinct positions (153 to 193 px) on one scroll step; emoji pops to 1.18 and back. Mobile chip rail (previously failing): `scrollLeft` follows the active chip, active chip centred within 1 px on 5 of 9 cards (the first two and last two sit at the rail's scroll limits), white sliding pill present, tapping chip 6 lands its card 28 px below the rail. |
| M3 lift and pop | **PASS (number), weak (feel)** | Top edge rises exactly **11.5 px** on home stack (908 and 812 px tall), highlight tile (296), people card (393), /work cards (742, three measured) and case "next project" (742). Row variant 2.0 px. Hover scale 1.014, press `matrix(0.985,0,0,0.985,0,-4)`, release returns 0.00 px, touch tap leaves 0 cards in a non-rest state, keyboard Tab inside a card lifts it, reduced motion: transform none, shadow only. Weak point: overshoot 0.0 to 0.6 px (0 to 5 %), time to 90 % about 270 ms. See GAP-I3-D5/R2-D9. |
| M4 consistent and calm | **NOT YET** | Same LiftCard everywhere and no black cards on /work or home stack is a big step. Still leaking: LinkedIn cookie-wall iframes, duplicate contact blocks, 20/18/6 px radii, nav ghost text, /work blank tint. |

## R2 gap status

| R2 gap | Status | Evidence now | Remaining exact fix |
|---|---|---|---|
| D1 case-study runtime error | **FIXED** | 0 `pageerror` on 9 case pages x 2 sizes (`steps-log.json` errors list only `requestStorageAccess`) | none |
| D2 lift 15.7 to 23.4 px | **FIXED** | 11.5 px on 8 surfaces (above) | none |
| D3 nav glass collides with text | **PARTIAL** | computed `bg rgba(255,255,255,0.72)`, `backdrop-filter url(#..) blur(24px) saturate(1.6)`. Blur works, but 80 px headings stay readable at ~30 % under the labels: "ambiguous business", "Where the money already is", "Cross-check / Where the real errors hide" (`sheets/nav-glass-sheet.png`) | `app/globals.css:325` `rgba(255,255,255,0.72)` to `rgba(255,255,255,0.86)`; `site-nav.tsx` LiquidGlass `blur={24}` to `blur={32}` |
| D4 mobile chip rail | **FIXED** | see M2 | none |
| D5 LinkedIn cookie walls | **OPEN (FAIL)** | `home-d-17.jpg`, `sheets/home-d-sheet4.jpg` shot 2, `home-m-sheet3`: three "LinkedIn respects your privacy / Accept / Reject" banners cover a third of each card; 3x `requestStorageAccess: Permission denied` per load; radius still `rounded-[20px]` (`linkedin-posts.tsx:59`). HANDBACK says kept as-is by instruction | Needs Thao's call (R2 Q1). If static: `linkedin-posts.tsx` drop the `<iframe>` block, keep the preview markup as final state, wrap in `LiftCard radius="rounded-lg"`, replace `ring-1 ring-black/5` with `shadow-1` |
| D6 ReOrc empty chart | **FIXED** | `[data-testid=module-ring]` 14 children, min opacity 1, height 385 px after scroll-in (`motion/reorc-map.jpg`) | none |
| D7 Ledgr stamp invisible | **FIXED** | Ledgr stack card is white now; stamp ink reads | none |
| D8 persona cards fly | **OPEN** | worse described than R2: see GAP-I3-D1 | see GAP-I3-D1 |
| D9 lift spring feel | **PARTIAL** | `springs.ts` lift now 150/16, measured overshoot 0.0 to 0.6 px | see GAP-I3-D5 |
| D10 ad hoc lift in work-card | **FIXED** | `work-card.tsx` has no `group-hover:-translate-y-*` left | none |
| D11 /work heading, slabs, empty tint | **PARTIAL (FAIL)** | slabs fixed (all pastel now). h1 still `sr-only` 1 px (`work/page.tsx:19`). Gap between subtitle and device: **231 to 368 px on all 9 cards** (lumicap 368, ledgr 368, cosap 348, cortex 344, pac 302, zalo 302, guardline 278, reorc 263, gocrypto 231) of a 742 px card, i.e. 31 to 50 %; first two viewports of /work are ~45 % blank tint (`sheets/work-d-sheet0.jpg`) | `work-card.tsx:40` `xl:min-h-[742px]` to `xl:min-h-[580px]` and `min-h-[560px]` to `min-h-[480px]`; `work/page.tsx:19` replace sr-only h1 with `<h1 className="mx-auto mb-8 text-center text-[32px] md:text-[46px]">Selected work</h1>` |
| D12 Say hello dotted track overrun | **OPEN** | measured card right 1080, track right 1040, svg right **1144** (64 px past the card, 104 px past the track) (`motion/home.json` coin.overrun); mobile identical (`home-m-sheet3`) | `home/say-hello.tsx:51` remove `width="100%" height="4"` and add `w-[calc(100%-176px)] md:w-[calc(100%-208px)]` (the `inset-x-*` classes are ignored on a replaced element with an explicit width) |
| D13 duplicate contact, doodle | **PARTIAL** | doodle gone, no 2nd canvas. Home still ends with Say hello card, ~150 px of blank, then icons + "Want to get in touch? Drop me a line." + email pill (`home-d-18/19`: ~1.5 viewports of contact on a 15.7k page) | `site-footer.tsx`: on `/` render only icons + colophon (hide the heading and email pill) since Say hello already offers Email and LinkedIn |
| D14 radius scale | **OPEN** | computed counts: home 20 px x12, 18 px x3, 6 px x3; /about 20 px x6; case pages 20/18/6 px on device frames | `photo-moments.tsx:39`, `linkedin-posts.tsx:59`, `case-study-media.tsx:61`, `about/page.tsx:58,156,171,189` `rounded-[20px]` to `rounded-2xl`; `case-study/screen-frame.tsx:67` `rounded-[18px]` to `rounded-2xl`; `device-mockup.tsx:64`, `screen-frame.tsx:57` `rounded-[6px]` to `rounded-sm`; bespoke `shadow-[0_30px_70px...]` to `shadow-3` |
| D15 career shown 3 times | **OPEN** | "Earlier experience" grid (Chợ Tốt, MoMo, Creatio) still follows Experience; rail card for MoMo is title plus chip only (`about-d-sheet0` shot 4, `about.json` cards) | `app/about/page.tsx` delete the "Earlier experience" section; add a one-line outcome to rail cards in `signature/ledger/ledger-data.ts` |
| D16 stamp ink faint | **OPEN** | `card-stamp.tsx` still `-1.6 1.3` matrix and sub-label `fontSize="7.5"`; sub-label unreadable at 1x | `card-stamp.tsx` feColorMatrix last row `0 0 0 -1.2 1.25`, sub `fontSize` 7.5 to 9 |
| D17 ticker speed and size | **PARTIAL** | item text 13 px (fixed); idle speed still **42.4 px/s** (spec 28); status chips 11 px (28 nodes under 12 px) | `proof-ticker.tsx` `ticker-scroll_70s` to `ticker-scroll_105s`; lines 17-18 `text-[11px]` to `text-[12px]` |
| D18 globe too faint | **OPEN** | idle rotation works (two frames 2 s apart differ), hover row rotates and thickens the arc, drag has inertia, 61 fps; continents still do not read (`sheets/globe-seq.jpg`) | `signature/globe/globe-canvas.tsx:~192` light alpha `0.18 + p.z * 0.4` to `0.32 + p.z * 0.5`, `fillRect(p.x - 1, p.y - 1, 2, 2)` to `(p.x - 1.25, p.y - 1.25, 2.5, 2.5)` |
| D19 stamp motion | **FIXED** | settle 292 ms, undershoot 0.94 | card nudge still absent (observation only) |
| D20 canvas count | **FIXED** | 1 at globe, 0 away | none |
| D21 unexercised | **CLOSED** | now driven: touch lift (0 stuck), reduced motion (lift, stamp, ticker, canvas), keyboard (Tab order, 2 px accent ring everywhere), persona arrow keys (Everything to Recruiter), career rail drag, mobile menu (inert behind sheet true, restored false), case TOC click and pill slide (15 distinct positions), work filter | none |

## Motion measurements (1440x900 unless noted)

| Item | Result |
|---|---|
| Glass nav | pill 849x64, radius 32, bg 0.72, blur 24 saturate 1.6. Compact on scroll (scale 0.94, y -6). Hover indicator slides 328 to 304 px, no jump. Mobile menu: white sheet, scrim, close button, page `inert` while open |
| Persona | 4 options reorder correctly, note fades in, TOC reorders ("In your order"), arrow keys work, mobile tap works. Travel during change: first card top moves 670 to 700 px, others 3,800 to 5,500 px (offscreen). First click scrolls the page -680 px |
| Ticker | idle -42.4 px/s, hover 0, resumes 41.7. Items are buttons; click scrolls to the matching card (+20% ReOrc landed on `reorc-data-platform`). Duplicate set is `aria-hidden` and `tabindex=-1` |
| Globe | 2D canvas, 61 fps, 1 canvas, disposed when away. Rows: 3, hover rotates globe, 12 px highlight arc |
| Coin | 40 px nudge follows 38 px and springs back to 0; 230 px drag follows 228 and returns (under the 85 % rule); full drag settles in the wallet with one 10 px bounce in ~600 ms and shows Email / LinkedIn; Enter on the focused coin settles |
| Career rail (/about) | 40 px nudge: follows 40 px 1:1, snaps back to the same card. 230 px drag: follows 230, lands on card 3 centred (offset 0), settle ~0.8 s. Flick 260 and 420 px land on card 3 and the end. Arrow buttons step one card, marker follows (424 to 715 px) |
| Case TOC | 7 rows, click row 4 scrolls 3,959 px and activates "The decision"; sliding pill 15 distinct positions over 1 s |
| Reduced motion | lift: transform none, shadow only. Stamps at rest. Ticker static and scrollable. 0 canvases |

---

## New gaps

### CONCERN

**GAP-I3-D1 | CONCERN | home persona reorder (desktop) | stack goes blank, a card slides in from 730 px away, heading ends under the nav**
Evidence: `sheets/persona-seq.jpg` (60 ms: only TOC visible and an empty stack column; 240 ms: first card at x 905 sliding left; 380 ms settled), `motion/home.json` persona (first card top 974 to 1645 to 974 over 380 ms; Founder click also scrolls the page -680 px through scroll anchoring), final frame has "Selected work" at y 48, i.e. printed behind the nav pill. Nothing in `project-stack.tsx` scrolls to the stack.
Fix: `src/components/site/project-stack.tsx`: on the card wrapper change `layout={reduce ? false : "position"}` to `layout={false}`; wrap `{ordered.map(...)}` in `<motion.div key={persona ?? "all"} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col gap-10 md:gap-[56px]">`; change the control to `onChange={(p) => { setPersona(p); document.getElementById("work-title")?.scrollIntoView({ block: "start" }); }}` (`globals.css:158` `scroll-padding-top: 6rem` keeps the heading clear of the nav).

**GAP-I3-D2 | CONCERN | /work filter | swaps instantly, no sliding thumb, no glide**
Evidence: `motion/misc2.json` `workFilterFine`: 9 cards then 3 cards between two frames (121 ms), every card opacity 1.00 the whole time, no position tween. `work-grid.tsx:60-66` selected chip is a plain `bg-bg shadow-2` swap. Spec 5.12: sliding glass thumb (spring `indicator`) and cards reflowing with spring `sheet`, leavers fade 200 ms.
Fix: `src/components/site/work-grid.tsx`: inside the chip button add `{selected ? <motion.span layoutId="work-filter-thumb" transition={SPRING.indicator} className="absolute inset-0 -z-10 rounded-full bg-bg shadow-2" /> : null}` (button gets `relative`, drop `bg-bg shadow-2` from the selected class); wrap the `<ul>` in `<LayoutGroup>` and `<AnimatePresence mode="popLayout">`, render each card as `<motion.li layout="position" transition={SPRING.sheet} exit={{ opacity: 0, transition: { duration: 0.2 } }}>` around the existing Reveal.

**GAP-I3-D3 | CONCERN | hero cursor reveal | mask is glued to the pointer, no easing**
Evidence: `motion/misc.json` heroReveal: mask centre `radial-gradient(140px at 200px 132px` jumps to the new pointer x in one frame (200 to 900 inside 123 ms, no intermediate values). Spec 5.2: spring `glide`, mask trails the pointer.
Fix: `src/components/gems/cursor-reveal.tsx` `move()`: store the target in a ref and run one `requestAnimationFrame` loop that sets `--rx/--ry` to `cur += (target - cur) * 0.16` until within 0.5 px; cancel it on `pointerleave` and when `reduce`. (0.16 per frame is about `SPRING.glide` 120/26.)

**GAP-I3-D4 | CONCERN | mobile touch targets under 44 px**
Evidence: `motion/misc2.json` mobileTargets at 390: "psst — the casual version" 216x21, ticker buttons 33 px high (x14), "Credential" links 25 px, "Follow on LinkedIn" 26 px, "View on LinkedIn" 25 px. (The chip rail, persona buttons and menu are 44 px.)
Fix: `gems/cursor-reveal.tsx` toggle `className` add `inline-flex min-h-11 items-center`; `home/proof-ticker.tsx` button `py-1` to `py-2.5`; `highlights-grid.tsx:127` and `linkedin-posts.tsx:197,228` wrap link text in `inline-flex min-h-11 items-center`.

### OBSERVATION

**GAP-I3-D5 | OBSERVATION | M3 spring has no visible overshoot** (supersedes R2-D9). Measured peak minus final 0.0 to 0.6 px on an 11.5 px lift (`motion/lift.json`, `lift2.json`), time to 90 % ~270 ms. Spec says one small visible overshoot, 350 to 600 ms. Fix: `components/motion/springs.ts:21` `lift` to `{ stiffness: 170, damping: 13, mass: 1 }` (zeta 0.50, ~16 % overshoot, ~1.8 px, settles ~0.6 s).

**GAP-I3-D6 | OBSERVATION | dark "2nd place" highlight is a full-width black slab on mobile** (about 350x290 px, `home-m-sheet0` shot 3). Budget is no dark slabs. Fix: `highlights-grid.tsx:77` swap `bg-ink-1 ... text-bg` for `bg-bg shadow-1 text-ink-1` below `md:` (keep the black tile from `md:` up) or make it the one navy-ink tile on both sizes.

**GAP-I3-D7 | OBSERVATION | not every card uses the shared lift** (M3 says every card). Static or CSS-only: photo moments (`photo-moments.tsx:39`), LinkedIn cards, /about rail cards (`career-rail.tsx` article `hover:shadow-card-hover` only), education/cert/award cards, Say hello card. Fix: wrap those in `LiftCard` (`radius="rounded-lg"`); rail cards use `variant="row"`.

**GAP-I3-D8 | OBSERVATION | video loops show an empty white card on fast scroll-in.** `case-ledgr-d-06.jpg`, `case-lumicap-d-02/03.jpg`: card blank (Lumicap shows a spinner) at +650 ms; the same video is playing at +3 s (`motion/video-ledgr.jpg`, readyState 4). Fix: `dataviz/video-loop.tsx:41` `preload="none"` to `preload="metadata"` so the poster paints at once.

**GAP-I3-D9 | OBSERVATION | case TOC row uses an ad hoc CSS hover** `group-hover:translate-x-[5px] duration-200 ease-out` (`case-study/toc.tsx:194`), outside the spring tokens. Fix: drop it, keep colour change only, or use `SPRING.ui` via `whileHover={{ x: 4 }}`.

**GAP-I3-D10 | OBSERVATION | polish pair.** (a) /about rail hard-crops the next card at the container edge (x ~1367) with no fade (`about-d-sheet0` shot 2): `career-rail.tsx` `<ol>` add `md:[mask-image:linear-gradient(to_right,#000_94%,transparent)]`. (b) Globe card list is top-aligned and leaves ~120 px blank under it (`seam.png`): `home/globe-card.tsx` list wrapper add `md:self-center`.

---

## Priority order for the fixer

1. D5 LinkedIn (needs Thao's decision) and R2-D11 / `work-card.tsx` min-heights plus visible h1: the two remaining FAILs.
2. GAP-I3-D1 persona, R2-D3 nav fill: both visible on the first thing a visitor touches.
3. R2-D12 Say hello track, R2-D13 duplicate contact: home ends cleaner.
4. GAP-I3-D2, D3, D5: the "iOS-smooth" feel items.
5. Radius leaks (R2-D14), career duplicate (R2-D15), stamp ink (R2-D16), ticker speed (R2-D17), globe dots (R2-D18).

## Evidence index (`R3-shots/`)

- Every viewport, 1440 (`*-d-NN.jpg`) and 390 (`*-m-NN.jpg`) for `home`, `about`, `work`, `case-<slug>` x9: 357 files. Contact sheets in `sheets/` (`home-d-sheet0..4`, `home-m-sheet0..3`, `about-*`, `work-*`, `case-<slug>-{d,m}-overview.jpg`, `nav-glass-sheet.png`, `persona-seq.jpg`, `globe-seq.jpg`, `m-menu.jpg`, `check-a.jpg`).
- Motion data: `motion/lift.json`, `lift2.json` (hover rise, overshoot, press), `shell.json` (glass, menu), `home.json` (stamps, TOC, persona, ticker, globe, coin, mobile rail), `home2.json` (coin, ticker click, emoji pop, ReOrc map, embeds), `misc.json` and `misc2.json` (hero reveal, filter, case TOC, keyboard, reduced motion, touch targets), `about.json` (career rail drag), `audit.json` (radii, shadows, dark bands, small text), `steps-log.json` (page heights, canvas, console errors), `content-coverage.json` (blank-viewport heuristic).
- Frames: `motion/lift-*-hover.jpg`, `nav-under-text-*.png`, `persona-frame-*.jpg`, `globe-*.png`, `coin-settled.jpg`, `reorc-map.jpg`, `m-rail.jpg`, `m-persona.jpg`, `rail-*.jpg`, `toc-active.jpg`, `stamp-landed.jpg`.
- Scripts: `scripts/steps.mjs`, `lift.mjs`, `lift2.mjs`, `shell.mjs`, `home.mjs`, `home2.mjs`, `misc.mjs`, `misc2.mjs`, `about.mjs`, `audit.mjs`, `small.mjs`, `video.mjs`, `mp.mjs`, `tk.mjs`, `sheet.sh` (need Playwright resolved from `duma/node_modules`).

## Unresolved questions

1. LinkedIn: keep live iframes (cookie wall accepted) or go static cards? Everything else on the page now meets the spec; this is the one visible third-party blemish.
2. /work: should the cards keep a 742 px poster height at xl for the "wall of posters" look, or tighten to ~580 px? The blank tint is what makes /work read as unfinished.
3. Touch (390 `hasTouch`) was driven for lift, persona tap, chip tap and the menu; real iOS Safari behaviour of the url() backdrop-filter nav glass was not testable here (headless Chromium only).
4. A first mobile persona tap issued 800 ms after load once left the order unchanged (`misc2.json` mobilePersonaTap); a second run with a longer wait worked (`mp.mjs`). Likely a tap before hydration under load, not reproduced.

**Status:** DONE
**Summary:** Site averages 7.7/10 (R2 6.9). Of 21 R2 gaps, 9 are fixed, 5 partial, 7 open; 10 new gaps (0 FAIL, 4 CONCERN, 6 OBSERVATION). M1 and M2 pass, M3 passes on the measured 11.5 px lift but has no visible overshoot, M4 is held back by the LinkedIn cookie walls and the blank-tint /work cards.
**Concerns/Blockers:** Timings were taken under machine load of 20 to 60; Safari and real iOS glass rendering not testable; LinkedIn iframe decision needs Thao.
