import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { ownerKeys, bankDetailRequestKeys } from '@/lib/query-keys';
import type { OwnerProfile } from '@/types/owner';
import type { Paginated } from '@/types/common';

interface OwnersFilter {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
}

export function useOwners(filters: OwnersFilter = {}) {
  return useQuery({
    queryKey: ownerKeys.list(filters as Record<string, unknown>),
    queryFn: async () => {
      const res = await api.get<OwnerProfile[] | Paginated<OwnerProfile>>(
        '/onboarding/admin/applications',
        { params: filters },
      );
      return res.data;
    },
  });
}

export function useOwner(id: string) {
  return useQuery({
    queryKey: ownerKeys.detail(id),
    queryFn: async () => {
      const res = await api.get<OwnerProfile>(`/onboarding/admin/applications/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useApproveOwner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/onboarding/admin/applications/${id}/approve`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ownerKeys.all });
      toast.success('Owner application approved.');
    },
    onError: () => toast.error('Failed to approve application.'),
  });
}

export function useRejectOwner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.patch(`/onboarding/admin/applications/${id}/reject`, { reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ownerKeys.all });
      toast.success('Owner application rejected.');
    },
    onError: () => toast.error('Failed to reject application.'),
  });
}

export interface BankDetailChangeRequest {
  id: string;
  ownerProfileId: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  status: string;
  rejectionReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // admin-enriched fields
  ownerName?: string;
  currentBankName?: string;
  currentAccountName?: string;
  currentAccountNumber?: string;
}

export function usePendingBankDetailRequests() {
  return useQuery({
    queryKey: bankDetailRequestKeys.pending(),
    queryFn: async () => {
      const res = await api.get<BankDetailChangeRequest[]>('/onboarding/admin/bank-detail-requests');
      return res.data;
    },
  });
}

export function useApproveBankDetailRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/onboarding/admin/bank-detail-requests/${id}/approve`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bankDetailRequestKeys.all });
      qc.invalidateQueries({ queryKey: ownerKeys.all });
      toast.success('Bank details updated.');
    },
    onError: () => toast.error('Failed to approve request.'),
  });
}

export function useRejectBankDetailRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.patch(`/onboarding/admin/bank-detail-requests/${id}/reject`, { reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bankDetailRequestKeys.all });
      toast.success('Request rejected.');
    },
    onError: () => toast.error('Failed to reject request.'),
  });
}
