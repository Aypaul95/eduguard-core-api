import pino, { Logger } from "pino";
import { env } from "./env";

/**
 * Log levels supported by Pino
 */
export type LogLevel =
  | "fatal"
  | "error"
  | "warn"
  | "info"
  | "debug"
  | "trace";

/**
 * Redaction fields (security-sensitive data)
 */
const redactPaths = [
  "password",
  "token",
  "authorization",
  "jwt",
  "accessToken",
  "refreshToken",
  "req.headers.authorization",
  "req.body.password",
];

/**
 * Base logger configuration
 */
const createLogger = (): Logger => {
  const isDev = env.NODE_ENV === "development";

  return pino({
    level: env.LOG_LEVEL || "info",

    /**
     * Pretty print only in development
     */
    ...(isDev
      ? {
          transport: {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "SYS:standard",
              ignore: "pid,hostname",
            },
          },
        }
      : {}),

    /**
     * Automatically redact sensitive fields
     */
    redact: {
      paths: redactPaths,
      remove: true,
    },

    /**
     * Base metadata for every log
     */
    base: {
      service: "EduGuard API",
      env: env.NODE_ENV,
    },

    /**
     * Timestamp format
     */
    timestamp: pino.stdTimeFunctions.isoTime,
  });
};

/**
 * Singleton Logger Instance
 */
export const logger: Logger = createLogger();

/**
 * Safe logging wrapper for async operations
 */
export const logAsyncError = (
  error: unknown,
  context?: Record<string, unknown>
): void => {
  if (error instanceof Error) {
    logger.error(
      {
        message: error.message,
        stack: error.stack,
        ...context,
      },
      "Async Error Occurred"
    );
  } else {
    logger.error(
      {
        error,
        ...context,
      },
      "Unknown Async Error Occurred"
    );
  }
};

/**
 * Express request logger helper
 */
export const requestLogger = {
  request: (req: any) => {
    logger.info(
      {
        method: req.method,
        url: req.url,
        ip: req.ip,
        schoolId: req.headers["x-school-id"],
      },
      "Incoming Request"
    );
  },

  response: (req: any, res: any, responseTime: number) => {
    logger.info(
      {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        schoolId: req.headers["x-school-id"],
      },
      "Request Completed"
    );
  },
};

/**
 * Performance logger (for slow queries, heavy operations)
 */
export const performanceLogger = {
  start: (label: string) => {
    const start = process.hrtime();

    return {
      end: () => {
        const diff = process.hrtime(start);
        const time = diff[0] * 1000 + diff[1] / 1e6;

        logger.info(
          {
            label,
            duration: `${time.toFixed(2)}ms`,
          },
          "Performance Metric"
        );
      },
    };
  },
};