/* eslint-disable no-console */
/**
 * Supertest app harness.
 *
 * `bootApp({ dbName })` connects the test database and returns the Express app
 * (from `src/app.js`, which never starts a listening server nor loads Bull/cron —
 * those live only in `server.js`). Because Jest may run several test files in
 * parallel, EACH suite should pass a UNIQUE `dbName` so suites wipe only their
 * own database and never clobber each other. Call `resetDB()` in `beforeEach`
 * and `closeDB()` in `afterAll`.
 */
const request = require("supertest");
const app = require("../../src/app");
const { bootTestDB, cleanAll, shutdown, isConnected, itDb } = require("./db");

let booted = false;

/** Connect the test DB once per test file. Returns `{ app, booted }`. */
async function bootApp({ dbName } = {}) {
  if (dbName) {
    process.env.MONGODB_TEST_URI = `mongodb://localhost:27017/${dbName}`;
  }
  if (!booted) booted = await bootTestDB();
  return { app, booted };
}

/** Wipe all collections for a clean slate (call in beforeEach). */
async function resetDB() {
  if (booted) await cleanAll();
}

/** Disconnect + stop in-memory server (call in afterAll). */
async function closeDB() {
  await shutdown();
  booted = false;
}

/** A supertest request bound to the app. */
const agent = () => request(app);

module.exports = {
  app,
  bootApp,
  resetDB,
  closeDB,
  isConnected,
  itDb,
  agent,
};