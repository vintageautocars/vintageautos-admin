import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { paymentKeys } from '@/lib/query-keys';
import type { Payment, PaginatedPayments, PaymentFilters } from '@/types/payment';

export function usePayments(filters: PaymentFilters = {}) {
  return useQuery({
    queryKey: paymentKeys.list(filters as Record<string, unknown>),
    queryFn: async () => {
      const res = await api.get<PaginatedPayments>('/payments/admin', { params: filters });
      return res.data;
    },
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: paymentKeys.detail(id),
    queryFn: async () => {
      const res = await api.get<Payment>(`/payments/admin/${id}`);
      return res.data;
    },
    enabled: !!id,
    refetchOnMount: 'always',
    staleTime: 0,
  });
}

export function useAwaitingVerification() {
  return useQuery({
    queryKey: paymentKeys.awaitingVerification(),
    queryFn: async () => {
      const res = await api.get<Payment[]>('/payments/admin/awaiting-verification');
      return res.data;
    },
    // A 400 from the backend (manual mode disabled) is handled in the UI via isError
  });
}

export function useVerifyPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch<Payment>(`/payments/admin/${id}/verify`).then((r) => r.data),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: paymentKeys.all });
      qc.invalidateQueries({ queryKey: paymentKeys.detail(id) });
      toast.success('Payment verified — booking confirmed.');
    },
    onError: () => toast.error('Failed to verify payment.'),
  });
}

export function useRejectPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.patch<Payment>(`/payments/admin/${id}/reject`, { reason }).then((r) => r.data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: paymentKeys.all });
      qc.invalidateQueries({ queryKey: paymentKeys.detail(id) });
      toast.success('Payment rejected — customer notified.');
    },
    onError: () => toast.error('Failed to reject payment.'),
  });
}
