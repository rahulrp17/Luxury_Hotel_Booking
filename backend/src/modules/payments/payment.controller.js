const paymentService = require("./payment.service");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/ApiError");
const { USER_ROLES } = require("../../config/constants");
const { invalidateAnalyticsCache } = require("../analytics/analytics.cache");

const createOrder = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;
  if (!bookingId) throw ApiError.badRequest("Booking ID is required.");
  
  const orderData = await paymentService.createOrder(req.user._id, bookingId);
  return ApiResponse.success(res, "Payment order created.", orderData);
});

const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw ApiError.badRequest("Incomplete payment details.");
  }
  
  const result = await paymentService.verifyPayment(req.user._id, {
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
  });
  
  return ApiResponse.success(res, "Payment verified successfully.", result);
});

const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  if (!signature) throw ApiError.badRequest("Missing signature header.");
  
  await paymentService.handleWebhook(req.body, signature);
  return res.status(200).send("OK"); // Webhooks expect plain 200 OK
});

const initiateRefund = asyncHandler(async (req, res) => {
  const { amount, reason } = req.body;
  const payment = await paymentService.initiateRefund(req.params.id, amount, reason);
  // Revenue KPI changed (refund now PROCESSED) — drop the cached analytics.
  await invalidateAnalyticsCache();
  return ApiResponse.success(res, "Refund initiated.", payment);
});

const getPaymentDetails = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === USER_ROLES.ADMIN;
  const payment = await paymentService.getPaymentDetails(req.params.id, req.user._id, isAdmin);
  return ApiResponse.success(res, "Payment details fetched.", payment);
});

module.exports = {
  createOrder,
  verifyPayment,
  handleWebhook,
  initiateRefund,
  getPaymentDetails,
};
