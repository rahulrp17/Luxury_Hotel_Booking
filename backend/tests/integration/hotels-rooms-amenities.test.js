/**
 * Integration tests for the Hotels, Rooms and Amenities CRUD + listing contract.
 *
 * Runs against a dedicated DB (`bootApp({ dbName })`) and exercises the public
 * and admin-only routes under `/api/v1`. Uses the shared factory helpers so data
 * is cheap, consistent and unique per run.
 */
/* eslint-disable no-console */
const {
  app,
  bootApp,
  resetDB,
  closeDB,
  agent,
} = require("../helpers/app");
const Hotel = require("../../src/modules/hotels/hotel.model");
const Room = require("../../src/modules/rooms/room.model");
const {
  createAdmin,
  createUser,
  authHeaders,
  createHotel: seedHotel,
  createRoom: seedRoom,
  createAmenity: seedAmenity,
  uniq,
} = require("../helpers/factories");

/**
 * Happy-path image uploads are exercised against a mocked Cloudinary so the
 * suites stay hermetic (no real network calls). The `multer-storage-cloudinary`
 * adapter drives `cloudinary.uploader.upload_stream(opts, cb)` and assigns
 * `file.path`/`file.filename` from the response — mirroring a real upload.
 */
jest.mock("cloudinary", () => {
  const { Writable } = require("stream");
  const makeResult = (folder) => {
    const suffix = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    return {
      secure_url: `https://res.cloudinary.com/test/${folder}/mock-${suffix}.jpg`,
      public_id: `${folder}/mock-${suffix}`,
      bytes: 1234,
    };
  };
  return {
    v2: {
      config: jest.fn(),
      uploader: {
        upload: jest.fn(),
        upload_stream: jest.fn((options, callback) => {
          const result = makeResult(options.folder || "luxury-hotel/amenities");
          return new Writable({
            write(_chunk, _encoding, next) {
              next();
            },
            final(next) {
              callback(null, result);
              next();
            },
          });
        }),
        destroy: jest.fn().mockResolvedValue({ result: "ok" }),
      },
    },
  };
});

/** ISO date strings for fixtures, e.g. "+3" = 3 days from now. */
const isoDate = (offsetDays) => new Date(Date.now() + offsetDays * 86400000).toISOString();

/**
 * The shared factories omit `slug` (Hotel schema: unique) and `icon`
 * (Amenity schema: required), so direct `Model.create` seeds of more than one
 * record blow up (dup `slug: null` / missing icon). These wrappers inject the
 * missing required fields without touching `tests/helpers/`.
 */
const seedHotels = (overrides = {}) =>
  seedHotel({ ...overrides, slug: overrides.slug || `h_${uniq("slug")}` });

const seedAmenities = (overrides = {}) =>
  seedAmenity({ ...overrides, icon: overrides.icon || "wifi" });

let adminToken;

beforeAll(async () => {
  const { booted } = await bootApp({ dbName: "lux_hotel_crud_hotels" });
  expect(booted).toBe(true);
});

beforeEach(async () => {
  await resetDB();
  const admin = await createAdmin();
  adminToken = authHeaders(admin);
});

afterAll(async () => {
  await closeDB();
});

// ─────────────────────────── Object builders ──────────────────────────────

const hotelBody = (overrides = {}) => ({
  name: `Court Hotel ${uniq("h")}`,
  description: "A five-star luxury hotel in the heart of the city.",
  shortDescription: "Five-star luxury.",
  category: "LUXURY",
  starRating: 5,
  address: {
    street: "1 Marine Drive",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    pincode: "400001",
  },
  contact: { email: uniq("hm") + "@test.dev", phone: "+91 90000 00000" },
  policies: { checkIn: "14:00", checkOut: "12:00" },
  ...overrides,
});

const roomBody = (hotelId, overrides = {}) => ({
  hotel: hotelId,
  name: `Deluxe Room ${uniq("r")}`,
  type: "SUITE",
  description: "A spacious suite with a sea view.",
  maxOccupancy: { adults: 2, children: 1 },
  basePricePerNight: 10000,
  totalUnits: 3,
  ...overrides,
});

// ──────────────────────────────── HOTELS ──────────────────────────────────

