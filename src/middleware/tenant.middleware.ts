import { Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "./auth.middleware";
import { AppError } from "../shared/errors/app.error";
import { logger } from "../shared/utils/logger";

/**
 * Prisma client (ideally use singleton in real production apps)
 */
const prisma = new PrismaClient();

/**
 * Extend request with school context
 */
export interface SchoolRequest extends AuthenticatedRequest {
  school?: {
    id: string;
    name: string;
    isActive: boolean;
    plan?: string;
  };
}

/**
 * school Middleware
 *
 * Responsibilities:
 * - Extract schoolId from authenticated user
 * - Validate school exists
 * - Ensure school is active
 * - Inject school context into request
 */
export const schoolMiddleware = async (
  req: SchoolRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;

    /**
     * Ensure user is authenticated first
     */
    if (!user) {
      throw new AppError("Unauthorized: User not authenticated", 401);
    }

    const schoolId = user.schoolId;

    if (!schoolId) {
      throw new AppError("Forbidden: school ID missing", 403);
    }

    /**
     * Fetch school from database
     */
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: {
        id: true,
        name: true,
        isActive: true,
        plan: true,
      },
    });

    if (!school) {
      throw new AppError("school not found", 404);
    }

    /**
     * Ensure school is active
     */
    if (!school.isActive) {
      throw new AppError("school account is inactive", 403);
    }

    /**
     * Attach school context to request
     */
    req.school = {
      id: school.id,
      name: school.name,
      isActive: school.isActive,
      plan: school.plan,
    };

    logger.info("school context loaded", {
      schoolId: school.id,
      schoolName: school.name,
      userId: user.id,
    });

    next();
  } catch (error: any) {
    logger.error("school middleware error", {
      message: error.message,
      stack: error.stack,
    });

    next(error);
  }
};