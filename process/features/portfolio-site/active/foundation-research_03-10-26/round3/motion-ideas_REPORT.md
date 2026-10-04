---
name: report:motion-ideas
description: "Round 3 motion catalogue: ~25 interactive/bouncy/colourful patterns (motion.dev, Framer templates, award portfolios) mapped to our site sections, with APIs, cost, touch and reduced-motion fallbacks; TOP-12 v2 shortlist; 3 case-study reading layouts."
date: 03-10-26
metadata:
  node_type: memory
  type: report
  feature: portfolio-site
  phase: foundation-research
---

# Motion ideas — round 3

**TL;DR:** Keep the reference's calm layout. Add delight in three places only: **hover moments** (colour, springs, little bursts), **scroll moments** (sticky stories, counters, parallax mockups), and **transitions** (card grows into the case study). Everything below is buildable with `motion/react` + CSS; only one optional idea uses canvas. The TOP-12 list is the v2 build.

**Sources and honesty note:** patterns are described from motion.dev docs/examples (springs, layout animations, `useScroll`, gestures, `AnimatePresence`), Framer's own marketing site and featured portfolio templates, and recurring Awwwards SOTD portfolio patterns. This pass was written from documented API knowledge and known pattern families; **no new live captures or screenshots were taken this round** (no `research-private/round3/motion/` folder). Re-check exact API names against motion.dev docs at build time. No code copied.

## House rules (apply to every idea)

- **One spring family.** Default `type: "spring", stiffness ~300-400, damping ~20-28` ("bouncy but settles"). A softer one for big layout moves (`stiffness ~180, damping ~24`). Never mix 6 different easings.
- **Animate only `transform` and `opacity`** (plus `clip-path` / `filter` sparingly). No animating width/height/top/left.
- **Reduced motion:** wrap the app in `<MotionConfig reducedMotion="user">`, and use `useReducedMotion()` for anything scroll-scrubbed or auto-playing. Fallback = instant state change or a 150 ms opacity fade. Colour changes stay (colour is not motion).
- **Touch:** no hover exists. Every hover idea needs a tap or in-view equivalent, or just shows its "rest" state nicely. Use `(hover: hover) and (pointer: fine)` media queries to gate cursor tricks. Fixes the reference's sticky-hover bug.
- **Budget:** at most one "loud" thing per screen. If the hero bounces, the next section is calm.

Perf cost scale: **L** = transform/opacity only, **M** = scroll listeners or many elements, **H** = canvas/video/large images.

## Catalogue (25 ideas)

### Hero & typography

**1. Kinetic name reveal.** Visitor sees the headline split into words/letters that rise in on load with a slight overshoot, staggered 30-40 ms. Where: hero. APIs: `motion.span` per word, `variants` + `staggerChildren`, spring. Cost L. Touch: same. Reduced: show static text.

**2. Variable-weight / stretch on hover.** Hovering the big display word makes letters near the cursor swell (weight or width axis) like a wave. Where: hero name, /about heading. APIs: pointer position via `useMotionValue`, per-letter `useTransform` to `font-variation-settings` (needs a variable font) or `scaleY`. Cost M. Touch: plays once on load as a wave. Reduced: off.

**3. Rotating role word.** "I design ___" where the word flips through roles/emoji with a vertical slot-machine roll. Where: hero subline. APIs: `AnimatePresence mode="popLayout"`, `key` per word, `y` in/out. Cost L. Touch: auto. Reduced: show first word only.

**4. Scroll-scaled giant word.** A huge word (e.g. "Work", "Hello") scales/tracks sideways as you scroll past, like it's being pulled. Where: section dividers, footer. APIs: `useScroll({ target })`, `useTransform` → `x`/`scale`. Cost M. Touch: works with scroll. Reduced: static.

**5. Emoji / sticker hero cluster.** A few draggable stickers (flag, laptop, coffee, product icons) sit around the hero; you can fling them and they spring back. Where: hero, /about. APIs: `drag`, `dragConstraints`, `dragElastic`, `whileTap={{ scale: 1.1, rotate }}`, `dragSnapToOrigin`. Cost L. Touch: great on touch. Reduced: static, not draggable. Playful character moment.

### Buttons, nav, cursor

