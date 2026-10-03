import { bundledCaseStudies, bundledCaseStudy } from "@/lib/seo/site-meta";
import { caseOg, OG_CONTENT_TYPE, OG_SIZE, sectionOg } from "@/lib/seo/og";

export const alt = "Case study by Thao Dao";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return bundledCaseStudies().map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = bundledCaseStudy(slug);
  // Unknown slug (the page itself 404s): serve the generic work card, not a 500.
  if (!project) return sectionOg({ kicker: "Work", title: "Selected work", line: "Case studies by Thao Dao." });
  return caseOg({
    title: project.title,
    headline: project.meta.headline || project.summary,
    subtitle: project.meta.subtitle || project.role,
    emoji: project.meta.emoji,
    color: project.meta.color ?? "#2563eb",
  });
}
