/**
 * Centralised route paths for the app. Single source of truth used by the
 * router and by links across the app.
 */

export const ROUTES = Object.freeze({
  HOME: "/",
  HOTELS: "/hotels",
  HOTEL_DETAIL: "/hotels/:id",
  ROOM_DETAIL: "/rooms/:id",
  SEARCH: "/search",

  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  VERIFY_EMAIL: "/auth/verify-email",

  BOOKING: "/booking/:roomId",
  BOOKING_SUCCESS: "/booking/success",

  // Public — Brand / luxury content
  EXPERIENCES: "/experiences",
  EXPERIENCE_DETAIL: "/experiences/:id",
  DINING: "/dining",
  DINING_DETAIL: "/dining/:id",
  OFFERS: "/offers",
  DESTINATIONS: "/destinations",
  DESTINATION_DETAIL: "/destinations/:slug",
  ABOUT: "/about",

  // Collections — Hotels (static paths win over /hotels/:id)
  BEACH_RESORTS: "/hotels/beach-resorts",
  MOUNTAIN_RESORTS: "/hotels/mountain-resorts",
  CITY_HOTELS: "/hotels/city-hotels",
  PRIVATE_VILLAS: "/hotels/private-villas",
  LUXURY_RESORTS: "/hotels/luxury-resorts",
  SIGNATURE_COLLECTION: "/hotels/signature-collection",
  ROOMS: "/hotels/rooms",
  SUITES: "/hotels/suites",
  PRESIDENTIAL_SUITES: "/hotels/presidential-suites",
  FAMILY_VILLAS: "/hotels/family-villas",

  // Collections — Experiences (static paths win over /experiences/:id)
  EXPERIENCE_SPA: "/experiences/spa",
  EXPERIENCE_WELLNESS: "/experiences/wellness",
  EXPERIENCE_YOGA: "/experiences/yoga-meditation",
  EXPERIENCE_ADVENTURE: "/experiences/adventure",
  EXPERIENCE_PRIVATE_DINING: "/experiences/private-dining",
  EXPERIENCE_SAFARI: "/experiences/safari",
  EXPERIENCE_WINE: "/experiences/wine",

  // Collections — Dining (static paths win over /dining/:id)
  DINING_RESTAURANTS: "/dining/restaurants",
  DINING_BUFFET: "/dining/buffet",
  DINING_CHEFS_TABLE: "/dining/chefs-table",
  DINING_PRIVATE: "/dining/private",
  DINING_BARS: "/dining/bars",
  DINING_ROOFTOP: "/dining/rooftop",
  CONTACT: "/contact",

  // About family (each item a dedicated page)
  LUXURY_PHILOSOPHY: "/about/luxury-philosophy",
  AWARDS: "/about/awards",
  SUSTAINABILITY: "/about/sustainability",
  PRESS: "/about/press",
  CAREERS: "/careers",

  // Contact / service pages
  RESERVATIONS: "/reservations",
  CUSTOMER_SUPPORT: "/customer-support",
  LOCATIONS: "/locations",
  WEDDINGS: "/weddings",
  CORPORATE_EVENTS: "/corporate-events",
  FAQ: "/faq",

  // Protected (user) — canonical dashboard
  ACCOUNT: "/account",
  PROFILE: "/account/profile",
  BOOKINGS: "/account/bookings",
  // Canonical booking-detail route. NOTE: singular "booking" — the list route
  // above is plural; the detail page lives at /account/booking/:id.
  ACCOUNT_BOOKING_DETAIL: "/account/booking/:id",
  NOTIFICATIONS: "/account/notifications",
  ACCOUNT_WISHLIST: "/account/wishlist",

  // Legacy standalone account URLs — kept only as redirect targets to /account/*
  WISHLIST: "/wishlist",
  MY_BOOKINGS: "/my-bookings",
  MY_BOOKING_DETAIL: "/my-bookings/:id",
  PROFILE_PAGE: "/profile",
  NOTIFICATIONS_PAGE: "/notifications",
  // Deprecated plural booking-detail URL — kept only as a redirect target to ACCOUNT_BOOKING_DETAIL
  LEGACY_BOOKING_DETAIL: "/account/bookings/:id",

  // Payment outcomes
  PAYMENT_SUCCESS: "/payment/success",
  PAYMENT_FAILED: "/payment/failed",

  // Legal
  PRIVACY_POLICY: "/privacy-policy",
  TERMS: "/terms",
  CANCELLATION_POLICY: "/cancellation-policy",

  // Admin
  ADMIN: "/admin",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_HOTELS: "/admin/hotels",
  ADMIN_ROOMS: "/admin/rooms",
  ADMIN_BOOKINGS: "/admin/bookings",
  ADMIN_USERS: "/admin/users",
  ADMIN_OFFERS: "/admin/offers",
  ADMIN_AMENITIES: "/admin/amenities",
  ADMIN_ANALYTICS: "/admin/analytics",

  NOT_FOUND: "*",
});

/** Helper to build a parameterised path. */
export const buildPath = (template, params = {}) =>
  Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`:${key}`, encodeURIComponent(value)),
    template
  );

/**
 * Whether a literal path points to a real, implemented page route.
 * Used by nav/footer links so out-of-scope sections (e.g. /experiences,
 * /policies/*) render as unavailable instead of dead 404 links.
 */
const IMPLEMENTED_PATHS = new Set(Object.values(ROUTES));

export const isImplementedPath = (path) =>
  typeof path === "string" && IMPLEMENTED_PATHS.has(path);
