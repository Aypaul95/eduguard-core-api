import { Request, Response, NextFunction } from "express";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ZodError } from "zod";
import { AppError } from "../shared/errors/app.error";
import { logger } from "../shared/utils/logger";

/**
 * Standard API error response format
 */
interface ErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  errors?: any;
  timestamp: string;
  path?: string;
}

/**
 * Central Error Handling Middleware
 */
export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let errors: any = undefined;

  /**
   * 🔴 Custom Application Error
   */
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  /**
   * 🔵 Zod Validation Error
   */
  else if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation Error";
    errors = err.flatten().fieldErrors;
  }

  /**
   * 🟡 Prisma Known Errors
   */
  else if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        statusCode = 409;
        message = "Duplicate field value violates unique constraint";
        break;

      case "P2025":
        statusCode = 404;
        message = "Record not found";
        break;

      case "P2003":
        statusCode = 400;
        message = "Foreign key constraint failed";
        break;

      default:
        statusCode = 400;
        message = "Database error occurred";
    }
  }

  /**
   * 🔐 JWT Errors (jsonwebtoken)
   */
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  /**
   * 🧠 Log full error internally (NEVER expose stack in production response)
   */
  logger.error("Unhandled Error", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  /**
   * Build response
   */
  const response: ErrorResponse = {
    success: false,
    message,
    statusCode,
    errors,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  };

  return res.status(statusCode).json(response);
};