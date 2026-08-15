const mongoose = require("mongoose");
const { ROOM_TYPES } = require("../../config/constants");

const seasonalPricingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  multiplier: { type: Number, required: true, min: 0.5, max: 5 },
});

const roomSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: [true, "Hotel reference is required"],
    },
    name: {
      type: String,
      required: [true, "Room name is required"],
      trim: true,
      maxlength: [100, "Room name cannot exceed 100 characters"],
    },
    type: {
      type: String,
      enum: Object.values(ROOM_TYPES),
      required: [true, "Room type is required"],
    },
    description: {
      type: String,
      required: [true, "Room description is required"],
      maxlength: [3000, "Description cannot exceed 3000 characters"],
    },
    maxOccupancy: {
      adults: { type: Number, required: true, min: 1, max: 10 },
      children: { type: Number, default: 0, min: 0, max: 6 },
    },
    size: {
      type: Number, // square feet
      min: 0,
    },
    floor: Number,
    bedConfiguration: {
      type: String,
      maxlength: 100,
    },
    view: String, // "Sea View", "City View", "Garden View"
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        alt: String,
      },
    ],
    amenities: [String], // Room-specific amenities list
    basePricePerNight: {
      type: Number,
      required: [true, "Base price is required"],
      min: [0, "Price cannot be negative"],
    },
    weekendPremium: {
      type: Number,
      default: 0,
      min: 0,
      max: 100, // percentage
    },
    seasonalPricing: [seasonalPricingSchema],
    totalUnits: {
      type: Number,
      required: [true, "Total units is required"],
      min: [1, "At least 1 unit is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
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
roomSchema.index({ hotel: 1 });
roomSchema.index({ type: 1 });
roomSchema.index({ basePricePerNight: 1 });
roomSchema.index({ "maxOccupancy.adults": 1 });
roomSchema.index({ isActive: 1 });
// Compound indexes backing the public room listing + featured endpoints.
roomSchema.index({ isFeatured: 1, isActive: 1, createdAt: -1 });
roomSchema.index({ isActive: 1, basePricePerNight: 1 });
// Backs getRoomsByHotel ({ hotel, isActive } sorted by price)
roomSchema.index({ hotel: 1, isActive: 1, basePricePerNight: 1 });

// ─── Virtual: Primary Image ───────────────────────────────────────────────
roomSchema.virtual("primaryImage").get(function () {
  return this.images?.[0] || null;
});

// ─── Virtual: Max total guests ────────────────────────────────────────────
roomSchema.virtual("maxGuests").get(function () {
  return this.maxOccupancy.adults + this.maxOccupancy.children;
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
