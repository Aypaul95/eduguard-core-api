import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

// IMPORTANT: extend Zod BEFORE using .openapi()
extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();