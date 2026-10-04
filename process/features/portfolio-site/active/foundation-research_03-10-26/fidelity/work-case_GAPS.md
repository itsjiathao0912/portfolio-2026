---
name: report:fidelity-work-case-gaps
description: "Measured fidelity gaps between our /work + case-study pages and the reference (/work, /project/*), with exact fixes."
date: 03-10-26
metadata: { node_type: memory, type: report, feature: portfolio-site, phase: foundation-research }
---

# Work index + case study fidelity gaps

**TL;DR:** Ours reads like a docs page; the reference reads like a poster. Five root causes:
1. The work index is a left-aligned 2-column grid with a page header and filter chips. The reference has no header: just a centred, 3-column, edge-to-edge wall of cards.
2. Our card and case-study headlines are left-aligned. The reference centres everything above the fold.
3. Our case hero has a meta table and a screenshot in a browser frame. The reference has an app chip, a centred 75 px sentence headline, a subline, and a device mockup that runs off the bottom of a grey-to-white gradient.
4. Our table of contents is a thin 14.7 px list in a 220 px column next to the text. The reference pins a 260 px icon list in the far-left margin (x 84) with 52 px rows.
5. Our reading column is 720 px and pushed right, with dividing rules and 36 px H2s. The reference is a centred 800 px column with 150-300 px between sections and no rules.

Mobile is close. The main mobile gaps are our left-aligned hero and the boxed metric and feature cards.

Captures (gitignored) are in `research-private/fidelity/work-case/`:
- Raw shots `d-*` / `m-*` (top, one screen down, 35 %, 60 %), plus `*-full.png`, `toc-*.png` and `measure.json`.
- Side-by-sides in `sbs/` (reference on the left, ours on the right): `work-top`, `work-900`, `cs-hero`, `cs-900`, `cs-toc`, `cs2-hero`, `cs3-hero`, `cs3-mid`, `mobile`, `full-strips`.

Shot at 1440x900 and 390x844 (touch) in Chromium, one browser, one page at a time. No reference copy is reproduced.

## 1. Work index (/work vs reference /work)
Side-by-sides: `sbs/work-top.png`, `sbs/work-900.png`, `sbs/mobile.png`

| # | Element | Reference (measured) | Ours (measured) | Gap | Exact fix | P |
|---|---|---|---|---|---|---|
| W1 | Page header | None. Cards start at y 223, right under the nav; the page *is* the grid | Eyebrow + 72 px H1 "All projects" + 18 px intro; cards start at y 469 | 246 px of lead-in before any work; reads like a blog index | `src/app/work/page.tsx`: drop the H1 block, or shrink it to one centred 16 px line; start the grid right under the nav | P0 |
| W2 | Columns / width | 3 columns, 453 px cards, 40 px gap, spanning the full 1440 px viewport (x 0 / 493 / 986) on a #f7f7f7 page background | 2 columns, 534 px cards, 20 px gap, inside `max-w-6xl` (x 176-1264), on white | Fewer, narrower cards; no background contrast behind them | `work-grid.tsx`: `md:grid-cols-2` -> `md:grid-cols-2 xl:grid-cols-3 gap-10`. Page `<main>`: `max-w-none bg-canvas` from xl up (keep `px-5` below xl) | P0 |
| W3 | Card height | Every card 742 px tall; the visual is cropped at the bottom | 630 px; height varies with the text | Reference cards are taller posters | `project-card.tsx`: `xl:min-h-[742px]`; image block `flex-1`, pinned to the bottom | P1 |
| W4 | Card text | Centred: 16 px sans eyebrow -> 32/38 px display title -> 16/25.6 blurb, about 333 px wide | Left-aligned: 12 px mono eyebrow + arrow button, 40 px title, subtitle, blurb, proof stats | Ours is a data card; the reference is a cover | Card: `items-center text-center`, title `text-[2rem] leading-[1.2]`, blurb `max-w-[22rem]`, eyebrow in sans not mono. Move proof stats to the case page | P0 |
| W5 | Card padding / corners | 20 px corners (26 on mobile), about 40 px top padding, no shadow at rest, flat fills: white, #ededed, or a saturated brand colour (royal blue with white text, red, orange) | 16 px corners, `p-8`, `shadow-card`, pastel tints only | No saturated "hero" cards; ours looks less flat | Cards to 20 px corners; drop `shadow-card` at rest (keep on hover); add a solid `deep` variant (navy or accent, white text) in `src/lib/tints.ts` for 1-2 cards | P1 |
| W6 | Card media | Device or illustration on a transparent background, bottom-centred, running off the card's bottom edge; no browser frame | Browser frame with the three window dots, 468x293, `-mb-20`; unfinished projects show a dot-grid "screens coming soon" placeholder | The browser frame screams "screenshot"; placeholders look unfinished | `media-frame.tsx`: add `variant="bare"` (no frame, `object-contain object-bottom`) for cards; make a device mockup per project; drop the frame on placeholder cards | P0 |
| W7 | Filter chips | None | 4 pill chips (All / Product / Growth / Personal) | Extra UI the reference doesn't have | Keep (useful once there are 7+ projects), but restyle as 15 px text chips like the nav items, centred. Counts as an improvement on the reference | P2 |
| W8 | Hover | Scale 1.02 + deeper shadow, 200 ms | Tilts toward the cursor + scale 1.015 + image lifts, 300-500 ms | Ours is busier than the reference, but fine | Keep the tilt, cap it at 2 deg, shorten to 200 ms | P2 |
| W9 | Scroll reveal | Cards don't animate in | `Reveal` stagger | Fine (an addition) | Keep, at 400 ms or less | P2 |
| W10 | Page ending | Social row + contact form on the grey background | Navy contact card | Different but acceptable | Global lane | P2 |
| W11 | Mobile | No header; cards inset 19 px, 352 px wide, 26 px corners, centred 20 px title | 40 px H1 + intro + sideways-scrolling chips push the first card down to y 469 | The first card starts halfway down the phone screen | Same fix as W1; mobile cards `rounded-[26px]`, centred title | P0 |

