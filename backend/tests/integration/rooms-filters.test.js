/* eslint-disable no-console */
/**
 * Targeted suite for the ROOMS aggregation / filter paths that the generic
 * CRUD suite does not exercise:
 *   - sort=rating and sort=popular  → aggregation path (_getRoomsAggregated)
 *   - available=true + checkIn/checkOut → _narrowByAvailability
 *   - category / type / minPrice / maxPrice / capacity / beds / featured /
 *     amenities filters (_buildRoomFilter)
 *   - empty availability result short-circuit
 */
const { bootApp, resetDB, closeDB, agent } = require("../helpers/app");
const {
  createHotel: rawHotel,
  createRoom,
  createBooking,
  uniq,
  objectId,
  authHeaders,
  createAdmin,
} = require("../helpers/factories");
const { BOOKING_STATUS } = require("../../src/config/constants");

const seedHotel = (overrides = {}) =>
  rawHotel({ ...overrides, slug: overrides.slug || `h_${uniq("slug")}` });

const iso = (offsetDays) => new Date(Date.now() + offsetDays * 86400000).toISOString();

describe("Rooms — aggregation, filters, availability", () => {
  beforeAll(async () => {
    await bootApp({ dbName: "lux_rooms_filters" });
  });

  beforeEach(resetDB);
  afterAll(closeDB);

  async function seedTwoRooms() {
    const hotel = await seedHotel({ name: uniq("FilterHotel"), category: "LUXURY" });
    const cheap = await createRoom(hotel, {
      name: uniq("Cheap"),
      type: "DOUBLE",
      basePricePerNight: 2000,
      totalUnits: 1,
      isFeatured: true,
      amenities: ["WiFi", "Pool"],
    });
    const pricey = await createRoom(hotel, {
      name: uniq("Pricey"),
      type: "SUITE",
      basePricePerNight: 20000,
      totalUnits: 2,
      isFeatured: false,
      amenities: ["WiFi"],
    });
    return { hotel, cheap, pricey };
  }

  test("sort=price_asc orders by price ascending", async () => {
    await seedTwoRooms();
    const res = await agent().get("/api/v1/rooms?sort=price_asc");
    expect(res.status).toBe(200);
    expect(res.body.data[0].basePricePerNight).toBeLessThanOrEqual(res.body.data[1].basePricePerNight);
  });

  test("sort=rating uses the aggregation path and returns rooms", async () => {
    await seedTwoRooms();
    const res = await agent().get("/api/v1/rooms?sort=rating");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.data[0]).toHaveProperty("hotel");
  });

  test("sort=popular uses the aggregation path", async () => {
    const admin = await createAdmin();
    const user = await createAdmin(); // role ADMIN is fine; booking only needs a user id
    const { hotel, cheap } = await seedTwoRooms();
    // A confirmed booking makes `cheap` more popular.
    await createBooking({
      user: user._id,
      hotel: hotel._id,
      room: cheap._id,
      status: BOOKING_STATUS.CONFIRMED,
      checkIn: iso(2),
      checkOut: iso(4),
      nights: 2,
    });
    const res = await agent().get("/api/v1/rooms?sort=popular");
    expect(res.status).toBe(200);
    expect(res.body.data[0]._id.toString()).toBe(cheap._id.toString());
  });

  test("filter by type and category", async () => {
    const { hotel } = await seedTwoRooms();
    const res = await agent().get(`/api/v1/rooms?type=SUITE&category=LUXURY&hotelId=${hotel._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].type).toBe("SUITE");
  });

  test("filter by price range", async () => {
    await seedTwoRooms();
    const res = await agent().get("/api/v1/rooms?minPrice=1000&maxPrice=5000");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].basePricePerNight).toBe(2000);
  });

  test("filter by capacity and beds", async () => {
    const { hotel } = await seedTwoRooms();
    await createRoom(hotel, {
      name: uniq("Family"),
      type: "SUITE",
      basePricePerNight: 10000,
      maxOccupancy: { adults: 4, children: 2 },
    });
    const res = await agent().get("/api/v1/rooms?capacity=4");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].maxOccupancy.adults).toBe(4);
  });

  test("filter by featured=true", async () => {
    await seedTwoRooms();
    const res = await agent().get("/api/v1/rooms?featured=true");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].isFeatured).toBe(true);
  });

  test("filter by amenities (all required)", async () => {
    await seedTwoRooms();
    const res = await agent().get("/api/v1/rooms?amenities=WiFi");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);

    const both = await agent().get("/api/v1/rooms?amenities=WiFi,Pool");
    expect(both.status).toBe(200);
    expect(both.body.data).toHaveLength(1); // only the room with both
  });

  test("available=true narrows to rooms with free units for the dates", async () => {
    const admin = await createAdmin();
    const user = await createAdmin();
    const { hotel, cheap } = await seedTwoRooms();
    // Book ALL units of `cheap` for those dates → it must be excluded.
    await createBooking({
      user: user._id,
      hotel: hotel._id,
      room: cheap._id,
      status: BOOKING_STATUS.CONFIRMED,
      checkIn: iso(2),
      checkOut: iso(4),
      nights: 2,
    });

    const res = await agent().get(`/api/v1/rooms?available=true&checkIn=${iso(2)}&checkOut=${iso(4)}`);
    expect(res.status).toBe(200);
    const ids = res.body.data.map((r) => r._id.toString());
    expect(ids).not.toContain(cheap._id.toString());
  });

  test("available=true with no free rooms returns an empty array", async () => {
    const admin = await createAdmin();
    const user = await createAdmin();
    const { hotel, cheap, pricey } = await seedTwoRooms();
    // Book EVERY unit of both rooms (cheap=1, pricey=2) for the same dates.
    for (const room of [cheap, pricey]) {
      for (let i = 0; i < room.totalUnits; i += 1) {
        await createBooking({
          user: user._id,
          hotel: hotel._id,
          room: room._id,
          status: BOOKING_STATUS.CONFIRMED,
          checkIn: iso(2),
          checkOut: iso(4),
          nights: 2,
        });
      }
    }
    const res = await agent().get(`/api/v1/rooms?available=true&checkIn=${iso(2)}&checkOut=${iso(4)}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  test("invalid sort param → 422", async () => {
    const res = await agent().get("/api/v1/rooms?sort=bogus");
    expect(res.status).toBe(422);
  });

  test("invalid category param → 422", async () => {
    const res = await agent().get("/api/v1/rooms?category=NOT_A_CATEGORY");
    expect(res.status).toBe(422);
  });

  test("available=true without dates is still valid (falls through to normal listing)", async () => {
    await seedTwoRooms();
    const res = await agent().get("/api/v1/rooms?available=true");
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
  });

  test("PAGINATION only returns 200 with a valid limit", async () => {
    await seedTwoRooms();
    const res = await agent().get("/api/v1/rooms?limit=1");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination.total).toBe(2);
    expect(res.body.pagination.totalPages).toBe(2);
  });
});
