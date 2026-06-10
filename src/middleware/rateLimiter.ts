import { Response, NextFunction } from "express";
import { createClient } from "redis";
import { env } from "../config/env";
import { AppError } from "../shared/errors/app.error";
import { logger } from "../shared/utils/logger";
import { AuthenticatedRequest } from "./auth.middleware";

/**
 * Redis client (singleton)
 */
const redisClient = createClient({
  url: env.REDIS_URL,
  ...(env.REDIS_PASSWORD ? { password: env.REDIS_PASSWORD } : {}),
});

redisClient.on("error", (err) => {
  logger.error("Redis Client Error", { error: err.message });
});

/**
 * Connect Redis once
 */
(async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      logger.info("Redis connected for rate limiting");
    }
  } catch (error: any) {
    logger.error("Redis connection failed", { error: error.message });
  }
})();

/**
 * Rate limit configuration
 */
interface RateLimitOptions {
  windowSeconds: number;
  maxRequests: number;
  keyPrefix?: string;
}

/**
 * Default rate limit settings
 */
const defaultOptions: RateLimitOptions = {
  windowSeconds: 60,
  maxRequests: 100,
  keyPrefix: "eduguard_rate_limit",
};

/**
 * Rate Limiter Middleware Factory
 */
export const rateLimiter = (options?: Partial<RateLimitOptions>) => {
  const config = { ...defaultOptions, ...options };

  return async (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      /**
       * Identify requester (multi-school safe)
       * Priority:
       * 1. Logged-in user
       * 2. School (school isolation)
       * 3. IP fallback
       */
      const userId = req.user?.id;
      const schoolId = req.user?.schoolId;
      const ip = req.ip;

      const identifier =
        userId
          ? `user:${userId}`
          : schoolId
          ? `school:${schoolId}`
          : `ip:${ip}`;

      const key = `${config.keyPrefix}:${identifier}`;

      /**
       * Use Redis atomic increment for safety
       */
      const current = await redisClient.incr(key);

      /**
       * First request → set expiry window
       */
      if (current === 1) {
        await redisClient.expire(key, config.windowSeconds);
      }

      /**
       * Log first request initialization
       */
      if (current === 1) {
        logger.info("Rate limit window started", { key, identifier });
      }

      /**
       * Block if limit exceeded
       */
      if (current > config.maxRequests) {
        logger.warn("Rate limit exceeded", {
          key,
          identifier,
          requestCount: current,
        });

        throw new AppError(
          "Too many requests. Please try again later.",
          429
        );
      }

      return next();
    } catch (error) {
      next(error);
    }
  };
};