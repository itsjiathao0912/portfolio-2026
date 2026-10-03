# Preflight Matrix (per phase-requirement)

Adopted from AgentKit `ak-goal-warmup/preflight-matrix`. Built once at kickoff (Step 3), before
launching any worktree session. Inspect **every** phase-requirement. Core rule:
**prefer `unknown` + blocking over a false `Ready`.**

## Columns

| Phase | Requirement | Check method | Status | Owner-unblock action | Blocking |
|---|---|---|---|---|---|

- **Status enum:** `available | missing | pending | unknown | n/a`.
- **Blocking:** `yes | no`. A `blocking: yes` row that is not `available`/`n/a` stops that
  phase's launch until resolved.

## Portable check catalog

Use only cheap, read-only, non-mutating checks:

- tool present: `command -v <tool>`
- env var present (NAME-PRESENCE ONLY, never the value): `[ -n "${VAR:-}" ] && echo present`
- config shape: parse a JSON/YAML key exists — do not print its value
- auth status: `gh auth status`, `wrangler whoami` (read-only)
- capacity: current worktree/lane count, `uptime` load

## Prohibited probes

No chargeable, mutating, or resource-creating probe at preflight. No live-provider calls
(no real Clerk/Resend/Firecrawl/Cloudflare API mutations). No `git push`. No `wrangler deploy`.
No container/DB boot just to test capacity — reason about the ceiling instead.

## Machine-capacity rows are first-class

`hazards.maxConcurrentLanes` and `hazards.serializeHeavyJobs` (both read from
`worktree.config.json`) are **blocking matrix rows evaluated before launch**, not throttles
discovered mid-run. Example rows (illustrative — this repo's actual values live in
`worktree.config.json`, this table never hardcodes them):

| Phase | Requirement | Check method | Status | Owner-unblock action | Blocking |
|---|---|---|---|---|---|
| all | ≤ `hazards.maxConcurrentLanes` active worktrees | count dirs under `worktreesDir` | available | wait for a lane to free a slot | yes |
| all | load average < 8 | `uptime` | available | serialize CPU-heavy lanes (build/typecheck/e2e) | yes |
| phase-2 | `E2E_CLERK_USER_EMAIL` present | env name-presence | unknown | user provides test credentials | yes |
| phase-3 | free dev port in range | `lsof -i :<port>` (read-only) | available | pick next free port via the setup script | no |

## Env checks are name-presence only

Never read or print an env value at preflight. `present`/`missing` is the entire signal. Run any
captured command output through `scripts/redact.mjs` before it reaches the matrix or a report.

## Output groups

Sort matrix findings into three groups so the user sees what needs them vs what can wait:

- **must-provide** — blocking rows the user must resolve before launch.
- **should-decide** — non-blocking rows that change how a phase runs.
- **can-defer** — informational; safe to proceed without.
