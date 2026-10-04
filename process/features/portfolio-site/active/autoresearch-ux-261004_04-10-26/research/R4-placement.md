---
name: research:R4-placement
description: "Iteration 4, lane C: where each interactive idea belongs on the portfolio. Inventory, PLACE/REDESIGN/KEEP-HIDDEN/DROP verdicts, per-page interaction map, specs and build order."
date: 04-10-26
metadata: {type: report, feature: portfolio-site, loop: autoresearch-ux, iteration: 4, lane: C}
---

# R4: Where each interactive idea belongs

**BLUF.** The site is already calm: home is 15,753 px tall (target was 16,000), has zero dark bands, and at most 1 canvas (the globe). The problem is no longer "too many toys". It is that (a) the ideas that survived are not yet *connected* to each other or to the story, and (b) the biggest unbuilt value sits in the **case studies** (reading aids that help a recruiter skim and an engineer dig), not on home. So:

1. **Home stays at 3 signature moments** (hero reveal, project stack with persona + stamps, "Say hello" coin) plus 2 quiet supports (ticker, globe). Nothing new is added to home except two micro-interactions.
2. **Two threads tie the site together**, instead of more widgets:
   - **Persona thread**: the "Show me first" choice already reorders home and `/work`; extend it so it also sets the default reading depth on case studies.
   - **Settled thread**: one motif, the green "Settled" check, already used by the ticker and the coin. Reuse it for evidence badges in case studies and for "Copied" on the email. The navy stamp is the second (and last) motif.
3. **Build the missing case-study reading aids site-wide** (glossary hovers, Skim / Read / Deep toggle, decision cards, role + evidence badges). They are the highest delight-per-effort items left because they serve all three readers.
4. **Never revive**: shield, scroll phone as WebGL, passport, poll, characters, cursors, wall, mascot, doodle pad, greeting, gradient bands, scramble text, magnetic dock.

Evidence: screenshots of the live site at 1440x900 and 390x844 in `R4-placement-shots/` (`sheet-home-d-a/b.jpg`, `sheet-home-m.jpg`, `sheet-about-work-d.jpg`, `sheet-case-d.jpg`, plus 136 step frames and `capture-log.json`). Measured this pass: max canvas count per page: home 1, about 0, work 0, case 0.

---

## 1. Inventory and verdict (every idea ever proposed, built, hidden or deleted)

Status key: LIVE = on a public route today. LAB = code kept under `/lab` only. GONE = deleted. IDEA = proposed, never built.
Verdict key: **PLACE** (exact spot), **REDESIGN->PLACE**, **KEEP-HIDDEN** (gem or lab), **DROP**.

### 1.1 Home and shell

