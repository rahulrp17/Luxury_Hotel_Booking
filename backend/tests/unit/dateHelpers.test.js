/**
 * Unit tests for src/utils/dateHelpers.js — pure date utility functions.
 */
const {
  getNights,
  getDateRange,
  isWeekend,
  isPastDate,
  toDateString,
  startOfDay,
  endOfDay,
  addHours,
  isCancellationAllowed,
} = require("../../src/utils/dateHelpers");

describe("getNights", () => {
  test("calculates whole nights across a range", () => {
    expect(getNights("2026-08-10", "2026-08-12")).toBe(2);
  });

  test("returns 0 for equal dates", () => {
    expect(getNights("2026-08-10", "2026-08-10")).toBe(0);
  });
});

describe("getDateRange", () => {
  test("returns all dates in [start, end) inclusive start, exclusive end", () => {
    const dates = getDateRange("2026-08-10", "2026-08-13");
    expect(dates).toHaveLength(3);
    expect(dates[0].getTime()).toBe(new Date("2026-08-10").getTime());
    expect(dates[0].getMonth()).toBe(7); // August (0-indexed)
  });
});

describe("isWeekend", () => {
  test("saturday is a weekend", () => {
    // 2026-08-08 is a Saturday.
    expect(isWeekend("2026-08-08")).toBe(true);
  });
  test("wednesday is not a weekend", () => {
    // 2026-08-12 is a Wednesday.
    expect(isWeekend("2026-08-12")).toBe(false);
  });
});

describe("isPastDate", () => {
  test("returns false for today", () => {
    // startOfDay(today) is not < startOfDay(today).
    expect(isPastDate(new Date().toISOString())).toBe(false);
  });
  test("identifies a clearly past date", () => {
    expect(isPastDate("2000-01-01")).toBe(true);
  });
  test("returns false for a future date", () => {
    expect(isPastDate("2099-01-01")).toBe(false);
  });
});

describe("toDateString", () => {
  test("formats a Date as YYYY-MM-DD", () => {
    expect(toDateString(new Date("2026-08-07T15:30:00Z"))).toBe("2026-08-07");
  });
});

describe("startOfDay / endOfDay", () => {
  test("startOfDay zeroes the time", () => {
    const today = new Date();
    const sod = startOfDay(today);
    expect(sod.getHours()).toBe(0);
    expect(sod.getMinutes()).toBe(0);
    expect(sod.getSeconds()).toBe(0);
    expect(sod.getMilliseconds()).toBe(0);
  });
  test("endOfDay sets 23:59:59.999", () => {
    const eod = endOfDay("2026-08-07T10:00:00Z");
    expect(eod.getHours()).toBe(23);
    expect(eod.getMinutes()).toBe(59);
    expect(eod.getSeconds()).toBe(59);
    expect(eod.getMilliseconds()).toBe(999);
  });
});

describe("addHours", () => {
  test("adds hours to a date", async () => {
    const base = new Date("2026-08-07T10:00:00Z");
    const result = addHours(base, 3);
    expect(result.getTime()).toBe(base.getTime() + 3 * 60 * 60 * 1000);
  });
});

describe("isCancellationAllowed", () => {
  test("returns true when check-in is well beyond the deadline", () => {
    expect(isCancellationAllowed(new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), 24)).toBe(true);
  });
  test("returns false when check-in is inside the deadline", () => {
    expect(isCancellationAllowed(new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), 24)).toBe(false);
  });
});