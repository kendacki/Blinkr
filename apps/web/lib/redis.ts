import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis: Redis | undefined };

export function getRedis(): Redis {
  if (globalForRedis.redis) {
    return globalForRedis.redis;
  }
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error("REDIS_URL is not set");
  }
  const client = new Redis(url, { maxRetriesPerRequest: 3 });
  if (process.env.NODE_ENV !== "production") {
    globalForRedis.redis = client;
  }
  return client;
}
