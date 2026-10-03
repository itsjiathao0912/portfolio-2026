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
    { type: "heading", text: "The insight", icon: "circle-alert", eyebrow: "The problem" },
    {
      type: "quote",
      text: "The bottleneck isn't detecting risk. It's changing the rules.",
      attribution: "Cortex Sentinel pitch deck, p.3",
    },
    {
      type: "paragraph",
      text: "GoTyme had just handed its banking customers a crypto wallet (6.5M users, the bank's own public figure). Every on-ramp, withdrawal and cross-exchange transfer can raise an AML alert, so alerts grow with volume. A digital bank can't answer ten times the volume with ten times the analysts, and for a licensed crypto exchange one AML miss is a licence event, not a fine.",
    },
    {
      type: "paragraph",
      text: "The tension sat in 2,000 alerts analysts had already resolved. Some alert types were cleared every single time: pure noise. One, high crypto-wallet risk, split roughly 50/50: a coin flip only a person should call. So the real question was never \"can AI score this?\" It was \"which alerts are we allowed to automate, and can we defend that to a regulator on any date?\"",
    },
    {
      type: "metrics",
      items: [
        { value: "2nd place", label: "Agentic AI Build Week 2026" },
        { value: "2,000", label: "resolved alerts in the team's corpus (seed data)" },
        { value: "6.5M", label: "GoTyme users in the brief (company's public figure)" },
      ],
      source: "Cortex Sentinel pitch deck, p.2, p.3 and p.16. The user figure is GoTyme's own.",
    },
    { type: "heading", text: "What I owned", icon: "user-round", eyebrow: "Ownership" },
    {
      type: "paragraph",
      text: "This was a team build on top of the open-source Marble decision engine. I led the product side: I researched Vietnamese AML law and the FATF Travel Rule, wrote a 14-file user-story set, and specced every workflow as a clickable mockup before any UI existed. Then I re-skinned the console to match those mockups and wrote the pitch. Teammates built most of the backend and AI plumbing.",
    },
    {
      type: "paragraph",
      text: "Two decisions were mine. First, spec before build: each screen existed as a mockup with real Vietnamese AML cases (fictional people) so the team argued about the workflow, not the pixels. Second, label every claim: in the pitch each number is tagged live, prototyped or backtest, and the deck says out loud which parts were the platform's. Filter the map below to see exactly what that meant.",
    },
    {
      type: "custom",
      component: "cortex-sentinel/HonestyMap",
      source: "Cortex Sentinel pitch deck, p.14 (architecture and status chips), p.17 (what's live vs prototyped), p.20 (platform vs our contribution), p.8 (precedents).",
    },
    {
      type: "imageRow",
      caption: "Two of my seven workflow mockups, specced before the console was built. All names are fictional.",
      images: [
        { src: "/work/cortex-sentinel/spec-copilot.webp", alt: "Disposition copilot mockup: a case with a 0.86 confidence score, a recommended escalation and cited reason codes", caption: "Disposition copilot: every reason cites its evidence", device: "plain" },
        { src: "/work/cortex-sentinel/spec-str.webp", alt: "STR drafting mockup: a queue of suspicious-transaction report drafts ranked by deadline", caption: "STR drafting: drafts ranked by legal deadline", device: "plain" },
      ],
    },
    { type: "heading", text: "How a rule is born", icon: "workflow", eyebrow: "Rule authoring" },
    {
      type: "paragraph",
      text: "Today a new laundering pattern means an engineer, a ticket and a blind deploy. In the console an analyst describes the rule in plain English, an agent turns it into a typed rule and checks it against the data model, and a person saves it. Step through it yourself.",
    },
    {
      type: "custom",
      component: "cortex-sentinel/AgentLoop",
      source: "Cortex Sentinel pitch deck, p.5 (example prompt and rule), p.6 (self-correction up to 3×), p.13 (plan, ground, generate, validate, human saves). Repo: api/usecases/ai_agent/ai_rule_assist.go.",
    },
    {
      type: "stackedBar",
      title: "Before it ships, the new version runs beside the live one",
      caption: "A candidate rule version is scored on the same traffic as the live version, with no effect on customers. This is how its decisions split in the demo run.",
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
    { type: "heading", text: "How a rule decides", icon: "chart-column", eyebrow: "Scoring" },
    {
      type: "scoreLadder",
      title: "Fire the rules, watch the score move",
      caption: "Each rule adds points; the total lands in a band. The preset is the deck's structuring example: three transfers just under the reporting threshold.",
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
    { type: "heading", text: "What the machine may close", icon: "shield-check", eyebrow: "The triage gate" },
    {
      type: "paragraph",
      text: "This is the team's own layer. A model recommends, but a fixed, auditable gate decides, and it fails closed: if anything is uncertain, a person gets the alert. Try to get the coin-flip alert auto-cleared.",
    },
    {
      type: "custom",
      component: "cortex-sentinel/AutoClearGate",
      source: "Cortex Sentinel pitch deck, p.15 (fails safe, guard chain), p.16 (10/10 classes vs kyt_high_exposure ≈ 53/52), p.19 (precedent vote ≥ 3 cleared, 0 escalated). Project story (sanctions and Travel Rule never auto-close; 6.5% backtest).",
    },
    {
      type: "funnel",
      title: "Three-lane triage on the backtest corpus",
      caption: "Only alerts the gate could clear safely were auto-closed; the rest went to an analyst or were escalated.",
      source: "Cortex Sentinel project story (team backtest on sample/seed data). Not production results.",
      badge: "Backtest, sample data",
      stages: [
        { label: "All alerts", value: 100 },
        { label: "Auto-closed by the triage gate", value: 6.5 },
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
    { type: "heading", text: "The console", icon: "package", eyebrow: "What shipped" },
    {
      type: "story",
      device: "laptop",
      steps: [
        { title: "Detect", text: "Scenarios and rules run on every transaction, with versions you can replay for a regulator on any date.", src: "/projects/cortex-sentinel/mockup-detection.jpg", alt: "Scenario list in the detection console" },
        { title: "Write a rule in plain English", text: "The rule studio where the agent's draft lands for a person to review.", src: "/projects/cortex-sentinel/mockup-rule-studio.jpg", alt: "Rule studio editor" },
        { title: "Watch the decisions", text: "Every decision is logged with its outcome and score.", src: "/projects/cortex-sentinel/analytics.jpg", alt: "Detection analytics: decisions over time and score distribution" },
        { title: "Model your own data", text: "Transactions, accounts and Travel Rule messages are mapped once, so every rule and review reads the same source.", src: "/work/cortex-sentinel/data-model.webp", alt: "Data model: transactions linked to accounts and Travel Rule messages" },
      ],
    },
    { type: "heading", text: "Demo day", icon: "badge-check", eyebrow: "Agentic AI Build Week 2026" },
    {
      type: "image",
      src: "/work/cortex-sentinel/thao-stage.webp",
      alt: "Thao on stage at Agentic AI Build Week 2026 after the team placed second",
      caption: "On stage after placing second. What I'd do next: wire the scorer into the live decision path and add a four-eyes publish gate.",
      device: "plain",
    },
    { type: "heading", text: "Stack", icon: "layers", eyebrow: "Technology" },
    { type: "stack", items: ["Go", "React", "PostgreSQL", "Elasticsearch + yente", "OpenSanctions", "Docker Compose"] },
    { type: "links", items: [{ label: "Source on GitHub", href: "https://github.com/cortex-sentinel-az/setinel" }] },
  ],
} satisfies ProjectInput;

export default project;
