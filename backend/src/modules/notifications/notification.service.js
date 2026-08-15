const Notification = require("./notification.model");
const User = require("../users/user.model");
const emailService = require("./email.service");
const smsService = require("./sms.service");
const { NOTIFICATION_TYPES } = require("../../config/constants");
const ApiError = require("../../utils/ApiError");
const { parsePagination, buildPagination } = require("../../utils/pagination");
const { formatMoney } = require("../../utils/money");
const { formatOfferDiscount } = require("../../utils/offerHelpers");
const logger = require("../../config/logger");

class NotificationService {
  /**
   * Create a notification in the DB and (fire-and-forget) deliver external
   * channels (email/sms). The DB write is awaited so callers know the in-app
   * notification is durable; slow email delivery never blocks the caller.
   *
   * Idempotency: pass `eventKey` (e.g. `refund:<refundId>`, `offer:<offerId>`)
   * to make this atomic per user+event — a retried or duplicate trigger returns
   * the existing notification instead of creating a second one (a partial unique
   * index on `user` + `data.eventKey` backs this).
   */
  async createNotification(userId, data) {
    const payload = {
      user: userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link,
      data: data.data,
      channels: data.channels || { inApp: true, email: false, sms: false },
    };

    if (data.eventKey) {
      payload.data = { ...(payload.data || {}), eventKey: data.eventKey };
    }

    let notification;
    try {
      notification = await Notification.create(payload);
    } catch (err) {
      // Duplicate event (same user + eventKey) → already notified, don't re-send.
      if (data.eventKey && err?.code === 11000) {
        const existing = await Notification.findOne({
          user: userId,
          "data.eventKey": data.eventKey,
        });
        if (existing) return { notification: existing, created: false };
      }
      throw err;
    }

    // We don't block on email/SMS sending here.
    this._processExternalChannels(notification, data.context).catch((err) =>
      logger.error(`External notification channel processing failed: ${err.message}`)
    );

    return { notification, created: true };
  }

  /**
   * Process email/sms async (Simulating queue behavior)
   */
  async _processExternalChannels(notification, context) {
    const user = context.user;
    const booking = context.booking;

    if (notification.channels.email && user.preferences?.notifications?.email) {
      if (notification.type === NOTIFICATION_TYPES.BOOKING_CONFIRMED) {
        await emailService.sendBookingConfirmation(user, booking);
      } else if (notification.type === NOTIFICATION_TYPES.BOOKING_CANCELLED) {
        await emailService.sendBookingCancellation(user, booking);
      } else if (notification.type === NOTIFICATION_TYPES.REFUND) {
        await emailService.sendRefundEmail(user, context.refund);
      } else if (notification.type === NOTIFICATION_TYPES.OFFER) {
        await emailService.sendOfferEmail(user, context.offer);
      }
      // Mark as sent
      await Notification.findByIdAndUpdate(notification._id, { emailSent: true });
    }

    if (notification.channels.sms && user.preferences?.notifications?.sms && user.phone) {
      if (notification.type === NOTIFICATION_TYPES.BOOKING_CONFIRMED) {
        await smsService.sendBookingConfirmation(user, booking);
      }
      await Notification.findByIdAndUpdate(notification._id, { smsSent: true });
    }
  }

  /**
   * Notify a user that a refund was processed. Fired only after the gateway
   * accepted the refund AND the payment/booking record was updated, so the
   * notification always reflects a confirmed, successful refund.
   *
   * `refund` = { refundId, amount, currency, status, timestamp }.
   */
  async createRefundNotification(user, booking, payment, refund) {
    const bookingId = booking?.bookingId || "";
    const currency = refund.currency || "INR";
    const amountText = formatMoney(refund.amount, currency);
    const bookingRef = booking?._id || payment.booking;

    const { notification } = await this.createNotification(user._id, {
      type: NOTIFICATION_TYPES.REFUND,
      title: "Refund Processed",
      message: `Your refund of ${amountText} for booking ${bookingId || "—"} has been processed successfully.`,
      link: `/account/booking/${bookingRef}`,
      eventKey: `refund:${refund.refundId}`,
      data: {
        bookingId: (bookingRef)?.toString(),
        paymentId: payment._id.toString(),
        refundId: refund.refundId,
        amount: refund.amount,
        currency,
        status: refund.status,
        timestamp: refund.timestamp,
      },
      channels: { inApp: true, email: true, sms: false },
      context: { user, refund },
    });

    return notification;
  }

