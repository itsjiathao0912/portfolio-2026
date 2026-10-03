import type { ProjectInput } from "../schema.ts";

// Source: the team's own proposal deck "Guardline Fraud Detection Proposal"
// (Sea × OpenAI Codex Hackathon Vietnam 2026). The deck states no placement,
// so none is claimed. Every outcome number is a target on synthetic data.
const DECK = "Guardline proposal deck (Sea × OpenAI Codex Hackathon Vietnam 2026)";

const project = {
  id: "guardline",
  slug: "guardline",
  title: "Guardline",
  summary:
    "A hackathon build: an AI fraud desk for SPayLater that finds rings of fake accounts, takes only safe, reversible actions on its own, and writes a new rule each time it meets a new trick.",
  role: "Technical PM · team lead",
  period: "Hackathon · 2026",
  year: 2026,
  category: "Hackathon",
  tags: ["OpenAI Responses API", "Agents", "Graph detection", "Policy guard", "Fraud"],
  cover: "/work/guardline/deck-title.webp",
  links: [],
  sortOrder: 75,
  published: true,
  updatedAt: "2026-10-03T00:00:00.000Z",
  meta: {
    company: "Sea × OpenAI Codex Hackathon Vietnam 2026",
    subtitle: "AI fraud desk for SPayLater",
    status: "Hackathon build · targets, not results",
    tint: "peach",
    logo: null,
    coverAlt: "Guardline title slide: a graph of linked accounts with one highlighted cluster",
    featured: false,
    proof: [{ value: "~95%", label: "of orders cleared by cheap checks, no AI (target)" }],
    headline: "An AI fraud desk that knows its limits.",
    tone: "light",
    layout: "magazine",
    lede: "Stopping SPayLater cash-out rings without blocking real families. The insight: clear most orders with cheap checks, let the AI work only the hard cases, and never let it have the last word.",
    screens: [],
    emoji: "🔎",
    color: "#ea580c",
    visual: { kind: "illustration", motif: "fraudRing" },
  },
  blocks: [
    { type: "heading", text: "The problem", icon: "circle-alert", eyebrow: "Sea × OpenAI Codex Hackathon Vietnam 2026" },
    {
      type: "paragraph",
      text: "Fraudsters use many accounts to place fake orders at a shop they work with, take the cash, and never repay. Each order looks normal on its own; the fraud only shows across accounts, shops, phones and addresses. The blunt fix, blocking anyone who shares a phone, hits families and renters and slows growth. That is the tension: fraud is the biggest threat to holding bad loans near 1%, and a heavy hand is its own cost.",
    },
    {
      type: "image",
      src: "/work/guardline/deck-title.webp",
      alt: "Guardline title slide: the problem, the build direction and the AI used",
      caption: "The team's proposal deck, title slide. Slide design by the team.",
      device: "plain",
    },
    {
      type: "metrics",
      badge: "Public figure",
      source: `${DECK}, p.2, citing Sea's Q2 2026 earnings.`,
      items: [
        { value: "US$11.1B", label: "Monee loan book, Q2 2026 (+62% year on year)" },
        { value: "5.3M", label: "first-time borrowers in one quarter" },
        { value: ">20%", label: "of SPayLater loans used outside Shopee via QR" },
        { value: "~1%", label: "bad loans (90+ days overdue): the line to hold" },
      ],
    },
    { type: "heading", text: "My role", icon: "user-round", eyebrow: "Team lead" },
    {
      type: "paragraph",
      text: "I led a team of three. The tech lead built the investigation backend, orchestration, evidence checks and action limits; the AI engineer built the agent runtime, rule writer, anomaly scoring and evals. I owned the product side: I turned fraud rules into specs and tests, wrote the fraud scenarios and user flows, and designed the three-minute demo. The decision I pushed hardest on: write down what the agent may not do before writing what it does.",
    },
    { type: "heading", text: "How it decides", icon: "workflow", eyebrow: "AI flow" },
    {
      type: "paragraph",
      text: "Cheap signals first, the agent for judgement, and a code guard before any action. The agent never acts itself. Tap a step to follow its path.",
    },
    {
      type: "explorable",
      title: "From an order to a decision",
      caption: "Solid: detect and investigate. Dashed: learning, only from human decisions and confirmed outcomes.",
      source: `${DECK}, p.4 (flow) and p.7 (who decides, and the limits).`,
      badge: "System design",
      nodes: [
        { id: "signals", label: "Signals", detail: "Orders, devices and addresses, with Vietnamese addresses normalised.", col: 0, row: 1 },
        { id: "detect", label: "Detection", detail: "Rules, a link graph of buyers, shops, devices and addresses, and an anomaly score. About 95% of orders are cleared here, with no AI (target).", col: 1, row: 1 },
        { id: "agent", label: "AI investigator", detail: "Works the whole cluster with read-only tools and returns a JSON verdict plus a Vietnamese case report. Every claim cites a real record ID.", col: 2, row: 1, kind: "actor" },
        { id: "guard", label: "Policy guard", detail: "Code, not AI. It checks every proposed action against the limits before anything happens.", col: 3, row: 1, kind: "guard" },
        { id: "clear", label: "Clear", detail: "Genuine activity, including decoys like a family sharing one phone.", col: 4, row: 0, kind: "outcome" },
        { id: "platform", label: "Platform acts", detail: "Agent alone: step-up verification (OTP for low risk, face match for high), or hold an order or reserve part of a payout. Expires within 3 working days, then released or escalated.", col: 4, row: 1, kind: "outcome" },
        { id: "bank", label: "Partner bank", detail: "Cutting a limit or freezing credit is the bank's call, because the bank is the lender. The agent recommends, with evidence.", col: 4, row: 2, kind: "outcome" },
        { id: "person", label: "Person decides", detail: "Anything touching more than 10 accounts, or a novel case. The analyst decides before seeing the AI's call.", col: 4, row: 3, kind: "outcome" },
        { id: "writer", label: "Rule writer", detail: "Drafts a rule from a confirmed new tactic. A person promotes it.", col: 2, row: 3, kind: "actor" },
        { id: "review", label: "Daily review", detail: "Each night it proposes rules for repeated decisions and flags similar cases that got different outcomes.", col: 1, row: 3, kind: "actor" },
      ],
      edges: [
        { from: "signals", to: "detect" },
        { from: "detect", to: "agent" },
        { from: "agent", to: "guard" },
        { from: "guard", to: "clear" },
        { from: "guard", to: "platform" },
        { from: "guard", to: "bank" },
        { from: "guard", to: "person" },
        { from: "person", to: "writer", dashed: true },
        { from: "writer", to: "review", dashed: true },
        { from: "review", to: "detect", dashed: true },
      ],
    },
    {
      type: "heading",
      text: "What it may, and may not, do",
      icon: "shield-check",
      eyebrow: "Policy guard",
    },
    {
      type: "paragraph",
      text: "Trust came from the limits, not the model. Play the guard: propose an action, change how many accounts it touches, and see who is allowed to take it.",
    },
    {
      type: "custom",
      component: "guardline/ActionDesk",
      source: `${DECK}, p.7 (who decides, and the limit) and p.4 (more than 10 accounts goes to a person).`,
    },
    {
      type: "paragraph",
      text: "The agent's output is a verdict, never an action. Every claim has to cite a real record, and the code checks that before anything happens.",
    },
    {
      type: "custom",
      component: "guardline/VerdictCheck",
      source: `${DECK}, p.5 (verdict and self-check, demo data) and p.6 (novel cases).`,
    },
    { type: "heading", text: "How it adapts", icon: "git-branch", eyebrow: "New tactics" },
    {
      type: "scrubTimeline",
      title: "When it meets a trick no rule covers",
      caption: "Drag through the loop. The next wave is caught by a rule, with no AI call at all.",
      source: `${DECK}, p.6.`,
      tracks: [
        {
          name: "Adapt loop",
          stops: [
            { when: "Step 1", label: "Agent flags it as novel", detail: "The case matches no known pattern, and the agent says so. The guard then allows only mild, reversible actions and escalates." },
            { when: "Step 2", label: "Analyst confirms", detail: "A person confirms it is a new tactic. The system learns only from human decisions and confirmed outcomes." },
            { when: "Step 3", label: "Rule writer drafts a rule", detail: "The confirmed tactic becomes a drafted rule." },
            { when: "Step 4", label: "Backtest on history", detail: "The draft runs against past orders before anyone relies on it." },
            { when: "Step 5", label: "A person promotes it", detail: "Nothing goes live without a human promoting it." },
            { when: "Step 6", label: "Next wave caught, no AI", detail: "The new rule catches the next wave in the cheap detection layer." },
          ],
        },
      ],
    },
    {
      type: "image",
      src: "/work/guardline/deck-loop.webp",
      alt: "Guardline one-loop slide: detect, investigate, act safely, adapt, daily review",
      caption: "The whole idea on one slide: it learns only from human decisions and confirmed outcomes, never from its own verdicts.",
      device: "plain",
    },
    { type: "heading", text: "The demo", icon: "badge-check", eyebrow: "Three minutes" },
    {
      type: "paragraph",
      text: "The demo opens on the hardest thing to see: a ring no single order reveals, then the decoy that must not be caught. Try both.",
    },
    {
      type: "custom",
      component: "guardline/RingUnmask",
      source: `${DECK}, p.8 (14 accounts sharing devices; the decoy) and p.4 (more than 10 accounts goes to a person).`,
    },
    {
      type: "steps",
      items: [
        { title: "A ring no single order reveals", text: "14 accounts sharing devices. Orders are held automatically; the credit freeze goes to the bank." },
        { title: "The decoy", text: "A family sharing one phone and a busy rental house. The desk clears them; a blunt rule would not." },
        { title: "A new cash-out tactic, live", text: "No rule fires. The graph catches it; a rule is drafted, backtested and promoted; the next wave is caught." },
        { title: "Why you can trust it", text: "An audit trail, a consistency flag between two analysts, and a kill switch that drops it to recommend-only." },
      ],
    },
    {
      type: "metrics",
      badge: "Target, synthetic data",
      source: `${DECK}, p.8: "Targets, not results. All numbers are computed live on synthetic data."`,
      items: [
        { value: "~95%", label: "cases resolved without AI" },
        { value: "0 → 90%+", label: "catch rate on a new tactic, after adapting" },
        { value: "0", label: "genuine users blocked" },
      ],
    },
    { type: "quote", text: "It learns only from human decisions and confirmed outcomes, never from its own verdicts.", attribution: "Guardline design principle" },
  ],
} satisfies ProjectInput;

export default project;
