import { chromium, save, OUT } from "./lib.mjs";
const b = await chromium.launch(); const res = {};
for (const [w,h,tag,t] of [[1440,900,"d",false],[390,844,"m",true]]) {
  const c = await b.newContext({ viewport: { width: w, height: h }, hasTouch: t, isMobile: t }); const p = await c.newPage();
  const errs=[]; p.on("console",m=>{if(m.type()==="error")errs.push(m.text().slice(0,120))});
  await p.goto("http://localhost:3003/", { waitUntil: "load" }); await p.waitForTimeout(1500);
  const sec = p.locator("[data-testid=section-linkedin]"); await sec.scrollIntoViewIfNeeded(); await p.waitForTimeout(1500);
  await sec.scrollIntoViewIfNeeded();
  const info = await p.evaluate(() => {
    const cards=[...document.querySelectorAll("[data-testid=linkedin-card]")];
    return { iframes: document.querySelectorAll("section[data-testid=section-linkedin] iframe").length,
      grid: (()=>{const g=document.querySelector("[data-testid=linkedin-grid]"); const cs=g&&getComputedStyle(g); return g?{display:cs.display,cols:cs.gridTemplateColumns,overflowX:cs.overflowX,sw:g.scrollWidth,cw:g.clientWidth}:null})(),
      cards: cards.map(c=>{const r=c.getBoundingClientRect(); const lc=c.closest("[data-lift-card]")||c; const lr=lc.getBoundingClientRect(); const cs=getComputedStyle(lc); const img=c.querySelector("img[alt]:not([alt=''])")||[...c.querySelectorAll("img")].pop(); const im=c.querySelector("[data-testid=linkedin-media] img, img.object-cover, img"); 
        return { w:Math.round(lr.width), h:Math.round(lr.height), x:Math.round(lr.x), radius:cs.borderRadius, shadow:cs.boxShadow.slice(0,60), ring: cs.boxShadow.includes("0.05")||cs.boxShadow.includes("rgba(0, 0, 0, 0.05)"), counts:(c.querySelector("[data-testid=linkedin-counts]")||{}).innerText, imgs:[...c.querySelectorAll("img")].map(i=>({src:i.currentSrc.slice(-40),nat:[i.naturalWidth,i.naturalHeight],box:[Math.round(i.getBoundingClientRect().width),Math.round(i.getBoundingClientRect().height)],fit:getComputedStyle(i).objectFit,ok:i.complete&&i.naturalWidth>0})), text:c.innerText.slice(0,140).replace(/\n/g," | "), links:[...c.querySelectorAll("a")].map(a=>a.href.slice(0,60)+" "+Math.round(a.getBoundingClientRect().height)) } })
    };
  });
  res[tag]=info; res[tag].errs=errs;
  const g = p.locator("[data-testid=linkedin-grid]"); await g.scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
  await p.screenshot({ path: `${OUT}/motion/linkedin-${tag}.png` });
  await c.close();
}
save("linkedin", res); console.log(JSON.stringify(res,null,1).slice(0,5000)); await b.close();
