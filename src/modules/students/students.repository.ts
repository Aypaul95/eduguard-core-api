import { PrismaClient, Student } from "@prisma/client";

import {
    CreateStudentDto,
    UpdateStudentDto,
    StudentQueryDto,
} from "./students.dto";

import { logger } from "../../shared/utils/logger";
import { AppError } from "../../shared/errors/app.error";

/**
 * ============================================================
 * STUDENTS REPOSITORY (FIXED & TYPE SAFE)
 * ============================================================
 */

export class StudentsRepository {
    constructor(private readonly prisma: PrismaClient) { }

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
    async create(data: CreateStudentDto): Promise<Student> {
        try {
            return await this.prisma.student.create({
                data: {
                    schoolId: data.schoolId,
                    admissionNo: data.admissionNumber,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    gender: data.gender,
                    dateOfBirth: new Date(data.dateOfBirth),

                    isActive: data.isActive ?? true,

                    // ✅ ONLY include optional fields IF they exist
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
        } catch (error: unknown) {
            logger.error("Repository: Failed to create student", {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            });

            throw new AppError("Failed to create student", 500);
        }
    }

    /**
     * FIND STUDENT BY ID
     */
    async findById(studentId: string): Promise<Student | null> {
        try {
            return await this.prisma.student.findUnique({
                where: { id: studentId },
            });
        } catch (error: unknown) {
            this.logError("Repository: Failed to fetch student by ID", error);
            throw new AppError("Failed to fetch student", 500);
        }
    }

    /**
     * FIND BY ADMISSION NUMBER (SCHOOL SCOPED)
     */
    async findByAdmissionNumber(
        schoolId: string,
        admissionNumber: string
    ): Promise<Student | null> {
        try {
            return await this.prisma.student.findFirst({
                where: {
                    schoolId,
                    admissionNo: admissionNumber, // ✅ FIXED
                },
            });
        } catch (error: unknown) {
            this.logError(
                "Repository: Failed to fetch student by admission number",
                error
            );
            throw new AppError("Failed to fetch student", 500);
        }
    }

    /**
     * GET ALL STUDENTS
     */
    async findAll(query: StudentQueryDto) {
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
            this.logError("Repository: Failed to fetch students", error);
            throw new AppError("Failed to fetch students", 500);
        }
    }

    /**
     * UPDATE STUDENT
     */
    async update(
        studentId: string,
        data: UpdateStudentDto
    ): Promise<Student> {
        try {
            const updateData: any = {};

            if (data.admissionNumber !== undefined) {
                updateData.admissionNo = data.admissionNumber;
            }

            if (data.firstName !== undefined) {
                updateData.firstName = data.firstName;
            }

            if (data.lastName !== undefined) {
                updateData.lastName = data.lastName;
            }

            if (data.middleName !== undefined) {
                updateData.middleName = data.middleName;
            }

            if (data.gender !== undefined) {
                updateData.gender = data.gender;
            }

            if (data.dateOfBirth !== undefined) {
                updateData.dateOfBirth = new Date(data.dateOfBirth);
            }

            if (data.email !== undefined) {
                updateData.email = data.email;
            }

            if (data.phoneNumber !== undefined) {
                updateData.phoneNumber = data.phoneNumber;
            }

            if (data.isActive !== undefined) {
                updateData.isActive = data.isActive;
            }

            return await this.prisma.student.update({
                where: { id: studentId },
                data: updateData,
            });
        } catch (error: unknown) {
            this.logError("Repository: Failed to update student", error);
            throw new AppError("Failed to update student", 500);
        }
    }

    /**
     * SOFT DELETE
     */
    async softDelete(studentId: string): Promise<Student> {
        try {
            return await this.prisma.student.update({
                where: { id: studentId },
                data: { isActive: false },
            });
        } catch (error: unknown) {
            this.logError("Repository: Failed to delete student", error);
            throw new AppError("Failed to delete student", 500);
        }
    }

    /**
     * EXISTS CHECK
     */
    async existsInSchool(
        schoolId: string,
        admissionNumber: string
    ): Promise<boolean> {
        try {
            const count = await this.prisma.student.count({
                where: {
                    schoolId,
                    admissionNo: admissionNumber, // ✅ FIXED
                },
            });

            return count > 0;
        } catch (error: unknown) {
            this.logError("Repository: Failed existence check", error);
            throw new AppError("Failed to verify student existence", 500);
        }
    }

    /**
     * BULK CREATE
     */
    async bulkCreate(
        schoolId: string,
        students: CreateStudentDto[]
    ): Promise<{ created: number; failed: number }> {
        try {
            let created = 0;
            let failed = 0;

            for (const student of students) {
                try {
                    const data: any = {
                        schoolId,
                        admissionNo: student.admissionNumber,
                        firstName: student.firstName,
                        lastName: student.lastName,
                        gender: student.gender,
                        dateOfBirth: new Date(student.dateOfBirth),
                        isActive: student.isActive ?? true,
                    };

                    // ✅ ONLY ADD IF VALUE EXISTS
                    if (student.middleName !== undefined) {
                        data.middleName = student.middleName;
                    }

                    if (student.email !== undefined) {
                        data.email = student.email;
                    }

                    if (student.phoneNumber !== undefined) {
                        data.phoneNumber = student.phoneNumber;
                    }

                    await this.prisma.student.create({ data });

                    created++;
                } catch (err: unknown) {
                    failed++;
                }
            }

            return { created, failed };
        } catch (error: unknown) {
            this.logError("Repository: Bulk create failed", error);
            throw new AppError("Bulk student creation failed", 500);
        }
    }
}