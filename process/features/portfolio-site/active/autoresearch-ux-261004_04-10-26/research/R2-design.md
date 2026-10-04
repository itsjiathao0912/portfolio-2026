---
name: report:autoresearch-ux-r2-design
description: "Iteration 2, lane A (design skeptic): independent screenshot and motion audit of home, /about, /work and 9 case studies at 1440 and 390 against the round-6 design SPEC (M1-M4, QA checklist)."
date: 04-10-26
metadata:
  node_type: memory
  type: report
  feature: portfolio-site
  phase: autoresearch-ux
---

# R2 design audit (iteration 2, lane A)

Read-only on source. HEAD `470bf4d`, dev server `localhost:3003`, one Chromium. Everything below was measured or photographed in this run, not taken from the fixers' reports. Screenshot root: `research/R2-shots/` (`R2-shots/` below). Repro scripts: `R2-shots/scripts/`.

## BLUF

- Visual base is calm and mostly on-brand: white and grey canvas, black type, navy stamps, no gradient bands, home height 15,921 px (limit 16,000), 0 full-width dark sections, canvas WebGL count 1 and disposed when away.
- **7 FAIL, 9 CONCERN, 5 OBSERVATION.** The expensive ones: M3 lift is not 10-14 px (measured -23.4 / -21.3 / -15.7), the nav glass lets text show through and collide with its labels, every case study throws a runtime error, LinkedIn still renders cookie walls, one chart is an empty box, the Ledgr stamp is invisible, the mobile chip rail never follows the active card.
- M1 stamps: pass except Ledgr. M2 side nav: pass on desktop (seamless, emoji, sliding pill), fails on mobile rail. M3: fails the measured number. M4: not yet, because of the 7 FAILs.

## Totals

| Page | Layout | Type | Colour | Motion | Cohesion | Delight | Avg |
|---|---|---|---|---|---|---|---|
| Home (1440 + 390) | 8 | 8 | 8 | 7 | 6 | 7 | **7.3** |
| /about | 7 | 8 | 8 | 6 | 7 | 5 | **6.8** |
| /work | 6 | 7 | 6 | 7 | 6 | 6 | **6.3** |
| Case studies (9, worst: reorc, cortex) | 8 | 8 | 8 | 5 | 7 | 6 | **7.0** |
| **Site average** | 7.3 | 7.8 | 7.5 | 6.3 | 6.5 | 6.0 | **6.9** |

Why the lows: Motion 5 on case studies = runtime error on every one plus a blank chart. Cohesion 6 on home and /work = nav text collisions, third-party cookie wall, duplicate contact blocks, black slabs on /work. Delight 5 on /about = the career data appears three times and the rail is sparse.

## Must-haves

| # | Verdict | Evidence |
|---|---|---|
| M1 stamp per card, stamp-down motion | PASS, one FAIL (Ledgr dark card) | All 9 `[data-testid=card-stamp]` sit at card top -28 px (spec -28, tolerance 32). Landing timeline (`R2-shots/scripts/stamp.mjs`): fires when card top is at 60-70% vh; scale 1.4 -> 0.94 (undershoot) -> 1.01 -> 1, rotate -14 -> -7.1 -> -8, opacity 0 -> 1 in ~150 ms; whole settle ~650 ms (spec ~260). Halo blooms to 0.098 alpha. Does not replay (landed flag stays). Card nudge (spec 2 px) not implemented: card top constant at 495 after landing. Ledgr: `motion/stamp-ledgr.jpg`. |
| M2 seamless side nav | PASS desktop, FAIL mobile | Seam sample at the TOC x for y = 60..800: all `rgb(247,247,247)` (`motion/m2.json`). Emoji per item present (🏦 🏭 💸 ☁️ 🎮 📊 🛡️ 🚨 📒). Pill is one shared element sliding 313 -> 193 px in ~330 ms (23 distinct frames, spring settle, one small overshoot). Emoji pop sampled at scale 1.03 early (it exists, small). Mobile: see GAP-I2-D4. |
| M3 lift and pop | FAIL on the measured number | Pose is right (`matrix(1.025,0,0,1.025,0,-12)`, shadow-3, sheen, parallax), but the card's top edge moves 21-23 px on big cards. See GAP-I2-D2. Press and release spring back to 0 px (`returnFinalDelta` 0). |
| M4 consistent and calm | NOT YET | Same LiftCard everywhere is good. Remaining leaks: ad hoc 4 px CSS lift inside work cards, 20/18/32/6 px radii, bespoke device shadows, nav collisions, cookie-wall iframes. |

