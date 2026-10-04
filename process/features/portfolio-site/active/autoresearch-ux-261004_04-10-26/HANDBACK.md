
## API (FX-1)
`import { LiftCard } from "@/components/ui/lift-card"` — the one card hover (M3).
- Props: `variant?: "card" | "row"` (card: lift 12px, scale 1.025; row: 2px, no scale), `radius?: string` (Tailwind radius class applied to card AND sheen, default `rounded-lg`), `sheen?: boolean` (default true), plus any div props (`className`, `data-testid`, ...).
- Put the shadow/background/border on the LiftCard via `className` (e.g. `bg-bg shadow-1 border border-hairline`); put the `<a>`/`<Link>` INSIDE as the child. The card is not itself interactive. Do not add your own hover transform/shadow on the same element.
- Do NOT wrap a LiftCard in anything with `overflow-hidden` that would clip the 12px rise/shadow.
- Pure poses/constants: `@/components/motion/lift` (`liftTarget`, `LIFT_SHADOW`). Springs: `SPRING.lift | stamp | glide`, `DURATION`, `REVEAL` in `@/components/motion/springs`.
- Tokens (globals.css): radius `--r-sm/md/lg/xl/full` (utilities rounded-sm..2xl; xl and 2xl are both 24px), shadows `shadow-1/2/3` (+ `shadow-card`=1, `shadow-card-hover`=3), durations `--d-micro/short/med/reveal`.
- Verified: hover lift 13.6px measured (12px + scale growth), scale 1.025, press 0.985, touch tap leaves no stuck lift.
- Request for other lanes: `src/components/site/linkedin-posts.tsx` skeletons can drop their own animate-pulse handling (global reduced-motion rule now stops `.animate-pulse`); footer SketchHint now wrapped for 44px height.

## FX-2 (home) requests
- Footer (site-footer.tsx, not FX-2's): its "Leave a mark" doodle pad is the only other `<canvas>` on home and sits directly under Say hello; SPEC cuts it (canvas count must be <=1). Also remove the Mascot if still mounted from layout.
- LinkedIn embeds kept as-is per instruction: they still log 3 `requestStorageAccess` errors (SPEC 5.9 wants static cards).

## API: SSR-safe reduced motion (FX-1, iteration 2, committed)
`import { useReducedMotion } from "@/lib/use-reduced-motion";` (the single hook; no second copy in motion/).
Returns `false` on the server AND the first client render, then the real preference after mount (useSyncExternalStore). Use it instead of `useReducedMotion` from "motion/react" anywhere markup/props branch on it. Migrated so far: components/motion/*, LiftCard, Magnetic, site-nav, gems (mascot, cursor-reveal). Not yet migrated (other lanes' files): site/case-study-hero.tsx, case-study-media.tsx, case-study-toc.tsx, case-study/{tilt,case-hero,story-scroller,toc}.tsx, dataviz/*, signature/**.
Note: lost-note-game, secret-word, peel-sticker, scroll-words, doodle-pad in the working tree carry uncommitted emitStamp edits (participate/stamps lane); their hook swap is entangled, FX-1 left them alone.

## FX-1 iteration 3 handback (shell + repo hygiene)
- Footer (`site-footer.tsx`) is the single contact block (socials + big email CTA). The duplicate is the home "Say hello" module (`src/components/site/home/say-hello.tsx`) -> FX-2: fold it away or drop its mailto/heading. Also its dotted track overruns the card (R3 F6).
- Uncommitted hook-migration files outside FX-1 allow-list (still on `motion/react` hook at HEAD): `signature/characters/{character,community-cursors,women-in-tech-wall}.tsx`, `signature/glass/story-chapter.tsx`, `signature/ledger/{approved-stamp,career-receipt,transaction-stream}.tsx`. Commit with their owner. `site/case-study-media.tsx` still uses the raw hook (R3 F15).
- Dead, untracked `src/components/story/*` (persona-chapters, home-lazy): delete (not FX-1 files).
- Remaining radius leaks (20/18/6px) in other lanes: `site/photo-moments.tsx:39`, `site/linkedin-posts.tsx:59`, `site/case-study-media.tsx:61`, `app/about/page.tsx:58,156,171,189`, `site/device-mockup.tsx`.
- `.glass[data-tint=light]` fill is now 0.85 plus a 2px dark inner hairline (shared by nav pill, mobile menu button, glass-button).
- `SPRING.lift` is now 150/13; `lift-card.test.ts` updated.

## FX-3 iteration 4 handback
- FX-4: place the walkthrough in `content/projects/gocrypto.ts` Product section as `{ type: "custom", component: "gocrypto/PhoneWalkthrough", source: \`${DECK}, concept screens\` }` (component is registered and committed; it renders its own captions and the 5 screens). The e2e test for it skips until placed.
- `TransitionLink` now also forwards data-slug/category/tone; `WorkCard` (so /work and the case Next card) morph via `[data-morph-target]`.

## FX-A to visitor lane (iteration 5)
- The visitor store should dispatch `window.dispatchEvent(new CustomEvent("thao:visitor-change"))` after every role change (setRole, hydrate, reset). Constant: `VISITOR_CHANGE_EVENT` in `src/lib/visitor-role-adapter.ts`. Ask-me chips already listen (plus focus, visibility and an in-view re-read as fallback), so until the store dispatches they update the next time the footer scrolls into view.
- E2E now writes to `test-results/run-<id>` per run (set by `scripts/run-isolated-e2e.mjs`); nothing wipes the shared `test-results/` any more.
