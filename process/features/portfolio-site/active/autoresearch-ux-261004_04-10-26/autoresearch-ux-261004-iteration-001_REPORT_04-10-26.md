---
name: report:autoresearch-ux-iteration-001
date: 04-10-26
metadata: {type: report, feature: portfolio-site, loop: autoresearch-ux, iteration: 1}
---
# Iteration 001 — research summary + fix assignment

Inputs:
- Lane A (design): ../foundation-research_03-10-26/round6/design-consolidation_SPEC.md — home overloaded (22 interactives, 33,907px), full-screen colour chapter slabs, off-style characters, no shared radius/shadow/motion system, up to 8 WebGL contexts (blank canvases), persona picker change invisible, globe label overlap. Thao must-haves M1 stamp-per-card, M2 seamless side nav + emojis, M3 iOS lift-and-pop card hover, M4 consistency.
- Lane B (functional): research/R1-functional.md — gates green (typecheck, lint, 200 unit, 126 e2e). FAIL: F1 guardline stat overprint, F2 pinned chapter headings under nav, F3 Saigon clock overprints text. CONCERN: F4 empty stages, F5 tap targets <32px, F6 double tab focus (Magnetic), F7 skeleton pulse under reduced motion.

Counts: FAIL 3 (functional) + design-spec must-haves/redesigns tracked as FAIL-equivalent: M1–M4 + chapter removal + character removal + WebGL budget (7) = 10 FAIL; CONCERN 4.

Decisions (Thao delegated): stamp wording per project per SPEC; globe light card, cut if not smooth; build-a-product off home; /about sticker → quiet note; content defaults per user-decisions note (Guardline invented 5/5/4 split removed).

Fix lanes (parallel, sonnet, disjoint allow-lists):
- FX-1 shell/system: tokens, motion springs (lift, stamp), shared card hover, nav, local-time F3, Magnetic F6, tap targets F5 in shell, reduced-motion F7.
- FX-2 home: restructure per SPEC, M1 stamps, M2 side nav, people w/ notionists, ticker, globe light, F2/F4, WebGL budget, owns deps (@dicebear/*).
- FX-3 case studies + /work: F1, M3 adoption on /work cards via shared hover, case TOC testid, GoCrypto targets, Guardline invented numbers.
- FX-4 /about: career rail light, sticker → note, about-specific gaps.

## Fix batch results (iteration 1)
- FX-1 26f2b30 — design tokens, LiftCard, clock in nav (F3), tab stops (F6), tap targets nav/footer (F5), reduced-motion pulse (F7): APPLIED.
- FX-4 58f78c9 — /about light career rail, quiet note: APPLIED.
- FX-2 077e356 — home restructure, M1 stamps, M2 side nav + emojis, LiftCard, notionists people, persona control, light globe, ticker, say-hello: APPLIED; BACKLOG: footer doodle 2nd canvas (handback), 390 height 16,244px, stamp nudge, coin glow.
- FX-3 470bf4d — F1 overprint, Guardline invented numbers removed, radius/shadow rules, ReOrc lines, /work LiftCard (21px lift on 742px card — above band), case TOC emojis + testid; PARTIAL F5 GoCrypto segments (legend buttons instead).
Carry to iteration 2: hydration mismatch on several pages; lint fails on root fx2*.tmp.cjs scratch files; doodle canvas; 390 visual pass of 8 case studies.
