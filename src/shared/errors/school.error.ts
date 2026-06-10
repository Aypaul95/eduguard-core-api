import { AppError } from "./app.error";

export class SchoolNotFoundError extends AppError {
  constructor() {
    super(
      "School not found",
      404,
      "SCHOOL_NOT_FOUND"
    );
  }
}

export class SchoolInactiveError extends AppError {
  constructor() {
    super(
      "School account is inactive",
      403,
      "SCHOOL_INACTIVE"
    );
  }
}

export class SchoolAccessDeniedError extends AppError {
  constructor() {
    super(
      "Access denied to school resources",
      403,
      "SCHOOL_ACCESS_DENIED"
    );
  }
}