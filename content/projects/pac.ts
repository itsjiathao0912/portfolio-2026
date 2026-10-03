import type { ProjectInput } from "../schema.ts";

const project = {
  id: "pac",
  slug: "pac",
  title: "PAC",
  summary:
    "Billing for a cloud platform selling compute, storage, and network services to tenants across multiple regions.",
  role: "Owned the billing domain end-to-end",
  period: "2025",
  year: 2025,
  category: "Product",
  tags: ["Cloud usage metering", "Multi-currency", "API-first integration"],
  cover: null,
  links: [],
  sortOrder: 30,
  published: true,
  updatedAt: "2026-10-03T00:00:00.000Z",
  meta: {
    company: "SkyLab Group",
    subtitle: "Cloud service-provider billing platform",
    status: "Cloud · Multi-tenant SaaS",
    tint: "sky",
    logo: null,
    coverAlt: "",
    featured: true,
    proof: [{ value: "4", label: "cloud providers' pricing standardized" }],
    headline: "Four cloud providers' pricing, one billing system.",
    tone: "light",
    visual: {
      "kind": "illustration",
      "motif": "billing"
    },
  },
  blocks: [
    { type: "heading", text: "Overview", icon: "compass", eyebrow: "The product" },
    {
      type: "paragraph",
      text: "PAC is a cloud platform that sells compute, storage, and network services to tenants across multiple regions. Its billing has to turn multi-service usage into accurate tenant invoices.",
    },
    { type: "metrics", items: [{ value: "4", label: "providers: AWS, Azure, Huawei, Alibaba Cloud" }] },
    { type: "heading", text: "My role", icon: "user-round", eyebrow: "Ownership" },
    {
      type: "paragraph",
      text: "I owned the billing domain end-to-end: usage metering, multi-currency pricing, invoices, credit notes, and revenue dashboards. I specified the API-heavy integrations that turn multi-service usage into tenant invoices.",
    },
    { type: "heading", text: "What shipped", icon: "sparkles", eyebrow: "Features" },
    {
      type: "steps",
      items: [
        { title: "Cost monitoring dashboard", text: "Unified cost attribution across AWS, Azure, Huawei, and Alibaba Cloud." },
        { title: "Payment reconciliation", text: "Workflows that close the gap between metered usage and issued invoices." },
        { title: "Pricing standardization", text: "One pricing logic across four providers, removing inconsistencies in invoicing and cost attribution." },
      ],
    },
    { type: "image", src: null, alt: "PAC billing dashboard (screenshot not yet available)", caption: "Product screens are private; a sanitized capture will replace this frame." },
    { type: "heading", text: "Stack", icon: "layers", eyebrow: "Technology" },
    { type: "stack", items: ["Cloud usage metering", "Multi-currency", "API-first integration"] },
  ],
} satisfies ProjectInput;

export default project;