## Measurements (all 1440x900, mouse hover, rAF-sampled)

| Card | Rest height | Top-edge delta (spec -10..-14) | Height growth | Settle | Overshoot |
|---|---|---|---|---|---|
| Home stack card (Cosap) | 908 px | **-23.4** | +22.7 | ~400 ms | 0.6 px |
| Home highlight tile | 296 px | **-15.7** | +7.4 | ~310 ms | 0.4 px |
| /work card (x2 cards) | 742 px | **-21.3** | +18.5 | ~300 ms | 0.5 px |

Ticker: -42 px/s idle, 0 on hover (pauses, good). Globe: 61 fps, 1 WebGL canvas, hover on the "Seoul" row rotates the globe and tints the row (works). Persona: arrow-key and radiogroup exist in code, not driven here.

Page checks: horizontal scroll none on all 12 page-viewport pairs; dark full-width sections 0 on all; h1 present everywhere; pixel-based empty-viewport scan (share of non-white pixels under 2 % of a 1440x800 crop) flagged only 2 of ~330 shots, both the same blank-chart class as GAP-I2-D6.

---

## Gaps

### FAIL

**GAP-I2-D1 | FAIL | all 9 `/work/<slug>` | uncaught runtime error on every case study**
Evidence: every case page logs `PAGEERR Only two keyframes currently supported with spring and inertia animations. Trying to animate 1,1.18,1` (9/9 desktop, 9/9 mobile, `R2-shots/steps-log-case.json`); the Next dev overlay shows a red "1 Issue" badge on case pages (`sheets/empty-candidates.jpg`, bottom left). Home does not throw because `project-stack.tsx:56-57` already uses a duration tween.
Fix: `src/components/site/case-study/toc.tsx:185-186` change `transition={SITE_SPRING.ui}` to `transition={isActive && !reduce ? { duration: 0.32, ease: "easeOut" } : { duration: 0 }}` (same as project-stack.tsx).

**GAP-I2-D2 | FAIL | M3 card lift, home stack card, /work card, highlight tile | top edge rises 15.7-23.4 px, spec 10-14 and "identical on home and /work"**
Evidence: `R2-shots/motion/hover.json`; frames `motion/hover-home-stack-700ms.jpg`, `hover-work-card-700ms.jpg`. Cause: `-12 px` translate plus `scale(1.025)` about the centre; a 908 px card gains 11 px above its top edge from scale alone.
Fix: size-compensate in `src/components/motion/lift.ts` `liftTarget` (add `height` arg) and `src/components/ui/lift-card.tsx` (ResizeObserver for height). For hover: `grow = Math.min(0.025, 16 / h)`, `scale = 1 + grow`, `y = -12 + (h * grow) / 2`. Top edge then moves exactly -12 for 296, 742 and 908 px cards. Press: `y = -6 + (h * (scale - 1)) / 2` similarly. Add a unit test that top delta is 12 +/- 0.5 for h = 300, 742, 908.

**GAP-I2-D3 | FAIL | nav pill, desktop | page text shows through the glass and collides with the nav labels**
Evidence: `sheets/globe-hover.jpg` (Hành trình kinh doanh / VNG Gaming Challenge printed over "Work", "Get in touch"), `home-d-sheet1` shots 1-2, `about-d-sheet0` shots 2 and 5, `home-d-sheet2` shot 3 ("make the call." under the pill). Spec 5.1: fill 72 %, blur 24 px, saturate 160 %, "unreadable through it". Actual: `.glass[data-tint="light"]` background 0.55 (`globals.css:~325`) and `LiquidGlass` default `blur = 2`, so the refraction filter is `url(#..) blur(2px) saturate(1.3)` (`glass/liquid-glass.tsx:63,93`).
Fix: `globals.css` `.glass[data-tint="light"] { background: rgba(255,255,255,0.72); }`; in `site-nav.tsx` (the `<LiquidGlass radius={PILL_H / 2} tint="light" ...>` at ~line 166) add `blur={14} saturation={1.6}`. Recheck at the three spots above.

