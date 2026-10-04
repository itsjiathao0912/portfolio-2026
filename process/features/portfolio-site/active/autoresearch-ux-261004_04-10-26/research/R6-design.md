---
name: report:autoresearch-ux-r6-design
description: "Iteration 6, lane A (design skeptic): pick-your-character section, platformer clay guide (feet alignment, walk, jump, fall, overlap at 3 widths), stats, poll, depth control, card-to-case speed, against DESIGN-SPIRIT C1-C10 and R5 gaps."
date: 04-10-26
metadata: {node_type: memory, type: report, feature: portfolio-site, phase: autoresearch-ux}
---

# R6 design audit (iteration 6, lane A)

Read-only on source. Tree: HEAD 16c1af5, clean of feature work (only `tsconfig.json` reformatted). Site `localhost:3003` is `next dev`, so all timings are dev-mode. Evidence in `R6-shots/` (`data/*.json` raw samples, `guide/`, `ui/`, `pages/`, `scripts/`).

## BLUF

- **Site average 7.9 / 10** (R5 7.8). Home 8.0. The "Pick your character" section is the best new thing on the site: calm, on-spirit, and the zoom-to-hero is smooth.
- **The guide's motion is excellent; its placement is not yet.** Walk, jump, fall and landing all feel right. But it covers headings and stat numbers on about half of all scroll positions, and one real bug makes the arrow keys scroll the page instead of walking the guide.
- **R5 gaps: 5 fixed, 1 partial, 1 open, 1 not re-checked.** New gaps: 8 (3 CONCERN, 5 OBSERVATION).

## Per-page scores

| Page | Layout | Type | Colour | Motion | Cohesion | Delight | Avg |
|---|---|---|---|---|---|---|---|
| Home | 8 | 8 | 8 | 8 | 8 | 8 | **8.0** |
| /about | 7 | 8 | 8 | 8 | 8 | 8 | **7.8** (mobile burger clips a heading) |
| /work | 8 | 8 | 8 | 7 | 7 | 8 | **7.6** (not re-read closely) |
| lumicap | 8 | 8 | 8 | 7 | 8 | 8 | **7.8** (carried, depth control assumed same as 2 checked cases) |
| cosap | 8 | 8 | 8 | 8 | 8 | 7 | **7.9** (carried) |
| gocrypto | 9 | 8 | 8 | 9 | 8 | 9 | **8.4** (steps list + phone, depth control inline in TOC) |
| pac | 8 | 8 | 8 | 7 | 8 | 7 | **7.6** (carried) |
| zalo | 8 | 8 | 8 | 8 | 8 | 7 | **7.9** (carried) |
| reorc | 8 | 8 | 8 | 8 | 8 | 7 | **7.9** (carried) |
| cortex | 8 | 8 | 8 | 8 | 9 | 8 | **8.2** (single left rail with Skim / Read / Deep, no stacked pills) |
| guardline | 8 | 8 | 8 | 8 | 8 | 7 | **7.9** (carried) |
| ledgr | 8 | 8 | 8 | 7 | 8 | 8 | **7.8** (carried) |
| **Mean** | | | | | | | **7.90** |

Console errors: 0 on every page load (home, about, work, 2 cases, 1440 and 390).
Home height 16,191 px at 1440 (limit 16,000, 191 px over; R5 15,771). **Watch this: the picker section grew home past the cap.**

## Pick your character (zoom-to-hero)

- **Looks right.** Mono kicker "WHO'S VISITING?", big display heading, a "Hey stranger" chip, then 12 pastel tiles with clay busts popping over the top edge. White ground, hairlines, nothing busy (`ui/picker-before-d.jpg`).
- **Role counts hide below 3** (verified: only Founder 26 and Engineer 9 show a pill; all ten others are empty strings). R5-D3 is fixed. Tile labels no longer wrap ("Product designer" fits at 1440).
- **Zoom-to-hero** (`R6-shots/data/pick-d.json`, `ui/pick-d-sheet.jpg`): picked tile grows to a 505 x 506 card with a 176 px waving figure, "That's you / Engineer / Writes the code". Layout is last changing at **1329 ms** after click (spring `sheet`), visually settled by ~0.9 s. Intro paragraph collapses, grid glides, no jump, no layout flash. Nice.
- **Live stats** render as three big numbers: `38 visitors so far`, `#38 your visitor number`, `12 engineers like you`, plus a one-line "You're visitor #43 · 17 engineers / Founders are leading so far." That is calm and honest. Country flags: **could not verify.** Local dev has no geo, so `visitor-countries` is empty (the row is correctly absent, no empty box). Flag logic is read from `stats-copy.ts` only (`flagOf`).
- **Cost:** hero card 506 px tall makes this the one heavy moment under the marquee (C2 allows one). Home is now 191 px over the 16,000 target.

## The platformer guide, measured

Data: `data/pick-d.json` (drop-in), `walk2.json`, `jump2.json`, `fall.json`, `fall2.json`, `sweep-{1440,768,390}.json`.

