import { chromium, save, OUT } from "./lib.mjs";
const b = await chromium.launch(); const res={};
for (const [w,h,tag,t] of [[1440,900,"d",false],[390,844,"m",true]]) {
 const c = await b.newContext({ viewport:{width:w,height:h}, hasTouch:t, isMobile:t }); const p = await c.newPage();
 await p.goto("http://localhost:3003/",{waitUntil:"load"}); await p.waitForTimeout(1500);
 const s = p.locator("[data-testid=section-say-hello]"); await s.scrollIntoViewIfNeeded(); await p.waitForTimeout(1000);
 const m = await p.evaluate(()=>{ const sec=document.querySelector("[data-testid=section-say-hello]"); const card=sec.querySelector("[data-lift-card]")||sec.firstElementChild; const cr=card.getBoundingClientRect(); const kids=[...card.querySelectorAll("*")].filter(e=>e.getBoundingClientRect().height>0); const bottom=Math.max(...kids.map(e=>e.getBoundingClientRect().bottom)); const track=document.querySelector("[data-testid=hello-wallet]").getBoundingClientRect(); const coin=document.querySelector("[data-testid=hello-coin]").getBoundingClientRect(); const svg=sec.querySelector("svg[width], svg"); const sr=svg&&svg.getBoundingClientRect(); const foot=document.querySelector("footer"); return {cardH:Math.round(cr.height),cardW:Math.round(cr.width),cardRight:Math.round(cr.right),contentBottomGap:Math.round(cr.bottom-bottom),walletRight:Math.round(track.right),svgRight:sr?Math.round(sr.right):null,coinH:Math.round(coin.height),text:sec.innerText.replace(/\n+/g," | ").slice(0,200), footerText:foot?foot.innerText.replace(/\n+/g," | "):null, getInTouchEls:[...document.querySelectorAll("#get-in-touch")].length, mailtos:[...document.querySelectorAll("a[href^='mailto:']")].map(a=>Math.round(a.getBoundingClientRect().top+scrollY))} });
 res[tag]={before:m};
 await p.screenshot({path:`${OUT}/motion/hello-${tag}-before.png`});
 // drag coin
 const coin = p.locator("[data-testid=hello-coin]"); const cb = await coin.boundingBox(); const wb = await p.locator("[data-testid=hello-wallet]").boundingBox();
 const frames=[];
 await p.mouse.move(cb.x+cb.width/2, cb.y+cb.height/2); await p.mouse.down();
 for (let i=1;i<=12;i++){ await p.mouse.move(cb.x+cb.width/2+(wb.x+wb.width/2-cb.x-cb.width/2)*i/12, cb.y+cb.height/2, {steps:1}); }
 await p.mouse.up(); await p.waitForTimeout(1200);
 res[tag].after = await p.evaluate(()=>{const sec=document.querySelector("[data-testid=section-say-hello]"); return sec.innerText.replace(/\n+/g," | ").slice(0,200)});
 await p.screenshot({path:`${OUT}/motion/hello-${tag}-after.png`});
 await c.close();
}
save("hello",res); console.log(JSON.stringify(res,null,1)); await b.close();
