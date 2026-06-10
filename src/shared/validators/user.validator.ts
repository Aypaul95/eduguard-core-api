import { z } from "zod";
import { emailSchema, nameSchema, phoneSchema } from "./common.validator";

/**
 * User validation (staff, admin, etc.)
 */

export const createUserSchema = z.object({
  email: emailSchema,
  fullName: nameSchema,
  phone: phoneSchema.optional(),
  role: z.enum([
    "SUPER_ADMIN",
    "SCHOOL_ADMIN",
    "TEACHER",
    "ACCOUNTANT",
  ]),
  schoolId: z.string().uuid(),
});

export const updateUserSchema = z.object({
  fullName: nameSchema.optional(),
  phone: phoneSchema.optional(),
  isActive: z.boolean().optional(),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;