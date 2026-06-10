import { AppError } from "../errors";

/**
 * EduGuard Assertion Utilities
 * Used for defensive programming in services
 */

export class Assert {
  /**
   * Ensures value exists
   */
  static exists<T>(
    value: T | null | undefined,
    message = "Value is required"
  ): asserts value is T {
    if (value === null || value === undefined) {
      throw new AppError(message, 400, "ASSERTION_ERROR");
    }
  }

  /**
   * Ensures condition is true
   */
  static isTrue(condition: boolean, message = "Condition failed"): void {
    if (!condition) {
      throw new AppError(message, 400, "ASSERTION_ERROR");
    }
  }

  /**
   * Ensures school isolation safety (critical for EduGuard)
   */
  static schoolMatch(userSchoolId: string, resourceSchoolId: string): void {
    if (userSchoolId !== resourceSchoolId) {
      throw new AppError(
        "Cross-school access denied",
        403,
        "SCHOOL_ISOLATION_VIOLATION"
      );
    }
  }
}