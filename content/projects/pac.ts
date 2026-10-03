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
    layout: "magazine",
    lede: "Billing for a multi-region cloud platform, owned end to end at SkyLab Group.",
    emoji: "☁️",
    color: "#3b82f6",
    visual: {
      "kind": "illustration",
      "motif": "billing"
    },
  },
  blocks: [
    { type: "heading", text: "The insight", icon: "compass", eyebrow: "The problem", depth: "skim" },
    {
      type: "quote",
      text: "Billing only works once every provider's usage speaks one unit.",
    },
    {
      type: "paragraph",
      text: "PAC is a cloud platform that sells compute, storage and network services to tenants across multiple regions. Underneath, four providers (AWS, Azure, Huawei Cloud and Alibaba Cloud) each price their services their own way. Left alone, that shows up as inconsistent invoices and cost that cannot be attributed to the right tenant.",
    },
    {
      type: "paragraph",
      text: "So the tension was not collecting usage. It was that four price books cannot be compared, or billed from, until they are translated into one model. Try it below with made-up rates: guess which book is cheapest, then normalise.",
    },
    {
      type: "decision",
      title: "Bill each provider's price book, or one model?",
      rejected: { label: "Provider price books as they are", text: "Bill from each provider's own pricing model and reconcile the differences afterwards." },
      chosen: { label: "One pricing model", text: "Translate the four price books into one canonical model, then meter per tenant per service." },
      because: "Four price books cannot be compared, or billed from, until they speak one unit. Left alone they produce inconsistent invoices and cost that cannot be attributed to the right tenant.",
      source: "Thao's CV (SkyLab Group, PAC billing).",
    },
    {
      type: "custom",
      depth: "read",
      component: "pac/PriceBooks",
      source: "Illustration of the problem class, built from my CV description (pricing standardised across four providers). Rates and units are invented, not any provider's real pricing.",
    },
    { type: "heading", text: "What I owned", icon: "user-round", eyebrow: "Ownership" },
    {
      type: "paragraph",
      owner: "owned",
      text: "I owned the billing domain end to end at SkyLab Group: usage metering, multi-currency pricing, invoices, credit notes and revenue dashboards. I specified the API-heavy integrations that turn multi-service usage into tenant invoices, and I designed and shipped the cost monitoring dashboard and the payment reconciliation workflows.",
    },
    {
      type: "list",
      items: [
        "Metering: usage per tenant, per service, across compute, storage and network.",
        "Pricing: one price logic across four providers, billed in the tenant's currency.",
        "Invoices and credit notes: issued from metered usage, with corrections made as credit notes rather than edits.",
        "Dashboards and reconciliation: what was used, invoiced and paid, in one view.",
      ],
    },
    {
      type: "flow",
      title: "Four price books into one invoice",
      caption: "The scope of the billing domain, as described in my CV. A conceptual view, not a system diagram.",
      source: "Thao's CV",
      fanIn: ["AWS", "Azure", "Huawei Cloud", "Alibaba Cloud"],
      steps: [
        { label: "One pricing model", detail: "Standardised, multi-currency" },
        { label: "Usage metering", detail: "Per tenant, per service" },
        { label: "Invoices and credit notes", detail: "Issued to tenants" },
        { label: "Payment reconciliation", detail: "Usage vs invoice vs payment" },
      ],
    },
    { type: "heading", text: "Closing the loop", icon: "sparkles", eyebrow: "Reconciliation" },
    {
      type: "paragraph",
      text: "An invoice is only half of billing. The other half is knowing the three numbers agree: what was metered, what was invoiced, what was paid. When they do not, the fix depends on which one is off, and an issued invoice is corrected with a credit note, never edited. Play the operator on four fictional tenants.",
    },
    {
      type: "custom",
      component: "pac/Reconcile",
      source: "Illustration of the reconciliation workflow I shipped, from my CV. Tenants and amounts are fictional.",
    },
    {
      type: "steps",
      items: [
        { title: "Cost monitoring dashboard", text: "Unified cost attribution across AWS, Azure, Huawei and Alibaba Cloud." },
        { title: "Payment reconciliation", text: "Workflows that close the gap between metered usage and issued invoices." },
        { title: "Pricing standardisation", text: "One pricing logic across four providers, removing inconsistencies in invoicing and cost attribution." },
      ],
    },
    {
      type: "callout",
      text: "Product screens and outcome metrics for PAC are private, so this page shows the logic with illustrative data rather than the product. No figures here are measured results.",
    },
    { type: "heading", text: "Stack", icon: "layers", eyebrow: "Technology", depth: "deep" },
    { type: "stack", items: ["Cloud usage metering", "Multi-currency", "API-first integration"] },
    {
      type: "results",
      heading: "What shipped",
      shipped: [
        "A cost monitoring dashboard across AWS, Azure, Huawei Cloud and Alibaba Cloud",
        "Payment reconciliation workflows: metered usage against invoice against payment",
        "One pricing logic across four providers, billed in the tenant's currency",
        "Invoices and credit notes issued from metered usage",
      ],
      source: "Thao's CV (SkyLab Group). Product screens and outcome metrics for PAC are private, so no figures are claimed.",
    },
  ],
} satisfies ProjectInput;

export default project;
