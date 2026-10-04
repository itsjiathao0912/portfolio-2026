import { createRequire } from "module";
const require = createRequire("/Users/knamnguyen/Documents/0-Programming/duma/package.json");
const { chromium } = require("playwright");
import fs from "fs";
const OUT = process.cwd(); const b = await chromium.launch(); const o={};
for (const [w,h] of [[1440,900],[768,1024],[390,844]]) {
  const c = await b.newContext({ viewport:{width:w,height:h}, deviceScaleFactor:1, hasTouch:w<500, isMobile:w<500 });
  const p = await c.newPage();
  await p.goto("http://localhost:3003/",{waitUntil:"load",timeout:90000}); await p.waitForTimeout(3000);
  await p.locator('[role=radio]').nth(1).click().catch(()=>{}); await p.waitForTimeout(2000);
  await p.screenshot({path:`${OUT}/h-picked-${w}.png`});
  const info = await p.evaluate(()=>{
    const q=s=>document.querySelector(s); const r=e=>{if(!e)return null;const b=e.getBoundingClientRect();return [Math.round(b.x),Math.round(b.y+scrollY),Math.round(b.width),Math.round(b.height)]};
    const hdr=[...document.querySelectorAll('h2')].find(e=>/selected work/i.test(e.textContent||''));
    const pill=hdr&&[...hdr.parentElement.querySelectorAll('*')].find(e=>e!==hdr&&/\d+ (projects|cases)|all work|view all|see all/i.test(e.textContent||'')&&e.children.length<3);
    const flags=[...document.querySelectorAll('[data-testid=visitor-countries] li')].map(e=>({t:e.textContent.trim(),title:e.getAttribute('title'),aria:e.getAttribute('aria-label')||e.querySelector('[aria-label]')?.getAttribute('aria-label')}));
    const stamp=q('[data-testid*=stamp]')||[...document.querySelectorAll('*')].find(e=>e.children.length===0&&/^SHIPPED$/.test((e.textContent||'').trim()));
    return {hdr:hdr&&hdr.textContent.trim().slice(0,40),hdrR:r(hdr),pillText:pill&&pill.textContent.trim().slice(0,40),pillR:r(pill),flags,stampR:r(stamp),stampFont:stamp&&getComputedStyle(stamp).fontSize,poll:!!q('[data-testid*=poll]'),emojiAnim:[...document.querySelectorAll('img[src*=emoji],img[src*=animated],video,lottie-player,[data-emoji]')].length};
  });
  o[w]=info;
  // selected work header shot
  const hdr=p.locator('h2',{hasText:/selected work/i}).first();
  if(await hdr.count()){ await hdr.scrollIntoViewIfNeeded(); await p.waitForTimeout(1200); await p.screenshot({path:`${OUT}/work-hdr-${w}.png`}); }
  const poll=p.locator('[data-testid*=poll]').first();
  if(await poll.count()){ await poll.scrollIntoViewIfNeeded(); await p.waitForTimeout(1200); await p.screenshot({path:`${OUT}/poll-${w}.png`}); }
  // stamp
  const st=p.getByText('SHIPPED',{exact:true}).first();
  if(await st.count()){ await st.scrollIntoViewIfNeeded(); await p.waitForTimeout(2000); await p.screenshot({path:`${OUT}/stamp-${w}.png`}); }
  // modal
  await p.evaluate(()=>scrollTo(0,0)); await p.waitForTimeout(500);
  const chg=p.getByText(/change (role|who)/i).first();
  if(await chg.count()){ await chg.click().catch(()=>{}); await p.waitForTimeout(1200); await p.screenshot({path:`${OUT}/modal-${w}.png`}); }
  await c.close();
  for (const [nm,path] of [["about","/about"],["gocrypto","/work/gocrypto"],["cortex","/work/cortex-sentinel"]]) {
    const c2 = await b.newContext({ viewport:{width:w,height:h}, hasTouch:w<500, isMobile:w<500 }); const p2=await c2.newPage();
    try{ await p2.goto("http://localhost:3003"+path,{waitUntil:"load",timeout:90000}); await p2.waitForTimeout(2500);
      await p2.screenshot({path:`${OUT}/${nm}-${w}-top.png`}); await p2.evaluate(()=>scrollTo(0,1400)); await p2.waitForTimeout(1200); await p2.screenshot({path:`${OUT}/${nm}-${w}-mid.png`});
      o[`${nm}-${w}`]=await p2.evaluate(()=>({sh:document.documentElement.scrollHeight,sw:document.documentElement.scrollWidth,guide:!!document.querySelector('[data-testid=guide-character]'),emojiEls:[...document.querySelectorAll('img,video,svg')].filter(e=>/emoji|noto|animated/i.test(e.outerHTML.slice(0,300))).length}));
    }catch(e){o[`${nm}-${w}`]=String(e)}
    await c2.close();
  }
  fs.writeFileSync(OUT+"/m2.json",JSON.stringify(o,null,1));
}
await b.close();
