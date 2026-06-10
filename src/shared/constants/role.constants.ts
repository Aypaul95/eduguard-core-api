/**
 * RBAC (Role-Based Access Control)
 * Multi-school safe roles for EduGuard system
 */

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  SCHOOL_ADMIN = "SCHOOL_ADMIN",
  ACCOUNTANT = "ACCOUNTANT",
  TEACHER = "TEACHER",
  STUDENT = "STUDENT",
  PARENT = "PARENT",
}

/**
 * Role hierarchy (higher index = more privilege)
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 100,
  [UserRole.SCHOOL_ADMIN]: 80,
  [UserRole.ACCOUNTANT]: 60,
  [UserRole.TEACHER]: 50,
  [UserRole.PARENT]: 20,
  [UserRole.STUDENT]: 10,
};