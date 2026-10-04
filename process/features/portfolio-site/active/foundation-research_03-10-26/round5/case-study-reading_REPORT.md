---
name: report:case-study-reading-round5
description: "Per-case-study proposals to make the 9 project pages more interactive and insightful, built only from Thao's own decks, repos and media. Includes cross-cutting reading aids and a top-15 ranked by impact/effort."
date: 03-10-26
metadata: {node_type: memory, type: report, feature: portfolio-site, phase: foundation-research}
---

# Case-study reading experience, round 5 (2026-10-03)

**Bottom line**
- Every page currently follows the same pattern: Overview → metrics strip → one chart → "what shipped" steps → stack. Readers see a list of claims, not a decision being made. The fix is to give each page **one moment where the reader makes the decision she made**, using data from her own decks.
- The strongest material is in **Cortex (deck p6–p19), GoCrypto (p6–p48, 5 phone screens), COSAP (cosap3 p13–17, cosap7 p18) and Lumicap (lhow p6–p9)**. These four pages can become genuinely interactive. Guardline and Ledgr are already partly there.
- **Zalo, PAC and ReOrc have no visuals and only CV numbers.** Don't fake interactivity there. Use one honest explanatory toy each, labelled "illustrative", and keep the pages short.
- Most ideas reuse existing components in `src/components/dataviz/` (`score-ladder`, `explorable`, `scrub-timeline`, `compare-slider`, `before-after`, `funnel`, `flow-diagram`). Only 4 new components are needed: threshold slider, corridor calculator, typed-form micro-demo, and decision card.
- Never-invent rule applies throughout. Flags are marked ⚠ below.

Sources: `round3/materials_REPORT.md` (deck cites as `[deck pN]`; rendered pages in `research-private/materials/<deck>/pages/pNN.png`), `round3/visuals_REPORT.md` (captures in `research-private/round3/visuals/`), `user-decisions_NOTE_03-10-26.md`, `case-studies/**`, `content/projects/*.ts`. Live page check: `/work/cortex-sentinel`, `/zalo-game-center`, `/pac` all return 200. Full-page screenshots are in `research-private/round5/reading/{cortex-sentinel,zalo-game-center,pac}.png`.

Effort key: **S** = content/config change on an existing component, under half a day. **M** = new prop or variant of an existing component, about 1 day. **L** = new component, 2+ days.

---

## Cross-cutting reading aids (apply to all 9)

| Aid | What it does | Build | Effort |
|---|---|---|---|
| **Depth toggle "30 s / 3 min / deep dive"** | Sticky pill under the hero. 30 s shows hero + core insight + Results moment. 3 min adds the arc and one interactive. Deep dive shows everything (sources, stack, appendix). | Tag each block with `depth: 1/2/3` in the content schema and hide via CSS. No duplicate copy. | M |
| **Role badge ("I owned / Team")** | A two-colour band on the module maps and flows: solid = Thao owned it, outline = team or platform. Cortex is the clearest case: deck p20 says "AI rule-gen & versioning are platform capabilities we build on; the adaptive-triage layer is our hackathon contribution". | Add an `owner: "me" \| "team" \| "platform"` field on `module-map` / `flow-diagram` nodes. | S–M |
| **Decision cards** | One card per real trade-off: "Option A vs B → chose B because… → cost accepted". Flip to see the rejected option. Max 2 per page. | New `decision-card.tsx`. | M |
| **Glossary hovers** | Dotted underline on AML, KYT, STR, VASP, multisig, NAV, TGE, BHXH, PIT, 90+ dpd, ADB, NIM, OFW, UAT. One shared `content/glossary.ts`; definitions written once. | New `term.tsx` (popover). | S–M |
| **Evidence badge** (already partly present) | Standardise to 4 labels: `Live`, `Backtest · seed data`, `Target`, `Company figure`. Cortex p17 already uses live / prototyped / backtest, so copy that language. | Existing `badge` prop; enforce the enum. | S |
| **Results signature moment** | Same closing block on every page: a dark full-width band, 1–3 numbers counting up, each with its evidence badge and a one-line "what this means", followed by "What I'd do next" (one sentence). Zalo, PAC and ReOrc get the same frame, so thin pages still end strong. | Variant of `metrics` (`variant: "results"`). | M |
| **Sources drawer** | Collapse every `source:` caption into a numbered footnote that opens a side drawer. Keeps charts clean; keeps the honesty. | M | |

