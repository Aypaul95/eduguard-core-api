import { registry } from "../../config/openapi";
import { z } from "zod";

/**
 * ============================================================
 * SHARED SCHEMAS
 * ============================================================
 */

const MoneySchema = z.object({
  total: z.number(),
});

const RevenueItemSchema = z.object({
  label: z.string(),
  value: z.number(),
});

const RevenueTrendSchema = z.object({
  month: z.string(),
  total: z.number(),
});

const ProfitLossSchema = z.object({
  totalRevenue: z.number(),
  totalExpenses: z.number(),
  netRevenue: z.number(),
});

const PaginationSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  pages: z.number(),
});

/**
 * ============================================================
 * QUERY SCHEMAS
 * ============================================================
 */

const RevenueQuerySchema = z.object({
  schoolId: z.string().uuid(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

/**
 * ============================================================
 * REVENUE DASHBOARD
 * ============================================================
 */

registry.registerPath({
  method: "get",
  path: "/revenue/dashboard",
  tags: ["Revenue"],
  summary: "Get revenue dashboard overview",
  request: {
    query: RevenueQuerySchema,
  },
  responses: {
    200: {
      description: "Revenue dashboard fetched successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({
              totalRevenue: z.number(),
              totalExpenses: z.number(),
              netRevenue: z.number(),
              outstanding: z.number(),
            }),
          }),
        },
      },
    },
  },
});

/**
 * ============================================================
 * REVENUE SUMMARY
 * ============================================================
 */

registry.registerPath({
  method: "get",
  path: "/revenue/summary",
  tags: ["Revenue"],
  summary: "Get revenue summary",
  request: {
    query: RevenueQuerySchema,
  },
  responses: {
    200: {
      description: "Revenue summary retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: MoneySchema,
          }),
        },
      },
    },
  },
});

/**
 * ============================================================
 * REVENUE BY CATEGORY
 * ============================================================
 */

registry.registerPath({
  method: "get",
  path: "/revenue/by-category",
  tags: ["Revenue"],
  summary: "Get revenue breakdown by fee category",
  request: {
    query: RevenueQuerySchema,
  },
  responses: {
    200: {
      description: "Revenue by category fetched successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.array(RevenueItemSchema),
          }),
        },
      },
    },
  },
});

/**
 * ============================================================
 * REVENUE BY CLASS
 * ============================================================
 */

registry.registerPath({
  method: "get",
  path: "/revenue/by-class",
  tags: ["Revenue"],
  summary: "Get revenue breakdown by class",
  request: {
    query: RevenueQuerySchema,
  },
  responses: {
    200: {
      description: "Revenue by class fetched successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.array(RevenueItemSchema),
          }),
        },
      },
    },
  },
});

/**
 * ============================================================
 * REVENUE BY PAYMENT METHOD
 * ============================================================
 */

registry.registerPath({
  method: "get",
  path: "/revenue/by-payment-method",
  tags: ["Revenue"],
  summary: "Get revenue breakdown by payment method",
  request: {
    query: RevenueQuerySchema,
  },
  responses: {
    200: {
      description: "Revenue by payment method fetched successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.array(RevenueItemSchema),
          }),
        },
      },
    },
  },
});

/**
 * ============================================================
 * REVENUE TREND
 * ============================================================
 */

registry.registerPath({
  method: "get",
  path: "/revenue/trend",
  tags: ["Revenue"],
  summary: "Get monthly revenue trend",
  request: {
    query: RevenueQuerySchema,
  },
  responses: {
    200: {
      description: "Revenue trend fetched successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.array(RevenueTrendSchema),
          }),
        },
      },
    },
  },
});

/**
 * ============================================================
 * PROFIT & LOSS
 * ============================================================
 */

registry.registerPath({
  method: "get",
  path: "/revenue/profit-loss",
  tags: ["Revenue"],
  summary: "Get profit and loss statement",
  request: {
    query: RevenueQuerySchema,
  },
  responses: {
    200: {
      description: "Profit & Loss fetched successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: ProfitLossSchema,
          }),
        },
      },
    },
  },
});

/**
 * ============================================================
 * OUTSTANDING REVENUE
 * ============================================================
 */

registry.registerPath({
  method: "get",
  path: "/revenue/outstanding",
  tags: ["Revenue"],
  summary: "Get outstanding revenue (unpaid invoices)",
  request: {
    query: RevenueQuerySchema,
  },
  responses: {
    200: {
      description: "Outstanding revenue fetched successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({
              totalOutstanding: z.number(),
              invoices: z.array(
                z.object({
                  id: z.string().uuid(),
                  studentId: z.string().uuid(),
                  totalAmount: z.number(),
                  amountPaid: z.number(),
                  status: z.string(),
                })
              ),
            }),
          }),
        },
      },
    },
  },
});