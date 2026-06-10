import { z } from "zod";
import { LIMITS } from "../constants";

/**
 * Pagination validation
 */

export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => Number(val || 1))
    .refine((val) => val >= LIMITS.PAGINATION_MIN),

  limit: z
    .string()
    .optional()
    .transform((val) => Number(val || LIMITS.DEFAULT_PAGE_SIZE))
    .refine((val) => val <= LIMITS.PAGINATION_MAX),

  search: z.string().optional(),
});

export type PaginationDTO = z.infer<typeof paginationSchema>;