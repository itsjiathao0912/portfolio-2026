import { chromium, OUT, save } from "./lib.mjs";
const b = await chromium.launch();
const res={};
for (const [w,h] of [[1440,900],[1280,720],[1024,768],[768,1024]]) {
const c = await b.newContext({ viewport: { width: w, height: h } });
const p = await c.newPage();
for(let k=0;k<3;k++){try{await p.goto("http://localhost:3003/",{waitUntil:"load",timeout:90000});break}catch(e){await p.waitForTimeout(3000)}}
await p.waitForTimeout(2000);
await p.waitForSelector("[data-testid=visitor-strip] button",{timeout:90000}); await p.locator("[data-testid=visitor-strip] button").nth(1).click(); await p.waitForTimeout(2500);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);
const ev=async(f,a)=>{for(let k=0;k<4;k++){try{return await p.evaluate(f,a)}catch(e){await p.waitForTimeout(3000)}}return {none:1}};
const rows=[];
for(let y=0;y<H;y+=Math.round(h*0.5)){
 await ev(v=>window.scrollTo({top:v,behavior:"instant"}),y); await p.waitForTimeout(2300);
 rows.push(await ev(()=>{const lay=document.querySelector('[data-testid="visitor-guide-layer"]'); if(!lay) return {none:1};
  const ints=[...lay.querySelectorAll('button')].map(e=>({n:(e.textContent.trim()||"char").slice(0,14),r:e.getBoundingClientRect()}));
  const bub=lay.querySelector('[data-testid=guide-bubble]'); if(bub) ints.push({n:"bubble",r:bub.getBoundingClientRect()});
  const blocked=[];
  document.querySelectorAll("a[href],button,input,summary,[role=button],[role=radio]").forEach(e=>{if(lay.contains(e))return; const q=e.getBoundingClientRect(); if(q.width<4||q.height<4||q.bottom<0||q.top>innerHeight)return;
   for(const i of ints){const ix=Math.min(i.r.right,q.right)-Math.max(i.r.left,q.left), iy=Math.min(i.r.bottom,q.bottom)-Math.max(i.r.top,q.top); if(ix>8&&iy>8){const cx=(q.left+q.right)/2,cy=(q.top+q.bottom)/2; blocked.push((e.textContent||e.getAttribute("aria-label")||"").trim().slice(0,24)+" by "+i.n+" "+Math.round(ix)+"x"+Math.round(iy)+" ctrTop:"+(document.elementFromPoint(cx,cy)===e||e.contains(document.elementFromPoint(cx,cy))?"no":"YES")); break}}});
  // text covered
  const txt=[]; document.querySelectorAll("h1,h2,h3,p,figcaption,img").forEach(e=>{if(lay.contains(e))return;const q=e.getBoundingClientRect(); if(q.width<4||q.bottom<0||q.top>innerHeight)return; for(const i of ints){const ix=Math.min(i.r.right,q.right)-Math.max(i.r.left,q.left), iy=Math.min(i.r.bottom,q.bottom)-Math.max(i.r.top,q.top); if(ix>20&&iy>10){txt.push((e.textContent||e.alt).trim().slice(0,22)+":"+Math.round(ix)+"x"+Math.round(iy));break}}});
  return {blocked:[...new Set(blocked)].slice(0,5),txt:[...new Set(txt)].slice(0,4)}}));
}
res[w+"x"+h]=rows.map((r,i)=>({y:i,...r})).filter(r=>r.none||r.blocked?.length||r.txt?.length);
res[w+"x"+h+"_total"]=rows.length; await c.close();
}
save("guide-cover",res);
for(const [k,v] of Object.entries(res)) console.log(k, Array.isArray(v)?JSON.stringify(v).slice(0,1500):v);
await b.close();
