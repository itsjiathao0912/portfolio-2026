import type { ProjectInput } from "../schema.ts";

const project = {
  id: "zalo-game-center",
  slug: "zalo-game-center",
  title: "Zalo Game Center",
  summary:
    "Roadmap, data, and monetization work for the games platform inside Vietnam's leading messaging app.",
  role: "Product Owner",
  period: "02/2023 — 04/2024",
  year: 2023,
  category: "Growth & data",
  tags: ["A/B testing", "Tracking dashboard", "Live events", "Ad monetization"],
  cover: null,
  links: [],
  sortOrder: 40,
  published: true,
  updatedAt: "2026-10-03T00:00:00.000Z",
  meta: {
    company: "Zalo",
    subtitle: "Consumer · Messaging & Games",
    status: "National-scale consumer product",
    tint: "aqua",
    logo: "/logos/zalo.svg",
    coverAlt: "",
    featured: true,
    proof: [
      { value: "+30%", label: "ad revenue in six months" },
      { value: "+15%", label: "user engagement" },
    ],
    headline: "Ad revenue up 30% in six months, inside Zalo.",
    tone: "deep",
    layout: "magazine",
    lede: "Product Owner for Zalo Game Center: one new launch and four live products.",
    emoji: "🎮",
    color: "#0068ff",
    visual: {
      "kind": "illustration",
      "motif": "games"
    },
  },
  blocks: [
    { type: "heading", text: "The job", icon: "compass", eyebrow: "Context", depth: "skim" },
    {
      type: "paragraph",
      text: "Zalo Game Center is the games platform inside Zalo, Vietnam's leading messaging app. As Product Owner I owned the roadmap and delivery for one new launch and four live products, working with engineering, design and data teams. My claim here is narrow: I did not build the games or the pipelines, I decided what got measured, tested and run, and in what order.",
    },
    {
      type: "custom",
      depth: "read",
      owner: "owned",
      component: "zalo-game-center/OwnershipLens",
      source: "Thao's CV (Zalo, Feb 2023 to Apr 2024) and her Notion profile (BRDs, specs, UAT, product-health monitoring).",
    },
    { type: "heading", text: "The decision: measure first", icon: "chart-column", eyebrow: "Insight" },
    {
      type: "paragraph",
      text: "The tension was simple. Reporting was manual, so every question about the games cost someone a data request, and an ad placement is easy to argue about and hard to settle. I put the tracking dashboard first so that experiments and events would have a scoreboard. Step through the three workstreams and watch the results appear.",
    },
    {
      type: "decision",
      title: "Run experiments first, or build the scoreboard first?",
      rejected: { label: "Experiments straight away", text: "Argue about ad placements and test them on manual, request-by-request reporting." },
      chosen: { label: "The tracking dashboard first", text: "Put the tracking dashboard first, so experiments and events have a scoreboard." },
      because: "Reporting was manual, so every question about the games cost someone a data request, and an ad placement is easy to argue about and hard to settle.",
      cost: "Experiments waited until the scoreboard existed.",
      source: "Thao's CV (Zalo, Feb 2023 to Apr 2024) and her description of the roadmap.",
    },
    {
      type: "custom",
      component: "zalo-game-center/MeasureFirst",
      source: "Thao's CV (Zalo, Feb 2023 to Apr 2024): dashboard −40% manual data extraction; ad placement A/B tests +30% total ad revenue in six months; monthly events +15% engagement, +3% paying users. Baselines are not disclosed.",
    },
    { type: "heading", text: "Why test at all", icon: "flask-conical", eyebrow: "Monetization" },
    {
      type: "paragraph",
      text: "Ad placement looks like a design opinion. It is a revenue lever, and at this scale the cheapest way to find out which placement is better is to ask the players. Try the call yourself, then see why a picture is not evidence.",
    },
    {
      type: "custom",
      component: "zalo-game-center/ExperimentReveal",
      source: "Thao's CV (Zalo, Feb 2023 to Apr 2024): +30% total ad revenue within six months. The phone layouts are a schematic, not Zalo screens; placement positions and per-test results are not disclosed.",
    },
    {
      type: "results",
      items: [
        { value: "+30%", label: "total ad revenue within six months", badge: "Company figure" },
        { value: "+15%", label: "user engagement from monthly events", badge: "Company figure" },
        { value: "+3%", label: "paying users", badge: "Company figure" },
      ],
      next: "write the baseline and the test log down next to every number, so the result can be checked, not just believed.",
      source: "Thao's CV (Zalo, Feb 2023 to Apr 2024). Baselines are not disclosed, and the figures are shown exactly as written. The −40% manual data extraction from the dashboard is in the walkthrough above.",
    },
  ],
} satisfies ProjectInput;

export default project;
