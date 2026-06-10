import { CreateSchoolDTO, UpdateSchoolDTO, SchoolQueryDTO } from "./schools.dto";
import { SchoolsService } from "./schools.service";
import { logger } from "../../shared/utils/logger";
import { AppError } from "../../shared/errors/app.error";

/**
 * ==============================
 * SCHOOLS CONTROLLER
 * ==============================
 * Handles request orchestration only.
 * NO business logic here (Clean Architecture rule).
 */

export class SchoolsController {
  private readonly schoolsService: SchoolsService;

  constructor() {
    this.schoolsService = new SchoolsService();
  }

  /**
   * CREATE SCHOOL
   */
  async createSchool(data: CreateSchoolDTO) {
    try {
      logger.info("Creating school", { name: data.name });

      const school = await this.schoolsService.createSchool(data);

      return {
        success: true,
        message: "School created successfully",
        data: school,
      };
    } catch (error: any) {
      logger.error("Error creating school", {
        message: error.message,
        stack: error.stack,
      });

      throw new AppError("Failed to create school", 500);
    }
  }

  /**
   * GET ALL SCHOOLS
   */
  async getAllSchools(query: SchoolQueryDTO) {
    try {
      logger.info("Fetching all schools", { query });

      const result = await this.schoolsService.getAllSchools(query);

      return {
        success: true,
        message: "Schools fetched successfully",
        data: result.data,
        meta: result.meta,
      };
    } catch (error: any) {
      logger.error("Error fetching schools", {
        message: error.message,
      });

      throw new AppError("Failed to fetch schools", 500);
    }
  }

  /**
   * GET SCHOOL BY ID
   */
  async getSchoolById(schoolId: string) {
    try {
      logger.info("Fetching school by ID", { schoolId });

      const school = await this.schoolsService.getSchoolById(schoolId);

      if (!school) {
        throw new AppError("School not found", 404);
      }

      return school;
    } catch (error: any) {
      logger.error("Error fetching school by ID", {
        schoolId,
        message: error.message,
      });

      if (error instanceof AppError) throw error;

      throw new AppError("Failed to fetch school", 500);
    }
  }

  /**
   * UPDATE SCHOOL
   */
  async updateSchool(schoolId: string, data: UpdateSchoolDTO) {
    try {
      logger.info("Updating school", { schoolId, data });

      const updatedSchool = await this.schoolsService.updateSchool(
        schoolId,
        data
      );

      if (!updatedSchool) {
        throw new AppError("School not found", 404);
      }

      return {
        success: true,
        message: "School updated successfully",
        data: updatedSchool,
      };
    } catch (error: any) {
      logger.error("Error updating school", {
        schoolId,
        message: error.message,
      });

      if (error instanceof AppError) throw error;

      throw new AppError("Failed to update school", 500);
    }
  }

  /**
   * DELETE SCHOOL
   */
  async deleteSchool(schoolId: string) {
    try {
      logger.info("Deleting school", { schoolId });

      const deleted = await this.schoolsService.deleteSchool(schoolId);

      if (!deleted) {
        throw new AppError("School not found", 404);
      }

      return {
        success: true,
        message: "School deleted successfully",
      };
    } catch (error: any) {
      logger.error("Error deleting school", {
        schoolId,
        message: error.message,
      });

      if (error instanceof AppError) throw error;

      throw new AppError("Failed to delete school", 500);
    }
  }
}