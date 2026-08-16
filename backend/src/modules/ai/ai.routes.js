const express = require("express");
const router = express.Router();
const aiController = require("./ai.controller");
const { chatValidator } = require("./ai.validator");
const validate = require("../../middlewares/validate");
const { aiLimiter } = require("../../middlewares/rateLimiter");

// Public concierge chat endpoint. Rate-limited per IP so the OpenRouter budget
// and the database queries can't be abused by a single caller.
router.post("/chat", aiLimiter, chatValidator, validate, aiController.chat);

module.exports = router;