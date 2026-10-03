// The ONE content table for the visitor roles: label (derived from the P0
// ROLE_LABELS), blurb, optional project order, view note, passive guide line 1
// per home section, and the default clay avatar look.
//
// DRAFT: every order, note and guide line below is editorial copy drafted from
// content/ project categories, for Thao to review. No numbers are invented
// (no digits appear in any line). A role without `order` uses the default order.

import { ROLE_AVATAR } from "@/components/clay/avatar-spec";
import type { AvatarSpec } from "./types";
import { ROLE_IDS, ROLE_LABELS, type GuideSectionId, type RoleId } from "./role-ids";

export type RoleInfo = {
  label: string;
  /** Short line under the label in the picker (hidden on phones). */
  blurb: string;
  /** Project slugs to show first; unlisted slugs keep their default order after. Undefined = default order. */
  order?: readonly string[];
  /** Shown under the Selected-work heading once this role is chosen. */
  note: string;
  /** Passive guide line 1 per anchor (<= 6 keys, each <= 90 chars). The single source of line 1. */
  guideLines: Partial<Record<GuideSectionId, string>>;
  avatar: AvatarSpec;
};

/** Shown in the panel. Verbatim from the SPEC. */
export const PRIVACY_NOTE = "We count roles and countries anonymously. No IP addresses or personal data are stored.";

export const GUIDE_LINE_MAX = 90;

type Draft = Omit<RoleInfo, "label" | "avatar">;

