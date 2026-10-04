---
name: report:visuals-round3
description: "Real visual assets per project (deep public-page + repo-mockup capture), colour logos, and per-project visual kits with readable diagram/chart specs and brand palettes."
date: 03-10-26
metadata: {node_type: memory, type: report, feature: portfolio-site, phase: foundation-research}
---

# Visuals report, round 3 (2026-10-03)

**Bottom line:** 798 PNGs captured (all at 2x, 285 MB, gitignored) under `research-private/round3/visuals/`. Strong real material exists for **Ledgr, Cortex Sentinel, COSAP, Lumicap, ReOrc, GoTyme research**. **Zalo Game Center and PAC have no public visuals at all** — those case studies must rely on generated charts built only from CV figures.

Layout of each capture: `{live|local}/{name}/{d|m}/` holds `full.png` (full page; d = 1440 wide, m = 390 wide), `phone-tall.png` (390x845, m only), `section-NN.png` (one crop per page section), and close-ups `nav-/table-/form-/card-/chart-/empty-NN.png`. Script: `research-private/round3/visuals/deep.cjs`; logs: `live/capture-log.txt`, `local/capture-log.txt`; local target list: `local-targets.txt`.
- `live/` = public pages, no login.
- `local/` = HTML mockups, decks and docs from the cloned repos (file://).

Earlier rounds still apply: `research-private/media/projects/**` (top-fold shots, flow videos, Cortex deck PNGs), `media/companies/**`, `media/ledgr-meetup/**`.

## 1. Logos (`research-private/round3/visuals/logos/`, see `logos/SOURCES.md`)
| entity | file | status |
|---|---|---|
| SkyLab | logos/skylab-wordmark.png (2340x496, full colour) + media/companies/logos/skylab-icon.svg | done |
| COSAP | logos/cosap-logo.png (1940x496) | done |
| Lumicap | logos/lumicap-favicon-dark.png + media/companies/logos/lumicap-{dark,light}.png | done |
| Zalo | logos/zalo-wordmark.svg (Wikimedia), media/companies/logos/zalo.svg | done |
| Cortex Sentinel | logos/sentinel.svg, logos/logo-standard.svg (own repo) | done |
| ReOrc, Chợ Tốt, FTU, MindX, Creatio, MoMo (icon 180 px) | media/companies/logos/ (round 2) | raster only for most; MoMo SVG not found |
| AABW, Build Stuffs | none | GAP: ask organiser (Ky-Nam for Build Stuffs) |
| Tech stack | logos/tech/*.svg, simple-icons 16.22.0, CC0 package, coloured with the official brand hex | nextdotjs, typescript, supabase, vercel, go, react, postgresql, tailwindcss, anthropic, docker, kubernetes, googlecloud, solidity, ethereum, zalo, python, figma, jira, notion. Not in simple-icons: OpenAI, AWS, Azure, MoMo (use official press kits) |
Licence note: the CC0 licence covers the SVG files only; the marks remain their owners' trademarks. Use them unaltered and only to name a tool or employer.

## 2. Per-project kits

Rules used for every chart below: only numbers already in the CV, a repo file or a public page. Company figures are labelled "company-published". Backtest numbers are labelled "BACKTEST, seed data". No baselines are invented: if a source gives only a percentage change, the chart shows the change and nothing else.

### 2.1 Ledgr (lead case study)
**Palette (from repo `src/app/globals.css`):** primary oklch(0.546 0.245 262.88) ≈ #1F5BFF (blue), foreground oklch(0.208 0.042 265.76) ≈ #0F172A, background oklch(0.984 0.003 247.86) ≈ #F8FAFC, accent ≈ #F1F5F9; status colours for pass, warn and fail come from the design-system page (`local/ledgr-ds`).
**Real assets**
| use | path |
|---|---|
| Hero | live/ledgr-home/d/full.png (sections 00-03), live/ledgr-home/m/phone-tall.png |
| Sections | live/ledgr-home/{d,m}/section-*.png (21 and 22 crops) |
| Pricing | live/ledgr-pricing/{d,m}/card-*.png (pricing-card close-ups) |
| Empty state | live/ledgr-ketqua/d/card-00.png ("Chưa có kết quả kiểm tra"; clean, no data) |
| Auth forms | live/ledgr-login, ledgr-signup form-00.png |
| Design system | local/ledgr-ds/d/section-*.png (tokens, buttons, badges) |
| Product mockups (logged-in screens, from own docs) | local/ledgr-proto, local/ledgr-check-redesign, local/ledgr-free-review (full.png) |
| Strategy | local/ledgr-gtm/d/section-*.png, local/ledgr-canvas/d/full.png |
| Architecture (repo SVGs) | research-private/round3/visuals/diagrams/rag-{data-flow,deployment,service-interaction}.svg |
| Real-world proof | media/ledgr-meetup/bs33/*.jpg (laptop shots, no faces), media/projects/ledgr/flow-landing-to-free-review.webm |
**Generated diagrams/charts (3-5)**
| # | type | exact data / labels | source | render |
|---|---|---|---|---|
| L1 | Grouped bar or tree: rules by document type | labor_contract 15; einvoice 2; accounting_voucher 2; pit_finalization 3; vat_declaration 2; vendor_service 3. Total 27 rules, 6 types. A dashed "Roadmap: 100+" marker, labelled "vision, not built" | supabase/migrations/20260616000002_seed_labor_rules.sql, 20260618000001_seed_doctype_rules.sql | SVG, bars grow on scroll |
| L2 | Breakdown of the 15 labour rules | min wage x4 regions, probation caps x3, probation wage floor 1, overtime x2, BHXH 1, PIT withholding 1, fixed-term renewals 1, working hours 1, annual leave 1 | same seed file | SVG treemap or stacked bar |
| L3 | User flow | Landing → Free review modal → Upload → Rule check → Result (pass/warn/fail) → Sign up to save | live routes + flow-landing-to-free-review.webm + check-redesign mockup | animated SVG path |
| L4 | System architecture | Upload → parse → RAG retrieval over the legal corpus (rule_sources crawler) → rule engine → verify-rules pipeline → result | repo rag-*.svg + verify-rules.ts | redraw the repo SVG in brand colours (SVG) |
| L5 | Timeline | BS33 demo 2026-06-20 (31 posts), BS34 2026-07-04 (71), BS36 2026-08-01 (85) | user-decisions_NOTE (Duma posts) | horizontal SVG timeline. "~20 people validated" is Thao's own claim; label it so |
**Gaps:** no logged-in dashboard capture (needs a login; the mockups stand in). The nine UI doc-type labels and the six seeded types differ; say "6 types with seeded rules".

### 2.2 Cortex Sentinel (AABW Fintech, 2nd place)
**Palette (repo pitch/logo):** #0E2A1C deep green, #20261C ink, #8FD6B0 mint, #F3F8F1 paper, #5A50FA violet accent.
**Real assets:** local/cs-{rule-studio,disposition-copilot,case-management,str-drafting,sentinel-data,sentinel-detection,sentinel-cases}/{d,m}/ (7 PRD mockups; 14-37 crops each, including tables, forms, cards and charts), local/cs-day2 (adaptive-triage demo UI), local/cs-pitch/d/full.png; round-2 deck PNGs and videos in media/projects/cortex-sentinel/. Logos: logos/sentinel.svg.
**Warning:** the case, alert and STR mockups show **fictional customer names and transactions**. Review every table crop before publishing, or blur the name columns.
| # | type | data | source | render |
|---|---|---|---|---|
| C1 | Funnel / alert-triage flow | Alerts in → 6.5% auto-closed → 0 escaped true positives → rest to analyst queue. Badge: "BACKTEST, seed data" | case-studies/projects/cortex-sentinel.md (project-story.md) | SVG funnel, animated on scroll |
| C2 | Before/after bar chart at a fixed 90% recall | false positives −20.3%, manual review −18.4%. Baseline rules: recall 100%, precision 18.1% | same | SVG paired bars with a recall line |
| C3 | Module map | Data & Screening → Detection (Rule Studio) → Disposition Copilot → Case Management → STR Drafting | the 7 PRD mockup titles | SVG node graph |
| C4 | Decision tree, Disposition Copilot | rule hit → evidence pack → AI recommendation (close / escalate) + explanation → human decision | disposition-copilot mockup | SVG |
**Gaps:** the meaning of the "−186" figure is unconfirmed, so leave it out. No public deployment, so the mockups are the product visuals.

### 2.3 Lumicap (her work: investor product and crypto core; company figures labelled)
**Palette:** taken from the site screenshots. Dark navy plus gold/teal from logos lumicap-dark/light; confirm the exact hex values from live/lumicap/d/section-00.png (the inline HTML has no hex values). Placeholder: #0B1220 / #F5F7FA / brand accent sampled at implementation time.
**Real assets:** live/lumicap/{d,m}/ (18 and 17 crops: hero, stats band, feature cards, footer), plus media/projects/lumicap/flow-landing-scroll.webm. The product itself is behind a login, so there are no product screens.
| # | type | data | source | render |
|---|---|---|---|---|
| U1 | Stat band | $635M AUM, $2M distributions, 17 active investors, 5 active funds; caption "company-published, lumicap.io" | public page (_page-text.txt) | count-up numbers |
| U2 | System diagram of the crypto core | multisig custody → on/off-chain ledger → USDC settlement → fund NAV tracking → investor transaction history | CV wording | SVG flow |
| U3 | Module map | 6 modules (names not given, so show "6 investor-facing modules" with no invented names) | CV | SVG grid. GAP: get the module names |
| U4 | Investor-platform UI mock | a schematic wireframe built only from the CV features, labelled "illustrative" | CV | CSS 3D tilted card |

### 2.4 COSAP (AI ERP for SMEs)
**Palette (cosap.ai inline colours):** #2AABEE sky blue (dominant), #5A90CC / #7BA3D4 / #90B4E0 blue ramp, #5A4298 purple, #E8532E orange accent.
**Real assets:** live/cosap/{d,m}/ (19 crops each: hero, "Core modules" grid, "Industry verticals", AI-engine section), plus media/projects/cosap/flow-landing-scroll.webm. local/cosap-compliance was not captured (outside the list); repo file `ledgr-webapp/z.ledgr/cosap-compliance-overview.html` is available.
| # | type | data | source | render |
|---|---|---|---|---|
| P1 | Layered module map | Unified core → core modules → industry verticals → integration APIs; site says 6 core modules / 18 mini-apps / 3 verticals; her CV says she led design across 8 modules | cosap.ai + CV. Show both, with the definitions | SVG stacked layers |
| P2 | 3-tier AI engine | classification → anomaly detection → assistants | cosap.ai | SVG |
| P3 | Stat chips | 60% less review time, 24 hr risk detection, 40% fewer inquiries; caption "company-published" | cosap.ai | chips |
| P4 | Requirement-gathering flow | Korean and Singaporean clients → PM synthesis → module specs | CV | SVG. Client count: GAP |

### 2.5 Zalo Game Center (Product Owner, CV)
**Palette:** Zalo blue #0068FF (simple-icons), white, navy #001A33 (choose at implementation).
**Real assets:** none of her work. live/zalo-game (game.zalo.me) rendered **blank** (0 crops); the public SlideShare deck and the Facebook page ZGCSymbolic are third-party. Logos only.
| # | type | data | source | render |
|---|---|---|---|---|
| Z1 | Change chart (no baseline) | ad revenue +30% (within 6 months), engagement +15%, paying users +3% (pp vs % not stated in CV, so label it "+3% paying users, as stated"), manual data extraction −40% | CV | SVG diverging bars from 0. No time series, so do NOT draw a monthly line |
| Z2 | Before/after process | manual data pulls → tracking dashboard (−40% extraction) | CV | SVG |
| Z3 | A/B test diagram | control vs variant ad placement → 6-month outcome +30% | CV | schematic SVG |
| Z4 | Scope | 1 new launch + 4 existing products | CV | icon row |

### 2.6 PAC (one billing engine, four clouds)
**Palette:** none (no brand). Use neutral slate with the four cloud brand colours: googlecloud #4285F4 is in tech/; get AWS, Azure, Huawei and Alibaba from their official press kits.
**Real assets:** none. Must be fully generated.
| # | type | data | source | render |
|---|---|---|---|---|
| A1 | Convergence diagram | AWS, Azure, Huawei, Alibaba pricing models → normalisation layer → one invoice / cost attribution | CV | animated SVG paths |
| A2 | Before/after | 4 inconsistent invoices → 1 standard | CV | SVG. No metric exists, so show none |

### 2.7 ReOrc AI (experience page)
**Palette:** sample from live/reorc/d/section-00.png (inline HTML gave no hex values).
**Real assets:** live/reorc/{d,m}/ and live/reorc-dss/{d,m}/ (22-23 crops each), plus media/companies/screens/reorc-docs-*.png.
| # | type | data | source | render |
|---|---|---|---|---|
| R1 | KPI bars | rework −40%, feature delivery +20% faster, UAT 95% first-pass | CV. The 40% is described differently in the CV and in Notion, so use the CV wording | SVG |
| R2 | Process | requirement framework → validation checkpoints → UAT scenarios → release | CV | SVG |

### 2.8 GoTyme research (Go Crypto)
**Palette:** taken from the research page (dark/teal); sample live/gotymex/d/full.png.
**Real assets:** live/gotymex/{d,m}/full.png, local/gotymex-arch/{d,m}/ (8 crops: architecture sections), media/projects/gotymex-research/*.png. This is a study aid; label it "independent research, not affiliated with GoTyme".
| # | type | data | render |
|---|---|---|---|
| G1 | System architecture | redraw the components from docs/go-crypto-architecture.html | SVG |

### 2.9 SkyLab (employer context)
live/skylab/{d,m}/ (17 crops each). Logos: skylab-wordmark.png.

## 3. Gaps and asks
1. Zalo and PAC: no real visuals exist. Ask Thao for sanitised dashboards or slides; otherwise use the generated charts only.
2. Logged-in screens for Ledgr, Lumicap and COSAP were not captured (no logins, per instruction).
3. AABW and Build Stuffs logos: ask the organisers.
4. Lumicap module names; COSAP "8 modules" definition and client count; the meaning of Cortex's "−186" figure.
5. The Cortex mockups contain fictional personal data. Review crops before publishing.
6. Exact hex values for Lumicap, ReOrc and GoTyme: sample from the screenshots during implementation.
7. MoMo SVG, OpenAI/AWS/Azure/Huawei/Alibaba logos: official press kits.

**Status:** DONE_WITH_CONCERNS
**Summary:** Deep captured 12 public pages and 16 repo mockups at 2x (798 PNG crops), collected colour logos and coloured tech icons with sources, and specified 3-5 cited diagrams/charts plus a palette per project.
**Concerns:** No visuals exist for Zalo or PAC; the Zalo public page rendered blank; the Cortex mockups need a PII-look review; 285 MB of captures (gitignored).
