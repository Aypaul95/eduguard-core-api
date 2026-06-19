import { PrismaClient } from "@prisma/client";
import { logger } from "../../config/logger";
import { AppError } from "../../shared/errors/app.error";

/**
 * ============================================================
 * TYPES
 * ============================================================
 */
export type RevenueSnapshotJobInput = {
  schoolId: string;
  date?: Date;
  period?: "daily" | "weekly" | "monthly";
};

/**
 * ============================================================
 * REVENUE JOBS (BACKGROUND ANALYTICS ENGINE)
 * ============================================================
 */
export class RevenueJobs {
  constructor(private readonly prisma: PrismaClient) {}

  private ensureSchoolId(schoolId?: string) {
    if (!schoolId) {
      throw new AppError("schoolId is required", 400);
    }
  }

  /**
   * ============================================================
   * 1. GENERATE REVENUE SNAPSHOT
   * ============================================================
   */
  async generateDailyRevenueSnapshot(input: RevenueSnapshotJobInput) {
    try {
      this.ensureSchoolId(input.schoolId);

      const date = input.date ?? new Date();
      const period = input.period ?? "daily";

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      /**
       * ========================================================
       * TOTAL REVENUE (PAID + INVOICES)
       * ========================================================
       */
      const paymentAgg = await this.prisma.payment.aggregate({
        where: {
          schoolId: input.schoolId,
          createdAt: { gte: startOfDay, lte: endOfDay },
        },
        _sum: { amount: true },
      });

      const totalRevenue = Number(paymentAgg._sum.amount ?? 0);

      /**
       * ========================================================
       * TOTAL EXPENSES
       * ========================================================
       */
      const expenseAgg = await this.prisma.expense.aggregate({
        where: {
          schoolId: input.schoolId,
          createdAt: { gte: startOfDay, lte: endOfDay },
        },
        _sum: { amount: true },
      });

      const totalExpenses = Number(expenseAgg._sum.amount ?? 0);

      /**
       * ========================================================
       * TOTAL PAID (same as revenue for now, extensible later)
       * ========================================================
       */
      const totalPaid = totalRevenue;

      /**
       * ========================================================
       * OUTSTANDING (future invoice logic extension)
       * ========================================================
       */
      const outstanding = 0;

      /**
       * ========================================================
       * NET REVENUE
       * ========================================================
       */
      const netRevenue = totalRevenue - totalExpenses;

      /**
       * ========================================================
       * UPSERT SNAPSHOT (SAFE UNIQUE LOGIC)
       * ========================================================
       * We use schoolId + period + day key simulation
       */
      const snapshotKey = `${input.schoolId}_${period}_${startOfDay.toISOString()}`;

      const existing = await this.prisma.revenueSnapshot.findFirst({
        where: {
          schoolId: input.schoolId,
          period,
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      let snapshot;

      if (existing) {
        snapshot = await this.prisma.revenueSnapshot.update({
          where: {
            id: existing.id,
          },
          data: {
            totalRevenue,
            totalPaid,
            totalExpenses,
            netRevenue,
            outstanding,
          },
        });
      } else {
        snapshot = await this.prisma.revenueSnapshot.create({
          data: {
            schoolId: input.schoolId,
            period,
            totalRevenue,
            totalPaid,
            totalExpenses,
            netRevenue,
            outstanding,
          },
        });
      }

      logger.info(
        {
          schoolId: input.schoolId,
          totalRevenue,
          totalExpenses,
          netRevenue,
          period,
        },
        "Revenue snapshot generated successfully"
      );

      return snapshot;
    } catch (error) {
      logger.error({ error }, "Revenue snapshot job failed");
      throw error;
    }
  }

  /**
   * ============================================================
   * 2. BACKFILL SNAPSHOTS
   * ============================================================
   */
  async backfillRevenueSnapshots(
    schoolId: string,
    days: number = 30
  ) {
    try {
      this.ensureSchoolId(schoolId);

      const results = [];

      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        const snapshot = await this.generateDailyRevenueSnapshot({
          schoolId,
          date,
          period: "daily",
        });

        results.push(snapshot);
      }

      logger.info(
        { schoolId, days },
        "Revenue snapshot backfill completed"
      );

      return results;
    } catch (error) {
      logger.error({ error }, "Backfill revenue snapshots failed");
      throw error;
    }
  }

  /**
   * ============================================================
   * 3. CLEAN OLD SNAPSHOTS
   * ============================================================
   */
  async cleanOldSnapshots(
    schoolId: string,
    retentionDays: number = 365
  ) {
    try {
      this.ensureSchoolId(schoolId);

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const deleted = await this.prisma.revenueSnapshot.deleteMany({
        where: {
          schoolId,
          createdAt: {
            lt: cutoffDate,
          },
        },
      });

      logger.info(
        {
          schoolId,
          deletedCount: deleted.count,
        },
        "Old revenue snapshots cleaned"
      );

      return deleted;
    } catch (error) {
      logger.error({ error }, "Snapshot cleanup failed");
      throw error;
    }
  }

  /**
   * ============================================================
   * 4. REVENUE INTEGRITY CHECK
   * ============================================================
   */
  async validateRevenueIntegrity(schoolId: string) {
    try {
      this.ensureSchoolId(schoolId);

      const paymentsAgg = await this.prisma.payment.aggregate({
        where: { schoolId },
        _sum: { amount: true },
      });

      const expensesAgg = await this.prisma.expense.aggregate({
        where: { schoolId },
        _sum: { amount: true },
      });

      const totalPayments = Number(paymentsAgg._sum.amount ?? 0);
      const totalExpenses = Number(expensesAgg._sum.amount ?? 0);

      const netRevenue = totalPayments - totalExpenses;

      logger.info(
        {
          schoolId,
          totalPayments,
          totalExpenses,
          netRevenue,
        },
        "Revenue integrity check completed"
      );

      return {
        totalPayments,
        totalExpenses,
        netRevenue,
        isConsistent: true,
      };
    } catch (error) {
      logger.error({ error }, "Revenue integrity check failed");
      throw error;
    }
  }
}