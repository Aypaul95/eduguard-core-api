// src/modules/payments/payments.dto.ts

import { z } from "zod";

/**
 * ============================================================
 * Common Validators
 * ============================================================
 */

export const UuidSchema = z.uuid("Invalid UUID format");

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

/**
 * ============================================================
 * Route Params
 * ============================================================
 */

export const PaymentIdParamSchema = z.object({
  id: UuidSchema,
});

export type PaymentIdParamDto = z.infer<
  typeof PaymentIdParamSchema
>;

export const InvoiceIdParamSchema = z.object({
  invoiceId: UuidSchema,
});

export type InvoiceIdParamDto = z.infer<
  typeof InvoiceIdParamSchema
>;

/**
 * ============================================================
 * Initialize Payment
 * ============================================================
 *
 * Used when generating a Paystack payment link
 * for an existing invoice.
 */

export const InitializePaymentSchema = z.object({
  schoolId: UuidSchema,

  invoiceId: UuidSchema,

  email: z
    .email("Valid email address is required")
    .trim()
    .toLowerCase(),
});

export type InitializePaymentDto = z.infer<
  typeof InitializePaymentSchema
>;

/**
 * ============================================================
 * Verify Payment
 * ============================================================
 *
 * Used after redirect or callback from Paystack.
 */

export const VerifyPaymentSchema = z.object({
  reference: z
    .string()
    .trim()
    .min(3, "Payment reference is required"),
});

export type VerifyPaymentDto = z.infer<
  typeof VerifyPaymentSchema
>;

/**
 * ============================================================
 * Manual Payment Recording
 * ============================================================
 *
 * For cash, bank transfer, POS payments, etc.
 */

export const CreateManualPaymentSchema = z.object({
  schoolId: UuidSchema,

  invoiceId: UuidSchema,

  amount: z
    .number({
      error: "Amount is required",
    })
    .positive("Amount must be greater than zero"),

  method: z
    .string()
    .trim()
    .min(1, "Payment method is required"),

  reference: z
    .string()
    .trim()
    .max(255)
    .optional(),
});

export type CreateManualPaymentDto = z.infer<
  typeof CreateManualPaymentSchema
>;

/**
 * ============================================================
 * Payment Queries
 * ============================================================
 */

export const GetPaymentsQuerySchema =
  PaginationQuerySchema.extend({
    schoolId: UuidSchema.optional(),

    invoiceId: UuidSchema.optional(),

    method: z.string().trim().optional(),

    reference: z.string().trim().optional(),

    startDate: z.iso.datetime().optional(),

    endDate: z.iso.datetime().optional(),
  });

export type GetPaymentsQueryDto = z.infer<
  typeof GetPaymentsQuerySchema
>;

/**
 * ============================================================
 * Transaction Queries
 * ============================================================
 */

export const GetTransactionByReferenceSchema =
  z.object({
    gatewayRef: z
      .string()
      .trim()
      .min(3, "Gateway reference is required"),
  });

export type GetTransactionByReferenceDto =
  z.infer<
    typeof GetTransactionByReferenceSchema
  >;

/**
 * ============================================================
 * Webhook Validation
 * ============================================================
 *
 * Basic validation.
 * Full payload typing belongs in payments.types.ts
 */

export const PaystackWebhookSchema =
  z.object({
    event: z.string().trim(),
    data: z.record(z.string(), z.unknown()),
  });

export type PaystackWebhookDto = z.infer<
  typeof PaystackWebhookSchema
>;

/**
 * ============================================================
 * Payment Status Update
 * ============================================================
 *
 * Useful for admin actions if required.
 */

export const UpdatePaymentStatusSchema =
  z.object({
    status: z
      .string()
      .trim()
      .min(1, "Status is required"),
  });

export type UpdatePaymentStatusDto = z.infer<
  typeof UpdatePaymentStatusSchema
>;

/**
 * ============================================================
 * Export DTO Collection
 * ============================================================
 */

export const PaymentsDto = {
  PaymentIdParamSchema,
  InvoiceIdParamSchema,

  InitializePaymentSchema,
  VerifyPaymentSchema,

  CreateManualPaymentSchema,

  GetPaymentsQuerySchema,
  GetTransactionByReferenceSchema,

  PaystackWebhookSchema,

  UpdatePaymentStatusSchema,
} as const;
