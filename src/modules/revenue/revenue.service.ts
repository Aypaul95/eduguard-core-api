import { PrismaClient, InvoiceStatus, PaymentMethod } from "@prisma/client";

import { logger } from "../../config/logger";
import { AppError } from "../../shared/errors/app.error";

/**
 * ============================================================
 * TYPES
 * ============================================================
 */
type DateRange = {
  startDate?: string;
  endDate?: string;
};

/**
 * ============================================================
 * REVENUE SERVICE
 * ============================================================
 * Revenue Intelligence Engine
 * - Payments = realized revenue
 * - Invoices = expected revenue
 * - Expenses = cost base
 */
export class RevenueService {
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
   * BASE DATE FILTER
   * ============================================================
   */
  private buildDateFilter(range?: DateRange) {
    if (!range?.startDate || !range?.endDate) return undefined;

    return {
      gte: new Date(range.startDate),
      lte: new Date(range.endDate),
    };
  }

  /**
   * ============================================================
   * 1. REVENUE DASHBOARD
   * ============================================================
   */
  async getRevenueDashboard(schoolId: string, range?: DateRange) {
    try {
      this.ensureSchoolId(schoolId);

      const dateFilter = this.buildDateFilter(range);

      const [totalRevenue, totalExpenses, invoices, payments] =
        await Promise.all([
          this.prisma.payment.aggregate({
            where: {
              schoolId,
              ...(dateFilter && { createdAt: dateFilter }),
            },
            _sum: { amount: true },
          }),

          this.prisma.expense.aggregate({
            where: {
              schoolId,
              ...(dateFilter && { createdAt: dateFilter }),
            },
            _sum: { amount: true },
          }),

          this.prisma.invoice.findMany({
            where: {
              schoolId,
              ...(dateFilter && { createdAt: dateFilter }),
            },
          }),

          this.prisma.payment.count({
            where: {
              schoolId,
              ...(dateFilter && { createdAt: dateFilter }),
            },
          }),
        ]);

      const revenue = Number(totalRevenue._sum.amount ?? 0);
      const expenses = Number(totalExpenses._sum.amount ?? 0);

      return {
        totalRevenue: revenue,
        totalExpenses: expenses,
        netProfit: revenue - expenses,
        totalInvoices: invoices.length,
        totalPayments: payments,
        outstandingRevenue: invoices.reduce((acc, inv) => {
          return acc + (Number(inv.totalAmount) - Number(inv.amountPaid));
        }, 0),
      };
    } catch (error) {
      logger.error({ error }, "Revenue dashboard failed");
      throw error;
    }
  }

  /**
   * ============================================================
   * 2. REVENUE SUMMARY (INVOICE-BASED)
   * ============================================================
   */
  async getRevenueSummary(schoolId: string) {
    try {
      this.ensureSchoolId(schoolId);

      const invoices = await this.prisma.invoice.findMany({
        where: { schoolId },
      });

      const summary = {
        paid: 0,
        pending: 0,
        partiallyPaid: 0,
        overdue: 0,
      };

      for (const inv of invoices) {
        const amount = Number(inv.totalAmount);

        if (inv.status === InvoiceStatus.PAID) {
          summary.paid += amount;
        } else if (inv.status === InvoiceStatus.PENDING) {
          summary.pending += amount;
        } else if (inv.status === InvoiceStatus.PARTIALLY_PAID) {
          summary.partiallyPaid += amount;
        }
      }

      return summary;
    } catch (error) {
      logger.error({ error }, "Revenue summary failed");
      throw error;
    }
  }

  /**
   * ============================================================
   * 3. REVENUE BY CATEGORY (FEE CATEGORY)
   * ============================================================
   */
  async getRevenueByCategory(schoolId: string) {
    try {
      this.ensureSchoolId(schoolId);

      const payments = await this.prisma.payment.findMany({
        where: { schoolId },
        include: {
          invoice: {
            include: {
              items: true,
            },
          },
        },
      });

      const result: Record<string, number> = {};

      for (const payment of payments) {
        for (const item of payment.invoice.items) {
          const key = item.description;

          result[key] = (result[key] || 0) + Number(item.amount);
        }
      }

      return result;
    } catch (error) {
      logger.error({ error }, "Revenue by category failed");
      throw error;
    }
  }

