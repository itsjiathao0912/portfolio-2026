# Wow ideas & hidden gems — round 3

**BLUF:** 20 new ideas that go beyond `motion-ideas_REPORT.md` (no kinetic hero, magnetic buttons, marquee, tilt, sticky stacking, counters, emoji burst, etc. repeated). Best bets: a **cursor-reveal "real me" layer**, a **before/after slider** and **scrubbable timeline** in case studies, a **playful 404 mini-game**, and a **footer signature you can draw**. Everything stays light-theme, content-first, under ~15 KB JS per idea, and has a still fallback for reduced motion.

## Sources browsed (live, 2026-10-03)
- Awwwards portfolio winners — https://www.awwwards.com/websites/winner_category_portfolio/ (NOTHIN' noth.in SOTD Aug 2026; Pacôme Pertant pacomepertant.com SOTD Jun 2026; Podium, Adcker, Lama Lama)
- Awwwards SOTD list — https://www.awwwards.com/websites/sites_of_the_day/
- Trend note: immersive 3D ≈ 61% of SOTD Q1 2026; slow-scroll easter eggs a recurring pattern — https://digitalstrategyforce.com/journal/why-are-immersive-experiences-dominating-the-2026-awwwards/ ; Mr. Panda portfolio "more easter eggs" — https://converter.brightcoding.dev/blog/mr-pandas-portfolio-the-3d-site-fighting-creative-industry-toxicity
- Muzli 100 portfolios 2026 — https://muz.li/blog/top-100-most-creative-and-unique-portfolio-websites-of-2025/
- motion.dev examples (scramble text, wavy text, scroll word reveal, drag with spring, draggable ticker, cursor image hover, layout anchor) — https://motion.dev/examples
- 21st.dev catalogue (heroes 1,152; text 663; backgrounds 365; marquees 113; timelines 74; top items "Scroll media expansion hero", "Container Scroll Animation", "Spotlight Card") — https://21st.dev/community/components
- 21st.dev terms — https://21st.dev/terms

Screenshots: `research-private/round3/wow/` → `nothin.png` (single 3D heart object inside the wordmark), `pacome.png` (colour-block logo loader), `21st-text.png`, `motion-examples.png`.

**Licence note (21st.dev):** the site has **no blanket licence**. Each component carries its own licence chosen by its author (terms §3.1 require authors to keep upstream licences, e.g. MIT + credit). Rule for us: open each component page, record its licence in our credits file, only adapt MIT/Apache/ISC ones, never ones derived from Tailwind Plus or other paid kits. No component below is adopted yet — each "21st" row says "check per item".

## House rules (same as before, short)
Light theme, one accent per project, motion ≤ 400 ms, nothing autoplays sound, every effect has `prefers-reduced-motion` → static state, touch has an equivalent tap (no hover-only content), gems never hide essential info.

## Catalogue (20 new ideas)

