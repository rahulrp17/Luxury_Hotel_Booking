/* eslint-disable no-console */
/**
 * Integration suite for the Analytics module (/api/v1/analytics).
 *
 * All five endpoints are admin-only and backed by Mongo aggregations. Revenue
 * is payment-based: only payments that captured money count (CAPTURED/REFUNDED),
 * PROCESSED refunds are subtracted, and COMPLETED stays are revenue-earning.
 * Seeded bookings are paired with real Payment documents via the factories and
 * the `booking.payment` back-reference (as the payment service does on capture).
 * Contract under test:
 *   - GET /overview        → { totalRevenue (net), grossRevenue, refundedAmount,
 *                             totalUsers, totalHotels, todayBookings }
 *   - GET /revenue         → 30 zero-filled days of { _id: "YYYY-MM-DD" (IST),
 *                             revenue (net), bookingsCount } — includes today
 *   - GET /occupancy       → array of { _id, hotelName, bookedNights } (top 10,
 *                             overlap-counted, COMPLETED included)
 *   - GET /top-hotels      → array of { _id, hotelName, revenue, bookings } (top 5)
 *   - GET /booking-summary → { totalBookings, pendingBookings, occupancyRate,
 *                             statusCounts (all statuses), per-status counts }
 */
const { bootApp, resetDB, closeDB, agent } = require("../helpers/app");
const {
  createUser,
  createAdmin,
  createHotel,
  createBooking,
  createPayment,
  createRoom,
  authHeaders,
  objectId,
  uniq,
} = require("../helpers/factories");
const Booking = require("../../src/modules/bookings/booking.model");
const { getRedisClient } = require("../../src/config/redis");
const { BOOKING_STATUS } = require("../../src/config/constants");

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 86400000;
const istToday = () => new Date(Date.now() + IST_OFFSET_MS).toISOString().slice(0, 10);
const startToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
const daysFromToday = (n) => new Date(startToday().getTime() + n * DAY_MS);

/** Flush the shared (mocked) Redis cache so cached analytics envelopes from a
 *  prior test don't leak into the next one. */
async function flushCache() {
  try {
    await getRedisClient().flushdb();
  } catch (err) {
    // Redis mock failures are non-fatal for these tests.
  }
}

/**
 * The shared factory omits `slug` (Hotel schema: unique), so seeding more than
 * one hotel in a single test blows up (dup `slug: null`). This wrapper injects
 * a unique slug without touching `tests/helpers/`.
 */
const seedHotel = (overrides = {}) =>
  createHotel({ ...overrides, slug: overrides.slug || `h_${uniq("slug")}` });

/** Create a booking whose payment actually captured `total` rupees, and link
 *  the payment back onto the booking exactly as the capture flow does. */
async function paidBooking({ user, hotel, status, total, paymentStatus = "CAPTURED", refunds = [], checkIn, checkOut, nights }) {
  const booking = await createBooking({
    user: user._id,
    hotel: hotel._id,
    room: objectId(),
    status,
    // Only pass date overrides when provided — the factory's trailing spread
    // would otherwise clobber its computed defaults with `undefined`.
    ...(checkIn ? { checkIn } : {}),
    ...(checkOut ? { checkOut } : {}),
    ...(nights ? { nights } : {}),
    pricing: {
      baseAmount: total,
      addonAmount: 0,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: total,
      currency: "INR",
    },
  });
  const payment = await createPayment({
    booking: booking._id,
    user: user._id,
    amount: total,
    status: paymentStatus,
    capturedAt: paymentStatus === "CAPTURED" || paymentStatus === "REFUNDED" ? new Date() : undefined,
    refunds,
  });
  await Booking.updateOne({ _id: booking._id }, { payment: payment._id });
  return { booking, payment };
}

const processRefund = (amount) => ({
  refundId: `ref_${uniq("r")}`,
  amount,
  status: "PROCESSED",
  processedAt: new Date(),
});

