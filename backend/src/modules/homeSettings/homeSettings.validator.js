const { body } = require("express-validator");

const SECTION_KEYS = [
  "hero",
  "experience",
  "featuredHotels",
  "featuredRooms",
  "amenities",
  "gallery",
  "dining",
  "offers",
  "reviews",
  "stats",
  "map",
  "faq",
  "newsletter",
  "cta",
];

const sectionBooleans = SECTION_KEYS.map((key) =>
  body(`sections.${key}`).optional().isBoolean().withMessage(`${key} must be a boolean`)
);

const updateHomeSettingsValidator = [
  ...sectionBooleans,
  body("content.heroEyebrow").optional().trim().isLength({ max: 120 }),
  body("content.heroTitle").optional().trim().isLength({ max: 200 }),
  body("content.heroSubtitle").optional().trim().isLength({ max: 500 }),
  body("content.newsLetterTitle").optional().trim().isLength({ max: 200 }),
  body("content.newsLetterDescription").optional().trim().isLength({ max: 500 }),
  body("content.metaDescription").optional().trim().isLength({ max: 500 }),
  body("seo.title").optional().trim().isLength({ max: 200 }),
  body("seo.description").optional().trim().isLength({ max: 500 }),
];

module.exports = { updateHomeSettings: updateHomeSettingsValidator };