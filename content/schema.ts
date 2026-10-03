// Content schema — the single definition of what the site's content is.
//
// Imported by the app (via `@content/schema.ts`), by the bun unit tests, AND by
// plain Node (`scripts/seed.mjs`, using Node 22's built-in type stripping).
// That last consumer is why every import in content/ uses RELATIVE paths with an
// explicit `.ts` extension and erasable-only TypeScript (no enums, no
// namespaces, no parameter properties): Node strips types, it does not compile.

import { z } from "zod";

const slugSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase kebab-case");

/** Site-relative asset path (served from public/) or an absolute https URL. */
const assetSchema = z.string().regex(/^(\/[^\s]+|https:\/\/[^\s]+)$/, "asset must be a /path or https URL");

/** Pastel card tints — must match the `--tint-*` tokens in src/app/globals.css. */
export const TINTS = ["sky", "periwinkle", "lavender", "rose", "peach", "butter", "mint", "aqua"] as const;
export const tintSchema = z.enum(TINTS);

/** Lucide icon names allowed on a case-study section heading (shown in the TOC). */
export const SECTION_ICONS = [
  "compass",
  "circle-alert",
  "user-round",
  "package",
  "workflow",
  "badge-check",
  "layers",
  "sparkles",
  "shield-check",
  "git-branch",
  "truck",
  "chart-column",
  "flask-conical",
  "calendar-days",
  "hash",
] as const;
export const sectionIconSchema = z.enum(SECTION_ICONS);

const metricSchema = z.object({ value: z.string().min(1), label: z.string().min(1) });
const linkSchema = z.object({ label: z.string().min(1), href: z.string().url() });
const stepSchema = z.object({ title: z.string().min(1), text: z.string().min(1) });

/** One screen inside a device mockup. */
const mockupScreenSchema = z.object({ src: assetSchema, alt: z.string().min(1) });

/** The project's cover visual on cards and the case-study hero. */
export const projectVisualSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("mockup"),
    /** Main device. `browser-free` is a floating, frameless screen card. */
    device: z.enum(["laptop", "phone", "browser-free"]),
    screen: mockupScreenSchema,
    /** Optional second screen, shown as a smaller overlapping card. */
    secondary: mockupScreenSchema.optional(),
  }),
  z.object({
    kind: z.literal("illustration"),
    /** Which original abstract motif to draw. */
    motif: z.enum(["billing", "games", "lineage"]),
  }),
]);

/** Ordered, typed content blocks that make up a case-study body. */
export const contentBlockSchema = z.discriminatedUnion("type", [
  // `toc` (default true for level 2) puts the heading in the case-study table of contents.
  z.object({
    type: z.literal("heading"),
    text: z.string().min(1),
    level: z.union([z.literal(2), z.literal(3)]).default(2),
    eyebrow: z.string().optional(),
    /** TOC icon for this section; omitted = matched from the heading text. */
    icon: sectionIconSchema.optional(),
  }),
  z.object({ type: z.literal("paragraph"), text: z.string().min(1) }),
  // `src: null` renders a designed placeholder frame instead of a broken image.
  z.object({
    type: z.literal("image"),
    src: assetSchema.nullable(),
    alt: z.string().min(1),
    caption: z.string().optional(),
    device: z.enum(["browser", "plain"]).default("browser"),
    /** `column` = 800 px reading column, `wide` = 1040 px, `bleed` = full screen width. */
    size: z.enum(["column", "wide", "bleed"]).default("column"),
  }),
  z.object({ type: z.literal("quote"), text: z.string().min(1), attribution: z.string().optional() }),
  z.object({ type: z.literal("list"), items: z.array(z.string().min(1)).min(1), ordered: z.boolean().default(false) }),
  z.object({ type: z.literal("metrics"), items: z.array(metricSchema).min(1).max(4) }),
  // Numbered two-column story grid ("1." / "2." numerals above a title + text).
  z.object({ type: z.literal("steps"), items: z.array(stepSchema).min(1) }),
  // Legacy name for `steps`, kept so older stored rows still render; renders identically.
  z.object({ type: z.literal("features"), items: z.array(stepSchema).min(1) }),
  z.object({
    type: z.literal("gallery"),
    images: z.array(z.object({ src: assetSchema, alt: z.string().min(1), caption: z.string().optional() })).min(1),
  }),
  z.object({ type: z.literal("stack"), items: z.array(z.string().min(1)).min(1) }),
  z.object({ type: z.literal("links"), items: z.array(linkSchema).min(1) }),
  z.object({ type: z.literal("callout"), text: z.string().min(1) }),
]);

