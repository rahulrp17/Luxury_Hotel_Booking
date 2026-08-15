const { body, query } = require("express-validator");
const { ROOM_TYPES, HOTEL_CATEGORIES } = require("../../config/constants");

const ROOM_SORTS = ["price_asc", "price_desc", "rating", "newest", "popular", "featured"];

/**
 * Query validation for GET /rooms/featured
 */
const featuredRoomsQueryValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("limit must be an integer between 1 and 50"),
];

/**
 * Query validation for GET /rooms
 */
const roomsQueryValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("limit must be an integer between 1 and 50"),
  query("hotelId").optional().isMongoId().withMessage("hotelId must be a valid ObjectId"),
  query("type").optional().isIn(Object.values(ROOM_TYPES)).withMessage("Invalid room type"),
  query("category")
    .optional()
    .isIn(Object.values(HOTEL_CATEGORIES))
    .withMessage("Invalid hotel category"),
  query("minPrice").optional().isFloat({ min: 0 }).withMessage("minPrice must be >= 0"),
  query("maxPrice").optional().isFloat({ min: 0 }).withMessage("maxPrice must be >= 0"),
  query("capacity").optional().isInt({ min: 1 }).withMessage("capacity must be a positive integer"),
  query("beds").optional().isInt({ min: 1 }).withMessage("beds must be a positive integer"),
  query("featured").optional().isIn(["true", "false"]).withMessage("featured must be true/false"),
  query("available").optional().isIn(["true", "false"]).withMessage("available must be true/false"),
  query("checkIn").optional().isISO8601().withMessage("checkIn must be a valid date"),
  query("checkOut").optional().isISO8601().withMessage("checkOut must be a valid date"),
  query("amenities").optional().isString().withMessage("amenities must be a comma-separated string"),
  query("sort").optional().isIn(ROOM_SORTS).withMessage(`sort must be one of: ${ROOM_SORTS.join(", ")}`),
];

const createRoomValidator = [
  body("hotel").notEmpty().withMessage("Hotel ID is required").isMongoId().withMessage("Invalid hotel ID"),
  body("name").trim().notEmpty().withMessage("Room name is required").isLength({ max: 100 }),
  body("type").isIn(Object.values(ROOM_TYPES)).withMessage("Invalid room type"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("maxOccupancy.adults").isInt({ min: 1, max: 10 }).withMessage("Adults must be between 1 and 10"),
  body("maxOccupancy.children").optional().isInt({ min: 0, max: 6 }),
  body("basePricePerNight").isFloat({ min: 0 }).withMessage("Base price must be a positive number"),
  body("totalUnits").isInt({ min: 1 }).withMessage("Total units must be at least 1"),
  body("weekendPremium").optional().isFloat({ min: 0, max: 100 }),
  body("seasonalPricing").optional().isArray(),
  body("seasonalPricing.*.name").optional().notEmpty(),
  body("seasonalPricing.*.multiplier").optional().isFloat({ min: 0.5, max: 5 }),
];

const updateRoomValidator = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Room name cannot be empty")
    .isLength({ max: 100 })
    .withMessage("Room name cannot exceed 100 characters"),

  body("type")
    .optional()
    .isIn(Object.values(ROOM_TYPES))
    .withMessage("Invalid room type"),

  body("description")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Description cannot be empty"),

  body("maxOccupancy.adults")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("Adults must be between 1 and 10"),

  body("maxOccupancy.children")
    .optional()
    .isInt({ min: 0, max: 6 })
    .withMessage("Children must be between 0 and 6"),

  body("size")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Size must be >= 0"),

  body("floor")
    .optional()
    .isInt()
    .withMessage("Floor must be an integer"),

  body("bedConfiguration")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Bed configuration is too long"),

  body("view")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("View is too long"),

  body("amenities")
    .optional()
    .isArray()
    .withMessage("Amenities must be an array"),

  body("amenities.*")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Each amenity must be a non-empty string"),

  body("basePricePerNight")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Base price must be >= 0"),

  body("totalUnits")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Total units must be at least 1"),

  body("weekendPremium")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Weekend premium must be between 0 and 100"),

  body("seasonalPricing")
    .optional()
    .isArray()
    .withMessage("Seasonal pricing must be an array"),

  body("seasonalPricing.*.name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Season name is required"),

  body("seasonalPricing.*.multiplier")
    .optional()
    .isFloat({ min: 0.5, max: 5 })
    .withMessage("Season multiplier must be between 0.5 and 5"),

  body("isFeatured")
    .optional()
    .isBoolean()
    .withMessage("isFeatured must be true or false"),
];

const availabilityQueryValidator = [
  query("checkIn").optional().isISO8601().withMessage("checkIn must be a valid date"),
  query("checkOut").optional().isISO8601().withMessage("checkOut must be a valid date"),
];

const blockedDatesQueryValidator = [
  query("startDate").optional().isISO8601().withMessage("startDate must be a valid date"),
  query("endDate").optional().isISO8601().withMessage("endDate must be a valid date"),
];

module.exports = {
  createRoomValidator,
  updateRoomValidator,
  featuredRoomsQueryValidator,
  roomsQueryValidator,
  availabilityQueryValidator,
  blockedDatesQueryValidator,
};
