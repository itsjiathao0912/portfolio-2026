import { chromium, OUT } from "./lib.mjs";
const b = await chromium.launch();
for (const [w,h,t,tag] of [[1440,900,false,"d"],[390,844,true,"m"]]) {
const c=await b.newContext({viewport:{width:w,height:h},hasTouch:t,isMobile:t}); const p=await c.newPage();
for(let k=0;k<4;k++){try{await p.goto("http://localhost:3003/",{waitUntil:"load",timeout:90000});break}catch(e){await p.waitForTimeout(3000)}}
await p.waitForSelector("[data-testid=visitor-strip] button",{timeout:60000});
await p.locator("[data-testid=visitor-strip] button").nth(2).click(); await p.waitForTimeout(2200);
const chip=p.locator('[data-testid="visitor-chip"]'); console.log(tag,"chip count",await chip.count());
if(await chip.count()){ await chip.first().scrollIntoViewIfNeeded(); await p.waitForTimeout(500); const box=await chip.first().boundingBox(); console.log(tag,"chip box",JSON.stringify(box)); await p.mouse.click(box.x+box.width/2, box.y+box.height/2); await p.waitForTimeout(1500); console.log("dlg", await p.evaluate(()=>[document.querySelectorAll("dialog").length, document.querySelector("dialog")?.open, document.activeElement?.tagName]));
 await p.screenshot({path:`${OUT}/ui/modal2-${tag}.jpg`,type:"jpeg",quality:72});
 console.log(tag, await p.evaluate(()=>{const d=document.querySelector('dialog[open]');const q=d?.getBoundingClientRect();return d?{w:q.width,h:q.height,vh:innerHeight}:null}));}
await c.close();}
await b.close();
