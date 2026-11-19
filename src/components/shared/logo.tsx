import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  compact?: boolean;
}

export function Logo({ className, compact }: LogoProps) {
  if (compact) {
    return (
      <span className={cn('font-semibold text-sm text-foreground', className)}>
        <span className="text-primary">Vintage Cars</span>
        <span className="text-foreground"> of Lagos</span>
      </span>
    );
  }
  return (
    <div className={cn('flex flex-col', className)}>
      <span className="font-semibold text-base leading-tight">
        <span className="text-primary">Vintage Cars</span>
        <span className="text-foreground"> of Lagos</span>
      </span>
      <span className="text-xs font-medium tracking-widest uppercase text-[var(--color-gray-text)] mt-0.5">
        Admin
      </span>
    </div>
  );
}
