import { registry } from "../../config/openapi";
import { z } from "zod";

import {
  createClassSchema,
  updateClassSchema,
  classParamsSchema,
  classQuerySchema,
} from "./classes.dto";

/**
 * ============================================================
 * CLASSES OPENAPI (SWAGGER DOCUMENTATION)
 * ============================================================
 * This file registers all Classes module endpoints
 * into the OpenAPI registry.
 *
 * Base Path: /api/v1/classes
 * ============================================================
 */

/**
 * ============================================================
 * SCHEMAS REGISTRATION
 * ============================================================
 */

registry.register("CreateClass", createClassSchema);
registry.register("UpdateClass", updateClassSchema);
registry.register("ClassParams", classParamsSchema);
registry.register("ClassQuery", classQuerySchema);

/**
 * ============================================================
 * CLASS ENTITY SCHEMA (SWAGGER MODEL)
 * ============================================================
 */
const ClassSchema = z.object({
  id: z.string().uuid(),
  schoolId: z.string().uuid(),

  name: z.string(),
  description: z.string().nullable().optional(),

  gradeLevel: z.string().nullable().optional(),
  capacity: z.number().nullable().optional(),

  isActive: z.boolean(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/**
 * ============================================================
 * PAGINATION META SCHEMA
 * ============================================================
 */
const PaginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

/**
 * ============================================================
 * CREATE CLASS
 * ============================================================
 */
registry.registerPath({
  method: "post",
  path: "/classes",
  tags: ["Classes"],
  summary: "Create a new class",
  request: {
    body: {
      content: {
        "application/json": {
          schema: createClassSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Class created successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: ClassSchema,
          }),
        },
      },
    },
  },
});

/**
 * ============================================================
 * GET ALL CLASSES
 * ============================================================
 */
registry.registerPath({
  method: "get",
  path: "/classes",
  tags: ["Classes"],
  summary: "Get all classes",
  request: {
    query: classQuerySchema,
  },
  responses: {
    200: {
      description: "List of classes",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.array(ClassSchema),
            pagination: PaginationSchema,
          }),
        },
      },
    },
  },
});

/**
 * ============================================================
 * GET CLASS BY ID
 * ============================================================
 */
registry.registerPath({
  method: "get",
  path: "/classes/{classId}",
  tags: ["Classes"],
  summary: "Get class by ID",
  request: {
    params: classParamsSchema,
  },
  responses: {
    200: {
      description: "Class details",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: ClassSchema,
          }),
        },
      },
    },
    404: {
      description: "Class not found",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            code: z.string(),
          }),
        },
      },
    },
  },
});

/**
 * ============================================================
 * UPDATE CLASS
 * ============================================================
 */
registry.registerPath({
  method: "patch",
  path: "/classes/{classId}",
  tags: ["Classes"],
  summary: "Update class details",
  request: {
    params: classParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: updateClassSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Class updated successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: ClassSchema,
          }),
        },
      },
    },
  },
});

/**
 * ============================================================
 * DELETE CLASS
 * ============================================================
 */
registry.registerPath({
  method: "delete",
  path: "/classes/{classId}",
  tags: ["Classes"],
  summary: "Delete a class",
  request: {
    params: classParamsSchema,
  },
  responses: {
    200: {
      description: "Class deleted successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
  },
});