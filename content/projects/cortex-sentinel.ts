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
        "src": "/projects/cortex-sentinel/mockup-case-management.jpg",
        "alt": "Cortex Sentinel case manager"
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
      type: "steps",
      items: [
        { title: "Detection", text: "Scenarios, rules, and live versions for transaction monitoring." },
        { title: "Case management", text: "One workspace to investigate what detection flags." },
        { title: "Triage copilot", text: "A proposed disposition with rationale and evidence." },
        { title: "Reporting", text: "Demoed with Travel Rule and STR-derivation flows for a Vietnam-market scenario." },
      ],
    },
    {
      type: "gallery",
      images: [
        { src: "/projects/cortex-sentinel/mockup-detection.jpg", alt: "Scenario list in the detection console", caption: "Detection scenarios" },
        { src: "/projects/cortex-sentinel/mockup-case-management.jpg", alt: "Case management workspace", caption: "Case management" },
        { src: "/projects/cortex-sentinel/mockup-disposition-copilot.jpg", alt: "AI triage copilot proposing a disposition", caption: "Triage copilot" },
        { src: "/projects/cortex-sentinel/mockup-rule-studio.jpg", alt: "Rule studio editor", caption: "Rule studio" },
        { src: "/projects/cortex-sentinel/mockup-str-drafting.jpg", alt: "Suspicious transaction report drafting", caption: "STR drafting" },
        { src: "/projects/cortex-sentinel/analytics.jpg", alt: "Detection analytics view", caption: "Analytics" },
      ],
    },
    { type: "heading", text: "Stack", icon: "layers", eyebrow: "Technology" },
    { type: "stack", items: ["Go", "React", "PostgreSQL", "Elasticsearch + yente", "OpenSanctions", "Docker Compose"] },
    { type: "links", items: [{ label: "Source on GitHub", href: "https://github.com/cortex-sentinel-az/setinel" }] },
  ],
} satisfies ProjectInput;

export default project;
