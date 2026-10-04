---
name: design:spirit
description: "Living source of truth for Thao's design taste: core spirit, loves, rejects, decision checklist (C1-C10), tone of voice. Every new idea must pass the checklist."
date: 04-10-26
metadata: {type: design, feature: portfolio-site, loop: autoresearch-ux, owner: lane-D, status: living, revision: 2}
---

# Design spirit (living document)

**BLUF.** Thao's site is a quiet, white, black-type fintech portfolio with Apple-smooth motion and a few grown-up jokes. Her real story and real numbers are the decoration. Since R4 she has embraced ONE character system, the original clay people, because it carries her story (who you are, who she is). Anything else that needs a character, a dark slab or an invented figure is still the wrong idea.

Update rule (rev 2, post-R4 approvals are in section 2b): append to Loves/Rejects whenever Thao approves or rejects something; bump `revision`; never delete a line, strike it through and date it.

## 1. Core spirit (read this, skip the rest if rushed)

1. **Minimal and posh.** White ground, black type, hairlines, one blue accent, navy ink only for small marks (stamp, ticker numbers). Space and typography do the work, not boxes and colour.
2. **Apple/iOS-smooth.** One spring family, cards that lift and settle, sheets that glide, nothing that snaps or bounces forever. Calm first, delight second.
3. **Fun and playful, never busy.** Wit lives in small gems (type "thao", footer taps, a "Copied" check) and in dry copy, not in mascots or things that move on their own.
4. **Fintech credibility.** Payments, compliance and ledgers are the language. Every number is sourced and labelled; honesty is the brand.
5. **Her story, only.** Vietnam, Zalo to SkyLab, community builder, women in tech, Ledgr, Cortex Sentinel. Real photos beat illustration; real facts beat adjectives.

## 2. Loves (approved or praised; use as the bar)

| Loves | Evidence |
|---|---|
| Reference-site hero structure: floating pill nav, huge name/role headline, B/W portrait, logo strip, stacked project cards with sticky TOC | user-decisions + `reference-site_REPORT`; "back to the reference structure" in round-6 SPEC |
| Rotating hero word ("I build billing engines...") and the cursor-reveal casual line | round-6 SPEC: "the part Thao loves" |
| SHIPPED-style stamp landing on each card's top edge (once) | Must-have M1 |
| Emoji side nav / TOC with a sliding active pill, seamless surface | Must-have M2 |
| iOS lift-and-pop card hover, one language everywhere | Must-have M3 |
| Liquid glass for floating chrome only (nav pill, sheets, segmented thumb) | round-3 `liquid-glass-nav`, SPEC 3.1 |
| Clay avatars + walking guide (optional, quiet), now built: role tiles under the marquee, live stats, story lines, arrow-key play | `visitor-identity_SPEC` (locked), built P3-P5, **explicitly loved** (2b); one character style site-wide |
| Real photos (Build Stuffs room, AABW) and real stats cards with sourced captions | people section; "Photo moments" kept |
| Case-study depth: interactive blocks that are decisions the reader makes (Cortex gate, GoCrypto calculator, Ledgr contract check) | R4-placement #41 |
| Hidden gems with zero layout cost: secret word "thao" sketch mode, footer name x5, playful 404 | R4-placement #17-19 |
| Single "get in touch" moment (coin to "Settled") | R4-placement #13 |

## 2b. Approved since R4 (rev 2, newest truth; overrides older rows where they differ)

| Approved or asked for | What it means for new ideas |
|---|---|
| **Clay "who are you" tiles right under the logo marquee**, with live stats (role counts, country counts, visitor number) | The clay role system is the loved centrepiece. New ideas should reuse the clay avatars and the role, not add a second character or a second picker. |
| **Walking clay guide**: story lines per section, arrow-key play mode, hide control | Loved when quiet. Still capped (passive lines <= 6, <= 90 chars each, home only, static under reduced motion). Extend by giving it better lines or reactions, never more roaming. |
| **Her own LinkedIn cards over third-party embeds** | Open tension 2 is closed. Own markup always beats an embed (C6, C9). |
| **Ideas 1-4 built**: Ask me about, Disclosures sheet, Say my name, Saigon desk | Credibility furniture and small human moments are the right size of idea. Reuse the sheet, the Copied check and the chip style. |
| **Poll reinstated with 6 options**, including AI-agent fintech directions (back-office agent, safe payments for AI agents) | Open tension 1 is closed: poll lives in the visitor system, real counts only, percentages hidden until the vote threshold (20). Agent-fintech is a direction she wants to be seen exploring. |
| **"Polish everything: on-brand, smooth, not busy"** | Finish and consistency beat new features. An idea must replace something or cost less than 80 px of new height. |
| **"Show everything" for content, but no invented numbers** | Surface all real material (cases, photos, awards); every figure keeps label and source (C1). Draft copy is fine only if flagged for her review. |
| **Hidden gems kept**: secret word "thao", 404 game, flag burst | Gems with zero layout cost are welcome; more of that kind, no new always-visible toys. |

## 3. Rejects (do not propose again without a new reason)

