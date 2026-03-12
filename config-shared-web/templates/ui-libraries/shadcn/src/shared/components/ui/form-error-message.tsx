import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/class-name.util';

type FormErrorMessageProps = {
  children: ReactNode;
  size?: 'xs' | 'sm';
  className?: string;
};

export function FormErrorMessage({ children, size = 'xs', className }: FormErrorMessageProps) {
  return (
    <p
      role="alert"
      className={cn(size === 'xs' ? 'text-xs' : 'text-sm', 'font-medium text-red-600 dark:text-red-400', className)}
    >
      {children}
    </p>
  );
}
