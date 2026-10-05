import { describe, expect, test } from "bun:test";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ClayAvatar } from "../../src/components/clay/clay-avatar";
import { ClayDefsProvider } from "../../src/components/clay/clay-defs";

const count = (html: string) => ({ nodes: (html.match(/<[a-zA-Z]/g) ?? []).length, grads: (html.match(/<(radial|linear)Gradient/g) ?? []).length });
const fig = (view: "bust" | "full") => h(ClayAvatar, { role: "data" as never, size: 100, view });

describe("clay shared defs", () => {
  for (const view of ["bust", "full"] as const) {
    test(`${view}: shared host removes per-figure gradients, keeps viewBox`, () => {
      const solo = count(renderToStaticMarkup(fig(view)));
      const html = renderToStaticMarkup(h(ClayDefsProvider, null, fig(view)));
      const figure = html.slice(html.indexOf("</svg>") + 6);
      const shared = count(figure);
      console.log(view, { before: solo, after: shared });
      expect(shared.grads).toBe(0);
      expect(shared.nodes).toBeLessThan(solo.nodes);
      if (view === "full") expect(figure).toContain('viewBox="0 -14.4 100 150"');
    });
  }
});