  /**
   * ============================================================
   * 4. REVENUE BY CLASS (USING ENROLLMENT RELATION)
   * ============================================================
   */
  async getRevenueByClass(schoolId: string) {
    try {
      this.ensureSchoolId(schoolId);

      const payments = await this.prisma.payment.findMany({
        where: { schoolId },
        include: {
          invoice: {
            include: {
              student: {
                include: {
                  enrollments: {
                    include: {
                      class: true,
                    },
                    where: {
                      isCurrent: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      const result: Record<string, number> = {};

      for (const payment of payments) {
        const enrollments =
          payment.invoice.student.enrollments;

        const className =
          enrollments[0]?.class?.name || "UNKNOWN";

        result[className] =
          (result[className] || 0) + Number(payment.amount);
      }

      return result;
    } catch (error) {
      logger.error({ error }, "Revenue by class failed");
      throw error;
    }
  }

  /**
   * ============================================================
   * 5. REVENUE BY PAYMENT METHOD
   * ============================================================
   */
  async getRevenueByPaymentMethod(schoolId: string) {
    try {
      this.ensureSchoolId(schoolId);

      const payments = await this.prisma.payment.groupBy({
        by: ["method"],
        where: { schoolId },
        _sum: {
          amount: true,
        },
      });

      return payments.map((p) => ({
        method: p.method,
        total: Number(p._sum.amount ?? 0),
      }));
    } catch (error) {
      logger.error({ error }, "Revenue by payment method failed");
      throw error;
    }
  }

  /**
   * ============================================================
   * 6. MONTHLY TREND
   * ============================================================
   */
  async getMonthlyTrend(schoolId: string, year: number) {
    try {
      this.ensureSchoolId(schoolId);

      const payments = await this.prisma.payment.findMany({
        where: {
          schoolId,
          createdAt: {
            gte: new Date(`${year}-01-01`),
            lte: new Date(`${year}-12-31`),
          },
        },
      });

      const monthly: Record<string, number> = {};

      for (const p of payments) {
        const month = new Date(p.createdAt).toLocaleString(
          "en-US",
          { month: "short" }
        );

        monthly[month] =
          (monthly[month] || 0) + Number(p.amount);
      }

      return monthly;
    } catch (error) {
      logger.error({ error }, "Revenue trend failed");
      throw error;
    }
  }

  /**
   * ============================================================
   * 7. OUTSTANDING REVENUE
   * ============================================================
   */
  async getOutstandingRevenue(schoolId: string) {
    try {
      this.ensureSchoolId(schoolId);

      const invoices = await this.prisma.invoice.findMany({
        where: {
          schoolId,
          status: {
            in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIALLY_PAID],
          },
        },
      });

      return invoices.reduce((acc, inv) => {
        return (
          acc +
          (Number(inv.totalAmount) - Number(inv.amountPaid))
        );
      }, 0);
    } catch (error) {
      logger.error({ error }, "Outstanding revenue failed");
      throw error;
    }
  }

  /**
   * ============================================================
   * 8. PROFIT & LOSS
   * ============================================================
   */
  async getProfitLoss(schoolId: string) {
    try {
      this.ensureSchoolId(schoolId);

      const [revenue, expenses] = await Promise.all([
        this.prisma.payment.aggregate({
          where: { schoolId },
          _sum: { amount: true },
        }),

        this.prisma.expense.aggregate({
          where: { schoolId },
          _sum: { amount: true },
        }),
      ]);

      const totalRevenue = Number(revenue._sum.amount ?? 0);
      const totalExpenses = Number(expenses._sum.amount ?? 0);

      return {
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
        profitMargin:
          totalRevenue > 0
            ? ((totalRevenue - totalExpenses) /
                totalRevenue) *
              100
            : 0,
      };
    } catch (error) {
      logger.error({ error }, "Profit & loss failed");
      throw error;
    }
  }
}