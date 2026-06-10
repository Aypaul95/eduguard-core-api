import { Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "./auth.middleware";
import { logger } from "../shared/utils/logger";

/**
 * Prisma Client
 */
const prisma = new PrismaClient();

/**
 * Audit Actions
 */
export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "VIEW"
  | "EXPORT"
  | "PAYMENT"
  | "OTHER";

/**
 * Audit Middleware Factory
 */
export const auditMiddleware = (
  action: AuditAction,
  entity: string
) => {
  return async (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = req.user;

      /**
       * Cannot create audit log without schoolId
       */
      if (!user?.schoolId) {
        return next();
      }

      const entityId =
        typeof req.params?.id === "string"
          ? req.params.id
          : undefined;

      const ipAddress =
        req.ip ||
        req.socket.remoteAddress ||
        undefined;

      const userAgent =
        typeof req.headers["user-agent"] === "string"
          ? req.headers["user-agent"]
          : undefined;

      await prisma.auditLog.create({
        data: {
          schoolId: user.schoolId,
          userId: user.id,
          action,
          entity,
          entityId: entityId ?? null,
          metadata: {
            body: req.body,
            params: req.params,
            query: req.query,
          },
          ipAddress: req.ip ?? null,
          userAgent: req.headers["user-agent"] ?? null,
        },
      });

      logger.info("Audit log created", {
        userId: user.id,
        schoolId: user.schoolId,
        action,
        entity,
      });

      next();
    } catch (error: any) {
      /**
       * Audit failures should never block requests
       */
      logger.error("Audit middleware failed", {
        message: error.message,
        stack: error.stack,
      });

      next();
    }
  };
};