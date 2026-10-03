// Pure helpers for the LinkedIn section (no React): validation of content entries and dates.
import type { LinkedinPostEntry } from "@content/site.ts";

export type { LinkedinPostEntry };

const URN = /^urn:li:(share|ugcPost|activity):\d+$/;
const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function isEmbed(post: LinkedinPostEntry): post is Extract<LinkedinPostEntry, { kind: "embed" }> {
  return post.kind === "embed";
}

/** Problems with one entry (empty = valid). "card" is the default kind. */
export function validateLinkedinPost(post: LinkedinPostEntry): string[] {
  const errors: string[] = [];
  if (!URN.test(post.urn)) errors.push("urn must look like urn:li:share:123");
  if (!/^https:\/\/www\.linkedin\.com\//.test(post.url)) errors.push("url must be a https://www.linkedin.com/ link");
  if (!ISO.test(post.date) || Number.isNaN(new Date(`${post.date}T00:00:00Z`).getTime())) errors.push("date must be YYYY-MM-DD");
  if (post.excerpt.trim().length === 0) errors.push("excerpt is required");
  if (isEmbed(post)) {
    if (!post.title) errors.push("embed needs a title");
    if (!(post.embedHeight?.phone > 0 && post.embedHeight?.desktop > 0)) errors.push("embed needs embedHeight {phone, desktop}");
  } else {
    if (post.image && !post.image.startsWith("/linkedin/")) errors.push("image must be a local file in /linkedin/ (never hotlinked)");
    if (post.image && !post.imageAlt) errors.push("image needs imageAlt");
    for (const n of [post.reactions, post.comments]) if (n !== undefined && !(Number.isInteger(n) && n >= 0)) errors.push("counts must be whole numbers >= 0");
  }
  return errors;
}

/** "today", "3 days ago", "2 weeks ago", "4 months ago", "2 years ago"; "" for a bad date. */
export function relativeDate(iso: string, now: number) {
  const t = new Date(`${iso}T00:00:00Z`).getTime();
  if (Number.isNaN(t)) return "";
  const days = Math.floor((now - t) / 86_400_000);
  if (days < 1) return "today";
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) === 1 ? "" : "s"} ago`;
  if (days < 365) return `${Math.floor(days / 30)} month${Math.floor(days / 30) === 1 ? "" : "s"} ago`;
  return `${Math.floor(days / 365)} year${Math.floor(days / 365) === 1 ? "" : "s"} ago`;
}

/** Card widths (px) and gaps in the snap carousel. */
export const CARD_W = { phone: 320, desktop: 384 } as const;
export const CARD_GAP = { phone: 16, desktop: 24 } as const;
