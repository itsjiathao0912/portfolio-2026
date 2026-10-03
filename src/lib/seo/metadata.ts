import type { Metadata } from "next";
import { SITE_NAME, SITE_TITLE } from "./site-meta";
import { absoluteUrl } from "./site-url";

/**
 * Shared per-page metadata: title, description, canonical, Open Graph and
 * Twitter. The OG/Twitter image comes from the route's opengraph-image file
 * (Next adds it), so no `images` are set here.
 */
export function pageMetadata(input: {
  /** Page title WITHOUT the site suffix (the root template adds " · Thao Dao"). */
  title: string;
  description: string;
  path: string;
  /** Open Graph type; case studies are articles. */
  type?: "website" | "article";
  /** Title used on social cards, when it should differ from the tab title. */
  socialTitle?: string;
}): Metadata {
  const url = absoluteUrl(input.path);
  const socialTitle = input.socialTitle ?? `${input.title} · ${SITE_NAME}`;
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: url },
    openGraph: {
      type: input.type ?? "website",
      url,
      siteName: SITE_NAME,
      locale: "en_US",
      title: socialTitle,
      description: input.description,
    },
    twitter: { card: "summary_large_image", title: socialTitle, description: input.description },
  };
}

export { SITE_TITLE };
