---
name: research:visitor-identity
description: "Research for the home-page visitor identity system: role picker replacing the persona control, clay avatar, walking guide character, geo greeting, live stats and poll on D1."
date: 04-10-26
metadata: {type: report, feature: portfolio-site, phase: research}
---

# Visitor identity: research findings

```yaml
context-envelope:
  feature: portfolio-site
  phase: RESEARCH
  session-goal: role picker + clay avatar + walking guide + geo greeting + live stats + poll (home only)
  branch: main
  worktree: main
  context-group: process/context (all-context, tests, uxui)
  blast-radius-packages: src/components/site/project-stack.tsx, site/home/persona-control.tsx, site/home/persona-order.ts, signature/participate/*, signature/characters/*, src/components/people/*, schema/migration.sql, src/lib/db.ts, new src/app/api/visit
  active-plan: none
  test-runner: bun test (unit) | playwright (isolated e2e)
  validate-contract: none
```

**BLUF.** (1) The walking-on-edges mascot exists in `flowser-turborepo` and is directly portable in technique, but it is a private repo with no LICENSE file; ownership is unconfirmed. (2) Cloudflare `request.cf` gives country/city/region/timezone in the Worker for free via `getCloudflareContext().cf`. (3) A D1 counter table plus polling fits the current stack with no new infrastructure. (4) The current persona state (`usePersona`, `PersonaControl`, `orderForPersona`) is already the single source other parts read, so one expanded role list can drive everything.

## Scope and Blast Radius
- Replaced: `src/components/site/home/persona-control.tsx`, rendered only in `src/components/site/project-stack.tsx:168`; `persona-order.ts` (`HOME_PERSONAS` = recruiter/founder/engineer, `ORDER`, `orderForPersona`, `flipOffset`, `HOME_PERSONA_NOTE`).
- Shared state: `src/components/signature/participate/store.tsx` (`ParticipateProvider` mounted in `src/app/layout.tsx:55`; `usePersona`, localStorage key prefix `thao:participate:`). `PERSONAS` there is a different list (recruiter/founder/engineer/curious) and `homePersona()` filters stored values down to the 3 home ones, so the two lists must be reconciled.
- Home page: `src/app/page.tsx` (server component; `layout.tsx` is `force-dynamic`, so request-time geo is available).
- DB: `schema/migration.sql` (idempotent CREATE IF NOT EXISTS, never a semicolon inside a comment), `src/lib/db.ts` getDb(), `src/lib/local-db.ts`.
- Existing dead/lab code to know about: `signature/characters/*` (outlined flat cast, rejected in round 6), `signature/participate/{visitor-picker,build-next-poll,greeting,stamp-passport}` (lab only; `/lab` 404s in production via `src/lib/lab-only.ts`), `gems/mascot.tsx` deleted in d6cc79e.
- Design constraints already decided: no dark bands on home, one radius/shadow/spring family (`src/components/motion/springs.ts`), max one canvas, no infinite animation except marquee/ticker/rotating word/globe. R4 listed "poll", "characters", "mascot", "greeting" under DROP (`autoresearch-ux-261004_04-10-26/research/R4-placement.md` rows 26, 28, 30). This feature reverses those verdicts; the reasons they were dropped (fake-looking percentages, off-style art, busy, chatbot toast) are the acceptance risks.
- Out of scope: other pages, 3D, auth.

## Key Facts
1. Current picker: segmented radiogroup with sliding `layoutId` thumb, arrow keys, "Show me first:" label; choice persisted; reorders cards via FLIP (`flipOffset`, max 400 px).
2. `readJSON/writeJSON` in `participate/logic.ts` are the safe localStorage helpers. `usePersona()` is safe outside a provider.
3. People avatars today: DiceBear notionists (CC0 artwork, MIT code) rendered server-side into a shared `<symbol>` sprite (`src/components/people/avatar.tsx`). Seeds are role labels.
4. DB pattern: raw SQL via `queryAll/queryFirst/execute`; local dev uses better-sqlite3, tests use bun:sqlite through the same wrapper (`tests/helpers/test-db.ts` `createTestDb()`). Remote migrations via `scripts/db-migrate.mjs`. `wrangler.jsonc` D1 id is still `TBD-created-by-setup-script` and nothing is deployed yet (all-context.md).
5. Not on a Worker, `getCloudflareContext()` throws; `readRuntimeEnv` shows the required try/catch pattern. `assertCloudflareBindingsAllowed()` blocks real bindings under E2E/LOCAL_DB_PATH.
6. Reduced-motion: use `useReducedMotion` from `@/lib/use-reduced-motion` (hydration-safe).

