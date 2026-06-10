import { AppError } from "./app.error";

export class DatabaseError extends AppError {
  constructor(
    message = "Database operation failed"
  ) {
    super(
      message,
      500,
      "DATABASE_ERROR"
    );
  }
}

export class RecordAlreadyExistsError extends AppError {
  constructor(resource = "Record") {
    super(
      `${resource} already exists`,
      409,
      "RECORD_ALREADY_EXISTS"
    );
  }
}