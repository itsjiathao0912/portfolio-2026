// Places and corridors on the settlement globe, derived from content/projects.
// Titles, colours and slugs come from the project files themselves; the only
// thing added here is WHERE each project happened, with the line in the
// project file that states it (see `source`). No figures are invented: the
// card's stat line is copied from that project's own `meta.proof`.

import cosap from "../../../../content/projects/cosap.ts";
import cortexSentinel from "../../../../content/projects/cortex-sentinel.ts";
import gocrypto from "../../../../content/projects/gocrypto.ts";
import guardline from "../../../../content/projects/guardline.ts";
import ledgr from "../../../../content/projects/ledgr.ts";
import zaloGameCenter from "../../../../content/projects/zalo-game-center.ts";

export type Place = { id: string; name: string; lat: number; lon: number };

type ProjectLike = {
  slug: string;
  title: string;
  summary: string;
  meta: { color?: string; proof?: readonly { value: string; label: string }[] };
};

export type Corridor = {
  id: string;
  from: string;
  to: string;
  slug: string;
  title: string;
  summary: string;
  color: string;
  stat: { value: string; label: string } | null;
  href: string;
  source: string;
};

export const PLACES: readonly Place[] = [
  { id: "hcmc", name: "Ho Chi Minh City", lat: 10.82, lon: 106.63 },
  { id: "singapore", name: "Singapore", lat: 1.35, lon: 103.82 },
  { id: "seoul", name: "Seoul", lat: 37.57, lon: 126.98 },
  { id: "manila", name: "Manila", lat: 14.6, lon: 120.98 },
  // "the Gulf" as a corridor; pinned at Dubai as its representative city.
  { id: "gulf", name: "The Gulf", lat: 25.2, lon: 55.27 },
];

function corridor(p: ProjectLike, id: string, from: string, to: string, source: string): Corridor {
  return {
    id,
    from,
    to,
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    color: p.meta.color ?? "#2563eb",
    stat: p.meta.proof?.[0] ?? null,
    href: `/work/${p.slug}`,
    source,
  };
}

const P = (x: unknown) => x as ProjectLike;

export const CORRIDORS: readonly Corridor[] = [
  corridor(P(gocrypto), "gocrypto", "gulf", "manila", "gocrypto.ts: 'The strategy picks the Gulf' corridor into the Philippines"),
  corridor(P(cosap), "cosap-sg", "hcmc", "singapore", "cosap.ts: '2 markets: Korea and Singapore'"),
  corridor(P(cosap), "cosap-kr", "hcmc", "seoul", "cosap.ts: '2 markets: Korea and Singapore'"),
  corridor(P(zaloGameCenter), "zalo", "hcmc", "hcmc", "zalo-game-center.ts: 'Vietnam's leading messaging app'"),
  corridor(P(ledgr), "ledgr", "hcmc", "hcmc", "ledgr.ts: 'Live · Vietnam'"),
  corridor(P(guardline), "guardline", "hcmc", "hcmc", "guardline.ts: 'Hackathon Vietnam 2026'"),
  corridor(P(cortexSentinel), "cortex", "hcmc", "hcmc", "cortex-sentinel.ts: 'Vietnamese AML law'"),
];

export function placeById(id: string) {
  const p = PLACES.find((x) => x.id === id);
  if (!p) throw new Error(`unknown place ${id}`);
  return p;
}

/** Projects pinned at a place (for the pin label). */
export function projectsAt(placeId: string) {
  const titles = new Set<string>();
  for (const c of CORRIDORS) if (c.from === placeId || c.to === placeId) titles.add(c.title);
  return [...titles];
}

/** Corridors drawn as arcs (local projects are pins only). */
export const ARCS = CORRIDORS.filter((c) => c.from !== c.to);
