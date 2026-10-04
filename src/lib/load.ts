import { cache } from "react";
import { siteEntry } from "../../content/index.ts";
import { parseSite } from "../../content/schema.ts";
import { bundledProjects } from "./bundled-projects";

// Page renders read the content/ bundled into the build, not D1. Content only
// changes on deploy (deploy-prod re-seeds D1 from the same content/), so the
// pages can prerender and be served from the edge cache (see worker-entry.mjs).
// This keeps every page render off D1 and under the Workers Free CPU cap.
// D1 still backs /api/* (visits, stats, poll) and /api/health.

export const loadSite = cache(async () => {
  const result = parseSite(siteEntry);
  if (!result.ok) {
    console.error("[load] bundled site content is invalid:", result.errors);
    return null;
  }
  return result.site;
});

const publishedProjects = () =>
  bundledProjects()
    .filter((p) => p.published)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));

export const loadProjects = cache(async () => publishedProjects());

export const loadProject = cache(async (slug: string) => publishedProjects().find((p) => p.slug === slug) ?? null);
