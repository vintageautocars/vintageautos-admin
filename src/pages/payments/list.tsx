import { useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import { CreditCard } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { PaymentDetailDrawer } from '@/components/payments/payment-detail-drawer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { usePayments, useAwaitingVerification } from '@/hooks/use-payments';
import type { Column } from '@/components/shared/data-table';
import type { Payment, PaymentStatus, PaymentMode } from '@/types/payment';

const PAGE_SIZE = 20;

function getPage(params: URLSearchParams): number {
  const p = parseInt(params.get('page') ?? '1', 10);
  return isNaN(p) || p < 1 ? 1 : p;
}

function formatCurrency(amount: number, currency = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

const STATUSES: Array<{ value: PaymentStatus | 'ALL'; label: string }> = [
  { value: 'ALL',                  label: 'All statuses' },
  { value: 'PENDING',              label: 'Pending' },
  { value: 'AWAITING_VERIFICATION', label: 'Awaiting verification' },
  { value: 'PAID',                 label: 'Paid' },
  { value: 'FAILED',               label: 'Failed' },
  { value: 'REFUNDED',             label: 'Refunded' },
];

const MODES: Array<{ value: PaymentMode | 'ALL'; label: string }> = [
  { value: 'ALL',       label: 'All modes' },
  { value: 'MANUAL',    label: 'Manual' },
  { value: 'AUTOMATIC', label: 'Automatic' },
];

// ─── Filter bar ──────────────────────────────────────────────────────────────

interface FilterBarProps {
  status: string;
  mode: string;
  startDate: string;
  endDate: string;
  onStatusChange: (v: string) => void;
  onModeChange: (v: string) => void;
  onStartDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEndDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function PaymentFilterBar({
  status,
  mode,
  startDate,
  endDate,
  onStatusChange,
  onModeChange,
  onStartDateChange,
  onEndDateChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[200px]">
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

      <Select value={mode} onValueChange={onModeChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="All modes" />
        </SelectTrigger>
        <SelectContent>
          {MODES.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <label className="text-xs text-muted-foreground whitespace-nowrap">From</label>
        <Input
          type="date"
          value={startDate}
          onChange={onStartDateChange}
          className="w-[160px]"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-muted-foreground whitespace-nowrap">To</label>
        <Input
          type="date"
          value={endDate}
          onChange={onEndDateChange}
          className="w-[160px]"
        />
      </div>
    </div>
  );
}

// ─── Shared columns ───────────────────────────────────────────────────────────

function buildColumns(onRowClick: (row: Payment) => void): Column<Payment>[] {
  return [
    {
      key: 'reference',
      header: 'Reference',
      render: (row) => (
        <span className="font-mono text-xs text-foreground">{row.reference}</span>
      ),
    },
    {
      key: 'bookingId',
      header: 'Booking',
      render: (row) => (
        <Link
          to={`/bookings/${row.bookingId}`}
          className="text-xs text-primary hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {row.bookingId.slice(0, 10)}…
        </Link>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (row) => (
        <span className="font-medium text-foreground">
          {formatCurrency(row.amount, row.currency)}
        </span>
      ),
    },
    {
      key: 'mode',
      header: 'Mode',
      render: (row) => (
        <span className="text-sm capitalize">{row.mode.toLowerCase()}</span>
      ),
    },
    {
      key: 'provider',
      header: 'Provider',
      render: (row) => (
        <span className="text-sm capitalize text-muted-foreground">
          {row.provider ?? '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (row) => (
        <span className="text-sm text-muted-foreground">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      render: (row) => (
        <span className="text-sm text-muted-foreground">{formatDate(row.updatedAt)}</span>
      ),
    },
  ];
  void onRowClick; // used by parent onClick, not column render
}

// ─── Awaiting verification tab ────────────────────────────────────────────────

function AwaitingVerificationTab({ onRowClick }: { onRowClick: (row: Payment) => void }) {
  const { data, isLoading, isError, refetch, error } = useAwaitingVerification();

  // 400 means manual mode is disabled — show graceful empty state
  const isManualDisabled =
    isError &&
    (error as { response?: { status?: number } })?.response?.status === 400;

  const columns = buildColumns(onRowClick);

  if (isManualDisabled) {
    return (
      <div className="rounded-lg border bg-card">
        <EmptyState
          icon={CreditCard}
          title="Manual payments not enabled"
          description="The backend is running in automatic mode. Awaiting Verification is only available in manual mode."
        />
      </div>
    );
  }

  const rows = Array.isArray(data) ? data : [];

  return (
    <DataTable<Payment>
      columns={columns}
      data={rows}
      total={rows.length}
      page={1}
      pageSize={rows.length || PAGE_SIZE}
      onPageChange={() => {}}
      isLoading={isLoading}
      isError={isError && !isManualDisabled}
      onRetry={() => refetch()}
      onRowClick={onRowClick}
      keyExtractor={(row) => row.id}
      emptyState={
        <EmptyState
          icon={CreditCard}
          title="No payments awaiting verification"
          description="All manual receipts have been reviewed."
        />
      }
    />
  );
}

// ─── All payments tab ─────────────────────────────────────────────────────────

interface AllPaymentsTabProps {
  onRowClick: (row: Payment) => void;
  searchParams: URLSearchParams;
  setSearchParams: (fn: (p: URLSearchParams) => URLSearchParams) => void;
}

function AllPaymentsTab({ onRowClick, searchParams, setSearchParams }: AllPaymentsTabProps) {
  const page = getPage(searchParams);
  const status = searchParams.get('status') ?? 'ALL';
  const mode = searchParams.get('mode') ?? 'ALL';
  const startDate = searchParams.get('startDate') ?? '';
  const endDate = searchParams.get('endDate') ?? '';

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

  const { data, isLoading, isError, refetch } = usePayments({
    page,
    limit: PAGE_SIZE,
    status: status === 'ALL' ? undefined : (status as PaymentStatus),
    mode: mode === 'ALL' ? undefined : (mode as PaymentMode),
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;

  const columns = buildColumns(onRowClick);

  return (
    <div className="flex flex-col gap-4">
      <PaymentFilterBar
        status={status}
        mode={mode}
        startDate={startDate}
        endDate={endDate}
        onStatusChange={(v) => setParam('status', v)}
        onModeChange={(v) => setParam('mode', v)}
        onStartDateChange={(e) => setParam('startDate', e.target.value)}
        onEndDateChange={(e) => setParam('endDate', e.target.value)}
      />

      <DataTable<Payment>
        columns={columns}
        data={rows}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        onRowClick={onRowClick}
        keyExtractor={(row) => row.id}
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PaymentsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const tab = searchParams.get('tab') ?? 'awaiting';

  function setTab(value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', value);
      next.set('page', '1');
      return next;
    });
  }

  const { data: awaitingData } = useAwaitingVerification();
  const awaitingCount = Array.isArray(awaitingData) ? awaitingData.length : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payments"
        subtitle="Review manual receipts and monitor all payment activity."
        action={
          awaitingCount > 0 ? (
            <Badge variant="secondary">{awaitingCount} awaiting</Badge>
          ) : undefined
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="awaiting" className="flex items-center gap-1.5">
            Awaiting verification
            {awaitingCount > 0 && (
              <span className="ml-1 inline-flex size-2 rounded-full bg-yellow-400" />
            )}
          </TabsTrigger>
          <TabsTrigger value="all">All payments</TabsTrigger>
        </TabsList>

        <TabsContent value="awaiting" className="mt-4">
          <AwaitingVerificationTab onRowClick={(row) => setSelectedId(row.id)} />
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <AllPaymentsTab
            onRowClick={(row) => setSelectedId(row.id)}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
        </TabsContent>
      </Tabs>

      <PaymentDetailDrawer
        paymentId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
