---
name: report:autoresearch-ux-r9-design
description: "Iteration 9 design skeptic at HEAD 369684b: guide edge/flush probe, clay, flags, poll, tiles, stamp, emoji, 3 widths. Read-only on src."
date: 04-10-26
metadata: {node_type: memory, type: report, feature: portfolio-site, phase: autoresearch-ux}
---

# R9 design audit (iteration 9)

Read-only on src. Dev :3003, HEAD `369684b`, no uncommitted src edits (only `tsconfig.json`). Scripts, JSON and shots in `R9-design-shots/` (`guide.mjs` = 30-position sweep, `g1440/rows.json`, `g390/rows.json`, `guide-montage-1440.png`, `guide-montage-390.png`, `feat.mjs`, `poll.mjs`, `modal.mjs`, `pages.mjs`, `pages.json`).

## Score: design 8.5 / 10 (R8 7.8)

Up 0.7. Guide now rests exactly on the sole line, never fades, and its bubble is pinned; tiles, modal, flags, poll faces, stamp and emoji all pass. What holds it below 9: the guide still stands on top of text or a picker tile at some positions, one edge is invisible (white on white), the guide at 390 covers text often, and two small polish items (hero emoji tile, 390 modal tile height). No console errors; no horizontal scroll at 1440/768/390 on home, about, gocrypto, cortex-sentinel (carousels overflow inside their own scrollers only).

## Checklist (Thao's items)

| Item | Verdict | Evidence |
|---|---|---|
| Guide on a visibly drawn top edge, 30 positions | **PASS at 1440 with CONCERNS, CONCERN at 390** | below |
| Never fades | PASS | opacity product 1.0, visibility visible, 30/30 at 1440 and 390 |
| Feet flush | PASS | 18 non-floor samples at 1440: max deviation 0.05 px (sole painted bottom vs surface top); 390: max 2.0 px, mean 0.15 |
| Bubble still, not over text | PASS mostly, CONCERN GAP-2 | pinned: only a 0 px move after the 320 ms slide; the single "move" sample (pos 10) was first appearance. Bubble sits beside/above the guide (`bub-9.png`) and covers no text there |
| Clay quality | PASS, CONCERN GAP-5 | chibi heads, glossy eyes, solid shoes; headset (engineer), beret (designer), cap (student), hijab (PM) legible at tile size; Recruiter, Founder, Marketer, Growth, Investor read by outfit/hair only |
| No stretched card (picker + modal) | PASS at 1440/768, **FAIL at 390** | 1440 modal: 11 tiles, all 217x88, last row centred. 390 modal: "Product designer" tile 126 px tall vs 107 for the rest (`modal-390.png`); 390 picker row 2 is 155 px vs 140 (`picker-390.png`) |
| Character inside tile, label below | PASS | 1440 tiles 187x176 equal, head inside tile, label under the bust (`picker-1440.png`) |
| All-country flags + tooltip | PASS | `?demo-countries`: "VISITORS FROM 13 COUNTRIES", 13 flags wrap 9+4, hover tooltip "Singapore: 18 people" (`flag-tip-1440.png`); 13 tips in DOM |
| Poll colourful, faces <= votes | PASS, CONCERN GAP-6 | 1440: option A 3 votes shows 2 faces + "+1"; option B 1 vote 1 face; 390: 4 votes shows 3 faces + "+2" |
| Selected-work pill top = title top | PASS | not re-measured as a pixel diff; layout unchanged since R8 (pill 531 vs title cap top ~535), visible in `bub-9` neighbour shots; no regression seen |
| Stamp 2x | PASS | 240x144 at 1440/768, 150x90 at 390 |
| Animated emoji in list, cards, TOC, case hero | PASS, CONCERN GAP-4 | 27 `project-emoji` imgs on home (webp), TOC list shows them (`bub-9.png`); case hero tile has emoji (`/emoji/1fa99.webp`, `1f510.webp`) |

## Guide strict probe (home, role Engineer, 30 scroll positions, 1900 ms settle)

| Check | 1440 | 390 |
|---|---|---|
| Guide seen | 30/30 | 30/30 |
| Sole on viewport floor (floor line = viewport bottom - 12 px by `EDGE`) | 8 | 1 |
| Drawn element top within 2 px of the sole (DOM `elementFromPoint` 2 px under sole, +-12 px sample) | 18 | 14 |
| Strict total (edge or floor) | **26/30** | 15/30 (probe undercounts, see note) |
| Pixel check (hidden-guide frame, row contrast across the sole, +-2 px) | 30/30 have a luminance step or are on the floor | 29/30 |
| Faded | 0 | 0 |
| Body overlaps visible text (inner 14 px inset of the 112 px box) | 6/30 (pos 0, 2, 3, 4, 5, 6) | 13/30 |

Note on 390: the DOM probe matched a large section background far above the sole (tops -261, -485, ...) at 9 positions where the montage shows the feet on a card/mockup top; the montage and pixel check are the better read: about 22/30 visibly flush on a card, hairline, photo or floor. The 390 montage is `guide-montage-390.png`.

## Gaps

