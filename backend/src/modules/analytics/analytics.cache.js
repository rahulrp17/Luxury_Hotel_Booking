const { deleteCacheByPattern } = require("../../config/redis");
const logger = require("../../config/logger");

/**
 * Bust every `/api/v1/analytics/*` cache entry. Called after a payment capture,
 * refund, or booking status change so the admin dashboard reflects the change
 * immediately instead of waiting out the 5-minute analytics cache TTL.
 *
 * Failure is deliberately non-fatal: stale data self-heals on the next cache
 * expiry, and this must never block the money path it is called from.
 */
const invalidateAnalyticsCache = async () => {
  try {
    await deleteCacheByPattern("analytics:*");
  } catch (err) {
    logger.warn(`Analytics cache invalidation failed: ${err.message}`);
  }
};

module.exports = { invalidateAnalyticsCache };
