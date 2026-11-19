import type { BookingStatus } from './common';

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
  createdAt: string;
  updatedAt: string;
}
