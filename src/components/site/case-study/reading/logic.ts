// Pure logic for the case-study reading aids (depth filtering, defaults, runs).
// No React, no DOM: unit-tested. Depth model:
//   skim = hero + insight + decision cards + results band
//   read = adds the story and the case's interactive blocks (default)
//   deep = adds sources, stack, appendix
import { headingAnchor, type ContentBlock, type Depth, type SectionIcon } from "@content/schema.ts";

export type { Depth };
export const DEPTH_ORDER = ["skim", "read", "deep"] as const satisfies readonly Depth[];
const RANK: Record<Depth, number> = { skim: 0, read: 1, deep: 2 };

export const DEPTH_LABEL: Record<Depth, { name: string; hint: string }> = {
  skim: { name: "Skim", hint: "30 s" },
  read: { name: "Read", hint: "3 min" },
  deep: { name: "Deep dive", hint: "all of it" },
};

/** Persona → default depth. Only recruiters and engineers move; everyone else reads. */
export function defaultDepthForPersona(persona: string | null | undefined): Depth {
  if (persona === "recruiter") return "skim";
  if (persona === "engineer") return "deep";
  return "read";
}

export function isDepth(value: unknown): value is Depth {
  return value === "skim" || value === "read" || value === "deep";
}

/** `#skim`, `#read`, `#deep` in the URL pick the depth. Anything else is ignored. */
export function parseDepthHash(hash: string): Depth | null {
  const word = hash.replace(/^#/, "").toLowerCase();
  return isDepth(word) ? word : null;
}

export interface StoredDepth {
  depth: Depth;
  /** Persona the visitor had when they chose, so a persona switch re-derives the default. */
  persona: string | null;
}

export function parseStoredDepth(raw: unknown): StoredDepth | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as { depth?: unknown; persona?: unknown };
  if (!isDepth(r.depth)) return null;
  return { depth: r.depth, persona: typeof r.persona === "string" ? r.persona : null };
}

/** URL hash beats an explicit choice (made under the same persona), which beats the persona default. */
export function resolveDepth(input: { hash: string; stored: StoredDepth | null; persona: string | null }): Depth {
  const fromHash = parseDepthHash(input.hash);
  if (fromHash) return fromHash;
  if (input.stored && input.stored.persona === input.persona) return input.stored.depth;
  return defaultDepthForPersona(input.persona);
}

/** The shallowest depth in a list: the first tier that reveals any of it. */
export function shallowest(depths: readonly Depth[]): Depth {
  return depths.reduce<Depth>((acc, d) => (RANK[d] < RANK[acc] ? d : acc), "deep");
}

export function isVisibleAt(blockDepth: Depth, mode: Depth) {
  return RANK[blockDepth] <= RANK[mode];
}

/** Depth of every block. A level-2 heading sets the depth of its section; decisions and results default to skim. */
export function effectiveDepths(blocks: readonly ContentBlock[]): Depth[] {
  let section: Depth = "read";
  return blocks.map((block) => {
    if (block.type === "heading" && block.level === 2) {
      section = block.depth ?? "read";
      return section;
    }
    if (block.depth) return block.depth;
    if (block.type === "decision" || block.type === "results") return "skim";
    return section;
  });
}

export interface Run {
  depth: Depth;
  start: number;
  /** Exclusive. */
  end: number;
}

/** Consecutive blocks with the same depth form one run. */
export function groupRuns(depths: readonly Depth[]): Run[] {
  const runs: Run[] = [];
  depths.forEach((depth, index) => {
    const last = runs[runs.length - 1];
    if (last && last.depth === depth) last.end = index + 1;
    else runs.push({ depth, start: index, end: index + 1 });
  });
  return runs;
}

export interface DepthTocEntry {
  id: string;
  label: string;
  icon?: SectionIcon;
  depth: Depth;
}

/** TOC entries (level-2 headings) with the depth each one needs. */
export function tocWithDepth(blocks: readonly ContentBlock[]): DepthTocEntry[] {
  const depths = effectiveDepths(blocks);
  return blocks.flatMap((block, index) =>
    block.type === "heading" && block.level === 2
      ? [{ id: headingAnchor(block.text), label: block.text, ...(block.icon ? { icon: block.icon } : {}), depth: depths[index] }]
      : [],
  );
}

export function visibleToc<T extends { depth?: Depth }>(entries: readonly T[], mode: Depth): T[] {
  return entries.filter((entry) => isVisibleAt(entry.depth ?? "read", mode));
}

/** Text for the collapsed-run stub: what the next depth adds. */
export function stubSummary(blocks: readonly ContentBlock[], runs: readonly Run[], mode: Depth) {
  const hidden = runs.filter((run) => !isVisibleAt(run.depth, mode));
  const headings = hidden.flatMap((run) =>
    blocks.slice(run.start, run.end).flatMap((b) => (b.type === "heading" && b.level === 2 ? [b.text] : [])),
  );
  const unlockAt = hidden.reduce<Depth>((acc, run) => (RANK[run.depth] < RANK[acc] ? run.depth : acc), "deep");
  const count = Math.max(headings.length, hidden.length > 0 ? 1 : 0);
  return { count, headings, unlockAt };
}

// ── Evidence + role badges ─────────────────────────────────────────────────────

/** Settled-green = sourced from a published figure; muted = modelled, targeted or demo data. */
export type EvidenceTone = "settled" | "muted";

export function evidenceTone(label: string): EvidenceTone {
  return /^(live|company|public|published)/i.test(label.trim()) ? "settled" : "muted";
}

export const ROLE_LABEL = { owned: "Thao owned", team: "Team build", platform: "Platform" } as const;
