import { z } from "zod";

/**
 * ============================================================
 * STUDENT ENUMS
 * ============================================================
 */

export const GenderEnum = z.enum([
  "MALE",
  "FEMALE",
  "OTHER",
]);

/**
 * ============================================================
 * CREATE STUDENT SCHEMA
 * ============================================================
 */
export const createStudentSchema = z.object({
  schoolId: z
    .string()
    .uuid("Invalid school ID format"),

  admissionNumber: z
    .string()
    .trim()
    .min(1, "Admission number is required")
    .max(50, "Admission number cannot exceed 50 characters"),

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

  middleName: z
    .string()
    .trim()
    .max(100, "Middle name cannot exceed 100 characters")
    .optional(),

  gender: GenderEnum,

  dateOfBirth: z
    .string()
    .datetime("Invalid date of birth format"),

  email: z
    .string()
    .email("Invalid email address")
    .optional(),

  phoneNumber: z
    .string()
    .trim()
    .max(20, "Phone number cannot exceed 20 characters")
    .optional(),

  address: z
    .string()
    .trim()
    .max(500, "Address cannot exceed 500 characters")
    .optional(),

//   classId: z
//     .string()
//     .uuid("Invalid class ID format")
//     .optional(),

//   guardianName: z
//     .string()
//     .trim()
//     .max(200, "Guardian name cannot exceed 200 characters")
//     .optional(),

//   guardianPhone: z
//     .string()
//     .trim()
//     .max(20, "Guardian phone cannot exceed 20 characters")
//     .optional(),

//   guardianEmail: z
//     .string()
//     .email("Invalid guardian email")
//     .optional(),

  isActive: z
    .boolean()
    .optional()
    .default(true),
});

/**
 * ============================================================
 * UPDATE STUDENT SCHEMA
 * ============================================================
 */
export const updateStudentSchema =
  createStudentSchema
    .omit({
      schoolId: true,
    })
    .partial();

/**
 * ============================================================
 * STUDENT PARAMS SCHEMA
 * ============================================================
 */
export const studentParamsSchema = z.object({
  studentId: z
    .string()
    .uuid("Invalid student ID format"),
});

/**
 * ============================================================
 * STUDENT QUERY SCHEMA
 * ============================================================
 */
export const studentQuerySchema = z.object({
  page: z
    .coerce
    .number()
    .int()
    .positive()
    .default(1),

  limit: z
    .coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(20),

  search: z
    .string()
    .trim()
    .optional(),

  classId: z
    .string()
    .uuid()
    .optional(),

  gender: GenderEnum.optional(),

  isActive: z
    .coerce
    .boolean()
    .optional(),
});

/**
 * ============================================================
 * BULK IMPORT STUDENTS
 * ============================================================
 */
export const bulkStudentImportSchema = z.object({
  schoolId: z
    .string()
    .uuid("Invalid school ID format"),

  students: z
    .array(createStudentSchema.omit({ schoolId: true }))
    .min(1, "At least one student is required")
    .max(1000, "Maximum 1000 students allowed per import"),
});

/**
 * ============================================================
 * TYPE EXPORTS
 * ============================================================
 */

export type CreateStudentDto =
  z.infer<typeof createStudentSchema>;

export type UpdateStudentDto =
  z.infer<typeof updateStudentSchema>;

export type StudentParamsDto =
  z.infer<typeof studentParamsSchema>;

export type StudentQueryDto =
  z.infer<typeof studentQuerySchema>;

export type BulkStudentImportDto =
  z.infer<typeof bulkStudentImportSchema>;

export type GenderDto =
  z.infer<typeof GenderEnum>;