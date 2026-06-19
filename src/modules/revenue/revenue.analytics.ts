import { PrismaClient } from "@prisma/client";
import { logger } from "../../config/logger";
import { AppError } from "../../shared/errors/app.error";

/**
 * ============================================================
 * TYPES
 * ============================================================
 */
export type ForecastInput = {
  schoolId: string;
  months?: number;
  projectionMonths?: number;
};

export type MonthlyRevenuePoint = {
  month: string;
  total: number;
};

export type RevenueForecastResult = {
  historical: MonthlyRevenuePoint[];
  forecast: MonthlyRevenuePoint[];
  averageMonthlyGrowth: number;
  projectedNextMonth: number;
};

/**
 * ============================================================
 * REVENUE ANALYTICS ENGINE
 * ============================================================
 */
export class RevenueAnalytics {
  constructor(private readonly prisma: PrismaClient) {}

  private ensureSchoolId(schoolId?: string) {
    if (!schoolId) {
      throw new AppError("schoolId is required", 400);
    }
  }

  /**
   * ============================================================
   * GET MONTHLY REVENUE
   * ============================================================
   */
  private async getMonthlyRevenue(
    schoolId: string,
    months: number
  ): Promise<MonthlyRevenuePoint[]> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const payments = await this.prisma.payment.findMany({
      where: {
        schoolId,
        createdAt: { gte: startDate },
      },
    });

    const grouped: Record<string, number> = {};

    for (const p of payments) {
      const date = new Date(p.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;

      grouped[key] = (grouped[key] ?? 0) + Number(p.amount);
    }

    return Object.entries(grouped)
      .map(([month, total]) => ({
        month,
        total,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * ============================================================
   * CALCULATE GROWTH RATE (FIXED SAFE INDEXING)
   * ============================================================
   */
  private calculateGrowthRate(
    data: MonthlyRevenuePoint[]
  ): number {
    if (!data || data.length < 2) return 0;

    let totalGrowth = 0;
    let count = 0;

    for (let i = 1; i < data.length; i++) {
      const prev = data[i - 1];
      const curr = data[i];

      if (!prev || !curr) continue;
      if (prev.total <= 0) continue;

      const growth = (curr.total - prev.total) / prev.total;
      totalGrowth += growth;
      count++;
    }

    return count === 0 ? 0 : totalGrowth / count;
  }

  /**
   * ============================================================
   * FORECAST ENGINE
   * ============================================================
   */
  private generateForecast(
    historical: MonthlyRevenuePoint[],
    projectionMonths: number,
    growthRate: number
  ): MonthlyRevenuePoint[] {
    if (!historical || historical.length === 0) return [];

    const lastPoint = historical[historical.length - 1];
    if (!lastPoint) return [];

    let projected = lastPoint.total;

    const forecast: MonthlyRevenuePoint[] = [];

    for (let i = 1; i <= projectionMonths; i++) {
      projected = projected + projected * growthRate;

      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + i);

      const key = `${futureDate.getFullYear()}-${futureDate.getMonth() + 1}`;

      forecast.push({
        month: key,
        total: Math.max(0, projected),
      });
    }

    return forecast;
  }

  /**
   * ============================================================
   * MAIN FORECAST
   * ============================================================
   */
  async generateRevenueForecast(input: ForecastInput): Promise<RevenueForecastResult> {
    try {
      this.ensureSchoolId(input.schoolId);

      const months = input.months ?? 6;
      const projectionMonths = input.projectionMonths ?? 3;

      const historical = await this.getMonthlyRevenue(
        input.schoolId,
        months
      );

      const growthRate = this.calculateGrowthRate(historical);

      const forecast = this.generateForecast(
        historical,
        projectionMonths,
        growthRate
      );

      const lastHistorical = historical[historical.length - 1];

      const projectedNextMonth =
        forecast[0]?.total ??
        lastHistorical?.total ??
        0;

      logger.info(
        {
          schoolId: input.schoolId,
          growthRate,
          projectedNextMonth,
        },
        "Revenue forecast generated"
      );

      return {
        historical,
        forecast,
        averageMonthlyGrowth: growthRate,
        projectedNextMonth,
      };
    } catch (error) {
      logger.error({ error }, "Revenue forecasting failed");
      throw error;
    }
  }

  /**
   * ============================================================
   * HEALTH SCORE
   * ============================================================
   */
  async getRevenueHealthScore(schoolId: string) {
    try {
      this.ensureSchoolId(schoolId);

      const historical = await this.getMonthlyRevenue(schoolId, 6);

      if (!historical || historical.length === 0) {
        return {
          score: 0,
          status: "NO_DATA",
        };
      }

      const growth = this.calculateGrowthRate(historical);

      const volatility =
        historical.reduce((acc, curr, i, arr) => {
          const prev = arr[i - 1];
          if (!prev) return acc;

          const prevTotal = prev.total ?? 0;
          const currTotal = curr?.total ?? 0;

          return acc + Math.abs(currTotal - prevTotal) / (prevTotal || 1);
        }, 0) / Math.max(1, historical.length - 1);

      let score = 50;

      score += growth * 50;
      score -= volatility * 30;

      score = Math.min(100, Math.max(0, score));

      return {
        score: Math.round(score),
        growthRate: growth,
        volatility,
        status:
          score > 70 ? "HEALTHY" : score > 40 ? "STABLE" : "RISK",
      };
    } catch (error) {
      logger.error({ error }, "Revenue health score failed");
      throw error;
    }
  }
}