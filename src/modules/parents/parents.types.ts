import { Parent, Student, ParentStudent } from "@prisma/client";

/**
 * ============================================================
 * CORE DOMAIN TYPES (PARENTS MODULE)
 * ============================================================
 */

/**
 * ============================================================
 * CREATE PARENT INPUT
 * ============================================================
 */
export interface CreateParentInput {
  schoolId: string;

  firstName: string;
  lastName: string;

  email?: string | null;
  phone: string;
  address?: string | null;
}

/**
 * ============================================================
 * UPDATE PARENT INPUT
 * ============================================================
 */
export interface UpdateParentInput {
  firstName?: string;
  lastName?: string;
  email?: string | null;
  phone?: string;
  address?: string | null;
}

/**
 * ============================================================
 * LINK STUDENT TO PARENT INPUT
 * ============================================================
 */
export interface LinkStudentInput {
  parentId: string;
  studentId: string;
  relationship: ParentRelationship;
}

/**
 * ============================================================
 * RELATIONSHIP TYPE
 * ============================================================
 * Strongly typed relationship for data integrity
 */
export type ParentRelationship =
  | "father"
  | "mother"
  | "guardian"
  | "uncle"
  | "aunt"
  | "sibling"
  | "other";

/**
 * ============================================================
 * PARENT WITH RELATIONS (PRISMA EXTENDED)
 * ============================================================
 */
export type ParentWithRelations = Parent & {
  children?: ParentStudentWithStudent[];
};

/**
 * ============================================================
 * PARENT-STUDENT JOIN TYPE
 * ============================================================
 */
export type ParentStudentWithStudent = ParentStudent & {
  student: Student;
};

/**
 * ============================================================
 * STUDENT WITH PARENTS
 * ============================================================
 */
export type StudentWithParents = Student & {
  parents?: ParentStudentWithParent[];
};

/**
 * ============================================================
 * STUDENT-PARENT JOIN TYPE
 * ============================================================
 */
export type ParentStudentWithParent = ParentStudent & {
  parent: Parent;
};

/**
 * ============================================================
 * PAGINATION META
 * ============================================================
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * ============================================================
 * PAGINATED RESPONSE (PARENTS LIST)
 * ============================================================
 */
export interface PaginatedParentsResponse {
  data: ParentWithRelations[];
  pagination: PaginationMeta;
}

/**
 * ============================================================
 * SERVICE RESPONSE TYPES
 * ============================================================
 */
export interface CreateParentResult {
  success: true;
  data: Parent;
}

export interface ParentDetailsResult {
  success: true;
  data: ParentWithRelations;
}

export interface ParentListResult {
  success: true;
  data: Parent[];
  pagination: PaginationMeta;
}

/**
 * ============================================================
 * LINK RESPONSE TYPE
 * ============================================================
 */
export interface LinkStudentResult {
  success: true;
  data: ParentStudentWithStudent;
}

/**
 * ============================================================
 * ERROR CODES (PARENTS MODULE)
 * ============================================================
 */
export enum ParentErrorCode {
  PARENT_NOT_FOUND = "PARENT_NOT_FOUND",
  SCHOOL_NOT_FOUND = "SCHOOL_NOT_FOUND",
  PARENT_ALREADY_EXISTS = "PARENT_ALREADY_EXISTS",
  STUDENT_NOT_FOUND = "STUDENT_NOT_FOUND",
  RELATIONSHIP_NOT_FOUND = "RELATIONSHIP_NOT_FOUND",
  SCHOOL_MISMATCH = "SCHOOL_MISMATCH",
}

/**
 * ============================================================
 * QUERY FILTERS
 * ============================================================
 */
export interface ParentQueryFilters {
  schoolId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * ============================================================
 * MODULE RESULT WRAPPER (OPTIONAL STANDARDIZATION)
 * ============================================================
 */
export interface BaseServiceResponse<T> {
  success: true;
  message?: string;
  data: T;
}