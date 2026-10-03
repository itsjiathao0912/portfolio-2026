---
name: context:all-uxui
description: "UX/UI group entrypoint — light-theme design tokens, fonts, shadcn components, and motion conventions"
keywords: ui, ux, design, tokens, theme, light, colors, fonts, typography, plex, shadcn, components, motion, animation, tailwind
related: [context:all-content]
date: 03-10-26
metadata:
  read_when: "styling, adding components, choosing colours/fonts, or adding animation"
---

# all-uxui.md

**Status:** foundation only. The real visual direction is being researched in
`process/features/portfolio-site/active/foundation-research_03-10-26/`. Expect these tokens to
change; `src/app/globals.css` is always the source of truth.

## Tokens (light theme only)

Raw values on `:root` in `src/app/globals.css`, exposed as Tailwind utilities via `@theme inline`:

| Token | Value | Utility examples |
|---|---|---|
| `--paper` | `#ffffff` | `bg-paper` |
| `--ink` | `#0b0c0e` | `text-ink` |
| `--accent` | `#2563eb` | `text-accent`, `bg-accent` (brand blue — emphasis, links) |
| `--navy` | `#0b1f4d` (**proposed**) | `text-navy` |
| `--hairline` | `#e4e4e7` | `border-hairline` (also shadcn `border`/`input`) |
| `--muted` | `#71717a` | `text-muted` (also shadcn `muted-foreground`) |

shadcn semantic aliases (`primary`, `secondary`, `border`, `ring`, ...) map onto these.

Rules:
- Never write a raw hex or Tailwind palette colour (`text-zinc-500`) in a component; use tokens.
- **Light only.** `dark:` is rebound to a `.dark` class that is never set, so shadcn's `dark:`
  classes are inert. The E2E smoke runs the browser in dark mode to prove it.
- **`accent` means brand blue here**, unlike shadcn where it is a grey hover surface. shadcn
  components were edited to hover with `secondary` instead. Do the same when adding a new
  shadcn component that uses `hover:bg-accent`.

## Fonts

IBM Plex Sans (UI/body: 400/500/600) and IBM Plex Mono (labels/code: 400), self-hosted via
`@fontsource/*` imports in `src/app/layout.tsx` (Latin subset). Never `next/font/google` or a
Google Fonts link in the app.

## Components

- shadcn (new-york): `button`, `card`, `badge` in `src/components/ui/`. Add more with
  `pnpm ui-add <name>`, then fix the generated `cn` import path if needed (it once generated
  `from "cn"`) and remap any `hover:bg-accent`.
- Utility: `cn()` in `src/lib/utils.ts`.

## Motion

- `motion` (`motion/react`). Example: `src/components/fade-in.tsx`.
- Always respect `prefers-reduced-motion` (`useReducedMotion()`).
- Animation components are client components (`"use client"`); keep data loading in server
  components and pass data down.
