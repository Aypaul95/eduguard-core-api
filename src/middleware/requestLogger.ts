import { Request, Response, NextFunction } from "express";
import { logger } from "../shared/utils/logger";
import { AuthenticatedRequest } from "./auth.middleware";

/**
 * Extended request type with timing support
 */
export interface RequestWithTiming extends AuthenticatedRequest {
  startTime?: number;
}

/**
 * Request Logger Middleware
 *
 * Logs every incoming HTTP request with:
 * - method
 * - URL
 * - schoolId (if available)
 * - userId (if authenticated)
 * - IP address
 * - user-agent
 * - response time
 * - status code
 */
export const requestLogger = (
  req: RequestWithTiming,
  res: Response,
  next: NextFunction
): void => {
  try {
    /**
     * Mark request start time
     */
    req.startTime = Date.now();

    const { method, originalUrl } = req;

    const userId = req.user?.id;
    const schoolId = req.user?.schoolId;

    const ip = req.ip;
    const userAgent = req.headers["user-agent"] || "unknown";

    logger.info("Incoming Request", {
      method,
      url: originalUrl,
      userId,
      schoolId,
      ip,
      userAgent,
    });

    /**
     * Capture response finish event
     */
    res.on("finish", () => {
      const duration = req.startTime
        ? Date.now() - req.startTime
        : undefined;

      logger.info("Request Completed", {
        method,
        url: originalUrl,
        statusCode: res.statusCode,
        duration: duration ? `${duration}ms` : undefined,
        userId,
        schoolId,
        ip,
      });
    });

    next();
  } catch (error: any) {
    /**
     * Request logging MUST NEVER block request flow
     */
    logger.error("Request logger error", {
      message: error.message,
      stack: error.stack,
    });

    next();
  }
};