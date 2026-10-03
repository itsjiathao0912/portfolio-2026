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
    subtitle: "Blockchain RWA investment platform",
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
