import { HeroIntro } from "@/components/site/hero-intro";
import { HighlightsGrid } from "@/components/site/highlights-grid";
import { LinkedinPosts } from "@/components/site/linkedin-posts";
import { LogoStrip, type LogoItem } from "@/components/site/logo-strip";
import { Portrait } from "@/components/site/portrait";
import { ProjectStack } from "@/components/site/project-stack";
import { heroHeadline } from "@/lib/hero";
import { loadProjects, loadSite } from "@/lib/load";
import { linkedinPosts } from "@content/site.ts";

// Full-colour originals on a light band. SkyLab only ships a white wordmark,
// so that one is rendered dark.
const LOGOS: LogoItem[] = [
  { name: "SkyLab Group", src: "/logos/skylab-mark-white.svg", href: "https://www.skylabteam.com/", width: 1748, height: 254, whiteOnly: true },
  { name: "Lumicap", src: "/logos/lumicap-light.png", href: "https://lumicap.io/", width: 640, height: 191 },
  { name: "COSAP", src: "/logos/cosap.png", href: "https://cosap.ai/", width: 640, height: 163 },
  { name: "ReOrc AI", src: "/logos/reorc.svg", href: "https://reorc.com/", width: 120, height: 32 },
  { name: "Zalo", src: "/logos/zalo.svg", href: "https://zalo.me/vi/", width: 80, height: 32 },
];

// What she builds, in her own words (profile tagline): the hero's rolling word.
const BUILDS = ["billing engines", "on-chain ledgers", "ERP modules", "compliance copilots"] as const;

export default async function HomePage() {
  const [site, projects] = await Promise.all([loadSite(), loadProjects()]);

  if (!site) {
    return (
      <main className="mx-auto max-w-3xl px-5 pt-40 pb-24" data-testid="home">
        <h1 className="text-4xl">Content is not available right now.</h1>
        <p className="mt-4 text-ink-3">Run `pnpm db:seed:local` to load content into the local database.</p>
      </main>
    );
  }

  const { profile } = site;

  return (
    <main data-testid="home">
      {/* 1 · Hero: one sentence, a rolling "I build ___", a portrait that bleeds into the logo band */}
      <section aria-labelledby="hero-title" className="relative overflow-hidden bg-bg" data-testid="hero">
        <HeroIntro headline={heroHeadline(profile)} intro={profile.intro} builds={BUILDS} />
        <div className="relative z-[1] mx-auto mt-10 -mb-px w-full max-w-[440px] px-4 md:mt-[64px] md:max-w-[800px]" data-testid="hero-portrait">
          <Portrait src={profile.portrait} name={profile.name} priority sizes="(min-width: 768px) 800px, 92vw" />
        </div>
      </section>

      {/* 2 · Logo marquee */}
      <section aria-label="Companies I have worked with" data-testid="section-logos" className="-mt-px">
        <LogoStrip logos={LOGOS} />
      </section>

      {/* 3 · Highlights bento */}
      <HighlightsGrid site={site} />

      {/* 4 · Project stack with sticky TOC */}
      <ProjectStack projects={projects} />

      {/* 5 · LinkedIn posts (official embeds, lazy) */}
      <LinkedinPosts posts={linkedinPosts} profileUrl={profile.socials.find((s) => s.label === "LinkedIn")?.href ?? null} />
    </main>
  );
}
