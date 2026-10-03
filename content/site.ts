import type { SiteInput } from "./schema.ts";

// Site-wide content. Every fact here comes from the owner's previous portfolio
// and CV (see the content-inventory report). Do not add numbers that are not
// in those sources. Missing details are recorded in `gap` (dev-only marker).

const site = {
  profile: {
    name: "Thao Dao",
    nameLocal: "Gia Thảo",
    title: "Technical Product Manager",
    location: "Ho Chi Minh City, Vietnam",
    availability: "Available for product roles",
    headline: "Thao Dao is Technical Product Manager at SkyLab Group",
    company: "SkyLab Group",
    intro: "4+ years in product. Vietnamese. Based in Ho Chi Minh City.",
    tagline:
      "I turn ambiguous business problems into shipped software — billing engines, on-chain ledgers, and ERP modules that hold up in regulated markets.",
    summary:
      "Technical Product Owner with 4+ years delivering complex B2B SaaS across finance operations, cloud, and blockchain — from requirements analysis and process mapping to cross-functional delivery.",
    email: "giathaowork@gmail.com",
    socials: [
      { label: "LinkedIn", href: "https://www.linkedin.com/in/thaodao0912/" },
      { label: "GitHub", href: "https://github.com/itsjiathao0912" },
    ],
    cv: null,
    // Background-removed LinkedIn headshot; "-color" has a matching "-bw" file for the hover swap.
    portrait: "/portrait/thao-color.webp",
  },
  experience: [
    {
      id: "skylab",
      company: "SkyLab Group",
      role: "Technical Product Manager",
      period: "03/2025 — Present",
      url: "https://www.skylabteam.com/",
      logo: "/logos/skylab-icon.svg",
      domain: "Cloud · Blockchain · Enterprise AI",
      summary:
        "Drove product implementation across cloud services, blockchain, and enterprise AI SaaS — from requirements definition through to launch.",
      bullets: [
        "Leading product design across 8 modules for an AI ERP platform targeting SMEs, as the primary PM for cross-market requirement gathering across Korean and Singaporean clients.",
        "Delivered an investor-facing product across 6 modules for a blockchain-based RWA investment platform, translating tokenization workflows into interfaces for non-technical investors.",
        "Designed and shipped a cost monitoring dashboard and payment reconciliation workflows for a cloud-service-provider billing platform, standardizing pricing logic across 4 cloud providers (AWS, Azure, Huawei, Alibaba Cloud).",
      ],
      highlight: "Primary PM across three concurrent platforms in regulated and pre-launch markets.",
    },
    {
      id: "reorc",
      company: "ReOrc AI",
      role: "IT Business Analyst",
      period: "04/2024 — 03/2025",
      url: "https://reorc.com/",
      logo: "/logos/reorc.svg",
      domain: "Enterprise Data Platform",
      summary:
        "Drove the development of an enterprise data platform by structuring governance, workflows, and validation processes.",
      bullets: [
        "Benchmarked enterprise data platforms to design governance and access-control frameworks.",
        "Designed and launched data modeling and lineage features so business users can trace data origins and dependencies.",
        "Reduced rework by 40% and accelerated feature delivery by 20% through clearer requirement frameworks and validation checkpoints.",
        "Led user acceptance testing with functional and data validation scenarios, at a 95% first-pass success rate.",
      ],
      highlight: "40% less rework, 20% faster feature delivery, 95% first-pass UAT.",
    },
    {
      id: "zalo",
      company: "Zalo",
      role: "Product Owner",
      period: "02/2023 — 04/2024",
      url: "https://zalo.me/vi/",
      logo: "/logos/zalo.svg",
      domain: "Consumer · Messaging & Games",
      summary: "Owned roadmap and performance optimization for digital products within Vietnam's leading messaging platform.",
      bullets: [
        "Owned roadmap and delivery for 1 new product launch and 4 existing products across engineering, design, and data teams.",
        "Worked with designers and developers to refine and actualize concepts from design documentation.",
        "Built a tracking dashboard for Zalo Game Center, reducing manual data extraction by 40%.",
        "Optimized in-game ad placements through A/B testing, increasing total ad revenue by 30% within six months.",
        "Ran monthly in-game events, boosting user engagement by 15% and paying users by 3%.",
      ],
      highlight: "30% ad revenue uplift and 15% engagement lift on a national-scale consumer product.",
    },
    {
      id: "chotot",
      company: "Chợ Tốt",
      role: "Business Analyst Intern",
      period: "11/2022 — 03/2023",
      domain: "Classifieds marketplace",
      bullets: [
        "Worked on Carousell Commerce features, optimizing sales packages and extracting data with SQL.",
        "Managed CRM and uplifted revenue by 12% via in-app communication.",
        "Set up and ran 3 user research plans to optimize features and monetize a new ads package, including interviews with 30 car merchants.",
      ],
      earlier: true,
    },
    {
      id: "momo",
      company: "MoMo",
      role: "Growth Product Intern",
      period: "01/2022 — 05/2022",
      domain: "E-wallet",
      earlier: true,
    },
    {
      id: "creatio",
      company: "Creatio Marketing Club",
      role: "External Relations Leader, Marketing Arena 2021",
      period: "12/2020 — 07/2021",
      domain: "Student club · Foreign Trade University",
      bullets: [
        "Led external relations for a national student marketing competition with 2,500+ participants.",
        "Secured partnerships with 20+ sponsors, including TikTok, Cocoon and Suntory PepsiCo.",
      ],
      earlier: true,
    },
  ],
  education: [
    {
      id: "ftu",
      school: "Foreign Trade University",
      degree: "Bachelor's in International Trade",
      detail: "Major in Economics and Logistics",
      period: "2019 — 2023",
    },
    {
      id: "mindx",
      school: "MindX Technology School",
      degree: "Product Management",
      detail: "Software development, product design, product discovery, user research, wireframing",
      period: "2023",
    },
  ],
  certifications: [
    {
      id: "aws-saa",
      name: "AWS Solutions Architect — Associate",
      issuer: "Amazon Web Services",
      url: "https://www.credly.com/badges/f3ac566b-00b7-430d-a173-01598599a1fc/linked_in_profile",
    },
    {
      id: "oci-architect",
      name: "Oracle Cloud Infrastructure Architect — Associate",
      issuer: "Oracle",
      url: "https://catalog-education.oracle.com/ords/certview/sharebadge?id=445D54D5319194913439A1D1E242F1B5EEB53EB181704B72003AE517E3ACC8FF",
    },
    {
      id: "google-data",
      name: "Google Data Analytics",
      issuer: "Google",
      url: "https://www.coursera.org/account/accomplishments/specialization/QMBBEBUCPON6",
    },
  ],
  awards: [
    { id: "aabw", name: "Agentic AI Build Week (AABW) — Fintech track", result: "2nd place · Cortex Sentinel" },
    { id: "business-hackathon", name: "Business Hackathon", result: "Top 15 of 300+ teams", year: "2021" },
    { id: "hanh-trinh-kinh-doanh", name: "Hành trình kinh doanh", result: "Top 40 of 1,000+ teams" },
    { id: "vng-gaming", name: "VNG Gaming Challenge", result: "Top 10" },
    { id: "khoi-nghiep-kawaii", name: "Khởi nghiệp Kawaii", result: "Top 15" },
  ],
  skills: [
    {
      id: "product",
      name: "Product Management",
      items: ["Product Research (Market & User)", "Project Management", "Stakeholder Management"],
    },
    {
      id: "analysis",
      name: "Business Analysis & System Design",
      items: ["Requirements Gathering", "User Stories", "Process Mapping (UML, Flowcharts)"],
    },
    {
      id: "technical",
      name: "Technical & Integration",
      items: [
        "Cloud Economics",
        "Blockchain & Real Asset Tokenization",
        "API Integration",
        "Multi-tenant SaaS Architecture",
        "Microservices Architecture",
        "RAG Pipelines & LLM Orchestration",
      ],
    },
    {
      id: "tools",
      name: "Tools",
      items: ["A/B Testing", "SQL (MySQL)", "Claude Code", "Figma", "Jira & Confluence"],
    },
  ],
} satisfies SiteInput;