export const projectLinkSchema = linkSchema;

/** Presentation fields that are not part of the core Project row (stored as ProjectMeta). */
export const projectMetaSchema = z.object({
  company: z.string().default(""),
  subtitle: z.string().default(""),
  status: z.string().default(""),
  tint: tintSchema.default("sky"),
  logo: assetSchema.nullable().default(null),
  coverAlt: z.string().default(""),
  featured: z.boolean().default(false),
  proof: z.array(metricSchema).max(3).default([]),
  /** Outcome-style sentence: case-study H1 and card headline. Empty = fall back to summary/subtitle. */
  headline: z.string().default(""),
  /** Card variant: `light` = pastel tint; `deep` = solid navy with white text. */
  tone: z.enum(["light", "deep"]).default("light"),
  visual: projectVisualSchema.default({ kind: "illustration", motif: "lineage" }),
});

/** Authoring shape: what a file in content/projects/ exports. */
export const projectInputSchema = z.object({
  id: z.string().min(1),
  slug: slugSchema,
  title: z.string().min(1),
  summary: z.string().default(""),
  role: z.string().default(""),
  period: z.string().default(""),
  year: z.number().int().min(1900).max(2100).nullable().default(null),
  category: z.string().default(""),
  tags: z.array(z.string().min(1)).default([]),
  cover: assetSchema.nullable().default(null),
  blocks: z.array(contentBlockSchema).default([]),
  links: z.array(projectLinkSchema).default([]),
  sortOrder: z.number().int().default(0),
  published: z.boolean().default(false),
  updatedAt: z.string().datetime(),
  meta: projectMetaSchema.default({}),
});

export type ContentBlock = z.infer<typeof contentBlockSchema>;
export type ProjectLink = z.infer<typeof projectLinkSchema>;
export type ProjectMeta = z.output<typeof projectMetaSchema>;
export type Tint = z.infer<typeof tintSchema>;
export type ProjectVisual = z.output<typeof projectVisualSchema>;
export type SectionIcon = z.infer<typeof sectionIconSchema>;
/** Input type for authors (defaults may be omitted). */
export type ProjectInput = z.input<typeof projectInputSchema>;
/** Fully-resolved project after validation. */
export type Project = z.output<typeof projectInputSchema>;

/** Lowercase kebab anchor id for a heading, stable across renders. */
export function headingAnchor(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Table-of-contents entries: every level-2 heading, in order. */
export function tocEntries(blocks: readonly ContentBlock[]) {
  return blocks.flatMap((block) =>
    block.type === "heading" && block.level === 2
      ? [{ id: headingAnchor(block.text), label: block.text, ...(block.icon ? { icon: block.icon } : {}) }]
      : []
  );
}

/**
 * Validate every content entry and check cross-entry invariants (unique id and
 * slug, unique heading anchors per project). Returns a result object instead of
 * throwing so callers decide how to surface errors.
 */
export function parseProjects(inputs: readonly unknown[]) {
  const projects: Project[] = [];
  const errors: string[] = [];

  inputs.forEach((input, index) => {
    const parsed = projectInputSchema.safeParse(input);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`);
      errors.push(`entry #${index}: ${issues.join("; ")}`);
      return;
    }
    projects.push(parsed.data);
  });

  for (const key of ["id", "slug"] as const) {
    const seen = new Set<string>();
    for (const project of projects) {
      if (seen.has(project[key])) errors.push(`duplicate ${key}: ${project[key]}`);
      seen.add(project[key]);
    }
  }

  for (const project of projects) {
    const anchors = tocEntries(project.blocks).map((entry) => entry.id);
    const dupes = anchors.filter((id, i) => anchors.indexOf(id) !== i);
    if (dupes.length > 0) errors.push(`${project.slug}: duplicate section heading ${dupes[0]}`);
  }

  if (errors.length > 0) return { ok: false, errors } as const;
  return { ok: true, projects } as const;
}

