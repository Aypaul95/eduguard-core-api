/**
 * EduGuard Date Utilities
 * Handles time-safe operations for multi-school academic systems
 */

export class DateUtil {
  /**
   * Returns current UTC timestamp
   */
  static now(): Date {
    return new Date();
  }

  /**
   * Adds days to a date
   */
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setUTCDate(result.getUTCDate() + days);
    return result;
  }

  /**
   * Calculates difference in days between two dates
   */
  static diffInDays(a: Date, b: Date): number {
    const ms = Math.abs(a.getTime() - b.getTime());
    return Math.floor(ms / (1000 * 60 * 60 * 24));
  }

  /**
   * Formats date to ISO string (safe for APIs)
   */
  static toISO(date: Date): string {
    return date.toISOString();
  }

  /**
   * Start of day (UTC-safe)
   */
  static startOfDay(date: Date): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  }
}