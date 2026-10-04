// scroll sweep: feet alignment + overlap at many positions
import { chromium, OUT, open, ev, save } from "./lib.mjs";
const [W,H] = [[1440,900],[768,1024],[390,844]][+process.argv[2]]; const tag = W;
const b = await chromium.launch();
const { c, p, errs } = await open(b, W, H, W < 800);
await p.waitForSelector("[data-testid=visitor-strip]", { timeout: 90000 });
await p.locator("[data-testid=tile-engineer]").click(); await p.waitForTimeout(3500);
const DH = await ev(p, () => document.documentElement.scrollHeight);
const step = Math.max(Math.round(DH / 30), 200);
const rows = [];
for (let y = 0, i = 0; y < DH - H + step; y += step, i++) {
  await ev(p, v => window.scrollTo({ top: v, behavior: "instant" }), y); await p.waitForTimeout(1500);
  for (let k=0;k<8;k++){ const a=await ev(p,()=>document.querySelector("[data-testid=visitor-guide]")?.dataset.guideFrames); await p.waitForTimeout(450); const b2=await ev(p,()=>document.querySelector("[data-testid=visitor-guide]")?.dataset.guideFrames); if(a===b2) break; }
  const r = await ev(p, () => {
    const g = document.querySelector("[data-testid=visitor-guide]"); const lay = document.querySelector("[data-testid=visitor-guide-layer]");
    if (!g) return { none: 1, sy: scrollY };
    const [fx, fy] = g.dataset.guideFeet.split(",").map(Number);
    const st = document.querySelector("[data-guide-standing]"); const sr = st?.getBoundingClientRect();
    const gb = g.getBoundingClientRect();
    const ints = [...lay.querySelectorAll("button,[data-testid=guide-bubble]")].map(e => e.getBoundingClientRect()).concat([gb]);
    const blocked = [];
    document.querySelectorAll("a[href],button,input,summary,[role=button],[role=radio]").forEach(e => { if (lay.contains(e)) return; const q = e.getBoundingClientRect(); if (q.width < 4 || q.bottom < 0 || q.top > innerHeight) return;
      for (const i of ints) { const ix = Math.min(i.right, q.right) - Math.max(i.left, q.left), iy = Math.min(i.bottom, q.bottom) - Math.max(i.top, q.top); if (ix > 6 && iy > 6) { blocked.push((e.textContent || e.getAttribute("aria-label") || "").trim().slice(0, 22) + " " + Math.round(ix) + "x" + Math.round(iy)); break; } } });
    const txt = []; document.querySelectorAll("h1,h2,h3,p,figcaption").forEach(e => { if (lay.contains(e)) return; const q = e.getBoundingClientRect(); if (q.width < 4 || q.bottom < 0 || q.top > innerHeight) return;
      const ix = Math.min(gb.right, q.right) - Math.max(gb.left, q.left), iy = Math.min(gb.bottom, q.bottom) - Math.max(gb.top, q.top); if (ix > 12 && iy > 12) txt.push(e.textContent.trim().slice(0, 20) + ":" + Math.round(ix) + "x" + Math.round(iy)); });
    return { sy: Math.round(scrollY), mode: g.dataset.guideMode, at: g.dataset.guideAt, feet: [fx, fy], feetVp: Math.round(fy - scrollY), stand: sr ? { tag: st.tagName + (st.dataset.testid ? "#" + st.dataset.testid : ""), topVp: Math.round(sr.top), l: Math.round(sr.left), r: Math.round(sr.right), txt: (st.textContent || "").trim().slice(0, 18) } : null,
      expTop: (()=>{ if(!st) return null; if(!["H1","H2","H3","P"].includes(st.tagName)) return sr.top; const rg=document.createRange(); rg.selectNodeContents(st); const rs=[...rg.getClientRects()].filter(q=>q.width>3&&q.height>6); if(!rs.length) return sr.top; return Math.min(...rs.map(q=>q.top))+parseFloat(getComputedStyle(st).fontSize)*0.22; })(), onX: sr ? fx >= sr.left - 2 && fx <= sr.right + 2 : null, blocked: [...new Set(blocked)].slice(0, 4), txt: txt.slice(0, 3), bubble: !!lay.querySelector("[data-testid=guide-bubble]"), dot: !!lay.querySelector("[data-testid=guide-dot]") };
  });
  rows.push({ i, y, ...r });
  if (i % 3 === 0) await p.screenshot({ path: `${OUT}/guide/sweep-${tag}-${String(i).padStart(2, "0")}.jpg`, type: "jpeg", quality: 60 });
}

const ok = rows.filter(r => !r.none);
console.log(tag, "DH", DH, "positions", rows.length, "with guide", ok.length, "none", rows.filter(r => r.none).length);
ok.forEach(r=>{r.err=r.expTop==null?null:Math.round((r.feetVp-r.expTop)*10)/10});
const errsAbs = ok.filter(r => r.err !== null).map(r => Math.abs(r.err));
console.log("feet err px: n", errsAbs.length, "max", Math.max(...errsAbs), "mean", (errsAbs.reduce((a, b) => a + b, 0) / errsAbs.length).toFixed(1), "offX", ok.filter(r => r.onX === false).length);
console.log("blocked positions", ok.filter(r => r.blocked.length).length, "text-covered", ok.filter(r => r.txt.length).length, "bubble shown", ok.filter(r => r.bubble).length);
for (const r of ok.filter(r => r.blocked.length || r.txt.length || Math.abs(r.err ?? 0) > 2)) console.log(r.i, r.y, r.mode, "err", r.err, JSON.stringify(r.stand), "B:", r.blocked.join("|"), "T:", r.txt.join("|"));
console.log("console errs", errs);
save(`sweep-${tag}`, { DH, rows, errs });
await b.close();