| Behaviour | Measured | Verdict |
|---|---|---|
| Drop-in after pick | appears at 417 ms, falls 126 px in ~370 ms, small 3 px rebound, grounded 932 ms; then rides the tile up 102 px as the intro collapses | good, one gesture |
| Walk (right) | eased 0 to ~210 px/s, 765 to 930 px over 0.75 s, y constant (error 0.0 px) | smooth, no wobble |
| Jump (up) | peak **120 px**, air time ~650 ms (39 frames), squash min 0.874 on landing | right height, bouncy, not floaty |
| Fall when its surface scrolls away | surface leaves under the nav at ~410 ms, guide drops 110 px, lands at 765 ms with squash 1.061 x 0.889, settled by ~1000 ms | exactly the bouncy landing asked for |
| Fall on fast scroll up | feet go to 917 then **1355 px** in a 900 px viewport (off screen) for ~300 ms, hit the floor, then hop up to a new surface by 1384 ms | works, but the character leaves the screen (GAP-I6-D6) |
| Feet vs headings and paragraphs (cap line) | error **-0.4 to +0.3 px** at 1440, 768, 390 | feet are exactly on the text edge |
| Feet vs cards, figures, images | error **3.5 to 11.6 px** (feet inside the card top) on 9 of 30 positions at 1440, similar at 768 and 390 | not exact (GAP-I6-D3) |
| Feet error across all 3 widths | max 32.8 / 24.2 / 27.4, mean 3.7 / 4.3 / 4.1 px | headline mean fine, tail is lifted cards and carousel items |
| Overlap with links, buttons, tiles (30 positions each) | **0** at 1440, **1** at 768 (PAC chip 28 x 27), **2** at 390 (16 x 6 and 49 x 13) | R5-D1 fixed |
| Overlap with text, headings, stat numbers | **14 / 30** at 1440, **18 / 30** at 768, **18 / 30** at 390 | main gap (GAP-I6-D2) |
| Big buttons | none. Hint is one mono line, bubble 188 to 228 px, no pills | on spirit |
| Shadow | none | on spirit |

Visual proof of the cover problem: `guide/sweep-1440-03.jpg` (guide stands on the rank line and hides "#38" and "YOUR VISITOR NUMBER") and `guide/fallsheet.jpg` (after the fall it stands on the paragraph under "Data people can trust, with 40% less rework." and its body sits in front of the heading words).

## R5 gap status

| R5 gap | Status | Evidence |
|---|---|---|
| I5-D1 guide covers taps | **FIXED** | 0 / 1 / 2 overlaps in 90 positions (was 10 of 36 at 768) |
| I5-D2 permanent pills | **FIXED** | no pills; one hint line |
| I5-D3 zero counts on tiles | **FIXED** | counts only at >= 3 |
| I5-D4 stacked sticky depth pill | **FIXED** | Skim / Read / Deep is now inside the left TOC control (`pages/case-sheet.jpg`) |
| I5-D5 say-my-name chip size | **NOT RE-CHECKED** | /about not zoomed on the chip this round |
| I5-D6 poll looks unfinished | **OPEN** | still six rows with "1, 0, 0, 0, 0, 0" under a counts-only list (`ui/poll-d.jpg`) |
| I5-D7 heavy picker | **SUPERSEDED** | the zoom-to-hero panel is now the approved direction; cost is the 191 px home overrun |
| I5-D8 guide stands on headings | **PARTIAL** | cap-line alignment exact (0.3 px) but it now stands on paragraphs and covers headings (D2 below) |

## New gaps

**GAP-I6-D1 | CONCERN | arrow keys do not walk the guide after you pick a role; they scroll the page back up**
Evidence: `walk.json` (first run): after clicking a tile and scrolling down, pressing Right/Left changed `scrollY` from 3900 to 1424 and the guide did not walk; second run (`walk2.json`, focus blurred) walks fine. Cause: the picked hero tile keeps focus, `shouldHandleGuideKey` refuses keys on `role=radio`, and the radiogroup's own arrow handler moves focus to the next tile, which scrolls the picker into view.
Fix: (1) `visitor-panel.tsx` onSelect: only refocus the tile when the pick came from the keyboard (`event.detail === 0`); on pointer picks call `document.activeElement.blur()` after the glide. (2) `guide-logic.ts` `shouldHandleGuideKey`: when the target is inside `[role=radiogroup]` but that group is outside the viewport (`getBoundingClientRect` fully off screen), return true and let the guide take the key. Add a unit test for both.

**GAP-I6-D2 | CONCERN | guide stands on a paragraph and its 112 px body covers the heading or number above**
Evidence: text covered at 14 / 30 (1440), 18 / 30 (768), 18 / 30 (390) positions; `guide/sweep-1440-03.jpg`, `guide/fallsheet.jpg`. Examples: "#38" 58 x 50 px, "Data people can trust" 68 x 82, "Building with people" 68 x 72, "Pick your character" 68 x 56 (390).
Fix: `guide.tsx` `collect()` filter (line ~205): in addition to `coverage(...) === 0` for links, reject a surface when `bodyRect(chooseStandX(...), top)` overlaps any `h1,h2,h3,p,figcaption,[data-testid=visitor-stats-strip]` rect (outside the standing element) by more than 120 px2. A paragraph just under a heading then is not standable; the heading's own top still is. Keep surfaces beside the text column (cards' empty margins) as they are today.

