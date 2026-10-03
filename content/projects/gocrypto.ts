import type { ProjectInput } from "../schema.ts";

// Every figure below comes from Thao's own deck "GoCrypto · V2 Product
// Strategy" (July 2026, built from public sources). Where the deck corrects
// itself, the corrected appendix value is used (p.48/p.49/p.50), never the
// stale p.22 / p.26 / p.38 figures.
const DECK = "Thao Dao, GoCrypto V2 Product Strategy (July 2026, built from public sources)";

const project = {
  id: "gocrypto",
  slug: "gocrypto",
  title: "GoCrypto",
  summary:
    "An independent product strategy for GoTyme Bank's Go Crypto: turn crypto from a trading feature into a transfer rail, and fund it with one capped remittance corridor for Filipino families abroad.",
  role: "Sole author: research, strategy, sizing and concept screens",
  period: "Independent strategy · 2026",
  year: 2026,
  category: "Strategy",
  tags: ["Product strategy", "Market sizing", "Remittances", "Stablecoin rails", "Concept design"],
  cover: "/work/gocrypto/screen-5.webp",
  links: [],
  sortOrder: 25,
  published: true,
  updatedAt: "2026-10-03T00:00:00.000Z",
  meta: {
    company: "Independent",
    subtitle: "V2 product strategy, built from public sources",
    status: "Independent strategy · 2026",
    tint: "aqua",
    logo: null,
    coverAlt: "GoCrypto concept screen: a balance in digital dollars, Bitcoin, Ethereum and PAX Gold",
    featured: true,
    proof: [
      { value: "₱4.0B", label: "a year to breakeven, the gap trading cannot close" },
      { value: "12.2%", label: "of national remittances arrive from the Gulf" },
    ],
    headline: "GoTyme wins accounts. A transfer rail wins balances.",
    tone: "deep",
    layout: "story",
    lede: "An independent product strategy for GoTyme's Go Crypto, built from public sources: crypto as the rail, not the product.",
    screens: [
      { src: "/work/gocrypto/screen-1.webp", alt: "Concept screen: request money, you'll receive ₱18,290", device: "phone" },
      { src: "/work/gocrypto/screen-3.webp", alt: "Concept screen: ₱18,290 is yours, keep it growing at 3% a year", device: "phone" },
    ],
    emoji: "💸",
    color: "#14b8a6",
    visual: {
      kind: "mockup",
      device: "phone",
      screen: { src: "/work/gocrypto/screen-5.webp", alt: "GoCrypto concept home screen" },
      secondary: { src: "/work/gocrypto/screen-2.webp", alt: "Concept screen: money received in 3 minutes" },
    },
  },
  blocks: [
    { type: "heading", text: "Overview", icon: "compass", eyebrow: "The question" },
    {
      type: "paragraph",
      text: "GoTyme Bank is winning accounts in the Philippines. It has more than 10 million customers and adds around 300,000 a month. But each customer keeps less money with GoTyme than Maya's customers keep with Maya. The bank wins the sign-up and loses the balance.",
    },
    {
      type: "callout",
      text: "Independent work. I wrote this strategy on my own, from public sources only. It is not a GoTyme deliverable, and I am not affiliated with GoTyme.",
    },
    {
      type: "barChart",
      title: "Deposits per customer (₱)",
      caption: "GoTyme trails Maya by about 25% per account.",
      source: `${DECK}, p.6: Maya ₱67.7B / 10.7M, sector ₱119.5B / 20.4M, GoTyme ₱43.5B / ~9M.`,
      badge: "Public data",
      unit: "",
      items: [
        { label: "Maya", value: 6335 },
        { label: "Sector", value: 5858 },
        { label: "GoTyme", value: 4778 },
      ],
    },
    { type: "heading", text: "Why trading can't fix it", icon: "circle-alert", eyebrow: "The gap" },
    {
      type: "paragraph",
      text: "The bank needs about ₱4.0B a year more to break even. Crypto trading revenue, even at ten times today's volume, closes less than a seventh of that. Tap a legend chip to hide the gap and compare the trading scenarios on their own scale.",
    },
    {
      type: "barChart",
      title: "Trading revenue against the breakeven gap (₱M a year)",
      caption: "Today's trading closes 1.9% of the gap; 3× volume closes 5.1%; 10× closes 13.9%.",
      source: `${DECK}, p.11 and p.44.`,
      badge: "Strategy model",
      unit: "",
      items: [
        { label: "Trading today", value: 75, group: "Trading revenue" },
        { label: "Trading at 3× volume", value: 203, group: "Trading revenue" },
        { label: "Trading at 10× volume", value: 556, group: "Trading revenue" },
        { label: "Gap to breakeven", value: 4000, group: "Breakeven gap" },
      ],
    },
    { type: "heading", text: "The opportunity", icon: "sparkles", eyebrow: "Remittances" },
    {
      type: "paragraph",
      text: "Filipinos abroad sent home ₱2.07 trillion in 2025, 48 times GoTyme's whole deposit book. The US is the largest corridor by far. The strategy picks the Gulf instead: about 12% of the flow, sent in tickets small enough that a flat fee costs the most.",
    },
    {
      type: "stackedBar",
      title: "Where remittances to the Philippines come from (% of total)",
      caption: "UAE and Qatar are the deck's approximate shares; 'Other' is the remainder.",
      source: `${DECK}, p.8 (corridor mix, BSP 2025) and p.21 (Gulf share).`,
      badge: "Public data",
      unit: "%",
      segments: [
        { label: "United States", value: 40.2 },
        { label: "Singapore", value: 7.6 },
        { label: "Saudi Arabia", value: 6.7 },
        { label: "UAE", value: 4, detail: "approximate" },
        { label: "Qatar", value: 1.5, detail: "approximate" },
        { label: "Japan", value: 5.8 },
        { label: "United Kingdom", value: 4.6 },
        { label: "Other", value: 29.6, detail: "remainder" },
      ],
      highlight: { label: "the Gulf", members: ["Saudi Arabia", "UAE", "Qatar"], note: "about ₱253B a year" },
    },
    {
      type: "lineChart",
      title: "A flat fee hurts small transfers most",
      caption: "Cost of a $5 flat fee plus 0.6% FX, as a share of the amount sent.",
      source: `${DECK}, p.21.`,
      badge: "Strategy model",
      xLabel: "Amount sent (US$)",
      yLabel: "Cost %",
      points: [
        { label: "$150", value: 3.9 },
        { label: "$317", value: 2.3 },
        { label: "$1,000", value: 1.1 },
      ],
    },
    {
      type: "barChart",
      title: "Ana's ₱18,400: what actually arrives (₱)",
      caption: "Her brother sends $317 from Riyadh at ₱58.20. His own bank costs 7.3% and takes up to 5 days; the corridor rail costs 0.7% and arrives in minutes.",
      source: `${DECK}, p.27.`,
      badge: "Worked example",
      unit: "",
      items: [
        { label: "His own bank (up to 5 days)", value: 17050 },
        { label: "GoTyme via SWIFT", value: 17980 },
        { label: "Corridor rail (minutes)", value: 18290 },
      ],
    },
    { type: "heading", text: "The product", icon: "package", eyebrow: "Concept screens" },
    {
      type: "paragraph",
      text: "Five concept screens, one per claim in the strategy. The words are as deliberate as the layout: \"digital dollars\", never \"stablecoin\"; \"send money home\", never \"on-chain transfer\".",
    },
    {
      type: "story",
      device: "phone",
      steps: [
        { title: "Ana asks", text: "She shares a request link. Her brother pays wherever he already is, and the link opens a licensed partner in his country. He never needs a GoTyme account.", src: "/work/gocrypto/screen-1.webp", alt: "Request money screen: you'll receive ₱18,290; Miguel pays $317.00, GoTyme fee ₱0" },
        { title: "It arrives in minutes", text: "The money lands in an account she already has, with every step on a timeline and no hidden deductions.", src: "/work/gocrypto/screen-2.webp", alt: "Money received screen: ₱18,290 arrived in 3 minutes, with a timeline of the transfer" },
        { title: "The business case", text: "The moment money arrives is the moment to offer a reason to keep it. Balances, not trades, are what the bank is short of.", src: "/work/gocrypto/screen-3.webp", alt: "₱18,290 is yours: keep it growing at 3% a year, earning ₱46 this month" },
        { title: "Protection, at the decision", text: "Deposit insurance, sender checks and a way to stop a transfer appear where she decides, not in a help page.", src: "/work/gocrypto/screen-4.webp", alt: "How your money is protected: insured pesos, verified sender, report a transfer" },
        { title: "Crypto becomes the rail", text: "The transfer settled in digital dollars in 1 minute 30 seconds. Crypto is a supporting product in a bigger machine.", src: "/work/gocrypto/screen-5.webp", alt: "GoCrypto home: today's transfer settled over digital dollars in 1 min 30 s; crypto holdings and a gold savings plan" },
      ],
    },
    { type: "heading", text: "The plan", icon: "calendar-days", eyebrow: "Build order and targets" },
    {
      type: "timeline",
      title: "Build order",
      caption: "Custody is the long pole. Receiving comes before sending, and sending is capped until one corridor is proven.",
      source: `${DECK}, p.24.`,
      items: [
        { date: "First", label: "Custody", detail: "The long pole; everything else depends on it" },
        { date: "Then", label: "Receive", detail: "Money in before money out" },
        { date: "Then", label: "Send, capped", detail: "Limits until the rail is proven" },
        { date: "Last", label: "One corridor", detail: "A single Gulf corridor for OFW families" },
      ],
    },
    {
      type: "compareSlider",
      title: "From the first corridor to scale",
      caption: "Drag from Phase 0 to 2029. The model assumes 38% of inflow stays as balance; at 20%, the interest line halves.",
      source: `${DECK}, p.2 and p.45–48 (corrected figures, per p.50).`,
      badge: "Strategy model",
      beforeLabel: "Phase 0 · mid-2027",
      afterLabel: "At scale · 2029",
      rows: [
        { label: "Corridor volume landed", before: { value: 10.1, display: "₱10.1B" }, after: { value: 177, display: "₱177B" } },
        { label: "Receiving households", before: { value: 45800, display: "45,800" }, after: { value: 800000, display: "800,000" } },
        { label: "New customers acquired", before: { value: 13700, display: "13,700" }, after: { value: 240000, display: "240,000" } },
        { label: "Deposits", before: { value: 321, display: "₱321M" }, after: { value: 5600, display: "₱5.6B" } },
        { label: "Contribution", before: { value: 85, display: "₱85M" }, after: { value: 1500, display: "₱1.5B" } },
      ],
    },
    {
      type: "barChart",
      title: "Which line pays in 2029 (₱M)",
      caption: "The FX and remittance spread, not interest on balances, carries the model.",
      source: `${DECK}, p.48 (appendix values; p.38 shows an older interest figure).`,
      badge: "Strategy model",
      unit: "",
      items: [
        { label: "FX and remittance spread", value: 1239 },
        { label: "Net interest margin", value: 252 },
      ],
    },
    {
      type: "metrics",
      badge: "Target",
      source: `${DECK}, p.40.`,
      items: [
        { value: "130,000", label: "monthly active funded holders by mid-2027 (from 95,000)" },
        { value: "60%+", label: "90-day retention" },
        { value: "₱10.1B", label: "corridor volume" },
      ],
    },
    { type: "quote", text: "Crypto is a supporting product in a bigger machine.", attribution: "From the strategy's closing slide" },
  ],
} satisfies ProjectInput;

export default project;