## 1. Mascot prior art (flowser-turborepo, read-only)
- Component: `apps/flowser/src/components/ui/interactive-mascot.tsx` (742 lines). Only consumer: `apps/flowser/src/app/(dashboard)/dashboard/_mock/pricing-selector.tsx` (wrapper at line ~1636, `data-mascot-walkable` on ~8 elements). Added in commit 70fd5678 (2026-08-12). Also `packages/ui/src/components/sprite-animator.tsx` (CSS background-position sprite sheet, interval-driven, not used for the walker).
- Technique (from the file header and code):
  - State machine: idle, dragging, falling, landing, walking, hopping, tucking.
  - Walkable surfaces: viewport floor always; any element tagged `data-mascot-walkable` contributes its TOP edge; the anchor element is goal and surface. Queried with `querySelectorAll` each frame and read with `getBoundingClientRect()` live, so it stays glued to real borders after layout shifts.
  - Rendering: a body-portal `position: fixed` node moved by writing `transform: translate3d(...) rotate(...)` directly in a `requestAnimationFrame` loop (no per-frame React render); coordinates in viewport space.
  - Pathfinding: "floor highway": walk toward anchor x; on a platform walk to nearest x then step off and fall to the next border below; swept collision (checks which border the feet crossed this frame) so it never tunnels; hop arc to climb up.
  - Walk look: wiggle rotation `sin(t*0.3)*11deg` plus bob; static PNG (not a sprite), so cost is trivial.
  - Reduced motion: read once at mount; if reduced, the pointer pickup and the idle peek are disabled (idle CSS also sets `animation:none; opacity:0`).
  - Scroll sync: none needed; positions are recomputed each frame from live rects, so scroll is implicit. It does NOT follow a scrolling user; it goes home to an anchor.
- What is reusable: surface registry via data attribute, swept landing, live rect reading, rAF + direct transform. What is NOT present: following a scroll position, speech bubbles, role awareness, edges other than top edges, mobile handling (touch drag only), per-frame `querySelectorAll` caching (does the scan every frame while falling).
- Licence/ownership: no LICENSE file found at the repo root; root and app `package.json` are `"private": true`; git author on all commits is `flowser <flowser.ai@gmail.com>`, while this portfolio's commits are by `kynam <knamnguyen.work@gmail.com>`. Same human may own both (the repo sits in the same user's Documents), but this is not provable from the files. The mascot art asset is `/flowser-logo.png` (a brand logo, not reusable as a clay character). Treat code as "reuse the technique, rewrite the code" unless Thao confirms she or her team own it; the file also depends on `sonner` and `next/image`, which this repo does not use.

## 2. Clay avatar approach
Reference image is a stock clay bust; excluded.

| Option | What it is | Fit | Cost / risk |
|---|---|---|---|
| (a) Own parametric 2D SVG "clay" system | Layered SVG: body, head, hair, outfit, prop, plus soft inner gradients/highlights and an offset blurred shadow for plasticine shading; parts keyed by role, skin tone, hair | Originality guaranteed (required); fully themeable via CSS tokens; poses = swapping/rotating limb groups; animates with transform/opacity only; bundle = hand-written SVG (a few KB per role) | Design effort is the main cost; "clay" look depends on filter-free tricks (radial gradients + highlight ellipse) to stay cheap; needs art direction review |
| (b) Licensed packs | Web search found: Microsoft Fluent Emoji 3D (MIT, 1500+ emoji, PNG/SVG, people emoji with 6 skin tones; GitHub microsoft/fluentui-emoji) which has a soft 3D "plastic" look but is recognisably Microsoft emoji, not original; 3D CC0 models (Polygonal Mind "100 Avatars", Meshy "claymation" CC0 gallery) are 3D meshes needing renders; IconScout "clay" icons need their licence read. | Fast, but violates "all characters must be original", and CC0/MIT code or art is not "ours". Exact terms for the clay packs were not verified from the vendors' licence pages, only from search summaries | Style inconsistency, brand dilution, attribution/terms drift |
| (c) Lottie / Rive | Runtime-animated vector files | Rive has a state-machine for poses; needs authoring in external tools and a runtime (Rive wasm is non-trivial vs a hand SVG); Lottie json large and CPU-heavy | Extra runtime + toolchain; not verified against Workers bundle size here |
| (d) Pre-rendered sprite sheets | PNGs rendered from 3D | Truest clay look; needs a 3D toolchain and N roles x M poses x frames of images; heavy bytes; recolouring impossible | Largest payload and production effort |

