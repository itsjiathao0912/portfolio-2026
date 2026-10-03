import type { CaseBlockComponent, CaseBlockMap } from "./types";

/**
 * Per-slug loaders. Each slug's index is its own chunk, so one case study's
 * interactive pieces never ship on another's page. Lanes edit ONLY their own
 * src/components/case/<slug>/index.tsx — never this file.
 */
export const CASE_SLUG_LOADERS: Record<string, () => Promise<{ blocks: CaseBlockMap }>> = {
  ledgr: () => import("./ledgr"),
  "cortex-sentinel": () => import("./cortex-sentinel"),
  gocrypto: () => import("./gocrypto"),
  cosap: () => import("./cosap"),
  lumicap: () => import("./lumicap"),
  guardline: () => import("./guardline"),
  "zalo-game-center": () => import("./zalo-game-center"),
  "reorc-data-platform": () => import("./reorc-data-platform"),
  pac: () => import("./pac"),
};

/** Split "<slug>/<Name>"; null when malformed. */
export function parseCustomKey(key: string) {
  const match = /^([a-z0-9-]+)\/([A-Za-z0-9]+)$/.exec(key);
  return match ? ({ slug: match[1], name: match[2] } as const) : null;
}

/** Resolve a custom-block key to its component, or null if unknown. Never throws. */
export async function resolveCustomBlock(key: string): Promise<CaseBlockComponent | null> {
  const parsed = parseCustomKey(key);
  if (!parsed) return null;
  const load = CASE_SLUG_LOADERS[parsed.slug];
  if (!load) return null;
  try {
    const mod = await load();
    return Object.prototype.hasOwnProperty.call(mod.blocks, parsed.name) ? mod.blocks[parsed.name] : null;
  } catch {
    return null;
  }
}
