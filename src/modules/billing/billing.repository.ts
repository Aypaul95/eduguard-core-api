// src/modules/billing/billing.repository.ts

import { PrismaClient, InvoiceStatus } from "@prisma/client";
import { logger } from "../../config/logger";
import { AppError } from "../../shared/errors/app.error";

const prisma = new PrismaClient();

/**
 * ============================================================
 * Billing Repository
 * DB Layer (Prisma abstraction)
 * ============================================================
 */

export class BillingRepository {
  /**
   * Create invoice
   */
  static async createInvoice(data: {
    schoolId: string;
    studentId: string;
    invoiceNumber: string;
    totalAmount: number;
    amountPaid: number;
    status: InvoiceStatus;
    dueDate?: Date | null;
    items: { description: string; amount: number }[];
  }) {
    try {
      return await prisma.invoice.create({
        data: {
          schoolId: data.schoolId,
          studentId: data.studentId,
          invoiceNumber: data.invoiceNumber,
          totalAmount: data.totalAmount,
          amountPaid: data.amountPaid,
          status: data.status,
          dueDate: data.dueDate ?? null,

          items: {
            create: data.items,
          },
        },
        include: {
          items: true,
          student: true,
        },
      });
    } catch (error) {
      logger.error({ error }, "Repository: createInvoice failed");
      throw new AppError("Failed to create invoice", 500);
    }
  }

  /**
   * Find invoice by ID + school scope
   */
  static async findInvoiceById(id: string, schoolId: string) {
    try {
      return await prisma.invoice.findFirst({
        where: {
          id,
          schoolId,
        },
        include: {
          items: true,
          payments: true,
          student: true,
        },
      });
    } catch (error) {
      logger.error({ error }, "Repository: findInvoiceById failed");
      throw new AppError("Failed to fetch invoice", 500);
    }
  }

  /**
   * Get invoices with filters + pagination
   */
  static async findInvoices(params: {
    schoolId: string;
    page: number;
    limit: number;
    status?: InvoiceStatus;
    studentId?: string;
  }) {
    try {
      const where: any = {
        schoolId: params.schoolId,
        ...(params.status && { status: params.status }),
        ...(params.studentId && { studentId: params.studentId }),
      };

      const [data, total] = await Promise.all([
        prisma.invoice.findMany({
          where,
          include: {
            items: true,
            student: true,
          },
          skip: (params.page - 1) * params.limit,
          take: params.limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.invoice.count({ where }),
      ]);

      return {
        data,
        total,
        page: params.page,
        limit: params.limit,
        pages: Math.ceil(total / params.limit),
      };
    } catch (error) {
      logger.error({ error }, "Repository: findInvoices failed");
      throw new AppError("Failed to fetch invoices", 500);
    }
  }

  /**
   * Delete invoice
   */
  static async deleteInvoice(id: string, schoolId: string) {
    try {
      const invoice = await prisma.invoice.findFirst({
        where: { id, schoolId },
      });

      if (!invoice) {
        throw new AppError("Invoice not found", 404);
      }

      return await prisma.invoice.delete({
        where: { id },
      });
    } catch (error) {
      logger.error({ error }, "Repository: deleteInvoice failed");
      throw new AppError("Failed to delete invoice", 500);
    }
  }

  /**
   * Update invoice payment summary
   */
  static async updateInvoicePayment(data: {
    invoiceId: string;
    schoolId: string;
    amountPaid: number;
    status: InvoiceStatus;
  }) {
    try {
      return await prisma.invoice.update({
        where: {
          id: data.invoiceId,
        },
        data: {
          amountPaid: data.amountPaid,
          status: data.status,
        },
      });
    } catch (error) {
      logger.error({ error }, "Repository: updateInvoicePayment failed");
      throw new AppError("Failed to update invoice payment", 500);
    }
  }

  /**
   * Create payment record
   */
  static async createPayment(data: {
    schoolId: string;
    invoiceId: string;
    amount: number;
    method: any;
    reference?: string;
  }) {
    try {
      return await prisma.payment.create({
        data: {
          schoolId: data.schoolId,
          invoiceId: data.invoiceId,
          amount: data.amount,
          method: data.method,
          reference: data.reference ?? null,
        },
      });
    } catch (error) {
      logger.error({ error }, "Repository: createPayment failed");
      throw new AppError("Failed to record payment", 500);
    }
  }

  /**
   * Get student invoices
   */
  static async findStudentInvoices(studentId: string, schoolId: string) {
    try {
      return await prisma.invoice.findMany({
        where: {
          studentId,
          schoolId,
        },
        include: {
          items: true,
          payments: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (error) {
      logger.error({ error }, "Repository: findStudentInvoices failed");
      throw new AppError("Failed to fetch student invoices", 500);
    }
  }

  /**
   * Count invoices for numbering
   */
  static async countInvoices(schoolId: string) {
    try {
      return await prisma.invoice.count({
        where: { schoolId },
      });
    } catch (error) {
      logger.error({ error }, "Repository: countInvoices failed");
      throw new AppError("Failed to count invoices", 500);
    }
  }
}