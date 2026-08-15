const mongoose = require("mongoose");

/**
 * Server-side addon catalog. Booking addons are resolved against this catalog
 * by `code`, so prices always come from the server (a client can never submit
 * its own addon price/amount).
 */
const addonSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 30,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 300,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      default: "OTHER",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Note: code uses `unique: true` on the field, which auto-creates its index.
addonSchema.index({ category: 1 });
addonSchema.index({ isActive: 1 });

const Addon = mongoose.model("Addon", addonSchema);

module.exports = Addon;
