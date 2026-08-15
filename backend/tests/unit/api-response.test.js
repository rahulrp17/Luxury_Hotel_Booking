/**
 * Unit tests for the standardized API response wrapper (src/utils/ApiResponse.js).
 */
const ApiResponse = require("../../src/utils/ApiResponse");

// A minimal Express `res` mock that records the status code and JSON payload.
const makeRes = () => {
  const payload = {};
  const res = {
    statusCode: 200,
    payload,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.payload = body;
      return this;
    },
    send() {
      return this;
    },
  };
  return res;
};

describe("ApiResponse constructor", () => {
  test("marks success for 2xx status codes", () => {
    const r = new ApiResponse(200, "ok", { a: 1 });
    expect(r.success).toBe(true);
    expect(r.statusCode).toBe(200);
    expect(r.message).toBe("ok");
    expect(r.data).toEqual({ a: 1 });
  });

  test("marks success false for 4xx/5xx status codes", () => {
    expect(new ApiResponse(400, "bad").success).toBe(false);
    expect(new ApiResponse(500, "err").success).toBe(false);
  });

  test("omits data key when data is null", () => {
    const r = new ApiResponse(200, "ok");
    expect(r).not.toHaveProperty("data");
  });

  test("omits pagination key when pagination is null", () => {
    const r = new ApiResponse(200, "ok", { a: 1 });
    expect(r).not.toHaveProperty("pagination");
  });

  test("includes pagination key when provided", () => {
    const r = new ApiResponse(200, "ok", { a: 1 }, { page: 1, total: 5 });
    expect(r.pagination).toEqual({ page: 1, total: 5 });
  });

  test("always sets a timestamp", () => {
    const r = new ApiResponse(200, "ok");
    expect(typeof r.timestamp).toBe("string");
    expect(Date.parse(r.timestamp)).not.toBeNaN();
  });

  test("keeps data when explicitly an empty object", () => {
    // data = {} is not null, so it is kept.
    const r = new ApiResponse(201, "created", {});
    expect(r.data).toEqual({});
  });
});

describe("ApiResponse static helpers", () => {
  test("success writes statusCode + envelope", () => {
    const res = makeRes();
    ApiResponse.success(res, "All good", { id: 1 }, 202);
    expect(res.statusCode).toBe(202);
    expect(res.payload.success).toBe(true);
    expect(res.payload.statusCode).toBe(202);
    expect(res.payload.message).toBe("All good");
    expect(res.payload.data).toEqual({ id: 1 });
  });

  test("success uses default message/statusCode", () => {
    const res = makeRes();
    ApiResponse.success(res, undefined, undefined);
    expect(res.statusCode).toBe(200);
    expect(res.payload.message).toBe("Success");
    expect(res.payload).not.toHaveProperty("data");
  });

  test("created returns statusCode 201 with default message", () => {
    const res = makeRes();
    ApiResponse.created(res, "Made", { id: 9 });
    expect(res.statusCode).toBe(201);
    expect(res.payload.statusCode).toBe(201);
    expect(res.payload.message).toBe("Made");
    expect(res.payload.data).toEqual({ id: 9 });
  });

  test("paginated returns statusCode 200 with data and pagination", () => {
    const res = makeRes();
    ApiResponse.paginated(res, "list", [{ a: 1 }], { page: 1, total: 1 });
    expect(res.statusCode).toBe(200);
    expect(res.payload.message).toBe("list");
    expect(res.payload.data).toEqual([{ a: 1 }]);
    expect(res.payload.pagination).toEqual({ page: 1, total: 1 });
  });

  test("paginated default message", () => {
    const res = makeRes();
    ApiResponse.paginated(res, undefined, [], { page: 1, total: 0 });
    expect(res.payload.message).toBe("Data fetched successfully");
  });

  test("noContent sends an empty body with 204", () => {
    const res = makeRes();
    ApiResponse.noContent(res);
    expect(res.statusCode).toBe(204);
  });
});