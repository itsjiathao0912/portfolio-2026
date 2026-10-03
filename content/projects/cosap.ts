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
    layout: "showcase",
    lede: "One multi-tenant product for accounting, legal compliance and payroll, built for Korean SMBs.",
    screens: [
      { src: "/work/cosap/landing-mobile.webp", alt: "COSAP landing page on a phone", device: "phone" },
      { src: "/work/cosap/landing-mobile-2.webp", alt: "COSAP product stack section on a phone", device: "phone" },
    ],
    emoji: "🧾",
    color: "#10b981",
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
    { type: "metrics", items: [{ value: "8", label: "modules in the product design" }, { value: "2", label: "client markets: Korea and Singapore" }], source: "Thao's CV (SkyLab, COSAP)" },
    {
      type: "barChart",
      title: "What COSAP says it delivers",
      caption: "COSAP also advertises risk detection within 24 hours. These are company marketing figures, not my personal outcomes.",
      source: "cosap.ai public website (company-published)",
      badge: "Company figure",
      unit: "%",
      items: [
        { label: "Less time spent on review", value: 60 },
        { label: "Fewer customer inquiries", value: 40 },
      ],
    },
    {
      type: "flow",
      title: "COSAP's three-tier AI engine",
      caption: "How the public site describes the AI layer that runs under every module.",
      source: "cosap.ai public website",
      steps: [
        { label: "Classification", detail: "Every card transaction is sorted" },
        { label: "Anomaly detection", detail: "Fraud and risk scanning" },
        { label: "Assistants", detail: "AI answers common questions" },
      ],
    },
    { type: "heading", text: "Results", icon: "chart-column", eyebrow: "Company figures" },
    {
      type: "paragraph",
      text: "What COSAP's Forge module did at a manufacturing client, measured before and after rollout. These are company figures, reconciled by COSAP against the client's ERP and audit logs. They describe the product, not my personal outcome. Drag the slider to compare.",
    },
    {
      type: "compareSlider",
      title: "Forge at a manufacturing client: before vs after",
      caption: "Each row is scaled to its own larger value, so rows in days, minutes and percent can sit side by side. 82% of error-prone purchase orders were blocked automatically.",
      source: "COSAP company introduction deck v7, p.18 (company figure, reconciled against ERP and audit logs). Client name withheld.",
      badge: "Company figure",
      beforeLabel: "Before Forge",
      afterLabel: "With Forge",
      rows: [
        { label: "Purchase-order errors per month", before: { value: 12.4, display: "12.4" }, after: { value: 2.1, display: "2.1" }, change: "−83%" },
        { label: "Time to flag an anomaly", before: { value: 20592, display: "14.3 days" }, after: { value: 23, display: "23 min" } },
        { label: "On-time delivery", before: { value: 73, display: "73%" }, after: { value: 94, display: "94%" } },
        { label: "Inventory turnover", before: { value: 4.2, display: "4.2×" }, after: { value: 8.7, display: "8.7×" } },
      ],
    },
    {
      type: "beforeAfter",
      title: "Month-end close (hours)",
      caption: "From about three days to about four hours, benchmarked across 12 SMB deployments in Q1 2026.",
      source: "COSAP company introduction deck v3, p.14 (company figure); v7, p.8 confirms the 3-day baseline.",
      badge: "Company figure",
      unit: " h",
      before: { label: "Before (3 days)", value: 72 },
      after: { label: "With COSAP", value: 4 },
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
    {
      type: "gallery",
      images: [
        { src: "/projects/cosap/site-desktop.jpg", alt: "COSAP public website home page", caption: "The public landing page" },
        { src: "/work/cosap/landing-mobile.webp", alt: "COSAP landing page on a phone", caption: "On a phone" },
        { src: "/work/cosap/landing-mobile-2.webp", alt: "COSAP product stack section on a phone", caption: "The COSAP stack" },
      ],
    },
    { type: "heading", text: "Stack", icon: "layers", eyebrow: "Technology" },
    { type: "stack", items: ["Multi-tenant SaaS", "Toss Payments", "Lago", "RAG pipelines", "LLM orchestration"] },
    { type: "links", items: [{ label: "Visit cosap.ai", href: "https://cosap.ai/" }] },
  ],
} satisfies ProjectInput;

export default project;
