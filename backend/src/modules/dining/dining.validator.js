const { body, query } = require("express-validator");

const createDiningValidator = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 200 }),
  body("subtitle").optional().trim().isLength({ max: 300 }),
  body("description").optional().trim().isLength({ max: 2000 }),
  // hotel is a display venue name string (e.g. "Panaji Grill"), not an ObjectId
  body("hotel").optional().trim().isLength({ max: 100 }).withMessage("Hotel name is too long"),
  body("city").optional().trim().isLength({ max: 100 }),
  body("image.url").optional().isString().isURL({ require_protocol: false }),
  body("image.publicId").optional().isString(),
  body("cuisine").optional().trim().isLength({ max: 100 }),
  body("rating").optional().isFloat({ min: 0, max: 5 }),
  body("sortOrder").optional().isInt({ min: 0 }),
  body("isFeatured").optional().isBoolean(),
  body("isActive").optional().isBoolean(),
];

const updateDiningValidator = createDiningValidator.map((v) =>
  v.optional({ values: "falsy" })
);

const diningQueryValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("limit must be 1-50"),
  query("city").optional().isString().isLength({ max: 100 }),
  query("isFeatured").optional().isBoolean(),
  query("search").optional().isString().isLength({ max: 100 }),
];

module.exports = { createDiningValidator, updateDiningValidator, diningQueryValidator };