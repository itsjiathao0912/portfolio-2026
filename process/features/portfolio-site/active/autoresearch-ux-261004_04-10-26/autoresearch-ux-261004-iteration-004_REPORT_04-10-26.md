---
name: report:autoresearch-ux-iteration-004
date: 04-10-26
metadata: {type: report, feature: portfolio-site, loop: autoresearch-ux, iteration: 4}
---
# Iteration 004 — research summary + fix assignment
Research lanes: A design (R4-design.md, avg 7.8/10, 0 FAIL, 2 CONCERN new + 6 R3 open/partial), B functional (R4-functional.md, gates green at clean HEAD except e2e 137/2: stale motion-shell header locator + load flake; 1 FAIL 4 CONCERN), C placement (R4-placement.md: 56 ideas, interaction map, build order B1–B15), D spirit+brainstorm (new standing lane; DESIGN-SPIRIT.md + R4-brainstorm.md, running).
Deduped gaps above OBS: FAIL 1, CONCERN ~10 → 11 (down from 20).
Fix lanes (sonnet, disjoint):
- FX-1 shell+about: nav fill 0.9 (ghost), nav Work → /work, motion-shell spec locator, footer "Copied ✓" email + contact fusion target, Twemoji CC-BY credit, career receipt → rail end-cap, commit/revert 7 uncommitted lab files.
- FX-2 home: LinkedIn image framing + card edges + single link, ticker resume pill 390, persona swap blank frames, say-hello fold/wording/spacing, marquee focus, home empty space.
- FX-3 work+case fixes: /work 3 cards blank band, timeline stops under range input, sub-44 targets, card→case morph from /work + next-project card.
- FX-4 case reading aids: glossary hovers, Skim/Read/Deep, decision cards, role/evidence badges, shared Results band (+ content annotations).
Visitor-identity G0 opens once this iteration's fix batch is committed.

## Fix batch results (iteration 4)
- FX-1 2d31f17, 4f6e081 — nav fill 0.9, Work→/work, motion-shell spec, footer single contact + Copied chip + Twemoji credit, about end-cap + first screen, lab hygiene: APPLIED.
- FX-2 bdfce5d — LinkedIn whole images + edges + one link, say-hello removed (footer only), ticker chip, calm persona swap, marquee focus, mobile globe/persona: APPLIED.
- FX-3 9fb9e26 — /work band, timeline stops operable, card→case morph, GoCrypto PhoneWalkthrough: APPLIED.
- FX-4 b700bcd — glossary (18), depth pill, decision cards (9), role/evidence badges, results band, walkthrough placed, TOC tween: APPLIED. DRAFT copy pending Thao; 2 walkthrough captions unverified vs deck.
In flight (counted next iteration): FX-5 ideas 1–4; visitor-identity P3.
