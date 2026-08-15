/**
 * Local fallback assets (served from /public/assets).
 *
 * Strategy: the `Image` component always tries the backend Cloudinary `src`
 * first; when it is missing or fails to load, it falls back to one of these
 * local development images. Components reference a `kind` and (optionally) an
 * index — never a hardcoded URL — via `getFallbackAsset(kind, index)`.
 *
 * High-quality development photos are expected to exist at these paths; no code
 * change is needed once they are dropped in.
 */

export const FALLBACK_ASSETS = Object.freeze({
  hero: "/assets/hero/hero-poster.jpg",
  hotel: "/assets/hotels/hotel-01.jpg",
  room: "/assets/rooms/room-01.jpg",
  gallery: "/assets/gallery/gallery-03.jpg",
  dining: "/assets/dining/dining-01.jpg",
  amenity: "/assets/amenities/pool.jpg",
  testimonial: "/assets/testimonials/guest-01.jpg",
  offer: "/assets/offers/offer-01.jpg",
  default: "/assets/hotels/hotel-01.jpg",
});

/** Rotating sets so repeated cards get varied imagery without hardcoding URLs. */
export const FALLBACK_GROUPS = Object.freeze({
  hotel: [
    "/assets/hotels/hotel-01.jpg",
    "/assets/hotels/hotel-02.jpg",
    "/assets/hotels/hotel-03.jpg",
    "/assets/hotels/hotel-04.jpg",
    "/assets/hotels/hotel-05.jpg",
    "/assets/hotels/hotel-06.jpg",
    "/assets/hotels/hotel-07.jpg",
    "/assets/hotels/hotel-08.jpg",
  ],
  room: [
    "/assets/rooms/room-01.jpg",
    "/assets/rooms/room-02.jpg",
    "/assets/rooms/room-03.jpg",
    "/assets/rooms/room-04.jpg",
    "/assets/rooms/room-05.jpg",
    "/assets/rooms/room-07.jpg",
    "/assets/rooms/room-08.jpg",
  ],
  gallery: [
    "/assets/gallery/gallery-03.jpg",
    "/assets/gallery/gallery-4.jpg",
    "/assets/gallery/gallery-5.jpg",
    "/assets/gallery/gallery-07.jpg",
    "/assets/gallery/gallery-08.jpg",
    "/assets/gallery/lobby.jpg",
    "/assets/gallery/pool.jpg",
  ],
  dining: [
    "/assets/dining/dining-01.jpg",
    "/assets/dining/dining-02.jpg",
    "/assets/dining/dining-03.jpg",
    "/assets/dining/dining-04.jpg",
  ],
  amenity: [
    "/assets/amenities/pool.jpg",
    "/assets/amenities/spa.jpg",
    "/assets/amenities/gym.jpg",
    "/assets/amenities/conference.jpg",
  ],
  offer: [
    "/assets/offers/offer-01.jpg",
    "/assets/offers/offer-01.jpg",
    "/assets/offers/offer-01.jpg",
  ],
  testimonial: [
    "/assets/testimonials/avatar-1.svg",
    "/assets/testimonials/avatar-1.svg",
    "/assets/testimonials/avatar-1.svg",
  ],
});

/**
 * Resolve a fallback asset for a `kind` (rotating by `index` for variety).
 */
export const getFallbackAsset = (kind, index = 0) => {
  const group = FALLBACK_GROUPS[kind];
  if (group && group.length) {
    return group[((index % group.length) + group.length) % group.length];
  }
  return FALLBACK_ASSETS[kind] || FALLBACK_ASSETS.default;
};
