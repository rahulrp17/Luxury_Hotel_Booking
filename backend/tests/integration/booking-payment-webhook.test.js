/* eslint-disable no-console */
/**
 * Comprehensive integration suite for the booking → payment → webhook → refund
 * money path under /api/v1, exercised through the real Express app.
 *
 * Covers: booking CRUD + capacity/validation, list/ownership/ACL guards,
 * cancellation, admin status updates, Razorpay order creation/verification
 * (HMAC), the RAW-body signed webhook (captured/failed/invalid/no-entity), and
 * payment details + admin refunds.
 *
 * Razorpay is mocked BEFORE anything from src is required. The service layer
 * reaches the gateway via `getRazorpayInstance()` and drives it with
 * `orders.create` / `payments.refund`, so the mock exposes those jest.fn()s both
 * :top-level AND through `getRazorpayInstance()` (same object, same spies).
 */
process.env.RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "test_key_secret";
process.env.RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "test_webhook_secret";

const crypto = require("crypto");

// ─── Mock Razorpay BEFORE requiring anything from src ──────────────────────
jest.mock("../../src/config/razorpay", () => {
  const orders = { create: jest.fn(), fetch: jest.fn() };
  const payments = { capture: jest.fn(), fetch: jest.fn(), refund: jest.fn() };
  const refunds = { create: jest.fn() };
  return {
    orders,
    payments,
    refunds,
    getRazorpayInstance: () => ({ orders, payments, refunds }),
  };
});
const razorpay = require("../../src/config/razorpay");

// NOTE: the raw webhook body is preserved because `src/app.js` now skips
// `express-mongo-sanitize`/`xss-clean` for Buffer bodies (they used to coerce
// the raw webhook Buffer into an Object → HMAC TypeError → 500). No mock needed.

// Models + helpers (models are fine to load; only config/razorpay is mocked).
const { bootApp, resetDB, closeDB, agent } = require("../helpers/app");
const {
  createUser,
  createAdmin,
  authHeaders,
  createHotel,
  createRoom,
  uniq,
} = require("../helpers/factories");
const Booking = require("../../src/modules/bookings/booking.model");
const Payment = require("../../src/modules/payments/payment.model");

// Booking.create now works on the standalone-Mongo path: `booking.service.js`
// only passes `{ session }` when a transaction is actually active, so no shim
// is needed here. The real money-path (availability, pricing, payment,
// webhook, refund) is exercised against the live DB.

const futureDate = (daysFromNow) => new Date(Date.now() + daysFromNow * 86400000);

/** A valid booking payload for the given user/hotel/room (3 nights, +14→+17d). */
const bookingPayload = (hotel, room, user, overrides = {}) => ({
  hotel: hotel._id.toString(),
  room: room._id.toString(),
  checkIn: futureDate(14),
  checkOut: futureDate(17),
  guests: { adults: 1, children: 0 },
  guestDetails: {
    name: user.name,
    email: user.email,
    phone: "+91 90000 11111",
  },
  specialRequests: "Please face the garden.",
  ...overrides,
});

/** Post a booking on behalf of `user` and return the supertest response. */
const postBooking = (user, payload) =>
  agent()
    .post("/api/v1/bookings")
    .set(authHeaders(user))
    .set("Content-Type", "application/json")
    .send(payload);

/**
 * Full PENDING setup: create a booking for `user` and a Razorpay order for it.
 * Returns `{ booking, orderId, payment }`. Assumes `razorpay.orders.create`
 * default implementation is installed (see beforeEach).
 */
async function setupPENDING(user) {
  const hotel = await createHotel();
  const room = await createRoom(hotel, { totalUnits: 5 });
  const bookingRes = await postBooking(user, bookingPayload(hotel, room, user));
  expect(bookingRes.status).toBe(201);
  const booking = bookingRes.body.data;

  const orderRes = await agent()
    .post("/api/v1/payments/create-order")
    .set(authHeaders(user))
    .set("Content-Type", "application/json")
    .send({ bookingId: booking._id });
  expect(orderRes.status).toBe(200);
  const { orderId } = orderRes.body.data;

  const payment = await Payment.findOne({ razorpayOrderId: orderId });
  expect(payment).toBeTruthy();
  return { booking, orderId, payment };
}

/** Compute the client-verify HMAC for orderId|paymentId (RAZORPAY_KEY_SECRET). */
const verifySignature = (orderId, paymentId) => {
  const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
  hmac.update(`${orderId}|${paymentId}`);
  return hmac.digest("hex");
};

