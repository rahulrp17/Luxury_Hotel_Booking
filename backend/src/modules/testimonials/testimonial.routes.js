const express = require("express");
const router = express.Router();
const testimonialController = require("./testimonial.controller");
const { protect } = require("../../middlewares/auth.middleware");
const { adminOnly } = require("../../middlewares/admin.middleware");
const validate = require("../../middlewares/validate");
const { cacheMiddleware, queryCacheKey } = require("../../middlewares/cache");
const { CACHE_TTL } = require("../../config/constants");
const {
  createTestimonialValidator,
  updateTestimonialValidator,
  testimonialsQueryValidator,
} = require("./testimonial.validator");

// Public routes
router.get(
  "/",
  testimonialsQueryValidator,
  validate,
  cacheMiddleware((req) => queryCacheKey("testimonials:list", req.query), CACHE_TTL.ROOM_LIST),
  testimonialController.getTestimonials
);
router.get(
  "/featured",
  cacheMiddleware((req) => queryCacheKey("testimonials:featured", req.query), CACHE_TTL.FEATURED_HOTELS),
  testimonialController.getFeaturedTestimonials
);
router.get("/:id", cacheMiddleware((req) => `testimonial:${req.params.id}`, CACHE_TTL.ROOM_LIST), testimonialController.getTestimonialById);

// Admin routes
router.use(protect, adminOnly);
router.post("/", createTestimonialValidator, validate, testimonialController.createTestimonial);
router.put("/:id", updateTestimonialValidator, validate, testimonialController.updateTestimonial);
router.delete("/:id", testimonialController.deleteTestimonial);

module.exports = router;