## 2. Case-study hero (ledgr / cortex-sentinel / lumicap vs n26 / pepper / visual)
Side-by-sides: `sbs/cs-hero.png`, `cs2-hero.png`, `cs3-hero.png`

| # | Element | Reference | Ours | Gap | Exact fix | P |
|---|---|---|---|---|---|---|
| H1 | Alignment | Everything centred; column at x 320, 800 px wide | Left-aligned at x 240, 960 px wide (`max-w-5xl`) | The biggest visible difference | `[slug]/page.tsx` hero container: `max-w-[800px] items-center text-center` | P0 |
| H2 | Back link | None | "All work" link above the title | Clutter above the title | Remove it from the hero; put "Back to all work" at the end of the TOC and at the page end | P1 |
| H3 | Brand chip | 48 px rounded-square app icon + name (bold 14 px) + star rating, centred above the title | White pill with logo + mono subtitle/status line | The reference chip gives the product an identity | New `ProjectBadge`: 48 px icon (12 px corners) + name + one proof line (e.g. "Live · Vietnam") | P1 |
| H4 | Title | 75/82.5 px wide display face, centred, wraps to 2-3 lines because it is a *sentence*; top at y 292-316 | 96/96 px single word (the product name), letter-spacing -0.96 px, y 254 | Theirs states a result; ours is just a name | Title = outcome sentence (new content field `meta.headline`), `md:text-[4.7rem] leading-[1.1] tracking-normal`; the name moves to the chip | P0 |
| H5 | Subline | 31/43.4 px (pepper, visual) or 18-20 px (n26), centred, max 800 px | 24/39 px, left, max 768 px | Size is close; alignment differs | `text-[1.9rem] leading-[1.4] text-center` | P1 |
| H6 | Meta row | Not in the hero (role and period come later, in a context section) | 4-column list with a rule above (Role / Company / Period / Stack) | Puts a table in the hero | Move it into the first body section as a quiet 4-column strip, or under the cover image | P1 |
| H7 | Hero background | Light grey #f6f6f6 -> white gradient (n26) or flat white; the visual page has a full-width brand-blue band, 1440x525 | Project tint (peach etc.) -> white | Fine; the tint is our addition | Keep the tint; extend the gradient so it ends under the mockup | P2 |
| H8 | Cover image | Device mockup 552x718 (n26), 800x532 card with 20 px corners (pepper) or full-width band (visual); runs past the hero and fades into the body; no browser frame | 958x599 browser frame with border and ~16 px corners, sitting inside the hero | Looks like a pasted screenshot, 1.2x the reference width | `MediaFrame variant="bare"` for device shots, otherwise `max-w-[800px] rounded-[20px]` with no frame; add `-mb-24` overlap and a bottom fade, `mask-image: linear-gradient(#000 80%, transparent)` | P0 |
| H9 | Share row | 4 round share icons under the subline (n26) | None | Not needed | Skip; optional "copy link" icon | P2 |
| H10 | Load animation | Title, subline and nav fade up from ~20 % opacity and rise 13-24 px over 500 ms ease-out; the image follows a beat later | Only the global page fade | No staggered entrance | Wrap hero children in `Reveal` with index 0-3, 500 ms, 16 px rise | P1 |

