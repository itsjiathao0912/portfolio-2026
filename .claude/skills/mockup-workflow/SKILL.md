---
name: mockup-workflow
description: "Build a single self-contained HTML \"workflow mockup\" that walks through every screen/state of a page or feature in one file — sticky step-switcher toolbar, one section per state — styled to match this project's light design system (tokens in src/app/globals.css, shadcn components in src/components/ui/). Triggers on: \"workflow mockup\", \"step-switcher mockup\", \"all-states mockup\", \"single-file mockup\", \"end-to-end mockup\", \"PRD-attached mockup\", \"create mockup workflow\""
---

# Mockup Workflow Skill

## Purpose

Produce a **single self-contained HTML file** that walks reviewers through *every* screen and state of a page or feature in one scrollable document, with a sticky step-switcher toolbar at the top. Attach it to plans/specs as the hand-off artifact.

The mockup MUST look like it was built from this project's real UI: only the tokens and component class strings that exist in the repo. **Do not invent colors, radii, shadows, or components outside the design system.**

## When to use

- "Workflow mockup for X" / "all-states mockup for X" / "end-to-end mockup"
- "Single HTML I can attach to the plan"
- "Walk through every screen of the {page}"

---

## Source of truth — read these first, every time

The design system is young and will change. Never rely on a copy in this skill; read the live files:

1. `src/app/globals.css` — `:root` tokens (`--paper`, `--ink`, `--accent`, `--navy`, `--hairline`, `--muted`, `--radius`) and the `@theme inline` mapping to Tailwind utilities (`bg-paper`, `text-ink`, `text-accent`, `text-navy`, `border-hairline`, `text-muted`).
2. `src/components/ui/*.tsx` — the exact `cva` class strings for each shadcn component (button, card, badge, and whatever has been added since). Copy class strings verbatim.
3. `process/context/uxui/all-uxui.md` — current design direction, typography, and motion rules.

At the time of writing the tokens are: paper `#ffffff`, ink `#0b0c0e`, accent `#2563eb`, navy `#0b1f4d` (proposed), hairline `#e4e4e7`, muted `#71717a`; fonts IBM Plex Sans (body/UI) and IBM Plex Mono (labels/code). **Light theme only** — `dark:` classes are inert in this project.

---

## How "use shadcn" works in a single HTML file

The shadcn components are React/TSX (`cva` + Radix + `cn()`), so they cannot be imported into a static HTML file. The mockup is a **static replica**: plain HTML + Tailwind (Play CDN) + a `<style>` block that re-declares the project tokens, with each component's class string copied from `src/components/ui/`.

Boilerplate:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{Feature} — workflow mockup</title>
<script src="https://cdn.tailwindcss.com"></script>
<!-- Mockup-only: the real site self-hosts Plex via @fontsource. -->
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<script src="https://unpkg.com/lucide@latest"></script>
<script>
  // Copy the CURRENT values from src/app/globals.css :root.
  tailwind.config = { theme: { extend: {
    colors: { paper:'#ffffff', ink:'#0b0c0e', accent:'#2563eb', navy:'#0b1f4d', hairline:'#e4e4e7', muted:'#71717a',
              background:'#ffffff', foreground:'#0b0c0e', border:'#e4e4e7', primary:'#0b0c0e', secondary:'#f4f4f5' },
    fontFamily: { sans:['IBM Plex Sans','system-ui','sans-serif'], mono:['IBM Plex Mono','ui-monospace','monospace'] },
  } } };
</script>
<style>body{background:#ffffff;color:#0b0c0e;font-family:'IBM Plex Sans',system-ui,sans-serif;-webkit-font-smoothing:antialiased;}</style>
</head>
<body>
  <!-- STEP SWITCHER + STATE SECTIONS -->
  <script>lucide.createIcons();</script>
</body>
</html>
```

---

## Workflow-mockup structure

1. **Sticky step-switcher toolbar** — `sticky top-0 z-40 bg-paper/90 backdrop-blur border-b border-hairline`, one pill per state. Clicking a pill scrolls to that section.
2. **One section per state**, each with a header (`text-ink font-semibold`) and a `font-mono text-sm text-muted` sub-label describing the state. Cover every state the page has: default, empty, loading, error, hover/focus where it matters, every viewport that changes layout, and any open overlay.
3. **Both widths.** A portfolio is judged on desktop and phone: show primary screens at desktop width and inside a phone frame (`max-w-[420px] mx-auto`).
4. **Realistic content.** Plausible project titles, roles and years — never lorem ipsum.
5. **Motion** is described, not animated: annotate intended transitions in a `font-mono text-xs text-muted` note under the state.

---

## Hard rules

- Only tokens and class strings that exist in `src/app/globals.css` and `src/components/ui/`. If something is missing, say so in the mockup and propose it — do not silently invent it.
- Light theme only. Paper background, ink text, hairline borders. Accent blue is for emphasis and links, not large fills.
- IBM Plex Sans for UI/body, IBM Plex Mono for labels/metadata.
- Self-contained single file — all CSS/JS inline or via the CDNs in the boilerplate.

---

## Output destination

```
docs/mockup/features/{feature}/workflow-mockup.html
```

Create the `{feature}` directory if it does not exist. Screenshots of OTHER people's sites used as reference never go here — they belong in a gitignored `research-private/` folder inside the feature's task folder.

## Before finishing

- Open the file and verify it renders: white background, Plex loaded, icons visible, no broken layout at ~390px and ~1440px.
- Every declared state has a section and a step-switcher pill.
- Spot-check that each component traces back to a class string in `src/components/ui/`.
