export type PaymentMode = 'MANUAL' | 'AUTOMATIC';

export type PaymentStatus =
  | 'PENDING'
  | 'AWAITING_VERIFICATION'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED';

export interface Payment {
  id: string;
  reference: string;
  bookingId: string;
  mode: PaymentMode;
  provider: string | null;
  status: PaymentStatus;
  amount: number;
  currency: string;

  // Manual mode fields
  receiptUploadedAt: string | null;
  verifiedAt: string | null;
  rejectionReason: string | null;
  signedReceiptUrl: string | null;

  // Automatic mode fields
  providerRef: string | null;
  authorizationUrl: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface PaginatedPayments {
  data: Payment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaymentFilters {
  status?: PaymentStatus;
  mode?: PaymentMode;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
