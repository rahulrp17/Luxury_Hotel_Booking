/* eslint-disable no-console */
/**
 * Integration suite for the user-cancellation → automatic-refund money path
 * under /api/v1, exercised through the real Express app.
 *
 * Covers the NEW refund-first cancellation contract:
 *   - Unpaid/PENDING bookings cancel normally (CANCELLED, refund: null)
 *   - A CAPTURED paid booking is only cancelled AFTER the gateway accepts the
 *     refund; on gateway rejection the booking stays CONFIRMED and no false
 *     success is reported
 *   - Full refund → Booking REFUNDED + Payment REFUNDED; partial (late-cancel
 *     penalty) → Booking CANCELLED + Payment stays CAPTURED with a refund entry
 *   - Duplicate / concurrent cancellation only ever triggers ONE gateway refund
 *   - Ownership is enforced; admin manual refunds keep working
 *
 * Razorpay is mocked BEFORE anything from src is required (same pattern as
 * booking-payment-webhook.test.js). The service layer reaches the gateway via
 * `getRazorpayInstance()` and drives it with `payments.refund`, so the mock
 * exposes jest.fn()s both top-level AND through `getRazorpayInstance()`.
 */
process.env.RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "test_key_secret";
process.env.RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "test_webhook_secret";

const crypto = require("crypto");
const mongoose = require("mongoose");

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

const { bootApp, resetDB, closeDB, agent } = require("../helpers/app");
const {
  createUser,
  createAdmin,
  authHeaders,
  createHotel,
  createRoom,
  createBooking,
  createPayment,
} = require("../helpers/factories");
const Booking = require("../../src/modules/bookings/booking.model");
const Payment = require("../../src/modules/payments/payment.model");
const paymentService = require("../../src/modules/payments/payment.service");

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
 * Full PENDING setup: create a booking for `user` + a Razorpay order for it.
 * Returns `{ booking, orderId, payment }`.
 */
