import type { ProjectInput } from "../schema.ts";

const project = {
  id: "reorc-data-platform",
  slug: "reorc-data-platform",
  title: "ReOrc Data Platform",
  summary:
    "Governance, lineage, and validation for an enterprise data platform — so business users can trust what they report.",
  role: "IT Business Analyst",
  period: "04/2024 — 03/2025",
  year: 2024,
  category: "Growth & data",
  tags: ["Data governance", "Data lineage", "Data modeling", "UAT"],
  cover: null,
  links: [{ label: "reorc.com", href: "https://reorc.com/" }],
  sortOrder: 50,
  published: true,
  updatedAt: "2026-10-03T00:00:00.000Z",
  meta: {
    company: "ReOrc AI",
    subtitle: "Enterprise data platform",
    status: "B2B · Data",
    tint: "lavender",
    logo: "/logos/reorc.svg",
    coverAlt: "",
    featured: false,
    proof: [
      { value: "−40%", label: "rework" },
      { value: "95%", label: "first-pass UAT" },
    ],
    headline: "Data people can trust, with 40% less rework.",
    tone: "light",
    layout: "magazine",
    lede: "Governance, lineage and UAT for Recurve, ReOrc's microservice data platform.",
    emoji: "🔗",
    color: "#8b5cf6",
    visual: {
      "kind": "illustration",
      "motif": "lineage"
    },
  },
  blocks: [
    { type: "heading", text: "The problem", icon: "compass", eyebrow: "Context" },
    {
      type: "paragraph",
      text: "Recurve is ReOrc's microservice data platform: connect a database, build data models, chain them into scheduled pipelines, watch their health. A platform like this is only useful if the person reading a report can trust the number on it. And a number is only as trustworthy as the requirements behind the feature that produced it.",
    },
    {
      type: "callout",
      text: "My bet: in a data product, a vague requirement is the most expensive bug. It ships as code, and the cost shows up later as rework.",
    },
    { type: "heading", text: "The tension", icon: "shield-check", eyebrow: "Why it was hard" },
    {
      type: "paragraph",
      text: "Governance, lineage and modeling touch who may see what, where data comes from and what depends on it. Each of those hides questions a developer can only answer by asking. Every question asked mid-build is a delay; every one guessed wrong is rework.",
    },
    {
      type: "custom",
      component: "reorc-data-platform/StoryGap",
      source: "Invented example written to show the technique. Questions follow the Recurve lineage and governance areas in Thao's CV (ReOrc AI, Apr 2024 to Mar 2025).",
    },
    { type: "heading", text: "What I decided", icon: "git-branch", eyebrow: "My part" },
    {
      type: "list",
      items: [
        "Benchmark enterprise data platforms first, then design the governance and access-control frameworks from what the good ones do.",
        "Design and launch data modeling and lineage features, so business users can trace where data comes from and what depends on it.",
        "Replace loose requirements with a clear requirement framework, and put validation checkpoints before anything is called done.",
        "Lead user acceptance testing: write the functional and data validation scenarios myself.",
      ],
    },
    {
      type: "moduleMap",
      title: "The platform areas I worked on",
      source: "Thao's CV and the public Recurve documentation",
      center: "Recurve",
      items: [
        { label: "Governance", detail: "Access control frameworks" },
        { label: "Modeling and lineage", detail: "Trace where numbers come from" },
        { label: "Pipeline health", detail: "Health tracking dashboard" },
      ],
    },
    {
      type: "image",
      src: "/work/reorc-data-platform/recurve-docs-getting-started.webp",
      alt: "Recurve documentation, Getting started page, listing the step-by-step workflow from connection to pipeline",
      caption: "Recurve's public documentation (docs.reorc.com): the workflow my features had to explain end to end. Public page, not an internal screen.",
      size: "wide",
    },
    {
      type: "flow",
      title: "From source to report in Recurve",
      caption: "The product flow lineage has to explain, end to end.",
      source: "Recurve public documentation (docs.reorc.com, getting started)",
      steps: [
        { label: "Connect sources", detail: "Databases and connectors" },
        { label: "Build data models", detail: "From sources and SQL models" },
        { label: "Chain pipelines", detail: "Scheduled jobs" },
        { label: "Track health", detail: "Monitor runs on a dashboard" },
      ],
    },
    {
      type: "custom",
      component: "reorc-data-platform/LineageTrace",
      source: "Invented node names. Stages follow Recurve's documented flow (docs.reorc.com, getting started and data lineage).",
    },
    { type: "heading", text: "Catching it early", icon: "truck", eyebrow: "Process" },
    {
      type: "paragraph",
      text: "Requirement review, data validation scenarios and functional scenarios each target a different kind of failure. Run them in order and defects surface while they are still cheap to fix.",
    },
    {
      type: "custom",
      component: "reorc-data-platform/UatCheckpoints",
      source: "Invented defects illustrating the three checkpoints in Thao's CV (requirement framework, validation checkpoints, UAT scenarios).",
    },
    { type: "heading", text: "What changed", icon: "shield-check", eyebrow: "Outcome" },
    {
      type: "metrics",
      items: [
        { value: "−40%", label: "rework" },
        { value: "+20%", label: "faster feature delivery" },
        { value: "95%", label: "first-pass UAT success" },
      ],
      badge: "Company figure",
      source: "Thao's CV (ReOrc AI, Apr 2024 to Mar 2025). Baselines and measurement method are not disclosed.",
    },
    { type: "links", items: [{ label: "Visit reorc.com", href: "https://reorc.com/" }] },
  ],
} satisfies ProjectInput;

export default project;