| # | Idea | Status | Verdict | Where / why (tied to Thao's story and the reader) |
|---|---|---|---|---|
| 1 | Rotating hero word ("I build billing engines...") | LIVE | **PLACE** (keep) | Home hero. Says the whole pitch in 2 seconds: the recruiter's skim. |
| 2 | Cursor reveal (casual line under pointer) | LIVE | **PLACE** (keep) | Home hero only. The one "personality" beat. Not reused on /about, to keep it unique. |
| 3 | Scroll-lit statement | LIVE | **PLACE** (keep) | Home section 3. Quiet, editorial. |
| 4 | Logo marquee | LIVE | **PLACE** (keep) | Home section 2. Social proof for the recruiter. |
| 5 | Transaction / proof ticker | LIVE | **PLACE** (keep) + small upgrade | Under the statement. Real metrics in payments language. Upgrade: click an item jumps to its stack card (spec B7). |
| 6 | Settlement globe | LIVE | **PLACE** (keep, make it earn its canvas) | Highlights footer tile. Fintech corridors story. Upgrade: corridor row hover also highlights the matching stack card (spec B6). Drop to static SVG if fps < 50. |
| 7 | Persona picker | LIVE (segmented control) | **PLACE** (keep) + thread | Above the stack and on /work. Upgrade: choice also sets case-study reading depth (spec B2). |
| 8 | Stamps on stack cards | LIVE | **PLACE** (keep) + echo once | One per card. Echo the same stamp once per case-study Results block (spec B9). Only 2 ink motifs on the site. |
| 9 | Emoji side nav (TOC) | LIVE | **PLACE** (keep) | Stack TOC and mobile chip rail. |
| 10 | iOS lift-and-pop card hover | LIVE | **PLACE** (keep) | Every card. The site's single hover language. |
| 11 | Notionists people stats | LIVE | **PLACE** (keep) | Home "Building with people". Carries community and women-in-tech without characters. Avatars fan out on hover. |
| 12 | Photo moments | LIVE | **PLACE** (keep) | Home and /about. Real people beat any illustration. |
| 13 | Say-hello coin | LIVE | **REDESIGN->PLACE** | Make it THE contact block: merge with the footer so there is one "get in touch" area, not two (see 3.1). Founder's last step. |
| 14 | LinkedIn notes | LIVE (embeds) | **KEEP**, no new interaction | Third-party iframes; Thao's call pending. Only rule: failed embed must keep text card. |
| 15 | Local time in nav | LIVE | **PLACE** (keep) | Quiet human touch. |
| 16 | Nav glass pill + mobile sheet | LIVE | **PLACE** (keep) | Shell. |
| 17 | Secret word "thao" -> sketch mode | LIVE | **KEEP-HIDDEN** (gem, global) | Pure delight, zero layout cost. |
| 18 | Footer name x5 taps (sketch on phones) | LIVE | **KEEP-HIDDEN** (gem) | Phone equivalent of #17. |
| 19 | Playful 404 (lost note game) | LIVE | **KEEP-HIDDEN** (gem) | Isolated page. |
| 20 | Copy-email delight ("Copied" check) | IDEA | **PLACE** (micro) | Footer email pill. Uses the Settled check, no new motif (spec B8). |
| 21 | Native page-turn (View Transitions) | LIVE on stack card -> case hero | **PLACE** (extend) | Extend to /work cards and the case "Next project" card so every card->case jump morphs (spec B10). |
| 22 | Compliance shield (3D) | LAB | **DROP** | A toy with no story link and a WebGL context. The Cortex "auto-clear gate" block already shows protection with real data. |
| 23 | 3D scroll phone | LAB | **REDESIGN->PLACE** | Not on home. Becomes a 2D sticky phone walkthrough inside GoCrypto only (spec B11). |
| 24 | Story tokens 3D | LAB | **DROP** | Redundant with stamps and ticker. |
| 25 | Build-a-product game | LAB | **KEEP-HIDDEN** (lab) | Clever but a game in the middle of the work. Not a gem either (needs effort to find). Revisit only if Thao wants a /work footer. |
| 26 | "What should Thao build next?" poll | LAB | **DROP** | Percentages read as fake. |
| 27 | Visitor passport (stamps 0/6) | LAB | **DROP** | Gamification. |
| 28 | Greeting banner | LAB | **DROP** | Chatbot toast. |
| 29 | Chapter system, kinetic headline, gradient bands, glass trust cards, light beams | GONE/LAB | **DROP** | Caused the empty-viewport feel. |
| 30 | Characters (Settle, Audit, sprout), mascot, community cursors | LAB | **DROP** | Off-style, busy. |
| 31 | Women-in-tech wall | LAB | **DROP** | Notionists stat cards on home already say it and are calmer. |
| 32 | Doodle pad ("Leave a mark") | GONE | **DROP** | Extra canvas, one more toy at the end. |
| 33 | Brand gradient mesh, scramble nav text, magnetic dock, scroll media expansion, text-that-remembers-you | IDEA/LAB | **DROP** | Restless or redundant; each fights "calm". |

### 1.2 /about

