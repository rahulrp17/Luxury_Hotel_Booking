require("dotenv").config();
const { validateEnv } = require("./src/config/env");
validateEnv(); // Fail fast in production if required env vars are missing
const app = require("./src/app");
const connectDB = require("./src/config/db");
const logger = require("./src/config/logger");

const PORT = process.env.PORT || 5000;

// Connect to Database then start server
connectDB()
  .then(() => {
    // Start background workers (Bull processors + node-cron jobs) once the DB
    // connection is established. See src/jobs/worker.js.
    require("./src/jobs/worker");

    const server = app.listen(PORT, () => {
      logger.info(
        `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
      );
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err) => {
      logger.error(`Unhandled Rejection: ${err.message}`);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (err) => {
      logger.error(`Uncaught Exception: ${err.message}`);
      process.exit(1);
    });

    // Graceful shutdown on SIGTERM
    process.on("SIGTERM", () => {
      logger.info("SIGTERM received. Shutting down gracefully...");
      server.close(() => {
        logger.info("Process terminated.");
        process.exit(0);
      });
    });
  })
  .catch((err) => {
    logger.error(`Failed to connect to database: ${err.message}`);
    process.exit(1);
  });
