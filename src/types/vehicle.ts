import type { VehicleStatus } from './common';

export type TransmissionType = 'AUTOMATIC' | 'MANUAL';
export type BodyStyleType    = 'HARDTOP' | 'CONVERTIBLE';

export interface VehiclePhoto {
  id: string;
  url: string;
  isPrimary: boolean;
  order: number;
}

export interface VehicleDocument {
  id: string;
  type: string;
  name: string;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  slug: string;
  name: string;
  make: string;
  model: string;
  year: number;
  category: string;
  description: string;
  rentalTerms?: string;
  transmission: TransmissionType;
  bodyStyle:    BodyStyleType | null;
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
  ownerEmail?: string;
  createdAt: string;
  updatedAt: string;
}
