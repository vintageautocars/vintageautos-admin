import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Plus, Search } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { CreateUserModal } from '@/components/users/create-user-modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useUsers } from '@/hooks/use-users';
import { formatDate } from '@/lib/utils';
import type { Column } from '@/components/shared/data-table';
import type { AdminUser } from '@/types/user';
import type { UserRole } from '@/types/common';

const PAGE_SIZE = 20;

const ROLE_OPTIONS: Array<{ value: UserRole | 'ALL'; label: string }> = [
  { value: 'ALL',         label: 'All roles' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'ADMIN',       label: 'Admin' },
  { value: 'OWNER',       label: 'Owner' },
  { value: 'CUSTOMER',    label: 'Customer' },
];

const ACTIVE_OPTIONS = [
  { value: 'ALL',   label: 'All statuses' },
  { value: 'true',  label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

const ROLE_COLOURS: Record<UserRole, string> = {
  SUPER_ADMIN: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  ADMIN:       'bg-blue-500/15 text-blue-400 border-blue-500/30',
  OWNER:       'bg-primary/15 text-primary border-primary/30',
  CUSTOMER:    'bg-white/10 text-[var(--color-gray-text)] border-white/20',
};

const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN:       'Admin',
  OWNER:       'Owner',
  CUSTOMER:    'Customer',
};

function RolePills({ roles }: { roles: UserRole[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {roles.map(r => (
        <span
          key={r}
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${ROLE_COLOURS[r]}`}
        >
          {ROLE_LABELS[r]}
        </span>
      ))}
    </div>
  );
}

function getPage(params: URLSearchParams): number {
  const p = parseInt(params.get('page') ?? '1', 10);
  return isNaN(p) || p < 1 ? 1 : p;
}

export default function UsersListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showCreate, setShowCreate] = useState(false);

  const page     = getPage(searchParams);
  const role     = (searchParams.get('role')   ?? 'ALL') as UserRole | 'ALL';
  const active   = searchParams.get('active')  ?? 'ALL';
  const search   = searchParams.get('search')  ?? '';

  const [searchInput, setSearchInput] = useState(search);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setSearchInput(searchParams.get('search') ?? ''); }, [searchParams]);

  function setParam(key: string, value: string) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (!value || value === 'ALL') next.delete(key); else next.set(key, value);
      next.set('page', '1');
      return next;
    });
  }

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchInput(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setParam('search', val), 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setSearchParams]);

  const isActiveFilter = active === 'ALL' ? undefined : active === 'true';

  const { data, isLoading, isError, refetch } = useUsers({
    page,
    pageSize: PAGE_SIZE,
    role:     role === 'ALL' ? undefined : role,
    isActive: isActiveFilter,
    search:   search || undefined,
  });

  const rows  = data?.items ?? [];
  const total = data?.total ?? 0;

  const columns: Column<AdminUser>[] = [
    {
      key: 'name',
      header: 'Name',
      render: row => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">
            {row.firstName} {row.lastName}
          </span>
          <span className="text-xs text-[var(--color-gray-text)]">{row.email}</span>
        </div>
      ),
    },
    {
      key: 'roles',
      header: 'Roles',
      render: row => <RolePills roles={row.roles} />,
    },
    {
      key: 'isActive',
      header: 'Status',
      render: row => <StatusBadge status={row.isActive ? 'ACTIVE' : 'INACTIVE'} />,
    },
    {
      key: 'isEmailVerified',
      header: 'Email',
      render: row => (
        <StatusBadge status={row.isEmailVerified ? 'VERIFIED' : 'UNVERIFIED'} />
      ),
    },
    {
      key: 'createdAt',
      header: 'Joined',
      render: row => <span className="text-sm text-[var(--color-gray-text)]">{formatDate(row.createdAt)}</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Users"
        subtitle="All registered accounts across the platform."
        action={
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="size-4 mr-1" />
            New admin
          </Button>
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            value={searchInput}
            onChange={handleSearchChange}
            className="pl-8"
          />
        </div>

        <Select value={role} onValueChange={v => setParam('role', v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map(o => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={active} onValueChange={v => setParam('active', v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            {ACTIVE_OPTIONS.map(o => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable<AdminUser>
        columns={columns}
        data={rows}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={p => setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('page', String(p)); return n; })}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        onRowClick={row => navigate('/users/' + row.id)}
        keyExtractor={row => row.id}
      />

      <CreateUserModal open={showCreate} onOpenChange={setShowCreate} />
    </div>
  );
}
