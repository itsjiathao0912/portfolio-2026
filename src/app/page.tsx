import { HeroIntro } from "@/components/site/hero-intro";
import { HighlightsGrid } from "@/components/site/highlights-grid";
import { ScrollWords } from "@/components/gems/scroll-words";
import { GlobeCard } from "@/components/site/home/globe-card";
import { PeopleSection } from "@/components/site/home/people-section";
import { ProofTicker } from "@/components/site/home/proof-ticker";
import { LinkedinPosts } from "@/components/site/linkedin-posts";
import { LogoStrip, type LogoItem } from "@/components/site/logo-strip";
import { PhotoMoments } from "@/components/site/photo-moments";
import { Portrait } from "@/components/site/portrait";
import { ProjectStack } from "@/components/site/project-stack";
import { VisitorGuide } from "@/components/site/visitor/guide/guide";
import { GuideSection } from "@/components/site/visitor/guide/guide-section";
import { LiveVisitorTop } from "@/components/site/visitor/stats/live-visitor-top";
import { VisitorPoll } from "@/components/site/visitor/stats/visitor-poll";
import { heroHeadline } from "@/lib/hero";
import { loadProjects, loadSite } from "@/lib/load";
import { linkedinPosts, photos } from "@content/site.ts";
import { JsonLd } from "@/components/seo/json-ld";
import { personJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo/site-meta";

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
// Hidden under the cursor on the hero headline (gem): the same claim, said casually.
const CASUAL = "Thao turns messy whiteboards into software that ships.";

const BUILDS = ["billing engines", "on-chain ledgers", "ERP modules", "compliance copilots"] as const;

// Home keeps the root default title (no "· Thao Dao" suffix).
export const metadata = {
  ...pageMetadata({ title: SITE_TITLE, description: SITE_DESCRIPTION, path: "/", socialTitle: SITE_TITLE }),
  title: { absolute: SITE_TITLE },
};

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
  const linkedin = profile.socials.find((s) => s.label === "LinkedIn")?.href ?? null;

  return (
    <main data-testid="home">
      <VisitorGuide />
      <JsonLd data={[websiteJsonLd(), personJsonLd()]} />
      <section aria-labelledby="hero-title" className="relative overflow-hidden bg-bg" data-testid="hero">
        <HeroIntro headline={heroHeadline(profile)} intro={profile.intro} builds={BUILDS} casual={CASUAL} />
        <div className="relative z-[1] mx-auto mt-10 -mb-px w-full max-w-[440px] px-4 md:mt-[64px] md:max-w-[800px]" data-testid="hero-portrait">
          <Portrait src={profile.portrait} name={profile.name} priority sizes="(min-width: 768px) 800px, 92vw" />
        </div>
      </section>

      <section aria-label="Companies I have worked with" data-testid="section-logos" className="-mt-px">
        <LogoStrip logos={LOGOS} />
      </section>

      <section aria-label="Who is visiting" data-testid="section-visitor">
        <div className="mx-auto max-w-[1320px] px-6 py-14 md:px-10 md:py-20 lg:px-[60px]">
          <LiveVisitorTop />
        </div>
      </section>

      <GuideSection id="statement">
      <section aria-label="What I do" className="mx-auto max-w-[1100px] px-6 py-20 md:px-10 md:py-[80px]" data-testid="section-statement">
        <ScrollWords text={profile.tagline} className="font-display text-[28px] leading-[1.25] text-ink-1 md:text-[46px] md:leading-[1.15]" />
      </section>
      </GuideSection>
      <ProofTicker />

      <GuideSection id="highlights"><HighlightsGrid site={site} footer={<GlobeCard />} /></GuideSection>
      <GuideSection id="stack"><ProjectStack projects={projects} /></GuideSection>

      <GuideSection id="people"><PeopleSection /></GuideSection>
      <PhotoMoments moments={photos.filter((p) => (p.place as readonly string[]).includes("home"))} className="pt-0 md:pt-0" />
      <GuideSection id="linkedin"><LinkedinPosts posts={linkedinPosts} profileUrl={linkedin} /></GuideSection>
      <section aria-label="Quick poll" className="mx-auto max-w-[640px] px-6 pb-4 md:px-10" data-testid="section-poll">
        <VisitorPoll />
      </section>
    </main>
  );
}
