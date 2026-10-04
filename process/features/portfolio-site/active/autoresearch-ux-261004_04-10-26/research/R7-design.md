---
name: report:autoresearch-ux-r7-design
description: "Iteration 7 design skeptic: visitor picker (title, 2-row grid, picked hero, stats), always-on guide overlap sweep, home height, change-role modal, 3 widths."
date: 04-10-26
metadata: {node_type: memory, type: report, feature: portfolio-site, phase: autoresearch-ux}
---

# R7 design audit (iteration 7)

Read-only. Dev server localhost:3003 (dev-mode timings; dev geo fallback = Vietnam, so flags are real but counts are local). Shots + scripts + raw JSON in `R7-shots/` (`s2.json` sweep, `s3/s5.json` heights, `modal.png`).

## Score: design 8.0 / 10 (R6 7.9)

The picker is now the best section on the site: calm, flush, one idea. The score only moves +0.1 because the guide still lands on text and the picked state has duplicated, slightly inconsistent copy. Page scores: home 8.1, about 7.9, gocrypto 8.3, cortex-sentinel 8.2 (carried: 1440 / 768 / 390 all clean, no console errors, no horizontal scroll).

## Measured

| Check | Result |
|---|---|
| (a) guide body over text, 30 scroll positions, picked state | **9/30 at 1440**, 10/30 at 768, 12/30 at 390 (R6 14/18/18 by a looser metric; mine counts only text-line rects with >6 px overlap on both axes, so not exactly comparable, but still not zero). Headings hit at 1440: hero H1 (68x22), "Hello stranger..." H2 twice (68x21), stats line, card titles "Business Hackathon", "AWS Solutions Architect". |
| (b) home scrollHeight 1440 | **15,947 unpicked (pass), 16,155 picked (FAIL by 155)**. 768: 17,369; 390: 17,374 (no target, but 1.1x desktop). |
| (c) change-role modal | **Empty 12th cell confirmed** (`modal.png`): 4x3 grid, 11 roles, bottom-right blank. Grid also stops ~40 px short of the right padding, so it looks off-centre. |
| Picker unpicked 1440 | 6 + 5 tiles, "Just curious" spans two columns so the grid is flush, 2 rows, 746 px section. Good. |
| Picker picked 1440 | Hero 1.7fr + 5x2, hero height = grid height, stats centred. Looks right. |
| Picker 390 | **1,617 px tall, 6 rows of 2 tiles** (picked: 1,682). Two full screens before any content. |

## Gaps

**FAIL-1 | FAIL | guide and its hint bubble sit on the new title** (`guide/*` + `picker-after-1440.png`)
At 1440 right after a pick, the "← → to walk · ↑ to jump" bubble covers "from Vietnam" in the H2, and the guide stands on the location chip. At 768 the bubble clips the "you?" of the title. This is the first thing a visitor sees after picking. Fix: `guide.tsx` collect(): exclude any surface whose body-or-bubble rect overlaps `[data-testid=visitor-title]`, `h1,h2,h3`, `[data-testid=visitor-stats-strip]` (bubble rect included, not just body); and in `visitor-panel.tsx` land the drop-in on the picked hero card top edge (empty, 400 px wide) instead of the title row.

**GAP-1 | CONCERN | guide covers headings/card text on ~30% of positions, standing on `li` cards** (`s2.json` hits)
Examples: AWS / Oracle / Business Hackathon card titles (68x98 px), "Top countries 🇻🇳 Vietnam 17", "Where I've shipped" list. Cards are valid surfaces by feet but the 112 px body then hides their title row. Fix: `guide.tsx` collect(): for card surfaces, prefer the card's top edge only if `bodyRect` overlaps no text rect inside the card (reuse the heading rect filter), else offer the card's right-side empty margin or skip. Add a unit test over the 30-position sweep, target 0 headings.

**GAP-2 | CONCERN | home 155 px over cap when a role is picked** (`s3.json`)
Hero card grows the section by ~210 px vs unpicked. Fix `visitor-panel.tsx` / `stats`: drop the third stat row duplicates (see GAP-3) and the 55 px location chip when picked; that alone recovers ~100 px. Also trim `mt-6 ... pt-5 gap-y-8` between grid and stats rule (~30 px).

