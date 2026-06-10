import { z } from "zod";
import { emailSchema, passwordSchema } from "./common.validator";

/**
 * Authentication validation schemas
 */

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().min(2).max(100),
  role: z.enum([
    "SUPER_ADMIN",
    "SCHOOL_ADMIN",
    "TEACHER",
    "STUDENT",
    "PARENT",
  ]),
});

export type LoginDTO = z.infer<typeof loginSchema>;
export type RegisterDTO = z.infer<typeof registerSchema>;