/**
 * Integration tests for the rooms endpoints that the generic CRUD suite leaves
 * largely untested: the featured-room card shape, hotel-scoped filters, the
 * availability/blocked-dates helpers and their validation (400) branches, and
 * the inactive-room 404.
 */
/* eslint-disable no-console */
const { bootApp, resetDB, closeDB, agent } = require("../helpers/app");
const {
  createAdmin,
  createHotel: rawHotel,
  createRoom: seedRoom,
  createBooking,
  authHeaders,
  uniq,
  objectId,
} = require("../helpers/factories");
const { BOOKING_STATUS } = require("../../src/config/constants");
const { getRedisClient } = require("../../src/config/redis");

const seedHotel = (o = {}) => rawHotel({ ...o, slug: o.slug || `h_${uniq("slug")}` });
const isoDate = (offsetDays) => new Date(Date.now() + offsetDays * 86400000).toISOString();

async function flushCache() {
  try {
    await getRedisClient().flushdb();
  } catch (err) {
    /* non-fatal for these tests */
  }
}

describe("Rooms — featured / hotel filters / availability / blocked-dates", () => {
  let adminHead;
  const hotelCache = {};

  beforeAll(async () => {
    await bootApp({ dbName: "lux_rooms_featured" });
  });

  beforeEach(async () => {
    await resetDB();
    await flushCache();
    const admin = await createAdmin();
    adminHead = authHeaders(admin);
  });

  afterAll(closeDB);

  // ─── Featured ────────────────────────────────────────────────────────────
  describe("GET /rooms/featured", () => {
    test("returns an empty array when no room is featured", async () => {
      const res = await agent().get("/api/v1/rooms/featured");
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.pagination.total).toBe(0);
    });

    test("returns featured rooms in the card shape (price/rating/hotel/guests)", async () => {
      const hotel = await rawHotel({
        name: uniq("FeatHotel"),
        slug: `fh_${uniq("slug")}`,
        avgRating: 4.7,
      });
      await seedRoom(hotel, {
        name: uniq("FeatRoom"),
        isFeatured: true,
        basePricePerNight: 24999,
        maxOccupancy: { adults: 3, children: 1 },
        images: [{ url: "https://cdn/x.jpg", publicId: "x" }],
      });
      // A non-featured room must not appear.
      await seedRoom(hotel, { name: uniq("Normal"), isFeatured: false });

      const res = await agent().get("/api/v1/rooms/featured");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);

      const card = res.body.data[0];
      expect(card.isFeatured).toBe(true);
      expect(card.hotel).toBe(hotel.name);
      expect(card.price).toMatch(/₹/);
      expect(card.rating).toBe(4.7);
      expect(card.guests).toBe(4); // 3 adults + 1 child
      expect(card.image.startsWith("https://")).toBe(true);
      expect(card.primaryImage).toHaveProperty("url");
      expect(card.hotelId).toBeTruthy();
      expect(card.size).toContain("400");
    });
  });

  // ─── Hotel-scoped room filters ──────────────────────────────────────────
  describe("GET /rooms/hotel/:hotelId with filters", () => {
    test("combines type + minPrice + maxPrice + adults filters", async () => {
      const hotel = await seedHotel({ name: "FHotel" });
      await seedRoom(hotel, {
        name: uniq("King"),
        type: "DOUBLE",
        basePricePerNight: 8000,
        maxOccupancy: { adults: 2, children: 1 },
      });
      await seedRoom(hotel, {
        name: uniq("Suite"),
        type: "SUITE",
        basePricePerNight: 25000,
        maxOccupancy: { adults: 3, children: 2 },
      });

      const path = `/api/v1/rooms/hotel/${hotel._id}`;
      // minPrice only → L37 branch.
      const min = await agent().get(`${path}?minPrice=20000`);
      expect(min.status).toBe(200);
      expect(min.body.data).toHaveLength(1);
      expect(min.body.data[0].type).toBe("SUITE");

      // minPrice + maxPrice combined → L38-39 branch.
      const range = await agent().get(`${path}?minPrice=5000&maxPrice=15000`);
      expect(range.status).toBe(200);
      expect(range.body.data).toHaveLength(1);
      expect(range.body.data[0].name).toMatch(/King/);

      // type filter → L36 branch.
      const typeOnly = await agent().get(`${path}?type=SUITE`);
      expect(typeOnly.status).toBe(200);
      expect(typeOnly.body.data).toHaveLength(1);

      // adults filter → L41 branch.
      const adults = await agent().get(`${path}?adults=3`);
      expect(adults.status).toBe(200);
      expect(adults.body.data).toHaveLength(1);
      expect(adults.body.data[0].maxOccupancy.adults).toBe(3);

      // adults too high → none.
      const none = await agent().get(`${path}?adults=9`);
      expect(none.status).toBe(200);
      expect(none.body.data).toEqual([]);
    });
  });

  // ─── Single room + soft-delete 404 ──────────────────────────────────────
  describe("GET /rooms/:id", () => {
    test("returns 404 after the room is soft-deleted (inactive)", async () => {
      const hotel = await rawHotel({ name: "SdHotel", slug: `sd_${uniq("slug")}` });
      const room = await seedRoom(hotel, { name: "AboutToVanish" });

      const del = await agent()
        .delete(`/api/v1/rooms/${room._id}`)
        .set(adminHead);
      expect(del.status).toBe(200);

      const res = await agent().get(`/api/v1/rooms/${room._id}`);
      expect(res.status).toBe(404);
    });

    test("returns 404 for a missing room id", async () => {
      const res = await agent().get(`/api/v1/rooms/${objectId()}`);
      expect(res.status).toBe(404);
    });
  });

  // ─── Availability helper branches ───────────────────────────────────────
  describe("GET /rooms/:id/availability", () => {
    test("returns 400 when the dates are missing entirely", async () => {
      const hotel = await seedHotel({ name: "AvRail" });
      const room = await seedRoom(hotel, { name: "NoDates" });
      const res = await agent().get(`/api/v1/rooms/${room._id}/availability`);
      expect(res.status).toBe(400);
    });

    test("returns 404 when the room does not exist", async () => {
      const res = await agent().get(
        `/api/v1/rooms/${objectId()}/availability?checkIn=${isoDate(1)}&checkOut=${isoDate(3)}`
      );
      expect(res.status).toBe(404);
    });

    test("returns isAvailable=false once all units are booked", async () => {
      const admin = await createAdmin();
      const hotel = await seedHotel({ name: "Full" });
      // totalUnits=1 so one booking fills it.
      const room = await seedRoom(hotel, { name: "Pack", totalUnits: 1 });
      await createBooking({
        user: admin._id,
        hotel: hotel._id,
        room: room._id,
        status: BOOKING_STATUS.CONFIRMED,
        checkIn: isoDate(2),
        checkOut: isoDate(4),
        nights: 2,
      });

      const res = await agent().get(
        `/api/v1/rooms/${room._id}/availability?checkIn=${isoDate(2)}&checkOut=${isoDate(4)}`
      );
      expect(res.status).toBe(200);
      expect(res.body.data.isAvailable).toBe(false);
      expect(res.body.data.availableUnits).toBe(0);
    });
  });

  // ─── Blocked-dates validation branches ──────────────────────────────────
  describe("GET /rooms/:id/blocked-dates", () => {
    test("returns 400 when dates are missing", async () => {
      const hotel = await seedHotel({ name: "BdRail" });
      const room = await seedRoom(hotel, { name: "NoDates" });
      const res = await agent().get(`/api/v1/rooms/${room._id}/blocked-dates`);
      expect(res.status).toBe(400);
    });

    test("returns 400 when endDate is not after startDate", async () => {
      const hotel = await seedHotel({ name: "BdEg" });
      const room = await seedRoom(hotel, { name: "Reversed" });
      // Use one shared timestamp so start === end exactly (two Date.now() calls
      // would differ by a millisecond and flip this back to a valid range).
      const same = new Date(Date.now() + 5 * 86400000).toISOString();
      const res = await agent().get(
        `/api/v1/rooms/${room._id}/blocked-dates?startDate=${same}&endDate=${same}`
      );
      expect(res.status).toBe(400);
    });

    test("returns 400 when the range exceeds 120 days", async () => {
      const hotel = await seedHotel({ name: "BdLong" });
      const room = await seedRoom(hotel, { name: "TooLong" });
      const res = await agent().get(
        `/api/v1/rooms/${room._id}/blocked-dates?startDate=${isoDate(0)}&endDate=${isoDate(200)}`
      );
      expect(res.status).toBe(400);
    });

    test("returns an empty blocked list when the room is free", async () => {
      const hotel = await seedHotel({ name: "BdFree" });
      const room = await seedRoom(hotel, { name: "WideOpen", totalUnits: 5 });
      const res = await agent().get(
        `/api/v1/rooms/${room._id}/blocked-dates?startDate=${isoDate(1)}&endDate=${isoDate(5)}`
      );
      expect(res.status).toBe(200);
      expect(res.body.data.blockedDates).toEqual([]);
    });
  });
});