import type { MetadataRoute } from "next";
import { bundledCaseStudies } from "@/lib/seo/site-meta";
import { absoluteUrl } from "@/lib/seo/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const studies = bundledCaseStudies();
  const latest = studies.reduce((max, p) => (p.updatedAt > max ? p.updatedAt : max), "2026-10-03T00:00:00.000Z");
  return [
    { url: absoluteUrl("/"), lastModified: latest, changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl("/about"), lastModified: latest, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/work"), lastModified: latest, changeFrequency: "monthly", priority: 0.9 },
    ...studies.map((p) => ({
      url: absoluteUrl(`/work/${p.slug}`),
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
