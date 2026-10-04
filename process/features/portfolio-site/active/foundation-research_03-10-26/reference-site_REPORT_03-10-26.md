---
name: report:reference-site
description: "Pattern study of the reference designer portfolio (jonnyczar.com): sitemap, page anatomy, interaction inventory, design-system measurements, mobile behaviour, case-study data model. Patterns only, no copied text."
date: 03-10-26
metadata:
  node_type: memory
  type: report
  feature: portfolio-site
  phase: foundation-research
---

# Reference site pattern study (jonnyczar.com)

**TL;DR:** The reference is a calm, low-motion Webflow site. Its "premium feel" comes from five cheap things: a floating white pill nav, a very wide display face against a plain body face, big rounded colour-coded cards per project, a sticky left table of contents with scroll-spy, and tiny 150-400 ms hover nudges. Nothing needs WebGL. It has real weaknesses (no mobile TOC, links open new tabs, no next-project module, sticky hover on touch) that our build should fix.

Captured 2026-10-03 with Playwright (Chromium desktop 1440x900, mobile 390x844 touch). Three capture lanes merged here: home + work index (lane 0), six case-study pages (lane A), five article/teaser/event pages (lane B).

**This file describes patterns and measurements in our own words. It intentionally contains none of the reference site's copy.** Screenshots of the site are kept local-only in `research-private/reference-site/` (gitignored): `shots/` (desktop-, mobile-, i- interaction, m- mobile touch), `thumbs/` (overviews), `lane-a/{shots,sheets}`, `lane-b/shots`, montage helpers `c1..c5.png`.

## 1. Tech and what is absent

- Webflow (jQuery 3.5.1 + Webflow IX2 interactions: 108 events on home; trigger types seen: page-start, scroll-into-view, one scrubbed scroll animation).
- Absent at runtime: GSAP, Lenis or any smooth-scroll lib, three.js, framer, lottie, swiper, canvas, video, custom cursor, magnetic buttons, page transitions, preloader, dark mode.
- Fonts: an extended grotesque display face (self-hosted, single bold weight, used for all headings and button labels) over Montserrat body.
- Heavy third-party analytics (not for us).
- Verdict: everything is rebuildable in Next.js + Tailwind + `motion`.

## 2. Sitemap

| Route | Type |
|---|---|
| `/` | Home: hero, logo strip, highlights grid, project-card stack with sticky TOC, social row, contact form |
| `/work` | Index: 3-col card grid (1-col mobile), social row, contact form |
| `/project/{slug}` x11 | Case study (full) x3, teaser "still in the making" x2, restricted/locked x2, long article x2, short event article x1, event page x1 |
| not-found | Template page; unknown paths return it |

Missing on the reference: working sitemap.xml, `/about`, `/contact`, `/resume` (all 404). Contact is an in-page form, not a route.

Navigation quirks to NOT copy: every project card opens in a new tab (no in-flow navigation), some pages are unlinked from the index, the TOC lists sections that do not exist on unfinished pages, one TOC anchor is invalid, a duplicate nav element and stray "New" tags float in the page.

## 3. Page anatomy

### Home (desktop, ~14-16k px tall)
1. **Floating nav pill**: sticky, centred, about 680 px wide, white, fully rounded, padding 10 px, soft layered shadow. 4-5 text items (name/home, a Highlights anchor, Work, LinkedIn, Get in touch). Never hides on scroll; content scrolls underneath it and collides (no backdrop blur).
2. **Hero**: centred H1 (about 80 px) built as a "name, role, company" sentence, a 28 px medium subline, then a large black-and-white portrait that bleeds into the next band.
3. **Logo strip**: full-bleed black band, 6 white logos in a 6-col grid.
4. **Highlights**: 4-col grid of text tiles on a light-grey canvas. The first tile is large (icon + 50 px statement), the others are a bold 24 px title + 12 px description + "see more" link. Radius 20 px, padding 60/40, tinted background.
5. **Project stack**: 300 px left gutter holding a sticky TOC grouped into Case Studies / Articles / Side Projects, ~1050 px content column. Each project is one 16 px-radius card in its own brand colour treatment (white, soft-purple gradient, solid indigo, green gradient, rose, blue gradient with 3D art, red, orange, light cyan). A card holds: eyebrow, 46 px display headline, 18 px blurb, hero mockup image, and a rounded **footer-card** (grey, radius 20, padding 40) with app icon + rating, 2-3 proof stats (icon + two lines) and a black pill CTA with arrow. Locked projects show a lock badge, unfinished show a "coming soon" badge.
6. **Social row** (4 round icons) and **contact form** (name, email, message; inputs radius 12, label above, black pill submit).

### Work index
Same nav minus the Highlights anchor. Centred cards on the light-grey canvas: small eyebrow, 38 px display title, blurb, product visual cropped at the card bottom. Same colour language as home.

