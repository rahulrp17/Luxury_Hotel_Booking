const { TAX_RATE } = require("../config/constants");
const { getDateRange, isWeekend } = require("../utils/dateHelpers");
const ApiError = require("../utils/ApiError");

/**
 * Pricing Engine Service
 * All pricing calculations run server-side only
 */
class PricingService {
  /**
   * Calculate price for a specific date (applying seasonal and weekend premiums)
   */
  getPriceForDate(room, date) {
    let price = room.basePricePerNight;
    const d = new Date(date);

    // Apply seasonal pricing multiplier
    if (room.seasonalPricing && room.seasonalPricing.length > 0) {
      for (const season of room.seasonalPricing) {
        if (d >= new Date(season.startDate) && d <= new Date(season.endDate)) {
          price *= season.multiplier;
          break;
        }
      }
    }

    // Apply weekend premium
    if (isWeekend(date) && room.weekendPremium > 0) {
      price *= 1 + room.weekendPremium / 100;
    }

    return Math.round(price);
  }

  /**
   * Calculate complete booking pricing breakdown
   */
  calculateBookingPrice(room, checkIn, checkOut, addons = [], offerDiscount = 0) {
    const dates = getDateRange(checkIn, checkOut);
    const nights = dates.length;

    if (nights < 1) {
      // Client error (reversed/invalid dates), not a server failure.
      throw ApiError.badRequest("Invalid date range: check-out must be after check-in.");
    }

    // Base amount: sum of daily prices
    const baseAmount = dates.reduce((total, date) => {
      return total + this.getPriceForDate(room, date);
    }, 0);

    // Addon amount
    const addonAmount = addons.reduce((total, addon) => {
      return total + (addon.price * (addon.quantity || 1));
    }, 0);

    const subtotal = baseAmount + addonAmount;

    // Apply discount
    const discountAmount = Math.min(offerDiscount, subtotal); // Can't discount more than subtotal
    const afterDiscount = subtotal - discountAmount;

    // Tax calculation
    const taxAmount = Math.round(afterDiscount * TAX_RATE);
    const totalAmount = afterDiscount + taxAmount;

    return {
      nights,
      baseAmount: Math.round(baseAmount),
      addonAmount: Math.round(addonAmount),
      discountAmount: Math.round(discountAmount),
      taxAmount,
      totalAmount: Math.round(totalAmount),
      currency: "INR",
      breakdown: dates.map((date) => ({
        date: date.toISOString().split("T")[0],
        price: this.getPriceForDate(room, date),
        isWeekend: isWeekend(date),
      })),
    };
  }

  /**
   * Calculate offer discount amount
   */
  calculateOfferDiscount(offer, baseAmount) {
    if (!offer || !offer.isValid) return 0;

    if (baseAmount < offer.minBookingAmount) return 0;

    let discount = 0;

    switch (offer.type) {
      case "PERCENTAGE":
        discount = (baseAmount * offer.value) / 100;
        if (offer.maxDiscountAmount) {
          discount = Math.min(discount, offer.maxDiscountAmount);
        }
        break;

      case "FLAT":
        discount = offer.value;
        break;

      case "FREE_NIGHT":
        // Free night = base price per night
        discount = offer.value; // Set to basePricePerNight by calling code
        break;
    }

    return Math.round(discount);
  }
}

module.exports = new PricingService();
