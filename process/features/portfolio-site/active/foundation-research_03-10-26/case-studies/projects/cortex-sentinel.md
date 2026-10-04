---
name: case-study:cortex-sentinel
date: 03-10-26
status: DRAFT (evidence-backed; confirm items at bottom)
---
# Cortex Sentinel — AML that scales like software, not headcount

**Hook:** A bank hands 6.5M people a crypto wallet and every transfer becomes a potential AML alert. We built the layer where analysts write rules in plain English, test them on live traffic before they ship, and a human still signs every real decision.
**Type:** Hackathon team project (AABW — Agentic AI Build Week, Round 1; GoTymeX AML/KYT track + Shinhan Securities Vietnam RegTech track). Repo: github.com/cortex-sentinel-az/setinel (public, created 2026-07-09). Source: `docs/demo/project-story.md`, `cortex-sentinel-pitch-brief.md`.

## Context / problem
- Alerts scale with volume, you cannot hire your way out, and one AML miss is a license event (source: project-story.md).
- Team's reframing: **detecting risk is the easy part; changing the rules, and proving it to a regulator, is the hard part** — every new typology means an engineer, a ticket and a blind deploy.
- Two real cases to force generality: GoTymeX (crypto VASP, Go Crypto launched Dec 2025 — their stated figure: 6.5M GoTyme customers) and Shinhan Securities Vietnam (wash trades, pass-through accounts, structuring below the 400M VND threshold, STR to SBV).

## Role (what the git history proves)
- Team build on the open-source **Marble** decision engine (Go backend + Remix/TS console). Upstream authors dominate the repo (Pascal Delange 162 commits etc.) — do NOT claim the engine.
- **Thao = 35 commits** (git author `itsjiathao0912`, +88k/-4k lines incl. generated/skill files) in two bursts: **2026-07-10 → 07-11** and **2026-08-13**. Teammate Thanh Ngo has 64 (47+17) commits, mostly backend/AI streaming/Shinhan seed.
- Thao's visible work: the **PM artifact stack** — AML research, 14-file user-story set (`docs/sentinel-user-stories`, ~11.6k lines), 7 PRD workflow mockups (case management, rule studio, disposition copilot, STR drafting, data, detection, cases), plus the **front-end reskin to the Sentinel green design system** (case queue + KPI row, case-detail hero + tabs, AI disposition copilot card, Detection sidebar section, analytics tiles, field editor), and the **pitch assets** (GoTymeX + Shinhan decks, elevator pitch, project story, Shinhan problem statement/demo guide).
- Pattern worth saying out loud: she specced it in mockups first, then implemented the UI to match ("mockup-parity" specs in docs/superpowers/specs).

## Approach
1. Research Vietnamese AML Law 2022, FATF Travel Rule (R.16), typologies; Vietnamese worked examples (`docs/AML-laws`).
2. User stories per capability (auth → STR/AI agent → analytics), then single-file clickable workflow mockups per feature.
3. Reskin Marble console to the mockups; wire the AI-copilot, evidence-pack and Travel Rule cards.
4. Honesty discipline for the pitch: every claim labelled **LIVE / PROTOTYPED / BACKTEST** ("judges reward teams that don't oversell").

## Key product features (from story/pitch brief)
- Plain-English rule authoring (agentic loop → rule AST, self-correcting; human saves/publishes).
- Versioned, shadow-tested rules, replayable to a regulator on any date.
- Three-lane triage: auto-clear / investigate / escalate; machine recommends, deterministic auditable gate decides; fails safe to review.
- Offline sanctions/PEP screening (OpenSanctions via yente), transliteration near-miss catching.
- Written rationale per disposition; pre-drafted STR/escalation memo.
- Multi-tenant per-vertical isolation: crypto and securities as separate tenants on one engine; securities typologies (`structuring_below_ctr` +50, `pass_through_account` +45, `wash_trading` +60, `third_party_funding` +40, `kyc_profile_mismatch` +50).

## Tech
Go, Remix/Node/TypeScript, Postgres/PostGIS, Elasticsearch, Redis, Docker Compose, Firebase auth emulator, Python/pandas data pipeline (IBM HI-Small AML: 50k txns/~70k accounts; Elliptic++ 203k BTC txns/822k wallets; synthetic IVMS101 Travel Rule msgs), LightGBM/scikit-learn/SHAP, LLM orchestration with AG-UI SSE streaming.

## Outcomes (sourced, with labels)
- **BACKTEST on seed data, not production:** 6.5% of alerts auto-closed with 0 escaped true positives on the resolved corpus; baseline rules 100% recall / 18.1% precision; at held 90% recall, FPs −20.3% and manual review −18.4% (project-story.md). Ground-truth labels stripped before ingestion.
- Pitch-brief quotes a "−186" backtest figure (meaning to confirm).
- Competition result: **none found in repo** → `[NEEDS: AABW Round 1 result / placement]`.
- Scope indicators (not outcomes): 14 user-story docs, 7 PRD mockups, 2 tenants, 2 decks, 5 detection typologies for Shinhan, 5+ crypto typologies.

## Visuals available (research-private, local-only)
- Own PM mockups: `../../research-private/media/projects/cortex-sentinel/mockup-*.png` (case-management, rule-studio, disposition-copilot, str-drafting, sentinel-data, detection). NB: mockups use fictional persons/cases (e.g. CASE-2026-0417).
- Shipped UI shots: `detection-nav-live.png`, `detection-decisions-no-tabbar.png`, `analytics.png`, `data-model.png`.
- Decks: `deck-gotymex.png`, `deck-shinhan.png`, `pitch.png`; **videos:** `flow-gotymex-deck.webm` (9-slide walkthrough), `flow-disposition-copilot-mockup.webm` (7-step mockup flow, large 12MB).
- Note: `detection-nav-live.png` shows upstream Marble demo data (jbe@zorg.com, German/French SEPA) → crop/replace before publishing.

## Suggested designed visuals
1. "Recommend vs decide" diagram: LLM/scorer → deterministic gate → human signature, with the fail-safe path to review.
2. Three-lane triage funnel (auto-clear / investigate / escalate) with reason-code chips.
3. One-engine-two-tenants architecture (crypto VASP vs securities) with shared AST rule layer.
4. LIVE/PROTOTYPED/BACKTEST honesty-label legend as a design motif.
5. Mockup → shipped UI side-by-side (parity story).

## Pull-quote-worthy insights (from the team's own docs; Thao to confirm authorship)
- "In AML, the bottleneck is governance, not detection."
- "Let intelligence recommend, but let a deterministic, auditable rule decide."
- "The domain lives in data and rules, not in code" — a new asset class became a new tenant, not a new codebase.
- "'We don't know' is a feature": fail closed to review; never auto-close anything touching sanctions or an incomplete Travel Rule.

## Facts to confirm with Thao
- Exact role title on the team (PM? design lead?) and which decks/mockups she authored vs teammates.
- AABW result; team size and names; event dates (commits suggest 07-09 → 07-13, plus 08-13 doc move).
- OK to name GoTyme and Shinhan Securities publicly (problem statements, not clients)? Any hackathon IP rules?
- Meaning of the "−186" figure; whether 6.5%/0 TP can be quoted as backtest on public datasets.
- Is the repo public intentionally (it contains playbook PDFs from the organiser)?
- Whether to credit Marble prominently (recommended).
