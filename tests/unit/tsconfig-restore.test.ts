import { describe, expect, test } from "bun:test";
import { restoredTsconfigText } from "../../scripts/tsconfig-restore.mjs";

const before = `{\n  "compilerOptions": { "strict": true },\n  "include": ["src/**/*.ts"]\n}\n`;
const withStale = (dirs: string[]) =>
  JSON.stringify({ compilerOptions: { strict: true }, include: ["src/**/*.ts", ...dirs.flatMap((d) => [`${d}/types/**/*.ts`, `${d}/dev/types/**/*.ts`])] }, null, 2);
const gone = () => false;

describe("run-isolated-e2e tsconfig restore", () => {
  test("a clean file comes back byte for byte after Next adds this run's entries", () => {
    expect(restoredTsconfigText(before, withStale([".next-e2e-1"]), gone)).toBe(before);
  });
  test("a file already dirty from older runs comes back clean, not dirtier", () => {
    const dirty = withStale([".next-e2e-old1", ".next-e2e-old2"]);
    const out = restoredTsconfigText(dirty, withStale([".next-e2e-old1", ".next-e2e-old2", ".next-e2e-new"]), gone);
    expect(out).not.toBeNull();
    expect(out).not.toContain(".next-e2e-");
    // Idempotent: running the restore again on its own output changes nothing.
    expect(restoredTsconfigText(out!, out!, gone)).toBe(out);
  });
  test("entries for a dir that still exists (a concurrent run) are kept", () => {
    const live = withStale([".next-e2e-live"]);
    expect(restoredTsconfigText(before, live, (d: string) => d === ".next-e2e-live")).toBeNull();
  });
  test("any other edit made mid-run is left alone", () => {
    expect(restoredTsconfigText(before, before.replace("true", "false"), gone)).toBeNull();
  });
});
