import { expect, test } from "./fixtures";

// Real page loads on a busy machine: allow more than the 30s default.
test.describe.configure({ timeout: 120_000 });

test.describe("card to case transition (Chromium view transition)", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("clicking a project card reaches the case in under 1.5 s with no aborted transition", async ({ page }) => {
    const problems: string[] = [];
    page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
    page.on("console", (m) => {
      if (m.type() === "error" || /Transition was aborted|DOM update timed out/i.test(m.text())) problems.push(`console: ${m.text()}`);
    });

    await page.goto("/work");
    const card = page.getByTestId("project-card").first();
    await card.waitFor();
    // The transition path only runs where the API exists (Chromium) and motion is allowed.
    expect(await page.evaluate(() => typeof (document as Document & { startViewTransition?: unknown }).startViewTransition)).toBe("function");
    const href = await card.getAttribute("href");
    expect(href).toBeTruthy();

    const start = Date.now();
    await card.click();
    await page.waitForURL(`**${href}`);
    await expect(page.getByTestId("case-hero")).toBeVisible();
    const elapsed = Date.now() - start;
    expect(elapsed, `card to case took ${elapsed} ms`).toBeLessThan(1500);

    // Give a late 4 s abort a chance to show up if the freeze regressed; it would surface within the cap window.
    await page.waitForTimeout(500);
    expect(problems.filter((p) => /aborted|timed out|DOM update/i.test(p)), problems.join("\n")).toEqual([]);
  });
});

test.describe("ask-me chips follow a role picked in the same tab", () => {
  test("a same-tab visitor change event updates the chips without a reload", async ({ page }) => {
    await page.goto("/");
    const askMe = page.getByTestId("ask-me");
    await askMe.scrollIntoViewIfNeeded();
    await expect(askMe).toHaveAttribute("data-role", "none");
    await page.evaluate(() => {
      window.localStorage.setItem("thao:visitor:v1", JSON.stringify({ role: "founder" }));
      window.dispatchEvent(new CustomEvent("thao:visitor-change"));
    });
    await expect(askMe).toHaveAttribute("data-role", "founder");
  });
});