  /**
   * Broadcast a newly published offer to every registered (active) user via
   * in-app notification + email. Runs fire-and-forget from the offer service so
   * the admin API never blocks on fan-out; the eventKey dedupe guarantees one
   * notification per user per offer even if this is retried.
   */
  async notifyOfferCreated(offer) {
    const users = await User.find({ isActive: true })
      .select("_id name email preferences")
      .lean();
    const discountText = formatOfferDiscount(offer);
    // Plain, serializable snapshot for email templates + notification metadata
    // (a mongoose doc does not spread into its fields, so build it explicitly).
    const offerContext = {
      _id: offer._id,
      code: offer.code,
      title: offer.title,
      description: offer.description,
      type: offer.type,
      value: offer.value,
      maxDiscountAmount: offer.maxDiscountAmount,
      startDate: offer.startDate,
      endDate: offer.endDate,
      discountText,
    };

    const eventKey = `offer:${offer._id}`;

    // Idempotency: skip users already notified for this offer (a retried
    // broadcast must never create duplicates). Single round-trip via distinct().
    const alreadyNotified = await Notification.distinct("user", { "data.eventKey": eventKey });
    const notifiedSet = new Set(alreadyNotified.map((id) => id.toString()));

    const docs = [];
    const recipientByUserId = new Map();
    for (const user of users) {
      if (notifiedSet.has(user._id.toString())) continue;
      recipientByUserId.set(user._id.toString(), user);
      docs.push({
        user: user._id,
        type: NOTIFICATION_TYPES.OFFER,
        title: offer.title,
        message: `New offer: ${offer.title} — ${discountText}. Use code ${offer.code} to save on your stay.`,
        link: "/offers",
        data: {
          eventKey,
          offerId: offer._id,
          code: offer.code,
          title: offer.title,
          discountText,
          startDate: offer.startDate,
          endDate: offer.endDate,
        },
        channels: { inApp: true, email: true, sms: false },
      });
    }

    if (docs.length === 0) return 0;

    // Single bulk insert for the whole fan-out (vs one insert per user). The
    // partial unique index on user + data.eventKey still guards against races.
    let inserted = [];
    try {
      inserted = await Notification.insertMany(docs, { ordered: false });
    } catch (err) {
      if (err?.writeErrors?.length) {
        inserted = err.insertedDocs || [];
        logger.warn(`Offer broadcast partial insert: ${err.writeErrors.length} skipped`);
      } else {
        throw err;
      }
    }

    // Fire-and-forget email delivery; the in-app rows are already durable.
    inserted.forEach((notification) => {
      const user = recipientByUserId.get(notification.user.toString());
      this._processExternalChannels(notification, { user, offer: offerContext }).catch((err) =>
        logger.error(`Offer email channel failed for user ${user._id}: ${err.message}`)
      );
    });

    if (inserted.length > 0) {
      logger.info(`Offer "${offer.code}" broadcast to ${inserted.length} user(s).`);
    }
    return inserted.length;
  }

  // ─── API Methods ─────────────────────────────────────────────────────────

  async getUserNotifications(userId, query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = { user: userId };

    if (query.unreadOnly === "true") {
      filter.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ user: userId, isRead: false }),
    ]);

    return {
      notifications,
      unreadCount,
      pagination: buildPagination(page, limit, total),
    };
  }

  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) throw ApiError.notFound("Notification not found.");
    return notification;
  }

  async markAllAsRead(userId) {
    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );
    return true;
  }

  async deleteNotification(notificationId, userId) {
    const result = await Notification.findOneAndDelete({ _id: notificationId, user: userId });
    if (!result) throw ApiError.notFound("Notification not found.");
    return true;
  }
}

module.exports = new NotificationService();
