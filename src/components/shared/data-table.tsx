import type { ReactNode } from 'react';
import { InboxIcon } from 'lucide-react';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  emptyState?: ReactNode;
  onRowClick?: (row: T) => void;
  keyExtractor: (row: T) => string;
}

interface TablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

function TablePagination({ page, pageSize, total, onPageChange }: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between border-t px-2 py-3">
      <p className="text-xs text-muted-foreground">
        {total === 0 ? 'No results' : `Showing ${from}–${to} of ${total}`}
      </p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <span className="px-2 text-xs text-muted-foreground">
          {page} / {totalPages}
        </span>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}

export function DataTable<T>({
  columns,
  data,
  total,
  page,
  pageSize,
  onPageChange,
  isLoading,
  isError,
  onRetry,
  emptyState,
  onRowClick,
  keyExtractor,
}: DataTableProps<T>) {
  const skeletonRows = pageSize || 5;

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-background">
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: skeletonRows }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    <Skeleton className="h-4 w-full max-w-[120px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          {isError && (
            <TableRow>
              <TableCell colSpan={columns.length} className="py-10 text-center">
                <p className="mb-3 text-sm text-muted-foreground">Failed to load data.</p>
                {onRetry && (
                  <Button variant="outline" size="sm" onClick={onRetry}>
                    Retry
                  </Button>
                )}
              </TableCell>
            </TableRow>
          )}
          {!isLoading && !isError && data.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length}>
                {emptyState ?? (
                  <EmptyState icon={InboxIcon} title="No results found" description="Try adjusting your filters." />
                )}
              </TableCell>
            </TableRow>
          )}
          {!isLoading &&
            !isError &&
            data.map((row) => (
              <TableRow
                key={keyExtractor(row)}
                className={onRowClick ? 'cursor-pointer' : undefined}
                role={onRowClick ? 'button' : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={() => onRowClick?.(row)}
                onKeyDown={(e) => {
                  if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onRowClick(row);
                  }
                }}
              >
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
        </TableBody>
      </Table>
      <TablePagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />
    </div>
  );
}
