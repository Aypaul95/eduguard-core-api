//import { registry } from "../../shared/docs/registry";
import { registry } from "../../config/openapi";
import { z } from "zod";

/**
 * =========================================================
 * SCHOOLS OPENAPI REGISTRATION
 * =========================================================
 * All school-related endpoints for EduGuard SaaS
 */

/**
 * =========================================================
 * CREATE SCHOOL
 * POST /api/v1/schools
 * =========================================================
 */
registry.registerPath({
  method: "post",
  path: "/schools",
  tags: ["Schools"],
  summary: "Create school",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            name: z.string().min(2),
            email: z.string().email().optional(),
            phone: z.string().optional(),
            address: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "School created successfully",
    },
  },
});

/**
 * =========================================================
 * LIST SCHOOLS
 * GET /api/v1/schools
 * =========================================================
 */
registry.registerPath({
  method: "get",
  path: "/schools",
  tags: ["Schools"],
  summary: "List all schools",
  responses: {
    200: {
      description: "List of schools retrieved successfully",
    },
  },
});

/**
 * =========================================================
 * GET SINGLE SCHOOL
 * GET /api/v1/schools/:schoolId
 * =========================================================
 */
registry.registerPath({
  method: "get",
  path: "/schools/{schoolId}",
  tags: ["Schools"],
  summary: "Get single school",
  request: {
    params: z.object({
      schoolId: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: "School retrieved successfully",
    },
    404: {
      description: "School not found",
    },
  },
});

/**
 * =========================================================
 * UPDATE SCHOOL
 * PATCH /api/v1/schools/:schoolId
 * =========================================================
 */
registry.registerPath({
  method: "patch",
  path: "/schools/{schoolId}",
  tags: ["Schools"],
  summary: "Update school",
  request: {
    params: z.object({
      schoolId: z.string().uuid(),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            name: z.string().optional(),
            email: z.string().email().optional(),
            phone: z.string().optional(),
            address: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "School updated successfully",
    },
  },
});

/**
 * =========================================================
 * DELETE SCHOOL
 * DELETE /api/v1/schools/:schoolId
 * =========================================================
 */
registry.registerPath({
  method: "delete",
  path: "/schools/{schoolId}",
  tags: ["Schools"],
  summary: "Delete school",
  request: {
    params: z.object({
      schoolId: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: "School deleted successfully",
    },
    404: {
      description: "School not found",
    },
  },
});