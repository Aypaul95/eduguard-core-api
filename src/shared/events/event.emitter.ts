import { EventEmitter } from "events";
import { BaseDomainEvent, DomainEventType } from "./event.types";

/**
 * Internal typed event emitter
 */

export class DomainEventEmitter {
  private emitter = new EventEmitter();

  emit<T>(event: BaseDomainEvent<T>): void {
    this.emitter.emit(event.type, event);
  }

  on<T>(
    eventType: DomainEventType,
    handler: (event: BaseDomainEvent<T>) => void
  ): void {
    this.emitter.on(eventType, handler);
  }

  once<T>(
    eventType: DomainEventType,
    handler: (event: BaseDomainEvent<T>) => void
  ): void {
    this.emitter.once(eventType, handler);
  }
}