/** Build a signed webhook payload. Returns `{ raw, sig }` for sending. */
const signedWebhook = (obj) => {
  const raw = JSON.stringify(obj);
  const sig = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(raw)
    .digest("hex");
  return { raw, sig };
};

const postWebhook = (raw, sig) =>
  agent()
    .post("/api/v1/payments/webhook")
    .set("Content-Type", "application/json")
    .set("x-razorpay-signature", sig)
    .send(raw);

describe("Booking + Payment + Webhook — /api/v1", () => {
  beforeAll(async () => {
    const { booted } = await bootApp({ dbName: "lux_hotel_booking_pay" });
    expect(booted).toBe(true);
  });

  beforeEach(async () => {
    await resetDB();
    jest.clearAllMocks();
    razorpay.orders.create.mockResolvedValue({
      id: `order_${Date.now()}`,
      amount: 12500,
      currency: "INR",
    });
    razorpay.payments.refund.mockResolvedValue({ id: "refund_test_1" });
  });

  afterAll(async () => {
    await closeDB();
  });

  // ─── 1. Booking create ───────────────────────────────────────────────────
  describe("POST /bookings", () => {
    test("creates a PENDING booking with positive pricing + bookingId", async () => {
      const user = await createUser();
      const hotel = await createHotel();
      const room = await createRoom(hotel, { totalUnits: 1 });
      const res = await postBooking(user, bookingPayload(hotel, room, user));

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.bookingId).toBeTruthy();
      expect(res.body.data.pricing.totalAmount).toBeGreaterThan(0);
      expect(res.body.data.nights).toBe(3);
      expect(res.body.data.status).toBe("PENDING");
      expect(res.body.data.user.toString()).toBe(user._id.toString());
    });

    test("missing required fields returns 422", async () => {
      const user = await createUser();
      const res = await agent()
        .post("/api/v1/bookings")
        .set(authHeaders(user))
        .set("Content-Type", "application/json")
        .send({ checkIn: futureDate(14), checkOut: futureDate(17) });
      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(Array.isArray(res.body.errors)).toBe(true);
    });

    test("rejects a room that does not belong to the selected hotel (400)", async () => {
      const user = await createUser();
      // Slugs are unique-indexed and not auto-generated by the factory, so give
      // each hotel in this test a distinct slug to avoid a dup-key collision.
      const hotelA = await createHotel({ name: uniq("HotelA"), slug: uniq("slugA") });
      const hotelB = await createHotel({ name: uniq("HotelB"), slug: uniq("slugB") });
      const strayRoom = await createRoom(hotelB, { totalUnits: 5 });
      const res = await postBooking(
        user,
        bookingPayload(hotelA, strayRoom, user)
      );
      expect(res.status).toBe(400);
    });

    test("rejects guests above room capacity (400)", async () => {
      const user = await createUser();
      const hotel = await createHotel();
      const room = await createRoom(hotel, { maxOccupancy: { adults: 2, children: 1 } });
      const res = await postBooking(
        user,
        bookingPayload(hotel, room, user, { guests: { adults: 3, children: 0 } })
      );
      expect(res.status).toBe(400);
    });

    // `pricing.service.calculateBookingPrice` throws ApiError.badRequest for a
    // <=0 night range, so a reversed (checkOut before checkIn) range is a 400.
    test("checkOut before checkIn returns a 4xx", async () => {
      const user = await createUser();
      const hotel = await createHotel();
      const room = await createRoom(hotel, { totalUnits: 1 });
      const res = await postBooking(
        user,
        bookingPayload(hotel, room, user, { checkOut: futureDate(13) })
      );
      expect(res.status).toBe(400);
    });

    test("exhausts room capacity across the same dates → 409", async () => {
      const user = await createUser();
      const hotel = await createHotel();
      const room = await createRoom(hotel, { totalUnits: 1 });
      const payload = bookingPayload(hotel, room, user);

      const first = await postBooking(user, payload);
      expect(first.status).toBe(201);

      const second = await postBooking(user, payload);
      expect(second.status).toBe(409);
      expect(second.body.success).toBe(false);
    });
  });

  // ─── 2. List / get booking + ACL ─────────────────────────────────────────
  describe("GET /bookings", () => {
    test("returns a paginated array of OWN bookings", async () => {
      const user = await createUser();
      const hotel = await createHotel();
      const room = await createRoom(hotel, { totalUnits: 5 });

      // Two non-overlapping stays for the same user.
      await postBooking(user, bookingPayload(hotel, room, user)); // +14→+17
      await postBooking(user, bookingPayload(hotel, room, user, {
        checkIn: futureDate(20),
        checkOut: futureDate(23),
      }));

      const res = await agent().get("/api/v1/bookings").set(authHeaders(user));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination.total).toBe(2);
    });

    test("GET /bookings/:id returns object for owner", async () => {
      const user = await createUser();
      const hotel = await createHotel();
      const room = await createRoom(hotel, { totalUnits: 1 });
      const created = await postBooking(user, bookingPayload(hotel, room, user));
      const id = created.body.data._id;

      const res = await agent().get(`/api/v1/bookings/${id}`).set(authHeaders(user));
      expect(res.status).toBe(200);
      expect(res.body.data._id.toString()).toBe(id.toString());
    });

    test("GET /bookings/:id → 403 for another user", async () => {
      const owner = await createUser();
      const other = await createUser();
      const hotel = await createHotel();
      const room = await createRoom(hotel, { totalUnits: 1 });
      const created = await postBooking(owner, bookingPayload(hotel, room, owner));
      const id = created.body.data._id;

      const res = await agent().get(`/api/v1/bookings/${id}`).set(authHeaders(other));
      expect(res.status).toBe(403);
    });

    test("GET /bookings/admin/all → ADMIN 200, USER 403", async () => {
      const user = await createUser();
      const admin = await createAdmin();
      const hotel = await createHotel();
      const room = await createRoom(hotel, { totalUnits: 1 });
      await postBooking(user, bookingPayload(hotel, room, user));

      const forbidden = await agent().get("/api/v1/bookings/admin/all").set(authHeaders(user));
      expect(forbidden.status).toBe(403);

      const allowed = await agent().get("/api/v1/bookings/admin/all").set(authHeaders(admin));
      expect(allowed.status).toBe(200);
      expect(Array.isArray(allowed.body.data)).toBe(true);
    });
  });

  // ─── 3. Cancel ───────────────────────────────────────────────────────────
  describe("PATCH /bookings/:id/cancel", () => {
    test("cancels a PENDING booking → CANCELLED", async () => {
      const user = await createUser();
      const hotel = await createHotel();
      const room = await createRoom(hotel, { totalUnits: 1 });
      const created = await postBooking(user, bookingPayload(hotel, room, user));
      const id = created.body.data._id;

      const res = await agent()
        .patch(`/api/v1/bookings/${id}/cancel`)
        .set(authHeaders(user))
        .set("Content-Type", "application/json")
        .send({ reason: "Changed plans." });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("CANCELLED");
      expect(res.body.data.cancellationReason).toBe("Changed plans.");
    });

    test("cancelling another user's booking → 403", async () => {
      const owner = await createUser();
      const other = await createUser();
      const hotel = await createHotel();
      const room = await createRoom(hotel, { totalUnits: 1 });
      const created = await postBooking(owner, bookingPayload(hotel, room, owner));
      const id = created.body.data._id;

      const res = await agent()
        .patch(`/api/v1/bookings/${id}/cancel`)
        .set(authHeaders(other))
        .set("Content-Type", "application/json")
        .send({ reason: "nope" });
      expect(res.status).toBe(403);
    });

    test("cancelling an already-cancelled booking → 400", async () => {
      const user = await createUser();
      const hotel = await createHotel();
      const room = await createRoom(hotel, { totalUnits: 1 });
      const created = await postBooking(user, bookingPayload(hotel, room, user));
      const id = created.body.data._id;

      const first = await agent()
        .patch(`/api/v1/bookings/${id}/cancel`)
        .set(authHeaders(user));
      expect(first.status).toBe(200);

      const second = await agent()
        .patch(`/api/v1/bookings/${id}/cancel`)
        .set(authHeaders(user));
      expect(second.status).toBe(400);
    });
  });

  // ─── 4. Admin status ─────────────────────────────────────────────────────
  describe("PATCH /bookings/admin/:id/status", () => {
    test("ADMIN sets CONFIRMED → 200", async () => {
      const admin = await createAdmin();
      const user = await createUser();
      const hotel = await createHotel();
      const room = await createRoom(hotel, { totalUnits: 1 });
      const created = await postBooking(user, bookingPayload(hotel, room, user));
      const id = created.body.data._id;

      const res = await agent()
        .patch(`/api/v1/bookings/admin/${id}/status`)
        .set(authHeaders(admin))
        .set("Content-Type", "application/json")
        .send({ status: "CONFIRMED" });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("CONFIRMED");
    });

    test("invalid status → 422", async () => {
      const admin = await createAdmin();
      const user = await createUser();
      const hotel = await createHotel();
      const room = await createRoom(hotel, { totalUnits: 1 });
      const created = await postBooking(user, bookingPayload(hotel, room, user));
      const id = created.body.data._id;

      const res = await agent()
        .patch(`/api/v1/bookings/admin/${id}/status`)
        .set(authHeaders(admin))
        .set("Content-Type", "application/json")
        .send({ status: "NOT_A_STATUS" });
      expect(res.status).toBe(422);
    });

    test("non-admin USER → 403", async () => {
      const user = await createUser();
      const hotel = await createHotel();
      const room = await createRoom(hotel, { totalUnits: 1 });
      const created = await postBooking(user, bookingPayload(hotel, room, user));
      const id = created.body.data._id;

      const res = await agent()
        .patch(`/api/v1/bookings/admin/${id}/status`)
        .set(authHeaders(user))
        .set("Content-Type", "application/json")
        .send({ status: "CONFIRMED" });
      expect(res.status).toBe(403);
    });
  });

  // ─── 5. Create order ─────────────────────────────────────────────────────
  describe("POST /payments/create-order", () => {
    test("creates a Razorpay order for the user's PENDING booking", async () => {
      const user = await createUser();
      const hotel = await createHotel();
      const room = await createRoom(hotel, { totalUnits: 1 });
      const created = await postBooking(user, bookingPayload(hotel, room, user));
      const id = created.body.data._id;

      const res = await agent()
        .post("/api/v1/payments/create-order")
        .set(authHeaders(user))
        .set("Content-Type", "application/json")
        .send({ bookingId: id });
      expect(res.status).toBe(200);
      expect(razorpay.orders.create).toHaveBeenCalled();
      expect(res.body.data.orderId).toBeTruthy();
      expect(res.body.data.amount).toBe(12500);
      expect(res.body.data.currency).toBe("INR");
    });

    test("invalid bookingId → 422", async () => {
      const user = await createUser();
      const res = await agent()
        .post("/api/v1/payments/create-order")
        .set(authHeaders(user))
        .set("Content-Type", "application/json")
        .send({ bookingId: "not-an-object-id" });
      expect(res.status).toBe(422);
    });
  });

  // ─── 6. Verify signature ─────────────────────────────────────────────────
  describe("POST /payments/verify", () => {
    test("correct HMAC → success, Payment CAPTURED, Booking CONFIRMED", async () => {
      const user = await createUser();
      const { orderId } = await setupPENDING(user);
      const sig = verifySignature(orderId, "pay_test_1");

      const res = await agent()
        .post("/api/v1/payments/verify")
        .set(authHeaders(user))
        .set("Content-Type", "application/json")
        .send({
          razorpay_order_id: orderId,
          razorpay_payment_id: "pay_test_1",
          razorpay_signature: sig,
        });
      expect(res.status).toBe(200);
      expect(res.body.data.success).toBe(true);

      const payment = await Payment.findOne({ razorpayOrderId: orderId });
      expect(payment.status).toBe("CAPTURED");
      expect(payment.razorpayPaymentId).toBe("pay_test_1");

      const booking = await Booking.findById(payment.booking);
      expect(booking.status).toBe("CONFIRMED");
      expect(booking.payment.toString()).toBe(payment._id.toString());
    });

    test("wrong signature → 400", async () => {
      const user = await createUser();
      const { orderId } = await setupPENDING(user);

      const res = await agent()
        .post("/api/v1/payments/verify")
        .set(authHeaders(user))
        .set("Content-Type", "application/json")
        .send({
          razorpay_order_id: orderId,
          razorpay_payment_id: "pay_test_1",
          razorpay_signature: "deadbeef",
        });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── 7. Webhook (raw body, HMAC) ─────────────────────────────────────────
  describe("POST /payments/webhook", () => {
    test("signed payment.captured → 200 'OK', Payment CAPTURED + Booking CONFIRMED", async () => {
      const user = await createUser();
      const { orderId } = await setupPENDING(user);

      const { raw, sig } = signedWebhook({
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: "pay_wh_1",
              order_id: orderId,
              method: "card",
              international: false,
            },
          },
        },
      });

      const res = await postWebhook(raw, sig);
      expect(res.status).toBe(200);
      expect(res.text).toBe("OK");

      const payment = await Payment.findOne({ razorpayOrderId: orderId });
      expect(payment.status).toBe("CAPTURED");
      expect(payment.method).toBe("card");

      const booking = await Booking.findById(payment.booking);
      expect(booking.status).toBe("CONFIRMED");
    });

    test("payment.failed → 200 'OK', Payment FAILED", async () => {
      const user = await createUser();
      const { orderId } = await setupPENDING(user);

      const { raw, sig } = signedWebhook({
        event: "payment.failed",
        payload: {
          payment: {
            entity: {
              id: "pay_wh_fail",
              order_id: orderId,
              error_code: "BAD_ISSUE",
              error_description: "Card declined",
            },
          },
        },
      });

      const res = await postWebhook(raw, sig);
      expect(res.status).toBe(200);
      expect(res.text).toBe("OK");

      const payment = await Payment.findOne({ razorpayOrderId: orderId });
      expect(payment.status).toBe("FAILED");
    });

    test("invalid signature → 401", async () => {
      await setupPENDING(await createUser());
      const raw = JSON.stringify({ event: "payment.captured" });
      const res = await postWebhook(raw, "bogus_signature");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("signed payload with no payment entity → 200 'OK', no state change", async () => {
      const user = await createUser();
      const { orderId } = await setupPENDING(user);

      const { raw, sig } = signedWebhook({
        event: "refund.processed_by_none",
        payload: { refund: { entity: { id: "rfnd_1" } } },
      });

      const res = await postWebhook(raw, sig);
      expect(res.status).toBe(200);
      expect(res.text).toBe("OK");

      const payment = await Payment.findOne({ razorpayOrderId: orderId });
      expect(payment.status).toBe("CREATED");
    });
  });

  // ─── 8. Payment details ──────────────────────────────────────────────────
  describe("GET /payments/:id", () => {
    test("owner → 200 object; another user → 403", async () => {
      const user = await createUser();
      const { payment } = await setupPENDING(user);
      const other = await createUser();

      const ownerRes = await agent()
        .get(`/api/v1/payments/${payment._id}`)
        .set(authHeaders(user));
      expect(ownerRes.status).toBe(200);
      expect(ownerRes.body.data._id.toString()).toBe(payment._id.toString());

      const forbidden = await agent()
        .get(`/api/v1/payments/${payment._id}`)
        .set(authHeaders(other));
      expect(forbidden.status).toBe(403);
    });
  });

  // ─── 9. Refund (ADMIN) ───────────────────────────────────────────────────
  describe("POST /payments/:id/refund", () => {
    const CAPTURED = async (user) => {
      const { payment } = await setupPENDING(user);
      const sig = verifySignature(payment.razorpayOrderId, "pay_ref_1");
      await agent()
        .post("/api/v1/payments/verify")
        .set(authHeaders(user))
        .set("Content-Type", "application/json")
        .send({
          razorpay_order_id: payment.razorpayOrderId,
          razorpay_payment_id: "pay_ref_1",
          razorpay_signature: sig,
        });
      const captured = await Payment.findById(payment._id);
      expect(captured.status).toBe("CAPTURED");
      return captured;
    };

    test("ADMIN full refund on a CAPTURED payment → 200 REFUNDED + Booking REFUNDED", async () => {
      const admin = await createAdmin();
      const user = await createUser();
      const payment = await CAPTURED(user);

      const res = await agent()
        .post(`/api/v1/payments/${payment._id}/refund`)
        .set(authHeaders(admin))
        .set("Content-Type", "application/json")
        .send({ reason: "Refund requested" });
      expect(res.status).toBe(200);
      expect(razorpay.payments.refund).toHaveBeenCalled();

      const updated = await Payment.findById(payment._id);
      expect(updated.status).toBe("REFUNDED");
      expect(updated.refunds.length).toBe(1);

      const booking = await Booking.findById(payment.booking);
      expect(booking.status).toBe("REFUNDED");
    });

    test("USER → 403", async () => {
      const user = await createUser();
      const payment = await CAPTURED(user);
      const res = await agent()
        .post(`/api/v1/payments/${payment._id}/refund`)
        .set(authHeaders(user))
        .set("Content-Type", "application/json")
        .send({});
      expect(res.status).toBe(403);
    });

    test("invalid amount → 422", async () => {
      const admin = await createAdmin();
      const user = await createUser();
      const payment = await CAPTURED(user);
      const res = await agent()
        .post(`/api/v1/payments/${payment._id}/refund`)
        .set(authHeaders(admin))
        .set("Content-Type", "application/json")
        .send({ amount: -5 });
      expect(res.status).toBe(422);
    });
  });
});