describe("HOTELS — public listing & filters", () => {
  test("GET /api/v1/hotels returns a paginated array of all hotels", async () => {
    await seedHotels({ name: "Alpha Hotel" });
    await seedHotels({ name: "Beta Hotel" });
    await seedHotels({ name: "Gamma Hotel" });

    const res = await agent().get("/api/v1/hotels");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(3);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(3);
  });

  test("GET /api/v1/hotels filters by category=LUXURY", async () => {
    await seedHotels({ name: "Luxury One", category: "LUXURY" });
    await seedHotels({ name: "Budget One", category: "BUDGET" });

    const res = await agent().get("/api/v1/hotels?category=LUXURY");
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].category).toBe("LUXURY");
  });

  test("GET /api/v1/hotels filters by starRating=5", async () => {
    await seedHotels({ name: "Five Star", starRating: 5 });
    await seedHotels({ name: "Three Star", starRating: 3 });

    const res = await agent().get("/api/v1/hotels?starRating=5");
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].starRating).toBe(5);
  });

  test("GET /api/v1/hotels filters by city", async () => {
    await seedHotels({
      name: "Mumbai Palace",
      address: { street: "1", city: "Mumbai", state: "Maharashtra", country: "India" },
    });
    await seedHotels({
      name: "Delhi House",
      address: { street: "2", city: "Delhi", state: "Delhi", country: "India" },
    });

    const res = await agent().get("/api/v1/hotels?city=Mumbai");
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].address.city).toMatch(/Mumbai/i);
  });

  test("GET /api/v1/hotels supports a valid sort param", async () => {
    await seedHotels({ name: "A Hotel" });
    await seedHotels({ name: "B Hotel" });

    const asc = await agent().get("/api/v1/hotels?sort=price_asc");
    expect(asc.status).toBe(200);
    expect(Array.isArray(asc.body.data)).toBe(true);

    const desc = await agent().get("/api/v1/hotels?sort=price_desc");
    expect(desc.status).toBe(200);
    expect(Array.isArray(desc.body.data)).toBe(true);
  });

  test("GET /api/v1/hotels respects page & limit and reports pagination", async () => {
    await seedHotels({ name: "H1" });
    await seedHotels({ name: "H2" });
    await seedHotels({ name: "H3" });

    const res = await agent().get("/api/v1/hotels?page=1&limit=2");
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(2);
    expect(res.body.pagination.total).toBe(3);
    expect(res.body.pagination.totalPages).toBe(2);
    expect(res.body.pagination.hasNextPage).toBe(true);
  });

  test("GET /api/v1/hotels/featured returns only featured hotels", async () => {
    await seedHotels({ name: "Featured A", isFeatured: true });
    await seedHotels({ name: "Not Featured", isFeatured: false });
    await seedHotels({ name: "Featured B", isFeatured: true });

    const res = await agent().get("/api/v1/hotels/featured");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.every((h) => h.isFeatured)).toBe(true);
  });
});