---

## 1. Cortex Sentinel (`cortex-sentinel`)

**Core insight:** compliance can scale like software, not headcount, if the AI explains every alert it closes and never lets a real threat escape.
**Arc:** analysts drown in false alerts (p2–p3) → tension: auto-closing is dangerous in AML → decision: score with transparent rules, auto-clear only pure noise *with written rationale*, keep humans on everything else → outcome: 6.5% auto-cleared, 0 escaped true positives on 2,000 cases (backtest), 2nd place AABW Fintech track.

**Interactive moments**
1. **"Be the analyst": threshold slider.** Reader drags the auto-clear threshold from 0.15 to 0.49. Counters show "−186 reviewed per period" and "0 escalations lost". Source: cortex p9, p17 (spec R6). ⚠ visuals_REPORT says the meaning of "−186" is unconfirmed: **confirm with Thao before shipping**; until then show only the 0 → 0 escaped line. Build: new `threshold-slider.tsx` (reuse `scale.ts`). **M**
2. **Fire the rules (already exists as `scoreLadder`).** Upgrade: preload the deck's structuring example (p8, +45 → review band) and add a "why" line per band from p19 (<30 approve · 30–79 review · 80–99 block · ≥100 decline). **S**
3. **Watch the agent fix itself.** Animated loop: Generate → Validate → invalid → retry (up to 3×) → analyst commits. Source: p6 (spec R4). Build: `flow-diagram` with a looping token. **S–M**
4. **Shadow test, live vs candidate.** Existing `stackedBar` (71/19/7/3, p7). Add a ghost outline for "v1 live" and the label "demo". **S**
5. **Status-filtered architecture.** L1–L5 layers with LIVE / PROTO / DESIGN chips; click a chip to filter (p14, p17). This makes the honesty visible rather than buried. Build: `module-map` + filter. **M**

**Cut/merge:** the `funnel` (three-lane triage) and the `beforeAfter` (manual review load) tell the same story as the slider. Merge them into the slider. Do not show "≥ 90% noise" (p10) next to 6.5% (p1); the materials report flags the conflict.
**Decision card:** "Black-box ML score vs transparent rules + AI rationale → chose rules, because regulators need to audit why an alert closed."
**Media:** hero ambient loop `media/demo-judging-loop-muted.mp4` + `demo-judging-poster.webp`; Results band `gotyme-track-winners-stage.webp`; "Demo day" section `pitching-judges.webp`, `hackathon-floor.webp`. Product crops from `round3/visuals/local/cs-rule-studio`, `cs-disposition-copilot` **only after blurring the fictional name columns**.
⚠ Track name: user-decisions says "Fintech track, 2nd place"; the stage photo says "GOtyme Financial Services II Track Winners". Use the user-decisions wording in copy.

---

## 2. GoCrypto (`gocrypto`) — flagship strategy piece

**Core insight:** crypto doesn't earn its keep through trading; it earns it as the rail that brings remittances home and keeps them on deposit.
**Arc:** GoTyme wins accounts but trails Maya on deposits per customer (₱4,778 vs ₱6,335, p6) → tension: trading even at 10× closes only 13.9% of the ₱4.0B gap (p11, p44) → decision: build custody → receive → send → one capped Gulf corridor for OFW families → outcome: Phase 0 ₱85M contribution, ₱1.5B at scale 2029 (p47–p48; **use p48**, not the stale p22/p38 figures).

