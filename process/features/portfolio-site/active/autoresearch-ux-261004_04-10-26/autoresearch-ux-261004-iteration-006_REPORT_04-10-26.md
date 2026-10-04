---
name: report:autoresearch-ux-iteration-006
date: 04-10-26
metadata: {type: report, feature: portfolio-site, loop: autoresearch-ux, iteration: 6}
---
# Iteration 006
Research: A design R6-design.md (avg 7.9; 3 CONCERN, 5 OBS: D1 arrow keys after click-pick, D2 guide covers headings/stats, D4 card feedback, D3/D5/D6/D7/D8), B functional R6-functional.md (0 FAIL; gates all green at 16c1af5 incl full e2e 201/201, build:cf; 4 CONCERN: F1 guide touch targets, F2 glossary/checkbox targets, F3 tile label overlap on phone, F4 stale total after pick; F9 runner builds dirty tree).
Thao direct changes (folded into FX-V): remove Skip; 2-row tile grid with smaller hero, no gaps; centred stats; location line + top countries with flags (dev geo fallback); guide always visible (no hide); no shadow on hero character; title "Hello stranger from {Country} {flag}, who are you?"; Selected work chip + view note right-aligned on heading row.
Gaps above OBS: FAIL 0, CONCERN 7 (deduped).
Fix lanes: FX-V (visitor/guide/picker/poll + Thao changes + F1/F3/F4), FX-S (card pressed state + prefetch, mobile menu overlap). Queued for iteration 7: F2 glossary/checkbox targets, F9 runner builds from HEAD, R5-F9 radiogroup arrows.

## Fix results (iteration 6)
- FX-V `fc60467`: picker (no Skip, 2-row flush grid, smaller hero = grid height, centred stats, location + top-country flags, geo title), guide always-on, D1/D3/D6/F1/F4 fixed, D5 calm poll. Unit 425 pass; visitor e2e 37/37.
- FX-S `a586de3`: D4 pressed state + prefetch (prod-build card→case 444ms), D7 burger hides on scroll-down.
- Carried to iteration 7: D2 guide-over-text unmeasured; home 16,131px (>16,000); change-role modal empty cell; cold-click spec 1.55s vs 1.5s budget; burger can overlap heading on scroll-up; typecheck:tests fails in visitor-modal.tsx(73) + visitor-store.test.ts(12); F2, F9, R5-F9 queued.
