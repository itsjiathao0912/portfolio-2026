import type { ProjectInput } from "../schema.ts";

const project = {
  id: "cortex-sentinel",
  slug: "cortex-sentinel",
  title: "Cortex Sentinel",
  summary:
    "A hackathon build: an adaptive AML triage layer on top of an existing transaction-monitoring platform. Analysts write rules in plain English, test them before they ship, and a human signs every decision.",
  role: "Product lead: research, specs, console UI and pitch",
  period: "Hackathon · Agentic AI Build Week 2026",
  year: 2026,
  category: "Hackathon",
  tags: ["Go", "React", "PostgreSQL", "Elasticsearch + yente", "OpenSanctions", "Docker Compose"],
  cover: "/projects/cortex-sentinel/mockup-detection.jpg",
  links: [{ label: "GitHub", href: "https://github.com/cortex-sentinel-az/setinel" }],
  sortOrder: 70,
  published: true,
  updatedAt: "2026-10-03T00:00:00.000Z",
  meta: {
    company: "Agentic AI Build Week 2026",
    subtitle: "AML triage layer for fiat and crypto",
    status: "Hackathon build · 2nd place",
    tint: "rose",
    logo: null,
    coverAlt: "Cortex Sentinel scenario list in the detection console",
    featured: false,
    proof: [{ value: "2nd", label: "place, Agentic AI Build Week 2026" }],
    headline: "Compliance that scales like software, not headcount.",
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
      text: "Cortex Sentinel is an AML triage layer for fiat and crypto, built in one hackathon week. When a bank hands millions of people a crypto wallet, every transfer can become an alert. Detecting risk is the easy part; changing the rules, and proving the change to a regulator, is the hard part.",
    },
    {
      type: "paragraph",
      text: "We did not build the engine. The team built on the open-source Marble decision engine, a production transaction-monitoring platform. AI rule generation and rule versioning are platform capabilities we built on. Our contribution was the adaptive-triage layer: the gate that decides what can be safely auto-cleared, and the console that puts every decision in front of a person.",
    },
    {
      type: "metrics",
      items: [
        { value: "2nd place", label: "Agentic AI Build Week 2026" },
        { value: "6.5M", label: "GoTyme customers in the problem statement (public figure)" },
        { value: "≤3×", label: "times the agent rewrites an invalid rule before a person sees it" },
      ],
      source: "Cortex Sentinel pitch deck, p.1, p.2 and p.6. The customer figure is GoTyme's own public number.",
    },
    { type: "heading", text: "My work", icon: "user-round", eyebrow: "Ownership" },
    {
      type: "paragraph",
      text: "I led the product side of the team. I researched Vietnamese AML law and the FATF Travel Rule, wrote the user-story set, and specced each workflow as a clickable mockup: case management, rule studio, disposition copilot, STR drafting, data and detection. Then I re-skinned the console to match those mockups, and I wrote the pitch.",
    },
    {
      type: "list",
      items: [
        "AML research and a 14-file user-story set, from sign-in to the AI agent and STR drafting.",
        "Seven clickable workflow mockups, specced before any UI was built.",
        "The console front end: case queue, case detail, the AI disposition-copilot card and analytics tiles, built to match the mockups.",
        "The pitch, with every claim labelled live, prototyped or backtest.",
      ],
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
    { type: "heading", text: "How a rule decides", icon: "git-branch", eyebrow: "The triage layer" },
    {
      type: "paragraph",
      text: "Each rule adds points to a transaction's score, and the score lands in a band: approve, review, block or decline. Tap the rules below to fire them. The preset is the deck's structuring example.",
    },
    {
      type: "scoreLadder",
      title: "Fire the rules, watch the score move",
      caption: "The five rule weights and the four score bands used in the demo.",
      source: "Cortex Sentinel pitch deck, p.19 (rule weights and bands) and p.8 (structuring example).",
      badge: "Demo rules",
      rules: [
        { label: "near_reporting_threshold", points: 30 },
        { label: "high_risk_corridor", points: 30 },
        { label: "kyt_high_exposure", points: 50 },
        { label: "structuring_velocity_24h", points: 45 },
        { label: "rapid_funds_movement", points: 45 },
      ],
      bands: [
        { label: "Approve", from: 0, tone: "calm" },
        { label: "Review", from: 30, tone: "watch" },
        { label: "Block", from: 80, tone: "alert" },
        { label: "Decline", from: 100, tone: "stop" },
      ],
      preset: ["structuring_velocity_24h"],
    },
    {
      type: "stackedBar",
      title: "A candidate rule version, shadow-tested on live traffic",
      caption: "Before a new rule version ships, it runs beside the live one. This is how its decisions split in the demo run.",
      source: "Cortex Sentinel pitch deck, p.7 (shadow test run, candidate v2 vs live v1).",
      badge: "Demo data",
      unit: "%",
      segments: [
        { label: "Approve", value: 71 },
        { label: "Review", value: 19, detail: "sent to an analyst" },
        { label: "Block", value: 7 },
        { label: "Decline", value: 3 },
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
    { type: "heading", text: "Demo day", icon: "badge-check", eyebrow: "Agentic AI Build Week 2026" },
    {
      type: "video",
      src: "/work/cortex-sentinel/demo-loop.mp4",
      poster: "/work/cortex-sentinel/demo-poster.webp",
      alt: "Thao demoing Cortex Sentinel to judges on a crowded hackathon floor",
      caption: "Walking the judges through the console on the hackathon floor (10-second muted excerpt).",
      aspect: "portrait",
    },
    {
      type: "image",
      src: "/work/cortex-sentinel/stage.webp",
      alt: "Thao and the Cortex Sentinel team on stage as track winners, Agentic AI Build Week 2026",
      caption: "On stage with the team after placing second.",
      size: "wide",
    },
    { type: "heading", text: "Stack", icon: "layers", eyebrow: "Technology" },
    { type: "stack", items: ["Go", "React", "PostgreSQL", "Elasticsearch + yente", "OpenSanctions", "Docker Compose"] },
    { type: "links", items: [{ label: "Source on GitHub", href: "https://github.com/cortex-sentinel-az/setinel" }] },
  ],
} satisfies ProjectInput;

export default project;
