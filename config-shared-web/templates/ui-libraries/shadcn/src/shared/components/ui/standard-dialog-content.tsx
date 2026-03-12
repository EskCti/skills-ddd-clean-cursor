import type { ReactNode } from 'react';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { cn } from '@/shared/lib/class-name.util';

type StandardDialogContentProps = {
  title: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
};

export function StandardDialogContent({
  title,
  description,
  footer,
  children,
  className,
  headerClassName,
  bodyClassName,
  footerClassName,
}: StandardDialogContentProps) {
  return (
    <DialogContent className={cn('overflow-hidden p-0', className)}>
      <DialogHeader className={cn('space-y-0.5 px-6 pt-6', headerClassName)}>
        <DialogTitle className="text-lg font-black tracking-tight">{title}</DialogTitle>
        {description ? (
          <DialogDescription className="text-sm leading-5 text-muted-foreground">{description}</DialogDescription>
        ) : null}
      </DialogHeader>

      {children ? <div className={cn('space-y-4 px-6 py-5', bodyClassName)}>{children}</div> : <div className="h-5" />}

      {footer ? (
        <DialogFooter className={cn('border-t bg-muted/25 px-6 py-4 sm:justify-end', footerClassName)}>
          {footer}
        </DialogFooter>
      ) : null}
    </DialogContent>
  );
}
