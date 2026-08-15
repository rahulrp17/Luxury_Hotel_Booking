const { body, query } = require("express-validator");

const createTestimonialValidator = [
  body("name").trim().notEmpty().withMessage("Guest name is required").isLength({ max: 100 }),
  body("country").optional().trim().isLength({ max: 100 }),
  body("stay").optional().trim().isLength({ max: 150 }),
  body("rating").isFloat({ min: 1, max: 5 }).withMessage("rating must be 1-5"),
  body("review").trim().notEmpty().withMessage("Review text is required").isLength({ min: 10, max: 2000 }),
  body("subRatings").optional().isObject(),
  body("subRatings.cleanliness").optional().isFloat({ min: 1, max: 5 }),
  body("subRatings.service").optional().isFloat({ min: 1, max: 5 }),
  body("subRatings.location").optional().isFloat({ min: 1, max: 5 }),
  body("subRatings.comfort").optional().isFloat({ min: 1, max: 5 }),
  body("date").optional().isString().isLength({ max: 20 }),
  body("avatar").optional().isString().isURL({ require_protocol: false }).withMessage("avatar must be a valid URL"),
  body("verified").optional().isBoolean(),
  body("sortOrder").optional().isInt(),
  body("isActive").optional().isBoolean(),
];

const updateTestimonialValidator = [
  body("name").optional().trim().isLength({ max: 100 }),
  body("country").optional().trim().isLength({ max: 100 }),
  body("stay").optional().trim().isLength({ max: 150 }),
  body("rating").optional().isFloat({ min: 1, max: 5 }),
  body("review").optional().trim().isLength({ min: 10, max: 2000 }),
  body("subRatings").optional().isObject(),
  body("subRatings.cleanliness").optional().isFloat({ min: 1, max: 5 }),
  body("subRatings.service").optional().isFloat({ min: 1, max: 5 }),
  body("subRatings.location").optional().isFloat({ min: 1, max: 5 }),
  body("subRatings.comfort").optional().isFloat({ min: 1, max: 5 }),
  body("date").optional().isString().isLength({ max: 20 }),
  body("avatar").optional().isString().isURL({ require_protocol: false }),
  body("verified").optional().isBoolean(),
  body("sortOrder").optional().isInt(),
  body("isActive").optional().isBoolean(),
];

const testimonialsQueryValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("limit must be 1-50"),
  query("minRating").optional().isFloat({ min: 1, max: 5 }),
  query("verified").optional().isIn(["true", "false"]),
  query("country").optional().isString().isLength({ max: 100 }),
  query("search").optional().isString().isLength({ max: 100 }),
];

module.exports = { createTestimonialValidator, updateTestimonialValidator, testimonialsQueryValidator };