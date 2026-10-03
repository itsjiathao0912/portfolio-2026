---
name: context:all-planning
description: "Planning group entrypoint — where plan-format references live and how to pick a SIMPLE vs COMPLEX plan"
keywords: plan, planning, prd, spec, simple, complex, template, format
date: 03-10-26
metadata:
  read_when: "writing a new plan or spec and needing the expected structure"
---

# all-planning.md

Entrypoint for the **planning** group: how plans are shaped in this repo. It holds pointers to
format examples, not active plans (those live in `process/general-plans/active/` and
`process/features/*/active/`).

## Read when

- You are about to write a plan with `vc-generate-plan` and need the expected structure.
- You need to judge whether work warrants a SIMPLE or COMPLEX plan.

## References

| File | Purpose |
|---|---|
| `.claude/skills/vc-generate-plan/references/example-simple-prd.md` | SIMPLE plan (small, single-touchpoint change) |
| `.claude/skills/vc-generate-plan/references/example-complex-prd.md` | COMPLEX plan (multi-phase, broad blast radius) |

## Quick procedure

1. SIMPLE for single-file / low-risk changes; COMPLEX for multi-phase, schema, deploy, or
   cross-cutting work.
2. Use the matching example as the skeleton; fill in touchpoints, blast radius, verification
   evidence, and resume handoff.
3. Save inside a task folder: `process/features/{feature}/active/{slug}_{dd-mm-yy}/{slug}_PLAN_{dd-mm-yy}.md`
   (or `process/general-plans/active/...` for cross-cutting work).