describe("HOTELS — detail, nearby, search", () => {
  test("GET /api/v1/hotels/:id returns the hotel object", async () => {
    const hotel = await seedHotels({ name: "Detail Hotel" });

    const res = await agent().get(`/api/v1/hotels/${hotel._id}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toEqual(hotel._id.toString());
    expect(res.body.data.name).toBe("Detail Hotel");
    expect(res.body.data.address.city).toBeDefined();
    expect(res.body.data.starRating).toBeDefined();
    // Card/API contract exposes a `primaryImage` virtual.
    expect(res.body.data.primaryImage).toBeDefined();
  });

  test("GET /api/v1/hotels/:id returns 404 after DELETE (soft delete)", async () => {
    const hotel = await seedHotels({ name: "Delete Me" });

    const del = await agent().delete(`/api/v1/hotels/${hotel._id}`).set(adminToken);
    expect(del.status).toBe(200);

    const res = await agent().get(`/api/v1/hotels/${hotel._id}`);
    expect(res.status).toBe(404);
  });

  test("GET /api/v1/hotels/nearby returns array and validates coords", async () => {
    await seedHotels({
      name: "Nearby Hotel",
      location: { type: "Point", coordinates: [72.8777, 19.076] }, // Mumbai
    });

    const ok = await agent().get("/api/v1/hotels/nearby?lat=19.076&lng=72.8777");
    expect(ok.status).toBe(200);
    expect(Array.isArray(ok.body.data)).toBe(true);

    const missing = await agent().get("/api/v1/hotels/nearby");
    expect(missing.status).toBe(400);

    const invalid = await agent().get("/api/v1/hotels/nearby?lat=abc&lng=def");
    expect(invalid.status).toBe(400);

    const outOfRange = await agent().get("/api/v1/hotels/nearby?lat=999&lng=999");
    expect(outOfRange.status).toBe(400);
  });

  test("GET /api/v1/hotels/search supports a city filter and returns paginated data", async () => {
    await seedHotels({
      name: "Goa Resort",
      address: { street: "1 Beach Rd", city: "Goa", state: "Goa", country: "India" },
    });
    await seedHotels({
      name: "Pune Stay",
      address: { street: "2 MG Rd", city: "Pune", state: "Maharashtra", country: "India" },
    });

    const res = await agent().get("/api/v1/hotels/search?city=Goa");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.data).toHaveLength(1);
  });
});

describe("HOTELS — admin CRUD & authorization", () => {
  test("POST /api/v1/hotels creates a hotel (admin) → 201", async () => {
    const res = await agent().post("/api/v1/hotels").set(adminToken).send(hotelBody());
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("_id");
    expect(res.body.data.name).toBeDefined();
  });

  test("POST /api/v1/hotels rejects missing required fields with 422", async () => {
    const res = await agent()
      .post("/api/v1/hotels")
      .set(adminToken)
      .send({ name: "Incomplete", category: "LUXURY" });
    expect(res.status).toBe(422);
  });

  test("POST /api/v1/hotels without token → 401; with USER token → 403", async () => {
    const body = hotelBody();

    const noToken = await agent().post("/api/v1/hotels").send(body);
    expect(noToken.status).toBe(401);

    const user = await createUser();
    const userToken = await agent().post("/api/v1/hotels").set(authHeaders(user)).send(body);
    expect(userToken.status).toBe(403);
  });

  test("PUT /api/v1/hotels/:id updates and DELETE returns no data", async () => {
    const hotel = await seedHotels({ name: "Put Me" });

    const put = await agent().put(`/api/v1/hotels/${hotel._id}`).set(adminToken).send({ name: "Updated Name" });
    expect(put.status).toBe(200);
    expect(put.body.data.name).toBe("Updated Name");

    const del = await agent().delete(`/api/v1/hotels/${hotel._id}`).set(adminToken);
    expect(del.status).toBe(200);
    expect(del.body.data).toBeUndefined();
  });

  test("DELETE /api/v1/hotels/:id cascades to deactivate its active rooms", async () => {
    const hotel = await seedHotels({ name: "Cascade Hotel" });
    const roomA = await seedRoom(hotel, { name: "Cascade Suite A" });
    const roomB = await seedRoom(hotel, { name: "Cascade Suite B" });

    const del = await agent().delete(`/api/v1/hotels/${hotel._id}`).set(adminToken);
    expect(del.status).toBe(200);

    // Room detail now 404s because the cascade soft-deleted the rooms.
    for (const room of [roomA, roomB]) {
      const res = await agent().get(`/api/v1/rooms/${room._id}`);
      expect(res.status).toBe(404);
    }

    // The room docs still exist (soft delete) but are inactive, so public
    // room listings under this hotel return nothing.
    const listing = await agent().get(`/api/v1/rooms/hotel/${hotel._id}`);
    expect(listing.status).toBe(200);
    expect(listing.body.data).toHaveLength(0);

    const roomDocs = await Room.find({ hotel: hotel._id, isActive: true });
    expect(roomDocs).toHaveLength(0);
  });
});

describe("HOTELS — image endpoints (authorization + file filter)", () => {
  test("POST /api/v1/hotels/:id/images without token returns 401", async () => {
    const hotel = await seedHotels({ name: "Img Hotel" });
    const res = await agent().post(`/api/v1/hotels/${hotel._id}/images`);
    expect(res.status).toBe(401);
  });

  test("POST /api/v1/hotels/:id/images rejects a non-image file upload", async () => {
    const hotel = await seedHotels({ name: "Img Hotel 2" });
    const res = await agent()
      .post(`/api/v1/hotels/${hotel._id}/images`)
      .set(adminToken)
      .attach("images", Buffer.from("not-an-image"), "x.txt");
    // Multer imageFileFilter rejects non-image mimetypes.
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Only image files/i);
  });
});

// ──────────────────────────────── ROOMS ───────────────────────────────────

describe("ROOMS — public listing", () => {
  test("GET /api/v1/rooms returns a paginated array (with a hotel)", async () => {
    const hotel = await seedHotels({ name: "Rooms Hotel" });
    await seedRoom(hotel, { name: "Suite A" });
    await seedRoom(hotel, { name: "Suite B" });

    const res = await agent().get("/api/v1/rooms");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(2);
  });

  test("GET /api/v1/rooms/hotel/:hotelId filters by hotel", async () => {
    const h1 = await seedHotels({ name: "H1" });
    const h2 = await seedHotels({ name: "H2" });
    await seedRoom(h1, { name: "Room in H1" });
    await seedRoom(h2, { name: "Room in H2" });

    const res = await agent().get(`/api/v1/rooms/hotel/${h1._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe("Room in H1");
    expect(res.body.pagination.total).toBe(1);
  });

  test("GET /api/v1/rooms respects page/limit pagination metadata", async () => {
    const hotel = await seedHotels({ name: "Pg Hotel" });
    await seedRoom(hotel, { name: "R1" });
    await seedRoom(hotel, { name: "R2" });
    await seedRoom(hotel, { name: "R3" });

    const res = await agent().get("/api/v1/rooms?page=1&limit=2");
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.pagination.total).toBe(3);
    expect(res.body.pagination.totalPages).toBe(2);
    expect(res.body.pagination.hasNextPage).toBe(true);
  });

  test("GET /api/v1/rooms/:id returns the room object", async () => {
    const hotel = await seedHotels({ name: "Detail Room Hotel" });
    const room = await seedRoom(hotel, { name: "Detail Suite" });

    const res = await agent().get(`/api/v1/rooms/${room._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data._id).toEqual(room._id.toString());
    expect(res.body.data.name).toBe("Detail Suite");
    expect(res.body.data.basePricePerNight).toBeDefined();
  });

  test("GET /api/v1/rooms/:id/availability returns a data object", async () => {
    const hotel = await seedHotels({ name: "Avail Hotel" });
    const room = await seedRoom(hotel, { totalUnits: 3 });

    const res = await agent().get(
      `/api/v1/rooms/${room._id}/availability?checkIn=${isoDate(1)}&checkOut=${isoDate(3)}`
    );
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(typeof res.body.data.isAvailable).toBe("boolean");
    expect(res.body.data.roomId).toEqual(room._id.toString());
  });

  test("GET /api/v1/rooms/:id/availability rejects invalid dates with 422", async () => {
    const hotel = await seedHotels({ name: "Avail Bad Hotel" });
    const room = await seedRoom(hotel, { totalUnits: 2 });

    const res = await agent().get(
      `/api/v1/rooms/${room._id}/availability?checkIn=not-a-date&checkOut=also-bad`
    );
    expect(res.status).toBe(422);
  });

  test("GET /api/v1/rooms/:id/blocked-dates returns { blockedDates: [...] }", async () => {
    const hotel = await seedHotels({ name: "Blocked Hotel" });
    const room = await seedRoom(hotel, { totalUnits: 2 });

    const res = await agent().get(
      `/api/v1/rooms/${room._id}/blocked-dates?startDate=${isoDate(1)}&endDate=${isoDate(5)}`
    );
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data.blockedDates)).toBe(true);
  });
});

describe("ROOMS — admin CRUD", () => {
  test("POST /api/v1/rooms creates a room → 201", async () => {
    const hotel = await seedHotels({ name: "Create Room Hotel" });
    const res = await agent().post("/api/v1/rooms").set(adminToken).send(roomBody(hotel._id));
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("_id");
    expect(res.body.data.hotel).toEqual(hotel._id.toString());
  });

  test("POST /api/v1/rooms rejects missing required fields with 422", async () => {
    const hotel = await seedHotels({ name: "Bad Room Hotel" });

    for (const partial of [
      { name: "No Hotel", type: "SUITE", basePricePerNight: 100, totalUnits: 1 }, // missing hotel
      { hotel: hotel._id, type: "SUITE", basePricePerNight: 100, totalUnits: 1 }, // missing name
      { hotel: hotel._id, name: "No Type", basePricePerNight: 100, totalUnits: 1 }, // missing type
      { hotel: hotel._id, name: "No Price", type: "SUITE", totalUnits: 1 }, // missing basePricePerNight
      { hotel: hotel._id, name: "No Units", type: "SUITE", basePricePerNight: 100 }, // missing totalUnits
    ]) {
      const res = await agent().post("/api/v1/rooms").set(adminToken).send(partial);
      expect(res.status).toBe(422);
    }
  });

  test("POST /api/v1/rooms rejects invalid type with 422", async () => {
    const hotel = await seedHotels({ name: "Invalid Type Hotel" });
    const res = await agent()
      .post("/api/v1/rooms")
      .set(adminToken)
      .send(roomBody(hotel._id, { type: "BUNGALOW" }));
    expect(res.status).toBe(422);
  });

  test("POST /api/v1/rooms allows duplicate room data (no unique constraint)", async () => {
    const hotel = await seedHotels({ name: "Dup Room Hotel" });
    const body = roomBody(hotel._id);

    const first = await agent().post("/api/v1/rooms").set(adminToken).send(body);
    expect(first.status).toBe(201);

    const second = await agent().post("/api/v1/rooms").set(adminToken).send(body);
    expect(second.status).toBe(201);
  });

  test("PUT /api/v1/rooms/:id and DELETE", async () => {
    const hotel = await seedHotels({ name: "Mutate Room Hotel" });
    const room = await seedRoom(hotel, { name: "Before" });

    const put = await agent().put(`/api/v1/rooms/${room._id}`).set(adminToken).send({ name: "After" });
    expect(put.status).toBe(200);
    expect(put.body.data.name).toBe("After");

    const del = await agent().delete(`/api/v1/rooms/${room._id}`).set(adminToken);
    expect(del.status).toBe(200);
    expect(del.body.data).toBeUndefined();
  });

  test("POST /api/v1/rooms without token → 401", async () => {
    const hotel = await seedHotels({ name: "Auth Room Hotel" });
    const res = await agent().post("/api/v1/rooms").send(roomBody(hotel._id));
    expect(res.status).toBe(401);
  });

  test("POST /api/v1/rooms/:id/images rejects a non-image file upload", async () => {
    const hotel = await seedHotels({ name: "Room Img Hotel" });
    const room = await seedRoom(hotel, { name: "Img Room" });
    const res = await agent()
      .post(`/api/v1/rooms/${room._id}/images`)
      .set(adminToken)
      .attach("images", Buffer.from("not-an-image"), "x.txt");
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Only image files/i);
  });
});

// ─────────────────────────────── AMENITIES ────────────────────────────────

describe("AMENITIES — public endpoints", () => {
  test("GET /api/v1/amenities returns a paginated array and filters by search", async () => {
    await seedAmenities({ name: "WiFi " + uniq(), category: "HOTEL" });
    await seedAmenities({ name: "Spa " + uniq(), category: "WELLNESS" });

    const res = await agent().get("/api/v1/amenities");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.pagination).toBeDefined();

    const search = await agent().get("/api/v1/amenities?category=WELLNESS");
    expect(search.status).toBe(200);
    expect(search.body.data).toHaveLength(1);
  });

  test("GET /api/v1/amenities/:id returns an object; invalid id → 404", async () => {
    const amenity = await seedAmenities({ name: "Pool " + uniq("a") });

    const ok = await agent().get(`/api/v1/amenities/${amenity._id}`);
    expect(ok.status).toBe(200);
    expect(ok.body.data._id).toEqual(amenity._id.toString());

    const bad = await agent().get("/api/v1/amenities/not-a-real-id");
    expect([400, 404]).toContain(bad.status);
  });
});

describe("AMENITIES — admin CRUD", () => {
  const amenityBody = (overrides = {}) => ({
    name: `Amenity ${uniq("am")}`,
    icon: "wifi",
    category: "HOTEL",
    description: "A hotel amenity",
    ...overrides,
  });

  test("POST /api/v1/amenities creates an amenity → 201", async () => {
    const res = await agent().post("/api/v1/amenities").set(adminToken).send(amenityBody());
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("_id");
  });

  test("POST /api/v1/amenities rejects missing name with 422", async () => {
    const res = await agent()
      .post("/api/v1/amenities")
      .set(adminToken)
      .send({ icon: "wifi", category: "HOTEL" });
    expect(res.status).toBe(422);
  });

  test("POST /api/v1/amenities rejects invalid category with 422", async () => {
    const res = await agent()
      .post("/api/v1/amenities")
      .set(adminToken)
      .send(amenityBody({ category: "NOPE" }));
    expect(res.status).toBe(422);
  });

  test("POST /api/v1/amenities with a duplicate name returns a conflict status", async () => {
    const name = `Spa ${uniq("dup")}`;
    const first = await agent().post("/api/v1/amenities").set(adminToken).send(amenityBody({ name }));
    expect(first.status).toBe(201);

    const dup = await agent().post("/api/v1/amenities").set(adminToken).send(amenityBody({ name }));
    expect(dup.status).toBe(409);
  });

  test("PUT /api/v1/amenities/:id and DELETE", async () => {
    const amenity = await seedAmenities({ name: "Old Amenity" });

    const put = await agent().put(`/api/v1/amenities/${amenity._id}`).set(adminToken).send({ name: "New Amenity" });
    expect(put.status).toBe(200);
    expect(put.body.data.name).toBe("New Amenity");

const del = await agent().delete(`/api/v1/amenities/${amenity._id}`).set(adminToken);
    expect(del.status).toBe(200);
    expect(del.body.data).toBeUndefined();
  });

  test("DELETE /api/v1/amenities/:id removes the reference from hotels that used it", async () => {
    const amenity = await seedAmenities({ name: "Referenced Amenity" });
    const hotel = await seedHotels({ name: "Referencing Hotel" });
    await Hotel.findByIdAndUpdate(hotel._id, { $push: { amenities: amenity._id } });

    const del = await agent().delete(`/api/v1/amenities/${amenity._id}`).set(adminToken);
    expect(del.status).toBe(200);

    // The hotel doc no longer holds a dangling ObjectId pointing at the deleted amenity.
    const fresh = await Hotel.findById(hotel._id);
    expect(fresh.amenities.map((a) => a.toString())).not.toContain(String(amenity._id));

    // Repeating the delete is idempotent-safe: 404, no double success.
    const again = await agent().delete(`/api/v1/amenities/${amenity._id}`).set(adminToken);
    expect(again.status).toBe(404);
  });

  test("USER token → 403 on amenity admin routes", async () => {
    const user = await createUser();
    const res = await agent().post("/api/v1/amenities").set(authHeaders(user)).send(amenityBody());
    expect(res.status).toBe(403);
  });

  test("POST /:id/image without token → 401; non-image upload → 400", async () => {
    const amenity = await seedAmenities({ name: "Image Amenity" });

    const anon = await agent().post(`/api/v1/amenities/${amenity._id}/image`);
    expect(anon.status).toBe(401);

    const admin = await createAdmin();
    const bad = await agent()
      .post(`/api/v1/amenities/${amenity._id}/image`)
      .set(authHeaders(admin))
      .attach("image", Buffer.from("not-an-image"), "x.txt");
    // Multer imageFileFilter rejects non-image mimetypes.
    expect(bad.status).toBe(400);
    expect(bad.body.message).toMatch(/Only image files/i);
  });

  test("DELETE /:id/image without token → 401; unknown id → 404 (ADMIN)", async () => {
    const amenity = await seedAmenities({ name: "Removable Amenity" });

    const anon = await agent().delete(`/api/v1/amenities/${amenity._id}/image`);
    expect(anon.status).toBe(401);

    const admin = await createAdmin();
    const missing = await agent()
      .delete("/api/v1/amenities/not-a-real-id/image")
      .set(authHeaders(admin));
    expect([400, 404]).toContain(missing.status);
  });
});

describe("AMENITIES — image lifecycle (create → edit → upload → replace → remove → delete)", () => {
  const amenityBody = (overrides = {}) => ({
    name: `Amenity ${uniq("life")}`,
    icon: "wifi",
    category: "HOTEL",
    description: "A hotel amenity",
    ...overrides,
  });

  const tinyImage = () => Buffer.from("fake-image-bytes");
  const attachImage = (req, bytes = tinyImage(), filename = "amenity.jpg") =>
    req.attach("image", bytes, filename);

  test("Full lifecycle: create, edit without image (image preserved), edit with new image (replaced), remove image, delete", async () => {
    // ── CREATE ────────────────────────────────────────────────────────────
    const created = await agent()
      .post("/api/v1/amenities")
      .set(adminToken)
      .send(amenityBody());
    expect(created.status).toBe(201);
    const id = created.body.data._id;

    // ── UPLOAD image on the new record ────────────────────────────────────
    const upload = await attachImage(
      agent().post(`/api/v1/amenities/${id}/image`).set(adminToken)
    );
    expect(upload.status).toBe(200);
    expect(upload.body.data.image).toMatch(/res\.cloudinary\.com/);
    expect(upload.body.data.imagePublicId).toMatch(/luxury-hotel\/amenities/);

    const firstImage = upload.body.data.image;
    const firstPublicId = upload.body.data.imagePublicId;

    // ── EDIT fields WITHOUT a new image → old image preserved ─────────────
    const editNoImage = await agent()
      .put(`/api/v1/amenities/${id}`)
      .set(adminToken)
      .send({ name: "Renamed Amenity", description: "Updated description" });
    expect(editNoImage.status).toBe(200);
    expect(editNoImage.body.data.name).toBe("Renamed Amenity");
    expect(editNoImage.body.data.description).toBe("Updated description");
    expect(editNoImage.body.data.image).toBe(firstImage);
    expect(editNoImage.body.data.imagePublicId).toBe(firstPublicId);

    // ── EDIT + UPLOAD a NEW image → replaces the old asset ────────────────
    const replace = await attachImage(
      agent().post(`/api/v1/amenities/${id}/image`).set(adminToken),
      Buffer.from("replacement-image-bytes"),
      "amenity2.jpg"
    );
    expect(replace.status).toBe(200);
    expect(replace.body.data.imagePublicId).not.toBe(firstPublicId);
    expect(replace.body.data.image).not.toBe(firstImage);

    // ── REMOVE image ──────────────────────────────────────────────────────
    const removed = await agent()
      .delete(`/api/v1/amenities/${id}/image`)
      .set(adminToken);
    expect(removed.status).toBe(200);
    expect(removed.body.data.image).toBeUndefined();
    expect(removed.body.data.imagePublicId).toBeUndefined();

    // ── DELETE ────────────────────────────────────────────────────────────
    const del = await agent().delete(`/api/v1/amenities/${id}`).set(adminToken);
    expect(del.status).toBe(200);
    expect(del.body.data).toBeUndefined();

    const gone = await agent().get(`/api/v1/amenities/${id}`);
    expect(gone.status).toBe(404);
  });

  test("Edit without an image keeps the original image and imagePublicId intact", async () => {
    const amenity = await seedAmenities({
      name: `Keep Image ${uniq("keep")}`,
      image: "https://res.cloudinary.com/test/luxury-hotel/amenities/keep-me.jpg",
      imagePublicId: "luxury-hotel/amenities/keep-me",
    });

    const res = await agent()
      .put(`/api/v1/amenities/${amenity._id}`)
      .set(adminToken)
      .send({ category: "WELLNESS", description: "Edited without touching the image" });

    expect(res.status).toBe(200);
    expect(res.body.data.category).toBe("WELLNESS");
    expect(res.body.data.image).toBe(
      "https://res.cloudinary.com/test/luxury-hotel/amenities/keep-me.jpg"
    );
    expect(res.body.data.imagePublicId).toBe("luxury-hotel/amenities/keep-me");
  });

  test("Remove image clears image + imagePublicId for an amenity that had one", async () => {
    const amenity = await seedAmenities({
      name: `Remove Me ${uniq("rm")}`,
      image: "https://res.cloudinary.com/test/luxury-hotel/amenities/remove-me.jpg",
      imagePublicId: "luxury-hotel/amenities/remove-me",
    });

    const res = await agent()
      .delete(`/api/v1/amenities/${amenity._id}/image`)
      .set(adminToken);

    expect(res.status).toBe(200);
    expect(res.body.data.image).toBeUndefined();
    expect(res.body.data.imagePublicId).toBeUndefined();

    const fresh = await agent().get(`/api/v1/amenities/${amenity._id}`);
    expect(fresh.body.data.image).toBeUndefined();
    expect(fresh.body.data.imagePublicId).toBeUndefined();
  });
});