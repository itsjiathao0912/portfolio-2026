---
name: report:autoresearch-ux-r8-design
description: "Iteration 8 design skeptic: guide on drawn edges, clay quality, flags, poll, modal, stamp, emoji, 3 widths. Read-only; 5 lanes were editing live."
date: 04-10-26
metadata: {node_type: memory, type: report, feature: portfolio-site, phase: autoresearch-ux}
---

# R8 design audit (iteration 8)

Read-only on src. Dev :3003, HEAD `6bbe1de` plus uncommitted guide edits (guide.tsx, guide-dom.ts, guide-logic.ts, role-tile.tsx) from the physics lane, so the guide findings are a snapshot of work in flight. No new commit landed in the guide area during my run (`git log` re-checked at the end). Shots, scripts, JSON in `R8-design-shots/` (`m1/m4.json` sweeps, `guide-montage.png` = 30 guide crops, `modal2-1440.png`, `poll-voted-1440.png`, `stamp-1440.png`, `work-hdr-1440.png`).

## Score: design 7.8 / 10 (R7 8.0)

Down 0.2: clay, poll, modal, stamp and header are clearly better than R7, but the guide still does not meet Thao's standing rule (feet on a visible edge, never inside a card or on empty space) and sits on text at several positions. Everything else on her list passes or is a small concern. No console errors; no horizontal scroll at 1440 / 768 / 390 on home, about, gocrypto, cortex-sentinel.

## Standing-feedback checklist

| Thao's ask | Verdict | Evidence |
|---|---|---|
| Guide always on a visibly drawn top edge, never inside a card / empty space | **FAIL** | see Measured |
| Guide never fades | PASS | opacity product 1.0 and visibility visible at 30/30 positions x 3 widths |
| Feet flush with surface | **FAIL** (partial) | see Measured |
| Speech bubble stays still while visible | PASS (moves only via the 320 ms slide) but **CONCERN** detached, see GAP-2 | |
| Clay: high quality, anime-ish, solid shoes, role outfits/props | PASS | chibi heads, big glossy eyes, solid dark shoes, headset+laptop (engineer), beret (designer), grad cap (student), hijab (PM) in `h-picked` / `modal2` shots |
| Nothing stretched in change-role modal | PASS | 4/4/3 equal tiles, last row centred, no empty cell (`modal2-1440.png`) |
| All visitor-country flags with hover tooltip | PASS by code, **unverifiable live** | cluster `li` with `role=tooltip` (stats-strip.tsx:59); local dev only yields Vietnam, so multi-flag wrap not seen |
| Poll colourful with clay voter avatars | PASS | pastel green/pink fill bars + clay faces (`poll-voted-1440.png`); unvoted state is plain white (fine) |
| Selected-work pill top aligned with title | PASS | pill top 531 vs title cap top ~535 at 1440 |
| SHIPPED stamp ~2x | PASS | 240x144 (was ~120x72) at 1440/768, 150x90 at 390 |
| Animated 3D emoji: project list AND case pages | PASS list + case TOC; **CONCERN** case hero tile | list/TOC use `public/emoji/*.webp`; case hero logo tile is still a letter "G" / "C" |

## Measured (guide, home only, role picked, 1440, 30 scroll positions)

