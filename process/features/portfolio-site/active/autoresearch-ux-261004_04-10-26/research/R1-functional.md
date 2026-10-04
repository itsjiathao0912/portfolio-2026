---
name: report:r1-functional
description: "Iteration 1, lane B (functional QA) of the ux autoresearch loop: repo gate results plus real-user QA gap list for home, /about, /work and all 9 case studies at 1440 and 390."
date: 04-10-26
metadata:
  node_type: memory
  type: report
  feature: portfolio-site
  phase: autoresearch-ux-iteration-1
---

# R1 functional QA (iteration 1, lane B)

**TL;DR:** Every repo gate is green (typecheck, lint, 200 unit, 126 E2E). Real-user QA found **3 FAIL, 4 CONCERN, 9 OBSERVATION**. The three FAILs: a stat row where two numbers print on top of each other (Guardline, 1440), pinned chapter headings that slide under the fixed nav (home, 1440), and the "It's HH:MM in Saigon" clock label overprinting page text on every page (worst on `/about` at 390). No horizontal scroll, no broken images, no HTTP errors, no console errors of ours anywhere.

**Tree tested:** the uncommitted working tree as-is (36 modified files from the stopped signature integrator). Isolated production build, private seeded DB.

## Totals

| Severity | Count |
|---|---|
| FAIL | 3 (F1 to F3) |
| CONCERN | 4 (F4 to F7) |
| OBSERVATION | 9 (F8 to F16) |

## Repo gate results

| Gate | Result | Load 1 / 5 / 15 min at start |
|---|---|---|
| `pnpm typecheck` (app + tests) | PASS, 0 errors | 12.7 / 27.8 / 29.6 |
| `pnpm lint` | PASS, 0 problems | 11.7 / 26.3 / 29.0 |
| `pnpm test` (bun unit) | PASS, 200 pass / 0 fail, 28 files | 10.9 / 25.4 / 28.7 |
| `pnpm test:e2e:isolated` | PASS, 126 passed / 0 failed, 8.2 min | 79.6 / 44.6 / 35.6 |

