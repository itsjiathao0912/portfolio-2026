---
name: report:assets
description: "What logos, screenshots and public presence were obtainable for the portfolio, what is missing, and the ask-list for the user."
date: 03-10-26
metadata:
  node_type: memory
  type: report
  feature: portfolio-site
  phase: foundation-research
---

> Logos: `research-private/assets/logos/` (move to `public/` during EXECUTE once usage is confirmed; `SOURCES.md` there records each source URL). Product screenshots: `research-private/assets/screens/{skylab,lumicap,cosap,reorc,zalo}/` (1440 and 390 wide, top fold only). Both are local-only for now because they are third-party brand material.

# Portfolio assets report (2026-10-03)

## 1. Public presence
| source | result |
|---|---|
| LinkedIn /in/thaodao0912 | BLOCKED (HTTP 999 auth wall; not bypassed). Search snippet only: "Thao Dao - SkyLab Holding", HCMC, 500+ connections, Foreign Trade University 2019-2023, MindX PM 2023. No photo URL obtained. |
| GitHub itsjiathao0912 | Bio "Product Builder"; 5 repos; pinned: ledgr-webapp (TS), cortex-sentinel-az/setinel (Go). Avatar: https://avatars.githubusercontent.com/u/205788712 (not downloaded; unknown whether it is a photo). 1 follower. |
| Personal site https://www.itsjiathao.space/about | Same copy as old portfolio (no images). Possibly the same/new deployment of the old site. |
| ITviec SkyLab page | itviec.com/companies/skylab (employer context only) |
| Talks/articles/Devpost | Nothing found via search. Ask user. |

## 2. Assets obtained (assets/)
| entity | logo | screenshots (1440/390) | notes |
|---|---|---|---|
| SkyLab Group | skylab-icon.svg (icon only) | screens/skylab/ | og:image https://static.wixstatic.com/media/6d3166_fe34425824904b8fb8f2d48a698c0d86~mv2.png (2500x1330) |
| Lumicap | lumicap-dark/light.png | screens/lumicap/ | hero is marketing page only (login-gated product) |
| COSAP | cosap.png | screens/cosap/ | public landing |
| ReOrc AI | reorc.svg | screens/reorc/ | og: https://reorc.com/assets/og/og-default.png |
| Zalo | zalo.svg | screens/zalo/ | public site shows Zalo generally, NOT Game Center; the user's work is not visible |
| PAC | none | none | no public site |
| Ledgr | none | not captured | app https://ledgr-webapp.vercel.app, repo public: capture next if wanted |
| Cortex Sentinel | none | none | repo only; no demo URL found |
| Chợ Tốt, MoMo, Creatio | not fetched | - | historical roles, unverified; skipped |
Screenshots are viewport-only (top fold), not full-page. Demo videos: none found on any page (no YouTube/Vimeo embeds). Screenshot script: assets/shots.cjs.

## 3. Missing
- Headshot/profile photo (LinkedIn blocked; GitHub avatar unverified).
- Any product UI showing the user's actual work (dashboards, reconciliation, ERP modules, Game Center).
- Full SkyLab wordmark, Zalo/ReOrc approved brand usage.
- Ledgr/Cortex Sentinel visuals; PAC visuals.

## 4. ASK LIST for user
1. Headshot (square, 1000px+, plain background) and preferred bio photo for OG image.
2. Permission to show company logos and public-site screenshots (Zalo/VNG, ReOrc, SkyLab): any employer guidelines?
3. Per project, is internal UI shareable? Lumicap, COSAP, PAC: sanitized screenshots, Figma exports, flow diagrams, or redacted mockups. Any NDA/client constraints (Korean and Singaporean COSAP clients; PAC tenants)?
4. Zalo Game Center tracking dashboard, A/B test result charts: sanitized versions allowed? Are the 30%/15%/3% numbers publishable?
5. ReOrc: data lineage / governance screens; may the 40%/20%/95% metrics be shown?
6. Demo recordings (Loom/screen capture) of Lumicap, COSAP, Ledgr, Cortex Sentinel triage copilot.
7. Ledgr/Cortex Sentinel: OK to screenshot live app and repo? Real Vietnamese-law data in Ledgr?
8. Confirm Lumicap/COSAP/PAC role wording (e.g. "owned crypto core") is approved for public use.
9. Is itsjiathao.space the intended domain? Any talks, articles, hackathon photos (2021 awards), certificates for the Awards section?
10. Chợ Tốt / MoMo / Creatio: include or leave out? (old site omitted them as unverifiable.)

**Status:** DONE_WITH_CONCERNS — LinkedIn blocked (no data/photo); several entities have no public visuals.
