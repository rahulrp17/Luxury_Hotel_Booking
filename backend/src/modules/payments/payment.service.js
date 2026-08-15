const crypto = require("crypto");
const Payment = require("./payment.model");
const Booking = require("../bookings/booking.model");
const User = require("../users/user.model");
const ApiError = require("../../utils/ApiError");
const { getRazorpayInstance } = require("../../config/razorpay");
const { PAYMENT_STATUS, BOOKING_STATUS, NOTIFICATION_TYPES } = require("../../config/constants");
const notificationService = require("../notifications/notification.service");
const logger = require("../../config/logger");
const { invalidateAnalyticsCache } = require("../analytics/analytics.cache");

class PaymentService {
  /**
   * Create Razorpay Order
   */
  async createOrder(userId, bookingId) {
    const booking = await Booking.findOne({ _id: bookingId, user: userId });
    
    if (!booking) {
      throw ApiError.notFound("Booking not found.");
    }
    
    if (booking.status !== BOOKING_STATUS.PENDING) {
      throw ApiError.badRequest(`Booking is already in ${booking.status} state.`);
    }

    const totalAmount = Number(booking.pricing?.totalAmount);
    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      throw ApiError.badRequest("Invalid booking amount. Cannot create a payment order.");
    }

    const razorpay = getRazorpayInstance();
    const amountInPaise = Math.round(totalAmount * 100);

    const options = {
      amount: amountInPaise,
      currency: booking.pricing.currency || "INR",
      receipt: `receipt_${booking._id}`,
      payment_capture: 1, // Auto-capture
    };

