const mongoose = require("mongoose");

/**
 * HomeSettings — a single-document site-wide settings bag that controls which
 * Home sections render and carries shared display copy. Frontend sections are
 * keyed by their component names so an admin can enable/disable a section or
 * override its surface text without a code deploy.
 */
const homeSettingsSchema = new mongoose.Schema(
  {
    // Ensure only one document exists (singleton pattern).
    key: { type: String, default: "home", unique: true, index: true },

    sections: {
      hero: { type: Boolean, default: true },
      experience: { type: Boolean, default: true },
      featuredHotels: { type: Boolean, default: true },
      featuredRooms: { type: Boolean, default: true },
      amenities: { type: Boolean, default: true },
      gallery: { type: Boolean, default: true },
      dining: { type: Boolean, default: true },
      offers: { type: Boolean, default: true },
      reviews: { type: Boolean, default: true },
      stats: { type: Boolean, default: true },
      map: { type: Boolean, default: true },
      faq: { type: Boolean, default: true },
      newsletter: { type: Boolean, default: true },
      cta: { type: Boolean, default: true },
    },

    content: {
      heroEyebrow: { type: String, trim: true, maxlength: 120 },
      heroTitle: { type: String, trim: true, maxlength: 200 },
      heroSubtitle: { type: String, trim: true, maxlength: 500 },
      newsLetterTitle: { type: String, trim: true, maxlength: 200 },
      newsLetterDescription: { type: String, trim: true, maxlength: 500 },
      metaDescription: { type: String, trim: true, maxlength: 500 },
    },

    seo: {
      title: { type: String, trim: true, maxlength: 200 },
      description: { type: String, trim: true, maxlength: 500 },
    },
  },
  {
    timestamps: true,
  }
);

const HomeSettings = mongoose.model("HomeSettings", homeSettingsSchema);

module.exports = HomeSettings;