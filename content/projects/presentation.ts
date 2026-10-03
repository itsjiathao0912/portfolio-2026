// Presentation layer for the /work index and case-study heroes.
//
// Kept separate from the project entries because these fields are visual only
// (cover headline, device mockup, card colour) and are not stored in D1. Every
// headline is built from facts already stated in the project file or in the
// user-decisions note — no new numbers.
//
// Relative `.ts` imports only (see content/schema.ts for why).

/** One screen inside a device mockup. */
export interface MockupScreen {
  src: string;
  alt: string;
}

export type ProjectVisual =
  | {
      kind: "mockup";
      /** Main device. `browser-free` is a floating, frameless screen card. */
      device: "laptop" | "phone" | "browser-free";
      screen: MockupScreen;
      /** Optional second screen, shown as a smaller overlapping card. */
      secondary?: MockupScreen;
    }
  | {
      kind: "illustration";
      /** Which original abstract motif to draw. */
      motif: "billing" | "games" | "lineage";
    };

export interface ProjectPresentation {
  /** Outcome-style sentence used as the case-study H1. */
  headline: string;
  /** `light` = pastel tint; `deep` = solid navy with white text. */
  tone: "light" | "deep";
  visual: ProjectVisual;
}

export const PRESENTATION: Record<string, ProjectPresentation> = {
  lumicap: {
    headline: "Real-world compute capacity, turned into on-chain funds.",
    tone: "light",
    visual: {
      kind: "mockup",
      device: "laptop",
      screen: { src: "/projects/lumicap/site-desktop.jpg", alt: "Lumicap public site on a laptop" },
    },
  },
  cosap: {
    headline: "An affordable SAP alternative for Korean SMBs.",
    tone: "light",
    visual: {
      kind: "mockup",
      device: "browser-free",
      screen: { src: "/projects/cosap/site-desktop.jpg", alt: "COSAP public site" },
    },
  },
  pac: {
    headline: "Four cloud providers' pricing, one billing system.",
    tone: "light",
    visual: { kind: "illustration", motif: "billing" },
  },
  "zalo-game-center": {
    headline: "Ad revenue up 30% in six months, inside Zalo.",
    tone: "deep",
    visual: { kind: "illustration", motif: "games" },
  },
  "reorc-data-platform": {
    headline: "Data people can trust, with 40% less rework.",
    tone: "light",
    visual: { kind: "illustration", motif: "lineage" },
  },
  ledgr: {
    headline: "Labour compliance, checked by 27 verified rules.",
    tone: "light",
    visual: {
      kind: "mockup",
      device: "laptop",
      screen: { src: "/projects/ledgr/home-desktop.jpg", alt: "Ledgr home page on a laptop" },
      secondary: { src: "/projects/ledgr/hdld-desktop.jpg", alt: "Ledgr labour-contract check" },
    },
  },
  "cortex-sentinel": {
    headline: "Open AML monitoring a bank can host itself.",
    tone: "deep",
    visual: {
      kind: "mockup",
      device: "laptop",
      screen: { src: "/projects/cortex-sentinel/mockup-detection.jpg", alt: "Cortex Sentinel detection console on a laptop" },
      secondary: { src: "/projects/cortex-sentinel/mockup-case-management.jpg", alt: "Cortex Sentinel case manager" },
    },
  },
};

/** Presentation for a slug; falls back to a light card with no visual headline. */
export function presentationFor(slug: string, fallbackHeadline: string) {
  return (
    PRESENTATION[slug] ??
    ({ headline: fallbackHeadline, tone: "light", visual: { kind: "illustration", motif: "lineage" } } as ProjectPresentation)
  );
}
