/**
 * Simple production-ready logger utility
 * Can later be upgraded to Winston / Pino
 */

type LogMeta = Record<string, any>;

class Logger {
  private formatMessage(level: string, message: string, meta?: LogMeta) {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(meta && { meta }),
    };
  }

  info(message: string, meta?: LogMeta) {
    const log = this.formatMessage("INFO", message, meta);
    console.log(JSON.stringify(log, null, 2));
  }

  warn(message: string, meta?: LogMeta) {
    const log = this.formatMessage("WARN", message, meta);
    console.warn(JSON.stringify(log, null, 2));
  }

  error(message: string, meta?: LogMeta) {
    const log = this.formatMessage("ERROR", message, meta);
    console.error(JSON.stringify(log, null, 2));
  }

  debug(message: string, meta?: LogMeta) {
    if (process.env.NODE_ENV !== "production") {
      const log = this.formatMessage("DEBUG", message, meta);
      console.debug(JSON.stringify(log, null, 2));
    }
  }
}

export const logger = new Logger();