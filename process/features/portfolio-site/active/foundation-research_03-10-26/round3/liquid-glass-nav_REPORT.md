# Liquid Glass Nav — Research Report (round 3)

**Bottom line:** Copy Duma's `liquid-glass.tsx` into the portfolio rather than adding a library. It is a self-contained 276-line component with no dependencies: it builds an SVG displacement map on a canvas and caches it. Chromium users get real refraction. Safari and Firefox get `blur + saturate`, which is the right fallback because Safari can't apply SVG filters through `backdrop-filter` (WebKit bug 245510). Build the motion with `motion` (already in Duma at ^13.2): use springs, a `layoutId` indicator, and grow on press, not shrink.

## 1. How Duma does it (read-only study)

**File:** `duma/src/components/ui/liquid-glass.tsx` (276 lines, `"use client"`, React + `cn` only, no third-party glass library).
- **Origin:** the repo's own context calls it "vendored". It was introduced in commit `8a5b1ce9` ("feat(session-nav): liquid-glass bottom tab bar + mobile layout"). The file has no licence header and no upstream URL, so the origin is untraceable. Licence is unknown: treat it as Duma-owned code and confirm with Duma's author before copying.
- **How it works:**
  - `createDisplacementMap({width,height,radius,bezel})` draws an SDF-based edge-refraction texture on a canvas. It is capped at 480px (`MAX_TEXTURE_SIZE`), with a 1.25px edge taper.
  - The texture is encoded to a PNG data URL and cached in a module `Map` keyed by `w:h:r:bezel`.
  - An inline `<svg><filter>` uses `feImage → feDisplacementMap scale={refraction}` and then `feGaussianBlur 0.15`.
- **Applied as:** `backdrop-filter: url(#id) blur(2px) saturate(1.28)`. The fallback is `blur(blur+2px) saturate(...)`.
- **Props:** `blur` (default 2), `saturation` (default 1.28), refraction scale, bezel, plus all div attributes. It uses `forwardRef`.
- **Browser detection:** UA sniffing (`supportsSvgBackdropFilter`). This is needed because `CSS.supports("backdrop-filter","url(#f)")` returns **true** in Safari and Firefox even though neither renders the filter. Loosen the check if WebKit 245510 ships.
- **Known limits (from source comments):**
  - Only `borderTopLeftRadius` in px is read. Per-corner and percentage radii are not supported.
  - **Never animate the element's SIZE.** Each new size regenerates the map and encodes a PNG, so resizing thrashes the cache. Animate `transform: scale` instead.
- **Where it's used:**
  - `session-tab-bar/session-tab-bar.tsx`
  - `tab-overflow-card.tsx`
  - `sticky-action-bar.tsx`
  - `session-header-collapse.tsx`
  - `onboarding-overlay.tsx`
  - `voice-typing-card.tsx`
  - `camera/glass.tsx` and `style-pad.tsx`
  - `[sessionSlug]/page.tsx`
  - the showcase at `/design`
- **Scars from `process/context`:**
  - `uxui/frontend-architecture.md` ~L926: iOS 26 Liquid Glass made **grow-on-press** the platform default (`.interactive()`). "Scale to 0.95 on tap" was never an Apple default.
  - Tailwind v4 `scale-*` compiles to the standalone CSS `scale` property, which **composes** with `transform`. Don't mix the two by accident.
  - Don't wrap gesture-owning surfaces (swipe/drag) in a press handler, because the two gestures compete.
- **Interactions worth porting:**
  - **Top nav:** `duma-top-nav.tsx` auto-hides. It slides down on demand and keeps a small always-visible pull tab, plus a desktop hover strip.
  - **Bottom tab bar:** drag-reorder with `@dnd-kit/core` 6.3 and `sortable` 10.
  - **dnd-kit scars** (`frontend-architecture.md` §dnd-kit):
    - A boundary clamp made the swap unreachable when only two items were visible.
    - A missing instant-lift visual cue was mistaken for slow activation.
  - **Test scar:** hand-rolled Playwright drag probes give false "broken" verdicts. Verify the probe against a known-working drag first.

## 2. Web best practice: the iOS 26 look

- **Core technique:** an SVG `feDisplacementMap` fed by a generated normal/displacement map, applied through `backdrop-filter: url(#f)`, plus a specular rim (inset highlight box-shadow and gradient border) and light blur and saturation. Duma's approach matches this.
- **Browser support:**
  - **Chromium:** refraction works.
  - **Safari/WebKit:** SVG filters in `backdrop-filter` are not rendered (bug 245510).
  - **Firefox:** same as Safari.
  - So every library degrades to a frosted look on Safari, which is most iPhone visitors.
