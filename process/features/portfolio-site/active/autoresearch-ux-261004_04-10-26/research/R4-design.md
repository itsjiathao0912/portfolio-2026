---
name: report:autoresearch-ux-r4-design
description: "Iteration 4, lane A (design skeptic): screenshot and motion audit of home, /about, /work and 9 case studies at 1440 and 390 against the round-6 design SPEC, with R3 gap status and new gaps."
date: 04-10-26
metadata:
  node_type: memory
  type: report
  feature: portfolio-site
  phase: autoresearch-ux
---

# R4 design audit (iteration 4, lane A)

Read-only on source. HEAD `c7bbea7`, dev server `localhost:3003`, one headless Chromium run in sequence. Everything below was measured or photographed in this run. Machine load average was 11 to 32 (other lanes), so timings are indicative; two navigations timed out once and were rerun with a longer timeout. Shot root: `research/R4-shots/` (`R4-shots/` below). Scripts: `R4-shots/scripts/` (Playwright resolved from `duma/node_modules`).

## Totals

- **Site average 7.8 / 10** (R3 7.7, R2 6.9). Home 8.0 (R3 7.7), /about 7.7 (7.5), /work 7.5 (6.5), case studies 7.8 (7.8, no case file changed).
- **R3 gaps tracked (20): 11 fixed, 3 partial, 6 open.** No FAIL left from R3.
- **New gaps: 7 (0 FAIL, 2 CONCERN, 5 OBSERVATION).**
- **Must-haves: M1 PASS, M2 PASS (visual, not re-measured), M3 PASS (11.5 px lift now with a visible 1.1 to 1.4 px overshoot), M4 almost** (LinkedIn card craft, device-frame radii, a few cards still without the shared lift).
- Zero page errors and zero console errors on all 12 pages at both sizes (`steps-log.json`: `errors-d` and `errors-m` empty). The 3x `requestStorageAccess` noise is gone because the LinkedIn iframes are gone (0 iframes). Home 15,753 px at 1440 (limit 16,000), 16,073 at 390. Horizontal scroll: none anywhere. Dark full-width sections: 0. Canvas count: 1 on home (globe), 0 on others.

## Per-page scores (1 to 10)

| Page | Layout | Type | Colour | Motion | Cohesion | Delight | Avg |
|---|---|---|---|---|---|---|---|
| Home (1440 + 390) | 8 | 8 | 8 | 8 | 8 | 8 | **8.0** |
| /about | 7 | 8 | 8 | 8 | 7 | 8 | **7.7** |
| /work | 7 | 8 | 8 | 8 | 7 | 7 | **7.5** |
| /work/lumicap | 8 | 8 | 8 | 7 | 8 | 7 | **7.7** |
| /work/cosap | 8 | 8 | 8 | 8 | 8 | 7 | **7.8** |
| /work/gocrypto | 8 | 8 | 8 | 9 | 8 | 9 | **8.3** |
| /work/pac | 8 | 8 | 8 | 7 | 8 | 6 | **7.5** |
| /work/zalo-game-center | 8 | 8 | 8 | 8 | 8 | 7 | **7.8** |
| /work/reorc-data-platform | 8 | 8 | 8 | 8 | 8 | 7 | **7.8** |
| /work/cortex-sentinel | 8 | 8 | 8 | 8 | 8 | 8 | **8.0** |
| /work/guardline | 8 | 8 | 8 | 8 | 8 | 7 | **7.8** |
| /work/ledgr | 8 | 8 | 8 | 7 | 8 | 7 | **7.7** |
| **Mean** | 7.8 | 8.0 | 8.0 | 7.8 | 7.8 | 7.3 | **7.8** (93.6 / 12) |

Why the moves: home motion 7 to 8 (persona now glides, ticker calm, cursor eased) and layout 8 (stack and LinkedIn cards equal height). /work layout 5 to 7 (visible 56 px h1, cards 516 to 554 px instead of 742, filter thumb slides), motion 6 to 8. /about delight 7 to 8 (rail unchanged but each role now shown once). Home is held at 8 by the LinkedIn cards cropping their own images and by the white-on-white Say hello block. Case studies did not change at all: same files, same scores.

