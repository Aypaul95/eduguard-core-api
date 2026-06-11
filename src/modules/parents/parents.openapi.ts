import { registry } from "../../config/openapi";
import { z } from "zod";

import {
  createParentSchema,
  updateParentSchema,
  parentParamsSchema,
  schoolParentParamsSchema,
  parentQuerySchema,
} from "./parents.dto";

/**
 * ============================================================
 * PARENTS OPENAPI (SWAGGER DOCUMENTATION)
 * ============================================================
 * This file registers all Parents module endpoints
 * into the OpenAPI registry.
 *
 * Base Path: /api/v1/parents
 * ============================================================
 */

/**
 * ============================================================
 * SCHEMAS REGISTRATION
 * ============================================================
 */

registry.register("CreateParent", createParentSchema);
registry.register("UpdateParent", updateParentSchema);
registry.register("ParentParams", parentParamsSchema);
registry.register("SchoolParentParams", schoolParentParamsSchema);
registry.register("ParentQuery", parentQuerySchema);

/**
 * ============================================================
 * PARENT ENTITY SCHEMA (SWAGGER MODEL)
 * ============================================================
 */
const ParentSchema = z.object({
  id: z.string().uuid(),
  schoolId: z.string().uuid(),

  firstName: z.string(),
  lastName: z.string(),

  email: z.string().email().nullable().optional(),
  phone: z.string(),
  address: z.string().nullable().optional(),

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
 * CREATE PARENT ENDPOINT
 * ============================================================
 */
registry.registerPath({
  method: "post",
  path: "/parents",
  tags: ["Parents"],
  summary: "Create a new parent",
  request: {
    body: {
      content: {
        "application/json": {
          schema: createParentSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Parent created successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: ParentSchema,
          }),
        },
      },
    },
  },
});

/**
 * ============================================================
 * GET ALL PARENTS
 * ============================================================
 */
registry.registerPath({
  method: "get",
  path: "/parents",
  tags: ["Parents"],
  summary: "Get all parents",
  request: {
    query: parentQuerySchema,
  },
  responses: {
    200: {
      description: "List of parents",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.array(ParentSchema),
            pagination: PaginationSchema,
          }),
        },
      },
    },
  },
});

/**
 * ============================================================
 * GET PARENT BY ID
 * ============================================================
 */
registry.registerPath({
  method: "get",
  path: "/parents/{parentId}",
  tags: ["Parents"],
  summary: "Get parent by ID",
  request: {
    params: parentParamsSchema,
  },
  responses: {
    200: {
      description: "Parent details",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: ParentSchema.extend({
              children: z.array(
                z.object({
                  id: z.string().uuid(),
                  parentId: z.string().uuid(),
                  studentId: z.string().uuid(),
                  relationship: z.string(),
                }),
              ),
            }),
          }),
        },
      },
    },
    404: {
      description: "Parent not found",
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
 * UPDATE PARENT
 * ============================================================
 */
registry.registerPath({
  method: "patch",
  path: "/parents/{parentId}",
  tags: ["Parents"],
  summary: "Update parent details",
  request: {
    params: parentParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: updateParentSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Parent updated successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: ParentSchema,
          }),
        },
      },
    },
  },
});

/**
 * ============================================================
 * DELETE PARENT
 * ============================================================
 */
registry.registerPath({
  method: "delete",
  path: "/parents/{parentId}",
  tags: ["Parents"],
  summary: "Delete a parent",
  request: {
    params: parentParamsSchema,
  },
  responses: {
    200: {
      description: "Parent deleted successfully",
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

/**
 * ============================================================
 * GET PARENTS BY SCHOOL
 * ============================================================
 */
registry.registerPath({
  method: "get",
  path: "/parents/school/{schoolId}",
  tags: ["Parents"],
  summary: "Get all parents for a school",
  request: {
    params: schoolParentParamsSchema.pick({
      schoolId: true,
    }),
  },
  responses: {
    200: {
      description: "School parents list",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            count: z.number(),
            data: z.array(ParentSchema),
          }),
        },
      },
    },
  },
});

/**
 * ============================================================
 * LINK STUDENT TO PARENT
 * ============================================================
 */
registry.registerPath({
  method: "post",
  path: "/parents/{parentId}/students",
  tags: ["Parents"],
  summary: "Link a student to a parent",
  request: {
    params: parentParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: z.object({
            studentId: z.string().uuid(),
            relationship: z.enum([
              "father",
              "mother",
              "guardian",
              "uncle",
              "aunt",
              "sibling",
              "other",
            ]),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Student linked successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({
              id: z.string().uuid(),
              parentId: z.string().uuid(),
              studentId: z.string().uuid(),
              relationship: z.string(),
            }),
          }),
        },
      },
    },
  },
});

/**
 * ============================================================
 * GET PARENT CHILDREN
 * ============================================================
 */
registry.registerPath({
  method: "get",
  path: "/parents/{parentId}/students",
  tags: ["Parents"],
  summary: "Get all students linked to a parent",
  request: {
    params: parentParamsSchema,
  },
  responses: {
    200: {
      description: "Parent children list",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.array(
              z.object({
                id: z.string().uuid(),
                student: z.object({
                  id: z.string().uuid(),
                  firstName: z.string(),
                  lastName: z.string(),
                  admissionNo: z.string(),
                }),
              }),
            ),
          }),
        },
      },
    },
  },
});

/**
 * ============================================================
 * UNLINK STUDENT FROM PARENT
 * ============================================================
 */
registry.registerPath({
  method: "delete",
  path: "/parents/{parentId}/students/{studentId}",
  tags: ["Parents"],
  summary: "Unlink a student from a parent",
  request: {
    params: z.object({
      parentId: z.string().uuid(),
      studentId: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: "Student unlinked successfully",
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

/**
 * ============================================================
 * GET STUDENT PARENTS
 * ============================================================
 */
registry.registerPath({
  method: "get",
  path: "/parents/students/{studentId}/parents",
  tags: ["Parents"],
  summary: "Get all parents of a student",
  request: {
    params: z.object({
      studentId: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: "Student parents list",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.array(ParentSchema),
          }),
        },
      },
    },
  },
});