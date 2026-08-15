const mongoose = require("mongoose");
const { NOTIFICATION_TYPES } = require("../../config/constants");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 150,
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    link: String,
    data: Object, // Additional metadata (bookingId, etc.)
    isRead: {
      type: Boolean,
      default: false,
    },
    channels: {
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
      inApp: { type: Boolean, default: true },
    },
    emailSent: { type: Boolean, default: false },
    smsSent: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });
// Compound index supporting the unread-count + sorted listing query
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
// Idempotency index: callers may set `data.eventKey` (e.g. `refund:<refundId>`,
// `offer:<offerId>`) so a retried/duplicate trigger can never create a second
// notification for the same user + event. Documents without an eventKey are
// excluded via the partial filter, keeping existing notifications untouched.
notificationSchema.index(
  { user: 1, "data.eventKey": 1 },
  { unique: true, partialFilterExpression: { "data.eventKey": { $type: "string" } } }
);

// Auto-delete notifications older than 90 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
