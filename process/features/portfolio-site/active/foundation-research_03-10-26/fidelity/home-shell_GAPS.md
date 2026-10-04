---
name: report:fidelity-home-shell-gaps
description: "Measured gap audit, reference (jonnyczar.com) vs our localhost:3003 home page and global shell, 1440x900 + 390x844. Per-element fixes with priority."
date: 03-10-26
metadata: {node_type: memory, type: report, feature: portfolio-site, phase: foundation-research}
---

# Home + shell fidelity gaps

**TL;DR:** We look like a SaaS landing page; the reference looks like a person's portfolio. The six biggest gaps: (1) no portrait, so the hero has no visual anchor (2) the headline is a 2-word greeting on one line, not a 3-line 80px "name is role at company" sentence (3) the logo strip is grey bordered boxes, not a full-bleed black band of white logos (4) no highlights/achievement tiles band on a grey canvas (5) project cards sit in a 2-col grid with no sticky left TOC, where the reference uses one stacked centred card per project with a 300px TOC gutter (6) navy/blue colour and the solid blue CTA replace the reference's black-and-white. We also add things the reference doesn't have (dot grid, mono eyebrows, "01 /" numbering, buttons in the hero, experience list) that make the page busier.

Measured 2026-10-03, Chromium. Evidence (gitignored): `research-private/fidelity/home-shell/` — `ref-*` / `ours-*` viewport shots `{d,m}-vNN`, load frames `load100/400/900`, `*-navhover.png`, `*-m-menu.png`, `measure.json` (raw computed styles). Side-by-side composites: `cmp-d-v00..v04.png` (hero, logos, highlights/stack, cards, experience), `cmp-d-footer.png`, `cmp-d-load.png`, `cmp-m-hero.png`, `cmp-m-v00..v03.png`, `cmp-d-navhover.png`.

Page lengths: reference 13,710px desktop / 11,940 mobile; ours 7,457 / 11,477. Our mobile page is long because of the experience list, not the project content.

## 1. Global shell

