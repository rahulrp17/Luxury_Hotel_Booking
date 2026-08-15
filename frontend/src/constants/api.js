/**
 * Centralised API endpoint map. Kept separate from services so paths are easy
 * to audit against the backend routes. Paths are relative to the API base URL.
 */

export const API = Object.freeze({
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH_TOKEN: "/auth/refresh-token",
    VERIFY_EMAIL: "/auth/verify-email", // + /:token
    RESEND_VERIFICATION: "/auth/resend-verification",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password", // + /:token
    CHANGE_PASSWORD: "/auth/change-password",
    ME: "/auth/me",
  },
  USERS: {
    PROFILE: "/users/profile",
    UPDATE_PROFILE: "/users/profile",
    AVATAR: "/users/avatar",
    ADMIN_ALL: "/users/admin/all",
    ADMIN_TOGGLE: "/users/admin", // + /:id/toggle
  },
  HOTELS: {
    LIST: "/hotels",
    SEARCH: "/hotels/search",
    FEATURED: "/hotels/featured",
    NEARBY: "/hotels/nearby",
    DETAIL: "/hotels", // + /:id
    ADMIN_ALL: "/hotels/admin/all",
    CREATE: "/hotels",
    UPDATE: "/hotels", // + /:id
    DELETE: "/hotels", // + /:id
    IMAGES: "/hotels", // + /:id/images
  },
  ROOMS: {
    LIST: "/rooms",
    FEATURED: "/rooms/featured",
    BY_HOTEL: "/rooms/hotel", // + /:hotelId
    DETAIL: "/rooms", // + /:id
    AVAILABILITY: "/rooms", // + /:id/availability
    BLOCKED_DATES: "/rooms", // + /:id/blocked-dates
    CREATE: "/rooms",
    UPDATE: "/rooms", // + /:id
    DELETE: "/rooms", // + /:id
    IMAGES: "/rooms", // + /:id/images
    
  },
  BOOKINGS: {
    CREATE: "/bookings",
    LIST: "/bookings",
    DETAIL: "/bookings", // + /:id
    CANCEL: "/bookings", // + /:id/cancel
    ADMIN_ALL: "/bookings/admin/all",
    ADMIN_STATUS: "/bookings/admin", // + /:id/status
  },
  PAYMENTS: {
    CREATE_ORDER: "/payments/create-order",
    VERIFY: "/payments/verify",
    DETAIL: "/payments", // + /:id
    REFUND: "/payments", // + /:id/refund
  },
  REVIEWS: {
    BY_HOTEL: "/reviews/hotel", // + /:hotelId
    CREATE: "/reviews",
    UPDATE: "/reviews", // + /:id
    DELETE: "/reviews", // + /:id
    HELPFUL: "/reviews", // + /:id/helpful
    RESPOND: "/reviews", // + /:id/respond
  },
  OFFERS: {
    ACTIVE: "/offers/active",
    VALIDATE: "/offers/validate",
    ADMIN_ALL: "/offers/admin/all",
    CREATE: "/offers",
    UPDATE: "/offers", // + /:id
  },
  NOTIFICATIONS: {
    LIST: "/notifications",
    READ_ALL: "/notifications/read-all",
    READ: "/notifications", // + /:id/read
    DELETE: "/notifications", // + /:id
  },
  AMENITIES: {
    LIST: "/amenities",
    DETAIL: "/amenities", // + /:id
    CREATE: "/amenities",
    UPDATE: "/amenities", // + /:id
    DELETE: "/amenities", // + /:id
  },
  ANALYTICS: {
    OVERVIEW: "/analytics/overview",
    REVENUE: "/analytics/revenue",
    OCCUPANCY: "/analytics/occupancy",
    TOP_HOTELS: "/analytics/top-hotels",
    BOOKING_SUMMARY: "/analytics/booking-summary",
  },
  ATTRACTIONS: {
    LIST: "/attractions",
    NEARBY: "/attractions/nearby", // + ?lat=&lng=&radiusKm=
    FEATURED: "/attractions/featured",
    DETAIL: "/attractions", // + /:id
  },
});
