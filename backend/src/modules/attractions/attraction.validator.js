const { body, query } = require("express-validator");

// Must match attraction.model.js category enum exactly.
const ATTRACTION_CATEGORIES = [
  "landmark",
  "beach",
  "temple",
  "shopping",
  "dining",
  "nature",
  "adventure",
  "other",
];

const createAttractionValidator = [
  body("name").trim().notEmpty().withMessage("Attraction name is required").isLength({ max: 150 }),
  body("description").optional().isLength({ max: 2000 }),
  body("category").optional().isIn(ATTRACTION_CATEGORIES).withMessage("Invalid category"),
  body("city").optional().trim().isLength({ max: 100 }),
  body("distance").optional().trim().isLength({ max: 40 }),
  body("address").optional().trim().isLength({ max: 300 }),
  body("location.type").optional().equals("Point"),
  body("location.coordinates").optional().isArray({ min: 2, max: 2 }).withMessage("coordinates must be [lng, lat]"),
  body("image").optional().isString().isURL({ require_protocol: false }).withMessage("Invalid image URL"),
  body("hotelRef").optional().isMongoId().withMessage("Invalid hotel reference"),
  body("sortOrder").optional().isInt(),
  body("isActive").optional().isBoolean(),
];

const updateAttractionValidator = [
  body("name").optional().trim().isLength({ max: 150 }),
  body("description").optional().isLength({ max: 2000 }),
  body("category").optional().isIn(ATTRACTION_CATEGORIES).withMessage("Invalid category"),
  body("city").optional().trim().isLength({ max: 100 }),
  body("distance").optional().trim().isLength({ max: 40 }),
  body("address").optional().trim().isLength({ max: 300 }),
  body("location.type").optional().equals("Point"),
  body("location.coordinates").optional().isArray({ min: 2, max: 2 }),
  body("image").optional().isString().isURL({ require_protocol: false }),
  body("hotelRef").optional().isMongoId(),
  body("sortOrder").optional().isInt(),
  body("isActive").optional().isBoolean(),
];

const attractionsQueryValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("limit must be 1-50"),
  query("city").optional().isString().isLength({ max: 100 }),
  query("category").optional().isString().isLength({ max: 60 }),
  query("hotelRef").optional().isMongoId(),
  query("search").optional().isString().isLength({ max: 120 }),
  query("lat").optional().isFloat({ min: -90, max: 90 }),
  query("lng").optional().isFloat({ min: -180, max: 180 }),
  query("radiusKm").optional().isFloat({ min: 1, max: 500 }),
];

module.exports = { createAttractionValidator, updateAttractionValidator, attractionsQueryValidator };