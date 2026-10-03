// Visitor identity: the shared contract (P0). Imported by the picker, the clay
// avatars, the guide, the stats UI and the visit/poll API. Nothing here may
// change after P1/P2/P3 start: changes go through the orchestrator.
//
// ROLE_LABELS is the ONLY label table; roles.ts derives its labels from it.

export const ROLE_IDS = [
  "recruiter",
  "founder",
  "engineer",
  "designer",
  "marketer",
  "growth",
  "data",
  "investor",
  "student",
  "pm",
  "curious",
] as const;

export type RoleId = (typeof ROLE_IDS)[number];

/** Visitor-facing labels, in picker order. Wording comes from the SPEC. */
export const ROLE_LABELS = {
  recruiter: "Recruiter",
  founder: "Founder",
  engineer: "Engineer",
  designer: "Product designer",
  marketer: "Marketer",
  growth: "Growth",
  data: "Data",
  investor: "Investor",
  student: "Student",
  pm: "Fellow PM",
  curious: "Just curious",
} as const satisfies Record<RoleId, string>;

const ROLE_SET: ReadonlySet<string> = new Set(ROLE_IDS);

/** Type guard: true only for one of the 11 role ids (not null, not "none"). */
export function isRoleId(value: unknown): value is RoleId {
  return typeof value === "string" && ROLE_SET.has(value);
}

/**
 * Home sections the walking guide can stand on and talk about. At most 6.
 * Which of them exist on the page is decided by the guide, not here.
 */
export const GUIDE_SECTION_IDS = ["statement", "highlights", "stack", "people", "linkedin", "contact"] as const;

export type GuideSectionId = (typeof GUIDE_SECTION_IDS)[number];

/** Poll option ids only. The visitor-facing labels live in src/lib/poll.ts. */
export const POLL_OPTION_IDS = [
  "compliance-copilot",
  "remittance",
  "fraud-toolkit",
  "women-in-tech",
  "backoffice-agent",
  "agent-payments",
] as const;

export type PollOptionId = (typeof POLL_OPTION_IDS)[number];

const POLL_SET: ReadonlySet<string> = new Set(POLL_OPTION_IDS);

export function isPollOptionId(value: unknown): value is PollOptionId {
  return typeof value === "string" && POLL_SET.has(value);
}
