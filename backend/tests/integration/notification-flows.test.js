/* eslint-disable no-console */
/**
 * Integration suite for notification flows under /api/v1:
 *   - REFUND: the affected user is notified (in-app + email) only after a
 *     confirmed, successful refund, with booking/payment/refund metadata, and
 *     duplicate refund events never produce a second notification.
 *   - OFFER: publishing an offer (create-active or activate) notifies every
 *     registered active user (in-app + email); inactive users are skipped and
 *     re-publishing never re-notifies.
 *
 * Razorpay is mocked before src is required (same pattern as
 * booking-cancel-refund.test.js) so the refund path can be driven end-to-end.
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

const { bootApp, resetDB, closeDB, agent } = require("../helpers/app");
const {
  createUser,
  createAdmin,
  authHeaders,
  createHotel,
  createRoom,
  createBooking,
  createPayment,
  offerData,
} = require("../helpers/factories");
const Booking = require("../../src/modules/bookings/booking.model");
const Payment = require("../../src/modules/payments/payment.model");
const Notification = require("../../src/modules/notifications/notification.model");
const notificationService = require("../../src/modules/notifications/notification.service");
const emailService = require("../../src/modules/notifications/email.service");
const { NOTIFICATION_TYPES } = require("../../src/config/constants");

const futureDate = (daysFromNow) => new Date(Date.now() + daysFromNow * 86400000);

/** Poll until `fn()` resolves truthy (for fire-and-forget async side effects). */
async function waitFor(fn, timeout = 2500, interval = 25) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await fn()) return true;
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  return false;
}

const bookingPayload = (hotel, room, user) => ({
  hotel: hotel._id.toString(),
  room: room._id.toString(),
  checkIn: futureDate(14),
  checkOut: futureDate(17),
  guests: { adults: 1, children: 0 },
  guestDetails: { name: user.name, email: user.email, phone: "+91 90000 11111" },
});

const postBooking = (user, payload) =>
  agent().post("/api/v1/bookings").set(authHeaders(user)).set("Content-Type", "application/json").send(payload);

const verifySignature = (orderId, paymentId) => {
  const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
  hmac.update(`${orderId}|${paymentId}`);
  return hmac.digest("hex");
};

/** Full user-cancel flow on a CAPTURED booking → returns the cancel response. */
async function cancelCapturedBooking(user) {
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
  const payment = await Payment.findOne({ razorpayOrderId: orderRes.body.data.orderId });

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
  const bookingDoc = await Booking.findById(booking._id);
  const cancelRes = await agent()
    .patch(`/api/v1/bookings/${bookingDoc._id}/cancel`)
    .set(authHeaders(user))
    .set("Content-Type", "application/json")
    .send({ reason: "Changed plans." });
  expect(cancelRes.status).toBe(200);
  return { booking: bookingDoc, payment: captured, cancelRes };
}

const adminCreateOffer = (admin, payload) =>
  agent().post("/api/v1/offers").set(authHeaders(admin)).set("Content-Type", "application/json").send(payload);

const adminUpdateOffer = (admin, id, payload) =>
  agent().put(`/api/v1/offers/${id}`).set(authHeaders(admin)).set("Content-Type", "application/json").send(payload);

