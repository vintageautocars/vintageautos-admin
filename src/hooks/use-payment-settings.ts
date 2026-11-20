import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { paymentSettingsKeys } from '@/lib/query-keys';
import type { PaymentSettings, UpdatePaymentSettingsPayload } from '@/types/payment-settings';
import type { AxiosError } from 'axios';

export function usePaymentSettings() {
  return useQuery({
    queryKey: paymentSettingsKeys.detail(),
    queryFn: async () => {
      const res = await api.get<PaymentSettings>('/payment-settings');
      return res.data;
    },
    refetchOnMount: 'always',
    staleTime: 0,
  });
}

export type UpdatePaymentSettingsError =
  | { kind: 'bad_password' }
  | { kind: 'rate_limited' }
  | { kind: 'unknown'; message: string };

export function useUpdatePaymentSettings() {
  const qc = useQueryClient();

  return useMutation<
    PaymentSettings,
    AxiosError,
    UpdatePaymentSettingsPayload
  >({
    mutationFn: async (payload) => {
      const res = await api.patch<PaymentSettings>('/payment-settings', payload);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: paymentSettingsKeys.detail() });
    },
    // Error handling left to the caller — they need 401 vs 429 distinction
    // to control modal state. We do NOT show a toast here.
  });
}

/** Utility: classify an axios error from PATCH /payment-settings */
export function classifyUpdateError(err: AxiosError): UpdatePaymentSettingsError {
  const status = err.response?.status;
  if (status === 401) return { kind: 'bad_password' };
  if (status === 429) return { kind: 'rate_limited' };
  const msg = (err.response?.data as { message?: string })?.message ?? err.message;
  return { kind: 'unknown', message: msg };
}
