import { z } from "zod";

/**
 * ============================================================
 * PARENT VALIDATION SCHEMAS (DTOs)
 * ============================================================
 * Handles:
 * - Create Parent
 * - Update Parent
 * - Parent Query Filters
 * - Parent Route Params
 * ============================================================
 */

/**
 * Phone Number Validation
 * Supports:
 * +2348012345678
 * 08012345678
 */
const phoneSchema = z
  .string()
  .trim()
  .min(10, "Phone number is too short")
  .max(20, "Phone number is too long");

/**
 * ============================================================
 * CREATE PARENT DTO
 * ============================================================
 */
export const createParentSchema = z.object({
  schoolId: z
    .string()
    .uuid("Invalid school ID"),

  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(100, "First name cannot exceed 100 characters"),

  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(100, "Last name cannot exceed 100 characters"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address"),

  phone: phoneSchema,

  address: z
    .string()
    .trim()
    .max(500, "Address cannot exceed 500 characters")
    .optional(),

  occupation: z
    .string()
    .trim()
    .max(150, "Occupation cannot exceed 150 characters")
    .optional(),

  isActive: z
    .boolean()
    .optional()
    .default(true),
});

/**
 * ============================================================
 * UPDATE PARENT DTO
 * ============================================================
 */
export const updateParentSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2)
      .max(100)
      .optional(),

    lastName: z
      .string()
      .trim()
      .min(2)
      .max(100)
      .optional(),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email()
      .optional(),

    phone: phoneSchema.optional(),

    address: z
      .string()
      .trim()
      .max(500)
      .optional(),

    occupation: z
      .string()
      .trim()
      .max(150)
      .optional(),

    isActive: z
      .boolean()
      .optional(),
  })
  .strict();

/**
 * ============================================================
 * PARENT ID PARAMS DTO
 * ============================================================
 */
export const parentParamsSchema = z.object({
  parentId: z
    .string()
    .uuid("Invalid parent ID"),
});

/**
 * ============================================================
 * SCHOOL + PARENT PARAMS DTO
 * ============================================================
 */
export const schoolParentParamsSchema = z.object({
  schoolId: z
    .string()
    .uuid("Invalid school ID"),

  parentId: z
    .string()
    .uuid("Invalid parent ID"),
});

/**
 * ============================================================
 * GET ALL PARENTS QUERY DTO
 * ============================================================
 */
export const parentQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive()
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(20),

  search: z
    .string()
    .trim()
    .optional(),

  schoolId: z
    .string()
    .uuid()
    .optional(),

  isActive: z
    .coerce
    .boolean()
    .optional(),
});

/**
 * ============================================================
 * TYPESCRIPT TYPES
 * ============================================================
 */

export type CreateParentDto = z.infer<
  typeof createParentSchema
>;

export type UpdateParentDto = z.infer<
  typeof updateParentSchema
>;

export type ParentParamsDto = z.infer<
  typeof parentParamsSchema
>;

export type SchoolParentParamsDto = z.infer<
  typeof schoolParentParamsSchema
>;

export type ParentQueryDto = z.infer<
  typeof parentQuerySchema
>;