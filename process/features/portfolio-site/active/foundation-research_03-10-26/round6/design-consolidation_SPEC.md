---
name: spec:design-consolidation
description: "Round 6 design consolidation: audit of every section and interaction on home, /about, /work and 2 case studies, root causes of the 'forced' feel, and one design language (surfaces, radius, shadow, motion) with a new home order and per-module specs."
date: 04-10-26
metadata:
  node_type: memory
  type: spec
  feature: portfolio-site
  phase: foundation-research
---

# Design consolidation SPEC (round 6)

**BLUF:** The site's base (white hero, black type, project stack, case studies) is good. The round-5 "signature" layer is what feels forced: 5 full-screen colour chapters, empty pinned stages, childish characters, and 8 live 3D canvases fighting each other. Fix: delete the chapter system, go back to the reference structure (hero → logos → statement → highlights → project stack → people → LinkedIn → footer), and keep only 5 interactive ideas, each redesigned as a small, quiet module inside an existing section. One radius scale, one shadow scale, one spring family, no dark bands on home.

Evidence: screenshots in `research-private/round6/` (`home-d-NN.jpg`, `home-m-NN.jpg`, `about-*`, `work-*`, `case-*`, contact sheets `sheet-*.jpg`, interaction frames in `i/`), logs `capture-log.json` and `interaction-log.json`. Captured 2026-10-04, Chromium, 1440×900 and 390×844 (touch).

---

## 0. MUST-HAVE acceptance items (non-negotiable, from Thao)

These gate the build. Each has its own spec in §5 and checks in §7.

