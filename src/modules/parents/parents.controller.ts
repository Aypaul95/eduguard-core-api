// src/modules/parents/parents.controller.ts

import { Request, Response, NextFunction } from "express";

import { ParentsService } from "./parents.service";

import {
    createParentSchema,
    updateParentSchema,
    parentParamsSchema,
    parentQuerySchema,
} from "./parents.dto";

import { AppError } from "../../shared/errors/app.error";
import { logger } from "../../shared/utils/logger";

/**
 * ============================================================
 * PARENTS CONTROLLER
 * ============================================================
 * Handles:
 * - Create Parent
 * - Get Parent By Id
 * - Get All Parents
 * - Update Parent
 * - Delete Parent
 * ============================================================
 */
export class ParentsController {
    constructor(private readonly parentsService: ParentsService) { }

    /**
     * ============================================================
     * CREATE PARENT
     * POST /api/v1/parents
     * ============================================================
     */
    createParent = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const dto = createParentSchema.parse(req.body);

            const parent = await this.parentsService.createParent(dto);

            logger.info("Parent created successfully", {
                parentId: parent.id,
                schoolId: parent.schoolId,
            });

            res.status(201).json({
                success: true,
                message: "Parent created successfully",
                data: parent,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * ============================================================
     * GET PARENT BY ID
     * GET /api/v1/parents/:parentId
     * ============================================================
     */
    getParentById = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { parentId } = parentParamsSchema.parse(req.params);

            const parent =
                await this.parentsService.getParentById(parentId);

            if (!parent) {
                throw new AppError(
                    "Parent not found",
                    404,
                    "PARENT_NOT_FOUND",
                );
            }

            res.status(200).json({
                success: true,
                data: parent,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * ============================================================
     * GET ALL PARENTS
     * GET /api/v1/parents
     * ============================================================
     */
    getParents = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const query = parentQuerySchema.parse(req.query);

            const result =
                await this.parentsService.getParents(query);

            res.status(200).json({
                success: true,
                ...result,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * ============================================================
     * UPDATE PARENT
     * PATCH /api/v1/parents/:parentId
     * ============================================================
     */
    updateParent = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { parentId } = parentParamsSchema.parse(req.params);

            const dto = updateParentSchema.parse(req.body);

            const parent =
                await this.parentsService.updateParent(
                    parentId,
                    dto,
                );

            logger.info("Parent updated successfully", {
                parentId,
            });

            res.status(200).json({
                success: true,
                message: "Parent updated successfully",
                data: parent,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * ============================================================
     * DELETE PARENT
     * DELETE /api/v1/parents/:parentId
     * ============================================================
     */
    deleteParent = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { parentId } = parentParamsSchema.parse(req.params);

            await this.parentsService.deleteParent(parentId);

            logger.info("Parent deleted successfully", {
                parentId,
            });

            res.status(200).json({
                success: true,
                message: "Parent deleted successfully",
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * ============================================================
     * GET PARENTS BY SCHOOL
     * GET /api/v1/schools/:schoolId/parents
     * ============================================================
     */
    getParentsBySchool = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const schoolIdParam = req.params.schoolId;

            // ============================================================
            // Validate schoolId type (Express safety fix)
            // ============================================================
            if (!schoolIdParam || Array.isArray(schoolIdParam)) {
                throw new AppError(
                    "Invalid School ID",
                    400,
                    "INVALID_SCHOOL_ID",
                );
            }

            const parents =
                await this.parentsService.getParentsBySchool(
                    schoolIdParam,
                );

            res.status(200).json({
                success: true,
                count: parents.length,
                data: parents,
            });
        } catch (error) {
            next(error);
        }
    };
    /**
     * ============================================================
     * ACTIVATE PARENT
     * PATCH /api/v1/parents/:parentId/activate
     * ============================================================
     */
    activateParent = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { parentId } = parentParamsSchema.parse(req.params);

            const parent =
                await this.parentsService.activateParent(
                    parentId,
                );

            logger.info("Parent activated", {
                parentId,
            });

            res.status(200).json({
                success: true,
                message: "Parent activated successfully",
                data: parent,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * ============================================================
     * DEACTIVATE PARENT
     * PATCH /api/v1/parents/:parentId/deactivate
     * ============================================================
     */
    deactivateParent = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { parentId } = parentParamsSchema.parse(req.params);

            const parent =
                await this.parentsService.deactivateParent(
                    parentId,
                );

            logger.info("Parent deactivated", {
                parentId,
            });

            res.status(200).json({
                success: true,
                message: "Parent deactivated successfully",
                data: parent,
            });
        } catch (error) {
            next(error);
        }
    };
}