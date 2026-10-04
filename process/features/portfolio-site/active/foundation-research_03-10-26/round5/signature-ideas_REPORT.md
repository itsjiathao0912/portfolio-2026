# Round 5 — Signature Ideas (v5 centrepiece pass)

**BLUF:** 15 "signature" moments built on what big brands are known for. Each is tied to Thao's story: payments, compliance, B2B SaaS, community, women in tech. None repeats round 3. Recommended **Signature v5**: one hero centrepiece, **"The Settlement Globe"** (money arcs flying between her projects and countries), plus 4 supporting moments: a **career receipt** that prints as you scroll, a **live metrics stream**, a **compliance shield** and a **community cursor layer**. All the heavy 3D waits until it is needed (lazy-loaded). First-load JS stays at or under 170 KB gzip. On phones and with reduced motion, it falls back to static art.

## Sources browsed (live, 2026-10-03)
- **Current site** (localhost:3003): "Thao Dao is Technical Product Manager at SkyLab Group" → Highlights → Off the screen → Work → Notes on LinkedIn → Contact. 2 canvases already on the page. Screenshot: `research-private/round5/current-site.png`.
- **stripe.com**: an animated WebGL gradient wave behind the hero headline (1 canvas), and a "backbone of global commerce" section with a dotted globe and glowing payment arcs. Screenshot `stripe.png`.
- **linear.app**: no canvas at all. The wow is CSS/SVG: thin light beams and glowing edges sweeping across panels, staged text reveals, and near-real product UI. Screenshot `linear.png`.
- From known brand patterns (not re-opened this pass, to keep CPU light): Apple (a device turning as you scroll), Notion (hand-drawn line characters), Figma Config (multiplayer cursors as a brand motif), Vercel (globe + glowing grid beams), Framer (scroll-linked 3D cards), Canva (colourful sticker shapes), Spline community (soft "clay" 3D objects that follow the cursor).

**Licences:** three.js, @react-three/fiber, drei: **MIT**. cobe (tiny WebGL globe, ~5 KB): **MIT**. motion (motion/react): **MIT**. Rive runtime: MIT. GSAP is free (Webflow licence) but **not** open-source; read the terms before using it. Spline free embeds add a badge and a heavy runtime (~500 KB+), so prefer exporting to a self-hosted GLB. Stripe's gradient is proprietary: **write our own shader**. All characters must be original drawings.

