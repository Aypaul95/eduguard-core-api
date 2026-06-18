import { Request, Response, NextFunction, Router } from "express";
import { PrismaClient } from "@prisma/client";

import { PaymentsService } from "./payments.service";
import { logger } from "../../config/logger";
import { AppError } from "../../shared/errors/app.error";

/**
 * ============================================================
 * PAYMENTS CONTROLLER (API LAYER)
 * ============================================================
 *
 * Pattern aligned with:
 * - FeesController (class-based + router)
 * - BillingController (static-like service calls)
 *
 * Responsibilities:
 * - Extract school context safely
 * - Validate inputs (assumed via DTO/Zod middleware)
 * - Call service layer
 * - Return consistent responses
 */

export class PaymentsController {
    public router: Router;
    private readonly paymentsService: PaymentsService;

    constructor(prisma: PrismaClient) {
        this.router = Router();
        this.paymentsService = new PaymentsService(prisma);
        this.initializeRoutes();
    }

    /**
     * ============================================================
     * SCHOOL CONTEXT HELPER
     * ============================================================
     */
    private getSchoolId(req: Request): string {
        const schoolId = req.headers["x-school-id"] as string;

        if (!schoolId) {
            throw new AppError("schoolId is required in x-school-id header", 400);
        }

        return schoolId;
    }

    private initializeRoutes(): void {
        this.router.post("/initialize", this.initializePayment);
        this.router.get("/verify", this.verifyPayment);
        this.router.post("/manual", this.createManualPayment);

        this.router.get("/:id", this.getPaymentById);
        this.router.get("/", this.getPayments);

        this.router.get("/invoice/:invoiceId", this.getPaymentsByInvoice);

        this.router.post("/webhook", this.paymentWebhook);
    }

    /**
     * ============================================================
     * INITIALIZE PAYMENT
     * ============================================================
     */
    initializePayment = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const schoolId = this.getSchoolId(req);

            const result = await this.paymentsService.initializePayment({
                ...req.body,
                schoolId,
            });

            res.status(200).json({
                success: true,
                message: "Payment initialized successfully",
                data: result,
            });
        } catch (error) {
            logger.error({ error }, "initializePayment failed");
            next(error);
        }
    };

    /**
     * ============================================================
     * VERIFY PAYMENT
     * ============================================================
     */
    verifyPayment = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const schoolId = this.getSchoolId(req);

            const reference = req.query.reference;

            if (!reference || typeof reference !== "string") {
                throw new AppError("Payment reference is required", 400);
            }

            const result = await this.paymentsService.verifyPayment(
                { reference },
                schoolId
            );

            res.status(200).json({
                success: true,
                message: "Payment verified successfully",
                data: result,
            });
        } catch (error) {
            logger.error({ error }, "verifyPayment failed");
            next(error);
        }
    };

    /**
     * ============================================================
     * CREATE MANUAL PAYMENT
     * ============================================================
     */
    createManualPayment = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const schoolId = this.getSchoolId(req);

            const result = await this.paymentsService.createManualPayment({
                ...req.body,
                schoolId,
            });

            res.status(201).json({
                success: true,
                message: "Payment recorded successfully",
                data: result,
            });
        } catch (error) {
            logger.error({ error }, "createManualPayment failed");
            next(error);
        }
    };

    /**
     * ============================================================
     * GET PAYMENT BY ID
     * ============================================================
     */
    getPaymentById = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const schoolId = this.getSchoolId(req);

            const { id } = req.params;

            if (!id || Array.isArray(id)) {
                throw new AppError("Invalid payment ID", 400);
            }

            const result = await this.paymentsService.getPaymentById(id, schoolId);

            res.status(200).json({
                success: true,
                message: "Payment retrieved successfully",
                data: result,
            });
        } catch (error) {
            logger.error({ error }, "getPaymentById failed");
            next(error);
        }
    };

    /**
     * ============================================================
     * GET PAYMENTS (FILTERED)
     * ============================================================
     */
    getPayments = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const schoolId = this.getSchoolId(req);

            const result = await this.paymentsService.getPayments({
                ...req.query,
                schoolId,
            } as any);

            res.status(200).json({
                success: true,
                message: "Payments retrieved successfully",
                data: result,
            });
        } catch (error) {
            logger.error({ error }, "getPayments failed");
            next(error);
        }
    };

    /**
     * ============================================================
     * GET PAYMENTS BY INVOICE
     * ============================================================
     */
    getPaymentsByInvoice = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const schoolId = this.getSchoolId(req);

            const { invoiceId } = req.params;

            if (!invoiceId || Array.isArray(invoiceId)) {
                throw new AppError("invoiceId is required", 400);
            }

            const result = await this.paymentsService.getPaymentsByInvoice(
                invoiceId,
                schoolId
            );

            res.status(200).json({
                success: true,
                message: "Invoice payments retrieved successfully",
                data: result,
            });
        } catch (error) {
            logger.error({ error }, "getPaymentsByInvoice failed");
            next(error);
        }
    };

    /**
     * ============================================================
     * WEBHOOK HANDLER
     * ============================================================
     */
    paymentWebhook = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            /**
             * NOTE:
             * In production:
             * - Validate Paystack signature header here
             * - Never trust raw body blindly
             */
            const { reference } = req.body;
            const schoolId = req.body.schoolId;

            if (!reference || typeof reference !== "string") {
                throw new AppError("Invalid webhook payload", 400);
            }

            if (!schoolId) {
                throw new AppError("schoolId is required", 400);
            }

            const result = await this.paymentsService.processWebhook(
                reference,
                schoolId
            );

            res.status(200).json({
                success: true,
                message: "Webhook processed successfully",
                data: result,
            });
        } catch (error) {
            logger.error({ error }, "paymentWebhook failed");
            next(error);
        }
    };
}

/**
 * ============================================================
 * FACTORY EXPORT (LIKE FEES MODULE STYLE)
 * ============================================================
 */
export const createPaymentsController = (
    prisma: PrismaClient
): Router => {
    return new PaymentsController(prisma).router;
};