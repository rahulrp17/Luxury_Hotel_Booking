const express = require("express");
const router = express.Router();
const analyticsController = require("./analytics.controller");
const { protect } = require("../../middlewares/auth.middleware");
const { adminOnly } = require("../../middlewares/admin.middleware");
const { cacheMiddleware } = require("../../middlewares/cache");

// All routes are admin-only
router.use(protect, adminOnly);

// Apply a short cache (5 min) to prevent hammering the DB with aggregations
router.get("/overview", cacheMiddleware("analytics:overview", 300), analyticsController.getOverview);
router.get("/revenue", cacheMiddleware("analytics:revenue", 300), analyticsController.getRevenueChartData);
router.get("/occupancy", cacheMiddleware("analytics:occupancy", 300), analyticsController.getOccupancyData);
router.get("/top-hotels", cacheMiddleware("analytics:tophotels", 300), analyticsController.getTopHotels);
router.get("/booking-summary", cacheMiddleware("analytics:bookingsummary", 300), analyticsController.getBookingSummary);

module.exports = router;
