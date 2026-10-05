import { describe, expect, test } from "bun:test";
import { capTop, drawnEdge, firstLine, rendered } from "../../src/components/site/visitor/guide/guide-dom";

const cs = (o: Partial<Record<string, string>>) =>
  ({ display: "block", visibility: "visible", opacity: "1", backgroundColor: "rgba(0, 0, 0, 0)", backgroundImage: "none", borderTopWidth: "0px", borderTopStyle: "none", borderTopColor: "rgb(0, 0, 0)", boxShadow: "none", outlineWidth: "0px", outlineStyle: "none", outlineColor: "rgb(0, 0, 0)", ...o }) as unknown as CSSStyleDeclaration;
const el = (visible = true) => ({ checkVisibility: () => visible }) as unknown as Element;

describe("visibility: only rendered boxes are analysed", () => {
  test("display none, visibility hidden, opacity ~0 and a hidden ancestor are skipped", () => {
    expect(rendered(el(), cs({}))).toBe(true);
    expect(rendered(el(), cs({ display: "none" }))).toBe(false);
    expect(rendered(el(), cs({ visibility: "hidden" }))).toBe(false);
    expect(rendered(el(), cs({ opacity: "0" }))).toBe(false);
    expect(rendered(el(), cs({ opacity: "0.04" }))).toBe(false);
    // checkVisibility covers an ancestor with opacity 0 / visibility hidden / content-visibility.
    expect(rendered(el(false), cs({}))).toBe(false);
    // Older engines without checkVisibility fall back to the element's own style.
    expect(rendered({} as Element, cs({}))).toBe(true);
  });
  test("a box needs a visibly drawn edge, blended against what is behind it", () => {
    expect(drawnEdge("DIV", cs({}))).toBe(false); // transparent wrapper
    expect(drawnEdge("DIV", cs({ backgroundColor: "rgba(20, 20, 20, 0.5)" }), "rgb(255, 255, 255)")).toBe(true);
    expect(drawnEdge("DIV", cs({ backgroundColor: "rgba(20, 20, 20, 0.03)" }), "rgb(255, 255, 255)")).toBe(false);
    expect(drawnEdge("DIV", cs({ backgroundColor: "rgb(30, 30, 30)" }), "rgb(30, 30, 30)")).toBe(false); // same as backdrop
    expect(drawnEdge("DIV", cs({ boxShadow: "rgba(0, 0, 0, 0.04) 0px 1px 2px 0px" }))).toBe(false); // whisper shadow
    expect(drawnEdge("DIV", cs({ outlineWidth: "1px", outlineStyle: "solid", outlineColor: "rgb(120, 120, 120)" }), "rgb(255, 255, 255)")).toBe(true);
    for (const tag of ["IMG", "svg", "VIDEO", "CANVAS", "HR"]) expect(drawnEdge(tag, cs({}))).toBe(true);
  });
});

describe("text surfaces: the feet land on the letters", () => {
  test("cap top sits inside the line box, below its top, above its middle", () => {
    // Inter 16 px: content box ~19.4 px; caps rise ~11.6 px above a baseline ~15.5 px down.
    const t = capTop(100, 19.4, 16);
    expect(t).toBeGreaterThan(102);
    expect(t).toBeLessThan(105);
    // Never above the line box nor below its middle, whatever the font metrics.
    expect(capTop(100, 10, 40)).toBe(100);
    expect(capTop(100, 40, 4)).toBe(120);
  });
  test("first line = the rects sharing the first top, unioned; later lines and slivers ignored", () => {
    const r = (left: number, top: number, w: number, h = 20) => ({ left, right: left + w, top, width: w, height: h });
    expect(firstLine([r(10, 100, 0.5), r(20, 100, 50), r(70, 101, 40), r(10, 124, 200)])).toEqual({ left: 20, right: 110, top: 100, height: 20 });
    expect(firstLine([])).toBeNull();
    expect(firstLine([r(0, 0, 50, 2)])).toBeNull();
  });
});
