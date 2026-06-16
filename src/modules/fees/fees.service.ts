//src/modules/fees/fees.service.ts
import { PrismaClient, Prisma } from "@prisma/client";
import {
  CreateFeeCategoryDto,
  UpdateFeeCategoryDto,
  CreateFeeStructureDto,
  UpdateFeeStructureDto,
  AssignFeeToStudentDto,
  BulkAssignFeeToStudentsDto,
  UpdateStudentFeeAssignmentDto,
  CreateDiscountDto,
  CreateScholarshipDto,
} from "./fees.dto";

import { logger } from "../../config/logger";

export class FeesService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * ============================================================
   * SAFETY HELPER
   * ============================================================
   */
  private ensureSchoolId(schoolId?: string) {
    if (!schoolId) {
      throw new Error("schoolId is required");
    }
  }

  /**
   * ============================================================
   * FEE CATEGORY
   * ============================================================
   */

  async createFeeCategory(dto: CreateFeeCategoryDto) {
    try {
      this.ensureSchoolId(dto.schoolId);

      return await this.prisma.feeCategory.create({
        data: {
          schoolId: dto.schoolId,
          name: dto.name,
          description: dto.description ?? null,
        },
      });
    } catch (error) {
      logger.error({ error }, "Failed to create fee category");
      throw new Error("Unable to create fee category");
    }
  }

  async updateFeeCategory(
    id: string,
    dto: UpdateFeeCategoryDto,
    schoolId: string
  ) {
    try {
      this.ensureSchoolId(schoolId);

      return await this.prisma.feeCategory.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.description !== undefined && {
            description: dto.description,
          }),
        },
      });
    } catch (error) {
      logger.error({ error }, "Failed to update fee category");
      throw new Error("Unable to update fee category");
    }
  }

  async deleteFeeCategory(id: string, schoolId: string) {
    try {
      this.ensureSchoolId(schoolId);

      return await this.prisma.feeCategory.delete({
        where: { id },
      });
    } catch (error) {
      logger.error({ error }, "Failed to delete fee category");
      throw new Error("Unable to delete fee category");
    }
  }

  async getFeeCategories(schoolId: string) {
    try {
      this.ensureSchoolId(schoolId);

      return await this.prisma.feeCategory.findMany({
        where: { schoolId },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      logger.error({ error }, "Failed to fetch fee categories");
      throw new Error("Unable to fetch fee categories");
    }
  }

  /**
   * ============================================================
   * FEE STRUCTURE
   * ============================================================
   */

  async createFeeStructure(dto: CreateFeeStructureDto) {
    try {
      this.ensureSchoolId(dto.schoolId);

      return await this.prisma.feeStructure.create({
        data: {
          schoolId: dto.schoolId,
          feeCategoryId: dto.feeCategoryId,
          classId: dto.classId ?? null,
          academicYear: dto.academicYear,
          amount: new Prisma.Decimal(dto.amount),
        },
      });
    } catch (error) {
      logger.error({ error }, "Failed to create fee structure");
      throw new Error("Unable to create fee structure");
    }
  }

  async updateFeeStructure(
    id: string,
    dto: UpdateFeeStructureDto,
    schoolId: string
  ) {
    try {
      this.ensureSchoolId(schoolId);

      return await this.prisma.feeStructure.update({
        where: { id },
        data: {
          ...(dto.feeCategoryId !== undefined && {
            feeCategoryId: dto.feeCategoryId,
          }),
          ...(dto.classId !== undefined && {
            classId: dto.classId ?? null,
          }),
          ...(dto.academicYear !== undefined && {
            academicYear: dto.academicYear,
          }),
          ...(dto.amount !== undefined && {
            amount: new Prisma.Decimal(dto.amount),
          }),
        },
      });
    } catch (error) {
      logger.error({ error }, "Failed to update fee structure");
      throw new Error("Unable to update fee structure");
    }
  }

  async getFeeStructures(schoolId: string) {
    try {
      this.ensureSchoolId(schoolId);

      return await this.prisma.feeStructure.findMany({
        where: { schoolId },
        include: { category: true },
      });
    } catch (error) {
      logger.error({ error }, "Failed to fetch fee structures");
      throw new Error("Unable to fetch fee structures");
    }
  }

  /**
   * ============================================================
   * STUDENT FEE ASSIGNMENT
   * ============================================================
   */

  async assignFeeToStudent(dto: AssignFeeToStudentDto) {
    try {
      return await this.prisma.studentFeeAssignment.create({
        data: dto,
      });
    } catch (error) {
      logger.error({ error }, "Failed to assign fee to student");
      throw new Error("Unable to assign fee to student");
    }
  }

  async bulkAssignFeesToStudents(dto: BulkAssignFeeToStudentsDto) {
    try {
      return await this.prisma.studentFeeAssignment.createMany({
        data: dto.studentIds.map((studentId) => ({
          studentId,
          feeStructureId: dto.feeStructureId,
        })),
        skipDuplicates: true,
      });
    } catch (error) {
      logger.error({ error }, "Failed bulk fee assignment");
      throw new Error("Unable to assign fees in bulk");
    }
  }

  async updateStudentFeeStatus(
    id: string,
    dto: UpdateStudentFeeAssignmentDto
  ) {
    try {
      return await this.prisma.studentFeeAssignment.update({
        where: { id },
        data: { status: dto.status },
      });
    } catch (error) {
      logger.error({ error }, "Failed to update fee status");
      throw new Error("Unable to update fee status");
    }
  }

  /**
   * ============================================================
   * DISCOUNTS
   * ============================================================
   */

  async createDiscount(dto: CreateDiscountDto) {
    try {
      this.ensureSchoolId(dto.schoolId);

      return await this.prisma.discount.create({
        data: {
          ...dto,
          percentage: dto.percentage ?? null,
          fixedAmount: dto.fixedAmount
            ? new Prisma.Decimal(dto.fixedAmount)
            : null,
        },
      });
    } catch (error) {
      logger.error({ error }, "Failed to create discount");
      throw new Error("Unable to create discount");
    }
  }

  /**
   * ============================================================
   * SCHOLARSHIP
   * ============================================================
   */

  async createScholarship(dto: CreateScholarshipDto) {
    try {
      this.ensureSchoolId(dto.schoolId);

      return await this.prisma.scholarship.create({
        data: {
          schoolId: dto.schoolId,
          studentId: dto.studentId,
          type: dto.type,
          amount: new Prisma.Decimal(dto.amount),
          reason: dto.reason ?? null,
        },
      });
    } catch (error) {
      logger.error({ error }, "Failed to create scholarship");
      throw new Error("Unable to create scholarship");
    }
  }

  /**
   * ============================================================
   * CALCULATION ENGINE
   * ============================================================
   */

  async calculateStudentFees(studentId: string, schoolId: string) {
    try {
      this.ensureSchoolId(schoolId);

      const assignments = await this.prisma.studentFeeAssignment.findMany({
        where: {
          studentId,
          feeStructure: { schoolId },
        },
        include: { feeStructure: true },
      });

      let total = new Prisma.Decimal(0);

      for (const a of assignments) {
        total = total.plus(a.feeStructure.amount);
      }

      const scholarship = await this.prisma.scholarship.findFirst({
        where: { studentId, schoolId },
      });

      if (scholarship) {
        total = total.minus(new Prisma.Decimal(scholarship.amount));
      }

      const discount = await this.prisma.discount.findFirst({
        where: { schoolId },
      });

      if (discount?.percentage) {
        total = total.minus(total.mul(discount.percentage / 100));
      }

      if (discount?.fixedAmount) {
        total = total.minus(discount.fixedAmount);
      }

      if (total.lessThan(0)) total = new Prisma.Decimal(0);

      return {
        studentId,
        schoolId,
        totalPayable: total,
        breakdown: { assignments, scholarship, discount },
      };
    } catch (error) {
      logger.error({ error }, "Fee calculation failed");
      throw new Error("Unable to calculate student fees");
    }
  }
}