import { describe, expect, test } from "bun:test";
import { metadata as aboutMeta } from "../../src/app/about/page.tsx";
import { metadata as homeMeta } from "../../src/app/page.tsx";
import { metadata as workMeta } from "../../src/app/work/page.tsx";
import { metadata as rootMeta } from "../../src/app/layout.tsx";
import robots from "../../src/app/robots.ts";
import sitemap from "../../src/app/sitemap.ts";
import { EMOJI_DATA_URI, PORTRAIT_DATA_URI } from "../../src/lib/seo/og-assets.ts";
import { ARCHIVO_700_B64, INTER_400_B64, INTER_600_B64 } from "../../src/lib/seo/og-fonts.ts";
import { emojiSrc } from "../../src/lib/seo/og.tsx";
import { caseStudyJsonLd, personJsonLd, websiteJsonLd } from "../../src/lib/seo/json-ld.ts";
import { pageMetadata } from "../../src/lib/seo/metadata.ts";
import { bundledCaseStudies, caseStudyDescription } from "../../src/lib/seo/site-meta.ts";
import { absoluteUrl, DEFAULT_SITE_URL, SITE_URL } from "../../src/lib/seo/site-url.ts";

const SITE = "https://itsjiathao.com";

function str(v: unknown) {
  return typeof v === "string" ? v : undefined;
}

describe("site url", () => {
  test("defaults to the production origin", () => {
    expect(DEFAULT_SITE_URL).toBe(SITE);
    if (!process.env["SITE_URL"]) expect(SITE_URL).toBe(SITE);
    expect(absoluteUrl("/work")).toBe(`${SITE_URL}/work`);
  });
});

describe("root metadata", () => {
  test("has every required field", () => {
    expect(rootMeta.metadataBase?.toString()).toBe(`${SITE_URL}/`);
    expect(rootMeta.title).toEqual({ default: "Thao Dao — Technical Product Manager", template: "%s · Thao Dao" });
    expect(rootMeta.description?.length).toBeGreaterThan(80);
    expect(rootMeta.keywords).toContain("fintech");
    expect(rootMeta.authors).toEqual([{ name: "Thao Dao", url: SITE_URL }]);
    expect(rootMeta.creator).toBe("Thao Dao");
    expect(rootMeta.openGraph).toMatchObject({ type: "website", siteName: "Thao Dao", locale: "en_US" });
    expect(rootMeta.twitter).toMatchObject({ card: "summary_large_image" });
    expect(rootMeta.robots).toMatchObject({ index: true, follow: true });
    expect(rootMeta.alternates?.canonical).toBe("/");
  });
});

describe("per-page metadata", () => {
  const pages = [
    { name: "home", meta: homeMeta, path: "/" },
    { name: "about", meta: aboutMeta, path: "/about" },
    { name: "work", meta: workMeta, path: "/work" },
  ];
  for (const { name, meta, path } of pages) {
    test(`${name}: title, description, canonical, OG and Twitter`, () => {
      expect(meta.title).toBeTruthy();
      expect(str(meta.description)?.length).toBeGreaterThan(60);
      expect(str(meta.description)?.length).toBeLessThanOrEqual(200);
      expect(meta.alternates?.canonical).toBe(absoluteUrl(path));
      expect(meta.openGraph).toMatchObject({ url: absoluteUrl(path), siteName: "Thao Dao", locale: "en_US" });
      expect(meta.twitter).toMatchObject({ card: "summary_large_image" });
      expect(str((meta.openGraph as { title?: unknown }).title)).toBeTruthy();
    });
  }

  test("home keeps the absolute root title (no site suffix)", () => {
    expect(homeMeta.title).toEqual({ absolute: "Thao Dao — Technical Product Manager" });
  });

  test("every case study yields a distinct, in-range title/description/canonical", () => {
    const studies = bundledCaseStudies();
    expect(studies).toHaveLength(9);
    const seen = new Set<string>();
    for (const p of studies) {
      const description = caseStudyDescription(p);
      expect(description.length).toBeGreaterThan(40);
      expect(description.length).toBeLessThanOrEqual(200);
      const meta = pageMetadata({ title: `${p.title} case study`, description, path: `/work/${p.slug}`, type: "article" });
      expect(meta.alternates?.canonical).toBe(absoluteUrl(`/work/${p.slug}`));
      expect(meta.openGraph).toMatchObject({ type: "article" });
      expect(seen.has(description)).toBe(false);
      seen.add(description);
    }
  });
});

