---
name: report:content-inventory
description: "Inventory of Thao Dao's existing portfolio content (identity, experience, projects, skills, certs, awards), the old colour palette, assets, and content gaps. Seed source for the new site."
date: 03-10-26
metadata:
  node_type: memory
  type: report
  feature: portfolio-site
  phase: foundation-research
---

> Source: the user's own prior portfolio (repo itsjiathao0912/portfolio, HEAD 6f9d917). Content is the user's own and is kept in full. Screenshots of the old site: `research-private/old-portfolio/` (local-only). The cloned repo is not copied.

# Old portfolio inventory (content + colour source)

Repo: itsjiathao0912/portfolio (cloned to ./repo, HEAD 6f9d917). Live: https://portfolio-wine-eight-54.vercel.app/
Screenshots (desktop 1440, full page): `research-private/old-portfolio/shot-{home,work,projects,experience,about,contact}.png`
Stack of old site: Next 16, React 19, Tailwind 4, MDX loader (gray-matter), zod, lucide, Vercel analytics. Pages: / /work /projects /experience /about /contact, /work/[slug] (case-study MDX, NONE published).
Text sources: content/*.ts (all quoted below), CV PDF at repo/public/thao-dao-cv.pdf (137 KB, 2 pages, same content).

## 1. Content inventory (seed-ready)

### Identity
```json
{
 "name": "Thao Dao", "nameLocal": "Gia Thảo",
 "title": "Technical Product Manager",
 "disciplines": ["System Integration", "Agile Process"],
 "heroHeading": "GM, I'm Thao.",
 "heroEyebrow": "Ho Chi Minh City, Vietnam · Available for product roles",
 "tagline": "I turn ambiguous business problems into shipped software — billing engines, on-chain ledgers, and ERP modules that hold up in regulated markets.",
 "summary": "Technical Product Owner with 4+ years of experience delivering complex B2B SaaS platforms across finance operations, cloud, and blockchain. Strong background in end-to-end project delivery, requirements analysis, process mapping, and cross-functional delivery. Proven ability to translate business needs into clear functional workflows and software requirements, ensuring on-time and scalable delivery.",
 "location": "Ho Chi Minh City, Vietnam",
 "email": "giathaowork@gmail.com",
 "phone": "(+84) 776 861 068 (on CV only; showPhone=false on site)",
 "linkedin": "https://www.linkedin.com/in/thaodao0912/",
 "github": "https://github.com/itsjiathao0912",
 "cv": "/thao-dao-cv.pdf (download name Thao-Dao-Technical-Product-Manager.pdf)",
 "contactPitch": "Hiring for a product role, or want to talk through a delivery problem?",
 "contactLede": "Open to product roles and to conversations about delivery, billing systems, or getting regulated products out the door.",
 "workLede": "Three platforms owned end-to-end, and the features shipped along the way."
}
```
No photo/avatar anywhere on the old site (only a favicon SVG: white A-line-bob figure with laptop on #2563eb rounded square).

### Experience (most recent first)
1. **SkyLab Group** (https://www.skylabteam.com/) — Technical Product Manager — 03/2025 — Present (current). Domain: Cloud · Blockchain · Enterprise AI.
   Summary: "Drove product implementation across multiple initiatives spanning cloud services, blockchain, and enterprise AI SaaS — from requirements definition through to launch."
   Bullets:
   - "Leading product design across 8 modules for an AI ERP platform targeting SMEs, acting as the primary PM for cross-market requirement gathering across Korean and Singaporean clients."
   - "Delivered an investor-facing product across 6 modules for a blockchain-based RWA investment platform, translating complex tokenization workflows into intuitive interfaces for non-technical investors."
   - "Designed and shipped a cost monitoring dashboard and payment reconciliation workflows for a cloud-service-provider billing platform, standardizing pricing logic across 4 cloud providers (AWS, Azure, Huawei, Alibaba Cloud) to eliminate inconsistencies in invoicing and cost attribution."
   Highlight: "Primary PM across three concurrent platforms in regulated and pre-launch markets."
2. **ReOrc AI** (https://reorc.com/) — IT Business Analyst — 04/2024 — 03/2025. Domain: Enterprise Data Platform.
   Summary: "Drove the development of an enterprise data platform by structuring governance, workflows, and validation processes to improve data reliability and delivery efficiency."
   Bullets:
   - "Conducted benchmarking analysis of enterprise data platforms to design governance and access-control frameworks, improving compliance and decision reliability."
   - "Designed and launched data modeling and lineage features that enabled business users to trace data origins and dependencies, reducing reporting ambiguity and strengthening trust in analytics outputs."
   - "Improved development efficiency by reducing rework by 40% and accelerating feature delivery by 20% through clearer requirement frameworks and validation checkpoints."
   - "Led user acceptance testing by designing functional and data validation scenarios, ensuring accurate reporting outputs prior to release, at a 95% first-pass success rate."
   Highlight: "40% less rework, 20% faster feature delivery, 95% first-pass UAT."
3. **Zalo** (https://zalo.me/vi/) — Product Owner — 02/2023 — 04/2024. Domain: Consumer · Messaging & Games.
   Summary: "Owned roadmap and performance optimization for digital products within Vietnam's leading messaging platform."
   Bullets:
   - "Owned roadmap and delivery execution for 1 new product launch and 4 existing products, coordinating multiple cross-functional teams across engineering, design, and data."
   - "Led and collaborated with designers and developers to refine and actualize concepts from design documentation."
   - "Developed and implemented a tracking dashboard for Zalo Game Center, reducing manual data extraction by 40% and improving data-driven decision-making."
   - "Optimized in-game ad placements through A/B testing, increasing total ad revenue by 30% within six months."
   - "Led optimization efforts by executing monthly in-game events, boosting user engagement by 15% and increasing paying users by 3%."
   Highlight: "30% ad revenue uplift and 15% engagement lift on a national-scale consumer product."
(Code TODO: earlier roles Chợ Tốt and MoMo existed in the old Notion Workfolio but were omitted as unverifiable; Notion had identical bullets for both -> one wrong. Also Creatio Marketing Club leadership roles + hobbies existed in Notion, not on site.)

### Flagship projects (all at SkyLab Group) — only thin summaries exist, no case studies
```json
[
 {"slug":"lumicap","name":"Lumicap","url":"https://lumicap.io/","kind":"Blockchain RWA Investment Platform","status":"Shipped · pre-launch","company":"SkyLab Group","role":"Led the build; owned crypto core","year":"2025",
  "summary":"Led the build of a platform that turns real-world assets — GPU and compute capacity — into on-chain investment funds.",
  "ownership":"Owned the crypto core: digital-asset custody via multisig wallets, an on/off-chain ledger with USDC settlement, and fund management with NAV tracking and a clear transaction history.",
  "tech":["Multi-chain / EVM","ERC-20","USDC","Privy","HashiCorp Vault","Arweave"],
  "metrics":"6 modules (investor-facing product); problem/process/outcome: NOT WRITTEN"},
 {"slug":"cosap","name":"COSAP","url":"https://cosap.ai/","kind":"Multi-tenant B2B ERP AI SaaS","status":"Regulated · Korea","company":"SkyLab Group","role":"Primary PM, cross-market requirements (Korea + Singapore)","year":"2025",
  "summary":"Own product for an AI-powered ERP built as an affordable SAP alternative for Korean SMBs, spanning accounting, legal compliance, and payroll.",
  "ownership":"Primary PM for cross-market requirement gathering across Korean and Singaporean clients, leading design across 8 modules.",
  "tech":["Multi-tenant SaaS","Toss Payments","Lago","RAG pipelines","LLM orchestration"],"metrics":"8 modules"},
 {"slug":"pac","name":"PAC","url":null,"kind":"Cloud Service-Provider Billing Platform","status":"Cloud · Multi-tenant SaaS","company":"SkyLab Group","role":"Owned billing domain end-to-end","year":"2025",
  "summary":"Own the billing for a cloud platform selling compute, storage, and network services to tenants across multiple regions.",
  "ownership":"Owned the billing domain end-to-end: usage metering, multi-currency pricing, invoices, credit notes, and revenue dashboards. Specified API-heavy integrations that turn multi-service usage into accurate tenant invoices.",
  "tech":["Cloud resource usage metering","Multi-currency","API-first integration"],"metrics":"4 cloud providers (AWS, Azure, Huawei, Alibaba) pricing standardised"}
]
```
Case-study MDX template (unused example, draft) hints a planned case: "Standardising pricing across four cloud providers" slug `pac-pricing-standardisation` — "How inconsistent provider pricing models were reconciled into one billing engine without breaking existing tenant invoices." tags Billing/Cloud/Multi-tenant SaaS; metrics "4 Cloud providers unified", "0 Invoice regressions at cutover". Template sections: Context / My role / Constraints / What I did / Outcome / Retrospective. (Example metric "0 regressions" is a placeholder, not verified.)

### Personal projects (GitHub)
- **Ledgr** — Labour & Payroll Compliance Copilot — status "Live · Vietnam". Summary: "A compliance copilot for the one person who wears every hat at a 10–50 person Vietnamese company — HR, ops, and payroll at once." Detail: "Checks payroll, BHXH, personal income tax, contracts, and overtime against current Vietnamese labour law, then explains what is wrong and how to fix it — in Vietnamese. Built for the reality that most SMBs here cannot afford a compliance specialist." Tech: Next.js (App Router), TypeScript, Supabase, Anthropic Claude SDK, Tailwind + shadcn/ui, next-intl. Repo https://github.com/itsjiathao0912/ledgr-webapp ; app https://ledgr-webapp.vercel.app
- **Cortex Sentinel** — Open AML & Transaction Monitoring Platform — "Open source · self-hosted". Summary: "Compliance operations infrastructure a bank can actually run on its own infrastructure: real-time transaction monitoring, sanctions and PEP screening, and one case manager to investigate what it flags." Detail: "My work is the product and console layer — the detection navigation, the case-management workspace, and an AI triage copilot that proposes a disposition with its rationale and evidence rather than a bare score. Demoed against a Vietnam-market scenario with Travel Rule and STR-derivation flows." Tech: Go, React, PostgreSQL, Elasticsearch + yente, OpenSanctions, Docker Compose. Repo https://github.com/cortex-sentinel-az/setinel

### Shipped features (stat cards; derive from roles, not separate evidence)
| feature | company | blurb | metric |
|---|---|---|---|
| Cost Monitoring Dashboard | SkyLab Group | Unified cost attribution across AWS, Azure, Huawei, and Alibaba Cloud. | 4 cloud providers |
| Payment Reconciliation | SkyLab Group | Reconciliation workflows that close the gap between metered usage and issued invoices. | — |
| Tokenization Workflows | SkyLab Group | Investor-facing flows that make on-chain fund mechanics legible to non-technical investors. | 6 modules |
| AI ERP Module Suite | SkyLab Group | Accounting, legal compliance, and payroll for Korean SMBs, designed cross-market. | 8 modules |
| Data Lineage | ReOrc AI | Let business users trace data origins and dependencies, cutting reporting ambiguity. | — |
| Data Modeling & Governance | ReOrc AI | Governance and access-control frameworks benchmarked against enterprise data platforms. | 95% first-pass UAT |
| Game Center Tracking Dashboard | Zalo | Replaced manual reporting for Zalo Game Center with a self-serve tracking surface. | 40% less manual extraction |
| Ad Placement Optimization | Zalo | A/B tested in-game ad placement across the Game Center portfolio. | 30% revenue uplift |
| In-Game Event Programme | Zalo | Monthly event cadence driving engagement and conversion to paying users. | 15% engagement lift |

### Skills
- Product Management: Product Research (Market & User), Project Management, Stakeholder Management
- Business Analysis & System Design: Requirements Gathering, User Stories, Process Mapping (UML, Flowcharts)
- Technical & Integration: Cloud Economics, Blockchain & Real Asset Tokenization, API Integration, Multi-tenant SaaS Architecture, Microservices Architecture, RAG Pipelines & LLM Orchestration
- Tools: A/B Testing, SQL (MySQL), Claude Code, Figma, Jira & Confluence

### Certifications (with verify URLs)
- AWS Solutions Architect — Associate (SAA), Amazon Web Services — https://www.credly.com/badges/f3ac566b-00b7-430d-a173-01598599a1fc/linked_in_profile
- Oracle Cloud Infrastructure Architect — Associate, Oracle — https://catalog-education.oracle.com/ords/certview/sharebadge?id=445D54D5319194913439A1D1E242F1B5EEB53EB181704B72003AE517E3ACC8FF
- Google Data Analytics, Google — https://www.coursera.org/account/accomplishments/specialization/QMBBEBUCPON6
### Education
- Foreign Trade University — Bachelor's in International Trade (Major in Economics and Logistics) — 2019 — 2023
- MindX Technology School — Product Management (software development, product design, product discovery, user research, wireframing) — 2023
### Awards
Youpreneur Launchpad start-up contest — Runner-up, 2021 · Business Hackathon — Top 15 of 300+ teams, 2021 · Hành trình kinh doanh — Top 40 of 1,000+ teams · VNG Gaming Challenge — Top 10 · Khởi nghiệp Kawaii — Top 15

## 2. Colour palette (from app/globals.css; live site matches)
Single accent. Note: the old site is NOT navy — it is warm off-white paper + near-black ink + one royal blue (#2563eb, Tailwind blue-600). Navy/dark-blue appears only in the CV PDF (titles/links ~#0b4db8-ish blue, rendered from the CV, not in code).

| token | light hex | dark hex | used for |
|---|---|---|---|
| paper | #fafaf9 | #0b0c0e | page background |
| paper-raised | #ffffff | #131417 | raised cards/panels |
| ink | #0b0c0e | #fafaf9 | text, headings |
| hairline | #e4e4e7 | #27272a | borders, dividers (1px rules, divide-y) |
| muted | #71717a | #a1a1aa | labels, secondary text, dates |
| accent | #2563eb | #60a5fa | status text, period dot in "Thao.", primary button bg, links underline, focus ring, selection |
| accent-contrast | #ffffff | #0b0c0e | text on accent |
Favicon also uses #2563eb + white.
Fonts: IBM Plex Sans 400/500/600 (body/headings) + IBM Plex Mono 400/500 (labels, dates, metrics, buttons; uppercase tracking 0.14em, 11px). Chosen for Vietnamese diacritics (latin, latin-ext, vietnamese subsets). Layout: hairline-ruled sections, numbered "01 / PROFILE" mono labels, square corners (no radius), hero h1 up to 8xl semibold tracking-tight, 180ms underline-grow link hover, reveal-on-scroll 200ms, dark-mode toggle.

Proposed light-theme mapping (white base, navy/blue accents) for new site:
| role | hex | note |
|---|---|---|
| background | #ffffff | (old #fafaf9) |
| surface/subtle | #f8fafc | slate-50 for alt sections |
| ink / body | #0f172a | navy-tinted near-black (old #0b0c0e) |
| heading-strong / navy | #0b1f4d (suggest) or #1e3a8a (blue-900) | new: primary navy for hero/footer/headings accents |
| accent (primary) | #2563eb | KEEP, brand continuity |
| accent-hover | #1d4ed8 | blue-700 |
| accent-soft bg | #eff6ff | blue-50 tags/status chips |
| accent-on-dark | #60a5fa | old dark accent, use on navy bands |
| hairline | #e2e8f0 | slate-200 (close to old #e4e4e7) |
| muted | #64748b | slate-500 (old #71717a) |
| accent-contrast | #ffffff | |

## 3. Assets
Repo has almost nothing to migrate:
| path | size | format | note |
|---|---|---|---|
| public/thao-dao-cv.pdf | 137,574 B | PDF, 2 pages | resume; keep as download |
| app/icon.svg | ~0.7 KB | SVG | favicon, blue square with bob-hair figure + laptop; could be reused/refined |
No project screenshots, covers, logos, headshot, OG image, or any raster images exist. Company logos (SkyLab, ReOrc, Zalo, Lumicap, COSAP) not stored. Product shots must come from live sites (lumicap.io, cosap.ai) or new captures.

## 4. Missing / thin for a case-study site
- ZERO written case studies (content/work/ holds only a draft template). Notion "Portfolio" db was empty too.
- Per-project problem / process / decisions / outcome / metrics / timeline / team — absent for Lumicap, COSAP, PAC. Only 1–2 sentence summaries + tech lists. Several numbers are role-level (6 modules, 8 modules, 4 providers) not outcome metrics; Lumicap/COSAP/PAC have no business outcomes (users, revenue, time saved).
- No images at all: no screenshots, flows, wireframes, diagrams, mockups, process artifacts (PRDs, UML, flowcharts she lists as skills). No headshot.
- Years for projects not stated (inferred 2025 from role dates). PAC has no URL; COSAP/Lumicap URLs only.
- Earlier roles Chợ Tốt and MoMo, Creatio Marketing Club leadership, hobbies — in old Notion, not carried over; MoMo/Chợ Tốt bullets conflicting.
- Zalo, ReOrc work has no case-study depth either (strongest metrics live there: +30% ad revenue, -40% rework, 95% UAT, +15% engagement, +3% payers) — good candidates for case studies since numbers exist.
- Personal projects (Ledgr, Cortex Sentinel) have no screenshots/outcome; Cortex Sentinel repo is under another org.
- No testimonials/recommendations, no talks/writing, no Vietnamese-language copy (site is EN only; Vietnamese titles only in awards).
- NDA/confidentiality: SkyLab client work in regulated markets; need decision on what can be shown publicly.
- Phone hidden by design (showPhone=false); confirm before showing.

**Status:** DONE