**Interactive moments**
1. **"Can trading close the gap?" slider.** Reader drags trading volume 1× → 3× → 10×; a bar fills against the ₱4.0B gap and stalls at 1.9% / 5.1% / 13.9%. The point lands without prose. Source: p11, p44. Build: `bar-chart` with a stepped control. **S–M**
2. **Ana's transfer calculator.** Reader picks a ticket size ($150 / $317 / $1,000) and sees what arrives via own bank, GoTyme SWIFT, and the corridor. Fee-curve data from p21 (3.9% / 2.3% / 1.1%); Ana's case from p27 (₱17,050 / ₱17,980 / ₱18,290). Only plot the three published ticket sizes; do not interpolate. Build: new `corridor-calculator.tsx`, or a tabbed `bar-chart`. **M**
3. **Corridor map toggle.** Toggle corridors on a stacked bar (US 40.2, SG 7.6, Saudi 6.7, JP 5.8, UK 4.6, others 35.1; p8). Highlight the Gulf to show 12.2% → ₱253B/yr (p21, p45). Upgrade of the existing `stackedBar`. **S**
4. **Phone walkthrough.** Scroll-driven sticky phone that steps through her 5 concept screens (p35): Request → Received → "₱18,290 is yours" → Protection → Home. Build: existing `story` block with `scrub-timeline`. Assets `materials/gocrypto/crops/screen-1..5.png` (re-crop screen 3 from `p35-4x.png`; the right edge is clipped). **M**
5. **"Say / never say" flip cards.** "Digital dollars" vs "Stablecoin", "Send money home" vs "On-chain transfer" (p18). Small, memorable, and shows product writing skill. **S**
6. **Assumption stress-test.** A retention toggle 38% ↔ 20% halves the NIM line (p46). It shows she knew where the model breaks. **S–M**

**Cut/merge:** the `compareSlider` ("first corridor to scale") and the 2029 revenue bar overlap; keep one. Lead with the SCQA (p2) as the 30 s layer.
**Decision card:** "Trading features vs a remittance rail → chose the rail; trading can't close the gap."
**Flag:** ⚠ say clearly "independent strategy from public sources, not a GoTyme deliverable" (byline p1). Context (application case or self-initiated) is still OPEN.

---

## 3. COSAP (`cosap`)

**Core insight:** SMB operations don't need another system; they need a layer that catches errors before they post.
**Arc:** books take 10+ days to close, 1 in 5 payrolls has errors (cosap3 p3) → tension: SMBs won't rip out what they run → decision: workflow layer above existing systems (cosap7 p4), with Telegram as the UI (cosap3 p8) → outcome: Forge PO errors 12.4 → 2.1/mo (cosap7 p18), close 3 days → 4 hours (p14).

**Interactive moments**
1. **Type a leave request and get blocked.** Reader types "8" annual-leave days; the field turns red: "Blocked: LSA §60 minimum is 15"; they type 15 and it saves. Source: cosap3 p16 (spec R15). Shows compliance-by-design in 5 seconds. Build: new `typed-form-demo.tsx`. **M**
2. **Step through a purchase order, before vs after Forge.** Four dumbbells: PO errors, inventory turnover 4.2× → 8.7×, on-time delivery 73% → 94%, anomaly lag 14.3 days → 23 min (cosap7 p18, spec R10). Put the lag on its own callout; it does not share a scale. Build: `compare-slider` / `before-after` variant. **M**
3. **The Telegram card.** Recreate the portal card (3 approvals pending / checked in 09:18 / 5 tasks today, cosap3 p8) as live HTML that the reader can tap to approve. **S–M**
4. **CEO risk gauge.** Needle sweeps to 72 "ELEVATED"; tiles $28.4K / $112K / $47.2K / $38K with tooltips (cosap3 p17, label "Scenario"). **M**
5. **Receipt → ledger timer.** Stopwatch ticks to 2m 47s against "~3 days" (cosap3 p13). **S**

