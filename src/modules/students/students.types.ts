import { Student } from "@prisma/client";

/**
 * ============================================================
 * STUDENTS TYPES
 * ============================================================
 * Pure TypeScript interfaces for Student domain.
 * Used across service, controller, repository, and OpenAPI.
 * ============================================================
 */

/**
 * ============================================================
 * CORE STUDENT ENTITY (DATABASE MODEL)
 * Mirrors Prisma Student model but safe for app usage.
 * ============================================================
 */
export type StudentEntity = Student;

/**
 * ============================================================
 * STUDENT STATUS TYPE
 * ============================================================
 */
export type StudentStatus = "ACTIVE" | "INACTIVE";

/**
 * ============================================================
 * GENDER TYPE (STRICT)
 * ============================================================
 */
export type StudentGender = "MALE" | "FEMALE" | "OTHER";

/**
 * ============================================================
 * STUDENT FULL NAME STRUCTURE (UTILITY TYPE)
 * ============================================================
 */
export interface StudentFullName {
  firstName: string;
  lastName: string;
  middleName?: string;
}

/**
 * ============================================================
 * STUDENT RESPONSE DTO (API OUTPUT)
 * Clean version returned to frontend / Swagger
 * ============================================================
 */
export interface StudentResponse {
  id: string;
  schoolId: string;
  admissionNo: string;

  firstName: string;
  lastName: string;
  middleName?: string;

  gender: StudentGender;
  dateOfBirth?: string;

  email?: string;
  phoneNumber?: string;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

/**
 * ============================================================
 * STUDENT SUMMARY (LIST VIEW)
 * Lightweight version for GET /students
 * ============================================================
 */
export interface StudentSummary {
  id: string;
  admissionNo: string;
  fullName: string;
  gender: StudentGender;
  isActive: boolean;
}

/**
 * ============================================================
 * PAGINATED STUDENT RESULT
 * ============================================================
 */
export interface PaginatedStudents {
  data: StudentResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * ============================================================
 * BULK IMPORT RESULT TYPE
 * ============================================================
 */
export interface BulkImportResult {
  created: number;
  failed: number;
  errors: Array<{
    admissionNo: string;
    error: string;
  }>;
}

/**
 * ============================================================
 * STUDENT QUERY FILTERS (SERVICE LAYER SAFE TYPE)
 * ============================================================
 */
export interface StudentFilters {
  schoolId: string;
  page: number;
  limit: number;

  search?: string;
  classId?: string;
  gender?: StudentGender;
  isActive?: boolean;
}

/**
 * ============================================================
 * CREATE STUDENT PAYLOAD (SERVICE INPUT)
 * ============================================================
 */
export interface CreateStudentPayload {
  schoolId: string;
  admissionNo: string;

  firstName: string;
  lastName: string;
  middleName?: string;

  gender: StudentGender;
  dateOfBirth: Date;

  email?: string;
  phoneNumber?: string;

  isActive?: boolean;
}

/**
 * ============================================================
 * UPDATE STUDENT PAYLOAD
 * ============================================================
 */
export interface UpdateStudentPayload {
  admissionNo?: string;

  firstName?: string;
  lastName?: string;
  middleName?: string;

  gender?: StudentGender;
  dateOfBirth?: Date;

  email?: string;
  phoneNumber?: string;

  isActive?: boolean;
}

/**
 * ============================================================
 * STUDENT CONTEXT (FOR AUTH + SCOPING)
 * ============================================================
 */
export interface StudentContext {
  schoolId: string;
  studentId: string;
}