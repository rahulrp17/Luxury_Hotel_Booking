const mongoose = require("mongoose");
const { BOOKING_STATUS } = require("../../config/constants");

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: [true, "Hotel reference is required"],
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Room reference is required"],
    },
    checkIn: {
      type: Date,
      required: [true, "Check-in date is required"],
    },
    checkOut: {
      type: Date,
      required: [true, "Check-out date is required"],
    },
    nights: {
      type: Number,
      required: true,
      min: 1,
    },
    guests: {
      adults: { type: Number, required: true, min: 1 },
      children: { type: Number, default: 0, min: 0 },
    },
    addons: [
      {
        name: { type: String, required: true },
        description: String,
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, default: 1 },
      },
    ],
    pricing: {
      baseAmount: { type: Number, required: true },
      addonAmount: { type: Number, default: 0 },
      discountAmount: { type: Number, default: 0 },
      taxAmount: { type: Number, required: true },
      totalAmount: { type: Number, required: true },
      currency: { type: String, default: "INR" },
    },
    offer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
    },
    offerCode: String,
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    specialRequests: {
      type: String,
      maxlength: [500, "Special requests cannot exceed 500 characters"],
    },
    guestDetails: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    cancellationReason: String,
    cancellationDate: Date,
    refundAmount: {
      type: Number,
      default: 0,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    reviewRequested: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────
// Note: bookingId uses `unique: true` on the field, which auto-creates its index.
bookingSchema.index({ user: 1 });
bookingSchema.index({ hotel: 1 });
bookingSchema.index({ room: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ checkIn: 1, checkOut: 1 });
// Compound index for the availability overlap query ({ room, status, checkIn, checkOut })
bookingSchema.index({ room: 1, status: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ "guestDetails.email": 1 });
// Backs "my bookings" listings (user, optional status filter, sorted newest first)
bookingSchema.index({ user: 1, status: 1, createdAt: -1 });
// Backs the hourly reminder job ({ status, reminderSent, checkIn window })
bookingSchema.index({ status: 1, reminderSent: 1, checkIn: 1 });

// ─── Validation: checkOut must be after checkIn ───────────────────────────
bookingSchema.pre("validate", function (next) {
  if (this.checkIn && this.checkOut && this.checkOut <= this.checkIn) {
    this.invalidate("checkOut", "Check-out must be after check-in");
  }
  next();
});

// ─── Virtual: Total guests ─────────────────────────────────────────────────
bookingSchema.virtual("totalGuests").get(function () {
  return this.guests.adults + this.guests.children;
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
