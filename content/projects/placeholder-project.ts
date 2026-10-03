import type { ProjectInput } from "../schema.ts";

// Placeholder entry. It exists only to prove the content → D1 → page path works
// end to end. Replace it with real case studies.
const project = {
  id: "placeholder-project",
  slug: "placeholder-project",
  title: "Placeholder project",
  summary: "A stand-in case study that proves content flows from content/ into D1 and onto the page.",
  role: "Designer",
  period: "2026",
  year: 2026,
  category: "Case study",
  tags: ["placeholder"],
  cover: null,
  blocks: [
    { type: "heading", text: "Overview", level: 2 },
    { type: "paragraph", text: "Real content replaces this entry later." },
  ],
  links: [],
  sortOrder: 0,
  published: true,
  updatedAt: "2026-10-03T00:00:00.000Z",
} satisfies ProjectInput;

export default project;