**GAP-I6-D3 | OBSERVATION | feet sink 4 to 16 px into lifted or scaled cards**
Evidence: ARTICLE rows err 3.9 / 7.0 / 10.7 / 11.6 px at 1440 and 390, Creatio card 15.7 px (hover lift 12 px), `guide/sweep-1440-24.jpg`. The surface is measured on scroll, not when a card's hover lift or sticky-stack scale finishes.
Fix: `guide.tsx`: when `pointerover`/`pointerout` or `transitionend` fires on the standing element, set `scrollUntil = performance.now() + 650` so the per-frame `refreshSurfaces` runs for the transition. Or standing on `offsetTop` chain for ARTICLE (ignore transform).

**GAP-I6-D4 | CONCERN (dev-measured) | clicking a project card gives no feedback for 1.8 to 2.9 s**
Evidence: `data/morph.json`: click at 0 ms, URL still `/` and h1 unchanged until **1832 ms** (run 1) and **2929 ms** (run 2); screenshots 80 to 1700 ms (`ui/morph-sheet.jpg`) show the home page unchanged and only the dev "Rendering" badge. This is `next dev` compiling on demand, so production will be faster, but there is also no pressed state on the card to cover any wait.
Fix: `LiftCard`/case link: add an immediate `data-pending` press (scale 0.98, `SPRING.press`) on `pointerdown`, call `router.prefetch(href)` on `pointerenter`/in view, and re-time this on `next build && next start` before judging the 4 s fix from 077962d.

**GAP-I6-D5 | OBSERVATION | poll still looks like an unfinished form (R5-D6)**
Evidence: `ui/poll-d.jpg`: six rows, counts "1, 0, 0, 0, 0, 0", no bars, orphaned section. Fix: show the rows with no number until `total >= MIN_POLL_VOTES`, drop the "0" and "1" values, and tuck the poll into the footer contact block.

**GAP-I6-D6 | OBSERVATION | guide leaves the screen on a fast scroll up**
Evidence: `fall2.json`: feet y 917, 1038, 1355 in a 900 px viewport for about 300 ms, then floor at 571 ms. Fix: in the paint step of `guide.tsx`, clamp `body.y` to `scrollY + maxFeetY(view)` for the visual transform only, so the fall always ends on the floor line and the following hop is seen.

**GAP-I6-D7 | OBSERVATION | mobile hamburger sits on top of headings**
Evidence: `pages/mobile-sheet.jpg`: "Want to get in touc[burger]" at 390 on /about and the home footer. Fix: hide the burger on scroll-down and show on scroll-up (same behaviour as the desktop pill), or give section headings `pr-14` below 768 px.

**GAP-I6-D8 | OBSERVATION | home is 191 px over its height cap, picker grid has a dead cell**
Evidence: `DH 16191` at 1440; `ui/pick-d-sheet.jpg` frame 6: 11 small tiles around the hero leave the last grid cell empty beside "Skip". Fix: make "Skip" a small text link under the grid (frees one row, about 190 px) and keep the grid at 3 columns x 3 rows.

## Check against the spirit

| Check | Result |
|---|---|
| C2 Calm | home at rest is quiet; only the hero card is heavy |
| C4 One language | picker uses existing tokens and springs; guide uses `SPRING` family only |
| C5 Smooth and accessible | motion smooth; D1 breaks keyboard play for mouse users who picked by click |
| C7 Grown-up playful | one character system, no score or streak; hint is one dry line |
| C10 Optional | guide never takes a tap (0 link overlaps at 1440), but it does cover reading text (D2) |

## What to do next (ordered)

1. D1 (keyboard hijack): one small fix, biggest functional bug.
2. D2 (cover text): the single change that moves the guide from "charming" to "polished".
3. D8 and D5: give back the 190 px and calm the poll.
4. D3, D6: finish polish on the landing and the off-screen fall.
5. D4 after a production build timing.

## Unresolved questions

1. Country flags cannot be seen locally (no geo in dev). Does Thao want a `?geo=VN` dev override so flags and country counts can be reviewed?
2. Card-to-case speed is a dev measurement. Is there a production build on another port to re-time?
3. Seven case pages (lumicap, cosap, pac, zalo, reorc, guardline, ledgr) and the say-my-name chip were carried, not re-read.

**Status:** DONE_WITH_CONCERNS
**Summary:** Site average 7.9 (R5 7.8). The pick-your-character section and the guide's motion (walk, 120 px jump, bouncy fall landing, feet exact on text edges) are on-spirit and polished. Eight new gaps, led by two real problems: arrow keys scroll the page instead of walking the guide after a click-pick, and the guide's body covers headings or stats at about half of all scroll positions.
**Concerns/Blockers:** Dev-server timings only; country flags and seven case pages not verified.
