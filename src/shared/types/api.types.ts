export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, any>;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errorCode?: string;
  errors?: Record<string, string[]>;
  stack?: string; // only in dev
}

export interface RequestContext {
  requestId: string;
  ip: string;
  userAgent?: string;
  timestamp: Date;
}