/**
 * EduGuard Formatting Utilities
 * Standardizes API output formatting
 */

export class FormatUtil {
  /**
   * Currency formatter (NGN default for EduGuard)
   */
  static currency(amount: number, currency = "NGN"): string {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
    }).format(amount);
  }

  /**
   * Format large numbers (e.g. 10,000 -> 10K)
   */
  static compactNumber(value: number): string {
    return new Intl.NumberFormat("en", {
      notation: "compact",
    }).format(value);
  }

  /**
   * Capitalize first letter
   */
  static capitalize(text: string): string {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  /**
   * Convert snake_case or kebab-case to Title Case
   */
  static toTitleCase(text: string): string {
    return text
      .replace(/[_-]/g, " ")
      .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
  }
}