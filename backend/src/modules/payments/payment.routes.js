const express = require("express");
const router = express.Router();
const paymentController = require("./payment.controller");
const { protect } = require("../../middlewares/auth.middleware");
const { adminOnly } = require("../../middlewares/admin.middleware");
const validate = require("../../middlewares/validate");
const {
  createOrderValidator,
  verifyPaymentValidator,
  refundValidator,
} = require("./payment.validator");
const { paymentLimiter, webhookLimiter } = require("../../middlewares/rateLimiter");

// Webhook endpoint - receives the RAW body (see app.js raw parser) so the
// Razorpay HMAC signature can be verified over the exact transmitted bytes.
router.post("/webhook", webhookLimiter, paymentController.handleWebhook);

// User routes (Protected)
router.use(protect);
router.post("/create-order", createOrderValidator, validate, paymentLimiter, paymentController.createOrder);
router.post("/verify", verifyPaymentValidator, validate, paymentLimiter, paymentController.verifyPayment);
router.get("/:id", paymentController.getPaymentDetails);

// Admin routes
router.post("/:id/refund", refundValidator, validate, adminOnly, paymentController.initiateRefund);

module.exports = router;
