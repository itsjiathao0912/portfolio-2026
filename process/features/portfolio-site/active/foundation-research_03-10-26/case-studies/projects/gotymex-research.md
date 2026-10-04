---
name: case-study:gotymex-research
date: 03-10-26
status: DRAFT
---
# GoTyme Go Crypto — independent architecture research

**Hook:** Before a PM interview at GoTyme she mapped the bank's crypto stack from public sources, marked every inference as "inferred", and worked out what the job description implies for v2.
**Live:** https://itsjiathao0912.github.io/gotymex-research/ · repo itsjiathao0912/gotymex-research (1 commit, 2026-07-27; artifact researched 2026-07-24). Source: README.

## Findings she states
- v1 is a deliberately thin slice: Alpaca carries trading and custody so the bank could ship fast under its BSP licence; PHP to USD conversion internally; no on-chain surface.
- The JD reads like v2: external transfers, stablecoin settlement, multi-chain add gas, screening, Travel Rule and real custody decisions.
- Layer map: app and bank core; Alpaca brokerage and clearing; Fireblocks custody; Paxos issuer; v2 overlay toggle (KYT, Travel Rule).

## Method (strong credibility signal)
Public sources only (Alpaca/Wise announcements, GoTyme help pages, BSP Circular 1108, BitPinas, PitchBook); each fact is sourced or tagged **inferred**; disclaimer that it is not an official or affiliated document.

## Why it matters for the portfolio
It shows how she prepares: model first, opinions second. It also seeded the Cortex Sentinel GoTymeX track (same domain: Travel Rule, KYT).

## Visuals
`../../research-private/media/projects/gotymex-research/index-*.png`, `architecture-desktop.png` / `architecture-mobile.png`.

## Facts to confirm with Thao
Outcome of the interview process (do not imply); is it appropriate to show a named-company candidate study publicly; JD attribution.
