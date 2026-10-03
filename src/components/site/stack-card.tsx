import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { presentationFor } from "@content/projects/presentation.ts";
import type { Project } from "@content/schema.ts";
import { cn } from "@/lib/utils";
import { ProjectVisual } from "./project-visual";

export type StackSurface = "white" | "gradient" | "dark";

const GRADIENT: Record<Project["meta"]["tint"], string> = {
  sky: "from-tint-sky",
  periwinkle: "from-tint-periwinkle",
  lavender: "from-tint-lavender",
  rose: "from-tint-rose",
  peach: "from-tint-peach",
  butter: "from-tint-butter",
  mint: "from-tint-mint",
  aqua: "from-tint-aqua",
};

/**
 * One project in the home stack: centred logo/eyebrow, big outcome headline,
 * blurb, the shared cover visual (same as the case-study hero), and a grey proof bar with
 * the stats and a black pill CTA. Hover: 1.02 scale + soft shadow (200ms).
 */
export function StackCard({ project, surface = "white" }: { project: Project; surface?: StackSurface }) {
  const { meta } = project;
  const dark = surface === "dark";
  const presentation = presentationFor(project.slug, meta.subtitle || project.title);
  return (
    <article
      id={`project-${project.slug}`}
      data-testid="stack-card"
      className={cn(
        "group relative scroll-mt-28 overflow-hidden rounded-[16px] px-3 pt-12 pb-3 text-center md:px-5 md:pt-[60px] md:pb-5",
        "transition-[transform,box-shadow] duration-200 ease-out [@media(hover:hover)]:hover:scale-[1.02] [@media(hover:hover)]:hover:shadow-card-hover motion-reduce:hover:scale-100",
        surface === "white" && "bg-bg",
        surface === "gradient" && cn("bg-gradient-to-b to-bg to-60%", GRADIENT[meta.tint]),
        dark && "bg-ink-1 text-bg"
      )}
    >
      <p className={cn("text-[15px] font-semibold", dark ? "text-white/70" : "text-ink-1")}>
        {project.title}
        <span className={cn("font-normal", dark ? "text-white/50" : "text-ink-3")}> · {meta.company}</span>
      </p>
      <h3 className={cn("mx-auto mt-6 max-w-[620px] text-[30px] leading-[1.12] md:text-[46px]", dark && "!text-bg")}>
        {presentation.headline}
      </h3>
      <p className={cn("mx-auto mt-6 max-w-[600px] px-2 text-[16px] leading-[1.6] md:text-[18px]", dark ? "text-white/80" : "text-ink-1")}>
        {project.summary}
      </p>
      <div className="mx-auto mt-10 max-w-[760px] px-2 md:mt-12">
        <ProjectVisual
          visual={presentation.visual}
          label={project.title}
          logo={meta.logo}
          tone={dark ? "deep" : "light"}
          size="hero"
        />
      </div>
      <div
        className={cn(
          "mt-10 flex flex-col items-center gap-6 rounded-[16px] p-6 text-left md:mt-12 md:flex-row md:justify-between md:px-10 md:py-8",
          dark ? "bg-white/10" : "bg-black/[0.04]"
        )}
      >
        {meta.proof.length > 0 ? (
          <dl className="flex flex-wrap justify-center gap-x-10 gap-y-4 md:justify-start">
            {meta.proof.map((item) => (
              <div key={item.label} className="flex items-baseline gap-2">
                <dt className="sr-only">{item.label}</dt>
                <dd className={cn("font-display text-[24px]", dark ? "text-bg" : "text-ink-1")}>{item.value}</dd>
                <dd className={cn("max-w-[180px] text-[14px] leading-[1.35]", dark ? "text-white/70" : "text-ink-1")}>{item.label}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <span />
        )}
        <Link
          href={`/work/${project.slug}`}
          data-testid="stack-cta"
          className={cn(
            "font-display inline-flex shrink-0 items-center gap-3 rounded-full px-10 py-5 text-[16px] transition-colors duration-[400ms]",
            dark ? "bg-bg text-ink-1 hover:bg-white/85" : "bg-ink-1 text-bg hover:bg-ink-hover"
          )}
        >
          {project.title} case study <ArrowRight className="size-5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
