import { cn } from '@/lib/utils';

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  DRAFT:                 { label: 'Draft',                className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  PENDING:               { label: 'Pending',              className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  PENDING_REVIEW:        { label: 'Pending',              className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  APPROVED:              { label: 'Approved',             className: 'bg-primary/15 text-primary border-primary/30' },
  CONFIRMED:             { label: 'Confirmed',            className: 'bg-primary/15 text-primary border-primary/30' },
  ACTIVE:                { label: 'Active',               className: 'bg-primary/15 text-primary border-primary/30' },
  COMPLETED:             { label: 'Completed',            className: 'bg-primary/15 text-primary border-primary/30' },
  VERIFIED:              { label: 'Verified',             className: 'bg-primary/15 text-primary border-primary/30' },
  REJECTED:              { label: 'Rejected',             className: 'bg-red-500/15 text-red-400 border-red-500/30' },
  CANCELLED:             { label: 'Cancelled',            className: 'bg-red-500/15 text-red-400 border-red-500/30' },
  UNAVAILABLE:           { label: 'Unavailable',          className: 'bg-red-500/15 text-red-400 border-red-500/30' },
  INACTIVE:              { label: 'Inactive',             className: 'bg-red-500/15 text-red-400 border-red-500/30' },
  UNVERIFIED:            { label: 'Unverified',           className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  // Payment statuses
  AWAITING_VERIFICATION: { label: 'Awaiting Verification', className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  PAID:                  { label: 'Paid',                  className: 'bg-primary/15 text-primary border-primary/30' },
  FAILED:                { label: 'Failed',                className: 'bg-red-500/15 text-red-400 border-red-500/30' },
  REFUNDED:              { label: 'Refunded',              className: 'bg-[var(--color-gray)]/20 text-muted-foreground border-white/10' },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const entry = STATUS_MAP[status?.toUpperCase()] ?? {
    label: status,
    className: 'bg-[var(--color-gray)] text-[var(--color-gray-text)] border-white/10',
  };
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize whitespace-nowrap',
      entry.className,
      className,
    )}>
      {entry.label}
    </span>
  );
}
