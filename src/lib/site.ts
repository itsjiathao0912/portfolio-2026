import { queryAll } from "./db";
import { rowsToSite, type ContentEntryRow } from "./site-rows";

/** Load the site-wide content (profile, experience, recognition, skills). */
export async function getSiteContent(db: D1Database) {
  const rows = await queryAll<ContentEntryRow>(db, `SELECT * FROM "ContentEntry"`);
  const result = rowsToSite(rows);
  if (!result.ok) console.error("[site]", result.error);
  return result;
}
