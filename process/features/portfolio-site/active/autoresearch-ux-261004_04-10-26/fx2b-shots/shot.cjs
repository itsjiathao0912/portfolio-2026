const { chromium } = require("/Users/knamnguyen/Documents/0-Programming/duma/node_modules/playwright");
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch();
  for (const [name, vp, mobile] of [["d", { width: 1440, height: 900 }, false], ["m", { width: 390, height: 844 }, true]]) {
    const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: mobile ? 2 : 1, hasTouch: mobile, isMobile: mobile });
    const page = await ctx.newPage();
    await page.goto("http://localhost:3003/", { waitUntil: "networkidle" });
    for (const [id, sel] of [["globe", '[data-testid="globe-card"]'], ["persona", '[data-testid="persona-control"]'], ["linkedin", '[data-testid="section-linkedin"]'], ["footer", "footer"]]) {
      const el = page.locator(sel).first();
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${out}/${out.includes("after") ? "a" : "b"}-${name}-${id}.png` });
    }
    await ctx.close();
  }
  await b.close();
})();
