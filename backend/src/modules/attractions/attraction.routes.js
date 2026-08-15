const express = require("express");
const router = express.Router();
const attractionController = require("./attraction.controller");
const { protect } = require("../../middlewares/auth.middleware");
const { adminOnly } = require("../../middlewares/admin.middleware");
const validate = require("../../middlewares/validate");
const { cacheMiddleware, queryCacheKey } = require("../../middlewares/cache");
const { CACHE_TTL } = require("../../config/constants");
const {
  createAttractionValidator,
  updateAttractionValidator,
  attractionsQueryValidator,
} = require("./attraction.validator");

// Public routes
router.get(
  "/",
  attractionsQueryValidator,
  validate,
  cacheMiddleware((req) => queryCacheKey("attractions:list", req.query), CACHE_TTL.ROOM_LIST),
  attractionController.getAttractions
);
router.get(
  "/nearby",
  attractionsQueryValidator,
  validate,
  cacheMiddleware((req) => queryCacheKey("attractions:nearby", req.query), CACHE_TTL.ROOM_LIST),
  attractionController.getNearbyAttractions
);
router.get(
  "/featured",
  cacheMiddleware((req) => queryCacheKey("attractions:featured", req.query), CACHE_TTL.FEATURED_HOTELS),
  attractionController.getFeaturedAttractions
);
router.get("/:id", cacheMiddleware((req) => `attraction:${req.params.id}`, CACHE_TTL.ROOM_LIST), attractionController.getAttractionById);

// Admin routes
router.use(protect, adminOnly);
router.post("/", createAttractionValidator, validate, attractionController.createAttraction);
router.put("/:id", updateAttractionValidator, validate, attractionController.updateAttraction);
router.delete("/:id", attractionController.deleteAttraction);

module.exports = router;