import { z } from "zod";

/**
 * Shared reusable validation rules
 */

export const idSchema = z.string().uuid("Invalid UUID format");

export const emailSchema = z.string().email("Invalid email format");

export const phoneSchema = z
  .string()
  .min(10, "Phone number too short")
  .max(15, "Phone number too long");

export const nameSchema = z
  .string()
  .min(2, "Name too short")
  .max(100, "Name too long");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password too long");