**Not repeated from round 3:** kinetic hero, magnetic buttons, logo marquee, tilt, sticky stacks, the generic horizontal gallery (#21), the generic scroll image sequence (#24), the generic blob, cursor-reveal, before/after slider, counters, scrubbable timeline, the single hero object. Where a v5 idea is close to one of these, its row says what is new.

## House rules (v5)
- **One loud thing per viewport.** The hero centrepiece is the only WebGL on first paint, and it loads after the headline paints.
- 3D loads only when it is about to be needed (`IntersectionObserver` + dynamic `import()`). The canvas pauses when off screen or when the tab is hidden. DPR is capped at 1.5.
- Phones, `prefers-reduced-motion`, `saveData`, or no WebGL2 → a static SVG/AVIF poster with the same composition. The content never depends on the effect.
- All the numbers are real metrics from content-inventory. Nothing is made up.

## Catalogue (15)

| # | Concept | The wow moment | Where | Why it fits Thao | Build | Perf / fallback / reduced motion | Effort |
|---|---|---|---|---|---|---|---|
| 1 | **Settlement Globe** | A dotted globe turns slowly. Glowing arcs "settle" between the cities she has shipped for. Each arc lands on a pin that names the project; hovering a pin brightens its arc and lifts the matching project card | Hero, right half | Payments = money moving across borders. Her career, told as transactions | `cobe` (5 KB) or r3f + instanced points + our own arc shader. Pins come from the projects JSON | Lazy after LCP, ≤60 KB gz. Phones: AVIF loop or SVG. RM: no spin, arcs drawn statically | M |
| 2 | **Career Receipt** | A thermal-paper receipt feeds down from a slot as you scroll. Each line is a role or a win ("Launched KYC flow … −38% drop-off"). It ends with TOTAL years/products, a barcode, and "THANK YOU — let's talk" | About / Highlights | A fintech PM speaks in ledgers. Witty, and still real text | CSS + motion `useScroll`; mask-reveal the paper; monospace font; jagged SVG edge | ~0 KB extra. RM: whole receipt shown. Phones: same, shorter | S–M |
| 3 | **Compliance Shield** | A glassy 3D shield turns to face the cursor. "Threat" chips (fraud, AML, data leak) bounce off it with a ripple. Click it to see the controls she built | Compliance chapter | Turns dry compliance into protection people can feel | r3f + drei transmission material, or Spline → GLB; spring look-at | Lazy on view; shares the three chunk with #1. Fallback: SVG shield. RM: static | M |
| 4 | **Brand Gradient Mesh** | A slowly flowing gradient in her palette behind the hero only, tinted by the current section | Hero background | Colour without clutter (the Stripe signature, in her own colours) | Our own ~40-line fragment shader on one canvas, no three. CSS `@property` conic fallback | ~3 KB; pauses off screen. RM/phone: static CSS gradient | S |
| 5 | **Phone Turn Through Her Apps** | A phone turns in 3D as you scroll; its screen swaps through real app screens from her projects, with a caption for each | Featured case study intro | Real shipped product, not just claims | Pinned section; GLB phone with a texture atlas for the screen; scroll drives the rotation and screen index. *New vs round3 #24: a real 3D model with live screen swaps, not a pre-rendered image sequence* | ~150 KB lazy. Phone: stacked screenshots. RM: static 3/4 view | L |
| 6 | **Community Cursors** | 3–5 friendly fake cursors with names ("Linh — mentee", "WiT Saigon") drift around, now and then point at a section, and leave a sticky-note comment | Home only, low density | Her community-builder story, told through the multiplayer idea | motion/react scripted paths; aria-hidden; on/off toggle in the footer | ~4 KB. Off on touch and with RM. Never covers text | S |
| 7 | **Original Character Cast** | 3 original characters (a PM with a clipboard, a coin called "Settle", a shield buddy called "Audit") appear in dividers, empty states, the 404 and contact, and react to scroll (blink, wave) | Dividers, 404, contact | Warmth for a fintech brief; a memorable brand system | Original SVG + Rive (or Lottie) | Lazy per instance. RM: rest pose | M (illustration) |
| 8 | **Transaction Stream** | A thin stream of "transactions" whose amounts are her real metrics ("+42% activation · SG · ✓ settled"). Status chips flip from pending to settled | Under the hero | Proof in her domain's language; the motion carries information. *New vs logo marquee: data rows with state changes* | CSS scroll + chip flip with motion | ~2 KB. RM: static list of 5 | S |
| 9 | **Career Rail with Depth** | A sideways rail of chapters (fintech → SaaS → compliance → community). The skyline layer, the character layer and the cards move at different speeds; a small train carries the "you are here" marker | /about | Shows growth as a journey across countries. *New vs #21: layered scenery + a story marker* | Pinned section, scroll drives x, 3 parallax layers with CSS transforms | No new deps. Phone: vertical dotted list. RM: no parallax | M |
| 10 | **Light-beam reveals** | Entering a key section, a thin beam sweeps along a card border and the card "powers on" | Highlights, Work | Premium and quiet; tinted beams work on a light theme | CSS conic-gradient mask + `@property` animation | 0 JS. RM: instant on | S |
| 11 | **Approval Stamp** | Each case-study outcome gets a rubber "APPROVED / SHIPPED / COMPLIANT" stamp with ink spread and a small shake | Case-study results | A PM's sign-off, with a compliance joke | motion keyframes + SVG noise filter | ~0 KB. RM: fade in | S |
| 12 | **Women-in-Tech Wall** | A mosaic of people she mentored or spoke to (with consent, or as illustrated avatars). Hover shows the event and a quote; a counter reads "people reached" | Community section | A values-led story; credibility through others | CSS grid + View Transitions to expand a tile | AVIF, lazy. RM: no zoom | M |
| 13 | **"Verify the visitor" KYC** | At the contact form: "Verify you're human: drag the coin into the wallet" → ✓ and a burst of tiny coins | Contact | Her real domain (KYC/onboarding) as a joke that also lightly deters spam | motion drag + canvas confetti (~3 KB) | Keyboard-button alternative. RM: no confetti | S |
| 14 | **Flow-of-funds diagram** | Dots travel along a clean diagram (user → app → PSP → bank). Toggle "before/after redesign" and the number of hops and the speed change | Case study | System thinking for a payments PM. *New vs explorable diagram: a live flow* | SVG paths + CSS `offset-path` | ~0 JS. RM: static arrows | S–M |
| 15 | **Native page-turn transitions** | Home → case study: the project's colour card grows into the header. Going back, the receipt folds back into its card | Route changes | Feels like one app: smooth and premium. *New vs round3 #22: native API, also covers back navigation* | Cross-document View Transitions (`@view-transition`) + named elements | 0 KB. Unsupported browsers get instant navigation | S |

## Signature v5 — TOP-5 and the narrative
**Story: "Every great product is a well-settled transaction — between people, money, and trust."**

1. **Hero centrepiece — #1 Settlement Globe** over **#4 gradient** (one canvas layer). Shows her fintech reach within the first 3 seconds.
2. **#8 Transaction Stream** just below: the proof, as real metrics.
3. **#2 Career Receipt** in About/Highlights: the scroll-stopping moment, her career as a ledger.
4. **#3 Compliance Shield** for the compliance chapter: the one interactive 3D toy. It reuses the globe's 3D chunk.
5. **#6 Community Cursors** + the characters from #7 in Community/footer: warmth and women in tech at the close.

Cheap extras worth adding: #10 beams, #11 stamp, #15 transitions (all ~0 KB).

## Performance plan
- **Lighthouse targets (mobile):** Perf ≥ 90, LCP ≤ 2.2 s (the LCP is the headline text, never the canvas), CLS ≤ 0.02, TBT ≤ 150 ms, INP ≤ 200 ms. Desktop Perf ≥ 95.
- **JS budget:** first load ≤ 170 KB gz (app + motion). The 3D chunk (three + r3f + a drei subset) is ≤ 180 KB gz, loaded once on idle after LCP and shared by the globe and the shield. If `cobe` handles the globe on its own, three loads only when the user reaches the shield.
- **Loading:** `requestIdleCallback` → `import()`. The canvas sits in a fixed-size poster box, so nothing shifts. GLBs use meshopt/Draco compression, ≤ 300 KB total; textures are KTX2/AVIF.
- **Runtime:** one `<Canvas>` at a time; `frameloop="demand"` when idle; pause off screen or when the tab is hidden; DPR ≤ 1.5. Drop to the poster if fps stays below 40 for 2 s.
- **Fallback chain:** reduced motion / saveData / no WebGL2 / low `deviceMemory` → static posters with the same content.
- **Guard:** a bundle-size check and a Lighthouse CI run on the home route.

## Open questions
1. Which cities/projects can be pinned on the globe publicly (NDA)?
2. Which real metric values can be public, for the receipt and the stream?
3. Is there consent to show community faces, or should the wall use illustrated avatars only?
4. Is there budget for an illustrator for #7, or should the characters stay simple geometric marks?

---
**Status:** DONE_WITH_CONCERNS
**Summary:** 15 signature ideas, a cohesive TOP-5 (Settlement Globe hero) and a performance plan. Screenshots of the current site, Stripe and Linear are in research-private/round5/.
**Concerns/Blockers:** Only the current site, Stripe and Linear were browsed live (CPU kept light). The Apple, Notion, Figma, Canva, Vercel, Framer, Awwwards and Spline techniques are described from known patterns and should be checked again before building. GSAP's licence is not open-source. Check the Spline export/embed terms before using it.
