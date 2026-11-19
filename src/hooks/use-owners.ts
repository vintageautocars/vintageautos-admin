import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { ownerKeys } from '@/lib/query-keys';
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
