/**
 * Multi-school SaaS constants
 * Critical for EduGuard revenue isolation model
 */

export const SCHOOL_STATUS = {
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  INACTIVE: "INACTIVE",
} as const;

export const SUBSCRIPTION_PLANS = {
  FREE: "FREE",
  BASIC: "BASIC",
  PREMIUM: "PREMIUM",
  ENTERPRISE: "ENTERPRISE",
} as const;

export const DEFAULT_SCHOOL_SETTINGS = {
  allowStudentSelfRegistration: false,
  enableFeeTracking: true,
  enableExamModule: true,
} as const;