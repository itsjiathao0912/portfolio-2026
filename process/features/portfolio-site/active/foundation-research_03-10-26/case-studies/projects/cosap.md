---
name: case-study:cosap
date: 03-10-26
status: DRAFT (thin evidence)
---
# COSAP — an AI-powered ERP for Korean SMBs, specified across markets

**Hook:** An affordable SAP alternative where a Vietnamese employee justifies a Korean card expense in Vietnamese and the Seoul approver reads it in English: the work is translated, not just the menu.
**Employer:** SkyLab Group. Live: https://cosap.ai (public landing). Sources: her CV copy; public site text (`../../research-private/media/projects/cosap/_page-text.txt`); `ledgr-webapp/z.ledgr/cosap-compliance-overview.md`.

## Context / problem
Multi-country SMBs handle labour law, tax, ledger integrity and personal data in silos; "generic tools have no opinion" (compliance overview). Korean and Singaporean clients had different requirements.

## Role (CV)
Primary PM for cross-market requirement gathering across Korean and Singaporean clients; led product design across **8 modules**. `[NEEDS: which 8 modules; her specific modules; # clients]`

## What the public site shows (company-side)
- Positioning: "Corporate Operational Situation Awareness Platform"; finance, HR, inventory, approvals, AI analytics, CRM; verticals Vantage (project intelligence) and Forge (manufacturing); Telegram mini-apps ("18 mini-apps", "6 core modules"); multi-tenant isolation; 3-tier AI engine; content-level translation EN/KO/VI/ZH.
- Marketing stats (company claims, not hers): 60% reduced review time, 24hr risk detection, 40% fewer inquiries.
- Compliance overview (internal-looking doc in her repo): 3 pillars (Workforce, Tax, Data Privacy), 45+ rules, 4-tier resolution engine (Country law, Company, Group, Individual), 4 jurisdictions (KR, VN, SG, TW), PII inventory across 274 tables / 563 columns. `[NEEDS: did she author/specify this?]`
- Tech (CV): multi-tenant SaaS, Toss Payments, Lago (billing), RAG pipelines, LLM orchestration.

## Discrepancy to resolve
Her CV says 8 modules; the site says 6 core modules / 18 mini-apps / 3 verticals. Define "module" before publishing.

## Outcomes
None sourced as hers. `[NEEDS: clients live, customers, adoption, her measurable result]`

## Visuals
`../../research-private/media/projects/cosap/landing-desktop.png`, `landing-mobile.png`, `flow-landing-scroll.webm` (public marketing page). `[NEEDS: sanitized module UI, approval flow, translation-flow screens]`

## Suggested designed visuals
1. The "one transaction, two languages" flow (Linh VI / Kim EN), a ready-made hero story.
2. Module map: core vs verticals vs API.
3. 4-tier rule resolution ladder with clamp-to-law.
4. Cross-market requirements matrix KR vs SG (needs her data).

## Pull-quote-worthy insights (public copy, attribute carefully)
"Most apps translate the menu. COSAP translates the work." Her own quote needed.

## Facts to confirm with Thao
Module list; client constraints and NDAs; Toss/Lago decisions she made; her part in compliance engine; link to Ledgr (see ledgr.md).
