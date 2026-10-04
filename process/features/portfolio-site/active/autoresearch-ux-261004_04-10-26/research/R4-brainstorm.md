---
name: research:R4-brainstorm
description: "Iteration 4, lane D: 8 new spirit-fit ideas that deepen Thao's story (fintech/compliance PM, community, women in tech, Vietnam), ranked by spirit-fit x delight / effort. Checked against R4-placement and the visitor-identity plan."
date: 04-10-26
metadata: {type: report, feature: portfolio-site, loop: autoresearch-ux, iteration: 4, lane: D}
---

# R4 brainstorm: new ideas that fit the spirit

**BLUF.** The site has enough toys; what it lacks is *credibility furniture* and *small human moments* that are true to Thao. Best 3: (1) role-aware "Ask me about" conversation starters in the contact module, (2) a fintech-style "Disclosures" sheet explaining how every number is labelled, (3) a "Say my name" chip for Gia Thảo. All are small (S), calm, built from existing tokens, and need no new canvas, character or invented figure.

Checklist C1-C10 is in `../DESIGN-SPIRIT.md` §4. Every idea below was checked against: R4-placement inventory (#1-56, B1-B15), the visitor-identity SPEC/PLAN (role picker, clay avatars, walking guide, geo greeting, live stats, poll), and the dropped list (shield, passport, poll-as-block, characters, cursors, wall, doodle, mascot, greeting, scramble text, magnetic dock). None repeats them. Read-only pass; no source touched. All art and code are to be original (C8).

## Ranking

Score = spirit-fit (1-5) x delight (1-5) / effort (S=1, S-M=1.5, M=2). Ties broken by delight.

| Rank | Idea | Fit | Delight | Effort | Score | Busy risk | Needs from Thao |
|---|---|---|---|---|---|---|---|
| 1 | "Ask me about" conversation starters | 4 | 4 | S | 16.0 | Low | 4-6 real topics |
| 2 | Disclosures sheet ("How I label numbers") | 5 | 3 | S | 15.0 | None | Approve wording |
| 3 | "Say my name" chip | 4 | 3 | S | 12.0 | None | Pronunciation text |
| 4 | Saigon desk (clock popover: overlap hours) | 4 | 4 | S-M | 10.7 | Low | Working hours |
| 5 | Rule explained (one Ledgr rule in plain English) | 5 | 4 | M | 10.0 | Medium | Legal accuracy check |
| 6 | Pay-it-forward card (Student / Fellow PM roles) | 5 | 3 | S-M | 10.0 | Low | Her tips, consent to offer chats |
| 7 | Gratitude ledger (/about) | 4 | 4 | M | 8.0 | Low | Names and consent |
| 8 | Résumé sheet (iOS bottom sheet) | 4 | 3 | S-M | 8.0 | None | Current CV PDF |

Build order suggestion: 2, 1, 3 together (one lane, shared sheet + Copied check), then 4, then content-dependent 5-8 as Thao supplies copy.

---

## 1. "Ask me about" conversation starters

- **Visitor sees.** Inside the Say-hello module, after the coin settles (or beside the email pill), 3-4 quiet chips under the line "Not sure what to say? Start here." Chips are role-aware via the visitor-identity role: Recruiter sees "Ledgr: how I scoped 27 rules"; Founder sees "Cross-border payments, the unglamorous parts"; Engineer sees "Rules decide, AI explains". Tap = copies a one-line opener and opens the email draft with a pre-filled subject; the chip shows the green Settled check ("Copied").
- **Where.** Home contact module (B13 fused contact block) and the case-study footer's "Next / Contact" strip. No other pages.
- **Why it fits.** C3 (leads straight to contact, helps the shy recruiter), C1 (topics are her real work), C4 (reuses the B8 Copied check and the segmented-chip style), C10 (ignorable). Not a chatbot: static copy, zero AI.
- **Effort.** S. Content file + one chip row; subject lines in `content/`.
- **Risk of busy.** Low if capped at 4 chips and hidden until the module is in view.
- **Cut line.** If it adds more than 80 px to home, show chips only after the coin is settled.

## 2. Disclosures sheet: "How I label numbers"

- **Visitor sees.** A small "Disclosures" link in the footer (and a tiny "i" on each evidence badge from B4). Opens an iOS-style bottom sheet (spring `sheet`, grabber, glass chrome only): four chips with one plain sentence each. Live: running in a real product. Backtest: run on sample data, not production. Target: a goal, not a result. Company figure: published by the employer, not my outcome. A closing line in the style of a financial footnote: "Client names are withheld. Diagrams are redrawn, not copied from decks."
- **Where.** Global footer; also opened from any evidence badge. One sheet component.
- **Why it fits.** C1 (turns her honesty discipline into a visible feature), C3 (a fintech hiring manager reads disclosures), C6 (white, hairlines, text), C4 (the sheet and the B4 chips already exist in the system). The tone is the joke: a portfolio with a compliance footer.
- **Effort.** S. One sheet, four strings; shares the sheet with idea 8.
- **Risk of busy.** None; invisible until opened.
- **Needs.** Thao approves wording; keep the four labels identical to the B4 enum.

## 3. "Say my name" chip

- **Visitor sees.** On /about, the "Gia Thảo" line gets a small chip "Say it" (no audio). Tap or focus opens a 220 px popover: the name with its tone marks set large, a plain phonetic line, and one gentle English comparison. Keyboard and touch work; the existing flag-emoji burst gem stays on hover.
- **Where.** /about intro only (not the nav, not home).
- **Why it fits.** C7 (small, warm, grown-up), C1 (true and cultural), C5 (diacritics render, which the SPEC already tests), C10 (optional). It makes Vietnamese typography a feature, which suits the Vietnam thread without any illustration.
- **Effort.** S. Popover pattern shared with the glossary hover (B1).
- **Risk of busy.** None.
- **Needs.** Thao writes the phonetic line herself; no audio (no-sound rule).

## 4. Saigon desk (clock popover)

- **Visitor sees.** The nav's "It's 00:05 in Saigon" clock becomes tappable. A small glass popover shows: Saigon time, the visitor's own time, and the honest overlap: "Your 20:00-23:00 is my 07:00-10:00." If there is no office-hours overlap: "No office-hours overlap; I am happy to take a call in my evening." A last line pulls from the existing facts: "Now: building Ledgr, shipping COSAP." (from `content/`, Thao edits).
- **Where.** Nav clock, all pages, desktop popover and mobile sheet.
- **Why it fits.** C3 (answers a real recruiter question: can we work together across time zones), C1 (pure arithmetic from the browser, no stored data), C7 (the clock is already the loved human touch), C4 (glass chrome, `SPRING.ui`). Vietnam and cross-border payments in one tiny object.
- **Effort.** S-M. `Intl.DateTimeFormat` only; no API, no weather. The visitor-identity timezone from `cf` can replace the browser guess but is not required.
- **Risk of busy.** Low; it only opens on tap. Do not add weather (C9: third-party call).
- **Needs.** Her working hours and what "Now" should say.

## 5. Rule explained (one Ledgr rule in plain English)

- **Visitor sees.** In the Ledgr case study, a quiet card: one of the seeded Vietnamese labour or tax rules written the way a founder would understand it, with the document type, the rule in one sentence, and "Source: seeded rule, verified in the pipeline". A "Show another" chip steps through three hand-picked rules (no autoplay, no infinite loop).
- **Where.** `/work/ledgr` inside the interactive block region, and a one-line teaser in the highlights footer ("27 verified rules across 6 document types; 100+ is the roadmap").
- **Why it fits.** C1 (the 27 count is code-accurate; 100+ is labelled roadmap), C3 (compliance PM credibility, Vietnam specificity an international recruiter cannot fake), C4 (card + evidence badge "Live").
- **Effort.** M. Content curation and a legal read-through are most of the work; component is a flip of the existing decision-card style (B3).
- **Risk of busy.** Medium on home, so keep home to the text teaser only.
- **Needs.** Thao confirms each rule's wording; mis-stating a law would break C1.

## 6. Pay-it-forward card (Student and Fellow PM roles)

- **Visitor sees.** When the visitor picks Student or Fellow PM in the new role picker, one of the guide lines (or a plain card in the stack header) becomes: "Three things I wish I had known before my first PM job" with three short, specific lines, then an optional "Ask me a question" link that reuses idea 1's chips. No stats about women in tech; her own experience only.
- **Where.** Home project-stack header and /about, shown only for those two roles. Replaces a guide line, never adds one (guide cap stays 6).
- **Why it fits.** C1 (her voice, no number to invent; see Open tension 4), C3 (community builder thread: Creatio, Build Stuffs, mentees), C7 (warm, not cute), C10 (role-gated, dismissible).
- **Effort.** S-M. Mostly writing.
- **Risk of busy.** Low (role-gated). Cliché risk is the real risk: generic tips would fail C1.
- **Needs.** Thao writes the three tips and decides whether to offer chats at all.

## 7. Gratitude ledger (/about)

- **Visitor sees.** A hairline, double-entry style table titled "Credits": left column a person or community (first name or group + role), right column one line on what they taught or opened. Totals row in the footer: "Balance: owed, forever." Rows reveal with the standard stagger; hover lifts a row 2 px (`LiftCard` row variant).
- **Where.** /about, after Experience, before Skills. Not on home.
- **Why it fits.** C7 (fintech wit that is also sincere), C3 (shows she builds with people: mentors, teammates, Build Stuffs hosts, Creatio team), C6 (a table, no illustration), C4 (existing row variant).
- **Effort.** M (content gathering and consent), build is S.
- **Risk of busy.** Low; keep to 6 rows max.
- **Needs.** Every name needs the person's consent; use "Build Stuffs hosts" or a role when in doubt.

## 8. Résumé sheet

- **Visitor sees.** A "Résumé" item in the footer and the mobile menu. Tap opens the same iOS bottom sheet as idea 2: "Résumé in 20 seconds" with current role, previous roles in one line each, three headline facts (each labelled), languages, location and time zone, and two buttons: Download PDF, Copy link. Order of the three facts follows the visitor's role.
- **Where.** Footer and mobile menu only; no new section on any page.
- **Why it fits.** C3 (recruiters ask for a CV in the first minute; none exists on the site today, verified by search), C1 (facts from the CV, Feb 2023 Zalo date per her decision), C5 (sheet spring, 44 px buttons), C10.
- **Effort.** S-M. Needs the final PDF and print-safe copy.
- **Risk of busy.** None.
- **Needs.** Current CV PDF and permission to host it.

---

## Considered and parked

| Idea | Why parked |
|---|---|
| Event ticket stubs (Build Stuffs #33, AABW 2026, Marketing Arena 2021) | Strong content but a perforated-ticket motif is a third ink motif (breaks C4). Revisit as plain `LiftCard`s with a "Receipt no." mono label if Thao wants an events strip. |
| Live "currently building" feed from GitHub | Third-party call (C9) and an always-changing claim (C1). The static "Now" line in idea 4 covers it. |
| Currency flip (VND to USD on Creatio's ~200M VND raised) | Needs an exchange rate and date; invented precision (C1). |
| Visitor receipt / "your visit" summary | Passport-style gamification, already rejected (R4-placement #27). |
| Reading shelf with one-line takes | Needs her list; low story link, risks decoration (C3). |
| Vietnamese language toggle | Out of scope (English only for now). |

## Unresolved questions

1. Does Thao want a CV hosted on the site at all (idea 8), and which version?
2. Which 4-6 conversation topics are true for her work, and are the role-aware lines OK to write in her voice?
3. Is she comfortable naming mentors or teammates in the Credits table, and should women in tech be an explicit theme or stay implicit?
4. Which Ledgr rules are safe to explain publicly (idea 5), and who verifies the plain-English wording?
5. Pronunciation line wording (idea 3) and her real working hours (idea 4).

**TL;DR:** Build the credibility and contact furniture first (starters, disclosures, name chip, Saigon desk); they are cheap, calm and true. Rule explained, pay-it-forward, gratitude ledger and résumé wait on Thao's copy and consent.

---
**Status:** DONE
**Summary:** Wrote the living DESIGN-SPIRIT.md (core spirit, loves, rejects, checklist C1-C10, tone, open tensions) and R4-brainstorm.md with 8 new ranked ideas checked against R4-placement and the visitor-identity plan.
**Concerns/Blockers:** Read-only on source; Thao's direct quotes are sparse, so "loves" are inferred from her must-haves and delegated decisions. Five ideas depend on her copy or consent. Poll status conflicts between R4-placement (drop) and visitor-identity SPEC (keep with threshold); logged as an open tension.
