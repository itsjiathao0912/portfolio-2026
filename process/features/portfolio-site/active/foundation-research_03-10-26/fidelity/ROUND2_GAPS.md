---
name: report:fidelity-round2-gaps
description: "Skeptic-lane round-2 fidelity audit: jonnyczar.com vs localhost:3003, 1440x900 + 390x844, home/work/case/about/menu/hover/load."
date: 03-10-26
metadata: {node_type: memory, type: report, feature: portfolio-site, phase: foundation-research}
---

# Round 2 fidelity gaps (skeptic lane)

**TL;DR:** The home page layout now matches the reference closely on desktop (about 7/10). The weak spots are the content inside: every project card on phone shows the same placeholder diagram, case-study headlines run 6 to 9 lines and then repeat word for word as the subtitle, and every case-study hero is that same diagram instead of a product shot. Fix those three and we'd score about 8.

- Tested at git HEAD `7bc6234` with a dirty working tree: another agent was editing `content/projects/*`, `content/schema.ts` and `globals.css` while I captured. Twice the mobile pass hit a live compile error (`work/page.tsx:15`, `work-grid.tsx:56`), so I re-captured those pages after the tree compiled again.
- Evidence (gitignored): `research-private/fidelity/round2/`. It holds raw `ref-*` / `ours-*` shots `{page}-{d|m}-vNN` and `cmp/` side-by-side images (reference on the left): `home|work|caseA|caseB-{d,m}-vNN`, `sheet-*` overviews, `load-{d,m}-{0,100,300,600}`, `menu-m`, `navhover-d`, `cardhover-d`, `ours-m-cards`, `about-{d,m}`. `meta.json` has page heights and console errors.
- Pages compared: caseA = our `/work/ledgr` vs reference `/project/n26`; caseB = our `/work/cortex-sentinel` vs reference `/project/pepper`. The reference has no /about page (404), so I judged ours on its own.

## Scores (1–10)

| Section | Desktop | Phone | Main reason |
|---|---|---|---|
| Nav (static) | 8 | 7 | Size, items and pill match. Ours hides when you scroll down; the reference stays fixed |
| Hero | 8 | 8 | Headline, subtitle and black-and-white portrait match. Load is slower (below) |
| Logo band | 8 | 5 | Desktop matches. On phone it wraps to 3 rows; the reference band is not visible on phone |
| Highlights | 7 | 6 | Right structure. No staggered fade-in like the reference. On phone the list is long and every icon is the same check-mark badge |
| Project stack + table of contents | 7 | 3 | Desktop is close. On phone, 7 of 7 cards show the same diagram |
| Footer / contact | 5 | 5 | Email button only, no form. On case pages there are two contact blocks |
| /work index | 6 | 4 | Grid and tints are fine. On phone every card shows the same diagram, and the filter chips run off the right edge |
| Case study hero | 3 | 3 | Headline 6–9 lines, subtitle repeats it, the visual is a placeholder diagram |
| Case study body + table of contents | 6 | 6 | Layout and steps are good. The table of contents only appears after you scroll |
| /about | 6 | 6 | Clean, but reads like a pasted CV. Long phone scroll; contact block repeated |
| Motion (load, scroll, hover) | 5 | 5 | Hero is greyed out at 100 and 300ms. Scroll-in is weaker than the reference's tile fade |

## Gaps