Guide exists on home only (as spec'd); about and case pages have no guide, so "30 positions per page" applies to home (sh 15,987 / 17,652 / 16,742 at 1440 / 768 / 390).

| Check | Result |
|---|---|
| Strict probe: `elementFromPoint` 2 px under sole box, drawn edge top within 2 px, or viewport floor | pass **1/30** (1440, 900 ms settle), **9/30** (1440, 1800 ms settle), 2/30 at 768, 0/30 at 390 (900 ms settle). Typical miss: box bottom 9-11 px BELOW the card top, i.e. the clay box has about 10 px of transparent bottom margin or the guide is still settling. |
| "Inside a surface" (point 4 px above sole lies in a card whose top is >6 px above) | 8-12 of 30 at every width |
| Pixel truth (montage, human read of 30 crops) | roughly 12/30 feet visibly flush on a card/panel top (11, 12, 13, 16-20), about 9 on empty canvas (e.g. 3, 5, 7, 14, 22), about 6 overlapping text or graphics (0, 6, 8, 21, 14, 4) |
| Fade | 0/30 faded |
| Console errors | 0 |

Because the strict probe and the human read disagree, I trust the montage for the verdict and the probe as a lower bound; both say "not yet".

## Gaps

**FAIL-1 | guide not on a drawn edge: 40% flush, ~30% empty space, ~20% on text** (area: guide physics)
`work-hdr-1440.png`: guide stands ~90 px BELOW the "Money corridors" card in empty page space next to "Selected work". `stamp-1440.png`: feet 400 px inside the Lumicap card. Montage 0/6/8/21: body covers "dules", "Cha·nge" (VNG Game Challenge), a black CTA, "15% use". Fix `guide-logic.ts` surface collection: stand only on tops of elements with bg/border/shadow/media/hr and reject surfaces whose top is more than 2 px from the rest position; when none is within reach, land on the viewport floor (a drawn edge by Thao's rule) instead of a floating point. Also reject surfaces where the 112 px body overlaps text rects (carried from R7 GAP-1, still open).

**FAIL-2 | feet not flush: box bottom is 9-11 px below the surface top in ~15 of 30 samples** (area: guide / clay)
Constant offset suggests either the clay SVG viewBox leaves ~10 px under the shoes or physics rests at `top + 10`. Fix: in `guide-physics.ts` rest at `surface.top - footInset` where footInset is measured from the avatar viewBox (`clay/avatar-spec.ts`), or crop the viewBox so shoe soles are the box bottom. Add a unit test: `bodyRect.bottom - surface.top === 0` after settle.

**GAP-1 | CONCERN | guide lands on the picker tile label** (area: guide + picker)
`home-1440-s3.png`: guide stands on the Founder tile, covering "Founder 86" and overlapping the clay bust; the hint pill sits on the tile top. R7 FAIL-1 variant, still reproducible. Fix: `collect()` reject `closest('[role=radio]')` and `[data-testid=visitor-title]`.

**GAP-2 | CONCERN | speech bubble detaches from the guide and covers content** (area: guide bubble)
`poll-voted-1440.png`: bubble "Notes from the build, straight from LinkedIn." floats over the first poll option text while the guide is 250 px away on a hairline; `stamp-1440.png` shows the same orphan bubble over a card, with the wrong section line ("LinkedIn" copy beside the Lumicap card). Still stays still, but a bubble with no speaker plus covered copy is worse than none. Fix `guide.tsx` bubble anchor: hide when the bubble rect is >120 px from the body, and run the same text-overlap rejection on the bubble rect.

**GAP-3 | CONCERN | clay labels sit on the clay bodies in the picker** (area: clay / picker tiles)
`h-picked-1440` and `home-1440-s3.png`: "Recruiter", "Data", "Investor", "Student" are printed over the torso, black text on navy/blue clothing (Data, Investor) with low contrast. Fix `role-tile.tsx`: bottom-anchor the label on a 28 px white-to-transparent plate, or crop the bust 12 px higher.

**GAP-4 | CONCERN | case hero uses a letter tile, not the animated emoji** (area: case pages)
`gocrypto-1440-top.png`, `cortex-1440-top.png`: "G" / "C" in a white square, while the TOC beside it already shows the project emoji. Fix `case-study/*` hero header: reuse `project-emoji.tsx` at 44 px in place of the letter tile.

**GAP-5 | CONCERN | mobile stamp and header sizes unchecked on small screens with the 2x stamp** (area: stamp)
Stamp is 150x90 at 390 (was under 90 wide); on a 390 card the stamp covers the card's top-right and may clip "Case study" corner. Not visually broken in `stamp-390.png`, but worth a width cap of 40% of card.

**OBS-1 | OBSERVATION | gray, low-saturation emoji** in the TOC: GoCrypto (grey globe) and PAC (pale cloud) read dull next to the saturated money-bag and toolbox. Pick livelier glyphs (`project-meta.ts`).

**OBS-2 | OBSERVATION | stamp nearly touches the "Founder view" caption** at 1440 (`work-hdr-1440.png`, stamp top 612 vs caption bottom ~602). Fine, but tight.

**OBS-3 | OBSERVATION | single flag cluster looks lonely** with one country ("VISITORS FROM 1 COUNTRY" + one flag). Expected on dev; check with 3+ countries on staging data.

**OBS-4 | OBSERVATION | dev badge** ("Compiling ..", N logo) appears in every shot; production-only concern, none.

## What is working (keep)

- Clay system: consistent chibi style across tiles, modal, poll faces, stats; solid shoes and role props make roles legible at tile size.
- Change-role modal: equal tiles and a centred last row; no stretched or empty cells.
- Poll: pastel fill bars, clay voter faces, clear "Vote saved. 2 votes so far · tap another to change".
- Stamp at 2x lands on the card edge, reads as a real stamp; "Selected work" header and "You: Founder · change" pill share a baseline.
- Calm picker and stats strip from R7 are intact; no console errors.

## Priorities for iteration 9

1. FAIL-1 + FAIL-2 + GAP-1 (single guide-physics change: only drawn edges, zero-offset rest, text and radio rejection); re-run `m4.mjs` and accept at >= 28/30 strict.
2. GAP-2 (bubble detach rule).
3. GAP-3 label plate, GAP-4 hero emoji.

Status: DONE_WITH_CONCERNS. Design 7.8/10; 2 FAIL (guide edge/flush), 5 CONCERN, 4 OBSERVATION; guide strict pass 1-9/30, human-read ~12/30 flush.
