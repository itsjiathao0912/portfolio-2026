import { labOnly } from "@/lib/lab-only";
import type { Metadata } from "next";
import { Briefcase, Link2, Mail, UserRound } from "lucide-react";
import site from "@content/site.ts";
import { GlassCard, KineticHeadline, LightBeam, LightBeamStyles, MagneticDock, StoryChapter } from "@/components/signature/glass";

export const metadata: Metadata = { title: "Lab · Glass", robots: { index: false, follow: false } };

const { profile } = site;
const linkedin = profile.socials.find((s) => s.label === "LinkedIn")?.href ?? "#";

const dock = [
  { label: "Work", href: "/work", icon: <Briefcase /> },
  { label: "About", href: "/about", icon: <UserRound /> },
  { label: `Email ${profile.email}`, href: `mailto:${profile.email}`, icon: <Mail /> },
  { label: "LinkedIn", href: linkedin, icon: <Link2 />, external: true },
];

// Facts from content/ + user-decisions note only.
const cards = [
  { k: "Compliance", t: "Ledgr", d: "27 verified rules across 6 document types today; 100+ is the roadmap." },
  { k: "Fintech", t: "Cortex Sentinel", d: "2nd place, AABW Fintech track." },
  { k: "Product", t: profile.title, d: profile.summary },
];

export default function GlassLab() {
  labOnly();
  return (
    <main className="pb-32" style={{ background: "linear-gradient(180deg,#0b1533 0%,#1e3a8a 38%,#eaf1ff 70%,#fff 100%)" }}>
      <LightBeamStyles />
      <section className="mx-auto max-w-6xl px-4 pt-28 text-white md:px-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] opacity-70">Lab · glass lane</p>
        <KineticHeadline as="h1" text="Products that hold up." className="mt-4 text-[52px] text-white md:text-[120px]" accent="#93c5fd" />
        <p className="mt-6 max-w-xl text-lg opacity-85">{profile.tagline}</p>
      </section>

      <section aria-label="Glass cards" className="mx-auto mt-20 grid max-w-6xl gap-6 px-4 md:grid-cols-3 md:px-10">
        {cards.map((c) => (
          <LightBeam key={c.t} radius={24} color="#60a5fa">
            <GlassCard tint="light" className="h-full p-6">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">{c.k}</p>
              <h3 className="mt-2 text-2xl text-ink-1">{c.t}</h3>
              <p className="mt-3 text-ink-2">{c.d}</p>
            </GlassCard>
          </LightBeam>
        ))}
      </section>

      <div className="mt-24">
        <StoryChapter index={1} kicker="Fintech" title="Money that moves safely" from="#eaf1ff" to="#0b1533" ink="#0b1533" length={2.5}>
          <div className="grid h-full place-items-center">
            <div
              aria-hidden="true"
              className="size-40 rounded-full"
              style={{ background: "radial-gradient(circle,#93c5fd,#2563eb)", transform: "scale(calc(0.4 + var(--chapter-p) * 0.8))", opacity: "calc(0.3 + var(--chapter-p))" }}
            />
          </div>
        </StoryChapter>
        <StoryChapter index={2} kicker="Community" title="Building with people" from="#0b1533" to="#ffffff" ink="#ffffff" length={2}>
          <LightBeam loop radius={20} color="#f472b6" className="mx-auto max-w-md">
            <GlassCard tint="dark" className="p-6 text-white">
              Demoed Ledgr at Build Stuffs (buildstuffs.duma.so).
            </GlassCard>
          </LightBeam>
        </StoryChapter>
      </div>

      <MagneticDock items={dock} />
    </main>
  );
}
