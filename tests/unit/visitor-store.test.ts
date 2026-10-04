import { describe, expect, test } from "bun:test";
import { initialVisitor, retryDelaySeconds, shouldSendVisit } from "../../src/components/site/visitor/store";
import { getVisitorRole, parseVisitorRole } from "../../src/lib/visitor-role-adapter";

const ID = "abcdef12-3456";
const gen = () => "generated-id-0001";
const store = (o: Record<string, unknown>) => JSON.stringify({ v: 1, role: null, collapsed: false, visitorId: ID, ordinal: null, ...o });

describe("initial visitor state", () => {
  test("no store, no legacy: a fresh unchosen visitor sees the panel", () => {
    const r = initialVisitor(null, null, gen);
    expect(r.state).toEqual({ v: 1, role: null, collapsed: false, visitorId: "generated-id-0001", ordinal: null, visitConfirmed: false });
    expect(r.chosen).toBe(false);
    expect(r.migrated).toBe(false);
  });
  test("legacy persona (a JSON-encoded string) migrates once for the three original roles", () => {
    for (const p of ["recruiter", "founder", "engineer"]) {
      const r = initialVisitor(null, JSON.stringify(p), gen);
      expect(r.state.role).toBe(p as never);
      expect(r.state.collapsed).toBe(true);
      expect(r.chosen).toBe(true);
      expect(r.migrated).toBe(true);
    }
  });
  test("legacy values that are not recruiter/founder/engineer are ignored", () => {
    for (const raw of [JSON.stringify("curious"), JSON.stringify("nope"), "not json", "founder", "null"]) {
      const r = initialVisitor(null, raw, gen);
      expect(r.state.role).toBeNull();
      expect(r.migrated).toBe(false);
    }
  });
  test("a valid store wins and the legacy key is never read again", () => {
    const r = initialVisitor(store({ role: "designer", collapsed: true, ordinal: 12 }), JSON.stringify("founder"), gen);
    expect(r.state.role).toBe("designer");
    expect(r.state.ordinal).toBe(12);
    expect(r.state.visitorId).toBe(ID);
    expect(r.migrated).toBe(false);
    expect(r.chosen).toBe(true);
  });
  test("an old Skip (collapsed, no role) is not a choice: the picker shows again", () => {
    const r = initialVisitor(store({ collapsed: true }), null, gen);
    expect(r.chosen).toBe(false);
    expect(r.state.role).toBeNull();
    expect(r.state.collapsed).toBe(false);
  });
  test("a stored guideHidden is ignored", () => {
    const r = initialVisitor(store({ role: "founder", collapsed: true, guideHidden: true }), null, gen);
    expect("guideHidden" in r.state).toBe(false);
  });
  test("bad pieces fall back safely: unknown role, wrong id, bad ordinal, wrong version, corrupt json", () => {
    const r = initialVisitor(store({ role: "wizard", visitorId: "bad id!", ordinal: -3 }), null, gen);
    expect(r.state.role).toBeNull();
    expect(r.state.visitorId).toBe("generated-id-0001");
    expect(r.state.ordinal).toBeNull();
    expect(initialVisitor(JSON.stringify({ v: 2, role: "founder" }), null, gen).state.role).toBeNull();
    expect(initialVisitor("{oops", null, gen).state.role).toBeNull();
  });
});

describe("visit policy", () => {
  test("sends on the first choice and on a real change, never for an unchanged role", () => {
    expect(shouldSendVisit(undefined, "founder")).toBe(true);
    expect(shouldSendVisit(undefined, null)).toBe(true);
    expect(shouldSendVisit("founder", "founder")).toBe(false);
    expect(shouldSendVisit("founder", "engineer")).toBe(true);
    expect(shouldSendVisit(null, null)).toBe(false);
    expect(shouldSendVisit("founder", null)).toBe(true);
  });
  test("429 waits Retry-After seconds, clamped to 1..30, default 3", () => {
    expect(retryDelaySeconds("5")).toBe(5);
    expect(retryDelaySeconds("0")).toBe(1);
    expect(retryDelaySeconds("600")).toBe(30);
    expect(retryDelaySeconds("1.2")).toBe(2);
    expect(retryDelaySeconds(null)).toBe(3);
    expect(retryDelaySeconds("soon")).toBe(3);
  });
});

describe("role adapter agrees with the store", () => {
  test("the store key is what the adapter reads, so other sections see the same role", () => {
    expect(parseVisitorRole(store({ role: "founder", collapsed: true }), null)).toBe("founder");
    expect(parseVisitorRole(null, JSON.stringify("engineer"))).toBe("engineer");
    expect(getVisitorRole()).toBeNull();
  });
});

describe("visit confirmation", () => {
  test("a stored role without the flag is unconfirmed; the flag round-trips", () => {
    expect(initialVisitor(store({ role: "founder", collapsed: true }), null).state.visitConfirmed).toBe(false);
    expect(initialVisitor(store({ role: "founder", collapsed: true, visitConfirmed: true }), null).state.visitConfirmed).toBe(true);
    expect(initialVisitor(store({ visitConfirmed: "yes" }), null).state.visitConfirmed).toBe(false);
  });
  test("a migrated legacy persona is unconfirmed (it was never counted)", () => {
    const r = initialVisitor(null, JSON.stringify("founder"));
    expect([r.chosen, r.state.visitConfirmed]).toEqual([true, false]);
  });
});
