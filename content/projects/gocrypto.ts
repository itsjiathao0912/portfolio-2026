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
    { type: "heading", text: "The question", icon: "compass", eyebrow: "Situation", depth: "skim" },
    {
      type: "paragraph",
      text: "GoTyme Bank is winning the race it set out to win: more than 10 million customers, about 300,000 new ones a month. But each customer keeps less money with GoTyme than Maya's customers keep with Maya. The bank wins the sign-up and loses the balance. So the real question is not how to sell more crypto. It is what moves balances per customer.",
    },
    {
      type: "callout",
      owner: "owned",
      text: "Independent work. I wrote this strategy alone, from public sources only: the research, the sizing model, the strategy and the concept screens. It is not a GoTyme deliverable, and I am not affiliated with GoTyme.",
    },
    {
      type: "barChart",
      depth: "read",
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
    { type: "heading", text: "Why trading can't fix it", icon: "circle-alert", eyebrow: "Tension" },
    {
      type: "paragraph",
      text: "The obvious move is to grow Go Crypto's trading. The model says no: the bank is about ₱4.0B a year short of breakeven, and trading cannot get close. Try it.",
    },
    { type: "custom", component: "gocrypto/GapFiller", source: `${DECK}, p.11 and p.44.` },
    { type: "heading", text: "Where the money already is", icon: "sparkles", eyebrow: "The opportunity" },
    {
      type: "paragraph",
      text: "Filipinos abroad sent home ₱2.07 trillion in 2025, 48 times GoTyme's whole deposit book. The US is the biggest corridor by far. I picked the Gulf instead: about 12% of the flow, sent in small regular amounts, where a flat fee costs the sender the most and a cheaper rail matters most.",
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
    { type: "custom", component: "gocrypto/TransferCalculator", source: `${DECK}, p.21 (fee by ticket size) and p.27 (Ana's transfer at ₱58.20).` },
    {
      type: "paragraph",
      text: "The cost and the delay are what Ana complains about. The business problem is the line after: she takes it out as cash within 72 hours, because the kiosk is the step she trusts. Her average balance is about ₱0, every month. Nobody was working on that line, and it is the one GoTyme is short of.",
    },
    { type: "heading", text: "The decision", icon: "package", eyebrow: "Crypto as the rail" },
    {
      type: "paragraph",
      text: "My call: stop treating crypto as something people trade, and use it as the rail that brings remittances home and keeps them in the bank. Ana sees pesos in minutes. She never sees a stablecoin. That only works if the vocabulary is disciplined, so I wrote it as a rule.",
    },
    {
      type: "decision",
      title: "Grow trading, or build a remittance rail?",
      rejected: { label: "More trading features", text: "Keep growing Go Crypto's trading to lift balances per customer." },
      chosen: { label: "Crypto as the remittance rail", text: "Use crypto to bring remittances home and keep them in the bank. Trading stays as a supporting product." },
      because: "The model says trading cannot get close: the bank is about ₱4.0B a year short of breakeven.",
      cost: "Trading stops being the headline and becomes a supporting product.",
      source: `${DECK}, p.11 and p.44 (trading gap), p.50 (corrected figures).`,
    },
    { type: "custom", component: "gocrypto/LanguageRule", source: `${DECK}, p.18.` },
    { type: "custom", component: "gocrypto/PhoneWalkthrough", source: `${DECK}, p.35 (five concept screens).` },
    { type: "heading", text: "Build order and outcome", icon: "calendar-days", eyebrow: "The plan" },
    {
      type: "timeline",
      title: "Build order",
      caption: "Receiving ships before sending: a customer cannot lose money on the way in. Sending is where fraud and irreversibility live, so it ships second, with limits.",
      source: `${DECK}, p.24.`,
      items: [
        { date: "First", label: "Custody", detail: "The long pole; everything else depends on it" },
        { date: "Then", label: "Receive", detail: "Money in before money out" },
        { date: "Then", label: "Send, capped", detail: "Limits until the rail is proven" },
        { date: "Last", label: "One corridor", detail: "One Gulf corridor, volume capped until reconciliation is known" },
      ],
    },
    {
      type: "compareSlider",
      title: "From the first corridor to scale",
      caption: "Drag from Phase 0 to 2029. Measured on average daily balance per receiving household, not trading volume.",
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
    { type: "custom", component: "gocrypto/RetentionStress", source: `${DECK}, p.46 (retention) and p.48 (2029 lines, appendix values).` },
    { type: "quote", text: "Crypto is a supporting product in a bigger machine.", attribution: "From the strategy's closing slide" },
    {
      type: "results",
      items: [
        { value: "~25%", label: "GoTyme trails Maya in deposits per customer", badge: "Public data" },
        { value: "₱85M", label: "contribution in Phase 0, mid-2027 (modelled)", badge: "Strategy model, not a result" },
        { value: "₱1.5B", label: "contribution at scale, 2029 (modelled)", badge: "Strategy model, not a result" },
      ],
      source: `${DECK}, p.6 (deposits per customer) and p.45–48 (corrected figures, per p.50). Independent strategy built from public sources.`,
    },
  ],
} satisfies ProjectInput;

export default project;
