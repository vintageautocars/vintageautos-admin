import type { BookingSlot, BookingStatus, PaymentStatus, PaymentMode } from './common';

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

export interface BookingSlotEntry {
  id: string;
  date: string;
  slot: BookingSlot;
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
  slot: BookingSlot | null; // deprecated — legacy single-slot bookings
  slotEntries: BookingSlotEntry[];
  slotCount: number;
  dailyRate: number;
  totalAmount: number;
  status: BookingStatus;
  cancelReason: string | null;
  ownerPaidAt: string | null;
  ownerPaymentNotes: string | null;
  vehicleOwnerRoles: string[];
  payment?: BookingPaymentSummary | null;
  createdAt: string;
  updatedAt: string;
}
