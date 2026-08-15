const { body, query } = require("express-validator");

const createGalleryItemValidator = [
  body("title").optional().trim().isLength({ max: 150 }),
  body("url").trim().notEmpty().withMessage("Image URL is required").isURL({ require_protocol: false }).withMessage("Invalid image URL"),
  body("publicId").optional().trim(),
  body("alt").optional().trim().isLength({ max: 200 }),
  body("caption").optional().trim().isLength({ max: 200 }),
  body("hotel").optional().trim().isLength({ max: 120 }),
  body("category").optional().isIn(["hotel", "room", "dining", "spa", "destination", "other"]),
  body("hotelRef").optional().isMongoId().withMessage("Invalid hotel reference"),
  body("sortOrder").optional().isInt(),
  body("isFeatured").optional().isBoolean(),
  body("isActive").optional().isBoolean(),
];

const updateGalleryItemValidator = createGalleryItemValidator.map((v) =>
  v.optional({ values: "falsy" })
);

const galleryQueryValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("limit must be 1-50"),
  query("isFeatured").optional().isIn(["true", "false"]),
  query("category").optional().isIn(["hotel", "room", "dining", "spa", "destination", "other"]),
  query("search").optional().isString().isLength({ max: 120 }),
];

module.exports = { createGalleryItemValidator, updateGalleryItemValidator, galleryQueryValidator };