- **Libraries** (licences from memory; verify before adopting):

  | Library | Licence | Notes |
  |---|---|---|
  | `liquid-glass-react` (rdev) | MIT | Displacement + chromatic aberration + elastic mouse follow. Chromium-only for refraction; the README says Safari/Firefox are partial. Adds a dependency plus a mouse-tracking layer. |
  | `liquid-glass-js` / CodePen ports (e.g. Shu Ding's "liquid glass" demo) | Mostly MIT or unlicensed | Demos, not hardened components. |

  None of them beats Duma's cached, SDF-generated map for a small nav pill. Duma's version is also already battle-tested in production.
- **Performance cost:**
  - Backdrop filters re-composite whenever the content behind them changes.
  - Displacement filters cost more than blur. Keep glass surfaces few and small: nav pill, buttons, sheet.
  - Avoid glass over video or canvas animation.
  - Never animate width/height. Use transform and opacity only.
- **Accessibility:**
  - Text over moving, refracted content can drop below WCAG contrast. Add a tint layer (e.g. `bg-white/55` light, `bg-black/40` dark) under the label, plus a subtle text-shadow.
  - Contrast must pass against the worst-case background (test over the busiest hero image).
  - `@media (prefers-reduced-transparency: reduce)` (Chromium; Safari via the system setting): switch to an opaque surface.
  - `prefers-contrast: more`: opaque surface plus a 1px solid border.
  - `prefers-reduced-motion`: disable magnetic hover, rubber-band and hide-on-scroll; keep instant state changes.

## 3. Recommendation for the portfolio nav pill and buttons

**Approach:** copy `LiquidGlass` into `components/ui/liquid-glass.tsx`, after confirming licence/permission. Keep the UA gate. Fallback is `blur(4px) saturate(1.3)` plus a tint. Add the reduced-transparency branch, which Duma lacks.

**Component API:**
```tsx
<NavPill items={[{href, label, icon}]} activeHref hideOnScroll />
<GlassButton size="sm|md|lg" magnetic pressGrow variant="tint|clear" />
<LiquidGlass radius={32} blur={2} saturation={1.28} refraction={…} tint="light|dark" />
<MobileSheet open onOpenChange snapPoints={[0.5, 1]} />  // drag + rubber-band
```

**Motion spec** (motion v12+/13; spring params are starting values, tune by eye):

| Behaviour | Spec |
|---|---|
| Pill size | 56px mobile / 64px desktop height. Radius = height/2. Fixed size, never animated. |
| Active indicator | `<motion.span layoutId="nav-active">` inside the pill. `{type:"spring", stiffness:500, damping:38, mass:0.8}`. The indicator itself is a glass or tint layer. |
| Press | Grow, not shrink (iOS 26 `.interactive()`): `whileTap={{scale:1.06}}`, `{stiffness:600, damping:30}`. Add a brighter specular rim on press. |
| Magnetic hover (pointer:fine only) | Track the pointer within about 1.5× the button's bounds and translate up to 6px toward it via `useSpring(x,{stiffness:300, damping:20, mass:0.5})`. Spring back on leave. |
| Hide/show on scroll | `useScroll` + `useMotionValueEvent`. Hide when the scroll delta is > 8px down past 80px; show on any upward scroll or at the top. Animate `y: -120%`, `{stiffness:400, damping:40}`. Keep a small always-visible pull tab, as Duma does. |
| Mobile sheet drag | `drag="y"`, `dragConstraints={{top:0}}`, `dragElastic={0.2}` (rubber-band past bounds). Close if velocity > 500 or offset > 30% of height. Snap with `{stiffness:400, damping:40}`. |
| Reduced motion | `useReducedMotion()`: no magnetic, no hide-on-scroll, `layoutId` transitions `{duration:0}`. |

**Rules carried over from Duma's scars:**
1. Animate transform only. Never animate size on a `LiquidGlass` element.
2. Don't mix Tailwind `scale-*` with motion `scale`.
3. Don't give a drag sheet a separate press handler.

## Sources
- Duma: `src/components/ui/liquid-glass.tsx`; `process/context/all-context.md` (repo-structure line for liquid-glass); `process/context/uxui/frontend-architecture.md` (~L926, §dnd-kit); commit `8a5b1ce9`.
- WebKit bug 245510 (SVG filters in backdrop-filter), https://bugs.webkit.org/show_bug.cgi?id=245510
- liquid-glass-react, https://github.com/rdev/liquid-glass-react (MIT; Safari/Firefox partial)
- Apple HIG, Materials / Liquid Glass (iOS 26), https://developer.apple.com/design/human-interface-guidelines/materials
- Motion docs, `layoutId`, springs, drag, `useReducedMotion`: https://motion.dev/docs
- MDN `prefers-reduced-transparency`, https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-transparency

## Unresolved
- The licence and origin of Duma's vendored file are unknown. Confirm before copying.
- Library licences and Safari status were cited from memory, not fetched live this session.
- Spring values are untested starting points.

**Status:** DONE_WITH_CONCERNS
**Summary:** Recommend copying Duma's own LiquidGlass component, with a blur fallback on Safari and Firefox, plus a motion-based nav spec.
**Concerns:** The licence of Duma's vendored file is unknown, and web sources were not fetched live.
