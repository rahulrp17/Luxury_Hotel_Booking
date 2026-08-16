const { body, query } = require("express-validator");
const { HOTEL_CATEGORIES } = require("../../config/constants");

const createHotelValidator = [
  body("name").trim().notEmpty().withMessage("Hotel name is required").isLength({ max: 100 }),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("category").isIn(Object.values(HOTEL_CATEGORIES)).withMessage("Invalid hotel category"),
  body("starRating").isInt({ min: 1, max: 5 }).withMessage("Star rating must be 1-5"),
  body("address.street").notEmpty().withMessage("Street address is required"),
  body("address.city").notEmpty().withMessage("City is required"),
  body("address.state").notEmpty().withMessage("State is required"),
  body("contact.email").optional().isEmail().withMessage("Invalid contact email"),
  body("policies.checkIn").optional().matches(/^\d{2}:\d{2}$/).withMessage("Check-in time format must be HH:MM"),
  body("policies.checkOut").optional().matches(/^\d{2}:\d{2}$/).withMessage("Check-out time format must be HH:MM"),
];

const updateHotelValidator = [
  body("name").optional().trim().isLength({ min: 2, max: 100 }),
  body("category").optional().isIn(Object.values(HOTEL_CATEGORIES)),
  body("starRating").optional().isInt({ min: 1, max: 5 }),
  body("contact.email").optional().isEmail(),
];

const HOTEL_SORTS = ["recommended", "newest", "rating", "price_asc", "price_desc"];

/**
 * Query validation for GET /hotels
 */
const hotelsQueryValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("limit must be 1-50"),
  query("destination").optional().isString().isLength({ max: 100 }).withMessage("destination is too long"),
  query("city").optional().isString(),
  query("country").optional().isString(),
  query("category").optional().isIn(Object.values(HOTEL_CATEGORIES)).withMessage("Invalid category"),
  query("starRating").optional().isInt({ min: 1, max: 5 }).withMessage("starRating must be 1-5"),
  query("minStarRating").optional().isInt({ min: 1, max: 5 }).withMessage("minStarRating must be 1-5"),
  query("minRating").optional().isFloat({ min: 0, max: 5 }).withMessage("minRating must be 0-5"),
  query("minPrice").optional().isFloat({ min: 0 }).withMessage("minPrice must be >= 0"),
  query("maxPrice").optional().isFloat({ min: 0 }).withMessage("maxPrice must be >= 0"),
  query("amenities").optional().isString().withMessage("amenities must be a comma-separated string"),
  query("checkIn").optional().isISO8601().withMessage("checkIn must be a valid date"),
  query("checkOut").optional().isISO8601().withMessage("checkOut must be a valid date"),
  query("guests").optional().isInt({ min: 1, max: 10 }).withMessage("guests must be 1-10"),
  query("featured").optional().isIn(["true", "false"]).withMessage("featured must be true/false"),
  query("sort").optional().isIn(HOTEL_SORTS).withMessage(`sort must be one of: ${HOTEL_SORTS.join(", ")}`),
];

module.exports = {
  createHotelValidator,
  updateHotelValidator,
  hotelsQueryValidator,
};
