import { Router } from "express";
import { PrismaClient } from "@prisma/client";

import { ClassesController } from "./classes.controller";
import { ClassesService } from "./classes.service";
import { ClassesRepository } from "./classes.repository";

import { logger } from "../../shared/utils/logger";

/**
 * =========================================
 * CLASSES ROUTES
 * =========================================
 * Base Path: /api/v1/classes
 *
 * Handles:
 * - Class CRUD operations
 * - Academic structure endpoints
 * =========================================
 */

/**
 * Dependency Injection Setup
 * (Clean Architecture style)
 */
const prisma = new PrismaClient();

const classesRepository = new ClassesRepository(prisma);
const classesService = new ClassesService(classesRepository);
const classesController = new ClassesController(classesService);

const router = Router();

/**
 * =========================================
 * HEALTH CHECK (OPTIONAL DEBUG ROUTE)
 * =========================================
 */
router.get("/health", (req, res) => {
  logger.info("Classes module health check");
  res.status(200).json({
    success: true,
    message: "Classes service is healthy",
  });
});

/**
 * =========================================
 * CLASS ROUTES
 * =========================================
 */

/**
 * CREATE CLASS
 * POST /api/v1/classes
 */
router.post(
  "/",
  classesController.createClass
);

/**
 * GET ALL CLASSES
 * GET /api/v1/classes
 * Query:
 * - page
 * - limit
 * - search
 * - schoolId (required)
 * - isActive
 * - gradeLevel
 */
router.get(
  "/",
  classesController.getAllClasses
);

/**
 * GET CLASS BY ID
 * GET /api/v1/classes/:classId?schoolId=xxx
 */
router.get(
  "/:classId",
  classesController.getClassById
);

/**
 * UPDATE CLASS
 * PATCH /api/v1/classes/:classId?schoolId=xxx
 */
router.patch(
  "/:classId",
  classesController.updateClass
);

/**
 * DELETE CLASS
 * DELETE /api/v1/classes/:classId?schoolId=xxx
 */
router.delete(
  "/:classId",
  classesController.deleteClass
);

export default router;