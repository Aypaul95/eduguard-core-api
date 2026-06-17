// src/modules/billing/billing.service.ts

import {
  PrismaClient,
  InvoiceStatus,
  StudentFeeAssignmentStatus,
} from "@prisma/client";

import { AppError } from "../../shared/errors/app.error";
import { logger } from "../../config/logger";
import { MathUtil } from "../../shared/utils/math.util";

const prisma = new PrismaClient();

/**
 * ============================================================
 * Billing Service (Invoice Generation Engine)
 * ============================================================
 */
export class BillingService {
  /**
   * Generate invoice from assigned fees
   */
  static async generateInvoice(data: {
    schoolId: string;
    studentId: string;
    dueDate?: Date;
  }) {
    const { schoolId, studentId, dueDate } = data;

    try {
      return await prisma.$transaction(async (tx) => {
        /**
         * 1. Validate student
         */
        const student = await tx.student.findFirst({
          where: { id: studentId, schoolId },
        });

        if (!student) {
          throw new AppError("Student not found", 404);
        }

        /**
         * 2. Fetch fee assignments
         */
        const assignments = await tx.studentFeeAssignment.findMany({
          where: {
            studentId,
            status: StudentFeeAssignmentStatus.UNPAID,
            feeStructure: {
              schoolId,
            },
          },
          include: {
            feeStructure: {
              include: {
                category: true,
              },
            },
          },
        });

        if (!assignments.length) {
          throw new AppError(
            "No unpaid fee assignments found for student",
            400
          );
        }

        /**
         * 3. Generate invoice number
         */
        const invoiceCount = await tx.invoice.count({
          where: { schoolId },
        });

        const invoiceNumber = `INV-${new Date().getFullYear()}-${String(
          invoiceCount + 1
        ).padStart(6, "0")}`;

        /**
         * 4. Build invoice items + total
         */
        let totalAmount = 0;

        const invoiceItems = assignments.map((assignment) => {
          const amount = Number(assignment.feeStructure.amount);

          totalAmount = MathUtil.add(totalAmount, amount);

          return {
            description: `${assignment.feeStructure.category.name} - ${assignment.feeStructure.academicYear}`,
            amount,
          };
        });

        totalAmount = MathUtil.round(totalAmount, 2);

        /**
         * 5. Create invoice
         */
        const invoice = await tx.invoice.create({
          data: {
            schoolId,
            studentId,
            invoiceNumber,
            totalAmount,
            amountPaid: 0,
            status: InvoiceStatus.PENDING,
            dueDate: dueDate ?? null,

            items: {
              create: invoiceItems,
            },
          },
          include: {
            items: true,
            student: true,
          },
        });

        /**
         * 6. Log
         */
        logger.info(
          {
            invoiceId: invoice.id,
            invoiceNumber,
            schoolId,
            studentId,
            totalAmount,
          },
          "Invoice generated successfully"
        );

        return invoice;
      });
    } catch (error) {
      logger.error({ error }, "Failed to generate invoice");
      throw error;
    }
  }

