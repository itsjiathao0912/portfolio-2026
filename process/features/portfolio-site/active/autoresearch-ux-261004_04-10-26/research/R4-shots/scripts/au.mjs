import { chromium, save } from "./lib.mjs";
const b = await chromium.launch(); const res={};
const slugs=["lumicap","cosap","gocrypto","pac","zalo-game-center","reorc-data-platform","cortex-sentinel","guardline","ledgr"];
const pages=[["home","/"],["about","/about"],["work","/work"],...slugs.map(s=>["case-"+s,"/work/"+s])];
for (const [w,h,tag,t] of [[1440,900,"d",false],[390,844,"m",true]]) {
 const c=await b.newContext({viewport:{width:w,height:h},hasTouch:t,isMobile:t}); const p=await c.newPage();
 for (const [n,u] of pages) {
  await p.goto("http://localhost:3003"+u,{waitUntil:"load",timeout:120000}); await p.waitForTimeout(1200);
  // scroll through to trigger lazies
  const H=await p.evaluate(()=>document.documentElement.scrollHeight); for(let y=0;y<H;y+=700){await p.evaluate(v=>scrollTo(0,v),y);await p.waitForTimeout(120)} await p.evaluate(()=>scrollTo(0,0)); await p.waitForTimeout(300);
  res[n+"-"+tag]=await p.evaluate(()=>{
   const rad={}; const small=[]; const tgt=[]; let dark=0;
   for(const e of document.querySelectorAll("body *")){const cs=getComputedStyle(e); const r=e.getBoundingClientRect(); if(r.width<8||r.height<8)continue;
     if(cs.borderTopLeftRadius!=="0px"&&r.height>40){const k=cs.borderTopLeftRadius; rad[k]=(rad[k]||0)+1}
     if(e.childNodes.length&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim().length>2)){const fs=parseFloat(cs.fontSize); if(fs<12&&cs.visibility!=="hidden"&&r.width>0)small.push(Math.round(fs)+":"+e.textContent.trim().slice(0,20))}
     if((e.tagName==="A"||e.tagName==="BUTTON")&&r.height>0&&r.width>0&&(r.height<44)&&!e.closest("[aria-hidden=true]")) tgt.push(e.textContent.trim().slice(0,20)+" "+Math.round(r.width)+"x"+Math.round(r.height));
     if(r.width>innerWidth*0.9&&r.height>200){const bg=cs.backgroundColor.match(/\d+/g); if(bg&&+bg[0]<60&&+bg[1]<60&&+bg[2]<80&&(bg[3]===undefined||+bg[3]>0)) dark++}
   }
   return {h:document.documentElement.scrollHeight,hs:document.documentElement.scrollWidth>innerWidth+1,rad,small:[...new Set(small)].slice(0,8),smallN:small.length,tgtN:tgt.length,tgt:[...new Set(tgt)].slice(0,8),dark,canv:document.querySelectorAll("canvas").length}
  });
 }
 await c.close();
}
save("audit",res);
for(const [k,v] of Object.entries(res)) console.log(k,v.h,"hscroll",v.hs,"rad",JSON.stringify(v.rad),"small",v.smallN,"tgt<44:",v.tgtN,v.tgt.slice(0,3).join(";"),"dark",v.dark);
await b.close();
