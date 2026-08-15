const { OFFER_TYPES } = require("../config/constants");
const { formatMoney } = require("./money");

/**
 * Build a short, human-readable discount summary for an offer, e.g.
 * "20% off (up to ₹1,000)", "₹500 off" or "Free night".
 */
const formatOfferDiscount = (offer, currency = "INR") => {
  const value = Number(offer?.value) || 0;
  switch (offer?.type) {
    case OFFER_TYPES.PERCENTAGE:
      return offer.maxDiscountAmount
        ? `${value}% off (up to ${formatMoney(offer.maxDiscountAmount, currency)})`
        : `${value}% off`;
    case OFFER_TYPES.FREE_NIGHT:
      return "Free night";
    case OFFER_TYPES.FLAT:
    default:
      return `${formatMoney(value, currency)} off`;
  }
};

module.exports = { formatOfferDiscount };