    try {
      const order = await razorpay.orders.create(options);

      // Create initial payment record
      await Payment.create({
        booking: booking._id,
        user: userId,
        razorpayOrderId: order.id,
        amount: totalAmount,
        currency: order.currency,
        status: PAYMENT_STATUS.CREATED,
      });

      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
      };
    } catch (error) {
      logger.error(
        `Razorpay order creation failed: ${error?.error?.description || error?.message}`
      );
      // Never hide WHAT failed behind a bare "Payment gateway error". The SDK
      // surfaces a structured error; map it to a meaningful 500 message without
      // ever forwarding secrets to the client.
      const isAuthFailure =
        error?.statusCode === 401 || /auth/i.test(error?.error?.description || "");
      if (isAuthFailure) {
        throw ApiError.internal(
          "Payment gateway authentication failed. Verify the Razorpay API key pair configured on the server."
        );
      }
      throw ApiError.internal(
        `Payment gateway error: ${error?.error?.description || "please try again"}`
      );
    }
  }

  /**
   * Verify Payment Signature (Client call)
   */
  async verifyPayment(userId, { razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
    const payment = await Payment.findOne({ razorpayOrderId, user: userId });
    
    if (!payment) {
      throw ApiError.notFound("Payment record not found.");
    }

    if (payment.status === PAYMENT_STATUS.CAPTURED) {
      return { success: true, alreadyCaptured: true };
    }

    // Verify HMAC signature
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpaySignature) {
      payment.status = PAYMENT_STATUS.FAILED;
      await payment.save();
      throw ApiError.badRequest("Payment verification failed. Invalid signature.");
    }

    // Update payment as captured
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.status = PAYMENT_STATUS.CAPTURED;
    payment.capturedAt = new Date();
    await payment.save();

    // Update booking status
    const booking = await Booking.findByIdAndUpdate(
      payment.booking,
      {
        status: BOOKING_STATUS.CONFIRMED,
        payment: payment._id
      },
      { new: true }
    ).populate("hotel").populate("room").populate("user");

    // Send confirmation notification (in-app + email) — non-blocking on failure.
    // The user may be null if the referenced account was deleted.
    if (booking?.user?._id) {
      try {
        await notificationService.createNotification(booking.user._id, {
          type: NOTIFICATION_TYPES.BOOKING_CONFIRMED,
          title: "Booking Confirmed",
          message: `Your booking ${booking.bookingId} is confirmed.`,
          link: `/account/booking/${booking._id}`,
          data: { bookingId: booking._id },
          channels: { inApp: true, email: true, sms: false },
          context: { user: booking.user, booking },
        });
      } catch (err) {
        logger.warn(`Failed to queue booking confirmation for ${booking._id}: ${err.message}`);
      }
    }

    // The dashboard's revenue/status KPIs changed the moment this payment
    // captured — drop the cached analytics so admins see it immediately.
    await invalidateAnalyticsCache();

    return { success: true, booking };
  }

  /**
   * Handle Razorpay Webhook (Server-to-Server fallback)
   * The body received here is a Buffer of the raw request body (see app.js raw
   * parser) because Razorpay signs the exact transmitted bytes. We verify the
   * HMAC over those raw bytes before parsing the JSON.
   */
  async handleWebhook(body, signature) {
    if (!signature) {
      throw ApiError.unauthorized("Missing signature header.");
    }

    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET);
    hmac.update(body); // raw Buffer
    const generatedSignature = hmac.digest("hex");

    if (!this._safeEqual(generatedSignature, signature)) {
      throw ApiError.unauthorized("Invalid webhook signature.");
    }

    let payload;
    try {
      payload = JSON.parse(body.toString("utf8"));
    } catch (err) {
      throw ApiError.badRequest("Invalid webhook payload.");
    }

    const { event } = payload;

    // Only payment.* events carry a payment entity; extract it guardedly so a
    // validly-signed but different webhook (e.g. refund.*) never throws.
    const paymentEntity = payload?.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;

    // Secret-free observability for delivery tracing. Public gateway identifiers
    // only — never the signature, webhook secret, credentials, or customer data.
    logger.info(
      `Webhook received: event=${event} paymentId=${paymentEntity?.id || "(none)"} orderId=${orderId || "(none)"}`
    );

    if (!paymentEntity) {
      logger.warn(`Webhook event "${event}" skipped (no payment entity).`);
      return { success: true, acknowledged: true };
    }

    if (event === "payment.captured") {
      const payment = await Payment.findOne({ razorpayOrderId: orderId });

      // Idempotency check
      if (payment && payment.status !== PAYMENT_STATUS.CAPTURED) {
        payment.razorpayPaymentId = paymentEntity.id;
        payment.status = PAYMENT_STATUS.CAPTURED;
        payment.method = paymentEntity.method;
        payment.bank = paymentEntity.bank;
        payment.wallet = paymentEntity.wallet;
        payment.vpa = paymentEntity.vpa;
        payment.cardId = paymentEntity.card_id;
        payment.international = paymentEntity.international;
        payment.capturedAt = new Date();
        await payment.save();

        await Booking.findByIdAndUpdate(payment.booking, {
          status: BOOKING_STATUS.CONFIRMED,
          payment: payment._id,
        });

        // Send confirmation notification (in-app + email) — non-blocking on failure
        try {
          const confirmed = await Booking.findById(payment.booking).populate("user");
          if (confirmed?.user?._id) {
            await notificationService.createNotification(confirmed.user._id, {
              type: NOTIFICATION_TYPES.BOOKING_CONFIRMED,
              title: "Booking Confirmed",
              message: `Your booking ${confirmed.bookingId} is confirmed.`,
              link: `/account/booking/${confirmed._id}`,
              data: { bookingId: confirmed._id },
              channels: { inApp: true, email: true, sms: false },
              context: { user: confirmed.user, booking: confirmed },
            });
          }
        } catch (err) {
          logger.warn(`Failed to queue booking confirmation for ${payment.booking}: ${err.message}`);
        }

        logger.info(`Payment ${paymentEntity.id} captured via webhook.`);
        await invalidateAnalyticsCache();
      }
    } else if (event === "payment.failed") {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: orderId },
        {
          status: PAYMENT_STATUS.FAILED,
          errorCode: paymentEntity.error_code,
          errorDescription: paymentEntity.error_description,
          failedAt: new Date(),
        }
      );

      logger.info(`Payment ${paymentEntity.id} failed via webhook.`);
    }

    return true;
  }

  /**
   * Constant-time signature comparison
   */
  _safeEqual(a, b) {
    const aBuf = Buffer.from(String(a));
    const bBuf = Buffer.from(String(b));
    if (aBuf.length !== bBuf.length) return false;
    return crypto.timingSafeEqual(aBuf, bBuf);
  }

  /**
   * Initiate Refund (Admin or System)
   *
   * The frontend sends the Payment's MongoDB _id; the payment record is resolved
   * here and the real Razorpay payment ID is read from `payment.razorpayPaymentId`,
   * so a client can never target an arbitrary Razorpay payment directly. Amount
   * and currency are taken from the stored, server-authoritative record.
   *
   * Concurrency: the refund is CLAIMED atomically before the gateway call by
   * pushing a PENDING record into `payment.refunds` under a filter that only
   * matches a CAPTURED payment with no non-FAILED refund. Two simultaneous
   * requests (e.g. a double-clicked Cancel, or user-cancel + admin-refund) may
   * both read the payment, but only one can claim — the loser receives null and
   * is rejected, so the gateway is never called twice for one payment.
   */
  async initiateRefund(paymentId, amount = null, reason = "Requested by user") {
    // 1. Resolve the payment record (source of truth for the gateway details)
    const payment = await Payment.findById(paymentId);
    if (!payment) throw ApiError.notFound("Payment not found.");

    const booking = await Booking.findById(payment.booking).select("bookingId").lean();

    // Secret-free context reused in every log line below. `razorpayPaymentId`
    // is a payment identifier, not a credential — safe to log.
    const context = {
      paymentId: payment._id.toString(),
      bookingId: booking?.bookingId || String(payment.booking || ""),
      razorpayPaymentId: payment.razorpayPaymentId || null,
      amount: payment.amount,
      currency: payment.currency || "INR",
    };

    // 2. State guards — only a captured, not-yet-refunded payment may be refunded
    if (payment.status === PAYMENT_STATUS.REFUNDED) {
      throw ApiError.badRequest("This payment has already been refunded.");
    }
    if (payment.status !== PAYMENT_STATUS.CAPTURED) {
      throw ApiError.badRequest(
        `Only captured payments can be refunded (current status: ${payment.status}).`
      );
    }

    const hasInitiatedRefund = payment.refunds.some((r) => r.status !== "FAILED");
    if (hasInitiatedRefund) {
      throw ApiError.badRequest("A refund has already been initiated for this payment.");
    }

    if (!payment.razorpayPaymentId) {
      logger.error(`Refund blocked: payment has no Razorpay payment reference. ${JSON.stringify(context)}`);
      throw ApiError.badRequest(
        "This payment has no Razorpay payment reference, so it cannot be refunded through the gateway."
      );
    }

    // 3. Amount validation (default = full captured amount; never exceed it)
    const fullAmount = payment.amount;
    let refundRupees = fullAmount;
    if (amount !== null && amount !== undefined) {
      const requested = Number(amount);
      if (!Number.isFinite(requested) || requested <= 0) {
        throw ApiError.badRequest("Refund amount must be a positive number.");
      }
      // Only refunds the gateway actually accepted reduce the refundable total.
      // A FAILED attempt recorded a claim but moved no money, so it must not
      // shrink the amount a retry can refund.
      const alreadyRefunded = payment.refunds
        .filter((r) => r.status === "PROCESSED")
        .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
      const remaining = Math.max(0, fullAmount - alreadyRefunded);
      if (requested > remaining) {
        throw ApiError.badRequest(
          "Refund amount exceeds the amount still refundable for this payment."
        );
      }
      refundRupees = requested;
    }
    const refundAmountPaise = Math.round(refundRupees * 100);

    // 4. Atomically claim the refund BEFORE calling the gateway. The filter only
    //    matches a payment with no non-FAILED refund, so concurrent duplicate
    //    requests can never both win — the loser's findOneAndUpdate returns null.
    const claimId = `pending_${crypto.randomBytes(8).toString("hex")}`;
    const claimed = await Payment.findOneAndUpdate(
      {
        _id: paymentId,
        status: PAYMENT_STATUS.CAPTURED,
        refunds: { $not: { $elemMatch: { status: { $ne: "FAILED" } } } },
      },
      {
        $push: {
          refunds: {
            refundId: claimId,
            amount: refundRupees,
            reason,
            status: "PENDING",
          },
        },
      }
    );

    if (!claimed) {
      throw ApiError.badRequest("A refund has already been initiated for this payment.");
    }

    // 5. Call the gateway with the smallest valid payload. The `notes` field
    //    was rejected by the live account (`BAD_REQUEST_ERROR: invalid request
    //    sent`), so the cancellation reason lives only in MongoDB and never
    //    reaches Razorpay.
    const razorpay = getRazorpayInstance();
    let refund;
    try {
      refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
        amount: refundAmountPaise,
      });
    } catch (error) {
      // Release the claim so a retry is possible. Razorpay SDK errors carry the
      // real reason in `error.error.description`; the top-level `.message` is
      // undefined. Log structurally (never secrets) and surface a meaningful,
      // client-safe message.
      await Payment.updateOne(
        {
          _id: paymentId,
          refunds: { $elemMatch: { refundId: claimId, status: "PENDING" } },
        },
        { $set: { "refunds.$.status": "FAILED", "refunds.$.processedAt": new Date() } }
      );
      const gatewayDescription = error?.error?.description || "";
      logger.error(
        `Razorpay refund request failed. ${JSON.stringify({
          ...context,
          refundRupees,
          refundAmountPaise,
          gatewayStatus: error?.statusCode,
          gatewayErrorCode: error?.error?.code || undefined,
          gatewayDescription,
        })}`
      );
      throw ApiError.internal(
        this._refundErrorMessage(error?.statusCode, gatewayDescription)
      );
    }

    // 6. Persist the accepted refund (a full refund flips the payment status).
    //    Target the claim by its pending id so we only finalize the refund we
    //    actually own.
    const isFullRefund = Math.abs(refundRupees - fullAmount) < 0.005;
    const updated = await Payment.findOneAndUpdate(
      {
        _id: paymentId,
        refunds: { $elemMatch: { refundId: claimId, status: "PENDING" } },
      },
      {
        $set: {
          "refunds.$.refundId": refund.id,
          "refunds.$.status": "PROCESSED",
          "refunds.$.processedAt": new Date(),
          ...(isFullRefund ? { status: PAYMENT_STATUS.REFUNDED } : {}),
        },
      },
      { new: true }
    );

    if (!updated) {
      // The gateway accepted the refund but the record could not be finalized
      // (claim missing/altered between the call and the write). Razorpay is
      // outside any transaction — log a reconciliation marker so an operator
      // can reconcile the money path.
      logger.error(
        `CRITICAL: Refund accepted by gateway but Payment record not finalized; requires reconciliation. ${JSON.stringify({
          ...context,
          razorpayRefundId: refund.id,
          refundRupees,
        })}`
      );
      throw ApiError.internal(
        "The refund was accepted by the gateway but could not be recorded. Our team will reconcile this shortly."
      );
    }

    // 7. Mirror a full refund on the booking
    if (isFullRefund) {
      await Booking.findByIdAndUpdate(payment.booking, {
        status: BOOKING_STATUS.REFUNDED,
      });
    }

    // 8. Notify the affected user (in-app + email) only after the refund is
    //    confirmed and persisted. Wrapped so a notification failure never fails
    //    the refund operation; email delivery is already fire-and-forget.
    try {
      const affectedUser = await User.findById(payment.user);
      const bookingDoc = await Booking.findById(payment.booking).select("_id bookingId").lean();
      if (affectedUser) {
        await notificationService.createRefundNotification(affectedUser, bookingDoc, payment, {
          refundId: refund.id,
          amount: refundRupees,
          currency: payment.currency || "INR",
          status: isFullRefund ? PAYMENT_STATUS.REFUNDED : "PROCESSED",
          timestamp: new Date(),
        });
      }
    } catch (err) {
      logger.warn(`Failed to notify user of refund for payment ${context.paymentId}: ${err.message}`);
    }

    logger.info(
      `Refund processed successfully. ${JSON.stringify({
        ...context,
        refundId: refund.id,
        refundRupees,
        isFullRefund,
      })}`
    );
    return updated;
  }

  /**
   * Map a Razorpay SDK error to a meaningful, client-safe message. Descriptive
   * text only — gateway descriptions never contain credentials or secrets.
   */
  _refundErrorMessage(statusCode, description = "") {
    const haystack = `${statusCode || ""} ${description}`;
    if (/auth|key|credential/i.test(haystack)) {
      return "Payment gateway authentication failed. Check the Razorpay API key pair configured on the server.";
    }
    if (/already.*refund/i.test(haystack)) {
      return "This payment has already been refunded at the gateway.";
    }
    if (/payment.*not.*found|invalid.*payment|payment_id/i.test(haystack)) {
      return "The Razorpay payment reference is invalid for the configured account.";
    }
    if (/amount/i.test(haystack)) {
      return "The requested refund amount is invalid for this payment.";
    }
    if (/rate.?limit|too many|throttl|exceeded/i.test(haystack)) {
      return "Payment gateway rate limit reached. Please try again shortly.";
    }
    return "The refund could not be processed by the payment gateway. Please try again.";
  }

  /**
   * Get payment details
   */
  async getPaymentDetails(paymentId, userId, isAdmin = false) {
    const payment = await Payment.findById(paymentId).populate("booking", "bookingId status pricing checkIn checkOut");
    
    if (!payment) throw ApiError.notFound("Payment not found.");
    
    if (!isAdmin && payment.user.toString() !== userId.toString()) {
      throw ApiError.forbidden("Access denied.");
    }
    
    return payment;
  }
}

module.exports = new PaymentService();
