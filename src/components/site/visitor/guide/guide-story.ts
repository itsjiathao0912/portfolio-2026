// The guide's storytelling: extra lines for each home section.
//
// ONE source per line: line 1 of every (role, section) script is
// `ROLES[role].guideLines[section]` (roles.ts). This file supplies ONLY the extra
// lines 2-4 (`more`, or `byRole` where a role gets its own). The combined script
// per (role, section) is 2-4 lines, each <= 90 chars, no duplicates, and any digit
// must also appear in content/ (no invented numbers).
//
// DRAFT: every line below is editorial copy drafted from content/ for Thao to review.

import type { GuideSectionId, RoleId } from "../role-ids";
import { ROLES } from "../roles";
import type { GuideSpotId, PageSpotId } from "./guide-logic";

export const STORY_LINE_MAX = 90;
export const STORY_MIN_LINES = 2;
export const STORY_MAX_LINES = 4;

export type Story = {
  /** Extra lines after line 1, used when the role has no `byRole` entry. 1-3 lines. */
  more: readonly string[];
  byRole?: Partial<Record<RoleId, readonly string[]>>;
};

export const STORIES: Record<GuideSectionId, Story> = {
  statement: {
    more: ["She is a Technical Product Manager at SkyLab Group.", "Billing engines, ledgers and ERP modules that ship."],
    byRole: {
      recruiter: ["Technical Product Manager at SkyLab Group.", "Earlier at ReOrc AI and Zalo.", "Available for product roles."],
      founder: ["She turns ambiguous problems into shipped software.", "Regulated markets are her home turf."],
      engineer: ["She writes requirements the way engineers like them.", "User stories, process maps, validation checkpoints."],
      designer: ["She maps the flow before anyone draws a screen.", "Process mapping and user stories are daily tools."],
    },
  },
  highlights: {
    more: ["Awards, certifications and results, each with a source.", "Tap a tile to see where it comes from."],
    byRole: {
      recruiter: ["Second place at the Agentic AI Build Week, fintech track.", "Cloud and data certifications from AWS, Oracle and Google."],
      founder: ["Shipped across cloud, blockchain and enterprise AI.", "Primary PM across three platforms at once."],
      engineer: ["Certified in AWS and Oracle cloud architecture.", "Data platform work at ReOrc AI."],
      designer: ["Less rework through clearer requirement frameworks.", "Tap a tile to see where it comes from."],
    },
  },
  stack: {
    more: ["Each card is a case study: the problem and the decisions.", "Tap one to read the whole story."],
    byRole: {
      recruiter: ["Cortex Sentinel took second place at a fintech hackathon.", "Each card is a case study with the outcome."],
      founder: ["Lumicap: a blockchain platform for real-asset investing.", "COSAP: an AI ERP platform for SMEs.", "Each card opens a full case study."],
      engineer: ["Data lineage and governance at ReOrc AI.", "Cloud billing across AWS, Azure, Huawei and Alibaba Cloud.", "Each card opens the full case."],
      designer: ["Interfaces for non-technical investors on Lumicap.", "A tracking dashboard for Zalo Game Center.", "Each card opens the full case."],
    },
  },
  people: {
    more: ["Communities, hackathons and demo rooms.", "The part of the job away from the screen."],
    byRole: {
      recruiter: ["She led external relations for a national student competition.", "Partnerships with TikTok, Cocoon and Suntory PepsiCo."],
      founder: ["Sponsors and partners she brought in as a student leader.", "Builders from the Build Stuffs community."],
    },
  },
  linkedin: {
    more: ["Short notes on product work.", "Tap a post to read it on LinkedIn."],
  },
  contact: {
    more: ["Email is the easiest way to reach her.", "A short note is enough."],
    byRole: {
      recruiter: ["She is available for product roles.", "Email is the fastest way in."],
      founder: ["Email works best for a first intro.", "A short note about what you are building is enough."],
    },
  },
};

/**
 * Case-study and about pages: short contextual lines (same rules: 2-4 lines, <= 90 chars,
 * no invented numbers). Line 1 is `first`; `byRole` may swap the extras for a role.
 */
export const PAGE_STORIES: Record<PageSpotId, Story & { first: string }> = {
  "case-intro": { first: "One case study: the problem first, then the decisions.", more: ["Scroll on, I will walk the story with you."] },
  "case-depth": {
    first: "Short on time? This pill sets how deep you read.",
    more: ["Pick another depth any time; the page keeps your place."],
    byRole: { recruiter: ["The short depth keeps the outcomes and her role."], engineer: ["The full depth keeps the system details."] },
  },
  "case-body": { first: "Lost? The contents menu jumps to any section.", more: ["The bar at the top shows how far you have read."] },
  "case-metric": { first: "Here are the numbers that moved.", more: ["They are the outcome of this project."] },
  "case-next": { first: "Done here? The next project is right below.", more: ["Or head back to all of her work."] },
  "about-intro": { first: "Hi again! This is the longer version of her story.", more: ["Tap the chip to hear how her name sounds."] },
  "about-career": { first: "Her career, one card per stop.", more: ["The arrows move along the rail."] },
  "about-experience": { first: "What she did at each company, in plain words.", more: ["The work itself lives in the case studies."] },
  "about-skills": { first: "The tools and methods she uses every week.", more: ["A quick scan shows her whole toolkit."] },
  "about-recognition": { first: "Education, certifications and awards.", more: ["Scroll on for the full list."] },
};

const isPageSpot = (id: GuideSpotId): id is PageSpotId => id in PAGE_STORIES;

/**
 * The full script for a (role, spot): line 1 from the role table (home) or the page story,
 * then the role's own extras or the default. Empty strings are dropped.
 */
export function scriptFor(role: RoleId, section: GuideSpotId): string[] {
  if (isPageSpot(section)) {
    const st = PAGE_STORIES[section];
    return [st.first, ...(st.byRole?.[role] ?? st.more)].filter((l) => l.length > 0);
  }
  const first = ROLES[role].guideLines[section];
  const story = STORIES[section];
  const extras = story.byRole?.[role] ?? story.more;
  return [first, ...extras].filter((l): l is string => typeof l === "string" && l.length > 0);
}
