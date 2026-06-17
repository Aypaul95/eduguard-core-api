// src/modules/billing/billing.jobs.ts

import { PrismaClient, InvoiceStatus } from "@prisma/client";
import { logger } from "../../config/logger";
import { AppError } from "../../shared/errors/app.error";
import { BillingRepository } from "./billing.repository";
import { MathUtil } from "../../shared/utils/math.util";

const prisma = new PrismaClient();

/**
 * ============================================================
 * Billing Background Jobs
 * ============================================================
 * Runs scheduled financial maintenance tasks:
 * - Overdue invoice detection
 * - Payment reconciliation checks
 * - Auto status updates
 * ============================================================
 */

export class BillingJobs {
  /**
   * Mark overdue invoices
   * Should run daily (cron job)
   */
  static async markOverdueInvoices() {
    try {
      const now = new Date();

      const overdueInvoices = await prisma.invoice.findMany({
        where: {
          status: {
            in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIALLY_PAID],
          },
          dueDate: {
            lt: now,
          },
        },
      });

      if (!overdueInvoices.length) {
        logger.info("No overdue invoices found");
        return;
      }

      await prisma.$transaction(async (tx) => {
        for (const invoice of overdueInvoices) {
          await tx.invoice.update({
            where: { id: invoice.id },
            data: {
              status: InvoiceStatus.OVERDUE,
            },
          });
        }
      });

      logger.info(
        {
          count: overdueInvoices.length,
        },
        "Overdue invoices marked successfully"
      );
    } catch (error) {
      logger.error({ error }, "Failed to mark overdue invoices");
      throw new AppError("Overdue invoice job failed", 500);
    }
  }

  /**
   * Recalculate invoice payment status
   * Ensures invoice accuracy after external payment sync
   */
  static async reconcileInvoicePayments(schoolId: string) {
    try {
      const invoices = await prisma.invoice.findMany({
        where: {
          schoolId,
        },
        include: {
          payments: true,
        },
      });

      if (!invoices.length) {
        logger.info({ schoolId }, "No invoices to reconcile");
        return;
      }

      await prisma.$transaction(async (tx) => {
        for (const invoice of invoices) {
          const totalPaid = invoice.payments.reduce((sum, p) => {
            return MathUtil.add(sum, Number(p.amount));
          }, 0);

          let status: InvoiceStatus = InvoiceStatus.PENDING;

          if (totalPaid >= Number(invoice.totalAmount)) {
            status = InvoiceStatus.PAID;
          } else if (totalPaid > 0) {
            status = InvoiceStatus.PARTIALLY_PAID;
          }

          await tx.invoice.update({
            where: { id: invoice.id },
            data: {
              amountPaid: totalPaid,
              status,
            },
          });
        }
      });

      logger.info(
        {
          schoolId,
          count: invoices.length,
        },
        "Invoice reconciliation completed"
      );
    } catch (error) {
      logger.error({ error }, "Invoice reconciliation failed");
      throw new AppError("Invoice reconciliation failed", 500);
    }
  }

  /**
   * Auto-generate invoices for a school (bulk billing engine)
   * Can be used at term start / semester start
   */
  static async generateBulkInvoices(params: {
    schoolId: string;
    studentIds: string[];
    dueDate?: Date;
  }) {
    const { schoolId, studentIds, dueDate } = params;

    try {
      await prisma.$transaction(async (tx) => {
        for (const studentId of studentIds) {
          /**
           * Fetch unpaid assignments
           */
          const assignments = await tx.studentFeeAssignment.findMany({
            where: {
              studentId,
              status: "UNPAID",
            },
            include: {
              feeStructure: {
                include: {
                  category: true,
                },
              },
            },
          });

          if (!assignments.length) continue;

          /**
           * Generate invoice number
           */
          const count = await tx.invoice.count({
            where: { schoolId },
          });

          const invoiceNumber = `INV-${new Date().getFullYear()}-${String(
            count + 1
          ).padStart(6, "0")}`;

          /**
           * Build invoice items
           */
          let total = 0;

          const items = assignments.map((a) => {
            const amount = Number(a.feeStructure.amount);
            total = MathUtil.add(total, amount);

            return {
              description: `${a.feeStructure.category.name} - ${a.feeStructure.academicYear}`,
              amount,
            };
          });

          total = MathUtil.round(total, 2);

          /**
           * Create invoice
           */
          await tx.invoice.create({
            data: {
              schoolId,
              studentId,
              invoiceNumber,
              totalAmount: total,
              amountPaid: 0,
              status: InvoiceStatus.PENDING,
              dueDate: dueDate ?? null,
              items: {
                create: items,
              },
            },
          });
        }
      });

      logger.info(
        {
          schoolId,
          students: studentIds.length,
        },
        "Bulk invoices generated successfully"
      );
    } catch (error) {
      logger.error({ error }, "Bulk invoice generation failed");
      throw new AppError("Bulk invoice generation failed", 500);
    }
  }

  /**
   * Clean up failed or inconsistent invoice states
   */
  static async cleanupInvoiceData(schoolId: string) {
    try {
      const brokenInvoices = await prisma.invoice.findMany({
        where: {
          schoolId,
          OR: [
            { totalAmount: null as any },
            { amountPaid: null as any },
          ],
        },
      });

      if (!brokenInvoices.length) {
        logger.info({ schoolId }, "No invoice cleanup needed");
        return;
      }

      await prisma.$transaction(async (tx) => {
        for (const invoice of brokenInvoices) {
          await tx.invoice.update({
            where: { id: invoice.id },
            data: {
              totalAmount: 0,
              amountPaid: 0,
              status: InvoiceStatus.PENDING,
            },
          });
        }
      });

      logger.info(
        {
          schoolId,
          count: brokenInvoices.length,
        },
        "Invoice cleanup completed"
      );
    } catch (error) {
      logger.error({ error }, "Invoice cleanup failed");
      throw new AppError("Invoice cleanup failed", 500);
    }
  }
}