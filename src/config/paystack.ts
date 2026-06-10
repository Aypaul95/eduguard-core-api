import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
} from "axios";
import { env } from "./env";

/**
 * Standard Paystack API Response
 */
export interface PaystackResponse<T = unknown> {
  status: boolean;
  message: string;
  data: T;
}

/**
 * Paystack Customer
 */
export interface PaystackCustomer {
  id: number;
  email: string;
  customer_code: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

/**
 * Transaction Initialization Payload
 */
export interface InitializeTransactionPayload {
  email: string;
  amount: number; // Kobo
  reference?: string;
  callback_url?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Verify Transaction Response
 */
export interface VerifyTransactionData {
  reference: string;
  amount: number;
  status: string;
  paid_at: string;
  channel: string;
  customer: PaystackCustomer;
}

/**
 * Paystack Service Class
 */
class PaystackClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: env.PAYSTACK_BASE_URL,
      timeout: 15000,
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    this.registerInterceptors();
  }

  /**
   * Request/Response Logging
   */
  private registerInterceptors(): void {
    this.client.interceptors.request.use((config) => {
      console.log(
        `[PAYSTACK REQUEST] ${config.method?.toUpperCase()} ${config.url}`
      );

      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error(
          "[PAYSTACK ERROR]",
          error?.response?.data || error.message
        );

        return Promise.reject(error);
      }
    );
  }

  /**
   * Initialize Payment
   */
  async initializeTransaction(
    payload: InitializeTransactionPayload
  ): Promise<PaystackResponse> {
    try {
      const response: AxiosResponse<PaystackResponse> =
        await this.client.post(
          "/transaction/initialize",
          payload
        );

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Verify Payment
   */
  async verifyTransaction(
    reference: string
  ): Promise<PaystackResponse<VerifyTransactionData>> {
    try {
      const response =
        await this.client.get<
          PaystackResponse<VerifyTransactionData>
        >(`/transaction/verify/${reference}`);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create Customer
   */
  async createCustomer(payload: {
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
  }): Promise<PaystackResponse<PaystackCustomer>> {
    try {
      const response =
        await this.client.post<
          PaystackResponse<PaystackCustomer>
        >("/customer", payload);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generic Error Handler
   */
  private handleError(error: unknown): Error {
    if (error instanceof AxiosError) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Paystack API Error";

      return new Error(message);
    }

    if (error instanceof Error) {
      return error;
    }

    return new Error("Unknown Paystack Error");
  }
}

/**
 * Singleton Paystack Client
 */
export const paystack = new PaystackClient();