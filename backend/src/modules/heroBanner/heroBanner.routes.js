const express = require("express");
const router = express.Router();
const heroBannerController = require("./heroBanner.controller");
const { protect } = require("../../middlewares/auth.middleware");
const { adminOnly } = require("../../middlewares/admin.middleware");
const validate = require("../../middlewares/validate");
const { cacheMiddleware } = require("../../middlewares/cache");
const { CACHE_TTL } = require("../../config/constants");
const {
  createHeroBannerValidator,
  updateHeroBannerValidator,
} = require("./heroBanner.validator");

// Public routes
router.get(
  "/",
  cacheMiddleware("heroBanner:list", CACHE_TTL.FEATURED_HOTELS),
  heroBannerController.getAllBanners
);
router.get(
  "/active",
  cacheMiddleware("heroBanner:active", CACHE_TTL.FEATURED_HOTELS),
  heroBannerController.getActiveBanner
);

// Admin routes
router.use(protect, adminOnly);
router.post("/", createHeroBannerValidator, validate, heroBannerController.createBanner);
router.put("/:id", updateHeroBannerValidator, validate, heroBannerController.updateBanner);
router.delete("/:id", heroBannerController.deleteBanner);

module.exports = router;