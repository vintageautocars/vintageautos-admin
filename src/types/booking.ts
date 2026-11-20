import type { BookingStatus, PaymentStatus, PaymentMode } from './common';

export interface OwnerPayoutDetails {
  ownerName:     string;
  bankName:      string;
  accountName:   string;
  accountNumber: string;
}

export interface BookingPaymentSummary {
  id: string;
  reference: string;
  mode: PaymentMode;
  status: PaymentStatus;
  amount: number;
}

export interface Booking {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehicleSlug?: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  dailyRate: number;
  totalAmount: number;
  status: BookingStatus;
  cancelReason: string | null;
  ownerPaidAt: string | null;
  ownerPaymentNotes: string | null;
  payment?: BookingPaymentSummary | null;
  createdAt: string;
  updatedAt: string;
}
