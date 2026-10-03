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
    emoji: "🔗",
    color: "#8b5cf6",
    visual: {
      "kind": "illustration",
      "motif": "lineage"
    },
  },
  blocks: [
    { type: "heading", text: "Overview", icon: "compass", eyebrow: "Context" },
    {
      type: "paragraph",
      text: "ReOrc builds an enterprise data platform. My work structured governance, workflows, and validation so the data business users report on is reliable and delivery runs with less churn.",
    },
    {
      type: "metrics",
      items: [
        { value: "−40%", label: "rework" },
        { value: "+20%", label: "faster feature delivery" },
        { value: "95%", label: "first-pass UAT success" },
      ],
    },
    { type: "heading", text: "Governance", icon: "shield-check", eyebrow: "Research" },
    {
      type: "paragraph",
      text: "I benchmarked enterprise data platforms to design governance and access-control frameworks, improving compliance and the reliability of decisions made on the data.",
    },
    { type: "heading", text: "Lineage and modeling", icon: "git-branch", eyebrow: "Features" },
    {
      type: "paragraph",
      text: "I designed and launched data modeling and lineage features that let business users trace where data comes from and what depends on it, reducing reporting ambiguity.",
    },
    { type: "heading", text: "Delivery and UAT", icon: "truck", eyebrow: "Process" },
    {
      type: "list",
      items: [
        "Clearer requirement frameworks and validation checkpoints cut rework by 40% and sped up feature delivery by 20%.",
        "User acceptance testing built on functional and data validation scenarios reached a 95% first-pass success rate.",
      ],
    },
    { type: "image", src: null, alt: "ReOrc lineage view (screenshot not yet available)", caption: "Product screens to come." },
    { type: "links", items: [{ label: "Visit reorc.com", href: "https://reorc.com/" }] },
  ],
} satisfies ProjectInput;

export default project;
