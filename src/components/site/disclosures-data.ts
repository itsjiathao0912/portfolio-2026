// The five labels used across the site, each with one real example already
// published in content/. Wording is a DRAFT for Thao to approve.

export type Disclosure = { id: string; label: string; meaning: string; example: string };

export const DISCLOSURES: readonly Disclosure[] = [
  {
    id: "company",
    label: "Company-published figure",
    meaning: "A number the employer or product published. It is the team's result, not something I measured alone.",
    example: "COSAP: purchase-order errors fell 83% a month at a manufacturing client.",
  },
  {
    id: "backtest",
    label: "Backtest on sample data",
    meaning: "Run on sample data, not on live production traffic.",
    example: "Cortex Sentinel: 6.5% of alerts auto-closed in the backtest.",
  },
  {
    id: "cv",
    label: "CV-reported",
    meaning: "From my own CV. I can talk through it, but there is no public source to link.",
    example: "Carousell: revenue up 12% through in-app communication.",
  },
  {
    id: "illustrative",
    label: "Illustrative",
    meaning: "A concept screen or example I drew to explain an idea. It is not a shipped product.",
    example: "GoCrypto: the concept screens, including the peso amounts.",
  },
  {
    id: "roadmap",
    label: "Roadmap goal",
    meaning: "Where a product is heading. Never counted as a result.",
    example: "Ledgr: 27 rules are seeded today. 100+ is the roadmap.",
  },
] as const;

export const DISCLOSURES_FOOTNOTE = "Client names are withheld. Diagrams are redrawn, not copied from decks.";
