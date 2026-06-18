import { Router } from "express";
import { PrismaClient } from "@prisma/client";

import { PaymentsController } from "./payments.controller";
import { logger } from "../../config/logger";

/**
 * ============================================================
 * PAYMENTS ROUTES (API LAYER)
 * ============================================================
 * Responsibilities:
 * - Define payment endpoints
 * - Bind controller methods
 * - Maintain clean modular architecture
 * - Support future OpenAPI mapping
 */

export const createPaymentsRoutes = (prisma: PrismaClient): Router => {
  const router = Router();

  const paymentsController = new PaymentsController(prisma);

  logger.info("💰 Payments module routes initialized");

  /**
   * ============================================================
   * HEALTH CHECK
   * ============================================================
   */
  router.get("/health", (_req, res) => {
    return res.status(200).json({
      success: true,
      message: "Payments module is healthy",
    });
  });

  /**
   * ============================================================
   * PAYMENT INITIALIZATION
   * ============================================================
   * POST /payments/initialize
   */
  router.post(
    "/initialize",
    paymentsController.initializePayment
  );

  /**
   * ============================================================
   * VERIFY PAYMENT
   * ============================================================
   * GET /payments/verify?reference=xxx
   */
  router.get(
    "/verify",
    paymentsController.verifyPayment
  );

  /**
   * ============================================================
   * MANUAL PAYMENT CREATION
   * ============================================================
   * POST /payments/manual
   */
  router.post(
    "/manual",
    paymentsController.createManualPayment
  );

  /**
   * ============================================================
   * GET ALL PAYMENTS
   * ============================================================
   * GET /payments
   */
  router.get(
    "/",
    paymentsController.getPayments
  );

  /**
   * ============================================================
   * GET PAYMENT BY ID
   * ============================================================
   * GET /payments/:id
   */
  router.get(
    "/:id",
    paymentsController.getPaymentById
  );

  /**
   * ============================================================
   * GET PAYMENTS BY INVOICE
   * ============================================================
   * GET /payments/invoice/:invoiceId
   */
  router.get(
    "/invoice/:invoiceId",
    paymentsController.getPaymentsByInvoice
  );

  /**
   * ============================================================
   * WEBHOOK (PAYSTACK / FLUTTERWAVE)
   * ============================================================
   * POST /payments/webhook
   *
   * IMPORTANT:
   * - No validation middleware here
   * - Must support raw payload for signature verification
   */
  router.post(
    "/webhook",
    paymentsController.paymentWebhook
  );

  return router;
};