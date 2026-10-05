// Decides whether a click is an in-app soft navigation the watchdog should guard.
// Pure so bun tests cover it; src/components/site/nav-watchdog.tsx wires it up.
export const NAV_WATCHDOG_MS = 4000;

type Click = { button: number; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean; defaultPrevented: boolean };
type Anchor = { href: string; target: string; hasDownload: boolean };

/** Target URL of a same-origin, different-page, plain left click — otherwise null. */
export function guardedTarget(click: Click, anchor: Anchor | null, current: string): string | null {
  if (!anchor || click.button !== 0 || click.metaKey || click.ctrlKey || click.shiftKey || click.altKey) return null;
  if (anchor.hasDownload || (anchor.target && anchor.target !== "_self")) return null;
  let to: URL, from: URL;
  try {
    to = new URL(anchor.href, current);
    from = new URL(current);
  } catch {
    return null;
  }
  if (to.origin !== from.origin || !/^https?:$/.test(to.protocol)) return null;
  if (to.pathname === from.pathname) return null; // same page / hash link
  return to.href;
}

/** After the timeout: still not on the target page → the soft navigation stalled. */
export function navStalled(target: string, nowHref: string) {
  try {
    return new URL(target).pathname !== new URL(nowHref).pathname;
  } catch {
    return false;
  }
}

/**
 * Inline script (rendered as the first thing in <body>, so it runs before any
 * JS bundle or hydration). A window capture listener sees every click, even one
 * React or next/link later preventDefaults, and arms a timer: still not on the
 * target page after NAV_WATCHDOG_MS → hard navigation. Same rules as
 * guardedTarget/navStalled above (tests/unit check they agree).
 */
export const NAV_GUARD_SCRIPT = `(function(){if(window.__navGuard)return;window.__navGuard=1;var t;
window.addEventListener("click",function(e){try{
if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
var a=e.target&&e.target.closest&&e.target.closest("a[href]");if(!a)return;
if(a.hasAttribute("download")||(a.target&&a.target!=="_self"))return;
var to=new URL(a.href,location.href);if(to.origin!==location.origin||!/^https?:$/.test(to.protocol)||to.pathname===location.pathname)return;
clearTimeout(t);t=setTimeout(function(){if(location.pathname!==to.pathname)location.assign(to.href)},${NAV_WATCHDOG_MS});
}catch(_){}},true);})();`;
