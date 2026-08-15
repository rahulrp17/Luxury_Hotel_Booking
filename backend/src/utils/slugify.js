const crypto = require("crypto");
const slugifyLib = require("slugify");
const { v4: uuidv4 } = require("uuid");
const { BOOKING_ID_PREFIX } = require("../config/constants");

/**
 * Generate a URL-friendly slug
 */
const slugify = (text) => {
  return slugifyLib(text, {
    lower: true,
    strict: true,
    trim: true,
  });
};

/**
 * Generate a unique hotel slug (appends short uuid if needed)
 */
const generateUniqueSlug = (name) => {
  const baseSlug = slugify(name);
  const uniqueSuffix = uuidv4().split("-")[0]; // first 8 chars
  return `${baseSlug}-${uniqueSuffix}`;
};

/**
 * Generate unique booking ID: HBP-2024-XXXXXX
 */
const generateBookingId = () => {
  const year = new Date().getFullYear();
  // Cryptographically random (8 hex chars) instead of Math.random()
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${BOOKING_ID_PREFIX}-${year}-${random}`;
};

module.exports = { slugify, generateUniqueSlug, generateBookingId };
