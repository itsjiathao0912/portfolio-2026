---
name: report:autoresearch-ux-r5-design
description: "Iteration 5, lane A (design skeptic): audit of the new visitor features (role tiles, walking clay guide, stats, poll, ask-me, disclosures, say-my-name, Saigon desk, case reading aids, clay avatars) against DESIGN-SPIRIT C1-C10, with R4 gap status."
date: 04-10-26
metadata: {node_type: memory, type: report, feature: portfolio-site, phase: autoresearch-ux}
---

# R5 design audit (iteration 5, lane A)

Read-only on source. Shots: `R5-shots/` (all 12 pages at 1440 and 390, `sheets/`, `guide/`, `ui/`, `motion/*.json`, scripts in `scripts/`).

**Evidence caveat (read first).** The working tree changed under me. Full-page shots (06:55 to 07:08) and the guide passive/engaged run are the **committed HEAD** (b126819). From 07:13 builders edited `guide.tsx`, `guide-controls.tsx`, `visitor-panel.tsx`, `stats-strip.tsx`, `role-tile.tsx` and `page.tsx` (uncommitted): a big "Pick your character" panel replaces the tile row, the chip no longer opens a modal, the guide controls shrink to a hint line. Anything marked "WT" below was seen on that uncommitted tree. I did not re-shoot every page after the edits. The change-role modal was never captured at HEAD (read from source only). About, /work and 7 of 9 case pages were captured but only Cortex and GoCrypto were inspected closely this round; the rest carry R4 scores (no files changed).

## Totals

- **Site average 7.8 / 10** (R4 7.8). Home 7.7 (new features add charm, plus one real cover problem), /about 7.8, /work 7.5, case studies 7.9 (reading aids helped).
- **R4 gaps (13 open or partial tracked): 3 fixed, 3 partial, 7 open/unverified.**
- **New gaps: 8 (1 FAIL-leaning CONCERN on the guide covering tap targets, 3 CONCERN, 4 OBSERVATION).**
- Console errors: 0 on all 24 page loads (`steps-log.json`). Home 15,771 px at 1440 (limit 16,000), 16,250 at 390. Canvas count 1 (globe).
- Verdict on calm: **home is still calm at rest, but it is the busiest it has been.** Count above the fold of Selected work: tile row with 12 tiles, live line, leader line, privacy line, walking character, bubble, two pills, ticker, globe, stats cards. The guide plus its pills is the one thing I would cut back.

## Per-page scores

| Page | Layout | Type | Colour | Motion | Cohesion | Delight | Avg |
|---|---|---|---|---|---|---|---|
| Home | 8 | 8 | 8 | 8 | 7 | 8 | **7.8** |
| /about | 7 | 8 | 8 | 8 | 7 | 8 | **7.7** (say-my-name +, rail leaks open) |
| /work | 7 | 8 | 8 | 8 | 7 | 7 | **7.5** (carried) |
| lumicap | 8 | 8 | 8 | 7 | 8 | 7 | **7.7** (carried) |
| cosap | 8 | 8 | 8 | 8 | 8 | 7 | **7.8** (carried) |
| gocrypto | 8 | 8 | 8 | 9 | 8 | 9 | **8.3** (phone walkthrough placed and works) |
| pac | 8 | 8 | 8 | 7 | 8 | 6 | **7.5** (carried) |
| zalo | 8 | 8 | 8 | 8 | 8 | 7 | **7.8** (carried) |
| reorc | 8 | 8 | 8 | 8 | 8 | 7 | **7.8** (carried) |
| cortex | 8 | 8 | 8 | 8 | 8 | 8 | **8.0**; reading aids good, sticky pills crowd the top |
| guardline | 8 | 8 | 8 | 8 | 8 | 7 | **7.8** (carried) |
| ledgr | 8 | 8 | 8 | 7 | 8 | 7 | **7.7** (carried) |
| **Mean** | | | | | | | **7.8** |

