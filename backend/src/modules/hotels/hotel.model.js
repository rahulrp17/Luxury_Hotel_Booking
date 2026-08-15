const mongoose = require("mongoose");
const { HOTEL_CATEGORIES } = require("../../config/constants");

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Hotel name is required"],
      trim: true,
      maxlength: [100, "Hotel name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Hotel description is required"],
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    shortDescription: {
      type: String,
      maxlength: [300, "Short description cannot exceed 300 characters"],
    },
    category: {
      type: String,
      enum: Object.values(HOTEL_CATEGORIES),
      required: [true, "Hotel category is required"],
    },
    starRating: {
      type: Number,
      required: [true, "Star rating is required"],
      min: [1, "Minimum star rating is 1"],
      max: [5, "Maximum star rating is 5"],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    contact: {
      email: {
        type: String,
        match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
      },
      phone: String,
      website: String,
    },
    address: {
      street: { type: String, required: [true, "Street address is required"] },
      city: { type: String, required: [true, "City is required"] },
      state: { type: String, required: [true, "State is required"] },
      country: { type: String, default: "India" },
      pincode: String,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        isPrimary: { type: Boolean, default: false },
        alt: String,
      },
    ],
    amenities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Amenity",
      },
    ],
    policies: {
      checkIn: { type: String, default: "14:00" },
      checkOut: { type: String, default: "12:00" },
      cancellation: { type: String, default: "Free cancellation up to 24 hours before check-in." },
      petsAllowed: { type: Boolean, default: false },
      smokingAllowed: { type: Boolean, default: false },
      childrenAllowed: { type: Boolean, default: true },
    },
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: (val) => Math.round(val * 10) / 10,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    tags: [String],
    seoMeta: {
      title: String,
      description: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────
// Note: slug uses `unique: true` on the field, which auto-creates its index.
hotelSchema.index({ location: "2dsphere" });
hotelSchema.index({ category: 1 });
hotelSchema.index({ starRating: 1 });
hotelSchema.index({ avgRating: -1 });
hotelSchema.index({ isFeatured: 1 });
hotelSchema.index({ isActive: 1 });
hotelSchema.index({ "address.city": 1 });
hotelSchema.index({ name: "text", description: "text", tags: "text" });
// Compound indexes for the public listing (filters + sorts)
hotelSchema.index({ isActive: 1, category: 1, starRating: 1 });
hotelSchema.index({ isActive: 1, avgRating: -1, createdAt: -1 });

// ─── Virtual: Primary Image ───────────────────────────────────────────────
hotelSchema.virtual("primaryImage").get(function () {
  const primary = this.images?.find((img) => img.isPrimary);
  return primary || this.images?.[0] || null;
});

// ─── Virtual: Rooms ───────────────────────────────────────────────────────
hotelSchema.virtual("rooms", {
  ref: "Room",
  localField: "_id",
  foreignField: "hotel",
  match: { isActive: true },
});

const Hotel = mongoose.model("Hotel", hotelSchema);

module.exports = Hotel;
