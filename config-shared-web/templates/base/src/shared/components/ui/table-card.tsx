import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/class-name.util';

type TableCardTone = 'default' | 'critical';

type TableCardProps = {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAside?: React.ReactNode;
  footer?: React.ReactNode;
  tone?: TableCardTone;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  children: React.ReactNode;
};

const toneClasses: Record<TableCardTone, { card: string; title: string; footer: string }> = {
  default: {
    card: '',
    title: '',
    footer: 'border-border/80 bg-muted/25',
  },
  critical: {
    card: 'border-destructive/45',
    title: 'text-destructive',
    footer: 'border-destructive/35 bg-destructive/10',
  },
};

export function TableCard({
  title,
  subtitle,
  headerAside,
  footer,
  tone = 'default',
  className,
  headerClassName,
  contentClassName,
  footerClassName,
  children,
}: TableCardProps) {
  const hasHeaderContent = Boolean(title || subtitle || headerAside);

  return (
    <Card className={cn('overflow-hidden', toneClasses[tone].card, className)}>
      {hasHeaderContent ? (
        <CardHeader className={cn(title ? 'gap-4' : 'gap-2', !title && 'py-3 md:py-4', headerClassName)}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className={cn('space-y-1.5', !title && 'space-y-0')}>
              {title ? (
                <CardTitle className={cn('text-lg font-bold tracking-tight', toneClasses[tone].title)}>
                  {title}
                </CardTitle>
              ) : null}
              {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
            </div>
            {headerAside ? <div className="text-xs text-muted-foreground">{headerAside}</div> : null}
          </div>
        </CardHeader>
      ) : (
        <div className="h-3" />
      )}

      <CardContent className={cn('p-0', contentClassName)}>{children}</CardContent>

      {footer ? (
        <div className={cn('border-t px-5 py-4 md:px-6', toneClasses[tone].footer, footerClassName)}>{footer}</div>
      ) : null}
    </Card>
  );
}

export { TableCard as MiniTableCard };
