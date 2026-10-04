---
name: research:R5-brainstorm
description: "Iteration 5, lane D: 6 new calm ideas that deepen Thao's story using the new clay-character system (guide, tiles, avatars, poll). Checked against R4-brainstorm, R4-placement and visitor-identity. Ranked."
date: 04-10-26
metadata: {type: report, feature: portfolio-site, loop: autoresearch-ux, iteration: 5, lane: D}
---

# R5 brainstorm: the clay system, used with restraint

**BLUF.** The clay people are now the loved centrepiece, so the best new ideas make them *say true things* rather than *do more*. Top 3: (1) the guide answers your poll vote with Thao's own one-line first step, (2) clay "mine / team / platform" badges on case-study blocks, using ownership data already in `content/`, (3) a "Resume reading" pill on case studies. All are small, quiet, and add no new character, canvas or number.

Checklist C1-C10: `../DESIGN-SPIRIT.md` §4; approvals: §2b. Read-only pass; no source touched. Original art and code only (C8).

**Checked against (none repeats these):** built: ask-me chips, disclosures sheet, say-my-name, Saigon desk, role tiles, stats, poll (6 options), walking guide, own LinkedIn cards. Planned but unbuilt (R4): rule explained, pay-it-forward, gratitude ledger, resume sheet. Dropped: passport, stamps/scores, poll-as-block, wall of women, cursors, mascot, greeting toast, doodle, scramble text, magnetic dock, 3D. Parked: ticket stubs, currency flip, GitHub feed, visit "receipt" summary.

## Ranking

Score = fit (1-5) x delight (1-5) / effort (S=1, S-M=1.5, M=2).

| Rank | Idea | Fit | Delight | Effort | Score | Busy risk | Needs from Thao |
|---|---|---|---|---|---|---|---|
| 1 | Guide answers your vote | 5 | 4 | S | 20.0 | Low | 6 one-line notes (one per poll option) |
| 2 | Clay owner badges: mine / team / platform | 5 | 3 | S-M | 10.0 | Low | Confirm ownership labels |
| 3 | "Resume reading" pill | 4 | 3 | S-M | 8.0 | Low | None |
| 4 | Her usual day (Saigon desk scene) | 4 | 3 | S | 12.0 | Low | Typical hours, wording |
| 5 | Clay thank-you at "Settled" | 3 | 4 | S | 12.0 | Low | None |
| 6 | Postcard from Saigon | 4 | 4 | M | 8.0 | Low (tap-only) | Approve note copy |

Build order: 1 first (reuses guide + poll, no new surface), then 5 and 4 together (tiny, both in existing modules), then 2, 3, and 6 last.

---

## 1. The guide answers your vote

- **Visitor sees.** After voting in "What should Thao build next?", the clay guide (if not hidden) walks to the poll and says one line in Thao's voice for the option chosen, e.g. for safe payments for AI agents: "Good pick. First I would test the approval step, because that is where trust is won." The poll chip shows the same line as plain text when the guide is hidden. Changing the vote swaps the line. No counts or percentages are spoken; the existing 20-vote threshold still governs the bars.
- **Where.** Home poll only. The line replaces one passive guide line (guide cap of 6 stays); it is a reaction to a tap, so it is not unsolicited.
- **Why it fits.** C1 (opinion, not a number; options are her real directions incl. agent fintech), C3 (shows how she thinks as a PM), C4/C7 (existing guide, existing avatar, dry tone), C10 (works as text when guide hidden).
- **Effort.** S. Six strings in `content/`, one reaction hook in the guide logic.
- **Busy risk.** Low: one line, one walk, after an action the visitor chose.
- **Needs.** Thao writes the six notes; none may promise a roadmap ("I would test X first" is safe, "I am building X" is not).

## 2. Clay owner badges: mine / team / platform

- **Visitor sees.** On case-study decision and evidence blocks, a small chip with a 24 px clay figure: a Thao-dressed figure labelled "Mine", two neutral grey-clay figures labelled "Team", one faceless block figure labelled "Platform". No names, no faces for teammates (nobody is depicted without consent). Hover or focus explains in one line ("Specified and decided by Thao").
- **Where.** `/work/cortex-sentinel` first (it already tags blocks `owned`, `team`, `platform`), then any case with ownership data. The "Filter the map" idea in that case gets a clay legend instead of text-only chips.
- **Why it fits.** C1 (turns her honesty about what she did into a visual, uses data already in `content/projects/cortex-sentinel.ts`), C3 (a founder instantly sees her scope), C4 (extends B4 role/evidence badges), C7 (the single approved character system).
- **Effort.** S-M. Three small poses from `clay/`, a badge component, mapping from the existing `owner` field.
- **Busy risk.** Low; chips are 24 px and replace existing text labels, not add rows.
- **Needs.** Confirm that "Platform" (Marble open source) wording is accurate and that grey, faceless figures are fine for teammates.

