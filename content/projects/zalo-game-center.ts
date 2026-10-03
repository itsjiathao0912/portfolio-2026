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
    { type: "heading", text: "Overview", icon: "compass", eyebrow: "Context" },
    {
      type: "paragraph",
      text: "At Zalo I owned the roadmap and delivery for 1 new product launch and 4 existing products, coordinating engineering, design, and data teams.",
    },
    {
      type: "metrics",
      items: [
        { value: "+30%", label: "total ad revenue within six months" },
        { value: "+15%", label: "user engagement from monthly events" },
        { value: "+3%", label: "paying users" },
        { value: "−40%", label: "manual data extraction" },
      ],
      badge: "CV figure",
      source: "Thao's CV (Zalo, Feb 2023 to Apr 2024). Baselines are not disclosed.",
    },
    {
      type: "barChart",
      title: "Change in each metric I owned",
      caption: "Size of each change, in percent. Manual data extraction went down; the other three went up.",
      source: "Thao's CV (Zalo, Feb 2023 to Apr 2024). Baselines are not disclosed.",
      badge: "CV figure",
      unit: "%",
      items: [
        { label: "Manual data extraction", value: 40, group: "Went down" },
        { label: "Total ad revenue", value: 30, group: "Went up" },
        { label: "User engagement", value: 15, group: "Went up" },
        { label: "Paying users", value: 3, group: "Went up" },
      ],
    },
    { type: "heading", text: "Tracking dashboard", icon: "chart-column", eyebrow: "Data" },
    {
      type: "paragraph",
      text: "I developed and rolled out a tracking dashboard for Zalo Game Center, replacing manual reporting with a self-serve surface. Manual data extraction dropped by 40% and decisions could rest on data instead of requests.",
    },
    { type: "heading", text: "Ad placement experiments", icon: "flask-conical", eyebrow: "Monetization" },
    {
      type: "paragraph",
      text: "I optimized in-game ad placements through A/B testing across the Game Center portfolio, increasing total ad revenue by 30% within six months.",
    },
    { type: "heading", text: "Monthly events", icon: "calendar-days", eyebrow: "Engagement" },
    {
      type: "paragraph",
      text: "I ran a monthly cadence of in-game events, which lifted user engagement by 15% and grew paying users by 3%.",
    },
    { type: "image", src: null, alt: "Zalo Game Center tracking dashboard (screenshot not yet available)", caption: "Internal screens; a sanitized capture will replace this frame." },
  ],
} satisfies ProjectInput;

export default project;
