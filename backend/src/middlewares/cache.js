const crypto = require("crypto");
const { getCache, setCache } = require("../config/redis");
const logger = require("../config/logger");

/**
 * Deterministic JSON stringify (keys sorted recursively) so logically equal
 * objects map to the same cache key regardless of property insertion order.
 */
const stableStringify = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value !== "object") return String(value);
  if (Array.isArray(value)) return JSON.stringify(value.map(stableStringify));
  return JSON.stringify(
    Object.keys(value)
      .sort()
      .map((k) => [k, stableStringify(value[k])])
  );
};

/**
 * Build a bounded cache key from a query string. Short/normalized keys are used
 * as-is; oversized ones are hashed so distinct-but-large keys don't accumulate
 * unboundedly in Redis.
 */
const queryCacheKey = (prefix, query) => {
  const s = stableStringify(query);
  return s.length > 160
    ? `${prefix}:${crypto.createHash("sha1").update(s).digest("hex")}`
    : `${prefix}:${s}`;
};

/**
 * Redis cache middleware factory
 * @param {string|Function} keyFn - Cache key string or function(req) => string
 * @param {number} ttl - TTL in seconds
 */
const cacheMiddleware = (keyFn, ttl = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    const cacheKey = typeof keyFn === "function" ? keyFn(req) : keyFn;

    try {
      const cached = await getCache(cacheKey);

      if (cached) {
        logger.debug(`Cache HIT: ${cacheKey}`);
        // Re-stamp the timestamp so hit responses read as fresh, and keep
        // cache metadata out of the body so hit/miss envelopes are identical.
        res.set("X-Cache", "HIT");
        return res.status(200).json({ ...cached, timestamp: new Date().toISOString() });
      }

      logger.debug(`Cache MISS: ${cacheKey}`);

      // Intercept res.json to cache the response
      const originalJson = res.json.bind(res);
      res.json = async (data) => {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300 && data?.success) {
          await setCache(cacheKey, data, ttl);
        }
        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.warn(`Cache middleware error: ${error.message}`);
      next(); // Fail gracefully
    }
  };
};

module.exports = { cacheMiddleware, queryCacheKey };
