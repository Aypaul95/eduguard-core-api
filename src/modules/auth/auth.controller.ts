import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import {
  registerUserSchema,
  loginSchema,
} from "./auth.dto";
import { logger } from "../../shared/utils/logger";

/**
 * =========================================
 * AUTH CONTROLLER (PRESENTATION LAYER)
 * =========================================
 * Handles HTTP requests and responses.
 * Delegates business logic to AuthService.
 */

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * =========================
   * REGISTER USER
   * =========================
   */
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = registerUserSchema.parse(req.body);

      const result = await this.authService.register(validatedData);

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: result,
      });
    } catch (error: any) {
      logger.error("Register controller error", {
        message: error.message,
        stack: error.stack,
      });
      next(error);
    }
  };

  /**
   * =========================
   * LOGIN USER
   * =========================
   */
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = loginSchema.parse(req.body);

      const result = await this.authService.login(validatedData);

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error: any) {
      logger.error("Login controller error", {
        message: error.message,
        stack: error.stack,
      });
      next(error);
    }
  };

  /**
   * =========================
   * GET CURRENT USER (optional endpoint)
   * =========================
   * Requires auth middleware to attach req.user
   */
  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      return res.status(200).json({
        success: true,
        message: "User retrieved successfully",
        data: user,
      });
    } catch (error: any) {
      logger.error("Me controller error", {
        message: error.message,
        stack: error.stack,
      });
      next(error);
    }
  };
}