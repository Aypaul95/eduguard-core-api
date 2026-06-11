import { ClassesRepository } from "./classes.repository";

import {
    CreateClassDto,
    UpdateClassDto,
    ClassQueryDto,
} from "./classes.dto";

import { logger } from "../../shared/utils/logger";
import { AppError } from "../../shared/errors/app.error";

/**
 * =========================================
 * CLASSES SERVICE
 * =========================================
 * Business logic layer for academic classes
 *
 * Responsibilities:
 * - Class creation rules
 * - School-scoped validation
 * - Data consistency checks
 * - Delegation to repository (DB layer)
 * =========================================
 */

export class ClassesService {
    constructor(private readonly classesRepository: ClassesRepository) { }

    /**
     * CREATE CLASS
     */
    async createClass(data: CreateClassDto) {
        try {
            // Ensure no duplicate class name within same school
            const existingClass =
                await this.classesRepository.findByNameAndSchool(
                    data.name,
                    data.schoolId
                );

            if (existingClass) {
                throw new AppError(
                    "Class with this name already exists in this school",
                    409
                );
            }

            const createdClass = await this.classesRepository.create(data);

            logger.info("Class created successfully", {
                classId: createdClass.id,
                schoolId: data.schoolId,
            });

            return createdClass;
        } catch (error: unknown) {
            const err =
                error instanceof Error
                    ? error
                    : new Error(String(error));

            logger.error("Error creating class", {
                message: err.message,
                stack: err.stack,
                module: "classes.service.createClass",
                schoolId: data.schoolId,
                className: data.name,
            });

            throw error;
        }
    }

    /**
     * GET ALL CLASSES (PAGINATED)
     */
    async getAllClasses(query: ClassQueryDto) {
        try {
            const {
                page,
                limit,
                search,
                schoolId,
                isActive,
                gradeLevel,
            } = query;

            const skip = (page - 1) * limit;

            const repositoryQuery = {
                skip,
                take: limit,

                ...(schoolId !== undefined && { schoolId }),
                ...(search !== undefined && { search }),
                ...(isActive !== undefined && { isActive }),
                ...(gradeLevel !== undefined && { gradeLevel }),
            };

            const { data, total } =
                await this.classesRepository.findAll(repositoryQuery);

            const totalPages = Math.ceil(total / limit);

            return {
                data,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages,
                },
            };
        } catch (error: unknown) {
            const err =
                error instanceof Error
                    ? error
                    : new Error(String(error));

            logger.error("Error fetching classes", {
                message: err.message,
                stack: err.stack,
                module: "classes.service.getAllClasses",
            });

            throw new AppError("Failed to fetch classes", 500);
        }
    }

    /**
     * GET CLASS BY ID
     */
    async getClassById(input: {
        classId: string;
        schoolId: string;
    }) {
        try {
            const classData = await this.classesRepository.findById(
                input.classId,
                input.schoolId
            );

            if (!classData) {
                throw new AppError("Class not found", 404);
            }

            return classData;
        } catch (error: unknown) {
            const err =
                error instanceof Error
                    ? error
                    : new Error(String(error));

            logger.error("Error fetching class by ID", {
                message: err.message,
                stack: err.stack,
                module: "classes.service.getClassById",
                classId: input.classId,
                schoolId: input.schoolId,
            });

            if (error instanceof AppError) {
                throw error;
            }

            throw new AppError("Failed to fetch class", 500);
        }
    }

    /**
     * UPDATE CLASS
     */
    async updateClass(input: {
        classId: string;
        schoolId: string;
        data: UpdateClassDto;
    }) {
        try {
            const existingClass = await this.classesRepository.findById(
                input.classId,
                input.schoolId
            );

            if (!existingClass) {
                throw new AppError("Class not found", 404);
            }

            // Optional: prevent duplicate name update
            if (input.data.name) {
                const duplicate =
                    await this.classesRepository.findByNameAndSchool(
                        input.data.name,
                        input.schoolId
                    );

                if (duplicate && duplicate.id !== input.classId) {
                    throw new AppError(
                        "Another class with this name already exists",
                        409
                    );
                }
            }

            const updatedClass = await this.classesRepository.update(
                input.classId,
                input.schoolId,
                input.data
            );

            logger.info("Class updated successfully", {
                classId: input.classId,
                schoolId: input.schoolId,
            });

            return updatedClass;
        } catch (error: unknown) {
            const err =
                error instanceof Error
                    ? error
                    : new Error(String(error));

            logger.error("Error updating class", {
                message: err.message,
                stack: err.stack,
                module: "classes.service.updateClass",
                classId: input.classId,
                schoolId: input.schoolId,
            });

            throw error;
        }
    }
    /**
     * DELETE CLASS
     */
    async deleteClass(input: { classId: string; schoolId: string }) {
        try {
            const existingClass = await this.classesRepository.findById(
                input.classId,
                input.schoolId
            );

            if (!existingClass) {
                throw new AppError("Class not found", 404);
            }

            // Optional safety rule: prevent deleting class with students
            const hasStudents =
                await this.classesRepository.hasStudents(input.classId);

            if (hasStudents) {
                throw new AppError(
                    "Cannot delete class with assigned students",
                    400
                );
            }

            await this.classesRepository.delete(
                input.classId,
                input.schoolId
            );

            logger.info("Class deleted successfully", {
                classId: input.classId,
                schoolId: input.schoolId,
            });

            return true;
        } catch (error: unknown) {
            const err =
                error instanceof Error
                    ? error
                    : new Error(String(error));

            logger.error("Error deleting class", {
                message: err.message,
                stack: err.stack,
                module: "classes.service.deleteClass",
                classId: input.classId,
                schoolId: input.schoolId,
            });

            throw error;
        }
    }
}