## Must-haves

| # | Verdict | Evidence |
|---|---|---|
| M1 stamp per card top edge | **PASS** | Stamps still on the top edge of every stack card (`sheets/home-d-sheet1.jpg`, `home-d-sheet3.jpg`): SHIPPED, STRATEGY, 2ND PLACE, HACKATHON. Ink reads at 1x, `motion/stamp.png`; sub-label ("2025 · SKYLAB") still tiny (R2-D16 open). |
| M2 seamless side nav | **PASS** | One `#F7F7F7` canvas from heading through TOC and cards, emoji on all items, white sliding pill (`home-d-sheet1`). Not re-measured; no change in these files. |
| M3 lift and pop | **PASS** | Measured top-edge rise 11.5 px on home stack, LinkedIn card and /work card (`motion/lift.json`). **Overshoot now visible: peak 12.9 / 12.9 / 12.6 px vs 11.5 final = 1.41 / 1.43 / 1.06 px (12.3 / 12.4 / 9.2 %)**, peak at 280 to 450 ms, 90 % at 217 to 300 ms. That meets "about 1.5 px visible". R3 had 0.0 to 0.6 px. |
| M4 consistent and calm | **ALMOST** | One LiftCard family, no dark slabs, no iframes, one contact block, radii mostly on scale (home now 24 / 16 / 12 plus 20 x2, 18 x3, 8 x3 on device frames). Left: LinkedIn image crop and edge definition, 3 card groups without the lift, stamp sub-label, faint globe. |

## Judgement of the new work

### LinkedIn own cards (`linkedin-posts.tsx`, `motion/linkedin.json`, `motion/linkedin-d.png`, `-m.png`)
- **On-brand: mostly.** Avatar, name, role, relative time, LinkedIn glyph, bold title, 4-line excerpt, `…more`, image, reaction chip row, "View on LinkedIn". Reads as a considered quote of the post, not an embed. Zero iframes, zero cookie banners, zero console errors.
- **Equal heights: yes.** 678 x 678 x 678 at 1440 (384 wide each, 24 px gap, 3 in a row, no scroll needed), 644 each at 390 (320 wide snap carousel, next card peeks).
- **Counts: yes**, all three show "143 reactions · 8 comments", "27 reactions · 2 comments", "184 reactions · 18 comments".
- **Images: load, but are cropped badly.** Every image sits in a fixed 384 x 288 `object-cover` box (`linkedin-posts.tsx:185`). The NAPAS post is a 16:9 infographic that crops to "SIDE VIETNAM'S / K TRANSFER SYSTEM": left letters cut off, right label "Payment exc..." cut off. The payments diagram loses its bottom row. The third (photo) is fine. Source files are 1000 px wide so retina is fine.
- **Edge definition: weak.** Card white on a white section with `shadow-card` 0.06 and `ring-black/5`: at 1440 the cards read as floating text blocks.
- Targets: "…more" and "View on LinkedIn" are 44 px high.

### Persona glide (`motion/persona-*.jpg`, Playwright frame log)
Clicking Engineer: scrollY unchanged (2,822 before and after, no -680 px jump), the heading stays on screen at y 550, stack fades 0.35 to 1 and settles in about 570 ms, first card top goes 864 (opacity 0.76) to 774 to 732 to 717, i.e. a 12 to 150 px rise, no blank stack, no 730 px fly-in. Note changes to "Engineer view: ..." and TOC reorders ("In your order", ReOrc first). **Fixed.** One frame at the very start sampled the card at 1117 px with opacity 0.35 (first paint after the key change); not visible in the 60 to 600 ms stills.

### /work (`motion/motion.json`, `sheets/work-d-sheet0.jpg`, `work-m-sheet0.jpg`)
- h1 "Selected work" now visible, 56 px, 672 x 62 box. **Fixed.**
- Card heights 516 / 516 / 516 / 554 x3 / 540 x3 (was 742). Gap between subtitle and the visual: 136, 110, -34 (GoCrypto phone overlaps text, intentional), 77, 77, 77, 136, 136, 77 px. Down from 231 to 368 px. Still a faint "empty pastel" feel on Lumicap, Ledgr and Cortex (136 px). Improved, not perfect.
- Sliding filter: thumb moves between 6 distinct x positions (384 to 669 px) and cards swap 9 to 2 with the leaving card fading from opacity 1 to 0 (0.18 mid-way). **Fixed** (`motion/work-filter.png`).

