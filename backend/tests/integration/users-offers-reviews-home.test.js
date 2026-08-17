/* eslint-disable no-console */
/**
 * Integration suite for Users + Auth, Offers, Reviews, Home settings + Hero
 * banner, Statistics and Notifications — exercised through the real Express app
 * under /api/v1.
 *
 * Envelope: `{ success, statusCode, message, data?, errors?, timestamp }`.
 * Paginated list endpoints return `data` as an ARRAY plus `pagination`;
 * single-resource GET/POST return `data` as an OBJECT; DELETE routes that return
 * `ApiResponse.success(...)` with no payload omit `data`.
 */
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const { bootApp, resetDB, closeDB, agent } = require("../helpers/app");
const {
  TEST_PASSWORD,
  PASSWORD_HASH_SEED,
  uniq,
  createUser,
  createAdmin,
  authHeaders,
  makeRefreshToken,
  createHotel,
  createRoom,
  createBooking,
  createOffer,
  createReview,
  createHeroBanner,
  createHomeSettings,
  createNotification,
} = require("../helpers/factories");
const { getRedisClient } = require("../../src/config/redis");

const invalidObjectId = () => "not-a-valid-object-id-12345";
const randomObjectId = () => new mongoose.Types.ObjectId().toString();

/** Offer codes are unique-indexed and capped at 20 chars (schema maxlength). */
const offerCode = (prefix) => uniq(prefix).toUpperCase().slice(0, 12);

/** Wipe the (in-memory) response cache so cached GETs never bleed across tests. */
async function flushCache() {
  try {
    await getRedisClient().flushdb();
  } catch (err) {
    /* ignore */
  }
}

/**
 * Build the full data needed to write a review: a user who "stayed" at a hotel
 * with a COMPLETED booking. The review create service requires the booking to be
 * CHECKED_OUT or CONFIRMED, owned by the user and for the same hotel.
 */
async function setupReviewBooking(user, { status = "CONFIRMED" } = {}) {
  const hotel = await createHotel({ name: uniq("Hotel") });
  const room = await createRoom(hotel, { totalUnits: 1 });
  const booking = await createBooking({
    user: user._id,
    hotel: hotel._id,
    room: room._id,
    status,
  });
  return { hotel, room, booking };
}

const reviewFields = (hotel, booking) => ({
  hotel: hotel._id.toString(),
  booking: booking._id.toString(),
  title: "Wonderful stay",
  body: "An absolutely wonderful experience, highly recommended stay for everyone.",
  rating: JSON.stringify({ overall: 5, cleanliness: 5, service: 5, location: 5, value: 4 }),
});

/**
 * POST /reviews. The route mounts `uploadReviewImages.array("images", 5)`, so we
 * must send multipart/form-data (`.field(...)` sets req.files = [] rather than
 * leaving it undefined, which would crash `images.map` in the controller).
 */
const postReview = (user, fields) => {
  let r = agent().post("/api/v1/reviews").set(authHeaders(user));
  Object.entries(fields).forEach(([k, v]) => {
    r = r.field(k, v);
  });
  return r;
};

