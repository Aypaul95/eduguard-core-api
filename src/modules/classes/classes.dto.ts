import { z } from "zod";

/**
 * =========================================
 * CLASSES DTO (ZOD VALIDATION SCHEMAS)
 * =========================================
 * Handles validation for Class module APIs
 * - Create Class
 * - Update Class
 * - Get Class Params
 * - Query Filters
 * =========================================
 */

/**
 * =========================
 * COMMON VALIDATION PIECES
 * =========================
 */

const uuidSchema = z.string().uuid({
  message: "Invalid UUID format",
});

const schoolIdSchema = uuidSchema.describe("School ID (required for multi-school isolation)");

/**
 * =========================
 * CREATE CLASS DTO
 * =========================
 */
export const createClassSchema = z.object({
  name: z
    .string({
       message: "Class name is required",
    })
    .min(2, "Class name must be at least 2 characters")
    .max(100, "Class name must not exceed 100 characters"),

  description: z
    .string()
    .max(255, "Description must not exceed 255 characters")
    .optional(),

  schoolId: schoolIdSchema,

  gradeLevel: z
    .string()
    .max(50, "Grade level must not exceed 50 characters")
    .optional(),

  capacity: z
    .number()
    .int("Capacity must be an integer")
    .positive("Capacity must be greater than 0")
    .optional(),

  isActive: z.boolean().optional().default(true),
});

/**
 * Type inference for Create Class DTO
 */
export type CreateClassDto = z.infer<typeof createClassSchema>;

/**
 * =========================
 * UPDATE CLASS DTO
 * =========================
 */
export const updateClassSchema = z.object({
  name: z.string().min(2).max(100).optional(),

  description: z.string().max(255).optional().nullable(),

  gradeLevel: z.string().max(50).optional(),

  capacity: z.number().int().positive().optional(),

  isActive: z.boolean().optional(),
});

/**
 * Type inference for Update Class DTO
 */
export type UpdateClassDto = z.infer<typeof updateClassSchema>;

/**
 * =========================
 * CLASS PARAMS DTO
 * =========================
 * For routes like:
 * GET /classes/:classId
 */
export const classParamsSchema = z.object({
  classId: uuidSchema,
});

/**
 * Type inference
 */
export type ClassParamsDto = z.infer<typeof classParamsSchema>;

/**
 * =========================
 * QUERY FILTER DTO
 * =========================
 * For:
 * GET /classes?page=1&limit=10&search=js&schoolId=xxx
 */
export const classQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, "Page must be greater than 0"),

  limit: z
    .string()
    .optional()
    .default("10")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 100, "Limit must be between 1 and 100"),

  search: z.string().optional(),

  schoolId: schoolIdSchema.optional(),

  isActive: z
    .string()
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      return val === "true";
    })
    .optional(),

  gradeLevel: z.string().optional(),
});

/**
 * Type inference
 */
export type ClassQueryDto = z.infer<typeof classQuerySchema>;

/**
 * =========================
 * RESPONSE TYPES (OPTIONAL)
 * =========================
 * Useful for service/controller consistency
 */

export type ClassResponseDto = {
  id: string;
  name: string;
  description?: string | null;
  gradeLevel?: string | null;
  capacity?: number | null;
  isActive: boolean;
  schoolId: string;
  createdAt: Date;
  updatedAt: Date;
};