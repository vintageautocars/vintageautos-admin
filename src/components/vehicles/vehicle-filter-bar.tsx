import { useCallback, useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NIGERIAN_STATES } from '@/lib/nigerian-states';
import { useCategories } from '@/hooks/use-categories';
import type { VehicleStatus } from '@/types/common';

const STATUSES: Array<{ value: VehicleStatus | 'ALL'; label: string }> = [
  { value: 'ALL',           label: 'All statuses' },
  { value: 'PENDING_REVIEW', label: 'Pending review' },
  { value: 'APPROVED',      label: 'Approved' },
  { value: 'REJECTED',      label: 'Rejected' },
  { value: 'UNAVAILABLE',   label: 'Unavailable' },
];

interface VehicleFilterBarProps {
  status: string;
  state: string;
  category: string;
  bodyStyle: string;
  featured: string;
  available: string;
  searchInput: string;
  onStatusChange: (v: string) => void;
  onStateChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onBodyStyleChange: (v: string) => void;
  onFeaturedChange: (v: string) => void;
  onAvailableChange: (v: string) => void;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function VehicleFilterBar({
  status,
  state,
  category,
  bodyStyle,
  featured,
  available,
  searchInput,
  onStatusChange,
  onStateChange,
  onCategoryChange,
  onBodyStyleChange,
  onFeaturedChange,
  onAvailableChange,
  onSearchChange,
}: VehicleFilterBarProps) {
  const { data: categoriesData } = useCategories();
  const categories = categoriesData ?? [];

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="relative min-w-[200px] flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search vehicles…"
          value={searchInput}
          onChange={onSearchChange}
          className="pl-8"
        />
      </div>

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={state} onValueChange={onStateChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="All states" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All states</SelectItem>
          {NIGERIAN_STATES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.name}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={bodyStyle} onValueChange={onBodyStyleChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Body style" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All styles</SelectItem>
          <SelectItem value="HARDTOP">Hardtop</SelectItem>
          <SelectItem value="CONVERTIBLE">Convertible</SelectItem>
        </SelectContent>
      </Select>

      <Select value={featured} onValueChange={onFeaturedChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Featured" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All</SelectItem>
          <SelectItem value="true">Featured</SelectItem>
          <SelectItem value="false">Not featured</SelectItem>
        </SelectContent>
      </Select>

      <Select value={available} onValueChange={onAvailableChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Availability" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All</SelectItem>
          <SelectItem value="true">Available</SelectItem>
          <SelectItem value="false">Unavailable</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

// Re-export the debounce hook for use in list page
export function useSearchDebounce(
  searchParams: URLSearchParams,
  setSearchParams: (fn: (p: URLSearchParams) => URLSearchParams) => void,
) {
  const search = searchParams.get('search') ?? '';
  const [searchInput, setSearchInput] = useState(search);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSearchInput(searchParams.get('search') ?? '');
  }, [searchParams]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setSearchInput(val);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          if (val === '') {
            next.delete('search');
          } else {
            next.set('search', val);
          }
          next.set('page', '1');
          return next;
        });
      }, 300);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setSearchParams],
  );

  return { searchInput, handleSearchChange };
}
