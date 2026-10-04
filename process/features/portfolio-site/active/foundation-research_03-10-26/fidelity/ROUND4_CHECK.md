---
name: report:fidelity-round4-check
description: "Skeptic-lane round-4 check: gate re-runs, privacy/content audit, real-browser LinkedIn embed check, fidelity re-score vs jonnyczar.com at 1440x900 + 390x844."
date: 03-10-26
metadata: {node_type: memory, type: report, feature: portfolio-site, phase: foundation-research}
---

# Round 4 check (skeptic lane)

**TL;DR:** The design is now about 7.5/10 on desktop and 7/10 on phone, up from 5–6. All five gates pass, apart from one mobile e2e test that times out when the machine is busy. Two privacy rules are broken and must be fixed before anyone sees the site: (1) the home "Off the screen" photo is the BS34 group photo, with about 40 recognisable faces; (2) the Ledgr case study shows a photo of a laptop screen, and the screen is a GitHub repo for a different project (`vibecode-pro-max-kit`), not Ledgr. ReOrc's −40% / +20% / 95% figures have no source line. The LinkedIn embeds do load, but every card opens with LinkedIn's cookie banner and cuts the post off mid-sentence.

- Tested at HEAD `df7b392` against the dev server on :3003 (dev mode; ignore the Next "N" badge). Headed Chromium (Playwright 1.63). The reference site is live https://www.jonnyczar.com/.
- Machine load was noisy because other projects' `next-server` processes and a `bun test` run shared the CPU. The load average was 30 at the start and peaked at 72 during the full e2e run.
- Evidence (gitignored): `research-private/fidelity/round4/`. `cmp-d/` and `cmp-m/` hold side-by-side comparisons, reference on the left. Phone full-page shots were re-taken at DPR 1, because DPR 3 shots over 16k px repeat their top half (a capture limit, not a site bug). `diag/` holds LinkedIn, sticky-step, ReOrc/Zalo metrics and menu shots. The folder also has the e2e and build:cf logs, plus `meta-*.json` with page heights, console errors and sideways overflow.

## 1. Gates (re-run myself, not taken from builders' reports)

| Gate | Result | Evidence | Load (1m) |
|---|---|---|---|
| `pnpm typecheck` (app + tests) | PASS | exit 0, 11.8s | 7.2 |
| `pnpm lint` | PASS | exit 0. Not an empty run: `eslint --format json` linted 144 files with 0 errors and 0 warnings | 7.6 |
| `pnpm test` | PASS | 101 pass / 0 fail, 538 expects, 11 files | 8.5 |
| `pnpm test:e2e:isolated` (full) | **FAIL 57/58** | `mobile.spec.ts:52` "pages fit 390px…" hit its 240s timeout in `scrollThrough` on `/work/cortex-sentinel` | 7.8 → 72.9 |
| same test, re-run alone | PASS | 1 passed in 2.4m | 56 → 14 |
| `pnpm build:cf` | PASS | "Worker saved in .open-next/worker.js", OpenNext build complete. One warning: compatibility_date 2025-04-01 is old | 10.5 |

