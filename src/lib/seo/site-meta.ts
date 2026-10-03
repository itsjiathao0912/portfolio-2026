import site from "@content/site.ts";
import { projectEntries } from "@content/index.ts";
import { parseProjects, type Project } from "@content/schema.ts";

// Static, DB-free source for SEO surfaces (metadata defaults, sitemap, OG
// images). Content is seeded from content/, so this matches what the pages show,
// and it works at build time where there is no Cloudflare context.

const { profile } = site;

export const SITE_NAME = profile.name;
export const SITE_TITLE = `${profile.name} — ${profile.title}`;
export const SITE_DESCRIPTION = `${profile.name} is a ${profile.title} building fintech, payments and compliance products — billing engines, on-chain ledgers and compliance copilots — in ${profile.location}.`;
export const SITE_KEYWORDS = [
  "Thao Dao",
  "Technical Product Manager",
  "Product Manager",
  "Technical Product Owner",
  "fintech",
  "payments",
  "compliance",
  "RegTech",
  "billing platform",
  "blockchain",
  "Ho Chi Minh City",
  "Vietnam",
  "portfolio",
  "case studies",
];
export const SOCIAL_LINKS = profile.socials.map((s) => s.href);

let cached: readonly Project[] | null = null;

/** Published case studies from content/, in display order. */
export function bundledCaseStudies() {
  if (!cached) {
    const parsed = parseProjects(projectEntries);
    cached = parsed.ok ? [...parsed.projects].filter((p) => p.published).sort((a, b) => a.sortOrder - b.sortOrder) : [];
  }
  return cached;
}

export function bundledCaseStudy(slug: string) {
  return bundledCaseStudies().find((p) => p.slug === slug) ?? null;
}

/** Plain-text description for a case study: lede, else summary. */
export function caseStudyDescription(project: Pick<Project, "summary" | "meta">) {
  const text = [project.meta.headline, project.meta.lede || project.summary].filter(Boolean).join(" ");
  return text.length > 200 ? `${text.slice(0, 197).trimEnd()}…` : text;
}