| # | Element | Reference | Ours | Exact fix | P |
|---|---|---|---|---|---|
| 1 | Phone project visuals (home stack + /work) | A different picture per card (phone mockup, illustration, photo) | The same three-node diagram with a check mark on Lumicap, COSAP, PAC, Zalo, ReOrc, Ledgr and Cortex (`cmp/ours-m-cards.png`) | Desktop already renders real mockups. Find the phone breakpoint in `project-visual.tsx` / `project-illustration.tsx` that swaps to the illustration and render the same desktop screenshot (cropped and scaled) | P0 |
| 2 | Case-study H1 | 3 lines, about 5 words ("A home for the easier-than-ever finances") | Ledgr 6 lines, Cortex 9 lines (the whole tagline) | Use a short `headline` (≤ 8 words, e.g. "Compliance copilot for Vietnamese SMEs"). Cap the H1 at about 3 lines with a `max-w` and length rule | P0 |
| 3 | Case-study subtitle | A different one-sentence lede | Repeats the H1 word for word | Use a distinct `summary` field, or drop the subtitle when it equals the headline | P0 |
| 4 | Case-study hero visual | Large product device shot overlapping the fold | The placeholder diagram again (Ledgr, Cortex, and Cortex's "back to all work" tile) | Use the product's real screenshot inside the `device-mockup` frame | P0 |
| 5 | Content differs by breakpoint | — | The Lumicap desktop card says "Real-world compute capacity, turned into on-chain funds."; on phone it says "Blockchain RWA investment platform" (could be the concurrent content edit; re-check) | One headline source per project | P1 |
| 6 | Nav on scroll | Always visible | Slides away when scrolling down (`site-nav.tsx` `data-hidden`) | Drop the hide-on-scroll, or show it again after about 80px of scrolling up. Without it, the jump links need a scroll back to the top | P1 |
| 7 | Load sequence | Crisp text at 100ms | Hero headline and subtitle about 30% grey at 100 and 300ms (`cmp/load-d-100/300`) | `hero-intro.tsx`: render at full opacity on the server and animate only `y` (or start at opacity ≥ 0.7) and finish within 250ms. Re-check on a production build | P1 |
| 8 | Footer contact | Social icons + "Want to get in touch? Drop me a line" + name/email/message form | Social icons + headline + one email pill; case pages and /work also have the dark "Hiring for a product role…" band directly above (two contact blocks) | Keep one: either the dark band or the light block, not both. Add the form, or accept the email pill as a deliberate change | P1 |
| 9 | Phone CTA buttons in cards | One line, "Case study →" | "ReOrc Data Platform case study", "Cortex Sentinel case study" and "Zalo Game Center case study" wrap to 2 lines inside the pill | Label "Case study" (the project name is already the card heading) | P1 |
| 10 | Phone stat rows | Centred logo, rating and stats | Big number and label are left-aligned and ragged; "The 27 rules cover…" text sits under the floating "What it does" pill | Centre the stat block. Add bottom padding equal to the pill height on case pages | P1 |
| 11 | /work filter chips (phone) | No filter | Chips overflow the right edge; the last one is cut off with no fade or scroll hint | Add `overflow-x-auto` + edge fade, or wrap | P1 |
| 12 | Case-study table of contents | Visible from the top of the body | Appears only after the first sections; active item gets a pill | Mount it at the body start | P2 |
| 13 | Highlights icons | A brand mark per item (Apple, App Store, N26, UXSD…) | Trophy plus the same check badge on all certificates; generic ribbons on awards | Use issuer logos (AWS, Oracle, Google, VNG) in mono | P1 |
| 14 | Highlights scroll-in | Tiles fade from about 20% to 100% in a stagger | Already fully visible when they enter view | Reuse `reveal.tsx` on the tiles with a 60ms stagger | P2 |
| 15 | Phone logo band | Not shown | 3 wrapped rows of logos on black, about 300px tall | Hide below 768px, or turn it into a single-row marquee | P2 |
| 16 | Phone menu | Full white sheet, 4 centred items | Inset card, 6 left-aligned items (adds Home and About) and a dim backdrop | Acceptable change; optionally centre the items to match | P2 |
| 17 | Nav hover | Grey chip + pill scales to 1.05 | Grey chip appears, but the nav was mid-hide in the shot | Covered by #6 | — |
| 18 | Card hover | Not compared: my script hovered a table-of-contents link on the reference | Card lifts, CTA darkens | Needs a manual check | — |
| 19 | /about | (no reference) | CV dump: 2-col job list, chip clouds, then contact repeated | Lead with a 2–3 line story + portrait; collapse earlier experience; show one contact block | P2 |
| 20 | Dev artefacts | — | The Next "N" badge and "Compiling…" / "Rendering…" toasts show in shots | Dev only; ignore | — |

## What looks cheap compared with an award-level site
- **Placeholder diagram everywhere on phone and in case heroes (#1, #4).** It is the first thing that reads as a template.
- Headlines that are whole paragraphs, repeated twice (#2, #3).
- Pill buttons with wrapped 2-line labels (#9).
- Two contact sections stacked on top of each other (#8).
- Same check-badge icon down the highlights list (#13).

## First 5 minutes of a human clicking around
- **Desktop:** the home page feels right. Scrolling down hides the nav, so going back to "Work" means scrolling up. A case page opens on a 6–9 line headline, the same sentence again, then a diagram, so it reads as unfinished. "Back to all work" sits on another diagram. At the bottom there are two "get in touch" blocks.
- **Phone:** the hero is good. After the logos, every project card shows the same picture, so cards are told apart only by tint. CTAs wrap to 2 lines. The /work chips are cut off on the right. Case pages: the headline fills the whole first screen, and the floating "What it does" pill covers paragraph text.
- No runtime errors once the tree compiled. The two errors I hit were the concurrent agent's mid-edit syntax errors, not shipped bugs.

**Status:** DONE_WITH_CONCERNS
**Summary:** I captured both sites side by side on every requested surface and scored each section. Top fixes: real pictures on phone cards and case heroes (P0), short and non-repeating case headlines (P0), the hiding nav, slow hero load, and duplicated contact blocks (P1).
**Concerns:** The working tree was being edited during capture, so the phone content may be mid-change (#5). The reference card-hover comparison is invalid (#18). The dev server inflates load timing.
