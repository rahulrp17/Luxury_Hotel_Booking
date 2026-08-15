# Local fallback assets

Served at `/assets/*`. These are **branded SVG placeholders** used only as a
last-resort fallback when a real image is missing or fails to load.

## Image fallback strategy

1. **Backend Cloudinary URL** — the `Image` component always uses the `src`
   returned by the API first (e.g. hotel/room `images[].url`).
2. **Local fallback** — if `src` is missing or `onError` fires, the `Image`
   component swaps in the matching SVG below via `src/constants/assets.js`.

## During development

Replace any of these SVGs with high-quality royalty-free photos (Unsplash /
Pexels) named the same way, e.g. `hotels/hotel-1.jpg`. The fallback map does
not need to change — only the file.

## Layout

```
assets/
  placeholder.svg          generic
  hero.svg                 hero background
  hotels/hotel-1.svg       hotel cards
  rooms/room-1.svg         room cards
  gallery/gallery-1.svg    gallery preview
  dining/dining-1.svg      dining
  amenities/amenity-1.svg  amenities / wellness
  testimonials/avatar-1.svg reviewer avatars
  offers/offer-1.svg       offer cards
```
