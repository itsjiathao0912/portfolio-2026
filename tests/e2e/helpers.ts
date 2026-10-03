import { expect, type Page } from "@playwright/test";

export const SLUGS = [
  "lumicap",
  "cosap",
  "gocrypto",
  "pac",
  "zalo-game-center",
  "reorc-data-platform",
  "ledgr",
  "cortex-sentinel",
  "guardline",
] as const;

/** Hosts whose own console noise (third-party embeds we do not control) is ignored. */
const THIRD_PARTY = /(^|\.)(linkedin\.com|licdn\.com)$/;

/** Decode a reCAPTCHA frame's `co` parameter (base64 of its embedding origin, "." padding). */
function recaptchaParent(url: URL) {
  if (url.hostname !== "www.google.com" || !url.pathname.startsWith("/recaptcha/")) return null;
  const co = url.searchParams.get("co");
  if (!co) return null;
  try {
    return new URL(atob(co.replace(/\./g, "=").replace(/-/g, "+").replace(/_/g, "/"))).hostname;
  } catch {
    return null;
  }
}

/**
 * True when a console message came from a LinkedIn embed: its own frame,
 * script or resource, or a reCAPTCHA frame LinkedIn nests inside the embed
 * (identified by the embedding origin it declares). Our pages never embed
 * reCAPTCHA themselves, and any other origin's errors still count.
 */
export function isThirdPartyMessage(sourceUrl: string, text = "") {
  // Only an iframe can log this; the LinkedIn embeds are the site's only iframes.
  if (!sourceUrl && /only supported in top-level browsing contexts/.test(text)) return true;
  try {
    const url = new URL(sourceUrl);
    const host = recaptchaParent(url) ?? url.hostname;
    return THIRD_PARTY.test(host);
  } catch {
    return false;
  }
}

function hostOf(u: string) {
  try {
    return new URL(u).hostname;
  } catch {
    return "";
  }
}

/** True when some frame loaded from `sourceUrl`'s origin sits inside a LinkedIn embed frame. */
function insideLinkedinFrame(page: Page, sourceUrl: string) {
  const origin = (() => {
    try {
      return new URL(sourceUrl).origin;
    } catch {
      return "";
    }
  })();
  return page.frames().some((frame) => {
    if (origin && !frame.url().startsWith(origin)) return false;
    for (let f = frame.parentFrame(); f; f = f.parentFrame()) if (THIRD_PARTY.test(hostOf(f.url()))) return true;
    return false;
  });
}

/**
 * Collect console errors and uncaught page errors for the lifetime of the page.
 * Errors logged by LinkedIn's embed iframes — or by frames LinkedIn nests
 * inside them (its reCAPTCHA) — are ignored: their code, not ours. Attribution
 * walks the live frame tree, so anything from our own frame or any other
 * origin still counts.
 */
export function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const url = msg.location().url;
    if (isThirdPartyMessage(url, msg.text())) return;
    if (url && hostOf(url) !== hostOf(page.url()) && insideLinkedinFrame(page, url)) return;
    errors.push(msg.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

/** Scroll the whole page in steps so every scroll-reveal fires, then back to top. */
export async function scrollThrough(page: Page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = Math.max(300, Math.floor((page.viewportSize()?.height ?? 800) * 0.7));
  for (let y = 0; y <= height; y += step) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(60);
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(700);
  await page.evaluate(() => window.scrollTo(0, 0));
}

/** No element may be wider than the viewport (no sideways scrolling). */
export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}
