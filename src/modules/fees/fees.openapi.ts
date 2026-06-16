//src/modules/fees/fees.openapi.ts
import { registry } from "../../config/openapi";
import { z } from "zod";

import {
  CreateFeeCategorySchema,
  UpdateFeeCategorySchema,
  FeeCategoryResponseSchema,

  CreateFeeStructureSchema,
  UpdateFeeStructureSchema,
  FeeStructureResponseSchema,

  AssignFeeToStudentSchema,
  BulkAssignFeeToStudentsSchema,
  StudentFeeAssignmentResponseSchema,

  CreateDiscountSchema,
  DiscountResponseSchema,

  CreateScholarshipSchema,
  ScholarshipResponseSchema,
} from "./fees.dto";

/**
 * ============================================================
 * FEE CATEGORY
 * ============================================================
 */

registry.registerPath({
  method: "post",
  path: "/fees/category",
  tags: ["Fees"],
  summary: "Create fee category",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateFeeCategorySchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Fee category created",
      content: {
        "application/json": {
          schema: FeeCategoryResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/fees/category",
  tags: ["Fees"],
  summary: "Get all fee categories",
  responses: {
    200: {
      description: "Fee categories list",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.array(FeeCategoryResponseSchema),
          }),
        },
      },
    },
  },
});

/**
 * ============================================================
 * UPDATE FEE CATEGORY
 * ============================================================
 */

registry.registerPath({
  method: "patch",
  path: "/fees/category/{id}",
  tags: ["Fees"],
  summary: "Update fee category",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateFeeCategorySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Fee category updated",
      content: {
        "application/json": {
          schema: FeeCategoryResponseSchema,
        },
      },
    },
  },
});

/**
 * ============================================================
 * DELETE FEE CATEGORY
 * ============================================================
 */

registry.registerPath({
  method: "delete",
  path: "/fees/category/{id}",
  tags: ["Fees"],
  summary: "Delete fee category",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: "Fee category deleted",
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
 * FEE STRUCTURE
 * ============================================================
 */

registry.registerPath({
  method: "post",
  path: "/fees/structure",
  tags: ["Fees"],
  summary: "Create fee structure",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateFeeStructureSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Fee structure created",
      content: {
        "application/json": {
          schema: FeeStructureResponseSchema,
        },
      },
    },
  },
});

/**
 * ============================================================
 * GET FEE STRUCTURES
 * ============================================================
 */

registry.registerPath({
  method: "get",
  path: "/fees/structure",
  tags: ["Fees"],
  summary: "Get all fee structures",
  responses: {
    200: {
      description: "Fee structures list",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.array(FeeStructureResponseSchema),
          }),
        },
      },
    },
  },
});

/**
 * ============================================================
 * UPDATE FEE STRUCTURE
 * ============================================================
 */

registry.registerPath({
  method: "patch",
  path: "/fees/structure/{id}",
  tags: ["Fees"],
  summary: "Update fee structure",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateFeeStructureSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Fee structure updated",
      content: {
        "application/json": {
          schema: FeeStructureResponseSchema,
        },
      },
    },
  },
});
/**
 * ============================================================
 * STUDENT ASSIGNMENT
 * ============================================================
 */

registry.registerPath({
  method: "post",
  path: "/fees/assign",
  tags: ["Fees"],
  summary: "Assign fee to student",
  request: {
    body: {
      content: {
        "application/json": {
          schema: AssignFeeToStudentSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Fee assigned successfully",
      content: {
        "application/json": {
          schema: StudentFeeAssignmentResponseSchema,
        },
      },
    },
  },
});

/**
 * ============================================================
 * UPDATE STUDENT FEE STATUS
 * ============================================================
 */

registry.registerPath({
  method: "patch",
  path: "/fees/assign/{id}",
  tags: ["Fees"],
  summary: "Update student fee assignment status",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: {
      content: {
        "application/json": {
          schema: AssignFeeToStudentSchema, // or a dedicated UpdateStatusSchema if you have one
        },
      },
    },
  },
  responses: {
    200: {
      description: "Student fee status updated",
      content: {
        "application/json": {
          schema: StudentFeeAssignmentResponseSchema,
        },
      },
    },
  },
});
/**
 * ============================================================
 * BULK ASSIGNMENT
 * ============================================================
 */

registry.registerPath({
  method: "post",
  path: "/fees/assign/bulk",
  tags: ["Fees"],
  summary: "Bulk assign fees to students",
  request: {
    body: {
      content: {
        "application/json": {
          schema: BulkAssignFeeToStudentsSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Fees assigned in bulk",
      content: {
        "application/json": {
          schema: StudentFeeAssignmentResponseSchema,
        },
      },
    },
  },
});

/**
 * ============================================================
 * DISCOUNT
 * ============================================================
 */

registry.registerPath({
  method: "post",
  path: "/fees/discount",
  tags: ["Fees"],
  summary: "Create discount",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateDiscountSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Discount created",
      content: {
        "application/json": {
          schema: DiscountResponseSchema,
        },
      },
    },
  },
});

/**
 * ============================================================
 * SCHOLARSHIP
 * ============================================================
 */

registry.registerPath({
  method: "post",
  path: "/fees/scholarship",
  tags: ["Fees"],
  summary: "Create scholarship",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateScholarshipSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Scholarship created",
      content: {
        "application/json": {
          schema: ScholarshipResponseSchema,
        },
      },
    },
  },
});