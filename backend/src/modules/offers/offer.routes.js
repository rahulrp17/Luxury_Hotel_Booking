const express = require("express");
const router = express.Router();
const offerController = require("./offer.controller");
const { protect } = require("../../middlewares/auth.middleware");
const { adminOnly } = require("../../middlewares/admin.middleware");
const { body } = require("express-validator");
const validate = require("../../middlewares/validate");
const { OFFER_TYPES } = require("../../config/constants");
const { cacheMiddleware, queryCacheKey } = require("../../middlewares/cache");
const { uploadLimiter } = require("../../middlewares/rateLimiter");
const { uploadOfferBanner } = require("../../config/cloudinary");

const createOfferValidator = [
  body("code").trim().notEmpty().withMessage("Offer code is required"),
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("type").isIn(Object.values(OFFER_TYPES)).withMessage("Invalid offer type"),
  body("value").isFloat({ min: 0 }).withMessage("Value must be positive"),
  body("startDate").isISO8601().toDate(),
  body("endDate").isISO8601().toDate(),
];

const updateOfferValidator = [
  body("code").optional().trim().notEmpty().withMessage("Offer code cannot be empty"),
  body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
  body("type").optional().isIn(Object.values(OFFER_TYPES)).withMessage("Invalid offer type"),
  body("value").optional().isFloat({ min: 0 }).withMessage("Value must be positive"),
  body("description").optional().trim().isLength({ max: 500 }),
  body("banner").optional().isObject(),
  body("startDate").optional().isISO8601().toDate(),
  body("endDate").optional().isISO8601().toDate(),
  body("usageLimit").optional().isInt({ min: 0 }),
  body("perUserLimit").optional().isInt({ min: 0 }),
  body("isActive").optional().isBoolean(),
];

// Public routes
router.get("/active", cacheMiddleware((req) => queryCacheKey("offers:active", req.query), 300), offerController.getActiveOffers);
router.post("/validate", offerController.validateOffer);

// Admin routes
router.use(protect, adminOnly);
router.get("/admin/all", offerController.getAllOffers);
router.post("/", createOfferValidator, validate, offerController.createOffer);
router.put("/:id", updateOfferValidator, validate, offerController.updateOffer);
router.post("/:id/banner", uploadLimiter, uploadOfferBanner.single("banner"), offerController.uploadOfferBanner);
router.delete("/:id/banner", offerController.removeOfferBanner);

module.exports = router;
