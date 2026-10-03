import type { ProjectInput } from "../schema.ts";

const project = {
  id: "cosap",
  slug: "cosap",
  title: "COSAP",
  summary:
    "An AI-powered ERP built as an affordable SAP alternative for Korean SMBs, spanning accounting, legal compliance, and payroll.",
  role: "Primary PM · cross-market requirements (Korea + Singapore)",
  period: "2025",
  year: 2025,
  category: "Product",
  tags: ["Multi-tenant SaaS", "Toss Payments", "Lago", "RAG pipelines", "LLM orchestration"],
  cover: "/projects/cosap/site-desktop.jpg",
  links: [{ label: "cosap.ai", href: "https://cosap.ai/" }],
  sortOrder: 20,
  published: true,
  updatedAt: "2026-10-03T00:00:00.000Z",
  meta: {
    company: "SkyLab Group",
    subtitle: "Multi-tenant B2B ERP AI SaaS",
    status: "Regulated · Korea",
    tint: "mint",
    logo: "/logos/cosap.png",
    coverAlt: "COSAP public website, top of the home page",
    featured: true,
    proof: [{ value: "8", label: "modules designed" }, { value: "2", label: "markets: Korea and Singapore" }],
    headline: "An affordable SAP alternative for Korean SMBs.",
    tone: "light",
    visual: {
      "kind": "mockup",
      "device": "browser-free",
      "screen": {
        "src": "/projects/cosap/site-desktop.jpg",
        "alt": "COSAP public site"
      }
    },
  },
  blocks: [
    { type: "heading", text: "Overview", icon: "compass", eyebrow: "The product" },
    {
      type: "paragraph",
      text: "COSAP is an AI-powered ERP built as an affordable alternative to SAP for Korean small and medium businesses. It covers accounting, legal compliance, and payroll in one multi-tenant product.",
    },
    { type: "metrics", items: [{ value: "8", label: "modules in the product design" }, { value: "2", label: "client markets: Korea and Singapore" }] },
    {
      type: "callout",
      text: "Company-published figures (cosap.ai, not my personal outcomes): 60% reduced review time, 24-hour risk detection and 40% fewer inquiries.",
    },
    { type: "heading", text: "My role", icon: "user-round", eyebrow: "Ownership" },
    {
      type: "paragraph",
      text: "I am the primary PM for cross-market requirement gathering across Korean and Singaporean clients, leading product design across 8 modules.",
    },
    {
      type: "steps",
      items: [
        { title: "Accounting", text: "Core finance operations for SMBs." },
        { title: "Legal compliance", text: "Requirements gathered for a regulated market." },
        { title: "Payroll", text: "Payroll as part of the same multi-tenant platform." },
      ],
    },
    { type: "heading", text: "The product", icon: "package", eyebrow: "Public site" },
    { type: "image", src: "/projects/cosap/site-desktop.jpg", alt: "COSAP public website home page", caption: "The public landing page." },
    { type: "heading", text: "Stack", icon: "layers", eyebrow: "Technology" },
    { type: "stack", items: ["Multi-tenant SaaS", "Toss Payments", "Lago", "RAG pipelines", "LLM orchestration"] },
    { type: "links", items: [{ label: "Visit cosap.ai", href: "https://cosap.ai/" }] },
  ],
} satisfies ProjectInput;

export default project;
