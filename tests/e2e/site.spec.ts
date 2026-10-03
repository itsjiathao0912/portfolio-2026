import { expect, test } from "./fixtures";
import { CONTENT_SLUGS, scrollThrough, SLUGS, trackErrors } from "./helpers";

// Real page loads on a busy machine: allow more than the 30s default.
test.describe.configure({ timeout: 120_000 });

// Desktop (1440). The config runs as an OS dark-mode user to prove the light
// theme never flips.
test.use({ viewport: { width: 1440, height: 900 } });

test("home renders every section in reference order, from the database", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/");
  await expect(page.getByTestId("home")).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 1, name: "Thao Dao is Technical Product Manager at SkyLab Group" })
  ).toBeVisible();
  await expect(page.getByTestId("portrait").locator("img").first()).toHaveAttribute("alt", "Portrait of Thao Dao");

  const order = ["hero", "section-logos", "section-highlights", "section-work", "site-footer"];
  const tops: number[] = [];
  for (const id of order) {
    const section = page.getByTestId(id);
    await expect(section).toHaveCount(1);
    tops.push(await section.evaluate((el) => el.getBoundingClientRect().top + window.scrollY));
  }
  expect([...tops].sort((a, b) => a - b)).toEqual(tops);
  // The CV sections moved to /about.
  await expect(page.getByTestId("section-experience")).toHaveCount(0);

  await scrollThrough(page);
  await expect(page.getByTestId("logo-strip").locator("img")).toHaveCount(5);
  await expect(page.getByTestId("stack-card")).toHaveCount(SLUGS.length);
  const ctas = await page.getByTestId("stack-cta").evaluateAll((els) => els.map((el) => el.getAttribute("href")));
  expect(ctas.sort()).toEqual(SLUGS.map((s) => `/work/${s}`).sort());
  await expect(page.getByTestId("social-icons").locator("a")).toHaveCount(3);
  await expect(page.getByTestId("dev-gap")).toHaveCount(0);
  expect(await page.locator("body").innerText()).not.toMatch(/\+84|776\s?861/);
  expect(errors).toEqual([]);
});

test("home project TOC follows the reader", async ({ page }) => {
  await page.goto("/");
  const toc = page.getByTestId("home-toc");
  await expect(toc).toBeVisible();
  const links = toc.locator("a");
  await expect(links.first()).toHaveAttribute("data-active", "true");
  await links.last().click();
  await expect(links.last()).toHaveAttribute("data-active", "true");
  await expect(links.first()).toHaveAttribute("data-active", "false");
});

test("about page keeps every experience entry, skills and recognition", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/");
  await page.locator('nav[aria-label="Main"]').getByRole("link", { name: "About" }).click();
  await expect(page).toHaveURL(/\/about$/);
  await scrollThrough(page);
  await expect(page.getByTestId("experience-item")).toHaveCount(6);
  for (const company of ["SkyLab Group", "ReOrc AI", "Zalo", "Chợ Tốt", "MoMo", "Creatio Marketing Club"]) {
    await expect(page.getByTestId("section-experience").getByText(company, { exact: true }).first()).toBeVisible();
  }
  await expect(page.getByTestId("section-skills")).toBeVisible();
  await expect(page.getByTestId("section-recognition")).toBeVisible();
  expect(errors).toEqual([]);
});

test("light theme and fonts hold, including Vietnamese glyphs", async ({ page }) => {
  await page.goto("/about");
  const body = await page.evaluate(() => {
    const style = getComputedStyle(document.body);
    return { background: style.backgroundColor, font: style.fontFamily };
  });
  expect(body.background).toBe("rgb(255, 255, 255)");
  expect(body.font).toContain("Inter Variable");

  const local = page.getByTestId("name-local");
  await expect(local).toHaveText("Gia Thảo");
  const family = await local.evaluate((el) => getComputedStyle(el).fontFamily);
  expect(family).toContain("Archivo Variable");
  // The Vietnamese subset of the heading face actually loaded for "Thảo".
  await page.evaluate(() => document.fonts.ready);
  const ok = await page.evaluate(async () => {
    await document.fonts.load('700 24px "Archivo Variable"', "Thảo");
    return document.fonts.check('700 24px "Archivo Variable"', "Thảo");
  });
  expect(ok).toBe(true);
  const h1Stretch = await page.locator("h1").evaluate((el) => getComputedStyle(el).fontStretch);
  expect(h1Stretch).toBe("118%");
});

