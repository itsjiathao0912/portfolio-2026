# Live nav test: itsjiathao.com (Worker version 74e711bb), 2026-10-05

Local load caveat: the Mac ran at load 75-130 during passes 1 and 2 (the coordinator said run anyway). Load was ~9-35 by the end. Client timings may be inflated. Tail/Worker numbers are not affected.
Scope reduced per coordinator: 20 navigations per pass (not 40), one headless Chromium at a time, cache disabled, 1.5-3s gaps. Passes: desktop 1440 cold (p1), desktop 1440 fresh context (p2), mobile 390 (p1). The second mobile pass was skipped (load > 60).

## Results
- Navigations tested: 60 scripted (3 x 20), plus 22 targeted "first click" runs.
- Freezes in the scripted passes: 1 (desktop p1, first click Home -> Work: 20s, never arrived). Two more "freezes" in p1 were script errors (clicked a link that does not exist on /about); ignore them.
- Freezes in the targeted first-click test: 6 of 14 runs froze (3/6, 3/8); 0 of 8 when the click came 3s after load.
- Error 1102 / "Worker exceeded": 0 (page text checked on every nav).
- Slowest successful navigation: 1611 ms (mobile, first click, hard reload). Typical soft nav 70-500 ms; mobile menu path ~750 ms.
- Console errors: 0. Failed requests: one aborted video (`/work/lumicap/landing-scroll.mp4`, ERR_ABORTED, caused by navigating away). No 5xx.
- curl burst: 40 requests (2 rounds x 20, 0.5s apart) plus the 4 API calls each round. All 200. Pages 0.3-2.6s total; RSC/prefetch 0.26-1.2s; /api/stats 0.3-0.4s (second call cf-cache-status HIT); /api/geo, /api/poll, POST /api/visit (probe- ids) 0.3-0.8s. HTML/RSC responses carry no cf-cache-status (served by the Worker).

## The one real defect: first-click freeze
Clicking a nav link within ~1s of DOMContentLoaded (before the app is idle) sometimes does nothing for good: URL stays "/", the `_rsc` fetches for /work all return 200, and no full reload happens, so the 5s nav watchdog did not rescue it (waited 30s: still stuck, only 1 page load). Reproduced at low load (9-35), so it is not local-load noise. The Worker saw and answered those requests with 200 in ~15 ms, so this is client-side (router/hydration race, or the watchdog not armed yet), not a Worker CPU/limit problem. Clicking 3s after load: 8/8 fine. Real users who click fast on arrival could hit it; suggest looking at nav-watchdog arming and Link click before hydration.

## Tail (331 events)
- exceededCpu / error / exception outcomes: 0. Status >= 500: 0. All outcome "ok".
- Most page loads and RSC navigations are cheap (0-1 ms CPU, 7-230 ms wall).
- Max CPU per route (ms): `/work/:slug` 1076, `/` 782, `/work` 708, `/about` 419, `/api/visit` 237, `/api/poll` 186 (GET; POST 12), `/api/stats` 21, `/_next/image` 8, `/api/geo` 1.
- The high ones are all my `?_rsc=x` curl requests with no RSC header, which force a full uncached render (3-7 per route, >50 ms). They are not what a browser sends.

## Can any route hit the 10 ms limit?
Yes, on paper. Many events exceeded 10 ms CPU and still returned outcome "ok" with no exceededCpu, so the 10 ms free-plan cap was not enforced as a kill in this sample (the cap may not apply to this account, or tail cpuTime overstates). Routes above 10 ms: full-render page requests (/, /work, /work/:slug, /about, only on uncached renders), /api/visit (237 and 20 ms), /api/poll (186 and 56 ms GET), /api/stats (21 ms). /api/visit and /api/poll go through the full Next app and both exceeded 10 ms, so they are the likeliest to be killed if the 10 ms cap is truly enforced. Only 2 samples of each, so treat as indicative. /api/geo (1 ms) is safe.
Also note: tail showed other visitors' traffic (guardline, cortex-sentinel, pac, a bot POST to /wp-json/batch/v1), included in the counts.

Raw files (scratchpad): tail.jsonl, burst.tsv, nav-*.json, first*.mjs.
