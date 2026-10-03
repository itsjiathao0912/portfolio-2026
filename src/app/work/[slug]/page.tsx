import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { tocEntries } from "@content/schema.ts";
import { MetaStrip } from "@/components/site/case-study-blocks";
import { CaseBlocks } from "@/components/site/case-study/blocks";
import { CaseHero } from "@/components/site/case-study/case-hero";
import { CaseProgress, CaseSectionMenu, CaseToc } from "@/components/site/case-study/toc";
import { LiquidLink } from "@/components/site/liquid-link";
import { WorkCard } from "@/components/site/work-card";
import { loadProject, loadProjects } from "@/lib/load";
import { cn } from "@/lib/utils";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = await loadProject(slug);
  if (!project) return { title: "Not found" };
  return { title: project.title, description: project.meta.lede || project.summary };
}

const COVER_ID = "case-cover";
const BODY_ID = "case-body";

export default async function CaseStudyPage({ params }: Params) {
  const { slug } = await params;
  const [project, projects] = await Promise.all([loadProject(slug), loadProjects()]);
  if (!project) notFound();

  const { meta } = project;
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
    <main id="top" data-testid="case-study" data-slug={project.slug} data-layout={meta.layout}>
      <CaseProgress />
      <CaseHero project={project} coverId={COVER_ID} />

      {/* Reading column (680 px for magazine, 800 px otherwise); the TOC lives in the left margin (xl+). */}
      {toc.length > 1 ? (
        <>
          <CaseToc entries={toc} startId={BODY_ID} slug={project.slug} title={project.title} />
          <CaseSectionMenu entries={toc} startId={BODY_ID} slug={project.slug} />
        </>
      ) : null}
      <article id={BODY_ID} className={cn("mx-auto px-5 pt-16 md:pt-24", meta.layout === "magazine" ? "max-w-[720px]" : "max-w-[800px]")}>
        <MetaStrip items={metaRow} />
        <div className="pt-16 md:pt-24">
          <CaseBlocks blocks={project.blocks} title={project.title} layout={meta.layout} />
        </div>
      </article>

      {/* Next project, drawn as a full work-index card */}
      {next ? (
        <section aria-labelledby="next-label" className="mx-auto max-w-[800px] px-5 pt-[150px] pb-24 md:pt-[200px] md:pb-[150px]" data-testid="next-project">
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

    </main>
  );
}
