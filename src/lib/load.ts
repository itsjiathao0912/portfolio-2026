import { cache } from "react";
import { getDb } from "./db";
import { invalidRowPolicy } from "./bundled-projects";
import { getPublishedProjectBySlug, InvalidProjectRowsError, listPublishedProjects } from "./projects";
import { getSiteContent } from "./site";

// Per-request memoised loaders, shared by the layout, pages and metadata.
// A database failure is logged and turned into an empty/error result, so the
// shell (nav, footer, 404) still renders.

export const loadSite = cache(async () => {
  try {
    const result = await getSiteContent(getDb());
    return result.ok ? result.site : null;
  } catch (error) {
    console.error("[load] site content unavailable:", error);
    return null;
  }
});

export const loadProjects = cache(async () => {
  try {
    return (await listPublishedProjects(getDb(), invalidRowPolicy(process.env))).projects;
  } catch (error) {
    // A stale/invalid row must surface, never become an empty page.
    if (error instanceof InvalidProjectRowsError) throw error;
    console.error("[load] projects unavailable:", error);
    return [];
  }
});

export const loadProject = cache(async (slug: string) => {
  try {
    const result = await getPublishedProjectBySlug(getDb(), slug, invalidRowPolicy(process.env));
    return result.ok ? result.project : null;
  } catch (error) {
    if (error instanceof InvalidProjectRowsError) throw error;
    console.error("[load] project unavailable:", error);
    return null;
  }
});
