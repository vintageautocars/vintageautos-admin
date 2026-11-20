import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { negotiationKeys, vehicleKeys } from '@/lib/query-keys';
import type { Negotiation } from '@/types/negotiation';

export function useNegotiation(vehicleId: string) {
  return useQuery({
    queryKey: negotiationKeys.byVehicle(vehicleId),
    queryFn: async () => {
      const res = await api.get<Negotiation>(`/negotiations/vehicle/${vehicleId}`);
      return res.data;
    },
    enabled: !!vehicleId,
    refetchOnMount: 'always',
    staleTime: 0,
  });
}

export function useSendNegotiationMessage(vehicleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) =>
      api.post<Negotiation>(`/negotiations/vehicle/${vehicleId}/messages`, { body }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: negotiationKeys.byVehicle(vehicleId) });
    },
    onError: () => toast.error('Failed to send message.'),
  });
}

export function useAgreeTerms(vehicleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { agreedPrice: number; rentalPrice: number }) =>
      api.patch<Negotiation>(`/negotiations/vehicle/${vehicleId}/agree`, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: negotiationKeys.byVehicle(vehicleId) });
      qc.invalidateQueries({ queryKey: vehicleKeys.detail(vehicleId) });
      qc.invalidateQueries({ queryKey: vehicleKeys.all });
      toast.success('Terms agreed — vehicle approved!');
    },
    onError: () => toast.error('Failed to agree terms.'),
  });
}

export function useRejectNegotiation(vehicleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) =>
      api.patch<Negotiation>(`/negotiations/vehicle/${vehicleId}/reject`, { reason }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: negotiationKeys.byVehicle(vehicleId) });
      qc.invalidateQueries({ queryKey: vehicleKeys.detail(vehicleId) });
      qc.invalidateQueries({ queryKey: vehicleKeys.all });
      toast.success('Vehicle rejected.');
    },
    onError: () => toast.error('Failed to reject negotiation.'),
  });
}
