const express = require("express");
const router = express.Router();
const diningController = require("./dining.controller");
const { protect } = require("../../middlewares/auth.middleware");
const { adminOnly } = require("../../middlewares/admin.middleware");
const validate = require("../../middlewares/validate");
const { cacheMiddleware, queryCacheKey } = require("../../middlewares/cache");
const { CACHE_TTL } = require("../../config/constants");
const {
  createDiningValidator,
  updateDiningValidator,
  diningQueryValidator,
} = require("./dining.validator");

// Public routes
router.get(
  "/",
  diningQueryValidator,
  validate,
  cacheMiddleware((req) => queryCacheKey("dining:list", req.query), CACHE_TTL.ROOM_LIST),
  diningController.getDining
);
router.get(
  "/featured",
  cacheMiddleware((req) => queryCacheKey("dining:featured", req.query), CACHE_TTL.FEATURED_HOTELS),
  diningController.getFeaturedDining
);
router.get("/:id", cacheMiddleware((req) => `dining:${req.params.id}`, CACHE_TTL.ROOM_LIST), diningController.getDiningById);

// Admin routes
router.use(protect, adminOnly);
router.post("/", createDiningValidator, validate, diningController.createDining);
router.put("/:id", updateDiningValidator, validate, diningController.updateDining);
router.delete("/:id", diningController.deleteDining);

module.exports = router;