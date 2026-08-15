/**
 * Editorial content for the About page: story, values, stats and timeline.
 */
import { getFallbackAsset } from "@/constants/assets";

export const ABOUT_STORY = {
  eyebrow: "The Aurelia Story",
  title: "A stay beyond expectations",
  description:
    "Aurelia Stay began with a single belief — that a great hotel should feel less like a transaction and more like a home you happen to visit. Since our first lakeside property opened, we've grown to a small collection of exceptional addresses, each chosen for the same reasons: stillness, beauty and the quiet craft of hospitality.",
};

export const ABOUT_VALUES = [
  {
    icon: "eye",
    title: "Discretion",
    body: "Your time is yours. Our teams are present without being intrusive, and your preferences are remembered across every visit.",
  },
  {
    icon: "mapPin",
    title: "Place",
    body: "Every Aurelia Stay is rooted in its location — local architecture, local produce, local stories — never a formula repeated.",
  },
  {
    icon: "star",
    title: "Considered craft",
    body: "From hand-block-printed linens to cellar pours, the details are chosen slowly so your stay feels effortless.",
  },
];

export const ABOUT_STATS = [
  { value: "12", label: "Exceptional addresses" },
  { value: "20+", label: "Curated experiences" },
  { value: "98%", label: "Guest satisfaction" },
  { value: "24/7", label: "White-glove concierge" },
];

export const ABOUT_TIMELINE = [
  {
    year: "2012",
    title: "The first lake",
    body: "A single heritage haveli on the edge of Lake Pichola opens its doors.",
  },
  {
    year: "2016",
    title: "The shore calls",
    body: "A beachfront property on the south coast of Goa joins the collection.",
  },
  {
    year: "2019",
    title: "Into the hills",
    body: "An Alpine House retreat wraps in apple orchards above Shimla.",
  },
  {
    year: "2024",
    title: "The palace",
    body: "A restored 19th-century palace brings Aurelia Stay to Jaipur.",
  },
];

export const ABOUT_GALLERY = [
  { src: getFallbackAsset("hotel", 0), alt: "Lakeside heritage suite at dusk" },
  { src: getFallbackAsset("gallery", 3), alt: "Sea-facing pool pavilion" },
  { src: getFallbackAsset("hotel", 2), alt: "Mountain lodge wrapped in orchards" },
  { src: getFallbackAsset("gallery", 5), alt: "Evening candlelit terrace" },
];

export default { ABOUT_STORY, ABOUT_VALUES, ABOUT_STATS, ABOUT_TIMELINE, ABOUT_GALLERY };