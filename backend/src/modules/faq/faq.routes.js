const express = require("express");
const router = express.Router();
const faqController = require("./faq.controller");
const { protect } = require("../../middlewares/auth.middleware");
const { adminOnly } = require("../../middlewares/admin.middleware");
const validate = require("../../middlewares/validate");
const { cacheMiddleware, queryCacheKey } = require("../../middlewares/cache");
const { CACHE_TTL } = require("../../config/constants");
const { createFaqValidator, updateFaqValidator, faqsQueryValidator } = require("./faq.validator");

// Public routes
router.get(
  "/",
  faqsQueryValidator,
  validate,
  cacheMiddleware((req) => queryCacheKey("faqs:list", req.query), CACHE_TTL.ROOM_LIST),
  faqController.getFaqs
);
router.get(
  "/all",
  cacheMiddleware((req) => queryCacheKey("faqs:public", req.query), CACHE_TTL.FEATURED_HOTELS),
  faqController.getPublicFaqs
);
router.get("/:id", cacheMiddleware((req) => `faq:${req.params.id}`, CACHE_TTL.ROOM_LIST), faqController.getFaqById);

// Admin routes
router.use(protect, adminOnly);
router.post("/", createFaqValidator, validate, faqController.createFaq);
router.put("/:id", updateFaqValidator, validate, faqController.updateFaq);
router.delete("/:id", faqController.deleteFaq);

module.exports = router;