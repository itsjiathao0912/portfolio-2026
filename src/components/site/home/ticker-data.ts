// Proof ticker items: a subset of the sourced ledger (each number is checked
// against content/site.ts by tests/unit/signature-ledger.test.ts), plus the
// project card each one scrolls to.
import { ledgerTransactions, type LedgerTransaction } from "@/components/signature/ledger/ledger-data";

const LINK: Record<string, string> = {
  "zalo-ads": "zalo-game-center",
  "reorc-rework": "reorc-data-platform",
  "reorc-speed": "reorc-data-platform",
  "reorc-uat": "reorc-data-platform",
  aabw: "cortex-sentinel",
  "skylab-cloud": "pac",
  "skylab-erp": "cosap",
};

export interface TickerItem extends LedgerTransaction {
  slug: string;
}

export const TICKER_ITEMS: readonly TickerItem[] = ledgerTransactions
  .filter((t) => t.id in LINK)
  .map((t) => ({ ...t, slug: LINK[t.id] }));
