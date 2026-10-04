const { chromium } = require("/Users/knamnguyen/Documents/0-Programming/duma/node_modules/playwright");
(async () => {
  const b = await chromium.launch();
  for (const [name, vp] of [["1440", { width: 1440, height: 900 }], ["390", { width: 390, height: 844 }]]) {
    const ctx = await b.newContext({ viewport: vp });
    const page = await ctx.newPage();
    await page.goto("http://localhost:3003/", { waitUntil: "networkidle" });
    // marquee: tab through logos
    const logos = page.locator('[data-testid="logo-strip"] a');
    const res = [];
    for (let i = 0; i < 5; i++) {
      await page.waitForTimeout(700 * (i + 1) % 3000);
      await logos.nth(i).focus();
      await page.waitForTimeout(250);
      res.push(await logos.nth(i).evaluate((el) => { const r = el.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.right), innerWidth]; }));
    }
    console.log(name, "marquee focus rects", JSON.stringify(res));
    await page.locator('[data-testid="persona-control"]').scrollIntoViewIfNeeded();
    await page.mouse.click(5, 300); await logos.nth(0).evaluate((e) => e.blur());
    const anim = await page.locator(".marquee-track").first().evaluate((el) => [el.style.animation, el.style.animationDelay]);
    console.log("after blur", JSON.stringify(anim));
    // persona: per-frame
    await page.locator('[data-testid="persona-control"]').scrollIntoViewIfNeeded();
    await page.evaluate(() => {
      window.__min = 99; window.__n = 0;
      const cards = [...document.querySelectorAll('[data-testid="stack-card"]')].map((c) => c.parentElement);
      const tick = () => { let v = 0; for (const el of cards) { const r = el.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight) v++; } window.__min = Math.min(window.__min, v); if (++window.__n < 90) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
    await page.getByRole("radio", { name: /Founder/ }).click();
    await page.waitForTimeout(1200);
    console.log(name, "persona min visible cards over 90 frames:", await page.evaluate(() => window.__min));
    await ctx.close();
  }
  await b.close();
})();
