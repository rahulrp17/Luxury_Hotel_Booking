const { body, param } = require("express-validator");

const createOrderValidator = [
  body("bookingId").isMongoId().withMessage("A valid booking ID is required."),
];

const verifyPaymentValidator = [
  body("razorpay_order_id").trim().notEmpty().withMessage("Order ID is required."),
  body("razorpay_payment_id").trim().notEmpty().withMessage("Payment ID is required."),
  body("razorpay_signature").trim().notEmpty().withMessage("Signature is required."),
];

const refundValidator = [
  param("id").isMongoId().withMessage("A valid payment ID is required."),
  body("amount").optional().isFloat({ min: 0 }).toFloat().withMessage("Amount must be positive."),
  body("reason").optional().trim().isLength({ max: 200 }).withMessage("Reason is too long."),
];

module.exports = { createOrderValidator, verifyPaymentValidator, refundValidator };