import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { presentationFor } from "@content/projects/presentation.ts";
import { tocEntries } from "@content/schema.ts";
import { CaseStudyBlocks, MetaStrip } from "@/components/site/case-study-blocks";
import { CaseStudyHero } from "@/components/site/case-study-hero";
import { CaseStudySectionMenu, CaseStudyToc, ReadingProgress } from "@/components/site/case-study-toc";
import { ContactBand } from "@/components/site/contact-band";
import { LiquidLink } from "@/components/site/liquid-link";
import { WorkCard } from "@/components/site/work-card";
import { loadProject, loadProjects, loadSite } from "@/lib/load";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = await loadProject(slug);
  if (!project) return { title: "Not found" };
  return { title: project.title, description: presentationFor(project.slug, project.summary).headline };
}

const COVER_ID = "case-cover";

export default async function CaseStudyPage({ params }: Params) {
  const { slug } = await params;
  const [project, projects, site] = await Promise.all([loadProject(slug), loadProjects(), loadSite()]);
  if (!project) notFound();

  const { meta } = project;
  const look = presentationFor(project.slug, project.summary);
  const toc = tocEntries(project.blocks);
  const index = projects.findIndex((p) => p.id === project.id);
  const next = projects.length > 1 ? projects[(index + 1) % projects.length] : null;
  const metaRow = [
    { label: "Role", value: project.role },
    { label: "Company", value: meta.company },
    { label: "Period", value: project.period },
    { label: "Stack", value: project.tags.slice(0, 4).join(", ") },
  ].filter((item) => item.value);

  return (
    <main id="top" data-testid="case-study" data-slug={project.slug}>
      <ReadingProgress />
      <CaseStudyHero project={project} look={look} coverId={COVER_ID} />

      {/* Centred 800 px reading column; the TOC lives in the left margin (xl+). */}
      {toc.length > 1 ? (
        <>
          <CaseStudyToc entries={toc} coverId={COVER_ID} />
          <CaseStudySectionMenu entries={toc} coverId={COVER_ID} />
        </>
      ) : null}
      <article className="mx-auto max-w-[800px] px-5 pt-16 md:pt-24">
        <MetaStrip items={metaRow} />
        <div className="pt-16 md:pt-24">
          <CaseStudyBlocks blocks={project.blocks} title={project.title} />
        </div>
      </article>

      {/* Next project, drawn as a full work-index card */}
      {next ? (
        <section aria-labelledby="next-label" className="mx-auto max-w-[800px] px-5 pt-[150px] md:pt-[200px]" data-testid="next-project">
          <p id="next-label" className="mb-6 text-center text-sm font-semibold text-ink-3 md:text-base">
            Next project
          </p>
          <WorkCard project={next} headingLevel="h3" className="mx-auto max-w-[520px] xl:min-h-[680px]" />
          <div className="mt-10 flex justify-center">
            <LiquidLink href="/work" variant="outline" size="sm">
              Back to all work
            </LiquidLink>
          </div>
        </section>
      ) : null}

      {site ? (
        <div className="mx-auto max-w-6xl px-3 pt-28 pb-16 md:px-8">
          <ContactBand profile={site.profile} />
        </div>
      ) : null}
    </main>
  );
}
