/**
 * EduGuard Math Utilities
 * Used for fees, analytics, grading, revenue calculations
 */

export class MathUtil {
  /**
   * Safe addition (prevents NaN issues)
   */
  static add(a: number, b: number): number {
    return (a || 0) + (b || 0);
  }

  /**
   * Percentage calculation
   */
  static percentage(value: number, total: number): number {
    if (total === 0) return 0;
    return (value / total) * 100;
  }

  /**
   * Round to fixed decimals
   */
  static round(value: number, decimals = 2): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  /**
   * Clamp value between min and max
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * GPA-style average calculation
   */
  static average(values: number[]): number {
    if (!values.length) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  }
}