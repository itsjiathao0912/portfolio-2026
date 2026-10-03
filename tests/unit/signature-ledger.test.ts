import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import site from "../../content/site.ts";
import {
  barcodeBars,
  buildRailStops,
  buildReceiptLines,
  ledgerTransactions,
  receiptTotals,
} from "../../src/components/signature/ledger/ledger-data.ts";

const siteText = readFileSync(new URL("../../content/site.ts", import.meta.url), "utf8");

describe("ledger lane — sourced numbers only", () => {
  test("every transaction quote appears verbatim in content/site.ts", () => {
    for (const t of ledgerTransactions) expect(siteText.includes(t.quote)).toBe(true);
  });
  test("every amount's digits appear inside its own quote", () => {
    for (const t of ledgerTransactions) {
      const digits = t.amount.replace(/[^0-9]/g, "");
      expect(t.quote.includes(digits)).toBe(true);
    }
  });
  test("ids are unique", () => {
    expect(new Set(ledgerTransactions.map((t) => t.id)).size).toBe(ledgerTransactions.length);
  });
});

describe("receipt + rail derive from site experience", () => {
  test("receipt prints every role, oldest first", () => {
    const lines = buildReceiptLines();
    expect(lines.map((l) => l.id)).toEqual([...site.experience].reverse().map((e) => e.id));
  });
  test("totals are counted, years quoted from profile", () => {
    expect(receiptTotals.companies).toBe(site.experience.length);
    expect(site.profile.intro.includes(receiptTotals.years)).toBe(true);
    expect(receiptTotals.years.length).toBeGreaterThan(0);
  });
  test("rail has a wash + ink per stop", () => {
    for (const s of buildRailStops()) {
      expect(s.wash.length).toBeGreaterThan(0);
      expect(s.ink.startsWith("#")).toBe(true);
    }
  });
  test("barcode is deterministic and bounded", () => {
    const a = barcodeBars("thao");
    expect(a).toEqual(barcodeBars("thao"));
    expect(a.every((w) => w >= 1 && w <= 4)).toBe(true);
  });
});
