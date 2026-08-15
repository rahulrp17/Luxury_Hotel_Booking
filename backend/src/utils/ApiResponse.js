/**
 * Standardized API Response Wrapper
 */
class ApiResponse {
  constructor(statusCode, message, data = null, pagination = null) {
    this.success = statusCode >= 200 && statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    if (data !== null) this.data = data;
    if (pagination !== null) this.pagination = pagination;
    this.timestamp = new Date().toISOString();
  }

  static success(res, message = "Success", data = null, statusCode = 200) {
    return res.status(statusCode).json(new ApiResponse(statusCode, message, data));
  }

  static created(res, message = "Created successfully", data = null) {
    return res.status(201).json(new ApiResponse(201, message, data));
  }

  static paginated(res, message = "Data fetched successfully", data, pagination) {
    return res.status(200).json(new ApiResponse(200, message, data, pagination));
  }

  static noContent(res) {
    return res.status(204).send();
  }
}

module.exports = ApiResponse;
