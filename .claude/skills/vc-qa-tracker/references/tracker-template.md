# {Feature} QA tracker (shared)

Link: {test URL} — refresh first ({laptop shortcut}, {phone: new private tab}). Build: {label / sha}.
Debug view: add `{debug flags, joined with &}`.
Devices: **A** = {laptop, account} · **B** = {phone, account} · **C** = {second device}.

How to use: tick `[x]` when a step works. When something is wrong, write it under the scenario (or **Small issues & notes**): scenario + step + what you saw + time. Claude reads this file, fixes, and moves confirmed items to **Done**.

Report prompt: `QA S<n> failed at <HH:MM> on <device>. Expected: <…>. Saw: <…>. Console: <paste or none>. Read the dev log around that time and investigate — don't change code yet, tell me the cause first.`

Status legend: 🔧 fixing (don't retest) · 🔁 RETEST (fix is on the link) · ⬜ NEVER TESTED · ❓ NEEDS CHECKING · ❌ issue found · 🤖 automated passes · ✅ confirmed by you

## ▶️ Retest now ({date})
**Test link ({build}):** {exact URL, flags joined with `&`}. Reload: {per device}.
**Before you start:** {permission resets, accounts}.
**New on the link — do these in order:**
1. {Scenario id + plain label}: {one action}. Expect: {result}. The one that matters: {…}.
**Don't test yet:** {scenario ids + plain labels}.
**Waiting on you:** {…}.
**Not yet in production:** {list}.
**Not verified on a real device:** {list}.

## How this document works (rules for Claude)
{Copy the nine locked rules from the vc-qa-tracker SKILL.md, shortened to one line each.}

## Decisions (don't re-propose)
- **{Decision} ({date}):** {one sentence}. Strikes: {older note it replaces, if any}.

## Scenarios — grouped by feature (current focus first)

## 1 · {Feature group — current focus}

### S1 — {One behaviour in plain words} 🔁 RETEST

> **Status:** 🔁 On the link (build {sha}). Reload {device}.
> **Automated test:** `Spec: tests/e2e/foo.spec.ts:42 | lane foo-live | real-UI` · commit {sha} · PASS (Playwright: 3 passed / 0 failed) · evidence: {path}
> **Your last test:** {date, device}
> **Your result:** _(write ✅ works / ❌ + what you saw)_

**Setup:** device A (host account) · device B (phone, second account).

- [ ] A: {one action}. Expect: {one result}.
- [ ] B: {one action}. Expect: {one result}.

<details><summary>History</summary>

- {date}: reported {…}; cause {…}; fixed in {sha}.

</details>

### S2 — {Manual-only example} ⬜ NEVER TESTED
> **Automated test:** NOT AUTOMATABLE — MANUAL-ONLY: {reason, e.g. real iOS keyboard after a permission prompt}

## Small issues & notes
- (S1) {one line, date, who reported}

## ✅ Done (fixed + confirmed) — newest first
- **S0 {label}** — Confirmed {date} (build {sha}): {what the user saw}.

## Automated test results ({date})
| Round | sha | load start/end | Spec | Result (Playwright's own count) | Class (product/test/env, file:line) |
|---|---|---|---|---|---|

## Still open, not done
- {…}
