export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'OWNER' | 'CUSTOMER';
export type VehicleStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'UNAVAILABLE';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type OwnerStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type PaymentStatus = 'PENDING' | 'AWAITING_VERIFICATION' | 'PAID' | 'FAILED' | 'REFUNDED';
export type PaymentMode = 'MANUAL' | 'AUTOMATIC';
export type BookingSlot = 'DAY' | 'NIGHT';