### Nav glass fill 0.85 (`sheets/nav-glass-sheet.png`)
Computed `rgba(255,255,255,0.85)`, `backdrop-filter url(#..) blur(24px) saturate(1.6)`. Over the big white-grey headings the labels are clean (shot 1, 2). Over a coloured card with small text (`/work`, shot 3) a very faint ghost of "Skylab Group · Regulated" still shows under "About" and "LinkedIn". Much better than R3, not zero (headless Chromium may be skipping the url() filter, as R3 noted).

### LiftCard overshoot
See M3: 1.06 to 1.43 px, as intended. Time to settle about 0.6 s. Feels like iOS now rather than a linear glide.

### Say hello (`motion/hello.json`, `hello-d-after.png`, `hello-m-after.png`)
- Single playful module: card 720 x 384 (358 x 348 at 390), coin and wallet track fit inside (wallet right 1016, svg right 936, card right 1080). R3 overrun (svg 64 px past the card) is gone. **Fixed.**
- No second mailto in the module: its only link is "Where to reach me" (`#get-in-touch`), the footer is the one contact block (3 mailtos on the page, all from footer and card text anchors at y 14,389 and below). **Fixed.**
- After the drag: "✓ Settled / Delivered. Thao will be delighted. [Where to reach me] [Send another]". Charming, but nothing was sent (see GAP-I4-D4).
- Spacing: about 215 px empty above the card and about 200 px below at 1440 (`hello-d-after.png`), and the card is white on white.

### Others checked
- Ticker: 105 s loop, 12 px chips (R3-D17 fixed). Mobile touch targets: only the "Skip to content" link is under 44 px at 390 (R3 listed 5 groups).
- Home second-place tile: now a pale yellow gradient, no black slab on mobile (R3-D6 fixed).
- /about: "Earlier experience" section is gone; the rail still ends in a hard crop and the MoMo rail card is thin.

## R3 gap status (20 tracked)

