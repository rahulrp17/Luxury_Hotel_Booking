/**
 * Curated experiences content for the Aurelia Stay brand pages.
 * Images resolve to local fallback assets (real photos dropped into /public)
 * via getFallbackAsset; swap any `poster` for a Cloudinary URL later.
 */
import { getFallbackAsset } from "@/constants/assets";

export const EXPERIENCES = [
  {
    id: "sundowner-sailing",
    slug: "sundowner-sailing",
    title: "Sundowner Sailing",
    tag: "Water",
    duration: "3 hours",
    price: "₹4,200",
    rating: 4.9,
    tagline: "Sail into a gold-hour horizon aboard a private catamaran, champagne in hand.",
    description:
      "Board your private catamaran as the sun begins its descent. Glide past the coastline while our sommelier pours a curated champagne flight, and anchor in a quiet bay to watch the sky catch fire. A three-hour escape designed entirely around the hour the world goes golden.",
    highlights: [
      "Private catamaran & captain",
      "Champagne tasting flight",
      "Anchor point chosen by tide",
      "Vintage Polaroid memento",
    ],
    poster: getFallbackAsset("gallery", 0),
    gallery: [
      getFallbackAsset("gallery", 0),
      getFallbackAsset("gallery", 1),
      getFallbackAsset("gallery", 2),
    ],
  },
  {
    id: "spa-ritual",
    slug: "spa-ritual",
    title: "The Midnight Spa Ritual",
    tag: "Wellness",
    duration: "90 minutes",
    price: "₹6,800",
    rating: 4.8,
    tagline: "A 90-minute kinetic sequence for the body, set to candlelight.",
    description:
      "Our signature treatment layers hot-stone therapy, aromatic oil and a guided breath sequence in a candlelit sanctuary. Begin with a warm foot ritual, then surrender to a slow, flowing full-body massage that melts the week away.",
    highlights: [
      "Hot-stone therapy",
      "Aromatherapy oils",
      "Private candlelit suite",
      "Post-treatment herbal tea",
    ],
    poster: getFallbackAsset("amenity", 1),
    gallery: [
      getFallbackAsset("amenity", 1),
      getFallbackAsset("amenity", 0),
      getFallbackAsset("gallery", 3),
    ],
  },
  {
    id: "safari-expedition",
    slug: "safari-expedition",
    title: "Dawn Safari Expedition",
    tag: "Adventure",
    duration: "5 hours",
    price: "₹9,500",
    rating: 4.9,
    tagline: "Rise before the world and meet the wild in its most honest hour.",
    description:
      "Leave while the stars are still out, in an open-topped 4×4 led by a naturalist. Watch the reserve wake — mist rolling off the river, herds moving to water. Breakfast is served at a private hide, quiet enough to hear the bush breathe.",
    highlights: [
      "Naturalist-led 4×4",
      "Private bush breakfast",
      "Riverside game hide",
      "Field guide & binoculars",
    ],
    poster: getFallbackAsset("hotel", 2),
    gallery: [
      getFallbackAsset("hotel", 2),
      getFallbackAsset("hotel", 3),
      getFallbackAsset("gallery", 4),
    ],
  },
  {
    id: "chefs-table",
    slug: "chefs-table",
    title: "The Chef's Table",
    tag: "Private Dining",
    duration: "2 hours",
    price: "₹12,000",
    rating: 5.0,
    tagline: "Eight courses composed table-side by our executive chef.",
    description:
      "Take a seat at the kitchen's edge. Our chef narrates each of eight courses as they are plated before you, pairing produce from our own gardens with rare cellar pours. An intimate performance of taste, texture and story.",
    highlights: [
      "8-course tasting menu",
      "Cellar wine pairing",
      "Table-side plating",
      "Menu keepsake to take home",
    ],
    poster: getFallbackAsset("dining", 0),
    gallery: [
      getFallbackAsset("dining", 0),
      getFallbackAsset("dining", 1),
      getFallbackAsset("dining", 2),
    ],
  },
  {
    id: "yoga-at-dawn",
    slug: "yoga-at-dawn",
    title: "Yoga at Dawn",
    tag: "Wellness",
    duration: "60 minutes",
    price: "Complimentary",
    rating: 4.8,
    tagline: "Sunrise asana on a sea-facing deck, guided by our resident instructor.",
    description:
      "Begin each day with movement that meets the light. Our resident instructor guides a gently progressive sequence on an open sea-facing deck — suitable for every level, from first-timers to committed practitioners. End with savasana to the sound of the tide.",
    highlights: [
      "Open sea-facing deck",
      "All levels welcome",
      "Sunrise meditation",
      "Herbal tea to close",
    ],
    poster: getFallbackAsset("amenity", 0),
    gallery: [
      getFallbackAsset("amenity", 0),
      getFallbackAsset("gallery", 5),
      getFallbackAsset("gallery", 6),
    ],
  },
  {
    id: "wine-journey",
    slug: "wine-journey",
    title: "The Wine Journey",
    tag: "Private Dining",
    duration: "2 hours",
    price: "₹8,900",
    rating: 4.9,
    tagline: "A guided vertical of rare labels from our underground cellar.",
    description:
      "Descend into our temperature-controlled cellar — 4,000 bottles, many of them one-of-a-kind. Sommeliers guide you through a vertical tasting of a single vineyard, paired with artisan cheese and charcuterie from the region.",
    highlights: [
      "Underground cellar tour",
      "Vertical tasting flight",
      "Cheese & charcuterie board",
      "Personalised cellar notes",
    ],
    poster: getFallbackAsset("dining", 3),
    gallery: [
      getFallbackAsset("dining", 3),
      getFallbackAsset("dining", 0),
      getFallbackAsset("gallery", 1),
    ],
  },
];

export const getExperienceById = (id) =>
  EXPERIENCES.find((item) => item.id === id || item.slug === id);

export default EXPERIENCES;