Evidence on consistency: the site's existing people art is notionists (thin-line illustration, CC0); a clay avatar will visually clash with it on the same page unless the notionists stack is replaced or kept strictly in "real people" rows. R2/design spec already decided "notionists only" for people illustration; this feature introduces a second illustration language. This is an open decision (see questions). (a) is the only option satisfying "original" + "2D, animates fast" + "reflects role" without new runtime.

## 3. Geo
- `getCloudflareContext().cf` is typed `IncomingRequestCfProperties` (`@opennextjs/cloudflare` 1.20.8, `cloudflare-context.d.ts`); `cf` may be `undefined`. Official request docs list `country` (2-letter), `city`, `region`, `regionCode`, `timezone`, `latitude/longitude`, `postalCode`, `continent`, `asn`; city/region are `string | null` ("if known").
- The docs note `request.cf` is not available in the dashboard/Playground preview editor. Search result said geolocation fields city/lat/long/postal are for Business and Enterprise scripts; this conflicts with the widely used free-plan behaviour described in blog posts and was not resolved from first-party docs. Verify on the real deployed Worker (free plan) before relying on `city`.
- The "Add visitor location headers" Managed Transform (cf-ipcity etc.) is a separate, Enterprise+Bot Management feature; not needed because the cf object is read in code.
- Locally: `next dev` uses `initOpenNextCloudflareForDev` only if configured in next.config.ts; it is NOT called in this repo's `next.config.ts` and `getCloudflareContext()` throws locally (see `runtime-env.ts` comment). Fallback needed: env override or a fixed dev value; E2E must inject geo through a seam like the existing `LOCAL_DB_PATH`/`PORTFOLIO_E2E` pattern.
- Where to read: a server component (home page) can call it, but the home page then gets visitor-specific HTML; combined with `force-dynamic` already on, no cache change. If geo is fetched client-side via an API route instead, the HTML stays shareable and the greeting hydrates after.
- Accuracy caveats: IP geolocation is city-approximate, wrong for VPN/mobile carrier/corporate egress, and `city` may be null; copy must tolerate null/wrong ("Hey from near ..."), offer a one-tap "not here?" or fall back to country only. Region names for Vietnam are in English ("Ho Chi Minh"); display names can be mapped with `Intl.DisplayNames` for the country code.
- Privacy: never store the IP; the request already has it but code should read only `cf` fields and discard. Store only country code (and role) counters. Whether the greeting itself sends city anywhere: no, it renders only.

## 4. Live stats on D1
Proposed schema (idempotent, follows existing file rules):
- `VisitTally(role TEXT, country TEXT, count INTEGER, PRIMARY KEY(role,country))` aggregate counters.
- One-per-visitor guard without storing identity: client generates a random `visitorId` in localStorage; server stores only a salted hash (`VisitorSeen(hash TEXT PRIMARY KEY, firstSeenAt)`), or uses `INSERT OR IGNORE` on the hash then increments only when `changes=1`. Role changes: store hash -> role and adjust counters (decrement old, increment new) so counts stay "people", not "clicks".
- API: `POST /api/visit` (body: role, visitorId; country from `cf`, never from client), `GET /api/stats` (aggregates only: totals per role, count for caller's country, rank of the caller's country). Add `Cache-Control` short max-age to cut D1 reads.
- Anti-spam without auth: server-derived country, strict role enum validation (zod, already a dependency), body size limit, per-hash idempotency, optional coarse rate limit (e.g. N writes per hash per day via `VisitorSeen.updatedAt`), Cloudflare rate-limiting rules or Turnstile if abuse appears. Bots can still inflate by minting visitorIds; a stats display is vanity data, so abuse is a credibility risk rather than a security risk; counts can show as "at least". Not verified: Workers free-plan D1 write limits in the context of a popular page (check D1 pricing limits).
- Read path: polling every ~10-20s with `visibilitychange` pause fits "feels live" with zero new infra. SSE on Workers is possible but holds a connection per visitor and still polls D1 server-side; a Durable Object is the only truly push option, and this repo's own notes (this project has no DO, `wrangler.jsonc` says "no crons / Durable Objects", and OpenNext requires a custom entrypoint wrapper for extra exports) make it the heaviest option. For a vanity counter, optimistic increment on the visitor's own click plus polling is the lowest-cost path.
- Seed/empty state: tables empty on first deploy; UI must render honest zeros ("You're the first Founder from Vietnam") instead of fabricated baselines. The lab poll used an invented `POLL_BASELINE`; R4 dropped the poll specifically because percentages "read as fake", so fake seeds are a known trust risk.
- Tests: unit tests via `createTestDb()` against the real wrapper (pure SQL functions in `src/lib/visits.ts`, route handlers thin); schema already auto-applied by `createLocalD1`. E2E: isolated lane uses a seeded local SQLite file, so the API works end to end; geo and `visitorId` need a seam. Mutation-check new tests per `process/context/tests/all-tests.md`. `tests/e2e/fixtures.ts` stubs LinkedIn only.

