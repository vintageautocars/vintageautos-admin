import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { formatDate } from '@/lib/utils';
import { ScrollText } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { AuditLogDrawer } from '@/components/audit-log/audit-log-drawer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuditLog } from '@/hooks/use-audit-log';
import type { Column } from '@/components/shared/data-table';
import { AUDIT_ACTIONS, getActionLabel, getActionTone } from '@/types/audit-log';
import type { AuditLog } from '@/types/audit-log';

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;

/** Grouped action list for the filter dropdown. */
const ACTION_GROUPS: { group: string; actions: string[] }[] = [
  {
    group: 'Payment Settings',
    actions: [
      AUDIT_ACTIONS.PAYMENT_SETTINGS_UPDATED,
      AUDIT_ACTIONS.PAYMENT_SETTINGS_UPDATE_FAILED,
    ],
  },
  {
    group: 'Vehicles',
    actions: [
      AUDIT_ACTIONS.VEHICLE_APPROVED,
      AUDIT_ACTIONS.VEHICLE_REJECTED,
      AUDIT_ACTIONS.VEHICLE_AVAILABILITY_TOGGLED,
      AUDIT_ACTIONS.VEHICLE_FEATURED_TOGGLED,
    ],
  },
  {
    group: 'Bookings',
    actions: [
      AUDIT_ACTIONS.BOOKING_CONFIRMED,
      AUDIT_ACTIONS.BOOKING_MARKED_ACTIVE,
      AUDIT_ACTIONS.BOOKING_COMPLETED,
      AUDIT_ACTIONS.BOOKING_CANCELLED,
    ],
  },
  {
    group: 'Partner Applications',
    actions: [
      AUDIT_ACTIONS.OWNER_APPLICATION_APPROVED,
      AUDIT_ACTIONS.OWNER_APPLICATION_REJECTED,
    ],
  },
  {
    group: 'Users',
    actions: [
      AUDIT_ACTIONS.ADMIN_USER_CREATED,
      AUDIT_ACTIONS.USER_ACTIVATED,
      AUDIT_ACTIONS.USER_DEACTIVATED,
      AUDIT_ACTIONS.USER_ROLES_UPDATED,
      AUDIT_ACTIONS.USER_DELETED,
    ],
  },
  {
    group: 'Payments',
    actions: [
      AUDIT_ACTIONS.PAYMENT_VERIFIED,
      AUDIT_ACTIONS.PAYMENT_REJECTED,
    ],
  },
];

const KNOWN_ENTITY_TYPES = [
  'PaymentSettings',
  'Vehicle',
  'Booking',
  'OwnerApplication',
  'User',
  'Payment',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPage(params: URLSearchParams): number {
  const p = parseInt(params.get('page') ?? '1', 10);
  return isNaN(p) || p < 1 ? 1 : p;
}

const TONE_CLASSES: Record<string, string> = {
  green: 'bg-green-500/15 text-green-400 border-green-500/30',
  red:   'bg-red-500/15 text-red-400 border-red-500/30',
  amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  blue:  'bg-blue-500/15 text-blue-400 border-blue-500/30',
};

function ActionPill({ action }: { action: string }) {
  const tone = getActionTone(action);
  return (
    <span
      className={[
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium font-mono whitespace-nowrap',
        TONE_CLASSES[tone],
      ].join(' ')}
      title={action}
    >
      {getActionLabel(action)}
    </span>
  );
}

const ROLE_DISPLAY: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN:       'Admin',
  OWNER:       'Partner',
  CUSTOMER:    'Client',
};

function RolePill({ role }: { role: string }) {
  const isSuperAdmin = role === 'SUPER_ADMIN';
  return (
    <span
      className={[
        'inline-flex items-center rounded-full border px-1.5 py-0.5 text-xs font-medium',
        isSuperAdmin
          ? 'bg-primary/15 text-primary border-primary/30'
          : 'bg-muted text-muted-foreground border-white/10',
      ].join(' ')}
    >
      {ROLE_DISPLAY[role] ?? role.replace('_', ' ')}
    </span>
  );
}

