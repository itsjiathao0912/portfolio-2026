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
  },
  blocks: [
    { type: "heading", text: "The problem", eyebrow: "Context" },
    {
      type: "paragraph",
      text: "At a 10–50 person Vietnamese company, one person often handles HR, operations, and payroll at once — and most SMBs cannot afford a compliance specialist.",
    },
    { type: "heading", text: "What it does", eyebrow: "Product" },
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
    },
    {
      type: "paragraph",
      text: "The 27 rules cover labor contracts, accounting vouchers, e-invoices, PIT finalization, VAT declarations and vendor service contracts. The marketing site's 100+ figure is the roadmap target.",
    },
    {
      type: "features",
      items: [
        { title: "Upload", text: "Documents go in as PDF, Word, or images." },
        { title: "Check against the law", text: "Findings are matched to current labour, insurance, and tax rules." },
        { title: "Explain the fix", text: "Each finding comes with a plain-language fix in Vietnamese." },
      ],
    },
    {
      type: "gallery",
      images: [
        { src: "/projects/ledgr/home-desktop.jpg", alt: "Ledgr home page section explaining the four steps", caption: "How it works" },
        { src: "/projects/ledgr/pricing-desktop.jpg", alt: "Ledgr pricing page", caption: "Pricing" },
        { src: "/projects/ledgr/hdld-desktop.jpg", alt: "Ledgr labour-contract check page", caption: "Labour contract check" },
      ],
    },
    { type: "heading", text: "How it decides", eyebrow: "Approach" },
    {
      type: "paragraph",
      text: "A deterministic rule engine makes every compliance decision; the language model only extracts facts from the document and explains the result. Rules are tiered — law, then company, then group overrides — and always clamped to the law.",
    },
    { type: "quote", text: "A company can be stricter than the law, never weaker." },
    { type: "heading", text: "Validation", eyebrow: "Meetup demo" },
    {
      type: "paragraph",
      text: "I demoed Ledgr at Build Stuffs #33 (20 June 2026), a cowork showcase for builders in Ho Chi Minh City, and validated it with around 20 people there.",
    },
    {
      type: "gallery",
      images: [
        { src: "/projects/ledgr/meetup/room.webp", alt: "Build Stuffs #33: the room during demos, with the projector screen", caption: "Build Stuffs #33" },
        { src: "/projects/ledgr/meetup/laptop-2.webp", alt: "Ledgr landing page open on a laptop at the meetup", caption: "Demo setup" },
      ],
    },
    { type: "heading", text: "Stack", eyebrow: "Technology" },
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
