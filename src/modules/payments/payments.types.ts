import {
  Payment,
  PaymentTransaction,
  Invoice,
  InvoiceStatus,
  PaymentMethod,
} from "@prisma/client";

/**
 * ============================================================
 * CORE PAYMENT TYPES
 * ============================================================
 */

/**
 * Payment creation payload (service/repository layer)
 */
export interface CreatePaymentInput {
  schoolId: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string | null;
}

/**
 * Payment query filters (GET /payments)
 */
export interface PaymentQueryParams {
  schoolId: string;
  invoiceId?: string;
  method?: PaymentMethod;
  reference?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

/**
 * Paginated payments response
 */
export interface PaginatedPaymentsResponse {
  data: PaymentWithRelations[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * Payment with relations (used in service/controller)
 */
export interface PaymentWithRelations extends Payment {
  invoice?: Invoice;
  transaction?: PaymentTransaction | null;
}

/**
 * ============================================================
 * PAYMENT TRANSACTION TYPES
 * ============================================================
 */

/**
 * Create payment transaction payload
 */
export interface CreatePaymentTransactionInput {
  paymentId: string;
  gateway: string;
  gatewayRef: string;
  status: string;
  rawResponse?: unknown;
}

/**
 * Payment transaction with payment relation
 */
export interface PaymentTransactionWithPayment
  extends PaymentTransaction {
  payment?: Payment;
}

/**
 * ============================================================
 * WEBHOOK TYPES (PAYSTACK / FLUTTERWAVE)
 * ============================================================
 */

/**
 * Paystack webhook payload (normalized)
 */
export interface PaystackWebhookPayload {
  event: string;
  data: {
    id: number;
    reference: string;
    amount: number; // in kobo
    status: string;
    gateway_response?: string;
    paid_at?: string;
    created_at?: string;
    metadata?: {
      schoolId?: string;
      invoiceId?: string;
      studentId?: string;
    };
    customer?: {
      email?: string;
      customer_code?: string;
    };
  };
}

/**
 * Webhook processing result
 */
export interface WebhookProcessingResult {
  success: boolean;
  reference: string;
  invoiceId: string;
  schoolId: string;
}

/**
 * ============================================================
 * INVOICE PAYMENT TYPES
 * ============================================================
 */

/**
 * Invoice payment update input
 */
export interface UpdateInvoicePaymentInput {
  invoiceId: string;
  amountPaid: number;
  status: InvoiceStatus;
}

/**
 * Invoice with payment summary
 */
export interface InvoiceWithPayments extends Invoice {
  payments: Payment[];
}

/**
 * Invoice calculation breakdown (for analytics/revenue module later)
 */
export interface InvoiceBreakdown {
  totalFees: number;
  discounts: number;
  scholarships: number;
  totalPaid: number;
  balance: number;
}

/**
 * ============================================================
 * PAYMENT ANALYTICS TYPES (FUTURE REVENUE MODULE READY)
 * ============================================================
 */

/**
 * School revenue summary
 */
export interface SchoolRevenueSummary {
  schoolId: string;
  totalRevenue: number;
  totalInvoices: number;
  totalPaidInvoices: number;
  totalPendingInvoices: number;
  totalPartiallyPaid: number;
}

/**
 * Daily revenue aggregation
 */
export interface DailyRevenue {
  date: string;
  totalAmount: number;
  transactionCount: number;
}

/**
 * ============================================================
 * ERROR CONTEXT TYPES
 * ============================================================
 */

/**
 * Payment module error context
 */
export interface PaymentErrorContext {
  schoolId?: string;
  invoiceId?: string;
  paymentId?: string;
  reference?: string;
  method?: PaymentMethod;
}