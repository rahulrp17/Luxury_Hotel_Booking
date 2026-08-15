/**
 * Curated dining outlets for the Aurelia Stay dining pages.
 */
import { getFallbackAsset } from "@/constants/assets";

export const DINING = [
  {
    id: "saffron",
    name: "Saffron",
    cuisine: "Modern Indian",
    rating: 4.9,
    location: "The Grand, Udaipur",
    tagline: "Garden-to-plate regional Indian, reimagined on a lakeside terrace.",
    description:
      "Saffron takes the traditions of regional Indian kitchens and serves them with quiet confidence on an open-air lakeside terrace. Ingredients arrive each morning from our own kitchen gardens; every dish is finished over live coals.",
    signature: ["Smoked Dal Makhani", "Kohlrabi Tikka", "Stone-Oven Naan"],
    hours: "6:00 pm — 11:30 pm",
    dressCode: "Smart elegant",
    poster: getFallbackAsset("dining", 0),
    gallery: [
      getFallbackAsset("dining", 0),
      getFallbackAsset("dining", 1),
      getFallbackAsset("dining", 2),
    ],
  },
  {
    id: "marbella",
    name: "Mar Bella",
    cuisine: "Coastal Mediterranean",
    rating: 4.8,
    location: "The Cove, Goa",
    tagline: "Sun-bleached Mediterranean plates steps from the shore.",
    description:
      "A slow-lunch institution on a private beach. Mar Bella serves the coastal cooking of the Mediterranean — wood-grilled fish, citrus-bright salads, and olive-oil everything — barefoot and facing the sea.",
    signature: ["Whole Grilled Sea Bass", "Burrata & Blood Orange", "Saffron Riso Nero"],
    hours: "12:30 pm — 10:00 pm",
    dressCode: "Resort casual",
    poster: getFallbackAsset("dining", 1),
    gallery: [
      getFallbackAsset("dining", 1),
      getFallbackAsset("dining", 2),
      getFallbackAsset("dining", 0),
    ],
  },
  {
    id: "orchard",
    name: "The Orchard",
    cuisine: "Farm-to-table",
    rating: 4.7,
    location: "Alpine House, Shimla",
    tagline: "A mountain kitchen that cooks with the harvest, not against it.",
    description:
      "Perched among apple orchards, The Orchard builds its menu entirely from what the mountain gives — berries, stone fruit, wild herbs and heirloom vegetables. A wood-fired hearth anchors the room.",
    signature: ["Hearth-Baked Sourdough", "Wild Berry Tart", "Slow Lamb Shoulder"],
    hours: "7:00 am — 10:30 pm",
    dressCode: "Smart casual",
    poster: getFallbackAsset("dining", 2),
    gallery: [
      getFallbackAsset("dining", 2),
      getFallbackAsset("dining", 3),
      getFallbackAsset("gallery", 4),
    ],
  },
  {
    id: "noir",
    name: "Noir & Gold",
    cuisine: "Rooftop Bar",
    rating: 4.9,
    location: "The Grand, Udaipur",
    tagline: "Cocktails over the city walls as the lights come up.",
    description:
      "An intimate rooftop lounge that glows gold at dusk. Noir & Gold pours a serious bar — classic cocktails reimagined with local spirits and bitters — while the old city lights flicker on below.",
    signature: ["Smoked Old Fashioned", "Saffron Negroni", "City-Lights G&T"],
    hours: "5:00 pm — 1:00 am",
    dressCode: "Elegant evening",
    poster: getFallbackAsset("dining", 3),
    gallery: [
      getFallbackAsset("dining", 3),
      getFallbackAsset("dining", 0),
      getFallbackAsset("dining", 1),
    ],
  },
];

export const getDiningById = (id) => DINING.find((item) => item.id === id);

export default DINING;