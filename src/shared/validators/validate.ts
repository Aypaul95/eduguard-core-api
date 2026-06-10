import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors";

/**
 * Generic request validator middleware
 */

export const validate =
  (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw new AppError(
        "Validation failed",
        400,
        "VALIDATION_ERROR",
        result.error.flatten()
      );
    }

    req.body = result.data;
    next();
  };