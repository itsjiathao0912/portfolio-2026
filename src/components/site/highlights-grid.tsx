import { ArrowUpRight, Award, BadgeCheck, Trophy } from "lucide-react";
import type { Site } from "@content/schema.ts";
import { DotGrid } from "./dot-grid";
import { Reveal } from "./reveal";

interface Tile {
  id: string;
  icon: "trophy" | "award" | "cert";
  title: string;
  text: string;
  href: string | null;
  lang?: string;
}

const ICONS = { trophy: Trophy, award: Award, cert: BadgeCheck } as const;

/** Pick the lead tile + six supporting tiles from awards and certifications. */
export function buildHighlights(site: Pick<Site, "awards" | "certifications">) {
  const [lead, ...awards] = site.awards;
  const tiles: Tile[] = [
    ...site.certifications.map((c) => ({ id: c.id, icon: "cert" as const, title: c.name, text: c.issuer, href: c.url })),
    ...awards.map((a) => ({
      id: a.id,
      icon: "award" as const,
      title: a.name,
      text: `${a.result}${a.year ? ` · ${a.year}` : ""}`,
      href: null,
      lang: "vi",
    })),
  ].slice(0, 6);
  return { lead: lead ?? null, tiles };
}

/**
 * Highlights band on the grey canvas: one large lead tile plus a 3x2 grid of
 * smaller ones, a faint cursor-reactive dot grid behind. Tiles fade up in a
 * stagger as they enter (≥1024px; fade only under reduced motion).
 */
export function HighlightsGrid({ site }: { site: Pick<Site, "awards" | "certifications"> }) {
  const { lead, tiles } = buildHighlights(site);
  return (
    <section
      id="highlights"
      aria-labelledby="highlights-title"
      className="relative overflow-hidden bg-canvas py-24 md:py-[150px]"
      data-testid="section-highlights"
    >
      <DotGrid className="opacity-25" />
      <h2 id="highlights-title" className="sr-only">
        Highlights
      </h2>
      <ul className="relative mx-auto grid max-w-[1320px] gap-x-10 gap-y-16 px-10 md:grid-cols-2 lg:grid-cols-4 lg:px-[60px]">
        {lead ? (
          <Reveal as="li" index={0} className="flex flex-col gap-5 text-center md:text-left lg:row-span-2">
            <Trophy className="mx-auto size-12 text-ink-1 md:mx-0" aria-hidden="true" strokeWidth={1.6} />
            <p className="font-display text-[40px] leading-[1.05] text-ink-1 md:text-[50px]" data-testid="highlight-lead">
              {lead.result.split("·")[0].trim()}
            </p>
            <p className="text-[18px] leading-[1.6] text-ink-1">
              {lead.name}
              {lead.result.includes("·") ? ` — with ${lead.result.split("·").slice(1).join("·").trim()}` : ""}.
            </p>
          </Reveal>
        ) : null}
        {tiles.map((tile, index) => {
          const Icon = ICONS[tile.icon];
          return (
            <Reveal as="li" key={tile.id} index={index + 1} className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
              <Icon className="size-9 text-ink-3" aria-hidden="true" strokeWidth={1.6} />
              <h3 className="mt-2 text-[24px] leading-[1.3]" lang={tile.lang}>
                {tile.title}
              </h3>
              <p className="text-[14px] leading-[1.6] text-ink-3">{tile.text}</p>
              {tile.href ? (
                <a
                  href={tile.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-[15px] text-ink-3 transition-colors hover:text-ink-1"
                >
                  See credential <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
              ) : null}
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}
