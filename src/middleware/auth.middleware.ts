import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { PrismaClient, Prisma } from "@prisma/client";
import { UserRole } from "@prisma/client";
import { env } from "../config/env";
import { AppError } from "../shared/errors/app.error";
import { logger } from "../shared/utils/logger";

/**
 * Extend Express Request to include authenticated user
 */
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: UserRole;
        schoolId: string;
    };
}

/**
 * JWT payload structure
 */
interface DecodedToken extends JwtPayload {
    userId: string;
    email: string;
    role: UserRole;
    schoolId: string;
}

const prisma = new PrismaClient();

/**
 * Authentication Middleware (JWT Guard)
 *
 * Responsibilities:
 * - Validate JWT token
 * - Attach user to request object
 * - Enforce multi-school (school isolation)
 */
export const authMiddleware = async (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new AppError("Unauthorized: No token provided", 401);
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            throw new AppError("Unauthorized: Invalid token format", 401);
        }

        /**
         * Verify JWT
         */
        const decoded = jwt.verify(
            token,
            env.JWT_ACCESS_SECRET
        ) as DecodedToken;

        if (!decoded?.userId || !decoded?.schoolId) {
            throw new AppError("Unauthorized: Invalid token payload", 401);
        }

        /**
         * Validate user exists and is active
         */
        const userWithRoles = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
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

        if (!userWithRoles.isActive) {
            throw new AppError("Unauthorized: User account is disabled", 403);
        }

        /**
         * Enforce multi-school isolation (school-level security)
         */
        if (userWithRoles.schoolId !== decoded.schoolId) {
            throw new AppError("Forbidden: School mismatch", 403);
        }

        /**
         * Extract primary role (simple RBAC baseline)
         */
         const role = userWithRoles?.roles?.[0]?.role?.name as UserRole;

        if (!role) {
            throw new AppError("Forbidden: No role assigned", 403);
        }

        /**
         * Attach user to request object
         */
        req.user = {
            id: userWithRoles.id,
            email: userWithRoles.email,
            role,                      // role: role as UserRole, // or better: ensure role comes from Prisma type directly
            schoolId: userWithRoles.schoolId!,
        };

        logger.info("Auth success", {
            userId: userWithRoles.id,
            schoolId: userWithRoles.schoolId,
            role,
        });

        next();
    } catch (error: any) {
        /**
         * Handle JWT errors explicitly
         */
        if (error.name === "TokenExpiredError") {
            return next(new AppError("Unauthorized: Token expired", 401));
        }

        if (error.name === "JsonWebTokenError") {
            return next(new AppError("Unauthorized: Invalid token", 401));
        }

        logger.error("Auth middleware error", {
            message: error.message,
            stack: error.stack,
        });

        next(error);
    }
};