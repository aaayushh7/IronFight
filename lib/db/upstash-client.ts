import { Redis } from "@upstash/redis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

function createRedisClient(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN. " +
        "Add them to .env or Vercel environment variables."
    );
  }

  return new Redis({ url, token });
}

export function getRedis(): Redis {
  if (globalForRedis.redis) return globalForRedis.redis;
  const client = createRedisClient();
  if (process.env.NODE_ENV !== "production") globalForRedis.redis = client;
  return client;
}

export function hasUpstashCredentials(): boolean {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  );
}
