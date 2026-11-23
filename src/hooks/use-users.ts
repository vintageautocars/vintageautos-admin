import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import type { AdminUser } from '@/types/user';
import type { UserRole } from '@/types/common';

const userKeys = {
  all:    ['users'] as const,
  lists:  () => [...userKeys.all, 'list'] as const,
  list:   (f: Record<string, unknown>) => [...userKeys.lists(), f] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
};

interface UsersFilter {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
}

export function useUsers(filters: UsersFilter = {}) {
  return useQuery({
    queryKey: userKeys.list(filters as Record<string, unknown>),
    queryFn: async () => {
      const res = await api.get<{ items: AdminUser[]; total: number }>('/users/admin', { params: filters });
      return res.data;
    },
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const res = await api.get<AdminUser>(`/users/admin/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; firstName: string; lastName: string; phone?: string }) =>
      api.post<AdminUser>('/users/admin', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success('Admin user created. An invite email has been sent.');
    },
    onError: () => toast.error('Failed to create admin user.'),
  });
}

export function useActivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/users/admin/${id}/activate`),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      qc.invalidateQueries({ queryKey: userKeys.detail(id) });
      toast.success('User activated.');
    },
    onError: () => toast.error('Failed to activate user.'),
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/users/admin/${id}/deactivate`),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      qc.invalidateQueries({ queryKey: userKeys.detail(id) });
      toast.success('User deactivated.');
    },
    onError: () => toast.error('Failed to deactivate user.'),
  });
}

export function useUpdateUserRoles() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roles }: { id: string; roles: UserRole[] }) =>
      api.patch<AdminUser>(`/users/admin/${id}/roles`, { roles }).then(r => r.data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      qc.invalidateQueries({ queryKey: userKeys.detail(id) });
      toast.success('Roles updated.');
    },
    onError: () => toast.error('Failed to update roles.'),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/users/admin/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success('User deleted.');
    },
    onError: () => toast.error('Failed to delete user.'),
  });
}
