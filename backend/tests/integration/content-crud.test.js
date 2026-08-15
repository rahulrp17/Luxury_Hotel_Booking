/* eslint-disable no-console */
/**
 * Integration tests for the five public-facing content modules served under
 * /api/v1 — dining, testimonials, gallery, faqs, attractions.
 *
 * Public read endpoints are open; write endpoints (POST/PUT/DELETE) require an
 * ADMIN bearer token. All list endpoints return `data` as an ARRAY plus
 * `pagination`, single items return `data` as an OBJECT, and DELETE omits
 * `data`. Validation failures return 422, missing/invalid lookups return 400/404.
 */
const mongoose = require("mongoose");
const { bootApp, resetDB, closeDB, agent } = require("../helpers/app");
const {
  createUser,
  createAdmin,
  authHeaders,
  createDining,
  createTestimonial,
  createGalleryItem,
  createFaq,
  createAttraction,
  uniq,
} = require("../helpers/factories");
const { getRedisClient } = require("../../src/config/redis");

const invalidObjectId = () => "not-a-valid-object-id-12345";
const randomObjectId = () => new mongoose.Types.ObjectId().toString();

/** Wipe the (in-memory) response cache so cached GETs never bleed across tests. */
async function flushCache() {
  try {
    await getRedisClient().flushdb();
  } catch (err) {
    /* ignore */
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Dining
// ────────────────────────────────────────────────────────────────────────────
describe("Dining — /api/v1/dining", () => {
  beforeAll(async () => {
    const { booted } = await bootApp({ dbName: "lux_hotel_crud_content" });
    expect(booted).toBe(true);
  });
  beforeEach(async () => {
    await resetDB();
    await flushCache();
  });
  afterAll(async () => {
    await closeDB();
  });

  test("GET /dining returns a paginated array and counts seeded docs", async () => {
    await createDining({ title: uniq("DiningA") });
    await createDining({ title: uniq("DiningB") });
    await createDining({ title: uniq("DiningC") });
    const res = await agent().get("/api/v1/dining");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(3);
    expect(res.body.pagination.total).toBe(3);
    expect(res.body.statusCode).toBe(200);
  });

  test("GET /dining?cuisine= filters the list", async () => {
    await createDining({ title: uniq("Ital"), cuisine: "Italian" });
    await createDining({ title: uniq("Chin"), cuisine: "Chinese" });
    const res = await agent().get("/api/v1/dining?cuisine=Chinese");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].cuisine).toBe("Chinese");
  });

  test("GET /dining/featured returns an array", async () => {
    await createDining({ title: uniq("F1"), isFeatured: true });
    await createDining({ title: uniq("F2"), isFeatured: true });
    const res = await agent().get("/api/v1/dining/featured");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);
  });

  test("GET /dining/:id returns a single object", async () => {
    const d = await createDining({ title: uniq("Single") });
    const res = await agent().get(`/api/v1/dining/${d._id}`);
    expect(res.status).toBe(200);
    expect(typeof res.body.data).toBe("object");
    expect(res.body.data._id.toString()).toBe(d._id.toString());
  });

  test("GET /dining/:id with malformed id returns 400", async () => {
    const res = await agent().get(`/api/v1/dining/${invalidObjectId()}`);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("GET /dining/:id with unknown id returns 404", async () => {
    const res = await agent().get(`/api/v1/dining/${randomObjectId()}`);
    expect(res.status).toBe(404);
  });

  test("POST /dining without token returns 401", async () => {
    const res = await agent().post("/api/v1/dining").send({ title: "X" });
    expect(res.status).toBe(401);
  });

  test("POST /dining with a normal USER token returns 403", async () => {
    const user = await createUser();
    const res = await agent()
      .post("/api/v1/dining")
      .set(authHeaders(user))
      .send({ title: "X" });
    expect(res.status).toBe(403);
  });

  test("POST /dining missing title returns 422", async () => {
    const admin = await createAdmin();
    const res = await agent()
      .post("/api/v1/dining")
      .set(authHeaders(admin))
      .send({ subtitle: "no title" });
    expect(res.status).toBe(422);
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  test("POST /dining creates and returns 201 with object data", async () => {
    const admin = await createAdmin();
    const body = {
      title: uniq("Post"),
      subtitle: "Fine dining",
      hotel: "Luxury Grand Hotel", // NAME string, not ObjectId
      city: "Mumbai",
      cuisine: "Italian",
      rating: 5,
      isActive: true,
    };
    const res = await agent().post("/api/v1/dining").set(authHeaders(admin)).send(body);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data).toBe("object");
    expect(res.body.data.hotel).toBe("Luxury Grand Hotel");
  });

  test("PUT /dining/:id updates and returns 200", async () => {
    const admin = await createAdmin();
    const d = await createDining({ title: uniq("Old") });
    const res = await agent()
      .put(`/api/v1/dining/${d._id}`)
      .set(authHeaders(admin))
      .send({ title: uniq("New") });
    expect(res.status).toBe(200);
    expect(res.body.data._id.toString()).toBe(d._id.toString());
    expect(res.body.data.title).not.toBe("Old");
  });

  test("PUT /dining/:id by a normal USER returns 403", async () => {
    const user = await createUser();
    const d = await createDining({ title: uniq("U") });
    const res = await agent()
      .put(`/api/v1/dining/${d._id}`)
      .set(authHeaders(user))
      .send({ title: "nope" });
    expect(res.status).toBe(403);
  });

  test("DELETE /dining/:id returns 200 without data and hides the item", async () => {
    const admin = await createAdmin();
    const d = await createDining({ title: uniq("Del") });
    const del = await agent().delete(`/api/v1/dining/${d._id}`).set(authHeaders(admin));
    expect(del.status).toBe(200);
    expect(del.body.success).toBe(true);
    expect(del.body.data).toBeUndefined();
    const get = await agent().get(`/api/v1/dining/${d._id}`);
    expect(get.status).toBe(404);
  });

  test("DELETE /dining/:id for unknown id returns 404", async () => {
    const admin = await createAdmin();
    const res = await agent()
      .delete(`/api/v1/dining/${randomObjectId()}`)
      .set(authHeaders(admin));
    expect(res.status).toBe(404);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Testimonials
// ────────────────────────────────────────────────────────────────────────────
describe("Testimonials — /api/v1/testimonials", () => {
  beforeAll(async () => {
    const { booted } = await bootApp({ dbName: "lux_hotel_crud_content" });
    expect(booted).toBe(true);
  });
  beforeEach(async () => {
    await resetDB();
    await flushCache();
  });
  afterAll(async () => {
    await closeDB();
  });

  test("GET /testimonials returns paginated array; pagination.total matches", async () => {
    await createTestimonial({ name: uniq("N1") });
    await createTestimonial({ name: uniq("N2") });
    await createTestimonial({ name: uniq("N3") });
    const res = await agent().get("/api/v1/testimonials");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(3);
    expect(res.body.pagination.total).toBe(3);
  });

  test("GET /testimonials/featured returns an array", async () => {
    await createTestimonial({ name: uniq("F1") });
    await createTestimonial({ name: uniq("F2") });
    const res = await agent().get("/api/v1/testimonials/featured");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("GET /testimonials/:id returns a single object", async () => {
    const t = await createTestimonial({ name: uniq("G") });
    const res = await agent().get(`/api/v1/testimonials/${t._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data._id.toString()).toBe(t._id.toString());
  });

  test("GET /testimonials/:id missing returns 404", async () => {
    const res = await agent().get(`/api/v1/testimonials/${randomObjectId()}`);
    expect(res.status).toBe(404);
  });

  test("POST /testimonials without token returns 401; USER returns 403", async () => {
    const anon = await agent().post("/api/v1/testimonials").send({});
    expect(anon.status).toBe(401);
    const user = await createUser();
    const forbidden = await agent()
      .post("/api/v1/testimonials")
      .set(authHeaders(user))
      .send({ name: "x", rating: 5, review: "long enough text here" });
    expect(forbidden.status).toBe(403);
  });

  test("POST /testimonials missing required fields returns 422", async () => {
    const admin = await createAdmin();
    const missingName = await agent()
      .post("/api/v1/testimonials")
      .set(authHeaders(admin))
      .send({ rating: 5, review: "long enough text here" });
    expect(missingName.status).toBe(422);
    expect(Array.isArray(missingName.body.errors)).toBe(true);
  });

  test("POST /testimonials with out-of-range rating returns 422", async () => {
    const admin = await createAdmin();
    const res = await agent()
      .post("/api/v1/testimonials")
      .set(authHeaders(admin))
      .send({ name: "John", rating: 9, review: "long enough text here" });
    expect(res.status).toBe(422);
  });

  test("POST -> PUT -> DELETE full lifecycle", async () => {
    const admin = await createAdmin();
    const created = await agent()
      .post("/api/v1/testimonials")
      .set(authHeaders(admin))
      .send({ name: "John Doe", rating: 5, review: "A truly wonderful stay." });
    expect(created.status).toBe(201);
    const id = created.body.data._id;

    const updated = await agent()
      .put(`/api/v1/testimonials/${id}`)
      .set(authHeaders(admin))
      .send({ rating: 4 });
    expect(updated.status).toBe(200);
    expect(updated.body.data.rating).toBe(4);

    const deleted = await agent().delete(`/api/v1/testimonials/${id}`).set(authHeaders(admin));
    expect(deleted.status).toBe(200);
    expect(deleted.body.data).toBeUndefined();

    const after = await agent().get(`/api/v1/testimonials/${id}`);
    expect(after.status).toBe(404);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Gallery
// ────────────────────────────────────────────────────────────────────────────
describe("Gallery — /api/v1/gallery", () => {
  beforeAll(async () => {
    const { booted } = await bootApp({ dbName: "lux_hotel_crud_content" });
    expect(booted).toBe(true);
  });
  beforeEach(async () => {
    await resetDB();
    await flushCache();
  });
  afterAll(async () => {
    await closeDB();
  });

  test("GET /gallery returns paginated array", async () => {
    await createGalleryItem({ title: uniq("A"), category: "hotel" });
    await createGalleryItem({ title: uniq("B"), category: "room" });
    await createGalleryItem({ title: uniq("C"), category: "spa" });
    const res = await agent().get("/api/v1/gallery");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(3);
    expect(res.body.pagination.total).toBe(3);
  });

  test("GET /gallery?category= filters by category", async () => {
    await createGalleryItem({ title: uniq("H"), category: "hotel" });
    await createGalleryItem({ title: uniq("R"), category: "room" });
    const res = await agent().get("/api/v1/gallery?category=room");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].category).toBe("room");
  });

  test("GET /gallery/featured returns an array", async () => {
    await createGalleryItem({ title: uniq("F1"), isFeatured: true });
    await createGalleryItem({ title: uniq("F2"), isFeatured: true });
    const res = await agent().get("/api/v1/gallery/featured");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("GET /gallery/:id returns a single object; unknown id → 404", async () => {
    const g = await createGalleryItem({ title: uniq("G") });
    const ok = await agent().get(`/api/v1/gallery/${g._id}`);
    expect(ok.status).toBe(200);
    expect(ok.body.data._id.toString()).toBe(g._id.toString());

    const missing = await agent().get(`/api/v1/gallery/${randomObjectId()}`);
    expect(missing.status).toBe(404);
  });

  test("POST /gallery missing url returns 422", async () => {
    const admin = await createAdmin();
    const res = await agent()
      .post("/api/v1/gallery")
      .set(authHeaders(admin))
      .send({ title: "no url" });
    expect(res.status).toBe(422);
  });

  test("POST /gallery with invalid category returns 422", async () => {
    const admin = await createAdmin();
    const res = await agent()
      .post("/api/v1/gallery")
      .set(authHeaders(admin))
      .send({ url: "https://example.com/img.jpg", category: "spaceship" });
    expect(res.status).toBe(422);
  });

  test("POST /gallery create returns 201; USER forbidden 403", async () => {
    const admin = await createAdmin();
    const created = await agent()
      .post("/api/v1/gallery")
      .set(authHeaders(admin))
      .send({ url: "https://example.com/img.jpg", title: uniq("G"), category: "dining" });
    expect(created.status).toBe(201);
    expect(created.body.data.url).toBe("https://example.com/img.jpg");

    const user = await createUser();
    const forbidden = await agent()
      .post("/api/v1/gallery")
      .set(authHeaders(user))
      .send({ url: "https://example.com/img.jpg" });
    expect(forbidden.status).toBe(403);
  });

  test("PUT invalid category returns 422", async () => {
    const admin = await createAdmin();
    const g = await createGalleryItem({ title: uniq("U") });
    const res = await agent()
      .put(`/api/v1/gallery/${g._id}`)
      .set(authHeaders(admin))
      .send({ category: "ghost" });
    expect(res.status).toBe(422);
  });

  test("DELETE /gallery/:id returns 200 without data and 404 on re-fetch", async () => {
    const admin = await createAdmin();
    const g = await createGalleryItem({ title: uniq("Del") });
    const del = await agent().delete(`/api/v1/gallery/${g._id}`).set(authHeaders(admin));
    expect(del.status).toBe(200);
    expect(del.body.data).toBeUndefined();
    const after = await agent().get(`/api/v1/gallery/${g._id}`);
    expect(after.status).toBe(404);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// FAQ
// ────────────────────────────────────────────────────────────────────────────
describe("FAQ — /api/v1/faqs", () => {
  beforeAll(async () => {
    const { booted } = await bootApp({ dbName: "lux_hotel_crud_content" });
    expect(booted).toBe(true);
  });
  beforeEach(async () => {
    await resetDB();
    await flushCache();
  });
  afterAll(async () => {
    await closeDB();
  });

  test("GET /faqs returns paginated array", async () => {
    await createFaq({ title: uniq("Q1") });
    await createFaq({ title: uniq("Q2") });
    await createFaq({ title: uniq("Q3") });
    const res = await agent().get("/api/v1/faqs");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(3);
    expect(res.body.pagination.total).toBe(3);
  });

  test("GET /faqs/all returns an array", async () => {
    await createFaq({ title: uniq("A1") });
    await createFaq({ title: uniq("A2") });
    const res = await agent().get("/api/v1/faqs/all");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("GET /faqs/:id returns a single object; unknown id → 404", async () => {
    const f = await createFaq({ title: uniq("S") });
    const ok = await agent().get(`/api/v1/faqs/${f._id}`);
    expect(ok.status).toBe(200);
    expect(ok.body.data._id.toString()).toBe(f._id.toString());

    const miss = await agent().get(`/api/v1/faqs/${randomObjectId()}`);
    expect(miss.status).toBe(404);
  });

  test("POST /faqs missing title/content returns 422", async () => {
    const admin = await createAdmin();
    const noTitle = await agent().post("/api/v1/faqs").set(authHeaders(admin)).send({ content: "ans" });
    expect(noTitle.status).toBe(422);
    const noContent = await agent().post("/api/v1/faqs").set(authHeaders(admin)).send({ title: "q" });
    expect(noContent.status).toBe(422);
  });

  test("POST /faqs without token → 401; with USER token → 403", async () => {
    const anon = await agent().post("/api/v1/faqs").send({ title: "q", content: "a" });
    expect(anon.status).toBe(401);
    const user = await createUser();
    const forbidden = await agent()
      .post("/api/v1/faqs")
      .set(authHeaders(user))
      .send({ title: "q", content: "a" });
    expect(forbidden.status).toBe(403);
  });

  test("POST/PUT/DELETE/404 flow", async () => {
    const admin = await createAdmin();
    const created = await agent()
      .post("/api/v1/faqs")
      .set(authHeaders(admin))
      .send({ title: "What time is check-out?", content: "At noon." });
    expect(created.status).toBe(201);
    const id = created.body.data._id;

    const updated = await agent()
      .put(`/api/v1/faqs/${id}`)
      .set(authHeaders(admin))
      .send({ content: "By 11 AM." });
    expect(updated.status).toBe(200);
    expect(updated.body.data.content).toBe("By 11 AM.");

    const del = await agent().delete(`/api/v1/faqs/${id}`).set(authHeaders(admin));
    expect(del.status).toBe(200);
    expect(del.body.data).toBeUndefined();

    const after = await agent().get(`/api/v1/faqs/${id}`);
    expect(after.status).toBe(404);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Attractions
// ────────────────────────────────────────────────────────────────────────────
describe("Attractions — /api/v1/attractions", () => {
  beforeAll(async () => {
    const { booted } = await bootApp({ dbName: "lux_hotel_crud_content" });
    expect(booted).toBe(true);
  });
  beforeEach(async () => {
    await resetDB();
    await flushCache();
  });
  afterAll(async () => {
    await closeDB();
  });

  test("GET /attractions returns paginated array", async () => {
    await createAttraction({ name: uniq("M1") });
    await createAttraction({ name: uniq("M2") });
    await createAttraction({ name: uniq("M3") });
    const res = await agent().get("/api/v1/attractions");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(3);
    expect(res.body.pagination.total).toBe(3);
  });

  test("GET /attractions/featured returns an array", async () => {
    await createAttraction({ name: uniq("F1") });
    await createAttraction({ name: uniq("F2") });
    const res = await agent().get("/api/v1/attractions/featured");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("GET /attractions/:id returns a single object; unknown id → 404", async () => {
    const a = await createAttraction({ name: uniq("S") });
    const ok = await agent().get(`/api/v1/attractions/${a._id}`);
    expect(ok.status).toBe(200);
    expect(ok.body.data._id.toString()).toBe(a._id.toString());

    const miss = await agent().get(`/api/v1/attractions/${randomObjectId()}`);
    expect(miss.status).toBe(404);
  });

  test("GET /attractions/nearby returns an array for a valid geo query", async () => {
    // Factory default coordinates: [72.8345, 18.922]
    await createAttraction({ name: uniq("Gate") });
    await createAttraction({ name: uniq("Beach"), category: "beach" });
    const res = await agent().get(
      "/api/v1/attractions/nearby?lat=18.92&lng=72.83&radiusKm=10"
    );
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);
  });

  test("GET /attractions/nearby with missing lat/lng returns 400", async () => {
    const noParams = await agent().get("/api/v1/attractions/nearby");
    expect(noParams.status).toBe(400);
    expect(noParams.body.success).toBe(false);

    const onlyLat = await agent().get("/api/v1/attractions/nearby?lat=18.92");
    expect(onlyLat.status).toBe(400);
  });

  test("GET /attractions/nearby with out-of-range lat returns 422 (validator)", async () => {
    const res = await agent().get(
      "/api/v1/attractions/nearby?lat=200&lng=72.83&radiusKm=10"
    );
    expect(res.status).toBe(422);
  });

  test("POST /attractions missing name returns 422", async () => {
    const admin = await createAdmin();
    const res = await agent()
      .post("/api/v1/attractions")
      .set(authHeaders(admin))
      .send({ description: "no name" });
    expect(res.status).toBe(422);
  });

  test("POST /attractions with invalid category returns 422", async () => {
    const admin = await createAdmin();
    const res = await agent()
      .post("/api/v1/attractions")
      .set(authHeaders(admin))
      .send({ name: uniq("X"), category: "crater" });
    expect(res.status).toBe(422);
  });

  test("POST /attractions without token → 401; USER token → 403", async () => {
    const anon = await agent().post("/api/v1/attractions").send({ name: "x" });
    expect(anon.status).toBe(401);
    const user = await createUser();
    const forbidden = await agent()
      .post("/api/v1/attractions")
      .set(authHeaders(user))
      .send({ name: "x" });
    expect(forbidden.status).toBe(403);
  });

  test("POST/PUT/DELETE lifecycle", async () => {
    const admin = await createAdmin();
    const created = await agent()
      .post("/api/v1/attractions")
      .set(authHeaders(admin))
      .send({
        name: "Marine Drive",
        category: "landmark",
        city: "Mumbai",
        location: { type: "Point", coordinates: [72.817, 18.943] },
      });
    expect(created.status).toBe(201);
    const id = created.body.data._id;

    const updated = await agent()
      .put(`/api/v1/attractions/${id}`)
      .set(authHeaders(admin))
      .send({ name: "Marine Drive Promenade" });
    expect(updated.status).toBe(200);
    expect(updated.body.data.name).toBe("Marine Drive Promenade");

    const del = await agent().delete(`/api/v1/attractions/${id}`).set(authHeaders(admin));
    expect(del.status).toBe(200);
    expect(del.body.data).toBeUndefined();

    const after = await agent().get(`/api/v1/attractions/${id}`);
    expect(after.status).toBe(404);
  });
});