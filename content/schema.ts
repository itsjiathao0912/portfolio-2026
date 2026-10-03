// Content schema — the single definition of what a Project is.
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

/** Ordered, typed content blocks that make up a case-study body. */
export const contentBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("heading"), text: z.string().min(1), level: z.union([z.literal(2), z.literal(3)]).default(2) }),
  z.object({ type: z.literal("paragraph"), text: z.string().min(1) }),
  z.object({ type: z.literal("image"), src: z.string().min(1), alt: z.string(), caption: z.string().optional() }),
  z.object({ type: z.literal("quote"), text: z.string().min(1), attribution: z.string().optional() }),
  z.object({ type: z.literal("list"), items: z.array(z.string().min(1)).min(1), ordered: z.boolean().default(false) }),
]);

export const projectLinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().url(),
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
  cover: z.string().min(1).nullable().default(null),
  blocks: z.array(contentBlockSchema).default([]),
  links: z.array(projectLinkSchema).default([]),
  sortOrder: z.number().int().default(0),
  published: z.boolean().default(false),
  updatedAt: z.string().datetime(),
});

export type ContentBlock = z.infer<typeof contentBlockSchema>;
export type ProjectLink = z.infer<typeof projectLinkSchema>;
/** Input type for authors (defaults may be omitted). */
export type ProjectInput = z.input<typeof projectInputSchema>;
/** Fully-resolved project after validation. */
export type Project = z.output<typeof projectInputSchema>;

/**
 * Validate every content entry and check cross-entry invariants (unique id and
 * slug). Returns a result object instead of throwing so callers decide how to
 * surface errors.
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

  if (errors.length > 0) return { ok: false, errors } as const;
  return { ok: true, projects } as const;
}
