// src/modules/auth/auth.routes.ts

import { Router } from "express";
import { PrismaClient } from "@prisma/client";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthRepository } from "./auth.repository";

import { logger } from "../../shared/utils/logger";



/**
 * =========================================
 * AUTH ROUTES
 * =========================================
 * Authentication API endpoints.
 *
 * Base Route:
 * /api/v1/auth
 */

const router = Router();

/**
 * =========================================
 * DEPENDENCY INJECTION
 * =========================================
 */
const prisma = new PrismaClient();

const authRepository = new AuthRepository(prisma);
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

/**
 * =========================================
 * PUBLIC ROUTES
 * =========================================
 */

/**
 * Register User
 * POST /api/v1/auth/register
 */
router.post("/register", (req, res, next) =>
  authController.register(req, res, next)
);

/**
 * Login User
 * POST /api/v1/auth/login
 */
router.post("/login", (req, res, next) =>
  authController.login(req, res, next)
);

router.get("/test", (req, res) => {
  res.json({ message: "Auth routes working" });
});
/**
 * =========================================
 * PROTECTED ROUTES
 * =========================================
 *
 * Uncomment after creating auth middleware
 */

/*
import { authenticate } from "../../middleware/auth.middleware";

router.get(
  "/me",
  authenticate,
  authController.me
);
*/

/**
 * =========================================
 * ROUTER ERROR HANDLING
 * =========================================
 */
router.use((error: Error, req: any, res: any, next: any) => {
  logger.error("Auth Route Error", {
    message: error.message,
    stack: error.stack,
  });

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

export default router;