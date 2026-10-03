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
    logo: "/logos/lumicap-dark.png",
    coverAlt: "Lumicap public website, top of the home page",
    featured: true,
    proof: [{ value: "6", label: "investor-facing modules" }],
  },
  blocks: [
    { type: "heading", text: "Overview", eyebrow: "The product" },
    {
      type: "paragraph",
      text: "Lumicap turns real-world assets — GPU and compute capacity — into on-chain investment funds. Investors who are not crypto-native need to understand what they hold, what it is worth, and where their money moved.",
    },
    { type: "metrics", items: [{ value: "6", label: "modules in the investor-facing product" }] },
    {
      type: "callout",
      text: "Company-published figures (lumicap.io, not my personal outcomes): $635M in assets under management and 17 active investors.",
    },
    { type: "heading", text: "My role", eyebrow: "Ownership" },
    {
      type: "paragraph",
      text: "I led the build and owned the crypto core: digital-asset custody via multisig wallets, an on/off-chain ledger with USDC settlement, and fund management with NAV tracking and a clear transaction history.",
    },
    {
      type: "features",
      items: [
        { title: "Custody", text: "Digital-asset custody through multisig wallets." },
        { title: "Ledger", text: "An on/off-chain ledger with USDC settlement." },
        { title: "Fund management", text: "NAV tracking and a readable transaction history." },
        { title: "Investor flows", text: "Tokenization workflows made legible to non-technical investors." },
      ],
    },
    { type: "heading", text: "The product", eyebrow: "Public site" },
    { type: "image", src: "/projects/lumicap/site-desktop.jpg", alt: "Lumicap public website home page", caption: "The public marketing site. The investor product itself sits behind sign-in." },
    { type: "heading", text: "Stack", eyebrow: "Technology" },
    { type: "stack", items: ["Multi-chain / EVM", "ERC-20", "USDC", "Privy", "HashiCorp Vault", "Arweave"] },
    { type: "links", items: [{ label: "Visit lumicap.io", href: "https://lumicap.io/" }] },
  ],
} satisfies ProjectInput;

export default project;
