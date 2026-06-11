import { Router } from "express";
import { PrismaClient } from "@prisma/client";

import { ParentsController } from "./parents.controller";
import { ParentsService } from "./parents.service";
import { ParentsRepository } from "./parents.repository";

import { logger } from "../../shared/utils/logger";

/**
 * ============================================================
 * PARENTS ROUTES
 * ============================================================
 * Base Path:
 * /api/v1/parents
 * ============================================================
 */

export const parentsRouter = Router();
const router = Router();

// ============================================================
// Dependency Injection Setup (Clean Architecture)
// ============================================================

const prisma = new PrismaClient();

const parentsRepository = new ParentsRepository(prisma);
const parentsService = new ParentsService(prisma); // service still uses prisma internally in your design
const parentsController = new ParentsController(parentsService);

/**
 * ============================================================
 * CORE CRUD ROUTES
 * ============================================================
 */

// CREATE PARENT
parentsRouter.post(
  "/",
  parentsController.createParent,
);

// GET ALL PARENTS
parentsRouter.get(
  "/",
  parentsController.getParents,
);

// GET PARENT BY ID
parentsRouter.get(
  "/:parentId",
  parentsController.getParentById,
);

// UPDATE PARENT
parentsRouter.patch(
  "/:parentId",
  parentsController.updateParent,
);

// DELETE PARENT
parentsRouter.delete(
  "/:parentId",
  parentsController.deleteParent,
);

/**
 * ============================================================
 * SCHOOL-BASED ROUTES (Multi-school support)
 * ============================================================
 */

// GET PARENTS BY SCHOOL
parentsRouter.get(
  "/school/:schoolId",
  parentsController.getParentsBySchool,
);

/**
 * ============================================================
 * PARENT ↔ STUDENT LINKING ROUTES
 * ============================================================
 */

// LINK STUDENT TO PARENT
parentsRouter.post(
  "/:parentId/students",
  async (req, res, next) => {
    try {
      const { parentId } = req.params;
      const { studentId, relationship } = req.body;

      const result =
        await parentsService.linkStudent(
          parentId,
          studentId,
          relationship,
        );

      logger.info("Student linked to parent", {
        parentId,
        studentId,
      });

      res.status(201).json({
        success: true,
        message: "Student linked to parent successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
);

// GET ALL CHILDREN OF A PARENT
parentsRouter.get(
  "/:parentId/students",
  async (req, res, next) => {
    try {
      const { parentId } = req.params;

      const children =
        await parentsService.getParentChildren(
          parentId,
        );

      res.status(200).json({
        success: true,
        data: children,
      });
    } catch (error) {
      next(error);
    }
  },
);

// UNLINK STUDENT FROM PARENT
parentsRouter.delete(
  "/:parentId/students/:studentId",
  async (req, res, next) => {
    try {
      const { parentId, studentId } = req.params;

      await parentsService.unlinkStudent(
        parentId,
        studentId,
      );

      logger.info("Student unlinked from parent", {
        parentId,
        studentId,
      });

      res.status(200).json({
        success: true,
        message:
          "Student unlinked from parent successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * ============================================================
 * STUDENT → PARENTS ROUTE
 * ============================================================
 */

parentsRouter.get(
  "/students/:studentId/parents",
  async (req, res, next) => {
    try {
      const { studentId } = req.params;

      const parents =
        await parentsService.getStudentParents(
          studentId,
        );

      res.status(200).json({
        success: true,
        data: parents,
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * ============================================================
 * HEALTH CHECK (optional module-level debug route)
 * ============================================================
 */

parentsRouter.get(
  "/health",
  (_req, res) => {
    res.status(200).json({
      success: true,
      message: "Parents module is healthy",
    });
  },
);

export default router;