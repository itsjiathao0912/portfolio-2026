import type { ProjectInput } from "../schema.ts";

const project = {
  id: "cortex-sentinel",
  slug: "cortex-sentinel",
  title: "Cortex Sentinel",
  summary:
    "Open AML and transaction monitoring a bank can run on its own infrastructure: real-time monitoring, sanctions and PEP screening, and one case manager.",
  role: "Product and console layer",
  period: "Personal project",
  year: null,
  category: "Personal",
  tags: ["Go", "React", "PostgreSQL", "Elasticsearch + yente", "OpenSanctions", "Docker Compose"],
  cover: "/projects/cortex-sentinel/mockup-detection.jpg",
  links: [{ label: "GitHub", href: "https://github.com/cortex-sentinel-az/setinel" }],
  sortOrder: 70,
  published: true,
  updatedAt: "2026-10-03T00:00:00.000Z",
  meta: {
    company: "Personal",
    subtitle: "Open AML & transaction monitoring platform",
    status: "Open source · self-hosted",
    tint: "rose",
    logo: null,
    coverAlt: "Cortex Sentinel scenario list in the detection console",
    featured: false,
    proof: [{ value: "2nd", label: "place, AABW Fintech track" }],
    headline: "Open AML monitoring a bank can host itself.",
    tone: "deep",
    layout: "story",
    lede: "Hackathon build: rules in plain English, tested before they ship, a human signs every decision.",
    screens: [{ src: "/work/cortex-sentinel/data-model.webp", alt: "Cortex Sentinel data model view", device: "browser-free" }],
    emoji: "🛡️",
    color: "#f43f5e",
    visual: {
      "kind": "mockup",
      "device": "laptop",
      "screen": {
        "src": "/projects/cortex-sentinel/mockup-detection.jpg",
        "alt": "Cortex Sentinel detection console on a laptop"
      },
      "secondary": {
        "src": "/work/cortex-sentinel/decisions.webp",
        "alt": "Cortex Sentinel decisions list"
      }
    },
  },
  blocks: [
    { type: "heading", text: "Overview", icon: "compass", eyebrow: "The product" },
    {
      type: "paragraph",
      text: "Cortex Sentinel is compliance operations infrastructure that a bank can run itself: real-time transaction monitoring, sanctions and PEP screening, and one case manager to investigate what it flags.",
    },
    { type: "metrics", items: [{ value: "2nd place", label: "Agentic AI Build Week (AABW), Fintech track" }] },
    { type: "heading", text: "My work", icon: "user-round", eyebrow: "Ownership" },
    {
      type: "paragraph",
      text: "I own the product and console layer — the detection navigation, the case-management workspace, and an AI triage copilot that proposes a disposition with its rationale and evidence, rather than a bare score.",
    },
    {
      type: "moduleMap",
      title: "The console, module by module",
      caption: "Built on the open-source Marble decision engine. My part was the product and console layer on top of it.",
      source: "Cortex Sentinel repository and PRD workflow mockups",
      center: "Sentinel console",
      items: [
        { label: "Detection", detail: "Scenarios, rules, live versions" },
        { label: "Rule studio", detail: "Rules written in plain English" },
        { label: "Triage copilot", detail: "Disposition, rationale, evidence" },
        { label: "Case manager", detail: "One queue to investigate" },
        { label: "STR drafting", detail: "Pre-drafted report for the regulator" },
        { label: "Your data", detail: "Data model and uploads" },
      ],
    },
    {
      type: "story",
      device: "laptop",
      steps: [
        { title: "Detect", text: "Scenarios and rules run on every transaction, with versions you can replay for a regulator on any date.", src: "/projects/cortex-sentinel/mockup-detection.jpg", alt: "Scenario list in the detection console" },
        { title: "Write a rule in plain English", text: "An analyst describes the typology; an agent turns it into a rule, and a person saves and publishes it.", src: "/projects/cortex-sentinel/mockup-rule-studio.jpg", alt: "Rule studio editor" },
        { title: "Watch the decisions", text: "Every decision is logged with its outcome and score, so analysts can see how the rules behave over time.", src: "/projects/cortex-sentinel/analytics.jpg", alt: "Detection analytics: decisions over time and score distribution" },
        { title: "Model your own data", text: "Transactions, accounts and Travel Rule messages are mapped once, so the same engine can serve a crypto wallet or a securities firm.", src: "/work/cortex-sentinel/data-model.webp", alt: "Data model: transactions linked to accounts and Travel Rule messages" },
      ],
    },
    { type: "heading", text: "Results", icon: "chart-column", eyebrow: "Backtest" },
    {
      type: "paragraph",
      text: "We labelled every claim in the pitch as live, prototyped or backtest. These numbers are backtest numbers: the triage gate replayed on a resolved demo corpus, with the ground-truth labels removed before ingestion.",
    },
    {
      type: "funnel",
      title: "Three-lane triage on the backtest corpus",
      caption: "Only alerts the gate could clear safely were auto-closed. Anything touching sanctions or an incomplete Travel Rule message fails closed to a person.",
      source: "Cortex Sentinel project story (team backtest on sample/seed data). Not production results.",
      badge: "Backtest, sample data",
      stages: [
        { label: "All alerts", value: 100 },
        { label: "Auto-closed by the triage gate", value: 6.5, detail: "The rest went to an analyst or were escalated." },
        { label: "True positives among the auto-closed", value: 0, detail: "No real case escaped through auto-close." },
      ],
    },
    {
      type: "beforeAfter",
      title: "Manual review load, baseline rules vs the gate",
      caption: "At a held 90% recall the gate cut false positives by 20.3% and manual review by 18.4%, against baseline rules at 100% recall and 18.1% precision.",
      source: "Cortex Sentinel project story (team backtest on sample/seed data). Indexed: baseline = 100.",
      badge: "Backtest, sample data",
      before: { label: "Baseline rules", value: 100 },
      after: { label: "With the triage gate", value: 81.6 },
    },
    {
      type: "gallery",
      images: [
        { src: "/projects/cortex-sentinel/mockup-rule-studio.jpg", alt: "Statutory rule pack in the rule studio", caption: "Rule studio" },
        { src: "/work/cortex-sentinel/decisions.webp", alt: "Detection decisions list", caption: "Decisions" },
        { src: "/work/cortex-sentinel/data-model.webp", alt: "Data model: transactions, accounts and Travel Rule messages", caption: "Data model" },
        { src: "/projects/cortex-sentinel/analytics.jpg", alt: "Detection analytics view", caption: "Analytics" },
      ],
    },
    { type: "heading", text: "Stack", icon: "layers", eyebrow: "Technology" },
    { type: "stack", items: ["Go", "React", "PostgreSQL", "Elasticsearch + yente", "OpenSanctions", "Docker Compose"] },
    { type: "links", items: [{ label: "Source on GitHub", href: "https://github.com/cortex-sentinel-az/setinel" }] },
  ],
} satisfies ProjectInput;

export default project;
