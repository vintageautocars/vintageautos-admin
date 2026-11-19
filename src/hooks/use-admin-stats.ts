import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { dashboardKeys } from '@/lib/query-keys';
import type { AdminStats } from '@/types/dashboard';

export function useAdminStats() {
  return useQuery({
    queryKey: dashboardKeys.adminStats(),
    queryFn: async () => {
      const res = await api.get<AdminStats>('/dashboard/admin/stats');
      return res.data;
    },
    staleTime: 60_000,
  });
}
