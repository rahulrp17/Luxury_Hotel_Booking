const { body } = require("express-validator");
const { BOOKING_STATUS } = require("../../config/constants");

const createBookingValidator = [
  body("hotel").notEmpty().withMessage("Hotel ID is required").isMongoId().withMessage("Invalid hotel ID"),
  body("room").notEmpty().withMessage("Room ID is required").isMongoId().withMessage("Invalid room ID"),
  body("checkIn").isISO8601().withMessage("Valid check-in date is required").toDate(),
  body("checkOut").isISO8601().withMessage("Valid check-out date is required").toDate(),
  body("guests.adults").isInt({ min: 1 }).withMessage("At least 1 adult is required"),
  body("guests.children").optional().isInt({ min: 0 }),
  body("addons").optional().isArray(),
  // Addons are resolved against the server-side catalog by `code` (price is
  // always server-derived). Presence is enforced in the service.
  body("addons.*.code").optional().isString(),
  body("addons.*.quantity").optional().isInt({ min: 1 }),
  body("guestDetails.name").notEmpty().withMessage("Guest name is required"),
  body("guestDetails.email").isEmail().withMessage("Valid guest email is required"),
  body("guestDetails.phone").notEmpty().withMessage("Guest phone is required"),
  body("offerCode").optional().isString(),
  body("specialRequests").optional().isString().isLength({ max: 500 }),
];

const updateStatusValidator = [
  body("status").isIn(Object.values(BOOKING_STATUS)).withMessage("Invalid booking status"),
];

module.exports = { createBookingValidator, updateStatusValidator };
