import {
  PrismaClient,
  InvoiceStatus,
  PaymentMethod,
} from "@prisma/client";

import { logger } from "../../config/logger";
import { AppError } from "../../shared/errors/app.error";

import {
  InitializePaymentDto,
  VerifyPaymentDto,
  CreateManualPaymentDto,
  GetPaymentsQueryDto,
} from "./payments.dto";

import { MathUtil } from "../../shared/utils/math.util";

export class PaymentsService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * ============================================================
   * SAFETY HELPER
   * ============================================================
   */
  private ensureSchoolId(schoolId?: string) {
    if (!schoolId) {
      throw new Error("schoolId is required");
    }
  }

  /**
   * ============================================================
   * INITIALIZE PAYMENT (PAYSTACK / GATEWAY ENTRY POINT)
   * ============================================================
   *
   * NOTE:
   * In real implementation, Paystack service will be injected later.
   */
  async initializePayment(dto: InitializePaymentDto) {
    try {
      this.ensureSchoolId(dto.schoolId);

      const invoice = await this.prisma.invoice.findFirst({
        where: {
          id: dto.invoiceId,
          schoolId: dto.schoolId,
        },
        include: {
          student: true,
        },
      });

      if (!invoice) {
        throw new AppError("Invoice not found", 404);
      }

      if (invoice.status === InvoiceStatus.PAID) {
        throw new AppError("Invoice already fully paid", 400);
      }

      logger.info(
        {
          invoiceId: invoice.id,
          schoolId: dto.schoolId,
        },
        "Payment initialization started"
      );

      /**
       * NOTE:
       * Real Paystack integration happens in service layer later.
       */
      return {
        invoiceId: invoice.id,
        email: dto.email,
        amount: invoice.totalAmount,
        message: "Payment initialized successfully",
      };
    } catch (error) {
      logger.error({ error }, "Payment initialization failed");
      throw error;
    }
  }

  /**
   * ============================================================
   * VERIFY PAYMENT (GATEWAY CALLBACK LOGIC ENTRY)
   * ============================================================
   */
  async verifyPayment(dto: VerifyPaymentDto, schoolId: string) {
    try {
      this.ensureSchoolId(schoolId);

      logger.info(
        { reference: dto.reference },
        "Verifying payment"
      );

      /**
       * NOTE:
       * This will later call Paystack API.
       * For now, assume verification success flow.
       */

      const payment = await this.prisma.payment.findFirst({
        where: {
          reference: dto.reference,
          schoolId,
        },
        include: {
          invoice: true,
        },
      });

      if (!payment) {
        throw new AppError("Payment not found", 404);
      }

      return payment;
    } catch (error) {
      logger.error({ error }, "Payment verification failed");
      throw error;
    }
  }

  /**
   * ============================================================
   * CREATE MANUAL PAYMENT (CASH / BANK TRANSFER / POS)
   * ============================================================
   */
  async createManualPayment(dto: CreateManualPaymentDto) {
    try {
      this.ensureSchoolId(dto.schoolId);

      return await this.prisma.$transaction(async (tx) => {
        const invoice = await tx.invoice.findFirst({
          where: {
            id: dto.invoiceId,
            schoolId: dto.schoolId,
          },
        });

        if (!invoice) {
          throw new AppError("Invoice not found", 404);
        }

        const currentPaid = Number(invoice.amountPaid);
        const total = Number(invoice.totalAmount);

        const newAmountPaid = MathUtil.round(
          MathUtil.add(currentPaid, dto.amount),
          2
        );

        /**
         * ========================================================
         * INVOICE STATUS ENGINE
         * ========================================================
         */
        let status: InvoiceStatus = InvoiceStatus.PENDING;

        if (newAmountPaid >= total) {
          status = InvoiceStatus.PAID;
        } else if (newAmountPaid > 0) {
          status = InvoiceStatus.PARTIALLY_PAID;
        }

        /**
         * 1. Create Payment
         */
        const payment = await tx.payment.create({
          data: {
            schoolId: dto.schoolId,
            invoiceId: dto.invoiceId,
            amount: dto.amount,
            method: dto.method as PaymentMethod,
            reference: dto.reference ?? null,
          },
        });

        /**
         * 2. Update Invoice
         */
        await tx.invoice.update({
          where: { id: dto.invoiceId },
          data: {
            amountPaid: newAmountPaid,
            status,
          },
        });

        logger.info(
          {
            paymentId: payment.id,
            invoiceId: dto.invoiceId,
            amount: dto.amount,
            status,
          },
          "Manual payment recorded successfully"
        );

        return payment;
      });
    } catch (error) {
      logger.error({ error }, "Manual payment failed");
      throw error;
    }
  }

  /**
   * ============================================================
   * GET PAYMENT BY ID
   * ============================================================
   */
  async getPaymentById(id: string, schoolId: string) {
    try {
      this.ensureSchoolId(schoolId);

      const payment = await this.prisma.payment.findFirst({
        where: {
          id,
          schoolId,
        },
        include: {
          invoice: true,
          transaction: true,
        },
      });

      if (!payment) {
        throw new AppError("Payment not found", 404);
      }

      return payment;
    } catch (error) {
      logger.error({ error }, "Failed to get payment");
      throw error;
    }
  }

  /**
   * ============================================================
   * GET PAYMENTS (FILTERED)
   * ============================================================
   */
  async getPayments(query: GetPaymentsQueryDto) {
    try {
      this.ensureSchoolId(query.schoolId);

      const where: any = {
        schoolId: query.schoolId,
        ...(query.invoiceId && { invoiceId: query.invoiceId }),
        ...(query.method && { method: query.method }),
        ...(query.reference && { reference: query.reference }),
        ...(query.startDate &&
          query.endDate && {
            createdAt: {
              gte: new Date(query.startDate),
              lte: new Date(query.endDate),
            },
          }),
      };

      const page = query.page ?? 1;
      const limit = query.limit ?? 20;

      const [data, total] = await Promise.all([
        this.prisma.payment.findMany({
          where,
          include: {
            invoice: true,
            transaction: true,
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        this.prisma.payment.count({ where }),
      ]);

      return {
        data,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error({ error }, "Failed to fetch payments");
      throw error;
    }
  }

  /**
   * ============================================================
   * GET PAYMENTS BY INVOICE
   * ============================================================
   */
  async getPaymentsByInvoice(invoiceId: string, schoolId: string) {
    try {
      this.ensureSchoolId(schoolId);

      return await this.prisma.payment.findMany({
        where: {
          invoiceId,
          schoolId,
        },
        include: {
          transaction: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      logger.error({ error }, "Failed to fetch invoice payments");
      throw error;
    }
  }

  /**
   * ============================================================
   * PROCESS WEBHOOK PAYMENT UPDATE (FUTURE PAYSTACK FLOW)
   * ============================================================
   */
  async processWebhook(reference: string, schoolId: string) {
    try {
      this.ensureSchoolId(schoolId);

      const payment = await this.prisma.payment.findFirst({
        where: {
          reference,
          schoolId,
        },
        include: {
          invoice: true,
        },
      });

      if (!payment) {
        throw new AppError("Payment not found for webhook", 404);
      }

      logger.info(
        { reference },
        "Webhook processed successfully"
      );

      return payment;
    } catch (error) {
      logger.error({ error }, "Webhook processing failed");
      throw error;
    }
  }
}