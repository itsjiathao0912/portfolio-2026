
## From the work/case lane (03-10-26)

1. **content/schema.ts (owned by another lane)** — please add, when convenient:
   - `projectMetaSchema.headline: z.string().default("")` (case-study H1 sentence) and `tone: z.enum(["light","deep"]).default("light")`.
   - Content block `steps` {items: {title, text}[]} and an `image.size: "column" | "wide" | "bleed"` field (GAPS B9 / B11), plus `heading.icon?: string`.
   Until then these live in `content/projects/presentation.ts` (headline, tone, device mockup / illustration per slug) and the `features` block renders as the numbered steps grid. Section icons are matched from heading text in `case-study-toc.tsx`. Moving them into the schema is a pure data move; no UI change needed.
2. **src/app/template.tsx** — the `.page-enter` wrapper animates `transform`, which turns `position: fixed` descendants into wrapper-relative. The case-study TOC, section menu and reading-progress bar now portal to `<body>` to work around it. If the page transition could animate `opacity` only (or `translate` that ends at `none`), fixed children would work without portals.
3. **Nav (global lane)** — the reference's work page has no per-page header; our index now has only an sr-only H1 and starts right under the nav (y 238). If the nav ever gets taller, `src/app/work/page.tsx` `md:pt-[150px]` needs to follow it.