**GAP-I2-D4 | FAIL | home, mobile 390 | chip rail does not follow the active card and has no sliding pill**
Evidence: scrolled to PAC, ReOrc, Guardline, Ledgr: `rail.scrollLeft` stays 0 and the active chip is outside the rail's visible box in all four (`motion/m3.json` `mobileRail`; `home-m-sheet2` and `home-m-sheet3` show chips Lumicap, COSAP, GoCrypto with no active state). Spec 5.6: active chip auto-scrolls into view (smooth 320 ms), same sliding active pill as desktop. Active chip is a plain `bg-white` swap (`project-stack.tsx:~138`).
Fix: in `project-stack.tsx` keep a ref per chip, `useEffect` on `active`: `rail.scrollTo({ left: chip.offsetLeft - (rail.clientWidth - chip.offsetWidth) / 2, behavior: reduce ? "auto" : "smooth" })`; wrap the chips in the same `layoutId="toc-chip-pill"` span with `SPRING.indicator`.

**GAP-I2-D5 | FAIL | home "Notes on LinkedIn", 1440 and 390 | cookie walls, console errors, off-scale radius**
Evidence: `home-d-sheet2` shot 6 and `home-m-sheet4` shot 3: all three iframes show "LinkedIn respects your privacy / Accept / Reject" covering a third of the card; `requestStorageAccess: Permission denied` x3 per load (`steps-log-home.json`). Radius is `rounded-[20px]` (`linkedin-posts.tsx:59`). Spec 5.9: static cards, no iframes.
Fix: `linkedin-posts.tsx` stop rendering `<iframe>` (the skeleton block at ~line 70+ already has date, title, excerpt): make it the final state, add "Read on LinkedIn ↗" link, wrap in `LiftCard radius="rounded-lg"`, drop `ring-1 ring-black/5` for `shadow-1`.

**GAP-I2-D6 | FAIL | `/work/reorc-data-platform` "The platform areas I worked on" | empty 330 px card**
Evidence: `R2-shots/sheets/empty-candidates.jpg` (left), `motion/empty-reorc.jpg` (3.5 s after scrolling it to y=250: still blank). DOM: hub, spokes and three item boxes sit at computed opacity 0 (`mm2.mjs`: minOpacity 0 after view). Cause candidates in `dataviz/module-map.tsx`: each child uses its own `whileInView` with `amount: 0.35` (`dataviz/motion.ts:3`); the vertical spoke `<line>` has zero width so it can never reach 35 % intersection, and the rest do not fire either.
Fix: replace the per-child `whileInView` with one `useInView(ref, { once: true, amount: 0.2 })` on the `[data-testid=module-ring]` div and drive children with `animate={inView ? {...} : {...}}`. Verify opacity 1 on all spokes 1.5 s after scroll-in. Also check the sibling "From source to report in Recurve" figure (minOpacity 0 as well, not visually verified).

**GAP-I2-D7 | FAIL | home Ledgr stack card, M1 | stamp unreadable on the black card**
Evidence: `motion/stamp-ledgr.jpg`: "LIVE DEMO" ink is multiplied navy on black, so only the half over the page background shows; the sub-label is gone. `card-stamp.tsx` uses `mixBlendMode: "multiply"` and `--navy-ink` for every surface.
Fix: pass `surface` from `stack-card.tsx` to `CardStamp`; when `dark`, use `mixBlendMode: "normal"`, stroke and fill `#fff`, opacity 0.92, and swap the halo to `rgba(255,255,255,0.14)`.

### CONCERN

**GAP-I2-D8 | CONCERN | home, persona reorder | cards fly ~7,800 px**
Evidence: `motion/m3.json` `personaAnim`: after "Founder", Ledgr goes 7996 -> 6745 -> 1229 -> 409 -> 237 -> 206 px in ~800 ms while Lumicap and Cosap slide down 800 px; it reads as a violent scroll, not a reorder in place. Order and TOC do update correctly (Ledgr first, note "Founder view: ..." fades in).
Fix: `project-stack.tsx` ordered `motion.div`: `layout={false}`; key the list wrapper by persona and use `initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.32}}`; scroll to `#work-title` first with `scrollIntoView({block:"start"})` if the stack top is above the viewport.

**GAP-I2-D9 | CONCERN | M3 spring feel | overshoot 0.4-0.6 px, settle ~300 ms**
Evidence: `hover.json` (`overshootPx` 0.4-0.6, `settleMs` 292-399). Spec: "one small overshoot", 350-600 ms. At 12 px travel that is invisible; it feels like an ease, not iOS.
Fix: `motion/springs.ts:21` `lift: { stiffness: 170, damping: 15, mass: 1 }` (zeta 0.57, ~11 % overshoot = 1.3 px, settles ~0.55 s). Update the spring unit test if it pins the numbers.