function TimestampCell({ value }: { value: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-sm text-foreground cursor-default">
            {formatDistanceToNow(parseISO(value), { addSuffix: true })}
          </span>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p className="text-xs font-mono">
            {formatDate(value, 'dd MMM yyyy, HH:mm:ss')}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ─── Filter bar ───────────────────────────────────────────────────────────────

interface FilterBarProps {
  action: string;
  entityType: string;
  fromDate: string;
  toDate: string;
  onActionChange: (v: string) => void;
  onEntityTypeChange: (v: string) => void;
  onFromDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function AuditLogFilterBar({
  action,
  entityType,
  fromDate,
  toDate,
  onActionChange,
  onEntityTypeChange,
  onFromDateChange,
  onToDateChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <Select value={action} onValueChange={onActionChange}>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="All actions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All actions</SelectItem>
          {ACTION_GROUPS.map((group) => (
            group.actions.map((a) => (
              <SelectItem key={a} value={a}>
                {group.group} / {getActionLabel(a)}
              </SelectItem>
            ))
          ))}
        </SelectContent>
      </Select>

      <Select value={entityType} onValueChange={onEntityTypeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All entities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All entities</SelectItem>
          {KNOWN_ENTITY_TYPES.map((e) => (
            <SelectItem key={e} value={e}>
              {e}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <label className="text-xs text-muted-foreground whitespace-nowrap">From</label>
        <Input
          type="date"
          value={fromDate}
          onChange={onFromDateChange}
          className="w-[160px]"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-muted-foreground whitespace-nowrap">To</label>
        <Input
          type="date"
          value={toDate}
          onChange={onToDateChange}
          className="w-[160px]"
        />
      </div>
    </div>
  );
}

// ─── Columns ─────────────────────────────────────────────────────────────────

function buildColumns(): Column<AuditLog>[] {
  return [
    {
      key: 'createdAt',
      header: 'Timestamp',
      render: (row) => <TimestampCell value={row.createdAt} />,
    },
    {
      key: 'actor',
      header: 'Actor',
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm text-foreground">
            {row.actor.firstName} {row.actor.lastName}
          </span>
          <div className="flex flex-wrap gap-1">
            {row.actor.roles.map((r) => <RolePill key={r} role={r} />)}
          </div>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (row) => <ActionPill action={row.action} />,
    },
    {
      key: 'entityType',
      header: 'Entity',
      render: (row) =>
        row.entityType ? (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-foreground">{row.entityType}</span>
            {row.entityId && (
              <span className="text-xs font-mono text-muted-foreground">
                {row.entityId.length > 12
                  ? `${row.entityId.slice(0, 8)}…`
                  : row.entityId}
              </span>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'metadata',
      header: 'Source IP',
      render: (row) => {
        const meta = row.metadata;
        const ip =
          typeof meta === 'object' && meta !== null && 'ip' in meta
            ? String((meta as Record<string, unknown>).ip)
            : null;
        return ip ? (
          <span className="font-mono text-xs text-muted-foreground">{ip}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
  ];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AuditLogListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const page = getPage(searchParams);
  const action = searchParams.get('action') ?? 'ALL';
  const entityType = searchParams.get('entityType') ?? 'ALL';
  const fromDate = searchParams.get('fromDate') ?? '';
  const toDate = searchParams.get('toDate') ?? '';

  function setParam(key: string, value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (!value || value === 'ALL') {
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

  const { data, isLoading, isError, refetch } = useAuditLog({
    action: action === 'ALL' ? undefined : action,
    entityType: entityType === 'ALL' ? undefined : entityType,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const rows = data?.items ?? [];
  const total = data?.total ?? 0;

  const columns = buildColumns();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Audit Log"
        subtitle="Immutable record of sensitive admin actions."
      />

      <div className="flex flex-col gap-4">
        <AuditLogFilterBar
          action={action}
          entityType={entityType}
          fromDate={fromDate}
          toDate={toDate}
          onActionChange={(v) => setParam('action', v)}
          onEntityTypeChange={(v) => setParam('entityType', v)}
          onFromDateChange={(e) => setParam('fromDate', e.target.value)}
          onToDateChange={(e) => setParam('toDate', e.target.value)}
        />

        <DataTable<AuditLog>
          columns={columns}
          data={rows}
          total={total}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          onRowClick={(row) => setSelectedId(row.id)}
          keyExtractor={(row) => row.id}
          emptyState={
            <EmptyState
              icon={ScrollText}
              title="No audit log entries"
              description="Sensitive admin actions will be recorded here."
            />
          }
        />
      </div>

      <AuditLogDrawer
        entryId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
