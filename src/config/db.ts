//src/config/db.ts
import { PrismaClient } from "@prisma/client";
import { env } from "./env";
import { decodeBase64 } from "bcryptjs";

/**
 * Global Prisma Type
 * Prevents multiple Prisma instances during development
 */
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Prisma Client Configuration
 */
const createPrismaClient = (): PrismaClient => {
  return new PrismaClient({
    log:
      env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["warn", "error"],

    errorFormat:
      env.NODE_ENV === "development" ? "pretty" : "minimal",
  });
};

/**
 * Singleton Prisma Instance
 */
export const prisma: PrismaClient =
  global.prisma ?? createPrismaClient();

/**
 * Prevent multiple Prisma instances in development
 */
if (env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

/**
 * Connect Database
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();

    console.log(
      `✅ PostgreSQL connected successfully [${env.NODE_ENV}]`
    );
  } catch (error) {
    console.error("❌ Database connection failed");

    if (error instanceof Error) {
      console.error(error.message);
    }

    process.exit(1);
  }
};

/**
 * Gracefully Disconnect Database
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();

    console.log("🔌 Database disconnected successfully");
  } catch (error) {
    console.error("❌ Error while disconnecting database");

    if (error instanceof Error) {
      console.error(error.message);
    }
  }
};

/**
 * Health Check Utility
 */
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return true;
  } catch (error) {
    console.error("❌ Database health check failed");

    if (error instanceof Error) {
      console.error(error.message);
    }

    return false;
  }
};

/**
 * Graceful Shutdown Handlers
 */
process.on("SIGINT", async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await disconnectDatabase();
  process.exit(0);
});