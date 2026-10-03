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
    { type: "heading", text: "The problem", icon: "compass", eyebrow: "Overview", depth: "skim" },
    {
      type: "paragraph",
      text: "Lumicap turns real-world assets, starting with GPU and compute capacity, into on-chain investment funds. Its investors are not crypto-native. They need to see what they hold, what it is worth, and where their money moved, without learning how a blockchain works.",
    },
    {
      type: "callout",
      text: "The insight: in a tokenised fund the hard product is trust. Keys that never sit in a database, and money that needs more than one person to move.",
    },
    {
      type: "video",
      depth: "read",
      src: "/work/lumicap/landing-scroll.mp4",
      poster: "/work/lumicap/landing-scroll-poster.webp",
      alt: "Scroll through the public Lumicap site: highlight numbers, funds and security sections",
      caption: "The public site, the one part of the product that is open to everyone. The investor product sits behind sign-in.",
    },
    {
      type: "metrics",
      badge: "Company figures",
      source: "lumicap.io public website. Company-published figures, not my personal outcomes. The product I led has 6 investor-facing modules (my CV).",
      items: [
        { value: "$635M", label: "assets under management" },
        { value: "$2M", label: "distributions paid" },
        { value: "17", label: "active investors" },
        { value: "5", label: "active funds" },
      ],
    },
    { type: "heading", text: "What I owned", icon: "user-round", eyebrow: "My role" },
    {
      type: "paragraph",
      owner: "owned",
      text: "I led the build and owned the crypto core. That is the part where a mistake loses money, so it was also the part I wanted legible to people outside the team.",
    },
    {
      type: "moduleMap",
      owner: "owned",
      title: "The crypto core, and who it serves",
      source: "Thao's CV (SkyLab, Lumicap)",
      center: "Lumicap",
      items: [
        { label: "Custody", detail: "Multisig wallets" },
        { label: "Ledger", detail: "On/off-chain, USDC settlement" },
        { label: "Fund management", detail: "NAV tracking, history" },
        { label: "Investor flows", detail: "Tokenisation made legible" },
      ],
    },
    { type: "heading", text: "Custody: no single person moves a fund", icon: "shield-check", eyebrow: "Custody" },
    {
      type: "paragraph",
      text: "Deploying a fund contract is the highest-stakes action on the platform. The custody design makes it a quorum: two of three approvers must sign off, each through two-factor authentication. Play approver one and see what each approval does, and does not, change.",
    },
    {
      type: "custom",
      component: "lumicap/ApproveDeploy",
      source: "Luminet, How it Works (January 2026), p.9. Simulation is illustrative.",
    },
    {
      type: "paragraph",
      text: "The detail that matters is what the database holds. Approvals are stored as plain records. The signing keys sit in HashiCorp Vault and are fetched only at the moment of execution; the quorum is verified inside Privy's trusted execution environment; the signature is never persisted. Even a breach of the application database yields no ability to sign.",
    },
    {
      type: "decision",
      title: "Who can move a fund?",
      rejected: { label: "Keys in the app, one approver", text: "Keep signing keys in the application and let one approver deploy a fund." },
      chosen: { label: "Two of three approvers, keys outside the database", text: "Two of three approvers sign, each with two-factor authentication. The keys sit in a vault and are fetched only at execution; the signature is never stored." },
      because: "Even a breach of the application database yields no ability to sign.",
      cost: "Every deployment waits for a second approver.",
      source: "Luminet, How it Works (January 2026), p.8 and p.9.",
    },
    { type: "heading", text: "Ledger: one history, two kinds of record", icon: "package", eyebrow: "Ledger" },
    {
      type: "paragraph",
      text: "An investor deposits dollars, then holds tokens. The ledger has to carry both, on and off chain, and the investor-facing product has to show one coherent story. Step through the seven stages and watch where the record changes hands.",
    },
    {
      type: "custom",
      component: "lumicap/InvestorJourney",
      source: "Luminet, How it Works (January 2026), p.7.",
    },
    { type: "heading", text: "Funds run on different clocks", icon: "calendar-days", eyebrow: "Fund lifecycle" },
    {
      type: "scrubTimeline",
      title: "A fund's life, closed-end or open-end",
      caption: "Switch the fund structure, then drag through its lifecycle. The NAV and distribution logic had to work for both.",
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
    { type: "heading", text: "Safety: plan for the bad day", icon: "shield-check", eyebrow: "Safety" },
    {
      type: "paragraph",
      text: "Security features are easy to list. The one worth designing carefully is the emergency pause: it has to be fast to use, hard to misuse, and slow to reverse.",
    },
    {
      type: "custom",
      component: "lumicap/PauseSwitch",
      source: "Luminet, Platform Demo (January 2026), p.11; How it Works p.8 and p.10. Simulation is illustrative.",
    },
    { type: "heading", text: "Outcome", icon: "package", eyebrow: "Where it stands" },
    {
      type: "paragraph",
      text: "The platform shipped in a pre-launch state. The public site now shows live funds and the company figures above; those are the company's results, and I do not claim them as mine. What I can point to is the design: a custody flow with no single point of failure, and an investor journey that makes tokenisation readable.",
    },
    {
      type: "gallery",
      depth: "deep",
      images: [
        { src: "/projects/lumicap/site-desktop.jpg", alt: "Lumicap public website home page", caption: "The public marketing site" },
        { src: "/work/lumicap/highlights.webp", alt: "Lumicap highlight numbers band", caption: "Company-published figures" },
        { src: "/work/lumicap/hero-detail.webp", alt: "Lumicap hero headline detail", caption: "Hero detail" },
      ],
    },
    { type: "stack", depth: "deep", items: ["Multi-chain / EVM", "ERC-20", "USDC", "Privy", "HashiCorp Vault", "Arweave"] },
    { type: "links", depth: "deep", items: [{ label: "Visit lumicap.io", href: "https://lumicap.io/" }] },
    {
      type: "results",
      heading: "What shipped",
      items: [{ value: "6", label: "investor-facing modules I led the build of", badge: "My CV" }],
      shipped: [
        "Custody: two-of-three approval, with signing keys kept out of the application database",
        "Ledger and investor journey across seven stages, on and off chain",
        "Fund lifecycle for closed-end and open-end funds",
        "An emergency pause, designed to be fast to use and slow to reverse",
      ],
      source: "Thao's CV (SkyLab, Lumicap); Luminet decks (January 2026). The platform shipped in a pre-launch state. The company's own figures sit above and are not claimed as mine.",
    },
  ],
} satisfies ProjectInput;

export default project;
