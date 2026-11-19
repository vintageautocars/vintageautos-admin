import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { vehicleKeys } from '@/lib/query-keys';
import type { Vehicle } from '@/types/vehicle';
import type { Paginated } from '@/types/common';

interface VehiclesFilter {
  page?: number;
  pageSize?: number;
  status?: string;
  state?: string;
  category?: string;
  isFeatured?: boolean;
  isAvailable?: boolean;
  search?: string;
}

export function useVehicles(filters: VehiclesFilter = {}) {
  return useQuery({
    queryKey: vehicleKeys.list(filters as Record<string, unknown>),
    queryFn: async () => {
      const res = await api.get<Vehicle[] | Paginated<Vehicle>>('/vehicles/admin', { params: filters });
      return res.data;
    },
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: vehicleKeys.detail(id),
    queryFn: async () => {
      const res = await api.get<Vehicle>(`/vehicles/admin/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useApproveVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/vehicles/admin/${id}/approve`),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: vehicleKeys.all });
      qc.invalidateQueries({ queryKey: vehicleKeys.detail(id) });
      toast.success('Vehicle approved.');
    },
    onError: () => toast.error('Failed to approve vehicle.'),
  });
}

export function useRejectVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.patch(`/vehicles/admin/${id}/reject`, { reason }),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: vehicleKeys.all });
      qc.invalidateQueries({ queryKey: vehicleKeys.detail(id) });
      toast.success('Vehicle rejected.');
    },
    onError: () => toast.error('Failed to reject vehicle.'),
  });
}

export function useToggleFeatured() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isFeatured }: { id: string; isFeatured: boolean }) =>
      api.patch(`/vehicles/admin/${id}/feature`, { isFeatured }),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: vehicleKeys.all });
      qc.invalidateQueries({ queryKey: vehicleKeys.detail(id) });
      toast.success('Featured status updated.');
    },
    onError: () => toast.error('Failed to update featured status.'),
  });
}

export function useToggleAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      api.patch(`/vehicles/admin/${id}/availability`, { isAvailable }),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: vehicleKeys.all });
      qc.invalidateQueries({ queryKey: vehicleKeys.detail(id) });
      toast.success('Availability updated.');
    },
    onError: () => toast.error('Failed to update availability.'),
  });
}

export function useFetchDocumentUrl() {
  return useMutation({
    mutationFn: ({ vehicleId, docId }: { vehicleId: string; docId: string }) =>
      api
        .get<{ url: string }>(`/vehicles/admin/${vehicleId}/documents/${docId}/url`)
        .then((r) => r.data.url),
  });
}