## Judgement of the new features

- **Role tile row + greeting under the logo marquee (HEAD).** Fits the spirit: calm grey band, 12 square tiles with clay busts, "Hey stranger / Who are you?" in the display face, privacy line, no modal gate. Tiles are small (about 66 px) with 10 px labels and a "0" under almost every tile; zero counts read as an empty room (C1 honest, C2 weak: it advertises that nobody is here). Fix below (D3).
- **Chip + modal.** Chip is clean (44 px, avatar, "You: Founder · change"). Modal not captured at HEAD; source is a native dialog, 92dvh cap, focus managed: sound. WT removes the modal for an inline panel; fine either way, but the WT panel (one huge feature tile plus a 4x3 grid) is much heavier than the strip it replaces.
- **Walking clay guide (HEAD run, 1440).** Motion is good: drop-in eases about 600 ms after scroll settles (y 98 to 513 in 37 frames, max 18 px/frame), it clamps under the nav while you scroll and lands later, walking is a steady 3.5 px/frame (about 220 px/s), jump peaks about 62 px and returns in about 1 s. No jitter, no infinite loop at rest. The character itself is charming (68 x 112, correct tint per role, headphones for Engineer). Bubble copy is short and specific ("Start here: a product person who builds."). **But it fails C10.** The group is character + bubble + two pills = 316 x 132 px parked in the right margin. At 1440 the project cards reach x 1400, so it sits on the card's stat bar and "Case study" button in several sections (`motion/guide-passive.json` hits: "Case study : Lumicap" 214x47, laptop image, headings). On tablet and phone it is worse: at 768, 10 of 36 scroll positions have a link or button whose centre is under a guide element (`motion/guide-cover.json`); at 390 the bubble sits over headings ("The AI reads the", "Building with people") and over the "You: Founder · change" chip. The permanent "Walk with me" and "Hide character" pills add a second piece of chrome to every viewport. Engaged mode adds a third box (key hint) that covers list rows when walked left. Pointer-events on all of it are on, so taps do not reach the card underneath.
- **Speech bubble.** Copy good (2 to 4 lines, no hype). Placement left or right of the character, 228 px wide, glass: fine, except it hides content as above. The "1 / 3 · TAP FOR MORE" mono line is the right size.
- **Live stats line.** "You're visitor #12 · 11 founders" then "Founders are leading so far. That's you." Dry and honest, no percentages under 20 votes. Good, a little long (3 lines of grey under the tiles).
- **Poll near footer.** Works, honest note "Be one of the first 20 votes". Sits alone in a 640 px column after LinkedIn with all counts "0" and a faint border on white: it looks like an unfinished form. Calm, but low reward.
- **Ask-me chips.** Good. Three role-specific mailto chips under the email CTA, one line of mono label. Best new feature for C3. Chip text 12 to 13 px with 44 px hit area.
- **Disclosures sheet.** Clean 520 px dialog, 5 labelled definitions with real examples. On-brand, honest. Last item needs scroll at 900 px height (fine).
- **Say-my-name chip (/about).** Wit lands ("The hỏi mark on ả makes the voice dip, then lift, like a quiet question."). Chip is tiny (about 30 px tall, 11 px text, next to the name) and the popover covers the next heading. Under 44 px on touch.
- **Saigon desk popover.** 300 x 259 below the nav clock, timeline bar plus overlap sentence. Useful, not busy. On mobile the trigger was not found at 390 (nav collapses to a menu), so it is desktop-only: fine.
- **Case reading aids (Cortex, GoCrypto).** Dotted glossary terms are subtle and right. Role badge "Thao owned" tiny but clear. Decision cards and the results band ("2nd / 6.5% / 0" with labels "Public result", "Backtest, sample data") are the strongest honest-numbers moment on the site. **Depth pill (Skim / Read / Deep dive) is sticky under the floating nav**, so two pills stack at the top for the whole read and the second one covers the top edge of content (Cortex "Next step" button row, "What was real" header).
- **GoCrypto phone walkthrough.** Pinned phone with 5 captioned steps on desktop, carousel on mobile. Clean, calm, the best motion on the site. On mobile the phone image sits under the caption with a good swipe affordance.
- **Clay people avatars.** Stacks in "Building with people" read as one original style, replacing DiceBear. Small (24 to 28 px) but coherent.
- **LinkedIn cards.** Whole images now visible (R4-D1 fixed: infographics are no longer cropped), one link per card, equal heights. Still white on white (see D2).

