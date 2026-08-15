const express = require("express");
const router = express.Router();
const bookingController = require("./booking.controller");
const { protect } = require("../../middlewares/auth.middleware");
const { adminOnly } = require("../../middlewares/admin.middleware");
const validate = require("../../middlewares/validate");
const { bookingLimiter } = require("../../middlewares/rateLimiter");
const { createBookingValidator, updateStatusValidator } = require("./booking.validator");

// All booking routes require authentication
router.use(protect);

// User routes
router.post("/", bookingLimiter, createBookingValidator, validate, bookingController.createBooking);
router.get("/", bookingController.getUserBookings);

// Admin routes (registered BEFORE /:id so "admin" isn't captured as a route param)
router.get("/admin/all", adminOnly, bookingController.getAllBookings);
router.patch("/admin/:id/status", adminOnly, updateStatusValidator, validate, bookingController.updateBookingStatus);

// User routes with :id param (must stay AFTER /admin/* routes above)
router.get("/:id", bookingController.getBookingById);
router.patch("/:id/cancel", bookingController.cancelBooking);

module.exports = router;