describe("Notification flows — /api/v1", () => {
  beforeAll(async () => {
    const { booted } = await bootApp({ dbName: "lux_hotel_booking_notification_flows" });
    expect(booted).toBe(true);
  });

  beforeEach(async () => {
    await resetDB();
    jest.clearAllMocks();
    razorpay.orders.create.mockResolvedValue({ id: `order_${Date.now()}`, amount: 12500, currency: "INR" });
    razorpay.payments.refund.mockResolvedValue({ id: "refund_auto_1" });
  });

  afterAll(async () => {
    await closeDB();
  });

  // ─── 1. Refund notifications ─────────────────────────────────────────────
  describe("Refund → user notification", () => {
    test("successful full refund creates ONE REFUND notification (in-app) with metadata and sends email", async () => {
      const user = await createUser();
      const { booking, payment } = await cancelCapturedBooking(user);

      const notif = await Notification.findOne({ user: user._id, type: NOTIFICATION_TYPES.REFUND });
      expect(notif).toBeTruthy();
      expect(notif.isRead).toBe(false);
      expect(notif.title).toBe("Refund Processed");
      expect(notif.message).toContain(booking.bookingId);
      expect(notif.link).toContain(booking._id.toString());
      expect(notif.data).toMatchObject({
        bookingId: booking._id.toString(),
        paymentId: payment._id.toString(),
        refundId: "refund_auto_1",
        amount: payment.amount,
        currency: "INR",
      });
      expect(notif.data.status).toBe("REFUNDED");
      expect(notif.data.timestamp).toBeTruthy();
      expect(notif.data.eventKey).toBe("refund:refund_auto_1");

      // Fire-and-forget email delivery completes async.
      const emailed = await waitFor(() => emailService.sendRefundEmail.mock.calls.length >= 1);
      expect(emailed).toBe(true);
      const [emailUser, emailRefund] = emailService.sendRefundEmail.mock.calls[0];
      expect(emailUser._id.toString()).toBe(user._id.toString());
      expect(emailRefund.refundId).toBe("refund_auto_1");
      expect(emailRefund.amount).toBe(payment.amount);

      // Notification is visible through the existing in-app API + unread-count support.
      const listRes = await agent().get("/api/v1/notifications").set(authHeaders(user));
      expect(listRes.status).toBe(200);
      const mine = listRes.body.data.filter((n) => n.type === NOTIFICATION_TYPES.REFUND);
      expect(mine.length).toBe(1);
    });

    test("re-processing the same refund event never duplicates the notification or email", async () => {
      const user = await createUser();
      const { booking, payment } = await cancelCapturedBooking(user);

      // Let the cancel-flow (fire-and-forget) email settle, then isolate this
      // window so the assertion below measures only the duplicate event.
      const settled = await waitFor(() => emailService.sendRefundEmail.mock.calls.length >= 1);
      expect(settled).toBe(true);
      emailService.sendRefundEmail.mockClear();

      const refund = {
        refundId: "refund_auto_1",
        amount: payment.amount,
        currency: "INR",
        status: "REFUNDED",
        timestamp: new Date(),
      };

      // Simulate a retried/duplicate refund-finalization event.
      const again = await notificationService.createRefundNotification(user, booking, payment, refund);
      expect(again._id.toString()).toBe(
        (await Notification.findOne({ user: user._id, type: NOTIFICATION_TYPES.REFUND }))._id.toString()
      );
      const count = await Notification.countDocuments({ user: user._id, type: NOTIFICATION_TYPES.REFUND });
      expect(count).toBe(1);

      // The deduped path must not fire a second email.
      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(emailService.sendRefundEmail).not.toHaveBeenCalled();
    });
  });

  // ─── 2. Offer broadcast on create ────────────────────────────────────────
  describe("Offer published → broadcast to all active users", () => {
    test("creating an active offer notifies every active user (in-app + email) and skips inactive users", async () => {
      // The admin is also a registered (active) user → included in the broadcast.
      const admin = await createAdmin();
      const users = [await createUser(), await createUser()];
      const inactive = await createUser({ isActive: false });
      const active = [admin, ...users];
      const activeIds = active.map((u) => u._id.toString());

      const createRes = await adminCreateOffer(admin, offerData({ code: "SUMMER25" }));
      expect(createRes.status).toBe(201);

      const both = await waitFor(async () => {
        const n = await Notification.countDocuments({ type: NOTIFICATION_TYPES.OFFER, user: { $in: activeIds } });
        return n >= active.length;
      });
      expect(both).toBe(true);

      for (const u of active) {
        const notif = await Notification.findOne({ user: u._id, type: NOTIFICATION_TYPES.OFFER });
        expect(notif).toBeTruthy();
        expect(notif.title).toBe("Test Offer");
        expect(notif.message).toContain("SUMMER25");
        expect(notif.data).toMatchObject({ code: "SUMMER25", discountText: expect.any(String) });
        expect(notif.data.eventKey).toBe(`offer:${notif.data.offerId}`);
      }

      // Inactive user is skipped.
      expect(await Notification.countDocuments({ user: inactive._id, type: NOTIFICATION_TYPES.OFFER })).toBe(0);

      const emailed = await waitFor(() => emailService.sendOfferEmail.mock.calls.length >= active.length);
      expect(emailed).toBe(true);
      expect(emailService.sendOfferEmail.mock.calls.length).toBe(active.length);
      const [firstUser, firstOffer] = emailService.sendOfferEmail.mock.calls[0];
      expect(activeIds).toContain(firstUser._id.toString());
      expect(firstOffer.code).toBe("SUMMER25");
      expect(firstOffer.discountText).toBeTruthy();
    });

    test("inactive-offer creation sends no notifications; activating it via admin publishes once (no duplicate on re-activate)", async () => {
      const admin = await createAdmin();
      const user = await createUser();
      // Both admin + user are active → publish broadcasts to both.
      const activeCount = 2;

      const createRes = await adminCreateOffer(admin, offerData({ code: "WINTER30", isActive: false }));
      expect(createRes.status).toBe(201);
      const offerId = createRes.body.data._id;
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(await Notification.countDocuments({ user: user._id, type: NOTIFICATION_TYPES.OFFER })).toBe(0);
      expect(emailService.sendOfferEmail).not.toHaveBeenCalled();

      const publishRes = await adminUpdateOffer(admin, offerId, { isActive: true });
      expect(publishRes.status).toBe(200);
      const published = await waitFor(async () =>
        (await Notification.countDocuments({ user: user._id, type: NOTIFICATION_TYPES.OFFER })) === 1
      );
      expect(published).toBe(true);
      // Let the publish fan-out (including the admin's own copy) settle.
      const settled = await waitFor(() => emailService.sendOfferEmail.mock.calls.length >= activeCount);
      expect(settled).toBe(true);
      expect(emailService.sendOfferEmail.mock.calls.length).toBe(activeCount);

      // Already active → not a new publication → no extra notifications.
      await adminUpdateOffer(admin, offerId, { title: "Winter Escape" });
      const rePublish = await waitFor(async () =>
        (await Notification.countDocuments({ user: user._id, type: NOTIFICATION_TYPES.OFFER })) >= 2
      );
      expect(rePublish).toBe(false);
      expect(await Notification.countDocuments({ user: user._id, type: NOTIFICATION_TYPES.OFFER })).toBe(1);
    });

    test("broadcast is idempotent — notifyOfferCreated twice yields one notification per user", async () => {
      const user = await createUser();
      const offer = await require("../../src/modules/offers/offer.model").create(
        offerData({ code: "FLASH40" })
      );

      const first = await notificationService.notifyOfferCreated(offer);
      expect(first).toBe(1);
      const second = await notificationService.notifyOfferCreated(offer);
      expect(second).toBe(0);

      expect(await Notification.countDocuments({ user: user._id, type: NOTIFICATION_TYPES.OFFER })).toBe(1);

      // First call fired the email; the deduped second call must not re-send.
      const emailed = await waitFor(() => emailService.sendOfferEmail.mock.calls.length >= 1);
      expect(emailed).toBe(true);
      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(emailService.sendOfferEmail.mock.calls.length).toBe(1);
    });
  });
});