| R3 gap | Status | Evidence now | Remaining exact fix |
|---|---|---|---|
| GAP-I3-D1 persona reorder | **FIXED** | glide, no blank, no scroll jump (above) | none |
| GAP-I3-D2 /work filter | **FIXED** | thumb 6 positions, leaver fades | none |
| GAP-I3-D3 cursor reveal | **FIXED** | `cursor-reveal.tsx:42` `c.x += (t.x - c.x) * 0.16` in rAF | none |
| GAP-I3-D4 mobile targets | **FIXED** | 390: 1 element under 44 px (skip link) | none |
| GAP-I3-D5 lift overshoot | **FIXED** | 1.06 to 1.43 px | none |
| GAP-I3-D6 dark slab on mobile | **FIXED** | pale gradient tile | none |
| GAP-I3-D7 cards without LiftCard | **OPEN** | `LiftCard` count in `about/page.tsx` 0, `photo-moments.tsx` 0, `career-rail.tsx` 0 | wrap photo moments (`radius="rounded-2xl"`), edu/cert/award cards, rail cards (`variant="row"`) |
| GAP-I3-D8 empty card on video scroll-in | **OPEN** | `dataviz/video-loop.tsx:41` still `preload="none"` | change to `preload="metadata"` |
| GAP-I3-D9 case TOC ad hoc hover | **OPEN** | `case-study/toc.tsx:194` still `group-hover:translate-x-[5px] duration-200 ease-out` | drop it or use `whileHover={{ x: 4 }}` with `SPRING.ui` |
| GAP-I3-D10 rail crop + globe list | **OPEN** | no `mask-image` in `career-rail.tsx`, no `self-center` in `globe-card.tsx`; `about-d-sheet0` shot 2 still hard-cuts at x 1367, globe list top-aligned with ~60 px gap below | `career-rail.tsx` `<ol>` add `md:[mask-image:linear-gradient(to_right,#000_94%,transparent)]`; `globe-card.tsx` list wrapper add `md:self-center` |
| R2-D3 nav glass | **PARTIAL** | 0.85 + inner hairline; faint ghost over small coloured text | `globals.css` glass tint `0.85` to `0.9` (keep hairline) |
| R2-D5 LinkedIn cookie walls | **FIXED** | 0 iframes, 0 errors, radius 24 | new craft gaps D1, D2 below |
| R2-D11 /work h1 + blank tint | **FIXED** | 56 px h1; cards 516 to 554; gaps 77 to 136 | residual in GAP-I4-D5 |
| R2-D12 Say hello track | **FIXED** | inside card | none |
| R2-D13 duplicate contact | **FIXED** | one mailto block (footer) | none |
| R2-D14 radius scale | **PARTIAL** | home: 24 x66, 16 x62, 12 x9, **20 x2, 18 x3, 8 x3**; case pages carry 18 / 8 / 20 on device frames | `case-study/screen-frame.tsx` `rounded-[18px]` to `rounded-2xl`, `device-mockup.tsx` / `screen-frame.tsx` `rounded-[8px]` to `rounded-md`, the two `rounded-[20px]` left on home to `rounded-2xl` |
| R2-D15 career shown 3 times | **PARTIAL** | duplicate section gone; rail MoMo card is title + chip only (`about-d-sheet0` shot 2) | `ledger-data.ts`: one outcome line per rail card |
| R2-D16 stamp ink faint | **OPEN** | `card-stamp.tsx:54` still `-1.6 1.3`, `:75` sub-label `fontSize="7.5"` | last row `0 0 0 -1.2 1.25`; `fontSize` 7.5 to 9 |
| R2-D17 ticker speed | **FIXED** | `ticker-scroll_105s`, chips 12 px | none |
| R2-D18 globe faint | **OPEN** | `globe-canvas.tsx:195` `fillRect(p.x - 1, p.y - 1, 2, 2)`; dots still read as a grey disc in `home-d-sheet0` shot 4 | alpha `0.18 + p.z * 0.4` to `0.32 + p.z * 0.5`, rect `(p.x - 1.25, p.y - 1.25, 2.5, 2.5)` |

Tally: fixed 11, partial 3, open 6.

## New gaps

### CONCERN

**GAP-I4-D1 | CONCERN | LinkedIn cards | the card image crops the infographics, cutting words**
Evidence: `motion/linkedin-d.png` (middle card: "SIDE VIETNAM'S / K TRANSFER SYSTEM", right-hand "Payment exc..." and "SIMC" cut; left card loses its bottom row), `motion/linkedin.json` (napas 1000x562 source shown in a 384x288 `object-cover` box, payments 1000x1000 likewise).
Fix: `src/components/site/linkedin-posts.tsx:185` add an optional `imageFit` on the post data; for `napas-simo` and `vietnam-payments` render `className="object-contain bg-canvas"` (keeps the equal 288 px box, shows the whole slide); keep `object-cover` for the AABW photo.

**GAP-I4-D2 | CONCERN | LinkedIn cards | white cards on a white section have almost no edge**
Evidence: computed shadow `rgba(11,21,51,0.06) 0 1px 2px`, `ring-black/5` (`linkedin-posts.tsx:166`), section `bg-bg` (`:289`). In `motion/linkedin-d.png` the card boundaries are barely visible; the highlight tiles higher on the page sit on `#F7F7F7` and look clearly better.
Fix: section `bg-bg` to `bg-canvas` (as the highlights and work sections), drop `ring-1 ring-black/5`, keep `shadow-1`.

### OBSERVATION

**GAP-I4-D3 | OBSERVATION | home end of page | about 215 px empty above Say hello and about 200 px below, white card on white**
Evidence: `motion/hello-d-after.png`. LinkedIn section padding `py-20 md:py-[130px]` (`linkedin-posts.tsx:289`) plus `py-14 md:py-[64px]` on `home/say-hello.tsx:63`.
Fix: LinkedIn section `pt-20 pb-12 md:pt-[130px] md:pb-[56px]`; Say hello section `bg-bg` to `bg-canvas` so the white card has contrast and the footer starts on white.

