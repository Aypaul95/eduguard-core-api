export enum DomainEventType {
  USER_CREATED = "USER_CREATED",
  STUDENT_CREATED = "STUDENT_CREATED",
  SCHOOL_CREATED = "SCHOOL_CREATED",

  FEE_PAID = "FEE_PAID",
  PAYMENT_FAILED = "PAYMENT_FAILED",

  EXAM_GRADED = "EXAM_GRADED",

  NOTIFICATION_SENT = "NOTIFICATION_SENT",
}

export interface BaseDomainEvent<T = any> {
  id: string;
  type: DomainEventType;
  schoolId: string;
  payload: T;
  occurredAt: Date;
}