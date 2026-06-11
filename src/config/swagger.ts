import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { registry } from "./openapi";
import "../modules/auth/auth.openapi";
import "../modules/schools/schools.openapi";
import "../modules/students/students.openapi";
import "../modules/parents/parents.openapi";
// import "../modules/classes/classes.openapi";
// import "../modules/billing/billing.openapi";
// import "../modules/fees/fees.openapi";
// import "../modules/payments/payments.openapi";

/**
 * =========================================
 * SWAGGER / OPENAPI SPEC GENERATOR
 * =========================================
 * This file generates Swagger documentation
 * from Zod schemas using OpenAPI registry.
 *
 * Source of truth:
 * - Zod schemas (DTOs)
 * - OpenAPI registry
 */

export const swaggerSpec = new OpenApiGeneratorV3(
  registry.definitions
).generateDocument({
  openapi: "3.0.0",
  info: {
    title: "EduGuard API",
    version: "1.0.0",
    description: "Revenue & Academic Intelligence API",
  },
  servers: [
    {
      url: "http://localhost:3000/api/v1",
      description: "Local Development Server",
    },
  ],
});