The e2e failure comes from machine load, not a product bug. But even with the test running alone it used 2.4 of its 4 minutes, so it will keep failing whenever the machine is busy. That is a test-design problem (P1, #G1 below).

**Found while running gates, P1:** `scripts/run-isolated-e2e.mjs` leaves stale entries in `tsconfig.json`. Its restore step only works if `tsconfig.json` was clean when the run started. Once the file holds stale `.next-e2e-*` entries, each run adds 2 more and leaves them (it prints "changed beyond Next's own edits — left as is"). The file had 12 stale entries when I started; my 2 runs took it to 16. I removed only my 4 and left the file exactly as I found it (still dirty with the 12 from earlier runs). Fix: when comparing, filter `.next-e2e-*` entries for directories that no longer exist out of BOTH the before and after versions, and write the filtered result. Then clean the 12 existing entries by hand.

## 2. Privacy / content checks

| Check | Verdict | Detail |
|---|---|---|
| Home "Off the screen" photo, caption "Ledgr demo night · the whole room" | **FAIL (P0)** | File: `public/photos/ledgr-meetup-group.webp` (1600×900), from `content/site.ts:243-250`, added in commit `df7b392`. It is the **BS34** group photo (`research-private/media/ledgr-meetup/bs34/thao_xcle07ech8mr6iy5j6.jpg` or one of its 4 near-identical burst shots, cropped to 16:9). About 40 people, almost every face clear and recognisable, front row in sharp focus. The decision note says to use this only with attendee consent, and only the face-free BS33 shots were approved. The caption is also wrong: at BS34 Thao's post says demo "No". The demo night was BS33. It ships in `.open-next/assets/photos/`. |
| No laptop-screen photos | **FAIL (P0)** | `public/projects/ledgr/meetup/laptop-2.webp` (Ledgr gallery, `content/projects/ledgr.ts:161`, caption "Demo setup") is a hand holding a laptop. The screen shows the **GitHub repo `withkynam/vibecode-pro-max-kit`**, while the alt text says "Ledgr landing page open on a laptop". So it breaks the no-laptop-screens rule, the alt text is wrong, and it shows another person's project. `room.webp` (BS33 wide shot, earlier approved) also has laptop screens in the foreground; they're unreadable, so acceptable, but noted. |
| Confidential client names (Chong Wei, WAPS, Taiwan Steel, ARIZE) | PASS | 0 hits in `src/`, `content/`, `public/`, and in the rendered HTML of all 12 routes (/, /about, /work, 9 case studies, 404). Only hit: the guard test `tests/unit/case-study-round4.test.ts:39`. |
| Phone number anywhere | PASS | No `tel:`, `+84`, or VN mobile patterns in source or rendered text. (`zalo.me/vi/` is just the Zalo logo link.) No GPS metadata on any image in `public/`. |
| Every case-study number has a visible source line | **FAIL** | `metrics.source` is optional in `content/schema.ts`, so nothing forces a source line on a metrics block. 6 metrics blocks render without one (see the table below). The other 25 data blocks on case pages show "Source: …". |

Unsourced `metrics` blocks:

| Page | Numbers | Covered nearby? | P |
|---|---|---|---|
| reorc-data-platform (block 2) | −40% rework, +20% faster delivery, 95% first-pass UAT, plus "40% less rework" in the H1 | **No.** The next item is a heading. Confirmed in a real-browser screenshot (`diag/reorc-metrics.png`) | **P0** |
| zalo-game-center (block 2) | +30%, +15%, +3%, −40% | Yes. The bar chart directly below repeats all four, with a "CV figure" badge and "Source: Thao's CV" | P2 (add the line anyway) |
| ledgr (block 4) | 27 / 6 / 100+ | Partly. The 100+ is labelled as roadmap; the bar chart below cites the repo | P1 |
| lumicap (block 2) | 6 modules | No | P1 |
| cosap (block 2) | 8 modules, 2 markets | No | P1 |
| pac (block 2) | 4 providers | A "Thao's CV" source appears elsewhere on the page, not here | P1 |

Other content notes:
- **P1:** The AABW photo is captioned "track winners on stage" (home) and alt "on stage as track winners" (Cortex). Everywhere else the site says "2nd place", and Thao's own LinkedIn post says "Runner-Up". Readers will take "winners" to mean 1st. Use "Runner-up, GoTyme Financial Services track". The same photo ships twice in different encodes (`photos/aabw-winners-stage.webp`, `work/cortex-sentinel/stage.webp`).
- **P2:** The AABW team photo shows 9 recognisable people (Thao's team and judges). It falls outside the BS34 rule, but should get the same consent check.
- **P2:** The Ledgr hero screenshot shows a marketing claim ("~20 người … 50–150 triệu đồng tiền phạt"). It is product UI, so acceptable, but it is an unsourced number in the frame.
- **P2:** 4 files in `public/` are not referenced anywhere but still ship (`projects/ledgr/pricing-desktop.jpg` and 3 `cortex-sentinel/mockup-*.jpg`). Delete them, or confirm they're cleared.

## 3. LinkedIn embeds (headed Chromium, real scroll)

**They are not blank.** All 3 iframes return 200 and show real post text (1.5–2.1k characters each, 4–7 images), on desktop (cards 400 px wide) and phone (335 px). LinkedIn's CSP has `frame-ancestors *`, so framing is allowed. In one element screenshot, the first desktop card did come out blank white. That was a Playwright paint-timing artifact: with normal wheel scrolling, all three render on both runs (`diag/li-blank-run1.png`).

What a visitor actually sees:

| # | Problem | Why | Fix | P |
|---|---|---|---|---|
| L1 | Every card opens with LinkedIn's grey **"LinkedIn respects your privacy … Accept / Reject"** banner. It takes 250 px on desktop and about 370 px (40% of the card) on phone | The iframe is cross-origin. A visitor with no LinkedIn consent cookie in that context (most visitors; anyone with third-party cookies blocked: Safari, Firefox, Chrome incognito) gets the banner. We can't hide it from our side | Swap the live embeds for **static preview cards**: title, first 2–3 lines, first image, date, "Read on LinkedIn ↗". Optionally load the real embed only after a "Show post" tap. That is also better for privacy, since there's no LinkedIn request until the user acts | P1 |
| L2 | The post text is cut off mid-sentence and each card has its own inner scrollbar | The fixed `height` from LinkedIn's snippet (668 / 1007 / 760) assumes a 504 px frame. At 400 px or 335 px wide the content is 1,265–1,864 px tall | Covered by L1. If embeds stay, make all cards the same height and accept the inner scroll, or render at 504 px and scale the frame down | P1 |
| L3 | Uneven row on desktop: card heights 668 / 1007 / 760 | The per-post `height` | Covered by L1 | P2 |
| L4 | Console noise: `getInstalledRelatedApps … only supported in top-level` and 401s | Errors from inside LinkedIn's frame; the e2e filter already ignores them | None | — |
| L5 | `onLoad` sets `data-loaded=true` for whatever page LinkedIn returns, including an error page | Load event only | Covered by L1 | P2 |

Safari (WebKit) is **untested**. Playwright 1.63 needs `webkit-2359` and only older builds are installed, and installing browsers was out of scope. Safari blocks third-party cookies by default, so expect L1 on every iPhone.

## 4. Fidelity re-score vs jonnyczar.com (1440×900 desktop, 390×844 phone)

Case pairs: caseA = `/work/ledgr` vs `/project/n26`; caseB = `/work/cortex-sentinel` vs `/project/pepper`. Also checked: `/work/gocrypto`, `/about`.

| Section | Desktop | Phone | Round 2 (D/P) | Main reason |
|---|---|---|---|---|
| Nav (static + scroll) | 8 | 8 | 8 / 7 | Matches. Stays visible while scrolling (round-2 #6 fixed). Phone menu is now big centred items like the reference (#16 fixed) |
| Hero | 9 | 8 | 8 / 8 | Sharp at 300ms (#7 fixed). A "PSST — THE CASUAL VERSION" label shows at load and then hides, moving the subtitle up about 27 px. On phone the mascot sticker sits half off the right edge |
| Logo band | 7 | 7 | 8 / 5 | Phone is now a single-row marquee (#15 fixed). Desktop is a light band instead of the reference's black band, and a logo sits cut off at the left edge |
| Highlights | 8 | 8 | 7 / 6 | Black "2nd place" tile, tinted issuer icons, 2-column grid on phone (#13 fixed) |
| Off the screen (photos) | — | — | new | Layout is fine. **Content is blocked** (BS34 photo, P0) |
| Project stack + TOC | 8 | 7 | 7 / 3 | 7 of 9 cards show real screens or their own illustration (#1 mostly fixed). **ReOrc and Guardline still share the same 3-node diagram.** Phone proof bars are clean |
| LinkedIn | 5 | 4 | new | Cookie banners, cut-off text, uneven heights (§3) |
| Footer / contact | 7 | 7 | 5 / 5 | One contact block (#8 fixed). Email pill plus a doodle pad instead of a form, which was a deliberate change |
| /work index | 7 | 5 | 6 / 4 | Tints and real covers are good. **Phone filter chips are still cut off ("Growth &") with no fade (#11).** Phone cards have about 200 px of empty tint between the text and the cover |
| Case-study hero | 8 | 8 | 3 / 3 | Short H1 of 7–9 words (#2 fixed), subtitle different from the H1 (#3 fixed), real product screen in a device frame (#4 fixed) |
| Case-study body + TOC | 7 | 7 | 6 / 6 | TOC shows from the start of the body (#12 fixed). Sticky steps with a swapping device image work. Interactive charts all cite sources. **But desktop scrolls sideways by 7 px** (below) and ReOrc has no source line |
| /about | 7 | 6 | 6 / 6 | A real lede plus portrait and "peel me" sticker. Experience still reads like a CV; phone scroll is long |
| Motion (load, scroll, hover) | 7 | 7 | 5 / 5 | Crisp load, word-by-word scroll reveal, sticky steps. Card hover not re-checked |
| **Overall** | **~7.5** | **~7** | ~6 / ~5 | |

## Gaps (exact fixes)

| # | Element | Now | Exact fix | P |
|---|---|---|---|---|
| 1 | Home "Off the screen" photo | BS34 group photo, about 40 recognisable faces, wrong caption | Remove the `ledgr-meetup` entry from `content/site.ts` and delete `public/photos/ledgr-meetup-group.webp`. If a third tile is wanted, use the BS33 wide shot (`projects/ledgr/meetup/room.webp`, approved) captioned "Build Stuffs #33 · Ledgr demo". Add a unit test that fails if any `photos[].src` hashes to a known BS34 file | **P0** |
| 2 | Ledgr gallery "Demo setup" | Photo of a laptop screen showing another project's GitHub repo | Remove line `content/projects/ledgr.ts:161` and delete `public/projects/ledgr/meetup/laptop-2.webp`. If two images are needed, use a face-free BS33 shot of the **Ledgr landing page** that isn't a screen photo; otherwise use a single `image` block | **P0** |
| 3 | ReOrc numbers | −40% / +20% / 95% with no source line, and the H1 claims 40% | Add `source: "Thao's CV (ReOrc AI, Apr 2024 – Mar 2025)"` to the metrics block. Then make `metrics.source` **required** in `content/schema.ts`, or add a unit test that every case-study `metrics` block has a non-empty source. That forces the Lumicap/COSAP/PAC/Ledgr/Zalo blocks to get one too | **P0** (ReOrc) / P1 (rest) |
| 4 | Desktop sideways scroll | `/work/ledgr` and `/work/cortex-sentinel` scroll 7 px sideways wherever scrollbars are always visible (Windows, Linux, macOS "always show scrollbars"). A real horizontal scrollbar appears (`diag/cortex-step02.png`) | `data-testid="image-row"`'s `figure` uses `w-screen left-1/2 -translate-x-1/2` and is 1440 px inside a 1425 px page. Add `overflow-x: clip` to `<body>` or `<main>` (`clip`, not `hidden`, so sticky TOC and steps keep working), or size the row with `w-[calc(100vw-var(--sbw))]` | P1 |
| 5 | LinkedIn section | Cookie banner on every card, cut-off text | Static preview cards (§3, L1) | P1 |
| 6 | AABW caption and alt | "track winners" | "Runner-up · GoTyme Financial Services track, Agentic AI Build Week 2026" on home and Cortex | P1 |
| 7 | ReOrc and Guardline covers | Same 3-node placeholder diagram on home and /work | A real screen (Recurve docs screenshot, Guardline proposal page) or their own illustrations, like PAC (invoice) and Zalo (play grid) | P1 |
| 8 | /work chips (phone) | Last chip cut off, no hint | `overflow-x-auto` is already there; add a right-edge fade mask (`[mask-image:linear-gradient(to_right,black_85%,transparent)]`), or let the chips wrap | P1 |
| G1 | e2e `pages fit 390px` | One test walks 13 long pages; uses 2.4 of 4 minutes even alone; fails under load | Split into one test per path with `for (const path of …) test(…)`, so each gets its own budget and they run in parallel | P1 |
| G2 | `run-isolated-e2e.mjs` tsconfig restore | Leaves 2 stale entries per run once the file is dirty | See §1 | P1 |
| 9 | Hero load shift | "PSST" label shows, then hides, and the subtitle jumps up about 27 px | Reserve its space (`visibility:hidden` rather than unmounting), or render it only after hydration in a reserved slot | P2 |
| 10 | Phone hero mascot | Yellow sticker half off the right edge, next to the "I build" line | Pin it inside the content width (`right-4`), or start it below the portrait | P2 |
| 11 | /work phone cards | About 200 px of empty tint between the title and the cover | Cut the card's min height on phone, or pull the cover up with `mt-auto` removed | P2 |
| 12 | Zalo metrics row | "−40%" sits about 6 px past the right edge of the column at 1440 | Allow 2×2 below `xl`, or `text-[clamp(...)]` on the figure | P2 |
| 13 | Unused shipped assets | 4 unreferenced images in `public/` | Delete them | P2 |
| 14 | Logo band (desktop) | Light band; reference is black | Optional: black band with white marks to match, or keep as a deliberate change | P2 |
| 15 | Safari | Untested | `pnpm test:e2e:install` with webkit, then one pass on /, /work/ledgr and LinkedIn | P2 |

## What breaks in the first 5 minutes

**Desktop (Chrome, scrollbars visible):** The hero, highlights and project stack feel polished. The first odd moment is "Off the screen": a crowd photo of about 40 strangers captioned as Thao's demo night, which a careful reader will notice was not her demo. Two project cards in a row (ReOrc, then Guardline after Cortex) show the same diagram. "Notes on LinkedIn" looks broken: three grey "LinkedIn respects your privacy / Accept / Reject" boxes, uneven card heights, posts cut off with inner scrollbars. On any case study with a full-width image row, a horizontal scrollbar appears and a trackpad swipe nudges the page sideways. In Ledgr's gallery, "Demo setup" is a photo of someone else's GitHub repo. ReOrc's case page opens on "40% less rework" and three big percentages, with no source anywhere near them, unlike every other page.

**Phone (390):** The hero is good, but the mascot sticker hangs off the right edge. The photo scroller starts with the AABW stage photo; the BS34 crowd is two swipes in. The cards look good with real screens, until ReOrc and Guardline (diagram again). On LinkedIn, the top 40% of each card is the cookie banner and the post is cut off after a few lines. On /work, the filter chips run off the screen with no hint that they scroll. Case pages are clean, apart from ReOrc's unsourced numbers.

**Status:** DONE_WITH_CONCERNS
**Summary:** Typecheck, lint, unit tests and build:cf pass. The full e2e run was 57/58; the one failure is a test that times out under machine load and passes when run alone. Fidelity is about 7.5 desktop / 7 phone, and most round-2 P0s are fixed. Three must-fixes remain: the BS34 group photo on home, the laptop-screen GitHub photo in the Ledgr gallery, and ReOrc's unsourced figures.
**Concerns:** P0 privacy and content issues above; LinkedIn embeds load but look broken (cookie banners); 7 px sideways scroll on desktop case pages; the e2e lane leaves stale `tsconfig.json` entries; Safari untested.

## Unresolved questions
- Has anyone in the AABW team photo been asked for consent, or is "team and judges on stage" treated as public?
- Should "Notes on LinkedIn" stay as live embeds at all? A live embed can't hide the cookie banner, so the fix is a product decision: static cards, or embeds behind a tap.
