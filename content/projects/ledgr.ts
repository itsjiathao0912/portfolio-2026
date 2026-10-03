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
    headline: "The AI reads the contract. The rules make the call.",
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
    { type: "heading", text: "The problem", icon: "circle-alert", eyebrow: "Context", depth: "skim" },
    {
      type: "paragraph",
      text: "At a 10–50 person Vietnamese company, one person often runs HR, operations and payroll at once. Vietnam updates minimum wage, social insurance, overtime and tax rules by decree, and most small companies cannot afford a compliance specialist to keep up.",
    },
    {
      type: "paragraph",
      text: "The tempting fix is a chatbot that \"knows the law\". The trouble is that a language model can sound certain while being wrong, and in compliance a confident wrong answer is worse than no answer.",
    },
    { type: "heading", text: "The decision: the AI never makes the call", icon: "workflow", eyebrow: "Approach" },
    {
      type: "paragraph",
      text: "I split the work in two. The language model reads the document and pulls out facts: wage, probation length, overtime, clauses. A deterministic rule engine, with every limit stored next to the article it comes from, decides pass or fail. Then the model explains the result in plain Vietnamese.",
    },
    {
      type: "decision",
      title: "Ask an AI for the answer, or keep the AI away from the verdict?",
      rejected: { label: "A chatbot that “knows the law”", text: "Hand the whole contract to a language model and trust its answer." },
      chosen: { label: "Extract, then rules decide", text: "The model only reads the document and pulls out facts. A rule engine with every limit stored next to its article decides pass or fail. Then the model explains the result." },
      because: "A language model can sound certain while being wrong, and in compliance a confident wrong answer is worse than no answer.",
      cost: "Coverage grows rule by rule: 27 seeded rules across 6 document types today. The 100+ on the landing page is the roadmap, not the count.",
      source: "Ledgr repository: src/lib/compliance (extractor.ts, engine.ts, narrator.ts); seed migrations 20260616000002 and 20260618000001.",
    },
    {
      type: "flow",
      title: "Who decides what",
      caption: "The model reads in and writes out. The legal call in the middle is plain code, so the same contract always gets the same answer.",
      source: "Ledgr repository: src/lib/compliance (extractor.ts, engine.ts, narrator.ts)",
      steps: [
        { label: "Upload", detail: "PDF, Word or image" },
        { label: "AI extracts facts", detail: "Wages, dates, clauses" },
        { label: "Rule engine decides", detail: "Each limit cited to its article" },
        { label: "AI explains the fix", detail: "In Vietnamese, with the citation" },
      ],
    },
    {
      type: "custom",
      component: "ledgr/ContractCheck",
      source: "Limits: Ledgr seed migration 20260616000002_seed_labor_rules.sql (Decree 293/2025, Labour Code 2019, Social Insurance Law 2024). Pass / check / fail logic: src/lib/compliance/engine.ts. Simplified to six of the 15 labour rules.",
    },
    { type: "quote", text: "If a wage sits exactly on the legal floor, the engine doesn't pass it. It asks a human." },
    {
      type: "paragraph",
      text: "Two details carry the trust. A value exactly at a limit is flagged, not passed. And when the engine cannot pin a rule (say, the contract never states its region), the finding is marked as not source-backed instead of guessed.",
    },
    { type: "heading", text: "Where the real errors hide", icon: "package", eyebrow: "Cross-check" },
    {
      type: "paragraph",
      text: "A contract, a payroll sheet and a tax return can each pass alone and still contradict each other. So Ledgr also reads them together: the contract wage times twelve should match the income on the year-end tax return.",
    },
    {
      type: "custom",
      component: "ledgr/CrossCheck",
      source: "Ledgr repository: src/lib/compliance/cross-check.ts (gap above 1% flagged, above 5% fails). Figures are illustrative.",
    },
    {
      type: "video",
      src: "/work/ledgr/flow.mp4",
      poster: "/work/ledgr/flow-poster.webp",
      alt: "Screen recording: Ledgr landing page scrolling to the free document check",
      caption: "The public site: from the landing page to a free check, no sign-up.",
    },
    { type: "heading", text: "What shipped", icon: "badge-check", eyebrow: "Outcome" },
    {
      type: "custom",
      component: "ledgr/RuleTree",
      source: "Ledgr repository: Supabase seed migrations 20260616000002 (15 labour rules) and 20260618000001 (12 rules over 5 document types). Rules added later at runtime are not counted. 100+ is the landing-page roadmap figure.",
    },
    {
      type: "imageRow",
      caption: "The live site on a phone, in Vietnamese by default",
      images: [
        { src: "/work/ledgr/home-mobile.webp", alt: "Ledgr home page on a phone, with an example findings card", caption: "Home", device: "phone" },
        { src: "/work/ledgr/check-mobile.webp", alt: "Ledgr labour-contract check page on a phone", caption: "Labour contract check", device: "phone" },
        { src: "/work/ledgr/pricing-mobile.webp", alt: "Ledgr pricing page on a phone", caption: "Pricing", device: "phone" },
      ],
    },
    {
      type: "paragraph",
      text: "I demoed Ledgr at Build Stuffs #33 (20 June 2026), a builders' showcase in Ho Chi Minh City, and talked it through with around 20 people there. I kept showing it at the next sessions (#34 on 4 July, #36 on 1 August).",
    },
    {
      type: "gallery",
      images: [
        { src: "/projects/ledgr/meetup/room.webp", alt: "Build Stuffs #33: the room during demos, with the projector screen", caption: "Build Stuffs #33, 20 June 2026" },
      ],
    },
    { type: "heading", text: "Stack", icon: "layers", eyebrow: "Technology", depth: "deep" },
    { type: "stack", items: ["Next.js (App Router)", "TypeScript", "Supabase", "Anthropic Claude SDK", "Tailwind + shadcn/ui", "next-intl"] },
    {
      type: "links",
      items: [
        { label: "Open the live app", href: "https://ledgr-webapp.vercel.app" },
        { label: "Source on GitHub", href: "https://github.com/itsjiathao0912/ledgr-webapp" },
      ],
    },
    {
      type: "results",
      items: [
        { value: "27", label: "rules seeded across 6 document types (100+ is the roadmap)", badge: "Live, seeded rules" },
        { value: "~20", label: "people I talked it through with at Build Stuffs #33", badge: "My account" },
      ],
      source: "Ledgr repository: seed migrations 20260616000002 and 20260618000001 (rules added at runtime are not counted); my own account of Build Stuffs #33, 20 June 2026.",
    },
  ],
} satisfies ProjectInput;

export default project;
