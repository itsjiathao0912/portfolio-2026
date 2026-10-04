import { chromium, OUT, open, ev, save } from "./lib.mjs";
const b = await chromium.launch();
const { c, p, errs } = await open(b, 1440, 900);
await p.waitForSelector("[data-testid=visitor-strip]", { timeout: 90000 });
await p.locator("[data-testid=tile-engineer]").click(); await p.waitForTimeout(3000);
await p.evaluate(()=>document.activeElement?.blur());
// stats + countries + poll shots
await ev(p, () => { const e = document.querySelector("[data-testid=visitor-stats-strip]"); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 250); });
await p.waitForTimeout(1500); await p.screenshot({ path: `${OUT}/ui/stats-d.jpg`, type: "jpeg", quality: 75 });
const stats = await ev(p, () => ({ strip: document.querySelector("[data-testid=visitor-stats-strip]")?.innerText, countries: [...document.querySelectorAll("[data-testid=visitor-countries] li")].map(e => e.innerText.trim()), summary: document.querySelector("[data-testid=visitor-summary]")?.innerText, privacy: document.querySelectorAll("[data-testid=visitor-privacy]").length }));
console.log("STATS", JSON.stringify(stats));
await ev(p, () => { const e = document.querySelector("[data-testid=visitor-poll]"); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 200); });
await p.waitForTimeout(1500); await p.screenshot({ path: `${OUT}/ui/poll-d.jpg`, type: "jpeg", quality: 75 });
console.log("POLL", await ev(p, () => document.querySelector("[data-testid=visitor-poll]").innerText.replace(/\n+/g, " | ").slice(0, 400)));
// card -> case morph
await ev(p, () => { const e = [...document.querySelectorAll("a")].find(a => a.textContent.includes("Case study") && a.href.includes("lumicap")) || [...document.querySelectorAll("a[href*='/work/']")][0]; window.__a = e; window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 400); });
await p.waitForTimeout(2500);
await p.evaluate(() => { window.__m = []; const t0 = performance.now(); window.__t0 = t0; const f = () => { const h = document.querySelector("h1"); const r = h?.getBoundingClientRect(); window.__m.push([Math.round(performance.now() - t0), location.pathname, h ? h.textContent.slice(0, 24) : null, r ? Math.round(r.top) : null, Math.round(scrollY), document.getAnimations().length]); if (performance.now() - t0 < 3500) requestAnimationFrame(f); }; requestAnimationFrame(f); });
const t0 = Date.now();
await p.evaluate(() => window.__a.click());
let k = 0; for (const t of [80, 200, 380, 650, 1000, 1700]) { await p.waitForTimeout(Math.max(0, t - (Date.now() - t0))); await p.screenshot({ path: `${OUT}/ui/morph-${++k}.jpg`, type: "jpeg", quality: 60 }); }
await p.waitForTimeout(2000);
const m = await ev(p, () => window.__m);
save("morph", m);
let prev = ""; for (const r of m) { const kk = r[1] + r[2]; if (kk !== prev) console.log("MORPH", r.join(" ")); prev = kk; }
const settle = m.findLast((r, i) => i > 0 && m[i - 1][3] !== r[3]);
console.log("MORPH last h1 move at", settle?.[0], "anims end", m.filter(r => r[5] > 0).at(-1)?.[0]);
console.log("errs", errs);
await b.close();