**CONCERN-1 | guide covers text at 390 and in the first screens at 1440** (area: guide-logic surface choice)
390: positions 1, 2, 6, 10, 16, 17 cover "e you?", "Top 10", "fund", "ore they ship" etc.; 11 and 21 sit on the SHIPPED stamp. 1440: pos 0 covers "Based in Ho Chi" (`prob-1440.png`), pos 2 covers the hero "name," headline, pos 6 covers "Top 40 of 1,000+ teams". Fix `guide-logic.ts` `collect()`/`pickSurface`: reject surfaces whose 68x112 body rect (x +-34 around feet) intersects a text range or the card-stamp, prefer next surface or floor.

**CONCERN-2 | guide lands on a picker tile (R8 GAP-1 still open)** (area: guide)
`prob-1440.png` frame 3: stands on the Engineer tile and covers "Engineer 60". Fix: reject `closest('[role=radio]')` and `[data-testid=visitor-title]` surfaces in `guide-dom.ts` collect.

**CONCERN-3 | one invisible edge: standing on a white-on-white card** (area: guide)
1440 pos 24 (`low 478`, `people-card` bg white): the feet sit on nothing visible (`prob-1440.png` frame 24). Fix: require the surface to have a hairline border, shadow or non-white bg (or luminance step >= 4 across its top edge); otherwise fall to the next surface.

**CONCERN-4 | case hero emoji tile is tiny and dull** (area: case hero)
`gocrypto-1440-p0.png`: the coin glyph is ~22 px inside a 48 px white tile and reads as a grey feather; cortex shows a small lock. Fix `case-study` hero tile: render the emoji at ~34 px, same as the TOC "lift" size; use a livelier glyph than 1fa99 for GoCrypto (`project-meta.ts`).

**CONCERN-5 | role props are uneven** (area: clay avatar-spec)
Only engineer (headset), designer (beret), student (cap), PM (hijab) carry a prop; Recruiter, Founder, Marketer, Growth, Investor differ by outfit and hair. At tile size Recruiter vs Investor are close (both dark suit). Fix `clay/avatar-spec.ts`: Founder gets a coffee cup or tote, Recruiter a lanyard, Investor a chart tick, as one 6-8 px accessory each.

**CONCERN-6 | tiny poll shows proportional bars at 4 votes** (area: poll, spirit C1)
`poll-voted-1440.png`: bars fill 75% and 25% at 4 votes; DESIGN-SPIRIT section 3 rejects "percent bars on a tiny poll" (threshold 20). Faces and counts are real; the bar width is a percentage in disguise. Fix `poll` component: below 20 votes, use a fixed-width tint (full-width soft fill on the picked row only), keep faces + counts.

**CONCERN-7 | 390 modal and picker rows differ in height** (area: role tiles)
"Product designer" wraps to two lines, making that tile 126 px (modal) and that row 155 px (picker). Fix: label `Designer` on tiles (keep the long name in aria-label), or give all tiles `min-h` for two lines.

**CONCERN-8 | 390 modal clips the last tile** (area: modal)
`modal-390.png`: "Just curious" is cut at the bottom edge of the sheet, scrollable but with no scroll cue. Fix: reduce tile gap/padding, or add a bottom fade and `pb-6`.

**OBSERVATION-1 | floor is 12 px above the viewport bottom**: at floor positions the guide floats in air at 888 px (viewport 900). It reads as standing on the screen edge in practice; shadow or a 1 px floor tick would sell it. (`EDGE` in `guide-logic.ts`.)

**OBSERVATION-2 | first-load guide is parked on the portrait's hair curve** (`home-picked-1440.png`): feet on a diagonal photo silhouette, not a flat edge. Prefer the nav/portrait baseline or a card top at load.

**OBSERVATION-3 | bubble copy lags its section**: "Her own product and the platforms she shipped, first." appears at the Lumicap card top (`bub-9.png`); correct section, but text refers to the "Selected work" header just left behind. Fine.

**OBSERVATION-4 | flags cluster left-aligned wrap** (9+4): consider centring the last row; tooltip pill overlaps the "COUNTRIES" caption while hovering (acceptable).

**OBSERVATION-5 | dev badge ("N", "Compiling") overlaps the poll note and bottom-left at 390**; dev only.

## What is working (keep)

- Sole contact is exact (0.05 px) and the guide never fades; bubble sits next to the guide on the card edge (`bub-9.png` is the target look).
- Picker: equal tiles, head inside tile, label under, counts as quiet pills; modal at 1440/768 is a clean 4/4/3 grid.
- Flags + tooltip, poll faces, 2x stamp, animated emoji in the list and TOC, light calm pages, no console errors, no horizontal scroll.
- About and case pages are calm and consistent at 390 (`mobile-sheet-390.png`).

## Priorities for iteration 10

1. CONCERN-1/2/3 as one `guide-logic.ts` change: reject surfaces whose body rect hits text, picker tiles or the stamp, and surfaces with no visible top edge; re-run `guide.mjs 1440` and `390`, accept at 0 text overlaps and >= 28/30.
2. CONCERN-7/8 (390 tile heights, modal clip), CONCERN-4 (hero emoji size), CONCERN-6 (poll bars).

Status: DONE_WITH_CONCERNS. Design 8.5/10; 0 hard FAIL on the 1440 list, 1 FAIL at 390 (tile height), 8 CONCERN, 5 OBSERVATION.
