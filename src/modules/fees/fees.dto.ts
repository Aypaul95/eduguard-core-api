//src/modules/fees/fees.dto.ts
import { z } from "zod";

/**
 * ============================================================
 * BASE SCHEMAS (NO refine, NO omit)
 * ============================================================
 */

const FeeCategoryBase = z.object({
  schoolId: z.uuid("Invalid school ID"),
  name: z
    .string()
    .trim()
    .min(2)
    .max(100),

  description: z.string().trim().max(500).optional(),
});

const FeeStructureBase = z.object({
  schoolId: z.uuid("Invalid school ID"),
  feeCategoryId: z.uuid("Invalid fee category ID"),
  classId: z.uuid("Invalid class ID").optional().nullable(),
  amount: z.number().positive(),
  academicYear: z.string().min(4).max(20),
});

const DiscountBase = z.object({
  schoolId: z.uuid("Invalid school ID"),
  name: z.string().trim().min(2).max(100),
  percentage: z.number().min(0).max(100).optional(),
  fixedAmount: z.number().positive().optional(),
});

const ScholarshipBase = z.object({
  schoolId: z.uuid("Invalid school ID"),
  studentId: z.uuid("Invalid student ID"),
  type: z.enum(["full", "partial"]),
  amount: z.number().positive(),
  reason: z.string().trim().max(500).optional(),
});

/**
 * ============================================================
 * FEE CATEGORY DTOs
 * ============================================================
 */

export const CreateFeeCategorySchema = FeeCategoryBase;

export const UpdateFeeCategorySchema = FeeCategoryBase.omit({
  schoolId: true,
}).partial();

export const FeeCategoryParamsSchema = z.object({
  id: z.uuid("Invalid fee category ID"),
});

/**
 * ============================================================
 * FEE STRUCTURE DTOs
 * ============================================================
 */

export const CreateFeeStructureSchema = FeeStructureBase;

export const UpdateFeeStructureSchema = FeeStructureBase.omit({
  schoolId: true,
}).partial();

export const FeeStructureParamsSchema = z.object({
  id: z.uuid("Invalid fee structure ID"),
});

/**
 * ============================================================
 * STUDENT FEE ASSIGNMENT DTOs
 * ============================================================
 */

export const AssignFeeToStudentSchema = z.object({
  studentId: z.uuid(),
  feeStructureId: z.uuid(),
});

export const BulkAssignFeeToStudentsSchema = z.object({
  feeStructureId: z.uuid(),
  studentIds: z.array(z.uuid()).min(1),
});

export const StudentFeeAssignmentParamsSchema = z.object({
  id: z.uuid(),
});

export const UpdateStudentFeeAssignmentSchema = z.object({
  status: z.enum(["UNPAID", "PARTIAL", "PAID"]),
});

/**
 * ============================================================
 * DISCOUNT DTOs
 * ============================================================
 */

export const CreateDiscountSchema = DiscountBase.refine(
  (data) => data.percentage !== undefined || data.fixedAmount !== undefined,
  {
    message: "Either percentage or fixedAmount must be provided",
  }
);

export const UpdateDiscountSchema = DiscountBase.omit({
  schoolId: true,
}).partial();

export const DiscountParamsSchema = z.object({
  id: z.uuid(),
});

/**
 * ============================================================
 * SCHOLARSHIP DTOs
 * ============================================================
 */

export const CreateScholarshipSchema = ScholarshipBase;

export const UpdateScholarshipSchema = ScholarshipBase.omit({
  schoolId: true,
  studentId: true,
}).partial();

export const ScholarshipParamsSchema = z.object({
  id: z.uuid(),
});

/**
 * ============================================================
 * QUERY DTO
 * ============================================================
 */

export const FeesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  academicYear: z.string().optional(),
  classId: z.string().optional(),
  feeCategoryId: z.string().optional(),
  status: z.string().optional(),
});

/**
 * ============================================================
 * RESPONSE SCHEMAS
 * ============================================================
 */

export const FeeCategoryResponseSchema = z.object({
  id: z.string(),
  schoolId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.date(),
});

export const FeeStructureResponseSchema = z.object({
  id: z.string(),
  schoolId: z.string(),
  feeCategoryId: z.string(),
  classId: z.string().nullable(),
  amount: z.number(),
  academicYear: z.string(),
  createdAt: z.date(),
});

export const StudentFeeAssignmentResponseSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  feeStructureId: z.string(),
  status: z.string(),
  createdAt: z.date(),
});

export const DiscountResponseSchema = z.object({
  id: z.string(),
  schoolId: z.string(),
  name: z.string(),
  percentage: z.number().nullable(),
  fixedAmount: z.number().nullable(),
  createdAt: z.date(),
});

export const ScholarshipResponseSchema = z.object({
  id: z.string(),
  schoolId: z.string(),
  studentId: z.string(),
  type: z.string(),
  amount: z.number(),
  reason: z.string().nullable(),
  createdAt: z.date(),
});

/**
 * ============================================================
 * TYPES
 * ============================================================
 */

export type CreateFeeCategoryDto = z.infer<typeof CreateFeeCategorySchema>;
export type UpdateFeeCategoryDto = z.infer<typeof UpdateFeeCategorySchema>;

export type CreateFeeStructureDto = z.infer<typeof CreateFeeStructureSchema>;
export type UpdateFeeStructureDto = z.infer<typeof UpdateFeeStructureSchema>;

export type AssignFeeToStudentDto = z.infer<typeof AssignFeeToStudentSchema>;
export type BulkAssignFeeToStudentsDto = z.infer<typeof BulkAssignFeeToStudentsSchema>;

export type UpdateStudentFeeAssignmentDto = z.infer<typeof UpdateStudentFeeAssignmentSchema>;

export type CreateDiscountDto = z.infer<typeof CreateDiscountSchema>;
export type UpdateDiscountDto = z.infer<typeof UpdateDiscountSchema>;

export type CreateScholarshipDto = z.infer<typeof CreateScholarshipSchema>;
export type UpdateScholarshipDto = z.infer<typeof UpdateScholarshipSchema>;

export type FeesQueryDto = z.infer<typeof FeesQuerySchema>;