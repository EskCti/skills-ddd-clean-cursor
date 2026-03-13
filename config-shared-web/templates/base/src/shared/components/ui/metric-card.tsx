import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/class-name.util';

type MetricCardProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  value: ReactNode;
  icon?: ReactNode;
  className?: string;
  overlayClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  valueClassName?: string;
  iconContainerClassName?: string;
};

export function MetricCard({
  title,
  subtitle,
  value,
  icon,
  className,
  overlayClassName,
  headerClassName,
  contentClassName,
  titleClassName,
  subtitleClassName,
  valueClassName,
  iconContainerClassName,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden border border-white/10 bg-linear-to-br from-zinc-900 via-zinc-900/95 to-zinc-800/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]',
        className,
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_120%_120%,rgba(245,158,11,0.12),transparent_52%)]',
          overlayClassName,
        )}
      />

      <CardHeader className={cn('relative space-y-2 pb-2', headerClassName)}>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className={cn('text-[15px] font-semibold text-zinc-100', titleClassName)}>{title}</CardTitle>

          {icon ? (
            <span
              className={cn('rounded-md border border-white/10 bg-white/5 p-1.5 text-zinc-400', iconContainerClassName)}
            >
              {icon}
            </span>
          ) : null}
        </div>

        {subtitle ? <p className={cn('text-xs text-zinc-400', subtitleClassName)}>{subtitle}</p> : null}
      </CardHeader>

      <CardContent className={cn('relative', contentClassName)}>
        <p className={cn('text-3xl md:text-4xl font-black tracking-tight text-zinc-100', valueClassName)}>{value}</p>
      </CardContent>
    </Card>
  );
}