**GAP-I2-D10 | CONCERN | /work cards | a second ad hoc lift inside the shared lift**
Evidence: `work-card.tsx:62` `transition-transform duration-300 ease-out group-hover:-translate-y-1` on the media layer, on top of LiftCard parallax. Violates "one implementation" (spec 5.7) and the no-CSS-ease rule.
Fix: delete the `transition-transform ... group-hover:-translate-y-1 motion-reduce:transform-none` classes from that div.

**GAP-I2-D11 | CONCERN | /work page | no visible heading, black slabs, empty tint**
Evidence: `work-d-sheet0` shots 1-2: first viewport is chips plus three 742 px cards; the h1 "All projects" is not visible; GoCrypto, Zalo Game Center, Cortex Sentinel are solid black 742 px slabs; the top ~330 px of every card is empty tint before the device appears. Mobile has a hard-edged navy screenshot slab inside the mint COSAP card (`work-m-sheet0-0.jpg`).
Fix: add a visible `<h1 className="text-[32px] md:text-[46px]">Selected work</h1>` above the chips in `src/app/work/page.tsx` (turn the sr-only text into it); `work-card.tsx` `xl:min-h-[742px]` -> `xl:min-h-[620px]`; in content set `meta.tone` for gocrypto, zalo-game-center, cortex-sentinel to a light tint (keep dark only for the card visuals) or cap `deep` cards to one per row.

**GAP-I2-D12 | CONCERN | home contact, "Say hello" | dotted track overruns the wallet and the card**
Evidence: `R2-shots/home-d-18.jpg`: the dashed line continues ~125 px past "Thao's wallet", outside the grey track and the card edge (x 1145 vs card edge 1080). Cause: the absolutely positioned `<svg>` has `width="100%"` (`say-hello.tsx:51`) so `inset-x-[104px]` becomes left offset only.
Fix: remove `width="100%" height="4"` attributes and add `w-[calc(100%-176px)] md:w-[calc(100%-208px)]` (or `right-[104px] left-[104px] w-auto`). Also trim the empty ~100 px under the track (`mt-5 min-h-12` reserved area) to `min-h-0` while idle.

**GAP-I2-D13 | CONCERN | site footer, every page | duplicate contact blocks and leftover doodle toy**
Evidence: `home-d-18` (Say hello card, then ~150 px later "Want to get in touch? Drop me a line." with email pill) and `home-d-19` (empty "Leave a mark" doodle box with "Clear my doodle"). Spec cut list removes the doodle pad. Same footer on /about, /work, case pages.
Fix: delete `<DoodlePad />` at `site-footer.tsx:70`; on home hide the "Want to get in touch" heading and email pill (keep the three icon buttons and colophon) or move Say hello into that slot.

**GAP-I2-D14 | CONCERN | radius and shadow scale leaks**
Evidence: `audit.json`: home has 20 px x13, 18 px x3, 6 px x3, 32 px x1, 35/29 px; /about 20 px x7. Sources: `photo-moments.tsx:39`, `linkedin-posts.tsx:59`, `device-mockup.tsx:52,64`, `case-study-media.tsx:61`, `case-study/screen-frame.tsx:57,67,79`, `about/page.tsx:58,156,171,189`. Device mockups use bespoke `shadow-[0_30px_70px_-24px_rgba(11,31,77,...)]`.
Fix: 20 px -> `rounded-2xl` (24) for media and cards, or `rounded-lg` (16) for small cards; 18 px -> `rounded-2xl`; 6 px inner screens -> `rounded-sm` (8). Replace device shadows with `shadow-3`.

**GAP-I2-D15 | CONCERN | /about | career shown three times, sparse rail cards**
Evidence: `about-d-sheet0` shots 2-4: "The route so far" rail, then "Experience" with full bullets, then "Earlier experience" repeating Cho Tot, MoMo, Creatio. MoMo rail card has one line of content.
Fix: keep the rail and the Experience list; delete the "Earlier experience" grid (or the rail cards for the three earlier roles) in `app/about/page.tsx`; add the one-line outcome from the Experience bullet to rail cards.

**GAP-I2-D16 | CONCERN | M1 stamp ink too faint to read at rest**
Evidence: `motion/stamp-landed.jpg`: the grain filter eats the letterforms on white, the sub-label (7.5 px SVG text) is unreadable; reads as a watermark. "SHIPPED" is the word recruiters should see.
Fix: `card-stamp.tsx` feColorMatrix last row `0 0 0 -1.6 1.3` -> `0 0 0 -1.2 1.25` (less erosion), `fontSize` sub 7.5 -> 9, drop opacity 0.88 -> 0.92.

