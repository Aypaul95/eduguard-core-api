import { z } from "zod";

/**
 * School (School) validation
 */

export const createSchoolSchema = z.object({
  name: z.string().min(2).max(150),
  code: z.string().min(3).max(50),
  subscriptionPlan: z.enum(["FREE", "BASIC", "PREMIUM"]).optional(),
});
export const updateSchoolSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  isActive: z.boolean().optional(),
});

export type CreateSchoolDTO = z.infer<typeof createSchoolSchema>;
export type UpdateSchoolDTO = z.infer<typeof updateSchoolSchema>;