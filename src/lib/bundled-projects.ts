import { projectEntries } from "../../content/index.ts";
import { parseProjects } from "../../content/schema.ts";
import type { InvalidRowPolicy } from "./projects";

/** content/ parsed at build time — the production fallback for invalid DB rows. */
export function bundledProjects() {
  const parsed = parseProjects(projectEntries);
  if (!parsed.ok) {
    console.error("[projects] bundled content/ is invalid:", parsed.errors);
    return [];
  }
  return parsed.projects;
}

/**
 * Production (and not an e2e run) → fall back to bundled content; anywhere
 * else → throw, so a stale local/test DB fails loudly.
 */
export function invalidRowPolicy(env: { NODE_ENV?: string; PORTFOLIO_E2E?: string }): InvalidRowPolicy {
  return env.NODE_ENV === "production" && env.PORTFOLIO_E2E !== "1"
    ? { mode: "fallback", bundled: bundledProjects() }
    : { mode: "throw" };
}
