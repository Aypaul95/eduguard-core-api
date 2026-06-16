//src/modules/fees/fees.engine.ts
import { PrismaClient, Prisma } from "@prisma/client";
import { logger } from "../../config/logger";

/**
 * ============================================================
 * Fees Engine (Computation Layer)
 * ============================================================
 * Responsible for:
 * - Fee calculation logic
 * - Discount + scholarship application
 * - Billing breakdown generation
 * - Revenue estimation
 * ============================================================
 */

export interface FeeComputationBreakdown {
  studentId: string;
  schoolId: string;

  baseAmount: number;
  discountAmount: number;
  scholarshipAmount: number;
  totalPayable: number;

  details: {
    feeItems: Array<{
      feeStructureId: string;
      categoryName?: string;
      amount: number;
    }>;

    discount: {
      name: string;
      percentage: number | null;
      fixedAmount: number | null;
    } | null;

    scholarship: {
      type: string;
      amount: number;
      reason: string | null;
    } | null;
  };
}

export class FeesEngine {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Helper: Convert Prisma Decimal safely
   */
  private toNumber(value: Prisma.Decimal | number | null): number {
    if (!value) return 0;
    return typeof value === "number" ? value : Number(value);
  }

  /**
   * ============================================================
   * MAIN FEE COMPUTATION LOGIC
   * ============================================================
   */
  async computeStudentFees(
    studentId: string,
    schoolId: string
  ): Promise<FeeComputationBreakdown> {
    try {
      /**
       * STEP 1: Get student fee assignments
       */
      const assignments = await this.prisma.studentFeeAssignment.findMany({
        where: {
          studentId,
          feeStructure: {
            schoolId,
          },
        },
        include: {
          feeStructure: {
            include: {
              category: true,
            },
          },
        },
      });

      if (!assignments.length) {
        return {
          studentId,
          schoolId,
          baseAmount: 0,
          discountAmount: 0,
          scholarshipAmount: 0,
          totalPayable: 0,
          details: {
            feeItems: [],
            discount: null,
            scholarship: null,
          },
        };
      }

      /**
       * STEP 2: Base fee calculation
       */
      let baseAmount = 0;

      const feeItems = assignments.map((a) => {
        const amount = this.toNumber(a.feeStructure.amount);
        baseAmount += amount;

        return {
          feeStructureId: a.feeStructureId,
          categoryName: a.feeStructure.category?.name,
          amount,
        };
      });

      /**
       * STEP 3: Scholarship
       */
      const scholarship = await this.prisma.scholarship.findFirst({
        where: { studentId, schoolId },
      });

      const scholarshipAmount = this.toNumber(scholarship?.amount ?? 0);

      /**
       * STEP 4: Discount
       */
      const discount = await this.prisma.discount.findFirst({
        where: { schoolId },
      });

      let discountAmount = 0;

      if (discount) {
        const percentage = discount.percentage ?? 0;

        if (percentage > 0) {
          discountAmount += (baseAmount * percentage) / 100;
        }

        discountAmount += this.toNumber(discount.fixedAmount);
      }

      /**
       * STEP 5: Final computation
       */
      let totalPayable =
        baseAmount - scholarshipAmount - discountAmount;

      if (totalPayable < 0) totalPayable = 0;

      /**
       * STEP 6: Response
       */
      return {
        studentId,
        schoolId,

        baseAmount,
        discountAmount,
        scholarshipAmount,
        totalPayable,

        details: {
          feeItems,

          discount: discount
            ? {
                name: discount.name,
                percentage: discount.percentage ?? null,
                fixedAmount: this.toNumber(discount.fixedAmount),
              }
            : null,

          scholarship: scholarship
            ? {
                type: scholarship.type,
                amount: this.toNumber(scholarship.amount),
                reason: scholarship.reason ?? null,
              }
            : null,
        },
      };
    } catch (error) {
      logger.error({ error }, "FeesEngine: computation failed");
      throw new Error("Fee computation failed");
    }
  }

  /**
   * ============================================================
   * SCHOOL REVENUE ESTIMATION
   * ============================================================
   */
  async computeTotalSchoolRevenueEstimate(schoolId: string) {
    try {
      const assignments =
        await this.prisma.studentFeeAssignment.findMany({
          where: {
            feeStructure: { schoolId },
          },
          include: {
            feeStructure: true,
          },
        });

      const total = assignments.reduce((sum, a) => {
        return sum + this.toNumber(a.feeStructure.amount);
      }, 0);

      return {
        schoolId,
        estimatedRevenue: total,
        totalAssignments: assignments.length,
      };
    } catch (error) {
      logger.error(
        { error },
        "FeesEngine: revenue estimation failed"
      );
      throw new Error("Revenue estimation failed");
    }
  }
}