| Rejected | Why (her words or the audit's) |
|---|---|
| Dark full-screen slabs, gradient chapter bands, pinned empty stages | "huge blank areas"; dark band budget on home = 0 |
| Childish characters (Settle coin face, sprout, thick-outline smileys, mascot "Noto") | "off-style"; clip art next to a fintech headline. Clay people (soft plasticine, human proportions) are the one approved exception |
| Empty viewports and background-only blocks over 35% | SPEC 3.6 |
| Forced gimmicks: scramble nav text, magnetic dock, custom cursors, community cursors, doodle pad, passport, greeting toast, light beams | R4-placement #28-33; "restless" |
| 8 live 3D canvases, 3D shield, 3D scroll phone on home | WebGL contexts lost; no story link. Canvas count <= 1 |
| Invented or unconfirmed numbers (Cortex "-186 reviewed", Guardline 5/5/4 split, fake poll percentages) | user-decisions round 5; "no fabricated stats" |
| Gamification (stamps 0/6, scores, streaks) | R4-placement #27 |
| Third-party icon/avatar packs where she wants one original style (DiceBear retired by visitor-identity) | visitor-identity AC9 |
| Customer names from confidential decks; verbatim deck quotes | round-5 decision 2 |
| Third-party embeds that can blank or log errors (LinkedIn iframes, `requestStorageAccess` noise) | she chose own cards (2b) |
| Percent bars on a tiny poll; any poll or stat number shown before real votes exist | 2b; threshold 20 |

## 4. Decision checklist (an idea must pass all ten; cite by number)

- **C1 Real.** Built only from confirmed facts; every figure carries a label (Live, Backtest, Target, Company figure) and a source. No invention, no "100+" as fact (Ledgr = 27 seeded rules, 100+ is roadmap).
- **C2 Calm.** At most one heavy moment per viewport; nothing infinite beyond marquee, ticker, rotating word, globe idle; at least 30% of any viewport is content.
- **C3 Serves the story.** It helps a recruiter skim, a founder trust, or an engineer dig, and it leads toward the work or the contact. Decoration alone fails.
- **C4 One language.** Existing tokens only: radius `--r-sm..xl/full`, shadows 1-3, springs `ui/indicator/press/sheet/tilt/lift/stamp/glide`, tints. No new motif beyond the navy stamp and the green "Settled" check.
- **C5 Apple-smooth and accessible.** Spring motion, 44 px targets, keyboard path, `prefers-reduced-motion` honoured, Vietnamese diacritics render.
- **C6 Posh minimal.** White/canvas ground, black type, hairlines; glass only for floating chrome; no dark or gradient section.
- **C7 Grown-up playful.** Wit is dry and small; no characters beyond the approved clay people; no gamification (scores, streaks, 0/6 counters).
- **C8 Original.** Own drawing and code. Never copy another site's assets, layout code or copy; reimplement technique only.
- **C9 Light.** At most one canvas per page, lazy loaded, no new heavy dependency, no third-party call that can blank the UI (fail to static text).
- **C10 Optional.** Dismissible, never blocks or covers a tap target, content works without the effect, no layout shift.

## 5. Tone of voice (copy)

- First person, plain, specific: "I took Cortex Sentinel to 2nd place at Agentic AI Build Week 2026." Not "passionate about leveraging".
- Dry wit, one joke per section at most; payments puns are welcome when exact (settled, ledger, receipt, reconcile).
- Numbers carry their label and source in the same breath: "6.5% auto-closed (backtest, sample data)".
- Short sentences, active verbs, no em dashes, no hype words (elevate, seamless, unleash, passionate, innovative).
- Vietnamese names with correct diacritics (Gia Thảo, Chợ Tốt). English only for now.
- Honest about limits: "unconfirmed" and "company figure" are features, not weaknesses. Clients are "a manufacturing client", never named.
- Address the visitor as a peer; never "Hi there!" chatbot energy.

## 6. Constants to remember

- Palette: `--bg #fff`, `--canvas #f7f7f7`, ink `#000/#1a1b1f/#6b6c72`, accent `#2563eb`, navy ink `#0b1533`, success `#15803d`; pastel tints only behind avatars and project cards.
- Type: wide display face for headings, IBM Plex Sans body, IBM Plex Mono for labels.
- Motion: reveal = opacity + 16 px, 520 ms, once; card lift 12 px with a small overshoot (`SPRING.lift` 150/13).
- Layout targets: home <= 16,000 px at 1440; case studies are the proof and should be most of the site.

## 7. Open tensions (decide with Thao)

1. ~~Poll: block vs chip~~ **closed rev 2**: reinstated, 6 options, real counts, hidden percentages under 20 votes. Draft option labels are still "DRAFT (Thao to review)".
2. ~~LinkedIn embeds vs own cards~~ **closed rev 2**: own cards.
3. **Guide copy.** All story lines are DRAFT drafted from `content/`. Loved as a system; each line still needs her eye (C1: any digit must also appear in `content/`).
4. **Women-in-tech claims.** No verified statistic exists in the repo; copy about it must be her own experience, not a number (C1).
5. **Busy budget on home.** Home now carries tiles, stats, guide, poll, marquee, ticker. Any addition must remove or fold something, or live behind a tap (C2, C10).
6. **Read-only polish debt**: hygiene items in `HANDBACK` (radius leaks, raw hook usage) are polish, not new features; they serve "polish everything".

## 8. Sources distilled

`foundation-research_03-10-26/`: `user-decisions_NOTE`, `reference-site_REPORT`, `round3/{liquid-glass-nav,wow-ideas,motion-ideas}`, `round5/signature-ideas`, `round6/design-consolidation_SPEC`; `autoresearch-ux-261004_04-10-26/`: `research/R1-R4`, iteration reports 001-003, `HANDBACK`; `visitor-identity_04-10-26/` SPEC, RESEARCH, PLAN; R4 brainstorm and placement; commits P1-P6 (tiles, stats, poll, guide, clay avatars). Rev 2 approvals come from Thao's messages relayed by the orchestrator, not from files. Her direct quotes are sparse in the files; "loves" are inferred from the must-haves and decisions she delegated or confirmed.
