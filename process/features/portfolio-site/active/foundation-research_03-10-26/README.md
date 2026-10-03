---
name: ref:foundation-research
description: "Task folder for the portfolio-site foundation research — where research reports are collected before site design and build-out"
date: 03-10-26
feature: portfolio-site
---

# foundation-research (03-10-26)

Holds the research that informs the portfolio site's design and structure. The research reports
produced before this repo existed will be **copied in here** (they are not here yet).

## What goes where

| Kind | Location | Committed? |
|---|---|---|
| Research reports, public pattern notes (layout patterns, type scales, motion ideas, IA notes written in our own words) | this folder, named `foundation-research_{TYPE}_{dd-mm-yy}.md` (TYPE = REPORT / REF) | **yes** |
| Screenshots or captures of other people's sites used as reference | `research-private/` inside this folder | **no** — gitignored by `process/features/**/research-private/` |

Why the split: notes describing patterns are ours to keep in the repo; screenshots of other
designers' work are copyrighted, so they stay local.

## Next steps

1. Copy the existing research reports into this folder.
2. Summarise decisions (visual direction, page list, motion language) into a SPEC for the site.
3. Update `process/context/uxui/all-uxui.md` tokens once the direction is confirmed (`--navy` is
   still a proposal).
