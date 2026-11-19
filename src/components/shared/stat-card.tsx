import { Link } from 'react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number | string;
  hint?: string;
  icon?: React.ElementType;
  accent?: 'default' | 'blue' | 'yellow' | 'red';
  href?: string;
  isLoading?: boolean;
  className?: string;
}

export function StatCard({ label, value, hint, icon: Icon, accent = 'default', href, isLoading, className }: StatCardProps) {
  const accentClass =
    accent === 'blue'   ? 'bg-blue-500/15 text-blue-400' :
    accent === 'yellow' ? 'bg-yellow-500/15 text-yellow-400' :
    accent === 'red'    ? 'bg-red-500/15 text-red-400' :
                          'bg-primary/15 text-primary';

  const content = (
    <CardContent className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[var(--color-gray-text)] text-xs sm:text-sm font-medium">{label}</p>
          {isLoading ? (
            <Skeleton className="h-7 w-20 mt-1.5" />
          ) : (
            <p className="text-xl sm:text-2xl font-semibold text-foreground mt-1.5">{value}</p>
          )}
          {hint && <p className="text-[var(--color-gray-text)] text-xs mt-1.5">{hint}</p>}
        </div>
        {Icon && (
          <div className={cn('rounded-lg p-2 shrink-0', accentClass)}>
            <Icon className="size-5" />
          </div>
        )}
      </div>
    </CardContent>
  );

  return (
    <Card className={cn('bg-[var(--color-card-background)] border-[#FFFFFF1A]', href && 'hover:bg-white/5 transition-colors cursor-pointer', className)}>
      {href ? <Link to={href} className="block">{content}</Link> : content}
    </Card>
  );
}
