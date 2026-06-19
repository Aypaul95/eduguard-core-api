import { Router } from "express";
import { PrismaClient } from "@prisma/client";

import { RevenueController } from "./revenue.controller";
import { logger } from "../../config/logger";

/**
 * ============================================================
 * REVENUE ROUTES
 * ============================================================
 * Handles all revenue analytics endpoints
 * - Dashboard
 * - Summary
 * - Category breakdown
 * - Class breakdown
 * - Payment method analytics
 * - Trend analysis
 * - Profit & Loss
 */

export class RevenueRoutes {
  public router: Router;
  private revenueController: RevenueController;

  constructor(prisma: PrismaClient) {
    this.router = Router();

    this.revenueController = new RevenueController(prisma);

    this.initializeRoutes();

    logger.info("📊 Revenue routes initialized");
  }

  /**
   * ============================================================
   * ROUTE REGISTRATION
   * ============================================================
   */
  private initializeRoutes() {
    /**
     * REVENUE DASHBOARD
     */
    this.router.get(
      "/dashboard",
      this.revenueController.getRevenueDashboard
    );

    /**
     * REVENUE SUMMARY
     */
    this.router.get(
      "/summary",
      this.revenueController.getRevenueSummary
    );

    /**
     * REVENUE BY CATEGORY
     */
    this.router.get(
      "/by-category",
      this.revenueController.getRevenueByCategory
    );

    /**
     * REVENUE BY CLASS
     */
    this.router.get(
      "/by-class",
      this.revenueController.getRevenueByClass
    );

    /**
     * REVENUE BY PAYMENT METHOD
     */
    this.router.get(
      "/by-payment-method",
      this.revenueController.getRevenueByPaymentMethod
    );

    /**
     * MONTHLY REVENUE TREND
     */
    this.router.get(
      "/trend",
      this.revenueController.getMonthlyTrend
    );

    /**
     * OUTSTANDING REVENUE
     */
    this.router.get(
      "/outstanding",
      this.revenueController.getOutstandingRevenue
    );

    /**
     * PROFIT & LOSS
     */
    this.router.get(
      "/profit-loss",
      this.revenueController.getProfitLoss
    );
  }

  /**
   * ============================================================
   * EXPORT ROUTER
   * ============================================================
   */
  public getRouter(): Router {
    return this.router;
  }
}