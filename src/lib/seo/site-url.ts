/** Canonical production origin. Override with the SITE_URL env var (e.g. a preview). */
export const DEFAULT_SITE_URL = "https://itsjiathao.com";

function normalise(raw: string | undefined) {
  const value = raw?.trim();
  if (!value) return DEFAULT_SITE_URL;
  try {
    return new URL(value).origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export const SITE_URL = normalise(typeof process !== "undefined" ? process.env["SITE_URL"] : undefined);

/** Absolute URL for a site path ("/work" → "https://itsjiathao.com/work"). */
export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}
