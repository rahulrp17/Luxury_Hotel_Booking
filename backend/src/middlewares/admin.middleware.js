const ApiError = require("../utils/ApiError");
const { USER_ROLES } = require("../config/constants");

/**
 * Role-based access control middleware factory
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized("Authentication required.");
    }

    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `Access denied. Required roles: ${roles.join(", ")}. Your role: ${req.user.role}`
      );
    }

    next();
  };
};

/**
 * Admin only middleware
 */
const adminOnly = authorize(USER_ROLES.ADMIN);

/**
 * Admin or Hotel Manager
 */
const managerOrAdmin = authorize(USER_ROLES.ADMIN, USER_ROLES.HOTEL_MANAGER);

module.exports = { authorize, adminOnly, managerOrAdmin };
