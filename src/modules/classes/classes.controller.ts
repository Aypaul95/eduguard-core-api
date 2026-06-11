import { Request, Response, NextFunction } from "express";

import {
    createClassSchema,
    updateClassSchema,
    classParamsSchema,
    classQuerySchema,
} from "./classes.dto";

import { ClassesService } from "./classes.service";
import { logger } from "../../shared/utils/logger";
import { AppError } from "../../shared/errors/app.error";

/**
 * =========================================
 * CLASSES CONTROLLER
 * =========================================
 * Handles HTTP requests for:
 * - Create Class
 * - Get All Classes
 * - Get Single Class
 * - Update Class
 * - Delete Class
 * =========================================
 */

export class ClassesController {
    constructor(private readonly classesService: ClassesService) { }

    /**
     * CREATE CLASS
     * POST /api/v1/classes
     */
    createClass = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedData = createClassSchema.parse(req.body);

            logger.info("Creating class", {
                schoolId: validatedData.schoolId,
                name: validatedData.name,
            });

            const result = await this.classesService.createClass(validatedData);

            return res.status(201).json({
                success: true,
                message: "Class created successfully",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET ALL CLASSES
     * GET /api/v1/classes
     */
    getAllClasses = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const query = classQuerySchema.parse(req.query);

            logger.info("Fetching all classes", {
                schoolId: query.schoolId,
                page: query.page,
                limit: query.limit,
            });

            const result = await this.classesService.getAllClasses(query);

            return res.status(200).json({
                success: true,
                message: "Classes fetched successfully",
                data: result.data,
                meta: result.meta,
            });
        } catch (error) {
            next(error);
        }
    };

    /** NOTE: AM UNABLE TO CALL THIS ENDPOINT. KEEPS GIVING ME ERROR
     * GET SINGLE CLASS
     * GET /api/v1/classes/:classId 
     */
    getClassById = async (req: Request, res: Response) => {
        const classIdRaw = req.params.classId;

        const classId = Array.isArray(classIdRaw)
            ? classIdRaw[0]
            : classIdRaw;

        if (!classId) {
            throw new AppError("classId is required", 400);
        }

        const schoolId = req.user?.schoolId;

        if (!schoolId) {
            throw new AppError("Unauthorized: missing school context", 401);
        }

        const classData = await this.classesService.getClassById({
            classId: String(classId),
            schoolId: String(schoolId),
        });

        return res.json({
            success: true,
            data: classData,
        });
    };
    /** NOTE: AM UNABLE TO CALL THIS ENDPOINT. KEEPS GIVING ME ERROR SAME ERROR AS ABOVE
     * UPDATE CLASS
     * PATCH /api/v1/classes/:classId
     */
    updateClass = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { classId } = classParamsSchema.parse(req.params);
            const validatedData = updateClassSchema.parse(req.body);

            const schoolId = req.query.schoolId as string;

            if (!schoolId) {
                throw new AppError("schoolId is required", 400);
            }

            logger.info("Updating class", {
                classId,
                schoolId,
            });

            const result = await this.classesService.updateClass({
                classId,
                schoolId,
                data: validatedData,
            });

            return res.status(200).json({
                success: true,
                message: "Class updated successfully",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * DELETE CLASS
     * DELETE /api/v1/classes/:classId
     */
    deleteClass = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { classId } = classParamsSchema.parse(req.params);

            const schoolId = req.query.schoolId as string;

            if (!schoolId) {
                throw new AppError("schoolId is required", 400);
            }

            logger.info("Deleting class", {
                classId,
                schoolId,
            });

            await this.classesService.deleteClass({
                classId,
                schoolId,
            });

            return res.status(200).json({
                success: true,
                message: "Class deleted successfully",
            });
        } catch (error) {
            next(error);
        }
    };
}