| # | Idea | Status | Verdict | Where / why |
|---|---|---|---|---|
| 34 | Career rail (light, snap, drag, arrows) | LIVE | **PLACE** (keep) | /about screen 2. The journey (Creatio -> MoMo -> Cho Tot -> Zalo -> SkyLab). |
| 35 | Career receipt | LAB | **REDESIGN->PLACE** | Only the "total" line, as the rail's end-cap card: "8 roles, 4+ years, 9 products" (spec B12). |
| 36 | Portrait tilt + quiet note ("Start with Cortex Sentinel") | LIVE | **PLACE** (keep) | The recruiter's "where do I start" nudge. |
| 37 | Flag emoji burst | LIVE | **KEEP-HIDDEN** (gem) | Hover on "Gia Thao" line. Small, personal. |
| 38 | Peel sticker | GONE (became quiet note) | **DROP** | Already merged into #36. |
| 39 | Scrubbable career timeline | IDEA | **DROP** (for /about) | The rail covers it; a second timeline repeats it. Keep scrub-timeline for case studies only. |

### 1.3 /work and case studies

| # | Idea | Status | Verdict | Where / why |
|---|---|---|---|---|
| 40 | Filter chips with sliding thumb + card glide | LIVE | **PLACE** (keep) | /work. |
| 41 | Per-case interactive blocks (Cortex gate/agent loop/honesty map, GoCrypto calculator/stress, Ledgr contract check, COSAP toggles, Lumicap approve/pause/journey, Guardline desk/ring/verdict, PAC price books/reconcile, ReOrc lineage/UAT/gap, Zalo ownership/experiment/measure-first) | LIVE | **PLACE** (keep) | These ARE the "decision the reader makes" idea. Rule stays: max 2 interactive data pieces per page. |
| 42 | Reading progress hairline + sticky TOC with section icons | LIVE | **PLACE** (keep) | Visible in every case frame. |
| 43 | Before/after slider | LIVE component, partly used | **PLACE** only with real data | PAC (4 price books -> 1) and ReOrc (rework). Never decorative. |
| 44 | Explorable diagram / module map | LIVE | **PLACE** (keep) | Cortex honesty map, ReOrc lineage. |
| 45 | Hoverable result chart | LIVE component | **PLACE** (keep) | In Results blocks with an evidence badge. |
| 46 | Toggle-the-constraint | LIVE (COSAP loop, Lumicap pause) | **PLACE** (keep) | One per case. |
| 47 | Reading-mode toggle (30 s / 3 min / deep) | IDEA | **REDESIGN->PLACE** | Sticky pill, default set by persona. Skim does not remove content, it collapses (spec B2). |
| 48 | Glossary hovers (AML, KYT, STR, VASP, NAV, UAT...) | IDEA | **PLACE** | Every case, first use per page. Biggest win for non-specialist recruiters (spec B1). |
| 49 | Decision cards (chose B because...) | IDEA | **PLACE** | 1 per case, max 2 (spec B3). |
| 50 | Evidence badge enum (Live / Backtest / Target / Company figure) | PARTIAL (free text `badge`) | **PLACE** | Enforce the 4 labels, rendered with the Settled-check style (spec B4). |
| 51 | Role badge ("I owned" / "Team" / "Platform") | IDEA | **PLACE** | Module maps and flows. Honest authorship, strongest for Cortex (spec B5). |
| 52 | Results band (1-3 numbers + "what I'd do next") | IDEA | **PLACE** | Same closing frame on all 9, so thin pages (Zalo, PAC, ReOrc) still end strong; carries the stamp echo (spec B9). |
| 53 | Sources drawer | IDEA | **KEEP-HIDDEN** (backlog) | Source captions already sit under blocks; a drawer adds a layer. Revisit if captions crowd mobile. |
| 54 | Flow-of-funds animated diagram | IDEA | **DROP** | Existing `flow-diagram` blocks (Cortex agent loop, Lumicap journey) cover it. |
| 55 | Phone walkthrough (GoCrypto 5 screens) | IDEA | **PLACE** | See #23 and spec B11. |
| 56 | Corridor calculator / retention stress (GoCrypto) | LIVE | **PLACE** (keep) | Already the flagship interactive. |

---

## 2. Final interaction map

Rule check applied to every row: at most one **heavy** moment per screen (a heavy moment = something that animates for more than a beat or takes a drag), at most one canvas per page, nothing infinite except marquee, ticker, rotating word, globe idle.

