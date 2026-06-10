import { createClient, RedisClientType } from "redis";
import { env } from "./env";

/**
 * Redis Client Type
 */
export type RedisClient = RedisClientType;

/**
 * Singleton Redis Client
 */
let redisClient: RedisClient | null = null;

/**
 * Create Redis Client
 */
const createRedisConnection = (): RedisClientType => {
  const client = createClient({
    url: env.REDIS_URL,
    ...(env.REDIS_PASSWORD
      ? { password: env.REDIS_PASSWORD }
      : {}),
  });

  client.on("connect", () => {
    console.log("🔄 Connecting to Redis...");
  });

  client.on("ready", () => {
    console.log("✅ Redis connection established");
  });

  client.on("reconnecting", () => {
    console.warn("♻️ Redis reconnecting...");
  });

  client.on("error", (error: Error) => {
    console.error("❌ Redis Error:", error.message);
  });

  client.on("end", () => {
    console.warn("🔌 Redis connection closed");
  });

  return client;
};

/**
 * Get Redis Client Instance
 */
export const getRedisClient = (): RedisClient => {
  if (!redisClient) {
    redisClient = createRedisConnection();
  }

  return redisClient;
};

/**
 * Connect Redis
 */
export const connectRedis = async (): Promise<void> => {
  try {
    const client = getRedisClient();

    if (!client.isOpen) {
      await client.connect();
    }

    await client.ping();

    console.log("🚀 Redis is ready");
  } catch (error) {
    console.error("❌ Failed to connect to Redis");

    if (error instanceof Error) {
      console.error(error.message);
    }

    process.exit(1);
  }
};

/**
 * Disconnect Redis
 */
export const disconnectRedis = async (): Promise<void> => {
  try {
    const client = getRedisClient();

    if (client.isOpen) {
      await client.quit();
    }

    console.log("✅ Redis disconnected");
  } catch (error) {
    console.error("❌ Failed to disconnect Redis");

    if (error instanceof Error) {
      console.error(error.message);
    }
  }
};

/**
 * Redis Health Check
 */
export const checkRedisHealth = async (): Promise<boolean> => {
  try {
    const client = getRedisClient();

    const response = await client.ping();

    return response === "PONG";
  } catch (error) {
    console.error("❌ Redis health check failed");

    if (error instanceof Error) {
      console.error(error.message);
    }

    return false;
  }
};

/**
 * Graceful Shutdown
 */
process.on("SIGINT", async () => {
  await disconnectRedis();
});

process.on("SIGTERM", async () => {
  await disconnectRedis();
});