const express = require("express");
const router = express.Router();
const reviewController = require("./review.controller");
const { protect } = require("../../middlewares/auth.middleware");
const { managerOrAdmin } = require("../../middlewares/admin.middleware");
const validate = require("../../middlewares/validate");
const { uploadLimiter } = require("../../middlewares/rateLimiter");
const { uploadReviewImages } = require("../../config/cloudinary");
const { createReviewValidator, updateReviewValidator } = require("./review.validator");
const { cacheMiddleware, queryCacheKey } = require("../../middlewares/cache");

// Public routes
// Hotel review lists are a hot read on every hotel-detail page view. Cached
// briefly (60s) so repeated views hit Redis instead of MongoDB.
router.get("/hotel/:hotelId", cacheMiddleware((req) => queryCacheKey(`reviews:hotel:${req.params.hotelId}`, req.query), 60), reviewController.getHotelReviews);

// Protected routes (User)
router.use(protect);
router.post(
  "/", 
  uploadLimiter, 
  uploadReviewImages.array("images", 5), 
  createReviewValidator, 
  validate, 
  reviewController.createReview
);
router.put("/:id", updateReviewValidator, validate, reviewController.updateReview);
router.delete("/:id", reviewController.deleteReview);
router.patch("/:id/helpful", reviewController.toggleHelpfulVote);

// Admin / Manager routes
router.post("/:id/respond", managerOrAdmin, reviewController.respondToReview);

module.exports = router;
