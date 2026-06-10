/**
 * EduGuard String Utilities
 */

export class StringUtil {
  /**
   * Generates safe slug for URLs
   */
  static slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
  }

  /**
   * Generates random ID (useful for request IDs, refs)
   */
  static randomId(length = 12): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }

  /**
   * Checks if string is empty or whitespace
   */
  static isEmpty(value: string | null | undefined): boolean {
    return !value || value.trim().length === 0;
  }
}