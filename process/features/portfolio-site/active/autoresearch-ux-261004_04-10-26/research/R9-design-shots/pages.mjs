import { createRequire } from "module";
const require = createRequire("/Users/knamnguyen/Documents/0-Programming/duma/package.json");
const { chromium } = require("playwright");
const b=await chromium.launch(); const out={};
for(const [name,path] of [["about","/about"],["gocrypto","/work/gocrypto"],["cortex","/work/cortex-sentinel"],["home","/"]]){
 for(const W of [1440,768,390]){
  const H=W<500?844:900; const c=await b.newContext({viewport:{width:W,height:H},hasTouch:W<500,isMobile:W<500}); const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(String(e).slice(0,100))); p.on("console",m=>{if(m.type()==="error")errs.push(m.text().slice(0,100))});
  await p.goto("http://localhost:3003"+path,{waitUntil:"load",timeout:90000}); await p.waitForTimeout(3500);
  const sh=await p.evaluate(()=>document.documentElement.scrollHeight);
  const info=await p.evaluate(()=>{const over=[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.right>innerWidth+2&&r.width>0&&getComputedStyle(e).position!=='fixed'&&!e.closest('[data-testid=visitor-guide-layer]')}).slice(0,4).map(e=>e.tagName+'.'+String(e.className).slice(0,30)); const small=[...document.querySelectorAll('a,button,[role=button]')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&(r.height<32||r.width<32)&&getComputedStyle(e).visibility!=='hidden'}).length; return {sw:document.documentElement.scrollWidth,over,small,hero:(()=>{const h=document.querySelector('[data-testid=case-hero]'); if(!h)return null; const e=h.querySelector('[data-testid=project-emoji], img[src*=emoji]'); return {emoji:!!e,src:e&&(e.getAttribute('src')||e.querySelector('img')?.getAttribute('src')),txt:h.innerText.slice(0,40)}})()}});
  out[`${name}-${W}`]={sh,errs,...info};
  const n=name==='home'?0:4; 
  for(let k=0;k<(name==='home'?0:5);k++){ const y=Math.round((sh-H)*k/4); await p.evaluate(y=>scrollTo(0,y),y); await p.waitForTimeout(1200); await p.screenshot({path:`${name}-${W}-p${k}.png`}); }
  await c.close();
 }
}
require("fs").writeFileSync('pages.json',JSON.stringify(out,null,1)); console.log(JSON.stringify(out)); await b.close();
