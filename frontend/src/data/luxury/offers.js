/**
 * Curated offers / packages for the Offers page. Static marketing content —
 * componentises cleanly so a live offers API can replace it later.
 */
import { getFallbackAsset } from "@/constants/assets";

export const OFFERS = [
  {
    id: "romantic-escape",
    title: "The Romantic Escape",
    tagline: "A candlelit dinner on the terrace, rose-petal turndown and a sunset sail for two.",
    code: "ROMANCE",
    validUntil: "31 Dec 2026",
    terms: [
      "Minimum two nights",
      "Includes one dinner for two",
      "Subject to availability",
    ],
    poster: getFallbackAsset("offer", 0),
  },
  {
    id: "weekend-retreat",
    title: "The Weekend Retreat",
    tagline: "Stay three nights, pay for two — with daily breakfast and a 90-minute spa credit.",
    code: "WEEKEND",
    validUntil: "31 Mar 2027",
    terms: [
      "Friday to Sunday stays",
      "Complimentary spa credit",
      "Not valid during holidays",
    ],
    poster: getFallbackAsset("hotel", 1),
  },
  {
    id: "family-suite",
    title: "Family Suite Escape",
    tagline: "Connecting suites, kids' amenities and a daily curated kids' itinerary — all included.",
    code: "FAMILY",
    validUntil: "31 Mar 2027",
    terms: [
      "Up to 2 children stay free",
      "Kids' club access included",
      "Book 7 days in advance",
    ],
    poster: getFallbackAsset("room", 2),
  },
  {
    id: "spa-lovers",
    title: "Spa Lovers' Sanctuary",
    tagline: "Two signature rituals, afternoon tea and late checkout on your final morning.",
    code: "SPASO",
    validUntil: "31 Dec 2026",
    terms: [
      "Two 90-minute rituals",
      "Afternoon tea for two",
      "Late checkout by request",
    ],
    poster: getFallbackAsset("amenity", 1),
  },
  {
    id: "golden-wedding",
    title: "Golden Wedding Planner",
    tagline: "A dedicated planner, private venue and ceremony styling for a wedding that reads like a film.",
    code: "VOWS",
    validUntil: "On request",
    terms: [
      "Dedicated wedding planner",
      "Venue & catering included",
      "Terms on consultation",
    ],
    poster: getFallbackAsset("gallery", 5),
  },
  {
    id: "long-stay",
    title: "The Longer Stay",
    tagline: "Seven nights or more — enjoy a 15% rate reduction and a weekly curated excursion.",
    code: "STAY",
    validUntil: "Ongoing",
    terms: [
      "Minimum 7 nights",
      "15% off standard rates",
      "One excursion per week",
    ],
    poster: getFallbackAsset("hotel", 3),
  },
];

export default OFFERS;