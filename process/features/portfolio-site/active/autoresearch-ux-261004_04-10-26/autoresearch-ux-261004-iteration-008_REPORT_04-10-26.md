# Iteration 008 — 04-10-26
Driver: Thao feedback (guide physics, clay redesign, flags+modal, poll, header/stamp/emoji) with skeptics run in parallel.
Design 7.8/10 (R7 8.0) — drop driven by guide physics (uncommitted at review time). Functional: bf552ba typecheck/lint/432 unit/build:cf pass; e2e 211/213 (card timing load-sensitive; guide edge-drop flaky). JS +5.6KB.
Landed: 212f70b bf552ba (clay), b644525 dfafd04 (poll), cc81c6f 6bbe1de (flags, equal tiles), 0fcf609 (header align, 2x stamp, animated emoji).
## Gaps (above OBS): 2 FAIL, 8 CONCERN
- FAIL guide: stands on drawn edge only 1-9/30 strict; feet sink ~10px; bubble detaches over poll text.
- FAIL guide: lands on tile label / covers CTA.
- CONCERN: tile labels over clay bodies; case hero tiles letter not emoji; emoji stand-ins (cosap/cortex/guardline) + licence; card timing budget; guide edge-drop spec; glossary hit 30px?; multi-flag wrap unverified; jump pose arms over head.
## In flight: guide physics lane; tile-label fix; case hero emoji + footer credit.
