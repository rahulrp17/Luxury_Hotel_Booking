const mongoose = require("mongoose");
const { OFFER_TYPES } = require("../../config/constants");

const offerSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Offer code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [20, "Code cannot exceed 20 characters"],
    },
    title: {
      type: String,
      required: [true, "Offer title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    type: {
      type: String,
      enum: Object.values(OFFER_TYPES),
      required: [true, "Offer type is required"],
    },
    value: {
      type: Number,
      required: [true, "Offer value is required"],
      min: 0,
    },
    maxDiscountAmount: {
      type: Number,
      min: 0, // Cap for percentage discounts
    },
    minBookingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    applicableHotels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hotel",
      },
    ],
    applicableRooms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
      },
    ],
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    usageLimit: {
      type: Number,
      min: 0, // 0 = unlimited
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    perUserLimit: {
      type: Number,
      default: 1,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    banner: {
      url: String,
      publicId: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────
// Note: code uses `unique: true` on the field, which auto-creates its index.
offerSchema.index({ isActive: 1 });
offerSchema.index({ startDate: 1, endDate: 1 });

// ─── Virtual: Is currently valid ─────────────────────────────────────────
offerSchema.virtual("isValid").get(function () {
  const now = new Date();
  return (
    this.isActive &&
    this.startDate <= now &&
    this.endDate >= now &&
    (!this.usageLimit || this.usedCount < this.usageLimit)
  );
});

const Offer = mongoose.model("Offer", offerSchema);

module.exports = Offer;
