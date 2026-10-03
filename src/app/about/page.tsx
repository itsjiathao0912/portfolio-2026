import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { EmojiBurst } from "@/components/motion/emoji-burst";
import { PortraitNote } from "@/components/about/portrait-note";
import { Tilt } from "@/components/motion/tilt";
import { PhotoMoments } from "@/components/site/photo-moments";
import { photos } from "@content/site.ts";
import { DevGap } from "@/components/site/dev-gap";
import { Reveal } from "@/components/site/reveal";
import { Portrait } from "@/components/site/portrait";
import { CareerRail } from "@/components/signature/ledger";
import { projectEntries } from "@content/index.ts";
import { loadSite } from "@/lib/load";

export const metadata: Metadata = { title: "About" };

function Heading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-[32px] md:text-[46px]">
      {children}
    </h2>
  );
}

export default async function AboutPage() {
  const site = await loadSite();
  if (!site) {
    return (
      <main className="mx-auto max-w-3xl px-5 pt-40 pb-24" data-testid="about">
        <h1 className="text-4xl">Content is not available right now.</h1>
      </main>
    );
  }
  const { profile } = site;
  const main = site.experience.filter((e) => !e.earlier);
  const earlier = site.experience.filter((e) => e.earlier);

  return (
    <main data-testid="about">
      <section className="mx-auto grid max-w-[1100px] items-end gap-12 px-6 pt-[120px] md:grid-cols-[1fr_320px] md:px-10 md:pt-[180px]">
        <div className="flex flex-col gap-6">
          <h1 className="text-[39px] md:text-[64px]">About {profile.name.split(" ")[0]}</h1>
          <p className="text-[20px] leading-[1.6] text-ink-1 md:text-[22px]">{profile.summary}</p>
          <p className="text-[18px] leading-[1.6] text-ink-2">{profile.tagline}</p>
          <p className="text-ink-3">
            <span lang="vi" data-testid="name-local" className="font-display text-ink-1">
              {profile.nameLocal}
            </span>{" "}
            <EmojiBurst emojis={["🇻🇳", "🍜", "☕", "🛵"]} className="relative inline-flex cursor-default">
              <span role="img" aria-label="Vietnam flag">🇻🇳</span>
            </EmojiBurst>{" "}
            · {profile.location}
            {profile.availability ? ` · ${profile.availability}` : ""}
          </p>
        </div>
        <div className="relative w-full max-w-[320px] justify-self-center">
          <Tilt>
            <Portrait src={profile.portrait} name={profile.name} className="rounded-[20px]" />
          </Tilt>
          <PortraitNote href="/work/cortex-sentinel" label="Start with Cortex Sentinel" />
        </div>
      </section>

      <CareerRail products={projectEntries.length} className="mt-16 md:mt-24" />

      <section aria-labelledby="experience" className="mx-auto max-w-[1100px] px-6 pt-24 md:px-10 md:pt-[150px]" data-testid="section-experience">
        <Heading id="experience">Experience</Heading>
        <ol className="mt-10 flex flex-col">
          {main.map((job, i) => (
            <Reveal as="li" index={i % 3} key={job.id} className="border-t border-hairline py-10 last:border-b">
              <article className="grid gap-6 md:grid-cols-[260px_1fr]" data-testid="experience-item">
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-ink-3">{job.period}</p>
                  <h3 className="text-2xl">
                    {job.url ? (
                      <a href={job.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-accent">
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
                  <p className="text-lg text-ink-1">{job.summary}</p>
                  <ul className="flex flex-col gap-2 pl-5 text-ink-2 [list-style:disc]">
                    {job.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                  {job.highlight ? (
                    <p className="self-start rounded-full bg-canvas px-4 py-2 text-sm font-medium text-ink-1">{job.highlight}</p>
                  ) : null}
                </div>
              </article>
            </Reveal>
          ))}
        </ol>
        {earlier.length > 0 ? (
          <div className="mt-12">
            <h3 className="text-lg text-ink-3">Earlier experience</h3>
            <ul className="mt-4 grid gap-4 md:grid-cols-3">
              {earlier.map((job, i) => (
                <Reveal as="li" index={i} key={job.id} className="rounded-[16px] bg-canvas p-6 transition-[transform,box-shadow] duration-300 [@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:shadow-card-hover">
                  <article data-testid="experience-item">
                    <p className="text-sm text-ink-3">{job.period}</p>
                    <p className="font-display mt-2 text-xl text-ink-1" lang={job.company === "Chợ Tốt" ? "vi" : undefined}>
                      {job.company}
                    </p>
                    {job.role ? <p className="mt-1 font-medium text-ink-1">{job.role}</p> : null}
                    {job.bullets.length > 0 ? (
                      <ul className="mt-3 flex flex-col gap-2 pl-4 text-sm text-ink-2 [list-style:disc]">
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

      <PhotoMoments moments={photos.filter((p) => (p.place as readonly string[]).includes("about"))} title="Seen around" className="pb-0 md:pb-0" />

      <section aria-labelledby="skills-title" className="mx-auto max-w-[1100px] px-6 pt-24 md:px-10 md:pt-[150px]" data-testid="section-skills">
        <Heading id="skills-title">Skills</Heading>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {site.skills.map((group, i) => (
            <Reveal index={i} key={group.id}>
              <h3 className="text-lg">{group.name}</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-hairline px-3.5 py-1.5 text-sm text-ink-2 transition-[transform,background-color,color] duration-200 [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:bg-ink-1 [@media(hover:hover)]:hover:text-bg"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </section>

      <section aria-labelledby="recognition" className="mx-auto max-w-[1100px] px-6 pt-24 md:px-10 md:pt-[150px]" data-testid="section-recognition">
        <Heading id="recognition">Education, certifications, awards</Heading>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <Reveal index={0} className="rounded-[20px] bg-canvas p-7">
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
          <Reveal index={1} className="rounded-[20px] bg-canvas p-7">
            <h3 className="text-xl">Certifications</h3>
            <ul className="mt-5 flex flex-col gap-4">
              {site.certifications.map((cert) => (
                <li key={cert.id}>
                  {cert.url ? (
                    <a href={cert.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1 font-medium text-ink-1 hover:text-accent">
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
          <Reveal index={2} className="rounded-[20px] bg-canvas p-7">
            <h3 className="text-xl">Awards</h3>
            <ul className="mt-5 flex flex-col gap-4">
              {site.awards.map((award) => (
                <li key={award.id}>
                  <p className="font-medium text-ink-1" lang="vi">{award.name}</p>
                  <p className="text-sm text-ink-2">
                    {award.result}
                    {award.year ? ` · ${award.year}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
