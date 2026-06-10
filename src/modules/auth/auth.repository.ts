// src/modules/auth/auth.repository.ts

import { PrismaClient, User } from "@prisma/client";
import { logger } from "../../shared/utils/logger";

/**
 * =========================================
 * AUTH REPOSITORY (DATA ACCESS LAYER)
 * =========================================
 * Handles all database operations for authentication.
 * Enforces school-based isolation (SaaS multi-school support).
 */

export interface CreateUserInput {
  email: string;
  passwordHash: string; // ✅ must already be hashed from service layer
  firstName: string;
  lastName: string;
  schoolId: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
}

export class AuthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Create a new user
   */
  async createUser(data: CreateUserInput): Promise<User> {
    try {
      return await this.prisma.user.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash: data.passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          schoolId: data.schoolId,
          isActive: true,
        },
      });
    } catch (error: any) {
      logger.error("Error creating user", {
        message: error.message,
        stack: error.stack,
      });

      throw new Error("Failed to create user");
    }
  }

  /**
   * Find user by email within a school
   */
  async findUserByEmail(email: string, schoolId: string): Promise<User | null> {
    try {
      return await this.prisma.user.findFirst({
        where: {
          email: email.toLowerCase(),
          schoolId,
        },
      });
    } catch (error: any) {
      logger.error("Error finding user by email", {
        email,
        schoolId,
        message: error.message,
      });

      throw new Error("Failed to fetch user by email");
    }
  }

  /**
   * Find user by ID within a school
   */
  async findUserById(id: string, schoolId: string): Promise<User | null> {
    try {
      return await this.prisma.user.findFirst({
        where: {
          id,
          schoolId,
        },
      });
    } catch (error: any) {
      logger.error("Error finding user by ID", {
        id,
        schoolId,
        message: error.message,
      });

      throw new Error("Failed to fetch user by ID");
    }
  }

  /**
   * Update user profile (SAFE VERSION)
   * - No password updates allowed here
   * - No role updates (handled elsewhere if needed)
   */
  async updateUser(
    id: string,
    schoolId: string,
    data: UpdateUserInput
  ): Promise<User> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { id, schoolId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      return await this.prisma.user.update({
        where: { id },
        data: {
          ...(data.firstName && { firstName: data.firstName }),
          ...(data.lastName && { lastName: data.lastName }),
        },
      });
    } catch (error: any) {
      logger.error("Error updating user", {
        id,
        schoolId,
        message: error.message,
      });

      throw new Error("Failed to update user");
    }
  }

  /**
   * Update password ONLY (secure path)
   */
  async updatePassword(
    id: string,
    schoolId: string,
    passwordHash: string
  ): Promise<User> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { id, schoolId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      return await this.prisma.user.update({
        where: { id },
        data: {
          passwordHash,
        },
      });
    } catch (error: any) {
      logger.error("Error updating password", {
        id,
        schoolId,
        message: error.message,
      });

      throw new Error("Failed to update password");
    }
  }

  /**
   * Delete user (hard delete - consider soft delete in production SaaS)
   */
  async deleteUser(id: string, schoolId: string): Promise<User> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { id, schoolId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (error: any) {
      logger.error("Error deleting user", {
        id,
        schoolId,
        message: error.message,
      });

      throw new Error("Failed to delete user");
    }
  }
}