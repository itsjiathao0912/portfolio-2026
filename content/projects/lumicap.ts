import type { ProjectInput } from "../schema.ts";

const project = {
  id: "lumicap",
  slug: "lumicap",
  title: "Lumicap",
  summary:
    "Led the build of a platform that turns real-world assets — GPU and compute capacity — into on-chain investment funds.",
  role: "Led the build · owned the crypto core",
  period: "2025",
  year: 2025,
  category: "Product",
  tags: ["Multi-chain / EVM", "ERC-20", "USDC", "Privy", "HashiCorp Vault", "Arweave"],
  cover: "/projects/lumicap/site-desktop.jpg",
  links: [{ label: "lumicap.io", href: "https://lumicap.io/" }],
  sortOrder: 10,
  published: true,
  updatedAt: "2026-10-03T00:00:00.000Z",
  meta: {
    company: "SkyLab Group",
    subtitle: "by Luminet",
    status: "Shipped · pre-launch",
    tint: "periwinkle",
    logo: "/logos/lumicap-light.png",
    coverAlt: "Lumicap public website, top of the home page",
    featured: true,
    proof: [{ value: "6", label: "investor-facing modules" }],
    headline: "Real-world compute capacity, turned into on-chain funds.",
    tone: "light",
    layout: "showcase",
    lede: "Fund products for investors who are not crypto-native: custody, ledger and NAV in plain view.",
    screens: [
      { src: "/work/lumicap/highlights.webp", alt: "Lumicap site: highlight numbers band", device: "browser-free" },
      { src: "/work/lumicap/hero-detail.webp", alt: "Lumicap site: hero headline, Invest in the Future of Wealth", device: "browser-free" },
    ],
    emoji: "🪙",
    color: "#5b6cff",
    visual: {
      "kind": "mockup",
      "device": "laptop",
      "screen": {
        "src": "/projects/lumicap/site-desktop.jpg",
        "alt": "Lumicap public site on a laptop"
      }
    },
  },
  blocks: [
    { type: "heading", text: "Overview", icon: "compass", eyebrow: "The product" },
    {
      type: "paragraph",
      text: "Lumicap turns real-world assets — GPU and compute capacity — into on-chain investment funds. Investors who are not crypto-native need to understand what they hold, what it is worth, and where their money moved.",
    },
    { type: "metrics", items: [{ value: "6", label: "modules in the investor-facing product" }] },
    {
      type: "metrics",
      badge: "Company figure",
      source: "lumicap.io public website (company-published, not my personal outcomes)",
      items: [
        { value: "$635M", label: "assets under management" },
        { value: "$2M", label: "distributions paid" },
        { value: "17", label: "active investors" },
        { value: "5", label: "active funds" },
      ],
    },
    {
      type: "moduleMap",
      title: "The crypto core I owned",
      source: "Thao's CV",
      center: "Lumicap",
      items: [
        { label: "Custody", detail: "Multisig wallets" },
        { label: "Ledger", detail: "On/off-chain, USDC settlement" },
        { label: "Fund management", detail: "NAV tracking, history" },
        { label: "Investor flows", detail: "Tokenisation made legible" },
      ],
    },
    { type: "heading", text: "How funds run", icon: "calendar-days", eyebrow: "Fund lifecycle" },
    {
      type: "scrubTimeline",
      title: "A fund's life, closed-end or open-end",
      caption: "Switch the fund structure, then drag through its lifecycle.",
      source: "Luminet, How it Works (January 2026), p.5 and p.6.",
      tracks: [
        {
          name: "Closed-end",
          stops: [
            { when: "Launch", label: "Fund opens", detail: "A target raise is set; the deck's example is $5M." },
            { when: "Months 1–3", label: "Close and mint", detail: "The fund closes and LUMI ownership tokens are minted at close." },
            { when: "Months 3–6", label: "Deploying", detail: "Capital is deployed into the underlying assets." },
            { when: "Active", label: "Distributions", detail: "Returns are distributed quarterly in USDC." },
            { when: "3–5 years", label: "Wind-down", detail: "The fund winds down at the end of its term." },
          ],
        },
        {
          name: "Open-end",
          stops: [
            { when: "Rolling", label: "Fund launches", detail: "No single close: the fund stays open." },
            { when: "Monthly", label: "Subscriptions", detail: "Investors subscribe each month." },
            { when: "Quarterly", label: "Redemptions at NAV", detail: "Investors redeem quarterly at net asset value, settled in USD." },
            { when: "Indefinite", label: "Keeps running", detail: "The fund has no fixed end date." },
          ],
        },
      ],
    },
    { type: "heading", text: "Signing a deploy", icon: "shield-check", eyebrow: "The crypto core" },
    {
      type: "paragraph",
      text: "No single person can deploy a fund contract. Two of three approvers must sign, each with two-factor authentication, before the keys are ever used. Tap two approvers to release the deploy.",
    },
    {
      type: "explorable",
      title: "2-of-3 multisig: from request to chain",
      caption: "Keys never sit in the database, and signatures never persist.",
      source: "Luminet, How it Works (January 2026), p.9.",
      badge: "System design",
      nodes: [
        { id: "admin", label: "Admin initiates", detail: "A fund admin requests the contract deploy, confirmed by OTP.", col: 0, row: 1, kind: "actor" },
        { id: "a1", label: "Approver 1", detail: "Signs off with two-factor authentication.", col: 1, row: 0, kind: "actor" },
        { id: "a2", label: "Approver 2", detail: "Signs off with two-factor authentication.", col: 1, row: 1, kind: "actor" },
        { id: "a3", label: "Approver 3", detail: "Signs off with two-factor authentication.", col: 1, row: 2, kind: "actor" },
        { id: "quorum", label: "2-of-3 threshold", detail: "The request moves on only when two of the three approvals are in.", col: 2, row: 1, kind: "guard" },
        { id: "vault", label: "HashiCorp Vault", detail: "P-256 signing keys live in Vault, never in the application database.", col: 3, row: 1 },
        { id: "tee", label: "Privy TEE quorum", detail: "The signature is assembled inside Privy's trusted execution environment and is not stored.", col: 4, row: 1 },
        { id: "chain", label: "On-chain", detail: "The signed transaction deploys the fund contract.", col: 5, row: 1, kind: "outcome" },
      ],
      edges: [
        { from: "admin", to: "a1" },
        { from: "admin", to: "a2" },
        { from: "admin", to: "a3" },
        { from: "a1", to: "quorum" },
        { from: "a2", to: "quorum" },
        { from: "a3", to: "quorum" },
        { from: "quorum", to: "vault" },
        { from: "vault", to: "tee" },
        { from: "tee", to: "chain" },
      ],
      quorum: { nodes: ["a1", "a2", "a3"], need: 2, unlocks: ["quorum", "vault", "tee", "chain"], prompt: "Approvals collected:" },
    },
    { type: "heading", text: "My role", icon: "user-round", eyebrow: "Ownership" },
    {
      type: "paragraph",
      text: "I led the build and owned the crypto core: digital-asset custody via multisig wallets, an on/off-chain ledger with USDC settlement, and fund management with NAV tracking and a clear transaction history.",
    },
    {
      type: "steps",
      items: [
        { title: "Custody", text: "Digital-asset custody through multisig wallets." },
        { title: "Ledger", text: "An on/off-chain ledger with USDC settlement." },
        { title: "Fund management", text: "NAV tracking and a readable transaction history." },
        { title: "Investor flows", text: "Tokenization workflows made legible to non-technical investors." },
      ],
    },
    { type: "heading", text: "The product", icon: "package", eyebrow: "Public site" },
    {
      type: "gallery",
      images: [
        { src: "/projects/lumicap/site-desktop.jpg", alt: "Lumicap public website home page", caption: "The public marketing site; the investor product sits behind sign-in" },
        { src: "/work/lumicap/highlights.webp", alt: "Lumicap highlight numbers band", caption: "Company figures on the site" },
        { src: "/work/lumicap/hero-detail.webp", alt: "Lumicap hero headline detail", caption: "Hero detail" },
      ],
    },
    { type: "heading", text: "Stack", icon: "layers", eyebrow: "Technology" },
    { type: "stack", items: ["Multi-chain / EVM", "ERC-20", "USDC", "Privy", "HashiCorp Vault", "Arweave"] },
    { type: "links", items: [{ label: "Visit lumicap.io", href: "https://lumicap.io/" }] },
  ],
} satisfies ProjectInput;

export default project;
