const mongoose = require("mongoose");

/**
 * Testimonial — a curated guest quote surfaced on the Home "Guest Experiences"
 * section. Mirrors the frontend ReviewCard contract: name, country, stay,
 * rating, review, subRatings {cleanliness, service, location, comfort}, date,
 * verified.
 */
const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Guest name is required"],
      trim: true,
      maxlength: 100,
    },
    country: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    // Room / stay type shown in the card footer
    stay: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      required: [true, "Review text is required"],
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },
    subRatings: {
      cleanliness: { type: Number, min: 1, max: 5 },
      service: { type: Number, min: 1, max: 5 },
      location: { type: Number, min: 1, max: 5 },
      comfort: { type: Number, min: 1, max: 5 },
    },
    // ISO date string rendered by formatDate
    date: { type: String, trim: true },
    avatar: { type: String, trim: true },
    verified: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

testimonialSchema.index({ isActive: 1, sortOrder: 1, createdAt: -1 });
testimonialSchema.index({ rating: -1 });

const Testimonial = mongoose.model("Testimonial", testimonialSchema);

module.exports = Testimonial;