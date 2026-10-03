# Four-Class Finding Taxonomy (Hand-Back Queue)

Adopted from AgentKit `ak-goal-warmup/contract-preserving-review`. Governs what the orchestrator
may do with a finding a phase hands back (or that a plan review surfaces). **Classify BEFORE any
plan edit.** The point of the taxonomy is one class: the failure where a review quietly talks a
plan out of the user's actual requirement because it "looked expensive."

## The four exclusive classes

| Class | Meaning | Permitted plan edit |
|---|---|---|
| `mitigation-within-contract` | Safer or clearer, and preserves every locked outcome and acceptance signal | **Allowed** — apply it |
| `preflight-required` | Needs a readiness check first (credential, tool, access, quota) | **Annotate only** — add to preflight matrix |
| `blocker` | Prevents Ready until resolved | **Annotate; mark not-ready** |
| `outcome-change-request` | Would change the result, remove a must-have, or swap the approach | **No silent edit — USER GATE** |

## Adjudication procedure (five steps)

1. Read the finding against the phase's locked outcomes and acceptance signals.
2. Assign exactly one class. If it touches a must-have or the result, it is
   `outcome-change-request` — even if it also has a within-contract mitigation; the outcome
   question dominates.
3. `mitigation-within-contract` → apply and note it.
4. `preflight-required` / `blocker` → annotate the plan/report; do not edit the approach.
5. `outcome-change-request` → **surface options to the user and wait.** Do NOT auto-apply
   (that redefines scope) and do NOT auto-reject just to stay on the happy path.

## Why no default red-team apply pipeline

A generic red-team review whose final step "applies accepted findings to the plan" can silently
redefine scope. That path is forbidden here — accepted findings route through the table above,
and anything in the `outcome-change-request` class is a user decision, never an automatic edit.

## Draining the queue

The orchestrator drains the hand-back queue (apply / annotate / surface) **before the program is
called done**. A handed-back finding that is never drained is a finding that does not exist —
write each one down on receipt.
