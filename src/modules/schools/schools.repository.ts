import { PrismaClient, School } from "@prisma/client";
import { CreateSchoolDTO, UpdateSchoolDTO, SchoolQueryDTO } from "./schools.dto";
import { AppError } from "../../shared/errors/app.error";
import { logger } from "../../shared/utils/logger";

/**
 * ==============================
 * SCHOOLS REPOSITORY (DATA ACCESS LAYER)
 * ==============================
 * ONLY responsible for database operations.
 * NO business logic here.
 */

const prisma = new PrismaClient();

export class SchoolsRepository {
    /**
     * CREATE SCHOOL
     */
    async create(data: CreateSchoolDTO): Promise<School> {
        try {
            const school = await prisma.school.create({
                data: {
                    name: data.name,

                    ...(data.email !== undefined && { email: data.email }),
                    ...(data.phone !== undefined && { phone: data.phone }),
                    ...(data.address !== undefined && { address: data.address }),

                    isActive: data.isActive ?? true,
                },
            });

            return school;
        } catch (error: any) {
            logger.error("Repository error - create school", {
                message: error.message,
            });

            throw new AppError("Database error while creating school", 500);
        }
    }

    /**
     * FIND SCHOOL BY ID
     */
    async findById(schoolId: string): Promise<School | null> {
        try {
            return await prisma.school.findUnique({
                where: {
                    id: schoolId,
                },
            });
        } catch (error: any) {
            logger.error("Repository error - findById", {
                schoolId,
                message: error.message,
            });

            throw new AppError("Database error while fetching school", 500);
        }
    }

    /**
     * FIND SCHOOL BY NAME
     */
    async findByName(name: string): Promise<School | null> {
        try {
            return await prisma.school.findFirst({
                where: {
                    name,
                },
            });
        } catch (error: any) {
            logger.error("Repository error - findByName", {
                name,
                message: error.message,
            });

            throw new AppError("Database error while searching school", 500);
        }
    }

    /**
     * GET ALL SCHOOLS (PAGINATED + FILTERED)
     */
    async findAll(query: SchoolQueryDTO): Promise<{
        data: School[];
        total: number;
    }> {
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

            const [data, total] = await Promise.all([
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

            return { data, total };
        } catch (error: any) {
            logger.error("Repository error - findAll", {
                message: error.message,
            });

            throw new AppError("Database error while fetching schools", 500);
        }
    }

    /**
     * UPDATE SCHOOL
     */
    async update(
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

            return await prisma.school.update({
                where: {
                    id: schoolId,
                },
                data: {
                    ...(data.name !== undefined && { name: data.name }),
                    ...(data.email !== undefined && { email: data.email }),
                    ...(data.phone !== undefined && { phone: data.phone }),
                    ...(data.address !== undefined && { address: data.address }),
                    ...(data.isActive !== undefined && { isActive: data.isActive }),
                },
            });
        } catch (error: any) {
            logger.error("Repository error - update school", {
                schoolId,
                message: error.message,
            });

            throw new AppError("Database error while updating school", 500);
        }
    }

    /**
     * DELETE SCHOOL
     */
    async delete(schoolId: string): Promise<boolean> {
        try {
            const existingSchool = await prisma.school.findUnique({
                where: { id: schoolId },
            });

            if (!existingSchool) {
                return false;
            }

            await prisma.school.delete({
                where: {
                    id: schoolId,
                },
            });

            return true;
        } catch (error: any) {
            logger.error("Repository error - delete school", {
                schoolId,
                message: error.message,
            });

            throw new AppError("Database error while deleting school", 500);
        }
    }
}