describe("Analytics — /api/v1/analytics", () => {
  beforeAll(async () => {
    await bootApp({ dbName: "lux_analytics" });
  });

  beforeEach(async () => {
    await resetDB();
    await flushCache();
  });

  afterAll(closeDB);

  // ─── Authz ──────────────────────────────────────────────────────────────
  describe("auth", () => {
    const PATHS = ["/overview", "/revenue", "/occupancy", "/top-hotels", "/booking-summary"];

    test("no token → 401 on every analytics endpoint", async () => {
      for (const path of PATHS) {
        const res = await agent().get(`/api/v1/analytics${path}`);
        expect(res.status).toBe(401);
      }
    });

    test("non-admin USER → 403 on every analytics endpoint", async () => {
      const user = await createUser();
      for (const path of PATHS) {
        const res = await agent()
          .get(`/api/v1/analytics${path}`)
          .set(authHeaders(user));
        expect(res.status).toBe(403);
      }
    });

    test("ADMIN can reach every endpoint", async () => {
      const admin = await createAdmin();
      for (const path of PATHS) {
        const res = await agent()
          .get(`/api/v1/analytics${path}`)
          .set(authHeaders(admin));
        expect([200, 404]).toContain(res.status);
      }
    });
  });

  // ─── Empty state ────────────────────────────────────────────────────────
  describe("empty DB", () => {
    test("overview returns zeroed KPIs", async () => {
      const admin = await createAdmin();
      const res = await agent().get("/api/v1/analytics/overview").set(authHeaders(admin));
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual({
        totalRevenue: 0,
        grossRevenue: 0,
        refundedAmount: 0,
        totalUsers: 0,
        totalHotels: 0,
        todayBookings: 0,
      });
    });

    test("revenue returns a zero-filled 30-day window incl. today; occupancy/top-hotels are empty", async () => {
      const admin = await createAdmin();
      const revenue = await agent().get("/api/v1/analytics/revenue").set(authHeaders(admin));
      expect(revenue.status).toBe(200);
      expect(revenue.body.data).toHaveLength(30);
      expect(revenue.body.data.every((r) => r.revenue === 0 && r.bookingsCount === 0)).toBe(true);
      expect(revenue.body.data[revenue.body.data.length - 1]._id).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      const occupancy = await agent().get("/api/v1/analytics/occupancy").set(authHeaders(admin));
      expect(occupancy.status).toBe(200);
      expect(occupancy.body.data).toEqual([]);

      const top = await agent().get("/api/v1/analytics/top-hotels").set(authHeaders(admin));
      expect(top.status).toBe(200);
      expect(top.body.data).toEqual([]);
    });
  });

  // ─── Seeded data ────────────────────────────────────────────────────────
  describe("with seeded bookings + payments", () => {
    test("overview nets captured payments against processed refunds", async () => {
      const admin = await createAdmin();
      const user = await createUser();
      const hotel = await seedHotel({ name: uniq("HotA"), isActive: true });
      const hotel2 = await seedHotel({ name: uniq("HotB"), isActive: true });

      // One confirmed booking with a known total, plus one cancelled.
      await paidBooking({
        user,
        hotel,
        status: BOOKING_STATUS.CONFIRMED,
        total: 35400,
      });

      // A cancelled stay whose full amount was refunded — gross increases but
      // the refund cancels it out, so it must NOT inflate net revenue.
      const refunded = await createBooking({
        user: user._id,
        hotel: hotel2._id,
        room: objectId(),
        status: BOOKING_STATUS.CANCELLED,
        pricing: {
          baseAmount: 20000,
          addonAmount: 0,
          discountAmount: 0,
          taxAmount: 0,
          totalAmount: 20000,
          currency: "INR",
        },
      });
      const refundPayment = await createPayment({
        booking: refunded._id,
        user: user._id,
        amount: 20000,
        status: "REFUNDED",
        capturedAt: new Date(),
        refunds: [processRefund(20000)],
      });
      await Booking.updateOne({ _id: refunded._id }, { payment: refundPayment._id });

      const res = await agent().get("/api/v1/analytics/overview").set(authHeaders(admin));
      expect(res.status).toBe(200);
      const d = res.body.data;
      expect(d.totalRevenue).toBe(35400); // net: 55400 gross − 20000 refunded
      expect(d.grossRevenue).toBe(55400); // 35400 + 20000 captured
      expect(d.refundedAmount).toBe(20000);
      expect(d.totalUsers).toBe(1); // the USER (admin role not counted)
      expect(d.totalHotels).toBe(2); // both active
      expect(d.todayBookings).toBe(2); // both created today
    });

    test("revenue chart counts COMPLETED stays, partial refunds, and all bookings by day", async () => {
      const admin = await createAdmin();
      const user = await createUser();
      const hotel = await seedHotel({ name: uniq("HotRev"), isActive: true });

      await paidBooking({ user, hotel, status: BOOKING_STATUS.CONFIRMED, total: 1180 });
      await paidBooking({ user, hotel, status: BOOKING_STATUS.CHECKED_OUT, total: 2360 });
      // COMPLETED must now count toward revenue (the original bug).
      await paidBooking({ user, hotel, status: BOOKING_STATUS.COMPLETED, total: 500 });
      // Cancelled must NOT appear in revenue, but its booking record still
      // counts toward the bookings chart (a Booking exists regardless).
      await createBooking({
        user: user._id,
        hotel: hotel._id,
        room: objectId(),
        status: BOOKING_STATUS.CANCELLED,
        pricing: { baseAmount: 106200, addonAmount: 0, discountAmount: 0, taxAmount: 0, totalAmount: 106200, currency: "INR" },
      });
      // A captured payment with a PARTIAL processed refund → 1000 − 400 = 600.
      await paidBooking({
        user,
        hotel,
        status: BOOKING_STATUS.CONFIRMED,
        total: 1000,
        refunds: [processRefund(400)],
      });

      const res = await agent().get("/api/v1/analytics/revenue").set(authHeaders(admin));
      expect(res.status).toBe(200);
      const rows = res.body.data;
      expect(rows).toHaveLength(30); // zero-filled window

      const todayKey = istToday();
      const todayRow = rows.find((r) => r._id === todayKey);
      expect(todayRow).toBeDefined();
      expect(todayRow.revenue).toBe(4640); // 1180 + 2360 + 500 + (1000 − 400)
      expect(todayRow.bookingsCount).toBe(5); // every booking created today, any status
      expect(todayRow._id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(rows.filter((r) => r._id !== todayKey).every((r) => r.revenue === 0 && r.bookingsCount === 0)).toBe(true);
    });

    test("occupancy counts only nights inside the window and includes COMPLETED stays", async () => {
      const admin = await createAdmin();
      const user = await createUser();
      const hotelA = await seedHotel({ name: uniq("AlphaResort") });
      const hotelB = await seedHotel({ name: uniq("BetaRetreat") });

      // Hotel A: two confirmed bookings overlapping today + a completed stay
      // whose checkout is still in the future (must be counted).
      await paidBooking({
        user, hotel: hotelA, status: BOOKING_STATUS.CONFIRMED,
        total: 10000, checkIn: daysFromToday(0), checkOut: daysFromToday(1), nights: 1,
      });
      await paidBooking({
        user, hotel: hotelA, status: BOOKING_STATUS.CONFIRMED,
        total: 20000, checkIn: daysFromToday(0), checkOut: daysFromToday(2), nights: 2,
      });
      await paidBooking({
        user, hotel: hotelA, status: BOOKING_STATUS.COMPLETED,
        total: 30000, checkIn: daysFromToday(5), checkOut: daysFromToday(7), nights: 2,
      });
      // Hotel B: one booking.
      await paidBooking({
        user, hotel: hotelB, status: BOOKING_STATUS.CONFIRMED,
        total: 10000, checkIn: daysFromToday(2), checkOut: daysFromToday(4), nights: 2,
      });

      const res = await agent().get("/api/v1/analytics/occupancy").set(authHeaders(admin));
      expect(res.status).toBe(200);
      const rows = res.body.data;
      expect(rows.length).toBe(2);
      expect(rows[0].bookedNights).toBe(5); // 1 + 2 + 2 (Hotel A, incl. completed)
      expect(rows[1].bookedNights).toBe(2); // Hotel B
    });

    test("top-hotels ranks paid bookings by net revenue, COMPLETED included", async () => {
      const admin = await createAdmin();
      const user = await createUser();
      const hotelA = await seedHotel({ name: uniq("LuxeOne") });
      const hotelB = await seedHotel({ name: uniq("LuxeTwo") });

      await paidBooking({ user, hotel: hotelA, status: BOOKING_STATUS.CONFIRMED, total: 50000 });
      await paidBooking({ user, hotel: hotelA, status: BOOKING_STATUS.CONFIRMED, total: 10000 });
      await paidBooking({ user, hotel: hotelA, status: BOOKING_STATUS.COMPLETED, total: 5000 });
      await paidBooking({ user, hotel: hotelB, status: BOOKING_STATUS.CONFIRMED, total: 20000 });
      // Cancelled with no payment — must not appear at all.
      await createBooking({
        user: user._id,
        hotel: hotelB._id,
        room: objectId(),
        status: BOOKING_STATUS.CANCELLED,
        pricing: { baseAmount: 999999, addonAmount: 0, discountAmount: 0, taxAmount: 0, totalAmount: 999999, currency: "INR" },
      });

      const res = await agent().get("/api/v1/analytics/top-hotels").set(authHeaders(admin));
      expect(res.status).toBe(200);
      const rows = res.body.data;
      expect(rows.length).toBe(2);
      expect(rows[0].revenue).toBe(65000); // Luxe One > Luxe Two
      expect(rows[0].bookings).toBe(3);
      expect(rows[1].revenue).toBe(20000);
      expect(rows[1].bookings).toBe(1);
    });

    test("booking-summary reports all statuses, real-inventory occupancy, and per-status counts", async () => {
      const admin = await createAdmin();
      const user = await createUser();
      const hotelA = await seedHotel({ name: uniq("SumA"), isActive: true });
      const hotelB = await seedHotel({ name: uniq("SumB"), isActive: true });
      // Real inventory: 8 + 2 = 10 units → 70 room-nights capacity next week.
      await createRoom(hotelA._id, { totalUnits: 8, isActive: true });
      await createRoom(hotelB._id, { totalUnits: 2, isActive: true });

      await createBooking({
        user: user._id, hotel: hotelA._id, room: objectId(), status: BOOKING_STATUS.PENDING,
        checkIn: daysFromToday(10), checkOut: daysFromToday(13), nights: 3,
      });
      await createBooking({
        user: user._id, hotel: hotelA._id, room: objectId(), status: BOOKING_STATUS.CONFIRMED,
        checkIn: daysFromToday(0), checkOut: daysFromToday(1), nights: 1,
      });
      await createBooking({
        user: user._id, hotel: hotelA._id, room: objectId(), status: BOOKING_STATUS.CHECKED_IN,
        checkIn: daysFromToday(0), checkOut: daysFromToday(2), nights: 2,
      });
      await createBooking({
        user: user._id, hotel: hotelA._id, room: objectId(), status: BOOKING_STATUS.COMPLETED,
        checkIn: daysFromToday(5), checkOut: daysFromToday(7), nights: 2,
      });
      await createBooking({
        user: user._id, hotel: hotelB._id, room: objectId(), status: BOOKING_STATUS.CANCELLED,
      });
      await createBooking({
        user: user._id, hotel: hotelB._id, room: objectId(), status: BOOKING_STATUS.REFUNDED,
      });

      const res = await agent().get("/api/v1/analytics/booking-summary").set(authHeaders(admin));
      expect(res.status).toBe(200);
      const d = res.body.data;
      expect(d.totalBookings).toBe(6);
      expect(d.pendingBookings).toBe(1);
      expect(d.completedBookings).toBe(1);
      expect(d.cancelledBookings).toBe(1);
      expect(d.refundedBookings).toBe(1);
      expect(d.statusCounts).toEqual({
        PENDING: 1,
        CONFIRMED: 1,
        CHECKED_IN: 1,
        CHECKED_OUT: 0,
        COMPLETED: 1,
        CANCELLED: 1,
        REFUNDED: 1,
      });
      // bookedNights = 1 + 2 + 2 (incl. the completed stay), capacity 10 units × 7.
      expect(d.occupancyRate).toBe(7); // Math.round(5 / 70 * 100)
    });
  });

  describe("cache", () => {
    test("second identical request serves from cache with X-Cache: HIT", async () => {
      const admin = await createAdmin();
      const h = authHeaders(admin);
      const first = await agent().get("/api/v1/analytics/overview").set(h);
      expect(first.status).toBe(200);

      const second = await agent().get("/api/v1/analytics/overview").set(h);
      expect(second.status).toBe(200);
      expect(second.headers["x-cache"]).toBe("HIT");
    });
  });
});
