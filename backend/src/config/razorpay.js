const Razorpay = require("razorpay");
const logger = require("./logger");

let razorpayInstance = null;

const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    logger.info("💳 Razorpay initialized successfully.");
  }
  return razorpayInstance;
};

module.exports = { getRazorpayInstance };
