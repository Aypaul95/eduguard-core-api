// src/modules/billing/billing.dto.ts

import { z } from "zod";

/**
 * ============================================================
 * Billing DTOs
 * ============================================================
 * Purpose:
 * - Request validation
 * - Response typing
 * - OpenAPI schema generation
 * - Service layer type inference
 *
 * Notes:
 * - Multi-tenant isolation uses schoolId
 * - Compatible with OpenAPI Registry setup
 * - Compatible with bootstrap.ts zod patching
 * ============================================================
 */

/**
 * ============================================================
 * Invoice Item
 * ============================================================
 */
export const InvoiceItemSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(255, "Description cannot exceed 255 characters"),

  amount: z
    .coerce.number()
    .positive("Amount must be greater than zero"),
});

export type InvoiceItemDto = z.infer<typeof InvoiceItemSchema>;

/**
 * ============================================================
 * Create Invoice
 * ============================================================
 */
export const CreateInvoiceSchema = z.object({
  schoolId: z.uuid("Invalid schoolId"),

  studentId: z.uuid("Invalid studentId"),

  dueDate: z
    .string()
    .datetime()
    .optional(),

  items: z
    .array(InvoiceItemSchema)
    .min(1, "At least one invoice item is required"),
});

export type CreateInvoiceDto = z.infer<typeof CreateInvoiceSchema>;

/**
 * ============================================================
 * Update Invoice
 * ============================================================
 */
export const UpdateInvoiceSchema = z
  .object({
    dueDate: z
      .string()
      .datetime()
      .optional(),

    status: z
      .enum([
        "PENDING",
        "PARTIALLY_PAID",
        "PAID",
        "OVERDUE",
      ])
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field must be provided for update",
    }
  );

export type UpdateInvoiceDto = z.infer<typeof UpdateInvoiceSchema>;

/**
 * ============================================================
 * Record Payment
 * ============================================================
 */
export const RecordPaymentSchema = z.object({
  amount: z.number(),
  method: z.enum(["CASH", "TRANSFER", "CARD", "POS", "PAYSTACK"]),
  reference: z.string().optional(),
});


export type RecordPaymentDTO = z.infer<typeof RecordPaymentSchema>;

/**
 * ============================================================
 * Invoice Params
 * ============================================================
 */
export const InvoiceParamsSchema = z.object({
  id: z.uuid("Invalid invoice ID"),
});

export type InvoiceParamsDto = z.infer<typeof InvoiceParamsSchema>;

/**
 * ============================================================
 * Student Invoice Params
 * ============================================================
 */
export const StudentInvoiceParamsSchema = z.object({
  studentId: z.uuid("Invalid student ID"),
});

export type StudentInvoiceParamsDto = z.infer<
  typeof StudentInvoiceParamsSchema
>;

/**
 * ============================================================
 * School Invoice Query
 * ============================================================
 */
export const InvoiceQuerySchema = z.object({
  schoolId: z.uuid("Invalid schoolId"),

  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce.number().int().positive().max(100).default(20),

  status: z
    .enum([
      "PENDING",
      "PARTIALLY_PAID",
      "PAID",
      "OVERDUE",
    ])
    .optional(),

  studentId: z
    .uuid("Invalid studentId")
    .optional(),
});

export type InvoiceQueryDto = z.infer<typeof InvoiceQuerySchema>;

/**
 * ============================================================
 * Invoice Response Schema
 * ============================================================
 * Used by:
 * - Swagger/OpenAPI
 * - Controller responses
 * ============================================================
 */
export const InvoiceResponseSchema = z.object({
  id: z.string(),

  schoolId: z.string(),

  studentId: z.string(),

  invoiceNumber: z.string(),

  totalAmount: z.number(),

  amountPaid: z.number(),

  status: z.string(),

  dueDate: z.string().nullable(),

  createdAt: z.string(),
});

export type InvoiceResponseDto = z.infer<
  typeof InvoiceResponseSchema
>;

/**
 * ============================================================
 * Invoice Item Response Schema
 * ============================================================
 */
export const InvoiceItemResponseSchema = z.object({
  id: z.string(),

  invoiceId: z.string(),

  description: z.string(),

  amount: z.number(),

  createdAt: z.string(),
});

export type InvoiceItemResponseDto = z.infer<
  typeof InvoiceItemResponseSchema
>;