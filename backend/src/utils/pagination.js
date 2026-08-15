const { PAGINATION } = require("../config/constants");

/**
 * Parse pagination parameters from request query
 */
const parsePagination = (query) => {
  const parsedPage = parseInt(query.page, 10);
  const page = Math.max(1, Number.isNaN(parsedPage) ? PAGINATION.DEFAULT_PAGE : parsedPage);

  // Note: use Number.isNaN, NOT `||`, so a falsy-but-valid value like 0 is treated
  // as a real number (0 → clamped to 1) rather than silently falling back to the
  // default limit.
  const parsedLimit = parseInt(query.limit, 10);
  const baseLimit = Number.isNaN(parsedLimit)
    ? PAGINATION.DEFAULT_LIMIT
    : parsedLimit;
  const limit = Math.max(1, Math.min(baseLimit, PAGINATION.MAX_LIMIT));

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Build pagination metadata.
 * Clamps the requested page to the valid range so an out-of-range `?page=`
 * returns the last page instead of a huge skip / empty array, and guards
 * against division-by-zero so `totalPages` is never `NaN`.
 */
const buildPagination = (page, limit, total) => {
  const safeLimit = Math.max(1, limit);
  const totalPages = Math.ceil(total / safeLimit);
  const safePage = Math.min(page, Math.max(1, totalPages));
  return {
    page: safePage,
    limit: safeLimit,
    total,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
  };
};

/**
 * Build sort object from query string
 * e.g., "price" → { price: 1 }, "-price" → { price: -1 }
 */
const buildSort = (sortQuery, allowedFields = [], defaultSort = { createdAt: -1 }) => {
  if (!sortQuery) return defaultSort;

  const sortObj = {};
  const fields = sortQuery.split(",");

  for (const field of fields) {
    const isDesc = field.startsWith("-");
    const fieldName = isDesc ? field.slice(1) : field;

    if (allowedFields.length === 0 || allowedFields.includes(fieldName)) {
      sortObj[fieldName] = isDesc ? -1 : 1;
    }
  }

  return Object.keys(sortObj).length > 0 ? sortObj : defaultSort;
};

module.exports = { parsePagination, buildPagination, buildSort };