| # | Idea | Source | What visitor sees | Where | Build | Perf | Mobile / reduced-motion | Gem |
|---|---|---|---|---|---|---|---|---|
| 1 | **Cursor-reveal layer** | 21st "Spotlight Card" pattern; Awwwards portfolios with mask reveals | A soft circle follows the cursor over the hero photo/headline and reveals a second layer underneath (doodle sketch of the photo, or the headline rewritten casually: "Product designer" → "professional sticky-note arranger") | Hero or /about portrait | CSS `mask-image: radial-gradient` driven by 2 CSS vars set in a pointermove handler | Trivial, no re-layout | Touch: press-and-hold reveals at finger; RM: static toggle button "see the sketch" | Yes |
| 2 | **Scramble-on-hover nav/labels** | motion.dev "Scramble text" | Nav words briefly scramble into random glyphs and settle back when hovered | Nav, section eyebrows | Tiny rAF loop, ~1 KB; or motion's example | Negligible | Touch: none (plain); RM: off | No |
| 3 | **Scroll word reveal for the one big statement** | motion.dev "Scroll word reveal" | A single manifesto paragraph whose words go grey→ink as you scroll through it | Home "about" statement | `useScroll` + per-word opacity transform | Fine (<60 words) | Same on mobile; RM: full ink | No |
| 4 | **Single hero object** | NOTHIN' (noth.in, SOTD Aug 2026) — one 3D object living inside the wordmark | One small signature object (e.g. a glossy sticky note / cursor / her initial) sits *inside* the name and rotates gently toward the pointer | Hero | Pre-rendered image sprite (24–36 frames) scrubbed by pointer X — no WebGL needed | ~150 KB WebP sprite, lazy | Tilt from device orientation off by default; tap = spin once; RM: single frame | No |
| 5 | **Colour-block logo morph loader** | Pacôme Pertant (SOTD Jun 2026) — geometric colour blocks | First visit only: 3 geometric shapes in project colours snap into her logo/initials in <700 ms, then become the nav logo | First load / nav logo | SVG + motion `layoutId` into nav | Must not block LCP: render page under it, cap 700 ms, skip on return (sessionStorage) | Same; RM: skip | No |
| 6 | **Draw-your-signature footer** | Common Awwwards footer surprise; handwritten-signature SVG pattern | Footer says "Leave a mark" — visitor scribbles on a small pad; their doodle fades into a wall of the last few (local-only) doodles beside her own animated signature | Footer | Canvas 2D pointer path; her signature = SVG `stroke-dashoffset` draw | Canvas only when footer in view | Works great with finger; RM: signature shown drawn | Yes |
| 7 | **Playful 404** | Muzli/Awwwards 404 tradition | 404 is a tiny game: drag the lost sticky note back onto the board; on success, links to Work/Home appear with confetti-free "found it" | /404 | motion `drag` + drop zone check | Page-local | Drag works on touch; RM: links visible immediately | Yes |
| 8 | **Konami / type-a-word secret** | Classic easter egg; Mr. Panda "more easter eggs" | Typing `thao` (or ↑↑↓↓←→←→BA) flips the site into "sketch mode" (hand-drawn outlines, marker font on headings) until reload | Global | keydown buffer; toggles `data-mode="sketch"` CSS | ~0 | Mobile: tap the logo 7 times; RM: same, no transition | Yes |
| 9 | **Hidden mini-character on long scroll** | "Slow scroll reveals easter eggs" trend (digitalstrategyforce) | A tiny character peeks from the page edge once per visit after ~70% scroll on a case study, waves, ducks away; clicking it shows a one-line fun fact | Case-study pages | SVG sprite + `whileInView` once | ~5 KB SVG | Tap; RM: static peek, no motion | Yes |
| 10 | **Draggable ticker of skills/tools** | motion.dev "Ticker: Draggable" | A slow ticker of tools/methods the visitor can grab and fling; it springs back into its drift | /about (not home — home already has the logo marquee) | motion ticker/drag, `dragElastic` | Light | Native swipe; RM: static wrapped list | No |
| 11 | **Before/after slider** | Common case-study pattern; 21st image/comparison components (check licence per item) | Drag a handle across a redesigned screen: old ↔ new | Case-study "redesign" sections | `clip-path: inset()` + range input (accessible, keyboard) | Two images lazy | Native range drag; RM: unaffected (user-driven) | No |
| 12 | **Scrubbable project timeline** | motion.dev scroll-linked; 21st "Timelines" (74) | A horizontal timeline of the project (research → test → launch) with a draggable playhead; each stop swaps the image/quote above | Case study | Range input + `AnimatePresence` crossfade | Light | Swipe/tap stops; RM: crossfade → instant swap | No |
| 13 | **Hoverable result chart** | Data-storytelling pattern (NYT/Pudding-style, in our own words) | A clean line/bar chart of a metric (e.g. activation 22%→41%); hover/tap a point shows annotation "← shipped onboarding v2 here" | Case-study results | Hand SVG (no chart lib) + `pathLength` draw-in | <5 KB | Tap points; RM: no draw-in, line shown | No |
| 14 | **Explorable diagram** | Explorable-explanation tradition | User-flow or IA diagram where clicking a node highlights its path and shows the problem/solution note | Case-study process | Inline SVG, CSS classes toggled; `<button>` per node | ~0 | Tap nodes; bottom sheet for notes | No |
| 15 | **"Toggle the constraint" mini-interaction** | Explorable explanation | One switch in a case study ("show with old nav" / "with new nav") re-renders a mock in place, so the reader *feels* the design decision | Case study (1 per project max) | Two React states + layout animation | Light | Same; RM: instant | No |
| 16 | **Scroll media expansion** | 21st "Scroll media expansion hero" (10.2k) — check licence | A small rounded video/still in the case-study intro grows to full-bleed as you scroll, then text resumes | Case-study cover | `useScroll` → scale/borderRadius on one element | Use poster image; video only if muted & small | Mobile: grow to full width only; RM: show final size | No |
| 17 | **Text that remembers you** | Personalisation gems on Muzli portfolios | Return visitors get a different hero greeting ("Welcome back — new since you left: X") | Hero | localStorage last-visit + content `updatedAt` | ~0 | Same; nothing animated | Yes |
| 18 | **Time-of-day hero** | Awwwards portfolio pattern (local time shown in nav) | Small line "It's 9:14 pm in Saigon — I'm probably sketching"; hero accent tint shifts slightly morning→night | Nav/hero | Intl date + CSS var | ~0 | Same | Yes (soft) |
| 19 | **Sticker you can peel** | Sticker trend in 2026 portfolios | One sticker on a project card has a curled corner; drag it to peel and reveal a hidden note ("this one almost didn't ship") | One featured card | CSS 3D rotate on drag (motion drag), shadow | Light | Drag with finger; RM: corner tap toggles | Yes |
| 20 | **Copy-email delight** | Common footer micro-surprise | Clicking the email copies it and a small "copied ✓" ink stamp lands next to it, slight rotate | Footer/contact | motion spring, clipboard API | ~0 | Same; RM: text swap only | No |

