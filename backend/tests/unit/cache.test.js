/**
 * Unit tests for the Redis cache helpers (src/config/redis.js).
 *
 * `tests/jest.setup.js` replaces `ioredis` with `ioredis-mock`, so all commands
 * run against an in-memory store — no real Redis connection is attempted.
 */
const {
  getRedisClient,
  setCache,
  getCache,
  deleteCache,
  deleteCacheByPattern,
} = require("../../src/config/redis");

describe("redis cache helpers", () => {
  beforeEach(async () => {
    // Deterministic starting state: wipe the in-memory store between tests.
    await getRedisClient().flushall();
  });

  test("setCache/getCache round-trip JSON values", async () => {
    const value = { id: 1, name: "Grand Hotel", tags: ["luxury", "5-star"] };
    await setCache("hotel:1", value);
    await expect(getCache("hotel:1")).resolves.toEqual(value);
  });

  test("getCache returns null for a missing key", async () => {
    await expect(getCache("does:not:exist")).resolves.toBeNull();
  });

  test("getCache preserves primitive values and arrays", async () => {
    await setCache("num:1", 42);
    await setCache("arr:1", ["a", "b"]);
    await setCache("str:1", "hello");
    await expect(getCache("num:1")).resolves.toBe(42);
    await expect(getCache("arr:1")).resolves.toEqual(["a", "b"]);
    await expect(getCache("str:1")).resolves.toBe("hello");
  });

  test("zero TTL means the value is not retrievable", async () => {
    await setCache("expiring:1", { ok: true }, 0);
    await expect(getCache("expiring:1")).resolves.toBeNull();
  });

  test("deleteCache removes a key", async () => {
    await setCache("hotel:2", { id: 2 });
    await deleteCache("hotel:2");
    await expect(getCache("hotel:2")).resolves.toBeNull();
  });

  test("deleteCache on a missing key does not throw", async () => {
    await expect(deleteCache("never:set")).resolves.toBeUndefined();
  });

  test("deleteCacheByPattern deletes only matching keys", async () => {
    await setCache("hotel:1:detail", { a: 1 });
    await setCache("hotel:2:detail", { a: 2 });
    await setCache("room:1:detail", { a: 3 });

    await deleteCacheByPattern("hotel:*");

    await expect(getCache("hotel:1:detail")).resolves.toBeNull();
    await expect(getCache("hotel:2:detail")).resolves.toBeNull();
    await expect(getCache("room:1:detail")).resolves.toEqual({ a: 3 });
  });

  test("deleteCacheByPattern with no matches is a no-op", async () => {
    await expect(deleteCacheByPattern("nothing:*")).resolves.toBeUndefined();
  });
});