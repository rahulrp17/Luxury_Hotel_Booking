const express = require("express");
const router = express.Router();
const amenityController = require("./amenity.controller");
const { protect } = require("../../middlewares/auth.middleware");
const { adminOnly } = require("../../middlewares/admin.middleware");
const validate = require("../../middlewares/validate");
const {
  createAmenityValidator,
  updateAmenityValidator,
  amenitiesQueryValidator,
} = require("./amenity.validator");
const { cacheMiddleware, queryCacheKey } = require("../../middlewares/cache");
const { CACHE_TTL } = require("../../config/constants");

// Public routes
router.get(
  "/",
  amenitiesQueryValidator,
  validate,
  cacheMiddleware((req) => queryCacheKey("amenities:list", req.query), CACHE_TTL.ROOM_LIST),
  amenityController.getAmenities
);
router.get("/:id", cacheMiddleware((req) => `amenity:${req.params.id}`, CACHE_TTL.ROOM_LIST), amenityController.getAmenity);

// Admin routes
router.use(protect, adminOnly);
router.post("/", createAmenityValidator, validate, amenityController.createAmenity);
router.put("/:id", updateAmenityValidator, validate, amenityController.updateAmenity);
router.delete("/:id", amenityController.deleteAmenity);

module.exports = router;