## 3. Case-study body, TOC and blocks
Side-by-sides: `sbs/cs-toc.png`, `cs-900.png`, `cs3-mid.png`, `toc-*.png`

| # | Element | Reference | Ours | Gap | Exact fix | P |
|---|---|---|---|---|---|---|
| B1 | Layout | Reading column centred at x 320, 800 px wide; the TOC sits in the empty left margin (x 84, 260 px wide) and doesn't move the column | A `220px + 720px` grid centred as a pair: TOC at x 218, text column at x 502 | Our column is pushed right and narrower | `[slug]/page.tsx`: text column `mx-auto max-w-[800px]`; TOC `fixed left-[84px] top-[162px] w-[260px] hidden xl:block` (xl only, so the margin is at least 320 px) | P0 |
| B2 | TOC position / appearance | Fixed 162 px from the top of the screen; fades in (~300 ms) only once the hero image has scrolled away (~900-1300 px); no title | Sticky at `top-28` (112 px) with an "ON THIS PAGE" mono label; visible as soon as the body starts | Appears too early and adds a label | Remove the label; watch the hero cover with an IntersectionObserver and fade the TOC in over 300 ms | P0 |
| B3 | TOC item size | 16 px text, 52 px rows, 24 px line icon + ~12 px gap before the label; 11-13 entries including contact and "Top" | 14.72 px text, 34 px rows, no icons, 2 px left rail | Ours is tiny and rail-style; theirs is a sidebar menu | `case-study-toc.tsx`: `text-base py-3.5 flex items-center gap-3`; add an `icon` field (lucide) per heading to `tocEntries` in `@content/schema.ts`; add "Get in touch" (#contact) and "Top" at the end | P0 |
| B4 | TOC active item | Active: black #000, weight 600; others #928f8f, weight 400; no bar; 200 ms | Accent left bar + navy 600; others ink-3 | The bar is extra | Drop `border-l-2`; active `text-ink-1 font-semibold`, others `text-ink-3`; hover `translate-x-[5px]` over 200 ms. Optional extra: animated background pill via `motion` `layoutId` | P1 |
| B5 | Active-section tracking | Switches when a section's top reaches about the top of the screen | Switches at 35 % down the screen, with a bottom-of-page fallback | Equivalent | Keep | P2 |
| B6 | Section eyebrow | Grey (#928f8f-ish), bold sans, ~14-16 px, sentence case | Accent-blue mono, 12 px, uppercase | Ours looks technical; theirs is quiet | Heading block in `case-study-blocks.tsx`: eyebrow `font-sans text-sm font-semibold normal-case text-ink-3` | P1 |
| B7 | H2 | ~32/36 px display, black, left-aligned in the 800 px column | 36/40 px, navy, with `border-t pt-12 mt-12` rules between sections | The rules make it read like a document | Remove `border-t`; space sections with `mt-[150px] md:mt-[200px]`; H2 `text-[2rem] leading-[1.12]` | P0 |
| B8 | Body text | 16/25.6 px Montserrat, #1a1b1f, 800 px column | 17.1 px / 1.75 Inter, ink-2 #38466a, 720 px column | Ours is slightly bigger and bluer; fine | Keep 17 px; widen to `max-w-[800px]`; use ink-1 at 85 % for more contrast | P2 |
| B9 | Numbered story grid | Big "1." / "2." numerals (32-40 px) above a 2-column bold statement + text | No equivalent; the nearest is our boxed `features` cards with a border | Missing the reference's signature block | New `steps` block: 2 columns, numeral `font-display text-[2.5rem]`, 24 px title, 16 px text, no border | P0 |
| B10 | Metrics | Stat trio: large display numbers on white, no boxes | `bg-canvas` boxes with 16 px corners, 36 px numbers | The boxes look like a dashboard | `metrics`: remove the background, value `text-[3rem]`, 14 px grey label; optional thin rule above (addition) | P1 |
| B11 | Images in body | Full 800 px column width, 20 px corners (0 for diagrams), no border or frame; some full-width bands (1440 px on the visual page) | 2-column 350x218 gallery thumbnails with border and browser frame | Our images are thumbnails | `gallery` defaults to 1 column at full 800 px, 20 px corners; `image` block gains `size: column | wide | bleed` (wide = 1040 px, bleed = full screen width); lightbox as an addition | P0 |
| B12 | People / persona grid | Row of 5 rounded photos (~12 px corners) | None | Depends on content | Optional `people` block | P2 |
| B13 | Quote | Large centred display quote, no rule (visual page) | `border-l-4` accent bar, `pl-6`, 24 px | Ours reads like a blog quote | `quote`: centred, `text-[2rem] leading-[1.3]`, 64 px opening mark in ink-3, 14 px attribution | P1 |
| B14 | Stack chips | Row of tool icons | Accent-tint text pills | Acceptable | Add logos where we have them | P2 |
| B15 | Section rhythm / length | 150-300 px between sections; pages are 12-17k px tall | ~250 px including the rule; pages are 4.7-5.6k px | Spacing is fine; ours has far less content | Content work, not CSS | P1 |
| B16 | Page ending | Waitlist/contact form + social row; no next-project link | Next-project tinted card + back link + contact band | Ours is better | Keep; restyle the next-project card as a full work-index card (same component) so it previews visually | P2 |

## 4. Mobile (390x844)
Side-by-side: `sbs/mobile.png`

| # | Element | Reference | Ours | Gap | Fix | P |
|---|---|---|---|---|---|---|
| M1 | Hero | Centred: 64 px icon + name + rating, 43/51.6 px headline, 21 px subline, device mockup | Left-aligned: back link, mono status wrapping to 2 lines, 48 px name, 20 px summary, 4 stacked meta rows; cover image starts at y 820 | Cover image is pushed below the first screen | Same as H1, H4, H6; move meta into the body | P0 |
| M2 | TOC | Hidden entirely | Hidden | Same (a reference weakness) | Improvement: sticky bottom "Sections" pill that opens a sheet | P1 |
| M3 | Body | Full 350 px column, 32 px numerals, 14/22.4 px text | 350 px column with boxed features and gallery | Same as B9 and B11 | As B9 / B11 | P1 |
| M4 | Nav | Round 63 px white menu button only | Full-width pill with name + navy menu button | Global lane | — | — |

## 5. Motion summary
| Reference | Ours | Fix |
|---|---|---|
| Hero fades and rises in a 500 ms stagger | Nothing on the case hero | H10 |
| TOC fades in after the hero scrolls away | Always visible | B2 |
| Card hover: scale 1.02, 200 ms | Tilt + 1.015, 300 ms | W8 |
| Body: no scroll reveals | None | Optional: 300 ms fade-up per section, off when reduced motion is on |
| TOC hover: 5 px nudge right | Colour change only | B4 |

## 6. Reusable case-study block system (recommendation)
One `CaseStudyShell` (hero / fixed icon TOC / 800 px column / page ending), plus typed blocks in `@content/schema.ts`, all rendered by `case-study-blocks.tsx`:
- `section` {eyebrow, title, icon}: feeds the TOC (icon + label) and sets the 150-200 px spacing.
- `prose`, `list`, `callout`: the existing blocks.
- `steps` {n, title, text}[]: 2-column numbered grid (new, B9).
- `stats` {value, label}[]: unboxed trio or quad (B10).
- `media` {src, alt, size: column | wide | bleed, frame: none | device | browser, radius} (B11, H8).
- `gallery` {images, cols: 1 | 2 | 3, lightbox}.
- `quote`: centred display quote (B13). `people` and `toolkit` optional.
- `meta` strip (role / company / period / stack), usable anywhere (H6).

Page variants are set in frontmatter: `full`, `teaser` (last paragraph fades out + notify form) and `locked`, all on the same shell.

## 7. Going beyond the reference
1. Mobile section navigator (bottom pill + sheet); the reference has none.
2. Next-project card at the page end (we already have one), drawn with the index card visual.
3. Animated active pill in the TOC (`motion` layoutId) + a thin reading-progress bar at the top.
4. Hover effects that can't get stuck on touch (ours already uses `active:` only); the reference's do stick.
5. Links stay in the same tab (the reference opens new tabs); visible keyboard focus rings on cards and TOC.
6. Lightbox for body images; every reveal respects `prefers-reduced-motion`.

## Open questions
- W6 / H8 need a device mockup or transparent visual per project; the current covers are browser screenshots.
- H4 (headline as a sentence) needs new copy per project (content lane).
- The reference TOC uses its own icons; we need a lucide equivalent chosen per section in the content.

**Status:** DONE
**Summary:** 45 measured gaps across the work index, case hero, body/TOC and mobile, each with a file-level fix. P0s: edge-to-edge 3-column centred cards, a centred 800 px hero with a sentence headline and frameless mockup, a fixed left-margin icon TOC, rule-free 150-200 px section spacing, and new steps / wide-media blocks.
**Concerns/Blockers:** The reference's section headings aren't real `<h2>` elements, so its section heading sizes come from screenshots plus the TOC probe (about ±2 px). Motion timings come from the reference-site report and were not re-recorded frame by frame.
