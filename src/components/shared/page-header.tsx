import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3', className)}>
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">{title}</h1>
        {subtitle && <p className="text-[var(--color-gray-text)] text-sm mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
    </div>
  );
}
