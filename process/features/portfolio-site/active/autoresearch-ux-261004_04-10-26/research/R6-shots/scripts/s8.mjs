import { chromium, OUT, open, ev } from "./lib.mjs";
const b = await chromium.launch();
for (const [path, name, W, H] of [["/", "home", 1440, 900], ["/about", "about", 1440, 900], ["/work", "work", 1440, 900], ["/", "home", 390, 844], ["/about", "about", 390, 844]]) {
  const { c, p, errs } = await open(b, W, H, W < 800, path); await p.waitForTimeout(1500);
  const DH = await ev(p, () => document.documentElement.scrollHeight);
  const n = name === "home" ? 6 : 4;
  for (let i = 0; i < n; i++) { await ev(p, v => window.scrollTo({ top: v, behavior: "instant" }), Math.round((DH - H) * i / (n - 1))); await p.waitForTimeout(1000); await p.screenshot({ path: `${OUT}/pages/${name}-${W}-${i}.jpg`, type: "jpeg", quality: 62 }); }
  console.log(name, W, "DH", DH, "errs", errs.length, errs.slice(0, 2));
  await c.close();
}
await b.close();
