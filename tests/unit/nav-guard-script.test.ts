import { describe, expect, test } from "bun:test";
import { NAV_GUARD_SCRIPT, NAV_WATCHDOG_MS } from "../../src/lib/nav-watchdog";

// Runs the inline script against a tiny fake window/location.
function run(clickHref: string, opts: { arrive?: boolean; button?: number } = {}) {
  let listener: ((e: unknown) => void) | null = null;
  const timers: Array<() => void> = [];
  const assigned: string[] = [];
  const location = { href: "https://x.test/", origin: "https://x.test", pathname: "/", assign: (u: string) => assigned.push(u) };
  const win = { addEventListener: (_: string, fn: (e: unknown) => void) => (listener = fn) } as Record<string, unknown>;
  new Function("window", "location", "setTimeout", "clearTimeout", "URL", NAV_GUARD_SCRIPT)(
    win, location, (fn: () => void, ms: number) => { expect(ms).toBe(NAV_WATCHDOG_MS); timers.push(fn); return timers.length; }, () => {}, URL,
  );
  const a = { href: new URL(clickHref, location.href).href, target: "", hasAttribute: () => false };
  listener!({ button: opts.button ?? 0, target: { closest: () => a } });
  if (opts.arrive) location.pathname = new URL(a.href).pathname;
  timers.forEach((f) => f());
  return assigned;
}

describe("inline nav guard", () => {
  test("stuck internal nav → hard navigation", () => expect(run("/work")).toEqual(["https://x.test/work"]));
  test("arrived nav → nothing", () => expect(run("/work", { arrive: true })).toEqual([]));
  test("same page / external / middle click → not armed", () => {
    expect(run("/#x")).toEqual([]);
    expect(run("https://other.test/work")).toEqual([]);
    expect(run("/work", { button: 1 })).toEqual([]);
  });
});
