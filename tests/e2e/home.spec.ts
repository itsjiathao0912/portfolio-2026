import { expect, test } from "@playwright/test";

// Smoke: the stack works end to end (content → SQLite → page) and the light
// theme holds even for a visitor whose OS is in dark mode (playwright.config.ts
// sets colorScheme: "dark").

test("home renders the seeded project", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("home")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Portfolio" })).toBeVisible();
  await expect(page.getByTestId("project-card")).toHaveCount(1);
  await expect(page.getByText("Placeholder project")).toBeVisible();
});

test("light theme tokens apply regardless of OS colour scheme", async ({ page }) => {
  await page.goto("/");
  const colors = await page.evaluate(() => {
    const body = getComputedStyle(document.body);
    return { background: body.backgroundColor, color: body.color };
  });
  expect(colors.background).toBe("rgb(255, 255, 255)"); // --paper #ffffff
  expect(colors.color).toBe("rgb(11, 12, 14)"); // --ink #0b0c0e

  const outlineButton = page.getByRole("link", { name: "Selected work" });
  const buttonBg = await outlineButton.evaluate((el) => getComputedStyle(el).backgroundColor);
  // shadcn's outline button carries `dark:bg-input/30`. If `dark:` followed the
  // OS (Tailwind v4's default) this would be translucent grey, not --paper.
  expect(buttonBg).toBe("rgb(255, 255, 255)");
});

test("D1-backed health route returns real data", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.status()).toBe(200);
  expect(await res.json()).toEqual({ ok: true, projects: 1 });
});
