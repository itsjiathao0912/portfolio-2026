---
name: note:visitor-identity-prod-geo-and-d1-limits
description: "Backlog test-building stub: verify real request.cf.city on the deployed free-plan Worker and D1 read/write limits under a spike for the visitor identity system."
date: 04-10-26
metadata: {type: note, feature: portfolio-site, phase: backlog}
---

# Visitor identity: prod geo and D1 limits (known-gap KG1, NEW PLAN REQUIRED)

Source: PVL cycle 1 of `visitor-identity_PLAN_04-10-26.md` (plan folder `active/visitor-identity_04-10-26/`).

Gap: no deployed Worker exists (`wrangler.jsonc` D1 id is TBD), so two things cannot be proven in EXECUTE.
1. `request.cf.city` availability on the free plan (first-party docs were ambiguous in RESEARCH). Probe: after the first deploy, `curl https://<worker>/api/geo` from two networks and read `{country, city}`.
2. D1 behaviour under a spike: `/api/stats` and `/api/visit` share the read/write budget that renders every page (`loadSite()` reads D1 per request). Probe: confirm the D1 plan tier, estimate rows read per `/api/stats` call from the live table size, and confirm the Cloudflare rate-limit rule for `POST /api/visit` and `POST /api/poll` is in place.

Resolution chosen: D (backlog stub, keep active, continue). Files outside the plan's blast radius: none. New API surface: none.
