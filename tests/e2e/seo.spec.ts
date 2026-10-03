import { expect, test } from "./fixtures";

// Real page loads on a busy machine: allow more than the 30s default.
test.describe.configure({ timeout: 120_000 });

const SITE = "https://itsjiathao.com";
const ROUTES = [
  { path: "/", title: "Thao Dao — Technical Product Manager" },
  { path: "/about", title: "About · Thao Dao" },
  { path: "/work", title: "Work · Thao Dao" },
  { path: "/work/ledgr", title: "Ledgr case study · Thao Dao" },
] as const;

for (const route of ROUTES) {
  test(`${route.path}: title, canonical, one h1, OG image is a real PNG`, async ({ page, request }) => {
    await page.goto(route.path);
    await expect(page).toHaveTitle(route.title);

    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toBe(route.path === "/" ? SITE : `${SITE}${route.path}`);

    await expect(page.locator("main h1")).toHaveCount(1);
    expect(await page.locator("html").getAttribute("lang")).toBe("en");
    expect(await page.locator('meta[name="theme-color"]').count()).toBeGreaterThan(0);
    expect(await page.locator('meta[name="description"]').getAttribute("content")).toBeTruthy();
    expect(await page.locator('meta[name="twitter:card"]').getAttribute("content")).toBe("summary_large_image");

    const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(ogImage).toBeTruthy();
    const imageUrl = new URL(ogImage!);
    expect(imageUrl.origin).toBe(SITE);
    expect(await page.locator('meta[name="twitter:image"]').getAttribute("content")).toBe(ogImage);
    // The canonical origin is production; fetch the same path from the test server.
    const res = await request.get(`${imageUrl.pathname}${imageUrl.search}`);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toBe("image/png");
    const body = await res.body();
    expect(body.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(body.readUInt32BE(16)).toBe(1200);
    expect(body.readUInt32BE(20)).toBe(630);
  });
}

test("every <img> on the home page has an alt attribute", async ({ page }) => {
  await page.goto("/");
  const missing = await page.locator("img:not([alt])").count();
  expect(missing).toBe(0);
});

test("JSON-LD parses: Person + WebSite on home, Article on a case study", async ({ page }) => {
  const read = async () =>
    (await page.locator('script[type="application/ld+json"]').allTextContents()).flatMap((t) => [JSON.parse(t)].flat());

  await page.goto("/");
  const home = await read();
  expect(home.map((n) => n["@type"]).sort()).toEqual(["Person", "WebSite"]);

  await page.goto("/work/ledgr");
  const [article] = await read();
  expect(article["@type"]).toBe("Article");
  expect(article.url).toBe(`${SITE}/work/ledgr`);
});

test("robots.txt and sitemap.xml", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  const text = await robots.text();
  expect(text).toContain("Allow: /");
  expect(text).toContain("Disallow: /lab");
  expect(text).toContain("Disallow: /api");
  expect(text).toContain(`Sitemap: ${SITE}/sitemap.xml`);

  const map = await request.get("/sitemap.xml");
  expect(map.status()).toBe(200);
  expect(map.headers()["content-type"]).toContain("xml");
  const xml = await map.text();
  expect(xml.match(/<loc>/g)).toHaveLength(12);
  expect(xml).toContain(`<loc>${SITE}/work/cortex-sentinel</loc>`);
});

test("unknown case-study slug: page 404s, its OG image does not 500", async ({ request }) => {
  expect((await request.get("/work/does-not-exist")).status()).toBe(404);
  expect((await request.get("/work/does-not-exist/opengraph-image")).status()).toBeLessThan(500);
});
