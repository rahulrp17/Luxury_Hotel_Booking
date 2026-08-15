const { body } = require("express-validator");

const createReviewValidator = [
  body("hotel").notEmpty().withMessage("Hotel ID is required").isMongoId(),
  body("booking").notEmpty().withMessage("Booking ID is required").isMongoId(),
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 150 }),
  body("body").trim().notEmpty().withMessage("Review body is required").isLength({ min: 20, max: 2000 }),
  // Rating can be an object or a JSON string if uploaded via FormData
  body("rating").custom((value) => {
    let ratingObj = value;
    if (typeof value === "string") {
      try { ratingObj = JSON.parse(value); } 
      catch (e) { throw new Error("Invalid rating format"); }
    }
    if (!ratingObj || !ratingObj.overall || ratingObj.overall < 1 || ratingObj.overall > 5) {
      throw new Error("Overall rating must be between 1 and 5");
    }
    return true;
  }),
];

const updateReviewValidator = [
  body("title").optional().trim().isLength({ max: 150 }),
  body("body").optional().trim().isLength({ min: 20, max: 2000 }),
  body("rating.overall").optional().isFloat({ min: 1, max: 5 }),
];

module.exports = { createReviewValidator, updateReviewValidator };
