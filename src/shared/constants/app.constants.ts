/**
 * Core application-wide constants
 */

export const APP_NAME = "EduGuard";
export const APP_VERSION = "1.0.0";

export const API_PREFIX = "/api/v1";

export const DEFAULT_TIMEZONE = "Africa/Lagos";

export const DEFAULT_LANGUAGE = "en";

export const IS_PRODUCTION = process.env.NODE_ENV === "production";
export const IS_DEVELOPMENT = process.env.NODE_ENV === "development";