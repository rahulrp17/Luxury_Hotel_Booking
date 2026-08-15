/**
 * Unit tests for the pricing engine (no database required).
 */
const pricingService = require("../../src/services/pricing.service");
const { getDateRange, isWeekend } = require("../../src/utils/dateHelpers");

const makeRoom = (overrides = {}) => ({
  basePricePerNight: 1000,
  weekendPremium: 0,
  seasonalPricing: [],
  ...overrides,
});

// Expected base given the same weekend logic the service uses (zone-safe:
// the test and the implementation run in the same process/timezone).
const expectedBase = (room, checkIn, checkOut) => {
  const dates = getDateRange(checkIn, checkOut);
  return dates.reduce((sum, d) => {
    const price = room.basePricePerNight;
    const p =
      isWeekend(d) && room.weekendPremium > 0 ? (price * (1 + room.weekendPremium / 100)) : price;
    return sum + Math.round(p);
  }, 0);
};

describe("PricingService.calculateBookingPrice", () => {
  test("computes nights and base amount", () => {
    const p = pricingService.calculateBookingPrice(makeRoom(), "2026-08-10", "2026-08-13");
    expect(p.nights).toBe(3);
    expect(p.baseAmount).toBe(expectedBase(makeRoom(), "2026-08-10", "2026-08-13"));
  });

  test("applies weekend premium only on weekend nights", () => {
    const room = makeRoom({ weekendPremium: 25 });
    const checkIn = "2026-08-12";
    const checkOut = "2026-08-16";
    const p = pricingService.calculateBookingPrice(room, checkIn, checkOut);
    expect(p.baseAmount).toBe(expectedBase(room, checkIn, checkOut));
  });

  test("applies seasonal multiplier within the date window", () => {
    const room = makeRoom({
      seasonalPricing: [
        { name: "Summer", startDate: "2026-08-01", endDate: "2026-08-20", multiplier: 1.5 },
      ],
    });
    const p = pricingService.calculateBookingPrice(room, "2026-08-10", "2026-08-12");
    // Both nights within the seasonal window -> 1000 * 1.5 each, rounded
    expect(p.baseAmount).toBe(3000);
  });

  test("taxes the after-discount subtotal at 18%", () => {
    const p = pricingService.calculateBookingPrice(makeRoom(), "2026-08-10", "2026-08-12");
    const subtotal = p.baseAmount + p.addonAmount - p.discountAmount;
    expect(p.taxAmount).toBe(Math.round(subtotal * 0.18));
    expect(p.totalAmount).toBe(subtotal + p.taxAmount);
  });

  test("discount cannot exceed the subtotal", () => {
    const p = pricingService.calculateBookingPrice(makeRoom(), "2026-08-10", "2026-08-11", [], 99999);
    expect(p.discountAmount).toBeLessThanOrEqual(p.baseAmount + p.addonAmount);
    expect(p.totalAmount).toBeGreaterThanOrEqual(0);
  });

  test("rejects an invalid (reversed) date range", () => {
    expect(() => pricingService.calculateBookingPrice(makeRoom(), "2026-08-20", "2026-08-10")).toThrow();
  });
});

describe("PricingService.calculateOfferDiscount", () => {
  test("PERCENTAGE discount is capped by maxDiscountAmount", () => {
    const offer = { isValid: true, minBookingAmount: 0, type: "PERCENTAGE", value: 30, maxDiscountAmount: 250 };
    expect(pricingService.calculateOfferDiscount(offer, 1000)).toBe(250); // 300 capped to 250
  });

  test("FLAT discount applies its value", () => {
    const offer = { isValid: true, minBookingAmount: 0, type: "FLAT", value: 150 };
    expect(pricingService.calculateOfferDiscount(offer, 1000)).toBe(150);
  });

  test("FREE_NIGHT applies offer.value as given", () => {
    const offer = { isValid: true, minBookingAmount: 0, type: "FREE_NIGHT", value: 1000 };
    expect(pricingService.calculateOfferDiscount(offer, 3000)).toBe(1000);
  });

  test("returns 0 when minBookingAmount not met", () => {
    const offer = { isValid: true, minBookingAmount: 2000, type: "FLAT", value: 150 };
    expect(pricingService.calculateOfferDiscount(offer, 1000)).toBe(0);
  });

  test("returns 0 for an invalid offer", () => {
    expect(pricingService.calculateOfferDiscount({ isValid: false }, 1000)).toBe(0);
  });
});