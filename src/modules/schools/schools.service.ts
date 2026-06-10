import { PrismaClient, School } from "@prisma/client";
import {
    CreateSchoolDTO,
    UpdateSchoolDTO,
    SchoolQueryDTO,
} from "./schools.dto";
import { AppError } from "../../shared/errors/app.error";
import { logger } from "../../shared/utils/logger";

/**
 * ==============================
 * SCHOOLS SERVICE (BUSINESS LOGIC)
 * ==============================
 * Handles:
 * - School creation
 * - Retrieval (single & list)
 * - Updates
 * - Deletion
 * - Pagination + filtering
 */

const prisma = new PrismaClient();

export class SchoolsService {
    /**
     * CREATE SCHOOL
     */
    async createSchool(data: CreateSchoolDTO): Promise<School> {
        try {
            const existingSchool = await prisma.school.findFirst({
                where: {
                    name: data.name,
                },
            });

            if (existingSchool) {
                throw new AppError("School with this name already exists", 409);
            }

            const school = await prisma.school.create({
                data: {
                    name: data.name,
                    isActive: data.isActive ?? true,
                    ...(data.email !== undefined && { email: data.email }),
                    ...(data.phone !== undefined && { phone: data.phone }),
                    ...(data.address !== undefined && { address: data.address }),
                },
            });

            logger.info("School created in DB", { schoolId: school.id });

            return school;
        } catch (error: any) {
            logger.error("Service error - createSchool", {
                message: error.message,
            });

            if (error instanceof AppError) throw error;

            throw new AppError("Unable to create school", 500);
        }
    }

    /**
     * GET ALL SCHOOLS (PAGINATED)
     */
    async getAllSchools(query: SchoolQueryDTO) {
        try {
            const page = query.page || 1;
            const limit = query.limit || 10;
            const skip = (page - 1) * limit;

            const whereClause: any = {};

            if (query.search) {
                whereClause.name = {
                    contains: query.search,
                    mode: "insensitive",
                };
            }

            if (typeof query.isActive === "boolean") {
                whereClause.isActive = query.isActive;
            }

            const [schools, total] = await Promise.all([
                prisma.school.findMany({
                    where: whereClause,
                    skip,
                    take: limit,
                    orderBy: {
                        createdAt: "desc",
                    },
                }),
                prisma.school.count({
                    where: whereClause,
                }),
            ]);

            return {
                data: schools,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };
        } catch (error: any) {
            logger.error("Service error - getAllSchools", {
                message: error.message,
            });

            throw new AppError("Unable to fetch schools", 500);
        }
    }

    /**
     * GET SCHOOL BY ID
     */
    async getSchoolById(schoolId: string): Promise<School | null> {
        try {
            const school = await prisma.school.findUnique({
                where: {
                    id: schoolId,
                },
            });

            return school;
        } catch (error: any) {
            logger.error("Service error - getSchoolById", {
                schoolId,
                message: error.message,
            });

            throw new AppError("Unable to fetch school", 500);
        }
    }

    /**
     * UPDATE SCHOOL
     */
    async updateSchool(
        schoolId: string,
        data: UpdateSchoolDTO
    ): Promise<School | null> {
        try {
            const existingSchool = await prisma.school.findUnique({
                where: { id: schoolId },
            });

            if (!existingSchool) {
                return null;
            }

            const updatedSchool = await prisma.school.update({
                where: { id: schoolId },
                data: {
                    ...(data.name !== undefined && { name: data.name }),
                    ...(data.email !== undefined && { email: data.email }),
                    ...(data.phone !== undefined && { phone: data.phone }),
                    ...(data.address !== undefined && { address: data.address }),
                    ...(data.isActive !== undefined && { isActive: data.isActive }),
                },
            });

            logger.info("School updated", { schoolId });

            return updatedSchool;
        } catch (error: any) {
            logger.error("Service error - updateSchool", {
                schoolId,
                message: error.message,
            });

            throw new AppError("Unable to update school", 500);
        }
    }

    /**
     * DELETE SCHOOL
     */
    async deleteSchool(schoolId: string): Promise<boolean> {
        try {
            const existingSchool = await prisma.school.findUnique({
                where: { id: schoolId },
            });

            if (!existingSchool) {
                return false;
            }

            await prisma.school.delete({
                where: { id: schoolId },
            });

            logger.info("School deleted", { schoolId });

            return true;
        } catch (error: any) {
            logger.error("Service error - deleteSchool", {
                schoolId,
                message: error.message,
            });

            throw new AppError("Unable to delete school", 500);
        }
    }
}