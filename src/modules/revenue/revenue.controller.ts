import { Request, Response, NextFunction, Router } from "express";
import { PrismaClient } from "@prisma/client";

import { RevenueService } from "./revenue.service";
import { logger } from "../../config/logger";
import { AppError } from "../../shared/errors/app.error";

/**
 * ============================================================
 * REVENUE CONTROLLER
 * ============================================================
 * Handles all revenue analytics endpoints
 * Delegates business logic to RevenueService
 */
export class RevenueController {
  public router: Router;
  private readonly revenueService: RevenueService;

  constructor(prisma: PrismaClient) {
    this.router = Router();
    this.revenueService = new RevenueService(prisma);

    this.initializeRoutes();
  }

  /**
   * ============================================================
   * ROUTES REGISTRATION
   * ============================================================
   */
  private initializeRoutes(): void {
    this.router.get("/dashboard", this.getRevenueDashboard);
    this.router.get("/summary", this.getRevenueSummary);
    this.router.get("/by-category", this.getRevenueByCategory);
    this.router.get("/by-class", this.getRevenueByClass);
    this.router.get(
      "/by-payment-method",
      this.getRevenueByPaymentMethod
    );
    this.router.get("/trend", this.getMonthlyTrend);
    this.router.get("/outstanding", this.getOutstandingRevenue);
    this.router.get("/profit-loss", this.getProfitLoss);
  }

  /**
   * ============================================================
   * REVENUE DASHBOARD
   * ============================================================
   */
  getRevenueDashboard = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { schoolId, startDate, endDate } = req.query as any;

      if (!schoolId) {
        throw new AppError("schoolId is required", 400);
      }

      const data =
        await this.revenueService.getRevenueDashboard(
          schoolId,
          { startDate, endDate }
        );

      logger.info({ schoolId }, "Revenue dashboard fetched");

      res.status(200).json({
        success: true,
        message: "Revenue dashboard retrieved successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * ============================================================
   * REVENUE SUMMARY
   * ============================================================
   */
  getRevenueSummary = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { schoolId } = req.query as any;

      if (!schoolId) {
        throw new AppError("schoolId is required", 400);
      }

      const data =
        await this.revenueService.getRevenueSummary(schoolId);

      res.status(200).json({
        success: true,
        message: "Revenue summary retrieved successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * ============================================================
   * REVENUE BY CATEGORY
   * ============================================================
   */
  getRevenueByCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { schoolId } = req.query as any;

      if (!schoolId) {
        throw new AppError("schoolId is required", 400);
      }

      const data =
        await this.revenueService.getRevenueByCategory(
          schoolId
        );

      res.status(200).json({
        success: true,
        message: "Revenue by category retrieved successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * ============================================================
   * REVENUE BY CLASS
   * ============================================================
   */
  getRevenueByClass = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { schoolId } = req.query as any;

      if (!schoolId) {
        throw new AppError("schoolId is required", 400);
      }

      const data =
        await this.revenueService.getRevenueByClass(schoolId);

      res.status(200).json({
        success: true,
        message: "Revenue by class retrieved successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * ============================================================
   * REVENUE BY PAYMENT METHOD
   * ============================================================
   */
  getRevenueByPaymentMethod = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { schoolId } = req.query as any;

      if (!schoolId) {
        throw new AppError("schoolId is required", 400);
      }

      const data =
        await this.revenueService.getRevenueByPaymentMethod(
          schoolId
        );

      res.status(200).json({
        success: true,
        message: "Revenue by payment method retrieved successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * ============================================================
   * MONTHLY TREND
   * ============================================================
   */
  getMonthlyTrend = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { schoolId, year } = req.query as any;

      if (!schoolId) {
        throw new AppError("schoolId is required", 400);
      }

      const data =
        await this.revenueService.getMonthlyTrend(
          schoolId,
          year ? Number(year) : new Date().getFullYear()
        );

      res.status(200).json({
        success: true,
        message: "Revenue trend retrieved successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * ============================================================
   * OUTSTANDING REVENUE
   * ============================================================
   */
  getOutstandingRevenue = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { schoolId } = req.query as any;

      if (!schoolId) {
        throw new AppError("schoolId is required", 400);
      }

      const data =
        await this.revenueService.getOutstandingRevenue(
          schoolId
        );

      res.status(200).json({
        success: true,
        message: "Outstanding revenue retrieved successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * ============================================================
   * PROFIT & LOSS
   * ============================================================
   */
  getProfitLoss = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { schoolId } = req.query as any;

      if (!schoolId) {
        throw new AppError("schoolId is required", 400);
      }

      const data =
        await this.revenueService.getProfitLoss(schoolId);

      res.status(200).json({
        success: true,
        message: "Profit & loss retrieved successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  };
}