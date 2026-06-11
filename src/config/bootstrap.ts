import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

// MUST RUN FIRST BEFORE ANY OPENAPI FILES LOAD
extendZodWithOpenApi(z);