| # | Element | Reference (measured) | Ours (measured) | Gap | Fix | P |
|---|---|---|---|---|---|---|
| 1.1 | Nav pill size | 659x54, y=29 (top 29px), items 15px/500, padding 0 20px, full height 54 | ~620x~40, top 16px, items 14.4px/500, padding 0 14px, h 36 | Ours is ~25% smaller and sits higher; reads as a toolbar, not a pill | `site-nav.tsx`: top `pt-[29px]`, nav `p-0 h-[54px]`, items `text-[15px] px-5 h-full`, drop the inner `p-1.5`. Keep blur (an upgrade) | P0 |
| 1.2 | Nav brand item | Name styled as a plain item (15px/500, Montserrat) | Archivo 15.2px/700, separate style | Brand is louder than reference | Render name like the other items (body font, 500) | P1 |
| 1.3 | Nav CTA | "Get in touch" is a plain text item, no fill | Solid blue pill | Blue pill is the loudest thing in the header and breaks the B/W look | Make it a plain item; keep a liquid-fill only on hover (beyond-ref) | P0 |
| 1.4 | Nav items | Name / Highlights / Work / LinkedIn / Get in touch | Name / Work / Experience / Recognition / LinkedIn / Get in touch (6) | One extra item; section anchors don't match new section order | Name / Highlights / Work / LinkedIn / Get in touch once sections are reordered (§2) | P1 |
| 1.5 | Nav shadow | `0 0 3px rgba(0,0,0,.14), 0 20px 13px -4px rgba(0,0,0,.06)`, no border | `shadow-nav` + 1px hairline border | Border makes it look like an input | Remove `border`, keep shadow | P2 |
| 1.6 | Nav hover | Scale pill 1.05 (200ms) + grey chip behind item (150ms) | Liquid fill chip, no pill scale | Missing pill scale | Add `hover:scale-[1.05] transition-transform duration-200` on nav | P2 |
| 1.7 | Mobile bar | Bare round white hamburger ~63px at top-right, no bar, no name | Full-width pill with name + 44px navy button | Different object; ours covers content | Drop the full-width pill; float a 56-63px white round button with nav shadow, top-right inset 16px; black icon | P0 |
| 1.8 | Mobile menu sheet | White sheet inset 10, radius ~20, display 32px/700 links, no backdrop | Sheet radius 22, 24px links, navy backdrop dim, blue CTA | Smaller type, blue CTA | Links 32px; CTA plain text item or black pill; backdrop optional (keep, it fixes a ref weakness) | P1 |
| 1.9 | Colour: ink | Pure black #000 headings, #1a1b1f body | Navy #0B1F4D headings, slate #38466A body | Navy+blue reads "corporate fintech" | Headings `#000`/near-black, body `#1a1b1f`; use blue only for links/focus. Update `--ink-1/2` in `globals.css` | P0 |
| 1.10 | Canvas | White hero, then #f7f7f7 grey canvas behind white cards from highlights down | All white | No surface change, cards don't "lift" | Body below hero on `--canvas` (#f7f7f7 or #F4F6FB); cards white/tinted | P0 |
| 1.11 | Body font size | 18/28.8 blurbs, 16/28 body | 20/32.5 hero tagline, 16/24 body | Ours line-height tighter on body | `body{line-height:1.75}` for running text; blurbs 18/28.8 | P2 |
| 1.12 | Display face | GT America Extended Bold 700, letter-spacing normal | Archivo 118% 700, letter-spacing -0.01em | Close; tracking is tighter than ref | `letter-spacing:0` on h1-h3 | P2 |
| 1.13 | Eyebrows | Plain sans (14-16px), no index numbers | Mono uppercase 12px tracked + "01 /" counters | Mono labels are a dev-portfolio trope the ref lacks | Drop `label-mono` + index; use 16px/500 grey sans eyebrow, or none | P1 |
| 1.14 | Radius | cards 16, tiles 20, buttons 110 (pill), inputs 12 | cards ~16-20, contact band 28 | Close; contact band too round | Contact block 20px | P2 |
| 1.15 | Containers | Hero text 832 wide centred; card column ~1050 with 300px left TOC gutter (x≈ 304..1136 text, 172..1136 cards) | `max-w-6xl` (1152) everything | Ours is wider/flat; no gutter | Cards column `max-w-[1050px]` with `grid-cols-[300px_1fr]` at ≥992 | P0 |
| 1.16 | Section rhythm | 150-300px between blocks; bands change surface (white -> black band -> grey) | 112px (`pt-28`) every section, all white | Uniform, flat | Vary: hero pb 0 (portrait bleeds into black band), 150px+ elsewhere | P1 |
| 1.17 | Breakpoints | 991 / 767 / 479 | Tailwind md 768 only | TOC + 4-col need a 992 break | Add `lg`(1024) or custom `992px` | P1 |
| 1.18 | Smooth scroll | None (native, `scroll-behavior:auto`); TOC jump native on home | `scroll-behavior:smooth`, no Lenis | Fine — no Lenis on either | Keep; optional Lenis is beyond-ref only | — |
| 1.19 | Cursor | Default | Default | Same | — | — |
| 1.20 | Page transitions | None | `template.tsx` wrapper | Ours is extra (allowed) | Keep subtle (<=250ms fade) | — |
| 1.21 | Load sequence | Content visible at 100ms; hero fades from ~15-40% opacity + 13-24px rise over ~500ms | **Blank hero at 100ms and 400ms** (`cmp-d-load.png`); text appears ~600-900ms | Ours feels slow / empty on load | `hero-intro.tsx`: start `opacity:0.3`, `y:16`, duration 0.5, stagger 0.05; avoid SSR opacity 0 (render visible, animate only after hydrate). Dev server may exaggerate; re-check on prod build | P0 |
| 1.22 | Footer | Social row (4 round icons) + "Want to get in touch? Drop me a line" 32px + form on white | Navy rounded band with 60px headline + 3 pill links, small text footer | Heavy navy block vs light form | Light footer: 32px headline, form (name/email/message, radius 12, black pill submit), 4 round social icons | P1 |
| 1.23 | Next.js dev badge | — | "N" bubble bottom-left in every shot | Dev only | ignore | — |

## 2. Home, section by section

Section order. Reference: Hero(+portrait) -> black logo band -> Highlights grid (grey) -> sticky-TOC project stack -> social row -> contact form. Ours: Hero(+buttons, dot grid) -> grey logo boxes -> "01 Selected work" 2-col grid -> 02 Experience list -> 03 Recognition 3 tiles -> 04 Skills chips -> navy contact band. **Fix: reorder to ref order; fold Recognition into Highlights; move Experience + Skills to /about or below the stack as a compact block.** (P0)