### Case-study page (full)
Hero tinted by the project colour (vertical gradient from brand colour to white) -> project icon + rating -> display title -> subtitle -> "share this" row (4 round share icons) -> large cover mockup that bleeds off the bottom with a soft fade. Then a two-column body: **sticky left TOC** (24 px line icon + label, 11-13 entries; last entries are the contact CTA and a "back to top" jump) and a 700-800 px reading column: grey eyebrow label -> 32-42 px display H2 -> body -> figures. Footer: a "want to talk?"-style waitlist form + social row. No next-project module anywhere.

Section rhythm: 150-300 px of whitespace between sections, all sections white (no band alternation despite class names), very quiet.

### Variants (one shared shell, swapped content)
| Variant | Distinguishing structure |
|---|---|
| Product case study | Coloured gradient hero, brand chip + rating, mockup, sticky icon TOC, eyebrow + H2 + prose blocks, stat grids, persona/team grids, toolkit icon rows, timeline image, learnings list |
| Long article | Illustrated hero, share row, sticky TOC with scroll-spy, repeating eyebrow + H2 + prose + captioned figures, stat trio, numbered role grid, schedule list, credits |
| Short article | Solid-colour hero band + object photo, NO TOC, single ~640 px column of H2 chapters with numbered question lists and inline source links |
| Event page | Plain hero + wide photo fading into the page, icon fact cards, dark full-bleed gallery band with testimonial, stacked photos, no TOC |
| Teaser | Hero + two real sections, last paragraph masked to fade out, "in the making, get notified" two-field form |
| Locked / restricted | Same hero, then a blurred grey skeleton of fake text, a centred "private for now" message and a small request-access form (name, email). TOC still rendered but faded |

## 4. Interaction and motion inventory (desktop)

| # | Trigger | Effect | Timing |
|---|---|---|---|
| 1 | Page load | Hero (title, subline, nav) fades from ~15-40% opacity and settles up ~13-24 px, portrait a beat later | about 500 ms ease-out |
| 2 | Hover nav pill | Pill scales to 1.05, shadow deepens | 200 ms ease-in-out |
| 3 | Hover nav item | Pale grey rounded chip appears behind the item | 150 ms ease-in-out |
| 4 | Scroll highlights into view | Tiles fade and rise with stagger (only >=992 px) | 400-800 ms, out-quart-like |
| 5 | Hover highlight tile | Tile "settles": shadow off, background clears, scale 1 | 200 ms |
| 6 | Hover company logo | Scale 1.1, opacity .8 | 200 ms |
| 7 | Hover project card | Scale 1.02 + deeper shadow | transform 200 ms (ease-in-sine-ish), shadow 200 ms |
| 8 | Hover pill CTA | Background black -> slightly lighter, label colour swap | 400 ms |
| 9 | Scroll through stack | TOC sticky; active link turns black/bold, others grey (scroll-spy) | instant to 200 ms |
| 10 | Hover TOC link | Label and icon darken (home variant also nudges 5 px right) | 200 ms |
| 11 | Click TOC link | Anchor jump (home: native, instant; case studies: smooth ~1 s ease-in-out) | native / ~1 s |
| 12 | TOC first appearance (case studies) | Fades in once the hero image has scrolled away (~900-1300 px) | ~300 ms |
| 13 | Hover social icon / avatar | Scale 1.1, colour to dark grey | 200 ms |
| 14 | Hover or focus form field | Border barely changes on hover; on focus darkens | 400 ms |
| 15 | Hover submit button | Background #1a1b1f -> #32343a | 400 ms |
| 16 | Body images | No hover, no zoom, no lightbox | n/a |
| 17 | Scroll (one scrubbed animation) | One scroll-progress animation exists, target not isolated | scrub |

**Not present:** custom cursor, cursor-follow, magnetic buttons, smooth/inertial scroll, WebGL/canvas, route transitions, scroll reveals on case-study body content.

### Motion tokens (measured)
200 ms hover scale/shadow/translate, 150 ms nav chip, 400 ms buttons and input borders, ~500 ms hero entrance, ~1 s TOC smooth scroll, ~300 ms mobile menu. Easing mostly ease-in-out; entrance ease-out; reveals out-quart.

## 5. Mobile behaviour (390x844 touch, hover: none)

| Aspect | Desktop | Mobile |
|---|---|---|
| Nav | Pill with text items | Round white hamburger (~63 px, top-right, fixed bar ~80 px tall, never hides). Tap drops a full-width white sheet (radius ~20, inset 10) of 4-5 big centred display-type links; no backdrop dim; tap again closes; ~300 ms |
| Hero | Centred 80 px H1 | Left-aligned 39-43 px H1, portrait below |
| Logo strip | 6 columns | Stacked / wrapped |
| Highlights | 4-col, staggered reveal | Single column, no reveal |
| Sticky TOC + scroll-spy | Visible | **Hidden entirely** (no section navigation on phones) |
| Cards / grids | Multi-col footer-card and stat grids | Single column, content padding ~10 px |
| Hover effects | Scale, shadow, chips | None; but a tap leaves the hover state **stuck** (scale and colour persist until tapping elsewhere) |
| Reveals | Staggered tiles | Only the hero load fade |
| Overflow | none | none (scrollWidth equals viewport on every page) |
| Inputs | | Font kept at 16-17 px so iOS does not zoom |