- The E2E ran while other lanes drove load to 79 to 103 (a `duma-worktrees/push-check` run, plus two long-lived `next-server` dev processes at about 117% CPU each; I did not touch them). All 126 passed anyway.
- My first E2E attempt was stopped by me: Playwright wipes `test-results/` on start and deleted my log directory. I stopped it with SIGTERM (the runner's cleanup restored `tsconfig.json`) and reran with logs outside `test-results/`. Raw log: `test-results/r1/repo-e2e.log`.
- The existing specs pass against the current tree, including `story.spec.ts` "persona picker reorders the chapters". The gaps below are things those specs do not assert.

## Method

- **Server:** `test-results/r1/serve.mjs`, the same recipe as `scripts/run-isolated-e2e.mjs` (private build dir, private seeded DB, free port) but kept alive for several waves. Stopped at the end; build dir and DB removed; `git status tsconfig.json` clean.
- **Spec files:** `qa.spec.ts` (scroll, interact, keys, reduced), `qa-scen.spec.ts` (home scenarios), `qa-fix.spec.ts` (targeted re-checks), helpers `lib.ts`, `summarize.mjs`. Raw data in `test-results/r1/findings/`, screenshots in `test-results/r1/shots/` (`*-sNN.jpg` per scroll step, `*-sheetN.jpg` contact sheets).
- **Viewports:** 1440x900 desktop; 390x844 phone (Pixel 7 UA, touch, DPR 2).
- **Waves and what each covered:**

| Wave | What | Pages | Result |
|---|---|---|---|
| A scroll | real wheel scroll; per step: text overlap, text occlusion, clipped and off-screen text, invisible text, broken images, horizontal overflow, tap-target size, pixel emptiness, console and network | 12 pages x 2 viewports | 24/24 ran |
| B keyboard | Tab through whole page; focus ring, visibility, covered, trap, Enter on buttons | 12 x 2 | 24 + 6 reruns |
| C/D interact | scroll into view, obscured check, hover feedback, click or tap, DOM/pixel/aria/URL change, typing into inputs, link status | 12 x 2 (first 60 to 110 controls per page) | 24/24 ran |
| E scenarios | load timeline, wheel over canvases, persona picker, poll, build-a-product, passport, nav anchors, card click timing | home | 2/2 ran |
| F reduced motion | scroll with `prefers-reduced-motion` | home, /about, /work, lumicap, ledgr, gocrypto x 2 | 12/12 ran |

- Load during waves: 5 to 45, mostly 8 to 15 (values logged next to each wave in the scratchpad; run commands in this report).
- Harness corrections I made along the way, so you can trust the rest: a first interaction run was contaminated (a nav click soft-navigated and later clicks ran on the wrong page) and a second hung on a vanished element; both fixed and rerun. A first keyboard run read focus positions mid smooth-scroll and produced false "invisible/covered" results; rerun with a 650 ms settle. Detector items I checked at pixel level and dropped are listed under Retracted.

## Gap list

Format: GAP-I1-F{n} | SEVERITY | page/element | evidence | suspected file | suggested fix

### FAIL

**GAP-I1-F1 | FAIL | /work/guardline at 1440 | "Public figure" stat row**
- Evidence: `test-results/r1/shots/work_guardline-d1440-s02.jpg`. "US$11.1B" and "5.3M" print on top of each other and read "US$115.3BM". Detector: `overlaps "US$11.1B" <> "5.3M"` on `dd.font-display.text-[2.5rem]`. Not seen at 390.
- Suspected file: `src/components/site/case-study/blocks.tsx:115` (`font-display text-[2.5rem] leading-none md:text-[3rem]` in a 4-column grid). A second copy of the same markup is at `src/components/site/case-study-blocks.tsx:98`.
- Suggested fix: a long value at 3rem outgrows its column. Use `clamp()` sizing or `break-words` plus fewer columns until the longest value fits (container query on the figure block). Check which of the two files is live and delete the dead one.

**GAP-I1-F2 | FAIL | home at 1440, pinned chapters | chapter heading slides under the fixed glass nav**
- Evidence: `shots/home-d1440-s09.jpg`: "Rules that hold up" sits half under the nav pill, which veils the middle of the headline. Same pattern at s05 and s33.
- Suspected file: `src/components/signature/glass/story-chapter.tsx:81` (pinned stage `sticky top-0 h-svh ... py-16`, so the heading lands inside the nav's 88px band).
- Suggested fix: pin below the nav (`top` = nav top + height) or add the nav height to the stage's top padding.

**GAP-I1-F3 | FAIL | every page, both viewports | "It's HH:MM in Saigon" clock label overprints page text**
- Evidence: 1440: `shots/home-d1440-s09.jpg` (label over "Rules th..."). 390: `shots/home-m390-s33.jpg` (garbles "CAREER RAIL"), `shots/home-m390-s39.jpg` (over "Notes on LinkedIn"), and `shots/about-m390-rm-s12.jpg` (over "Certifications"). On `/about` at 390 the detector reports an overlap with body text at almost every scroll step (`findings/reduced-about-m390-rm.json`): the label is a fixed top-left element with no background, so it prints over whatever scrolls under it.
- Suspected file: `src/components/gems/local-time.tsx` (`LocalTime`, `data-testid="local-time"`). Where it is mounted into its fixed position was not found by grep in `layout.tsx` or `page.tsx`.
- Suggested fix: give it a reserved slot (inside the nav row or footer), or a solid pill background plus a z-index above content, or hide it while content is under it.

### CONCERN

**GAP-I1-F4 | CONCERN | home chapters at 1440 (and 390) | near-empty viewport-height areas**
- Evidence: `shots/home-d1440-s33.jpg` (pixel activity 0.05: flat navy with one small sprout); `shots/home-d1440-s39.jpg` and `s40.jpg` (People stage: five tiny characters on a flat field, roughly half the viewport blank); `shots/home-d1440-s02..s06` ("Inside the apps": phone plus caption list fill about 40% of each 900px screen). At 390: `findings/scroll-home-m390.json` s32 sparse 0.058. Detector `sparse` (activity under 0.08): d1440 s05, s09, s11, s32, s33; the LinkedIn section also scores low but only because I stubbed the embeds.
- Suspected file: `src/app/page.tsx` slot `stage` JSX (Journey and People) with `src/components/story/persona-chapters.tsx`; `src/components/signature/objects3d/scroll-phone.tsx`.
- Suggested fix: shorten pinned `length` for those chapters, or move real content into the stage.

**GAP-I1-F5 | CONCERN | touch targets under 32 px**
- Evidence: Wave A `smallTargets`. Footer "Work" 35x20, "About" 39x20, "Thao Dao" 64x20 (all pages); home: "Credential" 229x25, "Follow on LinkedIn" 153x26, "View on LinkedIn" 133x25, "Hide friends" 95x31, "psst - the casual version" 216x21 (390); case studies: GoCrypto stacked-bar segment buttons 4 to 27 px wide x 56 px (390), Guardline `button.block.size-4` 16x16, Ledgr table rows 310x20.
- Suspected files: `src/components/site/site-footer.tsx`, `src/components/site/linkedin-posts.tsx`, `src/components/site/case-study/*` (bar segments).
- Suggested fix: 44x44 hit areas by padding or an extended pseudo-element.

**GAP-I1-F6 | CONCERN | keyboard, all pages | extra tab stops: every nav link and "Case study" CTA is focused twice**
- Evidence: `findings/keys-*.json`. The focus lands first on a `span.inline-flex` wrapper, then on the inner `a` with the same name and rectangle (nav: Thao Dao, Highlights, Work, About, LinkedIn, Get in touch; home: all 9 "Case study : X" CTAs). Counted as span-then-anchor pairs per page: 6 on `/about`, 7 on `/work` and each case study, 16 on home at 1440 (10 at 390). No keyboard trap anywhere; Enter and every real stop has a visible focus indicator (only the third-party LinkedIn iframes have none).
- Suspected file: `src/components/motion/magnetic.tsx` (a `motion.span` wrapper). Likely cause, inferred from the library's behaviour and not verified: motion's press gesture adds `tabindex=0` to non-focusable elements. `liquid-link.tsx` has no `tabIndex`.
- Suggested fix: pass `tabIndex={-1}` to the wrapper (or drop `whileTap` on wrappers that contain a link). Verify with a Tab count: 6 stops for the nav, not 12.

**GAP-I1-F7 | CONCERN (provisional) | reduced motion, home | infinite animations keep running**
- Evidence: `findings/reduced-home-d1440-rm.json` and `reduced-home-m390-rm.json`: 9 running infinite animations at every scroll step, on `div.h-3.w-11/12`, `div.h-3.w-4/5`, `div.mt-4.aspect-[4/3]` (placeholder skeleton pulses). Every other tested page has 0. Provisional because my LinkedIn stub stops those placeholders from ever being replaced, so I cannot say how long a real visitor sees them.
- Suspected file: `src/components/site/linkedin-posts.tsx` (skeleton `animate-pulse`).
- Suggested fix: `motion-reduce:animate-none` on the skeletons.

### OBSERVATION

- **GAP-I1-F8 | OBSERVATION | home console**: WebGL warning "GPU stall due to ReadPixels" (desktop) and "THREE.Clock: deprecated, use THREE.Timer". Some code path calls `readPixels` per frame. Candidates: `src/components/signature/globe/*`, `objects3d/*`. Evidence: `findings/scroll-home-d1440.json`.
- **GAP-I1-F9 | OBSERVATION | home ledger strip**: "pending..." and "settled" labels share one grid cell and each reads 42% visible mid crossfade (`shots/home-d1440-s07.jpg`). `src/components/signature/ledger/transaction-stream.tsx`.
- **GAP-I1-F10 | OBSERVATION | home People stage at 1440**: the "Mentee" cursor label drifts over the nav pill (`shots/home-d1440-s40.jpg`). `src/components/signature/characters/community-cursors.tsx`.
- **GAP-I1-F11 | OBSERVATION | nav "Work" link**: it goes to `/#work` (the home Products chapter), not the `/work` index, yet the item is highlighted as active on `/work` and every case study (`src/components/site/site-nav.tsx:16,28`). Clicking it from `/work` leaves the page. Product decision, flagging only.
- **GAP-I1-F12 | OBSERVATION | 390 hero**: tapping "psst - the casual version" works (hero text swaps, pixel diff 32%), but the button then disappears, so there is no way back to the formal text without reloading (`findings/fix-m390.json`).
- **GAP-I1-F13 | OBSERVATION | persona picker**: after choosing a persona, no card carries `aria-pressed` or a selected state in the DOM (probe: 0 pressed buttons for all four). The choice does persist across reload and works by keyboard (Enter). `src/components/signature/participate/visitor-picker.tsx`.
- **GAP-I1-F14 | OBSERVATION | case-study range sliders and "Annual leave" input**: number inputs accept "e", so typing "QA hello 123" into COSAP "Annual leave (days)" left "8e123" (also Ledgr "Monthly wage", lumicap code field accept odd text). `src/components/case/cosap/leave-guard.tsx`. Low impact; check what the result line shows.
- **GAP-I1-F15 | OBSERVATION | Guardline diagram nodes**: 9 SVG `g[role=button]` nodes ("Signals", "Detection", ...) give no hover feedback (`findings/interact-work_guardline-d1440.json`). Clicks do respond.
- **GAP-I1-F16 | OBSERVATION | View Transition abort (unconfirmed, possible fragility)**: during the interaction run every home "Case study" click logged an uncaught page error "Transition was aborted because of timeout in DOM update". In the clean scenario run the same clicks logged no error and reached the case-study hero in 52 to 220 ms at 1440 (424 to 478 ms at 390 from home). I believe my screenshot taken during the transition caused it, since `waitForRoute` in `src/components/motion/transition-link.tsx` waits using `requestAnimationFrame`, which stalls if rendering is paused. Worth a `setTimeout` fallback, not a confirmed user-facing bug.

## What passed (no gap)

- No horizontal scroll on any of the 12 pages at either width (max overflow 0).
- No broken images, no HTTP 4xx/5xx, no uncaught page errors in clean runs; only external host contacted is `www.linkedin.com` (stubbed). `net::ERR_ABORTED ...?_rsc=` entries are cancelled Next prefetches.
- One `h1`, one `main`, `lang=en`, title and meta description, no `img` without `alt` on all 12 pages.
- No blank first paint: at 250 ms the first screen already has content on `/`, `/about`, `/work`, `/work/lumicap` (pixel activity 0.09 to 0.30, 1,100 to 9,500 text characters).
- Wheel over canvases scrolls the page (globe, shield stage, first canvas): moved 480 of 480 px at both widths. Globe drag rotates it (pixel diff 0.9% desktop, 2.2% phone). Corridor button works.
- Persona picker: all four personas set `data-persona`, persist across reload, work by keyboard Enter; greeting updates.
- Poll: vote, switch vote, persists after reload. Build-a-product: Launch disabled until 2+ blocks, then works. Passport counter shows "2 / 6 stamps" after the above.
- Nav anchors "Highlights" and "Work" land the target 96 to 101 px below the top, clear of the 88 px nav. Mobile menu opens and Escape closes it (dialogs 1 then 0). About peel sticker peels by tap on touch.
- Hide friends toggle works on desktop. Card click timing is fine (see F16).
- Reduced motion: no empty screens, 0 infinite animations on /about, /work and all three case studies tested (only home, F7).
- Interactions on all 9 case studies at both widths: no obscured controls, no dead buttons (only already-selected radio chips), no console or HTTP errors, links return 200. Inputs and sliders are labelled (my probe wrongly flagged some; checked in source).

## Retracted (found by my tooling, disproved)

- "Focus lands on invisible or covered elements" (keyboard): read mid smooth scroll. With a 650 ms settle, home, /about and /work are clean.
- "Inputs and range sliders have no accessible name": they are inside `<label>` or carry `aria-label` (checked `leave-guard.tsx`, `compare-slider.tsx`, `price-books.tsx`, `contract-check.tsx`). `scrub-timeline.tsx` sets `aria-valuetext`.
- Nav "Highlights" and "Work" targets: both ids exist (`highlights-grid.tsx:61`, `project-stack.tsx:69`).
- Overlap between "Start with Cortex Sentinel" and the peel sticker, and hero casual line under the h1: by design (gems revealed by peel and by cursor).
- Blank LinkedIn cards and the empty home step s30: my stub of the embeds.
- Mobile "psst" button reported obscured: a transient overlay at that scroll position; a real tap works.
- Case-study mobile section pill hiding last lines: detector only, not confirmed by pixels.

## Limits

- LinkedIn embeds are stubbed (as in the repo's own specs), so nothing in that section is judged.
- The interaction pass covers the first 60 controls per page (110 on home desktop; 60 of 141 on home at 390), so later controls on home mobile are not exercised.
- Keyboard on case studies and mobile was read with a 70 ms settle; focus-ring and tab-count facts are reliable, position facts are not.
- The persona picker's selected card is not inspected visually (only the DOM).
- WebKit and Firefox not tested (Chromium only, like the repo).

## Unresolved questions

- Where is `LocalTime` mounted, and should it overlay content or live in a reserved slot?
- Is `src/components/site/case-study-blocks.tsx` still imported, or is `case-study/blocks.tsx` the only live copy?
- Should the nav "Work" item go to `/work` (and `/#work` become "Highlights"-style anchor only)?

**Status:** DONE_WITH_CONCERNS
**Summary:** All repo gates pass (typecheck, lint, 200 unit, 126 E2E). Real-user QA of 12 pages at 1440 and 390 found 3 FAIL, 4 CONCERN and 9 OBSERVATION; the fixes are mostly layout (stat row, pinned heading, clock label) plus one double-tab-stop bug.
**Concerns/Blockers:** None blocking. F7 and F16 are provisional (stubbed LinkedIn; harness-provoked transition error). Machine load was shared with other lanes (peak 103 during the repo E2E).
