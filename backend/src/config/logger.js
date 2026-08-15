const winston = require("winston");
const path = require("path");
const fs = require("fs");

const { combine, timestamp, printf, colorize, align, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = () => {
  const env = process.env.NODE_ENV || "development";
  const isDevelopment = env === "development";
  return isDevelopment ? "debug" : "warn";
};

const logDir = path.join(process.cwd(), "logs");

// File transports are only used when the filesystem is writable (Render, local
// dev). Serverless platforms (Vercel) mount a read-only root except `/tmp`, so
// attempting to create `logs/` at import time would crash the function before
// the first request. In that case we fall back to console-only logging.
const fileTransports = [];
try {
  fs.mkdirSync(logDir, { recursive: true });
  fileTransports.push(
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
} catch (err) {
  // Read-only filesystem (e.g. Vercel serverless) — log to console only.
}

const exceptionHandlers = fileTransports.length
  ? [
      new winston.transports.File({
        filename: path.join(logDir, "exceptions.log"),
      }),
    ]
  : [];
const rejectionHandlers = fileTransports.length
  ? [
      new winston.transports.File({
        filename: path.join(logDir, "rejections.log"),
      }),
    ]
  : [];

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || level(),
  levels,
  format: combine(
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat
  ),
  transports: [
    // Console transport (development)
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        align(),
        logFormat
      ),
    }),
    ...fileTransports,
  ],
  exceptionHandlers,
  rejectionHandlers,
});

module.exports = logger;
