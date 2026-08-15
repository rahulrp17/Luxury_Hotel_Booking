module.exports = {
  // Brand (site title, configurable via env)
  BRAND_NAME: process.env.BRAND_NAME || "AureliaStay",

  // Booking Status
  BOOKING_STATUS: {
    PENDING: "PENDING",
    CONFIRMED: "CONFIRMED",
    CHECKED_IN: "CHECKED_IN",
    CHECKED_OUT: "CHECKED_OUT",
    CANCELLED: "CANCELLED",
    REFUNDED: "REFUNDED",
    COMPLETED: "COMPLETED",
  },

  // Payment Status
  PAYMENT_STATUS: {
    CREATED: "CREATED",
    AUTHORIZED: "AUTHORIZED",
    CAPTURED: "CAPTURED",
    FAILED: "FAILED",
    REFUNDED: "REFUNDED",
  },

  // User Roles
  USER_ROLES: {
    USER: "USER",
    ADMIN: "ADMIN",
    HOTEL_MANAGER: "HOTEL_MANAGER",
  },

  // Hotel Categories
  HOTEL_CATEGORIES: {
    BUDGET: "BUDGET",
    STANDARD: "STANDARD",
    LUXURY: "LUXURY",
    ULTRA_LUXURY: "ULTRA_LUXURY",
    RESORT: "RESORT",
    HERITAGE: "HERITAGE",
    BUSINESS: "BUSINESS",
    BOUTIQUE: "BOUTIQUE",
  },

  // Room Types
  ROOM_TYPES: {
    SINGLE: "SINGLE",
    DOUBLE: "DOUBLE",
    SUITE: "SUITE",
    VILLA: "VILLA",
    PENTHOUSE: "PENTHOUSE",
    FAMILY: "FAMILY",
  },

  // Offer Types
  OFFER_TYPES: {
    PERCENTAGE: "PERCENTAGE",
    FLAT: "FLAT",
    FREE_NIGHT: "FREE_NIGHT",
  },

  // Notification Types
  NOTIFICATION_TYPES: {
    BOOKING_CONFIRMED: "BOOKING_CONFIRMED",
    BOOKING_CANCELLED: "BOOKING_CANCELLED",
    PAYMENT_SUCCESS: "PAYMENT_SUCCESS",
    PAYMENT_FAILED: "PAYMENT_FAILED",
    REFUND: "REFUND",
    REMINDER: "REMINDER",
    OFFER: "OFFER",
    GENERAL: "GENERAL",
  },

  // Amenity Categories
  AMENITY_CATEGORIES: {
    ROOM: "ROOM",
    HOTEL: "HOTEL",
    WELLNESS: "WELLNESS",
    DINING: "DINING",
    TRANSPORT: "TRANSPORT",
    SERVICES: "SERVICES",
    CONNECTIVITY: "CONNECTIVITY",
    BUSINESS: "BUSINESS",
    ACCESSIBILITY: "ACCESSIBILITY",
    FAMILY: "FAMILY",
    OUTDOOR: "OUTDOOR",
  },

  // Cache TTL (seconds)
  CACHE_TTL: {
    HOTEL_LIST: 300, // 5 minutes
    HOTEL_DETAIL: 600, // 10 minutes
    ROOM_LIST: 300,
    FEATURED_HOTELS: 900, // 15 minutes
    SEARCH_RESULTS: 120, // 2 minutes
    USER_PROFILE: 120,
  },

  // Pagination Defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 12,
    MAX_LIMIT: 100,
  },

  // Currency
  DEFAULT_CURRENCY: "INR",

  // Booking ID Prefix
  BOOKING_ID_PREFIX: "HBP",

  // Tax Rate (GST)
  TAX_RATE: 0.18, // 18%

  // Cancellation Policy (hours before check-in)
  CANCELLATION_DEADLINE_HOURS: 24,

  // Pending booking expiry (ms) - unpaid PENDING bookings are auto-cancelled
  // after this window so they don't permanently hold room inventory.
  PENDING_BOOKING_EXPIRY_MS: 30 * 60 * 1000, // 30 minutes

  // Max file sizes
  FILE_SIZES: {
    HOTEL_IMAGE: 5 * 1024 * 1024, // 5MB
    ROOM_IMAGE: 5 * 1024 * 1024,
    AVATAR: 2 * 1024 * 1024, // 2MB
    REVIEW_IMAGE: 5 * 1024 * 1024,
  },
};
