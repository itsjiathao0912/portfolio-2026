import type { ProjectInput } from "../schema.ts";

const project = {
  id: "ledgr",
  slug: "ledgr",
  title: "Ledgr",
  summary:
    "A labour and payroll compliance copilot for the one person who wears every hat at a 10–50 person Vietnamese company.",
  role: "Founder · product and build",
  period: "Personal project",
  year: null,
  category: "Personal",
  tags: ["Next.js", "TypeScript", "Supabase", "Anthropic Claude SDK", "Tailwind", "shadcn/ui", "next-intl"],
  cover: "/projects/ledgr/home-desktop.jpg",
  links: [
    { label: "Live app", href: "https://ledgr-webapp.vercel.app" },
    { label: "GitHub", href: "https://github.com/itsjiathao0912/ledgr-webapp" },
  ],
  sortOrder: 60,
  published: true,
  updatedAt: "2026-10-03T00:00:00.000Z",
  meta: {
    company: "Personal",
    subtitle: "Labour & payroll compliance copilot",
    status: "Live · Vietnam",
    tint: "peach",
    logo: null,
    coverAlt: "Ledgr home page: how it works, in Vietnamese",
    featured: true,
    proof: [
      { value: "27", label: "verified rules, 6 document types" },
      { value: "~20", label: "people at a live demo" },
    ],
    headline: "Labour compliance, checked by 27 verified rules.",
    tone: "light",
    layout: "story",
    lede: "A copilot for the one person doing HR, payroll and tax at a small Vietnamese company.",
    screens: [{ src: "/work/ledgr/check-mobile.webp", alt: "Ledgr labour-contract check on a phone", device: "phone" }],
    emoji: "📒",
    color: "#f97316",
    visual: {
      "kind": "mockup",
      "device": "laptop",
      "screen": {
        "src": "/projects/ledgr/home-desktop.jpg",
        "alt": "Ledgr home page on a laptop"
      },
      "secondary": {
        "src": "/projects/ledgr/hdld-desktop.jpg",
        "alt": "Ledgr labour-contract check"
      }
    },
  },
  blocks: [
    { type: "heading", text: "The problem", icon: "circle-alert", eyebrow: "Context" },
    {
      type: "paragraph",
      text: "At a 10–50 person Vietnamese company, one person often handles HR, operations, and payroll at once — and most SMBs cannot afford a compliance specialist.",
    },
    { type: "heading", text: "What it does", icon: "package", eyebrow: "Product" },
    {
      type: "paragraph",
      text: "Ledgr checks payroll, social insurance (BHXH), personal income tax, contracts, and overtime against current Vietnamese labour law, then explains what is wrong and how to fix it — in Vietnamese.",
    },
    {
      type: "metrics",
      items: [
        { value: "27", label: "verified rules today" },
        { value: "6", label: "document types covered" },
        { value: "100+", label: "rules on the roadmap (goal, not shipped)" },
      ],
      source: "Ledgr repository, Supabase seed migrations (27 rules, 6 document types). The 100+ is the roadmap figure on the Ledgr landing page.",
    },
    {
      type: "paragraph",
      text: "The 27 rules cover labor contracts, accounting vouchers, e-invoices, PIT finalization, VAT declarations and vendor service contracts. The marketing site's 100+ figure is the roadmap target.",
    },
    {
      type: "barChart",
      title: "The 27 seeded rules, by document type",
      caption: "Labour contracts carry most of the rule set today: minimum wage by region, probation, overtime, social insurance, PIT withholding, renewals, hours and leave.",
      source: "Ledgr repository, Supabase seed migrations (labour rules + document-type rules). Rules added later at runtime are not counted.",
      badge: "Code count",
      unit: "",
      items: [
        { label: "Labour contract", value: 15, group: "Labour" },
        { label: "PIT finalisation", value: 3, group: "Tax & accounting" },
        { label: "Vendor service contract", value: 3, group: "Tax & accounting" },
        { label: "Accounting voucher", value: 2, group: "Tax & accounting" },
        { label: "E-invoice", value: 2, group: "Tax & accounting" },
        { label: "VAT declaration", value: 2, group: "Tax & accounting" },
      ],
    },
    {
      type: "story",
      device: "laptop",
      steps: [
        { title: "Upload", text: "Documents go in as PDF, Word, or images. Pick the document type, or let Ledgr detect it.", src: "/work/ledgr/free-review.webp", alt: "Ledgr free-check dialog: choose a document type and drop a file" },
        { title: "Check against the law", text: "Findings are matched to current labour, insurance, and tax rules, each with the article it comes from.", src: "/projects/ledgr/hdld-desktop.jpg", alt: "Ledgr labour-contract check page with legal references" },
        { title: "Explain the fix", text: "Each finding comes with a plain-language fix in Vietnamese that can be copied straight into the document.", src: "/projects/ledgr/home-desktop.jpg", alt: "Ledgr how-it-works section: upload, AI analysis, cited results, copy-paste fixes" },
      ],
    },
    {
      type: "imageRow",
      caption: "The public site on a phone",
      images: [
        { src: "/work/ledgr/home-mobile.webp", alt: "Ledgr home page on a phone, with an example findings card", caption: "Home", device: "phone" },
        { src: "/work/ledgr/check-mobile.webp", alt: "Ledgr labour-contract check page on a phone", caption: "Labour contract check", device: "phone" },
        { src: "/work/ledgr/pricing-mobile.webp", alt: "Ledgr pricing page on a phone", caption: "Pricing", device: "phone" },
      ],
    },
    { type: "heading", text: "How it decides", icon: "workflow", eyebrow: "Approach" },
    {
      type: "paragraph",
      text: "A deterministic rule engine makes every compliance decision; the language model only extracts facts from the document and explains the result. Rules are tiered — law, then company, then group overrides — and always clamped to the law.",
    },
    {
      type: "flow",
      title: "Who decides what",
      caption: "The language model never makes the compliance call. It reads the document in and writes the explanation out.",
      source: "Ledgr architecture notes in the repository",
      steps: [
        { label: "Upload", detail: "PDF, Word or image" },
        { label: "AI extracts facts", detail: "Wages, dates, clauses" },
        { label: "Rule engine decides", detail: "Law, then company, then group overrides" },
        { label: "AI explains the fix", detail: "In Vietnamese, with the legal citation" },
      ],
    },
    { type: "quote", text: "A company can be stricter than the law, never weaker." },
    { type: "heading", text: "Validation", icon: "badge-check", eyebrow: "Meetup demo" },
    {
      type: "paragraph",
      text: "I demoed Ledgr at Build Stuffs #33 (20 June 2026), a cowork showcase for builders in Ho Chi Minh City, and validated it with around 20 people there.",
    },
    {
      type: "timeline",
      title: "Ledgr at Build Stuffs",
      source: "Build Stuffs session pages on duma.so (Thao's posts)",
      items: [
        { date: "20 Jun 2026", label: "Build Stuffs #33: live demo", detail: "Cowork showcase for tech and growth builders, Ho Chi Minh City" },
        { date: "4 Jul 2026", label: "Build Stuffs #34", detail: "Ledgr posted again, no live demo" },
        { date: "1 Aug 2026", label: "Build Stuffs #36", detail: "Ledgr posted again" },
      ],
    },
    {
      type: "lineChart",
      title: "People who posted on each session page",
      caption: "The audience Ledgr was in front of. These are posts on the session pages, not Ledgr users.",
      source: "Post counts on buildstuffs.duma.so session pages #33, #34 and #36",
      xLabel: "Session",
      yLabel: "Posts",
      points: [
        { label: "#33 · 20 Jun", value: 31 },
        { label: "#34 · 4 Jul", value: 71 },
        { label: "#36 · 1 Aug", value: 85 },
      ],
    },
    {
      type: "gallery",
      images: [
        { src: "/projects/ledgr/meetup/room.webp", alt: "Build Stuffs #33: the room during demos, with the projector screen", caption: "Build Stuffs #33" },
      ],
    },
    { type: "heading", text: "Stack", icon: "layers", eyebrow: "Technology" },
    { type: "stack", items: ["Next.js (App Router)", "TypeScript", "Supabase", "Anthropic Claude SDK", "Tailwind + shadcn/ui", "next-intl"] },
    {
      type: "links",
      items: [
        { label: "Open the live app", href: "https://ledgr-webapp.vercel.app" },
        { label: "Source on GitHub", href: "https://github.com/itsjiathao0912/ledgr-webapp" },
      ],
    },
  ],
} satisfies ProjectInput;

export default project;
