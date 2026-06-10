import { PrismaClient, Student } from "@prisma/client";

import {
  CreateStudentDto,
  UpdateStudentDto,
  StudentQueryDto,
  BulkStudentImportDto,
} from "./students.dto";

import { AppError } from "../../shared/errors/app.error";
import { logger } from "../../shared/utils/logger";

/**
 * ============================================================
 * STUDENTS SERVICE (PRODUCTION READY)
 * ============================================================
 */

export class StudentsService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * SAFE ERROR LOGGER
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
  async createStudent(data: CreateStudentDto): Promise<Student> {
    try {
      const existingStudent = await this.prisma.student.findFirst({
        where: {
          schoolId: data.schoolId,
          admissionNo: data.admissionNumber, // ✅ FIXED
        },
      });

      if (existingStudent) {
        throw new AppError(
          "Student with this admission number already exists in this school",
          409
        );
      }

      const student = await this.prisma.student.create({
        data: {
          schoolId: data.schoolId,
          admissionNo: data.admissionNumber,
          firstName: data.firstName,
          lastName: data.lastName,
          gender: data.gender,
          dateOfBirth: new Date(data.dateOfBirth),
          isActive: data.isActive ?? true,

          ...(data.middleName !== undefined && {
            middleName: data.middleName,
          }),

          ...(data.email !== undefined && {
            email: data.email,
          }),

          ...(data.phoneNumber !== undefined && {
            phoneNumber: data.phoneNumber,
          }),
        },
      });

      logger.info("Student created successfully", {
        studentId: student.id,
        schoolId: student.schoolId,
      });

      return student;
    } catch (error: unknown) {
      this.logError("Service error creating student", error);
      throw error;
    }
  }

  /**
   * GET ALL STUDENTS
   */
  async getStudents(query: StudentQueryDto) {
    try {
      const { page, limit, search, classId, gender, isActive } = query;

      const skip = (page - 1) * limit;

      const where: any = {};

      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { admissionNo: { contains: search, mode: "insensitive" } }, // ✅ FIXED
        ];
      }

      if (classId) where.classId = classId;
      if (gender) where.gender = gender;
      if (typeof isActive === "boolean") where.isActive = isActive;

      const [students, total] = await Promise.all([
        this.prisma.student.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),

        this.prisma.student.count({ where }),
      ]);

      return {
        data: students,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: unknown) {
      this.logError("Service error fetching students", error);
      throw error;
    }
  }

  /**
   * GET STUDENT BY ID
   */
  async getStudentById(studentId: string): Promise<Student | null> {
    try {
      return await this.prisma.student.findUnique({
        where: { id: studentId },
      });
    } catch (error: unknown) {
      this.logError("Service error fetching student by ID", error);
      throw error;
    }
  }

  /**
   * UPDATE STUDENT
   */
  async updateStudent(
    studentId: string,
    data: UpdateStudentDto
  ): Promise<Student> {
    try {
      const existing = await this.prisma.student.findUnique({
        where: { id: studentId },
      });

      if (!existing) {
        throw new AppError("Student not found", 404);
      }

      const updatedStudent = await this.prisma.student.update({
        where: { id: studentId },
        data: {
          ...(data.admissionNumber !== undefined && {
            admissionNo: data.admissionNumber,
          }),

          ...(data.firstName !== undefined && {
            firstName: data.firstName,
          }),

          ...(data.lastName !== undefined && {
            lastName: data.lastName,
          }),

          ...(data.middleName !== undefined && {
            middleName: data.middleName,
          }),

          ...(data.gender !== undefined && {
            gender: data.gender,
          }),

          ...(data.dateOfBirth !== undefined && {
            dateOfBirth: new Date(data.dateOfBirth),
          }),

          ...(data.email !== undefined && {
            email: data.email,
          }),

          ...(data.phoneNumber !== undefined && {
            phoneNumber: data.phoneNumber,
          }),

          ...(data.isActive !== undefined && {
            isActive: data.isActive,
          }),
        },
      });

      logger.info("Student updated successfully", { studentId });

      return updatedStudent;
    } catch (error: unknown) {
      this.logError("Service error updating student", error);
      throw error;
    }
  }

  /**
   * DELETE STUDENT (SOFT DELETE)
   */
  async deleteStudent(studentId: string): Promise<void> {
    try {
      const student = await this.prisma.student.findUnique({
        where: { id: studentId },
      });

      if (!student) {
        throw new AppError("Student not found", 404);
      }

      await this.prisma.student.update({
        where: { id: studentId },
        data: {
          isActive: false,
        },
      });

      logger.info("Student deactivated", { studentId });
    } catch (error: unknown) {
      this.logError("Service error deleting student", error);
      throw error;
    }
  }

  /**
   * BULK IMPORT STUDENTS
   */
  async bulkImportStudents(data: BulkStudentImportDto) {
    try {
      const { schoolId, students } = data;

      const result = {
        created: 0,
        failed: 0,
        errors: [] as any[],
      };

      for (const student of students) {
        try {
          const exists = await this.prisma.student.findFirst({
            where: {
              schoolId,
              admissionNo: student.admissionNumber,
            },
          });

          if (exists) {
            result.failed++;
            result.errors.push({
              admissionNumber: student.admissionNumber,
              error: "Duplicate admission number",
            });
            continue;
          }

          await this.prisma.student.create({
            data: {
              schoolId,
              admissionNo: student.admissionNumber,
              firstName: student.firstName,
              lastName: student.lastName,
              gender: student.gender,
              dateOfBirth: new Date(student.dateOfBirth),
              isActive: student.isActive ?? true,

              ...(student.middleName !== undefined && {
                middleName: student.middleName,
              }),

              ...(student.email !== undefined && {
                email: student.email,
              }),

              ...(student.phoneNumber !== undefined && {
                phoneNumber: student.phoneNumber,
              }),
            },
          });

          result.created++;
        } catch (err: unknown) {
          result.failed++;
          this.logError("Bulk import student failed", err);
        }
      }

      logger.info("Bulk import completed", {
        schoolId,
        created: result.created,
        failed: result.failed,
      });

      return result;
    } catch (error: unknown) {
      this.logError("Service error bulk importing students", error);
      throw error;
    }
  }
}