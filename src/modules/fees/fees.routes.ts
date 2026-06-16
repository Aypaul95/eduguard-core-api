//src/modules/fees/fees.routes.ts
import { Router } from "express";
import { PrismaClient } from "@prisma/client";

import { FeesController } from "./fees.controller";
import { logger } from "../../config/logger";

/**
 * ============================================================
 * Fees Routes (API Endpoint Layer)
 * ============================================================
 * Responsibilities:
 * - Define all Fees module endpoints
 * - Bind controller methods
 * - Maintain clean API structure
 * - Support OpenAPI registry mapping
 * ============================================================
 */

export const createFeesRoutes = (prisma: PrismaClient): Router => {
  const router = Router();

  const feesController = new FeesController(prisma);

  logger.info("📘 Fees module routes initialized");

  /**
   * ============================================================
   * FEE CATEGORY ROUTES
   * ============================================================
   */

  router.post("/category", feesController.createFeeCategory);
  router.get("/category", feesController.getFeeCategories);
  router.patch("/category/:id", feesController.updateFeeCategory);
  router.delete("/category/:id", feesController.deleteFeeCategory);

  /**
   * ============================================================
   * FEE STRUCTURE ROUTES
   * ============================================================
   */

  router.post("/structure", feesController.createFeeStructure);
  router.get("/structure", feesController.getFeeStructures);
  router.patch("/structure/:id", feesController.updateFeeStructure);

  /**
   * ============================================================
   * STUDENT FEE ASSIGNMENT ROUTES
   * ============================================================
   */

  router.post("/assign", feesController.assignFeeToStudent);
  router.post("/assign/bulk", feesController.bulkAssignFeesToStudents);
  router.patch("/assign/:id", feesController.updateStudentFeeStatus);

  /**
   * ============================================================
   * DISCOUNT ROUTES
   * ============================================================
   */

  router.post("/discount", feesController.createDiscount);

  /**
   * ============================================================
   * SCHOLARSHIP ROUTES
   * ============================================================
   */

  router.post("/scholarship", feesController.createScholarship);

  return router;
};