import { Request } from "express";
import { UserRole } from "@prisma/client";

/**
 * =========================================
 * AUTH CORE TYPES (PRISMA DRIVEN)
 * =========================================
 * Single source of truth: Prisma schema
 */

/**
 * Authenticated user attached after JWT verification
 */
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  schoolId: string;
}

/**
 * JWT payload structure (token contract)
 */
export interface JwtPayload {
  sub: string; // userId
  schoolId: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/**
 * Extended Express request with auth context
 */
export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  schoolId?: string;
}