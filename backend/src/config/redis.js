const Redis = require("ioredis");
const logger = require("./logger");

let redisClient = null;

const getRedisClient = () => {
  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError(err) {
        const targetError = "READONLY";
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
    });

    redisClient.on("connect", () => {
      logger.info("🔴 Redis client connected.");
    });

    redisClient.on("error", (err) => {
      logger.error(`Redis error: ${err.message}`);
    });

    redisClient.on("close", () => {
      logger.warn("Redis connection closed.");
    });

    redisClient.on("reconnecting", () => {
      logger.info("Redis reconnecting...");
    });
  }

  return redisClient;
};

// ─── Helper Methods ───────────────────────────────────────────────────────

const setCache = async (key, value, ttlSeconds = 300) => {
  try {
    const client = getRedisClient();
    await client.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (error) {
    logger.warn(`Redis set error: ${error.message}`);
  }
};

const getCache = async (key) => {
  try {
    const client = getRedisClient();
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.warn(`Redis get error: ${error.message}`);
    return null;
  }
};

const deleteCache = async (key) => {
  try {
    const client = getRedisClient();
    await client.del(key);
  } catch (error) {
    logger.warn(`Redis delete error: ${error.message}`);
  }
};

const deleteCacheByPattern = async (pattern) => {
  try {
    const client = getRedisClient();
    // Iterate the keyspace with SCAN (cursor-based) instead of the blocking
    // `keys()` call so cache invalidation never blocks the event loop, even on
    // a large Redis key set. Batches are deleted as they stream back.
    let cursor = "0";
    let total = 0;
    do {
      const [nextCursor, keys] = await client.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        200
      );
      cursor = nextCursor;
      if (keys.length > 0) {
        total += keys.length;
        await client.del(...keys);
      }
    } while (cursor !== "0");

    if (total > 0) {
      logger.debug(`Cache pattern delete: cleared ${total} key(s) for ${pattern}`);
    }
  } catch (error) {
    logger.warn(`Redis pattern delete error: ${error.message}`);
  }
};

module.exports = {
  getRedisClient,
  setCache,
  getCache,
  deleteCache,
  deleteCacheByPattern,
};
