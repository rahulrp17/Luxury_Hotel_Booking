/**
 * SECURITY / abuse-handling API integration tests (all under /api/v1).
 *
 * Covers: NoSQL injection, XSS payloads, malformed payloads, rate limiting
 * (self-instantiated limiter — the app's real limiters skip under NODE_ENV=test),
 * malformed ObjectIds, unauthorized (no token), forbidden (role), deactivated
 * accounts, and expired/invalid tokens.
 *
 * If any of these reveal a real bug in src/, this suite does NOT patch src/ —
 * the finding is reported instead.
 */
const express = require("express");
const rateLimit = require("express-rate-limit");
const User = require("../../src/modules/users/user.model");

const { bootApp, resetDB, closeDB, agent } = require("../helpers/app");
const {
  createUser,
  createAdmin,
  authHeaders,
  uniq,
  TEST_PASSWORD,
} = require("../helpers/factories");

// A valid 24-char hex ObjectId that will never exist in the test DB.
const MISSING_OBJECT_ID = "5f7c8a9b1c2d3e4f50617263";
// A short, non-ObjectId string (also matches the "invalid" route param case).
const INVALID_ID = "abc";

describe("Security & abuse handling", () => {
  beforeAll(async () => {
    await bootApp({ dbName: "lux_hotel_security" });
  });

  beforeEach(async () => {
    await resetDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  // ─── 1. NoSQL injection ────────────────────────────────────────────────────
  describe("NoSQL injection", () => {
    it("GET /hotels with $gt operator in limit → clean 4xx (not 500)", async () => {
      const res = await agent().get("/api/v1/hotels?limit[$gt]=5");
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
      expect(res.body.success).toBe(false);
    });

    it("GET /hotels with $ne operator in category → clean 4xx (not 500)", async () => {
      const res = await agent().get("/api/v1/hotels?category[$ne]=LUXURY");
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
      expect(res.body.success).toBe(false);
    });

    it("GET /hotels with $where/$regex-style operators is neutralized (not 500)", async () => {
      const res = await agent().get("/api/v1/hotels?destination[$regex]=x&limit[$gt]=5");
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
      expect(res.body.success).toBe(false);
    });

    it("POST /auth/login with email object {$gt:''} → validation/0-DB error (not 500)", async () => {
      const res = await agent()
        .post("/api/v1/auth/login")
        .set("Content-Type", "application/json")
        .send({ email: { $gt: "" }, password: "whatever" });
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── 2. XSS payloads ───────────────────────────────────────────────────────
  describe("XSS payloads", () => {
    it("register with <script> name is neutralized (not stored raw)", async () => {
      const res = await agent()
        .post("/api/v1/auth/register")
        .send({
          name: "John <script>alert(1)</script> Doe",
          email: uniq("xss") + "@test.dev",
          phone: "+91 98765 43210",
          password: TEST_PASSWORD,
        });
      // 201 (sanitized + persisted) or a 4xx rejection — anything but a 500.
      expect(res.status).toBeGreaterThanOrEqual(200);
      expect(res.status).toBeLessThan(500);

      if (res.status === 201) {
        const user = res.body.data;
        expect(user).toBeDefined();
        // xss-clean HTML-entity-encodes angle brackets, so the raw `<script>`
        // tag must NOT be stored/returned verbatim (a browser could execute it).
        expect(user.name).not.toContain("<script");
        expect(user.name).not.toContain("</script");
        expect(user.name).not.toContain("<");
        expect(user.name).toContain("&lt;"); // transformed → neutralized

        // The persisted profile must not reflect a raw script tag either.
        // Register creates an unverified account; verify it in the DB so the
        // protected /me call passes the (mandatory) email-verification gate.
        await User.updateOne({ _id: user._id }, { $set: { isEmailVerified: true } });
        const me = await agent()
          .get("/api/v1/auth/me")
          .set(authHeaders(user));
        expect(me.status).toBe(200);
        expect(me.body.data.name).not.toContain("<script");
        expect(me.body.data.name).not.toContain("</script");
      }
    });

    it("register with event-handler XSS (onerror) is neutralized", async () => {
      const res = await agent()
        .post("/api/v1/auth/register")
        .send({
          name: "Bobby <img src=x onerror=alert(2)> Tables",
          email: uniq("xss2") + "@test.dev",
          phone: "+91 98765 43210",
          password: TEST_PASSWORD,
        });
      expect(res.status).toBeGreaterThanOrEqual(200);
      expect(res.status).toBeLessThan(500);
      if (res.status === 201) {
        const name = res.body.data.name;
        // The `<img>` open tag must be neutralized so the onerror handler cannot
        // attach to a real parsed element.
        expect(name).not.toContain("<img");
        expect(name).toContain("&lt;");
      }
    });
  });

  // ─── 3. Malformed payloads ─────────────────────────────────────────────────
  describe("Malformed payloads", () => {
    it("unparseable JSON body → 400 Invalid JSON", async () => {
      const res = await agent()
        .post("/api/v1/auth/register")
        .type("json")
        .send('{"name": "broken');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Invalid JSON");
    });
  });

  // ─── 4. Rate limiting (own instance) ───────────────────────────────────────
  describe("Rate limiting", () => {
    it("self-instantiated limiter trips on the 4th request with 429 envelope", async () => {
      const rlApp = express();
      const limiter = rateLimit({
        windowMs: 60 * 1000,
        max: 3,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) =>
          res.status(429).json({
            success: false,
            statusCode: 429,
            message: "Too many requests. Please try again later.",
            timestamp: new Date().toISOString(),
          }),
      });
      rlApp.get("/ping", limiter, (req, res) =>
        res.status(200).json({ success: true })
      );

      const request = require("supertest");

      const first = await request(rlApp).get("/ping");
      const second = await request(rlApp).get("/ping");
      const third = await request(rlApp).get("/ping");
      const fourth = await request(rlApp).get("/ping");

      expect(first.status).toBe(200);
      expect(second.status).toBe(200);
      expect(third.status).toBe(200);
      expect(fourth.status).toBe(429);
      expect(fourth.body.success).toBe(false);
      expect(fourth.body.statusCode).toBe(429);
    });
  });

  // ─── 5. Malformed / invalid ObjectId ───────────────────────────────────────
  describe("Malformed / invalid ObjectId", () => {
    it("GET /hotels/:id with valid-but-missing 24-char hex → 404", async () => {
      const res = await agent().get(`/api/v1/hotels/${MISSING_OBJECT_ID}`);
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("GET /rooms/:id with non-ObjectId → 400 CastError", async () => {
      const res = await agent().get(`/api/v1/rooms/${INVALID_ID}`);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Invalid");
    });

    it("GET /amenities/:id with non-ObjectId → 400 CastError", async () => {
      const res = await agent().get(`/api/v1/amenities/${INVALID_ID}`);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Invalid");
    });

    it("GET /hotels/:id with non-ObjectId is treated as a slug (404), never 500", async () => {
      // hotel.service.getHotelById treats non-24-hex identifiers as slugs, so
      // /hotels/abc is a valid slug lookup that misses → 404. (Not a CastError.)
      const res = await agent().get(`/api/v1/hotels/${INVALID_ID}`);
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── 6. Unauthorized (no token) ───────────────────────────────────────────
  describe("Unauthorized (no token)", () => {
    const protectedEndpoints = [
      ["GET", "/api/v1/users/profile"],
      ["GET", "/api/v1/auth/me"],
      ["POST", "/api/v1/bookings"],
      ["POST", "/api/v1/payments/create-order"],
      ["GET", "/api/v1/notifications"],
    ];

    it.each(protectedEndpoints)("%s %s → 401", async (method, url) => {
      const res = await agent()[method.toLowerCase()](url).send({});
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── 7. Forbidden (role) ──────────────────────────────────────────────────
  describe("Forbidden (USER hitting admin-only)", () => {
    it("USER hitting admin-only endpoints → 403", async () => {
      const user = await createUser();
      const headers = authHeaders(user);

      const adminEndpoints = [
        ["POST", "/api/v1/hotels", { name: "x" }],
        ["GET", "/api/v1/users/admin/all", {}],
        ["POST", "/api/v1/amenities", { name: "x" }],
        ["GET", "/api/v1/bookings/admin/all", {}],
        ["GET", "/api/v1/analytics/overview", {}],
        ["GET", "/api/v1/offers/admin/all", {}],
      ];

      for (const [method, url, body] of adminEndpoints) {
        const res = await agent()[method.toLowerCase()](url).set(headers).send(body);
        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
      }
    });

    it("ADMIN is allowed on an admin-only endpoint (sanity check)", async () => {
      const admin = await createAdmin();
      const res = await agent()
        .get("/api/v1/users/admin/all")
        .set(authHeaders(admin));
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ─── 8. Deactivated account ───────────────────────────────────────────────
  describe("Deactivated account", () => {
    it("token of a deactivated user → 403 on protected endpoint", async () => {
      const user = await createUser({ isActive: false });
      const res = await agent()
        .get("/api/v1/users/profile")
        .set(authHeaders(user));
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/deactivated/i);
    });
  });

  // ─── 9. Expired / invalid token ───────────────────────────────────────────
  describe("Expired / invalid token", () => {
    it("garbage Authorization header → 401", async () => {
      const res = await agent()
        .get("/api/v1/auth/me")
        .set({ Authorization: "Bearer not.a.token" });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("tampered token (valid shape, bad signature) → 401", async () => {
      // Header.payload.payload where the signature is garbage.
      const tampered =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRhbXBlcmVkIn0.bad_signature";
      const res = await agent()
        .get("/api/v1/users/profile")
        .set({ Authorization: `Bearer ${tampered}` });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
