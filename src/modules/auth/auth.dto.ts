// src/modules/auth/auth.dto.ts

import { z } from "zod";

/**
 * ===============================
 * PASSWORD SCHEMA
 * ===============================
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(100, "Password is too long")
  .regex(/[A-Z]/, "Must contain uppercase letter")
  .regex(/[a-z]/, "Must contain lowercase letter")
  .regex(/[0-9]/, "Must contain number");

/**
 * ===============================
 * REGISTER USER DTO
 * ===============================
 */
export const registerUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),

  schoolId: z.string().uuid("Invalid schoolId format"),

  role: z.enum(["ADMIN", "TEACHER", "STUDENT", "ACCOUNTANT"]).optional(),
});

/**
 * ===============================
 * LOGIN DTO
 * ===============================
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  schoolId: z.string().uuid("Invalid schoolId format"),
});

/**
 * ===============================
 * REFRESH TOKEN DTO
 * ===============================
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(10, "Invalid refresh token"),
});

/**
 * ===============================
 * FORGOT PASSWORD DTO
 * ===============================
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  schoolId: z.string().uuid("Invalid schoolId format"),
});

/**
 * ===============================
 * RESET PASSWORD DTO
 * ===============================
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(10, "Invalid or expired reset token"),
  newPassword: passwordSchema,
});

/**
 * ===============================
 * CHANGE PASSWORD DTO
 * ===============================
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
});

/**
 * ===============================
 * TYPES (INFERRED)
 * ===============================
 */
export type RegisterUserDTO = z.infer<typeof registerUserSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
export type RefreshTokenDTO = z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>;