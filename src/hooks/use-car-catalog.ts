import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';

export interface CarMake {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CarModel {
  id: string;
  makeId: string;
  name: string;
  startYear: number;
  endYear: number;
  createdAt: string;
  updatedAt: string;
}

export interface ModelRow {
  id: string;
  makeId: string;
  makeName: string;
  name: string;
  startYear: number;
  endYear: number;
}

export interface ModelPage {
  data: ModelRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const MODELS_PAGE_KEY = ['car-catalog', 'models-page'] as const;

const keys = {
  makes:        () => ['car-catalog', 'makes'] as const,
  models:       (makeId: string) => ['car-catalog', 'models', makeId] as const,
  modelsPage:   (params: { q?: string; makeId?: string; page: number; limit: number }) =>
    [...MODELS_PAGE_KEY, params] as const,
};

export function useMakes() {
  return useQuery({
    queryKey: keys.makes(),
    queryFn: () => api.get<CarMake[]>('/car-catalog/makes').then((r) => r.data),
  });
}

export function useModels(makeId: string | null) {
  return useQuery({
    queryKey: keys.models(makeId ?? ''),
    queryFn: () => api.get<CarModel[]>(`/car-catalog/makes/${makeId}/models`).then((r) => r.data),
    enabled: !!makeId,
  });
}

export function useModelsPaginated(params: { q?: string; makeId?: string; page: number; limit: number }) {
  return useQuery({
    queryKey: keys.modelsPage(params),
    queryFn: () => api.get<ModelPage>('/car-catalog/models', { params }).then((r) => r.data),
    placeholderData: (prev) => prev,
  });
}

export function useCreateMake() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      api.post<CarMake>('/car-catalog/makes', { name }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.makes() });
      toast.success('Make added.');
    },
    onError: () => toast.error('Failed to add make.'),
  });
}

export function useUpdateMake() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      api.patch<CarMake>(`/car-catalog/makes/${id}`, { name }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.makes() });
      toast.success('Make updated.');
    },
    onError: () => toast.error('Failed to update make.'),
  });
}

export function useDeleteMake() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/car-catalog/makes/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.makes() });
      toast.success('Make deleted.');
    },
    onError: () => toast.error('Failed to delete make.'),
  });
}

export function useCreateModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      makeId,
      data,
    }: {
      makeId: string;
      data: { name: string; startYear: number; endYear: number };
    }) =>
      api
        .post<CarModel>(`/car-catalog/makes/${makeId}/models`, data)
        .then((r) => r.data),
    onSuccess: (_data, { makeId }) => {
      qc.invalidateQueries({ queryKey: keys.models(makeId) });
      qc.invalidateQueries({ queryKey: MODELS_PAGE_KEY });
      toast.success('Model added.');
    },
    onError: () => toast.error('Failed to add model.'),
  });
}

export function useUpdateModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      makeId: _makeId,
      data,
    }: {
      id: string;
      makeId: string;
      data: { name?: string; startYear?: number; endYear?: number };
    }) =>
      api.patch<CarModel>(`/car-catalog/models/${id}`, data).then((r) => r.data),
    onSuccess: (_data, { makeId }) => {
      qc.invalidateQueries({ queryKey: keys.models(makeId) });
      qc.invalidateQueries({ queryKey: MODELS_PAGE_KEY });
      toast.success('Model updated.');
    },
    onError: () => toast.error('Failed to update model.'),
  });
}

export function generateYears(startYear: number, endYear: number): number[] {
  const years: number[] = [];
  for (let y = endYear; y >= startYear; y--) years.push(y);
  return years;
}

export function useDeleteModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, makeId: _makeId }: { id: string; makeId: string }) =>
      api.delete(`/car-catalog/models/${id}`),
    onSuccess: (_data, { makeId }) => {
      qc.invalidateQueries({ queryKey: keys.models(makeId) });
      qc.invalidateQueries({ queryKey: MODELS_PAGE_KEY });
      toast.success('Model deleted.');
    },
    onError: () => toast.error('Failed to delete model.'),
  });
}