**GAP-3 | CONCERN | picked state says everything twice, and the numbers disagree** (`picker-after-1440.png`)
Title says "from Vietnam 🇻🇳", chip repeats "You're visiting from Ho Chi Minh City, Vietnam 🇻🇳"; stats row says "18 ENGINEERS LIKE YOU" and "Vietnam 15", then a summary line says "18 engineers · 16 from Vietnam" (15 vs 16: your own count is added to one but not the other). Also "60 visitors" and "#60" read as the same fact. Fix: remove the location chip when the title already has the country; delete the summary line `visitor-summary` (stats already say it) or make it a single sentence; make country count and top-countries pill use the same `+1` rule in `stats-copy.ts`. This also fixes spirit C-"never busy".

**GAP-4 | CONCERN | mobile picker is a 1,617 px wall** (`picker-after-390.png`, `home-390-*`)
2 columns x 6 rows with 150 px tiles, and on the picked state the guide (hint pill + body) lands in front of the "Fellow PM" clay person, so two characters overlap. Fix `visitor-panel.tsx` line ~241: at <640 use a horizontal snap scroller (one row, 112 px tiles, "Just curious" last) or 3 columns with 96 px tiles (4 rows, ~900 px); keep hero card above it. Forbid guide surfaces that sit on a `role=radio` tile (`collect()` reject `closest('[role=radio]')`).

**GAP-5 | CONCERN | change-role modal: empty cell, off-centre grid** (`modal.png`)
Fix `visitor-modal.tsx`: make "Just curious" `col-span-2` (same trick as the section grid) or use 3 columns x 4 rows; give the grid `w-full` so right padding matches the left (currently ~41 px gap right vs 29 left).

**OBS-1 | OBSERVATION | hint bubble overlaps the next card's icon** (`guide-1440-6.png`): "Numbers on platforms and data, with sources." bubble covers the purple icon of "Hành trình kinh doanh". Bubble should flip to the side with free space (left of the guide when the right neighbour has content). `guide.tsx` bubble placement.

**OBS-2 | OBSERVATION | large dead white bands on case pages** (`gocrypto-768-2000.jpg`: ~150 px of nothing between the chart card and "Tension"; cortex 1440 shows a 130 px gap around the pull-quote). Calm is good, but these read as missing content. Cap `section` margins at ~96 px on desktop, 72 px on tablet.

**OBS-3 | OBSERVATION | /about at 390: "Say it" chip wraps beside the name** and pushes the flag/city line to a second ragged line (`about-390-0.jpg`). Put chip on its own line under the name or make the location line `flex-wrap` with the chip last.

**OBS-4 | OBSERVATION | top-countries row with one country looks lonely** ("TOP COUNTRIES [Vietnam 15]"). Show the row only at >= 3 countries (same rule as role counts) or phrase it "Most visitors: Vietnam".

**OBS-5 | OBSERVATION | cortex-sentinel is 18,476 px at 390 and 17,058 at 1440** (longest page). Not a defect for a deep case study; mention for the skim/read/deep control: default Read length is the biggest scroll on the site.

## What is working (keep)

- Title "Hello stranger from {Country} {flag}, who are you?" is on-voice, 1 line at 1440, 2 balanced lines at 768.
- Flush 2-row grid with spanning "Just curious" removes the last orphan; clay busts popping over tile tops give depth without shadows.
- Picked state: hero equals grid height, centred big-number stats, hairline rule above; zoom spring is calm.
- Zero console errors, zero horizontal scroll at 1440 / 768 / 390 on home, about, gocrypto, cortex-sentinel.

## Priorities for iteration 8

1. FAIL-1 and GAP-1 together (one `collect()` rewrite: reject surfaces whose body or bubble touches heading/stat/radio rects), then re-run the 30-position sweep, goal 0 heading hits.
2. GAP-3 + GAP-2 (copy dedupe) to pull home under 16,000 picked.
3. GAP-4 / GAP-5 (mobile picker and modal grid).

Status: DONE_WITH_CONCERNS. Design 8.0/10; 1 FAIL (guide + bubble on the title), 5 CONCERN, 5 OBSERVATION; guide text overlap 9/30 (1440), home 15,947 unpicked / 16,155 picked, modal empty cell confirmed.