## 5. Poll
Same infra: `PollVote(visitorHash PRIMARY KEY, option TEXT, updatedAt)` plus `GET` returning counts per option; one vote per hash, changeable. Options exist as content in `participate/logic.ts` `POLL_OPTIONS` (4 options). It reuses the same visitorId and `/api/*` pattern. Not decided: whether it appears at all given R4's DROP verdict (fake-looking percentages); with real counts and a minimum-votes threshold before showing percentages, that objection is addressed.

## 6. Risks
- Performance: walker is a single fixed node animated via transform in rAF; JS cost is the rAF loop plus rect reads; per-frame `getBoundingClientRect` over N surfaces forces layout; cache rects and refresh on scroll/resize/ResizeObserver. SVG avatar parts are inline text, bundle size low; lazy-mount the walker after first paint (the repo already has `LazyMount`). Page budget: the project has `scripts`/CSS checks but no JS-size gate found in this repo.
- Accessibility: character and bubble are decorative; speech must not be the only way to get information (make it `aria-hidden` or a polite live region off by default); a persistent "Hide character" control, honour `prefers-reduced-motion` (no walking; static avatar chip and one static line); keyboard-operable role picker (radiogroup like the current one); focus not stolen; bubble must not cover tap targets (44px rule already used).
- Nav conflict: floating glass nav pill and the sticky TOC in the project stack both occupy fixed space; a walking character along element edges overlaps text/hover cards (`LiftCard`) and could collide with the lift animation.
- Privacy notice: needs plain wording, e.g. "Your role and country (from your connection) are counted anonymously. No IP address is stored." Whether to show it at the point of choice is a copy decision for Thao.
- Abuse: inflated counters; offensive free text is avoided by using an enum only (no free-text role).
- Brand: R4 judged characters/greeting/poll as off-brand and busy; the "minimal, posh, iOS-smooth" bar is at odds with a roaming character unless it is rare, small, quiet and dismissible.
- Stale facts risk: stats claims must come from the DB, never invented; guide lines about Thao must come from `content/` as the existing logic does (`RECRUITER_TLDR`, tile builders test numbers against sources).

