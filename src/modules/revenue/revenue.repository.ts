import { PrismaClient, InvoiceStatus } from "@prisma/client";
import { logger } from "../../config/logger";
import { AppError } from "../../shared/errors/app.error";

/**
 * ============================================================
 * TYPES
 * ============================================================
 */

export type DateRange = {
  startDate?: string;
  endDate?: string;
};

export type SchoolScopedQuery = {
  schoolId: string;
};

/**
 * ============================================================
 * REVENUE REPOSITORY
 * ============================================================
 * Handles all raw database operations for revenue module
 * No business logic here — ONLY queries
 */
export class RevenueRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * ============================================================
   * SAFETY CHECK
   * ============================================================
   */
  private ensureSchoolId(schoolId?: string) {
    if (!schoolId) {
      throw new AppError("schoolId is required", 400);
    }
  }

  /**
   * ============================================================
   * TOTAL PAYMENTS (REVENUE SOURCE)
   * ============================================================
   */
  async getTotalRevenue(schoolId: string, range?: DateRange) {
    try {
      this.ensureSchoolId(schoolId);

      return await this.prisma.payment.aggregate({
        where: {
          schoolId,
          ...(range?.startDate &&
            range?.endDate && {
              createdAt: {
                gte: new Date(range.startDate),
                lte: new Date(range.endDate),
              },
            }),
        },
        _sum: {
          amount: true,
        },
      });
    } catch (error) {
      logger.error({ error }, "getTotalRevenue failed");
      throw error;
    }
  }

  /**
   * ============================================================
   * TOTAL EXPENSES
   * ============================================================
   */
  async getTotalExpenses(schoolId: string, range?: DateRange) {
    try {
      this.ensureSchoolId(schoolId);

      return await this.prisma.expense.aggregate({
        where: {
          schoolId,
          ...(range?.startDate &&
            range?.endDate && {
              createdAt: {
                gte: new Date(range.startDate),
                lte: new Date(range.endDate),
              },
            }),
        },
        _sum: {
          amount: true,
        },
      });
    } catch (error) {
      logger.error({ error }, "getTotalExpenses failed");
      throw error;
    }
  }

  /**
   * ============================================================
   * INVOICES (FOR OUTSTANDING REVENUE)
   * ============================================================
   */
  async getInvoices(schoolId: string) {
    try {
      this.ensureSchoolId(schoolId);

      return await this.prisma.invoice.findMany({
        where: {
          schoolId,
        },
      });
    } catch (error) {
      logger.error({ error }, "getInvoices failed");
      throw error;
    }
  }

  /**
   * ============================================================
   * REVENUE BY PAYMENT METHOD
   * ============================================================
   */
  async getRevenueByPaymentMethod(schoolId: string) {
    try {
      this.ensureSchoolId(schoolId);

      return await this.prisma.payment.groupBy({
        by: ["method"],
        where: {
          schoolId,
        },
        _sum: {
          amount: true,
        },
      });
    } catch (error) {
      logger.error({ error }, "getRevenueByPaymentMethod failed");
      throw error;
    }
  }

  /**
   * ============================================================
   * REVENUE BY CLASS (THROUGH ENROLLMENT)
   * ============================================================
   */
  async getPaymentsWithStudentClass(schoolId: string) {
    try {
      this.ensureSchoolId(schoolId);

      return await this.prisma.payment.findMany({
        where: {
          schoolId,
        },
        include: {
          invoice: {
            include: {
              student: {
                include: {
                  enrollments: {
                    where: {
                      isCurrent: true,
                    },
                    include: {
                      class: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    } catch (error) {
      logger.error({ error }, "getPaymentsWithStudentClass failed");
      throw error;
    }
  }

  /**
   * ============================================================
   * MONTHLY PAYMENTS (TREND DATA)
   * ============================================================
   */
  async getPaymentsByDateRange(
    schoolId: string,
    range: { start: Date; end: Date }
  ) {
    try {
      this.ensureSchoolId(schoolId);

      return await this.prisma.payment.findMany({
        where: {
          schoolId,
          createdAt: {
            gte: range.start,
            lte: range.end,
          },
        },
      });
    } catch (error) {
      logger.error({ error }, "getPaymentsByDateRange failed");
      throw error;
    }
  }

  /**
   * ============================================================
   * OUTSTANDING INVOICES
   * ============================================================
   */
  async getOutstandingInvoices(schoolId: string) {
    try {
      this.ensureSchoolId(schoolId);

      return await this.prisma.invoice.findMany({
        where: {
          schoolId,
          status: {
            in: [
              InvoiceStatus.PENDING,
              InvoiceStatus.PARTIALLY_PAID,
            ],
          },
        },
      });
    } catch (error) {
      logger.error({ error }, "getOutstandingInvoices failed");
      throw error;
    }
  }

  /**
   * ============================================================
   * INVOICE WITH ITEMS
   * ============================================================
   */
  async getInvoicesWithItems(schoolId: string) {
    try {
      this.ensureSchoolId(schoolId);

      return await this.prisma.invoice.findMany({
        where: {
          schoolId,
        },
        include: {
          items: true,
        },
      });
    } catch (error) {
      logger.error({ error }, "getInvoicesWithItems failed");
      throw error;
    }
  }
}