// Plain-English glossary for the case studies. DRAFT wording: Thao reviews it.
// Rules: no numbers, no claims about her work, one sentence a recruiter can read in a hover.
// Only terms that actually appear in annotatable case-study text belong here
// (a unit test fails on a dead entry), so the list never rots.

export interface GlossaryEntry {
  /** Stable id, also the data attribute on the rendered term. */
  id: string;
  /** Display name at the top of the popover. */
  label: string;
  /** Regex sources that mark an occurrence. Matched on word boundaries. */
  patterns: readonly string[];
  /** Acronyms are matched case-sensitively so "pit" never becomes PIT. */
  caseSensitive?: boolean;
  def: string;
}

export const GLOSSARY: readonly GlossaryEntry[] = [
  { id: "aml", label: "AML", patterns: ["AML"], caseSensitive: true, def: "Anti-money laundering: the rules and checks that stop criminal money moving through a bank or a crypto exchange." },
  { id: "travel-rule", label: "Travel Rule", patterns: ["Travel Rule"], def: "A rule that makes the sending and receiving firms share who is behind a crypto transfer, the way banks already do for wire transfers." },
  { id: "fatf", label: "FATF", patterns: ["FATF"], caseSensitive: true, def: "The Financial Action Task Force: the global body whose anti-money-laundering standards most countries' laws follow." },
  { id: "erp", label: "ERP", patterns: ["ERP"], caseSensitive: true, def: "Enterprise resource planning: the main business software a company runs its accounting, purchasing and HR on." },
  { id: "smb", label: "SMB", patterns: ["SMBs?"], caseSensitive: true, def: "Small and mid-sized business." },
  { id: "uat", label: "UAT", patterns: ["UAT"], caseSensitive: true, def: "User acceptance testing: the last check where the people who will use a feature confirm it works as they need before it ships." },
  { id: "llm", label: "LLM", patterns: ["LLM", "language models?"], caseSensitive: false, def: "Large language model: the kind of AI behind chatbots such as ChatGPT." },
  { id: "four-eyes", label: "Four-eyes", patterns: ["four-eyes"], def: "A control where a second person must approve a change before it goes live." },
  { id: "quorum", label: "Quorum", patterns: ["quorum"], def: "The minimum number of approvers who must agree before an action goes through." },
  { id: "custody", label: "Custody", patterns: ["custody"], def: "Holding and safeguarding assets on someone else's behalf, including the keys that control digital funds." },
  { id: "stablecoin", label: "Stablecoin", patterns: ["stablecoins?"], def: "A digital token pegged to an ordinary currency such as the US dollar, so its value stays steady." },
  { id: "tokenisation", label: "Tokenisation", patterns: ["tokenis(?:ed|ation)"], def: "Turning ownership of a real-world asset into a digital token on a blockchain." },
  { id: "remittance", label: "Remittance", patterns: ["remittances?"], def: "Money a worker sends home to family, usually across a border." },
  { id: "corridor", label: "Corridor", patterns: ["corridors?"], def: "One specific route money takes between two countries, for example from the Gulf to the Philippines." },
  { id: "on-ramp", label: "On-ramp", patterns: ["on-ramps?"], def: "The step where a customer turns ordinary money into crypto." },
  { id: "reconciliation", label: "Reconciliation", patterns: ["reconciliation"], def: "Checking that two records of the same money, such as usage, invoices and payments, agree, and fixing the gaps." },
  { id: "credit-note", label: "Credit note", patterns: ["credit notes?"], def: "A document that corrects an issued invoice by reducing or cancelling it, instead of editing the original." },
  { id: "lineage", label: "Data lineage", patterns: ["lineage"], def: "A record of where a piece of data came from and what else depends on it." },
  { id: "backtest", label: "Backtest", patterns: ["backtest(?:s|ed)?"], def: "Running a rule on past data to see how it would have performed, before using it for real." },
];

export type GlossarySegment = string | { id: string; text: string };

const COMPILED = GLOSSARY.map((entry) => ({
  entry,
  // Unicode-aware word boundaries: letters, digits and hyphen all count as "inside a word".
  re: new RegExp(`(?<![\\p{L}\\p{N}-])(?:${entry.patterns.join("|")})(?![\\p{L}\\p{N}])`, entry.caseSensitive ? "u" : "iu"),
}));

export function glossaryEntry(id: string) {
  return GLOSSARY.find((entry) => entry.id === id);
}

/**
 * Split `text` into plain strings and glossary terms. Only the FIRST occurrence of each
 * term per page is marked: `seen` is shared across every call for one page and is updated here.
 */
export function annotateText(text: string, seen: Set<string>): GlossarySegment[] {
  type Hit = { id: string; start: number; end: number };
  const hits: Hit[] = [];
  for (const { entry, re } of COMPILED) {
    if (seen.has(entry.id)) continue;
    const match = re.exec(text);
    if (match) hits.push({ id: entry.id, start: match.index, end: match.index + match[0].length });
  }
  hits.sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start));
  const kept: Hit[] = [];
  for (const hit of hits) {
    const last = kept[kept.length - 1];
    if (last && hit.start < last.end) continue; // overlapping: the earlier/longer one wins, the other stays unseen for later text
    kept.push(hit);
  }
  if (kept.length === 0) return [text];
  const out: GlossarySegment[] = [];
  let cursor = 0;
  for (const hit of kept) {
    if (hit.start > cursor) out.push(text.slice(cursor, hit.start));
    out.push({ id: hit.id, text: text.slice(hit.start, hit.end) });
    seen.add(hit.id);
    cursor = hit.end;
  }
  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
}

/** Flatten segments back to the original text (used by tests and by plain-text consumers). */
export function segmentsText(segments: readonly GlossarySegment[]) {
  return segments.map((s) => (typeof s === "string" ? s : s.text)).join("");
}
