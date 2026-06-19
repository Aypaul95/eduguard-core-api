import { z } from "zod";

/**
 * ============================================================
 * COMMON FILTER SCHEMAS
 * ============================================================
 */

export const schoolIdSchema = z
  .string()
  .uuid("Invalid school ID format");

export const dateRangeSchema = z.object({
  startDate: z
    .string()
    .datetime()
    .optional(),

  endDate: z
    .string()
    .datetime()
    .optional(),
});

/**
 * ============================================================
 * REVENUE DASHBOARD
 * ============================================================
 */

export const revenueDashboardQuerySchema = z.object({
  schoolId: schoolIdSchema,

  startDate: z
    .string()
    .datetime()
    .optional(),

  endDate: z
    .string()
    .datetime()
    .optional(),
});

export type RevenueDashboardQueryDto =
  z.infer<typeof revenueDashboardQuerySchema>;

/**
 * ============================================================
 * REVENUE SUMMARY
 * ============================================================
 */

export const revenueSummaryQuerySchema = z.object({
  schoolId: schoolIdSchema,

  academicYear: z
    .string()
    .min(3)
    .max(20)
    .optional(),

  startDate: z
    .string()
    .datetime()
    .optional(),

  endDate: z
    .string()
    .datetime()
    .optional(),
});

export type RevenueSummaryQueryDto =
  z.infer<typeof revenueSummaryQuerySchema>;

/**
 * ============================================================
 * REVENUE BY CATEGORY
 * ============================================================
 */

export const revenueByCategoryQuerySchema = z.object({
  schoolId: schoolIdSchema,

  academicYear: z
    .string()
    .optional(),

  startDate: z
    .string()
    .datetime()
    .optional(),

  endDate: z
    .string()
    .datetime()
    .optional(),
});

export type RevenueByCategoryQueryDto =
  z.infer<typeof revenueByCategoryQuerySchema>;

/**
 * ============================================================
 * REVENUE BY CLASS
 * ============================================================
 */

export const revenueByClassQuerySchema = z.object({
  schoolId: schoolIdSchema,

  classId: z
    .string()
    .uuid()
    .optional(),

  academicYear: z
    .string()
    .optional(),

  startDate: z
    .string()
    .datetime()
    .optional(),

  endDate: z
    .string()
    .datetime()
    .optional(),
});

export type RevenueByClassQueryDto =
  z.infer<typeof revenueByClassQuerySchema>;

/**
 * ============================================================
 * REVENUE BY PAYMENT METHOD
 * ============================================================
 */

export const revenueByPaymentMethodQuerySchema = z.object({
  schoolId: schoolIdSchema,

  startDate: z
    .string()
    .datetime()
    .optional(),

  endDate: z
    .string()
    .datetime()
    .optional(),
});

export type RevenueByPaymentMethodQueryDto =
  z.infer<typeof revenueByPaymentMethodQuerySchema>;

/**
 * ============================================================
 * MONTHLY REVENUE TREND
 * ============================================================
 */

export const revenueTrendQuerySchema = z.object({
  schoolId: schoolIdSchema,

  year: z
    .coerce
    .number()
    .int()
    .min(2000)
    .max(2100)
    .optional(),
});

export type RevenueTrendQueryDto =
  z.infer<typeof revenueTrendQuerySchema>;

/**
 * ============================================================
 * OUTSTANDING REVENUE
 * ============================================================
 */

export const outstandingRevenueQuerySchema = z.object({
  schoolId: schoolIdSchema,

  academicYear: z
    .string()
    .optional(),

  classId: z
    .string()
    .uuid()
    .optional(),
});

export type OutstandingRevenueQueryDto =
  z.infer<typeof outstandingRevenueQuerySchema>;

/**
 * ============================================================
 * PROFIT & LOSS
 * ============================================================
 */

export const profitLossQuerySchema = z.object({
  schoolId: schoolIdSchema,

  startDate: z
    .string()
    .datetime()
    .optional(),

  endDate: z
    .string()
    .datetime()
    .optional(),
});

export type ProfitLossQueryDto =
  z.infer<typeof profitLossQuerySchema>;

/**
 * ============================================================
 * EXPORT REPORT
 * ============================================================
 */

export const exportRevenueReportQuerySchema = z.object({
  schoolId: schoolIdSchema,

  reportType: z.enum([
    "SUMMARY",
    "CATEGORY",
    "CLASS",
    "PAYMENT_METHOD",
    "OUTSTANDING",
    "PROFIT_LOSS",
  ]),

  startDate: z
    .string()
    .datetime()
    .optional(),

  endDate: z
    .string()
    .datetime()
    .optional(),
});

export type ExportRevenueReportQueryDto =
  z.infer<typeof exportRevenueReportQuerySchema>;

/**
 * ============================================================
 * PARAM SCHEMAS
 * ============================================================
 */

export const revenueSchoolParamsSchema = z.object({
  schoolId: schoolIdSchema,
});

export type RevenueSchoolParamsDto =
  z.infer<typeof revenueSchoolParamsSchema>;