**Cut/merge:** the existing `barChart` (60/40 from the website) is weaker than the Forge before/after. Keep the website numbers as chips only. The 3-step "Accounting / Legal / Payroll" steps block repeats the module map; merge.
**Role badge matters most here:** neither deck names Thao. Her role is from the CV ("led product design across 8 modules; primary PM for Korean and Singaporean clients"). Label everything else "Company figure".
⚠ Both decks are "Private & Confidential". Thao already OK'd the public-site figures (60% / 24 hr / 40%); **the deck-only figures (Forge, risk card, LSA example) need her explicit OK.** Customer names (Chong Wei, WAPS · Taiwan Steel Group) stay hidden unless she approves.
**Media:** `round3/visuals/live/cosap/d/section-*.png` (module grid); logo `logos/cosap-logo.png`.

---

## 4. Lumicap (`lumicap`)

**Core insight:** in tokenised funds, the hard product is trust: keys that never sit in a database and money that needs two people to move.
**Arc:** investors want on-chain transparency but institutional safety → tension: speed vs custody risk → decision: 2-of-3 multisig with Vault keys and Privy TEE quorum (lhow p9), fixed-supply LMX with minter revoked (p8) → outcome: shipped pre-launch; company figures $635M AUM, 17 investors (approved, labelled).

**Interactive moments**
1. **Approve a deployment (2-of-3).** Reader plays one approver: click Approve + enter 2FA; nothing happens until a second approver signs; then the transaction goes to chain. The line "keys never in database, signatures never persist" appears at the end. Source: lhow p9. Existing `explorable` already models this; add the "waiting for 2nd signer" state and a 2FA step. **S–M**
2. **Choose your fund type.** Toggle closed-end vs open-end on the existing `scrubTimeline`: closed-end Month 1–3 raise → deploying → quarterly USDC distributions → wind-down at 3–5 yrs; open-end monthly subscribe, quarterly redeem at NAV (lhow p5–6). **S**
3. **Investor journey stepper.** 7 steps from KYC to on-chain record (lhow p7), with the 5 KYC sub-steps expandable. **S**
4. **Emergency pause.** One big red button that freezes the demo token flow; explains why pause exists (ldemo p11, lhow p8). Small, eye-catching. **S**

**Cut/merge:** the two `metrics` blocks (6 modules, then $635M etc.) should merge into one band. The "Custody / Ledger / Fund mgmt / Investor flows" steps duplicate the module map.
**Media:** `round3/visuals/live/lumicap/d/section-*.png`, `media/projects/lumicap/flow-landing-scroll.webm`. No product screens exist (decks are text only).
⚠ Decks are "Private & Confidential, Jan 2026". Fine for flows and diagrams; confirm before quoting deck text verbatim.

---

## 5. Ledgr (`ledgr`)

**Core insight:** Vietnamese SMEs can check a contract against labour law in minutes, and the honest number today is 27 rules, not 100+.
**Arc:** SMEs can't afford a lawyer for every contract → tension: an LLM that "knows the law" will hallucinate → decision: seeded, verified rules + RAG over crawled legal sources (repo `rag-*.svg`, `verify-rules.ts`) → outcome: 27 rules across 6 doc types, demoed at Build Stuffs BS33.

**Interactive moments**
1. **Check a sample contract.** Reader drops (or picks) a fake labour contract; clauses light up pass / warn / fail with the rule name and fix: e.g. probation wage below floor, overtime cap, BHXH. Use only rule categories from `20260616000002_seed_labor_rules.sql`; the sample contract is fake and labelled as such. Build: `explorable` with a mock document. **M**
2. **Rule tree drill-down.** Click a document type to expand its rules (labor 15 → min wage ×4 regions, probation ×3…; einvoice 2, etc.). A dashed "Roadmap: 100+" ghost bar, labelled "vision, not built". Upgrade of the existing `barChart`. **S**
3. **Pipeline x-ray.** Hover each stage (upload → parse → retrieve → rule engine → verify → result) to see why it exists. Redraw of the repo SVGs. **M**
4. **Meetup timeline.** Existing `timeline` + `lineChart` (31 / 71 / 85 posts). Fine as is.

**Cut/merge:** the `lineChart` of session post counts measures the meetup, not Ledgr. Fold it into the timeline as a caption.
**Media:** `media/ledgr-meetup/bs33/thao_cshi7j6s2vlmqm9hlzf.jpg` (room, faces tiny) for the Results band; laptop-landing shots for the hero; `media/projects/ledgr/flow-landing-to-free-review.webm` for the flow. Skip the BS34 group photo (faces).
⚠ "~20 people validated" is Thao's own claim; which session (BS33 vs BS34) is still OPEN.

