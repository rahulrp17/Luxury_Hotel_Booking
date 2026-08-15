/**
 * Unit tests for the custom API error class (src/utils/ApiError.js).
 */
const ApiError = require("../../src/utils/ApiError");

describe("ApiError base constructor", () => {
  test("is an instanceof Error with success=false and errors", () => {
    const err = new ApiError(400, "bad", ["field"]);
    expect(err).toBeInstanceOf(Error);
    expect(err.statusCode).toBe(400);
    expect(err.success).toBe(false);
    expect(err.errors).toEqual(["field"]);
    expect(err.timestamp).toBeDefined();
  });
});

describe("ApiError static factories", () => {
  const cases = [
    { factory: "badRequest", expected: 400, defaultMsg: "Bad request" },
    { factory: "unauthorized", expected: 401, defaultMsg: "Unauthorized access" },
    { factory: "forbidden", expected: 403, defaultMsg: "Access forbidden" },
    { factory: "notFound", expected: 404, defaultMsg: "Resource not found" },
    { factory: "conflict", expected: 409, defaultMsg: "Resource already exists" },
    { factory: "unprocessable", expected: 422, defaultMsg: "Validation failed" },
    {
      factory: "tooManyRequests",
      expected: 429,
      defaultMsg: "Too many requests. Please try again later.",
    },
    { factory: "internal", expected: 500, defaultMsg: "Internal server error" },
    {
      factory: "serviceUnavailable",
      expected: 503,
      defaultMsg: "Service temporarily unavailable",
    },
  ];

  test.each(cases)("$factory sets statusCode $expected", (c) => {
    const err = ApiError[c.factory]();
    expect(err.statusCode).toBe(c.expected);
    expect(err.success).toBe(false);
    expect(err).toBeInstanceOf(Error);
    expect(Array.isArray(err.errors)).toBe(true);
  });

  test.each(cases)("$factory uses a custom message", (c) => {
    const err = ApiError[c.factory]("custom!");
    expect(err.message).toBe("custom!");
  });

  test("badRequest and unprocessable accept a custom errors array", () => {
    expect(ApiError.badRequest("bad", ["x"]).errors).toEqual(["x"]);
    expect(ApiError.unprocessable("nope", ["y"]).errors).toEqual(["y"]);
  });

  test("default errors is an empty array", () => {
    expect(ApiError.badRequest().errors).toEqual([]);
    expect(ApiError.notFound().errors).toEqual([]);
  });
});