### 2.1 Home (`/`)

Order, with signature moments **bold**:

| Screen (1440) | Section | Heavy moment (max 1) | Quiet supports |
|---|---|---|---|
| 1 | Hero | **S1: rotating word + cursor reveal** | nav clock, portrait fade-in |
| 2 | Logos + statement | scroll-lit statement | marquee, ticker (thin line, click-to-jump) |
| 3 | Highlights + "Money corridors" | globe (idle spin + drag) | lift on tiles, row hover links to stack card |
| 4-9 | Project stack (heading, persona control, 9 cards) | **S2: persona reorder, then stamp lands per card** | emoji TOC pill, lift, View Transition on click |
| 10 | People + photos | avatar fan on hover | photo lift |
| 11 | LinkedIn notes | none | none |
| 12 | Contact: **S3: Say-hello coin**, with footer fused below it | coin drag/tap -> "Settled" -> Email / LinkedIn | email "Copied" check |

Hidden gems (<= 3): the cursor-reveal casual line is part of S1, so gems are: (1) type "thao" for sketch mode, (2) footer name x5 on phones, (3) email "Copied" stamp micro. Home total: **3 signature, 2 supports, 3 gems.**

Observations from the screenshots (fix while placing):
- Shot `home-d-18/19`: the "Say hello" card sits in a very tall empty block, then the footer repeats "Want to get in touch? Drop me a line." and the email pill. Two contact areas back to back. Fuse them (spec B13).
- Mobile `home-m-04`: globe card on 390 is 300 px with a faint dotted sphere that reads as empty. Either raise dot opacity to ~55% or hide the sphere and show only the 3 corridor rows on phones.
- Mobile `home-m-05`: persona control is cut off ("Engin..."), needs to scroll or wrap without clipping.

### 2.2 /about

| Order | Moment | Heavy? |
|---|---|---|
| 1 | Portrait tilt + quiet note "Start with Cortex Sentinel" | quiet |
| 2 | **Career rail** (snap, drag, arrows, marker) with receipt end-cap | the one heavy moment |
| 3 | Experience list (reveal on scroll) | quiet |
| 4 | Photos, skills, education | quiet |

Signature: 1 (rail). Gems: flag emoji burst; (optional) none else. Total gems: 1.
Observation: in `about-d` the Experience heading and rail share the first two screens with a large blank gap under "The route so far" (rail cards are only ~170 px tall in a 900 px viewport). Fix in spec B12 by letting rail cards be taller (show 3 bullets) or reducing section padding.

### 2.3 /work

Order: heading, filter chips (sliding glass thumb), card grid (lift, glide on filter, View Transition to case). Persona order applies (founder sees COSAP/GoCrypto first, engineer sees Cortex/Ledgr first). Signature: 1 (filter glide). Gems: 0. Nothing else, on purpose.

### 2.4 Case studies (`/work/[slug]`)

Order: tinted hero -> reading-mode pill -> insight -> what I owned (role badge) -> **1-2 interactive blocks** -> decision card -> Results band (stamp echo) -> next project card (lift, morph).

| Layer | Items | Where |
|---|---|---|
| Signature (per case) | The case's own interactive block (already built for all 9) | mid-page |
| Site-wide aids | Skim/Read/Deep pill, glossary hovers, decision card, role badge, evidence badge, Results band | fixed positions above |
| Quiet | progress hairline, sticky TOC pill, lift on next card | always |
| Gems | stamp lands once in Results; decision card "rejected option" flip | 2 per case |

### 2.5 The two cross-site threads

- **Persona thread**: Recruiter -> Skim by default; Founder -> Read (3 min); Engineer -> Deep. Stored in the existing participate store (localStorage). One line shown under the hero pill: "Reading as Founder. Change". Never blocks.
- **Settled thread**: ticker chip, coin, evidence badges, "Copied" all use the same green check chip (`--success` text on 10% tint). Navy stamp is used only on stack cards and Results bands.

---

## 3. Specs (PLACE and REDESIGN items)

