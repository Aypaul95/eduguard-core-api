import express, { Application, Request, Response, NextFunction } from "express";
import routes from "./routes";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { StatusCodes } from "http-status-codes";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

dotenv.config();

/**
 * =========================================
 * App Initialization
 * =========================================
 */
const app: Application = express();

/**
 * =========================================
 * Types
 * =========================================
 */
interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

/**
 * =========================================
 * Security Middleware
 * =========================================
 */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

/**
 * =========================================
 * Body Parsers
 * =========================================
 */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(compression());

/**
 * =========================================
 * Logging Middleware
 * =========================================
 */
app.use(
  morgan("dev", {
    skip: (req) => req.url === "/health",
  })
);

/**
 * =========================================
 * Rate Limiting (SaaS Protection)
 * =========================================
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit per IP
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

/**
 * =========================================
 * Multi-School Middleware (Foundation)
 * =========================================
 * Extract school from API key, subdomain, or header
 */
app.use((req: Request, _res: Response, next: NextFunction) => {
  const schoolId =
    (req.headers["x-school-id"] as string) ||
    (req.headers["x-api-key"] as string)?.split("_")[0] ||
    null;

  (req as any).schoolId = schoolId;

  next();
});

/**
 * =========================================
 * Health Check Route
 * =========================================
 */
app.get("/health", (_req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    status: "ok",
    service: "EduGuard API",
    timestamp: new Date().toISOString(),
  });
});

/**
 * =========================================
 * Swagger Documentation
 * =========================================
 */
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);


/**
 * =========================================
 * API Routes Placeholder
 * (Clean Architecture Entry Points)
 * =========================================
 */

// Example structure (to be replaced later)
app.get("/api/v1", (_req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    message: "EduGuard API is running",
  });
});

app.use("/api/v1", routes);
/**
 * =========================================
 * 404 Handler
 * =========================================
 */
app.use((_req: Request, res: Response) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: "Route not found",
  });
});

/**
 * =========================================
 * Global Error Handler
 * =========================================
 */
app.use(
  (err: ApiError, _req: Request, res: Response, _next: NextFunction) => {
    console.error("🔥 FULL ERROR:", err);
    console.error("🔥 STACK:", err.stack);

    const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;

    res.status(statusCode).json({
      success: false,
      message: err.message || "Internal Server Error",
      code: err.code || "INTERNAL_ERROR",
      details: err.details || null,
    });
  }
);

export default app;