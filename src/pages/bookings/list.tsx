import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Search } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBookings } from '@/hooks/use-bookings';
import { NIGERIAN_STATES } from '@/lib/nigerian-states';
import { formatDate, formatCurrency, truncateMiddle } from '@/lib/utils';
import type { Column } from '@/components/shared/data-table';
import type { Booking } from '@/types/booking';
import type { BookingStatus } from '@/types/common';

const PAGE_SIZE = 20;

const STATUSES: Array<{ value: BookingStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

function getPage(params: URLSearchParams): number {
  const p = parseInt(params.get('page') ?? '1', 10);
  return isNaN(p) || p < 1 ? 1 : p;
}

export default function BookingsListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // --- Derive filter values from URL ---
  const page = getPage(searchParams);
  const status = (searchParams.get('status') ?? 'ALL') as BookingStatus | 'ALL';
  const state = searchParams.get('state') ?? 'ALL';
  const startDate = searchParams.get('startDate') ?? '';
  const endDate = searchParams.get('endDate') ?? '';
  const search = searchParams.get('search') ?? '';

  // Local state for the text input so we can debounce
  const [searchInput, setSearchInput] = useState(search);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync searchInput with URL when navigating back/forward
  useEffect(() => {
    setSearchInput(searchParams.get('search') ?? '');
  }, [searchParams]);

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

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setSearchInput(val);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        setParam('search', val);
      }, 300);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setSearchParams],
  );

  const { data, isLoading, isError, refetch } = useBookings({
    page,
    pageSize: PAGE_SIZE,
    status: status === 'ALL' ? undefined : status,
    state: state === 'ALL' ? undefined : state,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    search: search || undefined,
  });

  // Normalise paginated vs array response
  const rows = Array.isArray(data) ? data : (data?.items ?? []);
  const total = Array.isArray(data) ? rows.length : (data?.total ?? 0);

  const columns: Column<Booking>[] = [
    {
      key: 'id',
      header: 'ID',
      render: (row) => (
        <span className="font-mono text-xs" title={row.id}>
          {truncateMiddle(row.id, 8, 4)}
        </span>
      ),
    },
    {
      key: 'vehicleName',
      header: 'Vehicle',
      render: (row) => <span className="font-medium">{row.vehicleName}</span>,
    },
    {
      key: 'customerName',
      header: 'Customer',
      render: (row) => (
        <div className="flex flex-col">
          <span>{row.customerName}</span>
          <span className="text-xs text-muted-foreground">(internal)</span>
        </div>
      ),
    },
    {
      key: 'startDate',
      header: 'Start Date',
      render: (row) => formatDate(row.startDate),
    },
    {
      key: 'endDate',
      header: 'End Date',
      render: (row) => formatDate(row.endDate),
    },
    {
      key: 'totalDays',
      header: 'Duration',
      render: (row) => `${row.totalDays} day${row.totalDays !== 1 ? 's' : ''}`,
    },
    {
      key: 'totalAmount',
      header: 'Total',
      render: (row) => formatCurrency(row.totalAmount),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Bookings" subtitle="Manage all vehicle bookings across the platform." />

      {/* Filter bar */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Text search */}
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by vehicle, customer…"
            value={searchInput}
            onChange={handleSearchChange}
            className="pl-8"
          />
        </div>

        {/* Status filter */}
        <Select value={status} onValueChange={(v) => setParam('status', v)}>
          <SelectTrigger className="w-[160px]">
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

        {/* State filter */}
        <Select value={state} onValueChange={(v) => setParam('state', v)}>
          <SelectTrigger className="w-[160px]">
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

        {/* Start date */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">From</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setParam('startDate', e.target.value)}
            className="w-[160px]"
          />
        </div>

        {/* End date */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">To</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setParam('endDate', e.target.value)}
            className="w-[160px]"
          />
        </div>
      </div>

      <DataTable<Booking>
        columns={columns}
        data={rows}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        onRowClick={(row) => navigate('/bookings/' + row.id)}
        keyExtractor={(row) => row.id}
      />
    </div>
  );
}