---

## 6. Guardline (`guardline`)

**Core insight:** the cheapest fraud defence clears 95% of orders with no AI, so the AI only works the hard 5%, and it never gets the final say on big actions.
**Arc:** SPayLater cash-out fraud via QR (guard p2) → tension: AI everywhere is slow and risky → decision: cheap signals first, investigator agent second, policy guard on every action (p4, p7) → outcome: targets only (synthetic data, p8): ~95% cleared, 0 → 90%+ on a new tactic, 0 genuine users blocked.

**Interactive moments**
1. **Route an order.** Existing `explorable`. Add the permission matrix (p7) so hovering "Platform acts" shows who decides and the limit (>10 accounts → person). **S**
2. **Unmask the ring.** Reader clicks accounts that share devices; at 14 linked accounts (p8) the ring lights up and the case escalates to a human (threshold >10, p4). **M**
3. **Read the agent's verdict.** Show the p5 JSON verdict as real, syntax-highlighted text with hover notes on each field. Existing `code` block plus annotations. **S**
4. **Adapt loop** (existing `scrubTimeline`, p6). Keep.

**Cut/merge:** the 4-number market `metrics` strip (US$11.1B etc.) is context, not result; demote to the 3 min layer. The final `metrics` (targets) must carry the `Target` badge.
**Media:** none exists. Use the team slide line "shipped fintech together at SkyLab, from Lumicap to COSAP" (p9) to link to those pages.
⚠ No placement is stated anywhere; don't claim one.

---

## 7. Zalo Game Center (`zalo-game-center`)

**Core insight:** at national scale, small ad-placement tests compound: +30% ad revenue in six months came from experiments, not a redesign.
**Arc:** 1 new launch + 4 live products, data pulled by hand → decision: build a tracking dashboard first (−40% manual extraction), then A/B test placements and run monthly events → outcome: +30% ad revenue, +15% engagement, +3% paying users (CV).

**Interactive moments** (all illustrative; no real data exists)
1. **"Reveal the experiment" (requested idea).** Two phone outlines, control vs variant placement; reader picks which they think won; reveal "+30% total ad revenue within six months (CV)". Label "illustrative layout, real result". **Do not invent** placement positions, sample sizes or uplift per test. **S–M**
2. **The order of operations.** A 3-step timeline: dashboard → experiments → events. Point: measure before you optimise. Existing `timeline`. **S**

**Cut/merge:** the `barChart` mixes a decrease with three increases on one axis; the earlier report also warned against baseline-less charts. Replace with 4 Results-band numbers. Three separate heading+paragraph sections (dashboard / experiments / events) → one 3-step block.
**Media:** only `logos/zalo-wordmark.svg`. Ask Thao for a sanitised dashboard screenshot or event poster.
⚠ "+3% paying users" may be percentage points; keep the CV wording.

---

## 8. PAC (`pac`)

**Core insight:** four clouds price the same thing four ways; billing only works once there is one canonical unit.
**Arc:** AWS, Azure, Huawei, Alibaba price books → tension: inconsistent invoices and cost attribution → decision: normalise to one pricing model, meter per tenant per service → outcome: one invoice, cost dashboard, payment reconciliation (CV; no metric).

**Interactive moments** (illustrative)
1. **Four price books → one invoice.** Animated convergence: four coloured streams merge into one invoice line. Existing `flow-diagram`. Use generic units, no real prices. **S**
2. **Reconcile it yourself.** Three columns: metered usage, invoice, payment; reader clicks a mismatch to issue a credit note. Shows she understood the reconciliation loop (case-studies/projects/pac.md ideas 2–3). **M**

**Cut/merge:** the single-number `metrics` ("4 providers") is not a result; fold it into the hero. Keep the page short.
**Media:** none. Cloud logos from official press kits (not in simple-icons).

---

