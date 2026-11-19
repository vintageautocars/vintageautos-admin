import type { BookingStatus } from './common';

export interface AdminVehicleStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  suspended: number;
}

export interface AdminBookingStats {
  total: number;
  pending: number;
  confirmed: number;
  active: number;
  completed: number;
  cancelled: number;
}

export interface AdminOwnerStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface AdminCustomerStats {
  total: number;
}

export interface AdminRecentBooking {
  id: string;
  vehicleName: string;
  customerName: string;
  status: BookingStatus;
  startDate: string;
  endDate: string;
  totalAmount: number;
  createdAt: string;
}

export interface AdminStats {
  vehicles: AdminVehicleStats;
  bookings: AdminBookingStats;
  owners: AdminOwnerStats;
  customers: AdminCustomerStats;
  recentBookings: AdminRecentBooking[];
}
