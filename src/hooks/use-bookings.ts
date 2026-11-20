import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { bookingKeys } from '@/lib/query-keys';
import type { Booking, OwnerPayoutDetails } from '@/types/booking';
import type { Paginated } from '@/types/common';

interface BookingsFilter {
  page?: number;
  pageSize?: number;
  status?: string;
  state?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export function useBookings(filters: BookingsFilter = {}) {
  return useQuery({
    queryKey: bookingKeys.list(filters as Record<string, unknown>),
    queryFn: async () => {
      const res = await api.get<Booking[] | Paginated<Booking>>('/bookings/admin', { params: filters });
      return res.data;
    },
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: async () => {
      const res = await api.get<Booking>(`/bookings/admin/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useOwnerPayoutDetails(bookingId: string, enabled: boolean) {
  return useQuery({
    queryKey: [...bookingKeys.detail(bookingId), 'owner-payout-details'] as const,
    queryFn: async () => {
      const res = await api.get<OwnerPayoutDetails>(`/bookings/admin/${bookingId}/owner-payout-details`);
      return res.data;
    },
    enabled: enabled && !!bookingId,
  });
}

export function useConfirmBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/bookings/admin/${id}/confirm`),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: bookingKeys.all });
      qc.invalidateQueries({ queryKey: bookingKeys.detail(id) });
      toast.success('Booking confirmed.');
    },
    onError: () => toast.error('Failed to confirm booking.'),
  });
}

export function useActivateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/bookings/admin/${id}/active`),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: bookingKeys.all });
      qc.invalidateQueries({ queryKey: bookingKeys.detail(id) });
      toast.success('Booking marked as active.');
    },
    onError: () => toast.error('Failed to activate booking.'),
  });
}

export function useCompleteBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/bookings/admin/${id}/complete`),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: bookingKeys.all });
      qc.invalidateQueries({ queryKey: bookingKeys.detail(id) });
      toast.success('Booking completed.');
    },
    onError: () => toast.error('Failed to complete booking.'),
  });
}

export function useRecordOwnerPayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      api.patch(`/bookings/admin/${id}/owner-payout`, { notes }),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: bookingKeys.all });
      qc.invalidateQueries({ queryKey: bookingKeys.detail(id) });
      toast.success('Owner payout recorded.');
    },
    onError: () => toast.error('Failed to record owner payout.'),
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.patch(`/bookings/admin/${id}/cancel`, { reason }),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: bookingKeys.all });
      qc.invalidateQueries({ queryKey: bookingKeys.detail(id) });
      toast.success('Booking cancelled.');
    },
    onError: () => toast.error('Failed to cancel booking.'),
  });
}
