import { useNavigate } from 'react-router';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatCurrency, formatDate, truncateMiddle } from '@/lib/utils';
import type { AdminRecentBooking } from '@/types/dashboard';

interface Props {
  bookings: AdminRecentBooking[];
  isLoading: boolean;
}

export function RecentBookingsTable({ bookings, isLoading }: Props) {
  const navigate = useNavigate();
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-[#FFFFFF1A] hover:bg-transparent">
          <TableHead className="text-[var(--color-gray-text)] font-medium text-xs uppercase tracking-wide">ID</TableHead>
          <TableHead className="text-[var(--color-gray-text)] font-medium text-xs uppercase tracking-wide">Vehicle</TableHead>
          <TableHead className="text-[var(--color-gray-text)] font-medium text-xs uppercase tracking-wide hidden sm:table-cell">Customer</TableHead>
          <TableHead className="text-[var(--color-gray-text)] font-medium text-xs uppercase tracking-wide hidden md:table-cell">Dates</TableHead>
          <TableHead className="text-[var(--color-gray-text)] font-medium text-xs uppercase tracking-wide text-right">Amount</TableHead>
          <TableHead className="text-[var(--color-gray-text)] font-medium text-xs uppercase tracking-wide">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading && Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i} className="border-[#FFFFFF1A]">
            {Array.from({ length: 6 }).map((_, j) => (
              <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
            ))}
          </TableRow>
        ))}
        {!isLoading && bookings.map((b) => (
          <TableRow
            key={b.id}
            className="border-[#FFFFFF1A] hover:bg-white/5 cursor-pointer transition-colors"
            onClick={() => navigate('/bookings/' + b.id)}
          >
            <TableCell className="font-mono text-xs text-[var(--color-gray-text)]" title={b.id}>{truncateMiddle(b.id, 8, 4)}</TableCell>
            <TableCell className="text-sm font-medium text-foreground">{b.vehicleName}</TableCell>
            <TableCell className="text-sm text-[var(--color-gray-text)] hidden sm:table-cell">{b.customerName}</TableCell>
            <TableCell className="text-xs text-[var(--color-gray-text)] hidden md:table-cell whitespace-nowrap">{formatDate(b.startDate)} – {formatDate(b.endDate)}</TableCell>
            <TableCell className="text-sm font-medium text-foreground text-right whitespace-nowrap">{formatCurrency(b.totalAmount)}</TableCell>
            <TableCell><StatusBadge status={b.status} /></TableCell>
          </TableRow>
        ))}
        {!isLoading && bookings.length === 0 && (
          <TableRow className="border-[#FFFFFF1A]">
            <TableCell colSpan={6} className="text-center text-sm text-[var(--color-gray-text)] py-8">No recent bookings.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
