const { body, query } = require("express-validator");

const createFaqValidator = [
  body("title").trim().notEmpty().withMessage("Question is required").isLength({ max: 200 }),
  body("content").trim().notEmpty().withMessage("Answer is required").isLength({ max: 2000 }),
  body("category").optional().trim().isLength({ max: 60 }),
  body("sortOrder").optional().isInt(),
  body("isActive").optional().isBoolean(),
];

const updateFaqValidator = [
  body("title").optional().trim().isLength({ max: 200 }),
  body("content").optional().trim().isLength({ max: 2000 }),
  body("category").optional().trim().isLength({ max: 60 }),
  body("sortOrder").optional().isInt(),
  body("isActive").optional().isBoolean(),
];

const faqsQueryValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be 1-100"),
  query("category").optional().isString().isLength({ max: 60 }),
  query("search").optional().isString().isLength({ max: 200 }),
];

module.exports = { createFaqValidator, updateFaqValidator, faqsQueryValidator };