// Regression (2026-10-03): rows seeded before metrics.source became required
// failed validation and 6 of 9 projects silently vanished. Both listing pages
// must show EXACTLY the published projects in content/ — count and slugs.
test("home and /work show every published project from content/", async ({ page }) => {
  expect([...SLUGS].sort()).toEqual([...CONTENT_SLUGS].sort());
  for (const [path, testId] of [["/", "stack-card"], ["/work", "project-card"]] as const) {
    const errors = trackErrors(page);
    await page.goto(path);
    await scrollThrough(page);
    const cards = page.getByTestId(testId);
    await expect(cards).toHaveCount(CONTENT_SLUGS.length);
    const slugs = await cards.evaluateAll((els) => els.map((el) => el.getAttribute("data-slug")));
    expect(slugs.sort()).toEqual([...CONTENT_SLUGS].sort());
    expect(errors, path).toEqual([]);
  }
});

test("work index lists every project and filters by category", async ({ page }) => {
  await page.goto("/work");
  await scrollThrough(page);
  await expect(page.getByTestId("project-card")).toHaveCount(SLUGS.length);
  await page.getByTestId("filter-chip").filter({ hasText: "Hackathon" }).click();
  await expect(page.getByTestId("project-card")).toHaveCount(2);
  for (const card of await page.getByTestId("project-card").all()) {
    await expect(card).toHaveAttribute("data-category", "Hackathon");
  }
  await page.getByTestId("filter-chip").filter({ hasText: "All" }).click();
  await expect(page.getByTestId("project-card")).toHaveCount(SLUGS.length);
});

test("every project page opens from /work in the same tab", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/work");
  const hrefs = await page.getByTestId("project-card").evaluateAll((els) => els.map((el) => el.getAttribute("href")));
  expect(hrefs.sort()).toEqual(SLUGS.map((s) => `/work/${s}`).sort());
  for (const card of await page.getByTestId("project-card").all()) {
    expect(await card.getAttribute("target")).toBeNull();
  }

  for (const href of hrefs) {
    const response = await page.goto(href!);
    expect(response?.status(), href!).toBe(200);
    await expect(page.getByTestId("case-study")).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByTestId("meta-row")).toBeVisible();
    await expect(page.getByTestId("case-study-body")).toBeVisible();
    await expect(page.getByTestId("next-project")).toHaveCount(1);
    // Every TOC entry points at a real heading.
    const anchors = await page.getByTestId("case-toc").locator("a").evaluateAll((els) => els.map((a) => a.getAttribute("href")));
    expect(anchors.length).toBeGreaterThanOrEqual(2);
    for (const anchor of anchors) await expect(page.locator(anchor!)).toHaveCount(1);
    // No broken images.
    const broken = await page.locator("img").evaluateAll((imgs) =>
      imgs.filter((img) => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth === 0).map((img) => img.getAttribute("src"))
    );
    expect(broken, href!).toEqual([]);
  }
  expect(errors).toEqual([]);
});