## R4 gap status

| R4 gap | Status | Evidence |
|---|---|---|
| I4-D1 LinkedIn image crop | **FIXED** | `home-d-sheet4` shows whole NAPAS and payments images |
| I4-D2 LinkedIn card edge | **OPEN** | cards still white on white section, faint ring |
| I4-D3 empty space around Say hello | **FIXED** | Say hello folded into footer (`home-d-sheet4`) |
| I4-D4 "Delivered" copy | **FIXED** | module gone |
| I4-D5 /work 136 px blank | **OPEN, unverified** | /work not re-measured |
| I4-D6 mobile hero 6 lines | **OPEN, unverified** | not re-measured |
| I4-D7 mobile LinkedIn heading gap | **OPEN, unverified** | |
| I3-D7 cards without LiftCard | **OPEN** (not re-checked) | no commit touches these files |
| I3-D8 video preload | **OPEN** (not re-checked) | |
| I3-D9 case TOC hover | **OPEN** (not re-checked) | |
| I3-D10 rail crop, globe list | **OPEN** | /about rail still hard-cropped |
| R2-D14 radius leaks | **PARTIAL** | new components use tokens; device-frame radii untouched |
| R2-D16 stamp ink | **OPEN** | sub-label still tiny in `home-d-sheet1` |
| R2-D18 globe dots | **PARTIAL** | globe card reads slightly stronger, still grey |
| R2-D3 nav glass | **FIXED** (0.9, hairline) | clean over all text in this run |

## New gaps

**GAP-I5-D1 | CONCERN (blocks taps) | walking guide group | covers cards, headings and links, takes taps**
Evidence: `motion/guide-passive.json` (hits "Case study : Lumicap" 214x47, "ReOrc" button 214x35, Ledgr laptop image), `motion/guide-cover.json` (768: 10 of 36 positions with a covered link centre; 390: bubble over the role chip and headings), `sheets/guide-mobile.jpg`, `sheets/guide-later.jpg` (pills overlap the stat bar).
Fix: `guide.tsx` / `guide-logic.ts`: (1) set the whole layer wrapper and the bubble and pills `pointer-events-none` except the character button and the two pills; (2) in `avoidRects()` also treat the **bubble and pill block** as an obstacle (it currently avoids only the character), and flip the block above the character when it would overlap an `a`/`button` rect; (3) raise `MIN_GUIDE_WIDTH` from 360 to 1024 so phone and tablet get no guide (the page is already a scroll-first layout there); (4) bubble `max-w` 200 and auto-hide after 6 s instead of 9 s.

**GAP-I5-D2 | CONCERN | guide pills | "Walk with me" and "Hide character" are permanent chrome on every viewport**
Evidence: `sheets/guide-pick.jpg`, every frame of `guide/s*.jpg`.
Fix: show the two pills only while the character is hovered, focused or engaged (opacity 0 to 1, `SPRING.ui`), keep one 44 px "Hide" as a tiny x on the bubble; the character button already says "press to walk". Cuts a pill row from every screen.

**GAP-I5-D3 | CONCERN | role tiles | "0" under almost every tile reads as an empty room**
Evidence: `home-d-sheet0` shot 3 (counts 0, 10, 1, 0, 0...). Honest but flat.
Fix: `stats-copy.ts` `tileCounts`: return nothing for a count of 0 (keep the number only when >= 1). Also raise tile label from 10 px to 11 px and tile height so "Product designer" does not wrap to two lines.

