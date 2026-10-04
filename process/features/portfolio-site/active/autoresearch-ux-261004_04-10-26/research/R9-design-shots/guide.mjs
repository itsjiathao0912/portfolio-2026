import { createRequire } from "module";
const require = createRequire("/Users/knamnguyen/Documents/0-Programming/duma/package.json");
const { chromium } = require("playwright"); import fs from "fs";
const W = +process.argv[2]||1440, H = W<500?844:900;
const OUT = process.cwd()+`/g${W}`; fs.mkdirSync(OUT,{recursive:true});
const b = await chromium.launch(); const c = await b.newContext({viewport:{width:W,height:H},hasTouch:W<500,isMobile:W<500}); const p=await c.newPage();
const errs=[]; p.on("pageerror",e=>errs.push(String(e))); p.on("console",m=>{if(m.type()==="error")errs.push(m.text())});
await p.goto("http://localhost:3003/",{waitUntil:"load",timeout:90000}); await p.waitForTimeout(3000);
const t=p.locator('[role=radio]').nth(1); await t.scrollIntoViewIfNeeded(); await t.click(); await p.waitForTimeout(2000);
const sh=await p.evaluate(()=>document.documentElement.scrollHeight); const rows=[];
for(let i=0;i<30;i++){
  const y=Math.round((sh-H)*i/29); await p.evaluate(y=>scrollTo(0,y),y); await p.waitForTimeout(1900);
  const r=await p.evaluate(async()=>{
    const g=document.querySelector('[data-testid=guide-character]'); if(!g) return null;
    const svg=g.querySelector('svg'); const gb=g.getBoundingClientRect(); if(!gb.width) return null;
    let op=1; for(let e=g;e;e=e.parentElement) op*=parseFloat(getComputedStyle(e).opacity);
    const vis=getComputedStyle(g).visibility;
    let low=-1; const sr=svg.getBoundingClientRect();
    for(const n of svg.querySelectorAll("path,rect,ellipse,circle,polygon,polyline,line")){ if(n.closest("defs,clipPath,mask,pattern,symbol"))continue; const q=n.getBoundingClientRect(); if(q.width>0&&q.height>0&&q.bottom>low) low=q.bottom;}
    const cx=gb.left+gb.width/2;
    const drawn=(e)=>{const cs=getComputedStyle(e);const tag=e.tagName;
      if(['IMG','VIDEO','CANVAS','HR','PICTURE'].includes(tag))return 'media'; if(tag==='svg')return 'svg';
      const m=(cs.backgroundColor.match(/[\d.]+/g)||[]); const a=m.length>3?parseFloat(m[3]):(cs.backgroundColor==='transparent'?0:1);
      if(a>0.05&&e!==document.body&&e!==document.documentElement)return 'bg'; if(cs.backgroundImage!=='none')return 'bgimg';
      if(parseFloat(cs.borderTopWidth)>0&&cs.borderTopStyle!=='none'&&cs.borderTopColor!=='rgba(0, 0, 0, 0)')return 'border';
      if(cs.boxShadow!=='none')return 'shadow'; return null;};
    const probe=(x,y)=>{const el=document.elementFromPoint(x,y); for(let e=el;e&&e!==document.documentElement;e=e.parentElement){const k=drawn(e); if(k) return {kind:k,top:e.getBoundingClientRect().top,tag:e.tagName+'.'+String(e.className).slice(0,30)+'|'+(e.getAttribute('data-testid')||'')}} return null};
    const hits=[-12,-4,0,4,12].map(dx=>probe(cx+dx,low+2));
    const best=hits.filter(Boolean).sort((a,b)=>Math.abs(a.top-low)-Math.abs(b.top-low))[0]||null;
    // text overlap with body (excluding the layer)
    const layer=document.querySelector('[data-testid=visitor-guide-layer]');
    const body=document.querySelector('[data-testid=visitor-guide]').getBoundingClientRect();
    const bub=document.querySelector('[data-testid=guide-bubble-anchor]'); const bubEl=bub&&bub.firstElementChild;
    const rectOf=bub&&bub.getBoundingClientRect(); const brect=bubEl?bubEl.getBoundingClientRect():null;
    const bubVisible=!!brect&&brect.width>0&&getComputedStyle(bubEl).visibility!=='hidden'&&parseFloat(getComputedStyle(bubEl).opacity)>0.05;
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); const hitText=(R)=>{const out=[];let n;let cnt=0;
      while((n=walker.nextNode())&&cnt<4000){ if(!n.nodeValue.trim())continue; const pe=n.parentElement; if(!pe||layer.contains(pe))continue; const cs=getComputedStyle(pe); if(cs.visibility==='hidden'||parseFloat(cs.opacity)<0.05)continue;
        const rg=document.createRange(); rg.selectNodeContents(n); for(const q of rg.getClientRects()){ if(q.width<2||q.height<2)continue; const ox=Math.min(q.right,R.right-3)-Math.max(q.left,R.left+3), oy=Math.min(q.bottom,R.bottom-3)-Math.max(q.top,R.top+3); if(ox>2&&oy>2){ out.push(n.nodeValue.trim().slice(0,24)); cnt++; break; } } } return out;};
    const bodyText=hitText({left:body.left+14,right:body.right-14,top:body.top+10,bottom:body.bottom-10});
    const walker2=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    let bubText=[]; if(bubVisible){ const R=brect; let n; while((n=walker2.nextNode())){ if(!n.nodeValue.trim())continue; const pe=n.parentElement; if(!pe||layer.contains(pe))continue; const cs=getComputedStyle(pe); if(cs.visibility==='hidden'||parseFloat(cs.opacity)<0.05)continue; const rg=document.createRange(); rg.selectNodeContents(n); for(const q of rg.getClientRects()){ const ox=Math.min(q.right,R.right-3)-Math.max(q.left,R.left+3), oy=Math.min(q.bottom,R.bottom-3)-Math.max(q.top,R.top+3); if(q.width>2&&ox>2&&oy>2){bubText.push(n.nodeValue.trim().slice(0,24));break}} } }
    const s1=brect?[brect.x,brect.y]:null; await new Promise(r=>setTimeout(r,500)); const brect2=bubEl?bubEl.getBoundingClientRect():null;
    const still=brect&&brect2?Math.hypot(brect.x-brect2.x,brect.y-brect2.y):0;
    return {bot:gb.bottom,low,op,vis,floor:Math.abs(low-innerHeight)<=3,best,bodyText,bubVisible,bubText,bub:brect&&{x:brect.x,y:brect.y,w:brect.width,h:brect.height},bubDist:brect?Math.hypot(brect.x+brect.width/2-(body.x+body.width/2),brect.y+brect.height-body.y):null,still,gx:gb.x,gy:gb.y,gw:gb.width,gh:gb.height};
  });
  if(!r){rows.push({i,y,none:true});continue}
  const clip={x:Math.max(0,Math.round(r.gx-60)),y:Math.max(0,Math.round(r.gy-90)),width:Math.round(r.gw+120)};clip.height=Math.min(H-clip.y,Math.round(r.gh+140));
  await p.screenshot({path:`${OUT}/a${i}.png`,clip});
  await p.evaluate(()=>{document.querySelector('[data-testid=visitor-guide]').style.visibility='hidden'});
  await p.screenshot({path:`${OUT}/b${i}.png`,clip});
  await p.evaluate(()=>{document.querySelector('[data-testid=visitor-guide]').style.visibility=''});
  rows.push({i,y,clip,...r});
}
fs.writeFileSync(OUT+"/rows.json",JSON.stringify({sh,errs,rows},null,1));
const ok=rows.filter(r=>!r.none);
console.log(W,'seen',ok.length,'strict',ok.filter(r=>r.floor||(r.best&&Math.abs(r.best.top-r.low)<=2)).length,'faded',ok.filter(r=>r.op<0.95||r.vis!=='visible').length,'bodytext',ok.filter(r=>r.bodyText.length).length,'bubOverText',ok.filter(r=>r.bubText.length).length,'bubMove',ok.filter(r=>r.still>1).length,'errs',errs.length);
await b.close();
