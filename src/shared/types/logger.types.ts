export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogContext {
  requestId?: string;
  userId?: string;
  schoolId?: string;
  path?: string;
  method?: string;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: LogContext;
  metadata?: Record<string, any>;
}