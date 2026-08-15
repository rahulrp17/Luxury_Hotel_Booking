/* eslint-disable no-console */
/**
 * Infra smoke test — proves the shared harness (superAgent + db helper +
 * factories) connects to a live test DB and serves API responses. If this fails,
 * nothing else in the suite will run.
 */
const mongoose = require("mongoose");
const { app, bootApp, resetDB, closeDB, agent } = require("../helpers/app");
const { createUser, authHeaders } = require("../helpers/factories");

describe("Infrastructure smoke test", () => {
  beforeAll(async () => {
    const { booted } = await bootApp();
    expect(booted).toBe(true);
  });

  beforeEach(async () => {
    await resetDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  test("health endpoint returns 200", async () => {
    const res = await agent().get("/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("database layer can write and read a user", async () => {
    const user = await createUser();
    expect(user._id).toBeDefined();
    expect(user.email).toMatch(/@test\.dev$/);
    const found = await mongoose.model("User").findById(user._id);
    expect(found).toBeTruthy();
  });

  test("auth token helper produces a working bearer header", async () => {
    const user = await createUser();
    const headers = authHeaders(user);
    expect(headers.Authorization).toMatch(/^Bearer .+\./);
  });

  test("unknown route returns the error envelope with 404", async () => {
    const res = await agent().get("/api/v1/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty("message");
  });
});