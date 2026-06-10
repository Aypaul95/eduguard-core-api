import { z } from "zod";
import { nameSchema, phoneSchema } from "./common.validator";

/**
 * Student validation schema
 */

export const createStudentSchema = z.object({
  fullName: nameSchema,
  admissionNumber: z.string().min(3).max(50),
  class: z.string().min(1).max(50),
  section: z.string().optional(),
  parentPhone: phoneSchema.optional(),
  schoolId: z.string().uuid(),
});

export const updateStudentSchema = z.object({
  fullName: nameSchema.optional(),
  class: z.string().optional(),
  section: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type CreateStudentDTO = z.infer<typeof createStudentSchema>;
export type UpdateStudentDTO = z.infer<typeof updateStudentSchema>;