Tokens used throughout: springs `SPRING.ui | indicator | press | sheet | tilt | lift | stamp | glide`, `DURATION`, `REVEAL` from `src/components/motion/springs.ts`; `LiftCard` (`src/components/ui/lift-card.tsx`, variant `card` or `row`) for any card; radius `--r-sm/md/lg/xl/full`; shadows `--shadow-1/2/3`; accent `--accent`, `--navy-ink`, `--success`. Reduced motion: use `useReducedMotion` from `@/lib/use-reduced-motion` (SSR-safe).

Effort: S = under half a day, M = about a day, L = 2+ days. Lanes: **home**, **work+case**, **about**, **shell**.

### B1. Glossary hovers (S-M, lane work+case; shared component under shell)
- Visual: term gets a dotted 1 px underline in `--ink-3`; popover is a 280 px `--r-md` card, white, `--shadow-2`, 14 px text, term in bold, one-line definition, optional "Why it matters here" line. First occurrence per page only.
- Interaction: hover or focus opens after 120 ms; tap toggles on touch; Esc closes. Popover enters opacity + y 6 -> 0 with `SPRING.ui`.
- Data: one `content/glossary.ts` (AML, KYT, STR, VASP, multisig, NAV, TGE, UAT, ADB, NIM, OFW, 90+ dpd), written once, marked in copy with a `{term:AML}` token.
- Reduced motion: fade only.
- Acceptance: every term is a `<button>` reachable by Tab with a 2 px `--accent` focus ring; popover never clips on 390 (flips above/below); a term appears styled only once per page; no definitions invented (Thao confirms the list).

### B2. Reading depth pill: Skim / Read / Deep (M, lane work+case)
- Visual: sticky under the case hero, glass segmented control (same as persona control: height 40, `--r-full`, thumb slides with `SPRING.indicator`). Labels "Skim 30 s", "Read 3 min", "Deep dive".
- Interaction: blocks carry `depth: 1 | 2 | 3` in the content schema. Skim shows hero, insight, Results band; Read adds the arc and the case's interactive block; Deep adds sources, stack, appendix. Hidden blocks **collapse with `SPRING.sheet` height animation to a one-line stub** ("3 more sections in Deep dive") rather than vanishing, so nothing feels lost. Default comes from persona (Recruiter 1, Founder 2, Engineer 3); choice saved per visitor.
- Mobile: pill is a full-width row, 44 px tall.
- Reduced motion: instant show/hide.
- Acceptance: switching depth changes visible section count within the viewport; TOC only lists visible sections; URL hash `#deep` honours the depth; default matches stored persona; no content is removed from the DOM for crawlers (use `hidden` + `aria-hidden`, or `content-visibility`).

### B3. Decision card (M, lane work+case)
- Visual: `LiftCard` `--r-lg`, `--shadow-1`, two columns: "Option A (rejected)" muted on `--canvas`, "Option B (chosen)" white with a small stamp-style tag; footer line "Cost I accepted: ...".
- Interaction: tap/hover the rejected side flips it (rotateX 90 -> 0 with `SPRING.ui`) to reveal why it lost; default shows chosen side. Max 2 per case; copy comes only from her decks.
- Examples with sources already identified: Cortex (black-box ML vs transparent rules + AI rationale), GoCrypto (trading features vs remittance rail).
- Reduced motion: both sides stacked, no flip.
- Acceptance: keyboard flips with Enter/Space (`aria-pressed`); both texts always readable in the DOM; no more than 2 per page.

### B4. Evidence badge enum (S, lane work+case)
- Visual: chip, height 22, `--r-sm`. `Live` and `Company figure` use the Settled green tint; `Backtest - seed data` and `Target` use `--ink-3` on `--canvas`. A leading check or dash glyph, 12 px mono caps.
- Interaction: none beyond a tooltip (what this label means).
- Acceptance: `badge` accepts only the four labels (TypeScript union); a Playwright check lists every `viz-badge` text on all 9 cases and fails on any other value.

