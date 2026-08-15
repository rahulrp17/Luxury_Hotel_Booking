/**
 * Unit tests for the pagination helpers (src/utils/pagination.js).
 * No DB / HTTP involved.
 */
const {
  parsePagination,
  buildPagination,
  buildSort,
} = require("../../src/utils/pagination");

describe("parsePagination", () => {
  test("defaults to page 1 / limit 12 when absent", () => {
    expect(parsePagination({})).toEqual({ page: 1, limit: 12, skip: 0 });
  });

  test("parses explicit page and computes skip", () => {
    expect(parsePagination({ page: "3", limit: "5" })).toEqual({
      page: 3,
      limit: 5,
      skip: 10,
    });
  });

  test("clamps page to >= 1", () => {
    expect(parsePagination({ page: "0" })).toEqual({ page: 1, limit: 12, skip: 0 });
    expect(parsePagination({ page: "-4" })).toEqual({ page: 1, limit: 12, skip: 0 });
  });

  test("clamps limit into [1, 100]", () => {
    // "0" should clamp to 1 (not silently fall back to the default 12); the
    // parseInt is guarded with Number.isNaN so 0 is treated as a real number.
    expect(parsePagination({ limit: "0" })).toEqual({ page: 1, limit: 1, skip: 0 });
    expect(parsePagination({ limit: "-4" })).toEqual({ page: 1, limit: 1, skip: 0 });
    expect(parsePagination({ limit: "200" })).toEqual({ page: 1, limit: 100, skip: 0 });
    expect(parsePagination({ limit: "500", page: "2" })).toEqual({
      page: 2,
      limit: 100,
      skip: 100,
    });
  });

  test("falls back to defaults on non-numeric input", () => {
    expect(parsePagination({ page: "abc", limit: "xyz" })).toEqual({
      page: 1,
      limit: 12,
      skip: 0,
    });
  });
});

describe("buildPagination", () => {
  test("computes totalPages and page flags", () => {
    const p = buildPagination(1, 10, 25);
    expect(p).toMatchObject({
      page: 1,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasNextPage: true,
      hasPrevPage: false,
    });
  });

  test("clamps a page beyond the last page to the final page", () => {
    const p = buildPagination(99, 10, 25);
    expect(p.page).toBe(3);
    expect(p.hasNextPage).toBe(false);
    expect(p.hasPrevPage).toBe(true);
  });

  test("middle page has next and previous", () => {
    const p = buildPagination(2, 10, 25);
    expect(p.hasNextPage).toBe(true);
    expect(p.hasPrevPage).toBe(true);
  });

  test("empty total yields zero totalPages and no next page (no NaN)", () => {
    const p = buildPagination(1, 10, 0);
    expect(Number.isNaN(p.totalPages)).toBe(false);
    expect(p.totalPages).toBe(0);
    expect(p.page).toBe(1);
    expect(p.hasNextPage).toBe(false);
    expect(p.hasPrevPage).toBe(false);
  });

  test("limit=0 does not produce NaN totalPages", () => {
    const p = buildPagination(1, 0, 10);
    expect(Number.isNaN(p.totalPages)).toBe(false);
    expect(p.totalPages).toBe(10);
    expect(p.limit).toBe(1);
  });
});

describe("buildSort", () => {
  const defaultSort = { createdAt: -1 };

  test("returns default sort when sortQuery is falsy", () => {
    expect(buildSort(undefined)).toEqual(defaultSort);
    expect(buildSort("")).toEqual(defaultSort);
    expect(buildSort(null)).toEqual(defaultSort);
  });

  test("parses an ascending field", () => {
    expect(buildSort("price")).toEqual({ price: 1 });
  });

  test("parses a descending field with a leading dash", () => {
    expect(buildSort("-price")).toEqual({ price: -1 });
  });

  test("parses multiple comma-separated fields", () => {
    expect(buildSort("price,-rating")).toEqual({ price: 1, rating: -1 });
  });

  test("filters fields against the allowedFields allowlist", () => {
    expect(buildSort("price,secret", ["price"])).toEqual({ price: 1 });
    expect(buildSort("-secret", ["price"])).toEqual(defaultSort);
  });

  test("returns default sort when every field is filtered out", () => {
    expect(buildSort("secret,-other", ["price"])).toEqual(defaultSort);
  });

  test("returns default sort when no allowed fields match and allowlist empty", () => {
    // With an empty allowlist every field is allowed.
    expect(buildSort("price", [])).toEqual({ price: 1 });
  });

  test("uses a custom default sort when provided", () => {
    const custom = { name: 1 };
    expect(buildSort(undefined, ["price"], custom)).toEqual(custom);
  });
});