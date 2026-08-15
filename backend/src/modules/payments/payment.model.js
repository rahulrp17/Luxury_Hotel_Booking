const mongoose = require("mongoose");
const { PAYMENT_STATUS } = require("../../config/constants");

const refundSchema = new mongoose.Schema({
  refundId: { type: String, required: true },
  amount: { type: Number, required: true },
  reason: String,
  status: {
    type: String,
    enum: ["PENDING", "PROCESSED", "FAILED"],
    default: "PENDING",
  },
  initiatedAt: { type: Date, default: Date.now },
  processedAt: Date,
});

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
    },
    razorpayPaymentId: {
      type: String,
      sparse: true, // Only set after successful payment
    },
    razorpaySignature: {
      type: String,
      select: false, // Security: don't expose in queries
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.CREATED,
    },
    method: String, // card, upi, netbanking, wallet
    bank: String,
    wallet: String,
    vpa: String, // UPI VPA
    cardId: String,
    international: { type: Boolean, default: false },
    refunds: [refundSchema],
    notes: Object,
    errorCode: String,
    errorDescription: String,
    capturedAt: Date,
    failedAt: Date,
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────
// Note: razorpayOrderId uses `unique: true` on the field and razorpayPaymentId
// uses `sparse: true` — each auto-creates its own index.
paymentSchema.index({ booking: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });
// Analytics revenue chart queries captured payments by day.
paymentSchema.index({ status: 1, capturedAt: 1 });

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
