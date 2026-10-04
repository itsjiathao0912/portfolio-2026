---
name: report:autoresearch-ux-iteration-002
date: 04-10-26
metadata: {type: report, feature: portfolio-site, loop: autoresearch-ux, iteration: 2}
---
# Iteration 002 — research summary + fix assignment
Inputs: research/R2-design.md (21: 7 FAIL, 9 CONCERN, 5 OBS; avg 6.9/10; M1 pass, M2 desktop pass/mobile fail, M3 FAIL lift 16–23px + stiff spring), research/R2-functional.md (23: 7 FAIL, 8 CONCERN, 8 OBS; gates green except e2e 116/10 stale specs).
Note: gap count rose vs iteration 1 (14 → 31 above OBS) because iteration-2 research is stricter and measured (lift px, canvases, hydration, tap targets), not because fixes regressed; no previously-clean area broke except F5 (side effect of iteration-1 break-words) — counted as 1 regression, under the 2-regression halt threshold.
Decisions: /work black cards → light (Thao's minimal direction); LinkedIn embeds unchanged pending Thao's "own cards / keep embeds" answer.
Fix lanes (sonnet, disjoint):
- FX-1 shell/system: nav glass blur (unprefixed backdrop-filter, fill 0.72, blur 24) D3/F1; remove footer doodle canvas F6; SSR-safe useReducedMotion hook (hydration root cause); LiftCard total lift 10–14px + softer iOS spring M3/D2/D9; footer/nav tap targets; mobile menu tab leak.
- FX-2 home: coin drag distance F2 + Enter setPointerCapture error; ticker pause on focus; mobile chip rail follow + pill M2/D4; Ledgr stamp legibility D7; hero dot-grid canvas D20; project jump 120px gap; update stale home e2e specs (dot grid, mascot, chapters, coin, globe; story.spec untracked).
- FX-3 case/work: toc.tsx keyframes runtime error D1; TOC label overflow F4; stat mid-number wraps F5; ReOrc blank chart D6; CompareSlider + case hero hydration via shared hook; mobile section pill over footer; /work black cards → light; tap targets in case interactives; stale case e2e specs.
- FX-4 about: career rail drag velocity double-scaling F3.

## Fix batch results (iteration 2)
- FX-4 c34046d — career rail drag 1:1 + snap (unit-tested; browser unverified): APPLIED.
- FX-1 f1abcb6, 0fd1136, 3ef5356 — SSOT reduced-motion hook @/lib/use-reduced-motion, nav glass blur Chromium, footer canvas removed, LiftCard 12px rise on all sizes + softer spring, tap targets, inert behind mobile menu: APPLIED. Leftover: 5 gem files with stale uncommitted emitStamp edits + unused doodle-pad.
- FX-2 71d0b1f — coin drag/Enter, ticker focus pause, mobile chip rail follow, light cards, single canvas, jump gap, new home.spec.ts (not run): APPLIED. Leftover: highlights lead tile dark; unmounted mascot + src/components/story/* untracked.
- FX-3 1b87a99 — TOC keyframes error, TOC overflow, stat nowrap, ReOrc chart, hydration (17 files), section pill vs footer, /work light cards, tap targets, guard spec (not run): APPLIED; BACKLOG: proportional bar segments, 3 borderline inputs.
Pending Thao: LinkedIn own cards vs embeds.
