import { randomUUID } from "crypto";
import { DomainEventEmitter } from "./event.emitter";
import { BaseDomainEvent, DomainEventType } from "./event.types";

/**
 * Central Event Bus (EduGuard core)
 * Handles event creation + dispatch
 */

export class EventBus {
  private emitter: DomainEventEmitter;

  constructor() {
    this.emitter = new DomainEventEmitter();
  }

  publish<T>(
    type: DomainEventType,
    schoolId: string,
    payload: T
  ): void {
    if (!schoolId) {
      throw new Error("School ID is required for domain events");
    }

    const event: BaseDomainEvent<T> = {
      id: randomUUID(),
      type,
      schoolId,
      payload,
      occurredAt: new Date(),
    };

    this.emitter.emit(event);
  }

  subscribe<T>(
    type: DomainEventType,
    handler: (event: BaseDomainEvent<T>) => void
  ): void {
    this.emitter.on(type, handler);
  }

  subscribeOnce<T>(
    type: DomainEventType,
    handler: (event: BaseDomainEvent<T>) => void
  ): void {
    this.emitter.once(type, handler);
  }
}