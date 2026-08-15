/**
 * Targeted suite for the advanced GET /hotels filters and the date-based
 * availability annotation that the basic CRUD suite does not exercise:
 *   - destination / city / country regex filters
 *   - category, starRating, minRating, amenities ($all), guests filters
 *   - the checkIn/checkOut bookings $lookup + rooms.bookedCount annotation
 */
/* eslint-disable no-console */
const { bootApp, resetDB, closeDB, agent } = require("../helpers/app");
const {
  createHotel: rawHotel,
  createRoom,
  createBooking,
  createAdmin,
  createAmenity,
  uniq,
} = require("../helpers/factories");
const { BOOKING_STATUS } = require("../../src/config/constants");
const { getRedisClient } = require("../../src/config/redis");

const seedHotel = (o = {}) => rawHotel({ ...o, slug: o.slug || `h_${uniq("slug")}` });
const seedAmenity = (o = {}) => createAmenity({ ...o, icon: o.icon || "wifi" });
const isoDate = (offsetDays) => new Date(Date.now() + offsetDays * 86400000).toISOString();

async function flushCache() {
  try {
    await getRedisClient().flushdb();
  } catch (err) {
    /* non-fatal */
  }
}

describe("Hotels — advanced filters & availability annotation", () => {
  beforeAll(async () => {
    await bootApp({ dbName: "lux_hotels_filters" });
  });

  beforeEach(async () => {
    await resetDB();
    await flushCache();
  });

  afterAll(closeDB);

  async function seedTwoHotels(amenityIds = []) {
    const mumbai = await seedHotel({
      name: uniq("MumbaiGrand"),
      category: "LUXURY",
      starRating: 5,
      avgRating: 4.8,
      amenities: amenityIds,
      address: { street: "1 Marine Drive", city: "Mumbai", state: "MH", country: "India", pincode: "400001" },
    });
    const delhi = await seedHotel({
      name: uniq("DelhiPalace"),
      category: "STANDARD",
      starRating: 4,
      avgRating: 4.2,
      amenities: amenityIds.length ? [amenityIds[0]] : [],
      address: { street: "1 CP", city: "New Delhi", state: "DL", country: "India", pincode: "110001" },
    });
    return { mumbai, delhi };
  }

  test("filters by destination (city substring, case-insensitive)", async () => {
    await seedTwoHotels();
    const res = await agent().get("/api/v1/hotels?destination=mumbai");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toMatch(/MumbaiGrand/);
  });

  test("filters by city + country", async () => {
    await seedTwoHotels();
    const res = await agent().get("/api/v1/hotels?city=new%20delhi&country=India");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toMatch(/DelhiPalace/);
  });

  test("filters by minRating and excludes hotels below it", async () => {
    await seedTwoHotels();
    const res = await agent().get("/api/v1/hotels?minRating=4.5");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].avgRating).toBeGreaterThanOrEqual(4.5);
  });

  test("filters by amenities requiring all of them", async () => {
    const pool = await seedAmenity({ name: uniq("PoolAm"), category: "HOTEL" });
    const spa = await seedAmenity({ name: uniq("SpaAm"), category: "WELLNESS" });
    const wifi = await seedAmenity({ name: uniq("WiFiAm"), category: "HOTEL" });
    // Mumbai has all three; Delhi only has the first one.
    await seedTwoHotels([pool._id, spa._id, wifi._id]);

    const res = await agent().get(`/api/v1/hotels?amenities=${pool._id},${spa._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toMatch(/MumbaiGrand/);
  });

  test("filters hotels by guest capacity via rooms lookup", async () => {
    const { mumbai, delhi } = await seedTwoHotels();
    await createRoom(mumbai, { name: uniq("Family"), maxOccupancy: { adults: 4, children: 2 } });
    await createRoom(delhi, { name: uniq("Double"), maxOccupancy: { adults: 2, children: 1 } });

    const res = await agent().get("/api/v1/hotels?guests=4");
    expect(res.status).toBe(200);

    // guests=4 includes the room with adults=4 for Mumbai, and no room for Delhi.
    const mumbaiRes = res.body.data.find((x) => x._id.toString() === mumbai._id.toString());
    const delhiRes = res.body.data.find((x) => x._id.toString() === delhi._id.toString());
    expect(mumbaiRes.availableRooms).toBe(1);
    expect(delhiRes.availableRooms).toBe(0);
  });

  test("annotates rooms.bookedCount / availableRooms when dates are supplied", async () => {
    const admin = await createAdmin();
    const hotel = await seedHotel({ name: uniq("BookedHotel"), category: "LUXURY" });
    const freeRoom = await createRoom(hotel, { name: uniq("Free"), totalUnits: 2, basePricePerNight: 3000 });
    const bookedRoom = await createRoom(hotel, { name: uniq("Taken"), totalUnits: 1, basePricePerNight: 9000 });

    // Book the only unit of `bookedRoom` for the queried dates.
    await createBooking({
      user: admin._id,
      hotel: hotel._id,
      room: bookedRoom._id,
      status: BOOKING_STATUS.CONFIRMED,
      checkIn: isoDate(2),
      checkOut: isoDate(4),
      nights: 2,
    });

    const res = await agent().get(
      `/api/v1/hotels?checkIn=${isoDate(2)}&checkOut=${isoDate(4)}`
    );
    expect(res.status).toBe(200);
    const h = res.body.data.find((x) => x._id.toString() === hotel._id.toString());
    expect(h).toBeDefined();

    // The fully-booked room drops out of the available set; the free one stays.
    expect(h.totalActiveRooms).toBe(2);
    expect(h.availableRooms).toBe(1);
    expect(h.startingPrice).toBe(3000); // only the free room's price
    expect(h.lowestAvailableRoom.basePricePerNight).toBe(3000);
  });

  test("without dates, all rooms are treated as available", async () => {
    const hotel = await seedHotel({ name: uniq("PlainHotel") });
    await createRoom(hotel, { name: uniq("Any"), totalUnits: 1 });

    const res = await agent().get("/api/v1/hotels");
    expect(res.status).toBe(200);
    const h = res.body.data.find((x) => x._id.toString() === hotel._id.toString());
    expect(h.availableRooms).toBe(1);
  });

  test("invalid checkIn date → 422", async () => {
    const res = await agent().get("/api/v1/hotels?checkIn=not-a-date");
    expect(res.status).toBe(422);
  });
});