test("case-study table of contents appears after the cover and follows the reader", async ({ page }) => {
  await page.goto("/work/ledgr");
  const toc = page.getByTestId("case-toc");
  await page.evaluate(() => (document.documentElement.style.scrollBehavior = "auto"));
  // Hidden while the hero cover is on screen, shown once it scrolls away.
  await expect(toc).toHaveAttribute("data-shown", "false");
  await page.evaluate(() => {
    const cover = document.getElementById("case-cover")!;
    window.scrollTo(0, cover.getBoundingClientRect().bottom + window.scrollY + 100);
  });
  await expect(toc).toHaveAttribute("data-shown", "true");
  await expect(toc).toBeVisible();
  const sections = toc.locator("a[data-section]");
  await expect(sections.first()).toHaveAttribute("data-active", "true");
  await expect(toc.getByRole("link", { name: "Get in touch" })).toHaveAttribute("href", "#get-in-touch");
  await expect(toc.getByRole("link", { name: "Top" })).toHaveAttribute("href", "#top");
  const last = sections.last();
  await last.click();
  await expect(last).toHaveAttribute("data-active", "true");
  await expect(sections.first()).toHaveAttribute("data-active", "false");
});

test("case-study hero is centred with a sentence headline and a real visual", async ({ page }) => {
  await page.goto("/work/ledgr");
  const h1 = page.locator("h1");
  await expect(h1).toHaveCSS("text-align", "center");
  await expect(page.getByTestId("project-badge")).toContainText("Ledgr");
  await expect(page.locator("#case-cover [data-device]").first()).toBeVisible();
  await expect(page.locator("[data-placeholder]")).toHaveCount(0);
  // Story layout: the round-5 Ledgr page is led by three interactive pieces
  // (no pinned-device walkthrough) whose figures cite a source.
  await expect(page.getByTestId("case-study")).toHaveAttribute("data-layout", "story");
  await expect(page.getByTestId("custom-block")).toHaveCount(3, { timeout: 30_000 });
  const charts = page.getByTestId("dataviz");
  expect(await charts.count()).toBeGreaterThanOrEqual(1);
  for (const chart of await charts.all()) await expect(chart.getByTestId("viz-source")).toContainText("Source:");
  // The lede is a different sentence from the headline.
  expect((await page.getByTestId("case-lede").innerText()).trim()).not.toBe((await h1.innerText()).trim());
  // Showcase layout: a fan of real screens; bento images open in a lightbox.
  await page.goto("/work/cosap");
  await expect(page.getByTestId("fan")).toBeVisible();
  await page.getByTestId("bento").getByTestId("zoom-image").first().click();
  await expect(page.getByTestId("lightbox")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("lightbox")).toHaveCount(0);
});

test("projects without screenshots get an illustration, not a placeholder", async ({ page }) => {
  await page.goto("/work");
  await expect(page.locator("[data-illustration]")).toHaveCount(4);
  await expect(page.locator("[data-placeholder]")).toHaveCount(0);
});

test("next-project card navigates to another case study", async ({ page }) => {
  await page.goto("/work/lumicap");
  await page.getByTestId("next-project").getByTestId("project-card").click();
  await expect(page).toHaveURL(/\/work\/cosap$/);
  await expect(page.getByTestId("case-study")).toHaveAttribute("data-slug", "cosap");
});

test("unknown pages return a real 404 with a way back", async ({ page }) => {
  for (const path of ["/nope", "/work/does-not-exist"]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    await expect(page.getByTestId("not-found")).toBeVisible();
  }
  await page.getByTestId("not-found").getByRole("link", { name: "See the work" }).click();
  await expect(page).toHaveURL(/\/work$/);
});

test("liquid fill follows hover and keyboard focus, then drains", async ({ page }) => {
  await page.goto("/");
  const button = page.getByTestId("footer-email");
  await button.scrollIntoViewIfNeeded();
  await expect(button).toHaveAttribute("data-filled", "false");
  await button.hover();
  await expect(button).toHaveAttribute("data-filled", "true");
  await page.mouse.move(5, 600);
  await expect(button).toHaveAttribute("data-filled", "false");
});

test("health route reports the seeded projects", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.status()).toBe(200);
  expect(await res.json()).toEqual({ ok: true, projects: SLUGS.length });
});
