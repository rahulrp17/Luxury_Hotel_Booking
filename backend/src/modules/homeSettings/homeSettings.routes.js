const express = require("express");
const router = express.Router();
const homeSettingsController = require("./homeSettings.controller");
const { protect } = require("../../middlewares/auth.middleware");
const { adminOnly } = require("../../middlewares/admin.middleware");
const validate = require("../../middlewares/validate");
const { cacheMiddleware } = require("../../middlewares/cache");
const { CACHE_TTL } = require("../../config/constants");
const { updateHomeSettings } = require("./homeSettings.validator");

// Public
router.get(
  "/",
  cacheMiddleware("homeSettings:singleton", CACHE_TTL.ROOM_LIST),
  homeSettingsController.getSettings
);

// Admin
router.use(protect, adminOnly);
router.put("/", updateHomeSettings, validate, homeSettingsController.updateSettings);
router.delete("/", homeSettingsController.resetSettings);

module.exports = router;