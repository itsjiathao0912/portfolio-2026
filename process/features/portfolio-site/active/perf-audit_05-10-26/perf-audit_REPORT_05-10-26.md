# Portfolio perf audit (read-only) - 05-10-26

Live https://itsjiathao.com, headless Chromium via Playwright, cold cache, one browser at a time.
Mobile = 390x844, 4x CPU, ~9 Mbps / 70 ms RTT. Machine load was 7-23 while measuring (other agents), so
absolute ms are inflated and noisy (esp. mobile); counts (renders, rect reads, nodes) are exact.
"Role" = a role already chosen in localStorage, so the walking guide mounts. No code touched.

## TL;DR
The network side is healthy (TTFB ~0.2-0.3 s, 0.6-1.1 MB, 27-50 requests, FCP/LCP 0.5-0.9 s desktop). The cost is
main-thread work after load, and it comes from three things: (1) 40 clay SVG figures (3.4k of the 5.1k DOM nodes, 391
gradients) on `/`, (2) a wave-flutter `setInterval` that re-renders a figure twice every 420 ms forever and drags Motion
layout projection into 10 commits/s at rest, (3) the guide's `collect()` doing ~900 rect reads + ~630 getComputedStyle
calls every 450 ms while scrolling. On mobile with a role chosen, the guide takes TBT from 191 ms to 1312 ms on `/`.

## 1. Baseline (first number = no role, second = role set / guide running)
| Page, profile | TTFB | FCP | LCP (el) | CLS | TBT | Reqs | Transfer | JS (files) |
|---|---|---|---|---|---|---|---|---|
| / desktop | 300 / 600* | 528 / 892 | 528 / 892 (H1) | .059 / .045 | 0 / 36 | 49 | 906 KB | 369 KB (19) |
| /about desktop | 270 / 220 | 528 / 464 | 784 / 796 (portrait img) | .010 | 0 / 0 | 50 | 1070 KB | 424 KB (21) |
| /work/gocrypto desktop | 313 / 209 | 520 / 464 | 520 / 464 (H1) | .126 | 0 / 0 | 49 | 1063 KB | 430 KB (22) |
| / mobile | 260 / 285 | 748 / 1228 | 760 / 1248 (portrait img) | .083 / 0 | 191 / **1312** | 36 | 807 KB | 340 KB (17) |
| /about mobile | 318 / 313 | 688 / 864 | 688 / 864 (P) | 0 | 61 / 263 | 27 | 609 KB | 298 KB (15) |
| /work/gocrypto mobile | 228 / 267 | 752 / 1168 | 752 / 1168 (P) | 0 | 209 / 328 | 32 | 864 KB | 341 KB (17) |
(*one-off TTFB noise.) Main-thread (CDP Performance metrics, 6 s after load), mobile `/`: no role script 960 ms / task
3.5 s / 24 layouts; role set script 2284 ms / task 6.8 s / 128 layouts / 499 ms style. Desktop `/` role: task 1.9 s, 176 layouts.
Largest assets: fonts archivo-latin 88 KB + archivo-latin-ext 85 KB (home) + inter-latin 47 KB (+ inter-latin-ext 83 KB on
gocrypto); JS chunks 71/47/42/39 KB; `/photos/aabw-winners-stage.webp` 168 KB, `conviction-2026.webp` 83 KB (about);
`/emoji/1fa99-128.webp` 98 KB shown at 56 px (gocrypto). Critical path: HTML -> 17-22 JS chunks (all eager) -> hydrate ->
fonts. CLS .126 on gocrypto and .083 mobile `/` are the only vitals above "good" (<.1) - not diagnosed (likely font swap/late layout).
Hydration/Motion: one Motion chunk (`0x6-...js`, 47 KB) is on every page; three.js/r3f exist only in lazy scene chunks (no canvas on `/`, `/about`, gocrypto).