**GAP-I4-D4 | OBSERVATION | Say hello copy | "Delivered. Thao will be delighted." implies a message was sent**
Evidence: `motion/hello.json` after-state text. Nothing is sent; the only action is the "Where to reach me" anchor.
Fix: `home/say-hello.tsx` settled line to "Coin delivered. Now say hi for real:" so the button reads as the real next step.

**GAP-I4-D5 | OBSERVATION | /work cards | 136 px of blank pastel still sits under the subtitle on Lumicap, Ledgr and Cortex**
Evidence: `motion/motion.json` work cards `gapTextToVisual` 136, 136, 136 (others 77). Visual is bottom-anchored.
Fix: `work-card.tsx` give the visual wrapper `mt-6 md:mt-8` instead of bottom anchoring, and lower `xl:min-h-[580px]` to `xl:min-h-[520px]`.

**GAP-I4-D6 | OBSERVATION | mobile hero headline is 6 lines at 390**
Evidence: `home-m-sheet0.jpg` shot 1: "Thao Dao / is Technical / Product / Manager / at SkyLab / Group" fills the first screen before the portrait appears.
Fix: `hero-intro.tsx` h1 `text-[40px]` (or the current mobile size) to `text-[34px] leading-[1.08]` below `sm:`; two lines shorter.

**GAP-I4-D7 | OBSERVATION | LinkedIn section heading on mobile has about 100 px of empty space above it**
Evidence: `home-m-sheet3.jpg` shot 1 (photo moments end, then blank, then "Notes on LinkedIn").
Fix: with D3: reduce the preceding photo-moments bottom padding on mobile (`photo-moments.tsx` section `pb-20` to `pb-10 md:pb-[96px]`).

## Priority for the fixer

1. D1 and D2 (LinkedIn crop and edge): one file, the most visible blemish left on home.
2. R2-D3 to 0.9, R2-D16 stamp ink, R2-D18 globe dots: one-line token edits.
3. D3, D4, D5: spacing and copy polish at the end of home and on /work.
4. I3-D7, D8, D9, D10 and R2-D14 radius leftovers: the "everything uses the shared system" sweep.
5. D6, D7: mobile polish.

## Evidence index (`R4-shots/`)

- Every viewport at 1440 (`*-d-NN.jpg`) and 390 (`*-m-NN.jpg`) for `home`, `about`, `work`, `case-<slug>` x9; contact sheets in `sheets/` (`home-d-sheet0..4`, `home-m-sheet0..3`, `about-*`, `work-*`, `case-<slug>-{d,m}-overview.jpg`, `nav-glass-sheet.png`).
- Motion and measurements: `motion/lift.json` (overshoot), `motion/linkedin.json` and `linkedin-{d,m}.png`, `motion/motion.json` (persona, nav, /work cards, filter), `motion/hello.json` and `hello-*.png`, `motion/audit.json` (radii, small text, targets, dark bands per page), `persona-f*.jpg`, `work-filter.png`, `stamp.png`, `nav-under-*.png`, `steps-log.json`.
- Scripts: `scripts/steps.mjs`, `lift.mjs`, `li.mjs`, `mo.mjs`, `pg.mjs`, `sh.mjs`, `au.mjs`, `nv.mjs`, `sheet.sh`, `lib.mjs`.

## Unresolved questions

1. Real iOS Safari rendering of the `url()` backdrop-filter nav glass is not testable in headless Chromium; the 0.9 fill is a safe bet either way.
2. Should the Say hello card keep the "Delivered" gag, or should it be reworded so it never implies a sent message (D4)?
3. Ticker chip buttons are 33 px high on desktop (fine for a mouse, under 44 px if a touch laptop counts); left as is.

**Status:** DONE
**Summary:** Site averages 7.8/10 (R3 7.7). Of 20 tracked R3 gaps, 11 are fixed, 3 partial, 6 open; 7 new gaps (0 FAIL, 2 CONCERN on the LinkedIn cards' image crop and flat edges). The LinkedIn own cards, persona glide, /work fill and sliding filter, Say hello single module and 1.1 to 1.4 px lift overshoot all check out.
**Concerns/Blockers:** Timings taken under machine load 11 to 32; iOS Safari glass rendering not testable here; case studies unchanged since R3 so their scores carry over.
