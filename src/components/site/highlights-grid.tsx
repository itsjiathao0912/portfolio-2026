import { ArrowUpRight, Award, ChartColumn, Cloud, Database, Gamepad2, Lightbulb, Rocket, Sparkles, Trophy } from "lucide-react";
import type { Site } from "@content/schema.ts";
import { EmojiBurst } from "@/components/motion/emoji-burst";
import { LiftCard } from "@/components/ui/lift-card";
import { Reveal } from "./reveal";

const GLYPHS = { cloud: Cloud, database: Database, chart: ChartColumn, lightbulb: Lightbulb, rocket: Rocket, gamepad: Gamepad2, sparkles: Sparkles, award: Award } as const;
type Glyph = keyof typeof GLYPHS;

/** A distinct mark + colour per issuer/award, so no two tiles share a badge. */
const BY_ID: Record<string, { glyph: Glyph; color: string }> = {
  "aws-saa": { glyph: "cloud", color: "#f59e0b" },
  "oci-architect": { glyph: "database", color: "#dc2626" },
  "google-data": { glyph: "chart", color: "#2563eb" },
  "business-hackathon": { glyph: "lightbulb", color: "#eab308" },
  "hanh-trinh-kinh-doanh": { glyph: "rocket", color: "#7c3aed" },
  "vng-gaming": { glyph: "gamepad", color: "#0891b2" },
  "khoi-nghiep-kawaii": { glyph: "sparkles", color: "#db2777" },
};
const FALLBACK: Glyph[] = ["award", "sparkles", "rocket", "lightbulb"];

interface Tile {
  id: string;
  icon: "trophy" | "award" | "cert";
  glyph: Glyph;
  color: string;
  title: string;
  text: string;
  href: string | null;
  lang?: string;
}

/** Pick the lead tile + six supporting tiles from awards and certifications. */
export function buildHighlights(site: Pick<Site, "awards" | "certifications">) {
  const [lead, ...awards] = site.awards;
  const raw = [
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
  const tiles: Tile[] = raw.map((t, i) => ({ ...t, ...(BY_ID[t.id] ?? { glyph: FALLBACK[i % FALLBACK.length], color: "#6b6c72" }) }));
  return { lead: lead ?? null, tiles };
}

/**
 * Highlights bento on the grey canvas: a tall lead tile (the 2nd-place award,
 * bursts trophies on hover/tap) beside six white tiles, each with its own
 * coloured mark. Tiles fade up in a 60ms stagger; reduced motion: fade only.
 */
export function HighlightsGrid({ site, footer }: { site: Pick<Site, "awards" | "certifications">; footer?: React.ReactNode }) {
  const { lead, tiles } = buildHighlights(site);
  return (
    <section
      id="highlights"
      aria-labelledby="highlights-title"
      className="relative overflow-hidden bg-canvas py-14 md:py-[80px]"
      data-testid="section-highlights"
    >
      <h2 id="highlights-title" className="sr-only">
        Highlights
      </h2>
      <ul className="relative mx-auto grid max-w-[1320px] grid-cols-2 gap-3 px-4 md:grid-cols-2 md:gap-5 md:px-10 lg:grid-cols-4 lg:px-[60px]">
        {lead ? (
          <Reveal
            as="li"
            index={0}
            stagger={0.06}
            className="col-span-2 lg:col-span-1 lg:row-span-2"
          >
            <LiftCard radius="rounded-[24px]" className="h-full">
            <div className="flex h-full flex-col justify-between gap-6 rounded-[24px] bg-gradient-to-b from-[#fff4d6] via-[#fff9ec] to-bg p-7 text-ink-1 md:p-9">
            <EmojiBurst emojis={["🏆", "🥈", "🇻🇳", "🎉"]} className="relative inline-flex self-start">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-white shadow-1">
                <Trophy className="size-8 text-[#fbbf24]" aria-hidden="true" strokeWidth={1.8} />
              </span>
            </EmojiBurst>
            <div className="flex flex-col gap-4">
              <p className="font-display text-[44px] leading-[1.02] text-ink-1 md:text-[56px]" data-testid="highlight-lead">
                {lead.result.split("·")[0].trim()}
              </p>
              <p className="text-[17px] leading-[1.55] text-ink-2">
                {lead.name}
                {lead.result.includes("·") ? ` — with ${lead.result.split("·").slice(1).join("·").trim()}` : ""}.
              </p>
            </div>
            </div>
            </LiftCard>
          </Reveal>
        ) : null}
        {tiles.map((tile, index) => {
          const Icon = GLYPHS[tile.glyph];
          return (
            <Reveal
              as="li"
              key={tile.id}
              index={index + 1}
              stagger={0.06}
              className="flex"
            >
              <LiftCard radius="rounded-[24px]" className="w-full">
              <div className="flex h-full flex-col gap-3 rounded-[24px] bg-bg p-5 md:p-7">
              <span
                data-testid="highlight-icon"
                data-glyph={tile.glyph}
                className="flex size-11 items-center justify-center rounded-xl"
                style={{ background: `${tile.color}1f`, color: tile.color }}
              >
                <Icon className="size-6" aria-hidden="true" strokeWidth={1.8} />
              </span>
              <h3 className="mt-1 text-[17px] leading-[1.25] md:text-[22px]" lang={tile.lang}>
                {tile.title}
              </h3>
              <p className="text-[13px] leading-[1.5] text-ink-3 md:text-[14px]">{tile.text}</p>
              {tile.href ? (
                <a
                  href={tile.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex min-h-11 items-center gap-1 text-[14px] text-ink-3 transition-colors hover:text-ink-1"
                >
                  Credential <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
              ) : null}
              </div>
              </LiftCard>
            </Reveal>
          );
        })}
        {footer ? <li className="col-span-2 mt-2 lg:col-span-4">{footer}</li> : null}
      </ul>
    </section>
  );
}
