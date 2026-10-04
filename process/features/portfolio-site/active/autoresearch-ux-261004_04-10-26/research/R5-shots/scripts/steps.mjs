import { createRequire } from "module";
const require = createRequire("/Users/knamnguyen/Documents/0-Programming/duma/package.json");
const { chromium } = require("playwright");
import fs from "fs";
const OUT = "/Users/knamnguyen/Documents/0-Programming/portfolio-2026/process/features/portfolio-site/active/autoresearch-ux-261004_04-10-26/research/R5-shots";
fs.mkdirSync(OUT, { recursive: true });
const slugs = ["lumicap","cosap","gocrypto","pac","zalo-game-center","reorc-data-platform","cortex-sentinel","guardline","ledgr"];
const pages = [["home","/"],["about","/about"],["work","/work"],...slugs.map(s=>[`case-${s}`,`/work/${s}`])];
const only = process.argv[2];
const browser = await chromium.launch();
const log = {};
for (const [vw,vh,tag,touch] of [[1440,900,"d",false],[390,844,"m",true]]) {
  const ctx = await browser.newContext({ viewport:{width:vw,height:vh}, hasTouch:touch, isMobile:touch, deviceScaleFactor:1 });
  const page = await ctx.newPage();
  const errs=[]; page.on("console",m=>{if(m.type()==="error")errs.push(m.text().slice(0,160))}); page.on("pageerror",e=>errs.push("PAGEERR "+e.message.slice(0,160)));
  for (const [name,url] of pages) {
    if (only && !name.startsWith(only)) continue;
    for(let k=0;k<3;k++){try{await page.goto("http://localhost:3003"+url,{waitUntil:"load",timeout:90000});break}catch(e){await page.waitForTimeout(3000)}} await page.waitForTimeout(1500);
    let H=3000;for(let k=0;k<4;k++){try{H = await page.evaluate(()=>document.documentElement.scrollHeight);break}catch(e){await page.waitForTimeout(2500)}}
    let n=0, y=0; const rows=[];
    while (y < H && n < 40) {
      for(let k=0;k<4;k++){try{await page.evaluate(v=>window.scrollTo(0,v), y);break}catch(e){await page.waitForTimeout(2500)}} await page.waitForTimeout(650);
      let info={canv:0};try{info = await page.evaluate(()=>({canv:document.querySelectorAll("canvas").length}))}catch(e){}
      await page.screenshot({path:`${OUT}/${name}-${tag}-${String(n).padStart(2,"0")}.jpg`,type:"jpeg",quality:68});
      rows.push({n,y,...info}); n++; y += Math.round(vh*0.9);
      
    }
    log[`${name}-${tag}`]={H,steps:n,maxCanvas:Math.max(...rows.map(r=>r.canv))};
    console.log(name,tag,H,n);
  }
  log[`errors-${tag}`]=errs;
  await ctx.close();
}
fs.writeFileSync(OUT+`/steps-log${only?"-"+only:""}.json`,JSON.stringify(log,null,1));
await browser.close();
