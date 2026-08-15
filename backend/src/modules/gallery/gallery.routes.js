const express = require("express");
const router = express.Router();
const galleryController = require("./gallery.controller");
const { protect } = require("../../middlewares/auth.middleware");
const { adminOnly } = require("../../middlewares/admin.middleware");
const validate = require("../../middlewares/validate");
const { cacheMiddleware, queryCacheKey } = require("../../middlewares/cache");
const { CACHE_TTL } = require("../../config/constants");
const {
  createGalleryItemValidator,
  updateGalleryItemValidator,
  galleryQueryValidator,
} = require("./gallery.validator");

// Public routes
router.get(
  "/",
  galleryQueryValidator,
  validate,
  cacheMiddleware((req) => queryCacheKey("gallery:list", req.query), CACHE_TTL.ROOM_LIST),
  galleryController.getGalleryItems
);
router.get(
  "/featured",
  cacheMiddleware((req) => queryCacheKey("gallery:featured", req.query), CACHE_TTL.FEATURED_HOTELS),
  galleryController.getFeaturedGallery
);
router.get("/:id", cacheMiddleware((req) => `gallery:${req.params.id}`, CACHE_TTL.ROOM_LIST), galleryController.getGalleryItemById);

// Admin routes
router.use(protect, adminOnly);
router.post("/", createGalleryItemValidator, validate, galleryController.createGalleryItem);
router.put("/:id", updateGalleryItemValidator, validate, galleryController.updateGalleryItem);
router.delete("/:id", galleryController.deleteGalleryItem);

module.exports = router;