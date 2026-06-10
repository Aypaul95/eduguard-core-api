import { registry } from "../../config/openapi";
import { z } from "zod";

/**
 * ============================================================
 * STUDENT OPENAPI (ZOD-BASED REGISTRY)
 * ============================================================
 * Centralized Swagger registration using Zod schemas
 * ============================================================
 */

/**
 * ============================================================
 * COMMON SCHEMAS
 * ============================================================
 */

const GenderEnum = z.enum(["MALE", "FEMALE", "OTHER"]);

const StudentBaseSchema = z.object({
  schoolId: z.string().uuid(),
  admissionNumber: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  middleName: z.string().optional(),

  gender: GenderEnum,
  dateOfBirth: z.string().datetime(),

  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),

  classId: z.string().uuid().optional(),

  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianEmail: z.string().email().optional(),

  isActive: z.boolean().optional(),
});

/**
 * ============================================================
 * CREATE STUDENT
 * ============================================================
 */
registry.registerPath({
  method: "post",
  path: "/students",
  tags: ["Students"],
  summary: "Create a new student",
  description: "Enroll a student into a school using schoolId",

  request: {
    body: {
      content: {
        "application/json": {
          schema: StudentBaseSchema,
        },
      },
    },
  },

  responses: {
    201: {
      description: "Student created successfully",
    },
    400: {
      description: "Validation error",
    },
    409: {
      description: "Student already exists",
    },
  },
});

/**
 * ============================================================
 * GET ALL STUDENTS
 * ============================================================
 */
registry.registerPath({
  method: "get",
  path: "/students",
  tags: ["Students"],
  summary: "Get all students",

  request: {
    query: z.object({
      page: z.number().optional(),
      limit: z.number().optional(),
      search: z.string().optional(),
      classId: z.string().uuid().optional(),
      gender: GenderEnum.optional(),
      isActive: z.boolean().optional(),
    }),
  },

  responses: {
    200: {
      description: "Students retrieved successfully",
    },
  },
});

/**
 * ============================================================
 * BULK IMPORT STUDENTS
 * ============================================================
 */
registry.registerPath({
  method: "post",
  path: "/students/bulk-import",
  tags: ["Students"],
  summary: "Bulk import students",

  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            schoolId: z.string().uuid(),
            students: z.array(StudentBaseSchema),
          }),
        },
      },
    },
  },

  responses: {
    201: {
      description: "Bulk import completed",
    },
    400: {
      description: "Validation error",
    },
  },
});

/**
 * ============================================================
 * SINGLE STUDENT OPERATIONS
 * ============================================================
 */
registry.registerPath({
  method: "get",
  path: "/students/{studentId}",
  tags: ["Students"],
  summary: "Get student by ID",

  request: {
    params: z.object({
      studentId: z.string().uuid(),
    }),
  },

  responses: {
    200: { description: "Student retrieved successfully" },
    404: { description: "Student not found" },
  },
});

registry.registerPath({
  method: "patch",
  path: "/students/{studentId}",
  tags: ["Students"],
  summary: "Update student",

  request: {
    params: z.object({
      studentId: z.string().uuid(),
    }),

    body: {
      content: {
        "application/json": {
          schema: StudentBaseSchema.partial(),
        },
      },
    },
  },

  responses: {
    200: { description: "Student updated successfully" },
    404: { description: "Student not found" },
  },
});

registry.registerPath({
  method: "delete",
  path: "/students/{studentId}",
  tags: ["Students"],
  summary: "Deactivate student",
  description: "Soft delete (sets isActive = false)",

  request: {
    params: z.object({
      studentId: z.string().uuid(),
    }),
  },

  responses: {
    200: { description: "Student deactivated successfully" },
    404: { description: "Student not found" },
  },
});