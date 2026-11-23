import type { UserRole } from './common';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  roles: UserRole[];
  avatarUrl: string | null;
  isEmailVerified: boolean;
  mustChangePassword: boolean;
  createdAt: string;
}
