import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthRepository } from "./auth.repository";
import { User } from "@prisma/client";
import { logger } from "../../shared/utils/logger";

/**
 * =========================================
 * AUTH SERVICE (BUSINESS LOGIC LAYER)
 * =========================================
 * Handles authentication logic:
 * - User registration
 * - Login
 * - Password hashing
 * - JWT generation
 * - School-based isolation enforcement
 */

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  schoolId: string;
}

export interface LoginInput {
  email: string;
  password: string;
  schoolId: string;
}

export interface AuthResponse {
  user: Omit<User, "passwordHash">;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  /**
   * =====================================
   * REGISTER USER
   * =====================================
   */
  async register(data: RegisterInput): Promise<AuthResponse> {
    try {
      const existingUser = await this.authRepository.findUserByEmail(
        data.email,
        data.schoolId
      );

      if (existingUser) {
        throw new Error("User already exists in this school");
      }

      const hashedPassword = await bcrypt.hash(data.password, 12);

      const user = await this.authRepository.createUser({
        email: data.email,
        passwordHash: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        schoolId: data.schoolId,
      });

      const tokens = this.generateTokens(user.id, user.schoolId!);

      return {
        user: this.sanitizeUser(user),
        ...tokens,
      };
    } catch (error: any) {
      logger.error("Register error", {
        message: error.message,
        stack: error.stack,
      });

      throw new Error(error.message || "Registration failed");
    }
  }

  /**
   * =====================================
   * LOGIN USER
   * =====================================
   */
  async login(data: LoginInput): Promise<AuthResponse> {
    try {
      const user = await this.authRepository.findUserByEmail(
        data.email,
        data.schoolId
      );

      if (!user) {
        throw new Error("Invalid credentials");
      }

      if (!user.isActive) {
        throw new Error("Account is deactivated");
      }

      const isPasswordValid = await bcrypt.compare(
        data.password,
        user.passwordHash
      );

      if (!isPasswordValid) {
        throw new Error("Invalid credentials");
      }

      const tokens = this.generateTokens(user.id, user.schoolId!);

      return {
        user: this.sanitizeUser(user),
        ...tokens,
      };
    } catch (error: any) {
      logger.error("Login error", {
        message: error.message,
        stack: error.stack,
      });

      throw new Error(error.message || "Login failed");
    }
  }

  /**
   * =====================================
   * GENERATE JWT TOKENS
   * =====================================
   */
  private generateTokens(userId: string, schoolId: string) {
    const accessToken = jwt.sign(
      { userId, schoolId },
      process.env.JWT_ACCESS_SECRET as string,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userId, schoolId },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: "7d" }
    );

    return { accessToken, refreshToken };
  }

  /**
   * =====================================
   * REMOVE SENSITIVE DATA
   * =====================================
   */
  private sanitizeUser(user: User) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}