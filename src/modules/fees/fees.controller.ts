//src/modules/fees/fees.controller.ts

import { Request, Response, NextFunction, Router } from "express";
import { PrismaClient } from "@prisma/client";

import { FeesService } from "./fees.service";
import {
  CreateFeeCategorySchema,
  UpdateFeeCategorySchema,
  FeeCategoryParamsSchema,

  CreateFeeStructureSchema,
  UpdateFeeStructureSchema,
  FeeStructureParamsSchema,

  AssignFeeToStudentSchema,
  BulkAssignFeeToStudentsSchema,
  StudentFeeAssignmentParamsSchema,
  UpdateStudentFeeAssignmentSchema,

  CreateDiscountSchema,
  CreateScholarshipSchema,
} from "./fees.dto";

import { logger } from "../../config/logger";

/**
 * ============================================================
 * Fees Controller (Fee Setup & Management Layer)
 * ============================================================
 */

export class FeesController {
  public router: Router;
  private readonly feesService: FeesService;

  constructor(prisma: PrismaClient) {
    this.router = Router();
    this.feesService = new FeesService(prisma);
    this.initializeRoutes();
  }

  /**
   * ============================================================
   * SCHOOL CONTEXT HELPER (CRITICAL FIX)
   * ============================================================
   */
  private getSchoolId(req: Request): string {
    const schoolId = req.headers["x-school-id"] as string;

    if (!schoolId) {
      throw new Error("schoolId is required in x-school-id header");
    }

    return schoolId;
  }

  private initializeRoutes(): void {
    // Fee Category
    this.router.post("/category", this.createFeeCategory);
    this.router.get("/category", this.getFeeCategories);
    this.router.patch("/category/:id", this.updateFeeCategory);
    this.router.delete("/category/:id", this.deleteFeeCategory);

    // Fee Structure
    this.router.post("/structure", this.createFeeStructure);
    this.router.get("/structure", this.getFeeStructures);
    this.router.patch("/structure/:id", this.updateFeeStructure);

    // Student Fee Assignment
    this.router.post("/assign", this.assignFeeToStudent);
    this.router.post("/assign/bulk", this.bulkAssignFeesToStudents);
    this.router.patch("/assign/:id", this.updateStudentFeeStatus);

    // Discounts
    this.router.post("/discount", this.createDiscount);

    // Scholarships
    this.router.post("/scholarship", this.createScholarship);
  }

  /**
   * ============================================================
   * FEE CATEGORY
   * ============================================================
   */

  createFeeCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const schoolId = this.getSchoolId(req);
      const data = CreateFeeCategorySchema.parse({ ...req.body, schoolId });

      const result = await this.feesService.createFeeCategory(data);

