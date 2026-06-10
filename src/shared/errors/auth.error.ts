import { AppError } from "./app.error";

export class AuthenticationError extends AppError {
  constructor(message = "Authentication failed") {
    super(
      message,
      401,
      "AUTHENTICATION_ERROR"
    );
  }
}

export class InvalidCredentialsError extends AppError {
  constructor() {
    super(
      "Invalid email or password",
      401,
      "INVALID_CREDENTIALS"
    );
  }
}

export class TokenExpiredError extends AppError {
  constructor() {
    super(
      "Access token has expired",
      401,
      "TOKEN_EXPIRED"
    );
  }
}

export class InvalidTokenError extends AppError {
  constructor() {
    super(
      "Invalid access token",
      401,
      "INVALID_TOKEN"
    );
  }
}