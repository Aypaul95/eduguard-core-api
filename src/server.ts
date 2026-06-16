//src/server.ts
import http from "http";
import dotenv from "dotenv";
import app from "./app"; // we will assume app.ts exists (clean architecture entry)

dotenv.config();

/**
 * =========================================
 * Types
 * =========================================
 */
interface ServerConfig {
  port: number;
  env: string;
}

/**
 * =========================================
 * Configuration
 * =========================================
 */
const config: ServerConfig = {
  port: Number(process.env.PORT) || 3000,
  env: process.env.NODE_ENV || "development",
};

/**
 * =========================================
 * Create HTTP Server
 * =========================================
 */
const server = http.createServer(app);

/**
 * =========================================
 * Start Server
 * =========================================
 */
server.listen(config.port, () => {
  console.log("=====================================");
  console.log(`🚀 EduGuard API is running`);
  console.log(`🌍 Environment: ${config.env}`);
  console.log(`📡 Port: ${config.port}`);
  console.log("=====================================");
});

/**
 * =========================================
 * Graceful Shutdown Handler
 * (VERY IMPORTANT for Prisma + SaaS)
 * =========================================
 */
const shutdown = (signal: string) => {
  console.log(`\n⚠️ Received ${signal}. Closing server gracefully...`);

  server.close(() => {
    console.log("🔌 HTTP server closed");

    // If Prisma is used globally, disconnect here:
    // prisma.$disconnect()

    console.log("🧹 Cleanup completed");
    process.exit(0);
  });

  // Force shutdown after 10s (prevents hanging processes)
  setTimeout(() => {
    console.error("❌ Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

/**
 * =========================================
 * Process Event Listeners
 * =========================================
 */
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

/**
 * =========================================
 * Unhandled Error Safety
 * =========================================
 */
process.on("uncaughtException", (err: Error) => {
  console.error("🔥 Uncaught Exception:", err.message);
  console.error(err.stack);

  shutdown("uncaughtException");
});

process.on("unhandledRejection", (reason: unknown) => {
  console.error("🔥 Unhandled Rejection:", reason);

  shutdown("unhandledRejection");
});