      res.status(201).json({
        success: true,
        message: "Fee category created successfully",
        data: result,
      });
    } catch (error) {
      logger.error({ error }, "Create Fee Category Error");
      next(error);
    }
  };

  getFeeCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const schoolId = this.getSchoolId(req);

      const result = await this.feesService.getFeeCategories(schoolId);

      res.status(200).json({
        success: true,
        message: "Fee categories fetched successfully",
        data: result,
      });
    } catch (error) {
      logger.error({ error }, "Get Fee Categories Error");
      next(error);
    }
  };

  updateFeeCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const schoolId = this.getSchoolId(req);
      const { id } = FeeCategoryParamsSchema.parse(req.params);
      const data = UpdateFeeCategorySchema.parse(req.body);

      const result = await this.feesService.updateFeeCategory(id, data, schoolId);

      res.status(200).json({
        success: true,
        message: "Fee category updated successfully",
        data: result,
      });
    } catch (error) {
      logger.error({ error }, "Update Fee Category Error");
      next(error);
    }
  };

  deleteFeeCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const schoolId = this.getSchoolId(req);
      const { id } = FeeCategoryParamsSchema.parse(req.params);

      await this.feesService.deleteFeeCategory(id, schoolId);

      res.status(200).json({
        success: true,
        message: "Fee category deleted successfully",
      });
    } catch (error) {
      logger.error({ error }, "Delete Fee Category Error");
      next(error);
    }
  };

  /**
   * ============================================================
   * FEE STRUCTURE
   * ============================================================
   */

  createFeeStructure = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const schoolId = this.getSchoolId(req);
      const data = CreateFeeStructureSchema.parse({ ...req.body, schoolId });

      const result = await this.feesService.createFeeStructure(data);

      res.status(201).json({
        success: true,
        message: "Fee structure created successfully",
        data: result,
      });
    } catch (error) {
      logger.error({ error }, "Create Fee Structure Error");
      next(error);
    }
  };

  getFeeStructures = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const schoolId = this.getSchoolId(req);

      const result = await this.feesService.getFeeStructures(schoolId);

      res.status(200).json({
        success: true,
        message: "Fee structures fetched successfully",
        data: result,
      });
    } catch (error) {
      logger.error({ error }, "Get Fee Structures Error");
      next(error);
    }
  };

  updateFeeStructure = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const schoolId = this.getSchoolId(req);
      const { id } = FeeStructureParamsSchema.parse(req.params);
      const data = UpdateFeeStructureSchema.parse(req.body);

      const result = await this.feesService.updateFeeStructure(id, data, schoolId);

      res.status(200).json({
        success: true,
        message: "Fee structure updated successfully",
        data: result,
      });
    } catch (error) {
      logger.error({ error }, "Update Fee Structure Error");
      next(error);
    }
  };

  /**
   * ============================================================
   * STUDENT ASSIGNMENT
   * ============================================================
   */

  assignFeeToStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = AssignFeeToStudentSchema.parse(req.body);

      const result = await this.feesService.assignFeeToStudent(data);

      res.status(201).json({
        success: true,
        message: "Fee assigned to student successfully",
        data: result,
      });
    } catch (error) {
      logger.error({ error }, "Assign Fee Error");
      next(error);
    }
  };

  bulkAssignFeesToStudents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = BulkAssignFeeToStudentsSchema.parse(req.body);

      const result = await this.feesService.bulkAssignFeesToStudents(data);

      res.status(201).json({
        success: true,
        message: "Fees assigned successfully",
        data: result,
      });
    } catch (error) {
      logger.error({ error }, "Bulk Assign Fee Error");
      next(error);
    }
  };

  updateStudentFeeStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = StudentFeeAssignmentParamsSchema.parse(req.params);
      const data = UpdateStudentFeeAssignmentSchema.parse(req.body);

      const result = await this.feesService.updateStudentFeeStatus(id, data);

      res.status(200).json({
        success: true,
        message: "Student fee status updated successfully",
        data: result,
      });
    } catch (error) {
      logger.error({ error }, "Update Fee Status Error");
      next(error);
    }
  };

  /**
   * ============================================================
   * DISCOUNTS
   * ============================================================
   */

  createDiscount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const schoolId = this.getSchoolId(req);
      const data = CreateDiscountSchema.parse({ ...req.body, schoolId });

      const result = await this.feesService.createDiscount(data);

      res.status(201).json({
        success: true,
        message: "Discount created successfully",
        data: result,
      });
    } catch (error) {
      logger.error({ error }, "Create Discount Error");
      next(error);
    }
  };

  /**
   * ============================================================
   * SCHOLARSHIP
   * ============================================================
   */

  createScholarship = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const schoolId = this.getSchoolId(req);
      const data = CreateScholarshipSchema.parse({ ...req.body, schoolId });

      const result = await this.feesService.createScholarship(data);

      res.status(201).json({
        success: true,
        message: "Scholarship created successfully",
        data: result,
      });
    } catch (error) {
      logger.error({ error }, "Create Scholarship Error");
      next(error);
    }
  };
}

/**
 * ============================================================
 * ROUTER EXPORT
 * ============================================================
 */

export const createFeesController = (prisma: PrismaClient): Router => {
  return new FeesController(prisma).router;
};