**GAP-I5-D4 | CONCERN | depth pill | second sticky pill under the nav covers content**
Evidence: `sheets/case-cortex-sentinel-d-sheet1.jpg` panes 2 and 4 (pill over "Next step"), `sheet4` pane 3 (over "Results").
Fix: `reading/depth-pill.tsx:17` make it non-sticky after the first screen (use `sticky` only until the intro ends), or hide on scroll-down and show on scroll-up like the nav pill, with `SPRING.glide`.

**GAP-I5-D5 | OBSERVATION | say-my-name chip too small**
Evidence: `ui/name-before-d.jpg` (30 px high, 11 px text). Fix: `about/say-my-name.tsx` chip `min-h-11 px-3 text-[12px]`; popover `max-w-[260px]` and open upward so it does not cover "The route so far".

**GAP-I5-D6 | OBSERVATION | poll looks unfinished**
Evidence: `home-d-sheet4` pane 3: six zero rows, hairline on white, orphaned after LinkedIn. Fix: render the poll only when `total >= 3`, or show the rows without "0" values until the first vote; place it inside the footer contact block above the ask-me chips instead of its own 640 px section.

**GAP-I5-D7 | OBSERVATION | working-tree preview: "Pick your character" is heavier than the strip it replaces**
Evidence: `ui/tiles-picked-d.jpg` (WT): one 250 px feature tile + 4x3 grid + stats row (28, #29, 3) takes about 520 px of viewport, with large clay figures. Visually rich but breaks C2 (one heavy moment) right under the logo marquee. Fix: keep the single-row strip at HEAD size; put stats in one mono line.

**GAP-I5-D8 | OBSERVATION | guide stands on headings**
Evidence: `ui/modal2-d.jpg` (WT): feet sit on "Selected work" top edge and the bubble clips the "Se" of the heading. Fix: `FOOT_PAD` and `chooseStandX` should keep 16 px clear of any `h1..h3` rect, or stand on the section's top hairline in the margin only.

## What to cut or simplify (home feels busy at the tile row and during scroll)

1. **Hide the guide pills until hover/focus/engage** (D2). Biggest calm gain, zero feature loss.
2. **No guide below 1024 px** (D1). Phones keep the tile row, ask-me and poll; lose nothing a recruiter needs.
3. **Drop "0" counts and the leader line until there are 3 visits** (D3); merge the stats into one line.
4. **Fold the poll into the footer** or hide until it has votes (D6).
5. **Make the case depth pill scroll-away** (D4) so only one floating pill shows at a time.
6. Keep: ask-me chips, disclosures, say-my-name, Saigon desk, GoCrypto walkthrough, results band, clay avatars. These are the "small gems with zero layout cost" the spirit asks for.

## Unresolved questions

1. Which tree is the baseline for iteration 6: HEAD b126819, or the uncommitted tile-row and guide redesign? Findings D7 and D8 apply only to the latter.
2. Should the guide exist on touch devices at all? The spirit (C10) says optional and never blocking; at 390 it currently is neither.
3. Modal at HEAD not captured; worth one targeted shot if the modal survives.

**Status:** DONE_WITH_CONCERNS
**Summary:** Site average 7.8 (R4 7.8): the new reading aids, ask-me chips, disclosures and GoCrypto walkthrough are on-spirit and honest, and the guide's motion is smooth and calm, but its bubble and permanent pills cover cards, headings and tap targets (worst on phone and tablet). Eight new gaps with exact fixes and a five-item cut list.
**Concerns/Blockers:** Working tree changed mid-run (uncommitted guide and tile-row redesign), so some evidence is HEAD and some is WT; change-role modal not captured at HEAD; /work and seven case pages carried from R4 without a close re-read.
