const { body, query } = require("express-validator");
const { AMENITY_CATEGORIES } = require("../../config/constants");

const createAmenityValidator = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 50 }),
  body("icon").trim().notEmpty().withMessage("Icon is required"),
  body("category").isIn(Object.values(AMENITY_CATEGORIES)).withMessage("Invalid category"),
  body("description").optional().isLength({ max: 200 }),
  body("image").optional().isString().isURL({ require_protocol: false }).withMessage("Image must be a valid URL"),
];

const updateAmenityValidator = [
  body("name").optional().trim().isLength({ max: 50 }),
  body("icon").optional().trim(),
  body("category").optional().isIn(Object.values(AMENITY_CATEGORIES)),
  body("description").optional().isLength({ max: 200 }),
  body("image").optional().isString().isURL({ require_protocol: false }).withMessage("Image must be a valid URL"),
];

const amenitiesQueryValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("limit must be 1-50"),
  query("category").optional().isIn(Object.values(AMENITY_CATEGORIES)).withMessage("Invalid category"),
  query("search").optional().isString().isLength({ max: 100 }),
];

module.exports = { createAmenityValidator, updateAmenityValidator, amenitiesQueryValidator };