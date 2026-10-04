---
name: case-study:ledgr
date: 03-10-26
status: DRAFT
---
# Ledgr — a second pair of eyes on Vietnamese payroll, tax and contract paperwork

**Hook:** Founders outsource their books but still carry the fine. Ledgr reads the documents an SME already has, checks them against current Vietnamese law, and explains what is wrong and how to fix it, in plain Vietnamese.
**Type:** Product built in a five-day commit burst (80 commits, 2026-06-16 to 06-20). Live: https://ledgr-webapp.vercel.app · repo itsjiathao0912/ledgr-webapp (80 commits, 2026-06-16 → 06-20; commit authors `thaodao`, `giathaowork`, `itsjiathao0912` = same person per her CV email; confirm).

## Context / problem
- Vietnam governs by a stream of decrees (min wage, BHXH rates, OT caps, PIT). A multi-hat HR/Ops person at a 10-50 person company inherits this without being a specialist (source: `z.ledgr/vietnam-gtm-brief.md`).
- Customer-discovery plan built on The Mom Test (`z.ledgr/ledgr-discovery-plan.md`), with explicit assumption tracking. Round 1 used ~11 founder Facebook posts: founders' loudest pain was tax/books/fines, not payroll → H1 (labour wedge) **challenged**, new H3 "accountant-accountability gap" added. Her positioning then moved from "labor checker" to "AI compliance copilot, employment-first depth, broad brand" (spec dated 2026-06-20).

## Role
Everything: strategy and discovery plan, lean canvas / GTM brief, positioning spec, UX prototype → feature spec, architecture, implementation (with Claude Code), tests, deploy. `[NEEDS: confirm solo + AI-assisted build wording]`.

## Approach
1. **Discovery first:** recruit scripts for HR / founder / accountant in Vietnamese; segment by size band, tooling (MISA/Base/Excel), who-does-the-books staircase.
2. **Competitive map of 9 players** (`docs/platform-research`): MISA calculates but does not advise; AI Luat/LuatVietnam answer law questions, not "is MY document OK"; Kyta is enterprise CLM; Justee (US) validates no-signup freemium.
3. **Two-speed architecture** (`docs/compliance-architecture-reference`): deterministic rule engine decides (no LLM), LLM only extracts facts and narrates. Tiered rules: statute (floor/cap) < company < group overrides, then clamped to law, so "no org can configure itself out of compliance."
4. **Sequenced phases** (git): auth/RLS org schema (06-16) → rule registry + engine (06-17) → upload, caching, saved docs → multi-doctype + law crawler (Firecrawl + Qwen) (06-18) → cross-document consistency check, calendar, templates (06-18/19) → marketing site, Review Cockpit, anonymous free review, VI/EN switcher (06-19/20).

## Key features (with screenshots)
- Upload a labour, BHXH or tax document → findings with law citations, severity, AI redline, accept-all, DOCX export (two-pane Review Cockpit).
- **9 document types** (code: DOC_TYPE_LABELS): labour contract, PIT finalization, monthly PIT, VAT, e-invoice, service contract, sale contract, liquidation minutes, accounting voucher.
- **Cross-document check** (payroll vs BHXH vs PIT vs contract must reconcile) — positioned as the moat.
- Anonymous free review (no login), content-hash result caching, re-check on rule change, law library drawer, compliance calendar, template library.
- Vietnamese-default i18n, privacy line "PII masked before processing; your data is not used to train AI" (landing copy; verify technically).

## Tech
Next.js 16 App Router + TypeScript, Tailwind + shadcn/ui, Supabase (Postgres + RLS), Anthropic SDK + OpenAI-compatible Qwen gateway, next-intl, docx/mammoth/pdf-parse, Vitest (26 test files) + Playwright (9 e2e specs). Scope: ~18k lines app code, 10 SQL migrations.

## Outcomes (sourced only)
- Shipped and live (200 OK 2026-10-03); 9 doc types; cross-check engine; anonymous funnel.
- Landing claims "100+ quy dinh phap luat" (src/messages/vi.json) while seed migrations contain only ~15 rule inserts → **do not repeat 100+ publicly until verified**.
- Pricing page: Free / Pro 299,000 VND / Business 799,000 VND (pricing ladder, not revenue).
- Users, revenue, interviews completed: **none in repo** → `[NEEDS: # discovery interviews done, any pilot users, feedback]`.

## Visuals available
`../../research-private/media/projects/ledgr/`: home/pricing/ket-qua/hop-dong-lao-dong/login desktop 1440 + mobile 390 (full page), `free-review-modal-desktop.png`, video `flow-landing-to-free-review.webm`. Public screens only; the Review Cockpit and dashboard are behind login (not captured). `[NEEDS: Thao to export Review Cockpit / findings screens, or allow a seeded test account — repo has seed:mock script]`. Also source for diagrams: `docs/feature-suggestions/ledgr-prototype.html`, `check-redesign-mockup.html`.

## Suggested designed visuals
1. Pipeline diagram: upload → extract (LLM) → resolve (T3 group / T2 company / T1 law, clamp) → engine (deterministic) → narrate (LLM) → persist.
2. "Wedge shift" timeline: H1 payroll → field evidence → H3 accountant gap → repositioned copilot.
3. Competitor whitespace matrix (calculates vs answers law vs checks your doc).
4. Doc-type constellation showing the cross-check links.
5. Penalty-anchor card (landing cites 50-150 million VND exposure; verify source).

## Pull-quote-worthy insights
- "Discover broad; choose the wedge from evidence."
- "A company can be stricter than the law, never weaker."
- "MISA calculates; Ledgr advises."
- She tested her own hypothesis and let it lose: H1 challenged by Facebook-post evidence.

## Facts to confirm with Thao
- Solo or helped? Any real users/pilots/interviews? Is it still active or paused?
- Legal-sourcing process for rule packs (who reviewed? lawyer?). Real Vietnamese-law data/penalty figures: sources.
- Is "100+ rules" true; is the PII masking implemented as claimed?
- Relationship to COSAP: the LLM gateway is llm.cosap.ai and `z.ledgr/cosap-compliance-overview.md` (45+ rules, 4 jurisdictions, 4-tier engine) mirrors Ledgr's tier model. Was Ledgr a spin-out of COSAP compliance work she did at SkyLab? (Employer-IP and disclosure question.)
