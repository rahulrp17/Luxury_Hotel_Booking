const express = require("express");
const router = express.Router();
const hotelController = require("./hotel.controller");
const { protect } = require("../../middlewares/auth.middleware");
const { adminOnly } = require("../../middlewares/admin.middleware");
const validate = require("../../middlewares/validate");
const { cacheMiddleware, queryCacheKey } = require("../../middlewares/cache");
const { uploadLimiter } = require("../../middlewares/rateLimiter");
const { uploadHotelImages } = require("../../config/cloudinary");
const { createHotelValidator, updateHotelValidator, hotelsQueryValidator } = require("./hotel.validator");
const { CACHE_TTL } = require("../../config/constants");

// Public routes
router.get(
  "/",
  hotelsQueryValidator,
  validate,
  cacheMiddleware((req) => queryCacheKey("hotels:list", req.query), CACHE_TTL.HOTEL_LIST),
  hotelController.getHotels
);
router.get("/search", cacheMiddleware((req) => queryCacheKey("hotels:search", req.query), CACHE_TTL.SEARCH_RESULTS), hotelController.searchHotels);
router.get("/featured", cacheMiddleware((req) => queryCacheKey("hotels:featured", req.query), CACHE_TTL.FEATURED_HOTELS), hotelController.getFeaturedHotels);
router.get("/nearby", cacheMiddleware((req) => queryCacheKey("hotels:nearby", req.query), CACHE_TTL.HOTEL_LIST), hotelController.getNearbyHotels);
router.get("/:id", cacheMiddleware((req) => `hotel:${req.params.id}`, CACHE_TTL.HOTEL_DETAIL), hotelController.getHotelById);

// Admin only routes
router.use(protect, adminOnly);
// Admin hotel list — includes deactivated/soft-deleted hotels and bypasses the
// public Redis list cache so the admin panel always reflects MongoDB on mount.
router.get("/admin/all", hotelsQueryValidator, validate, hotelController.getAdminHotels);
router.post("/", createHotelValidator, validate, hotelController.createHotel);
router.put("/:id", updateHotelValidator, validate, hotelController.updateHotel);
router.delete("/:id", hotelController.deleteHotel);
router.post("/:id/images", uploadLimiter, uploadHotelImages.array("images", 10), hotelController.addHotelImages);
router.delete("/:id/images/:imageId", hotelController.removeHotelImage);
router.patch("/:id/images/:imageId/primary", hotelController.setPrimaryHotelImage);

module.exports = router;
