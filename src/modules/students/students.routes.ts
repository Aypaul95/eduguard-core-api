import { Router } from "express";
import { PrismaClient } from "@prisma/client";

import { StudentsController } from "./students.controller";
import { StudentsService } from "./students.service";
import { StudentsRepository } from "./students.repository";

import { logger } from "../../shared/utils/logger";

/**
 * ============================================================
 * STUDENTS ROUTES
 * ============================================================
 * Defines all student-related endpoints.
 * Follows Clean Architecture:
 * Routes → Controller → Service → Repository → Prisma
 * ============================================================
 */

/**
 * Dependency Injection Setup
 */
const prisma = new PrismaClient();

const studentsRepository = new StudentsRepository(prisma);
const studentsService = new StudentsService(prisma);
const studentsController = new StudentsController(studentsService);

const router = Router();

/**
 * ============================================================
 * ROUTES
 * ============================================================
 */

/**
 * CREATE STUDENT
 * POST /api/v1/students
 */
router.post(
  "/",
  studentsController.createStudent
);

/**
 * GET ALL STUDENTS
 * GET /api/v1/students
 */
router.get(
  "/",
  studentsController.getStudents
);

/**
 * BULK IMPORT STUDENTS
 * POST /api/v1/students/bulk-import
 */
router.post(
  "/bulk-import",
  studentsController.bulkImportStudents
);

/**
 * GET SINGLE STUDENT
 * GET /api/v1/students/:studentId
 */
router.get(
  "/:studentId",
  studentsController.getStudentById
);

/**
 * UPDATE STUDENT
 * PATCH /api/v1/students/:studentId
 */
router.patch(
  "/:studentId",
  studentsController.updateStudent
);

/**
 * DELETE STUDENT (SOFT DELETE)
 * DELETE /api/v1/students/:studentId
 */
router.delete(
  "/:studentId",
  studentsController.deleteStudent
);

/**
 * ============================================================
 * HEALTH CHECK (OPTIONAL FOR MODULE DEBUGGING)
 * ============================================================
 */
router.get("/health/check", (_req, res) => {
  logger.info("Students module health check hit");

  return res.status(200).json({
    success: true,
    message: "Students module is healthy",
  });
});

export default router;