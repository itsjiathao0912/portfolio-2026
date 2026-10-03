import { describe, expect, test } from "bun:test";
import project from "../../content/projects/guardline";
import { blocks } from "../../src/components/case/guardline";
import { route } from "../../src/components/case/guardline/action-desk";
import { DECOY_DEVICES, RING_ACCOUNTS, RING_DEVICES, linkedCount, verdict } from "../../src/components/case/guardline/ring-unmask";
import { selfCheck } from "../../src/components/case/guardline/verdict-check";

const base = { action: "hold", accounts: 4, novel: false, killSwitch: false } as const;

describe("guardline case study", () => {
  test("every custom block resolves and cites a deck page", () => {
    const custom = project.blocks.filter((b) => b.type === "custom");
    expect(custom.length).toBe(3);
    for (const b of custom) {
      expect(blocks[b.component.split("/")[1]]).toBeTypeOf("function");
      expect(b.source).toMatch(/p\.\d+/);
    }
  });
  test("permission table matches deck p.7", () => {
    expect(route(base).who).toBe("agent");
    expect(route({ ...base, action: "stepup" }).who).toBe("agent");
    expect(route({ ...base, action: "limit" }).who).toBe("bank");
    expect(route({ ...base, accounts: 10 }).who).toBe("agent");
    expect(route({ ...base, accounts: 11 }).who).toBe("person");
    expect(route({ ...base, action: "limit", novel: true }).who).toBe("person");
    expect(route({ ...base, killSwitch: true }).who).toBe("recommend");
  });
  test("ring is 14 accounts and escalates only past 10 (p.4, p.8)", () => {
    expect(RING_DEVICES.reduce((n, d) => n + d.accounts, 0)).toBe(RING_ACCOUNTS);
    expect(verdict("ring", linkedCount(RING_DEVICES, ["dev_a"]))).toBe("watch");
    expect(verdict("ring", linkedCount(RING_DEVICES, ["dev_a", "dev_b"]))).toBe("watch");
    expect(verdict("ring", linkedCount(RING_DEVICES, ["dev_a", "dev_b", "dev_c"]))).toBe("person");
    expect(verdict("decoy", linkedCount(DECOY_DEVICES, ["dev_family"]))).toBe("clear");
    expect(verdict("ring", 0)).toBe("idle");
  });
  test("self-check rejects a record that does not exist (p.5)", () => {
    expect(selfCheck(["dev_2211", "ord_88410", "shop_517"]).ok).toBe(true);
    expect(selfCheck(["dev_2211", "ord_99999"]).missing).toEqual(["ord_99999"]);
  });
  test("outcome numbers are labelled targets on synthetic data, no placement claimed", () => {
    const text = JSON.stringify(project);
    expect(text).toContain("Target, synthetic data");
    expect(text).not.toMatch(/winner|1st place|runner-up/i);
  });
});
