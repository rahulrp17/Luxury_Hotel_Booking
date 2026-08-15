const mongoose = require("mongoose");

/**
 * DiningExperience — a signature restaurant / dining venue surfaced on the
 * Home "Signature Dining" section. Mirrors the fields the frontend
 * (Dining.jsx) renders: title, subtitle, hotel, city, image, description.
 */
const diningSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Dining title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [180, "Subtitle cannot exceed 180 characters"],
    },
    description: {
      type: String,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    // Display venue name (used by the card: "{hotel}, {city}")
    hotel: { type: String, trim: true, maxlength: 100 },
    city: { type: String, trim: true, maxlength: 100 },
    image: {
      url: { type: String, trim: true },
      publicId: { type: String, trim: true },
    },
    cuisine: { type: String, trim: true, maxlength: 60 },
    // Star count shown on the card (defaults to 5)
    rating: { type: Number, default: 5, min: 0, max: 5 },
    sortOrder: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

diningSchema.virtual("primaryImage").get(function () {
  return this.image || null;
});

// Indexes
diningSchema.index({ isFeatured: 1, isActive: 1, sortOrder: 1 });
diningSchema.index({ city: 1 });

const DiningExperience = mongoose.model("DiningExperience", diningSchema);

module.exports = DiningExperience;