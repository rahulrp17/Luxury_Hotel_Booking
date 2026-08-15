/**
 * Vercel Serverless entry point.
 *
 * Vercel imports this module as the request handler instead of running
 * `server.js`, so the existing Express `app` is exported directly — the app
 * never calls `app.listen()` here (that path lives in `server.js` and is kept
 * for Render / `npm start`).
 *
 * All routes, middleware, auth, Redis caching, MongoDB, Razorpay, Cloudinary
 * and SMTP behaviour are preserved because the exact same `src/app` instance
 * is reused.
 *
 * MongoDB is connected lazily and the promise is cached across warm
 * invocations. `/health` still responds even if the DB is unavailable because
 * it does not touch the database; routes that need MongoDB surface their
 * errors through the existing error handler.
 */
require("dotenv").config();
const { validateEnv } = require("../src/config/env");
const app = require("../src/app");
const connectDB = require("../src/config/db");
const logger = require("../src/config/logger");

validateEnv();

let connectionPromise = null;

const connect = () => {
  if (!connectionPromise) {
    connectionPromise = connectDB().catch((err) => {
      connectionPromise = null; // allow a later request to retry
      throw err;
    });
  }
  return connectionPromise;
};

module.exports = async (req, res) => {
  try {
    await connect();
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`);
  }
  return app(req, res);
};