| # | Requirement | Pass condition |
|---|---|---|
| M1 | **SHIPPED stamp per project card.** No standalone stamp section. As the visitor scrolls the project stack, a stamp lands on the **top edge of each card**, once per card. | Motion: scale 1.4 → 1, rotate −14° → −8°, opacity 0 → 1, spring `stamp`; a press shadow blooms under it, then fades to a faint ink halo. Fires once per card per page view (when the card's top edge reaches 70% of the viewport height). Colour = on-brand ink (§3.2). Reduced motion: stamp rendered at rest, no animation. No empty area around it. |
| M2 | **Seamless side navigation.** No seam between the TOC column and the section above (today a pale-blue band cuts sharply into the grey TOC panel, `home-d-09.jpg`). Each TOC item gets a project emoji. The active state animates smoothly. | One continuous background from the section heading down through the TOC and cards (one surface, no band edge). Emoji per item (list in §5.6). Active pill slides between items with `layoutId` + spring `indicator`; the emoji does a small scale pop (1 → 1.18 → 1). |
| M3 | **iOS-style "lift and pop" card hover**, the same for every card site-wide (stack cards, work cards, highlight tiles, LinkedIn cards, case-study "next project"). Today's lift is 4 px over 300 ms ease (too small, too fast). | Hover: translateY −12 px, scale 1.025, shadow `--shadow-3`, inner content parallax 4 px with the pointer, a liquid-glass sheen follows the pointer. Spring `lift` (stiffness 200, damping 20, mass 1). Press: scale 0.985 with spring `press`. Release: springs back to hover state, then rest. Touch: press only, no sticky hover. Reduced motion: shadow change only. |
| M4 | **Consistent, calm, on-brand.** Nothing busy; every interactive element uses the shared motion tokens. Landing page first, then case studies. | Passes the full QA checklist (§7) on home before any case-study work starts. |

---

## 1. Inventory (what is there today)

Legend: Works = does it respond correctly. Animates = is there motion when it happens. On-brand = fits "minimal, white, fintech, Apple-smooth".

### 1.1 Home (1440 page height 33,907 px; 390: 28,950 px)

| Element | Works? | Animates? | On-brand? | Verdict | Reason |
|---|---|---|---|---|---|
| Floating nav pill (glass) | Yes. Hover indicator moves | Yes | Yes | **KEEP / polish** | Right idea. But the glass is too thin: hero text shows through and visibly collides with the labels (`home-d-02.jpg`). Needs stronger blur + white fill. |
| "It's 00:05 in Saigon" local time | Yes | Ticks | Yes | **KEEP** | Quiet. Overlapped the "Chapter 03" kicker (`home-d-07`); fixed once chapters are gone. |
| Hero headline + rotating word ("I build billing engines…") | Yes (2.4 s cycle) | Yes | Yes | **KEEP** | This is the part Thao loves. |
| Hero cursor-reveal (casual line under the cursor) | Yes | Mask follows pointer, no easing | Yes | **KEEP / polish** | Add spring smoothing to the mask so it does not feel stuck to the pointer. |
| B/W portrait | Yes | No | Yes | **KEEP** | Anchor of the brand. Add `loading="eager"` (console LCP warning). |
| Logo strip (marquee) | Yes | Yes | Yes | **KEEP** | Fine. |
| Statement (scroll-lit words) | Yes | Scroll-linked | Yes | **KEEP** | Good, quiet. |
| "Chapter 01 · Seven chapters. Pick your way in." gradient band | Visual only | Kinetic headline | **No** | **CUT** | Full-bleed purple/teal gradient; headline sits under the nav on scroll; "seven chapters" is meta talk, not content. |
| Greeting banner ("Burning the midnight oil?…") | Yes | No | **No** | **CUT** | Dark-blue pill on a gradient, reads like a chatbot toast. |
| Visitor picker ("Who's visiting?" 4 cards) | Yes (reorders chapters, `data-persona=founder`) | No visible change | Partly | **REDESIGN → segmented control** | The reorder happens far below the fold, so clicking looks like nothing happened. Becomes a small segmented control above the project stack that reorders cards in view. |
| Chapter title stages (Money moves / Trust / Products / Journey / People) | Scroll pins | Underline grows | **No** | **CUT** | Each is a full viewport of flat colour with one title and nothing else (`home-d-04`, `07`, `08`, `26`, `31`). This is the "huge blank areas". |
| Settle coin character | Hover/click react | Yes | **No** | **CUT** | Floats alone in empty navy (`home-d-04`). Childish face. |
| Settlement globe (dark) | Drag spins, idle rotates | Yes | Partly | **REDESIGN light + compact** | Works, but dark navy slab, half-sparse dot land, and "Ho Chi Minh City" collides with "Manila" (`zoom-home-d-02-05`, `m-globe`). Labels move to a list. |
| Transaction stream | Yes | Scrolls, chips flip | Close | **REDESIGN → thin ticker** | Good idea; today it sits on a navy band with yellow "PENDING" chips. Becomes a one-line, hairline-bordered ticker under the statement. |
| Highlights grid (2nd place + certs) | Yes, hover tint | Short | Yes | **KEEP + apply card motion** | Matches the reference. |
| Compliance shield (3D, "Send a threat") | Yes | Yes | **No** | **CUT** | Flat pale-blue blob shield in a big white box; a toy with no story link. Costs a WebGL context. |
| Trust cards (Cortex Sentinel, Guardline glass cards with light beam) | Links work | Beam sweep | Partly | **CUT** | Duplicate the same two projects in the stack below. |
| "SHIPPED · 9 projects" stamp stage | Visual | Stamp slam | Idea yes, placement no | **MERGE into stack cards (M1)** | Sits alone in a pale-blue viewport (`home-d-09`). |
| Project stack + sticky TOC | Yes (scroll-spy, click jumps) | Dot colour only | Yes | **KEEP + M1/M2/M3** | The backbone. Seam above it, no emoji, weak hover. |
| Stack card CTA "Case study →" | Yes | Colour only | Yes | **KEEP** | Add press spring. |
| "Inside the apps" 3D scroll phone | Yes | Yes | Partly | **CUT** | Big black phone in a white void with a tiny caption list (`home-d-21…24`); the stack cards already show these screens. A heavy WebGL context. |
| Build-a-product ("Assemble a fintech app") | Yes (tap/drag, launch, confetti, matches to PAC) | Yes | Partly | **CUT from home** (backlog: /work) | Works and is clever, but it is a game in the middle of the work. Competes with the stack. |
| Journey sprout character | Waves | Yes | **No** | **CUT** | Sprout in a pot on grey/navy (`home-d-26`, `m-rail`). |
| Career rail (trolley, skyline layers, colour bands) | Yes (scroll drives x) | Yes | Partly | **MOVE to /about, REDESIGN light** | Good for /about. On home it is a 4,770 px pinned section with pink/blue/green flashing backgrounds (`home-d-27…30`). |
| People chapter characters (linh, mai, an, audit, settle) | Click reacts | Yes | **No** | **CUT → notionists avatars** | Off-style, childish. |
| Community cursors | Drift | Yes | **No** | **CUT** | Busy; distracts from text. Still visible with reduced motion. |
| Women-in-tech wall (4 stat tiles with characters) | Hover | Yes | Content yes, art no | **REDESIGN** | Keep the 4 stats, replace characters with notionists avatar stacks. |
| Photo moments ("Off the screen") | Yes | No hover | Yes | **KEEP + light hover** | Real photos are the best "people" content. |
| LinkedIn embeds | Load partially | — | **No** | **REDESIGN → static cards** | Desktop shows grey empty embed boxes (`home-d-34`); mobile shows LinkedIn's cookie wall (`home-m-30`). 3 console errors (`requestStorageAccess`). |
| "Chapter 07 · Send a coin, say hello" | Coin click → "Settled" → Email/LinkedIn (works) | Yes | Idea yes, art no | **REDESIGN as the contact module** | Smiley coin + endless `animate-bounce` (Playwright could not click it: element never stable). |
| "What should Thao build next?" poll | Yes | Bars grow | Partly | **CUT** | Fake-looking percentages; busy. |
| Visitor passport (0/6 stamps) | Yes | Yes | **No** | **CUT** | Gamification on a dark-navy card. |
| Footer: socials, email pill | Yes | Hover | Yes | **KEEP** | |
| Footer doodle pad ("Leave a mark") | Yes | No | Neutral | **CUT** | One more toy at the end. |
| Mascot "Noto" peeking at bottom | Appears | Yes | **No** | **CUT** | Character. |

### 1.2 /about

| Element | Works? | Animates? | On-brand? | Verdict | Reason |
|---|---|---|---|---|---|
| Intro + portrait with tilt | Yes | Tilt on pointer | Yes | **KEEP** | Use spring `tilt`, max 6°. |
| "hi, peel me" sticker | Click peels | No animation in 250 ms frame | Childish | **REDESIGN or CUT** | If kept: plain off-white note card with a small curl, no yellow sticker. |
| Flag emoji burst | Hover fires burst | Yes | OK | **KEEP** | Small, personal. |
| Experience list | Yes | — | Yes | **KEEP** | |
| Career receipt (thermal paper) | Scroll reveals | Yes | Partly | **MERGE into career rail** | Repeats the experience list; keep only its "total" line as the rail end-cap. |
| Skills chips, education/certs/awards | Yes | — | Yes | **KEEP** | |
| "Seen around" photos | Yes | — | Yes | **KEEP** | |

### 1.3 /work

| Element | Works? | Animates? | On-brand? | Verdict | Reason |
|---|---|---|---|---|---|
| Filter chips (All, Product, Strategy…) | Yes | Instant swap | Yes | **KEEP + layout animation** | Cards should glide into place (spring `sheet`). |
| Work cards (brand tints, 3D-tilt hover, scale 1.02, 200 ms) | Yes | Yes, quick | Yes | **KEEP + M3** | Replace the tilt-and-scale with the shared lift. |

### 1.4 Case studies (/work/ledgr, /work/gocrypto)

| Element | Works? | Animates? | On-brand? | Verdict | Reason |
|---|---|---|---|---|---|
| Tinted hero + title + cover | Yes | Reveal | Yes | **KEEP** | Calm, close to the reference. |
| Sticky left TOC | Renders | Dot | Yes | **KEEP + M2 active pill** | Same component language as the home TOC. Click test did not find a stable selector: add `data-testid="case-toc"`. |
| Custom interactive blocks (contract check, transfer calculator, etc.) | Rendered | Yes | Yes | **KEEP** | These support the story. Apply shared radius/shadow/motion tokens. |
| Phone mockups, charts | Yes | Reveal | Yes | **KEEP** | |
| Next project card | Yes | Hover | Yes | **KEEP + M3** | |

### 1.5 Runtime problems found

- **8 WebGL canvases alive at once** by the bottom of home (count goes 5 → 8 while scrolling, never back down). Chrome logs "Too many active WebGL contexts. Oldest context will be lost" 3 times. This is why some 3D pieces go blank or stop on revisit. After the cuts, home has at most 1 canvas (the globe), mounted only in view and destroyed out of view.
- `THREE.Clock` deprecation warning (r3f).
- 1 × `502` resource error on home (source not identified in this pass).
- 3 × `requestStorageAccess: Permission denied` from the LinkedIn iframes.
- Hero portrait is the LCP image without `loading="eager"`.
- Ignore: the round "N" badge and "Compiling…" pill in screenshots are the Next.js dev indicator, not product UI.

---

## 2. Why it feels forced (root causes)

1. **Too many ideas at once.** Home carries 22 distinct interactive pieces (globe, stream, shield, stamp, phone, build-a-product, rail, 6 characters, cursors, wall, coin, poll, passport, doodle, mascot, picker, greeting, kinetic headline). Each round added a "wow" without removing anything. The case studies, which are the actual proof, are now 30% of the page.
2. **Chapters as full-screen colour slabs.** Each chapter opens with a pinned stage 1–1.6 viewports tall that holds one title and one small object. That produces the empty viewports Thao sees, and it hides the content one full scroll further down. The colour per chapter (navy, ice, white, ice → navy, navy → rose) also breaks the white-and-black identity of the hero.
3. **Characters off-style.** Thick outlines, flat yellow/green fills and smiley faces belong to a children's app. Next to a fintech headline and a B/W portrait they read as mismatched clip art.
4. **Empty states shipped as design.** The shield box, the stamp stage, the phone section and the rail stage all have large areas with no content, on both breakpoints.
5. **No shared surface system.** Seen in one page: white cards, glass cards, dark navy cards, gradient bands, tinted pastel bands, black cards, yellow chips. Radius values 8/12/16/20/24/34 px and 6 different shadows.
6. **No shared motion system.** Hover lifts of 4 px/300 ms ease next to bouncy springs next to endless CSS bounces next to scroll-pinned parallax. Nothing feels like one product. Several pieces animate forever (coin bounce, cursors, stream) which makes the page feel restless.
7. **Interactions do not serve the story.** The picker reorders chapters you cannot see; the shield and passport have no link to a case study. Delight that does not lead to the work feels like decoration.

---

## 3. Design rules (the one language)

### 3.1 Surfaces
- Base: `--bg #ffffff`. Secondary surface: `--canvas #f7f7f7` (used for whole sections, never as a stripe inside a section).
- Type: `--ink-1 #000` headings, `--ink-2 #1a1b1f` body, `--ink-3 #6b6c72` muted.
- Accents: `--accent #2563eb` for links, focus rings, active states and one highlight per module. Add `--navy-ink: #0b1533` for small accents only (stamp ink, ticker numbers, avatar rings). No navy or gradient section backgrounds on home.
- **Dark band budget: 0 on home.** Dark appears only inside cards whose project brand is dark (Ledgr, Zalo, Cortex Sentinel cards). Case studies: at most 1 dark band each, only for a product screenshot that needs it.
- **Liquid glass only for floating chrome**: nav pill, mobile menu sheet, TOC active pill, the segmented-control thumb, the card hover sheen. Never for content cards.
- Section transitions: a section either shares the previous background or changes at a full-width, content-free boundary with ≥ 96 px of padding on both sides. No band that ends in the middle of a component (fixes the M2 seam).

### 3.2 Colour roles for interactive pieces
| Role | Token |
|---|---|
| Stamp ink | `--navy-ink` at 88% opacity, multiply blend, SVG grain |
| Success / settled | `--success #15803d` (text + 10% tint chip) |
| Pending | `--ink-3` text on `--canvas` chip (no yellow) |
| Avatar backgrounds | `--tint-sky`, `--tint-periwinkle`, `--tint-lavender`, `--tint-rose`, `--tint-peach`, `--tint-mint`, `--tint-aqua`, `--tint-butter` |

### 3.3 Radius scale (only these)
| Token | Value | Use |
|---|---|---|
| `--r-sm` | 8 px | chips, small badges, ticker pills |
| `--r-md` | 12 px | inputs, inner tiles, buttons that are not pills |
| `--r-lg` | 16 px | cards (stack, work, highlight, LinkedIn) |
| `--r-xl` | 24 px | big panels: footer-card inside stack cards, globe module, contact module |
| `--r-full` | 9999 px | pills, avatars, nav |
Remove 20 px and 34 px usages.

### 3.4 Shadow scale (only these; tinted navy, never pure black)
| Token | Value | Use |
|---|---|---|
| `--shadow-0` | none | flat |
| `--shadow-1` | `0 1px 2px rgba(11,21,51,.06)` | resting cards |
| `--shadow-2` | `0 8px 20px -6px rgba(11,21,51,.12), 0 2px 4px rgba(11,21,51,.05)` | raised (hover on small items, segmented thumb) |
| `--shadow-3` | `0 24px 44px -14px rgba(11,21,51,.20), 0 6px 12px -4px rgba(11,21,51,.08)` | lifted card (M3) |
| `--shadow-nav` | existing | floating chrome |

### 3.5 Motion system (one family; extend `src/components/motion/springs.ts`)
| Name | Values | Use |
|---|---|---|
| `ui` (existing) | stiffness 380, damping 24, mass 0.8 | chips, toggles, small pops |
| `indicator` (existing) | 500 / 38 / 0.8 | nav pill, TOC active pill, segmented thumb |
| `press` (existing) | 600 / 30 | press squish (scale 0.985) |
| `lift` (new) | 200 / 20 / 1 | card hover lift (M3) |
| `stamp` (new) | 520 / 22 / 0.9 | stamp landing (M1) |
| `sheet` (existing) | 400 / 40 | layout reorders, filters, sheets |
| `tilt` (existing) | 180 / 24 | portrait tilt, pointer parallax |
| `glide` (new) | 120 / 26 / 1 | pointer-follow (cursor reveal mask, sheen) |

Durations (non-spring): `--d-micro 120ms` (colour/opacity on hover), `--d-short 200ms` (focus ring, chip state), `--d-med 320ms` (fades), `--d-reveal 520ms` (scroll reveals). Easing for all: `--ease-out cubic-bezier(.22,1,.36,1)`.

Reveal pattern (the only scroll reveal): opacity 0 → 1, y 16 → 0 px, 520 ms ease-out, once, triggered at 85% viewport, children stagger 60 ms, max 6 staggered children.

Rules:
- No infinite animation except: the logo marquee, the ticker, the rotating hero word, the globe's idle rotation (each pauses when off screen or tab hidden, and stops under reduced motion).
- No scroll-pinned sections on home.
- Reduced motion (`prefers-reduced-motion: reduce`): springs → `INSTANT`, reveals → opacity only 200 ms, marquee/ticker/globe static, hover keeps shadow change only.
- Max one WebGL canvas per page, mounted on view, unmounted (and `renderer.dispose()` + `forceContextLoss()`) when 1 viewport away.

### 3.6 No empty viewport
At any scroll position, at 1440×900 and 390×844, at least 30% of the viewport is content (text, image, control). No background-only block taller than 35% of the viewport. Checked by script (§7).

### 3.7 People illustration: DiceBear notionists only
- Packages: `@dicebear/core` + `@dicebear/collection` (MIT code; the notionists artwork is by Zoish, CC0). Not installed yet: add both.
- Render on the server/build: `createAvatar(notionists, { seed, size, backgroundColor: ["transparent"] }).toString()` → inline SVG. No network calls.
- Display: a circle with a pastel fill from §3.2 (picked by a stable hash of the seed), avatar SVG inside at 92%, 2 px white ring, `--shadow-1`.
- Sizes: 32 px (stacks), 44 px (cards), 64 px (feature). Stacks overlap by −10 px, max 5 visible + "+N" chip.
- Seeds are role labels ("mentee-1", "organiser-2"), never real names, so avatars are not mistaken for real people. Real people appear only in real photos.
- Optional credit line in the footer colophon: "Avatars: Notionists by Zoish (CC0), via DiceBear".

---

## 4. New home page order

| # | Section | Background | Interactive module folded in |
|---|---|---|---|
| 1 | Hero: headline + rotating word + cursor reveal + B/W portrait | `--bg` | cursor reveal (polished) |
| 2 | Logo strip | `--bg` | marquee (existing) |
| 3 | Statement (scroll-lit words) + **proof ticker** directly under it | `--bg` | thin transaction ticker |
| 4 | Highlights grid (2nd place + certs + hackathons) + **"Where I've shipped" globe card** as the last full-width tile | `--canvas` | light globe (or cut, see §5.4) |
| 5 | Project stack: heading → **segmented control** → sticky TOC (emoji) + cards with stamps | `--canvas` (continues from 4, no seam) | persona segmented control, stamps, lift hover |
| 6 | People: "Building with people" — 4 stat cards with notionists avatar stacks, then real photo moments | `--bg` | avatar stacks |
| 7 | Notes on LinkedIn: 3 static cards | `--bg` | lift hover |
| 8 | Contact module "Say hello" (coin → email/LinkedIn) | `--bg` | redesigned send-a-coin |
| 9 | Footer: socials, email pill, local time | `--bg` | — |

Removed from home: chapter system (`PersonaChapters`, `StoryChapter`, `BrandGradient` band, `KineticHeadline`), greeting, all characters, cursors, shield, trust cards, stamp stage, scroll phone, build-a-product, career rail, poll, passport, doodle, mascot. Code can stay in `/lab` for reference; nothing on public routes.

Target height: ≤ 16,000 px at 1440 (today 33,907).

---

## 5. Per-module specs (KEEP / REDESIGN items)

Every card-like element below uses **Card motion (M3)** from §5.7 unless stated.

### 5.1 Floating nav (KEEP / polish)
- Visual: pill, `--r-full`, height 64 px (56 px mobile), fill `rgba(255,255,255,.72)`, `backdrop-filter: blur(24px) saturate(160%)`, 1 px inner border `rgba(255,255,255,.6)`, `--shadow-nav`.
- Interaction: hover → active indicator slides (spring `indicator`); press → scale 0.97 (`press`).
- Mobile: menu button opens a glass sheet from the top (spring `sheet`), focus trapped, Esc/close button.
- Accept: text scrolled under the nav is unreadable through it (no collision like `home-d-02`); indicator moves with no jump.

### 5.2 Hero cursor reveal (KEEP / polish)
- The mask position follows the pointer with spring `glide` (not 1:1). Mask radius 120 px desktop. Touch: hidden layer revealed by a "psst, the casual version" toggle (exists).
- Reduced motion: no mask; the toggle only.
- Accept: moving the pointer quickly shows the mask trailing smoothly; toggle works by keyboard.

### 5.3 Proof ticker (REDESIGN of transaction stream)
- Visual: one line, height 44 px, full content width (max 1100 px), top and bottom hairline `--hairline`, no background. Each item: number in `--navy-ink` IBM Plex Mono 14 px semibold, label in `--ink-3` 13 px, project name in `--ink-3`, status chip `--r-sm` 22 px tall: "Pending" (`--ink-3` on `--canvas`) flips to "✓ Settled" (`--success` on 10% green tint). Items separated by 32 px and a 4 px dot.
- Content: real metrics only (+27% ad revenue · Zalo, −40% rework · ReOrc AI, +20% faster delivery · ReOrc AI, 95% first-pass UAT · ReOrc AI, 2nd place · AABW 2026, 6.5% auto-closed (backtest) · Cortex Sentinel…).
- Interaction: idle scroll 28 px/s; hover pauses (speed eases to 0 over 400 ms); each chip flips once as it passes the centre (spring `ui`, rotateX 90° → 0). Click an item → scrolls to that project card.
- Mobile: same, 40 px tall, 22 px/s; tap pauses for 3 s.
- Reduced motion: static row, horizontally scrollable, all chips "Settled".
- Accept: the ticker never sits on a coloured band; pauses on hover; chips flip; the link scrolls to the right card.

### 5.4 "Where I've shipped" globe card (REDESIGN light, or CUT)
- Decision rule: keep only if it renders ≥ 50 fps on a mid laptop and stays the only canvas; else cut and replace with a static SVG map with the same list.
- Visual: a `--r-xl` card on `--bg`, padding 40 px, 2 columns (globe 420 × 420 px | corridor list). Globe: light — dots `--ink-3` at 35% on transparent, land dense enough that continents read; arcs `--accent` 1.5 px with a moving 12 px highlight; pins 6 px `--navy-ink` with white ring. **No text labels on the globe.** Labels live only in the list (fixes the HCMC/Manila collision).
- List: 3 rows ("The Gulf → Manila · GoCrypto", "Ho Chi Minh City → Singapore · COSAP", "Ho Chi Minh City → Seoul · COSAP"), each a row 48 px, `--r-md`, hover/active fill `--accent-tint`.
- Interaction: idle rotation 6°/s; drag rotates with inertia (spring `tilt` on release); hovering/focusing a list row rotates the globe to that corridor (spring `sheet`) and brightens its arc; clicking the row opens the case study.
- Mobile: stacked; globe 300 × 300; drag disabled (it fights page scroll), rows tappable.
- Reduced motion: no rotation; corridor selection jumps instantly.
- Accept: no overlapping labels; at most 1 canvas in the page; canvas disposed when scrolled away (canvas count returns to 0).

### 5.5 Persona segmented control (REDESIGN of visitor picker)
- Visual: inline above the project stack, left-aligned with the cards. Label "Show me first:" `--ink-3` 14 px, then a segmented control: track `--canvas` with 1 px `--hairline`, `--r-full`, height 40 px, segments "Everything · Recruiter · Founder · Engineer", 14 px medium. Thumb: white glass, `--shadow-2`, slides with spring `indicator`.
- Interaction: select → the project cards reorder in place with `layout` animation (spring `sheet`) and the TOC reorders to match; a one-line note fades in under it ("Founder view: what she shipped and how") 320 ms. Choice saved in localStorage (as today).
- Keyboard: `role="radiogroup"`, arrow keys move, Space selects; focus ring 2 px `--accent` offset 2.
- Mobile: horizontally scrollable if needed; segments min 44 px tall.
- Reduced motion: reorder without animation.
- Accept: after a click, at least one card visibly moves within the current viewport; arrow keys work.

### 5.6 Project stack + side navigation (KEEP + M1/M2)
**Seam fix (M2):** Highlights (§4 #4) and the stack share `--canvas`. The stack heading sits on the same surface. The TOC column has no own background, border or panel. Remove the pale-blue `--tint-sky` stage entirely.

**TOC:**
- Width 240 px, sticky at `top: nav height + 32 px`. Group labels ("Shipped platforms", "Hackathons", "Personal products") 12 px uppercase mono `--ink-3`.
- Item: 40 px tall, 15 px, emoji 18 px in a 28 px slot, label. Active item: glass pill behind it (white 80%, `--shadow-2`, `--r-full`) shared via `layoutId`, spring `indicator`; text `--ink-1` semibold; emoji pops 1 → 1.18 → 1 (spring `ui`). Inactive: `--ink-3`, hover `--ink-1` (120 ms).
- Emoji (aria-hidden; the label is the accessible name):
  | Project | Emoji | Why |
  |---|---|---|
  | Lumicap | 💹 | on-chain investment funds |
  | COSAP | 🏭 | ERP for manufacturing SMBs |
  | GoCrypto | 💸 | remittance corridor |
  | PAC | ☁️ | cloud provider billing |
  | Zalo Game Center | 🎮 | games platform |
  | ReOrc Data Platform | 📊 | data governance and lineage |
  | Cortex Sentinel | 🛡️ | AML triage |
  | Guardline | 🚨 | fraud desk |
  | Ledgr | 📒 | compliance ledger for SMEs |
- Mobile (< 1024 px): a horizontal chip rail sticky under the nav (exists), chips get the same emoji and the same sliding active pill; the active chip auto-scrolls into view (smooth, 320 ms).

**Stamps (M1):**
- Placement: overlapping the card's top edge, right side: `top: -28px; right: 48px` desktop, `top: -20px; right: 20px` mobile. z-index above the card, below the nav.
- Size: 120 × 72 px desktop, 88 × 54 px mobile. Double rounded-rect border 2.5 px + 1 px, `--r-md`, ink `--navy-ink` 88%, `mix-blend-mode: multiply`, SVG turbulence grain so it reads as ink. Word in Archivo 16 px (12 px mobile) caps, letter-spacing .12em; sublabel 9 px mono (e.g. "2025 · SKYLAB").
- Word must be true per project: "SHIPPED" for shipped platforms; "2ND PLACE" for Cortex Sentinel; "HACKATHON" for Guardline; "LIVE DEMO" for Ledgr; "STRATEGY" for GoCrypto (independent strategy, not a shipped product). Content owner confirms the list before build.
- Motion: when the card's top edge reaches 70% of the viewport: scale 1.4 → 1, rotate −14° → −8°, opacity 0 → 1, spring `stamp` (~260 ms to settle). At contact (~180 ms): a press shadow under the stamp `0 0 0 6px rgba(11,21,51,.10)` fades to 0 over 400 ms, and the card gives a 2 px downward nudge that springs back (`press`). Once per card per page load (IntersectionObserver, then disconnect). No sound, no confetti.
- Reduced motion: stamp at rest from first paint.
- Accept: every card has exactly one stamp on its top edge; no empty area is created; scrolling back up does not replay; with reduced motion there is no transform animation.

**Cards:** see 5.7. The footer-card inside each stack card keeps `--r-xl`, `--canvas` fill (or brand-dark variant).

### 5.7 Card motion (M3, every card site-wide)
- Rest: `--shadow-1`, transform none.
- Hover (fine pointer only, `@media (hover:hover)`): y −12 px, scale 1.025, shadow animates to `--shadow-3`, spring `lift`. Inner media layer moves opposite to the pointer by up to 4 px (spring `tilt`). Sheen: a radial highlight `radial-gradient(240px circle at var(--x) var(--y), rgba(255,255,255,.35), transparent 60%)` with `mix-blend-mode: soft-light`, position follows the pointer with spring `glide`, fades in 200 ms.
- Press: scale 0.985, y −6 px, shadow `--shadow-2`, spring `press`.
- Release: back to hover state (spring `lift`), then rest on pointer leave.
- Touch: press state only; no hover state stays after the finger lifts.
- Focus-visible: same as hover lift + 2 px `--accent` ring offset 4 px (keyboard users get the pop too).
- Reduced motion: no transform; shadow change 200 ms only.
- One implementation (e.g. `components/motion/lift-card.tsx`) used by stack cards, work cards, highlight tiles, LinkedIn cards, case-study next-project card, globe corridor rows (rows use y −2 px, scale 1).
- Accept: hover lift measured ≥ 10 px and ≤ 14 px; settles in 350–600 ms with one small overshoot; press squish visible; identical on home, /work and case studies.

### 5.8 People section (REDESIGN of WiT wall + characters)
- Heading "Building with people" 46 px, one-line intro.
- 4 stat cards in a row (2×2 on mobile), `--r-lg`, `--bg`, `--shadow-1`, padding 28 px: big number (Archivo 40 px, `--ink-1`), label 15 px, source line 12 px mono `--ink-3` (e.g. "CREATIO MARKETING CLUB"), and a notionists avatar stack (32 px, 3–5 avatars + "+N") bottom-left.
- Stats (existing content): 2,500+ participants, 20+ sponsors, Demoing with builders (Build Stuffs #33), 2nd place · Cortex Sentinel (AABW 2026).
- Interaction: card lift (M3); on hover the avatar stack fans out (each avatar x += 6 px × index, spring `ui`).
- Then "Off the screen" real photos (existing), photos lift 4 px + scale 1.01 on hover.
- Reduced motion: no fan-out.
- Accept: no characters remain anywhere on public routes; avatars render without network requests.

### 5.9 LinkedIn notes (REDESIGN → static cards)
- 3 cards, `--r-lg`: date (mono 12 px), title 18 px semibold, 3-line excerpt, "Read on LinkedIn ↗" link. Optional cover image if Thao provides one. No iframes.
- Accept: no `requestStorageAccess` errors; no cookie wall on mobile.

### 5.10 Contact module "Say hello" (REDESIGN of send-a-coin)
- Card `--r-xl`, `--bg`, `--shadow-1`, max 720 px, centred. Title "Say hello", one line "Drag the coin to Thao's wallet, or just tap it."
- Coin: 56 px disc, brushed-metal look (conic gradient silver → white, inner ring, "T" monogram in Archivo), no face. **No idle bounce**; instead a soft breathing glow every 4 s (2 cycles, then stop).
- Wallet: 96 × 64 px glass card (white 70%, blur 16 px, `--r-md`), label "Thao's wallet".
- Interaction: drag follows the finger (spring `glide` lag), track shows a dotted path that fills as the coin moves; drop inside the wallet or tap/Enter → coin flies in (spring `sheet`), wallet shows "✓ Settled" (`--success`), then two buttons fade in: "Email" (black pill) and "LinkedIn" (outline pill). "Send another" resets.
- Keyboard: coin is a button ("Send the coin to Thao's wallet"), Enter/Space sends.
- Mobile: horizontal track 100% width; drag is horizontal only (`touch-action: pan-y`).
- Reduced motion: tap sends instantly, no flight.
- Accept: coin clickable by Playwright without `force` (stable element); drag, tap and keyboard all reach "Settled".

### 5.11 /about career rail (MOVE + REDESIGN light)
- Placement: replaces the career receipt; sits after the intro.
- Visual: `--bg`, horizontal rail of role cards (280 px wide, `--r-lg`, `--shadow-1`, top border 3 px in the company's tint), a 1 px `--hairline` track with a 10 px `--navy-ink` marker that moves along it. No trolley, no skyline, no coloured full-bleed backgrounds, no sprout. End-cap card: the receipt's total ("8 roles · 4+ years · 9 products").
- Interaction: desktop — not pinned; the rail is a horizontally scrollable row with snap (`scroll-snap-type: x mandatory`), arrow buttons, drag-to-scroll with inertia; the marker follows the centred card (spring `indicator`). Mobile — vertical list with the track on the left.
- Reduced motion: no marker animation.
- Accept: no viewport on /about is empty; rail usable by trackpad, drag, arrow buttons and keyboard (Tab to cards).

### 5.12 /work filter (KEEP + layout motion)
- Chips `--r-full` 36 px; active chip = sliding glass thumb (spring `indicator`). Card grid reflows with `layout` (spring `sheet`); leaving cards fade 200 ms.
- Accept: filtering visibly glides; no layout jump.

### 5.13 Case studies (KEEP, apply tokens)
- Apply radius/shadow/motion tokens to all custom blocks; TOC uses the same active pill as 5.6 (no emoji there; section icons stay).
- Next-project card uses M3.
- Add `data-testid="case-toc"`.
- Accept: QA checklist passes on /work/ledgr and /work/gocrypto.

---

## 6. Cut list (code stays in `/lab`, removed from public routes)

`PersonaChapters`, `StoryChapter`, `BrandGradient`, `KineticHeadline`, `Greeting`, `Character` (all), `CommunityCursors`, `ComplianceShield`, trust `GlassCard` + `LightBeam` cards, standalone `ApprovedStamp` stage (component reused for M1), `ScrollPhone`, `BuildAProduct` (backlog: maybe /work), `BuildNextPoll`, `StampPassport`, `DoodlePad`, `Mascot`, LinkedIn iframes, `CareerReceipt` (merged into rail), "peel me" sticker (unless redesigned per 1.2).

---

## 7. QA checklist (every interactive element)

Run on home first, then /about, /work, /work/ledgr, /work/gocrypto. Viewports 1440×900 and 390×844 (touch). One browser.

Per element:
| Check | How |
|---|---|
| Works | Playwright performs the action (click/drag/hover/tap/key) **without `force: true`**; the expected state appears (attribute, text, or URL). |
| Animates | Element screenshots at +80 ms and +600 ms after the action differ; the final frame matches the rest state of the spec. |
| Keyboard | Reachable by Tab in reading order; visible 2 px `--accent` focus ring; Enter/Space/arrow keys do the same as the pointer. |
| Touch | At 390 with `hasTouch`, tap produces the action; no stuck hover after tap; drags do not block vertical page scroll. |
| Reduced motion | With `reducedMotion: "reduce"`, screenshots at +80 ms and +600 ms are identical (except opacity fades ≤ 200 ms); content and final state are the same. |
| No console errors | Zero `error` and zero `pageerror`; zero "Too many active WebGL contexts"; zero `THREE.Clock` deprecation. |

Page-level checks:
1. **No empty viewport:** scroll in steps of one viewport height; at each step, the union of visible text/image/control boxes covers ≥ 30% of the viewport and no background-only block exceeds 35% of viewport height.
2. **Dark band count:** on home, count full-width sections with luminance < 0.2 → must be 0.
3. **Canvas count:** `document.querySelectorAll("canvas").length` ≤ 1 at every scroll step, and 0 when the globe is more than one viewport away.
4. **Radius/shadow audit:** computed `border-radius` of all cards ∈ {8,12,16,24,9999}; computed `box-shadow` ∈ the 5 tokens.
5. **Seam (M2):** sample the background colour in a 4 px column at the TOC's x position from the stack heading to the first card → a single colour.
6. **Stamps (M1):** after scrolling through the stack, each `[data-testid=stack-card]` contains exactly one `[data-testid=card-stamp]` whose top is within ±32 px of the card's top edge; scrolling back up and down again does not change its transform.
7. **Hover (M3):** on the first stack card and the first work card, `getBoundingClientRect().top` at +700 ms after hover is 10–14 px above rest; identical values on both.
8. **No characters:** no `[data-testid^=character-]`, `community-cursors`, `mascot` on public routes.
9. **Home height** ≤ 16,000 px at 1440.
10. **Overlap:** nav pill bounding box never intersects visible text at a scroll position where text is fully opaque under it (glass blur makes it unreadable instead).

Screenshots to save after build: same file pattern as this round (`round7/home-d-NN.jpg` etc.) plus per-interaction before/mid/after frames, so the next review compares like for like.

---

## Unresolved questions

1. Stamp words per project (§5.6): "SHIPPED / 2ND PLACE / HACKATHON / LIVE DEMO / STRATEGY" — Thao to confirm or replace (must stay truthful).
2. Globe: keep the light card (§5.4) or cut to a static SVG map? Recommendation: build the light card, cut if it fails the 50 fps / single-canvas check.
3. Build-a-product: drop entirely, or move to the bottom of /work as an optional module?
4. "Peel me" sticker on /about: redesign as a quiet note, or cut?
5. The single 502 resource error on home was not traced in this pass.
6. Emoji list (§5.6) is a proposal; Thao may prefer different ones.

**TL;DR:** Remove the chapter system and all characters, keep the white/black reference structure, and fold 5 ideas back in as small modules (ticker, light globe or cut, segmented persona control, stamps on stack cards, notionists people stats, coin contact). One radius scale, one shadow scale, one spring family with a new `lift` (200/20/1) and `stamp` (520/22/0.9), max one canvas, zero dark bands on home.