### 2.1 Hero (`src/app/page.tsx` §1, `hero-intro.tsx`)
| # | Element | Reference | Ours | Gap | Fix | P |
|---|---|---|---|---|---|---|
| H1 | Headline content | 3-line sentence "Name is Role at Company", 80/89.6, 700, black, w 832, y 180 | "GM, I'm Thao." one line, 88/95, navy, w 672, y 234 | Ours says nothing; 1 line has no mass | Headline = "Thao Dao is Technical Product Manager at SkyLab" (3 lines at 80px, max-w 832). Move "GM" elsewhere or drop | P0 |
| H2 | Subline | One 28px/500 line ("years · nationality · city") | Name line 24px display + 20px tagline paragraph + mono eyebrow | Three text layers vs one | Single 28px/500 body line e.g. "X years in product. Vietnamese. Ho Chi Minh City." Move tagline to Highlights | P0 |
| H3 | CTAs in hero | None | Two buttons | Extra | Remove from hero (nav has Work + Get in touch) | P1 |
| H4 | Portrait | B/W cut-out portrait 774x664 at y 625, centred, bleeds into black band (no bg, sits on white) | None | **Biggest visual gap** | Add `<Image>` of a background-removed headshot, `filter:grayscale(1) contrast(1.1)`, width ~774, bottom aligned to logo band top, `-mb-px`. **Content need: transparent-bg headshot, shoulders up, ≥1600px tall** | P0 |
| H5 | Dot grid bg | None | Dot grid + bottom fade | Adds texture the ref doesn't have | Keep only very faint (opacity ≤ .25) or restrict to behind portrait; beyond-ref | P2 |
| H6 | Hero top | H1 at y180 (nav ends 83) | H1 y234, pt-48 | 54px lower | `pt-[150px]` desktop | P2 |
| H7 | Mobile hero | Left-aligned 39/43.7, 3-5 lines, x 40, y 120; subline ~28px; portrait 390x525 full width below | 44/47.5 left, plus eyebrow, name line, tagline, 2 buttons, dot grid | Same issues as desktop | 39-40px, left, padding 40px (ref) or 20px, portrait full-bleed | P0 |

### 2.2 Credibility strip (`logo-strip.tsx`)
| # | Reference | Ours | Fix | P |
|---|---|---|---|---|
| L1 | Full-bleed black band, h 126, 6-col white logos, ~32px tall, no label | Grey-bordered 104px boxes on white, coloured logos, mono label above | Full-bleed `bg-black py-[44px]`, `grid-cols-5/6`, logos `brightness-0 invert` h-8, no boxes, no label; hover scale 1.1 + opacity .8 (200ms) | P0 |
| L2 | Mobile: wraps, still black band | 2-col boxed grid ~350px tall | 3-col black band | P1 |
| L3 | Content need | Lumicap/COSAP/SkyLab/ReOrc/Zalo need monochrome white SVGs (Lumicap/COSAP are PNG) | Export white SVG/PNG versions | P1 |

### 2.3 Highlights (missing on ours)
| # | Reference | Ours | Fix | P |
|---|---|---|---|---|
| G1 | Grey canvas band h~1045; 4-col tiles; first tile big (icon + 50px statement), others: icon, bold 24/31 title, 12/19 desc, "See more ↗"; tile radius 20, padding 60/40; staggered fade-rise 400-800ms (≥992 only) | Nothing equivalent; Recognition tiles (3 pastel boxes) are closest | New `highlights-grid.tsx`: awards (hackathon), certifications, "+30% ad revenue", "8 modules", education → icon + title + desc tiles; `grid-cols-4 gap-x-[40px]`, tiles transparent on canvas with hover settle | P0 |
| G2 | Mobile single column, centred text, no reveal | — | Same | P1 |

