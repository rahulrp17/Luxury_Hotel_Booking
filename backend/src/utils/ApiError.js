/**
 * Custom API Error Class
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = [], stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    this.timestamp = new Date().toISOString();

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // ─── Static Factory Methods ──────────────────────────────────────────────

  static badRequest(message = "Bad request", errors = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = "Unauthorized access") {
    return new ApiError(401, message);
  }

  static forbidden(message = "Access forbidden") {
    return new ApiError(403, message);
  }

  static notFound(message = "Resource not found") {
    return new ApiError(404, message);
  }

  static conflict(message = "Resource already exists") {
    return new ApiError(409, message);
  }

  static unprocessable(message = "Validation failed", errors = []) {
    return new ApiError(422, message, errors);
  }

  static tooManyRequests(message = "Too many requests. Please try again later.") {
    return new ApiError(429, message);
  }

  static internal(message = "Internal server error") {
    return new ApiError(500, message);
  }

  static serviceUnavailable(message = "Service temporarily unavailable") {
    return new ApiError(503, message);
  }
}

module.exports = ApiError;