## 3. "Resume reading" pill

- **Visitor sees.** Return to a case study you left mid-way and a small glass pill appears near the top: "Continue from Decisions". Tap glides (spring `glide`) to that heading. It dismisses on scroll or after 6 s and never appears on a first visit.
- **Where.** `/work/*` case studies; uses `localStorage` only (heading id and date), no server, no tracking.
- **Why it fits.** C3 (long case studies are the proof; recruiters get interrupted constantly), C5 (smooth, 44 px, keyboard reachable), C9 (no dependency), C10 (dismissible, no layout shift: floating). Not gamification: no percent read, no counters.
- **Effort.** S-M. Heading observer, one storage key per slug, pill with glass chrome.
- **Busy risk.** Low; appears rarely and only on return.
- **Needs.** Nothing.

## 4. Her usual day (Saigon desk, scene by hour)

- **Visitor sees.** Inside the built Saigon desk popover, the clay Thao pose changes with the hour in Ho Chi Minh City: coffee in the morning, at the desk midday, tea in the evening, a moon and "Usually offline" overnight. The label is explicit: "Usual rhythm, not live status."
- **Where.** Existing Saigon desk popover only; no new element on the page.
- **Why it fits.** C1 (rule-based and labelled as such, never claims she is awake right now), C4 (existing popover, existing poses), C7 (human, warm, dry), C9 (`Intl` only, no weather or API).
- **Effort.** S. Two or three poses and an hour table.
- **Busy risk.** Low; tap-only.
- **Needs.** Her typical hours and wording; remove the idea if she prefers no hours shown at all.

## 5. Clay thank-you at "Settled"

- **Visitor sees.** When the visitor copies the email or sends from the contact module and the green Settled check lands, their own role avatar (already chosen in the tiles) waves once for about a second next to the check, then rests. If they skipped the role, nothing extra happens.
- **Where.** Footer contact moment only.
- **Why it fits.** C7 (the single warm beat in a dry site), C4 (existing `wave` pose, existing check), C3 (rewards the action that matters most), C10 (decorative, one-shot, static under reduced motion).
- **Effort.** S. One conditional render and a timer.
- **Busy risk.** Low; one second, after a deliberate tap.
- **Needs.** Nothing.

## 6. Postcard from Saigon

- **Visitor sees.** A quiet "Postcard" item in the footer and the visitor chip menu. Tap opens the iOS bottom sheet: a white card with the visitor's clay avatar in role outfit beside a hand-drawn line skyline of Saigon (own drawing, 2 strokes of ink), a short note from Thao written for their role ("For a founder: bring me your messiest compliance problem."), a navy stamp with today's date and the country name they connected from, and two buttons: "Reply by email" and "Copy link". Nothing is counted, tallied or scored.
- **How it differs from the parked "visit receipt".** No list of what you viewed, no totals, no progress; it is a note from her, not a record of you. If Thao feels it still reads as gamification, drop it.
- **Where.** Sheet only, opened on demand. No new section on any page.
- **Why it fits.** C3 (leads to email), C1 (country from the existing server-side geo, no extra data), C4 (sheet, stamp, clay avatar, Copied check), C6 (white card), C10 (opt-in).
- **Effort.** M. Skyline SVG, six role notes, sheet. Do not add a PNG export in v1 (canvas budget, C9); "Copy link" is enough.
- **Busy risk.** Low; invisible until tapped.
- **Needs.** Thao approves the role notes and the skyline.

---

## Considered and parked

| Idea | Why parked |
|---|---|
| Clay figures reacting to every live arrival (tile avatar waves when a new visitor of that role appears) | Things moving on their own; breaks C2/C7 on a home that already has marquee, ticker and stats. |
| Guide walking through case studies as a tour | SPEC locks the guide to home; a tour on long pages risks covering content and tap targets (C10). Revisit only if she asks. |
| Named clay teammates on case studies | Needs each person's consent and risks confidential client links; neutral figures (idea 2) give the honesty without that. |
| Clay women-in-tech row | Already dropped (wall of women); and no verified statistic exists. |
| Poll result as a growing bar race | Percentages before the threshold read as fake; already rejected. |

## Unresolved questions

1. For idea 1, may the guide speak a short note for each of the 6 poll options, and are agent-fintech notes about direction only (no roadmap promise)?
2. For idea 2, are "Mine / Team / Platform" the right three labels, and are neutral faceless clay figures acceptable for teammates?
3. For idea 4, does she want working hours shown at all?
4. For idea 6, is a role-specific note from her on a postcard still playful, or too close to the dropped receipt?
