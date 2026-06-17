// src/modules/billing/billing.openapi.ts

import { registry } from "../../config/openapi";
import { z } from "zod";

import {
  CreateInvoiceSchema,
  UpdateInvoiceSchema,
  RecordPaymentSchema,
  InvoiceResponseSchema,
  InvoiceItemResponseSchema,
  InvoiceQuerySchema,
} from "./billing.dto";

/**
 * ============================================================
 * BILLING MODULE - OPENAPI REGISTRATION
 * ============================================================
 * Invoice generation, billing, and payment tracking APIs
 * Follows same structure as Fees module
 * ============================================================
 */

/**
 * ============================================================
 * CREATE INVOICE
 * ============================================================
 */
registry.registerPath({
  method: "post",
  path: "/billing/invoices",
  tags: ["Billing"],
  summary: "Generate invoice for a student",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateInvoiceSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Invoice generated successfully",
      content: {
        "application/json": {
          schema: InvoiceResponseSchema,
        },
      },
    },
  },
});

/**
 * ============================================================
 * GET INVOICES (FILTER + PAGINATION)
 * ============================================================
 */
registry.registerPath({
  method: "get",
  path: "/billing/invoices",
  tags: ["Billing"],
  summary: "Get all invoices with filters and pagination",
  request: {
    query: InvoiceQuerySchema,
  },
  responses: {
    200: {
      description: "Invoices retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.array(InvoiceResponseSchema),
          }),
        },
      },
    },
  },
});

/**
 * ============================================================
 * GET SINGLE INVOICE
 * ============================================================
 */
registry.registerPath({
  method: "get",
  path: "/billing/invoices/{id}",
  tags: ["Billing"],
  summary: "Get single invoice by ID",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: "Invoice retrieved successfully",
      content: {
        "application/json": {
          schema: InvoiceResponseSchema,
        },
      },
    },
  },
});

/**
 * ============================================================
 * DELETE INVOICE
 * ============================================================
 */
registry.registerPath({
  method: "delete",
  path: "/billing/invoices/{id}",
  tags: ["Billing"],
  summary: "Delete an invoice",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: "Invoice deleted successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
  },
});

/**
 * ============================================================
 * RECORD PAYMENT
 * ============================================================
 */
registry.registerPath({
  method: "post",
  path: "/billing/invoices/{id}/payments",
  tags: ["Billing"],
  summary: "Record payment for an invoice",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: {
      content: {
        "application/json": {
          schema: RecordPaymentSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Payment recorded successfully",
      content: {
        "application/json": {
          schema: InvoiceResponseSchema,
        },
      },
    },
  },
});

/**
 * ============================================================
 * GET STUDENT INVOICES
 * ============================================================
 */
registry.registerPath({
  method: "get",
  path: "/billing/students/{studentId}/invoices",
  tags: ["Billing"],
  summary: "Get all invoices for a student",
  request: {
    params: z.object({
      studentId: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: "Student invoices retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.array(InvoiceResponseSchema),
          }),
        },
      },
    },
  },
});