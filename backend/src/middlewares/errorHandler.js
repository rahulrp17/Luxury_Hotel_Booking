const logger = require("../config/logger");
const ApiError = require("../utils/ApiError");

/**
 * Global error handler middleware
 */
// `_next` keeps the 4-arg arity Express uses to detect error middleware.
const errorHandler = (err, req, res, _next) => {
  let error = err;

  // If not an ApiError, convert to one
  if (!(error instanceof ApiError)) {
    // Mongoose validation error
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      error = ApiError.unprocessable("Validation failed", messages);
    }
    // Mongoose duplicate key error
    else if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      error = ApiError.conflict(`${field} already exists.`);
    }
    // Mongoose CastError (invalid ObjectId)
    else if (err.name === "CastError") {
      error = ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
    }
    // JWT errors
    else if (err.name === "JsonWebTokenError") {
      error = ApiError.unauthorized("Invalid token.");
    } else if (err.name === "TokenExpiredError") {
      error = ApiError.unauthorized("Token expired.");
    }
    // Body-parse errors (express.json)
    else if (err.type === "entity.too.large") {
      error = new ApiError(413, "Request body is too large.");
    } else if (err.type === "entity.parse.failed") {
      error = ApiError.badRequest("Invalid JSON in request body.");
    }
    // Multer errors
    else if (err.code === "LIMIT_FILE_SIZE") {
      error = ApiError.badRequest("File size exceeds the allowed limit.");
    } else if (err.code === "LIMIT_FILE_COUNT") {
      error = ApiError.badRequest("Too many files uploaded.");
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      error = ApiError.badRequest("Unexpected file field.");
    }
    // Custom file-filter rejection (see config/cloudinary.js imageFileFilter): a
    // disallowed client file type is a 400, not a 500.
    else if (err.code === "UNSUPPORTED_FILE_TYPE") {
      error = ApiError.badRequest(err.message || "Unsupported file type.");
    }
    // Default internal server error
    else {
      error = ApiError.internal(
        process.env.NODE_ENV === "production"
          ? "Something went wrong on our end."
          : err.message
      );
    }
  }

  // Log error (only log 5xx server errors)
  if (error.statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} → ${error.statusCode}: ${err.message}`, {
      stack: err.stack,
      body: req.body,
      params: req.params,
      query: req.query,
      user: req.user?._id,
    });
  } else {
    logger.warn(`${req.method} ${req.originalUrl} → ${error.statusCode}: ${error.message}`);
  }

  res.status(error.statusCode).json({
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors?.length ? error.errors : undefined,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    timestamp: new Date().toISOString(),
  });
};

/**
 * 404 Not Found handler
 */
const notFound = (req, res, next) => {
  next(ApiError.notFound(`Route ${req.originalUrl} not found`));
};

module.exports = { errorHandler, notFound };
