# Iteration 007 — 04-10-26
Design 8.0/10 (R6 7.9). Functional: clean HEAD a586de3 green on typecheck/lint/425 unit/build:cf; e2e 205/206.
Sources: research/R7-design.md, research/R7-functional.md.

## Gaps (above OBS): 2 FAIL, 9 CONCERN
- FAIL D-hint: guide hint bubble covers title after pick (1440), clips "you?" (768).
- FAIL F-fx6: fx6-feedback.spec fails 3/3 (600ms budget; _rsc listener registered too late).
- CONCERN: guide over text 9/10/12 of 30; dup location + count mismatch (15 vs 16); phone picker 1,617px + guide on tile; modal empty cell + off-centre; picked home 16,155px.
- CONCERN: glossary term 30px tall (F2); depth-pill no arrow keys (R5-F9); burger box over heading on scroll-up; isolated runner no dirty-tree guard (F9).
- Open by source: F5 poll without role, F7 Shift+arrow walks guide.
## Fix lanes
- FX-A visitor/guide; FX-B tests/a11y/nav/runner.
