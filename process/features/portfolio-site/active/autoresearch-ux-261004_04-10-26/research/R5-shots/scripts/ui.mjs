import { chromium, OUT, save } from "./lib.mjs";
import fs from "fs"; fs.mkdirSync(OUT+"/ui",{recursive:true});
const b = await chromium.launch();
const res={};
async function mk(w,h,touch){const c=await b.newContext({viewport:{width:w,height:h},hasTouch:touch,isMobile:touch}); const p=await c.newPage(); p.on("pageerror",e=>(res.errs??=[]).push(e.message.slice(0,120))); return [c,p]}
const go=async(p,u)=>{for(let k=0;k<4;k++){try{await p.goto("http://localhost:3003"+u,{waitUntil:"load",timeout:90000}); await p.waitForTimeout(1800); return}catch(e){await p.waitForTimeout(3000)}}};
const sh=(p,n)=>p.screenshot({path:`${OUT}/ui/${n}.jpg`,type:"jpeg",quality:72});
const T=async(fn)=>{try{return await fn()}catch(e){return "ERR "+String(e).slice(0,100)}};
for (const [w,h,t,tag] of [[1440,900,false,"d"],[390,844,true,"m"]]) {
 const [c,p]=await mk(w,h,t);
 // HOME: nav clock popover
 await go(p,"/");
 res["clock-"+tag]=await T(async()=>{await p.locator('[data-testid="saigon-desk-trigger"]').first().click({timeout:8000}); await p.waitForTimeout(700); await sh(p,"saigon-"+tag); const r=await p.evaluate(()=>{const e=document.querySelector('[data-testid="saigon-desk-pop"]');const q=e?.getBoundingClientRect();return q?{x:q.x,y:q.y,w:q.width,h:q.height,vw:innerWidth}:null}); await p.keyboard.press("Escape"); return r});
 // pick role + chip + modal
 await p.evaluate(()=>document.querySelector('[data-testid="visitor-strip"]')?.scrollIntoView({block:"center"})); await p.waitForTimeout(600);
 await T(async()=>{await p.locator('[data-testid="visitor-strip"] button').nth(1).click({timeout:8000}); await p.waitForTimeout(1800); await sh(p,"tiles-picked-"+tag)});
 res["chip-"+tag]=await T(async()=>{const chip=p.locator('[data-testid="visitor-chip"]').first(); await chip.scrollIntoViewIfNeeded({timeout:8000}); await p.waitForTimeout(500); await sh(p,"chip-"+tag); await chip.click(); await p.waitForTimeout(900); await sh(p,"modal-"+tag); const r=await p.evaluate(()=>{const e=document.querySelector('[data-testid="visitor-modal"]');const q=e?.getBoundingClientRect();return q?{w:q.width,h:q.height,vh:innerHeight,text:e.innerText.slice(0,300)}:null}); await p.keyboard.press("Escape"); await p.waitForTimeout(500); return r});
 // footer: ask-me, disclosures
 await p.evaluate(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"})); await p.waitForTimeout(1500); await sh(p,"footer-"+tag);
 res["disc-"+tag]=await T(async()=>{await p.locator('[data-testid="disclosures-link"]').click({timeout:8000}); await p.waitForTimeout(900); await sh(p,"disclosures-"+tag); const r=await p.evaluate(()=>{const e=document.querySelector('[data-testid="disclosures-sheet"]');const q=e?.getBoundingClientRect();return q?{w:q.width,h:q.height,items:document.querySelectorAll('[data-testid=disclosure-item]').length}:null}); await p.keyboard.press("Escape"); return r});
 // ABOUT say my name
 await go(p,"/about");
 res["name-"+tag]=await T(async()=>{const e=p.locator('[data-testid="say-my-name"]').first(); await e.scrollIntoViewIfNeeded({timeout:8000}); await p.waitForTimeout(500); await sh(p,"name-before-"+tag); await e.click(); await p.waitForTimeout(700); await sh(p,"name-after-"+tag); return await p.evaluate(()=>document.querySelector('[data-testid="say-my-name-pop"]')?.innerText?.slice(0,200)||null)});
 await c.close();
}
save("ui",res); console.log(JSON.stringify(res,null,1)); await b.close();