### B5. Role badge (M, lane work+case)
- Visual: on module maps and flows, solid navy outline for "I owned", dashed outline for "Team", ghosted for "Platform". Legend sits in the block caption.
- Interaction: hovering a module shows who built it in one line.
- Acceptance: only cases where her decks state ownership get it (Cortex first); legend is present whenever any badge is.

### B6. Globe row -> stack card link (S, lane home)
- Interaction: hover/focus on a corridor row rotates the globe to it (`SPRING.sheet`) and softly pulses the matching stack card's TOC pill (`SPRING.ui`); click smooth-scrolls to that card (320 ms ease-out), card lifts for 600 ms.
- Mobile: rows tappable; no rotation (drag disabled).
- Acceptance: canvas count stays <= 1; after click the card's top is within 120 px of the nav bottom; reduced motion jumps with no lift.

### B7. Ticker click-to-jump (S, lane home)
- Interaction: each ticker item is a link to its stack card (same scroll behaviour as B6); hover pauses over 400 ms ease; chip flip stays (`SPRING.ui`).
- Acceptance: keyboard Tab pauses and focuses an item; Enter scrolls; touch tap pauses 3 s.

### B8. Email "Copied" check (S, lane shell)
- Visual: on click, the pill's icon morphs into the Settled check chip and the label reads "Copied" for 1.6 s, then returns. Optional tiny stamp is NOT used here (keep the stamp for cards/Results).
- Interaction: `SPRING.ui` scale 0.9 -> 1; opens `mailto:` on a second click.
- Acceptance: clipboard contains the address; label announces via `aria-live="polite"`; works on touch.

### B9. Results band with stamp echo (M, lane work+case)
- Visual: full content width, `--canvas` panel, `--r-xl`, 1-3 numbers in Archivo with their evidence badge and a one-line meaning, then "What I'd do next" (one sentence). A single stamp (same component as the stack card, word true to the project) lands on the panel's top edge using `SPRING.stamp` once on view.
- No dark band (project brand-dark only if the hero is dark).
- Acceptance: all 9 cases end with the same frame; exactly one stamp; scroll-back does not replay; text readable with reduced motion.

### B10. Card-to-case morph everywhere (M, lane shell)
- `TransitionLink` already morphs stack card -> case hero. Extend to `/work` cards (`work-card.tsx`) and the case "Next project" card. Named element: the project visual. Fallback in Firefox and reduced motion: existing 200 ms template fade.
- Acceptance: from /work and from the Next card, the visual travels to the hero (screenshots at +100 ms and +500 ms differ); back button reverses; no console errors.

### B11. GoCrypto phone walkthrough, 2D (L, lane work+case)
- Visual: a sticky phone frame (CSS, no WebGL) on the right of the Product section, caption on the left. Her 5 concept screens (Request, Received, "P18,290 is yours", Protection, Home). Not on home.
- Interaction: scroll steps the screen with a 320 ms cross-slide (`SPRING.sheet`); phone tilts up to 4 degrees toward the pointer (`SPRING.tilt`, desktop only). Mobile: swipeable carousel with dots.
- Reduced motion: stacked screens with captions.
- Acceptance: pinned for at most 1.5 viewports; captions never overlap screen; screen 3 uses the unclipped crop; no canvas.

### B12. Career end-cap + rail density (S, lane about)
- Visual: add a final rail card "8 roles - 4+ years - 9 products" (numbers pulled from content, not typed) in `--navy-ink` outline style; raise rail card height so the first screen is not half blank.
- Interaction: marker moves to it with `SPRING.indicator`; nothing new.
- Acceptance: no viewport on /about has a background-only block taller than 35%; numbers computed from `projectEntries` and experience data.

### B13. Contact fusion: coin + footer (M, lane home + shell)
- Visual: on home, the Say-hello card sits directly on the footer surface (no gap), same `--bg`. After "Settled", the card reveals Email and LinkedIn buttons and the footer's duplicate headline is hidden on home only. On other pages the footer keeps the plain email CTA.
- Interaction: unchanged from the built coin (drag, tap, keyboard; settle with `SPRING.sheet`; "Send another" resets).
- Acceptance: exactly one "get in touch" heading on home; coin clickable without `force`; section height reduced (aim: remove at least 300 px of empty space on 1440).