## Data storytelling summary (case studies)
Use at most **2 interactive data pieces per case study**, chosen from: #11 before/after, #12 scrubbable timeline, #13 hoverable chart, #14 explorable diagram, #15 constraint toggle. All are user-driven (so reduced-motion barely affects them), keyboard accessible (`<input type="range">`, `<button>`), and degrade to a static image + caption in print/no-JS.

## TOP-10 to build next (ranked)
| Rank | Idea | Why |
|---|---|---|
| 1 | #11 Before/after slider | Highest value for a designer's case studies; cheap, accessible |
| 2 | #1 Cursor-reveal layer | The single "wow" moment on home; personality without noise |
| 3 | #13 Hoverable result chart | Makes outcomes credible and memorable |
| 4 | #7 Playful 404 | Pure gem, isolated page, zero risk to main flow |
| 5 | #6 Draw-your-signature footer | Memorable sign-off, great on phones |
| 6 | #12 Scrubbable timeline | Turns the process section into something to touch |
| 7 | #8 Secret word / Konami sketch mode | Classic gem, shareable ("type thao") |
| 8 | #3 Scroll word reveal (one paragraph only) | Calm, editorial, very cheap |
| 9 | #19 Peelable sticker | One hidden note, fits the sticker theme from round 3 |
| 10 | #18 Time-of-day line | Tiny human touch, no motion budget |

## What to avoid (to stay minimal)
- Full WebGL scenes / 3D-heavy heroes (the 61%-3D Awwwards trend) — fights content-first and mobile perf; fake it with sprites (#4) if wanted.
- Scroll-jacking beyond one pinned section; custom cursor replacing the system cursor everywhere.
- More than **3 hidden gems on one page**, or gems that hide essential info/nav.
- Long intro loaders (cap #5 at 700 ms, first visit only).
- Sound, autoplaying video with sound, particle backgrounds, glitch/noise shaders.
- Adopting 21st.dev components without a recorded per-item licence.

## Open questions
1. Which secret word for #8 — "thao" or Konami?
2. Is there real metric data allowed publicly for #13 charts (client NDA)?
3. Should doodles in #6 stay local-only (recommended) or be shared (needs storage + moderation)?

**Status:** DONE
**Summary:** 20 new ideas with sources, build/perf/mobile/RM notes, gem flags, data-storytelling set, ranked TOP-10 and avoid list; 4 live screenshots saved.
**Concerns/Blockers:** 21st.dev has no blanket licence — per-component check required before adapting; two sites' screenshots captured only their loaders.