## 2. Walking guide (guide-dom.ts, guide.tsx) - measured on `/`, desktop, 20 s scroll session
How it detects: `collect()` = `readAvoid` (every a/button/input rect) + `readInk` (TreeWalker over ALL text nodes, Range
rects, only those within 1.5-2.5 screens kept) + `collectTracked` (`querySelectorAll` of 18 tag types incl. every div/li/a,
up to 600, per element: `getBoundingClientRect`, `closest(SKIP)` x2, `getComputedStyle` of the element AND each ancestor
via `isDrawn` in the "inside a card" loop (ancestor rect too), `elementFromPoint` for in-view ones) + `readSpans`.
Per frame while scrolling: `refreshSurfaces` = 1 rect per tracked element near the viewport (~26-30 surfaces; cheap).
Triggers: scroll (rAF + 160 ms settle), resize/ResizeObserver on body+page, pointerover/out + transition events (650 ms "live" window), 2 timers at 700/1600 ms, and `collect()` again from the frame loop if >450 ms since last while dirty.
| Metric | Desktop | Mobile (4x CPU) |
|---|---|---|
| `collect()` avg / max | 19.6 / 67 ms (46 collects in 21 s) | 70 / 171 ms (49 in 21 s) |
| of which collectTracked / readInk / pre | 13 / 4 / ~3 ms | 48 / 14 / ~8 ms |
| getBoundingClientRect / getComputedStyle / Range.getClientRects per 20 s | 42k / 29k / 14k (~2.1k, 1.4k, 0.7k per s) | 36k / 33k / 15k |
| rAF frames while scrolling | 641 in 21 s (~30/s, scroll bursts only) | 292 |
| Main thread busy during session | task 10.0 s of 21 s (incl. page's own Motion work), 7 long tasks, max 191 ms | task 20.1 s of 21 s, **130 long tasks**, max 219 ms |
| Layout / style recalcs | 1037 / 1867 (698 / 643 ms) | 515 / 1059 (819 / 1179 ms) |
| Resting (5 s, no input) | 498 ms task, 122 layouts, 212 style recalcs, 1252 rect reads, 50 commits | 2999 ms task |
Landing latency (last scroll event -> chosen surface, mode ground, stable 200 ms): desktop 0 / 479 / 586 / 615 / 944 ms
(median ~590); mobile 0 / 669 / 722 / 886 / 1734 ms. (Includes the 160 ms settle + fall time; collect itself is only 20-70 ms.)
Layout thrash: `collect()` interleaves reads (rect, getComputedStyle, elementFromPoint) with `dataset.*` writes and sets
`data-guide-standing`/transform in the same turn -> style recalc + layout forced per collect; the frame loop itself (physics) is read-free except refresh.
Idle: with the role set, `/` still commits ~9-10 times/s and re-measures (see section 4); `/about` idles at 3 commits/8 s (blink only).
Over-scanning: the guide is mounted after `requestIdleCallback` but runs on mobile >=360 px (`MIN_GUIDE_WIDTH=360`) where it
costs the most; only 26-30 of ~600 candidates ever become surfaces and 1 is in view at start.

## 3. Clay characters (src/components/clay)
Per figure: bust 79 nodes / 10 gradients; full figure (guide, wave tile) 105-106 nodes / 10 gradients; 0 SVG filters. On `/`:
40 figures = 3,422 nodes and 391 gradients (66% of all 5,125 DOM nodes; 42 / 3,659 / 411 with the guide). The 11 picker tiles
each render an sm AND a sm:+ bust (CSS hidden), and the selected tile renders both the 132 px and 72 px full figure at once.
Animation cost: pose changes are React state (`setPose`, parts re-render with `m` radialGradient/`y` ellipse as the hottest
components: 610 gradient + 474 ellipse renders in 8 s at rest from `tile-recruiter` alone). Moving the body is transform-only (`will-change-transform`) - good.
Gradients are per-figure `<radialGradient>` defs rebuilt on every re-render (ids not shared).

## 4. Re-renders (React commit hook on production build; counts are fibers that did work)
- Resting on `/` (role set): 69-76 commits per 8 s (~9/s). Source: `useWaveFrame` in role-tile.tsx (`setInterval` 420 ms ->
  `setFrame`) re-renders the selected tile's two ClayAvatars (~120 svg renders / 8 s) - runs forever even when off-screen. Each
  commit also runs Motion layout projection (`motion.div layout` on all 11 tiles + layoutId pills): `willUpdate`/`updateLayout`
  made ~980 getBoundingClientRect calls in 5 s from Motion alone (~195/s). This is the main idle cost (layout 122 / style 212 per 5 s).
- Scroll: 377 commits in 21 s (~18/s, +~9/s over idle). 438 renders each of the guide-character svg subtree parts: guide
  `setPose`/`setFacing`/`setRightHalf`/`setHintClear`/`setBubble` fire during walking; the whole 106-node figure re-renders per walk frame (4 frames).
- Visitor store: `useVisitor()` has 8 consumers (project-stack, live-visitor-top, visitor-poll, modal, panel, guide...); one
  context object, so any role/collapsed/ordinal change re-renders all of them (not measured per-change; role change is rare).
- Poll/stats: `/api/geo` once on `/`; no polling interval seen in the 8 s idle window (visitor-poll fetches on demand).
- `useBlink` timers (guide, each tile) re-render a figure every 2.4-5.6 s each; 12 tiles mounted -> ~2-4 extra renders/s of 79-node SVGs.

## 5. Other
- Emoji webp: 128 px set is 98-169 KB each (960 KB total for 9 files) and is displayed at 24-56 px; gocrypto loads 1fa99-128 (98 KB) lazily + 1fa99 (64 px); not eager on `/` or `/about` (0 emoji requests).
- Images: all webp; hero portrait `thao-bw` 36 KB eager (LCP on mobile `/`), `thao-color` lazy; `/about` photos lazy (168/83 KB, ~3x oversize for 520/300 px slots); no `sizes`/srcset widths seen.
- Fonts: self-hosted via fontsource, unicode-range subsets; `archivo-latin-ext` (85 KB) is still fetched on `/` and inter-latin-ext on gocrypto (some glyph on page falls outside latin - e.g. a curly quote/arrow in ext ranges); no `<link rel=preload>` for the latin files, no `display` check done.
- JS: 17-22 chunks per page, all eager; Motion (47 KB) everywhere; `useFrame` canvases are not on first-load pages. No third-party scripts besides `/api/geo`.
- `_headers` gives `_next/static/*` immutable cache; emoji/photos/portrait are non-hashed and get Workers Assets default (revalidate) caching.

## 6. Ranked fixes (impact / effort)
| # | Fix | Impact | Effort | Files |
|---|---|---|---|---|
| 1 | Stop the wave `setInterval` re-rendering React: drive wave with CSS animation / SMIL on the hand part, or pause when off-screen (IntersectionObserver) and only for the picked-hero view | removes ~9 commits/s + ~195 rect/s at rest; cuts idle task ~50% | S | `site/visitor/role-tile.tsx` (`useWaveFrame`), `clay/parts.tsx` |
| 2 | Render ONE ClayAvatar per tile (CSS-size it) instead of sm + sm: duplicates; share gradient defs once (`<defs>` hoisted, `useId`-free fixed ids) and `React.memo` ClayAvatar/Parts | DOM -1.7k nodes, -200 gradients, faster hydrate/style on `/` | S-M | `role-tile.tsx`, `clay/clay-avatar.tsx`, `parts.tsx` |
| 3 | Remove `layout` from the 11 tiles' wrapper (or give them `layoutRoot`/`LayoutGroup` scope) so unrelated commits don't snapshot them; only enable layout for the pick transition | kills Motion projection reads on every commit | S | `role-tile.tsx`, `visitor-picker.tsx` |
| 4 | Guide `collect()`: cache the surface list and only rebuild on resize/ResizeObserver/mutation (settle, not every 450 ms during scroll); in the scroll loop only run `refreshSurfaces`. Tag candidates with `data-guide-surface` (or limit selector to section/img/figure/card classes) instead of every div/li/a; memoise ancestor `isDrawn` (already per-call, make it persistent); batch all reads before any write | collect 20-70 ms -> ~0 during scroll; fewer long tasks (mobile 130 -> ~10) | M | `guide-dom.ts`, `guide.tsx` `onScroll`/`frame` |
| 5 | Delay/limit the guide: start on first scroll or after `load` + 2 s idle, skip on mobile CPU (`navigator.hardwareConcurrency<=4` / `deviceMemory`) or raise `MIN_GUIDE_WIDTH` to ~768 | mobile `/` TBT 1312 -> ~190 ms; FCP/LCP +400 ms gone | S | `guide.tsx` (`painted`/`wide`), `guide-logic.ts` |
| 6 | Guide state out of React per frame: keep pose/facing/bubble offsets in refs, toggle `data-pose` on the node and let CSS swap parts; only `setBubble` stays state | -9 commits/s while walking; no 106-node re-render per step | M | `guide.tsx` `syncPose`/`paint`, `clay/poses.ts` |
| 7 | Replace per-scroll surface probing with IntersectionObserver on tagged surfaces + a sorted array (binary search by y) instead of scanning `tracked`; `readInk` only for the section in view | cheaper settle, lower landing latency (~590 -> ~250 ms by shortening 160 ms settle + skipping recollect) | M-L | `guide-dom.ts`, `guide.tsx` |
| 8 | Resize emoji to 64 px (or serve 64 variant to <=56 px slots) and re-encode photos to display size with `sizes`; add `fetchpriority=high` + preload on the LCP portrait | -100 KB gocrypto, -150 KB about; LCP mobile `/` | S | `public/emoji/*-128*`, `site/portrait.tsx`, `about` images |
| 9 | Font: drop the `latin-ext` fetch (find the offending glyphs) and preload archivo-latin/inter-latin; check CLS .126 gocrypto / .083 mobile `/` (reserve image/embed sizes, `size-adjust` fallback) | -85 KB, CLS under .1 | S-M | `app/layout.tsx`, `globals.css`, gocrypto page |
| 10 | Split `VisitorContext` into state/actions (or select with `useSyncExternalStore`) so role changes don't re-render all 8 consumers; lazy-import below-fold picker/poll | minor today, grows with stats | M | `site/visitor/store.tsx` |

## Method caveats
No dev-mode Profiler used; commit hook and per-call wrappers (rect/getComputedStyle/Range/querySelectorAll) injected via
`addInitScript` on production, which adds a little overhead. Component names are minified in prod (labelled by DOM host/testid).
Latency measured with synthetic wheel/`scrollTo`, not real touch. Scripts live in the session scratchpad (not committed).
