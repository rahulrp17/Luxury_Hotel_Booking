const express = require("express");
const router = express.Router();
const statisticsController = require("./statistics.controller");
const { cacheMiddleware } = require("../../middlewares/cache");

router.get(
  "/home",
  cacheMiddleware("statistics:home", 300),
  statisticsController.getHomeStats
);

module.exports = router;