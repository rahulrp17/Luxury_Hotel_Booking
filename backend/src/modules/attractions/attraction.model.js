const mongoose = require("mongoose");

/**
 * Attraction — a nearby point of interest surfaced on the Home "Nearby
 * Attractions" section / destination pages. Includes geolocation for radius
 * searches.
 */
const attractionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Attraction name is required"],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      enum: ["landmark", "beach", "temple", "shopping", "dining", "nature", "adventure", "other"],
      default: "other",
    },
    city: { type: String, trim: true, index: true, maxlength: 100 },
    // Approx distance from the property (display string, e.g. "2.4 km")
    distance: { type: String, trim: true, maxlength: 40 },
    address: { type: String, trim: true, maxlength: 300 },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    image: { type: String, trim: true },
    // Optional linked hotel
    hotelRef: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

attractionSchema.index({ location: "2dsphere" });
attractionSchema.index({ city: 1, isActive: 1 });
attractionSchema.index({ isActive: 1, sortOrder: 1 });

const Attraction = mongoose.model("Attraction", attractionSchema);

module.exports = Attraction;