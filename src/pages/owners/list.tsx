import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Search } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useOwners } from '@/hooks/use-owners';
import { formatDate } from '@/lib/utils';
import type { Column } from '@/components/shared/data-table';
import type { OwnerProfile } from '@/types/owner';
import type { OwnerStatus } from '@/types/common';

const PAGE_SIZE = 20;

const STATUSES: Array<{ value: OwnerStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

function getPage(params: URLSearchParams): number {
  const p = parseInt(params.get('page') ?? '1', 10);
  return isNaN(p) || p < 1 ? 1 : p;
}

export default function OwnersListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // --- Derive filter values from URL ---
  const page = getPage(searchParams);
  const status = (searchParams.get('status') ?? 'ALL') as OwnerStatus | 'ALL';
  const search = searchParams.get('search') ?? '';

  // Local state for text input so we can debounce
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

  const { data, isLoading, isError, refetch } = useOwners({
    page,
    pageSize: PAGE_SIZE,
    status: status === 'ALL' ? undefined : status,
    search: search || undefined,
  });

  // Normalise paginated vs array response
  const rawItems = Array.isArray(data) ? data : (data?.items ?? []);
  const total = Array.isArray(data) ? rawItems.length : (data?.total ?? 0);
  const rows = rawItems;

  // Pending count badge
  const pendingCount = rows.filter((r) => r.status === 'PENDING').length;

  const columns: Column<OwnerProfile>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (row) => {
        const first = row.user?.firstName ?? '';
        const last = row.user?.lastName ?? '';
        const fullName = `${first} ${last}`.trim();
        return <span className="font-medium">{fullName || '—'}</span>;
      },
    },
    {
      key: 'email',
      header: 'Email',
      render: (row) => (
        <span className="text-muted-foreground">{row.user?.email ?? '—'}</span>
      ),
    },
    {
      key: 'bankName',
      header: 'Bank',
      render: (row) => row.bankName || '—',
    },
    {
      key: 'state',
      header: 'State',
      render: (row) => row.state || '—',
    },
    {
      key: 'createdAt',
      header: 'Submitted',
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Partner Applications"
        action={
          pendingCount > 0 ? (
            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-transparent">
              {pendingCount} pending
            </Badge>
          ) : undefined
        }
      />

      {/* Filter bar */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Text search */}
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, business…"
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
      </div>

      <DataTable<OwnerProfile>
        columns={columns}
        data={rows}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        onRowClick={(row) => navigate('/owners/' + row.id)}
        keyExtractor={(row) => row.id}
      />
    </div>
  );
}
