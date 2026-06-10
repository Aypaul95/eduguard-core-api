import { BaseDomainEvent } from "./event.types";

/**
 * Logs all domain events for audit + debugging
 * Important for EduGuard financial tracking system
 */

export class EventLogger {
  log<T>(event: BaseDomainEvent<T>): void {
    console.log("[DOMAIN EVENT]", {
      id: event.id,
      type: event.type,
      schoolId: event.schoolId,
      timestamp: event.occurredAt.toISOString(),
      payload: event.payload,
    });
  }
}