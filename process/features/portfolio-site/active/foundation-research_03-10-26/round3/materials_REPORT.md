# Materials Report — Thao's own decks, CV, photos, SkyLab site

Date: 2026-10-03 · Mode: RESEARCH · Sources: 8 PDFs + 5 media files in `~/Downloads/` (read-only, untouched) + skylabteam.com public pages.

**Bottom line**
- 8 decks are extracted and rendered: full text per page plus every page as a 2x PNG. Everything is in `research-private/materials/<deck>/` (`text.md`, `pages/pNN.png`, `crops/`). Nothing went into `public/` or the repo outside that gitignored folder.
- The materials support 2 new case studies: **GoCrypto** (Thao's solo strategy deck) and **Guardline** (a hackathon she led). Both are strong. GoCrypto is the deepest product-thinking piece across all the materials.
- Cortex Sentinel, COSAP and Lumicap each get much richer, cited content. The current site has one factual framing problem: Cortex is described as "Open AML… Personal project", while the deck positions it as a GoTymeX AML/KYT-track hackathon build on top of an existing platform (see §1).
- Media: 4 photos and 1 video are converted. **The video and 2 photos are from the AABW 2026 / GoTyme track event, and one photo shows the winners on stage.** These are the best "proof" visuals available.
- Citation format: `[deck pN]`. Numbers are copied verbatim. Marketing and illustrative figures are labeled as such.

Deck keys: `cortex` = Cortex Sentinel Pitch Deck (1).pdf (21 pp) · `guard` = Guardline Fraud Detection Proposal.pdf (9) · `cosap7` = COSAP Intro v7.pdf (23) · `cosap3` = COSAP_Intro_Fin_v3.pdf (24) · `goc` = GoCrypto Product Strategy.pdf (50) · `cv` = Thao Dao Product Owner.pdf (2) · `lhow` = D1.3 Luminet – How it Works (12) · `ldemo` = D1.4 Luminet – Platform Demo (13).

---

## 1. Cortex Sentinel → `cortex-sentinel` (existing)

**What the deck says it is.** An "AML Triage Layer for fiat & crypto". Track: "GoTymeX — AML / KYT · Agentic AI Build Week 2026" [cortex p1]. Headline: "Compliance that scales like software — not headcount." [p1, p10]

**Honesty framing (important for copy).** The deck states: "AI rule-gen & versioning are platform capabilities we build on; the adaptive-triage layer is our hackathon contribution" and "Demo runs on seeded synthetic data; the learning numbers are backtests" [p20]. The live / prototyped / backtest labels are on [p17].

| Fact | Value | Cite | Label |
|---|---|---|---|
| Alerts auto-cleared (pure noise, with written rationale) | 6.5% | p1 | hero metric |
| Time to author & ship a rule | "Minutes", no engineer | p1, p7 | qualitative |
| GoTyme users | 6.5M | p2, p21 | public source |
| Projected PH crypto users 2026 | 12.79M | p2, p21 | public source |
| VASP licence | BSP, MSB000215, FATF R.15 | p2, p21 | public |
| Resolved-case corpus | 2,000 alerts; kyt_high_exposure split ~50/50 (≈53/52) | p3, p16 | semi-synthetic |
| Agent self-correction | rewrites invalid AST up to 3× | p6 | live |
| Grounded rule-gen target | −20–30% false alerts | p6 | "target / projected" |
| Shadow-test outcome mix | Approve 71% · Review 19% · Block 7% · Decline 3% | p7 | demo |
| Escaped true positives | 0 (scorer, 2,000 cases) | p9, p17, p19 | prototyped offline |
| Threshold backtest | 0.15 → 0.49; −186 reviewed/period; 0 escalations lost | p9, p17 | backtest, in-sample |
| Auto-clear claim | "≥ 90% that's noise" | p10 | aspiration; conflicts in tone with 6.5% on p1, so do not use both side by side |
| Rule scores | near_reporting_threshold +30, high_risk_corridor +30, kyt_high_exposure +50, structuring_velocity_24h +45, rapid_funds_movement +45 | p19 | actual rules |
| Score bands | <30 approve · 30–79 review · 80–99 block · ≥100 decline | p19 | |
| LLM providers | Anthropic · OpenAI · Gemini (default gemini-2.5-flash) | p13 | |
| Stack (L5) | PostgreSQL+PostGIS, Redis, Elasticsearch, Firebase Auth, Yente+Motiva, self-hosted | p14 | |
| Tyme Group | ~$1.5B valuation, $250M Series D led by Nubank (Dec 2024) | p21 | public |

**Changes to `content/projects/cortex-sentinel.ts`**
- `period: "Personal project"` / `status: "Open source · self-hosted"` → suggest `"Hackathon · Agentic AI Build Week 2026"`. Keep the GitHub link.
- Award track name: the site says "Fintech track". The deck says "GoTymeX — AML / KYT" [p1], and the stage photo says "GOtyme Financial Services II Track Winners". **Ask Thao which official name to use.** Guardline's team slide calls it "Runner-Up at Agentic AI Build Week 2026" [guard p9], which is consistent with "2nd".
- Add the "Four pillars": Ingest → Rule-authoring agent → Shadow-tested versions → AI case review [p4–p8]. Add the safety list [p15] and the personas [p16].
- The "Built on Marble" caption is not in the deck. The deck says "built on a production transaction-monitoring platform" [p1]. Keep only if the repo supports it.

**Screens worth showing:** none. The deck is text and diagrams only. Use existing `/work/` screenshots plus the redraws below.

---

## 2. Guardline → NEW project `guardline` (recommended)

**Decision: make it a separate project, not part of Cortex or SkyLab work.**
- It is a different event: "Sea × OpenAI Codex Hackathon Vietnam 2026" [guard p1].
- It has a different problem (SPayLater cash-out fraud for Monee/Sea) and a different team.
- Thao is named "Technical PM · Team Lead" [p9]. The team slide also cites shared SkyLab history ("We have shipped fintech together at SkyLab, from Lumicap to COSAP") [p9]. That is good cross-linking copy.
- **No placement or result is stated anywhere.** Don't claim one.
- Status: proposal / hackathon build. All numbers are "Targets, not results… synthetic data" [p8].

| Fact | Value | Cite |
|---|---|---|
| Monee loan book Q2 2026 | US$11.1B, +62% YoY | p2 (Sea Q2 2026 earnings) |
| First-time borrowers / quarter | 5.3M | p2 |
| SPayLater used outside Shopee via QR | >20% | p2 |
| Bad-loan line to hold (90+ dpd) | ~1% | p2 |
| Cleared by cheap signals, no AI | ~95% | p4, p8 (target) |
| Catch rate on new tactic after adapting | 0 → 90%+ | p8 (target, synthetic) |
| Genuine users blocked | 0 | p8 (target) |
| Human-review threshold | >10 accounts or novel case | p4, p7 |
| Order hold / reserve expiry | within 3 working days | p7 |
| Demo ring | 14 accounts sharing devices | p8 |
| Team | Thao (TPM, lead) · Thành (Tech Lead, 9+ yrs; Kafka billing 100,000+ events/min) · Hiếu (AI Engineer, 3+ yrs) | p9 |

**Content blocks:** problem → 5-step loop [p3] → AI flow diagram [p4] → investigator agent + JSON verdict [p5] → adapt loop [p6] → action-permission table [p7] → 3-minute demo script [p8]. The JSON verdict on [p5] is a good code-block visual: render it as real text, not an image.

---

## 3. COSAP → `cosap` (existing). Two decks with different positioning

- `cosap3` (Fin v3, "April 2026", launch keynote byline "Sean Kim, COSAP AI", event date "COSAP Launch · April 21, 2026" [p1, p3]): **"Finance, HR, and inventory. One platform. Zero data entry."** This is the ERP-replacement framing.
- `cosap7` (v7): **"The workflow layer above the systems you already run"**. COSAP "doesn't replace your systems" [p4]. It is newer in thinking: Automate + Optimize pillars [p5].
- **Neither deck names Thao.** Her role comes only from the CV: "Leading product design across 8 modules… primary PM for cross-market requirement gathering across Korean and Singaporean clients" [cv p1]. The closing slide footer reads "Sean Kim, Group CTO / CSO, SkyLab" [cosap7 p23]. The SkyLab site lists him as "Group CSO".
- Recommendation: use v7's framing for the headline. Use v3 for product detail (deep dives, pricing). Label every metric "Company figure".

| Fact | Value | Cite | Note |
|---|---|---|---|
| Problem: books close | 10+ days/month | cosap3 p3, cosap7 p3 | industry source |
| Payroll runs with error | 1 in 5 | p3 | EY 2021 |
| Months to detect internal fraud | 12 | p3 | ACFE 2024 |
| Manual invoice cost | $9–$13 | p3 | APQC |
| Products | COSAP Core, Vantage, Forge, API Service | cosap3 p4 | |
| Receipt → ledger | 2m 47s (was ~3 days) | cosap3 p13, cosap7 p8 | "actual customer data" |
| Expenses this month / auto-classified | 847 / 96.2% | cosap3 p13 | |
| Bank-sync auto-match | 90%+; 150 txns <2 min | cosap3 p14 | |
| Month-end close | 3 days → 4 hours | cosap3 p14 | **conflict:** headline on the same slide says "5 days". Use 3 days → 4 hours (matches cosap7 p8 "was 3 days") |
| Benchmark basis | 12 SMB deployments, Q1 2026 | cosap3 p14 | |
| Face match confidence | 95%+ | cosap3 p15 | |
| Payroll countries | KR, VN, SG, TW (rules listed) | cosap3 p15 | |
| Compliance block example | Annual leave 8 days → blocked, LSA §60 min 15 | cosap3 p16 | great micro-interaction |
| CEO risk scenario (22 stores VN) | $28.4K registers · $112K settled 7-day · $47.2K pending 3-day lag · $38K in transit · risk score 72 ELEVATED | cosap3 p17, cosap7 p14 | scenario |
| Risk modules | 10 | p17 | |
| Forge proof (WAPS · ARIZE) | PO errors 12.4 → 2.1/mo (−83%); turnover 4.2× → 8.7×; OTD 73% → 94%; anomaly lag 14.3 days → 23 min; 82% error POs auto-blocked | cosap7 p18 | "reconciled against ERP and audit logs" |
| Yield leak | 3.2% on Line 3, caught in 4 days, 90 batches | cosap7 p17 | |
| Retail wrong-rate catch | contract 2.90% vs 3.30%; ₫1,519,200 on ₫1.0B weekend, 20 shops | cosap7 p20 | "illustrative deployment" |
| F&B engagement | 1,000 stores, 10 legal entities; 30,000-store horizon | cosap7 p21 | "active engagement" |
| Pricing | Admin seat ₩30,000/mo, employee ₩8,000/mo… Vantage $49/$149/$499; 50-person example ~₩1.9M/mo vs ~₩3.2M saved | cosap3 p22 | |
| Rollout | Live in 30 days, pays back in 60 | both | |
| Named customers | Chong Wei (Taiwan), WAPS · Taiwan Steel Group | cosap3 p18–19 | public naming in a confidential deck; ask Thao before naming |

**Changes to `content/projects/cosap.ts`**
- The current bar chart (60% / 40%) comes from the website. Keep it, or replace it with the Forge before/after table, which is stronger and cited [cosap7 p18].
- Add a "Telegram as the UI" section [cosap3 p8].
- Add the content-level translation example: VI "đi ăn với đối tác" → EN "Dining with partners" [cosap3 p10].
- **Both decks are marked "Private & Confidential".** Thao should confirm what she is allowed to publish. The safest set is the public-site figures plus generic workflow diagrams.

**UI elements worth recreating (not cropping; they are vector):** the Telegram portal card (3 Approvals pending / ✓ Checked in 09:18 / 5 Tasks today) [cosap3 p8], the CEO risk card [p17], and the compliance-block card [p16].

---

## 4. Luminet / Lumicap → `lumicap` (existing)

**Naming:**
- **Luminet Technology Ventures** is the company / issuer.
- **Lumicap** is the product/platform (lumicap.io, @LumicapIO) [lhow p1, p12].
- Tokens: **LMX** is the governance token, with fixed supply and the minter role revoked post-genesis [lhow p8, ldemo p6]. **LUMI** is the fund-ownership token, minted at NAV/close [lhow p5–7].
- Keep the project title "Lumicap". Add "by Luminet Technology Ventures" as the subtitle. Both decks are dated "January 2026" and marked "PRIVATE & CONFIDENTIAL".

| Fact | Value | Cite |
|---|---|---|
| Fund structures | Closed-end, Open-end | lhow p4 |
| Fund types | Variable return (NAV appreciation), Fixed-rate | p4 |
| Closed-end lifecycle | Launch → Close / LUMI minted (Month 1–3) → Deploying (Month 3–6) → Active → Distributions quarterly in USDC → Wind-down (3–5 yrs) | p6 |
| Closed-end example target raise | $5M | p6 |
| Open-end lifecycle | rolling launch; monthly subscription; quarterly redemption at NAV, settled USD; indefinite | p5 |
| Investor journey | 7 steps: KYC → USD deposit (S3 + MD5 evidence) → fund selection → recorded → LUMI mint → token to fund wallet → on-chain record | p7 |
| KYC steps | Personal info → Identity → Accredited status → Source of funds → Address | p7 |
| Multisig deploy | 2-of-3 approvers, 2FA ×2; HashiCorp Vault P-256 keys → Privy TEE quorum → chain; "keys never in database, signatures never persist" | p9 |
| Security features | MFA/RBAC, multisig, fixed supply, audited ERC-20, pause, on-chain transparency | p8 |
| Demo modules | 8: public site, LMX token mgmt, TGE, fund mgmt (NAV), fund creation (4 steps, OTP deploy), investment processing, investor portal, emergency pause/unpause | ldemo p3–11 |

**Changes:** the current content is consistent with the CV. Add the multisig signing flow [lhow p9] as the signature diagram; it directly evidences "owned the crypto core". The ldemo agenda is a natural "8 screens" walkthrough. **No product screenshots exist in either deck** (text boxes only), so screenshots must come from the live app or Thao.

---

## 5. GoCrypto → NEW project `gocrypto` (recommended, flagship strategy piece)

**What it is.** "GoCrypto · V2 Product Strategy — Digital assets as everyday finance. The transfer rail, and the remittance that justifies it." Byline: **"Thao Dao · July 2026 · Built from public sources"** [goc p1].
- Solo authored. Not SkyLab work. It reads as a product-strategy exercise about GoTyme Bank's Go Crypto, built from public sources.
- Category: "Strategy" or "Personal". Copy must say it is an independent strategy built from public data, not a GoTyme deliverable. **Confirm context with Thao** (job application case? self-initiated?).

**Core argument (SCQA)** [p2]: GoTyme is winning accounts (10M+, 300k net new/month, ₱43.5B deposits), but deposits per customer trail Maya by 25% (₱4,778 vs ₱6,335) [p6]. The fix is a transfer rail: custody → receive → send → one capped Gulf corridor for OFW households. It is measured on average daily balance per receiving household.

| Fact | Value | Cite |
|---|---|---|
| Deposits/customer | Maya ₱6,335 (₱67.7B/10.7M) · sector ₱5,858 (₱119.5B/20.4M) · GoTyme ₱4,778 (₱43.5B/~9M) | p6 |
| Breakeven gap | ₱4.0B/yr loss | p11, p43 |
| Trading closes of gap | Today ₱75M 1.9% · 3× ₱203M 5.1% · 10× ₱556M 13.9% | p11, p44 |
| National remittances | ₱2.07T ($35.6B, BSP 2025), 8–10% GDP; 48× GoTyme book | p8 |
| Corridor mix | US 40.2%, SG 7.6%, Saudi 6.7%, JP 5.8%, UK 4.6%, others 35.1% | p8 |
| Gulf share | Saudi 6.7 + UAE ~4 + Qatar ~1.5 = 12.2% → ₱253B/yr | p21, p45 |
| Flat-fee cost by ticket | 3.9% @ $150 · 2.3% @ $317 · 1.1% @ $1,000 | p21 |
| Ana's ₱18,400 transfer ($317 @ ₱58.20) | own bank ₱17,050 (7.3%) · GoTyme SWIFT ₱17,980 (2.3%) · corridor ₱18,290 (0.7%) | p27 |
| Phase 0 (mid-2027) | ₱10.1B landed · 45,800 households · 13,700 acquired · ₱321M deposits · ₱85M contribution (2.1%) | p2, p45, p47 |
| At scale 2029 | ₱177B landed · 800,000 households · 240,000 acquired · ₱5.6B deposits (+13%) · ₱1.5B contribution | p2, p48 |
| 2029 revenue split | FX & remittance spread ₱1,239M vs NIM ₱364M (p38) / ₱252M (p48) | **conflict:** p38 vs p48. Use p48 (appendix is the stated source of truth) |
| Retention assumption | 38% of inflow → ₱7,000 ADB; at 20%, the NIM line halves | p46 |
| Mid-2027 targets | 130,000 monthly active funded holders (from 95,000, +37%) · 60%+ 90-day retention · ₱10.1B corridor | p40 |
| Licence moat | ~9–10 BSP VASPs; licences frozen since Sep 2022; GoTyme MSB000215 Oct 2024 | p9 |
| Segments | OFW households ~1.75M national / ~250,000 in-base · freelancers ~310,000 · peso hedgers 2.6M eligible | p49 |

**Internal inconsistencies, so don't publish the stale numbers:**
- p22 shows "₱112M / ₱1.6B". p50 explicitly labels these as pre-correction figures (computed at a 6.5% spread). Use ₱85M / ₱1.5B.
- In the p26 table, the "Reachable in our 10M base" column shows ~1.75M. p49 says that number is national and that in-base is ~250,000. Use 250,000 for in-base.
- p38 NIM ₱364M vs p48 ₱252M (see the table above).

**Product screens (the only real UI in all materials):** 5 phone screens [goc p35], cropped at 4x into `gocrypto/crops/screen-1..5.png`. They are Thao's own design mockups and safe to show as "concept screens".
1. "Request money" — You'll receive ₱18,290, Miguel pays $317.00, fee ₱0
2. "Money received" — arrived in 3 minutes, timeline
3. "₱18,290 is yours" — Keep it growing 3% p.a., +₱46/mo, +₱549/12 mo (the "business case" screen). Its right edge is slightly clipped in the crop; re-crop from `p35-4x.png` if needed.
4. "How your money is protected" — PDIC ₱1M, Travel Rule ₱50,000, report-a-transfer
5. "GoCrypto" home — digital dollars settled 1 min 30 s; BTC/ETH/PAXG; save in gold ₱500/mo

**Signature copy:** the "Say / Never say" language rule ("Digital dollars" not "Stablecoin"; "Send money home" not "On-chain transfer") [p18], plus the closing line "Crypto is a supporting product in a bigger machine" [p41].

---

## 6. CV → `content/site.ts` changes

The CV [cv p1–2] matches `site.ts` almost line for line. The differences:
- **Title:** the CV header says "TECHNICAL PRODUCT OWNER | SYSTEM INTEGRATION | AGILE PROCESS", and the role line says "Technical Product Manager – SkyLab Group". The site uses TPM, which is consistent. No change.
- **New detail available for PAC:** "Owned the billing domain end-to-end: usage metering, multi-currency pricing, invoices, credit notes, and revenue dashboards. Specified API-heavy integrations…" [cv p1]. Check that `pac.ts` contains this; add it if missing.
- **Project status tags from the CV:** Lumicap "Shipped, pre-launch"; COSAP "Regulated, Korea"; PAC "Cloud, Multi-tenant SaaS". The site already uses the first two.
- **COSAP tech:** "Toss Payments Integration, Lago, RAG Pipelines & LLM Orchestration". Already present.
- **The CV omits** Chợ Tốt, MoMo, MindX, Creatio, and all awards. The site sources these from the older portfolio. No change is needed, but the CV cannot be cited for them.
- **Certification wording:** the CV says "AWS Solution Architect Associate (SAA)". The site says "AWS Solutions Architect — Associate" (the official name). Keep the site version.
- **New award facts for `awards`:** Guardline's team slide says "Runner-Up at Agentic AI Build Week 2026" [guard p9]. There is nothing on Guardline's own placement. Possible new entry: "Sea × OpenAI Codex Hackathon Vietnam 2026 — Team lead, Guardline" (participation only).

---

## 7. SkyLab Group (public site)

Sources: `skylab/home-text.txt`, `skylab/about-text.txt` (fetched 2026-10-03).
- "A platform-led AI infrastructure solution partner headquartered in Singapore, serving organisations across APAC" (about-us).
- Legal entity: "© 2026 SkyLab Holding Pte Ltd" (footer).
- Products: **FusionFlow** (AI infrastructure orchestration: GPUaaS, AIaaS, HPC, hybrid/multi-cloud) and **COSAP** (modular enterprise operations platform) (home).
- Pillars: Platforms · Professional Services (advisory, engineering/integration, 24/7 managed) · Resources & Capacity (GPU, hardware, cloud) (about).
- Serves: Service Providers · Public Sector Agencies · Enterprises (home).
- People (about): Stephen Ho (Group CEO), Sean Kim (Group CSO), Tom Wickings (VP Product), among others.
- "Snapshot by the Numbers": the figures are image or animated and were **not extractable as text**. Do not quote numbers from this section.
- Logo: the site only serves a **raster** wordmark (824×112 PNG, white on transparent). Saved as `skylab-wordmark-white.png` plus a recoloured `skylab-wordmark-dark.png`. **No official SVG wordmark is published.** The repo already has `public/logos/skylab-icon.svg` + `skylab-mark-white.svg` (the chevron mark matches the site's inline SVG path). For a crisp wordmark, ask Thao for the brand SVG; potrace is not installed.
- Screenshots: `home-desktop-fold.png` / `-full.png` (1440@2x), `home-mobile-fold.png` / `-full.png` (390@2x).

---

## 8. Media (all in `research-private/materials/media/`)

| File | What it is | Recommended use |
|---|---|---|
| `gotyme-track-winners-stage.webp/.jpg` (4096×2731) | Thao with team and judges on stage under "GOtyme · Financial Services II Track · Winners", AABW/GenAI Fund branding (from 12.37.12.jpg) | **Highlights / awards band; Cortex case-study proof.** Alt: "Thao and the Cortex Sentinel team on stage as GoTyme track winners, Agentic AI Build Week 2026" |
| `pitching-judges.webp/.jpg` (2048×1365) | Thao standing with laptop, presenting to seated judges, "Waiting Area" sign (from 12.31.32.jpg) | Cortex case-study "demo day" image; About section |
| `demo-judging-full.mp4` (1080×1920 portrait, 2m43s, h264 + AAC, 62 MB) | Phone video: Thao demoing Cortex to judges on a crowded hackathon floor (IMG_6804, 12 Jul) | Keep private or as a link. Too large for inline use |
| `demo-judging-loop-muted.mp4` (720w, 10 s, muted, 1.6 MB) + `demo-judging-poster.webp/.jpg` | Excerpt at 0:38–0:48 | **Case-study hero ambient loop** (`autoplay muted loop playsinline`, poster) |
| `hackathon-floor.webp/.jpg` (1800×2400, upright) | Hackathon room, Thao at center talking to judges, team-list wall behind (IMG_6802, 12 Jul, same day as the video) | Cortex story / "how it was built" |
| `event-laptop-desk.webp/.jpg` (1800×2400, upright) | Thao from behind at a desk: monitor + laptop with Claude/code windows (IMG_6996, 27 Jul) | About ("how I work"), "builds with Claude Code" skill line. Screens are small but check for confidential text before publishing |
| `conviction-2026.webp/.png` (1500×2000) | Thao with a VIP badge in front of the "Real World Real Movement / CONVICTION" installation | Highlights / speaking & events; About |

The HEIC files carried EXIF orientation 6 and were rotated upright. Their originals were left untouched. Dates come from file mtimes and are approximate.

---

## 9. REDRAW SPECS (build as SVG/HTML; no raster chart copies)

| # | Source | Chart type | Exact data | Labels | Interaction |
|---|---|---|---|---|---|
| R1 | cortex p7 | Horizontal 100% stacked bar ("shadow test run, candidate vs live") | Approve 71, Review 19, Block 7, Decline 3 | "Shadow test run — candidate v2 vs live v1" | Bars grow on scroll; hover shows %; toggle "v1 live / v2 draft" (only v2 data exists, so show v1 as a ghost outline) |
| R2 | cortex p19 | Score ladder: rules as bars on a 0–100+ axis, with band zones | Rules +30, +30, +50, +45, +45; bands <30 / 30–79 / 80–99 / ≥100 | approve · review · block · decline | Click rules to "fire" them and sum the score; the marker slides into a band (shows structuring example p8: +45) |
| R3 | cortex p4/p5/p8 | 5-step horizontal flow (×3 variants) | Ingest→Model→Semantics→Pivot→Ground; Goal→Plan→Tools→Act→Verify; Detect→Route→Review→Judge→Dispose | as deck | Steps light up sequentially on scroll; tabs switch between the 3 pillars |
| R4 | cortex p6 | Loop diagram | Generate → Validate → (invalid, ≤3×) back to Generate; valid → analyst | "up to 3×" | Animated token cycles twice, then exits to "Human commits" |
| R5 | cortex p14 | Layered architecture (L1–L5) with status chips | Layers and items as on p14; chips LIVE / PROTO / DESIGN | | Hover chip filters to that status; click layer to expand |
| R6 | cortex p9/p17 | Threshold slider | 0.15 → 0.49; −186 reviewed; 0 escalations lost | "Backtest — illustrative" badge | Drag 0.15→0.49 and counters animate; badge always visible |
| R7 | guard p4 | Flow diagram | Signals → Detection (~95% cleared, no AI) → AI agent → Policy guard → {Clear, Platform acts, Partner bank, Person decides}; dashed learning: Rule writer, Daily review | solid / orange / dashed legend | Hover a branch to show the limit text from p7 |
| R8 | guard p7 | Permission matrix table | 4 rows × (Action, Who decides, Limit) | Agent alone / Partner bank / Person chips | Row hover highlights the matching node in R7 |
| R9 | guard p6 | 6-step adapt timeline | flags novel → confirms → drafts → backtest → promotes → caught, no AI | | Step-through on scroll |
| R10 | cosap7 p18 | Before/after slope or dumbbell chart | PO errors 12.4→2.1/mo; turnover 4.2→8.7×; OTD 73→94%; anomaly lag 14.3 days→23 min | "Company figure · WAPS·ARIZE" | Dumbbells animate; lag row uses a log scale or separate callout |
| R11 | cosap3 p14 | Before/after duration bars | Month-end close 3 days → 4 hours | | Bar shrink animation |
| R12 | cosap3 p13 | KPI tiles | 2m 47s · 847 · 96.2% · ₩0 | | Count-up on view |
| R13 | cosap3/7 p17/p14 | Dashboard card + gauge | $28.4K, $112K, $47.2K, $38K; risk 72 "ELEVATED" (0–100) | "Scenario" | Gauge needle sweep; tooltip on each tile |
| R14 | cosap7 p5 | Two-pillar loop | Capture→Classify→Route→Post ⇄ Sense→Decide→Act→Learn | Automate / Optimize | Toggle pillars; arrows animate between them |
| R15 | cosap3 p16 | Form micro-interaction | input 8 days → BLOCKED §60 → 15 days → saved | | Live typed demo (interactive input) |
| R16 | cosap3 p10 | Side-by-side translation card | VI "đi ăn với đối tác" ↔ EN "Dining with partners", ₩72,000 GS Caltex | | Language toggle flips the card |
| R17 | lhow p6 / p5 | Timeline / Gantt | Closed-end: M1–3 close+mint, M3–6 deploy, active, quarterly dist., 3–5 yr wind-down; Open-end: monthly sub, quarterly redemption, indefinite | | Toggle closed / open; scrub timeline |
| R18 | lhow p7 | Swimlane journey | 7 investor steps + 4 returns steps (Revenue → Settlement → Smart contract → Distributed) | | Step highlight on scroll |
| R19 | lhow p9 | Sequence diagram | Admin initiates → 2 approvers (2FA×2) → 2-of-3 threshold → Vault P-256 → Privy TEE → chain | quorum 2 of 3 | Click approvers to collect approvals; signing fires at 2/3 |
| R20 | goc p6 | Horizontal bar | Maya 6,335 · Sector 5,858 · GoTyme 4,778 (₱/customer) | "−25% per account" annotation | Bars grow; hover shows deposits/customers |
| R21 | goc p11/p44 | Bar against a ₱4.0B reference line | 75 / 203 / 556 (₱M) → 1.9 / 5.1 / 13.9% | Today / 3× / 10× | Click a volume level; the fill animates within the gap bar |
| R22 | goc p8 | 100% stacked bar / treemap | US 40.2, SG 7.6, Saudi 6.7, JP 5.8, UK 4.6, other 35.1 | Gulf highlight (Saudi + UAE ~4 + Qatar ~1.5 = 12.2) | Click "Gulf" to highlight the corridors |
| R23 | goc p21 | Line chart (cost % vs ticket $) | (150, 3.9) (317, 2.3) (1000, 1.1) | "$5 flat + 0.6% FX"; shaded remittance band | Drag a ticket slider; computed cost = (5 + 0.006t)/t (formula from deck text) |
| R24 | goc p27 | 3-column comparison / waterfall | ₱18,400 → own bank ₱17,050 (7.3%), SWIFT ₱17,980 (2.3%), corridor ₱18,290 (0.7%); arrival 1–5 days vs minutes | | Toggle rails; animate deductions |
| R25 | goc p14 | 2×2 scatter (trust × capability) | Positions are qualitative; plot approximate placements only, as labelled on slide (GoTyme high-trust/thin; Coins.ph, PDAX capable/untrusted; Binance far bottom-right; target top-right) | "Empty quadrant" | Hover a player to see the p13 row; arrow animates GoTyme → v2 target |
| R26 | goc p32 | Single time bar | USD → USDC ≈90 s → PHP vs a 5-hop correspondent chain | | Animate both rails racing |
| R27 | goc p2/p45–48 | Funnel / KPI pair | Phase 0 vs 2029 rows (landed, households, acquired, deposits, contribution) | Use corrected ₱85M / ₱1.5B | Toggle Phase 0 / 2029 |
| R28 | goc p40 | Progress bars | 95,000 → 130,000; 60%+; ₱10.1B | | Count-up |
| R29 | goc p38 | Two-bar split | FX ₱1,239M vs NIM ₱252M (per p48) | | Hover explains which line pays |
| R30 | goc p24 | Gantt-like build order | Custody (long pole) → Transfers (Receive first, then Send capped) → One corridor | qualitative lengths | Scroll reveals in order |

Rule for builders: every chart carries a source line `Source: [deck], p.N` plus a badge (`Company figure` / `Target` / `Backtest` / `Illustrative`), matching the deck's own honesty labels.

---

## 10. Proposed new case studies (summary)

1. **GoCrypto — "Digital assets as everyday finance"** (Strategy, July 2026, solo). Hook: "GoTyme wins accounts but loses balances." Visuals: R20–R30 plus the 5 concept screens. Gate: confirm with Thao that this can be public and how to describe its context.
2. **Guardline — AI fraud desk for SPayLater** (Sea × OpenAI Codex Hackathon Vietnam 2026, team lead). Visuals: R7–R9 plus the JSON verdict code block. No result is claimed.

## 11. Private / gating questions for Thao
1. Can COSAP and Lumicap deck content be published? (Both are marked confidential.) Can the Chong Wei / WAPS / Taiwan Steel names be used?
2. GoCrypto: what was the context (application case or self-initiated)? Is it OK to publish?
3. Official AABW track/award name: "Fintech", "GoTymeX AML/KYT", or "GoTyme Financial Services II"?
4. Did Guardline place?
5. Does she have a vector SkyLab wordmark?
6. Was her exact COSAP role on these decks (author/contributor) separate from the CV claim?

---
**Status:** DONE_WITH_CONCERNS
**Summary:** All 8 PDFs are extracted and rendered (154 pages). The GoCrypto concept screens are cropped at 4x. The media is converted (WebP/JPG, h264 full + muted loop + poster). SkyLab facts, wordmarks and screenshots are captured. There are 30 redraw specs, 2 new case studies are proposed, and the content deltas are listed.
**Concerns:** COSAP/Luminet decks are marked confidential. GoCrypto has stale numbers inside the deck (p22/p26/p38 vs appendix). There is a cosap3 p14 "5 days" vs "3 days" conflict. The AABW track name varies across sources. SkyLab has no vector logo and no extractable "by the numbers" figures. The decks contain no real product screenshots except GoCrypto p35.
