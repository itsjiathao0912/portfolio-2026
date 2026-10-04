import { createRequire } from "module";
const require = createRequire("/Users/knamnguyen/Documents/0-Programming/duma/package.json");
const { chromium } = require("playwright");
import fs from "fs";
const OUT = "/Users/knamnguyen/Documents/0-Programming/portfolio-2026/process/features/portfolio-site/active/autoresearch-ux-261004_04-10-26/research/R3-shots/audit.json";
const B="http://localhost:3003";
const browser = await chromium.launch();
const res={};
for (const [vw,vh,tag] of [[1440,900,"d"],[390,844,"m"]]) {
  const ctx = await browser.newContext({viewport:{width:vw,height:vh},hasTouch:tag==="m",isMobile:tag==="m"});
  const page = await ctx.newPage();
  for (const [name,url] of [["home","/"],["about","/about"],["work","/work"],["ledgr","/work/ledgr"],["gocrypto","/work/gocrypto"],["lumicap","/work/lumicap"]]) {
    await page.goto(B+url,{waitUntil:"load"}); await page.waitForTimeout(1200);
    // scroll through to trigger reveals
    const H = await page.evaluate(()=>document.documentElement.scrollHeight);
    for (let y=0;y<H;y+=vh*0.8){ await page.evaluate(v=>window.scrollTo(0,v),y); await page.waitForTimeout(250);} 
    await page.evaluate(()=>window.scrollTo(0,0)); await page.waitForTimeout(300);
    const r = await page.evaluate(()=>{
      const radii={}, shadows={}; const bad=[];
      const all=[...document.querySelectorAll("body *")];
      for(const el of all){ const cs=getComputedStyle(el); const b=el.getBoundingClientRect(); if(b.width<60||b.height<40) continue;
        const rad=cs.borderTopLeftRadius; if(rad!=="0px"){ radii[rad]=(radii[rad]||0)+1; }
        if(cs.boxShadow!=="none"){ shadows[cs.boxShadow.slice(0,90)]=(shadows[cs.boxShadow.slice(0,90)]||0)+1; } }
      // dark full-width sections
      const dark=[]; for(const el of document.querySelectorAll("section, main > div, footer")){ const b=el.getBoundingClientRect(); if(b.width<innerWidth*0.9||b.height<120) continue; const bg=getComputedStyle(el).backgroundColor; const m=bg.match(/\d+(\.\d+)?/g); if(!m) continue; const [r,g,bl,a=1]=m.map(Number); if(a>0.5 && (0.2126*r+0.7152*g+0.0722*bl)/255<0.2) dark.push({tag:el.tagName,id:el.id,h:Math.round(b.height),bg}); }
      const hscroll = document.documentElement.scrollWidth>innerWidth+1;
      const fonts={}; for(const el of document.querySelectorAll("h1,h2,h3,p,a,li,span")){ if(!el.textContent.trim()) continue; const cs=getComputedStyle(el); const k=cs.fontSize; fonts[k]=(fonts[k]||0)+1; }
      const smallText=[...document.querySelectorAll("p,a,span,li,time,figcaption")].filter(el=>{const t=el.textContent.trim(); if(!t||el.children.length>0) return false; const fs=parseFloat(getComputedStyle(el).fontSize); return fs<12;}).length;
      const h1=[...document.querySelectorAll("h1")].map(h=>h.textContent.trim().slice(0,50));
      return {radii,shadows,dark,hscroll,smallText,h1,canvas:document.querySelectorAll("canvas").length,H:document.documentElement.scrollHeight};
    });
    res[`${name}-${tag}`]=r; console.log(name,tag,"H",r.H,"dark",r.dark.length,"hscroll",r.hscroll,"h1",JSON.stringify(r.h1),"small<12px",r.smallText);
  }
  await ctx.close();
}
fs.writeFileSync(OUT,JSON.stringify(res,null,1));
await browser.close();
