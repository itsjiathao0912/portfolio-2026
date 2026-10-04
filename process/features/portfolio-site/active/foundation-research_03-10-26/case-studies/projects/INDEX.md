---
name: case-study:projects-index
date: 03-10-26
status: DONE_WITH_CONCERNS
---
# Project case-study index (ranked by evidence + visuals)

Rule applied: no invented numbers. Company-published marketing stats are labelled as company claims, never as her outcomes. Media is local-only in `research-private/media/projects/`.

| Rank | Project | Evidence | Visuals | Verdict |
|---|---|---|---|---|
| 1 | [Cortex Sentinel](cortex-sentinel.md) | Public team repo, 35 attributable commits, 14 user-story files, 7 PRD mockups, decks, labelled backtest numbers | 6 own mockups, 4 UI shots, 2 decks, 2 videos | Lead case study. Needs: AABW result, exact role |
| 2 | [Ledgr](ledgr.md) | 80 commits, live app, discovery plan, positioning spec, architecture doc, tests | Full public-site shots (desktop+mobile), modal, 1 video; app interior login-gated | Best end-to-end "product thinking + build" story. Needs: users/interviews, app-interior screens |
| 3 | [GoTyme research](gotymex-research.md) | Live page, sourced vs inferred method | Desktop+mobile shots | Small but sharp proof of method; pair with Sentinel |
| 4 | [COSAP](cosap.md) | CV only plus public site and one internal-looking compliance doc | Landing shots + video (marketing only) | Strong story seed (translation flow), no outcomes of hers |
| 5 | [Lumicap](lumicap.md) | CV only plus public site | Landing shots + video (marketing only) | Credible domain; needs sanitized UI + her metrics |
| 6 | [PAC](pac.md) | CV only | None | Stub; needs her input to be usable |

## Other repos under itsjiathao0912 (not case studies)
- `portfolio` (old site, live https://portfolio-wine-eight-54.vercel.app, 10 commits Jul 2026; screenshots in `portfolio-old/`) and `portfolio-2026` (this project): meta, not showcased.
- `s3practice`: one-commit static HTML S3 hosting exercise (2025-04-01). Skip.
- `cortex-sentinel-az/setinel` is a separate org repo (pinned on her profile), covered above.

## Cross-cutting findings
1. Her real differentiator is the **PM-artifact-to-shipped-UI chain** (research, user stories, workflow mockups, mockup-parity specs, build) and **honesty discipline** (LIVE/PROTOTYPED/BACKTEST labels, sourced/inferred chips, tested-and-dropped hypothesis in Ledgr). Build the portfolio narrative on that.
2. Common thread: **compliance as architecture** (deterministic rule decides, LLM explains) appears in Sentinel, Ledgr and COSAP. Possible Ledgr/COSAP lineage needs confirming (IP/disclosure).
3. Risks: company marketing numbers (Lumicap $635M AUM vs 17 investors; COSAP 60%/40%) must not be presented as hers; Ledgr "100+ rules" unverified; module count mismatch (8 vs 6/18).
4. Employer-confidentiality: Lumicap/COSAP/PAC need her go-ahead per project.

## Media inventory (local only)
- `ledgr/` 12 files incl. webm; `cortex-sentinel/` 20 files (png + 2 webm); `lumicap/`, `cosap/` landing desktop/mobile + scroll webm + page text; `gotymex-research/`; `portfolio-old/`; `_repos/` clones (setinel is ~3.5k files; do not commit); `shots-scripts/` Playwright helpers.
- Playwright limits: public screens only; no login attempted; no LLM calls triggered.

**Status:** DONE_WITH_CONCERNS. Concerns: PAC/Lumicap/COSAP lack outcomes and internal UI; hackathon result and her exact role unconfirmed; mockup/UI shots contain demo or upstream sample data to replace before publishing.
