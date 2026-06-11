import { PrismaClient, Prisma, Parent } from "@prisma/client";

import {
    CreateParentDto,
    UpdateParentDto,
    ParentQueryDto,
} from "./parents.dto";

import { AppError } from "../../shared/errors/app.error";
import { logger } from "../../shared/utils/logger";

export class ParentsService {
    constructor(private readonly prisma: PrismaClient) { }

    /**
     * ============================================================
     * CREATE PARENT
     * ============================================================
     */
    async createParent(
        dto: CreateParentDto,
    ): Promise<Parent> {
        try {
            const school = await this.prisma.school.findUnique({
                where: {
                    id: dto.schoolId,
                },
            });

            if (!school) {
                throw new AppError(
                    "School not found",
                    404,
                    "SCHOOL_NOT_FOUND",
                );
            }

            const existingParent =
                await this.prisma.parent.findFirst({
                    where: {
                        schoolId: dto.schoolId,
                        phone: dto.phone,
                    },
                });

            if (existingParent) {
                throw new AppError(
                    "Parent with this phone number already exists",
                    409,
                    "PARENT_ALREADY_EXISTS",
                );
            }

            return await this.prisma.parent.create({
                data: {
                    schoolId: dto.schoolId,
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    email: dto.email ?? null,
                    phone: dto.phone,
                    address: dto.address ?? null,
                },
            });
        } catch (error: unknown) {
            const err = error as Error;

            logger.error("Create parent failed", {
                message: err.message,
                stack: err.stack,
            });

            throw error;
        }
    }
    /**
     * ============================================================
     * GET PARENT BY ID
     * ============================================================
     */
    async getParentById(parentId: string) {
        const parent = await this.prisma.parent.findUnique({
            where: {
                id: parentId,
            },
            include: {
                children: {
                    include: {
                        student: true,
                    },
                },
            },
        });

        if (!parent) {
            throw new AppError(
                "Parent not found",
                404,
                "PARENT_NOT_FOUND",
            );
        }

        return parent;
    }

    /**
     * ============================================================
     * GET ALL PARENTS
     * ============================================================
     */
    async getParents(query: ParentQueryDto) {
        const {
            page = 1,
            limit = 20,
            search,
            schoolId,
        } = query;

        const skip = (page - 1) * limit;

        const where: Prisma.ParentWhereInput = {
            ...(schoolId && {
                schoolId,
            }),

            ...(search && {
                OR: [
                    {
                        firstName: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    {
                        lastName: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    {
                        phone: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    {
                        email: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                ],
            }),
        };

        const [data, total] = await Promise.all([
            this.prisma.parent.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: "desc",
                },
            }),

            this.prisma.parent.count({
                where,
            }),
        ]);

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * ============================================================
     * UPDATE PARENT
     * ============================================================
     */
    async updateParent(parentId: string, dto: UpdateParentDto) {
        const parent = await this.prisma.parent.findUnique({
            where: {
                id: parentId,
            },
        });

        if (!parent) {
            throw new AppError(
                "Parent not found",
                404,
                "PARENT_NOT_FOUND",
            );
        }

        /**
         * ============================================================
         * CLEAN UPDATE PAYLOAD (REMOVE undefined values)
         * ============================================================
         */
        const cleanData = Object.fromEntries(
            Object.entries(dto).filter(
                ([_, value]) => value !== undefined,
            ),
        );

        return await this.prisma.parent.update({
            where: {
                id: parentId,
            },
            data: cleanData,
        });
    }

    /**
     * ============================================================
     * DELETE PARENT
     * ============================================================
     */
    async deleteParent(
        parentId: string,
    ): Promise<void> {
        const parent =
            await this.prisma.parent.findUnique({
                where: {
                    id: parentId,
                },
            });

        if (!parent) {
            throw new AppError(
                "Parent not found",
                404,
                "PARENT_NOT_FOUND",
            );
        }

        await this.prisma.$transaction([
            this.prisma.parentStudent.deleteMany({
                where: {
                    parentId,
                },
            }),

            this.prisma.parent.delete({
                where: {
                    id: parentId,
                },
            }),
        ]);
    }

    /**
     * ============================================================
     * LINK PARENT TO STUDENT
     * ============================================================
     */
    async linkStudent(
        parentId: string,
        studentId: string,
        relationship: string,
    ) {
        const [parent, student] =
            await Promise.all([
                this.prisma.parent.findUnique({
                    where: { id: parentId },
                }),

                this.prisma.student.findUnique({
                    where: { id: studentId },
                }),
            ]);

        if (!parent) {
            throw new AppError(
                "Parent not found",
                404,
                "PARENT_NOT_FOUND",
            );
        }

        if (!student) {
            throw new AppError(
                "Student not found",
                404,
                "STUDENT_NOT_FOUND",
            );
        }

        if (parent.schoolId !== student.schoolId) {
            throw new AppError(
                "Parent and student must belong to the same school",
                400,
                "SCHOOL_MISMATCH",
            );
        }

        return await this.prisma.parentStudent.create({
            data: {
                parentId,
                studentId,
                relationship,
            },
            include: {
                parent: true,
                student: true,
            },
        });
    }

    /**
     * ============================================================
     * UNLINK STUDENT
     * ============================================================
     */
    async unlinkStudent(
        parentId: string,
        studentId: string,
    ): Promise<void> {
        const relation =
            await this.prisma.parentStudent.findFirst({
                where: {
                    parentId,
                    studentId,
                },
            });

        if (!relation) {
            throw new AppError(
                "Parent/student relationship not found",
                404,
                "RELATIONSHIP_NOT_FOUND",
            );
        }

        await this.prisma.parentStudent.delete({
            where: {
                id: relation.id,
            },
        });
    }

    /**
     * ============================================================
     * GET PARENTS BY SCHOOL
     * ============================================================
     */
    async getParentsBySchool(
        schoolId: string,
    ) {
        return await this.prisma.parent.findMany({
            where: {
                schoolId,
            },
            include: {
                children: {
                    include: {
                        student: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    /**
     * ============================================================
     * GET STUDENTS FOR PARENT
     * ============================================================
     */
    async getParentChildren(
        parentId: string,
    ) {
        return await this.prisma.parentStudent.findMany({
            where: {
                parentId,
            },
            include: {
                student: true,
            },
        });
    }

    /**
     * ============================================================
     * GET PARENTS OF A STUDENT
     * ============================================================
     */
    async getStudentParents(
        studentId: string,
    ) {
        return await this.prisma.parentStudent.findMany({
            where: {
                studentId,
            },
            include: {
                parent: true,
            },
        });
    }

    /**
    * ============================================================
    * Activate Parent
    * ============================================================
    */

    async activateParent(parentId: string) {
        const parent = await this.prisma.parent.findUnique({
            where: { id: parentId },
        });

        if (!parent) {
            throw new AppError(
                "Parent not found",
                404,
                "PARENT_NOT_FOUND",
            );
        }

        return await this.prisma.parent.update({
            where: { id: parentId },
            data: {
                isActive: true,
            },
        });
    }

    /**
         * ============================================================
         * Deactivate Parent
         * ============================================================
         */

    async deactivateParent(parentId: string) {
        const parent = await this.prisma.parent.findUnique({
            where: { id: parentId },
        });

        if (!parent) {
            throw new AppError(
                "Parent not found",
                404,
                "PARENT_NOT_FOUND",
            );
        }

        return await this.prisma.parent.update({
            where: { id: parentId },
            data: {
                isActive: false,
            },
        });
    }
}