## 7. Proposed architecture (one system; for INNOVATE/PLAN to confirm)
Single source of truth: extend `HOME_PERSONAS` to the expanded role list in one module (e.g. `src/components/site/home/roles.ts`): per role `{id, label, blurb, avatarSpec, projectOrder, viewNote, guideLines[], statsLabel}`. `usePersona` store holds the role id; migrate the localStorage value (`thao:participate:persona`) and reconcile with `PERSONAS` in participate/logic.ts (which includes "curious" and is used by lab code).
- Picker (replaces `PersonaControl`): lives at the top of "Selected work" inside `ProjectStack`'s header where the control is today, so a pick visibly reorders the cards below. First visit: expanded "Who's visiting?" panel with geo greeting and avatar cards (grid, radiogroup). After choosing: collapses to an avatar chip ("You: Product designer, change") that reopens the panel; choice persisted. "Everything/none" must remain a way out (today `null` = default order).
- View adjustment: reuse `orderForPersona` and FLIP; add `ORDER` per new role (content mapping needs Thao's input since slugs/emphasis are editorial) and `HOME_PERSONA_NOTE` per role; roles without a bespoke order fall back to default order (the function already keeps unlisted items in default order).
- Avatar: `ClayAvatar` SVG component (role, skin, hair, pose) used by picker, chip, and walker; poses walk/wave/point/talk/sit as prop-driven groups.
- Guide: `GuideCharacter` client component, lazy-mounted, fixed layer, registry via `data-guide-walkable` attributes on section edges (technique from flowser, rewritten), scroll-follow target = the next waypoint relative to scroll position; speech bubble content from `guideLines[role][sectionId]`; hide control; off under reduced motion/touch-only if budget requires.
- Stats: `src/lib/visits.ts` (pure SQL), `/api/visit`, `/api/stats`, `VisitorStats` client component with polling; geo helper `src/lib/geo.ts` returning `{country, city, region, timezone}|null` with env/E2E fallback; poll component reusing the same endpoints.
- Phased order (MVP first): P1 role module + expanded picker replacing PersonaControl + persistence + chip + view note + tests (no DB, no mascot). P2 clay avatar system (picker + chip). P3 geo greeting (cf read + fallback + copy). P4 D1 tables + visit/stats API + stats UI (honest empty state). P5 guide character (static first, then walking). P6 poll. Each phase ships behind the hide control and passes the existing QA checklist (no empty viewport, radius/shadow tokens, reduced motion, no console errors).

## Test Gap Analysis
1. No tests exist for: geo reading, visits SQL, API routes, role module, guide, new avatar. `tests/unit/signature-participate.test.ts` covers old `PERSONAS`/poll baseline logic that will change; `tests/unit/home-redesign.test.ts` and e2e `home.spec.ts` presumably assert the 3-persona control (not read in this pass; unverified) and will need updating.
2. Behaviours with no asserting test yet: role choice persists and reopens; chip reopens picker; each new role has an order and note; stats count one visitor once; role change adjusts counters; missing/null geo yields a graceful greeting; reduced motion disables walking; hide control works.
3. Tier (preliminary): role/order/note logic, SQL counters, API validation = Fully-Automated (bun + `createTestDb`); picker/chip/persistence/reorder = Fully-Automated e2e (Playwright isolated lane); walking path/visual clay quality = Agent-Probe (screenshots); real `request.cf` city on the deployed Worker and free-plan field availability = Known-Gap until deployed.

## Infra Improvement Suggestions
- A geo seam (env var read by `geo.ts`, set by `run-isolated-e2e.mjs`) would close the geo Known-Gap locally.
- Call `initOpenNextCloudflareForDev` in `next.config.ts` (Not currently done) if local `cf` data is wanted; verify it does not break the isolated lane.

## Open Questions for Thao
1. Final role list (marketer, product designer, growth, data, investor, student, fellow PM, curious, plus the existing three?) and the project order/note per role (editorial).
2. Is `flowser-turborepo` yours to reuse (no LICENSE, private)? Technique rewrite assumed otherwise.
3. Clay avatar vs notionists: keep both (notionists for "people" stats) or replace notionists site-wide?
4. Should "Everything/no role" stay as an option? The new picker replaces the control that currently offers it.
5. Does the guide follow the visitor's scroll (new behaviour) or walk on a schedule? How often may it speak, and one-shot or repeated?
6. Greeting: if city is wrong/null, show country only? Show a "not here?" correction?
7. Stats wording and ranking tone ("playful ranking"): rank countries, roles, or both; minimum-count threshold before showing percentages?
8. Poll: reinstate despite R4's drop verdict, and which question and options?
9. Privacy notice placement and exact wording; any jurisdictional requirement (visitors from EU/VN) is not researched here.
10. Cloudflare plan: confirm free-plan `request.cf.city` availability on the real Worker (docs are ambiguous), and D1 write limits for a viral spike.

## Sources
- Cloudflare Workers Request docs: https://developers.cloudflare.com/workers/runtime-apis/request/
- Managed Transforms reference: https://developers.cloudflare.com/rules/transform/managed-transforms/reference/
- Geolocation example: https://developers.cloudflare.com/workers/examples/geolocation-hello-world/
- Microsoft Fluent Emoji (MIT): https://github.com/microsoft/fluentui-emoji (via search results; licence file not opened)
- Local: portfolio-2026 files cited above; flowser-turborepo `apps/flowser/src/components/ui/interactive-mascot.tsx`.
