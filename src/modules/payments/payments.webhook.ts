import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { PrismaClient, Prisma, InvoiceStatus, PaymentMethod } from "@prisma/client";

import { logger } from "../../config/logger";
import { AppError } from "../../shared/errors/app.error";

import { PaymentsRepository } from "./payments.repository";

/**
 * ============================================================
 * PAYMENTS WEBHOOK CONTROLLER
 * ============================================================
 *
 * Handles Paystack webhook events:
 * - charge.success
 * - charge.failed
 *
 * Responsibilities:
 * - Verify Paystack signature
 * - Ensure idempotency
 * - Create Payment + Transaction
 * - Update Invoice
 */

const prisma = new PrismaClient();
const repo = new PaymentsRepository(prisma);

/**
 * ============================================================
 * ENV CONFIG
 * ============================================================
 */
const PAYSTACK_SECRET_KEY =
  process.env.PAYSTACK_SECRET_KEY || "";

/**
 * ============================================================
 * TYPE DEFINITIONS (PAYSTACK EVENT)
 * ============================================================
 */
interface PaystackWebhookPayload {
  event: string;
  data: {
    reference: string;
    amount: number;
    status: string;
    metadata?: {
      schoolId?: string;
      invoiceId?: string;
    };
  };
}

/**
 * ============================================================
 * VERIFY PAYSTACK SIGNATURE
 * ============================================================
 */
function verifyPaystackSignature(
  req: Request
): boolean {
  const signature = req.headers["x-paystack-signature"];

  if (!signature || typeof signature !== "string") {
    return false;
  }

  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest("hex");

  return hash === signature;
}

/**
 * ============================================================
 * MAIN WEBHOOK HANDLER
 * ============================================================
 */
export const paymentWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    /**
     * ========================================================
     * 1. SECURITY: VERIFY SIGNATURE
     * ========================================================
     */
    const isValid = verifyPaystackSignature(req);

    if (!isValid) {
      logger.warn("Invalid Paystack webhook signature");
      throw new AppError("Invalid signature", 401);
    }

    const payload = req.body as PaystackWebhookPayload;

    logger.info(
      { event: payload.event },
      "Webhook received"
    );

    /**
     * ========================================================
     * 2. HANDLE ONLY SUCCESSFUL PAYMENTS
     * ========================================================
     */
    if (payload.event !== "charge.success") {
      return res.status(200).json({
        success: true,
        message: "Event ignored",
      });
    }

    const {
      reference,
      amount,
      metadata,
    } = payload.data;

    if (!metadata?.schoolId || !metadata?.invoiceId) {
      throw new AppError(
        "Missing metadata in payment",
        400
      );
    }

    const schoolId = metadata.schoolId;
    const invoiceId = metadata.invoiceId;

    /**
     * ========================================================
     * 3. IDEMPOTENCY CHECK
     * ========================================================
     * Prevent duplicate processing
     */
    const existing =
      await repo.findByReference(reference, schoolId);

    if (existing) {
      logger.warn(
        { reference },
        "Duplicate webhook ignored"
      );

      return res.status(200).json({
        success: true,
        message: "Payment already processed",
      });
    }

    /**
     * ========================================================
     * 4. PROCESS PAYMENT IN TRANSACTION
     * ========================================================
     */
    const result = await prisma.$transaction(
      async (tx) => {
        /**
         * 4.1 Create Payment
         */
        const payment = await tx.payment.create({
          data: {
            schoolId,
            invoiceId,
            amount: amount / 100, // Paystack sends kobo
            method: PaymentMethod.PAYSTACK,
            reference,
          },
        });

        /**
         * 4.2 Create Payment Transaction
         */
        await tx.paymentTransaction.create({
          data: {
            paymentId: payment.id,
            gateway: "paystack",
            gatewayRef: reference,
            status: "SUCCESS",
            rawResponse: payload as unknown as Prisma.InputJsonValue,
          },
        });

        /**
         * 4.3 Fetch Invoice
         */
        const invoice = await tx.invoice.findFirst({
          where: {
            id: invoiceId,
            schoolId,
          },
        });

        if (!invoice) {
          throw new AppError(
            "Invoice not found",
            404
          );
        }

        const currentPaid = Number(invoice.amountPaid);
        const total = Number(invoice.totalAmount);

        const newAmountPaid =
          currentPaid + amount / 100;

        /**
         * 4.4 Determine Invoice Status
         */
        let status: InvoiceStatus =
          InvoiceStatus.PENDING;

        if (newAmountPaid >= total) {
          status = InvoiceStatus.PAID;
        } else if (newAmountPaid > 0) {
          status =
            InvoiceStatus.PARTIALLY_PAID;
        }

        /**
         * 4.5 Update Invoice
         */
        await tx.invoice.update({
          where: { id: invoiceId },
          data: {
            amountPaid: newAmountPaid,
            status,
          },
        });

        return payment;
      }
    );

    /**
     * ========================================================
     * 5. LOG SUCCESS
     * ========================================================
     */
    logger.info(
      {
        reference,
        invoiceId,
        schoolId,
      },
      "Webhook processed successfully"
    );

    return res.status(200).json({
      success: true,
      message: "Webhook processed",
      data: result,
    });
  } catch (error) {
    logger.error({ error }, "Webhook processing failed");
    next(error);
  }
};