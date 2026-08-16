/**
 * Integration tests for the AureliaStay AI Concierge endpoint.
 *
 * Focus: intent routing against real seeded data (hotels / rooms / offers),
 * structured response shapes, validation, and graceful fallback when no
 * OpenRouter key is configured.
 */
/* eslint-disable no-console */
const { bootApp, resetDB, closeDB, agent } = require("../helpers/app");
const {
  createHotel: rawHotel,
  createRoom,
  createOffer,
  createAmenity,
  uniq,
} = require("../helpers/factories");
const { getRedisClient } = require("../../src/config/redis");

const seedHotel = (o = {}) => rawHotel({ ...o, slug: o.slug || `h_${uniq("slug")}` });

async function flushCache() {
  try {
    await getRedisClient().flushdb();
  } catch (err) {
    /* non-fatal */
  }
}

describe("AI Concierge (/api/v1/ai/chat)", () => {
  beforeAll(async () => {
    await bootApp({ dbName: "lux_ai_agent" });
    // Never hit the real OpenRouter API in tests.
    delete process.env.OPENROUTER_API_KEY;
  });

  beforeEach(async () => {
    await resetDB();
    await flushCache();
  });

  afterAll(closeDB);

  async function seedData() {
    const goa = await seedHotel({
      name: "Aurelia Palms Goa",
      category: "LUXURY",
      starRating: 5,
      avgRating: 4.8,
      totalReviews: 120,
      isFeatured: true,
      address: { street: "1 Baga Beach", city: "Goa", state: "Goa", country: "India", pincode: "403516" },
    });
    const mumbai = await seedHotel({
      name: "Aurelia Tower Mumbai",
      category: "BUSINESS",
      starRating: 4,
      avgRating: 4.2,
      totalReviews: 80,
      address: { street: "1 Marine Drive", city: "Mumbai", state: "Maharashtra", country: "India", pincode: "400001" },
    });

    const goaSuite = await createRoom(goa, {
      name: "Ocean Suite",
      type: "SUITE",
      basePricePerNight: 18000,
      maxOccupancy: { adults: 2, children: 1 },
      totalUnits: 4,
      amenities: ["WiFi", "Sea View"],
    });
    const goaVilla = await createRoom(goa, {
      name: "Beach Villa",
      type: "VILLA",
      basePricePerNight: 35000,
      maxOccupancy: { adults: 4, children: 2 },
      totalUnits: 2,
      amenities: ["Private Pool", "WiFi"],
    });
    const mumbaiKing = await createRoom(mumbai, {
      name: "Deluxe King Room",
      type: "DOUBLE",
      basePricePerNight: 9000,
      maxOccupancy: { adults: 2, children: 0 },
      totalUnits: 10,
      amenities: ["WiFi", "City View"],
    });

    const offer = await createOffer({
      code: "WELCOME10",
      title: "Welcome 10% off",
      type: "PERCENTAGE",
      value: 10,
      minBookingAmount: 5000,
    });

    return { goa, mumbai, goaSuite, goaVilla, mumbaiKing, offer };
  }

  test("returns 422 for a missing message", async () => {
    const res = await agent().post("/api/v1/ai/chat").send({});
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  test("returns 422 for an empty message", async () => {
    const res = await agent().post("/api/v1/ai/chat").send({ message: "   " });
    expect(res.status).toBe(422);
  });

  test("greets and suggests actions", async () => {
    const res = await agent().post("/api/v1/ai/chat").send({ message: "hello" });
    expect(res.status).toBe(200);
    expect(res.body.data.type).toBe("reply");
    expect(res.body.data.message).toMatch(/AureliaStay/i);
  });

  test("searches hotels by city and returns structured hotels", async () => {
    await seedData();
    const res = await agent().post("/api/v1/ai/chat").send({ message: "hotels in goa" });
    expect(res.status).toBe(200);
    const data = res.body.data;
    expect(data.type).toBe("hotels");
    expect(Array.isArray(data.hotels)).toBe(true);
    expect(data.hotels.length).toBeGreaterThan(0);
    expect(data.hotels[0].name).toMatch(/Goa/);
    expect(data.hotels[0]).toHaveProperty("priceLabel");
    expect(data.hotels[0]).toHaveProperty("image");
  });

  test("applies category + budget filters", async () => {
    await seedData();
    const res = await agent()
      .post("/api/v1/ai/chat")
      .send({ message: "luxury hotels in goa under 25000" });
    expect(res.status).toBe(200);
    const data = res.body.data;
    expect(data.type).toBe("hotels");
    expect(data.hotels.length).toBeGreaterThan(0);
    // Luxury Goa property starts at ₹18,000 (suite) → within budget.
    expect(data.hotels[0].category).toBe("LUXURY");
  });

  test("returns no-results message when nothing matches", async () => {
    await seedData();
    const res = await agent().post("/api/v1/ai/chat").send({ message: "hotels in tokyo" });
    expect(res.status).toBe(200);
    expect(res.body.data.type).toBe("reply");
    expect(res.body.data.message).toMatch(/couldn't find/i);
  });

  test("finds 5-star hotels with a pool (star class + real amenity)", async () => {
    const pool = await createAmenity({ name: "Pool", icon: "droplets", category: "HOTEL" });

    await seedHotel({
      name: "Aurelia Poolside Palace",
      category: "RESORT",
      starRating: 5,
      avgRating: 4.5,
      address: { street: "1 Calangute", city: "Goa", state: "Goa", country: "India", pincode: "403516" },
      amenities: [pool._id],
    });
    // A 5-star hotel WITHOUT the pool amenity must NOT match.
    await seedHotel({
      name: "Aurelia Terrace Mumbai",
      category: "LUXURY",
      starRating: 5,
      avgRating: 4.8,
      address: { street: "2 Marine Drive", city: "Mumbai", state: "Maharashtra", country: "India", pincode: "400001" },
    });

    const res = await agent().post("/api/v1/ai/chat").send({ message: "5 star hotels with a pool" });
    expect(res.status).toBe(200);
    const data = res.body.data;
    expect(data.type).toBe("hotels");
    expect(data.hotels.length).toBeGreaterThan(0);
    const names = data.hotels.map((h) => h.name);
    expect(names).toContain("Aurelia Poolside Palace");
    expect(names).not.toContain("Aurelia Terrace Mumbai");
  });

  test("returns premium Goa stays even when not tagged LUXURY (category relax)", async () => {
    await seedHotel({
      name: "Aurelia Ocean Pearl Goa",
      category: "RESORT",
      starRating: 5,
      avgRating: 4.5,
      address: { street: "1 Baga", city: "Goa", state: "Goa", country: "India", pincode: "403516" },
    });

    const res = await agent().post("/api/v1/ai/chat").send({ message: "luxury hotels in goa" });
    expect(res.status).toBe(200);
    const data = res.body.data;
    expect(data.type).toBe("hotels");
    expect(data.hotels.length).toBeGreaterThan(0);
    expect(data.hotels[0].name).toMatch(/Goa/);
  });

  test("keeps an exact category filter when matches exist", async () => {
    await seedHotel({
      name: "Aurelia Goa Luxe",
      category: "LUXURY",
      starRating: 5,
      avgRating: 4.8,
      address: { street: "1 Baga", city: "Goa", state: "Goa", country: "India", pincode: "403516" },
    });
    await seedHotel({
      name: "Aurelia Mumbai Business",
      category: "BUSINESS",
      starRating: 4,
      avgRating: 4.1,
      address: { street: "1 Marine Drive", city: "Mumbai", state: "Maharashtra", country: "India", pincode: "400001" },
    });

    const res = await agent().post("/api/v1/ai/chat").send({ message: "luxury hotels in goa" });
    expect(res.status).toBe(200);
    const data = res.body.data;
    expect(data.type).toBe("hotels");
    expect(data.hotels.length).toBe(1);
    expect(data.hotels[0].category).toBe("LUXURY");
    expect(data.hotels[0].name).toMatch(/Goa Luxe/);
    expect(data.message).not.toMatch(/couldn't find/);
  });

  test("recommends featured / top-rated stays", async () => {
    await seedData();
    const res = await agent().post("/api/v1/ai/chat").send({ message: "recommend the best hotels" });
    expect(res.status).toBe(200);
    const data = res.body.data;
    expect(data.type).toBe("hotels");
    expect(data.hotels.length).toBeGreaterThan(0);
  });

  test("lists rooms for a named hotel", async () => {
    await seedData();
    const res = await agent().post("/api/v1/ai/chat").send({ message: "show me rooms at Aurelia Palms Goa" });
    expect(res.status).toBe(200);
    const data = res.body.data;
    expect(data.type).toBe("rooms");
    expect(data.rooms.length).toBe(2);
    expect(data.rooms.map((r) => r.name)).toEqual(expect.arrayContaining(["Ocean Suite", "Beach Villa"]));
  });

  test("returns pricing estimate for a room", async () => {
    await seedData();
    const res = await agent().post("/api/v1/ai/chat").send({ message: "how much is the Ocean Suite per night" });
    expect(res.status).toBe(200);
    const data = res.body.data;
    expect(data.type).toBe("rooms");
    expect(data.rooms[0].name).toMatch(/Ocean Suite/);
    expect(data.rooms[0].estimate).toHaveProperty("totalAmount");
    expect(data.rooms[0].pricePerNight).toBe(18000);
  });

  test("returns active offers", async () => {
    await seedData();
    const res = await agent().post("/api/v1/ai/chat").send({ message: "what offers do you have" });
    expect(res.status).toBe(200);
    const data = res.body.data;
    expect(data.type).toBe("offers");
    expect(data.offers.length).toBeGreaterThan(0);
    expect(data.offers[0].code).toBe("WELCOME10");
  });

  test("returns hotel policies for a named hotel", async () => {
    await seedData();
    const res = await agent().post("/api/v1/ai/chat").send({ message: "cancellation policy at Aurelia Palms Goa" });
    expect(res.status).toBe(200);
    const data = res.body.data;
    expect(data.type).toBe("hotel");
    expect(data.hotel.name).toMatch(/Aurelia Palms Goa/);
    expect(data.reply).toMatch(/Check-in/);
    expect(data.reply).toMatch(/Cancellation/);
  });

  test("falls back gracefully without an OpenRouter key", async () => {
    const res = await agent().post("/api/v1/ai/chat").send({ message: "tell me a joke" });
    expect(res.status).toBe(200);
    const data = res.body.data;
    expect(data.type).toBe("reply");
    expect(typeof data.message).toBe("string");
  });
});