import { PrismaClient, Prisma } from "@prisma/client";
import { logger } from "../../config/logger";

/**
 * ============================================================
 * PAYMENT REPOSITORY (DB LAYER)
 * ============================================================
 *
 * Responsibilities:
 * - Direct Prisma queries only
 * - No business logic
 * - No invoice calculations
 * - No gateway logic
 * - Fully reusable across services
 */

export class PaymentsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * ============================================================
   * CREATE PAYMENT
   * ============================================================
   */
  async createPayment(data: {
    schoolId: string;
    invoiceId: string;
    amount: number;
    method: any;
    reference?: string | null;
  }) {
    try {
      return await this.prisma.payment.create({
        data: {
          schoolId: data.schoolId,
          invoiceId: data.invoiceId,
          amount: new Prisma.Decimal(data.amount),
          method: data.method,
          reference: data.reference ?? null,
        },
      });
    } catch (error) {
      logger.error({ error }, "Repository: createPayment failed");
      throw new Error("Failed to create payment record");
    }
  }

  /**
   * ============================================================
   * FIND PAYMENT BY ID (SCHOOL SCOPED)
   * ============================================================
   */
  async findById(id: string, schoolId: string) {
    try {
      return await this.prisma.payment.findFirst({
        where: {
          id,
          schoolId,
        },
        include: {
          invoice: true,
          transaction: true,
        },
      });
    } catch (error) {
      logger.error({ error }, "Repository: findById failed");
      throw new Error("Failed to fetch payment");
    }
  }

  /**
   * ============================================================
   * FIND PAYMENT BY REFERENCE
   * ============================================================
   * Used for Paystack / gateway verification
   */
  async findByReference(reference: string, schoolId: string) {
    try {
      return await this.prisma.payment.findFirst({
        where: {
          reference,
          schoolId,
        },
        include: {
          invoice: true,
          transaction: true,
        },
      });
    } catch (error) {
      logger.error(
        { error },
        "Repository: findByReference failed"
      );
      throw new Error("Failed to fetch payment by reference");
    }
  }

  /**
   * ============================================================
   * LIST PAYMENTS (FILTERED + PAGINATED)
   * ============================================================
   */
  async findMany(params: {
    schoolId: string;
    invoiceId?: string;
    method?: string;
    reference?: string;
    startDate?: Date;
    endDate?: Date;
    skip: number;
    take: number;
  }) {
    try {
      const where: Prisma.PaymentWhereInput = {
        schoolId: params.schoolId,
        ...(params.invoiceId && {
          invoiceId: params.invoiceId,
        }),
        ...(params.method && { method: params.method as any }),
        ...(params.reference && {
          reference: params.reference,
        }),
        ...(params.startDate &&
          params.endDate && {
            createdAt: {
              gte: params.startDate,
              lte: params.endDate,
            },
          }),
      };

      return await this.prisma.payment.findMany({
        where,
        include: {
          invoice: true,
          transaction: true,
        },
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      logger.error({ error }, "Repository: findMany failed");
      throw new Error("Failed to fetch payments");
    }
  }

  /**
   * ============================================================
   * COUNT PAYMENTS
   * ============================================================
   */
  async count(params: {
    schoolId: string;
    invoiceId?: string;
    method?: string;
    reference?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    try {
      const where: Prisma.PaymentWhereInput = {
        schoolId: params.schoolId,
        ...(params.invoiceId && {
          invoiceId: params.invoiceId,
        }),
        ...(params.method && { method: params.method as any }),
        ...(params.reference && {
          reference: params.reference,
        }),
        ...(params.startDate &&
          params.endDate && {
            createdAt: {
              gte: params.startDate,
              lte: params.endDate,
            },
          }),
      };

      return await this.prisma.payment.count({ where });
    } catch (error) {
      logger.error({ error }, "Repository: count failed");
      throw new Error("Failed to count payments");
    }
  }

  /**
   * ============================================================
   * CREATE PAYMENT TRANSACTION
   * ============================================================
   * Used after gateway verification
   */
  async createTransaction(data: {
    paymentId: string;
    gateway: string;
    gatewayRef: string;
    status: string;
    rawResponse?: any;
  }) {
    try {
      return await this.prisma.paymentTransaction.create({
        data: {
          paymentId: data.paymentId,
          gateway: data.gateway,
          gatewayRef: data.gatewayRef,
          status: data.status,
          rawResponse: data.rawResponse ?? undefined,
        },
      });
    } catch (error) {
      logger.error(
        { error },
        "Repository: createTransaction failed"
      );
      throw new Error("Failed to create payment transaction");
    }
  }

  /**
   * ============================================================
   * FIND TRANSACTION BY GATEWAY REFERENCE
   * ============================================================
   */
  async findTransactionByGatewayRef(
    gatewayRef: string,
    gateway: string
  ) {
    try {
      return await this.prisma.paymentTransaction.findFirst({
        where: {
          gatewayRef,
          gateway,
        },
        include: {
          payment: true,
        },
      });
    } catch (error) {
      logger.error(
        { error },
        "Repository: findTransactionByGatewayRef failed"
      );
      throw new Error("Failed to fetch transaction");
    }
  }

  /**
   * ============================================================
   * UPDATE INVOICE AFTER PAYMENT
   * ============================================================
   */
  async updateInvoicePayment(data: {
    invoiceId: string;
    amountPaid: number;
    status: any;
  }) {
    try {
      return await this.prisma.invoice.update({
        where: {
          id: data.invoiceId,
        },
        data: {
          amountPaid: new Prisma.Decimal(data.amountPaid),
          status: data.status,
        },
      });
    } catch (error) {
      logger.error(
        { error },
        "Repository: updateInvoicePayment failed"
      );
      throw new Error("Failed to update invoice payment");
    }
  }

  /**
   * ============================================================
   * GET INVOICE WITH PAYMENTS
   * ============================================================
   */
  async getInvoiceWithPayments(
    invoiceId: string,
    schoolId: string
  ) {
    try {
      return await this.prisma.invoice.findFirst({
        where: {
          id: invoiceId,
          schoolId,
        },
        include: {
          payments: true,
          items: true,
          student: true,
        },
      });
    } catch (error) {
      logger.error(
        { error },
        "Repository: getInvoiceWithPayments failed"
      );
      throw new Error("Failed to fetch invoice with payments");
    }
  }
}