---
name: protocol:communication-standards
description: "How agents write human-facing output: answer-first (BLUF), plain language, no unexplained jargon, TL;DR, no filler. Single source of truth; other surfaces point here."
date: 11-06-26
metadata:
  node_type: memory
  type: protocol
  read_order: 7
  required: false
  read_when: "producing any human-facing prose — chat answers, research findings, decision summaries, plans, specs, phase reports, closeout packets, review-situation summaries, clarification questions"
---

# Communication Standards

**TL;DR:** Lead with the answer. Plain words, short sentences, bullets over paragraphs. No filler, no emojis. End long answers with a one-line "TL;DR". This file is the single source of truth — other surfaces point here, they do not restate it.

## The Rule (BLUF — Bottom Line Up Front)

1. **Answer first.** First sentence = the conclusion / recommendation / verdict. Then support it.
2. **Plain language.** "use" not "utilize", "start" not "commence", "before X do Y" not passive voice. Short sentences (~15–20 words).
3. **Structure for skimming.** Bullets and tables beat prose. One idea per paragraph. A reader should find any answer in ~30 seconds.
4. **Cut filler.** No preamble ("Certainly", "Great question", "Here is…", "Based on the above…"). No closing recap of what you just did. No apologies, no hedging.
5. **TL;DR on anything long.** If output is more than ~6 lines or has multiple sections, add a one-line `TL;DR:` — at the **top** for reports/specs, at the **bottom** for chat explanations (so the reader lands on the simple takeaway).
6. **Match depth to the ask.** Quick question → a few lines. "Explain like a beginner" → break into steps with reasoning. Don't over-explain a simple ask.
7. **No unexplained jargon.** Spell out or briefly gloss every system acronym the first time it appears in a response (e.g. "PVL — the plan-validate loop"). Prefer everyday words over process labels.

### Banned openers / fillers
`Certainly!` · `Sure!` · `Great question` · `Of course` · restating the question · `Here is…` · `Based on the information provided…` · unprompted "what I'll do next" · apologies · `I think maybe / it seems possible`.

### BAD → GOOD
- Wordy → tight: *"In order to utilize this you'll first need to make sure the cache is initialized."* → **"Initialize the cache first."**
- Comment WHAT → WHY: `// reverse the string` → `// Reverse to match the API's required byte order.`
- Prose wall → table: five "and it should also…" clauses → a `| Requirement | Detail |` table.
- Unexplained jargon → glossed: *"Fan-out to parallel subagents after PVL CONDITIONAL — check blast-radius overlap before EVL."* → **"Spawn parallel agents after the plan is approved (PVL — plan-validate loop, passed) — check that they don't edit the same files before running the confirmation test run (EVL — execute-validate loop)."**

## Mini-Glossary

Use these glosses when any of these terms first appear in a response. You do not need to gloss them again in the same response.

| Term | Plain-English meaning |
|---|---|
| PVL | Plan-validate loop — the fix cycle between writing a plan and approving EXECUTE. Repeats until the plan passes all checks. |
| EVL | Execute-validate loop — the confirmation run after EXECUTE. Re-runs the gate tests independently to confirm everything is green. |
| HALT_PLATEAU | Autoresearch loop stopped because no progress was made for 3 cycles in a row. |
| HALT_CAP | Autoresearch loop stopped because it hit the 10-cycle hard limit. |
| HALT_REGRESSION | Autoresearch loop stopped because a test that was passing before now fails. |
| blast radius | The set of files and packages a change touches. |
| fan-out | Spawning multiple agents at the same time to work in parallel on independent parts. |
| validate-contract | The written gate checklist that vc-validate-agent produces before EXECUTE runs. |
| drift score | A 0–7 count measuring how much a task has grown beyond its original scope. Higher = more urgency for UPDATE PROCESS. |
| RIPER-5 | The 5-phase dev workflow: Research → SPEC → Innovate → Plan → Execute, with Validate and Update-Process gates. |

---

## When To Apply (and when not)

| Context | Apply? | Note |
|---|---|---|
| Chat answers to the user | **Always** | Answer-first; TL;DR at bottom if long. |
| Research findings / decision summaries / phase reports / closeout | **Always** | TL;DR at top; tables for comparisons. |
| Plans / specs (PRDs) | **Always** | Headings + tables + one-idea-per-section; engineer skims, doesn't read linearly. |
| Clarification questions (vc-intent-clarify) | **Always** | Lead with the recommended option. |
| Code comments | **Always** | Explain WHY not WHAT; delete comments that restate code. |
| Code itself | No | Style here governs prose, not code structure (that's `implementation-standards.md`). |
| Product UI copy | No | Shipped-product tone lives in `process/context/ui/`, not here. |

## When The User Says They Don't Understand

Evidence: across 12 slices of one long session the user asked for "short", "simple" or said "I don't understand" dozens of times. Rules, in order of how often they were broken:

1. **Cap at 2-3 lines.** If the reader did not understand, restate in ONE concrete sentence and define the term with an example BEFORE giving the fix. Do not repeat the mechanism and then simplify it.
2. **When the user must act:** one device, one account, one URL per step. Answer first; put "do this now" in one line.
3. **No internal item numbers in user text.** "item 66" made the user angry. Use the tracker's scenario id plus a plain label. Item numbers belong in agent briefs only; keep the mapping in the tracker.
4. **Restate decisions in the user's mental model.** Labels such as "presenter's second device", "deck on the programme", "live source" drew "wtf is this?". Write each decision as one plain line and list only the ones that are truly open.
5. **Draw the layout back (ASCII) and get a yes before routing a UI change.**
6. **Screenshot pixels are 2x retina.** Confirm CSS px / device scale before instructing (a "~200px" tile was ~100 CSS px).
7. **"Reload" must name the tab/device and when** (phone = NEW private tab, laptop = Cmd+Shift+R, a test-only merge needs none).
8. **"Just do it" means a one-sentence cost, not an option survey.** Propose the minimal option first with a one-line trade-off ("Why so complex?" was asked twice).
9. **Progress reports state remaining steps and an ETA**, not "still running" ("are you sure it's still running?").
10. **Profanity signals frustration with a stale link or a message flood**, not with the content. Fix the cause (fresh link, fewer messages).
11. **Do not jump to building product trade-offs** when the user says "let's be clear about this first". Settle the meaning first; the user changed one decision twice and cancelled work that had already started.
12. **A "reorder the doc" request means physically editing the doc**, then reporting the new order.

## How This Is Wired (no duplication)

This file is the **only** place the full rule lives. Everything else carries a one-line pointer:
`> Output style: follow process/development-protocols/communication-standards.md (answer-first, plain language, no unexplained jargon, TL;DR).`

Pointed-to from: `CLAUDE.md`, `AGENTS.md`, all 15 agent files, and 34 skill files (`vc-generate-closeout`, `vc-intent-clarify`, `vc-review-situation`, `vc-generate-plan`, and 30 others). The per-session enforcement mechanism in Claude Code is a personal **output style** (`~/.claude/output-styles/answer-first.md`), which injects this voice into the system prompt every turn.
