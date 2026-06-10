import { Request, Response, NextFunction } from "express";

import {
  createStudentSchema,
  updateStudentSchema,
  studentParamsSchema,
  studentQuerySchema,
  bulkStudentImportSchema,
} from "./students.dto";

import { StudentsService } from "./students.service";
import { logger } from "../../shared/utils/logger";
import { AppError } from "../../shared/errors/app.error";

/**
 * ============================================================
 * STUDENTS CONTROLLER (FIXED VERSION)
 * ============================================================
 */

export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  /**
   * SAFE ERROR LOGGER HELPER
   */
  private logError(message: string, error: unknown) {
    logger.error(message, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }

  /**
   * CREATE STUDENT
   */
  createStudent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const parsedBody = createStudentSchema.parse(req.body);

      const student = await this.studentsService.createStudent(parsedBody);

      logger.info("Student created successfully", {
        schoolId: parsedBody.schoolId,
        admissionNumber: parsedBody.admissionNumber,
      });

      return res.status(201).json({
        success: true,
        message: "Student created successfully",
        data: student,
      });
    } catch (error: unknown) {
      this.logError("Error creating student", error);
      return next(error);
    }
  };

  /**
   * GET ALL STUDENTS
   */
  getStudents = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const query = studentQuerySchema.parse(req.query);

      const result = await this.studentsService.getStudents(query);

      return res.status(200).json({
        success: true,
        message: "Students retrieved successfully",
        data: result.data,
        meta: result.meta,
      });
    } catch (error: unknown) {
      this.logError("Error fetching students", error);
      return next(error);
    }
  };

  /**
   * GET SINGLE STUDENT
   */
  getStudentById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { studentId } = studentParamsSchema.parse(req.params);

      const student = await this.studentsService.getStudentById(studentId);

      if (!student) {
        throw new AppError("Student not found", 404);
      }

      return res.status(200).json({
        success: true,
        message: "Student retrieved successfully",
        data: student,
      });
    } catch (error: unknown) {
      this.logError("Error fetching student by ID", error);
      return next(error);
    }
  };

  /**
   * UPDATE STUDENT
   */
  updateStudent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { studentId } = studentParamsSchema.parse(req.params);
      const parsedBody = updateStudentSchema.parse(req.body);

      const updatedStudent = await this.studentsService.updateStudent(
        studentId,
        parsedBody
      );

      return res.status(200).json({
        success: true,
        message: "Student updated successfully",
        data: updatedStudent,
      });
    } catch (error: unknown) {
      this.logError("Error updating student", error);
      return next(error);
    }
  };

  /**
   * DELETE STUDENT
   */
  deleteStudent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { studentId } = studentParamsSchema.parse(req.params);

      await this.studentsService.deleteStudent(studentId);

      return res.status(200).json({
        success: true,
        message: "Student deleted successfully",
      });
    } catch (error: unknown) {
      this.logError("Error deleting student", error);
      return next(error);
    }
  };

  /**
   * BULK IMPORT STUDENTS
   */
  bulkImportStudents = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const parsedBody = bulkStudentImportSchema.parse(req.body);

      const result = await this.studentsService.bulkImportStudents(
        parsedBody
      );

      logger.info("Bulk student import completed", {
        schoolId: parsedBody.schoolId,
        count: parsedBody.students.length,
      });

      return res.status(201).json({
        success: true,
        message: "Bulk import completed successfully",
        data: result,
      });
    } catch (error: unknown) {
      this.logError("Error in bulk student import", error);
      return next(error);
    }
  };
}