export default site;

/**
 * Thao's own LinkedIn posts, shown on the home page as official LinkedIn
 * embeds (https://www.linkedin.com/embed/feed/update/<urn>). `height` comes
 * from LinkedIn's embed snippet; `url` is the public post link. Deduped by urn.
 */
export const linkedinPosts = [
  {
    urn: "urn:li:share:7504889327873626112",
    height: 668,
    title: "Vietnam's payment infrastructure: identity at its core",
    url: "https://www.linkedin.com/feed/update/urn:li:share:7504889327873626112/",
  },
  {
    urn: "urn:li:ugcPost:7505576167261966336",
    height: 1007,
    title: "Inside Vietnam's bank transfer system: NAPAS 247 and SIMO",
    url: "https://www.linkedin.com/feed/update/urn:li:ugcPost:7505576167261966336/",
  },
  {
    urn: "urn:li:activity:7483045282734104576",
    height: 760,
    title: "Agentic AI Build Week 2026: 2nd place with Cortex Sentinel",
    url: "https://www.linkedin.com/posts/thaodao0912_aabw-aabw2026-activity-7483045282734104576-zhg8",
  },
] as const satisfies readonly { urn: string; height: number; title: string; url: string }[];

// Real photos of Thao (optimised copies of her own uploads; see
// research-private/materials/media). `place` says where each one is used.
// Never add the laptop-at-desk photo: its on-screen windows were not reviewed.
export const photos = [
  {
    id: "aabw-winners",
    src: "/photos/aabw-winners-stage.webp",
    width: 1600,
    height: 1067,
    alt: "Thao with her team on stage as Financial Services II track winners at Agentic AI Build Week 2026",
    caption: "Agentic AI Build Week 2026 · track winners on stage",
    place: ["home", "about"],
  },
  {
    id: "conviction-2026",
    src: "/photos/conviction-2026.webp",
    width: 900,
    height: 1200,
    alt: "Thao standing in front of the CONVICTION 2026 stage sign",
    caption: "CONVICTION 2026",
    place: ["home", "about"],
  },
  {
    id: "ledgr-meetup",
    src: "/photos/ledgr-meetup-group.webp",
    width: 1600,
    height: 900,
    alt: "Group photo of builders at the meetup where Ledgr was demoed",
    caption: "Ledgr demo night · the whole room",
    place: ["home"],
  },
] as const satisfies readonly {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  place: readonly ("home" | "about")[];
}[];
