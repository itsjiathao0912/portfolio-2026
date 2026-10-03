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
    { type: "heading", text: "The bet", icon: "compass", eyebrow: "Core insight", depth: "skim" },
    {
      type: "paragraph",
      text: "Small and mid-sized companies rarely lack software. They lack something that catches the error before it posts. COSAP is built around that idea: an AI-powered ERP for Korean SMBs, positioned as an affordable alternative to SAP, covering accounting, legal compliance and payroll in one multi-tenant product.",
    },
    {
      type: "metrics",
      owner: "owned",
      items: [{ value: "8", label: "modules I led product design across" }, { value: "2", label: "client markets: Korea and Singapore" }],
      source: "Thao's CV (SkyLab, COSAP)",
    },
    { type: "heading", text: "The problem", icon: "chart-column", eyebrow: "Why it matters" },
    {
      type: "paragraph",
      text: "The company's launch material frames three leaks. Finance: closing the books takes 10+ days a month. Payroll: about 1 in 5 runs contains an error. Leadership: internal fraud can take a year to notice. Those are industry benchmarks the company cites (EY, APQC, ACFE), not measurements of mine.",
    },
    { type: "heading", text: "The tension", icon: "layers", eyebrow: "Decision" },
    {
      type: "paragraph",
      text: "SMBs will not rip out the ERP, accounting and HR tools they already run, and a new system means weeks of training. So the product stance became a layer above those systems, with Telegram as the everyday surface. Toggle the two pillars below.",
    },
    {
      type: "decision",
      title: "Replace the company's ERP, or sit above it?",
      rejected: { label: "A new system", text: "Ask small companies to replace the ERP, accounting and HR tools they already run." },
      chosen: { label: "A layer above existing systems", text: "Sit above those tools and catch errors before they post, with Telegram as the everyday surface." },
      because: "SMBs will not rip out what they already run, and a new system means weeks of training.",
      source: "COSAP company introduction deck v7, p.4 and launch deck v3, p.8 (confidential decks; paraphrased).",
    },
    {
      type: "custom",
      component: "cosap/LoopToggle",
      source: "COSAP company introduction deck v7, p.4-5 (confidential deck; paraphrased and redrawn).",
    },
    { type: "heading", text: "Compliance before the save", icon: "shield-check", eyebrow: "Regulated market" },
    {
      type: "paragraph",
      text: "Korean and Singaporean clients carry different labor rules. Rather than audit policies afterwards, the product maps each employee to a country and blocks a non-compliant policy at the moment it is written, citing the law. Try it.",
    },
    {
      type: "custom",
      component: "cosap/LeaveGuard",
      source: "COSAP launch deck v3, p.16 (company example; confidential deck, paraphrased).",
    },
    { type: "heading", text: "One work item, two languages", icon: "package", eyebrow: "Cross-market" },
    {
      type: "paragraph",
      text: "A Vietnamese employee justifies a Korean card expense in Vietnamese; the Seoul approver reads it in English. The company's line is that most apps translate the menu, while COSAP translates the work.",
    },
    {
      type: "custom",
      component: "cosap/ExpenseRelay",
      source: "COSAP launch deck v3, p.10 (translation example) and p.13 (receipt-to-ledger flow, company-reported timing).",
    },
    {
      type: "imageRow",
      images: [
        { src: "/work/cosap/translation.webp", alt: "Two phones showing the same expense, one in Vietnamese and one in English", caption: "The same transaction, rendered for each reader", device: "plain" },
        { src: "/work/cosap/telegram-portal.webp", alt: "COSAP unified portal inside Telegram showing pending approvals and modules", caption: "The Telegram portal", device: "plain" },
      ],
    },
    { type: "heading", text: "What it did in the field", icon: "chart-column", eyebrow: "Company figures" },
    {
      type: "paragraph",
      text: "Two measurements the company reports. They describe the product at client sites, not my personal outcome, and the client is not named.",
    },
    {
      type: "compareSlider",
      title: "Forge at a manufacturing client: before vs after",
      caption: "Each row is scaled to its own larger value, so rows in days, minutes and percent can sit side by side. 82% of error-prone purchase orders were blocked automatically.",
      source: "COSAP company introduction deck v7, p.18 (company figure, reconciled by COSAP against ERP and audit logs). Client name withheld.",
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
    {
      type: "paragraph",
      text: "The public site also advertises 60% less review time, risk detection within 24 hours and 40% fewer inquiries. Those are marketing claims from cosap.ai.",
    },
    { type: "heading", text: "What was mine", icon: "user-round", eyebrow: "Ownership" },
    {
      type: "steps",
      items: [
        { title: "Mine", text: "Primary PM for cross-market requirement gathering across Korean and Singaporean clients, and product design across 8 modules." },
        { title: "The team's", text: "The AI engine, integrations and Forge deployments were built by the engineering team and its industry partners." },
        { title: "The company's", text: "The figures above, the launch decks and the public site. I cite them; I do not claim them." },
      ],
    },
    { type: "heading", text: "The public site", icon: "package", eyebrow: "Live", depth: "deep" },
    {
      type: "gallery",
      images: [
        { src: "/projects/cosap/site-desktop.jpg", alt: "COSAP public website home page", caption: "The public landing page" },
        { src: "/work/cosap/landing-mobile.webp", alt: "COSAP landing page on a phone", caption: "On a phone" },
        { src: "/work/cosap/landing-mobile-2.webp", alt: "COSAP product stack section on a phone", caption: "The COSAP stack" },
      ],
    },
    { type: "heading", text: "Stack", icon: "layers", eyebrow: "Technology", depth: "deep" },
    { type: "stack", items: ["Multi-tenant SaaS", "Toss Payments", "Lago", "RAG pipelines", "LLM orchestration"] },
    { type: "links", items: [{ label: "Visit cosap.ai", href: "https://cosap.ai/" }] },
    {
      type: "results",
      items: [
        { value: "−83%", label: "purchase-order errors per month at a manufacturing client", badge: "Company figure" },
        { value: "~4 h", label: "month-end close, from about three days", badge: "Company figure" },
        { value: "8", label: "modules I led product design across", badge: "My CV" },
      ],
      source: "COSAP company introduction deck v7, p.18 and launch deck v3, p.14 (company figures, client name withheld); Thao's CV (SkyLab, COSAP). The company figures describe the product at client sites, not my personal outcome.",
    },
  ],
} satisfies ProjectInput;

export default project;
