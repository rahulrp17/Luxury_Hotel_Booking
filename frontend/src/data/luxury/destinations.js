/**
 * Destination overviews for the Discover page. Each slug maps to a
 * DestinationDetail route; hotel counts reference real hotels in the DB.
 */
import { getFallbackAsset } from "@/constants/assets";

export const DESTINATIONS = [
  {
    slug: "udaipur",
    name: "Udaipur",
    country: "India",
    tagline: "The City of Lakes, framed in marble and gold.",
    hotels: 3,
    description:
      "A city of mirrored lakes and marble palaces, Udaipur is where Aurelia Stay began. Our two lakeside properties and one heritage haveli sit on the water's edge — wake to mist over Lake Pichola and sleep to the sound of bells across the ghats.",
    highlights: [
      "Lake Pichola sunrises",
      "Heritage haveli suites",
      "Private boat transfers",
      "Old-city dining concierge",
    ],
    poster: getFallbackAsset("hotel", 0),
    gallery: [
      getFallbackAsset("hotel", 0),
      getFallbackAsset("hotel", 1),
      getFallbackAsset("gallery", 0),
      getFallbackAsset("gallery", 1),
    ],
  },
  {
    slug: "goa",
    name: "Goa",
    country: "India",
    tagline: "Sun-bleached shores and slow coastal evenings.",
    hotels: 2,
    description:
      "On a private stretch of south Goa sand, our beachfront resort is all low-slung architecture, salt air and barefoot elegance. Days drift between the tide and the spa; evenings belong to fire pits and the shore.",
    highlights: [
      "Private beach access",
      "Sunset catamaran sails",
      "Sea-facing spa pavilions",
      "Coastal tasting menus",
    ],
    poster: getFallbackAsset("hotel", 4),
    gallery: [
      getFallbackAsset("hotel", 4),
      getFallbackAsset("hotel", 5),
      getFallbackAsset("gallery", 3),
      getFallbackAsset("gallery", 2),
    ],
  },
  {
    slug: "shimla",
    name: "Shimla",
    country: "India",
    tagline: "Pine-fringed altitudes and a hearth-lit mountain lodge.",
    hotels: 2,
    description:
      "An hour above the clouds, our Alpine House is a timber-and-stone mountain lodge wrapped in apple orchards. Wood fires, cashmere throws and long walks through cedar forest — the very opposite of hurry.",
    highlights: [
      "Apple orchard grounds",
      "Hearth-lit lounge",
      "Alpine hiking trails",
      "Farm-to-hearth kitchen",
    ],
    poster: getFallbackAsset("hotel", 2),
    gallery: [
      getFallbackAsset("hotel", 2),
      getFallbackAsset("hotel", 3),
      getFallbackAsset("gallery", 4),
      getFallbackAsset("gallery", 5),
    ],
  },
  {
    slug: "jaipur",
    name: "Jaipur",
    country: "India",
    tagline: "Rajasthan's pink city, a palace in the middle of it.",
    hotels: 1,
    description:
      "A restored 19th-century palace at the edge of the old city. Jaipur's fortress-pink architecture, block-print ateliers and spice-scented bazaars begin at our front door; inside, it's all domed ceilings and hand-painted frescoes.",
    highlights: [
      "Restored palace suites",
      "Private courtyard dining",
      "Block-print ateliers nearby",
      "Old-city heritage walks",
    ],
    poster: getFallbackAsset("hotel", 6),
    gallery: [
      getFallbackAsset("hotel", 6),
      getFallbackAsset("hotel", 7),
      getFallbackAsset("gallery", 6),
      getFallbackAsset("gallery", 7),
    ],
  },
];

export const getDestinationBySlug = (slug) =>
  DESTINATIONS.find((item) => item.slug === slug);

export default DESTINATIONS;