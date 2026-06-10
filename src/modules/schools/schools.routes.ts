import { Router, Request, Response, NextFunction } from "express";
import { SchoolsController } from "./schools.controller";
import {
  validateCreateSchool,
  validateUpdateSchool,
  validateSchoolIdParam,
  validateSchoolQuery,
} from "./schools.dto";

/**
 * ==========================
 * SCHOOL ROUTES
 * ==========================
 * Base Route (from app.ts + index.ts):
 * /api/v1/schools
 */

const router = Router();
const controller = new SchoolsController();

/**
 * --------------------------
 * CREATE SCHOOL
 * POST /api/v1/schools
 * --------------------------
 */
router.post(
  "/",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validation = validateCreateSchool(req.body);

      if (!validation.success) {
        res.status(400).json({
          message: "Validation error",
          errors: validation.error.flatten(),
        });
        return;
      }

      const result = await controller.createSchool(validation.data);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * --------------------------
 * GET ALL SCHOOLS
 * GET /api/v1/schools
 * --------------------------
 */
router.get(
  "/",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validation = validateSchoolQuery(req.query);

      if (!validation.success) {
        res.status(400).json({
          message: "Invalid query parameters",
          errors: validation.error.flatten(),
        });
        return;
      }

      const result = await controller.getAllSchools(validation.data);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * --------------------------
 * GET SINGLE SCHOOL
 * GET /api/v1/schools/:schoolId
 * --------------------------
 */
router.get(
  "/:schoolId",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validation = validateSchoolIdParam(req.params);

      if (!validation.success) {
        res.status(400).json({
          message: "Invalid schoolId parameter",
          errors: validation.error.flatten(),
        });
        return;
      }

      const result = await controller.getSchoolById(validation.data.schoolId);

      if (!result) {
        res.status(404).json({
          message: "School not found",
        });
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * --------------------------
 * UPDATE SCHOOL
 * PATCH /api/v1/schools/:schoolId
 * --------------------------
 */
router.patch(
  "/:schoolId",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paramValidation = validateSchoolIdParam(req.params);
      const bodyValidation = validateUpdateSchool(req.body);

      if (!paramValidation.success) {
        res.status(400).json({
          message: "Invalid schoolId parameter",
          errors: paramValidation.error.flatten(),
        });
        return;
      }

      if (!bodyValidation.success) {
        res.status(400).json({
          message: "Validation error",
          errors: bodyValidation.error.flatten(),
        });
        return;
      }

      const result = await controller.updateSchool(
        paramValidation.data.schoolId,
        bodyValidation.data
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * --------------------------
 * DELETE SCHOOL
 * DELETE /api/v1/schools/:schoolId
 * --------------------------
 */
router.delete(
  "/:schoolId",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validation = validateSchoolIdParam(req.params);

      if (!validation.success) {
        res.status(400).json({
          message: "Invalid schoolId parameter",
          errors: validation.error.flatten(),
        });
        return;
      }

      await controller.deleteSchool(validation.data.schoolId);

      res.status(200).json({
        message: "School deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;