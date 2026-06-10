import { registerUserSchema } from "./auth.dto";
import { loginSchema } from "./auth.dto";
import { registry } from "../../config/openapi";
/**
 * =========================================
 * REGISTER USER ENDPOINT (AUTH)
 * =========================================
 * Creates a new user account in a specific school.
 * Supports multi-school SaaS isolation via schoolId.
 * Returns JWT tokens on success.
 */
// REGISTER USER
registry.registerPath({
  method: "post",
  path: "/auth/register",
  tags: ["Auth"],
  summary: "Register a new user",
  request: {
    body: {
      content: {
        "application/json": {
          schema: registerUserSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "User registered successfully",
    },
  },
});

// LOGIN USER
registry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["Auth"],
  summary: "Login user",
  request: {
    body: {
      content: {
        "application/json": {
          schema: loginSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "User logged in successfully",
    },
    401: {
      description: "Invalid credentials",
    },
  },
});