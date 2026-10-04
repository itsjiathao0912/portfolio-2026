import { createRequire } from "module";
const require = createRequire("/Users/knamnguyen/Documents/0-Programming/duma/package.json");
const { chromium } = require("playwright");
import fs from "fs";
const OUT = process.cwd();
const b = await chromium.launch();
const out = {};
const pages = [["home","/"]];
for (const [w,h] of [[1440,900]]) {
  for (const [name,path] of pages) {
    const c = await b.newContext({ viewport:{width:w,height:h}, hasTouch:w<500, isMobile:w<500 });
    const p = await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(String(e)));
    try { await p.goto("http://localhost:3003"+path,{waitUntil:"load",timeout:90000}); } catch(e){ out[`${name}-${w}`]={err:String(e)}; await c.close(); continue; }
    await p.waitForTimeout(2500);
    if (name==="home") { const t=p.locator('[role=radio]').nth(2); await t.scrollIntoViewIfNeeded().catch(()=>{}); await t.click().catch(()=>{}); await p.waitForTimeout(2200); }
    const sh = await p.evaluate(()=>document.documentElement.scrollHeight);
    const rec = {sh, guideSeen:0, rows:[], errs};
    for (let i=0;i<30;i++){
      const y=Math.round((sh-h)*i/29);
      await p.evaluate(y=>window.scrollTo(0,y),y); await p.waitForTimeout(1800);
      const r = await p.evaluate(()=>{ try{
        const g=document.querySelector('[data-testid=guide-character]'); if(!g) return null;
        const gb=g.getBoundingClientRect(); if(gb.width===0) return null;
        // fade check
        let op=1; for(let e=g;e;e=e.parentElement){op*=parseFloat(getComputedStyle(e).opacity)} 
        const vis=getComputedStyle(g.closest('[data-testid=visitor-guide]').firstElementChild).visibility;
        const cx=gb.left+gb.width/2, bot=gb.bottom;
        const hidden=[...document.querySelectorAll('[data-testid=visitor-guide-layer] *')]; hidden.forEach(e=>e.dataset._pe=e.style.pointerEvents), hidden.forEach(e=>e.style.pointerEvents='none');
        const el=document.elementFromPoint(cx,bot+2);
        const drawn=(e)=>{const cs=getComputedStyle(e);const tag=e.tagName;
          if(['IMG','VIDEO','CANVAS','HR','PICTURE'].includes(tag))return 'media';
          if(tag==='svg')return 'svg';
          const bg=cs.backgroundColor; const m=bg.match(/[\d.]+/g)||[]; const a=m.length>3?parseFloat(m[3]):(bg==='transparent'?0:1);
          if(a>0.05&&e!==document.body&&e!==document.documentElement)return 'bg';
          if(cs.backgroundImage!=='none')return 'bgimg';
          if(parseFloat(cs.borderTopWidth)>0&&cs.borderTopStyle!=='none'&&cs.borderTopColor!=='rgba(0, 0, 0, 0)')return 'border';
          if(cs.boxShadow!=='none')return 'shadow';
          return null;};
        let s=null,kind=null,top=null,desc='';
        for(let e=el;e&&e!==document.documentElement;e=e.parentElement){const k=drawn(e);if(k){s=e;kind=k;top=e.getBoundingClientRect().top;break}}
        if(s)desc=s.tagName+'.'+(s.className&&s.className.toString().slice(0,40))+'|'+(s.getAttribute('data-testid')||'');
        // inside check: is the point just above sole (bot-4) inside a drawn surface whose top is above bot-4?
        const above=document.elementFromPoint(cx,bot-4); let ins=null;
        for(let e=above;e&&e!==document.documentElement;e=e.parentElement){const k=drawn(e);if(k){const t=e.getBoundingClientRect().top; if(t<bot-6&&e.getBoundingClientRect().height<innerHeight*0.9){ins=e.tagName+'.'+(e.className||'').toString().slice(0,30)+' top '+Math.round(t)}break}}
        hidden.forEach(e=>e.style.pointerEvents=e.dataset._pe||'');
        const floor=Math.abs(bot-innerHeight)<=3;
        const b=document.querySelector('[data-testid=guide-bubble-anchor]'); 
        return {bot:Math.round(bot),cx:Math.round(cx),op,vis,kind,top:top==null?null:Math.round(top),desc,floor,ins,bubble:!!b,bt:b&&b.style.transform};
      }catch(e){return null}}).catch(()=>null);
      if(r){rec.guideSeen++; rec.rows.push({i,y,...r});}
      if([5,12,22].includes(i)) await p.screenshot({path:`${OUT}/${name}-${w}-r4-s${i}.png`});
    }
    rec.pass=rec.rows.filter(r=>r.floor||(r.kind&&Math.abs(r.top-r.bot)<=2)).length;
    rec.inside=rec.rows.filter(r=>r.ins).length;
    rec.faded=rec.rows.filter(r=>r.op<0.95||r.vis!=='visible').length;
    out[`${name}-${w}`]=rec; fs.writeFileSync(OUT+"/m4.json",JSON.stringify(out,null,1));
    console.log(name,w,'seen',rec.guideSeen,'pass',rec.pass,'inside',rec.inside,'faded',rec.faded,'sh',sh,errs.length);
    await c.close();
  }
}

await b.close();
