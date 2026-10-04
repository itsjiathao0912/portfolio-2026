import { chromium, OUT, open, ev, save } from "./lib.mjs";
const b = await chromium.launch();
for (const [slug, W, H, tag] of [["cortex-sentinel", 1440, 900, "d"], ["gocrypto", 1440, 900, "d"], ["cortex-sentinel", 390, 844, "m"]]) {
  const { c, p, errs } = await open(b, W, H, W < 800, "/work/" + slug);
  await p.waitForTimeout(1500);
  const DH = await ev(p, () => document.documentElement.scrollHeight);
  const rows = [];
  for (let i = 0; i < 8; i++) {
    const y = Math.round((DH - H) * i / 7);
    await ev(p, v => window.scrollTo({ top: v, behavior: "instant" }), y); await p.waitForTimeout(1100);
    const r = await ev(p, () => { const pill = [...document.querySelectorAll("button,div,nav,[role=radiogroup],[role=tablist]")].find(e => /Skim/.test(e.textContent) && /Deep/.test(e.textContent) && e.getBoundingClientRect().height < 80 && e.children.length < 8 && e.getBoundingClientRect().width < 500);
      const q = pill?.getBoundingClientRect(); const cs = pill && getComputedStyle(pill);
      const nav = document.querySelector("header")?.getBoundingClientRect();
      return { pill: q ? [Math.round(q.left), Math.round(q.top), Math.round(q.width), Math.round(q.height)] : null, pos: cs && [cs.position, pill.parentElement && getComputedStyle(pill.parentElement).position], navBottom: nav && Math.round(nav.bottom), sy: Math.round(scrollY) }; });
    rows.push({ i, y, ...r });
    if (i % 2 === 0 || tag === "d") await p.screenshot({ path: `${OUT}/pages/case-${slug}-${tag}-${i}.jpg`, type: "jpeg", quality: 62 });
  }
  console.log(slug, tag, "DH", DH, "errs", errs.length);
  rows.forEach(r => console.log("  ", r.i, r.sy, JSON.stringify(r.pill), JSON.stringify(r.pos), "nav", r.navBottom));
  save(`case-${slug}-${tag}`, rows);
  // gocrypto steps
  if (slug === "gocrypto") {
    const info = await ev(p, () => { const els = [...document.querySelectorAll("button,[role=tab]")].filter(e => /step|^\d$|^[1-5]/i.test(e.textContent.trim()) || /step/i.test(e.getAttribute("aria-label") || "")); return els.slice(0, 12).map(e => [e.tagName, (e.getAttribute("aria-label") || e.textContent).trim().slice(0, 30), Math.round(e.getBoundingClientRect().width), Math.round(e.getBoundingClientRect().height)]); });
    console.log("GC steps controls", JSON.stringify(info));
  }
  await c.close();
}
await b.close();
