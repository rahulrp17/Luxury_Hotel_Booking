const mongoose = require("mongoose");

/**
 * GalleryItem — a single image surfaced in the Home "Gallery" masonry section.
 * Mirrors the frontend Gallery.jsx contract: url, alt, hotel (caption).
 */
const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, maxlength: 150 },
    url: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    publicId: { type: String, trim: true },
    alt: { type: String, trim: true, maxlength: 200 },
    // Hotel / description caption shown in the hover overlay
    caption: { type: String, trim: true, maxlength: 200 },
    hotel: { type: String, trim: true, maxlength: 120 },
    category: {
      type: String,
      enum: ["hotel", "room", "dining", "spa", "destination", "other"],
      default: "hotel",
    },
    // Destination hotel reference (optional)
    hotelRef: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },
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

gallerySchema.index({ isActive: 1, sortOrder: 1, createdAt: -1 });
gallerySchema.index({ category: 1 });
gallerySchema.index({ hotelRef: 1 });

const GalleryItem = mongoose.model("GalleryItem", gallerySchema);

module.exports = GalleryItem;