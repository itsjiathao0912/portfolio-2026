---
name: report:autoresearch-ux-iteration-005
date: 04-10-26
metadata: {type: report, feature: portfolio-site, loop: autoresearch-ux, iteration: 5}
---
# Iteration 005 — research summary + fix assignment
Research: A design R5-design.md (avg 7.8 flat; 4 CONCERN 4 OBS new; guide block covers taps/headings; depth pill sticky over content; home busiest yet), B functional R5-functional.md (2 FAIL: card-click 4s transition freeze in transition-link.tsx, e2e red from 2 stale specs; 6 CONCERN), D spirit R5-brainstorm.md (6 ideas). Visitor-identity EVL 001: visitor gates green at b126819; full e2e 189/5 (non-visitor).
Concurrent: Thao-directed clay rework lane (guide physics, picker section redesign) owns src/components/site/visitor/** — guide/picker findings routed there.
Gaps above OBS (deduped): FAIL 2, CONCERN 9 → 11.
Fix lanes: FX-A shell+infra (transition-link freeze, ask-me same-tab role, playwright outputDir isolation), FX-B case (depth pill scroll-away + 44px, stale gocrypto/cosap specs, tap debt). Visitor store items (legacy persona count, retry failed visit POST) → rework lane.

## Fix batch results (iteration 5)
- FX-A 077962d: transition freeze fixed (<1.5s e2e), ask-me same-tab, per-run e2e output: APPLIED.
- FX-B 16c1af5: depth pill inline + TOC control, GoCrypto step buttons, cosap spec, 44px timeline stops, inert bar segments: APPLIED. BACKLOG: R5-F9 radiogroup arrow keys.
- Rework 1ee48c7 (Thao-directed): platformer guide, character picker section + live stats, modal fix, visit retry + change event: APPLIED. Open: residual guide overlap, 0-count pills, poll restyled not hidden.
