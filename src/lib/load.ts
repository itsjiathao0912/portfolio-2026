import { cache } from "react";
import { getDb } from "./db";
import { getPublishedProjectBySlug, listPublishedProjects } from "./projects";
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
    return (await listPublishedProjects(getDb())).projects;
  } catch (error) {
    console.error("[load] projects unavailable:", error);
    return [];
  }
});

export const loadProject = cache(async (slug: string) => {
  try {
    const result = await getPublishedProjectBySlug(getDb(), slug);
    return result.ok ? result.project : null;
  } catch (error) {
    console.error("[load] project unavailable:", error);
    return null;
  }
});