### 2.4 Project stack (`project-card.tsx`, `work-grid.tsx`, `case-study-toc.tsx`)
| # | Reference | Ours | Gap | Fix | P |
|---|---|---|---|---|---|
| S1 | Layout: 300px sticky left TOC (grouped Case Studies / Articles / Side Projects, 14px title, 15px items, active = black + dot, others grey) + ~520-1050px card column, one card per row | 2-col grid, first card full width, no TOC on home | Missing the strongest idea | Home: `lg:grid-cols-[300px_1fr]`, reuse `case-study-toc.tsx` (sticky top 110) with scroll-spy over cards; groups: Shipped platforms / Personal products | P0 |
| S2 | Card anatomy: centred; brand logo/eyebrow, 46/51.5 display headline (2 lines), 18/28.8 blurb (max 600), hero mock (device/phone image, no browser chrome), then a grey inner footer bar (radius ~16) with app icon + rating, 2 proof stats with icons, black pill CTA "Case Study →" | Left-aligned; mono eyebrow, 40px name, subtitle, blurb, stat numbers, browser-chrome mock bleeding off bottom | Different composition | Centre card text; headline = outcome sentence not product name; move stats + CTA into a bottom "proof bar" (`bg-black/5 rounded-2xl p-5 flex justify-between`) with black pill CTA (`rounded-full bg-black text-white px-10 py-5`) | P0 |
| S3 | Card surfaces: white, lavender gradient, indigo solid, green gradient, rose... card radius 16, padding 60/20/20 | Pastel tints radius ~16, padding ~28 | Ours less padding top, no gradients/solid cards | `pt-[60px] px-5 pb-5`; add gradient (`linear-gradient(180deg, tint, #fff)`) and 1-2 solid dark cards | P1 |
| S4 | Card hover: scale 1.02 + `4px 20px 16px rgba(0,0,0,.11)`, 200ms | Arrow chip, small lift | Weaker | Add scale+shadow | P1 |
| S5 | "Coming soon" placeholders (PAC, Zalo) show dot grid + label | Ref never shows empty screens | Looks unfinished | Use real screenshots or an illustrative mock; else hide image area | P1 (content) |
| S6 | Mobile: TOC hidden, cards full width, 14/21 body, padding ~10 | Cards full width, padding 24 | OK | Add mobile TOC as a horizontal chip bar (beyond-ref) | P2 |

### 2.5 Experience / Recognition / Skills (ours only)
Reference has no CV list on home. Ours: 1,908px experience list + 690 recognition + 536 skills — this is what makes the page feel like a résumé. Fix (P0): move to a `/about` route (or a collapsed "Experience" block after the stack, max 3 rows: company, role, period, one line). Recognition items feed Highlights (§2.3).

### 2.6 Contact (`contact-band.tsx`)
See 1.22. Ref: social row of 4 round 48px icons (hover scale 1.1), then centred 32px headline over a form card (inputs radius 12, label above, black pill submit, hover #32343a 400ms). Ours: navy band, mailto pills. P1. Mobile ref headline 18px.

## 3. Motion summary (both measured)
| | Reference | Ours | Action |
|---|---|---|---|
| Load | visible instantly, 500ms fade-up from 15-40% | blank until ~600-900ms | P0 fix (1.21) |
| Reveals | highlights only, stagger | every section via `Reveal` | Limit reveals to highlights + cards; nothing on text lists (P2) |
| Hovers | 200ms scale/shadow; 150ms nav chip; 400ms buttons | liquid fills | Keep liquid on pills (beyond-ref) but add ref scale/shadow |
| Smooth scroll | none | CSS smooth | fine |

## 4. Beyond reference (tasteful, keep the B/W look)
1. Liquid fill on nav items and black pill CTAs (already built in `liquid-link.tsx`) — change fill colour to black/#32343a, not blue.
2. Dot grid only on the grey canvas band behind highlights, cursor-reactive, opacity ≤ .3.
3. Portrait: subtle 1.02 scale-on-scroll parallax and grayscale→colour on hover (300ms).
4. Nav: blur backdrop (fixes ref text collision) + hide on scroll-down / show on scroll-up.
5. Mobile TOC chip bar for the project stack; fix sticky-hover on touch with `@media (hover:hover)`.
6. View transitions: card image morphs into the case-study hero (Next `viewTransition` / motion `layoutId`).
7. Next-project module at the end of case studies; in-tab navigation (ref opens new tabs).
8. Reduced-motion handling on all of the above.

## 5. Content needs
- Black-and-white cut-out headshot (transparent PNG, shoulders up, ≥1600px) — blocks H4, the biggest gap.
- Monochrome white logo files for all 5 companies.
- One outcome-sentence headline per project (e.g. "Making on-chain investing feel like a bank app").
- Real screenshots for PAC and Zalo Game Center (or remove image areas).
- 6-8 highlight items (icon + title + one line), e.g. hackathon award, certifications, +30% ad revenue.
- Social links (LinkedIn, GitHub, email, +1) for the round icon row.
- Decision: drop "GM, I'm Thao." or keep as a small greeting above the headline.

## Status
**Status:** DONE_WITH_CONCERNS
**Summary:** 40+ measured gaps logged with fixes; top P0s are portrait, 3-line headline, black logo band, highlights grid, TOC+stacked cards, black/white colour, and the blank-hero load.
**Concerns:** Ours measured on the dev server (load timing may be slower than prod; re-check 1.21 on a prod build). Reference mobile menu not captured this run (selector missed) — rely on `reference-site_REPORT` §5. Reference hover timings taken from the earlier report, not re-measured frame by frame.