### B14. Persona thread (S, lane home + work + case)
- The persona store already drives home and `/work`. Add: read persona when a case page mounts to set depth (B2). Show "Reading as Founder. Change" as a 14 px `--ink-3` line under the pill; click scrolls to the pill.
- Acceptance: switching persona on home then opening a case changes the default pill state; clearing storage returns to Read.

### B15. Mobile fixes found while walking (S, lane home)
- Persona control clipped at 390: allow wrap or horizontal scroll with fade edge.
- Globe card on phones: static corridor rows only, or raise dot contrast.
- Acceptance: no clipped text at 390; screenshot compare vs `home-m-05.jpg`.

---

## 4. Build order (highest delight per effort first)

| Rank | Item | Effort | Lane | Why now |
|---|---|---|---|---|
| 1 | B8 Email "Copied" check | S | shell | Tiny, memorable, uses existing motif |
| 2 | B13 Contact fusion | M | home+shell | Removes the most visible duplicate and empty space on home |
| 3 | B15 Mobile fixes | S | home | Cheap, fixes real clipping |
| 4 | B1 Glossary hovers | S-M | work+case | Biggest comprehension win for recruiters |
| 5 | B4 Evidence badge enum | S | work+case | Enforces honesty cheaply; feeds B9 |
| 6 | B7 Ticker jump + B6 Globe link | S+S | home | Makes the quiet pieces lead into the work |
| 7 | B12 Career end-cap + density | S | about | Fixes the half-blank first screen |
| 8 | B9 Results band + stamp echo | M | work+case | Same strong close on all 9; uses stamp |
| 9 | B2 Reading depth pill + B14 persona thread | M+S | work+case | The cohesion win; needs depth tags in content |
| 10 | B3 Decision cards | M | work+case | After copy is confirmed against decks |
| 11 | B10 Morph everywhere | M | shell | Apple-smooth, but only polish |
| 12 | B5 Role badge | M | work+case | Needs ownership copy per case |
| 13 | B11 GoCrypto phone walkthrough | L | work+case | Biggest build, single page; last |

Parallel lanes without file overlap: shell (B8, B10), home (B6, B7, B13 home half, B15), about (B12), work+case (B1, B2, B3, B4, B5, B9, B11). B13 spans home and shell: assign to home with a hand-back for the footer file.

---

## 5. What is deliberately NOT added

No new canvas, no new character, no new full-bleed colour, no sound, no infinite animation, no scroll pinning on home. The only pinned scroll in the plan is the GoCrypto phone (B11), capped at 1.5 viewports and absent on mobile.

## Unresolved questions

1. Stamp words per project (SHIPPED / 2ND PLACE / HACKATHON / LIVE DEMO / STRATEGY) still need Thao's confirmation (affects B9).
2. Glossary term list and definitions: Thao to approve wording (B1).
3. Which real decisions go in the decision cards (B3) and which cases get a role badge (B5): needs deck confirmation; Cortex "-186 reviewed" meaning is still unconfirmed.
4. LinkedIn: keep embeds or switch to static cards (pending since iteration 3).
5. Is Build-a-product worth a bottom-of-/work slot, or stay in /lab permanently?
6. Did the globe pass the 50 fps check on a mid laptop? Not measured in this read-only pass.

**TL;DR:** Keep home at 3 signature moments (hero reveal, persona + stamps stack, coin) and fuse the duplicate contact areas. Spend the next builds on case-study reading aids (glossary, evidence badges, Results band, depth pill tied to the persona choice), which help every kind of reader and need no new visual motifs.

---
**Status:** DONE
**Summary:** Inventoried 56 interactive ideas, gave each a PLACE / REDESIGN / KEEP-HIDDEN / DROP verdict, produced a per-page interaction map with two cross-site threads, 15 build specs and a ranked build order.
**Concerns/Blockers:** Read-only on source; globe fps and real-device touch were not measured. Several specs depend on Thao confirming copy (stamp words, glossary, decisions).