describe("Users, Offers, Reviews, Home, Stats, Notifications — /api/v1", () => {
  beforeAll(async () => {
    const { booted } = await bootApp({ dbName: "lux_users_offers_reviews_home" });
    expect(booted).toBe(true);
  });

  beforeEach(async () => {
    await resetDB();
    await flushCache();
  });

  afterAll(async () => {
    await closeDB();
  });

  // ─── 1. Auth ───────────────────────────────────────────────────────────────
  describe("POST /auth/register", () => {
    test("201 + user object without password/passwordHash leak", async () => {
      const res = await agent().post("/api/v1/auth/register").send({
        name: "Alice Wonder",
        email: uniq("alice") + "@test.dev",
        phone: "+91 98765 43210",
        password: TEST_PASSWORD,
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBeDefined();
      expect(res.body.data).not.toHaveProperty("password");
      expect(res.body.data).not.toHaveProperty("passwordHash");
    });

    test("409 on duplicate email", async () => {
      const email = uniq("dup") + "@test.dev";
      await agent()
        .post("/api/v1/auth/register")
        .send({ name: "First User", email, password: TEST_PASSWORD });
      const res = await agent()
        .post("/api/v1/auth/register")
        .send({ name: "Second User", email, password: TEST_PASSWORD });
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    test("422 on missing name/email/password", async () => {
      const res = await agent().post("/api/v1/auth/register").send({});
      expect(res.status).toBe(422);
      expect(Array.isArray(res.body.errors)).toBe(true);
    });

    test("422 on weak password", async () => {
      const res = await agent()
        .post("/api/v1/auth/register")
        .send({ name: "Weak Pass", email: uniq("weak") + "@test.dev", password: "short1" });
      expect(res.status).toBe(422);
    });
  });

  describe("POST /auth/login", () => {
    test("200 returns user + accessToken", async () => {
      const user = await createUser();
      const res = await agent().post("/api/v1/auth/login").send({
        email: user.email,
        password: PASSWORD_HASH_SEED,
      });
      expect(res.status).toBe(200);
      expect(res.body.data.user).toBeDefined();
      expect(typeof res.body.data.accessToken).toBe("string");
    });

    test("401 on wrong password", async () => {
      const user = await createUser();
      const res = await agent().post("/api/v1/auth/login").send({
        email: user.email,
        password: "WrongPassword1",
      });
      expect(res.status).toBe(401);
    });

    test("401 on nonexistent email", async () => {
      const res = await agent()
        .post("/api/v1/auth/login")
        .send({ email: uniq("ghost") + "@test.dev", password: TEST_PASSWORD });
      expect(res.status).toBe(401);
    });

    test("403 on deactivated user", async () => {
      const user = await createUser({ isActive: false });
      const res = await agent().post("/api/v1/auth/login").send({
        email: user.email,
        password: PASSWORD_HASH_SEED,
      });
      expect(res.status).toBe(403);
    });
  });

  describe("POST /auth/refresh-token", () => {
    const seedStoredToken = async (user) => {
      const refreshJwt = makeRefreshToken(user._id);
      user.refreshToken = await bcrypt.hash(refreshJwt, 4);
      await user.save({ validateBeforeSave: false });
      return refreshJwt;
    };

    test("200 with fresh accessToken when cookie holds a valid refresh token", async () => {
      const user = await createUser();
      const refreshJwt = await seedStoredToken(user);
      const res = await agent()
        .post("/api/v1/auth/refresh-token")
        .set("Cookie", `refreshToken=${refreshJwt}`);
      expect(res.status).toBe(200);
      expect(typeof res.body.data.accessToken).toBe("string");
    });

    test("401 when no cookie present", async () => {
      const res = await agent().post("/api/v1/auth/refresh-token");
      expect(res.status).toBe(401);
    });

    test("401 on a tampered cookie string", async () => {
      const res = await agent()
        .post("/api/v1/auth/refresh-token")
        .set("Cookie", "refreshToken=this.is.tampered");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /auth/me, POST /auth/logout, PATCH /auth/change-password", () => {
    test("GET /auth/me returns the authenticated user; no token → 401", async () => {
      const user = await createUser();
      const ok = await agent().get("/api/v1/auth/me").set(authHeaders(user));
      expect(ok.status).toBe(200);
      expect(ok.body.data.email).toBe(user.email);

      const anon = await agent().get("/api/v1/auth/me");
      expect(anon.status).toBe(401);
    });

    test("POST /auth/logout returns 200 with no data", async () => {
      const user = await createUser();
      const res = await agent().post("/api/v1/auth/logout").set(authHeaders(user));
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeUndefined();
    });

    test("PATCH /auth/change-password succeeds with valid current password", async () => {
      const user = await createUser();
      const res = await agent()
        .patch("/api/v1/auth/change-password")
        .set(authHeaders(user))
        .send({ currentPassword: PASSWORD_HASH_SEED, newPassword: TEST_PASSWORD });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("PATCH /auth/change-password wrong current password → 401", async () => {
      const user = await createUser();
      const res = await agent()
        .patch("/api/v1/auth/change-password")
        .set(authHeaders(user))
        .send({ currentPassword: "WrongPassword1", newPassword: TEST_PASSWORD });
      expect(res.status).toBe(401);
    });

    test("PATCH /auth/change-password missing new password → 422", async () => {
      const user = await createUser();
      const res = await agent()
        .patch("/api/v1/auth/change-password")
        .set(authHeaders(user))
        .send({ currentPassword: PASSWORD_HASH_SEED });
      expect(res.status).toBe(422);
    });
  });

  // ─── 2. Users ──────────────────────────────────────────────────────────────
  describe("Users — /api/v1/users", () => {
    test("GET /profile returns the authenticated user object", async () => {
      const user = await createUser();
      const res = await agent().get("/api/v1/users/profile").set(authHeaders(user));
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(user.email);
      expect(res.body.data).not.toHaveProperty("passwordHash");
    });

    test("GET /profile with no token → 401", async () => {
      const res = await agent().get("/api/v1/users/profile");
      expect(res.status).toBe(401);
    });

    test("PUT /profile updates name and returns the updated user", async () => {
      const user = await createUser();
      const res = await agent()
        .put("/api/v1/users/profile")
        .set(authHeaders(user))
        .send({ name: "Updated Name" });
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("Updated Name");
    });

    test("PUT /profile with invalid phone → 422", async () => {
      const user = await createUser();
      const res = await agent()
        .put("/api/v1/users/profile")
        .set(authHeaders(user))
        .send({ phone: "not-a-phone" });
      expect(res.status).toBe(422);
    });

    test("PUT /profile cannot change role/email via this endpoint", async () => {
      const user = await createUser();
      const res = await agent()
        .put("/api/v1/users/profile")
        .set(authHeaders(user))
        .send({ role: "ADMIN", email: uniq("pwn") + "@test.dev" });
      expect(res.status).toBe(200);
      expect(res.body.data.role).toBe("USER");
      expect(res.body.data.email).toBe(user.email);
    });

    test("POST /avatar with a non-image upload returns 400", async () => {
      const user = await createUser();
      const res = await agent()
        .post("/api/v1/users/avatar")
        .set(authHeaders(user))
        .attach("avatar", Buffer.from("not-an-image"), "x.txt");
      expect(res.status).toBe(400);
    });

    test("GET /admin/all: USER → 403, no token → 401, ADMIN → 200 paginated", async () => {
      const user = await createUser();
      const admin = await createAdmin();
      await createUser(); // ensure at least one more record

      const forbidden = await agent().get("/api/v1/users/admin/all").set(authHeaders(user));
      expect(forbidden.status).toBe(403);

      const anon = await agent().get("/api/v1/users/admin/all");
      expect(anon.status).toBe(401);

      const allowed = await agent().get("/api/v1/users/admin/all").set(authHeaders(admin));
      expect(allowed.status).toBe(200);
      expect(Array.isArray(allowed.body.data)).toBe(true);
      expect(allowed.body.pagination).toBeDefined();
      expect(allowed.body.pagination.total).toBeGreaterThanOrEqual(2);
    });

    test("PATCH /admin/:id/toggle deactivates a normal user (ADMIN)", async () => {
      const admin = await createAdmin();
      const target = await createUser();
      const res = await agent()
        .patch(`/api/v1/users/admin/${target._id}/toggle`)
        .set(authHeaders(admin));
      expect(res.status).toBe(200);
      expect(res.body.data.isActive).toBe(false);
    });

    test("PATCH /admin/:id/toggle refuses to disable an ADMIN account → 403", async () => {
      const admin = await createAdmin();
      const otherAdmin = await createAdmin({ name: "Second Admin" });
      const res = await agent()
        .patch(`/api/v1/users/admin/${otherAdmin._id}/toggle`)
        .set(authHeaders(admin));
      expect(res.status).toBe(403);
    });

    test("PATCH /admin/:id/toggle by a normal USER → 403", async () => {
      const user = await createUser();
      const target = await createUser();
      const res = await agent()
        .patch(`/api/v1/users/admin/${target._id}/toggle`)
        .set(authHeaders(user));
      expect(res.status).toBe(403);
    });

    test("PATCH /admin/:id/toggle with malformed id → 400", async () => {
      const admin = await createAdmin();
      const res = await agent()
        .patch(`/api/v1/users/admin/${invalidObjectId()}/toggle`)
        .set(authHeaders(admin));
      expect(res.status).toBe(400);
    });

    test("PATCH /admin/:id/toggle with unknown id → 404", async () => {
      const admin = await createAdmin();
      const res = await agent()
        .patch(`/api/v1/users/admin/${randomObjectId()}/toggle`)
        .set(authHeaders(admin));
      expect(res.status).toBe(404);
    });
  });

  // ─── 3. Offers ─────────────────────────────────────────────────────────────
  describe("Offers — /api/v1/offers", () => {
    const offerBody = (overrides = {}) => ({
      code: offerCode("OFF"),
      title: "Test Offer",
      type: "FLAT",
      value: 500,
      maxDiscountAmount: 1000,
      minBookingAmount: 0,
      startDate: new Date(Date.now() - 86400000).toISOString(),
      endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      usageLimit: 0,
      perUserLimit: 1,
      isActive: true,
      ...overrides,
    });

    test("GET /active returns a paginated array of only active offers", async () => {
      await createOffer({ code: offerCode("ON") });
      await createOffer({ code: offerCode("OFF"), isActive: false });
      const res = await agent().get("/api/v1/offers/active");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].isActive).toBe(true);
      expect(res.body.pagination.total).toBe(1);
    });

    test("GET /active excludes expired offers", async () => {
      await createOffer({ code: offerCode("EXP"), endDate: new Date(Date.now() - 86400000) });
      const res = await agent().get("/api/v1/offers/active");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });

    test("POST /validate returns discount details for a valid active offer", async () => {
      const offer = await createOffer({ code: offerCode("VLD"), type: "FLAT", value: 500 });
      const res = await agent()
        .post("/api/v1/offers/validate")
        .set("Content-Type", "application/json")
        .send({ code: offer.code, amount: 10000 });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.offerCode).toBe(offer.code);
      expect(res.body.data.discountAmount).toBe(500);
    });

    test("POST /validate missing code/amount → 400", async () => {
      const res = await agent().post("/api/v1/offers/validate").send({});
      expect(res.status).toBe(400);
    });

    test("POST /validate unknown code → 404", async () => {
      const res = await agent()
        .post("/api/v1/offers/validate")
        .send({ code: "NOPE123", amount: 10000 });
      expect(res.status).toBe(404);
    });

    test("POST /validate expired offer → 400", async () => {
      const offer = await createOffer({
        code: offerCode("EXPD"),
        endDate: new Date(Date.now() - 86400000),
      });
      const res = await agent()
        .post("/api/v1/offers/validate")
        .send({ code: offer.code, amount: 10000 });
      expect(res.status).toBe(400);
    });

    test("GET /admin/all: USER → 403, no token → 401, ADMIN → 200", async () => {
      const user = await createUser();
      const admin = await createAdmin();
      await createOffer({ code: offerCode("A") });

      const forbidden = await agent().get("/api/v1/offers/admin/all").set(authHeaders(user));
      expect(forbidden.status).toBe(403);

      const anon = await agent().get("/api/v1/offers/admin/all");
      expect(anon.status).toBe(401);

      const allowed = await agent().get("/api/v1/offers/admin/all").set(authHeaders(admin));
      expect(allowed.status).toBe(200);
      expect(Array.isArray(allowed.body.data)).toBe(true);
      expect(allowed.body.pagination.total).toBe(1);
    });

    test("POST /offer (ADMIN) creates → 201; USER → 403; no token → 401", async () => {
      const admin = await createAdmin();
      const created = await agent().post("/api/v1/offers").set(authHeaders(admin)).send(offerBody());
      expect(created.status).toBe(201);
      expect(created.body.success).toBe(true);
      expect(created.body.data.code).toBeDefined();

      const user = await createUser();
      const forbidden = await agent()
        .post("/api/v1/offers")
        .set(authHeaders(user))
        .send(offerBody({ code: offerCode("F") }));
      expect(forbidden.status).toBe(403);

      const anon = await agent().post("/api/v1/offers").send(offerBody());
      expect(anon.status).toBe(401);
    });

    test("POST /offer duplicate code → 409", async () => {
      const admin = await createAdmin();
      const code = offerCode("DUP");
      const first = await agent().post("/api/v1/offers").set(authHeaders(admin)).send(offerBody({ code }));
      expect(first.status).toBe(201);

      const dup = await agent().post("/api/v1/offers").set(authHeaders(admin)).send(offerBody({ code }));
      expect(dup.status).toBe(409);
      expect(dup.body.success).toBe(false);
    });

    test("POST /offer missing required fields → 422", async () => {
      const admin = await createAdmin();
      const res = await agent()
        .post("/api/v1/offers")
        .set(authHeaders(admin))
        .send({ code: offerCode("NO") });
      expect(res.status).toBe(422);
      expect(Array.isArray(res.body.errors)).toBe(true);
    });

    test("POST /offer invalid type → 422", async () => {
      const admin = await createAdmin();
      const res = await agent()
        .post("/api/v1/offers")
        .set(authHeaders(admin))
        .send(offerBody({ type: "BOGO" }));
      expect(res.status).toBe(422);
    });

    test("PUT /offer/:id updates an offer (ADMIN) → 200", async () => {
      const admin = await createAdmin();
      const offer = await createOffer({ code: offerCode("U"), title: "Old Title" });
      const res = await agent()
        .put(`/api/v1/offers/${offer._id}`)
        .set(authHeaders(admin))
        .send({ title: "New Title" });
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe("New Title");
    });

    test("PUT /offer/:id changing code to an existing one → 409", async () => {
      const admin = await createAdmin();
      const code = offerCode("EXST");
      await createOffer({ code });
      const offer = await createOffer({ code: offerCode("MINE") });
      const res = await agent()
        .put(`/api/v1/offers/${offer._id}`)
        .set(authHeaders(admin))
        .send({ code });
      expect(res.status).toBe(409);
    });

    test("PUT /offer/:id unknown id → 404", async () => {
      const admin = await createAdmin();
      const res = await agent()
        .put(`/api/v1/offers/${randomObjectId()}`)
        .set(authHeaders(admin))
        .send({ title: "X" });
      expect(res.status).toBe(404);
    });

    test("POST /:id/banner without token → 401; non-image upload → 400", async () => {
      const offer = await createOffer({ code: offerCode("BAN") });

      const anon = await agent().post(`/api/v1/offers/${offer._id}/banner`);
      expect(anon.status).toBe(401);

      const admin = await createAdmin();
      const bad = await agent()
        .post(`/api/v1/offers/${offer._id}/banner`)
        .set(authHeaders(admin))
        .attach("banner", Buffer.from("not-an-image"), "x.txt");
      // Multer imageFileFilter rejects non-image mimetypes.
      expect(bad.status).toBe(400);
      expect(bad.body.message).toMatch(/Only image files/i);
    });

    test("DELETE /:id/banner without token → 401; unknown id → 404 (ADMIN)", async () => {
      const offer = await createOffer({ code: offerCode("DELB") });

      const anon = await agent().delete(`/api/v1/offers/${offer._id}/banner`);
      expect(anon.status).toBe(401);

      const admin = await createAdmin();
      const missing = await agent()
        .delete("/api/v1/offers/not-a-real-id/banner")
        .set(authHeaders(admin));
      expect([400, 404]).toContain(missing.status);
    });
  });

  // ─── 4. Reviews ────────────────────────────────────────────────────────────
  describe("Reviews — /api/v1/reviews", () => {
    test("GET /hotel/:hotelId returns a paginated array of active reviews", async () => {
      const user = await createUser();
      const { hotel, booking } = await setupReviewBooking(user);
      await createReview({
        hotel: hotel._id,
        user: user._id,
        booking: booking._id,
        isActive: true,
      });
      await createReview({ hotel: hotel._id, isActive: false });

      const res = await agent().get(`/api/v1/reviews/hotel/${hotel._id}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.pagination.total).toBe(1);
    });

    test("GET /hotel/:hotelId with malformed id → 400", async () => {
      const res = await agent().get(`/api/v1/reviews/hotel/${invalidObjectId()}`);
      expect(res.status).toBe(400);
    });

    test("POST /review by a user with a CONFIRMED booking → 201", async () => {
      const user = await createUser();
      const { hotel, booking } = await setupReviewBooking(user);
      const res = await postReview(user, reviewFields(hotel, booking));
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.booking.toString()).toBe(booking._id.toString());
      expect(res.body.data.isVerified).toBe(true);
    });

    test("POST /review without token → 401", async () => {
      const user = await createUser();
      const { hotel, booking } = await setupReviewBooking(user);
      const res = await agent().post("/api/v1/reviews").send(reviewFields(hotel, booking));
      expect(res.status).toBe(401);
    });

    test("POST /review missing required fields → 422", async () => {
      const user = await createUser();
      const res = await agent()
        .post("/api/v1/reviews")
        .set(authHeaders(user))
        .set("Content-Type", "application/json")
        .send({ hotel: "abc", booking: "def" });
      expect(res.status).toBe(422);
      expect(Array.isArray(res.body.errors)).toBe(true);
    });

    test("POST /review with out-of-range overall rating → 422", async () => {
      const user = await createUser();
      const { hotel, booking } = await setupReviewBooking(user);
      const res = await postReview(user, {
        ...reviewFields(hotel, booking),
        rating: JSON.stringify({ overall: 6 }),
      });
      expect(res.status).toBe(422);
    });

    test("POST /review with a booking that is not confirmed/checked-out → 403", async () => {
      const user = await createUser();
      const { hotel, booking } = await setupReviewBooking(user, { status: "PENDING" });
      const res = await postReview(user, reviewFields(hotel, booking));
      expect(res.status).toBe(403);
    });

    test("POST /review duplicate review for the same booking → 409", async () => {
      const user = await createUser();
      const { hotel, booking } = await setupReviewBooking(user);
      const first = await postReview(user, reviewFields(hotel, booking));
      expect(first.status).toBe(201);
      const second = await postReview(user, reviewFields(hotel, booking));
      expect(second.status).toBe(409);
    });

    test("PUT /review/:id owner can update title → 200", async () => {
      const user = await createUser();
      const { hotel, booking } = await setupReviewBooking(user);
      const created = await postReview(user, reviewFields(hotel, booking));
      const id = created.body.data._id;

      const res = await agent()
        .put(`/api/v1/reviews/${id}`)
        .set(authHeaders(user))
        .set("Content-Type", "application/json")
        .send({ title: "Updated title" });
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe("Updated title");
    });

    test("PUT /review/:id by another user → 404", async () => {
      const owner = await createUser();
      const other = await createUser();
      const { hotel, booking } = await setupReviewBooking(owner);
      const created = await postReview(owner, reviewFields(hotel, booking));
      const id = created.body.data._id;

      const res = await agent()
        .put(`/api/v1/reviews/${id}`)
        .set(authHeaders(other))
        .set("Content-Type", "application/json")
        .send({ title: "Nope" });
      expect(res.status).toBe(404);
    });

    test("PUT /review/:id with short body → 422", async () => {
      const user = await createUser();
      const { hotel, booking } = await setupReviewBooking(user);
      const created = await postReview(user, reviewFields(hotel, booking));
      const id = created.body.data._id;

      const res = await agent()
        .put(`/api/v1/reviews/${id}`)
        .set(authHeaders(user))
        .set("Content-Type", "application/json")
        .send({ body: "too short" });
      expect(res.status).toBe(422);
    });

    test("DELETE /review/:id owner deletes → 200 without data", async () => {
      const user = await createUser();
      const { hotel, booking } = await setupReviewBooking(user);
      const created = await postReview(user, reviewFields(hotel, booking));
      const id = created.body.data._id;

      const res = await agent().delete(`/api/v1/reviews/${id}`).set(authHeaders(user));
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeUndefined();
    });

    test("DELETE /review/:id admin deletes another user's review → 200", async () => {
      const admin = await createAdmin();
      const user = await createUser();
      const { hotel, booking } = await setupReviewBooking(user);
      const created = await postReview(user, reviewFields(hotel, booking));
      const id = created.body.data._id;

      const res = await agent().delete(`/api/v1/reviews/${id}`).set(authHeaders(admin));
      expect(res.status).toBe(200);
    });

    test("DELETE /review/:id unknown id → 404", async () => {
      const user = await createUser();
      const res = await agent().delete(`/api/v1/reviews/${randomObjectId()}`).set(authHeaders(user));
      expect(res.status).toBe(404);
    });

    test("PATCH /review/:id/helpful toggles the vote up and down", async () => {
      const user = await createUser();
      const { hotel, booking } = await setupReviewBooking(user);
      const created = await postReview(user, reviewFields(hotel, booking));
      const id = created.body.data._id;

      const up = await agent().patch(`/api/v1/reviews/${id}/helpful`).set(authHeaders(user));
      expect(up.status).toBe(200);
      expect(up.body.data.helpfulVotes).toBe(1);

      const down = await agent().patch(`/api/v1/reviews/${id}/helpful`).set(authHeaders(user));
      expect(down.status).toBe(200);
      expect(down.body.data.helpfulVotes).toBe(0);
    });

    test("PATCH /review/:id/helpful unknown id → 404", async () => {
      const user = await createUser();
      const res = await agent()
        .patch(`/api/v1/reviews/${randomObjectId()}/helpful`)
        .set(authHeaders(user));
      expect(res.status).toBe(404);
    });

    test("POST /review/:id/respond (ADMIN) adds a response → 200", async () => {
      const admin = await createAdmin();
      const user = await createUser();
      const { hotel, booking } = await setupReviewBooking(user);
      const created = await postReview(user, reviewFields(hotel, booking));
      const id = created.body.data._id;

      const res = await agent()
        .post(`/api/v1/reviews/${id}/respond`)
        .set(authHeaders(admin))
        .set("Content-Type", "application/json")
        .send({ text: "Thank you for your kind words!" });
      expect(res.status).toBe(200);
      expect(res.body.data.response.text).toBe("Thank you for your kind words!");
    });

    test("POST /review/:id/respond missing text → 400", async () => {
      const admin = await createAdmin();
      const user = await createUser();
      const { hotel, booking } = await setupReviewBooking(user);
      const created = await postReview(user, reviewFields(hotel, booking));
      const id = created.body.data._id;

      const res = await agent()
        .post(`/api/v1/reviews/${id}/respond`)
        .set(authHeaders(admin))
        .send({});
      expect(res.status).toBe(400);
    });

    test("POST /review/:id/respond by a normal USER → 403", async () => {
      const user = await createUser();
      const { hotel, booking } = await setupReviewBooking(user);
      const created = await postReview(user, reviewFields(hotel, booking));
      const id = created.body.data._id;

      const res = await agent()
        .post(`/api/v1/reviews/${id}/respond`)
        .set(authHeaders(user))
        .send({ text: "Thank you" });
      expect(res.status).toBe(403);
    });
  });

  // ─── 5. Home settings + Hero banner ────────────────────────────────────────
  describe("Home settings — /api/v1/home-settings", () => {
    test("GET / returns the settings object even on an empty DB", async () => {
      const res = await agent().get("/api/v1/home-settings");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.key).toBe("home");
    });

    test("GET / returns persisted settings after an admin update", async () => {
      const admin = await createAdmin();
      await agent()
        .put("/api/v1/home-settings")
        .set(authHeaders(admin))
        .send({ content: { heroTitle: "Unwind in style" } });
      const res = await agent().get("/api/v1/home-settings");
      expect(res.status).toBe(200);
      expect(res.body.data.content.heroTitle).toBe("Unwind in style");
    });

    test("PUT / (ADMIN) updates sections → 200 object", async () => {
      const admin = await createAdmin();
      const res = await agent()
        .put("/api/v1/home-settings")
        .set(authHeaders(admin))
        .send({ sections: { hero: false, faq: true } });
      expect(res.status).toBe(200);
      expect(res.body.data.sections.hero).toBe(false);
      expect(res.body.data.sections.faq).toBe(true);
    });

    test("PUT / invalid section boolean → 422", async () => {
      const admin = await createAdmin();
      const res = await agent()
        .put("/api/v1/home-settings")
        .set(authHeaders(admin))
        .send({ sections: { hero: "yes" } });
      expect(res.status).toBe(422);
    });

    test("PUT / by a normal USER → 403; no token → 401", async () => {
      const user = await createUser();
      const forbidden = await agent()
        .put("/api/v1/home-settings")
        .set(authHeaders(user))
        .send({ sections: { hero: true } });
      expect(forbidden.status).toBe(403);

      const anon = await agent().put("/api/v1/home-settings").send({ sections: { hero: true } });
      expect(anon.status).toBe(401);
    });

    test("DELETE / with no settings doc → 404", async () => {
      const admin = await createAdmin();
      const res = await agent().delete("/api/v1/home-settings").set(authHeaders(admin));
      expect(res.status).toBe(404);
    });

    test("DELETE / resets persisted settings to defaults → 200", async () => {
      const admin = await createAdmin();
      const put = await agent()
        .put("/api/v1/home-settings")
        .set(authHeaders(admin))
        .send({ content: { heroTitle: "Custom title" }, sections: { hero: false } });
      expect(put.status).toBe(200);
      expect(put.body.data.content.heroTitle).toBe("Custom title");

      const res = await agent().delete("/api/v1/home-settings").set(authHeaders(admin));
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // Reset restores the default section flags (true) and clears custom content
      // (an empty content bag is stripped from the saved doc by Mongoose minimize).
      expect(res.body.data.sections.hero).toBe(true);
      expect(res.body.data.content?.heroTitle).toBeUndefined();
    });

    test("DELETE / by a normal USER → 403", async () => {
      const user = await createUser();
      const res = await agent().delete("/api/v1/home-settings").set(authHeaders(user));
      expect(res.status).toBe(403);
    });
  });

  describe("Hero banner — /api/v1/hero-banner", () => {
    test("GET / returns an array of banners", async () => {
      await createHeroBanner({ title: uniq("Hero1") });
      await createHeroBanner({ title: uniq("Hero2") });
      const res = await agent().get("/api/v1/hero-banner");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(2);
    });

    test("GET /active returns the single active banner object", async () => {
      await createHeroBanner({ title: uniq("Active"), isActive: true });
      const res = await agent().get("/api/v1/hero-banner/active");
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBeDefined();
    });

    test("POST / (ADMIN) creates → 201; missing title → 422; USER → 403", async () => {
      const admin = await createAdmin();
      const created = await agent()
        .post("/api/v1/hero-banner")
        .set(authHeaders(admin))
        .send({ title: uniq("Banner"), eyebrow: "Five Star" });
      expect(created.status).toBe(201);
      expect(created.body.data.title).toBeDefined();

      const missing = await agent()
        .post("/api/v1/hero-banner")
        .set(authHeaders(admin))
        .send({ eyebrow: "no title" });
      expect(missing.status).toBe(422);

      const user = await createUser();
      const forbidden = await agent()
        .post("/api/v1/hero-banner")
        .set(authHeaders(user))
        .send({ title: "Nope" });
      expect(forbidden.status).toBe(403);
    });

    test("PUT /:id (ADMIN) updates → 200; unknown id → 404", async () => {
      const admin = await createAdmin();
      const banner = await createHeroBanner({ title: uniq("Old") });
      const updated = await agent()
        .put(`/api/v1/hero-banner/${banner._id}`)
        .set(authHeaders(admin))
        .send({ title: uniq("New") });
      expect(updated.status).toBe(200);
      expect(updated.body.data.title).not.toBe("Old");

      const missing = await agent()
        .put(`/api/v1/hero-banner/${randomObjectId()}`)
        .set(authHeaders(admin))
        .send({ title: "X" });
      expect(missing.status).toBe(404);
    });

    test("DELETE /:id (ADMIN) → 200 without data; unknown id → 404", async () => {
      const admin = await createAdmin();
      const banner = await createHeroBanner({ title: uniq("Del") });
      const del = await agent().delete(`/api/v1/hero-banner/${banner._id}`).set(authHeaders(admin));
      expect(del.status).toBe(200);
      expect(del.body.data).toBeUndefined();

      const missing = await agent()
        .delete(`/api/v1/hero-banner/${randomObjectId()}`)
        .set(authHeaders(admin));
      expect(missing.status).toBe(404);
    });
  });

  // ─── 6. Statistics ─────────────────────────────────────────────────────────
  describe("Statistics — /api/v1/statistics", () => {
    test("GET /home returns the expected numeric stat keys", async () => {
      const admin = await createAdmin();
      // Seed one active hotel so properties is non-zero and meaningful.
      const hotel = await createHotel({
        name: uniq("StatsHotel"),
        isActive: true,
        starRating: 5,
      });
      await createRoom(hotel, { isActive: true });

      const res = await agent().get("/api/v1/statistics/home");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const d = res.body.data;
      for (const key of ["properties", "avgRating", "reviews", "destinations", "rooms", "happyCustomers"]) {
        expect(d).toHaveProperty(key);
      }
      expect(typeof d.properties).toBe("number");
      expect(typeof d.avgRating).toBe("number");
      expect(typeof d.rooms).toBe("number");
      expect(d.properties).toBeGreaterThan(0);
      expect(d.avgRating).toBe(5);
    });

    test("GET /home is public (no token required)", async () => {
      const res = await agent().get("/api/v1/statistics/home");
      expect(res.status).toBe(200);
    });
  });

  // ─── 7. Notifications ──────────────────────────────────────────────────────
  describe("Notifications — /api/v1/notifications", () => {
    test("GET / returns a paginated array of the owner's notifications; no token → 401", async () => {
      const user = await createUser();
      const other = await createUser();
      await createNotification({ user: user._id, title: "Mine 1" });
      await createNotification({ user: user._id, title: "Mine 2" });
      await createNotification({ user: other._id, title: "Other" });

      const res = await agent().get("/api/v1/notifications").set(authHeaders(user));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination.total).toBe(2);
      expect(res.body.data.every((n) => n.user.toString() === user._id.toString())).toBe(true);
      expect(res.body.unreadCount).toBe(2);

      const anon = await agent().get("/api/v1/notifications");
      expect(anon.status).toBe(401);
    });

    test("GET / with unreadOnly=true returns only unread notifications", async () => {
      const user = await createUser();
      await createNotification({ user: user._id, title: "Unread", isRead: false });
      await createNotification({ user: user._id, title: "Read", isRead: true });

      const res = await agent()
        .get("/api/v1/notifications?unreadOnly=true")
        .set(authHeaders(user));
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].isRead).toBe(false);
      expect(res.body.unreadCount).toBe(1);
    });

    test("PATCH /read-all marks all the owner's notifications as read", async () => {
      const user = await createUser();
      await createNotification({ user: user._id, title: "A", isRead: false });
      await createNotification({ user: user._id, title: "B", isRead: false });

      const res = await agent().patch("/api/v1/notifications/read-all").set(authHeaders(user));
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const list = await agent().get("/api/v1/notifications").set(authHeaders(user));
      expect(list.body.data.every((n) => n.isRead === true)).toBe(true);
    });

    test("PATCH /:id/read marks a single notification as read → 200", async () => {
      const user = await createUser();
      const notification = await createNotification({ user: user._id, title: "Hi", isRead: false });

      const res = await agent()
        .patch(`/api/v1/notifications/${notification._id}/read`)
        .set(authHeaders(user));
      expect(res.status).toBe(200);
      expect(res.body.data.isRead).toBe(true);
    });

    test("PATCH /:id/read on another user's notification → 404", async () => {
      const user = await createUser();
      const other = await createUser();
      const notification = await createNotification({ user: other._id, title: "Other" });

      const res = await agent()
        .patch(`/api/v1/notifications/${notification._id}/read`)
        .set(authHeaders(user));
      expect(res.status).toBe(404);
    });

    test("PATCH /:id/read with malformed id → 400", async () => {
      const user = await createUser();
      const res = await agent()
        .patch(`/api/v1/notifications/${invalidObjectId()}/read`)
        .set(authHeaders(user));
      expect(res.status).toBe(400);
    });

    test("DELETE /:id removes the owner's notification → 200 without data", async () => {
      const user = await createUser();
      const notification = await createNotification({ user: user._id, title: "Del" });

      const res = await agent()
        .delete(`/api/v1/notifications/${notification._id}`)
        .set(authHeaders(user));
      expect(res.status).toBe(200);
      expect(res.body.data).toBeUndefined();
    });

    test("DELETE /:id on another user's notification → 404", async () => {
      const user = await createUser();
      const other = await createUser();
      const notification = await createNotification({ user: other._id, title: "Other" });

      const res = await agent()
        .delete(`/api/v1/notifications/${notification._id}`)
        .set(authHeaders(user));
      expect(res.status).toBe(404);
    });
  });
});
