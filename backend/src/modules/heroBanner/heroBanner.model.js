const mongoose = require("mongoose");

/**
 * HeroBanner — content for the Home hero section. Mirrors the frontend Hero
 * fields: eyebrow, title/highlight, subtitle, video (desktop), poster image,
 * CTAs. A single active banner is returned by the public endpoint.
 */
const heroBannerSchema = new mongoose.Schema(
  {
    eyebrow: { type: String, trim: true, maxlength: 120 },
    title: { type: String, required: [true, "Title is required"], trim: true, maxlength: 200 },
    highlight: { type: String, trim: true, maxlength: 200 },
    subtitle: { type: String, trim: true, maxlength: 500 },
    video: { type: String, trim: true },
    image: { type: String, trim: true },
    poster: { type: String, trim: true },
    ctaPrimary: {
      label: { type: String, trim: true, maxlength: 60 },
      href: { type: String, trim: true, maxlength: 300 },
    },
    ctaSecondary: {
      label: { type: String, trim: true, maxlength: 60 },
      href: { type: String, trim: true, maxlength: 300 },
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

heroBannerSchema.index({ isActive: 1, createdAt: -1 });

const HeroBanner = mongoose.model("HeroBanner", heroBannerSchema);

module.exports = HeroBanner;