describe("sitemap and robots", () => {
  test("sitemap lists the 3 pages and all 9 case studies, absolute, with lastModified", () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).toContain(absoluteUrl("/"));
    expect(urls).toContain(absoluteUrl("/about"));
    expect(urls).toContain(absoluteUrl("/work"));
    for (const p of bundledCaseStudies()) expect(urls).toContain(absoluteUrl(`/work/${p.slug}`));
    expect(entries).toHaveLength(12);
    expect(new Set(urls).size).toBe(urls.length);
    for (const e of entries) {
      expect(e.url.startsWith("https://") || e.url.startsWith("http://")).toBe(true);
      expect(e.lastModified).toBeTruthy();
    }
    expect(urls.some((u) => u.includes("/lab") || u.includes("/api"))).toBe(false);
  });

  test("robots allows all, blocks /lab and /api, points at the sitemap", () => {
    const r = robots();
    const rule = Array.isArray(r.rules) ? r.rules[0]! : r.rules;
    expect(rule.userAgent).toBe("*");
    expect(rule.allow).toBe("/");
    expect(rule.disallow).toEqual(["/lab", "/api"]);
    expect(r.sitemap).toBe(absoluteUrl("/sitemap.xml"));
  });
});

describe("JSON-LD", () => {
  test("Person has role, employer, location and both profiles", () => {
    const p = personJsonLd();
    expect(p["@type"]).toBe("Person");
    expect(p.jobTitle).toBe("Technical Product Manager");
    expect(p.worksFor.name).toBe("SkyLab Group");
    expect(p.address.addressLocality).toBe("Ho Chi Minh City");
    expect(p.sameAs).toEqual(["https://www.linkedin.com/in/thaodao0912/", "https://github.com/itsjiathao0912"]);
    expect(p.image.startsWith("http")).toBe(true);
  });
  test("WebSite links back to the Person", () => {
    const w = websiteJsonLd();
    expect(w["@type"]).toBe("WebSite");
    expect(w.url).toBe(SITE_URL);
    expect(w.author["@id"]).toBe(personJsonLd()["@id"]);
  });
  test("every case study has an Article node with its own URL and image", () => {
    for (const p of bundledCaseStudies()) {
      const a = caseStudyJsonLd(p);
      expect(a["@type"]).toBe("Article");
      expect(a.url).toBe(absoluteUrl(`/work/${p.slug}`));
      expect(a.image).toBe(`${a.url}/opengraph-image`);
      expect(a.headline.length).toBeGreaterThan(5);
      expect(a.author.name).toBe("Thao Dao");
    }
  });
});

describe("OG assets", () => {
  test("fonts are static TrueType (Satori cannot read woff2 or variable fonts)", () => {
    for (const b64 of [ARCHIVO_700_B64, INTER_400_B64, INTER_600_B64]) {
      const head = Buffer.from(b64.slice(0, 16), "base64");
      expect(head.readUInt32BE(0)).toBe(0x00010000);
    }
  });
  test("portrait is a JPEG (Satori cannot read WebP)", () => {
    expect(PORTRAIT_DATA_URI.startsWith("data:image/jpeg;base64,")).toBe(true);
  });
  test("every project emoji has a bundled Twemoji, so rendering never fetches", () => {
    for (const p of bundledCaseStudies()) {
      if (!p.meta.emoji) continue;
      expect(emojiSrc(p.meta.emoji)).not.toBeNull();
    }
    expect(Object.keys(EMOJI_DATA_URI).length).toBeGreaterThanOrEqual(9);
  });
});
