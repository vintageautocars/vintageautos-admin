import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { auditLogKeys } from '@/lib/query-keys';
import type { AuditLog, AuditLogFilters, PaginatedAuditLog } from '@/types/audit-log';

export function useAuditLog(filters: AuditLogFilters = {}) {
  return useQuery({
    queryKey: auditLogKeys.list(filters as Record<string, unknown>),
    queryFn: async () => {
      const res = await api.get<PaginatedAuditLog>('/audit-log', { params: filters });
      return res.data;
    },
  });
}

export function useAuditLogEntry(id: string | null) {
  return useQuery({
    queryKey: auditLogKeys.detail(id ?? ''),
    queryFn: async () => {
      const res = await api.get<AuditLog>(`/audit-log/${id}`);
      return res.data;
    },
    enabled: !!id,
    refetchOnMount: 'always',
    staleTime: 0,
  });
}
