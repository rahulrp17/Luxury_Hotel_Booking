const { body } = require("express-validator");

const createHeroBannerValidator = [
  body("eyebrow").optional().trim().isLength({ max: 120 }),
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 200 }),
  body("highlight").optional().trim().isLength({ max: 200 }),
  body("subtitle").optional().trim().isLength({ max: 500 }),
  body("video").optional().isString().isURL({ require_protocol: false }).withMessage("Invalid video URL"),
  body("image").optional().isString().isURL({ require_protocol: false }).withMessage("Invalid image URL"),
  body("poster").optional().isString().isURL({ require_protocol: false }).withMessage("Invalid poster URL"),
  body("ctaPrimary.label").optional().trim().isLength({ max: 60 }),
  body("ctaPrimary.href").optional().trim().isLength({ max: 300 }),
  body("ctaSecondary.label").optional().trim().isLength({ max: 60 }),
  body("ctaSecondary.href").optional().trim().isLength({ max: 300 }),
  body("isActive").optional().isBoolean(),
];

const updateHeroBannerValidator = createHeroBannerValidator.map((v) =>
  v.optional({ values: "falsy" })
);

module.exports = { createHeroBannerValidator, updateHeroBannerValidator };