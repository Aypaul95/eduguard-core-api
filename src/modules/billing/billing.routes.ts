// src/modules/billing/billing.routes.ts

import { Router } from "express";
import { BillingController } from "./billing.controller";

/**
 * ============================================================
 * Billing Routes
 * Invoice & Payment APIs
 * ============================================================
 */

const router = Router();

/**
 * NOTE:
 * All routes assume:
 * - schoolId is provided via body or query (until auth middleware is enforced)
 * - Validation is handled inside controller via Zod DTOs
 */

/**
 * ============================================================
 * INVOICE ROUTES
 * ============================================================
 */

/**
 * Create invoice (generate billing)
 * POST /billing/invoices
 */
router.post(
  "/invoices",
  BillingController.generateInvoice
);

/**
 * Get all invoices (filter + pagination)
 * GET /billing/invoices
 */
router.get(
  "/invoices",
  BillingController.getInvoices
);

/**
 * Get single invoice
 * GET /billing/invoices/:id
 */
router.get(
  "/invoices/:id",
  BillingController.getInvoiceById
);

/**
 * Delete invoice
 * DELETE /billing/invoices/:id
 */
router.delete(
  "/invoices/:id",
  BillingController.deleteInvoice
);

/**
 * ============================================================
 * PAYMENT ROUTES
 * ============================================================
 */

/**
 * Record payment for invoice
 * POST /billing/invoices/:id/payments
 */
router.post(
  "/invoices/:id/payments",
  BillingController.recordPayment
);

/**
 * ============================================================
 * STUDENT BILLING ROUTES
 * ============================================================
 */

/**
 * Get invoices for a student
 * GET /billing/students/:studentId/invoices
 */
router.get(
  "/students/:studentId/invoices",
  BillingController.getStudentInvoices
);

export default router;