async function setupPENDING(user, payloadOverrides = {}) {
  const hotel = await createHotel();
  const room = await createRoom(hotel, { totalUnits: 5 });
  const bookingRes = await postBooking(user, bookingPayload(hotel, room, user, payloadOverrides));
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

/** Advance a PENDING setup to CONFIRMED booking + CAPTURED payment. */
async function makeCAPTURED(user, payloadOverrides = {}) {
  const { booking, payment } = await setupPENDING(user, payloadOverrides);
  const sig = verifySignature(payment.razorpayOrderId, "pay_auto_1");
  const verifyRes = await agent()
    .post("/api/v1/payments/verify")
    .set(authHeaders(user))
    .set("Content-Type", "application/json")
    .send({
      razorpay_order_id: payment.razorpayOrderId,
      razorpay_payment_id: "pay_auto_1",
      razorpay_signature: sig,
    });
  expect(verifyRes.status).toBe(200);
  const captured = await Payment.findById(payment._id);
  expect(captured.status).toBe("CAPTURED");
  const bookingDoc = await Booking.findById(booking._id);
  expect(bookingDoc.status).toBe("CONFIRMED");
  return { booking: bookingDoc, payment: captured };
}

/** Build a CONFIRMED booking + payment directly (factory shortcut). */
async function makePaidBooking(user, { paymentStatus = "CAPTURED", razorpayPaymentId = "pay_direct_1", checkIn } = {}) {
  const hotel = await createHotel();
  const room = await createRoom(hotel, { totalUnits: 5 });
  const stayIn = checkIn || futureDate(14);
  const booking = await createBooking({
    user: user._id,
    hotel: hotel._id,
    room: room._id,
    checkIn: stayIn,
    checkOut: new Date(new Date(stayIn).getTime() + 3 * 86400000),
    status: "CONFIRMED",
  });
  const payment = await createPayment({
    booking: booking._id,
    user: user._id,
    amount: booking.pricing.totalAmount,
    currency: "INR",
    status: paymentStatus,
    refunds: [],
    ...(razorpayPaymentId ? { razorpayPaymentId } : {}),
  });
  booking.payment = payment._id;
  await booking.save();
  return { booking, payment };
}

const cancelReq = (bookingId, user, reason = "Changed plans.") =>
  agent()
    .patch(`/api/v1/bookings/${bookingId}/cancel`)
    .set(authHeaders(user))
    .set("Content-Type", "application/json")
    .send({ reason });

describe("Booking cancellation + automatic refund — /api/v1", () => {
  beforeAll(async () => {
    const { booted } = await bootApp({ dbName: "lux_hotel_booking_cancel_refund" });
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
    razorpay.payments.refund.mockResolvedValue({ id: "refund_auto_1" });
  });

  afterAll(async () => {
    await closeDB();
  });

  // ─── 1. User cancellation ────────────────────────────────────────────────
  describe("PATCH /bookings/:id/cancel", () => {
    test("cancels an unpaid PENDING booking → CANCELLED, refund null, no gateway call", async () => {
      const user = await createUser();
      const { booking } = await setupPENDING(user);

      const res = await cancelReq(booking._id, user);
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("CANCELLED");
      expect(res.body.data.refund).toBeNull();
      expect(razorpay.payments.refund).not.toHaveBeenCalled();
    });

    test("cancels a CAPTURED paid booking → refund initiated, Booking + Payment REFUNDED", async () => {
      const user = await createUser();
      const { booking, payment } = await makeCAPTURED(user);

      const res = await cancelReq(booking._id, user, "Changed my travel dates.");
      expect(res.status).toBe(200);
      expect(res.body.message).toContain("refund initiated");
      expect(res.body.data.refund).toMatchObject({
        initiated: true,
        refundId: "refund_auto_1",
        status: "PROCESSED",
      });
      expect(res.body.data.refund.amount).toBe(payment.amount);
      expect(res.body.data.refund.currency).toBe("INR");

      expect(razorpay.payments.refund).toHaveBeenCalledTimes(1);
      // Minimal payload: only { amount } — no notes/receipt/speed fields.
      expect(razorpay.payments.refund).toHaveBeenCalledWith(payment.razorpayPaymentId, {
        amount: Math.round(payment.amount * 100),
      });

      const updatedPayment = await Payment.findById(payment._id);
      expect(updatedPayment.status).toBe("REFUNDED");
      expect(updatedPayment.refunds.length).toBe(1);
      expect(updatedPayment.refunds[0]).toMatchObject({
        refundId: "refund_auto_1",
        amount: payment.amount,
        status: "PROCESSED",
      });

      const updatedBooking = await Booking.findById(booking._id);
      expect(updatedBooking.status).toBe("REFUNDED");
      expect(updatedBooking.refundAmount).toBe(payment.amount);
    });

    test("blocks cancellation when the gateway rejects the refund → 500, booking stays CONFIRMED", async () => {
      const user = await createUser();
      const { booking, payment } = await makeCAPTURED(user);
      razorpay.payments.refund.mockRejectedValue({
        statusCode: 400,
        error: { code: "BAD_REQUEST_ERROR", description: "invalid request sent" },
      });

      const res = await cancelReq(booking._id, user);
      expect(res.status).toBe(500);
      expect(res.body.message).toContain("was not cancelled because the refund could not be processed");
      expect(razorpay.payments.refund).toHaveBeenCalledTimes(1);

      const updatedBooking = await Booking.findById(booking._id);
      expect(updatedBooking.status).toBe("CONFIRMED");
      const updatedPayment = await Payment.findById(payment._id);
      expect(updatedPayment.status).toBe("CAPTURED");
      // The claim was released as FAILED so a retry stays possible.
      expect(updatedPayment.refunds.length).toBe(1);
      expect(updatedPayment.refunds[0].status).toBe("FAILED");
    });

    test("blocks cancellation on gateway authentication error → 500, no false success", async () => {
      const user = await createUser();
      const { booking, payment } = await makeCAPTURED(user);
      razorpay.payments.refund.mockRejectedValue({
        statusCode: 401,
        error: { code: "BAD_REQUEST_ERROR", description: "Authentication credentials missing or incorrect" },
      });

      const res = await cancelReq(booking._id, user);
      expect(res.status).toBe(500);
      expect(res.body.message).toContain("was not cancelled");

      expect((await Booking.findById(booking._id)).status).toBe("CONFIRMED");
      expect((await Payment.findById(payment._id)).status).toBe("CAPTURED");
    });

    test("partial refund on late cancellation (within 24h) → CANCELLED, payment stays CAPTURED with refund entry", async () => {
      const user = await createUser();
      // Check-in ~20h out → past the 24h free-cancellation deadline → penalty.
      const { booking, payment } = await makePaidBooking(user, { checkIn: futureDate(0.8) });

      const res = await cancelReq(booking._id, user, "Late change of plans");
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("CANCELLED");
      expect(res.body.data.refundAmount).toBeGreaterThan(0);
      expect(res.body.data.refundAmount).toBeLessThan(payment.amount);

      const paidPaise = Math.round(res.body.data.refundAmount * 100);
      expect(razorpay.payments.refund).toHaveBeenCalledWith(payment.razorpayPaymentId, { amount: paidPaise });

      const updatedPayment = await Payment.findById(payment._id);
      expect(updatedPayment.status).toBe("CAPTURED"); // partial → not fully refunded
      expect(updatedPayment.refunds.length).toBe(1);
      expect(updatedPayment.refunds[0].amount).toBe(res.body.data.refundAmount);
    });

    test("booking with an un-captured (CREATED) payment cancels normally, no gateway call", async () => {
      const user = await createUser();
      const { booking } = await makePaidBooking(user, { paymentStatus: "CREATED" });

      const res = await cancelReq(booking._id, user);
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("CANCELLED");
      expect(res.body.data.refund).toBeNull();
      expect(razorpay.payments.refund).not.toHaveBeenCalled();
    });

    test("payment missing razorpayPaymentId → cancellation blocked (400), booking unchanged", async () => {
      const user = await createUser();
      const { booking } = await makePaidBooking(user, { razorpayPaymentId: null });

      const res = await cancelReq(booking._id, user);
      expect(res.status).toBe(400);
      expect(res.body.message).toContain("no Razorpay payment reference");

      expect((await Booking.findById(booking._id)).status).toBe("CONFIRMED");
      expect(razorpay.payments.refund).not.toHaveBeenCalled();
    });

    test("duplicate cancellation → 400, gateway called exactly once", async () => {
      const user = await createUser();
      const { booking } = await makeCAPTURED(user);

      const first = await cancelReq(booking._id, user);
      expect(first.status).toBe(200);

      const second = await cancelReq(booking._id, user);
      expect(second.status).toBe(400);

      expect(razorpay.payments.refund).toHaveBeenCalledTimes(1);
      expect((await Payment.findOne({ booking: booking._id })).refunds.length).toBe(1);
    });

    test("another user cannot cancel someone else's booking → 403", async () => {
      const owner = await createUser();
      const other = await createUser();
      const { booking } = await makeCAPTURED(owner);

      const res = await cancelReq(booking._id, other, "nope");
      expect(res.status).toBe(403);
      expect(razorpay.payments.refund).not.toHaveBeenCalled();
    });

    test("concurrent double-cancel → exactly ONE gateway refund and one refund record", async () => {
      const user = await createUser();
      const { booking, payment } = await makeCAPTURED(user);
      // Hold the gateway response open so both requests pass the read guard
      // before either finalizes — the atomic claim must let only one through.
      razorpay.payments.refund.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ id: "refund_race_1" }), 50))
      );

      const [a, b] = await Promise.all([cancelReq(booking._id, user), cancelReq(booking._id, user)]);
      const codes = [a.status, b.status].sort();
      expect(codes[0]).toBe(200);
      expect(codes[1]).toBe(400);

      expect(razorpay.payments.refund).toHaveBeenCalledTimes(1);
      const updatedPayment = await Payment.findById(payment._id);
      expect(updatedPayment.refunds.length).toBe(1);
      expect(updatedPayment.status).toBe("REFUNDED");
      expect((await Booking.findById(booking._id)).status).toBe("REFUNDED");
    });
  });

  // ─── 2. Admin refund compatibility ───────────────────────────────────────
  describe("POST /payments/:id/refund (admin)", () => {
    test("admin manual refund still works → Payment REFUNDED + Booking REFUNDED", async () => {
      const admin = await createAdmin();
      const user = await createUser();
      const { booking, payment } = await makeCAPTURED(user);

      const res = await agent()
        .post(`/api/v1/payments/${payment._id}/refund`)
        .set(authHeaders(admin))
        .set("Content-Type", "application/json")
        .send({ reason: "Manual refund" });
      expect(res.status).toBe(200);
      expect(razorpay.payments.refund).toHaveBeenCalledTimes(1);

      expect((await Payment.findById(payment._id)).status).toBe("REFUNDED");
      expect((await Booking.findById(booking._id)).status).toBe("REFUNDED");
    });
  });

  // ─── 3. PaymentService.initiateRefund guards ─────────────────────────────
  describe("PaymentService.initiateRefund — guards", () => {
    test("payment not found → 404", async () => {
      await expect(
        paymentService.initiateRefund(new mongoose.Types.ObjectId(), null, "test")
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    test("already REFUNDED payment → 400", async () => {
      const user = await createUser();
      const { payment } = await makePaidBooking(user, {});
      await Payment.findByIdAndUpdate(payment._id, { status: "REFUNDED" });
      await expect(
        paymentService.initiateRefund(payment._id, null, "test")
      ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining("already been refunded") });
    });

    test("payment not CAPTURED → 400", async () => {
      const user = await createUser();
      const { payment } = await makePaidBooking(user, { paymentStatus: "CREATED" });
      await expect(
        paymentService.initiateRefund(payment._id, null, "test")
      ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining("Only captured payments") });
    });

    test("duplicate refund (existing PROCESSED record) → 400", async () => {
      const user = await createUser();
      const { payment } = await makePaidBooking(user, {});
      await Payment.updateOne(
        { _id: payment._id },
        { $push: { refunds: { refundId: "refund_prev", amount: 10, status: "PROCESSED" } } }
      );
      await expect(
        paymentService.initiateRefund(payment._id, null, "test")
      ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining("already been initiated") });
      expect(razorpay.payments.refund).not.toHaveBeenCalled();
    });

    test("non-positive refund amount → 400", async () => {
      const user = await createUser();
      const { payment } = await makePaidBooking(user, {});
      await expect(
        paymentService.initiateRefund(payment._id, 0, "test")
      ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining("positive") });
      expect(razorpay.payments.refund).not.toHaveBeenCalled();
    });
  });
});
