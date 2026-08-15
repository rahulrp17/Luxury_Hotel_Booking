/**
 * Unit tests for the bounded/deterministic cache-key helper.
 */
const { queryCacheKey } = require("../../src/middlewares/cache");

describe("queryCacheKey", () => {
  test("is order-independent for the same query object", () => {
    const a = queryCacheKey("hotels:list", { sort: "-price", page: "2", city: "goa", limit: "10" });
    const b = queryCacheKey("hotels:list", { limit: "10", page: "2", city: "goa", sort: "-price" });
    expect(a).toBe(b);
  });

  test("distinguishes different query values", () => {
    const a = queryCacheKey("hotels:list", { city: "goa" });
    const b = queryCacheKey("hotels:list", { city: "delhi" });
    expect(a).not.toBe(b);
  });

  test("hashes oversized query strings to a bounded key", () => {
    const key = queryCacheKey("hotels:list", { q: "x".repeat(1000) });
    expect(key.startsWith("hotels:list:")).toBe(true);
    expect(key.length).toBeLessThan(80);
  });
});