  /**
   * Get invoices
   */
  static async getInvoices(params: {
    schoolId: string;
    page?: number;
    limit?: number;
    status?: InvoiceStatus;
    studentId?: string;
  }) {
    const { schoolId, page = 1, limit = 20, status, studentId } = params;

    try {
      const where: any = {
        schoolId,
        ...(status && { status }),
        ...(studentId && { studentId }),
      };

      const [data, total] = await Promise.all([
        prisma.invoice.findMany({
          where,
          include: {
            items: true,
            student: true,
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.invoice.count({ where }),
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
      logger.error({ error }, "Failed to fetch invoices");
      throw new AppError("Failed to fetch invoices", 500);
    }
  }

  /**
   * Get single invoice
   */
  static async getInvoiceById(id: string, schoolId: string) {
    try {
      const invoice = await prisma.invoice.findFirst({
        where: { id, schoolId },
        include: {
          items: true,
          payments: true,
          student: true,
        },
      });

      if (!invoice) {
        throw new AppError("Invoice not found", 404);
      }

      return invoice;
    } catch (error) {
      logger.error({ error }, "Failed to get invoice");
      throw error;
    }
  }

  /**
   * Record payment
   */
  static async recordPayment(data: {
    schoolId: string;
    invoiceId: string;
    amount: number;
    method: string;
    reference?: string;
  }) {
    const { schoolId, invoiceId, amount, method, reference } = data;

    try {
      return await prisma.$transaction(async (tx) => {
        const invoice = await tx.invoice.findFirst({
          where: { id: invoiceId, schoolId },
        });

        if (!invoice) {
          throw new AppError("Invoice not found", 404);
        }

        const currentPaid = Number(invoice.amountPaid);
        const total = Number(invoice.totalAmount);

        const newAmountPaid = MathUtil.round(
          MathUtil.add(currentPaid, amount),
          2
        );

        let status: InvoiceStatus = InvoiceStatus.PENDING;

        if (newAmountPaid >= total) {
          status = InvoiceStatus.PAID;
        } else if (newAmountPaid > 0) {
          status = InvoiceStatus.PARTIALLY_PAID;
        }

        /**
         * 1. Create payment
         */
        const payment = await tx.payment.create({
          data: {
            schoolId,
            invoiceId,
            amount,
            method: method as any,
            reference: reference ?? null,
          },
        });

        /**
         * 2. Update invoice
         */
        await tx.invoice.update({
          where: { id: invoiceId },
          data: {
            amountPaid: newAmountPaid,
            status,
          },
        });

        logger.info(
          {
            paymentId: payment.id,
            invoiceId,
            amount,
            status,
          },
          "Payment recorded successfully"
        );

        return payment;
      });
    } catch (error) {
      logger.error({ error }, "Payment recording failed");
      throw error;
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

      await prisma.invoice.delete({
        where: { id },
      });

      logger.info({ id }, "Invoice deleted");

      return { message: "Invoice deleted successfully" };
    } catch (error) {
      logger.error({ error }, "Failed to delete invoice");
      throw error;
    }
  }
}









// import { PrismaClient, InvoiceStatus, StudentFeeAssignmentStatus } from "@prisma/client";
// import { AppError } from "../../shared/errors/app.error";
// import { logger } from "../../config/logger";
// import Decimal from "decimal.js";

// const prisma = new PrismaClient();

// /**
//  * ============================================================
//  * Billing Service (Invoice Generation Engine)
//  * ============================================================
//  */
// export class BillingService {
//   /**
//    * Generate invoice for a student based on assigned fees
//    */
//   static async generateInvoice(data: {
//     schoolId: string;
//     studentId: string;
//     dueDate?: Date;
//   }) {
//     const { schoolId, studentId, dueDate } = data;

//     try {
//       return await prisma.$transaction(async (tx) => {
//         /**
//          * 1. Validate student exists
//          */
//         const student = await tx.student.findFirst({
//           where: { id: studentId, schoolId },
//         });

//         if (!student) {
//           throw new AppError("Student not found", 404);
//         }

//         /**
//          * 2. Fetch assigned fees (core billing engine input)
//          */
//         const assignments = await tx.studentFeeAssignment.findMany({
//           where: {
//             studentId,
//             status: StudentFeeAssignmentStatus.UNPAID,
//             feeStructure: {
//               schoolId,
//             },
//           },
//           include: {
//             feeStructure: {
//               include: {
//                 category: true,
//               },
//             },
//           },
//         });

//         if (!assignments.length) {
//           throw new AppError(
//             "No unpaid fee assignments found for student",
//             400
//           );
//         }

//         /**
//          * 3. Generate invoice number
//          */
//         const invoiceCount = await tx.invoice.count({
//           where: { schoolId },
//         });

//         const invoiceNumber = `INV-${new Date().getFullYear()}-${String(
//           invoiceCount + 1
//         ).padStart(6, "0")}`;

//         /**
//          * 4. Build invoice items
//          */
//         let totalAmount = new Decimal(0);

//         const invoiceItems = assignments.map((assignment) => {
//           const amount = new Decimal(assignment.feeStructure.amount);

//           totalAmount = totalAmount.plus(amount);

//           return {
//             description: `${assignment.feeStructure.category.name} - ${assignment.feeStructure.academicYear}`,
//             amount: assignment.feeStructure.amount,
//           };
//         });

//         /**
//          * 5. Create invoice
//          */
//         const invoice = await tx.invoice.create({
//           data: {
//             schoolId,
//             studentId,
//             invoiceNumber,
//             totalAmount: totalAmount.toFixed(2),
//             amountPaid: new Decimal(0).toFixed(2),
//             status: InvoiceStatus.PENDING,
//             dueDate: dueDate ?? null,

//             items: {
//               create: invoiceItems,
//             },
//           },
//           include: {
//             items: true,
//             student: true,
//           },
//         });

//         /**
//          * 6. Mark assignments as linked (optional future audit trail)
//          */
//         await tx.studentFeeAssignment.updateMany({
//           where: {
//             studentId,
//             feeStructureId: {
//               in: assignments.map((a) => a.feeStructureId),
//             },
//           },
//           data: {
//             status: StudentFeeAssignmentStatus.UNPAID,
//           },
//         });

//         logger.info(
//           {
//             invoiceId: invoice.id,
//             invoiceNumber,
//             schoolId,
//             studentId,
//             totalAmount: totalAmount.toString(),
//           },
//           "Invoice generated successfully"
//         );

//         return invoice;
//       });
//     } catch (error: any) {
//       logger.error({ error }, "Failed to generate invoice");
//       throw error;
//     }
//   }

//   /**
//    * Get all invoices for a school
//    */
//   static async getInvoices(params: {
//     schoolId: string;
//     page?: number;
//     limit?: number;
//     status?: InvoiceStatus;
//     studentId?: string;
//   }) {
//     const { schoolId, page = 1, limit = 20, status, studentId } = params;

//     try {
//       const where: any = {
//         schoolId,
//         ...(status && { status }),
//         ...(studentId && { studentId }),
//       };

//       const [data, total] = await Promise.all([
//         prisma.invoice.findMany({
//           where,
//           include: {
//             items: true,
//             student: true,
//           },
//           skip: (page - 1) * limit,
//           take: limit,
//           orderBy: { createdAt: "desc" },
//         }),
//         prisma.invoice.count({ where }),
//       ]);

//       return {
//         data,
//         pagination: {
//           total,
//           page,
//           limit,
//           pages: Math.ceil(total / limit),
//         },
//       };
//     } catch (error) {
//       logger.error({ error }, "Failed to fetch invoices");
//       throw new AppError("Failed to fetch invoices", 500);
//     }
//   }

//   /**
//    * Get single invoice
//    */
//   static async getInvoiceById(id: string, schoolId: string) {
//     try {
//       const invoice = await prisma.invoice.findFirst({
//         where: { id, schoolId },
//         include: {
//           items: true,
//           payments: true,
//           student: true,
//         },
//       });

//       if (!invoice) {
//         throw new AppError("Invoice not found", 404);
//       }

//       return invoice;
//     } catch (error) {
//       logger.error({ error }, "Failed to get invoice");
//       throw error;
//     }
//   }

//   /**
//    * Record payment against invoice
//    */
//   static async recordPayment(data: {
//     schoolId: string;
//     invoiceId: string;
//     amount: number;
//     method: string;
//     reference?: string;
//   }) {
//     const { schoolId, invoiceId, amount, method, reference } = data;

//     try {
//       return await prisma.$transaction(async (tx) => {
//         const invoice = await tx.invoice.findFirst({
//           where: { id: invoiceId, schoolId },
//         });

//         if (!invoice) {
//           throw new AppError("Invoice not found", 404);
//         }

//         const newAmountPaid = new Decimal(invoice.amountPaid)
//           .plus(amount)
//           .toNumber();

//         const totalAmount = new Decimal(invoice.totalAmount);

//         let status: InvoiceStatus = InvoiceStatus.PENDING;

//         if (new Decimal(newAmountPaid).greaterThanOrEqualTo(totalAmount)) {
//           status = InvoiceStatus.PAID;
//         } else if (newAmountPaid > 0) {
//           status = InvoiceStatus.PARTIALLY_PAID;
//         }

//         /**
//          * 1. Create payment
//          */
//         const payment = await tx.payment.create({
//           data: {
//             schoolId,
//             invoiceId,
//             amount,
//             method: method as any,
//             reference,
//           },
//         });

//         /**
//          * 2. Update invoice
//          */
//         await tx.invoice.update({
//           where: { id: invoiceId },
//           data: {
//             amountPaid: newAmountPaid,
//             status,
//           },
//         });

//         logger.info(
//           {
//             paymentId: payment.id,
//             invoiceId,
//             amount,
//             status,
//           },
//           "Payment recorded successfully"
//         );

//         return payment;
//       });
//     } catch (error) {
//       logger.error({ error }, "Payment recording failed");
//       throw error;
//     }
//   }

//   /**
//    * Delete invoice (soft-safe operation)
//    */
//   static async deleteInvoice(id: string, schoolId: string) {
//     try {
//       const invoice = await prisma.invoice.findFirst({
//         where: { id, schoolId },
//       });

//       if (!invoice) {
//         throw new AppError("Invoice not found", 404);
//       }

//       await prisma.invoice.delete({
//         where: { id },
//       });

//       logger.info({ id }, "Invoice deleted");

//       return { message: "Invoice deleted successfully" };
//     } catch (error) {
//       logger.error({ error }, "Failed to delete invoice");
//       throw error;
//     }
//   }
// }