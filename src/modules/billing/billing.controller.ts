// src/modules/billing/billing.controller.ts

import { Request, Response, NextFunction } from "express";
import { BillingService } from "./billing.service";
import {
    CreateInvoiceSchema,
    InvoiceParamsSchema,
    StudentInvoiceParamsSchema,
    InvoiceQuerySchema,
    RecordPaymentSchema,
    RecordPaymentDTO,
} from "./billing.dto";

import { AppError } from "../../shared/errors/app.error";
import { logger } from "../../config/logger";

/**
 * ============================================================
 * Billing Controller
 * Invoice & Payment APIs
 * ============================================================
 */
export class BillingController {
    /**
     * Generate invoice
     */
    static async generateInvoice(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            const parsed = CreateInvoiceSchema.parse(req.body);

            const invoice = await BillingService.generateInvoice({
                schoolId: parsed.schoolId,
                studentId: parsed.studentId,
                ...(parsed.dueDate
                    ? { dueDate: new Date(parsed.dueDate) }
                    : {}),
            });

            return res.status(201).json({
                success: true,
                message: "Invoice generated successfully",
                data: invoice,
            });
        } catch (error) {
            logger.error({ error }, "Generate invoice failed");
            return next(error);
        }
    }

    /**
     * Get invoices (pagination + filters)
     */
    static async getInvoices(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            const query = InvoiceQuerySchema.parse(req.query);

            const filters = {
                schoolId: query.schoolId,
                page: query.page,
                limit: query.limit,
                ...(query.status ? { status: query.status } : {}),
                ...(query.studentId ? { studentId: query.studentId } : {}),
            };

            const result = await BillingService.getInvoices(filters);

            return res.status(200).json({
                success: true,
                message: "Invoices retrieved successfully",
                ...result,
            });
        } catch (error) {
            logger.error({ error }, "Get invoices failed");
            return next(error);
        }
    }

    /**
     * Get single invoice
     */
    static async getInvoiceById(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            const params = InvoiceParamsSchema.parse(req.params);
            const schoolId = req.query.schoolId as string;

            if (!schoolId) {
                throw new AppError("schoolId is required", 400);
            }

            const invoice = await BillingService.getInvoiceById(
                params.id,
                schoolId
            );

            return res.status(200).json({
                success: true,
                message: "Invoice retrieved successfully",
                data: invoice,
            });
        } catch (error) {
            logger.error({ error }, "Get invoice failed");
            return next(error);
        }
    }

    /**
   * Record payment
   */
    static async recordPayment(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            const params = InvoiceParamsSchema.parse(req.params);

            const body = RecordPaymentSchema.parse(req.body);

            const schoolId = req.body.schoolId;

            if (!schoolId) {
                throw new AppError("schoolId is required", 400);
            }

            /**
             * ✅ FIX: build clean payload (no undefined fields)
             */
            const payload = {
                schoolId,
                invoiceId: params.id,
                amount: body.amount,
                method: body.method,
                ...(body.reference ? { reference: body.reference } : {}),
            };

            const payment = await BillingService.recordPayment(payload);

            return res.status(201).json({
                success: true,
                message: "Payment recorded successfully",
                data: payment,
            });
        } catch (error) {
            logger.error({ error }, "Record payment failed");
            return next(error);
        }
    }
    /**
     * Delete invoice
     */
    static async deleteInvoice(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            const params = InvoiceParamsSchema.parse(req.params);
            const schoolId = req.query.schoolId as string;

            if (!schoolId) {
                throw new AppError("schoolId is required", 400);
            }

            const result = await BillingService.deleteInvoice(
                params.id,
                schoolId
            );

            return res.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (error) {
            logger.error({ error }, "Delete invoice failed");
            return next(error);
        }
    }

    /**
     * Get student invoices
     */
    static async getStudentInvoices(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            const params = StudentInvoiceParamsSchema.parse(req.params);
            const schoolId = req.query.schoolId as string;

            if (!schoolId) {
                throw new AppError("schoolId is required", 400);
            }

            const result = await BillingService.getInvoices({
                schoolId,
                studentId: params.studentId,
            });

            return res.status(200).json({
                success: true,
                message: "Student invoices retrieved successfully",
                ...result,
            });
        } catch (error) {
            logger.error({ error }, "Get student invoices failed");
            return next(error);
        }
    }
}