const DRAFTS: Record<RoleId, Draft> = {
  recruiter: {
    blurb: "Hiring or scouting",
    order: ["cortex-sentinel", "pac", "cosap", "lumicap", "reorc-data-platform", "zalo-game-center"],
    note: "Recruiter view: the award and the products with the clearest results first.",
    guideLines: {
      statement: "Start here: who she is, in a few plain words.",
      highlights: "The results recruiters ask about first, with sources.",
      stack: "Her best-evidenced products come first for you.",
      people: "Teams, communities and hackathons she works with.",
      linkedin: "Recent LinkedIn posts, if you want her voice.",
      contact: "Hiring? Say hello in the footer.",
    },
  },
  founder: {
    blurb: "Building a company",
    order: ["ledgr", "lumicap", "cosap", "gocrypto", "guardline", "cortex-sentinel"],
    note: "Founder view: what she shipped and how, her own product first.",
    guideLines: {
      statement: "Start here: a product person who builds.",
      highlights: "What she shipped, and what moved.",
      stack: "Her own product and the platforms she shipped, first.",
      people: "People she builds with: builders and partners.",
      linkedin: "Notes from the build, straight from LinkedIn.",
      contact: "Building something? Say hello below.",
    },
  },
  engineer: {
    blurb: "Writes the code",
    order: ["reorc-data-platform", "pac", "cosap", "cortex-sentinel", "guardline", "zalo-game-center"],
    note: "Engineer view: data platforms, systems and specs first.",
    guideLines: {
      statement: "A PM who reads specs and respects systems.",
      highlights: "Numbers on platforms and data, with sources.",
      stack: "Data platforms and systems come first for you.",
      people: "Engineers and teams she ships with.",
      linkedin: "Her recent posts, if you want the thinking.",
      contact: "Want to talk shop? Say hello below.",
    },
  },
  designer: {
    blurb: "Shapes how it feels",
    order: ["ledgr", "lumicap", "pac", "zalo-game-center", "cortex-sentinel", "guardline"],
    note: "Designer view: products where interface and flow decisions led, first.",
    guideLines: {
      statement: "A product mind who cares how things feel.",
      highlights: "Results from interfaces and flows she shaped.",
      stack: "Products where design choices led come first.",
      people: "The communities and demo rooms she shows up in.",
      linkedin: "Her posts on products and craft.",
      contact: "Compare notes on design? Say hello below.",
    },
  },
  marketer: {
    blurb: "Finds the audience",
    order: ["gocrypto", "zalo-game-center", "ledgr", "lumicap", "pac", "cosap"],
    note: "Marketer view: products with a clear audience and a clear story first.",
    guideLines: {
      statement: "A product person who thinks about the audience.",
      highlights: "What reached people, and what it did.",
      stack: "Products with a clear audience come first.",
      people: "Communities and events she helps grow.",
      linkedin: "Posts that show how she talks about her work.",
      contact: "Want to work together? Say hello below.",
    },
  },
  growth: {
    blurb: "Follows the numbers",
    order: ["reorc-data-platform", "gocrypto", "zalo-game-center", "ledgr", "lumicap", "pac"],
    note: "Growth view: data and growth work first, with the numbers behind it.",
    guideLines: {
      statement: "A PM who follows the numbers.",
      highlights: "Growth and data results, with sources.",
      stack: "Data and growth projects come first for you.",
      people: "Communities and hackathons she helps grow.",
      linkedin: "Notes and wins she shares publicly.",
      contact: "Curious about growth? Say hello below.",
    },
  },
  data: {
    blurb: "Lives in the data",
    order: ["reorc-data-platform", "cortex-sentinel", "guardline", "pac", "lumicap", "cosap"],
    note: "Data view: platforms, scoring and evidence-heavy projects first.",
    guideLines: {
      statement: "A PM who trusts evidence over opinion.",
      highlights: "The data behind the work, sourced.",
      stack: "Data platforms and analytics come first for you.",
      people: "People and teams behind the data work.",
      linkedin: "Her public notes, if you want context.",
      contact: "Want to compare metrics? Say hello below.",
    },
  },
  investor: {
    blurb: "Backs builders",
    order: ["lumicap", "gocrypto", "ledgr", "cosap", "pac", "cortex-sentinel"],
    note: "Investor view: products with the clearest market story first.",
    guideLines: {
      statement: "A founder-minded PM with products out in the world.",
      highlights: "Outcomes and traction she can point to.",
      stack: "Products with the clearest market stories first.",
      people: "Her network of builders, sponsors and communities.",
      linkedin: "Public notes on what she is building.",
      contact: "Interested in what she builds? Say hello below.",
    },
  },
  student: {
    blurb: "Learning the craft",
    order: ["cortex-sentinel", "guardline", "ledgr", "reorc-data-platform", "gocrypto"],
    note: "Student view: hackathon and learning-by-building projects first.",
    guideLines: {
      statement: "A PM who learned by building. Start here.",
      highlights: "What she shipped, so you can see how it goes.",
      stack: "Hackathon and learning projects come first for you.",
      people: "Mentors, mentees and builders around her.",
      linkedin: "Posts that show how she thinks and learns.",
      contact: "Questions about the path? Say hello below.",
    },
  },
  pm: {
    blurb: "Same job, other team",
    order: ["pac", "cosap", "lumicap", "gocrypto", "zalo-game-center", "ledgr"],
    note: "PM view: product decisions and trade-offs first.",
    guideLines: {
      statement: "Another PM, hello. Start with the short version.",
      highlights: "Outcomes and decisions, with the evidence.",
      stack: "Product decisions and trade-offs come first for you.",
      people: "Teams and communities she builds with.",
      linkedin: "Her public notes on product work.",
      contact: "Swap product stories? Say hello below.",
    },
  },
  curious: {
    blurb: "Just browsing",
    note: "Browsing view: everything, in the default order.",
    guideLines: {
      statement: "Welcome. Here is Thao in a few plain words.",
      highlights: "A quick look at what she has done.",
      stack: "Everything, in her default order.",
      people: "The people and communities around the work.",
      linkedin: "Her recent posts, if you want more.",
      contact: "Just saying hi? The footer is open.",
    },
  },
};

export const ROLES = Object.fromEntries(
  ROLE_IDS.map((id) => [id, { ...DRAFTS[id], label: ROLE_LABELS[id], avatar: ROLE_AVATAR[id] } satisfies RoleInfo]),
) as Record<RoleId, RoleInfo>;

/** Passive guide line 1 for a section, or null when the role has none. */
export function guideLineFor(role: RoleId, section: GuideSectionId) {
  return ROLES[role].guideLines[section] ?? null;
}