// ── Site-wide content (profile, experience, recognition, skills) ───────────────

export const profileSchema = z.object({
  name: z.string().min(1),
  nameLocal: z.string().min(1),
  title: z.string().min(1),
  location: z.string().min(1),
  availability: z.string().default(""),
  headline: z.string().min(1),
  tagline: z.string().min(1),
  summary: z.string().min(1),
  email: z.string().email(),
  socials: z.array(z.object({ label: z.string().min(1), href: z.string().url() })).min(1),
  cv: assetSchema.nullable().default(null),
  /** Headshot shown in the home hero (B/W, colour on hover). Null renders a placeholder. */
  portrait: assetSchema.nullable().default(null),
  /** One short line under the hero headline, e.g. "4+ years in product. Vietnamese." */
  intro: z.string().default(""),
  /** Company named in the hero sentence "<name> is <title> at <company>". */
  company: z.string().default(""),
});

export const experienceSchema = z.object({
  id: z.string().min(1),
  company: z.string().min(1),
  role: z.string().default(""),
  period: z.string().default(""),
  url: z.string().url().nullable().default(null),
  logo: assetSchema.nullable().default(null),
  domain: z.string().default(""),
  summary: z.string().default(""),
  bullets: z.array(z.string().min(1)).default([]),
  highlight: z.string().default(""),
  /** Earlier roles render in a compact list below the main timeline. */
  earlier: z.boolean().default(false),
  /** Author note about missing details. Shown only in development. */
  gap: z.string().default(""),
});

export const educationSchema = z.object({
  id: z.string().min(1),
  school: z.string().min(1),
  degree: z.string().min(1),
  detail: z.string().default(""),
  period: z.string().default(""),
});

export const certificationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  issuer: z.string().min(1),
  url: z.string().url().nullable().default(null),
});

export const awardSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  result: z.string().min(1),
  year: z.string().default(""),
});

export const skillGroupSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  items: z.array(z.string().min(1)).min(1),
});

export const siteSchema = z.object({
  profile: profileSchema,
  experience: z.array(experienceSchema).min(1),
  education: z.array(educationSchema).default([]),
  certifications: z.array(certificationSchema).default([]),
  awards: z.array(awardSchema).default([]),
  skills: z.array(skillGroupSchema).default([]),
});

export type SiteInput = z.input<typeof siteSchema>;
export type Site = z.output<typeof siteSchema>;
export type Experience = z.output<typeof experienceSchema>;

/** Collections stored in the "ContentEntry" table, one row per item. */
export const SITE_COLLECTIONS = ["profile", "experience", "education", "certifications", "awards", "skills"] as const;
export type SiteCollection = (typeof SITE_COLLECTIONS)[number];

export function parseSite(input: unknown) {
  const parsed = siteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`),
    } as const;
  }
  const errors: string[] = [];
  for (const key of ["experience", "education", "certifications", "awards", "skills"] as const) {
    const ids = parsed.data[key].map((item) => item.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (dupes.length > 0) errors.push(`duplicate ${key} id: ${dupes[0]}`);
  }
  if (errors.length > 0) return { ok: false, errors } as const;
  return { ok: true, site: parsed.data } as const;
}
