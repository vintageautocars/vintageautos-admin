import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Car, Loader2, Lock } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  VehicleFilterBar,
  useSearchDebounce,
} from '@/components/vehicles/vehicle-filter-bar';
import {
  useVehicles,
  useToggleFeatured,
  useToggleAvailability,
} from '@/hooks/use-vehicles';
import type { Column } from '@/components/shared/data-table';
import type { Vehicle } from '@/types/vehicle';

const PAGE_SIZE = 20;

function getPage(params: URLSearchParams): number {
  const p = parseInt(params.get('page') ?? '1', 10);
  return isNaN(p) || p < 1 ? 1 : p;
}

function VehiclePhoto({ row }: { row: Vehicle }) {
  if (row.photos.length > 0) {
    return (
      <img
        src={row.photos[0].url}
        alt={row.name}
        className="size-12 rounded object-cover"
        loading="lazy"
      />
    );
  }
  return (
    <div className="flex size-12 items-center justify-center rounded bg-muted">
      <Car className="size-5 text-muted-foreground" />
    </div>
  );
}

function VehicleNameCell({ row }: { row: Vehicle }) {
  return (
    <div className="flex flex-col">
      <span className="font-medium text-foreground">{row.name}</span>
      <span className="text-xs text-muted-foreground">
        {row.make} {row.model} · {row.year}
      </span>
    </div>
  );
}

function OwnerCell({ row }: { row: Vehicle }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-sm text-muted-foreground"
      title="Internal only"
    >
      <Lock className="size-3 shrink-0" />
      {row.ownerName ?? '—'}
    </span>
  );
}

interface TogglesCellProps {
  row: Vehicle;
  pendingFeature: Set<string>;
  pendingAvail: Set<string>;
  onToggleFeatured: (row: Vehicle) => void;
  onToggleAvailable: (row: Vehicle) => void;
}

function FeaturedCell({ row, pendingFeature, onToggleFeatured }: Pick<TogglesCellProps, 'row' | 'pendingFeature' | 'onToggleFeatured'>) {
  const isPending = pendingFeature.has(row.id);
  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      {isPending ? (
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      ) : (
        <Switch
          size="sm"
          checked={row.isFeatured}
          onCheckedChange={() => onToggleFeatured(row)}
          aria-label={`Toggle featured for ${row.name}`}
        />
      )}
    </div>
  );
}

function AvailableCell({ row, pendingAvail, onToggleAvailable }: Pick<TogglesCellProps, 'row' | 'pendingAvail' | 'onToggleAvailable'>) {
  const isPending = pendingAvail.has(row.id);
  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      {isPending ? (
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      ) : (
        <Switch
          size="sm"
          checked={row.isAvailable}
          onCheckedChange={() => onToggleAvailable(row)}
          aria-label={`Toggle availability for ${row.name}`}
        />
      )}
    </div>
  );
}

export default function VehiclesListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = getPage(searchParams);
  const status = searchParams.get('status') ?? 'ALL';
  const state = searchParams.get('state') ?? 'ALL';
  const category = searchParams.get('category') ?? 'ALL';
  const featured = searchParams.get('featured') ?? 'ALL';
  const available = searchParams.get('available') ?? 'ALL';

  const { searchInput, handleSearchChange } = useSearchDebounce(searchParams, setSearchParams);
  const search = searchParams.get('search') ?? '';

  const [pendingFeature, setPendingFeature] = useState<Set<string>>(new Set());
  const [pendingAvail, setPendingAvail] = useState<Set<string>>(new Set());

  const toggleFeaturedMutation = useToggleFeatured();
  const toggleAvailabilityMutation = useToggleAvailability();

  function setParam(key: string, value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === '' || value === 'ALL') {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      next.set('page', '1');
      return next;
    });
  }

  function setPage(p: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(p));
      return next;
    });
  }

  const { data, isLoading, isError, refetch } = useVehicles({
    page,
    pageSize: PAGE_SIZE,
    status: status === 'ALL' ? undefined : status,
    state: state === 'ALL' ? undefined : state,
    category: category === 'ALL' ? undefined : category,
    isFeatured: featured === 'ALL' ? undefined : featured === 'true',
    isAvailable: available === 'ALL' ? undefined : available === 'true',
    search: search || undefined,
  });

  const rows = Array.isArray(data) ? data : (data?.items ?? []);
  const total = Array.isArray(data) ? rows.length : (data?.total ?? 0);

  // Count pending vehicles for the header badge
  const pendingCount = status === 'PENDING' ? total : undefined;

  function handleToggleFeatured(row: Vehicle) {
    setPendingFeature((prev) => new Set(prev).add(row.id));
    toggleFeaturedMutation.mutate(
      { id: row.id, isFeatured: !row.isFeatured },
      { onSettled: () => setPendingFeature((prev) => { const s = new Set(prev); s.delete(row.id); return s; }) },
    );
  }

  function handleToggleAvailable(row: Vehicle) {
    setPendingAvail((prev) => new Set(prev).add(row.id));
    toggleAvailabilityMutation.mutate(
      { id: row.id, isAvailable: !row.isAvailable },
      { onSettled: () => setPendingAvail((prev) => { const s = new Set(prev); s.delete(row.id); return s; }) },
    );
  }

  const columns: Column<Vehicle>[] = [
    {
      key: 'photo',
      header: '',
      className: 'w-16',
      render: (row) => <VehiclePhoto row={row} />,
    },
    {
      key: 'name',
      header: 'Vehicle',
      render: (row) => <VehicleNameCell row={row} />,
    },
    {
      key: 'owner',
      header: 'Owner',
      render: (row) => <OwnerCell row={row} />,
    },
    {
      key: 'state',
      header: 'State',
      render: (row) => <span className="text-sm">{row.state}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'isFeatured',
      header: 'Featured',
      render: (row) => (
        <FeaturedCell
          row={row}
          pendingFeature={pendingFeature}
          onToggleFeatured={handleToggleFeatured}
        />
      ),
    },
    {
      key: 'isAvailable',
      header: 'Available',
      render: (row) => (
        <AvailableCell
          row={row}
          pendingAvail={pendingAvail}
          onToggleAvailable={handleToggleAvailable}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Vehicles"
        action={
          pendingCount != null && pendingCount > 0 ? (
            <Badge variant="secondary">{pendingCount} pending</Badge>
          ) : undefined
        }
      />

      <VehicleFilterBar
        status={status}
        state={state}
        category={category}
        featured={featured}
        available={available}
        searchInput={searchInput}
        onStatusChange={(v) => setParam('status', v)}
        onStateChange={(v) => setParam('state', v)}
        onCategoryChange={(v) => setParam('category', v)}
        onFeaturedChange={(v) => setParam('featured', v)}
        onAvailableChange={(v) => setParam('available', v)}
        onSearchChange={handleSearchChange}
      />

      <DataTable<Vehicle>
        columns={columns}
        data={rows}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        onRowClick={(row) => navigate('/vehicles/' + row.id)}
        keyExtractor={(row) => row.id}
      />
    </div>
  );
}
