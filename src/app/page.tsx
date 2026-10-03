import { ArrowRight, ArrowUpRight, Mail } from "lucide-react";
import { ContactBand } from "@/components/site/contact-band";
import { DevGap } from "@/components/site/dev-gap";
import { DotGrid } from "@/components/site/dot-grid";
import { HeroIntro } from "@/components/site/hero-intro";
import { LiquidLink } from "@/components/site/liquid-link";
import { LogoStrip, type LogoItem } from "@/components/site/logo-strip";
import { ProjectCard } from "@/components/site/project-card";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { loadProjects, loadSite } from "@/lib/load";

const LOGOS: LogoItem[] = [
  { name: "SkyLab Group", src: "/logos/skylab-icon.svg", href: "https://www.skylabteam.com/", width: 40, height: 40 },
  { name: "Lumicap", src: "/logos/lumicap-dark.png", href: "https://lumicap.io/", width: 640, height: 191 },
  { name: "COSAP", src: "/logos/cosap.png", href: "https://cosap.ai/", width: 640, height: 163 },
  { name: "ReOrc AI", src: "/logos/reorc.svg", href: "https://reorc.com/", width: 120, height: 32 },
  { name: "Zalo", src: "/logos/zalo.svg", href: "https://zalo.me/vi/", width: 80, height: 32 },
];

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
  const featured = projects.filter((p) => p.meta.featured);
  const main = site.experience.filter((e) => !e.earlier);
  const earlier = site.experience.filter((e) => e.earlier);

  return (
    <main data-testid="home">
      {/* 1 · Hero */}
      <section aria-labelledby="hero-title" className="relative overflow-hidden" data-testid="hero">
        <DotGrid />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />
        <HeroIntro
          eyebrow={`${profile.location}${profile.availability ? ` · ${profile.availability}` : ""}`}
          headline={profile.headline}
          nameLine={
            <>
              {profile.name} <span className="text-ink-3">·</span>{" "}
              <span lang="vi" data-testid="name-local">
                {profile.nameLocal}
              </span>{" "}
              <span className="text-ink-3">·</span> {profile.title}
            </>
          }
          tagline={profile.tagline}
        >
          <LiquidLink href="/work" data-testid="hero-work">
            See the work <ArrowRight className="size-4" aria-hidden="true" />
          </LiquidLink>
          <LiquidLink href={`mailto:${profile.email}`} variant="outline">
            <Mail className="size-4" aria-hidden="true" /> Email me
          </LiquidLink>
        </HeroIntro>
      </section>

      {/* 2 · Credibility strip */}
      <section aria-labelledby="logos-title" className="mx-auto max-w-6xl px-5 md:px-8" data-testid="section-logos">
        <Reveal>
          <h2 id="logos-title" className="label-mono mb-5 text-center !font-mono !text-xs !font-normal !text-ink-3">
            Companies and products I have built with
          </h2>
          <LogoStrip logos={LOGOS} />
        </Reveal>
      </section>

      {/* 3 · Featured work */}
      <section aria-labelledby="work-title" className="mx-auto max-w-6xl px-5 pt-28 md:px-8" data-testid="section-work">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            index="01"
            eyebrow="Selected work"
            id="work-title"
            title="Platforms owned end-to-end"
            lede="Billing engines, on-chain ledgers, ERP modules and the personal products I build on the side."
          />
          <LiquidLink href="/work" variant="outline" size="sm" className="self-start md:self-auto">
            All {projects.length} projects <ArrowRight className="size-4" aria-hidden="true" />
          </LiquidLink>
        </div>
        <ul className="mt-10 grid gap-5 md:grid-cols-2">
          {featured.map((project, index) => (
            <Reveal as="li" key={project.id} index={index} className={index === 0 ? "md:col-span-2" : undefined}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </ul>
      </section>

      {/* 4 · Experience */}
      <section aria-labelledby="experience" className="mx-auto max-w-6xl px-5 pt-28 md:px-8" data-testid="section-experience">
        <SectionHeading index="02" eyebrow="Experience" id="experience" title="Where I have shipped" />
        <ol className="mt-10 flex flex-col">
          {main.map((job, index) => (
            <Reveal as="li" key={job.id} index={index} className="border-t border-hairline py-10 last:border-b">
              <article className="grid gap-6 md:grid-cols-[260px_1fr]" data-testid="experience-item">
                <div className="flex flex-col gap-1">
                  <p className="label-mono text-accent">{job.period}</p>
                  <h3 className="text-2xl">
                    {job.url ? (
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:text-accent"
                      >
                        {job.company}
                        <ArrowUpRight className="size-4" aria-hidden="true" />
                      </a>
                    ) : (
                      job.company
                    )}
                  </h3>
                  <p className="font-medium text-ink-1">{job.role}</p>
                  <p className="text-sm text-ink-3">{job.domain}</p>
                </div>
                <div className="flex flex-col gap-4">
                  <p className="text-lg leading-relaxed text-ink-1">{job.summary}</p>
                  <ul className="flex flex-col gap-2.5 pl-5 text-ink-2 marker:text-accent [list-style:disc]">
                    {job.bullets.map((bullet) => (
                      <li key={bullet} className="leading-relaxed">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                  {job.highlight ? (
                    <p className="self-start rounded-full bg-accent-tint px-4 py-2 text-sm font-medium text-accent-hover">
                      {job.highlight}
                    </p>
                  ) : null}
                </div>
              </article>
            </Reveal>
          ))}
        </ol>
        {earlier.length > 0 ? (
          <div className="mt-12">
            <h3 className="label-mono !font-mono !text-xs !font-normal !text-ink-3">Earlier experience</h3>
            <ul className="mt-4 grid gap-4 md:grid-cols-3">
              {earlier.map((job, index) => (
                <Reveal as="li" key={job.id} index={index} className="rounded-[var(--radius)] bg-canvas p-6">
                  <article data-testid="experience-item">
                    <p className="label-mono text-ink-3">{job.period}</p>
                    <p className="font-display mt-2 text-xl text-ink-1" lang={job.company === "Chợ Tốt" ? "vi" : undefined}>
                      {job.company}
                    </p>
                    {job.role ? <p className="mt-1 font-medium text-ink-1">{job.role}</p> : null}
                    {job.bullets.length > 0 ? (
                      <ul className="mt-3 flex flex-col gap-2 pl-4 text-sm text-ink-2 [list-style:disc] marker:text-accent">
                        {job.bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    ) : null}
                    <DevGap note={job.gap} />
                  </article>
                </Reveal>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {/* 5 · Recognition: awards, certifications, education */}
      <section aria-labelledby="recognition" className="mx-auto max-w-6xl px-5 pt-28 md:px-8" data-testid="section-recognition">
        <SectionHeading index="03" eyebrow="Recognition" id="recognition" title="Awards, certifications, education" />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <Reveal index={0} className="rounded-[var(--radius)] bg-tint-butter p-7">
            <h3 className="text-xl">Awards</h3>
            <ul className="mt-5 flex flex-col gap-4">
              {site.awards.map((award) => (
                <li key={award.id}>
                  <p className="font-medium text-ink-1" lang="vi">
                    {award.name}
                  </p>
                  <p className="text-sm text-ink-2">
                    {award.result}
                    {award.year ? ` · ${award.year}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal index={1} className="rounded-[var(--radius)] bg-tint-sky p-7">
            <h3 className="text-xl">Certifications</h3>
            <ul className="mt-5 flex flex-col gap-4">
              {site.certifications.map((cert) => (
                <li key={cert.id}>
                  {cert.url ? (
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-start gap-1 font-medium text-ink-1 hover:text-accent-hover"
                    >
                      {cert.name}
                      <ArrowUpRight className="mt-1 size-3.5 shrink-0" aria-hidden="true" />
                    </a>
                  ) : (
                    <p className="font-medium text-ink-1">{cert.name}</p>
                  )}
                  <p className="text-sm text-ink-2">{cert.issuer}</p>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal index={2} className="rounded-[var(--radius)] bg-tint-mint p-7">
            <h3 className="text-xl">Education</h3>
            <ul className="mt-5 flex flex-col gap-4">
              {site.education.map((edu) => (
                <li key={edu.id}>
                  <p className="font-medium text-ink-1">{edu.school}</p>
                  <p className="text-sm text-ink-2">
                    {edu.degree}
                    {edu.period ? ` · ${edu.period}` : ""}
                  </p>
                  {edu.detail ? <p className="mt-1 text-sm text-ink-3">{edu.detail}</p> : null}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* 6 · Skills */}
      <section aria-labelledby="skills-title" className="mx-auto max-w-6xl px-5 pt-28 md:px-8" data-testid="section-skills">
        <SectionHeading index="04" eyebrow="Skills" id="skills-title" title="What I bring to a team" />
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {site.skills.map((group, index) => (
            <Reveal key={group.id} index={index}>
              <h3 className="text-lg">{group.name}</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li key={item} className="rounded-full border border-hairline px-3.5 py-1.5 text-sm text-ink-2">
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 7 · Contact */}
      <div className="mx-auto max-w-6xl px-3 pt-28 pb-16 md:px-8">
        <Reveal>
          <ContactBand profile={profile} />
        </Reveal>
      </div>
    </main>
  );
}