### OBSERVATION

**GAP-I2-D17 | OBSERVATION | ticker | speed and text size.** 42 px/s measured (spec 28), chip text 11 px, 33 text nodes under 12 px on home. Fix: ticker speed constant to 28, chip `text-[11px]` -> `text-[12px]` (`proof-ticker.tsx:22,23`).

**GAP-I2-D18 | OBSERVATION | globe.** Two frames 2 s apart (`motion/globe-a.jpg` vs `globe-b.jpg`) are visually identical, so idle rotation (spec 6 deg/s = 12 deg) is not perceptible; land dots are so faint continents do not read. Hover rotation to the chosen corridor works. Fix: raise dot alpha from ~0.35 to 0.55 and confirm idle `rotation.y += 0.105 * delta` runs in `globe-canvas.tsx`.

**GAP-I2-D19 | OBSERVATION | stamp motion detail.** Undershoot to 0.94 and ~650 ms settle are charming but differ from spec (settle ~260 ms). Fix if matching spec matters: `springs.ts` `stamp` damping 22 -> 28. Card press-nudge not built (see M1 table).

**GAP-I2-D20 | OBSERVATION | canvases.** Strict `querySelectorAll("canvas").length` is 2 while the globe is in view and 1 when away (hero DotGrid 2D canvas, footer doodle canvas). WebGL contexts: 1, disposed when away, so the intent of the rule holds; the literal check fails until DotGrid is paused/unmounted off-screen or the doodle is removed (D13 removes one).

**GAP-I2-D21 | OBSERVATION | not exercised this pass.** Touch (390 hasTouch), reduced-motion A/B frames, keyboard Tab order, persona arrow keys, /about rail drag and arrow buttons, hero cursor-reveal easing, mobile menu sheet, `/work` filter glide were not driven; code reads correct for persona and rail. The mobile chip rail was the only touch-viewport interaction measured.

---

## Evidence index (`R2-shots/`)

- Every viewport, 1440 (`*-d-NN.jpg`) and 390 (`*-m-NN.jpg`) for `home`, `about`, `work`, `case-<slug>` x9: 368 files. Contact sheets in `sheets/` (`home-d-sheet0..3`, `home-m-sheet0..5`, `about-*`, `work-*`, `case-<slug>-{d,m}-overview.jpg`, `globe-hover.jpg`, `empty-candidates.jpg`, `empty-recheck.jpg`).
- Motion: `motion/hover.json`, `hover-*-80ms|700ms.jpg`, `m2.json` (stamp, pill, seam), `stamp-landed.jpg`, `stamp-ledgr.jpg`, `m3.json` (persona, ticker, canvas, mobile rail), `persona-before|after.jpg`, `ticker.jpg`, `globe-*.jpg`, `empty-reorc.jpg`, `mobile-rail-ledgr.jpg`.
- Data: `audit.json` (radii, shadows, dark bands, h1, small text per page and viewport), `steps-log*.json` (page heights, canvas, console errors).
- Scripts: `scripts/steps.mjs`, `motion.mjs`, `motion2.mjs`, `motion3.mjs`, `stamp.mjs`, `audit.mjs`, `empty.mjs`, `mm2.mjs` (need Playwright resolved from `duma/node_modules`).

## Unresolved questions

1. Is the LinkedIn iframe a deliberate product decision (measured embed heights are stored in `content/site.ts`) overriding spec 5.9? If yes, D5 becomes "accept cookie wall" and needs Thao's call.
2. Does the zero-area `<line>` really block `whileInView` in the module map, or is the cause the case-page runtime error (D1)? Fix D1 first and re-measure D6.
3. Should `/work` keep three solid-black cards as brand colour, or follow "no dark slabs" and go light with dark device art?

**Status:** DONE
**Summary:** 21 gaps logged (7 FAIL, 9 CONCERN, 5 OBSERVATION) with shots, measurements and exact fixes. Site averages 6.9/10; M1 and M2 largely pass, M3 fails on measured lift, M4 not yet.
**Concerns/Blockers:** Touch, reduced-motion, keyboard and about-rail drag were not driven this pass (see D21). The module-map root cause (D6) is a hypothesis; fix D1 and re-measure.
