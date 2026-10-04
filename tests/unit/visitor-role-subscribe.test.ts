import { afterEach, describe, expect, test } from "bun:test";
import { VISITOR_CHANGE_EVENT, subscribeVisitorRole } from "../../src/lib/visitor-role-adapter";
import { ROUTE_WAIT_CAP_MS } from "../../src/components/motion/transition-link";

type Listener = (e?: unknown) => void;
const listeners = new Map<string, Set<Listener>>();
const fakeTarget = {
  addEventListener: (type: string, fn: Listener) => void (listeners.get(type) ?? listeners.set(type, new Set()).get(type)!).add(fn),
  removeEventListener: (type: string, fn: Listener) => void listeners.get(type)?.delete(fn),
};
const g = globalThis as Record<string, unknown>;
const had = { window: g.window, document: g.document };
g.window = fakeTarget;
g.document = { ...fakeTarget, visibilityState: "visible" };
const fire = (type: string, e?: unknown) => listeners.get(type)?.forEach((fn) => fn(e));

afterEach(() => listeners.clear());

describe("subscribeVisitorRole", () => {
  test("same-tab event, focus, visibility and role storage keys notify; other keys do not; unsubscribe stops it", () => {
    let calls = 0;
    const off = subscribeVisitorRole(() => (calls += 1));
    fire(VISITOR_CHANGE_EVENT);
    fire("focus");
    fire("visibilitychange");
    fire("storage", { key: "thao:visitor:v1" });
    expect(calls).toBe(4);
    fire("storage", { key: "unrelated" });
    expect(calls).toBe(4);
    off();
    fire(VISITOR_CHANGE_EVENT);
    expect(calls).toBe(4);
  });

  test("the event name is the one the visitor lane must dispatch", () => {
    expect(VISITOR_CHANGE_EVENT).toBe("thao:visitor-change");
  });
});

describe("view transition wait", () => {
  test("is capped at 300 ms so a slow route can never hold the page for the browser's 4 s timeout", () => {
    expect(ROUTE_WAIT_CAP_MS).toBeLessThanOrEqual(300);
  });
});

void had;
