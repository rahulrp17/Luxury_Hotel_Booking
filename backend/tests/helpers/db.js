/* eslint-disable no-console */
/**
 * Shared database bootstrap for integration/API suites.
 *
 * Connection order of preference:
 *   1. `MONGODB_TEST_URI` (explicit override, e.g. CI)
 *   2. `mongodb-memory-server` (hermetic, preferred) — opt into an immediate
 *      hermetic boot via `MONGODB_USE_MEMORY=true`. Left OFF by default because
 *      the memory binary download may be slow/locked on some hosts.
 *   3. local `mongodb://localhost:27017/luxury_hotel_booking_test`
 *
 * A monolithic `bootTestDB()` connects once and supplies a wipe helper so each
 * suite can isolate itself. It returns `false` if no database could be reached
 * so suites can `describe.skip` gracefully rather than hard-fail on a host with
 * no Mongo at all.
 */
const mongoose = require("mongoose");

let memoryServer = null;
let connected = false;

/** Attempt a hermetic in-memory server. Returns true when connected. */
async function attemptMemoryServer() {
  try {
    const { MongoMemoryServer } = require("mongodb-memory-server");
    memoryServer = await MongoMemoryServer.create({
      instance: { storageEngine: "wiredTiger" },
    });
    const uri = memoryServer.getUri("luxury_hotel_test");
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
    return true;
  } catch (err) {
    console.warn(`mongodb-memory-server unavailable (${err.message}); falling back to local/test DB.`);
    return false;
  }
}

/**
 * Connect to a test database. Returns true on success.
 */
async function bootTestDB() {
  const explicit = process.env.MONGODB_TEST_URI;
  const fallback = explicit || process.env.MONGODB_URI
    || "mongodb://localhost:27017/luxury_hotel_booking_test";

  try {
    if (explicit) {
      await mongoose.connect(explicit, { serverSelectionTimeoutMS: 4000 });
      connected = true;
      return true;
    }
    if (process.env.MONGODB_USE_MEMORY === "true" && (await attemptMemoryServer())) {
      connected = true;
      return true;
    }
    await mongoose.connect(fallback, { serverSelectionTimeoutMS: 2500 });
    connected = true;
    return true;
  } catch (err) {
    console.warn(`No test database reachable: ${err.message}`);
    return false;
  }
}

/**
 * Wipe every collection so parallel suites start from a clean slate.
 */
async function cleanAll() {
  if (!mongoose.connection.db) return;
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((c) => c.deleteMany({})));
}

/**
 * Disconnect (and stop the in-memory server if it was used).
 */
async function shutdown() {
  if (memoryServer) {
    await mongoose.disconnect().catch(() => {});
    await memoryServer.stop();
    memoryServer = null;
  } else if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect().catch(() => {});
  }
  connected = false;
}

/** Whether a DB is currently connected. */
const isConnected = () => connected;

/** Convenience: `it` if db connected else `it.skip`. */
function itDb(name, fn) {
  return connected ? it(name, fn) : it.skip(name, fn);
}

module.exports = {
  bootTestDB,
  cleanAll,
  shutdown,
  isConnected,
  itDb,
  getUri: () => memoryServer?.getUri(),
};