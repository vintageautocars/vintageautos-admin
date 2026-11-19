export const authKeys = {
  me: () => ['auth', 'me'] as const,
};

export const dashboardKeys = {
  adminStats: () => ['dashboard', 'admin', 'stats'] as const,
};

export const ownerKeys = {
  all: ['owners'] as const,
  list: (filters: Record<string, unknown>) => [...ownerKeys.all, 'list', filters] as const,
  detail: (id: string) => [...ownerKeys.all, 'detail', id] as const,
};

export const vehicleKeys = {
  all: ['vehicles'] as const,
  list: (filters: Record<string, unknown>) => [...vehicleKeys.all, 'list', filters] as const,
  detail: (id: string) => [...vehicleKeys.all, 'detail', id] as const,
};

export const bookingKeys = {
  all: ['bookings'] as const,
  list: (filters: Record<string, unknown>) => [...bookingKeys.all, 'list', filters] as const,
  detail: (id: string) => [...bookingKeys.all, 'detail', id] as const,
};

export const userKeys = {
  all: ['users'] as const,
  list: (filters: Record<string, unknown>) => [...userKeys.all, 'list', filters] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
};

export const negotiationKeys = {
  all: ['negotiations'] as const,
  byVehicle: (vehicleId: string) => [...negotiationKeys.all, 'vehicle', vehicleId] as const,
};
