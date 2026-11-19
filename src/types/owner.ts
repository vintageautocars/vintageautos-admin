import type { OwnerStatus } from './common';

export interface OwnerProfile {
  id: string;
  userId: string;
  phone: string;
  state: string;
  city: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  status: OwnerStatus;
  rejectedReason: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
  };
}
