/**
 * Query-cache / invalidation keys. Used to keep related slices in sync after
 * mutations (e.g. invalidating the hotel list after an admin update).
 */

export const QUERY_KEYS = Object.freeze({
  HOTELS: "hotels",
  HOTEL_DETAIL: "hotel-detail",
  FEATURED_HOTELS: "featured-hotels",
  NEARBY_HOTELS: "nearby-hotels",
  ROOMS: "rooms",
  ROOM_AVAILABILITY: "room-availability",
  BOOKINGS: "bookings",
  BOOKING_DETAIL: "booking-detail",
  NOTIFICATIONS: "notifications",
  OFFERS: "offers",
  ACTIVE_OFFERS: "active-offers",
  REVIEWS: "reviews",
  AMENITIES: "amenities",
  ANALYTICS: "analytics",
});
