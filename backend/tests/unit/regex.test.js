/**
 * Unit tests for the regex-escaping helper (src/utils/regex.js).
 */
const { escapeRegex } = require("../../src/utils/regex");

describe("escapeRegex", () => {
  test("escapes every regex metacharacter", () => {
    expect(escapeRegex(".*+?^${}()|[]\\")).toBe("\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\");
  });

  test("escapes dot, star, plus, and question mark", () => {
    expect(escapeRegex(".*+?")).toBe("\\.\\*\\+\\?");
  });

  test("escapes caret, dollar, braces, and parens", () => {
    expect(escapeRegex("^${}()")).toBe("\\^\\$\\{\\}\\(\\)");
  });

  test("escapes pipe, brackets, and backslash", () => {
    expect(escapeRegex("|[]\\")).toBe("\\|\\[\\]\\\\");
  });

  test("leaves plain alphanumerics untouched", () => {
    expect(escapeRegex("goa123ABC_-")).toBe("goa123ABC_-");
  });

  test("returns empty string for null/undefined", () => {
    expect(escapeRegex(null)).toBe("");
    expect(escapeRegex(undefined)).toBe("");
  });

  test("escaped output can be safely used in a RegExp constructor", () => {
    const user = "goa.telegraph+deluxe";
    const escaped = escapeRegex(user);
    const re = new RegExp(`^${escaped}$`, "i");
    expect(re.test("goa.telegraph+deluxe")).toBe(true);
    // A subtly different string must NOT match (metachars are literal).
    expect(re.test("goaxtelegraphxdeluxe")).toBe(false);
  });

  test("escaped output does not treat dots as wildcards in a match", () => {
    const source = "a.b";
    const re = new RegExp(`^${escapeRegex(source)}$`);
    expect(re.test("a.b")).toBe(true);
    expect(re.test("axb")).toBe(false);
  });
});