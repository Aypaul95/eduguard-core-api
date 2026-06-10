import { Response, NextFunction } from "express";
import { UserRole, PrismaClient, Prisma } from "@prisma/client";
import { AuthenticatedRequest } from "./auth.middleware";
import { AppError } from "../shared/errors/app.error";
import { logger } from "../shared/utils/logger";

const prisma = new PrismaClient();

/**
 * Strongly typed Prisma result
 */
type UserWithRoles = Prisma.UserGetPayload<{
  select: {
    id: true;
    schoolId: true;
    roles: {
      include: {
        role: true;
      };
    };
  };
}>;

/**
 * RBAC Middleware Factory (Schema-driven)
 */
export const requireRole = (allowedRoles: UserRole[]) => {
  return async (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = req.user;

      if (!user) {
        throw new AppError("Unauthorized: User not authenticated", 401);
      }

      /**
       * Fetch user roles from DB (source of truth)
       */
      const userWithRoles: UserWithRoles | null =
        await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            schoolId: true,
            roles: {
              include: {
                role: true,
              },
            },
          },
        });

      if (!userWithRoles) {
        throw new AppError("Unauthorized: User not found", 401);
      }

      /**
       * Extract role names safely
       */
      const userRoles: UserRole[] = userWithRoles.roles.map(
        (r) => r.role.name as UserRole
      );

      /**
       * Check RBAC match
       */
      const hasPermission = userRoles.some((role) =>
        allowedRoles.includes(role)
      );

      if (!hasPermission) {
        logger.warn("RBAC access denied", {
          userId: user.id,
          schoolId: user.schoolId,
          userRoles,
          requiredRoles: allowedRoles,
        });

        throw new AppError(
          "Forbidden: You do not have permission to access this resource",
          403
        );
      }

      logger.info("RBAC access granted", {
        userId: user.id,
        schoolId: user.schoolId,
        userRoles,
      });

      next();
    } catch (error) {
      next(error);
    }
  };
};