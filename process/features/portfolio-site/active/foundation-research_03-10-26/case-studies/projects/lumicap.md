---
name: case-study:lumicap
date: 03-10-26
status: DRAFT (thin evidence; no repo, internal UI not captured)
---
# Lumicap — real-world assets (GPUs, property, gold) as on-chain investment funds

**Hook:** Putting AI-compute and real-world assets on-chain so a non-technical investor can see, in one dashboard, what they own, what it earned and every transaction behind it.
**Employer:** SkyLab Group. Live marketing site https://lumicap.io (product is login-gated). Sources: old portfolio `content/*.ts` (her CV wording), public site text (saved `../../research-private/media/projects/lumicap/_page-text.txt`).

## Context / problem
- Alternative assets are gated to institutions; Lumicap's pitch: fractional ownership, secondary liquidity, 24/7 settlement, transparent on-chain records (site copy).
- PM problem (her CV): "translating complex tokenization workflows into intuitive interfaces for non-technical investors."

## Role (CV, unverified externally)
Led the build; **owned the crypto core**: digital-asset custody via multisig wallets, on/off-chain ledger with USDC settlement, fund management with NAV tracking and clear transaction history. Investor-facing product across **6 modules**. `[NEEDS: confirm "led the build" vs "primary PM"; team size; her launch date involvement]`

## What the public product shows (company-side, not her outcomes)
- Flow: Join and verify (KYC) → fund account (bank transfer/card) → build portfolio (curated bundles or single funds) → earn and monitor (monthly distributions).
- Security claims: MFA, multi-sig treasury, fixed-supply governance token (LMX, minter revoked post-genesis), audited modular contracts, ERC-20 asset tokens, pause mechanism, PCI-DSS-compliant architecture.
- Dashboard: portfolio overview, holdings (claim pending rewards), earnings tracking.
- 8+ funds listed: GPU clusters (NVIDIA B300/GB300), gold, classic cars, Singapore condo, Singapore data center, with target return ranges and minimums (company-published, "*" qualified).
- Company-published stats: $635M "total assets under management", $2M distributions paid, **17 active investors, 5 active funds**. Do NOT reuse as her results; the AUM vs 17 investors combination invites questions, check with company before quoting.

## Tech (her CV)
Multi-chain/EVM, ERC-20, USDC, Privy (auth/wallets), HashiCorp Vault, Arweave.

## Outcomes
None sourced as hers. `[NEEDS: launch date, # investors onboarded, funds live, volume, any metric she is allowed to cite]`. Status wording on old site: "Shipped, pre-launch" conflicts with the live site showing active funds → `[NEEDS: current status]`.

## Visuals
`../../research-private/media/projects/lumicap/landing-desktop.png`, `landing-mobile.png`, video `flow-landing-scroll.webm` (marketing page only). `[NEEDS: sanitized dashboard/onboarding screens, her Figma flows, custody/ledger architecture diagram she can share]`

## Suggested designed visuals
1. Money-flow diagram: fiat in → USDC → fund token → distributions, marking on-chain vs off-chain ledger and where custody (multisig, Vault) sits.
2. Investor journey: 4-step flow with the PM decision at each step.
3. NAV tracking explainer (what the ledger must reconcile).

## Pull-quote candidates (to be earned by her answers)
- Why a ledger that is both on- and off-chain is the hard part. `[NEEDS: her words]`

## Facts to confirm with Thao
Role wording; NDA scope; permission to show screens; the hardest tradeoff she made (custody model? KYC flow?); status and metrics she may publish.
