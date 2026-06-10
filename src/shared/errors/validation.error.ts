import { ZodIssue } from "zod";
import { AppError } from "./app.error";

export class ValidationError extends AppError {
  public readonly issues: ZodIssue[];

  constructor(
    message = "Validation failed",
    issues: ZodIssue[] = []
  ) {
    super(
      message,
      400,
      "VALIDATION_ERROR"
    );

    this.issues = issues;
  }
}