## 9. ReOrc Data Platform (`reorc-data-platform`)

**Core insight:** clear requirements are a delivery feature: better specs meant less rework and 95% first-pass UAT.
**Arc:** microservice data platform (Recurve) with fuzzy requirements → decision: requirement framework + validation checkpoints + UAT scenarios → outcome: −40% rework, +20% faster delivery, 95% first-pass UAT (CV wording).

**Interactive moments**
1. **Spot the gap in a user story.** Reader sees a vague story, clicks to add the acceptance criteria and data requirements she would add; shows her BA craft. Fake example, labelled. **M**
2. **Source → report flow** (existing `flow`). Keep.

**Cut/merge:** the `list` block repeats the metrics. Merge into the Results band.
**Media:** `round3/visuals/live/reorc/d/section-*.png`, `media/companies/screens/reorc-docs-*.png`.
⚠ The 40% is "rework" in the CV and "clarification requests" in Notion. Per user-decisions, use the CV wording only, once.

---

## TOP-15 ranked by impact / effort

| # | Idea | Page | Impact | Effort |
|---|---|---|---|---|
| 1 | Results signature band (all pages) | all | High | M |
| 2 | Depth toggle 30 s / 3 min / deep dive | all | High | M |
| 3 | Ana's transfer calculator | GoCrypto | High | M |
| 4 | "Can trading close the gap?" slider | GoCrypto | High | S–M |
| 5 | Approve a 2-of-3 multisig deploy | Lumicap | High | S–M |
| 6 | Typed leave request blocked by LSA §60 | COSAP | High | M |
| 7 | Check a sample contract (rules light up) | Ledgr | High | M |
| 8 | Role badge: owned vs platform vs team | Cortex, COSAP, Lumicap | High | S–M |
| 9 | Fire-the-rules upgrade with structuring preset | Cortex | Med-High | S |
| 10 | GoCrypto sticky phone walkthrough (5 screens) | GoCrypto | Med-High | M |
| 11 | Forge before/after dumbbells | COSAP | Med-High | M |
| 12 | Unmask the 14-account ring | Guardline | Med | M |
| 13 | Glossary hovers | all | Med | S–M |
| 14 | Agent self-correction loop | Cortex | Med | S–M |
| 15 | Zalo "reveal the experiment" | Zalo | Med | S–M |

Not in the top 15 but cheap: GoCrypto "say / never say" cards (S), Lumicap pause button (S), Ledgr rule tree (S), Cortex status-filtered architecture (M), Cortex threshold slider (M, blocked on the −186 confirmation).

## Open questions for Thao
1. Cortex "−186 reviewed per period": what does it measure? (Blocks the threshold slider.)
2. COSAP deck-only numbers (Forge, risk card, LSA example): OK to publish? Customer names stay hidden unless yes.
3. GoCrypto context: application case or self-initiated?
4. Ledgr "~20 people": BS33 or BS34?
5. Zalo: any sanitised dashboard or event poster? Is "+3% paying users" points or percent?
6. Lumicap deck text: OK to quote, or diagrams only?

---

**Status:** DONE_WITH_CONCERNS
**Summary:** Wrote per-case-study proposals for all 9 pages (core insight, narrative arc, 2–6 interactive moments cited to her decks/repos, cuts, media, flags), 7 cross-cutting reading aids, and a top-15 ranked by impact/effort. Three current pages screenshotted to `research-private/round5/reading/`.
**Concerns:** Zalo, PAC and ReOrc have no real material, so their interactives are illustrative only. Several of the strongest ideas depend on Thao confirming confidential deck figures (COSAP) and the Cortex −186 metric. Only 3 of the 9 live pages were screenshotted; the other 6 were assessed from `content/projects/*.ts`.

TL;DR: give every page one "make her decision yourself" moment from her own decks (GoCrypto calculator, Lumicap 2-of-3 approval, COSAP blocked leave form, Ledgr contract check, Cortex rule firing), plus a shared Results band and a 30 s / 3 min / deep-dive toggle; keep Zalo, PAC and ReOrc short and honestly illustrative.
