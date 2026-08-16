/**
 * Unit tests for the AureliaStay AI natural-language intent parser.
 */
const {
  parseIntent,
  extractDestination,
  extractMaxPrice,
  extractMinPrice,
  extractRange,
  extractAmenities,
  extractCategory,
  extractRoomType,
  extractHotelName,
} = require("../../src/modules/ai/ai.intent");

describe("AI intent parser", () => {
  describe("parseIntent → intent classification", () => {
    test("classifies a city search", () => {
      const r = parseIntent("luxury hotels in goa");
      expect(r.intent).toBe("SEARCH_HOTELS");
      expect(r.filters.destination).toBe("goa");
      expect(r.filters.category).toBe("LUXURY");
    });

    test("classifies a recommendation request", () => {
      expect(parseIntent("recommend the best hotels in mumbai").intent).toBe("RECOMMEND");
      expect(parseIntent("suggest top rated resorts").intent).toBe("RECOMMEND");
    });

    test("classifies offers", () => {
      const r = parseIntent("what offers and discounts are available");
      expect(r.intent).toBe("OFFERS");
    });

    test("classifies policies", () => {
      expect(parseIntent("what is the cancellation policy").intent).toBe("POLICIES");
      expect(parseIntent("check-in time").intent).toBe("POLICIES");
    });

    test("classifies amenities", () => {
      const r = parseIntent("does the grand palace have a pool and spa");
      expect(r.intent).toBe("AMENITIES");
      expect(r.filters.amenities).toEqual(expect.arrayContaining(["pool", "spa"]));
    });

    test("classifies pricing questions", () => {
      expect(parseIntent("how much is a suite per night").intent).toBe("PRICING");
      expect(parseIntent("price of rooms").intent).toBe("PRICING");
    });

    test("classifies room queries", () => {
      const r = parseIntent("show me the suites at the grand palace");
      expect(r.intent).toBe("HOTEL_ROOMS");
      expect(r.roomType).toBe("SUITE");
    });

    test("classifies booking help", () => {
      expect(parseIntent("how to book a hotel").intent).toBe("BOOKING_HELP");
    });

    test("classifies greetings", () => {
      expect(parseIntent("hello").intent).toBe("GREETING");
    });

    test("falls back to GENERAL for unknown content", () => {
      expect(parseIntent("tell me about space").intent).toBe("GENERAL");
    });
  });

  describe("filter extraction", () => {
    test("extracts destination with 'in'", () => {
      expect(extractDestination("hotels in new delhi")).toBe("new delhi");
      expect(extractDestination("places to stay in udaipur")).toBe("udaipur");
    });

    test("extracts dates", () => {
      const r = parseIntent("hotels in mumbai from 2026-09-01 to 2026-09-05 for 2 adults");
      expect(r.filters.checkIn).toBe("2026-09-01");
      expect(r.filters.checkOut).toBe("2026-09-05");
      expect(r.filters.guests).toEqual({ adults: 2, children: 0 });
    });

    test("extracts slash dates", () => {
      const r = parseIntent("check in 10/12/2026 check out 14/12/2026");
      expect(r.filters.checkIn).toBe("2026-12-10");
      expect(r.filters.checkOut).toBe("2026-12-14");
    });

    test("extracts guests", () => {
      expect(parseIntent("a room for 3 adults and 1 child").filters.guests).toEqual({ adults: 3, children: 1 });
      expect(parseIntent("hotel for 4 guests").filters.guests).toEqual({ adults: 4, children: 0 });
    });

    test("extracts max price", () => {
      expect(extractMaxPrice("hotels under 15000")).toBe(15000);
      expect(extractMaxPrice("budget hotels")).toBe(5000);
      expect(extractMaxPrice("rooms less than ₹8,000")).toBe(8000);
    });

    test("extracts min price", () => {
      expect(extractMinPrice("hotels above 20000")).toBe(20000);
      expect(extractMinPrice("rooms from 10000")).toBe(10000);
    });

    test("extracts a between range", () => {
      const filters = {};
      extractRange("hotels between 5000 and 15000", filters);
      expect(filters.minPrice).toBe(5000);
      expect(filters.maxPrice).toBe(15000);
    });

    test("extracts min rating", () => {
      expect(parseIntent("5 star hotels in goa").filters.minRating).toBe(5);
      expect(parseIntent("top rated hotels").filters.minRating).toBe(4);
    });

    test("extracts category", () => {
      expect(extractCategory("heritage palace stay")).toBe("HERITAGE");
      expect(extractCategory("beach resort")).toBe("RESORT");
      expect(extractCategory("boutique hotel")).toBe("BOUTIQUE");
    });

    test("extracts amenities", () => {
      expect(extractAmenities("hotel with wifi and parking")).toEqual(["wifi", "parking"]);
    });

    test("extracts room type", () => {
      expect(extractRoomType("penthouse please")).toBe("PENTHOUSE");
      expect(extractRoomType("villa")).toBe("VILLA");
    });

    test("extracts hotel name from title case", () => {
      expect(extractHotelName("show suites at The Grand Palace")).toBe("The Grand Palace");
    });
  });
});