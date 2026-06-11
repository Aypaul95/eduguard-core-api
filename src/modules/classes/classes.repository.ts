import { PrismaClient } from "@prisma/client";
import { logger } from "../../shared/utils/logger";
import { AppError } from "../../shared/errors/app.error";

import {
    CreateClassDto,
    UpdateClassDto,
} from "./classes.dto";

/**
 * =========================================
 * CLASSES REPOSITORY (DATA ACCESS LAYER)
 * =========================================
 * Handles all database operations for Classes
 * using Prisma ORM
 * =========================================
 */

export class ClassesRepository {
    constructor(private readonly prisma: PrismaClient) { }

    /**
     * CREATE CLASS
     */
    async create(data: CreateClassDto) {
        try {
            return await this.prisma.class.create({
                data: {
                    name: data.name,
                    description: data.description,
                    gradeLevel: data.gradeLevel,
                    capacity: data.capacity,
                    isActive: data.isActive ?? true,

                    // IMPORTANT: school isolation
                    schoolId: data.schoolId,
                },
            });
        } catch (error: unknown) {
            const err = error as Error;

            logger.error("Prisma create class error", {
                message: err.message,
                stack: err.stack,
                module: "classes.repository.create",
                schoolId: data.schoolId,
            });

            throw new AppError("Failed to create class", 500);
        }
    }

    /**
     * FIND ALL CLASSES (FILTER + PAGINATION)
     */
    async findAll(input: {
        skip: number;
        take: number;
        schoolId?: string;
        search?: string;
        isActive?: boolean;
        gradeLevel?: string;
    }) {
        try {
            const where: any = {
                schoolId: input.schoolId,
            };

            if (input.isActive !== undefined) {
                where.isActive = input.isActive;
            }

            if (input.gradeLevel) {
                where.gradeLevel = input.gradeLevel;
            }

            if (input.search) {
                where.name = {
                    contains: input.search,
                    mode: "insensitive",
                };
            }

            const [data, total] = await Promise.all([
                this.prisma.class.findMany({
                    where,
                    skip: input.skip,
                    take: input.take,
                    orderBy: {
                        createdAt: "desc",
                    },
                }),

                this.prisma.class.count({ where }),
            ]);

            return { data, total };
        } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error(String(error));

            logger.error("Prisma findAll classes error", {
                message: err.message,
                stack: err.stack,
                module: "classes.repository.findAll",
                schoolId: input.schoolId,
            });

            throw new AppError("Failed to fetch classes", 500);
        }
    }

    /**
     * FIND CLASS BY ID (SCHOOL SCOPED)
     */
    async findById(classId: string, schoolId: string) {
        try {
            return await this.prisma.class.findFirst({
                where: {
                    id: classId,
                    schoolId,
                },
            });
        } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error(String(error));

            logger.error("Prisma findById class error", {
                message: err.message,
                stack: err.stack,
                module: "classes.repository.findById",
                classId,
                schoolId,
            });

            throw new AppError("Failed to fetch class", 500);
        }
    }

    /**
     * FIND BY NAME + SCHOOL (DUPLICATE CHECK)
     */
    async findByNameAndSchool(name: string, schoolId: string) {
        try {
            return await this.prisma.class.findFirst({
                where: {
                    name,
                    schoolId,
                },
            });
        } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error(String(error));

            logger.error("Prisma findByNameAndSchool error", {
                message: err.message,
                stack: err.stack,
                module: "classes.repository.findByNameAndSchool",
                name,
                schoolId,
            });

            throw new AppError("Failed to validate class name", 500);
        }
    }

    /**
     * UPDATE CLASS
     */
    async update(
        classId: string,
        schoolId: string,
        data: UpdateClassDto
    ) {
        try {
            const result = await this.prisma.class.updateMany({
                where: {
                    id: classId,
                    schoolId,
                },
                data: {
                    // IMPORTANT: remove undefined fields (Prisma strict mode fix)
                    ...(data.name !== undefined && { name: data.name }),
                    ...(data.description !== undefined && { description: data.description }),
                    ...(data.gradeLevel !== undefined && { gradeLevel: data.gradeLevel }),
                    ...(data.capacity !== undefined && { capacity: data.capacity }),
                    ...(data.isActive !== undefined && { isActive: data.isActive }),
                },
            });

            if (result.count === 0) {
                throw new AppError("Class not found", 404);
            }

            return await this.prisma.class.findFirst({
                where: {
                    id: classId,
                    schoolId,
                },
            });
        } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error(String(error));

            logger.error("Prisma update class error", {
                message: err.message,
                stack: err.stack,
                module: "classes.repository.update",
                classId,
                schoolId,
            });

            throw error instanceof AppError
                ? error
                : new AppError("Failed to update class", 500);
        }
    }

    /**
     * DELETE CLASS
     */
    async delete(classId: string, schoolId: string) {
        try {
            const result = await this.prisma.class.deleteMany({
                where: {
                    id: classId,
                    schoolId,
                },
            });

            if (result.count === 0) {
                throw new AppError("Class not found", 404);
            }

            return true;
        } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error(String(error));

            logger.error("Prisma delete class error", {
                message: err.message,
                stack: err.stack,
                module: "classes.repository.delete",
                classId,
                schoolId,
            });

            throw error instanceof AppError
                ? error
                : new AppError("Failed to delete class", 500);
        }
    }

    /**
     * CHECK IF CLASS HAS STUDENTS
     * (Used before deletion safety check)
     */
    async hasStudents(classId: string): Promise<boolean> {
        try {
            const count = await this.prisma.enrollment.count({
                where: {
                    classId,
                },
            });

            return count > 0;
        } catch (error: unknown) {
            const err =
                error instanceof Error
                    ? error
                    : new Error(String(error));

            logger.error("Prisma hasStudents error", {
                message: err.message,
                stack: err.stack,
                module: "classes.repository.hasStudents",
                classId,
            });

            throw new AppError(
                "Failed to verify class dependencies",
                500
            );
        }
    }
}