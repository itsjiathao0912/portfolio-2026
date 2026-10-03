import { describe, expect, test } from "bun:test";
import { countryName, greetingFor, readGeo, sanitizeCity, sanitizeCountry } from "../../src/lib/geo";

const req = (headers: Record<string, string> = {}) => new Request("http://localhost/api/geo", { headers });

describe("sanitizeCountry", () => {
  test("accepts real codes, nulls everything else", () => {
    expect(sanitizeCountry("VN")).toBe("VN");
    for (const bad of ["XX", "T1", "ZZ", "EU", "UN", "QO", "AA", "QU", "vn", "VNM", "V", "", null, undefined, 5]) {
      expect(sanitizeCountry(bad)).toBeNull();
    }
  });
});

describe("sanitizeCity", () => {
  test("trims, strips control chars, rejects garbage", () => {
    expect(sanitizeCity("  Hanoi ")).toBe("Hanoi");
    expect(sanitizeCity("Ha\u0000no\ni‮")).toBe("Hanoi");
    expect(sanitizeCity("x".repeat(10_240))).toBeNull();
    expect(sanitizeCity("")).toBeNull();
    expect(sanitizeCity("\u0007")).toBeNull();
    expect(sanitizeCity(null)).toBeNull();
  });
});

describe("greetingFor", () => {
  test("city, then country name, then stranger; never a raw code", () => {
    expect(greetingFor({ country: "VN", city: "Hanoi" })).toBe("Hey Hanoi");
    expect(greetingFor({ country: "VN", city: null })).toBe("Hey Vietnam");
    expect(greetingFor({ country: null, city: null })).toBe("Hey stranger");
    expect(greetingFor(null)).toBe("Hey stranger");
    // A code ICU cannot name degrades to stranger (Q1 is not a region).
    expect(countryName("QX") === null ? greetingFor({ country: "QX", city: null }) : "Hey stranger").toBe("Hey stranger");
  });
});

describe("readGeo", () => {
  test("null cf never throws and gives nulls", () => {
    expect(readGeo(req(), {}, "cloudflare")).toEqual({ country: null, city: null });
  });

  test("seam is honoured only with E2E env AND local db", () => {
    const h = { "x-e2e-geo": "VN|Hanoi" };
    expect(readGeo(req(h), { PORTFOLIO_E2E: "1" }, "local")).toEqual({ country: "VN", city: "Hanoi" });
    expect(readGeo(req(h), {}, "local")).toEqual({ country: null, city: null });
    expect(readGeo(req(h), { PORTFOLIO_E2E: "1" }, "cloudflare")).toEqual({ country: null, city: null });
    expect(readGeo(req(h), { PORTFOLIO_E2E: "0" }, "local")).toEqual({ country: null, city: null });
  });

  test("seam values are sanitised like real ones", () => {
    const e = { PORTFOLIO_E2E: "1" };
    expect(readGeo(req({ "x-e2e-geo": "XX|" }), e, "local")).toEqual({ country: null, city: null });
    expect(readGeo(req({ "x-e2e-geo": "vn|Hanoi" }), e, "local")).toEqual({ country: null, city: "Hanoi" });
    expect(readGeo(req({ "x-e2e-geo": "VN" }), e, "local")).toEqual({ country: "VN", city: null });
    expect(readGeo(req({ "x-e2e-geo": `VN|${"y".repeat(5000)}` }), e, "local").city).toBeNull();
  });
});
