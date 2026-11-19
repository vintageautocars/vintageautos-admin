import type { UserRole } from './common';

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  roles: UserRole[];
  avatarUrl: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
