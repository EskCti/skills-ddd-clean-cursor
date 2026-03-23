import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/class-name.util';

type MiniFormCardTone = 'default' | 'critical';

type MiniFormCardProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  tone?: MiniFormCardTone;
  className?: string;
  contentClassName?: string;
  actionsClassName?: string;
  children: React.ReactNode;
};

const toneClasses: Record<MiniFormCardTone, { card: string; title: string; actions: string }> = {
  default: {
    card: '',
    title: '',
    actions: 'border-border/80 bg-muted/25',
  },
  critical: {
    card: 'border-destructive/45',
    title: 'text-destructive',
    actions: 'border-destructive/35 bg-destructive/10',
  },
};

export function MiniFormCard({
  title,
  description,
  actions,
  tone = 'default',
  className,
  contentClassName,
  actionsClassName,
  children,
}: MiniFormCardProps) {
  return (
    <Card className={cn('overflow-hidden', toneClasses[tone].card, className)}>
      <CardHeader>
        <CardTitle className={cn('text-lg font-bold tracking-tight', toneClasses[tone].title)}>{title}</CardTitle>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </CardHeader>

      <CardContent className={cn('space-y-4', contentClassName)}>{children}</CardContent>

      {actions ? (
        <div
          className={cn(
            'flex flex-wrap items-center justify-end gap-2 border-t px-5 py-4 md:px-6',
            toneClasses[tone].actions,
            actionsClassName,
          )}
        >
          {actions}
        </div>
      ) : null}
    </Card>
  );
}
