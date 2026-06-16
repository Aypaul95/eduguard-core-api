//src/modules/fees/fees.repository.ts
import { PrismaClient, Prisma } from "@prisma/client";
import { logger } from "../../config/logger";

/**
 * ============================================================
 * Fees Repository (Database Access Layer)
 * ============================================================
 * Responsible for:
 * - Pure DB queries (no business logic)
 * - Multi-school data isolation (schoolId)
 * - Prisma abstraction layer
 * ============================================================
 */

export class FeesRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * ============================================================
   * FEE CATEGORY
   * ============================================================
   */

  async createFeeCategory(data: Prisma.FeeCategoryCreateInput) {
    try {
      return await this.prisma.feeCategory.create({ data });
    } catch (error) {
      logger.error({ error }, "Repository: createFeeCategory failed");
      throw new Error("Database error creating fee category");
    }
  }

  async findFeeCategoriesBySchool(schoolId: string) {
    try {
      return await this.prisma.feeCategory.findMany({
        where: { schoolId },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      logger.error({ error }, "Repository: findFeeCategoriesBySchool failed");
      throw new Error("Database error fetching fee categories");
    }
  }

  async updateFeeCategory(
    id: string,
    schoolId: string,
    data: Prisma.FeeCategoryUpdateInput
  ) {
    try {
      return await this.prisma.feeCategory.update({
        where: {
          id,
          schoolId,
        },
        data,
      });
    } catch (error) {
      logger.error({ error }, "Repository: updateFeeCategory failed");
      throw new Error("Database error updating fee category");
    }
  }

  async deleteFeeCategory(id: string, schoolId: string) {
    try {
      return await this.prisma.feeCategory.delete({
        where: {
          id,
          schoolId,
        },
      });
    } catch (error) {
      logger.error({ error }, "Repository: deleteFeeCategory failed");
      throw new Error("Database error deleting fee category");
    }
  }

  /**
   * ============================================================
   * FEE STRUCTURE
   * ============================================================
   */

  async createFeeStructure(data: Prisma.FeeStructureCreateInput) {
    try {
      return await this.prisma.feeStructure.create({ data });
    } catch (error) {
      logger.error({ error }, "Repository: createFeeStructure failed");
      throw new Error("Database error creating fee structure");
    }
  }

  async findFeeStructuresBySchool(schoolId: string) {
    try {
      return await this.prisma.feeStructure.findMany({
        where: { schoolId },
        include: {
          category: true,
        },
      });
    } catch (error) {
      logger.error({ error }, "Repository: findFeeStructuresBySchool failed");
      throw new Error("Database error fetching fee structures");
    }
  }

  async updateFeeStructure(
    id: string,
    schoolId: string,
    data: Prisma.FeeStructureUpdateInput
  ) {
    try {
      return await this.prisma.feeStructure.update({
        where: {
          id,
          schoolId,
        },
        data,
      });
    } catch (error) {
      logger.error({ error }, "Repository: updateFeeStructure failed");
      throw new Error("Database error updating fee structure");
    }
  }

  /**
   * ============================================================
   * STUDENT FEE ASSIGNMENT
   * ============================================================
   */

  async assignFeeToStudent(data: Prisma.StudentFeeAssignmentCreateInput) {
    try {
      return await this.prisma.studentFeeAssignment.create({ data });
    } catch (error) {
      logger.error({ error }, "Repository: assignFeeToStudent failed");
      throw new Error("Database error assigning fee to student");
    }
  }

  async bulkAssignFeesToStudents(
    data: Prisma.StudentFeeAssignmentCreateManyInput[]
  ) {
    try {
      return await this.prisma.studentFeeAssignment.createMany({
        data,
        skipDuplicates: true,
      });
    } catch (error) {
      logger.error({ error }, "Repository: bulkAssignFeesToStudents failed");
      throw new Error("Database error bulk assigning fees");
    }
  }

  async updateStudentFeeAssignment(
    id: string,
    data: Prisma.StudentFeeAssignmentUpdateInput
  ) {
    try {
      return await this.prisma.studentFeeAssignment.update({
        where: { id },
        data,
      });
    } catch (error) {
      logger.error({ error }, "Repository: updateStudentFeeAssignment failed");
      throw new Error("Database error updating fee assignment");
    }
  }

  async findStudentFeeAssignments(studentId: string, schoolId: string) {
    try {
      return await this.prisma.studentFeeAssignment.findMany({
        where: {
          studentId,
          feeStructure: {
            schoolId,
          },
        },
        include: {
          feeStructure: true,
        },
      });
    } catch (error) {
      logger.error({ error }, "Repository: findStudentFeeAssignments failed");
      throw new Error("Database error fetching student fee assignments");
    }
  }

  /**
   * ============================================================
   * DISCOUNTS
   * ============================================================
   */

  async createDiscount(data: Prisma.DiscountCreateInput) {
    try {
      return await this.prisma.discount.create({ data });
    } catch (error) {
      logger.error({ error }, "Repository: createDiscount failed");
      throw new Error("Database error creating discount");
    }
  }

  async findDiscountBySchool(schoolId: string) {
    try {
      return await this.prisma.discount.findFirst({
        where: { schoolId },
      });
    } catch (error) {
      logger.error({ error }, "Repository: findDiscountBySchool failed");
      throw new Error("Database error fetching discount");
    }
  }

  /**
   * ============================================================
   * SCHOLARSHIP
   * ============================================================
   */

  async createScholarship(data: Prisma.ScholarshipCreateInput) {
    try {
      return await this.prisma.scholarship.create({ data });
    } catch (error) {
      logger.error({ error }, "Repository: createScholarship failed");
      throw new Error("Database error creating scholarship");
    }
  }

  async findScholarshipByStudent(studentId: string, schoolId: string) {
    try {
      return await this.prisma.scholarship.findFirst({
        where: {
          studentId,
          schoolId,
        },
      });
    } catch (error) {
      logger.error({ error }, "Repository: findScholarshipByStudent failed");
      throw new Error("Database error fetching scholarship");
    }
  }
}