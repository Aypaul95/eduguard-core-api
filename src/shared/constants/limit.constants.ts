/**
 * System limits and constraints
 * Prevent abuse + ensure performance stability
 */

export const LIMITS = {
  PAGINATION_MIN: 1,
  PAGINATION_MAX: 100,

  DEFAULT_PAGE_SIZE: 20,

  MAX_LOGIN_ATTEMPTS: 5,

  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,

  MAX_FILE_SIZE_MB: 10,

  MAX_STUDENTS_PER_SCHOOL: 10000,

  MAX_TEACHERS_PER_SCHOOL: 1000,

  MAX_FEES_RECORDS_PER_QUERY: 5000,
} as const;