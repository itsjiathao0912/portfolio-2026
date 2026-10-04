---
name: report:design-tokens
description: "Type and colour system for the light, iOS-feel portfolio: heading face closest to GT America Extended Bold (Archivo, width axis), Vietnamese-safe body, full colour token set with WCAG contrast table."
date: 03-10-26
metadata:
  node_type: memory
  type: report
  feature: portfolio-site
  phase: foundation-research
---

# Design tokens: type and colour

**TL;DR:** Headings: **Archivo Variable at width ~118%, weight 700** (free, OFL, has Vietnamese, measured nearest to the reference's extended grotesque). Body: **Inter Variable** (iOS/SF feel, Vietnamese) with **IBM Plex Mono** only for code/labels; IBM Plex Sans stays a safe alternative. Accent: **keep #2563EB**, not iOS #007AFF, because white text on #007AFF is 4.02:1 (fails AA) while #2563EB is 5.17:1. Every text pair used passes AA except muted grey on two pastel tints, which is excluded by one rule (use ink-2 there). **Found bug in starter:** `src/app/layout.tsx` imports only `latin-*.css` subsets, so Vietnamese letters would silently fall back; the vietnamese subsets must be imported.

Previews (local only, gitignored) in `research-private/design-tokens/`: `heading-fonts-compare.png`, `heading-vs-reference-and-body-pairing.png`, `palette-preview.png`.

## 1. Heading font

Screened for: look vs GT America Extended Bold, Vietnamese subset present (must), variable axes, weight of the files, OFL. Rendered all with the string "Đào Thị Thảo — Thiết kế sản phẩm" plus extra stacked-tone letters (ế, ằ, ẵ, ộ, ữ, ỳ).

| Candidate | Vietnamese | Axes | Look vs reference | Verdict |
|---|---|---|---|---|
| **Archivo (wdth 62-125, wght 100-900)** | Yes | width + weight | Nearly identical letterforms (double-storey a, single-storey g, flat terminals); glyph shapes in the reference screenshot match | **Pick** |
| Mona Sans (wdth 75-125) | Yes | width + weight | Close but rounder, more "GitHub"; slightly heavier counters | Runner-up |
| Hubot Sans (wdth 75-125) | Yes | width + weight | Techy/mechanical terminals | No |
| Anybody (wdth 50-150) | Yes | width + weight | Quirky, geometric, too stylised | No |
| Unbounded | Yes | weight | Very wide, rounded; reads playful | No |
| Lexend | Yes | weight | Wide-ish but humanist, not extended | No |
| Bricolage Grotesque | Yes | width 75-100 only | Cannot go extended | No |
| Hanken Grotesk | Yes | weight | Normal width | No |
| Familjen Grotesk, Space Grotesk | Yes | weight | Normal width, quirky | No |
| Syne, Schibsted Grotesk, Instrument Sans, Outfit, Sora, Red Hat Display | **No Vietnamese subset in Fontsource** | | | Disqualified |

**Width measurement.** The reference's "Manager at Atolls" line is about 789 px at 80 px. Archivo 700 at 80 px measures 772 (wdth 115), 794 (118), 809 (120), 846 (125). So the reference sits at roughly **wdth 117**. Use `font-stretch: 118%` for headings; 125% is only needed if you want it louder. Weight 700 matches; 800 adds ~3.5% width.

**Size.** Fontsource variable files: latin wdth+wght = 90 KB, vietnamese = 34 KB (124 KB total, plus latin-ext only if needed). Pinning wdth to 125 and wght to 500-900 with fontTools instancer gives 33 KB + 13 KB = 46 KB. Pinning to 118 would be similar. Optional optimisation; OFL permits it (check for a Reserved Font Name before renaming: none declared in Fontsource licence text for Archivo; confirm in the package LICENSE before shipping a renamed subset).

**Diacritics.** Stacked marks (ế, ộ, ữ) clear at line-height 1.15 at 44 px; use **line-height >= 1.15** for headings and 1.1 only above 64 px.

## 2. Body font

IBM Plex Sans has a vietnamese subset (8 KB per weight), so it is valid. Inter has a tighter, more neutral, SF-like rhythm that matches the iOS feel, with a variable weight file (48 KB latin + 10 KB vietnamese). Side-by-side rendering shows both are clean; Inter pairs more naturally with the very wide Archivo because its x-height is larger and its shapes are quieter than Plex's slightly technical forms. Recommendation: **Inter Variable body, IBM Plex Mono for code snippets and tiny metadata**. Keeping Plex Sans is a legitimate zero-change option (user already uses it); decide in Open choices.

Fontsource packages: `@fontsource-variable/archivo` (use `wdth.css`), `@fontsource-variable/inter`, `@fontsource/ibm-plex-mono` (has vietnamese-400).

```css
@import "@fontsource-variable/archivo/wdth.css";   /* includes latin, latin-ext, vietnamese via unicode-range */
@import "@fontsource-variable/inter/wght.css";
--font-display: "Archivo Variable", "Inter Variable", system-ui, sans-serif;
--font-body: "Inter Variable", system-ui, -apple-system, "Segoe UI", sans-serif;
--font-mono: "IBM Plex Mono", ui-monospace, "SF Mono", monospace;
/* headings: font-family:var(--font-display); font-stretch:118%; font-weight:700; line-height:1.15; letter-spacing:-0.01em */
```
Note: Fontsource's unicode-range splitting means browsers only download the Vietnamese file when a Vietnamese letter appears. Set `font-stretch` explicitly or the heading renders at 100%.

## 3. Colour decisions

**iOS system colours (Apple HIG, light):** blue #007AFF, indigo #5856D6, purple #AF52DE, pink #FF2D55, red #FF3B30, orange #FF9500, yellow #FFCC00, green #34C759, cyan #32ADE6, brown #A2845E; gray #8E8E93 with gray6 #F2F2F7 as grouped background. (Teal/mint hex returned by the Apple page fetch looked unreliable; not used.) Apple itself says to keep text contrast at least 4.5:1.

**Blue choice: keep #2563EB.** Computed: #007AFF on white 4.02 (fails AA for small text and for white button labels), #0A84FF (dark-mode blue) 3.65, #2563EB 5.17, #1D4ED8 6.70. iOS apps get away with 007AFF because tappable text has a large hit target and is exempt in practice, but a web page is judged on contrast. #2563EB reads clearly "blue" and sits close to iOS in hue, so the iOS feel is carried by shape, whitespace, translucency and radii, not by the exact hex. If you want a more vivid fill-only blue, `#0A6CFF` for large decorative fills (never text) is possible but adds a second blue; not recommended.

**Navy:** #0B1F4D passes 16:1 on white and works for headings, footer and logo band. Slightly desaturated slate inks (#38466A, #5F6B85) keep a blue undertone so greys do not look dirty beside the blue. Cool canvas #F4F6FB replaces the reference's neutral #f7f7f7 so white cards lift subtly.

**Pastels:** eight tints at ~92-95% lightness spanning blue, indigo, violet, rose, peach, butter, mint and aqua, so they harmonise with the blue and keep navy text above 13:1. Saturated solid cards (reference has indigo, red, orange) use `navy`, `accent` or `indigo` with white text.

**Status colours:** iOS green #34C759 is 2.22:1 and orange #FF9500 is 2.20:1 on white, so they are fills only. Text versions: success #15803D, warn #B45309, danger #C62828.

## 4. Token table (paste into `:root`)

```css
:root {
  /* surfaces */
  --bg: #FFFFFF;
  --canvas: #F4F6FB;          /* page canvas behind cards */
  --surface: #FFFFFF;
  --elevated: #FFFFFF;        /* + shadow, see below */
  /* ink */
  --ink-1: #0B1F4D;           /* headings (navy) */
  --ink-2: #38466A;           /* body */
  --ink-3: #5F6B85;           /* muted, captions, placeholder. Not on periwinkle/lavender */
  --hairline: #E2E7F0;        /* dividers, card borders (decorative) */
  --border-strong: #8592AB;   /* input borders, outlined icons (3:1) */
  /* accent */
  --accent: #2563EB;
  --accent-hover: #1D4ED8;
  --accent-pressed: #1E40AF;
  --accent-tint: #EAF1FF;     /* chips, selected rows */
  --focus-ring: #2563EB;      /* 2px ring + 2px offset */
  /* navy bands */
  --navy: #0B1F4D;
  --navy-deep: #071536;
  --indigo: #4F46E5;          /* solid card variant */
  /* status */
  --success: #15803D;  --success-fill: #34C759;
  --warn: #B45309;     --warn-fill: #FF9500;
  --danger: #C62828;
  /* project card tints */
  --tint-sky: #E3EEFF;   --tint-periwinkle: #E7E8FF; --tint-lavender: #F1E7FF; --tint-rose: #FFE6EE;
  --tint-peach: #FFEADB; --tint-butter: #FFF3C7;     --tint-mint: #DAF5E8;     --tint-aqua: #D9F1F7;
  /* shape + depth (iOS-like) */
  --radius-card: 16px; --radius-tile: 20px; --radius-input: 12px; --radius-pill: 999px;
  --shadow-nav: 0 0 3px rgba(11,31,77,.14), 0 20px 13px -4px rgba(11,31,77,.06);
  --shadow-card-hover: 4px 20px 16px rgba(11,31,77,.11);
}
```
Rules that keep it AA: body text on tints = `--ink-2` or `--ink-1`; link/CTA text on tints = `--accent-hover`; `--ink-3` only on white/canvas/sky/rose/peach/butter/mint/aqua. Pill nav gets `backdrop-filter: blur(16px) saturate(1.4)` on a `rgba(255,255,255,.8)` background for the iOS translucent feel (fixes the reference's text collision); keep a solid fallback.

## 5. Contrast table (WCAG 2.x, computed from sRGB relative luminance)

| Foreground | Background | Use | Ratio | Needs | Result |
|---|---|---|---|---|---|
| ink1 #0B1F4D | bg #FFFFFF | headings | 15.94 | 4.5 | PASS |
| ink2 #38466A | bg #FFFFFF | body text | 9.32 | 4.5 | PASS |
| ink3 #5F6B85 | bg #FFFFFF | muted/captions/placeholder | 5.35 | 4.5 | PASS |
| accent #2563EB | bg #FFFFFF | links, accent text | 5.17 | 4.5 | PASS |
| accentHover #1D4ED8 | bg #FFFFFF | link hover | 6.70 | 4.5 | PASS |
| ink1 #0B1F4D | canvas #F4F6FB | headings | 14.74 | 4.5 | PASS |
| ink2 #38466A | canvas #F4F6FB | body text | 8.62 | 4.5 | PASS |
| ink3 #5F6B85 | canvas #F4F6FB | muted/captions/placeholder | 4.94 | 4.5 | PASS |
| accent #2563EB | canvas #F4F6FB | links, accent text | 4.78 | 4.5 | PASS |
| accentHover #1D4ED8 | canvas #F4F6FB | link hover | 6.20 | 4.5 | PASS |
| bg #FFFFFF | accent #2563EB | button label on accent | 5.17 | 4.5 | PASS |
| bg #FFFFFF | accentHover #1D4ED8 | button label hover | 6.70 | 4.5 | PASS |
| bg #FFFFFF | accentPressed #1E40AF | button pressed | 8.72 | 4.5 | PASS |
| accent #2563EB | accentTint #EAF1FF | chip text | 4.56 | 4.5 | PASS |
| accentHover #1D4ED8 | accentTint #EAF1FF | chip text (safer) | 5.91 | 4.5 | PASS |
| bg #FFFFFF | navy #0B1F4D | text on navy band/footer | 15.94 | 4.5 | PASS |
| accentTint #EAF1FF | navy #0B1F4D | soft text on navy | 14.06 | 4.5 | PASS |
| bg #FFFFFF | indigo #4F46E5 | label on solid indigo card | 6.29 | 4.5 | PASS |
| success #15803D | bg #FFFFFF | success text | 5.02 | 4.5 | PASS |
| warn #B45309 | bg #FFFFFF | warning text | 5.02 | 4.5 | PASS |
| danger #C62828 | bg #FFFFFF | error text | 5.62 | 4.5 | PASS |
| border #8592AB | bg #FFFFFF | input border / icon outline (non-text) | 3.14 | 3 | PASS |
| accent #2563EB | bg #FFFFFF | focus ring (non-text) | 5.17 | 3 | PASS |
| hairline #E2E7F0 | bg #FFFFFF | divider (decorative, exempt) | 1.24 | 1 | PASS |
| ink1 #0B1F4D | sky #E3EEFF | sky card: heading | 13.62 | 4.5 | PASS |
| ink2 #38466A | sky #E3EEFF | sky card: body | 7.97 | 4.5 | PASS |
| accentHover #1D4ED8 | sky #E3EEFF | sky card: link/CTA text | 5.73 | 4.5 | PASS |
| ink3 #5F6B85 | sky #E3EEFF | sky card: muted (avoid?) | 4.57 | 4.5 | PASS |
| ink1 #0B1F4D | periwinkle #E7E8FF | periwinkle card: heading | 13.20 | 4.5 | PASS |
| ink2 #38466A | periwinkle #E7E8FF | periwinkle card: body | 7.72 | 4.5 | PASS |
| accentHover #1D4ED8 | periwinkle #E7E8FF | periwinkle card: link/CTA text | 5.55 | 4.5 | PASS |
| ink3 #5F6B85 | periwinkle #E7E8FF | periwinkle card: muted (avoid?) | 4.43 | 4.5 | FAIL |
| ink1 #0B1F4D | lavender #F1E7FF | lavender card: heading | 13.37 | 4.5 | PASS |
| ink2 #38466A | lavender #F1E7FF | lavender card: body | 7.82 | 4.5 | PASS |
| accentHover #1D4ED8 | lavender #F1E7FF | lavender card: link/CTA text | 5.62 | 4.5 | PASS |
| ink3 #5F6B85 | lavender #F1E7FF | lavender card: muted (avoid?) | 4.48 | 4.5 | FAIL |
| ink1 #0B1F4D | rose #FFE6EE | rose card: heading | 13.52 | 4.5 | PASS |
| ink2 #38466A | rose #FFE6EE | rose card: body | 7.91 | 4.5 | PASS |
| accentHover #1D4ED8 | rose #FFE6EE | rose card: link/CTA text | 5.68 | 4.5 | PASS |
| ink3 #5F6B85 | rose #FFE6EE | rose card: muted (avoid?) | 4.53 | 4.5 | PASS |
| ink1 #0B1F4D | peach #FFEADB | peach card: heading | 13.70 | 4.5 | PASS |
| ink2 #38466A | peach #FFEADB | peach card: body | 8.01 | 4.5 | PASS |
| accentHover #1D4ED8 | peach #FFEADB | peach card: link/CTA text | 5.76 | 4.5 | PASS |
| ink3 #5F6B85 | peach #FFEADB | peach card: muted (avoid?) | 4.59 | 4.5 | PASS |
| ink1 #0B1F4D | butter #FFF3C7 | butter card: heading | 14.34 | 4.5 | PASS |
| ink2 #38466A | butter #FFF3C7 | butter card: body | 8.39 | 4.5 | PASS |
| accentHover #1D4ED8 | butter #FFF3C7 | butter card: link/CTA text | 6.03 | 4.5 | PASS |
| ink3 #5F6B85 | butter #FFF3C7 | butter card: muted (avoid?) | 4.81 | 4.5 | PASS |
| ink1 #0B1F4D | mint #DAF5E8 | mint card: heading | 13.82 | 4.5 | PASS |
| ink2 #38466A | mint #DAF5E8 | mint card: body | 8.08 | 4.5 | PASS |
| accentHover #1D4ED8 | mint #DAF5E8 | mint card: link/CTA text | 5.81 | 4.5 | PASS |
| ink3 #5F6B85 | mint #DAF5E8 | mint card: muted (avoid?) | 4.63 | 4.5 | PASS |
| ink1 #0B1F4D | aqua #D9F1F7 | aqua card: heading | 13.57 | 4.5 | PASS |
| ink2 #38466A | aqua #D9F1F7 | aqua card: body | 7.94 | 4.5 | PASS |
| accentHover #1D4ED8 | aqua #D9F1F7 | aqua card: link/CTA text | 5.70 | 4.5 | PASS |
| ink3 #5F6B85 | aqua #D9F1F7 | aqua card: muted (avoid?) | 4.55 | 4.5 | PASS |

Only failures: `ink-3` on periwinkle (4.43) and lavender (4.48), marginal; resolved by the rule above. The "decorative" row (hairline) is exempt. Dark mode is out of scope (site is light-only per SPEC).

## 6. Open choices
1. Body face: Inter (recommended) vs keep IBM Plex Sans. One-line swap either way.
2. Heading width: 118% (matches reference) vs 125% (louder). Also decide whether to ship the pinned 46 KB subset or Fontsource's 124 KB variable files.
3. Navy shade #0B1F4D confirmed here by contrast; user still confirms visually (SPEC open question 4).
4. Whether card tints get used with a per-project saturated "deep" variant (navy/accent/indigo solid) for one hero project, as the reference does.
5. teal/mint iOS hex not verified; not in the set.

## 7. Sources
- Apple HIG, Color: https://developer.apple.com/design/human-interface-guidelines/color
- Fontsource variable packages (OFL-1.1): archivo, inter, mona-sans, hubot-sans, anybody, unbounded, lexend, others via npm `@fontsource-variable/*`; metadata.json subsets and axes inspected locally.
- WCAG 2.x contrast formula (relative luminance), computed locally.
- Local measurements: Playwright render and text-width probes (Chromium), fontTools instancer for pinned subset sizes.

**Status:** DONE
**Summary:** Archivo (wdth ~118, 700) + Inter body; keep #2563EB; full token set and AA table delivered with three local preview images.
**Concerns/Blockers:** Starter layout.tsx loads latin-only font subsets, which would break Vietnamese; teal/mint iOS values unverified; reference headline crop in the preview image is partially cut (comparison done by width measurement instead).
