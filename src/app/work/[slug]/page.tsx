import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { tocEntries } from "@content/schema.ts";
import { CaseStudyBlocks } from "@/components/site/case-study-blocks";
import { CaseStudyToc } from "@/components/site/case-study-toc";
import { ContactBand } from "@/components/site/contact-band";
import { LiquidLink } from "@/components/site/liquid-link";
import { MediaFrame } from "@/components/site/media-frame";
import { loadProject, loadProjects, loadSite } from "@/lib/load";
import { TINT_BG, TINT_GRADIENT } from "@/lib/tints";
import { cn } from "@/lib/utils";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = await loadProject(slug);
  if (!project) return { title: "Not found" };
  return { title: project.title, description: project.summary };
}

export default async function CaseStudyPage({ params }: Params) {
  const { slug } = await params;
  const [project, projects, site] = await Promise.all([loadProject(slug), loadProjects(), loadSite()]);
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
    <main data-testid="case-study" data-slug={project.slug}>
      {/* Hero, tinted by the project colour */}
      <header className={cn("bg-gradient-to-b to-bg", TINT_GRADIENT[meta.tint])}>
        <div className="mx-auto flex max-w-5xl flex-col gap-5 px-5 pt-32 md:px-8 md:pt-44">
          <Link href="/work" className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-ink-2 hover:text-accent">
            <ArrowLeft className="size-4" aria-hidden="true" /> All work
          </Link>
          <div className="flex items-center gap-3">
            {meta.logo ? (
              <span className="flex h-10 items-center rounded-full bg-bg px-3 shadow-card">
                <Image src={meta.logo} alt={`${meta.company || project.title} logo`} width={96} height={24} unoptimized className="h-5 w-auto" />
              </span>
            ) : null}
            <p className="label-mono text-ink-2">
              {meta.subtitle}
              {meta.status ? ` · ${meta.status}` : ""}
            </p>
          </div>
          <h1 className="text-5xl md:text-8xl">{project.title}</h1>
          <p className="max-w-3xl text-xl leading-relaxed text-ink-1 md:text-2xl">{project.summary}</p>
          <dl className="mt-4 grid gap-x-8 gap-y-4 border-t border-ink-1/10 pt-6 sm:grid-cols-2 md:grid-cols-4" data-testid="meta-row">
            {metaRow.map((item) => (
              <div key={item.label}>
                <dt className="label-mono text-ink-2">{item.label}</dt>
                <dd className="mt-1 font-medium text-ink-1">{item.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8">
            <MediaFrame
              src={project.cover}
              alt={meta.coverAlt || `${project.title} preview`}
              label={project.title}
              priority
              sizes="(min-width: 1024px) 960px, 100vw"
            />
          </div>
        </div>
      </header>

      {/* Body: sticky TOC (desktop) + reading column */}
      <div className="mx-auto grid max-w-6xl gap-12 px-5 pt-20 md:px-8 lg:grid-cols-[220px_minmax(0,720px)] lg:justify-center lg:gap-16">
        <aside className="hidden lg:block">{toc.length > 1 ? <CaseStudyToc entries={toc} /> : null}</aside>
        <article className="min-w-0">
          <CaseStudyBlocks blocks={project.blocks} title={project.title} />
        </article>
      </div>

      {/* Next project */}
      {next ? (
        <section aria-labelledby="next-title" className="mx-auto max-w-6xl px-5 pt-28 md:px-8" data-testid="next-project">
          <p className="label-mono text-ink-3">Next project</p>
          <Link
            href={`/work/${next.slug}`}
            className={cn(
              "group mt-4 flex flex-col gap-4 rounded-[var(--radius)] p-8 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-card-hover active:scale-[0.99] md:flex-row md:items-center md:justify-between md:p-12 motion-reduce:hover:translate-y-0",
              TINT_BG[next.meta.tint]
            )}
          >
            <div>
              <h2 id="next-title" className="text-3xl md:text-5xl">
                {next.title}
              </h2>
              <p className="mt-2 text-ink-2">{next.meta.subtitle}</p>
            </div>
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-navy text-bg transition-transform duration-300 group-hover:translate-x-1">
              <ArrowRight className="size-5" aria-hidden="true" />
            </span>
          </Link>
          <div className="mt-6">
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
