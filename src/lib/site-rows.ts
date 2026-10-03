// Site content (profile, experience, recognition, skills) <-> "ContentEntry" rows.
// Same constraints as project-rows.ts: relative `.ts` imports and erasable-only
// TypeScript, because plain-Node `scripts/seed.mjs` imports this file.

import { siteSchema, SITE_COLLECTIONS, type Site, type SiteCollection } from "../../content/schema.ts";
import type { Statement } from "./project-rows.ts";

export interface ContentEntryRow {
  id: string;
  collection: string;
  sortOrder: number;
  data: string;
  updatedAt: string;
}

/** Flatten the site object into one row per item. Row ids are `collection:itemId`. */
export function siteToRows(site: Site, updatedAt: string) {
  const rows: ContentEntryRow[] = [
    { id: "profile:main", collection: "profile", sortOrder: 0, data: JSON.stringify(site.profile), updatedAt },
  ];
  for (const collection of SITE_COLLECTIONS) {
    if (collection === "profile") continue;
    site[collection].forEach((item, index) => {
      rows.push({ id: `${collection}:${item.id}`, collection, sortOrder: index, data: JSON.stringify(item), updatedAt });
    });
  }
  return rows;
}

/** Upsert every entry and delete rows that are no longer in content/. */
export function buildSiteSeedStatements(site: Site, updatedAt: string) {
  const rows = siteToRows(site, updatedAt);
  const upserts = rows.map(
    (row) =>
      ({
        sql: `INSERT INTO "ContentEntry" ("id", "collection", "sortOrder", "data", "updatedAt") VALUES (?, ?, ?, ?, ?) ON CONFLICT("id") DO UPDATE SET "collection" = excluded."collection", "sortOrder" = excluded."sortOrder", "data" = excluded."data", "updatedAt" = excluded."updatedAt"`,
        params: [row.id, row.collection, row.sortOrder, row.data, row.updatedAt],
      }) satisfies Statement
  );
  const ids = rows.map((row) => row.id);
  const prune = {
    sql: `DELETE FROM "ContentEntry" WHERE "id" NOT IN (${ids.map(() => "?").join(", ")})`,
    params: ids,
  } satisfies Statement;
  return [...upserts, prune];
}

/**
 * Rebuild and validate the site object from rows. Never throws: a missing or
 * corrupt profile/experience fails the whole parse (the page cannot render
 * without them), and the caller decides what to show.
 */
export function rowsToSite(rows: readonly ContentEntryRow[]) {
  const grouped: Record<SiteCollection, unknown[]> = {
    profile: [],
    experience: [],
    education: [],
    certifications: [],
    awards: [],
    skills: [],
  };
  const sorted = [...rows].sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
  for (const row of sorted) {
    if (!(SITE_COLLECTIONS as readonly string[]).includes(row.collection)) continue;
    try {
      grouped[row.collection as SiteCollection].push(JSON.parse(row.data));
    } catch {
      return { ok: false, error: `ContentEntry ${row.id}: data is not valid JSON` } as const;
    }
  }
  const parsed = siteSchema.safeParse({ ...grouped, profile: grouped.profile[0] });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: `site content: ${issue?.path.join(".")} ${issue?.message ?? "invalid"}` } as const;
  }
  return { ok: true, site: parsed.data } as const;
}
