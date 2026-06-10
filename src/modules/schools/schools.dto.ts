import { z } from "zod";

/**
 * ===============================
 * SCHOOL CORE VALIDATION SCHEMAS
 * ===============================
 *
 * Used for:
 * - Creating schools
 * - Updating schools
 * - Query validation
 * - Path params validation
 * - Safe typing across service/controller layers
 */

/**
 * -----------------------
 * CREATE SCHOOL DTO
 * -----------------------
 */
export const createSchoolSchema = z.object({
  name: z
    .string()
    .min(2, "School name must be at least 2 characters")
    .max(100, "School name must not exceed 100 characters"),

  email: z.string().email("Invalid email format").optional(),

  phone: z.string().min(7, "Phone number is too short").max(20, "Phone number is too long").optional(),

  address: z.string().max(255, "Address must not exceed 255 characters").optional(),

  isActive: z.boolean().optional().default(true),
});

/**
 * ========================
 * UPDATE SCHOOL SCHEMA
 * ========================
 */
export const updateSchoolSchema = z.object({
  name: z.string().min(2, "School name must be at least 2 characters").max(100).optional(),

  email: z.string().email("Invalid email format").optional(),

  phone: z.string().min(7, "Phone number is too short").max(20, "Phone number is too long").optional(),

  address: z.string().max(255, "Address must not exceed 255 characters").optional(),

  isActive: z.boolean().optional(),
});

/**
 * ========================
 * SCHOOL ID PARAM SCHEMA
 * ========================
 */
export const schoolIdParamSchema = z.object({
  schoolId: z.string().min(1, "schoolId is required"),
});

/**
 * -----------------------
 * SCHOOL QUERY FILTERS
 * -----------------------
 */
export const schoolQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10)),

  search: z.string().optional(),

  isActive: z
    .string()
    .optional()
    .transform((val) => (val === "true" ? true : val === "false" ? false : undefined)),
});

/**
 * ===============================
 * TYPE EXPORTS (INFERRED TYPES)
 * ===============================
 */
export type CreateSchoolDTO = z.infer<typeof createSchoolSchema>;
export type UpdateSchoolDTO = z.infer<typeof updateSchoolSchema>;
export type SchoolIdParamDTO = z.infer<typeof schoolIdParamSchema>;
export type SchoolQueryDTO = z.infer<typeof schoolQuerySchema>;

/**
 * ===============================
 * SAFE VALIDATION HELPERS
 * ===============================
 * These helpers ensure consistent error handling across controllers
 */

export const validateCreateSchool = (data: unknown) => {
  return createSchoolSchema.safeParse(data);
};

export const validateUpdateSchool = (data: unknown) => {
  return updateSchoolSchema.safeParse(data);
};

export const validateSchoolIdParam = (data: unknown) => {
  return schoolIdParamSchema.safeParse(data);
};

export const validateSchoolQuery = (data: unknown) => {
  return schoolQuerySchema.safeParse(data);
};