## 6. Design-system measurements

- **Type scale (desktop):** H1 80/89.6 -> 50/56 impact line -> 46/51.5 card headline -> 32/35.8 eyebrow and case-study H2 -> 28/36 subline -> 24/31 tile title -> 18/28.8 blurb -> 16/28 body and nav base -> 15 nav items -> 14 TOC title -> 12/19 tiny. Mobile H1 drops to ~39-43 px.
- **Colour:** ink #000, body #1a1b1f, canvas #f7f7f7 behind white cards, greys #928f8f / #979595 / #a7a7a7 / #616060, hover darks #32343a. Per-project brand fills: indigo, soft purple, green, rose, royal blue, red, orange, cyan. One black band behind logos.
- **Radius:** nav 500 px (full pill), buttons 110 px (pill), cards 16, tiles 20, footer-card 20, inputs 12 (8 on short forms).
- **Spacing:** card column ~1050 px with 300 px left gutter at 1440; card padding 60/20/20; tile padding 60/40; footer-card 40; pill CTA 20x40; nav padding 10; reading column 700-800 px (short articles ~640 px).
- **Shadows:** card hover about `4px 20px 16px rgba(0,0,0,.11)`; nav about `0 0 3px rgba(0,0,0,.14), 0 20px 13px -4px rgba(0,0,0,.06)`.
- **Breakpoints:** 991 / 767 / 479.
- **Sticky:** nav pill (~10 px from top), left TOC (hidden under 992 px).

## 7. Reusable case-study content blocks (observed)

| Block | Fields it needs |
|---|---|
| Hero | eyebrow or app icon + name + rating, title (up to 3 lines), subtitle, cover image (bleeds off bottom), background (flat or gradient), share-row toggle |
| Section header | eyebrow label, H2, TOC id + label + icon |
| Rich text | paragraphs, bold subheads, inline links, optional pull-quote |
| Numbered pair / list | n items of numeral, bold title, short description (2-up desktop, stacked mobile) |
| Stat grid | n items of big number + caption (2x2, 4-up, or a 2+1 trio) |
| Full-width figure | image, optional caption, optional panel background, rounded corners |
| Image strip / device row | 3-6 images in a row, shared background |
| Avatar / team grid | n rounded photos, optional name + profile link, hover scale |
| Logo strip | n logos |
| Tool icon row | n icons + captions |
| Feature row | title, paragraph, device image, side left/right |
| Feature mini-grid | n items of icon, title, text |
| Before / after pair | two images with labels |
| Award / highlight card | badge image, title, quote |
| Persona card | portrait, name, age/role, paragraph, optional chart |
| Timeline | image, or data-driven |
| Learnings list | numbered titles + paragraphs |
| Credits | names with links |
| Dark gallery band | testimonial + stacked photos on black |
| Gated state | blurred skeleton, message, request-access form |
| Teaser state | "in the making" message + notify form |
| CTA footer | headline, subcopy, form, social row |

## 8. Case-study data model suggested by the reference

- **Project:** slug, kind (case-study / article / side-project / teaser / restricted), status (published / coming-soon / restricted), title, eyebrow or company, headline, card summary, hero subtitle, year, role, team, tools[], brand colour + gradient/card style, cover image, card image, icon/logo, optional rating, proof stats[] (0-3 of icon, value, label), CTA label, optional external URL, awards/press[], SEO title + og.
- **Section** (ordered; drives TOC): id, TOC label, TOC icon, eyebrow, heading, blocks[].
- **Global:** Highlight, Company (logo + url), Social (platform + url), ContactSubmission, WaitlistSubmission.

## 9. What to keep, what to fix, what to add

**Keep:** floating pill nav; colour-coded card per project; 16 px radii; wide display face for headings; sticky scroll-spy TOC (the single strongest idea for long pages); eyebrow + H2 section rhythm; 150-400 ms hover timings; locked and coming-soon variants.

**Fix (reference weaknesses):** no mobile section navigation; sticky hover after tap; projects open in new tabs; no next-project module; nav collides with text and has no backdrop blur; unfinished pages list TOC entries that do not exist; invalid anchors; no keyboard focus styling on the TOC; no reduced-motion handling; no sitemap.

**Add (user asked, reference lacks):** liquid / water-fill hover on pill buttons and nav items; cursor-reactive dot grid; richer logo and icon hover; scroll reveals used sparingly; page transitions; a mobile TOC; in-place navigation.

## 10. Coverage and gaps

Covered desktop and mobile: home, work index, all 11 project pages (load frames, scroll steps, hover enumeration with computed style diffs, TOC click, menu open/close, exit). Not covered: 404 visuals, Safari/WebKit behaviour (Chromium only, so iOS rubber-band and sticky quirks unverified), soft-keyboard behaviour, exact easing curves for the hero entrance and mobile menu (estimated from frames), form success states, exact target of the one scrubbed scroll animation, scroll-spy mechanism (Webflow vs CSS).
