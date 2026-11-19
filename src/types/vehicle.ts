import type { VehicleStatus } from './common';

export type TransmissionType = 'AUTOMATIC' | 'MANUAL';
export type VehicleCategory =
  | 'CLASSIC_VINTAGE'
  | 'VINTAGE_MERCEDES'
  | 'CLASSIC_CONVERTIBLE'
  | 'CLASSIC_SUV'
  | 'VINTAGE_SPORTS'
  | 'OTHER_COLLECTIBLE';

export interface VehiclePhoto {
  id: string;
  url: string;
  isPrimary: boolean;
  order: number;
}

export interface VehicleDocument {
  id: string;
  type: string;
  filename: string;
  uploadedAt: string;
}

export interface Vehicle {
  id: string;
  slug: string;
  name: string;
  make: string;
  model: string;
  year: number;
  category: VehicleCategory;
  description: string;
  transmission: TransmissionType;
  dailyRate: number;
  agreedPrice: number | null;
  state: string;
  city: string;
  status: VehicleStatus;
  isAvailable: boolean;
  isFeatured: boolean;
  rejectedReason: string | null;
  photos: VehiclePhoto[];
  documents?: VehicleDocument[];
  ownerId?: string;
  ownerName?: string;
  createdAt: string;
  updatedAt: string;
}