**6. Magnetic buttons.** Primary buttons drift a few px toward the cursor when it's near, then spring back. Label moves a bit more than the pill (depth). Where: hero CTA, contact, nav pill. APIs: `useMotionValue` x/y from pointer offset, `useSpring`. Cost L. Touch: disabled; use `whileTap={{ scale: 0.95 }}` squish instead. Reduced: off.

**7. Squishy press everywhere.** All buttons/cards: `whileHover` lift 2-4 px, `whileTap` scale 0.96 with bouncy release. Where: global. Cost L. Touch: tap squish is the main feedback. Reduced: keep colour change only.

**8. Nav pill with sliding highlight.** The floating white pill nav has a coloured blob that slides under the hovered/active link. Where: nav. APIs: shared `layoutId="nav-pill"` element rendered under the active item. Cost L. Touch: follows active route. Reduced: jump instantly.

**9. Nav hide on scroll down, pop back on scroll up** with a small bounce. Where: nav. APIs: `useScroll` + `useMotionValueEvent` to set a state, animate `y`. Cost L. Reduced: no hide.

**10. Contextual cursor label.** Over a project card the cursor becomes a small coloured circle saying "View" (or the project's emoji). Where: highlights, project stack, /work. APIs: fixed `motion.div` following pointer via `useSpring`. Cost L. Touch: none (cards already tappable). Reduced: hidden. Optional — skip if it fights the clean look.

### Logo band

**11. Infinite logo marquee, colour on hover.** Two rows of real client/tool logos drift in opposite directions. Logos rest in soft grey; hovering the band slows it to a crawl and the logo under the cursor blooms into full colour with a small lift. Where: logo band. APIs: CSS `@keyframes translateX(-50%)` on a duplicated track (cheapest), or motion `animate` with `repeat: Infinity, ease: "linear"`; pause via `animation-play-state` / `useAnimationFrame` speed value. Colour: `filter: grayscale(1)` → 0 on hover. Cost L (CSS). Touch: keeps scrolling, all logos in colour (no hover to reveal). Reduced: static wrapped grid, in colour. Add `aria-hidden` on the duplicate.

### Highlights / bento

**12. Bento grid with mixed media.** Uneven tiles: one with a looping muted video of a product, one with a big animated counter, one with a quote, one with a mini map/flag, one with a stack of tiny app icons. Where: highlights. APIs: CSS grid; tiles enter with staggered `whileInView` spring; each tile has its own small hover trick. Cost M (video — use short, lazy, `preload="none"`, poster). Touch: tap tile = its hover state. Reduced: poster frames, no autoplay.

**13. Animated counters.** Numbers (users, years, launches, countries) roll up when scrolled into view, ending with a tiny bounce. Where: highlights, case-study results. APIs: `useInView` + `animate(0, target, { onUpdate })` or `useSpring` on a motion value rendered via `useTransform(Math.round)`. Use `tabular-nums` so width doesn't jitter. Cost L. Reduced: show final number.

**14. Flag/emoji burst on hover.** Hovering a "countries" tile or a project tag sprays 6-10 small emoji/flags that pop out, arc and fade. Where: highlights, footer "say hi", project tags. APIs: spawn N `motion.span` in `AnimatePresence`, random `x/y/rotate` targets, spring out + opacity out, remove after ~700 ms; throttle to one burst per 400 ms. Cost L-M (cap particles ~12). Touch: burst on tap. Reduced: no burst; just a subtle colour change.

**15. Emoji trail.** On one playful area (footer or /about), the cursor leaves a short trail of fading emoji. Where: footer only (not site-wide). Cost M. Touch: off. Reduced: off. Use sparingly.

### Project cards & /work

**16. Per-project colour tint that bleeds.** Each project owns a colour. Card rests on near-white; on hover the colour floods in from the card edge (radial grow from cursor point or bottom), the page background behind the stack tints faintly to match, and the mockup inside lifts. Where: project stack, /work, next-project module. APIs: `clip-path: circle()` grown from pointer, or animate a background colour motion value; page tint via a CSS variable on `<body>` set on hover (transition 400 ms). Cost L. Touch: card shows its colour at rest (richer default) — no hover needed. Reduced: instant colour, no grow.

**17. 3D tilt + parallax device mockup.** Card tilts a few degrees toward the cursor; the device mockup inside moves more than the card background (depth), with a soft moving highlight. Where: project stack, case-study hero. APIs: pointer → `rotateX/rotateY` via `useTransform` + `useSpring`, parent `perspective: 1000px`, child `translateZ` or extra `x/y`. Cost L. Touch: replace with gentle scroll-linked tilt (`useScroll`) or nothing. Reduced: flat.

**18. Sticky stacking cards.** Project cards pin and stack as you scroll; the one underneath scales down slightly and darkens, like a deck. (Fits the reference's card stack + sticky TOC.) Where: home project stack. APIs: CSS `position: sticky` per card with incremental `top`, `useScroll` per card → `scale`/`brightness` of the previous one. Cost M. Touch: works. Reduced: plain list, no scaling.

**19. Cursor-follow preview on list view.** /work has a "list" toggle: rows of project names; hovering a row shows a floating image of that project following the cursor, swapping with a crossfade/scale as you move between rows. Where: /work, case-study "more work". APIs: one fixed `motion.img` with `useSpring` position, `AnimatePresence` on src. Cost L-M (preload thumbs). Touch: list becomes rows with small thumbnails inline. Reduced: inline thumbnails.

**20. Grid ↔ list filter with layout animation.** Switching filter/category or grid/list, cards glide to new positions instead of jumping. Where: /work. APIs: `layout` on each card, `LayoutGroup`, `AnimatePresence` for filtered-out cards. Cost M (many layouts; fine under ~30 items). Reduced: instant.

**21. Horizontal scroll gallery (scroll-jacked lite).** A section pins and vertical scroll moves a row of screens sideways. Where: case-study "screens" section, /about photos. APIs: tall wrapper + `position: sticky` inner, `useScroll({ target })` → `x` translate. Cost M. Touch: prefer native horizontal swipe with `scroll-snap` instead of pinning (pinned sideways scroll feels broken on phones). Reduced: native horizontal overflow with snap.

### Case study

**22. Shared-element transition card → case study.** Clicking a card, its image/colour block expands to become the case-study hero; title morphs into place. Back reverses. Where: all card → /project/{slug}. APIs: `layoutId` on image + title in both views. In Next.js App Router, cross-route `layoutId` is fragile; options: (a) View Transitions API (`document.startViewTransition` / Next's experimental support) with `view-transition-name` per project — simplest and native; (b) intercepting-route modal that later becomes the page. Cost M. Touch: same. Reduced: plain route change (fade). Recommend (a).

**23. Sticky storytelling with scroll-linked image swap.** Left column of short text steps scrolls; right column has a pinned device whose screen changes (crossfade or slide) as each step reaches centre. Where: case study "how it works". APIs: `position: sticky` media, `useInView` per step (`amount: 0.6`) sets active index, `AnimatePresence` on screen. Cost M. Touch: stack as text→image pairs (no pinning). Reduced: same stacked layout.

**24. Scroll-scrubbed image sequence.** A product reveal (phone rotating, UI assembling) scrubbed by scroll from ~40-80 frames drawn to a canvas. Where: one flagship case study only. APIs: `useScroll` → frame index → `drawImage` on canvas. Cost **H** (images; use small WebP/AVIF, ~2-4 MB total, lazy). Touch: works but load-heavy; on mobile use a short looping video instead. Reduced: single key frame. Optional.

**25. Reading progress + spring TOC.** Thin coloured progress bar (project colour) at top, and the sticky TOC's active marker slides between items with a spring; on mobile the TOC becomes a bottom pill that expands into a sheet. Where: case-study reading. APIs: `useScroll` → `scaleX` + `useSpring`; active marker via `layoutId`; mobile sheet via `AnimatePresence` + `drag="y"` to dismiss. Cost L. Reduced: no spring, instant marker. Fixes reference's missing mobile TOC.

### Bonus (light)

- **Next-project peek:** end of case study shows the next project's colour band; scrolling into it fills the screen with that colour, then a click/continue does idea 22. Cost L.
- **Footer "say hi" wave:** a hand emoji waves (rotate keyframes) when the footer enters view; contact button bursts confetti/emoji on submit success. Cost L.
- **Soft blob background (WebGL-light, optional):** one blurred gradient blob in hero drifting slowly and shifting toward current project colour. CSS `filter: blur` on two divs is enough — no WebGL. Cost L-M.

## TOP-12 shortlist for v2 ("clean but delightful")

Ranked by delight per unit of risk/effort.

| # | Idea | Why it wins |
|---|---|---|
| 1 | **16 Per-project colour bleed** | Biggest "colourful" upgrade over the reference, cheap, carries the brand system |
| 2 | **22 Card → case-study shared transition** (View Transitions) | The single most "impressive" moment; reference has no page transitions |
| 3 | **11 Logo marquee, colour on hover** | Explicit ask; CSS-cheap |
| 4 | **6+7 Magnetic + squishy buttons** | Bouncy feel everywhere, near-zero cost |
| 5 | **17 3D tilt + parallax mockups** | Makes project cards feel physical |
| 6 | **13 Animated counters** | Clear storytelling for results |
| 7 | **12 Bento highlights with mixed media** | Replaces a flat grid with variety |
| 8 | **23 Sticky storytelling** | Best case-study reading upgrade |
| 9 | **1+3 Kinetic hero + rotating role word** | Strong first impression, calm after load |
| 10 | **14 Emoji/flag burst** (tags, countries tile, footer) | The playful moment; capped so it stays tasteful |
| 11 | **25 Progress bar + spring TOC + mobile TOC sheet** | Fixes a real reference weakness with delight |
| 12 | **8 Sliding nav highlight** | Small, polished, used on every page |

Second tier (pick 1-2 if time): 18 stacking cards, 19 cursor list preview, 5 draggable stickers, 21 horizontal gallery. Skip for v2: 15 emoji trail, 24 image sequence, 10 custom cursor, 2 variable-weight wave (font-dependent).

## Case-study reading experience — 3 layouts

All share: project colour as accent (progress bar, TOC marker, links, counters), shared-element hero from the card, next-project peek at the end, mobile TOC sheet. Each project picks one layout in its data (`layout: "story" | "magazine" | "showcase"`) so projects look different without new code per page.

**A. "Story" (product walkthroughs).** Hero: big tilted device mockup on the project colour. Body: sticky left TOC + text column; key sections use **sticky storytelling (23)** — text steps on the left, pinned phone on the right swapping screens. Results block with **counters (13)**. Best for: apps with a flow to explain.

**B. "Magazine" (long reads / articles / research).** Hero: kinetic title (1) on white with a thin colour band, no device. Body: centred narrow column (~680 px), large pull-quotes that scale in, full-bleed images that break the column, inline image galleries as **horizontal snap rows (21)**. TOC collapses to the progress bar + mobile sheet. Best for: process essays, event write-ups, teasers.

**C. "Showcase" (visual / brand / multi-screen work).** Hero: full-bleed colour with a 3-up fan of mockups that spread apart on scroll (`useScroll` → `rotate`/`x`). Body: **bento (12)** of screens and short captions, a pinned **horizontal gallery** of the full UI set, minimal text, one big counter row. Best for: design-system, marketing, visual-heavy projects.

Locked/teaser projects: reuse layout B with a blurred hero and a "coming soon" sticker that wiggles on hover (5-style), instead of a dead page.

## Implementation notes

- Package: `motion` (import from `motion/react`). Client components only for animated islands; keep pages as server components.
- Central `src/lib/motion.ts` for spring presets and the reduced-motion helper so all 12 pieces feel like one family.
- Test on a real phone for 21/22/23; pinned scroll is where mobile breaks.
- Respect perf: lazy-load case-study media, `will-change` only during interaction, cap simultaneous particles.

## Open questions

1. Which real logos are we allowed to show in colour (client permission)?
2. Does every project get a defined colour + emoji in content data? (Needed for 14, 16, 22, 25.)
3. View Transitions API support is good in Chromium/Safari 18+; acceptable to fall back to a fade on Firefox?
4. Is a variable display font in scope? (Unlocks idea 2.)

---
**Status:** DONE_WITH_CONCERNS
**Summary:** 25-idea motion catalogue, TOP-12 v2 shortlist and 3 case-study layouts written.
**Concerns:** No live browsing/screenshots this round; patterns from documented motion.dev APIs and known Framer/Awwwards pattern families — verify API names against current motion.dev docs before build.
