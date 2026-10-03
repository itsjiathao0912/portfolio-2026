import site from "@content/site.ts";
import type { Project } from "@content/schema.ts";
import { caseStudyDescription, SOCIAL_LINKS } from "./site-meta";
import { absoluteUrl, SITE_URL } from "./site-url";

const { profile } = site;
const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: profile.name,
    alternateName: profile.nameLocal,
    jobTitle: profile.title,
    description: profile.summary,
    url: SITE_URL,
    image: absoluteUrl(profile.portrait),
    worksFor: { "@type": "Organization", name: "SkyLab Group", url: "https://www.skylabteam.com/" },
    address: { "@type": "PostalAddress", addressLocality: "Ho Chi Minh City", addressCountry: "VN" },
    sameAs: SOCIAL_LINKS,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: `${profile.name} — Portfolio`,
    url: SITE_URL,
    inLanguage: "en",
    author: { "@id": PERSON_ID },
  };
}

export function caseStudyJsonLd(project: Pick<Project, "slug" | "title" | "summary" | "meta" | "role" | "period" | "updatedAt" | "tags">) {
  const url = absoluteUrl(`/work/${project.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: project.meta.headline || project.title,
    name: project.title,
    description: caseStudyDescription(project),
    url,
    mainEntityOfPage: url,
    image: `${url}/opengraph-image`,
    inLanguage: "en",
    ...(project.updatedAt ? { dateModified: project.updatedAt } : {}),
    keywords: project.tags.join(", "),
    author: { "@id": PERSON_ID, "@type": "Person", name: profile.name, url: SITE_URL },
    publisher: { "@id": PERSON_ID },
    about: project.title,
  };
}
