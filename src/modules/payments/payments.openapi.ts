import { registry } from "../../config/openapi";
import { z } from "zod";

/**
 * ============================================================
 * SHARED ENUMS
 * ============================================================
 */

const PaymentMethodEnum = z.enum([
  "PAYSTACK",
  "FLUTTERWAVE",
  "BANK_TRANSFER",
  "CASH",
  "MANUAL",
]);

const InvoiceStatusEnum = z.enum([
  "PENDING",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
]);

/**
 * ============================================================
 * CORE SCHEMAS
 * ============================================================
 */

const PaymentSchema = z.object({
  id: z.string().uuid(),
  schoolId: z.string().uuid(),
  invoiceId: z.string().uuid(),
  amount: z.number(),
  method: PaymentMethodEnum,
  reference: z.string().nullable(),
  createdAt: z.date(),
});

const InvoiceSchema = z.object({
  id: z.string().uuid(),
  schoolId: z.string().uuid(),
  studentId: z.string().uuid(),
  invoiceNumber: z.string(),
  totalAmount: z.number(),
  amountPaid: z.number(),
  status: InvoiceStatusEnum,
  dueDate: z.date().nullable(),
  createdAt: z.date(),
});

/**
 * ============================================================
 * PAYMENT - REQUEST SCHEMAS
 * ============================================================
 */

const InitializePaymentSchema = z.object({
  schoolId: z.string().uuid(),
  invoiceId: z.string().uuid(),
  email: z.string().email(),
  amount: z.number(),
});

const VerifyPaymentQuerySchema = z.object({
  reference: z.string(),
});

const ManualPaymentSchema = z.object({
  schoolId: z.string().uuid(),
  invoiceId: z.string().uuid(),
  amount: z.number(),
  method: PaymentMethodEnum,
  reference: z.string().optional(),
});

const PaymentQuerySchema = z.object({
  schoolId: z.string().uuid(),
  invoiceId: z.string().uuid().optional(),
  method: PaymentMethodEnum.optional(),
  reference: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

const PaymentParamsSchema = z.object({
  id: z.string().uuid(),
});

const InvoiceParamsSchema = z.object({
  invoiceId: z.string().uuid(),
});

/**
 * ============================================================
 * INITIALIZE PAYMENT
 * ============================================================
 */

registry.registerPath({
  method: "post",
  path: "/payments/initialize",
  tags: ["Payments"],
  summary: "Initialize payment",
  request: {
    body: {
      content: {
        "application/json": {
          schema: InitializePaymentSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Payment initialized successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: PaymentSchema.optional(),
          }),
        },
      },
    },
  },
});

/**
 * ============================================================
 * VERIFY PAYMENT
 * ============================================================
 */

registry.registerPath({
  method: "get",
  path: "/payments/verify",
  tags: ["Payments"],
  summary: "Verify payment",
  request: {
    query: VerifyPaymentQuerySchema,
  },
  responses: {
    200: {
      description: "Payment verified successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: PaymentSchema.optional(),
          }),
        },
      },
    },
  },
});

/**
 * ============================================================
 * MANUAL PAYMENT
 * ============================================================
 */

registry.registerPath({
  method: "post",
  path: "/payments/manual",
  tags: ["Payments"],
  summary: "Create manual payment",
  request: {
    body: {
      content: {
        "application/json": {
          schema: ManualPaymentSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Manual payment recorded",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: PaymentSchema.optional(),
          }),
        },
      },
    },
  },
});

/**
 * ============================================================
 * GET PAYMENTS
 * ============================================================
 */

registry.registerPath({
  method: "get",
  path: "/payments",
  tags: ["Payments"],
  summary: "Get all payments",
  request: {
    query: PaymentQuerySchema,
  },
  responses: {
    200: {
      description: "Payments retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.array(PaymentSchema),
          }),
        },
      },
    },
  },
});

/**
 * ============================================================
 * GET PAYMENT BY ID
 * ============================================================
 */

registry.registerPath({
  method: "get",
  path: "/payments/{id}",
  tags: ["Payments"],
  summary: "Get payment by ID",
  request: {
    params: PaymentParamsSchema,
  },
  responses: {
    200: {
      description: "Payment retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: PaymentSchema.extend({
              invoice: InvoiceSchema.optional(),
            }),
          }),
        },
      },
    },
  },
});

/**
 * ============================================================
 * GET PAYMENTS BY INVOICE
 * ============================================================
 */

registry.registerPath({
  method: "get",
  path: "/payments/invoice/{invoiceId}",
  tags: ["Payments"],
  summary: "Get payments by invoice",
  request: {
    params: InvoiceParamsSchema,
  },
  responses: {
    200: {
      description: "Invoice payments retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({
              invoice: InvoiceSchema,
              payments: z.array(PaymentSchema),
            }),
          }),
        },
      },
    },
  },
});

/**
 * ============================================================
 * WEBHOOK (PAYSTACK / FLUTTERWAVE)
 * ============================================================
 */

registry.registerPath({
  method: "post",
  path: "/payments/webhook",
  tags: ["Payments"],
  summary: "Payment webhook handler",
  responses: {
    200: {
      description: "Webhook processed successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: PaymentSchema.optional(),
          }),
        },
      },
    },
  },
});