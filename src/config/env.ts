import { z } from "zod";

/**
 * Environment Variables Validation Schema
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(5000),

  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required"),

  JWT_ACCESS_SECRET: z
    .string()
    .min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),

  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),

  JWT_ACCESS_EXPIRES_IN: z
    .string()
    .default("15m"),

  JWT_REFRESH_EXPIRES_IN: z
    .string()
    .default("7d"),

  BCRYPT_SALT_ROUNDS: z.coerce
    .number()
    .int()
    .positive()
    .default(12),

  API_PREFIX: z
    .string()
    .default("/api/v1"),

  LOG_LEVEL: z
    .enum(["error", "warn", "info", "http", "debug"])
    .default("info"),

  CORS_ORIGIN: z
    .string()
    .default("*"),

  SCHOOL_HEADER_NAME: z
    .string()
    .default("x-school-id"),

  PAYSTACK_SECRET_KEY: z.string().min(1, "PAYSTACK_SECRET_KEY is required"),

   PAYSTACK_BASE_URL: z
     .string()
    .url()
    .default("https://api.paystack.co"),

    CLOUDINARY_CLOUD_NAME: z.string().min(1),
    CLOUDINARY_API_KEY: z.string().min(1),
    CLOUDINARY_API_SECRET: z.string().min(1),
    CLOUDINARY_FOLDER: z.string().default("eduguard"),

    REDIS_URL: z.string().min(1, "REDIS_URL is required"),
    REDIS_PASSWORD: z.string().optional(),
});

/**
 * Validate environment variables
 */
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "❌ Invalid environment variables:\n",
    parsedEnv.error.flatten().fieldErrors
  );

  process.exit(1);
}

/**
 * Typed Environment Object
 */
export const env = Object.freeze({
  ...parsedEnv.data,
  isDevelopment: parsedEnv.data.NODE_ENV === "development",
  isProduction: parsedEnv.data.NODE_ENV === "production",
  isTest: parsedEnv.data.NODE_ENV === "test",
});

/**
 * Environment Type
 */
export type Env = typeof env;