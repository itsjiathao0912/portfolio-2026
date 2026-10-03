import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { gzipSync } from "node:zlib";
import { ClayAvatar } from "../../src/components/clay/clay-avatar";
import { ROLE_AVATAR, variantFor } from "../../src/components/clay/avatar-spec";
import { ROLE_COLORS } from "../../src/components/clay/palette";
import { POSE_NAMES, poseFor, WALK_FRAMES } from "../../src/components/clay/poses";
import { ROLE_IDS } from "../../src/components/site/visitor/role-ids";

const render = (props: Record<string, unknown>) => renderToStaticMarkup(createElement(ClayAvatar, { size: 80, ...props } as never));
const FORBIDDEN = /<image|href=|foreignObject|<filter|filter=|https?:\/\//i;
// Gradient ids embed the per-instance useId; strip them so structure can be compared.
const strip = (s: string) => s.replace(/c_?[A-Za-z0-9_]*?[sthbakpgc](?=["')])/g, "ID");

describe("clay avatars", () => {
  test("every role renders in all poses without forbidden tags and <= 6 KB", () => {
    for (const role of ROLE_IDS)
      for (const pose of POSE_NAMES) {
        const s = render({ role, pose });
        expect(s).not.toMatch(FORBIDDEN);
        expect(s.length).toBeLessThanOrEqual(6144);
      }
  });
  test("each role has a distinct signature", () => {
    const sigs = ROLE_IDS.map((r) => strip(render({ role: r, skin: 0, hair: 0, hairStyle: 1, accent: 0 })));
    expect(new Set(sigs).size).toBe(ROLE_IDS.length);
  });
  test("skip renders a neutral chip with no character", () => {
    const s = render({ role: null });
    expect(s).toContain("<circle");
    expect(s).not.toContain("radialGradient");
  });
  test("ids are unique when 12 avatars render together", () => {
    const html = renderToStaticMarkup(createElement("div", null, ...Array.from({ length: 12 }, (_, i) => createElement(ClayAvatar, { key: i, role: ROLE_IDS[i % 11]!, size: 40 }))));
    const ids = [...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]!);
    expect(ids.length).toBeGreaterThan(12);
    expect(new Set(ids).size).toBe(ids.length);
  });
  test("variants are deterministic and varied", () => {
    expect(variantFor("a")).toEqual(variantFor("a"));
    expect(new Set(Array.from({ length: 17 }, (_, i) => JSON.stringify(variantFor(`p${i}`)))).size).toBeGreaterThan(10);
  });
  test("every role has colours and a default look; walk has 4 frames", () => {
    for (const r of ROLE_IDS) {
      expect(ROLE_COLORS[r]).toBeDefined();
      expect(ROLE_AVATAR[r]).toBeDefined();
    }
    expect(WALK_FRAMES.length).toBe(4);
    expect(poseFor("walk", 5)).toEqual(WALK_FRAMES[1]!);
  });
  test("17 bust avatars stay within 30 KB gzipped", () => {
    const html = renderToStaticMarkup(createElement("div", null, ...Array.from({ length: 17 }, (_, i) => createElement(ClayAvatar, { key: i, role: ROLE_IDS[i % 11]!, view: "bust", size: 40, ...variantFor(`s${i}`) }))));
    expect(gzipSync(html).length).toBeLessThanOrEqual(30 * 1024);
  });
});
